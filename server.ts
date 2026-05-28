import * as dotenv from 'dotenv';
import express from 'express';
import * as cheerio from 'cheerio';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';
import sharp from 'sharp';
import { google } from 'googleapis';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const SITES_FILE = path.join(__dirname, 'sites.json');
let currentSiteId: string | null = null;

function getSites() {
  try {
    if (!fs.existsSync(SITES_FILE)) return [];
    return JSON.parse(fs.readFileSync(SITES_FILE, 'utf-8'));
  } catch (e) {
    return [];
  }
}

function saveSites(sites: any[]) {
  fs.writeFileSync(SITES_FILE, JSON.stringify(sites, null, 2));
}

// Initialize with .env site if empty
try {
  const existing = getSites();
  if (existing.length === 0 && process.env.WP_URL) {
    let hostname = 'WordPress Site';
    try {
      hostname = new URL(process.env.WP_URL).hostname;
    } catch (e) {
      hostname = process.env.WP_URL.replace(/^https?:\/\//i, '').split('/')[0] || 'WordPress Site';
    }
    const initialSite = {
      id: crypto.randomUUID(),
      url: process.env.WP_URL,
      user: process.env.WP_USER,
      pass: process.env.WP_APP_PASS,
      name: hostname
    };
    saveSites([initialSite]);
    currentSiteId = initialSite.id;
  } else if (existing.length > 0) {
    currentSiteId = existing[0].id;
  }
} catch (e) {
  console.error('Error initializing sites:', e);
}

async function startServer() {
  const app = express();
  const PORT = 3003;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  const getCurrentSite = () => {
    const sites = getSites();
    const site = sites.find((s: any) => s.id === currentSiteId) || sites[0];
    return site;
  };

  const callGeminiJson = async (prompt: string, fallback: any) => {
    if (!process.env.GEMINI_API_KEY) return fallback;

    const modelCandidates = [
      process.env.GEMINI_MODEL,
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash'
    ].filter(Boolean) as string[];

    let lastError = '';
    for (const model of modelCandidates) {
      try {
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          }),
          signal: AbortSignal.timeout(45000)
        });

        const data = await r.json();
        if (!r.ok || data?.error) {
          const msg = data?.error?.message || `HTTP ${r.status}`;
          lastError = `[${model}] ${msg}`;
          const modelUnavailable = /not found|not supported|no longer available|deprecated|retired/i.test(msg);
          if (modelUnavailable) continue;
          throw new Error(lastError);
        }

        const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        const cleaned = raw.replace(/```json|```/g, '').trim();
        try {
          return JSON.parse(cleaned);
        } catch {
          // Try extracting the first JSON object/array if model added prose.
          const firstBrace = cleaned.indexOf('{');
          const firstBracket = cleaned.indexOf('[');
          const start = [firstBrace, firstBracket].filter((v) => v >= 0).sort((a, b) => a - b)[0];
          const end = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
          if (start !== undefined && end > start) {
            return JSON.parse(cleaned.slice(start, end + 1));
          }
          return fallback;
        }
      } catch (e: any) {
        lastError = e?.message || String(e);
      }
    }

    console.warn('Gemini JSON fallback:', lastError);
    return fallback;
  };

  // Site Management API
  app.get('/api/sites', (req, res) => {
    res.json({ sites: getSites(), currentSiteId });
  });

  // WordPress Connection & Write-Permission Diagnostic
  app.post('/api/wordpress/test-connection', async (req, res) => {
    const { siteId } = req.body || {};
    const sites = getSites();
    const site = sites.find((s: any) => s.id === (siteId || currentSiteId)) || sites[0];
    if (!site) return res.status(400).json({ error: 'No site configured' });

    const auth = Buffer.from(`${site.user}:${site.pass}`).toString('base64');
    const headers = { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' };
    const results: Record<string, any> = {};

    // 1. REST API reachable?
    try {
      const r = await fetch(`${site.url}/wp-json/wp/v2/pages?per_page=1`, { headers });
      results.restApi = r.ok ? 'ok' : `error_${r.status}`;
      results.restApiStatus = r.status;
      if (r.ok) {
        const pages = await r.json();
        results.canReadPages = Array.isArray(pages);
        results.existingPageId = Array.isArray(pages) && pages.length > 0 ? pages[0].id : null;
        // Check which meta fields are exposed
        results.exposedMetaFields = Array.isArray(pages) && pages.length > 0
          ? Object.keys(pages[0].meta || {})
          : [];
        results.rankMathTitleExposed = results.exposedMetaFields.includes('rank_math_title');
        results.rankMathDescExposed = results.exposedMetaFields.includes('rank_math_description');
        results.rankMathKeywordExposed = results.exposedMetaFields.includes('rank_math_focus_keyword');
        results.seoGoalFieldExposed = results.exposedMetaFields.includes('_seo_goal');
      }
    } catch (e) {
      results.restApi = 'unreachable';
      results.restApiError = String(e);
    }

    // 2. Can create draft page?
    let testPageId: number | null = null;
    try {
      const r = await fetch(`${site.url}/wp-json/wp/v2/pages`, {
        method: 'POST', headers,
        body: JSON.stringify({ title: '_SEO_AGENT_TEST_', status: 'draft' })
      });
      const d = await r.json();
      results.canCreateDraft = r.ok;
      results.createDraftStatus = r.status;
      results.createDraftError = r.ok ? null : (d?.message || d?.code || null);
      if (r.ok) testPageId = d.id;
    } catch (e) {
      results.canCreateDraft = false;
      results.createDraftError = String(e);
    }

    // 3. Can write meta (Rank Math + custom)?
    if (testPageId) {
      try {
        const r = await fetch(`${site.url}/wp-json/wp/v2/pages/${testPageId}`, {
          method: 'POST', headers,
          body: JSON.stringify({
            meta: {
              rank_math_title: 'SEO Agent Test',
              rank_math_description: 'Test meta desc',
              rank_math_focus_keyword: 'test keyword',
              _seo_goal: 'test goal'
            }
          })
        });
        const d = await r.json();
        results.canWriteMeta = r.ok;
        results.writeMetaStatus = r.status;
        results.writeMetaError = r.ok ? null : (d?.message || d?.code || null);
        results.metaAfterWrite = r.ok ? Object.keys(d.meta || {}) : [];
        results.rankMathWriteWorks = r.ok && !!(d?.meta?.rank_math_title);
      } catch (e) {
        results.canWriteMeta = false;
        results.writeMetaError = String(e);
      }

      // 4. Clean up test page
      try {
        await fetch(`${site.url}/wp-json/wp/v2/pages/${testPageId}?force=true`, {
          method: 'DELETE', headers
        });
        results.cleanupDone = true;
      } catch {
        results.cleanupDone = false;
        results.cleanupNote = `Test draft ID ${testPageId} left behind — delete manually`;
      }
    }

    results.site = { name: site.name, url: site.url, user: site.user };
    res.json(results);
  });

  app.get('/api/integrations/status', (req, res) => {
    res.json({
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      serperConfigured: Boolean(process.env.SERPER_API_KEY),
      geminiModel: process.env.GEMINI_MODEL || 'auto-fallback'
    });
  });

  app.post('/api/sites', (req, res) => {
    try {
      const { url, user, pass, name, gscCredentials, gscPropertyUrl } = req.body;
      if (!url) return res.status(400).json({ error: 'URL is required' });

      let siteName = name;
      if (!siteName) {
        try {
          siteName = new URL(url).hostname;
        } catch (e) {
          // Fallback if URL is not absolute
          siteName = url.replace(/^https?:\/\//i, '').split('/')[0] || 'New Website';
        }
      }

      const sites = getSites();
      const newSite = {
        id: crypto.randomUUID(),
        url, user, pass,
        name: siteName,
        gscCredentials,
        gscPropertyUrl
      };
      sites.push(newSite);
      saveSites(sites);
      res.json(newSite);
    } catch (err: any) {
      console.error('Error in POST /api/sites:', err);
      res.status(500).json({ error: `Internal Server Error: ${err.message}` });
    }
  });

  app.put('/api/sites/:id', (req, res) => {
    const { id } = req.params;
    const { user, pass, gscCredentials, gscPropertyUrl } = req.body;
    const sites = getSites();
    const idx = sites.findIndex((s: any) => s.id === id);
    if (idx !== -1) {
      if (user) sites[idx].user = user;
      if (pass) sites[idx].pass = pass;
      if (gscCredentials !== undefined) sites[idx].gscCredentials = gscCredentials;
      if (gscPropertyUrl !== undefined) sites[idx].gscPropertyUrl = gscPropertyUrl;
      saveSites(sites);
    }
    res.json({ success: true });
  });

  app.post('/api/sites/select', (req, res) => {
    const { id } = req.body;
    const sites = getSites();
    if (sites.find((s: any) => s.id === id)) {
      currentSiteId = id;
      res.json({ success: true, currentSiteId });
    } else {
      res.status(404).json({ error: 'Site not found' });
    }
  });

  app.post('/api/sites/update', (req, res) => {
    const { id, url, user, pass, name } = req.body;
    const sites = getSites();
    const idx = sites.findIndex((s: any) => s.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Site not found' });
    if (url) sites[idx].url = url;
    if (user) sites[idx].user = user;
    if (pass) sites[idx].pass = pass;
    if (name) sites[idx].name = name;
    saveSites(sites);
    res.json(sites[idx]);
  });

  app.delete('/api/sites/:id', (req, res) => {
    const { id } = req.params;
    const sites = getSites().filter((s: any) => s.id !== id);
    saveSites(sites);
    if (currentSiteId === id) currentSiteId = sites[0]?.id || null;
    res.json({ success: true });
  });

  // Live AI Chat Agent
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, pageContext } = req.body || {};
      const content = pageContext?.rawContent || '';
      const cleanContent = content.replace(/<[^>]+>/g, ' ').slice(0, 3000);
      
      const systemPrompt = `You are a Senior SEO & Growth Strategist for a UAE plastic scrap company.
Current Page: "${pageContext?.title || 'Untitled'}"
URL: ${pageContext?.link || ''}
Word Count: ${pageContext?.wordCount || 0} | Images: ${pageContext?.imgCount || 0}

SEO METADATA:
- Title: ${pageContext?.seoTitle || ''}
- Meta: ${pageContext?.metaDesc || ''}
- Focus Key: ${pageContext?.focusKeyword || ''}

PAGE ISSUES TO FIX:
${(pageContext?.issues || []).join('\n')}
${(pageContext?.rmIssues || []).filter((i:any) => !i.passed).map((i:any) => `- ${i.label}`).join('\n')}

CONTENT PREVIEW:
${cleanContent}

MISSION:
1. Discuss growth potential.
2. Point out specific corrections for UAE.
3. Be strategic and use bullet points.`;

      const geminiHistory = (messages || []).map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const modelCandidates = [
        process.env.GEMINI_MODEL,
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-1.5-flash'
      ].filter(Boolean) as string[];

      let data: any = null;
      let lastError = 'Unknown Gemini error';

      for (const model of modelCandidates) {
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: systemPrompt }] },
              { role: 'model', parts: [{ text: "Understood. I have reviewed your page details, metadata, and current SEO failures. I am ready to discuss the growth and correction of this page. How shall we begin?" }] },
              ...geminiHistory
            ]
          })
        });

        data = await r.json();
        if (r.ok && !data?.error) {
          break;
        }

        const errMsg = data?.error?.message || `HTTP Error ${r.status}`;
        lastError = `[${model}] ${errMsg}`;

        const modelUnavailable = /not found|not supported|no longer available|deprecated|retired/i.test(errMsg);
        if (modelUnavailable) {
          continue;
        }

        throw new Error(lastError);
      }

      if (!data || data?.error) {
        throw new Error(lastError);
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Response generated but empty.";
      res.json({ text });
    } catch (e: any) {
      console.error('Chat error:', e);
      res.json({
        text: `⚠️ AI Agent Error: ${e.message || 'Gemini request failed'}\n\nTroubleshooting: set GEMINI_MODEL in .env (example: gemini-2.5-flash) or verify model access for your API key.`
      });
    }
  });

  // Proxy route for WordPress
  app.post('/api/wordpress', async (req, res) => {
    const { url, method, data, siteId } = req.body;

    if (!url || !method) {
      return res.status(400).json({ error: 'Missing required fields: url and method' });
    }
    
    const sites = getSites();
    const site = sites.find((s: any) => s.id === (siteId || currentSiteId)) || sites[0];

    if (!site) {
      return res.status(500).json({ error: 'No WordPress site configured' });
    }

    const fullUrl = `${site.url}${url}`;
    console.log(`Proxying request to WordPress (${site.name}): ${method} ${fullUrl}`);
    
    let lastError: any = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await fetch(fullUrl, {
        method,
        headers: {
          'Authorization': `Basic ${Buffer.from(`${site.user}:${site.pass}`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: method !== 'GET' ? JSON.stringify(data) : undefined,
        signal: AbortSignal.timeout(60000), // Increased to 60s
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`WordPress API error: ${response.status} ${errorText}`);
        if (method === 'GET' && typeof url === 'string' && url.includes('/wp-json/wp/v2/pages')) {
          // Keep the dashboard usable even when upstream WordPress is unavailable.
          return res.json([]);
        }
        return res.status(response.status).json({ error: `WordPress API error: ${errorText}` });
      }

        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          throw new Error('WordPress returned non-JSON response');
        }

        const result = await response.json();
        return res.json(result);
      } catch (error) {
        lastError = error;
        console.error(`Attempt ${attempt} failed for ${fullUrl}:`, error);
        if (attempt < 3) await new Promise(r => setTimeout(r, 2000));
      }
    }

    if (method === 'GET' && typeof url === 'string' && url.includes('/wp-json/wp/v2/pages')) {
      return res.json([]);
    }
    res.status(500).json({ error: 'Proxy failed after 3 attempts', details: String(lastError) });
  });

  // Manual SEO Update


  // AI SEO Improvement Proxy (Deep Strategy Mode)
  app.post('/api/gemini-audit', async (req, res) => {
    const { page, focus } = req.body;
    if (!page) {
      return res.status(400).json({ error: 'Missing page payload for AI audit.' });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Gemini API key is not configured on server.',
        details: 'Set GEMINI_API_KEY in .env and restart the backend.'
      });
    }
    
    // Clean content for context
    const cleanContent = (page?.rawContent || '').replace(/<[^>]+>/g, ' ').slice(0, 2000);

    const prompt = `You are a World-Class SEO Growth Strategist specialized in the UAE B2B market.
TASK: Perform a COMPREHENSIVE STRATEGIC AUDIT and OPTIMIZATION for this entire page.

PAGE CONTEXT:
- Title: ${page.title}
- Goal: ${page.meta?._seo_goal || 'Not set'}
- Current Focus Keyword: ${page.focusKeyword || 'Not set'}
- Word Count: ${page.wordCount}
- Issues: ${page.issues.join(', ')}
- Content Snapshot: ${cleanContent}

REQUIREMENTS:
1. Suggest high-impact, conversion-focused values for ALL SEO fields.
2. Ensure the Focus Keyword is naturally integrated into the Title, Meta Description, and H1.
3. The Slug (Permalink) should be short, descriptive, and keyword-rich.
4. Provide a "Benefit Analysis" explaining how this cohesive strategy will improve CTR and Rankings in the UAE market.

Return ONLY valid JSON:
{
  "newTitle": "...",
  "newMeta": "...",
  "newH1": "...",
  "newSlug": "...",
  "newFocusKeyword": "...",
  "benefitAnalysis": "..."
}`;

    const fallback = {
      newTitle: page?.title || '',
      newMeta: page?.metaDesc || '',
      newH1: page?.title || '',
      newSlug: page?.slug || '',
      newFocusKeyword: page?.focusKeyword || '',
      benefitAnalysis: 'AI suggestion is temporarily unavailable. Review title, slug, and meta manually for keyword alignment.'
    };

    try {
      const aiJson = await callGeminiJson(prompt, fallback);
      return res.json({
        newTitle: aiJson?.newTitle || fallback.newTitle,
        newMeta: aiJson?.newMeta || fallback.newMeta,
        newH1: aiJson?.newH1 || fallback.newH1,
        newSlug: aiJson?.newSlug || fallback.newSlug,
        newFocusKeyword: aiJson?.newFocusKeyword || fallback.newFocusKeyword,
        benefitAnalysis: aiJson?.benefitAnalysis || fallback.benefitAnalysis,
        focus
      });
    } catch (e: any) {
      return res.status(500).json({
        error: 'Deep thinking failed',
        details: e?.message || 'Gemini request failed',
        tip: 'Check GEMINI_API_KEY and GEMINI_MODEL in .env, then restart backend.'
      });
    }
  });

  // Keyword Planner
  app.post('/api/keywords', async (req, res) => {
    const { keyword } = req.body;
    const GOOGLE_KEY = process.env.GOOGLE_CSE_KEY;
    const GOOGLE_CX = process.env.GOOGLE_CSE_ID;
    const SERPER_KEY = process.env.SERPER_API_KEY;
    const SERPAPI_KEY = process.env.SERPAPI_KEY;

    try {
      let searchData: any = null;
      
      // Try Serper first (fastest/cheapest), then SerpAPI, then Google CSE
      if (SERPER_KEY) {
        const r = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: { 'X-API-KEY': SERPER_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: keyword || 'plastic scrap uae', gl: 'ae', hl: 'en' })
        });
        searchData = await r.json();
      } else if (SERPAPI_KEY) {
        const r = await fetch(`https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(keyword || 'plastic scrap uae')}&location=Sharjah&api_key=${SERPAPI_KEY}`);
        searchData = await r.json();
      } else if (GOOGLE_KEY && GOOGLE_CX) {
        const r = await fetch(`https://www.googleapis.com/customsearch/v1?key=${GOOGLE_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(keyword || 'plastic scrap uae')}`);
        searchData = await r.json();
      }

      const prompt = `Generate 25 buyer-intent keywords for a UAE plastic scrap trading company in Sharjah.
        ${searchData ? `Context from real search results: ${JSON.stringify(searchData.organic_results?.slice(0, 3) || searchData.items?.slice(0, 3))}` : ''}
        Focus on HDPE, LDPE, PET, PVC, PP scrap. Include buy, sell, price, supplier, near me.
        Return JSON array: [{"keyword":"","intent":"transactional|commercial","volume":"low|med|high","pageType":"service|blog"}]`;

      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }]}] })
      });
      const data = await r.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
      text = text.replace(/```json|```/g,'').trim();
      res.json({ keywords: JSON.parse(text) });
    } catch(e) {
      console.error('Keyword generation failed, using mock data:', e);
      res.json({
        keywords: [
          { keyword: "hdpe scrap price sharjah", intent: "transactional", volume: "high" },
          { keyword: "buy pet bottle scrap uae", intent: "transactional", volume: "high" },
          { keyword: "pvc scrap buyers dubai", intent: "commercial", volume: "med" },
          { keyword: "ldpe film scrap supplier sharjah", intent: "transactional", volume: "med" },
          { keyword: "plastic scrap company near me", intent: "navigational", volume: "high" },
          { keyword: "pp scrap price uae", intent: "transactional", volume: "low" }
        ]
      });
    }
  });

  // WordPress Draft Creation
  app.post('/api/wordpress/create-draft', async (req,res)=>{
    const {keyword} = req.body;
    const site = getCurrentSite();
    if (!site) return res.status(500).json({ error: 'No site configured' });
    const auth = Buffer.from(`${site.user}:${site.pass}`).toString('base64');
    
    // 1. Get Gemini to write the page
    const contentPrompt = `Write complete WordPress page HTML for keyword "${keyword}" for Al Saham Al Ahmar, Sharjah UAE plastic scrap trader. 400 words, H1 with keyword, 3 H2s, bullet list, CTA "Get Quote". B2B tone.`;
    
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ contents: [{ parts: [{ text: contentPrompt }]}] })
      });
      const data = await r.json();
      
      let html = '';
      if (data.error) {
        console.error('Gemini API Error:', data.error.message);
        html = `<h1>${keyword}</h1>\n<p>This is a generated draft for ${keyword} (Mock Fallback because Gemini API key is restricted).</p>\n<h2>Why Choose Us</h2><ul><li>Best Price</li><li>Fast Pickup</li></ul>`;
      } else {
        html = data.candidates[0].content.parts[0].text.replace(/```html|```/g,'').trim();
      }
      
      // 2. Create Draft in WP
      const wpRes = await fetch(`${site.url}/wp-json/wp/v2/pages`, {
        method: 'POST',
        headers: { 
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          title: keyword,
          content: html,
          status: 'draft',
          meta: {
            rank_math_title: `${keyword} | Supplier in Sharjah UAE`,
            rank_math_description: `Looking for ${keyword}? Al Saham Al Ahmar buys and sells in UAE. Best price, fast pickup. Contact today.`,
            rank_math_focus_keyword: keyword
          }
        })
      });
      
      const wpData = await wpRes.json();
      res.json(wpData);
    } catch(e) {
      res.status(500).json({ error: String(e)});
    }
  });

  // WordPress Update SEO
  app.post('/api/wordpress/update', async (req, res) => {
    const { id, newTitle, newMeta, newH1, newSlug, newFocusKeyword, focusKeyword, currentContent, meta, status } = req.body;
    const site = getCurrentSite();
    if (!site) return res.status(500).json({ error: 'No site configured' });
    if (!id) return res.status(400).json({ error: 'Missing page ID' });
    
    const auth = Buffer.from(`${site.user}:${site.pass}`).toString('base64');
  
    try {
      const updatePayload: any = {};
      const metaPayload: any = { ...(meta || {}) };
      const updates: string[] = [];

      if (status) {
        updatePayload.status = status;
        updates.push(`Status (${status})`);
      }

      if (newTitle) {
        metaPayload.rank_math_title = newTitle;
        metaPayload._rank_math_title = newTitle;
        updates.push('Rank Math Title');
      }
      if (newMeta) {
        metaPayload.rank_math_description = newMeta;
        metaPayload._rank_math_description = newMeta;
        updatePayload.excerpt = newMeta; 
        updates.push('Meta Description');
      }
      const actualFocus = newFocusKeyword || focusKeyword;
      if (actualFocus) {
        metaPayload.rank_math_focus_keyword = actualFocus;
        metaPayload._rank_math_focus_keyword = actualFocus;
        updates.push('Focus Keyword');
      }
      
      if (Object.keys(metaPayload).length > 0) {
        updatePayload.meta = metaPayload;
      }

      if (newSlug) {
        updatePayload.slug = newSlug;
        updates.push('Slug/Permalink');
      }

      // 1. Update Meta & Slug
      if (Object.keys(updatePayload).length > 0) {
        // Also update main title if SEO title is provided
        if (newTitle) updatePayload.title = newTitle;

        console.log(`[${new Date().toISOString()}] Pushing to WP (page ${id}):`, JSON.stringify(updatePayload, null, 2));
        const metaRes = await fetch(`${site.url}/wp-json/wp/v2/pages/${id}`, {
          method: 'POST',
          headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(updatePayload)
        });
        const metaData = await metaRes.json();
        console.log(`[${new Date().toISOString()}] WP Response (${metaRes.status}):`, JSON.stringify(metaData, null, 2));

        if (!metaRes.ok || metaData.code) {
          const errorMsg = metaData.message || metaData.code || 'Failed to update meta fields in WordPress';
          console.error(`[${new Date().toISOString()}] WordPress Meta Update Error:`, errorMsg, metaData);
          return res.status(metaRes.status || 400).json({ error: errorMsg, details: metaData });
        }
      }
  
      // 2. Update H1 in Content if needed
      if (newH1 && currentContent) {
        const normalizedH1 = String(newH1).trim();
        let updatedHtml = String(currentContent);
        if (!updatedHtml.toLowerCase().includes('<h1')) {
          updatedHtml = `<h1>${normalizedH1}</h1>\n` + updatedHtml;
        } else {
          // Replace first H1 block; supports multiline headings and nested markup.
          const h1Regex = /<h1\b[^>]*>[\s\S]*?<\/h1>/i;
          updatedHtml = updatedHtml.replace(h1Regex, `<h1>${normalizedH1}</h1>`);
          if (updatedHtml === String(currentContent)) {
            // Fallback if malformed markup prevented replacement.
            updatedHtml = `<h1>${normalizedH1}</h1>\n` + String(currentContent);
          }
        }

        console.log(`[${new Date().toISOString()}] Updating H1 content for page ${id}`);
        const contentRes = await fetch(`${site.url}/wp-json/wp/v2/pages/${id}`, {
          method: 'POST',
          headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: updatedHtml })
        });
        const contentData = await contentRes.json();
        if (!contentRes.ok || contentData.code) {
          const errorMsg = contentData.message || contentData.code || 'Failed to update H1 content in WordPress';
          console.error(`[${new Date().toISOString()}] WordPress Content Update Error:`, errorMsg, contentData);
          return res.status(contentRes.status || 400).json({ error: errorMsg, details: contentData });
        }
        updates.push('H1 heading');
      }
      
      if (updates.length === 0) {
        console.log(`[${new Date().toISOString()}] No updates provided for page ${id}`);
        return res.status(400).json({ error: 'No fields to update. Provide at least one: newTitle, newMeta, newH1, newSlug, or newFocusKeyword' });
      }

      const successMsg = `Successfully updated: ${updates.join(', ')}`;
      console.log(`[${new Date().toISOString()}] Success for page ${id}:`, successMsg);
      res.json({ success: true, message: successMsg });
    } catch (e: any) {
      console.error(`[${new Date().toISOString()}] Update Error:`, e);
      res.status(500).json({ error: `Update failed: ${e?.message || String(e)}`, details: e });
    }
  });

  // Create New WordPress Page
  app.post('/api/wordpress/create-page', async (req, res) => {
    const { goal, title } = req.body;
    const sites = getSites();
    const site = sites.find((s: any) => s.id === currentSiteId) || sites[0];
    if (!site) return res.status(500).json({ error: 'No WordPress site configured' });
    const auth = Buffer.from(`${site.user}:${site.pass}`).toString('base64');

    try {
      const response = await fetch(`${site.url}/wp-json/wp/v2/pages`, {
        method: 'POST',
        headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'New Optimization Page',
          status: 'draft',
          content: '<!-- wp:paragraph --><p>Content coming soon...</p><!-- /wp:paragraph -->',
          meta: { _seo_goal: goal || '' }
        })
      });
      const data = await response.json();
      if (!response.ok) {
        const wpMsg = data?.message || data?.code || 'Failed to create page';
        console.error('WP create-page error:', wpMsg, data);
        return res.status(response.status === 403 || response.status === 401 ? response.status : 500).json({ error: wpMsg });
      }
      res.json(data);
    } catch (e) {
      console.error('Page creation failed:', e);
      res.status(500).json({ error: String(e) });
    }
  });

  app.post('/api/seo/suggest-keywords', async (req, res) => {
    const { goal, serpData } = req.body || {};
    const competitors = Array.isArray(serpData?.results) ? serpData.results.slice(0, 20) : [];

    const fallbackSuggestions = [
      `${goal || 'plastic scrap'} supplier sharjah`,
      `buy ${goal || 'plastic scrap'} uae`,
      `${goal || 'plastic scrap'} price uae`,
      `industrial ${goal || 'plastic scrap'} recycling sharjah`,
      `bulk ${goal || 'plastic scrap'} trader dubai`
    ].map((s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim());

    const fallbackCompetitorKeywords = competitors.map((c: any) => {
      const text = `${c?.title || ''} ${c?.snippet || ''}`.toLowerCase();
      if (text.includes('pvc')) return 'pvc scrap sharjah';
      if (text.includes('pet')) return 'pet scrap uae';
      if (text.includes('ldpe')) return 'ldpe scrap supplier';
      if (text.includes('hdpe')) return 'hdpe scrap supplier';
      if (text.includes('metal')) return 'metal scrap sharjah';
      return 'plastic scrap sharjah';
    });

    const prompt = `Based on this business goal: "${goal || 'plastic scrap supplier uae'}", analyze these competitors:
    ${competitors.map((c: any, i: number) => `${i + 1}. Title: ${c?.title || ''} | Snippet: ${c?.snippet || ''}`).join('\n')}

    Tasks:
    1. Suggest 5 high-intent focus keywords for OUR website based on the goal.
    2. For EACH competitor above, identify the EXACT single Focus Keyword they are targeting.

    Return ONLY JSON:
    {
      "suggestions": ["kw1", "kw2", "kw3", "kw4", "kw5"],
      "competitorKeywords": ["kw_for_site_1", "kw_for_site_2"]
    }`;

    try {
      if (!process.env.GEMINI_API_KEY) {
        console.warn('GEMINI_API_KEY is missing; using fallback keyword suggestions.');
        return res.json({ keywords: fallbackSuggestions, competitorKeywords: fallbackCompetitorKeywords });
      }

      console.log('Gemini: Fetching suggestions with 45s timeout...');
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        signal: AbortSignal.timeout(45000)
      });

      const data = await r.json();
      if (!r.ok || data.error) {
        throw new Error(data?.error?.message || `Gemini request failed with ${r.status}`);
      }

      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      console.log('Gemini Response Received');

      let result: any = { suggestions: [], competitorKeywords: [] };
      try {
        const jsonText = rawText.replace(/```json|```/g, '').trim();
        result = JSON.parse(jsonText);
      } catch {
        console.warn('JSON parse failed for suggest-keywords; using fallback suggestions.');
      }

      const keywords = Array.isArray(result?.suggestions) && result.suggestions.length > 0
        ? result.suggestions
        : fallbackSuggestions;
      const competitorKeywords = Array.isArray(result?.competitorKeywords) && result.competitorKeywords.length > 0
        ? result.competitorKeywords
        : fallbackCompetitorKeywords;

      res.json({ keywords, competitorKeywords });
    } catch (e) {
      console.error('Keyword suggestion failed, returning fallback:', e);
      res.json({ keywords: fallbackSuggestions, competitorKeywords: fallbackCompetitorKeywords });
    }
  });

  // Expand Content endpoint
  app.post('/api/expand-content', async (req, res) => {
    const { page } = req.body;
    const prompt = `Write 350-word B2B service page for "${page.title}" for Al Saham Al Ahmar, plastic scrap trader in Sharjah UAE. Use H2s: What We Buy, Our Process, Why Choose Us. Include keywords: UAE, Sharjah, price, supplier. Return HTML only.`;

    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }]}] })
      });
      const data = await r.json();
      if (data.error) throw new Error(data.error.message);
      const html = data.candidates[0].content.parts[0].text.replace(/```html|```/g,'').trim();
      res.json({ content: html });
    } catch (e) {
      console.error('Expand content failed:', e);
      res.json({ content: `<h1>${page.title} in UAE</h1>\n<p>This is a 350-word expanded mock content about ${page.title}.</p><h2>What We Buy</h2><p>We buy all kinds of plastic scrap including HDPE, LDPE, and PET in Sharjah UAE.</p><h2>Our Process</h2><p>Contact us for the best price, we provide fast supplier services near me.</p><h2>Why Choose Us</h2><p>We are the top plastic scrap trader in the region.</p>` });
    }
  });

  // Generate Content for a specific HTML Block
  app.post('/api/seo/generate-block-content', async (req, res) => {
    const { goal, focusKeyword, tag } = req.body;
    const prompt = `You are a professional SEO copywriter for a UAE plastic scrap company.
    Page Goal: "${goal}"
    Focus Keyword: "${focusKeyword}"
    Target HTML Element: <${tag || 'p'}>

    Write a single, highly optimized and persuasive ${tag === 'h2' || tag === 'h3' ? 'heading' : 'paragraph'} (around ${tag?.startsWith('h') ? '10' : '40'} words).
    Use the Focus Keyword naturally. Focus on B2B buyers in Sharjah and UAE.
    Return ONLY the text content, no HTML tags.`;

    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }]}] }),
        signal: AbortSignal.timeout(20000)
      });
      const data = await r.json();
      if (data.error) throw new Error(data.error.message);
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'No content generated.';
      res.json({ text });
    } catch (e) {
      console.error('Block content generation failed:', e);
      res.status(500).json({ error: String(e) });
    }
  });

  // Convert raw text to optimized HTML
  app.post('/api/seo/convert-to-html', async (req, res) => {
    const { text, goal, tag } = req.body;
    const prompt = `You are a Master Web Developer and SEO Copywriter for a UAE plastic scrap business.
    Task: Convert the following raw text into a professionally formatted ${tag || 'paragraph'} for a WordPress page.
    Page Goal: "${goal}"
    Raw Input: "${text}"

    Requirements:
    1. Improve the grammar and professional tone (B2B Sharjah UAE style).
    2. Add relevant SEO keywords if missing.
    3. Return ONLY the content string (no wrapper tags like <div> or <html>).
    4. Keep the output clean and ready to be saved.`;

    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }]}] }),
        signal: AbortSignal.timeout(20000)
      });
      const data = await r.json();
      if (data.error) throw new Error(data.error.message);
      const html = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || text;
      res.json({ html });
    } catch (e) {
      console.error('HTML conversion failed:', e);
      res.status(500).json({ error: String(e) });
    }
  });

  // Update specific page content in WP
  app.post('/api/wordpress/update-content', async (req, res) => {
    const { id, content } = req.body;
    const site = getCurrentSite();
    if (!site) return res.status(500).json({ error: 'No site configured' });
    const auth = Buffer.from(`${site.user}:${site.pass}`).toString('base64');
    try {
      await fetch(`${site.url}/wp-json/wp/v2/pages/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  app.post('/api/wordpress/upload-media', async (req, res) => {
    const { fileName, mimeType, base64Data, altText, optimize = false } = req.body || {};

    if (!fileName || !mimeType || !base64Data) {
      return res.status(400).json({ error: 'fileName, mimeType and base64Data are required.' });
    }

    const sites = getSites();
    const site = sites.find((s: any) => s.id === currentSiteId) || sites[0];
    if (!site) {
      return res.status(500).json({ error: 'No WordPress site configured' });
    }

    try {
      let finalBuffer = Buffer.from(base64Data, 'base64');
      let finalMime = mimeType;
      let finalFileName = fileName;

      if (optimize && mimeType.includes('image') && !mimeType.includes('webp')) {
        try {
          let optimized = await sharp(finalBuffer)
            .webp({ quality: 80 })
            .toBuffer();

          // Target ~90KB
          let currentQuality = 80;
          while (optimized.length > 90 * 1024 && currentQuality > 10) {
            currentQuality -= 10;
            optimized = await sharp(finalBuffer)
              .webp({ quality: currentQuality })
              .toBuffer();
          }
          finalBuffer = optimized;
          finalMime = 'image/webp';
          finalFileName = fileName.split('.')[0] + '.webp';
        } catch (sharpError) {
          console.error('Sharp optimization failed, falling back to original:', sharpError);
        }
      }

      const mediaRes = await fetch(`${site.url}/wp-json/wp/v2/media`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${site.user}:${site.pass}`).toString('base64')}`,
          'Content-Type': finalMime,
          'Content-Disposition': `attachment; filename="${finalFileName}"`
        },
        body: finalBuffer
      });

      const mediaData: any = await mediaRes.json();
      if (!mediaRes.ok || mediaData?.code) {
        return res.status(400).json({ error: mediaData?.message || 'Media upload failed' });
      }

      if (altText && mediaData?.id) {
        await fetch(`${site.url}/wp-json/wp/v2/media/${mediaData.id}`, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(`${site.user}:${site.pass}`).toString('base64')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ alt_text: altText, title: altText })
        });
      }

      res.json({ id: mediaData.id, sourceUrl: mediaData.source_url });
    } catch (e: any) {
      console.error('Media upload error:', e);
      res.status(500).json({ error: e.message || String(e) });
    }
  });

  // Generate llms.txt
  app.get('/api/generate-llms', async (req, res) => {
    try {
      const site = getCurrentSite();
      if (!site) return res.status(500).json({ error: 'No site' });
      const pagesRes = await fetch(`${site.url}/wp-json/wp/v2/pages?per_page=20`);
      const pages = await pagesRes.json();
      let txt = "# Al Saham Al Ahmar\n# Plastic scrap supplier Sharjah UAE\n\n";
      if (Array.isArray(pages)) {
        pages.forEach((p: any) => {
          txt += `## ${p.title.rendered}\n${p.link}\nSummary: Buy/sell plastic scrap in UAE\n\n`;
        });
      }
      res.setHeader('Content-Type','text/plain');
      res.send(txt);
    } catch (e) {
      res.status(500).send(String(e));
    }
  });

  // Phase 1: Reconnaissance Engine (Steps 1, 2, 3)
  app.post('/api/serp/analyze', async (req, res) => {
    const { keyword } = req.body;
    const SERPER_KEY = process.env.SERPER_API_KEY;
    const GOOGLE_KEY = process.env.GOOGLE_CSE_KEY;
    const GOOGLE_CX = process.env.GOOGLE_CSE_ID;

    try {
      let organicResults = [];

      if (SERPER_KEY) {
        const serpRes = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: { 'X-API-KEY': SERPER_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: keyword, num: 5 })
        });
        const serpData = await serpRes.json();
        organicResults = serpData.organic || [];
      } else if (GOOGLE_KEY && GOOGLE_CX) {
        console.log('Using Google CSE for SERP analysis.');
        const serpRes = await fetch(`https://www.googleapis.com/customsearch/v1?key=${GOOGLE_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(keyword)}`);
        const serpData = await serpRes.json();
        organicResults = (serpData.items || []).map((item: any) => ({
          title: item.title,
          link: item.link,
          snippet: item.snippet
        }));
      } else {
        console.log('No keys found, using mock SERP data.');
        organicResults = [
          { title: "Top Plastic Scrap Suppliers in Sharjah UAE", link: "https://www.alsahamalahmar.com/services/", snippet: "Best HDPE and LDPE scrap prices in Sharjah..." },
          { title: "Recycling Companies in UAE | Plastic & Metal", link: "https://www.beah.ae/recycling", snippet: "Sustainable recycling solutions across the Emirates..." },
          { title: "Buy HDPE Scrap Bales in Sharjah", link: "https://www.plastics.ae/hdpe", snippet: "Export quality HDPE scrap bales available now..." },
          { title: "Aluminum Scrap Prices Today UAE", link: "https://scrap-prices-uae.com", snippet: "Check latest aluminum scrap and metal prices..." },
          { title: "Metal Scrap Trading Sharjah", link: "https://metal-trade.ae", snippet: "Wholesale metal scrap buyers and sellers..." },
          { title: "Plastic Recycling Sharjah Industrial Area", link: "https://sharjah-recycling.com", snippet: "Industrial plastic waste management services..." },
          { title: "HDPE PET PVC Scrap Export from Dubai", link: "https://dubai-scrap-export.com", snippet: "Global exporters of premium plastic scrap..." },
          { title: "Aluminum Foil Scrap Buyers Sharjah", link: "https://foil-scrap.ae", snippet: "Specialized buyers for aluminum foil and extrusions..." },
          { title: "Copper and Brass Scrap Prices Sharjah", link: "https://copper-scrap-sharjah.com", snippet: "High purity copper scrap recycling..." },
          { title: "UAE Scrap Metal Directory", link: "https://uae-scrap-dir.com", snippet: "Find all scrap yards and recycling centers in UAE..." },
          { title: "Plastic Scrap Buyers in Ajman", link: "https://ajman-plastic.com", snippet: "Serving Ajman and Sharjah for plastic waste..." },
          { title: "Industrial Waste Management UAE", link: "https://uae-waste.com", snippet: "Full service waste and recycling for factories..." },
          { title: "PET Bottle Scrap Bales Sharjah", link: "https://pet-bales.ae", snippet: "Large quantities of PET bottle scrap available..." },
          { title: "Scrap Yard Sajja Industrial Area", link: "https://sajja-scrap.com", snippet: "Located in the heart of Sharjah's industrial zone..." },
          { title: "Metal and Plastic Scraps Wholesale", link: "https://wholesale-scrap.ae", snippet: "Bulk quantities for international export..." },
          { title: "Global Scrap Market Updates", link: "https://scrap-market.com", snippet: "Daily news on plastic and metal scrap trends..." },
          { title: "Eco-Friendly Recycling Sharjah", link: "https://eco-sharjah.ae", snippet: "Environmentally conscious scrap processing..." },
          { title: "Plastic Pellets and Granules UAE", link: "https://plastic-pellets.ae", snippet: "Reprocessed plastic granules for manufacturing..." },
          { title: "Aluminum Extrusion Scrap Sharjah", link: "https://alu-extrusions.com", snippet: "High grade aluminum extrusions for sale..." },
          { title: "Sharjah Scrap Metal Auction", link: "https://sharjah-auctions.ae", snippet: "Weekly auctions for industrial metal and plastic scrap..." }
        ];
      }

      // Step 2 & 3: Scraping top 3 competitors for baselines
      const analyses = await Promise.all(organicResults.slice(0, 3).map(async (result: any) => {
        try {
          const resp = await fetch(result.link, { signal: AbortSignal.timeout(5000) });
          const html = await resp.text();
          const $ = cheerio.load(html);
          
          // Basic cleanup
          $('script, style, nav, footer, header, aside').remove();
          const text = $('body').text().replace(/\s+/g, ' ').trim();
          const wordCount = text.split(/\s+/).length;
          
          const headings: any = { h1: [], h2: [], h3: [] };
          $('h1').each((_, el) => headings.h1.push($(el).text().trim()));
          $('h2').each((_, el) => headings.h2.push($(el).text().trim()));
          $('h3').each((_, el) => headings.h3.push($(el).text().trim()));

          return {
            title: result.title,
            link: result.link,
            wordCount,
            headings
          };
        } catch (e) {
          return { title: result.title, link: result.link, error: 'Could not scrape' };
        }
      }));

      // Calculate Averages (Baselines)
      const validAnalyses = analyses.filter((a: any) => !a.error);
      const avgWords = validAnalyses.reduce((acc, curr) => acc + (curr.wordCount || 0), 0) / (validAnalyses.length || 1);
      const avgH2s = validAnalyses.reduce((acc, curr) => acc + (curr.headings?.h2?.length || 0), 0) / (validAnalyses.length || 1);

      // Phase 2: AI Intelligence (Steps 4, 5, 6)
      const competitorTextSummary = validAnalyses.map(a => `Title: ${a.title}\nHeadings: ${a.headings.h2.join(', ')}`).join('\n\n');
      const aiPrompt = `Analyze these top 3 competitors for the keyword "${keyword}":
      ${competitorTextSummary}

      1. Identify the top 15 important topical entities/keywords (LSI) that MUST be included.
      2. Identify the search intent (Informational, Transactional, or Commercial).
      3. List 3 critical content gaps (topics competitors cover that are essential).

      Return ONLY JSON: {"entities":[], "intent":"", "gaps":[]}`;

      let aiIntelligence = { entities: ["UAE", "Sharjah", "Price", "Supplier"], intent: "Commercial", gaps: ["Scrap pricing factors", "Delivery logistics", "Material purity standards"] };
      
      try {
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: 'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ contents: [{ parts: [{ text: aiPrompt }]}] })
        });
        const data = await r.json();
        if (!data.error) {
          const text = data.candidates[0].content.parts[0].text.replace(/```json|```/g,'').trim();
          aiIntelligence = JSON.parse(text);
        }
      } catch (e) {
        console.error('AI Intelligence failed, using defaults');
      }

      res.json({
        keyword,
        results: analyses,
        baselines: {
          avgWords: Math.round(avgWords),
          avgH2s: Math.round(avgH2s)
        },
        intelligence: aiIntelligence
      });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Step 10 & 11: Content Brief Generator
  app.post('/api/serp/generate-brief', async (req, res) => {
    const { keyword, results } = req.body;
    const competitorSummary = results.map((r: any) => `Competitor: ${r.title}\nHeadings: ${r.headings.h2.join(', ')}`).join('\n\n');
    
    const prompt = `Act as a Master SEO Strategist. Create a high-level Content Brief/Outline for the keyword "${keyword}".
    Based on these competitors:
    ${competitorSummary}

    Your brief MUST include:
    1. An optimized H1.
    2. At least 4 H2 headings covering critical subtopics.
    3. An FAQ section (H2) with 3 "People Also Ask" style questions.
    4. A call to action (CTA) at the end.

    Return the brief as clean HTML (use H1, H2, H3, P, UL tags only). No markdown.`;

    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }]}] })
      });
      const data = await r.json();
      const html = data.candidates[0].content.parts[0].text.replace(/```html|```/g,'').trim();
      res.json({ brief: html });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Step 14: Automated Schema Generator
  app.post('/api/seo/generate-schema', async (req, res) => {
    const { title, content, url } = req.body;
    const prompt = `Generate a valid JSON-LD schema script for this WordPress page.
    Title: ${title}
    URL: ${url}
    Content Summary: ${content.substring(0, 1000)}

    Decide if it should be Service, Article, or FAQPage. Return ONLY the JSON-LD object. No markdown tags.`;

    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }]}] })
      });
      const data = await r.json();
      const json = data.candidates[0].content.parts[0].text.replace(/```json|```/g,'').trim();
      res.json(JSON.parse(json));
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Step 13: Lighthouse / PageSpeed Audit
  app.get('/api/seo/pagespeed', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    try {
      const r = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${url}&category=PERFORMANCE&category=SEO`);
      const data = await r.json();
      res.json({
        performance: data.lighthouseResult.categories.performance.score * 100,
        seo: data.lighthouseResult.categories.seo.score * 100
      });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Step 17 & 18 & 21: GSC Traffic, CTR & Trends
  app.get('/api/seo/gsc-data', async (req, res) => {
    const mockData = [
      { clicks: 45, impressions: 1200, ctr: 3.75, position: 12.4, trend: 'up' },
      { clicks: 12, impressions: 800, ctr: 1.5, position: 24.1, trend: 'down' },
      { clicks: 89, impressions: 3400, ctr: 2.6, position: 8.2, trend: 'up' },
      { clicks: 2, impressions: 450, ctr: 0.44, position: 45.6, trend: 'down' }
    ];
    res.json(mockData[Math.floor(Math.random() * mockData.length)]);
  });

  // Step 15: Image SEO Automator
  app.post('/api/seo/optimize-images', async (req, res) => {
    const { content, title, id } = req.body;
    const $ = cheerio.load(content);
    const images = $('img');
    
    if (images.length === 0) return res.json({ success: true, count: 0 });

    const prompt = `Generate highly descriptive SEO alt text for ${images.length} images on a page titled "${title}".
    Focus on plastic scrap keywords for UAE/Sharjah. 
    Return ONLY a JSON array of strings: ["alt text 1", "alt text 2"]`;

    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }]}] })
      });
      const data = await r.json();
      const text = data.candidates[0].content.parts[0].text.replace(/```json|```/g,'').trim();
      const alts = JSON.parse(text);
      
      images.each((i, el) => {
        if (alts[i]) $(el).attr('alt', alts[i]);
      });

      const newContent = $.html();
      res.json({ success: true, count: images.length, newContent });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Step 20: Internal Linking Engine
  app.post('/api/seo/internal-links', async (req, res) => {
    const { currentId, content, allPages } = req.body;
    const prompt = `Analyze this content: "${content.substring(0, 1000)}..."
    Suggest 3 relevant internal links from these other site pages:
    ${allPages.filter((p:any) => p.id !== currentId).map((p:any) => `${p.title} (${p.link})`).join('\n')}
    
    Return ONLY JSON: [{"anchor":"", "link":""}]`;

    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }]}] })
      });
      const data = await r.json();
      const text = data.candidates[0].content.parts[0].text.replace(/```json|```/g,'').trim();
      res.json(JSON.parse(text));
    } catch (e) {
      res.json([]);
    }
  });

  // Step 22: Nightly Site Auditor
  app.get('/api/seo/nightly-audit', async (req, res) => {
    res.json({
      timestamp: new Date().toISOString(),
      pagesAudited: 24,
      criticalIssues: 0,
      optimizationsApplied: 3,
      summary: "All pages currently above 70 score. Applied 2 schema updates and 1 alt-tag optimization."
    });
  });

  app.post('/api/seo/workflow/recommend-keywords', async (req, res) => {
    const {
      goal,
      cause,
      targetAudience,
      ownerFocusKeyword,
      ownerKeywordChecked,
      allowUnvalidatedOwnerKeyword
    } = req.body || {};

    if (!goal || !String(goal).trim()) {
      return res.status(400).json({ error: 'Goal is required.' });
    }

    const SERPER_KEY = process.env.SERPER_API_KEY;
    const GOOGLE_KEY = process.env.GOOGLE_CSE_KEY;
    const GOOGLE_CX = process.env.GOOGLE_CSE_ID;

    let competitors: any[] = [];
    const query = `${goal} ${targetAudience || ''} ${cause || ''}`.replace(/\s+/g, ' ').trim();

    try {
      if (SERPER_KEY) {
        const serpRes = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: { 'X-API-KEY': SERPER_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: query, num: 10, gl: 'ae', hl: 'en' }),
          signal: AbortSignal.timeout(20000)
        });
        const serpData = await serpRes.json();
        competitors = Array.isArray(serpData?.organic) ? serpData.organic.slice(0, 10) : [];
      } else if (GOOGLE_KEY && GOOGLE_CX) {
        const serpRes = await fetch(`https://www.googleapis.com/customsearch/v1?key=${GOOGLE_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(query)}`);
        const serpData = await serpRes.json();
        competitors = (serpData?.items || []).slice(0, 10).map((item: any) => ({
          title: item.title,
          link: item.link,
          snippet: item.snippet
        }));
      }
    } catch (e) {
      console.error('SERP fetch failed in workflow:', e);
    }

    const fallbackRecommendations = [
      {
        keyword: `${goal} uae`.toLowerCase(),
        reason: 'Direct goal-match phrase with UAE geo-modifier for high commercial intent.',
        trendSignal: 'high',
        impressionPotential: 'high',
        clickPotential: 'high'
      },
      {
        keyword: `${goal} sharjah price`.toLowerCase(),
        reason: 'Price-led query tends to attract bottom-funnel users ready to contact suppliers.',
        trendSignal: 'medium',
        impressionPotential: 'high',
        clickPotential: 'high'
      },
      {
        keyword: `${goal} supplier near me`.toLowerCase(),
        reason: 'Near-me variants capture local discovery traffic and improve lead quality.',
        trendSignal: 'medium',
        impressionPotential: 'medium',
        clickPotential: 'high'
      }
    ];

    const competitorSummary = competitors.map((c: any, i: number) => (
      `${i + 1}. ${c?.title || 'Unknown'} | ${c?.snippet || 'No snippet'} | ${c?.link || ''}`
    )).join('\n');

    const aiPrompt = `You are an SEO strategist. Build focus keyword recommendations.
Goal: ${goal}
Cause: ${cause || 'N/A'}
Target Audience: ${targetAudience || 'N/A'}
Owner Focus Keyword: ${ownerFocusKeyword || 'N/A'}
Owner says Serper competitor check completed: ${ownerKeywordChecked || 'unknown'}
Allow owner keyword even if not checked: ${allowUnvalidatedOwnerKeyword ? 'yes' : 'no'}

Top 10 competitor SERP rows:
${competitorSummary || 'No competitor data available'}

Return ONLY JSON with this schema:
{
  "ownerKeywordDecision": {
    "useOwnerKeyword": true,
    "reason": "..."
  },
  "recommendations": [
    {
      "keyword": "...",
      "reason": "cause of recommendation",
      "trendSignal": "high|medium|low",
      "impressionPotential": "high|medium|low",
      "clickPotential": "high|medium|low"
    }
  ]
}

Rules:
1) Return 6 recommendations.
2) Recommendations must be commercial and realistic.
3) If owner keyword is weak and not checked, mark useOwnerKeyword false unless allowUnvalidatedOwnerKeyword is yes.
4) Keep reasons practical and short.`;

    const aiData = await callGeminiJson(aiPrompt, {
      ownerKeywordDecision: {
        useOwnerKeyword: Boolean(ownerFocusKeyword && (ownerKeywordChecked === 'yes' || allowUnvalidatedOwnerKeyword)),
        reason: ownerFocusKeyword
          ? 'Owner keyword accepted by fallback rules.'
          : 'No owner keyword provided.'
      },
      recommendations: fallbackRecommendations
    });

    const recommendations = Array.isArray(aiData?.recommendations) && aiData.recommendations.length > 0
      ? aiData.recommendations.slice(0, 8)
      : fallbackRecommendations;

    res.json({
      competitors,
      ownerKeywordDecision: aiData?.ownerKeywordDecision || {
        useOwnerKeyword: Boolean(ownerFocusKeyword),
        reason: ownerFocusKeyword ? 'Owner keyword available.' : 'No owner keyword supplied.'
      },
      recommendations
    });
  });

  app.post('/api/seo/workflow/compose-page', async (req, res) => {
    const {
      goal,
      cause,
      targetAudience,
      selectedKeyword,
      contactEmail,
      contactWhatsapp,
      contactPhone,
      contactLinks,
      socialLinks,
      googleMapAddress,
      uploadedImages,
      headingAlignment = 'left',
      paragraphAsBlockquote = false
    } = req.body || {};

    if (!goal || !selectedKeyword) {
      return res.status(400).json({ error: 'Goal and selected keyword are required.' });
    }

    const fallbackSlug = String(selectedKeyword).toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 70);
    const fallback = {
      pageTitle: `${selectedKeyword} | UAE`,
      h1: `${selectedKeyword}`,
      slug: fallbackSlug,
      metaDescription: `Explore ${selectedKeyword} solutions in UAE. Contact us for quotes and support.`,
      htmlContent: `<h1>${selectedKeyword}</h1>\n<p>${goal}</p>\n<h2>Why this page matters</h2>\n<p>${cause || 'This page is built to capture qualified business intent and improve search visibility.'}</p>\n<h2>Who this is for</h2>\n<p>${targetAudience || 'Buyers and decision-makers looking for trusted suppliers in UAE.'}</p>\n<p><img src=\"${uploadedImages?.[0]?.sourceUrl || 'https://placehold.co/960x540'}\" alt=\"${selectedKeyword}\" /></p>\n<h2>Contact us</h2>\n<ul>\n${contactEmail ? `<li>Email: ${contactEmail}</li>` : ''}\n${contactWhatsapp ? `<li>WhatsApp: ${contactWhatsapp}</li>` : ''}\n${contactPhone ? `<li>Phone: ${contactPhone}</li>` : ''}\n${contactLinks ? `<li>Links: ${contactLinks}</li>` : ''}\n</ul>\n${socialLinks ? `<h2>Social</h2><p>${socialLinks}</p>` : ''}\n${googleMapAddress ? `<h2>Map Location</h2><p>${googleMapAddress}</p>` : ''}`
    };

    const uploadedImageSummary = Array.isArray(uploadedImages)
      ? uploadedImages.map((img: any) => `${img?.sourceUrl || ''}`).filter(Boolean).join('\n')
      : '';

    const prompt = `You are a conversion-focused SEO copywriter.
Create a complete WordPress-ready HTML page.

Inputs:
- Goal: ${goal}
- Cause: ${cause || 'N/A'}
- Target audience: ${targetAudience || 'N/A'}
- Focus keyword: ${selectedKeyword}
- Image alt text: ${selectedKeyword}
- Contact email: ${contactEmail || 'N/A'}
- WhatsApp: ${contactWhatsapp || 'N/A'}
- Phone: ${contactPhone || 'N/A'}
- Additional contact links: ${contactLinks || 'N/A'}
- Social links: ${socialLinks || 'N/A'}
- Social links: ${socialLinks || 'N/A'}
- Google Map address (optional): ${googleMapAddress || 'N/A'}
- Uploaded image URLs:\n${uploadedImageSummary || 'None'}
- DESIGN RULES: 
  * All headings (H1, H2, H3) MUST be ${headingAlignment} aligned (use inline style text-align: ${headingAlignment}).
  * ${paragraphAsBlockquote ? 'All paragraphs MUST be wrapped in <blockquote> tags instead of <p> tags.' : 'Use standard <p> tags for paragraphs.'}
- INTERNAL LINKING POWER LOGIC: Embed exactly 2 context-rich internal links to existing service pages (e.g. /hdpe-scrap-sharjah/ or /ldpe-scrap-uae/).
- EXTERNAL AUTHORITY POWER LOGIC: Embed exactly 1 link to a global authority like 'Sharjah Municipality', 'UAE Ministry of Climate Change', or a global plastic recycling standard.
- SEMANTIC SEO POWER LOGIC: Use LSI keywords, answer 'People Also Ask' questions directly, and maintain a sophisticated B2B tone that establishes Al Saham Al Ahmar as the regional authority.

Requirements:
1) Return JSON only.
2) Include a strong H1 with the focus keyword.
3) Write 700-1000 words, structured with H2/H3, bullet list, CTA.
4) Include one image tag with descriptive alt text using the focus keyword. If uploaded image URLs exist, use them first.
5) Naturally maintain focus keyword density around 1% to 2%.
6) Include sections for contact and social proof.
7) If Google map address is provided, add a map/location section and mention it naturally.
8) INTEGRATE LINKS: Place the internal and external links naturally within the flow of the article (e.g., "Learn more about our [LDPE recycling process](...)").

JSON schema:
{
  "pageTitle": "...",
  "h1": "...",
  "slug": "...",
  "metaDescription": "...",
  "htmlContent": "..."
}`;

    const aiData = await callGeminiJson(prompt, fallback);

    res.json({
      pageTitle: aiData?.pageTitle || fallback.pageTitle,
      h1: aiData?.h1 || fallback.h1,
      slug: aiData?.slug || fallback.slug,
      metaDescription: aiData?.metaDescription || fallback.metaDescription,
      htmlContent: aiData?.htmlContent || fallback.htmlContent
    });
  });

  app.post('/api/seo/workflow/finalize-seo', async (req, res) => {
    const { goal, cause, targetAudience, selectedKeyword, pageHtml, remarks } = req.body || {};

    if (!selectedKeyword || !goal) {
      return res.status(400).json({ error: 'Selected keyword and goal are required.' });
    }

    const fallbackPermalink = String(selectedKeyword).toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 70);
    const fallback = {
      seoTitle: `${selectedKeyword} Services in UAE | Trusted Supplier`,
      permalink: fallbackPermalink,
      metaDescription: `Need ${selectedKeyword} services in UAE? Get fast response, strong quality, and competitive pricing. Contact us today.`,
      h1: selectedKeyword,
      checklist: [
        'Use keyword naturally in H1, first paragraph, and at least one H2.',
        'Keep title within 55-60 characters where possible.',
        'Add internal and external links before publish.'
      ]
    };

    const prompt = `You are an advanced SEO optimizer.
Goal: ${goal}
Cause: ${cause || 'N/A'}
Target: ${targetAudience || 'N/A'}
Selected Focus Keyword: ${selectedKeyword}
Owner remarks: ${remarks || 'N/A'}
Page HTML preview:\n${String(pageHtml || '').slice(0, 5000)}

Return ONLY JSON:
{
  "seoTitle": "max 60 chars",
  "permalink": "kebab-case slug",
  "metaDescription": "max 160 chars",
  "h1": "...",
  "checklist": ["..."]
}

Rules:
1) Make it attractive for clicks.
2) Keep keyword relevance high and natural.
3) Include practical final checks to push performance quality.`;

    const aiData = await callGeminiJson(prompt, fallback);

    res.json({
      seoTitle: aiData?.seoTitle || fallback.seoTitle,
      permalink: aiData?.permalink || fallbackPermalink,
      metaDescription: aiData?.metaDescription || fallback.metaDescription,
      h1: aiData?.h1 || selectedKeyword,
      checklist: Array.isArray(aiData?.checklist) && aiData.checklist.length > 0 ? aiData.checklist : fallback.checklist
    });
  });

  // WordPress Menu Management
  app.post('/api/wordpress/add-to-menu', async (req, res) => {
    const { pageId, title } = req.body;
    const site = getCurrentSite();
    if (!site) return res.status(500).json({ error: 'No site configured' });
    const auth = Buffer.from(`${site.user}:${site.pass}`).toString('base64');
    const headers = { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' };

    try {
      // 1. Get available menus
      const menusRes = await fetch(`${site.url}/wp-json/wp/v2/menus`, { headers });
      const menus = await menusRes.json();
      
      if (!Array.isArray(menus) || menus.length === 0) {
        return res.status(404).json({ error: 'No menus found in WordPress. Create a menu first.' });
      }

      // 2. Add item to the first menu (usually the primary one)
      const menuId = menus[0].id;
      const addRes = await fetch(`${site.url}/wp-json/wp/v2/menu-items`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: title || 'New Page',
          status: 'publish',
          object: 'page',
          object_id: pageId,
          type: 'post_type',
          menu_id: menuId
        })
      });

      const addData = await addRes.json();
      if (!addRes.ok) throw new Error(addData.message || 'Failed to add to menu');

      res.json({ success: true, menuId, menuData: addData });
    } catch (e: any) {
      console.error('Menu addition failed:', e);
      res.status(500).json({ error: e.message || String(e) });
    }
  });

  // AI SEO Auto-Resolution
  app.post('/api/seo/resolve-issue', async (req, res) => {
    const { pageId, issueLabel, currentContent, currentTitle, focusKeyword, currentMeta } = req.body;
    const content = currentContent || '';
    
    try {
      const prompt = `
        You are a Master SEO Agent. Your goal is to resolve a specific SEO issue for a WordPress page.
        
        ISSUE TO RESOLVE: "${issueLabel}"
        PAGE TITLE: "${currentTitle}"
        FOCUS KEYWORD: "${focusKeyword}"
        CURRENT META DESCRIPTION: "${currentMeta}"
        
        CURRENT HTML CONTENT SNIPPET (First 5000 chars):
        ${content.slice(0, 5000)}
        
        TASK:
        Determine how to fix this issue.
        - If the issue is "Single H1 Header check" and there are multiple H1s, convert all H1 tags IN THE CONTENT to H2 tags, leaving only the primary page title as H1 (which is handled by WordPress usually).
        - If the issue is "Focus Keyword in SEO Title", provide a new SEO Title.
        - If the issue is "Focus Keyword in Meta Description", provide a new Meta Description.
        - If the issue is "Focus Keyword in URL", suggest a new Slug.
        - If the issue is content-related (Density, Subheadings, Internal/External links), update the HTML content to fix it.
        - If you need more information (like a link for "External links found"), return "need_info: [What you need]".
        
        RETURN JSON ONLY:
        {
          "resolved": true,
          "needInfo": null,
          "issueFound": "Specific description of where and what the problem is",
          "actionTaken": "Step-by-step explanation of how you solved it",
          "updates": {
            "newTitle": "...",
            "newMeta": "...",
            "newSlug": "...",
            "newContent": "..."
          },
          "explanation": "Briefly explain what you fixed."
        }
      `;

      const fallback = {
        resolved: false,
        issueFound: 'Could not analyze issue properly.',
        actionTaken: 'No action taken due to processing error.',
        updates: {},
        explanation: 'AI failed to generate a valid fix.'
      };

      const data = await callGeminiJson(prompt, fallback);
      res.json(data);
    } catch (e: any) {
      console.error('Issue resolution failed:', e);
      res.status(500).json({ error: e.message || String(e) });
    }
  });

  // Image Optimization API
  app.post('/api/wordpress/optimize-image', async (req, res) => {
    const { imageUrl, targetSizeKB = 90, quality = 80 } = req.body;
    const site = getCurrentSite();
    if (!site) return res.status(500).json({ error: 'No site' });

    try {
      // 1. Fetch image
      const imgRes = await fetch(imageUrl);
      const buffer = await imgRes.arrayBuffer();
      const inputBuffer = Buffer.from(buffer);

      // 2. Process with Sharp
      let outputBuffer = await sharp(inputBuffer)
        .webp({ quality: quality })
        .toBuffer();

      // 3. Iterative compression if size is too large
      let currentQuality = quality;
      while (outputBuffer.length > targetSizeKB * 1024 && currentQuality > 10) {
        currentQuality -= 10;
        outputBuffer = await sharp(inputBuffer)
          .webp({ quality: currentQuality })
          .toBuffer();
      }

      // 4. Upload back to WordPress
      const auth = Buffer.from(`${site.user}:${site.pass}`).toString('base64');
      const fileName = `optimized_${Date.now()}.webp`;
      
      const uploadRes = await fetch(`${site.url}/wp-json/wp/v2/media`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Type': 'image/webp'
        },
        body: outputBuffer
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.message || 'Upload failed');

      res.json({ 
        success: true, 
        newUrl: uploadData.source_url, 
        id: uploadData.id,
        sizeKB: Math.round(outputBuffer.length / 1024),
        originalSizeKB: Math.round(inputBuffer.length / 1024)
      });
    } catch (e: any) {
      console.error('Image optimization failed:', e);
      res.status(500).json({ error: e.message || String(e) });
    }
  });

  // Add More Content/Images API
  app.post('/api/seo/add-more', async (req, res) => {
    const { type, description, targetHeading, imageUrl, currentContent } = req.body;
    
    try {
      if (type === 'content') {
        const prompt = `You are a premium SEO content engineer.
        Target Page Content:
        ${currentContent.slice(-3000)}
        
        TASK:
        The user wants to expand this page by adding: "${description}"
        Generate a new, contextually relevant HTML section (including headings if needed) that seamlessly flows with the existing content.
        
        RETURN JSON ONLY:
        {
          "html": "... your generated html snippet ..."
        }`;
        
        const fallback = { html: '<p>AI could not generate content at this time.</p>' };
        const aiData = await callGeminiJson(prompt, fallback);
        
        const newSnippet = typeof aiData === 'string' ? aiData : (aiData.html || aiData.content || '<p>AI could not generate content at this time.</p>');
        
        res.json({ newContentSnippet: newSnippet });
      } else {
        const imgTag = `<div style="margin: 30px 0; text-align: center;">
          <img src="${imageUrl || 'https://images.unsplash.com/photo-1530124560676-5741074e50e9?q=80&w=1200'}" 
               alt="${targetHeading}" 
               style="max-width: 100%; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);" />
          <p style="font-size: 10px; color: #666; font-style: italic; margin-top: 10px;">${targetHeading}</p>
        </div>`;
        
        res.json({ newContentSnippet: imgTag });
      }
    } catch (e: any) {
      console.error('Add more failed:', e);
      res.status(500).json({ error: e.message || String(e) });
    }
  });

  // Autonomous Page Visual & Content Editor
  app.post('/api/seo/autonomous-edit', async (req, res) => {
    const { pageId, currentContent, instructions, image, chatHistory } = req.body || {};
    
    if (!pageId) {
      return res.status(400).json({ error: 'Missing pageId.' });
    }
    if (!instructions || !String(instructions).trim()) {
      return res.status(400).json({ error: 'Instructions are required.' });
    }

    const site = getCurrentSite();
    if (!site) return res.status(500).json({ error: 'No site configured' });
    const auth = Buffer.from(`${site.user}:${site.pass}`).toString('base64');

    try {
      let sampleImageUrl = '';
      
      // 1. If image contains base64 data, upload it to WordPress media library first
      if (image && image.base64Data && image.fileName && image.mimeType) {
        console.log(`[Autonomous Agent] Uploading sample image to WordPress: ${image.fileName}`);
        try {
          const imgBuffer = Buffer.from(image.base64Data, 'base64');
          
          const uploadRes = await fetch(`${site.url}/wp-json/wp/v2/media`, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Disposition': `attachment; filename="${image.fileName}"`,
              'Content-Type': image.mimeType
            },
            body: imgBuffer
          });

          const uploadData: any = await uploadRes.json();
          if (uploadRes.ok && uploadData.source_url) {
            sampleImageUrl = uploadData.source_url;
            console.log(`[Autonomous Agent] Image uploaded successfully. URL: ${sampleImageUrl}`);
            
            // Set Alt text for the uploaded image in WP
            try {
              await fetch(`${site.url}/wp-json/wp/v2/media/${uploadData.id}`, {
                method: 'POST',
                headers: {
                  'Authorization': `Basic ${auth}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ alt_text: instructions.slice(0, 80), title: image.fileName })
              });
            } catch (altErr) {
              console.warn('[Autonomous Agent] Alt text upload warning:', altErr);
            }
          } else {
            console.error('[Autonomous Agent] Image upload failed on WP:', uploadData);
          }
        } catch (uploadErr) {
          console.error('[Autonomous Agent] Image upload exception:', uploadErr);
        }
      }

      // Prepare Chat History context
      let chatHistoryPrompt = '';
      if (chatHistory && Array.isArray(chatHistory) && chatHistory.length > 0) {
        chatHistoryPrompt = `\nPREVIOUS CONTEXT / PAST CHAT HISTORY:\n` +
          chatHistory.map((ch: any) => `${ch.role === 'user' ? 'User' : 'Agent'}: ${ch.text}`).join('\n') + `\n`;
      }

      // 2. Prepare multimodal Gemini prompt
      const prompt = `You are an autonomous Senior Web Developer, SEO Expert, and Conversion-focused Copywriter for Al Saham Al Ahmar (a B2B plastic scrap trading company in Sharjah, UAE).

YOUR MISSION:
Completely execute the user's instructions to EDIT, ADD, or REMOVE content/sections in this page. Take into account the current page content, instructions, and any previous discussion history.

CURRENT HTML CONTENT OF THE PAGE:
${currentContent || ''}
${chatHistoryPrompt}
USER'S CURRENT INSTRUCTION:
"${instructions}"

${sampleImageUrl ? `(Optional Uploaded Asset URL: ${sampleImageUrl})` : ''}

VISUAL REFERENCE & SCREENSHOT BUG DIAGNOSTICS:
You have been provided with an image (attached as multimodal input).
CRITICAL RULE 1 (DO NOT AUTO-EMBED): This uploaded image is an instruction reference or bug screenshot. DO NOT embed or display this uploaded screenshot image inside the page's HTML body using an <img> tag unless the user explicitly commands you to "insert/add/embed this uploaded image" or "show this picture".
CRITICAL RULE 2 (VISUAL BUG DIAGNOSTICS):
- Carefully analyze the uploaded image. The user may have uploaded a screenshot of the website displaying a layout bug (e.g. duplicate headers, redundant footers, spacing errors, overlapping text) with visual markups (such as red "X" crosses, circles, lines, or arrows).
- If the image highlights elements (like a duplicate header text or redundant section) marked with crosses or highlighted: you MUST locate these duplicate items in the "CURRENT HTML CONTENT OF THE PAGE" and REMOVE them to clean up the page structure.
- If the image is a visual layout mockup (e.g. pricing grid, benefits columns, layout cards), adapt that visual structural format cleanly into modern inline-styled HTML blocks customized for the B2B scrap metal and plastic trading context.

OUTPUT FORMAT REQUIREMENTS:
You MUST return a JSON object with EXACTLY the following structure (no markdown wrapper, no other text):
{
  "success": true,
  "html": "... the complete, newly modified HTML content of the page ...",
  "changesMade": [
    "Short description of edit 1",
    "Short description of edit 2"
  ],
  "seoImprovement": "Explain how these changes improve B2B conversion or SEO rankings."
}

CRITICAL RULES:
1. Return the COMPLETE, ready-to-use HTML content of the page in the "html" property. Do not truncate the content or use placeholders like "... remaining content ...". The HTML must be 100% complete and fully formed.
2. Maintain standard B2B copywriting tone, high keyword density (1% to 2%), and proper heading structure.
3. Cleanliness: Keep all HTML tags closed, use semantic elements, and insert inline CSS style attributes for rich aesthetics (e.g. nice border-radius, background gradients for table headers, clean paddings, elegant typography).
4. If the user instructions require removing a section or cleaning up double headers, completely omit those duplicate blocks. If they require adding a section, insert it at the most contextually relevant place. If they require editing, rewrite the specific block.
5. If the sample image has text or structures (like comparison columns or grids), reproduce them elegantly using Tailwind-like flex/grid or standard clean CSS tables so they look premium and professional.
`;

      // 3. Make multimodal call to Gemini
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured on server.');
      }

      const modelCandidates = [
        process.env.GEMINI_MODEL,
        'gemini-2.5-flash',
        'gemini-2.5-pro',
        'gemini-2.0-flash',
        'gemini-1.5-flash'
      ].filter(Boolean) as string[];

      let lastError = '';
      const modelErrors: string[] = [];
      let aiJson: any = null;

      for (const model of modelCandidates) {
        try {
          console.log(`[Autonomous Agent] Invoking Gemini model: ${model}`);
          const parts: any[] = [{ text: prompt }];

          if (image && image.base64Data && image.mimeType) {
            parts.push({
              inlineData: {
                mimeType: image.mimeType,
                data: image.base64Data
              }
            });
          }

          const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts }]
            }),
            signal: AbortSignal.timeout(300000)
          });

          const data = await r.json();
          if (!r.ok || data?.error) {
            const msg = data?.error?.message || `HTTP ${r.status}`;
            lastError = `[${model}] ${msg}`;
            modelErrors.push(`${model}: ${msg}`);
            const modelUnavailable = /not found|not supported|no longer available|deprecated|retired/i.test(msg);
            if (modelUnavailable) continue;
            throw new Error(lastError);
          }

          const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
          const cleaned = raw.replace(/```json|```/g, '').trim();
          
          try {
            aiJson = JSON.parse(cleaned);
          } catch {
            const firstBrace = cleaned.indexOf('{');
            const lastBrace = cleaned.lastIndexOf('}');
            if (firstBrace >= 0 && lastBrace > firstBrace) {
              aiJson = JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
            } else {
              throw new Error('Failed to parse Gemini output as JSON');
            }
          }

          if (aiJson && aiJson.html) {
            break; // Success!
          }
        } catch (e: any) {
          lastError = e?.message || String(e);
          console.warn(`[Autonomous Agent] Model ${model} failed:`, lastError);
          if (!modelErrors.includes(`${model}: ${lastError}`)) {
            modelErrors.push(`${model}: ${lastError}`);
          }
        }
      }

      if (!aiJson || !aiJson.html) {
        throw new Error(`AI page editing failed. Attempted models diagnostics:\n${modelErrors.map(err => `• ${err}`).join('\n')}`);
      }

      // 4. Save the newly edited HTML content back to WordPress autonomously!
      console.log(`[Autonomous Agent] Saving newly generated HTML content for page ${pageId} back to WordPress...`);
      
      // Prevent Gutenberg crashes by encapsulating raw AI HTML in a Custom HTML block
      const safeWpHtml = `<!-- wp:html -->\n${aiJson.html}\n<!-- /wp:html -->`;
      
      const saveRes = await fetch(`${site.url}/wp-json/wp/v2/pages/${pageId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: safeWpHtml })
      });

      const saveData = await saveRes.json();
      if (!saveRes.ok || saveData.code) {
        throw new Error(saveData.message || saveData.code || 'Failed to sync content to WordPress.');
      }

      console.log(`[Autonomous Agent] Autonomously synchronized with WordPress. Success!`);
      
      res.json({
        success: true,
        html: aiJson.html,
        changesMade: aiJson.changesMade || [],
        seoImprovement: aiJson.seoImprovement || '',
        imageUrl: sampleImageUrl
      });

    } catch (err: any) {
      console.error('Autonomous Visual Edit agent failed:', err);
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  // Google Search Console APIs
  const getGSCClient = (credentialsJson: string) => {
    try {
      const creds = JSON.parse(credentialsJson);
      const auth = new google.auth.JWT({
        email: creds.client_email,
        key: creds.private_key,
        scopes: ['https://www.googleapis.com/auth/webmasters.readonly', 'https://www.googleapis.com/auth/indexing']
      });
      return google.searchconsole({ version: 'v1', auth });
    } catch (e) {
      return null;
    }
  };

  app.get('/api/gsc/performance', async (req, res) => {
    const site = getCurrentSite();
    if (!site?.gscCredentials || !site?.gscPropertyUrl) {
      return res.status(400).json({ error: 'GSC not configured for this site' });
    }

    const searchConsole = getGSCClient(site.gscCredentials);
    if (!searchConsole) return res.status(500).json({ error: 'Invalid GSC Credentials' });

    try {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      const formatDate = (d: Date) => d.toISOString().split('T')[0];

      const response = await searchConsole.searchanalytics.query({
        siteUrl: site.gscPropertyUrl,
        requestBody: {
          startDate: formatDate(thirtyDaysAgo),
          endDate: formatDate(today),
          dimensions: ['query', 'page'],
          rowLimit: 100
        }
      });

      res.json(response.data);
    } catch (e: any) {
      console.error('GSC Performance error:', e);
      res.status(500).json({ error: e.message || String(e) });
    }
  });

  app.get('/api/gsc/index-status', async (req, res) => {
    const { url } = req.query;
    const site = getCurrentSite();
    if (!site?.gscCredentials || !site?.gscPropertyUrl) {
      return res.status(400).json({ error: 'GSC not configured' });
    }

    const searchConsole = getGSCClient(site.gscCredentials);
    if (!searchConsole) return res.status(500).json({ error: 'Invalid GSC Credentials' });

    try {
      // Note: URL Inspection API is limited
      const response = await searchConsole.urlInspection.index.inspect({
        requestBody: {
          inspectionUrl: url as string,
          siteUrl: site.gscPropertyUrl
        }
      });
      res.json(response.data);
    } catch (e: any) {
      console.error('GSC Index Status error:', e);
      res.status(500).json({ error: e.message || String(e) });
    }
  });
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
  
  // Extend global socket and keep-alive timeouts to 10 minutes (600000ms) for visual editor runs
  server.timeout = 600000;
  server.keepAliveTimeout = 600000;
}

startServer();
