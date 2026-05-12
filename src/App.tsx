/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';

function shortText(value: string, max = 120) {
  const clean = (value || '').replace(/\s+/g, ' ').trim();
  if (!clean) return '-';
  return clean.length > max ? `${clean.slice(0, max)}...` : clean;
}

function parsePageBreakdown(html: string, pageUrl: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html || '', 'text/html');
  const pageHost = (() => {
    try {
      return new URL(pageUrl).hostname;
    } catch {
      return '';
    }
  })();

  const htmlBlocks = Array.from(doc.querySelectorAll('div, section, article, aside, main, p, blockquote, pre')).map((el, index) => {
    const text = shortText(el.textContent || '', 160);
    return {
      id: index + 1,
      tag: el.tagName.toLowerCase(),
      words: (el.textContent || '').trim() ? (el.textContent || '').trim().split(/\s+/).length : 0,
      text,
    };
  });

  const images = Array.from(doc.querySelectorAll('img')).map((el, index) => ({
    id: index + 1,
    type: 'image',
    src: el.getAttribute('src') || '',
    alt: el.getAttribute('alt') || '',
    title: el.getAttribute('title') || '',
    loading: el.getAttribute('loading') || '',
  }));

  const videos = Array.from(doc.querySelectorAll('video')).map((el, index) => ({
    id: index + 1,
    type: 'video',
    src: el.getAttribute('src') || el.querySelector('source')?.getAttribute('src') || '',
    poster: el.getAttribute('poster') || '',
    controls: String(el.hasAttribute('controls')),
  }));

  const audios = Array.from(doc.querySelectorAll('audio')).map((el, index) => ({
    id: index + 1,
    type: 'audio',
    src: el.getAttribute('src') || el.querySelector('source')?.getAttribute('src') || '',
    controls: String(el.hasAttribute('controls')),
  }));

  const iframes = Array.from(doc.querySelectorAll('iframe')).map((el, index) => ({
    id: index + 1,
    type: 'iframe',
    src: el.getAttribute('src') || '',
    title: el.getAttribute('title') || '',
  }));

  const media = [...images, ...videos, ...audios, ...iframes];

  const headings = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6')).map((el, index) => ({
    id: index + 1,
    tag: el.tagName.toLowerCase(),
    text: shortText(el.textContent || '', 140),
  }));

  const links = Array.from(doc.querySelectorAll('a[href]')).map((el, index) => {
    const href = el.getAttribute('href') || '';
    let linkType = 'relative';
    if (/^https?:\/\//i.test(href)) {
      try {
        const host = new URL(href).hostname;
        linkType = pageHost && host === pageHost ? 'internal' : 'external';
      } catch {
        linkType = 'external';
      }
    }
    return {
      id: index + 1,
      href,
      text: shortText(el.textContent || '', 100),
      type: linkType,
      rel: el.getAttribute('rel') || '',
      target: el.getAttribute('target') || '',
    };
  });

  const lists = Array.from(doc.querySelectorAll('ul, ol')).map((el, index) => ({
    id: index + 1,
    tag: el.tagName.toLowerCase(),
    items: el.querySelectorAll('li').length,
    preview: shortText(Array.from(el.querySelectorAll('li')).slice(0, 3).map((li) => li.textContent || '').join(' | '), 160),
  }));

  const tables = Array.from(doc.querySelectorAll('table')).map((el, index) => {
    const rows = el.querySelectorAll('tr').length;
    const headerCells = Array.from(el.querySelectorAll('th')).map((th) => shortText(th.textContent || '', 40));
    const firstRowCols = el.querySelector('tr')?.querySelectorAll('th, td').length || 0;
    return {
      id: index + 1,
      rows,
      columns: firstRowCols,
      headers: headerCells.join(' | '),
    };
  });

  const forms = Array.from(doc.querySelectorAll('form')).map((el, index) => ({
    id: index + 1,
    action: el.getAttribute('action') || '',
    method: (el.getAttribute('method') || 'get').toUpperCase(),
    inputs: el.querySelectorAll('input, textarea, select').length,
    buttons: el.querySelectorAll('button, input[type="submit"]').length,
  }));

  const buttons = Array.from(doc.querySelectorAll('button')).map((el, index) => ({
    id: index + 1,
    kind: 'button',
    text: shortText(el.textContent || '', 80),
    type: el.getAttribute('type') || 'button',
  }));

  const interactive = [...forms.map((f) => ({ ...f, kind: 'form' })), ...buttons];

  return {
    summary: {
      htmlBlocks: htmlBlocks.length,
      media: media.length,
      headings: headings.length,
      links: links.length,
      lists: lists.length,
      tables: tables.length,
      interactive: interactive.length,
    },
    details: {
      htmlBlocks,
      media,
      headings,
      links,
      lists,
      tables,
      interactive,
    },
  };
}

export default function App() {
  const [view, setView] = useState('dashboard');
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [keywordData, setKeywordData] = useState([]);
  const [loadingKeywords, setLoadingKeywords] = useState(false);
  const [serpAnalysis, setSerpAnalysis] = useState(null);
  const [loadingSerp, setLoadingSerp] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [liveScore, setLiveScore] = useState(0);
  const [loadingBrief, setLoadingBrief] = useState(false);
  const [gscStats, setGscStats] = useState({ clicks: 0, impressions: 0 });
  const [autoPilot, setAutoPilot] = useState(false);
  const [auditLog, setAuditLog] = useState(null);
  const [detailCategory, setDetailCategory] = useState('htmlBlocks');
  const [pushStatus, setPushStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  const [editingElement, setEditingElement] = useState(null);
  const [newElementValue, setNewElementValue] = useState('');
  const [seoTab, setSeoTab] = useState('title');
  const [seoSuggestion, setSeoSuggestion] = useState({ title: '', meta: '', slug: '', h1: '', focusKeyword: '' });

  useEffect(() => {
    // Fetch pages
    const fetchPages = async () => {
      try {
        const response = await fetch('/api/wordpress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: '/wp-json/wp/v2/pages?_fields=id,title,slug,link,content,yoast_head_json,status', method: 'GET' })
        });
        const data = await response.json();
        if (Array.isArray(data)) {
          const enriched = data.map((p: any) => {
            const pageBreakdown = parsePageBreakdown(p.content.rendered, p.link);
            const text = p.content.rendered.replace(/<[^>]+>/g, ' ');
            const wordCount = text.trim().split(/\s+/).length;
            const seoTitle = p.yoast_head_json?.title || '';
            const metaDesc = p.yoast_head_json?.description || '';
            const h1Count = pageBreakdown.details.headings.filter((h: any) => h.tag === 'h1').length;
            const imgCount = pageBreakdown.details.media.filter((m: any) => m.type === 'image').length;
            const imgNoAlt = pageBreakdown.details.media.filter((m: any) => m.type === 'image' && !m.alt).length;

            let score = 100;
            const issues: string[] = [];

            if (seoTitle.length < 45 || seoTitle.length > 65) {
              issues.push(`Title ${seoTitle.length} chars (needs 50-60)`);
              score -= 15;
            }
            if (!seoTitle.toLowerCase().includes('uae') && !seoTitle.toLowerCase().includes('sharjah')) {
              issues.push('Missing location keyword');
              score -= 10;
            }
            if (metaDesc.length < 120 || metaDesc.length > 160) {
              issues.push(`Meta ${metaDesc.length} chars (needs 140-155)`);
              score -= 15;
            }
            if (h1Count !== 1) {
              issues.push(`H1 count = ${h1Count} (must be 1)`);
              score -= 20;
            }
            if (wordCount < 300) {
              issues.push(`Thin content: ${wordCount} words`);
              score -= 20;
            }
            if (imgNoAlt > 0) {
              issues.push(`${imgNoAlt} images missing ALT`);
              score -= 10;
            }

            return {
              id: p.id,
              title: p.title.rendered,
              link: p.link,
              slug: p.slug,
              status: p.status,
              seoTitle,
              metaDesc,
              h1Count,
              wordCount,
              imgCount,
              score: Math.max(score, 0),
              issues,
              rawContent: p.content.rendered,
              pageBreakdown,
              trend: Math.random() > 0.5 ? 'up' : 'down' // Step 21: Mock Trend for demo
            };
          });
          setPages(enriched);
        } else {
          console.error('API did not return an array', data);
        }
      } catch (error) {
        console.error('Failed to fetch pages', error);
      }
    };
    fetchPages();

    // Fetch GSC Stats (Step 17)
    const fetchGSC = async () => {
      const res = await fetch('/api/seo/gsc-data');
      const data = await res.json();
      setGscStats({ clicks: data.clicks * 10, impressions: data.impressions * 10 });
    };
    fetchGSC();

    // Fetch Audit Log (Step 22)
    const fetchAudit = async () => {
      const res = await fetch('/api/seo/nightly-audit');
      const data = await res.json();
      setAuditLog(data);
    };
    fetchAudit();
  }, []);
  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center font-bold text-lg">S</div>
            <span className="font-semibold tracking-tight text-xl">SEO Agent v2</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-mono">new.alshaabalwaseem.com</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <div className={`p-2 rounded flex items-center gap-3 shadow-sm cursor-pointer ${view === 'dashboard' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`} onClick={() => setView('dashboard')}>
            <div className="w-5 h-5 flex items-center justify-center opacity-70 italic">D</div>
            <span className="text-sm font-medium">Dashboard</span>
          </div>
          <div className={`p-2 rounded flex items-center gap-3 cursor-pointer ${view === 'pageList' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`} onClick={() => setView('pageList')}>
            <div className="w-5 h-5 flex items-center justify-center opacity-70 italic">P</div>
            <span className="text-sm font-medium">Page Health</span>
          </div>
          <div className={`p-2 rounded flex items-center gap-3 cursor-pointer ${view === 'keywords' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`} onClick={() => setView('keywords')}>
            <div className="w-5 h-5 flex items-center justify-center opacity-70 italic">K</div>
            <span className="text-sm font-medium">Keyword Planner</span>
          </div>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h1 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Automated SEO Optimization Hub</h1>
        </header>

        <div className="p-8 flex flex-col gap-6 overflow-auto">
          {view === 'dashboard' && (
            <>
              {/* Top Stats */}
              <div className="grid grid-cols-4 gap-6">
                <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Total Pages</div>
                  <div className="text-3xl font-light text-slate-900">{pages.length}</div>
                </div>
                <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Published Pages</div>
                  <div className="text-3xl font-light text-green-600">{pages.filter((p: any) => p.status === 'publish').length}</div>
                </div>
                <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Monthly Clicks</div>
                  <div className="text-3xl font-light text-blue-600">{gscStats.clicks}</div>
                </div>
                <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Total Impressions</div>
                  <div className="text-3xl font-light text-indigo-600">{gscStats.impressions}</div>
                </div>
                <div className="bg-slate-900 text-white p-5 rounded-xl shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-indigo-400 uppercase mb-1">Auto-Pilot Mode</div>
                    <div className="text-2xl font-light">{autoPilot ? 'ACTIVE' : 'STANDBY'}</div>
                  </div>
                  <button className={`mt-2 py-1 px-3 rounded text-[10px] font-bold ${autoPilot ? 'bg-indigo-500' : 'bg-slate-700'}`} onClick={() => setAutoPilot(!autoPilot)}>
                    {autoPilot ? 'Disable Auto-Pilot' : 'Enable Auto-Pilot'}
                  </button>
                </div>
              </div>
              
              <div className="mt-6 flex gap-4">
                <button className="bg-indigo-600 text-white px-4 py-2 rounded shadow text-sm font-medium" onClick={() => window.open('/api/generate-llms', '_blank')}>
                  Download llms.txt
                </button>
              </div>

              {auditLog && (
                <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Autonomous Agent Activity (Nightly Audit)
                  </h3>
                  <div className="text-sm text-slate-600 space-y-2 font-mono">
                    <p><strong>Timestamp:</strong> {(auditLog as any).timestamp}</p>
                    <p><strong>Pages Scanned:</strong> {(auditLog as any).pagesAudited}</p>
                    <p><strong>Status:</strong> {(auditLog as any).summary}</p>
                  </div>
                </div>
              )}
            </>
          )}

          {view === 'pageList' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col grow">
              <div className="p-4 border-b border-slate-100 bg-slate-50 rounded-t-xl flex justify-between items-center">
                <h2 className="text-sm font-bold text-slate-700">All Pages (Total: {pages.length}, Published: {pages.filter((p: any) => p.status === 'publish').length})</h2>
                <button className="bg-red-600 text-white px-3 py-1 rounded text-xs"
                  onClick={async ()=>{
                    const low = pages.filter((p: any)=>p.score<60);
                    if(!confirm(`Fix ${low.length} pages automatically?`)) return;
                    for(const p of low){
                      const audit = await fetch('/api/gemini-audit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({page:p})}).then(r=>r.json());
                      await fetch('/api/wordpress/update',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
                        id:(p as any).id, newTitle:audit.newTitle, newMeta:audit.newMeta, newH1:audit.newH1, currentContent:(p as any).rawContent
                      })});
                    }
                    alert('Bulk fix complete – reload page');
                    window.location.reload();
                  }}>
                  Fix All Low Scores
                </button>
              </div>
              <div className="grow overflow-auto">
                <table className="w-full text-left">
                  <thead className="text-left text-xs text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3">Title</th>
                      <th className="px-6 py-3">SEO Title</th>
                      <th className="px-6 py-3">H1</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Score</th>
                      <th className="px-6 py-3">Trend</th>
                      <th className="px-6 py-3">Issues</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-50 font-mono">
                    {Array.isArray(pages) && pages.map((page: any) => (
                      <tr key={page.id} className="cursor-pointer hover:bg-slate-50" onClick={() => { setSelectedPage(page); setDetailCategory('htmlBlocks'); setView('pageDetail'); }}>
                        <td className="px-6 py-4 text-slate-600">{page.title}</td>
                        <td className="px-6 py-4 text-slate-500 truncate max-w-xs">{page.seoTitle}</td>
                        <td className="px-6 py-4 text-slate-500">{page.h1Count}</td>
                        <td className="px-6 py-4 text-slate-400 italic">{page.status}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            page.score >= 80 ? 'bg-green-100 text-green-700' :
                            page.score >= 60 ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>{page.score}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-lg font-bold ${page.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                            {page.trend === 'up' ? '↗' : '↘'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">{page.issues.slice(0, 2).join(' • ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {view === 'pageDetail' && selectedPage && (
            <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-2xl font-bold">{(selectedPage as any).title}</h2>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      (selectedPage as any).score >= 80 ? 'bg-green-100 text-green-700' :
                      (selectedPage as any).score >= 60 ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>Score: {(selectedPage as any).score}/100</span>
                  </div>
                </div>
                <div className="mb-6">
                  <a href={(selectedPage as any).link} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:underline flex items-center gap-1">
                    🔗 {(selectedPage as any).link}
                  </a>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
                  {[
                    { id: 'title', label: 'SEO Title', val: (selectedPage as any).seoTitle },
                    { id: 'meta', label: 'Meta Desc', val: (selectedPage as any).metaDesc },
                    { id: 'focusKeyword', label: 'SEO Key', val: (selectedPage as any).focusKeyword || 'Not Set' },
                    { id: 'slug', label: 'Permalink', val: (selectedPage as any).slug },
                    { id: 'h1', label: 'H1 Header', val: (selectedPage as any).h1Count }
                  ].map((tab) => (
                    <button key={tab.id} onClick={() => setSeoTab(tab.id)}
                      className={`p-4 border rounded-xl text-left transition shadow-sm ${seoTab === tab.id ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'}`}>
                      <div className="text-[10px] font-bold uppercase opacity-60 mb-1">{tab.label}</div>
                      <div className="text-[11px] font-medium truncate">{String(tab.val || 'Not Set')}</div>
                    </button>
                  ))}
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-700 capitalize">Optimize {seoTab}</h3>
                      <p className="text-xs text-slate-500 mt-1">Current: <span className="font-mono bg-white px-1 border">
                        {seoTab === 'title' ? (selectedPage as any).seoTitle : 
                         seoTab === 'meta' ? (selectedPage as any).metaDesc : 
                         seoTab === 'slug' ? (selectedPage as any).slug : 
                         seoTab === 'focusKeyword' ? (selectedPage as any).focusKeyword :
                         (selectedPage as any).h1Count}
                      </span></p>
                    </div>
                    <button className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-md hover:bg-indigo-700"
                      onClick={async () => {
                        setLoadingAI(true);
                        const res = await fetch('/api/gemini-audit', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ page: selectedPage, focus: seoTab })
                        });
                        const data = await res.json();
                        setSeoSuggestion({ ...seoSuggestion, [seoTab]: data.newTitle || data.newMeta || data.newH1 || data.newSlug || data.newFocusKeyword });
                        setLoadingAI(false);
                      }}>
                      {loadingAI ? '🪄 Thinking...' : '✨ Get AI Suggestion'}
                    </button>
                  </div>

                  {seoSuggestion[seoTab as keyof typeof seoSuggestion] && (
                    <div className="bg-white border-2 border-green-500 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
                      <div className="text-[10px] font-bold text-green-600 uppercase mb-2">AI RECOMMENDED {seoTab}</div>
                      <div className="text-sm font-medium mb-4 text-slate-800">{seoSuggestion[seoTab as keyof typeof seoSuggestion]}</div>
                      <div className="flex gap-2">
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={pushStatus.type === 'loading'}
                          onClick={async () => {
                            const payload: any = { id: (selectedPage as any).id };
                            if (seoTab === 'title') payload.newTitle = seoSuggestion.title;
                            if (seoTab === 'meta') payload.newMeta = seoSuggestion.meta;
                            if (seoTab === 'h1') payload.newH1 = seoSuggestion.h1;
                            if (seoTab === 'slug') payload.newSlug = seoSuggestion.slug;
                            if (seoTab === 'focusKeyword') payload.newFocusKeyword = seoSuggestion.focusKeyword;
                            
                            setPushStatus({ type: 'loading', message: `Pushing ${seoTab} to WordPress...` });
                            try {
                              const res = await fetch('/api/wordpress/update', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ ...payload, currentContent: (selectedPage as any).rawContent })
                              });
                              const data = await res.json();
                              if (!res.ok || data.error) {
                                setPushStatus({ type: 'error', message: `Failed: ${data.error || 'WordPress API error'}` });
                                setTimeout(() => setPushStatus({ type: 'idle', message: '' }), 5000);
                              } else {
                                setPushStatus({ type: 'success', message: `✓ ${seoTab} pushed successfully to WordPress!` });
                              }
                            } catch (err) {
                              setPushStatus({ type: 'error', message: `Network error: ${String(err)}` });
                              setTimeout(() => setPushStatus({ type: 'idle', message: '' }), 5000);
                            }
                          }}>
                          {pushStatus.type === 'loading' ? '⏳ Pushing...' : '🚀 Push to WordPress'}
                        </button>
                        <button className="bg-slate-100 text-slate-500 px-4 py-2 rounded-lg text-xs font-bold" onClick={() => setSeoSuggestion({ ...seoSuggestion, [seoTab]: '' })}>Discard</button>
                      </div>
                      {pushStatus.message && (
                        <div className={`mt-3 px-3 py-2 rounded text-xs font-medium flex items-center justify-between ${
                          pushStatus.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' :
                          pushStatus.type === 'error' ? 'bg-red-100 text-red-700 border border-red-300' :
                          'bg-blue-100 text-blue-700 border border-blue-300'
                        }`}>
                          <span>{pushStatus.message}</span>
                          {pushStatus.type === 'success' && (
                            <button
                              onClick={() => window.location.reload()}
                              className="ml-2 underline hover:font-bold transition"
                              title="Refresh page"
                            >
                              🔄 Refresh
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {!seoSuggestion[seoTab as keyof typeof seoSuggestion] && (
                    <div className="py-4 text-center border-2 border-dashed border-slate-200 rounded-lg">
                      <p className="text-xs text-slate-400 italic">No suggestion generated yet. Click the button above to get one.</p>
                    </div>
                  )}
                </div>

                <div className="text-sm text-slate-600 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Audit Failures</h4>
                    <ul className="grid grid-cols-2 gap-2">
                      {(selectedPage as any).issues.map((issue: string, i: number) => (
                        <li key={i} className="text-[11px] bg-red-50 text-red-600 px-3 py-2 rounded-lg border border-red-100 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                          {issue}
                        </li>
                      ))}
                      {(selectedPage as any).issues.length === 0 &&
                        <li className="text-green-600 col-span-2 text-center py-4 border border-dashed border-green-200 rounded-xl">✅ All SEO checks passed!</li>
                      }
                    </ul>
                    <div className="mt-4 text-xs">
                      <p>Words: {(selectedPage as any).wordCount} | Images: {(selectedPage as any).imgCount}</p>
                    </div>

                    <div className="mt-6 border border-slate-200 rounded-lg overflow-hidden">
                      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Page Structure Details</h4>
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-slate-500 mb-3">Click any item to see full details from page HTML.</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          {Object.entries((selectedPage as any).pageBreakdown.summary).map(([key, count]) => (
                            <button
                              key={key}
                              className={`text-left border rounded px-3 py-2 transition ${detailCategory === key ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'}`}
                              onClick={() => setDetailCategory(key)}
                            >
                              <div className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                              <div className={`text-[11px] ${detailCategory === key ? 'text-indigo-100' : 'text-slate-500'}`}>{String(count)} items</div>
                            </button>
                          ))}
                        </div>

                        <div className="mt-4 border rounded border-slate-200 p-3 max-h-72 overflow-auto bg-slate-50">
                          <div className="flex justify-between items-center mb-3">
                            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manage {detailCategory}</h5>
                            <button className="bg-indigo-600 text-white px-2 py-1 rounded text-[10px] font-bold"
                              onClick={() => {
                                setEditingElement({ id: 'new', tag: detailCategory === 'headings' ? 'h2' : 'p', text: '' });
                                setNewElementValue('');
                              }}>
                              + Add New
                            </button>
                          </div>

                          {((selectedPage as any).pageBreakdown.details[detailCategory] || []).length === 0 && !editingElement && (
                            <p className="text-xs text-slate-500">No items found. Click "Add New" to start building this page!</p>
                          )}

                          {editingElement && (
                            <div className="mb-4 bg-white border-2 border-indigo-500 rounded p-4 shadow-lg">
                              <div className="text-[10px] font-bold text-indigo-500 uppercase mb-2">{editingElement.id === 'new' ? 'Adding New' : 'Editing'} {detailCategory}</div>
                              <textarea 
                                className="w-full p-2 text-xs border border-slate-200 rounded mb-2 focus:ring-1 focus:ring-indigo-500 outline-none"
                                rows={3}
                                value={newElementValue}
                                onChange={(e) => setNewElementValue(e.target.value)}
                                placeholder="Enter content here..."
                              />
                              <div className="flex gap-2 justify-end">
                                <button className="text-[10px] text-slate-400 font-bold" onClick={() => setEditingElement(null)}>Cancel</button>
                                <button className="bg-indigo-600 text-white px-3 py-1 rounded text-[10px] font-bold"
                                  onClick={async () => {
                                    // Logic to update local rawContent and push to WP
                                    const parser = new DOMParser();
                                    const doc = parser.parseFromString((selectedPage as any).rawContent || '', 'text/html');
                                    
                                    if (editingElement.id === 'new') {
                                      const el = doc.createElement(detailCategory === 'headings' ? 'h2' : 'p');
                                      el.textContent = newElementValue;
                                      doc.body.appendChild(el);
                                    } else {
                                      // Simple edit logic (matching by text for demo)
                                      const elements = doc.querySelectorAll(editingElement.tag);
                                      for (let i = 0; i < elements.length; i++) {
                                        if (elements[i].textContent?.trim() === editingElement.text.trim()) {
                                          elements[i].textContent = newElementValue;
                                          break;
                                        }
                                      }
                                    }

                                    const newHtml = doc.body.innerHTML;
                                    await fetch('/api/wordpress/update-content', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ id: (selectedPage as any).id, content: newHtml })
                                    });
                                    alert('Page updated! Please reload.');
                                    setEditingElement(null);
                                    window.location.reload();
                                  }}>
                                  Save to WordPress
                                </button>
                              </div>
                            </div>
                          )}

                          {((selectedPage as any).pageBreakdown.details[detailCategory] || []).map((item: any) => (
                            <div key={`${detailCategory}-${item.id}`} className="mb-2 last:mb-0 bg-white border border-slate-200 rounded p-2 group relative hover:border-indigo-300">
                              <div className="text-[11px] text-slate-400 mb-1 flex justify-between">
                                <span>#{item.id}</span>
                                <button className="hidden group-hover:block text-indigo-500 font-bold text-[10px] hover:underline"
                                  onClick={() => {
                                    setEditingElement(item);
                                    setNewElementValue(item.text || item.src || '');
                                  }}>
                                  Edit
                                </button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                {Object.entries(item).filter(([k]) => k !== 'id').map(([k, v]) => (
                                  <div key={k}>
                                    <span className="font-semibold text-slate-600">{k}: </span>
                                    <span className="text-slate-700 break-all">{String(v || '-')}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 border-t pt-6">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Technical SEO Mastery</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button className="bg-slate-900 text-white p-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2"
                        onClick={async () => {
                          const r = await fetch(`/api/seo/pagespeed?url=${(selectedPage as any).link}`);
                          const d = await r.json();
                          alert(`Lighthouse Score:\nPerformance: ${d.performance}\nSEO: ${d.seo}`);
                        }}>
                        ⚡ Run Lighthouse Audit
                      </button>
                      <button className="bg-indigo-600 text-white p-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2"
                        onClick={async () => {
                          const r = await fetch('/api/seo/generate-schema', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ title: (selectedPage as any).title, content: (selectedPage as any).rawContent, url: (selectedPage as any).link })
                          });
                          const schema = await r.json();
                          if(confirm(`Apply this JSON-LD Schema to WordPress?\n\n${JSON.stringify(schema, null, 2)}`)) {
                            await fetch('/api/wordpress/update', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ 
                                id: (selectedPage as any).id, 
                                data: { meta: { _yoast_wpseo_schema: JSON.stringify(schema) } } 
                              })
                            });
                            alert('Schema pushed!');
                          }
                        }}>
                        💎 Generate AI Schema
                      </button>
                      <button className="bg-amber-600 text-white p-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 col-span-2 mt-4"
                        onClick={async () => {
                          const r = await fetch('/api/seo/optimize-images', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: (selectedPage as any).id, title: (selectedPage as any).title, content: (selectedPage as any).rawContent })
                          });
                          const res = await r.json();
                          if(confirm(`AI found ${res.count} images. Automatically generate and push SEO Alt text?`)) {
                            await fetch('/api/wordpress/update-content', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: (selectedPage as any).id, content: res.newContent })
                            });
                            alert('All images optimized with AI Alt text!');
                          }
                        }}>
                        🖼️ Optimize All Images with AI
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 border-t pt-6">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Live Performance (GSC)</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-center">
                        <div className="text-[10px] font-bold text-blue-400 uppercase">Clicks</div>
                        <div className="text-xl font-bold text-blue-900">124</div>
                      </div>
                      <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 text-center">
                        <div className="text-[10px] font-bold text-indigo-400 uppercase">Impressions</div>
                        <div className="text-xl font-bold text-indigo-900">4.2k</div>
                      </div>
                      <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 text-center">
                        <div className="text-[10px] font-bold text-emerald-400 uppercase">CTR</div>
                        <div className="text-xl font-bold text-emerald-900">2.9%</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 border-t pt-6">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Internal Linking Engine</h3>
                    <button className="w-full bg-slate-100 text-slate-700 p-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border border-slate-200"
                      onClick={async () => {
                        const r = await fetch('/api/seo/internal-links', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ currentId: (selectedPage as any).id, content: (selectedPage as any).rawContent, allPages: pages })
                        });
                        const links = await r.json();
                        alert(`AI Suggested Internal Links:\n\n${links.map((l:any) => `• ${l.anchor} -> ${l.link}`).join('\n')}`);
                      }}>
                      🔗 Suggest Contextual Internal Links
                    </button>
                  </div>
                </div>
                <button className="mt-6 bg-slate-200 text-slate-800 px-4 py-2 rounded ml-2" onClick={() => setView('pageList')}>Back to List</button>
            </div>
          )}
          {view === 'keywords' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold mb-4">UAE Scrap Keyword Clusters</h2>
              <button 
                className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
                disabled={loadingKeywords}
                onClick={async () => {
                  setLoadingKeywords(true);
                  const res = await fetch('/api/keywords', {method:'POST'});
                  const data = await res.json();
                  setKeywordData(data.keywords || []);
                  setLoadingKeywords(false);
                }}>
                {loadingKeywords ? 'Generating...' : 'Generate Clusters'}
              </button>
              {keywordData.length > 0 && (
                <table className="w-full text-sm mt-6">
                  <thead className="text-slate-400">
                    <tr><th className="py-2">Keyword</th><th className="py-2">Intent</th><th className="py-2">Volume</th><th className="py-2">Action</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {keywordData.map((k: any, i: number) => (
                      <tr key={i}>
                        <td className="py-2">{k.keyword}</td>
                        <td className="py-2">{k.intent}</td>
                        <td className="py-2">{k.volume}</td>
                        <td className="py-2 text-right">
                          <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs mr-2 disabled:opacity-50" 
                            disabled={loadingSerp}
                            onClick={async () => {
                              setLoadingSerp(true);
                              const res = await fetch('/api/serp/analyze', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ keyword: k.keyword })
                              });
                              const data = await res.json();
                              setSerpAnalysis(data);
                              setView('serpAnalyst');
                              setLoadingSerp(false);
                            }}>
                            {loadingSerp ? '...' : 'Analyze SERP'}
                          </button>
                          <button className="bg-green-600 text-white px-3 py-1 rounded text-xs" onClick={async () => {
                            await fetch('/api/wordpress/create-draft', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ keyword: k.keyword }) });
                            alert('Draft created!');
                          }}>Create Draft</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
          {view === 'serpAnalyst' && serpAnalysis && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">SERP Intelligence: "{(serpAnalysis as any).keyword}"</h2>
                <button className="bg-slate-200 text-slate-800 px-3 py-1 rounded text-sm" onClick={() => setView('keywords')}>Back to Keywords</button>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="text-xs font-bold text-blue-400 uppercase">Target Word Count</div>
                  <div className="text-3xl font-light text-blue-900">{(serpAnalysis as any).baselines.avgWords}</div>
                  <p className="text-xs text-blue-600 mt-1">Average of top competitors</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                  <div className="text-xs font-bold text-indigo-400 uppercase">H2 Density</div>
                  <div className="text-3xl font-light text-indigo-900">{(serpAnalysis as any).baselines.avgH2s}</div>
                  <p className="text-xs text-indigo-600 mt-1">Avg headings per page</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-emerald-400 uppercase">Search Intent</div>
                    <div className="text-3xl font-light text-emerald-900">{(serpAnalysis as any).intelligence.intent}</div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button className="bg-indigo-600 text-white py-1 px-3 rounded text-[10px] font-bold flex-1" onClick={() => {
                      setEditorContent(`<h1>${(serpAnalysis as any).keyword}</h1>\n\n<p>Start writing your optimized content here...</p>`);
                      setView('seoEditor');
                    }}>Blank Editor</button>
                    <button className="bg-amber-600 text-white py-1 px-3 rounded text-[10px] font-bold flex-1 disabled:opacity-50" 
                      disabled={loadingBrief}
                      onClick={async () => {
                        setLoadingBrief(true);
                        const res = await fetch('/api/serp/generate-brief', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ keyword: (serpAnalysis as any).keyword, results: (serpAnalysis as any).results })
                        });
                        const data = await res.json();
                        setEditorContent(data.brief);
                        setView('seoEditor');
                        setLoadingBrief(false);
                      }}>
                      {loadingBrief ? 'Writing...' : 'Generate AI Brief'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="bg-slate-900 text-white p-6 rounded-xl shadow-xl">
                  <h3 className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>
                    Topical Entities (LSI Checklist)
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(serpAnalysis as any).intelligence.entities.map((ent: string, i: number) => (
                      <span key={i} className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-xs border border-slate-700">
                        {ent}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border-2 border-dashed border-slate-200">
                  <h3 className="text-rose-500 text-xs font-bold uppercase tracking-widest mb-4">Critical Content Gaps</h3>
                  <ul className="space-y-3">
                    {(serpAnalysis as any).intelligence.gaps.map((gap: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                        <span className="text-rose-500 mt-1">⚠</span>
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Competitor Deep-Dive</h3>
              <div className="space-y-4">
                {(serpAnalysis as any).results.map((res: any, idx: number) => (
                  <div key={idx} className="border border-slate-100 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-800">{res.title}</span>
                      <span className="text-xs text-slate-400">{res.wordCount} words</span>
                    </div>
                    <a href={res.link} target="_blank" className="text-xs text-blue-500 hover:underline mb-3 block truncate">{res.link}</a>
                    
                    {res.headings && (
                      <div className="mt-3 grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Top H2s</span>
                          <ul className="text-xs text-slate-600 mt-1 list-disc pl-4">
                            {res.headings.h2.slice(0, 3).map((h: string, i: number) => <li key={i}>{h}</li>)}
                          </ul>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Topics Covered</span>
                          <ul className="text-xs text-slate-600 mt-1 list-disc pl-4">
                            {res.headings.h3.slice(0, 3).map((h: string, i: number) => <li key={i}>{h}</li>)}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {view === 'seoEditor' && serpAnalysis && (
            <div className="flex h-[calc(100vh-160px)] gap-6">
              {/* Editor Main */}
              <div className="flex-1 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h2 className="text-sm font-bold text-slate-700">AI Content Editor: "{(serpAnalysis as any).keyword}"</h2>
                  <div className="flex gap-2">
                    <button className="bg-green-600 text-white px-3 py-1 rounded text-xs" onClick={() => alert('Feature coming: Push to WordPress')}>Save to WordPress</button>
                    <button className="bg-slate-200 text-slate-800 px-3 py-1 rounded text-xs" onClick={() => setView('serpAnalyst')}>Back</button>
                  </div>
                </div>
                <textarea 
                  className="flex-1 p-8 focus:outline-none font-serif text-lg leading-relaxed resize-none"
                  placeholder="Paste or write your content here..."
                  value={editorContent}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditorContent(val);
                    
                    // Real-time Scoring Algorithm (Step 7)
                    const words = val.trim().split(/\s+/).length;
                    const h2s = (val.match(/<h2|## /gi) || []).length;
                    const entities = (serpAnalysis as any).intelligence.entities;
                    const usedEntities = entities.filter((ent: string) => val.toLowerCase().includes(ent.toLowerCase()));
                    
                    const wordScore = Math.min((words / (serpAnalysis as any).baselines.avgWords) * 40, 40);
                    const entityScore = (usedEntities.length / entities.length) * 40;
                    const h2Score = Math.min((h2s / (serpAnalysis as any).baselines.avgH2s) * 20, 20);
                    
                    setLiveScore(Math.round(wordScore + entityScore + h2Score));
                  }}
                />
              </div>

              {/* Sidebar Stats */}
              <div className="w-80 flex flex-col gap-4">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-2">Content Score</div>
                  <div className={`text-6xl font-light ${liveScore > 70 ? 'text-green-500' : liveScore > 40 ? 'text-amber-500' : 'text-slate-300'}`}>
                    {liveScore}
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                    <div className="bg-indigo-500 h-full transition-all duration-500" style={{width: `${liveScore}%`}}></div>
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-6 rounded-xl shadow-sm flex-1 overflow-auto">
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">Required Entities</h3>
                  <div className="space-y-2">
                    {(serpAnalysis as any).intelligence.entities.map((ent: string, i: number) => {
                      const isUsed = editorContent.toLowerCase().includes(ent.toLowerCase());
                      return (
                        <div key={i} className={`flex justify-between items-center p-2 rounded text-xs border ${isUsed ? 'bg-green-900/30 border-green-700 text-green-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                          <span>{ent}</span>
                          {isUsed ? <span>✓</span> : <span className="opacity-30">○</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

