/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';

function shortText(value: string, max = 120) {
  const clean = (value || '').replace(/\s+/g, ' ').trim();
  if (!clean) return '-';
  return clean.length > max ? `${clean.slice(0, max)}...` : clean;
}

async function readJsonSafe(response: Response, context: string) {
  const raw = await response.text();
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error(`${context}: expected JSON but received non-JSON (status ${response.status}).`);
  }
}

type WorkflowStatus = 'pending' | 'running' | 'waiting' | 'done' | 'failed';

type ContactEntry = {
  name: string;
  position: string;
  mobile: string;
};

type NewPageWorkflowForm = {
  goal: string;
  cause: string;
  targetAudience: string;
  contactEmail: string;
  contacts: ContactEntry[];
  contactLinks: string;
  socialLinks: string;
  googleMapAddress: string;
  ownerFocusKeyword: string;
  ownerKeywordChecked: 'unknown' | 'yes' | 'no';
  allowUnvalidatedOwnerKeyword: boolean;
  remarks: string;
  appCode: string;
  addToMenu?: boolean;
  // Styling
  bgColor: string;
  bgImage: WorkflowUploadImage | null;
  headingFont: string;
  headingSize: string;
  paragraphFont: string;
  paragraphSize: string;
  pageType: 'normal' | 'blog';
  blogTopics: string[];
  optimizeImages: boolean;
  headingAlignment: 'left' | 'center' | 'right';
  paragraphAsBlockquote: boolean;
};

type WorkflowUploadImage = {
  fileName: string;
  mimeType: string;
  base64Data: string;
  previewUrl: string;
  uploadedId?: number;
  sourceUrl?: string;
};

type WorkflowStep = {
  id: 'step1' | 'step2' | 'step3';
  title: string;
  description: string;
  status: WorkflowStatus;
  logs: string[];
};

const defaultNewPageWorkflowForm: NewPageWorkflowForm = {
  goal: '',
  cause: '',
  targetAudience: '',
  contactEmail: '',
  contacts: [{ name: '', position: '', mobile: '' }],
  contactLinks: '',
  socialLinks: '',
  googleMapAddress: '',
  ownerFocusKeyword: '',
  ownerKeywordChecked: 'unknown',
  allowUnvalidatedOwnerKeyword: false,
  remarks: '',
  appCode: '',
  addToMenu: false,
  bgColor: '',
  bgImage: null,
  headingFont: '',
  headingSize: '',
  paragraphFont: '',
  paragraphSize: '',
  pageType: 'normal',
  blogTopics: [''],
  optimizeImages: true,
  headingAlignment: 'left',
  paragraphAsBlockquote: false
};

const createInitialWorkflowSteps = (): WorkflowStep[] => ([
  {
    id: 'step1',
    title: 'Step 1: Competitor Keyword Intelligence',
    description: 'Find top competitor keywords, trends, and recommendation reasons.',
    status: 'pending',
    logs: []
  },
  {
    id: 'step2',
    title: 'Step 2: Build Full Page Draft',
    description: 'Generate a complete page draft and push it for preview.',
    status: 'pending',
    logs: []
  },
  {
    id: 'step3',
    title: 'Step 3: Final SEO Package',
    description: 'Finalize SEO title, permalink, meta description, and publish-ready checks.',
    status: 'pending',
    logs: []
  }
]);

const BlockItem = ({ item, detailCategory, setEditingElement, setNewElementValue }: any) => {
  const [showPreview, setShowPreview] = useState(false);
  return (
    <div className="mb-2 last:mb-0 bg-white border border-slate-200 rounded p-2 group relative hover:border-indigo-300 transition-all">
      <div className="text-[11px] text-slate-400 mb-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-bold">#{item.id}</span>
          <button 
            onClick={() => setShowPreview(!showPreview)}
            className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter transition ${showPreview ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            {showPreview ? '📄 Code View' : '👁️ Live Preview'}
          </button>
        </div>
        <button className="hidden group-hover:block text-indigo-500 font-bold text-[10px] hover:underline"
          onClick={() => {
            setEditingElement(item);
            setNewElementValue(item.text || item.src || '');
          }}>
          Edit
        </button>
      </div>
      
      {showPreview ? (
        <div className="p-3 bg-slate-50 rounded border border-dashed border-slate-200 overflow-hidden">
          <div className="text-[10px] text-slate-400 mb-2 uppercase font-black">Rendering &lt;{item.tag}&gt;:</div>
          <div 
            className="prose prose-sm max-w-none text-slate-800"
            dangerouslySetInnerHTML={{ __html: `<${item.tag}>${item.text || ''}</${item.tag}>` }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-xs">
          {Object.entries(item).filter(([k]) => k !== 'id').map(([k, v]) => (
            <div key={k}>
              <span className="font-semibold text-slate-600">{k}: </span>
              <span className="text-slate-700 break-all">{String(v || '-')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

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
  const [selectedPage, setSelectedPageState] = useState(null);
  const selectedPageRef = useRef(null);
  
  const setSelectedPage = (page: any) => {
    setSelectedPageState(page);
    selectedPageRef.current = page;
    if (page) {
      setSeoSuggestion({
        title: page.seoTitle || '',
        meta: page.metaDesc || '',
        slug: page.slug || '',
        h1: String(page.h1Count || ''),
        focusKeyword: page.focusKeyword || ''
      });
    }
  };
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [keywordData, setKeywordData] = useState([]);
  const [loadingKeywords, setLoadingKeywords] = useState(false);
  const [serpAnalysis, setSerpAnalysis] = useState(null);
  const [loadingSerp, setLoadingSerp] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [liveScore, setLiveScore] = useState(0);
  const [loadingBrief, setLoadingBrief] = useState(false);
  const [gscStats, setGscStats] = useState<any>(null);
  const [loadingGsc, setLoadingGsc] = useState(false);
  const [activeView, setActiveView] = useState<'pages' | 'gsc'>('pages');
  const [editingGsc, setEditingGsc] = useState<Record<string, { gscCredentials?: string; gscPropertyUrl?: string }>>({});
  const [autoPilot, setAutoPilot] = useState(false);
  const [auditLog, setAuditLog] = useState(null);
  const [detailCategory, setDetailCategory] = useState('htmlBlocks');
  const [stylingBlock, setStylingBlock] = useState<{ index: number, item: any } | null>(null);
  const [styleForm, setStyleForm] = useState({
    font: 'Inter',
    size: '16px',
    color: '#1e293b',
    bg: 'transparent',
    bold: false,
    align: 'left',
    isBlockquote: false
  });
  const [pushStatus, setPushStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  const [editingElement, setEditingElement] = useState(null);
  const [newElementValue, setNewElementValue] = useState('');
  const [seoTab, setSeoTab] = useState('title');
  const [neededInfoRequest, setNeededInfoRequest] = useState<{ label: string, info: string } | null>(null);
  const [humanHelpInput, setHumanHelpInput] = useState('');
  const [optimizingImage, setOptimizingImage] = useState<string | null>(null);
  const [resolutionInfo, setResolutionInfo] = useState<{ issue: string, found: string, action: string, status: 'resolving' | 'done' } | null>(null);
  const [showAddMoreModal, setShowAddMoreModal] = useState(false);
  const [addMoreForm, setAddMoreForm] = useState({ type: 'content' as 'content' | 'image', description: '', targetHeading: '', imageUrl: '', isLoading: false });
  const [addMorePreview, setAddMorePreview] = useState<string | null>(null);
  const [addMorePreviewTab, setAddMorePreviewTab] = useState<'preview' | 'html'>('preview');
  const [seoSuggestion, setSeoSuggestion] = useState({ title: '', meta: '', slug: '', h1: '', focusKeyword: '' });
  const [pageGoal, setPageGoal] = useState('');
  const [keywordSuggestions, setKeywordSuggestions] = useState<string[]>([]);
  const [competitorData, setCompetitorData] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPageWorkflowForm, setNewPageWorkflowForm] = useState<NewPageWorkflowForm>({
    ...defaultNewPageWorkflowForm,
    gscCredentials: '',
    gscPropertyUrl: ''
  });
  const [creatingPage, setCreatingPage] = useState(false);
  const [workflowSavedPage, setWorkflowSavedPage] = useState<any | null>(null);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>(createInitialWorkflowSteps());
  const [workflowRecommendations, setWorkflowRecommendations] = useState<any[]>([]);
  const [workflowCompetitors, setWorkflowCompetitors] = useState<any[]>([]);
  const [workflowSelectedKeyword, setWorkflowSelectedKeyword] = useState('');
  const [workflowDraft, setWorkflowDraft] = useState<any | null>(null);
  const [workflowSeoPackage, setWorkflowSeoPackage] = useState<any | null>(null);
  const [workflowUploadImages, setWorkflowUploadImages] = useState<WorkflowUploadImage[]>([]);
  const [integrationStatus, setIntegrationStatus] = useState<{ geminiConfigured: boolean; serperConfigured: boolean; geminiModel: string }>({
    geminiConfigured: false,
    serperConfigured: false,
    geminiModel: 'auto-fallback'
  });
  const [workflowBusy, setWorkflowBusy] = useState(false);
  const [workflowError, setWorkflowError] = useState('');
  const [workflowAskToStart, setWorkflowAskToStart] = useState(false);
  const [workflowAutoMode, setWorkflowAutoMode] = useState(false);
  const [showAddBlogModal, setShowAddBlogModal] = useState(false);
  const [newBlogForm, setNewBlogForm] = useState({
    name: '',
    topic: '',
    words: 500,
    recommendations: '',
    images: [] as WorkflowUploadImage[]
  });
  const [loadingBlockAI, setLoadingBlockAI] = useState(false);
  const [showMasterPreview, setShowMasterPreview] = useState(false);
  const [sites, setSites] = useState<any[]>([]);
  const [currentSiteId, setCurrentSiteId] = useState<string | null>(null);
  const [showAddSiteModal, setShowAddSiteModal] = useState(false);
  const [newSiteData, setNewSiteData] = useState({ url: '', user: '', pass: '', name: '' });
  const [addingSite, setAddingSite] = useState(false);
  const [siteTestResults, setSiteTestResults] = useState<Record<string, any>>({});
  const [siteTestLoading, setSiteTestLoading] = useState<Record<string, boolean>>({});
  const [showPhpSnippetFor, setShowPhpSnippetFor] = useState<string | null>(null);
  const [editingSite, setEditingSite] = useState<Record<string, { user: string; pass: string }>>({});
  const [showMoreFeatures, setShowMoreFeatures] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const sendChatMessage = async () => {
    if (!chatInput.trim() || loadingChat) return;
    const userMsg = { role: 'user' as const, text: chatInput };
    const newMsgs = [...chatMessages, userMsg];
    setChatMessages(newMsgs);
    setChatInput('');
    setLoadingChat(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMsgs,
          pageContext: selectedPage 
        })
      });
      const data: any = await readJsonSafe(res, 'Chat API');
      if (!res.ok) {
        throw new Error(data?.error || `Chat API failed (${res.status})`);
      }
      setChatMessages([...newMsgs, { role: 'ai', text: data.text }]);
    } catch (e) {
      setChatMessages([...newMsgs, { role: 'ai', text: "Error: I'm having trouble connecting to my brain. Please check your internet or API key." }]);
    } finally {
      setLoadingChat(false);
    }
  };

  // Autonomous Page Visual & Content Editor Agent State
  const [autonomousInstructions, setAutonomousInstructions] = useState('');
  const [autonomousImage, setAutonomousImage] = useState<{ fileName: string, mimeType: string, base64Data: string, previewUrl: string } | null>(null);
  const [autonomousRunning, setAutonomousRunning] = useState(false);
  const [autonomousLogs, setAutonomousLogs] = useState<string[]>([]);
  const [autonomousResults, setAutonomousResults] = useState<{ changesMade: string[], seoImprovement: string, imageUrl?: string } | null>(null);
  const [autonomousError, setAutonomousError] = useState<string | null>(null);

  const runAutonomousEditorAgent = async () => {
    if (!selectedPage) return;
    if (!autonomousInstructions.trim()) {
      setAutonomousError('Please enter some instructions for the AI Agent.');
      return;
    }

    setAutonomousRunning(true);
    setAutonomousError(null);
    setAutonomousResults(null);
    setAutonomousLogs([
      '🤖 Agent Initialized...',
      `📄 Selected target page ID: ${(selectedPage as any).id}`,
      '⚡ Reading current HTML page content...'
    ]);

    try {
      let logMsg = '🔍 No reference image uploaded. Running content-only optimization...';
      if (autonomousImage) {
        logMsg = `📸 Reference image detected: "${autonomousImage.fileName}" (${autonomousImage.mimeType}). Preparing multi-modal payload...`;
      }
      setAutonomousLogs(prev => [...prev, logMsg]);

      setAutonomousLogs(prev => [...prev, '🧠 Sending prompt & page context to Gemini...']);
      
      const res = await fetch('/api/seo/autonomous-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: (selectedPage as any).id,
          currentContent: (selectedPage as any).rawContent || '',
          instructions: autonomousInstructions,
          image: autonomousImage ? {
            fileName: autonomousImage.fileName,
            mimeType: autonomousImage.mimeType,
            base64Data: autonomousImage.base64Data
          } : null,
          chatHistory: chatMessages.map((m: any) => ({ role: m.role, text: m.text }))
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'The AI Visual Agent encountered an error during generation.');
      }

      setAutonomousLogs(prev => [
        ...prev,
        '📦 Gemini content generation complete.',
        '💾 Saving newly formatted HTML back to WordPress...',
        '🚀 WordPress page synchronized successfully!'
      ]);

      const updatedPage = {
        ...selectedPage,
        rawContent: data.html
      };
      setSelectedPage(updatedPage);
      setEditorContent(data.html);

      // Save changes to pages list too
      setPages((prevPages: any[]) => prevPages.map(p => p.id === (selectedPage as any).id ? updatedPage : p));

      setAutonomousResults({
        changesMade: data.changesMade || [],
        seoImprovement: data.seoImprovement || '',
        imageUrl: data.imageUrl
      });

      setAutonomousInstructions('');
      setAutonomousImage(null);

    } catch (err: any) {
      console.error(err);
      setAutonomousError(err.message || 'An unexpected error occurred during execution.');
      setAutonomousLogs(prev => [...prev, `❌ Execution failed: ${err.message || String(err)}`]);
    } finally {
      setAutonomousRunning(false);
    }
  };

  const fetchSites = async () => {
    try {
      const r = await fetch('/api/sites');
      const d: any = await readJsonSafe(r, 'Sites API');
      if (!r.ok) throw new Error(d?.error || `Sites API failed (${r.status})`);
      setSites(Array.isArray(d.sites) ? d.sites : []);
      setCurrentSiteId(d.currentSiteId || null);
    } catch (error) {
      console.error('Failed to fetch sites', error);
      setSites([]);
      setCurrentSiteId(null);
    }
  };

  const selectSite = async (id: string) => {
    try {
      const res = await fetch('/api/sites/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data: any = await readJsonSafe(res, 'Select Site API');
      if (!res.ok) {
        throw new Error(data?.error || `Site selection failed (${res.status})`);
      }
      setCurrentSiteId(data?.currentSiteId || id);
      setSelectedPage(null);
      await fetchPages();
    } catch (error) {
      console.error('Failed to select site', error);
    }
  };

  const deleteSite = async (id: string) => {
    if (!confirm('Are you sure you want to remove this site?')) return;
    try {
      const res = await fetch(`/api/sites/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSites(prev => prev.filter(s => s.id !== id));
        if (currentSiteId === id) {
          const remaining = sites.filter(s => s.id !== id);
          setCurrentSiteId(remaining[0]?.id || null);
        }
      }
    } catch (e) {
      console.error('Delete failed', e);
    }
  };

  const deletePage = async (id: number) => {
    if (!confirm('Are you sure you want to delete this page/workflow?')) return;
    try {
      const res = await fetch('/api/wordpress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId: currentSiteId, url: `/wp-json/wp/v2/pages/${id}?force=true`, method: 'DELETE' })
      });
      if (res.ok) {
        fetchPages();
      }
    } catch (e) {
      console.error('Delete failed', e);
    }
  };

  const saveWorkflowSnapshot = async (pageId: number, additionalData: any = {}) => {
    const snapshot = {
      cause: newPageWorkflowForm.cause,
      targetAudience: newPageWorkflowForm.targetAudience,
      contactEmail: newPageWorkflowForm.contactEmail,
      contacts: newPageWorkflowForm.contacts,
      contactLinks: newPageWorkflowForm.contactLinks,
      socialLinks: newPageWorkflowForm.socialLinks,
      googleMapAddress: newPageWorkflowForm.googleMapAddress,
      ownerFocusKeyword: newPageWorkflowForm.ownerFocusKeyword,
      ownerKeywordChecked: newPageWorkflowForm.ownerKeywordChecked,
      allowUnvalidatedOwnerKeyword: newPageWorkflowForm.allowUnvalidatedOwnerKeyword,
      remarks: newPageWorkflowForm.remarks,
      appCode: newPageWorkflowForm.appCode,
      bgColor: newPageWorkflowForm.bgColor,
      bgImage: newPageWorkflowForm.bgImage,
      headingFont: newPageWorkflowForm.headingFont,
      headingSize: newPageWorkflowForm.headingSize,
      paragraphFont: newPageWorkflowForm.paragraphFont,
      paragraphSize: newPageWorkflowForm.paragraphSize,
      pageType: newPageWorkflowForm.pageType,
      blogTopics: newPageWorkflowForm.blogTopics,
      steps: workflowSteps,
      selectedKeyword: workflowSelectedKeyword,
      draft: workflowDraft,
      seoPackage: workflowSeoPackage,
      ...additionalData
    };

    await fetch('/api/wordpress/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: pageId,
        meta: {
          _seo_goal: pageGoal || newPageWorkflowForm.goal,
          _seo_workflow_snapshot: JSON.stringify(snapshot)
        }
      })
    });
  };

  const resumeWorkflow = (page: any) => {
    try {
      const snapshot = JSON.parse(page.meta?._seo_workflow_snapshot || '{}');
      setNewPageWorkflowForm({
        goal: page.meta?._seo_goal || '',
        cause: snapshot.cause || '',
        targetAudience: snapshot.targetAudience || '',
        contactEmail: snapshot.contactEmail || '',
        contacts: snapshot.contacts || [{ name: '', position: '', mobile: '' }],
        contactLinks: snapshot.contactLinks || '',
        socialLinks: snapshot.socialLinks || '',
        googleMapAddress: snapshot.googleMapAddress || '',
        ownerFocusKeyword: snapshot.ownerFocusKeyword || '',
        ownerKeywordChecked: snapshot.ownerKeywordChecked || 'unknown',
        allowUnvalidatedOwnerKeyword: snapshot.allowUnvalidatedOwnerKeyword || false,
        remarks: snapshot.remarks || '',
        appCode: snapshot.appCode || '',
        bgColor: snapshot.bgColor || '',
        bgImage: snapshot.bgImage || null,
        headingFont: snapshot.headingFont || '',
        headingSize: snapshot.headingSize || '',
        paragraphFont: snapshot.paragraphFont || '',
        paragraphSize: snapshot.paragraphSize || '',
        pageType: snapshot.pageType || 'normal',
        blogTopics: snapshot.blogTopics || ['']
      });
      setWorkflowSavedPage(page);
      setWorkflowSteps(snapshot.steps || createInitialWorkflowSteps());
      setWorkflowSelectedKeyword(snapshot.selectedKeyword || page.focusKeyword || '');
      setWorkflowDraft(snapshot.draft || null);
      setWorkflowSeoPackage(snapshot.seoPackage || null);
      setPageGoal(page.meta?._seo_goal || '');
      setWorkflowUploadImages(snapshot.uploadedImages || []);
      
      setView('dashboard');
      setShowAddModal(true);
    } catch (e) {
      alert('Failed to parse workflow history.');
    }
  };

  const fetchPagesInFlight = { current: false };
  const fetchPages = async () => {
    if (fetchPagesInFlight.current) return;
    fetchPagesInFlight.current = true;
    try {
      const response = await fetch('/api/wordpress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId: currentSiteId, url: '/wp-json/wp/v2/pages?status=publish,draft,future,pending&_fields=id,title,slug,link,content,meta,status', method: 'GET' })
      });
      const data: any = await readJsonSafe(response, 'WordPress API');
      if (!response.ok) {
        throw new Error(data?.error || `WordPress API failed (${response.status})`);
      }
      if (Array.isArray(data)) {
        const enriched = data.map((p: any) => {
          const pageBreakdown = parsePageBreakdown(p.content.rendered, p.link);
          const text = p.content.rendered.replace(/<[^>]+>/g, ' ');
          const wordCount = text.trim().split(/\s+/).length;
          const seoTitle = p.meta?.rank_math_title || '';
          const metaDesc = p.meta?.rank_math_description || '';
          const focusKeyword = p.meta?.rank_math_focus_keyword || '';
          const h1Count = pageBreakdown.details.headings.filter((h: any) => h.tag === 'h1').length;
          const imgCount = pageBreakdown.details.media.filter((m: any) => m.type === 'image').length;
          const imgNoAlt = pageBreakdown.details.media.filter((m: any) => m.type === 'image' && !m.alt).length;

            // --- Rank Math Style Analysis ---
            const rmIssues: any[] = [];
            const lowercaseContent = text.toLowerCase();
            const lowercaseFocus = focusKeyword.toLowerCase();
            
            // Basic SEO
            const kwInTitle = seoTitle.toLowerCase().includes(lowercaseFocus);
            const kwInMeta = metaDesc.toLowerCase().includes(lowercaseFocus);
            const kwInSlug = p.slug.toLowerCase().includes(lowercaseFocus.replace(/\s+/g, '-'));
            const kwInFirst10 = lowercaseContent.slice(0, Math.floor(lowercaseContent.length * 0.1)).includes(lowercaseFocus);
            const kwInContent = lowercaseContent.includes(lowercaseFocus);
            
            rmIssues.push({ label: 'Focus Keyword in SEO Title', passed: kwInTitle, type: 'basic' });
            rmIssues.push({ label: 'Focus Keyword in Meta Description', passed: kwInMeta, type: 'basic' });
            rmIssues.push({ label: 'Focus Keyword in URL', passed: kwInSlug, type: 'basic' });
            rmIssues.push({ label: 'Focus Keyword in first 10% of content', passed: kwInFirst10, type: 'basic' });
            rmIssues.push({ label: 'Focus Keyword found in content', passed: kwInContent, type: 'basic' });
            rmIssues.push({ label: 'Content length', passed: wordCount >= 600, type: 'basic', info: `${wordCount} words` });
            rmIssues.push({ label: 'Single H1 Header check', passed: h1Count <= 1, type: 'basic', info: `${h1Count} found` });

            // Additional
            const subheadingsText = pageBreakdown.details.headings.map((h: any) => h.text.toLowerCase()).join(' ');
            const kwInSubheading = subheadingsText.includes(lowercaseFocus);
            const kwInImgAlt = pageBreakdown.details.media.some((m: any) => m.type === 'image' && m.alt.toLowerCase().includes(lowercaseFocus));
            const kwCount = (lowercaseContent.match(new RegExp(lowercaseFocus, 'g')) || []).length;
            const density = ((kwCount / (wordCount || 1)) * 100).toFixed(2);
            const hasExternal = pageBreakdown.details.links.some((l: any) => l.type === 'external');
            const hasInternal = pageBreakdown.details.links.some((l: any) => l.type === 'internal');

            rmIssues.push({ label: 'Focus Keyword in subheadings (H2, H3, etc.)', passed: kwInSubheading, type: 'additional' });
            rmIssues.push({ label: 'Focus Keyword in Image Alt attributes', passed: kwInImgAlt, type: 'additional' });
            rmIssues.push({ label: 'Keyword Density', passed: Number(density) >= 0.75 && Number(density) <= 2.5, type: 'additional', info: `${density}%` });
            rmIssues.push({ label: 'URL length', passed: p.link.length <= 75, type: 'additional', info: `${p.link.length} chars` });
            rmIssues.push({ label: 'External links found', passed: hasExternal, type: 'additional' });
            rmIssues.push({ label: 'Internal links found', passed: hasInternal, type: 'additional' });

            const rmScore = Math.round((rmIssues.filter(i => i.passed).length / rmIssues.length) * 100);

            return {
              id: p.id,
              title: p.title.rendered,
              link: p.link,
              slug: p.slug,
              status: p.status,
              seoTitle,
              metaDesc,
              focusKeyword,
              h1Count,
              wordCount,
              imgCount,
              score: rmScore, 
              issues: [
                ...(seoTitle.length < 45 || seoTitle.length > 65 ? [`Title ${seoTitle.length} chars (needs 50-60)`] : []),
                ...(!seoTitle.toLowerCase().includes('uae') && !seoTitle.toLowerCase().includes('sharjah') ? ['Missing location keyword'] : []),
                ...(h1Count !== 1 ? [`H1 count = ${h1Count} (must be 1)`] : [])
              ],
              rmIssues,
              meta: p.meta,
              rawContent: p.content.rendered,
              pageBreakdown,
              trend: (p.id % 2 === 0) ? 'up' : 'down' 
            };
        });
        setPages(enriched);
        if (selectedPageRef.current) {
          const updated = enriched.find((page: any) => page.id === (selectedPageRef.current as any).id);
          if (updated) setSelectedPage(updated);
        }
      }
    } catch (error) {
      console.error('Failed to fetch pages', error);
    } finally {
      fetchPagesInFlight.current = false;
    }
  };

  const hasAnyContactDetails = Boolean(
    newPageWorkflowForm.contactEmail.trim() ||
    newPageWorkflowForm.contacts.some(c => c.mobile.trim()) ||
    newPageWorkflowForm.contactLinks.trim()
  );

  const canSaveNewWorkflow = Boolean(
    newPageWorkflowForm.goal.trim() &&
    newPageWorkflowForm.cause.trim() &&
    newPageWorkflowForm.targetAudience.trim() &&
    hasAnyContactDetails
  );

  const resetNewPageWorkflow = () => {
    setNewPageWorkflowForm(defaultNewPageWorkflowForm);
    setWorkflowSavedPage(null);
    setWorkflowSteps(createInitialWorkflowSteps());
    setWorkflowRecommendations([]);
    setWorkflowCompetitors([]);
    setWorkflowSelectedKeyword('');
    setWorkflowDraft(null);
    setWorkflowSeoPackage(null);
    setWorkflowUploadImages([]);
    setWorkflowBusy(false);
    setWorkflowError('');
    setWorkflowAskToStart(false);
    setWorkflowAutoMode(false);
  };

  const fetchIntegrationStatus = async () => {
    try {
      const res = await fetch('/api/integrations/status');
      const data: any = await readJsonSafe(res, 'Integrations Status API');
      if (!res.ok) throw new Error(data?.error || `Integrations status failed (${res.status})`);
      setIntegrationStatus({
        geminiConfigured: Boolean(data?.geminiConfigured),
        serperConfigured: Boolean(data?.serperConfigured),
        geminiModel: String(data?.geminiModel || 'auto-fallback')
      });
    } catch (e) {
      setIntegrationStatus({ geminiConfigured: false, serperConfigured: false, geminiModel: 'auto-fallback' });
    }
  };

  const onWorkflowImagesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const nextImages: WorkflowUploadImage[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      const reader = new FileReader();
      const base64Result = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Failed to read image file'));
        reader.readAsDataURL(file);
      });
      const base64Data = base64Result.split(',')[1] || '';
      nextImages.push({
        fileName: file.name,
        mimeType: file.type,
        base64Data,
        previewUrl: base64Result
      });
    }

    if (nextImages.length === 0) return;
    setWorkflowUploadImages((prev) => [...prev, ...nextImages]);
  };

  const onWorkflowBgImageSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = (e.target?.result as string).split(',')[1];
      setNewPageWorkflowForm(prev => ({
        ...prev,
        bgImage: {
          fileName: file.name,
          mimeType: file.type,
          base64Data,
          previewUrl: URL.createObjectURL(file)
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const updateWorkflowStep = (stepId: WorkflowStep['id'], status: WorkflowStatus, logMessage?: string) => {
    setWorkflowSteps((prev) => {
      const next = prev.map((step) => {
        if (step.id !== stepId) return step;
        return {
          ...step,
          status,
          logs: logMessage ? [...step.logs, logMessage] : step.logs
        };
      });
      if (workflowSavedPage) saveWorkflowSnapshot(workflowSavedPage.id, { steps: next });
      return next;
    });
  };

  const saveNewPageWorkflow = async () => {
    if (!canSaveNewWorkflow || creatingPage) return;
    setCreatingPage(true);
    setWorkflowError('');

    try {
      const res = await fetch('/api/wordpress/create-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: newPageWorkflowForm.goal,
          title: `New: ${newPageWorkflowForm.goal.slice(0, 30)}...`
        })
      });
      const newPageData: any = await readJsonSafe(res, 'Create Page API');
      if (!res.ok) {
        throw new Error(newPageData?.error || `Create page failed (${res.status})`);
      }

      const workflowSnapshot = {
        cause: newPageWorkflowForm.cause,
        targetAudience: newPageWorkflowForm.targetAudience,
        contactEmail: newPageWorkflowForm.contactEmail,
        contacts: newPageWorkflowForm.contacts,
        contactLinks: newPageWorkflowForm.contactLinks,
        socialLinks: newPageWorkflowForm.socialLinks,
        googleMapAddress: newPageWorkflowForm.googleMapAddress,
        ownerFocusKeyword: newPageWorkflowForm.ownerFocusKeyword,
        appCode: newPageWorkflowForm.appCode,
        bgColor: newPageWorkflowForm.bgColor,
        bgImage: newPageWorkflowForm.bgImage,
        headingFont: newPageWorkflowForm.headingFont,
        headingSize: newPageWorkflowForm.headingSize,
        paragraphFont: newPageWorkflowForm.paragraphFont,
        paragraphSize: newPageWorkflowForm.paragraphSize,
        pageType: newPageWorkflowForm.pageType,
        blogTopics: newPageWorkflowForm.blogTopics
      };

      let uploadedBgImageUrl = '';
      if (newPageWorkflowForm.bgImage) {
        const bgRes = await fetch('/api/wordpress/upload-media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: newPageWorkflowForm.bgImage.fileName,
            mimeType: newPageWorkflowForm.bgImage.mimeType,
            base64Data: newPageWorkflowForm.bgImage.base64Data,
            altText: `Background: ${newPageWorkflowForm.goal}`
          })
        });
        const bgData: any = await readJsonSafe(bgRes, 'Upload BG Media API');
        if (bgRes.ok) {
          uploadedBgImageUrl = bgData?.sourceUrl || '';
          workflowSnapshot.bgImage = { ...newPageWorkflowForm.bgImage, sourceUrl: uploadedBgImageUrl };
        }
      }

      const uploadedImages: WorkflowUploadImage[] = [];
      for (const image of workflowUploadImages) {
        if (image.sourceUrl) {
          uploadedImages.push(image);
          continue;
        }

        const uploadRes = await fetch('/api/wordpress/upload-media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: image.fileName,
            mimeType: image.mimeType,
            base64Data: image.base64Data,
            altText: newPageWorkflowForm.goal,
            optimize: newPageWorkflowForm.optimizeImages
          })
        });
        const uploadData: any = await readJsonSafe(uploadRes, 'Upload Media API');
        if (!uploadRes.ok) {
          throw new Error(uploadData?.error || `Image upload failed (${uploadRes.status})`);
        }

        uploadedImages.push({
          ...image,
          uploadedId: uploadData?.id,
          sourceUrl: uploadData?.sourceUrl
        });
      }
      setWorkflowUploadImages(uploadedImages);

      await fetch('/api/wordpress/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newPageData.id,
          meta: {
            _seo_goal: newPageWorkflowForm.goal,
            _seo_workflow_snapshot: JSON.stringify({ ...workflowSnapshot, uploadedImages: uploadedImages.map((img) => img.sourceUrl).filter(Boolean) })
          }
        })
      });

      const mappedPage = {
        id: newPageData.id,
        title: newPageData.title?.rendered || 'New Page',
        link: newPageData.link,
        slug: newPageData.slug,
        status: newPageData.status,
        seoTitle: '',
        metaDesc: '',
        focusKeyword: '',
        h1Count: 0,
        wordCount: 0,
        imgCount: 0,
        score: 0,
        issues: ['New page - workflow in progress'],
        rmIssues: [],
        meta: { _seo_goal: newPageWorkflowForm.goal },
        rawContent: '',
        pageBreakdown: {
          summary: { htmlBlocks: 0, media: 0, headings: 0, links: 0, lists: 0, tables: 0, interactive: 0 },
          details: { htmlBlocks: [], media: [], headings: [], links: [], lists: [], tables: [], interactive: [] }
        },
        trend: 'up'
      };

      setWorkflowSavedPage(mappedPage);
      setPageGoal(newPageWorkflowForm.goal);
      setWorkflowAskToStart(true);
      await fetchPages();
    } catch (err: any) {
      setWorkflowError(err?.message || 'Failed to save workflow details.');
    } finally {
      setCreatingPage(false);
    }
  };

  const runWorkflowStep1 = async () => {
    setWorkflowBusy(true);
    setWorkflowError('');
    setWorkflowAskToStart(false);
    updateWorkflowStep('step1', 'running', 'Starting competitor and trend keyword discovery.');

    try {
      const res = await fetch('/api/seo/workflow/recommend-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: newPageWorkflowForm.goal,
          cause: newPageWorkflowForm.cause,
          targetAudience: newPageWorkflowForm.targetAudience,
          ownerFocusKeyword: newPageWorkflowForm.ownerFocusKeyword,
          ownerKeywordChecked: newPageWorkflowForm.ownerKeywordChecked,
          allowUnvalidatedOwnerKeyword: newPageWorkflowForm.allowUnvalidatedOwnerKeyword
        })
      });
      const data: any = await readJsonSafe(res, 'Workflow Keyword Recommendation API');
      if (!res.ok) {
        throw new Error(data?.error || `Keyword recommendation failed (${res.status})`);
      }

      const recommendations = Array.isArray(data?.recommendations) ? data.recommendations : [];
      setWorkflowRecommendations(recommendations);
      setWorkflowCompetitors(Array.isArray(data?.competitors) ? data.competitors : []);

      const ownerDecisionAllows = Boolean(data?.ownerKeywordDecision?.useOwnerKeyword);
      if (ownerDecisionAllows && newPageWorkflowForm.ownerFocusKeyword.trim()) {
        setWorkflowSelectedKeyword(newPageWorkflowForm.ownerFocusKeyword.trim());
      } else if (recommendations[0]?.keyword) {
        setWorkflowSelectedKeyword(recommendations[0].keyword);
      }

      updateWorkflowStep('step1', 'waiting', 'Keyword recommendations ready. Select and confirm one keyword.');
      if (workflowSavedPage) saveWorkflowSnapshot(workflowSavedPage.id, { 
        recommendations, 
        competitors: Array.isArray(data?.competitors) ? data.competitors : [] 
      });

      // Auto-Progress Logic
      if (workflowAutoMode && (ownerDecisionAllows && newPageWorkflowForm.ownerFocusKeyword.trim() || recommendations[0]?.keyword)) {
        const kw = (ownerDecisionAllows && newPageWorkflowForm.ownerFocusKeyword.trim()) 
          ? newPageWorkflowForm.ownerFocusKeyword.trim() 
          : recommendations[0].keyword;
        
        setTimeout(() => {
          updateWorkflowStep('step1', 'done', `Auto-confirmed keyword: ${kw}`);
          runWorkflowStep2(kw);
        }, 500);
      }
    } catch (err: any) {
      updateWorkflowStep('step1', 'failed', err?.message || 'Step 1 failed.');
      setWorkflowError(err?.message || 'Step 1 failed.');
    } finally {
      setWorkflowBusy(false);
    }
  };

  const runWorkflowStep2 = async (passedKeyword?: string) => {
    const targetKeyword = passedKeyword || workflowSelectedKeyword;
    if (!workflowSavedPage || !targetKeyword.trim()) {
      setWorkflowError('Select a keyword before starting Step 2.');
      return;
    }

    if (passedKeyword) setWorkflowSelectedKeyword(passedKeyword);

    setWorkflowBusy(true);
    setWorkflowError('');
    updateWorkflowStep('step2', 'running', `Building full page draft for "${targetKeyword}".`);

    try {
      const res = await fetch('/api/seo/workflow/compose-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: newPageWorkflowForm.goal,
          cause: newPageWorkflowForm.cause,
          targetAudience: newPageWorkflowForm.targetAudience,
          contactEmail: newPageWorkflowForm.contactEmail,
          contacts: newPageWorkflowForm.contacts,
          contactLinks: newPageWorkflowForm.contactLinks,
          socialLinks: newPageWorkflowForm.socialLinks,
          googleMapAddress: newPageWorkflowForm.googleMapAddress,
          ownerFocusKeyword: newPageWorkflowForm.ownerFocusKeyword,
          appCode: newPageWorkflowForm.appCode,
          bgColor: newPageWorkflowForm.bgColor,
          bgImageUrl: newPageWorkflowForm.bgImage?.sourceUrl || '',
          headingFont: newPageWorkflowForm.headingFont,
          headingSize: newPageWorkflowForm.headingSize,
          paragraphFont: newPageWorkflowForm.paragraphFont,
          paragraphSize: newPageWorkflowForm.paragraphSize,
          blogTopics: newPageWorkflowForm.blogTopics,
          selectedKeyword: targetKeyword,
          headingAlignment: newPageWorkflowForm.headingAlignment,
          paragraphAsBlockquote: newPageWorkflowForm.paragraphAsBlockquote,
          uploadedImages: workflowUploadImages.map((img) => ({
            sourceUrl: img.sourceUrl,
            fileName: img.fileName,
            mimeType: img.mimeType
          }))
        })
      });
      const data: any = await readJsonSafe(res, 'Workflow Compose Page API');
      if (!res.ok) {
        throw new Error(data?.error || `Compose page failed (${res.status})`);
      }

      setWorkflowDraft(data);

      await fetch('/api/wordpress/update-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: workflowSavedPage.id, content: data.htmlContent || '' })
      });

      await fetch('/api/wordpress/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: workflowSavedPage.id,
          newTitle: data.pageTitle,
          newMeta: data.metaDescription,
          newSlug: data.slug,
          newH1: data.h1,
          newFocusKeyword: workflowSelectedKeyword,
          currentContent: data.htmlContent || ''
        })
      });

      updateWorkflowStep('step2', 'waiting', 'Draft is ready. Preview live page and add remarks before final SEO packaging.');
      if (workflowSavedPage) saveWorkflowSnapshot(workflowSavedPage.id, { draft: data });
      await fetchPages();

      // Auto-Progress Logic
      if (workflowAutoMode) {
        setTimeout(() => {
          runWorkflowStep3();
        }, 500);
      }
    } catch (err: any) {
      updateWorkflowStep('step2', 'failed', err?.message || 'Step 2 failed.');
      setWorkflowError(err?.message || 'Step 2 failed.');
    } finally {
      setWorkflowBusy(false);
    }
  };

  const runWorkflowStep3 = async () => {
    if (!workflowSavedPage || !workflowSelectedKeyword.trim()) {
      setWorkflowError('Step 3 requires saved page and selected keyword.');
      return;
    }

    setWorkflowBusy(true);
    setWorkflowError('');
    updateWorkflowStep('step2', 'done', 'Owner review completed and moved to final SEO packaging.');
    updateWorkflowStep('step3', 'running', 'Generating final SEO package.');

    try {
      const res = await fetch('/api/seo/workflow/finalize-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: newPageWorkflowForm.goal,
          cause: newPageWorkflowForm.cause,
          targetAudience: newPageWorkflowForm.targetAudience,
          selectedKeyword: workflowSelectedKeyword,
          pageHtml: workflowDraft?.htmlContent || '',
          remarks: newPageWorkflowForm.remarks
        })
      });
      const data: any = await readJsonSafe(res, 'Workflow Final SEO API');
      if (!res.ok) {
        throw new Error(data?.error || `Finalize SEO failed (${res.status})`);
      }

      setWorkflowSeoPackage(data);

      await fetch('/api/wordpress/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: workflowSavedPage.id,
          newTitle: data.seoTitle,
          newMeta: data.metaDescription,
          newSlug: data.permalink,
          newH1: data.h1 || workflowSelectedKeyword,
          newFocusKeyword: workflowSelectedKeyword,
          currentContent: workflowDraft?.htmlContent || '',
          status: workflowAutoMode ? 'publish' : undefined
        })
      });

      // Optional: Add to Menu if requested
      if (newPageWorkflowForm.addToMenu) {
        updateWorkflowStep('step3', 'running', 'Adding page to WordPress menu...');
        const menuRes = await fetch('/api/wordpress/add-to-menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pageId: workflowSavedPage.id, title: data.seoTitle || workflowSavedPage.title })
        });
        if (!menuRes.ok) {
           const menuData = await menuRes.json();
           updateWorkflowStep('step3', 'running', `Warning: Menu addition failed (${menuData.error}). Proceeding...`);
        } else {
           updateWorkflowStep('step3', 'running', 'Successfully added to WordPress menu.');
        }
      }

      updateWorkflowStep('step3', 'done', 'Final SEO package pushed to WordPress. Workflow complete.');
      await fetchPages();
    } catch (err: any) {
      updateWorkflowStep('step3', 'failed', err?.message || 'Step 3 failed.');
      setWorkflowError(err?.message || 'Step 3 failed.');
    } finally {
      setWorkflowBusy(false);
    }
  };

  const handleResolveIssue = async (label: string, userProvidedInfo?: string) => {
    if (!selectedPage) return;
    setPushStatus({ type: 'loading', message: `AI Agent is resolving "${label}"...` });
    setNeededInfoRequest(null);
    setHumanHelpInput('');
    setResolutionInfo({ issue: label, found: '', action: '', status: 'resolving' });

    try {
      const res = await fetch('/api/seo/resolve-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: (selectedPage as any).id,
          issueLabel: label,
          currentContent: (selectedPage as any).rawContent || '',
          currentTitle: (selectedPage as any).title,
          currentMeta: (selectedPage as any).metaDescription || (selectedPage as any).metaDesc || '',
          focusKeyword: (selectedPage as any).focusKeyword,
          userProvidedInfo
        })
      });
      const data = await res.json();

      if (data.needInfo) {
        setNeededInfoRequest({ label, info: data.needInfo });
        setPushStatus({ type: 'idle', message: 'I need some information from you to proceed.' });
        setResolutionInfo(null);
        return;
      }

      if (data.resolved) {
        setResolutionInfo({
          issue: label,
          found: data.issueFound || 'Identified optimization opportunity in content structure.',
          action: data.actionTaken || 'Applied best-practice SEO corrections to the page.',
          status: 'done'
        });

        // Apply updates
        const updates = data.updates;
        let newHtml = (selectedPage as any).rawContent;
        if (updates.newContent) newHtml = updates.newContent;

        await fetch('/api/wordpress/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: (selectedPage as any).id,
            newTitle: updates.newTitle,
            newMeta: updates.newMeta,
            newSlug: updates.newSlug,
            currentContent: newHtml
          })
        });

        setPushStatus({ type: 'success', message: `Successfully resolved: ${label}. ${data.explanation}` });
        await fetchPages();
      }
    } catch (err: any) {
      setPushStatus({ type: 'error', message: `Resolution failed: ${err.message}` });
      setResolutionInfo(null);
    }
  };

  const handleAddMore = async () => {
    console.log('handleAddMore clicked', addMoreForm);
    if (!selectedPage) return;
    setPushStatus({ type: 'loading', message: `AI Agent is adding ${addMoreForm.type}...` });
    setAddMoreForm(prev => ({ ...prev, isLoading: true }));
    try {
      const res = await fetch('/api/seo/add-more', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: (selectedPage as any).id,
          currentContent: (selectedPage as any).rawContent,
          ...addMoreForm
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      if (data.newContentSnippet) {
        setAddMorePreview(data.newContentSnippet);
        setPushStatus({ type: 'success', message: 'AI has generated a suggestion! Please review it below.' });
        setAddMoreForm(prev => ({ ...prev, isLoading: false }));
      }
    } catch (e: any) {
      setPushStatus({ type: 'error', message: e.message || 'Failed to add more.' });
      setAddMoreForm(prev => ({ ...prev, isLoading: false }));
    }
  };

  const fetchGscStats = async () => {
    setLoadingGsc(true);
    try {
      const res = await fetch('/api/gsc/performance');
      const data = await res.json();
      setGscStats(data);
    } catch (e) {
      console.error('Fetch GSC failed', e);
    } finally {
      setLoadingGsc(false);
    }
  };

  useEffect(() => {
    if (view === 'gsc') fetchGscStats();
  }, [view, currentSiteId]);

  const handleApplyAddMore = () => {
    if (!selectedPage || !addMorePreview) return;
    
    let newContent = (selectedPage as any).rawContent;
    if (addMoreForm.type === 'content') {
      newContent += "\n\n" + addMorePreview;
    } else {
      // For images, the backend already prepared the full content if we wanted, 
      // but let's make the backend return just the snippet for consistency
      // Wait, if backend returns snippet, I need to know where to insert it.
      // I'll update the backend to return BOTH the snippet and the full content.
    }
    
    // Actually, let's keep it simple: the backend returns the snippet. 
    // If it's an image, I need to insert it after the heading.
    
    if (addMoreForm.type === 'image' && addMoreForm.targetHeading) {
       const heading = addMoreForm.targetHeading;
       if (newContent.includes(heading)) {
          const parts = newContent.split(heading);
          const firstPart = parts[0] + heading;
          const secondPart = parts.slice(1).join(heading);
          const closeMatch = secondPart.match(/^[^>]*>/);
          if (closeMatch) {
            const index = closeMatch[0].length;
            newContent = firstPart + secondPart.slice(0, index) + "\n" + addMorePreview + "\n" + secondPart.slice(index);
          } else {
            newContent = firstPart + "\n" + addMorePreview + "\n" + secondPart;
          }
       } else {
          newContent += "\n\n" + addMorePreview;
       }
    } else if (addMoreForm.type === 'content') {
       newContent += "\n\n" + addMorePreview;
    }

    setSelectedPage({ ...selectedPage, rawContent: newContent });
    setAddMorePreview(null);
    setShowAddMoreModal(false);
    setAddMoreForm({ type: 'content', description: '', targetHeading: '', imageUrl: '', isLoading: false });
    setPushStatus({ type: 'success', message: 'Content successfully added to your page! Remember to Save to WordPress.' });
  };

  const handleOptimizeImage = async (url: string) => {
    setOptimizingImage(url);
    try {
      const res = await fetch('/api/wordpress/optimize-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: url, targetSizeKB: 90 })
      });
      const data = await res.json();
      if (data.success) {
        // Replace URL in content
        let newHtml = (selectedPage as any).rawContent.replaceAll(url, data.newUrl);
        await fetch('/api/wordpress/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: (selectedPage as any).id,
            currentContent: newHtml
          })
        });
        setPushStatus({ type: 'success', message: `Image Optimized! ${data.originalSizeKB}KB -> ${data.sizeKB}KB (WebP)` });
        await fetchPages();
      } else {
        throw new Error(data.error || 'Optimization failed');
      }
    } catch (err: any) {
      alert(`Optimization failed: ${err.message}`);
    } finally {
      setOptimizingImage(null);
    }
  };

  useEffect(() => {
    // Fetch GSC Stats (Step 17)
    const fetchGSC = async () => {
      try {
        const res = await fetch('/api/seo/gsc-data');
        const data: any = await readJsonSafe(res, 'GSC API');
        if (!res.ok) throw new Error(data?.error || `GSC API failed (${res.status})`);
        setGscStats({ clicks: (data.clicks || 0) * 10, impressions: (data.impressions || 0) * 10 });
      } catch (error) {
        console.error('Failed to fetch GSC data', error);
      }
    };

    fetchSites();
    fetchIntegrationStatus();
    fetchGSC();
    fetchPages();
    const interval = setInterval(fetchPages, 60000);
    return () => clearInterval(interval);
  }, [currentSiteId]);
  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center font-bold text-lg">S</div>
            <span className="font-semibold tracking-tight text-xl">SEO Agent v2</span>
          </div>
          <div className="mt-4">
            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">Active Property</div>
            <select 
              value={currentSiteId || ''} 
              onChange={(e) => selectSite(e.target.value)}
              className="w-full bg-slate-800 text-[11px] border border-slate-700 rounded-lg p-2 outline-none focus:border-indigo-500 transition-all cursor-pointer"
            >
              {sites.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <button 
              onClick={() => setShowAddSiteModal(true)}
              className="mt-2 text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 transition"
            >
              <span>+</span> Manage Websites
            </button>
          </div>
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
          <div className={`p-2 rounded flex items-center gap-3 cursor-pointer ${view === 'history' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`} onClick={() => setView('history')}>
            <div className="w-5 h-5 flex items-center justify-center opacity-70 italic">H</div>
            <span className="text-sm font-medium">Workflow History</span>
          </div>
          <div className={`p-2 rounded flex items-center gap-3 cursor-pointer ${view === 'drafts' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`} onClick={() => setView('drafts')}>
            <div className="w-5 h-5 flex items-center justify-center opacity-70 italic">D</div>
            <span className="text-sm font-medium">Draft Pages</span>
          </div>
          <div className={`p-2 rounded flex items-center gap-3 cursor-pointer ${view === 'gsc' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`} onClick={() => setView('gsc')}>
            <div className="w-5 h-5 flex items-center justify-center opacity-70 italic">G</div>
            <span className="text-sm font-medium">Search Console</span>
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
                  <div className="text-3xl font-light text-blue-600">{gscStats?.clicks || 0}</div>
                </div>
                <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Total Impressions</div>
                  <div className="text-3xl font-light text-indigo-600">{gscStats?.impressions || 0}</div>
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
                <button className="bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded shadow text-sm font-medium" onClick={() => setView('history')}>
                  View Active Workflows
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

          {view === 'gsc' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Google Search Console</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Live Performance & Indexing Insights</p>
                </div>
                <button 
                  onClick={fetchGscStats}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-200 transition"
                >
                  {loadingGsc ? 'Syncing...' : '🔄 Sync Now'}
                </button>
              </div>

              {!gscStats ? (
                <div className="bg-amber-50 border-2 border-amber-100 p-12 rounded-[40px] text-center">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-xl font-black text-amber-900">Search Console Not Linked</h3>
                  <p className="text-amber-700 text-sm max-w-md mx-auto mt-2">To see live clicks, impressions, and index status, go to <strong>Manage Websites</strong> and add your GSC Property URL and Service Account JSON.</p>
                </div>
              ) : (
                <>
                  {/* GSC Stats Grid */}
                  <div className="grid grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-100/50">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Clicks</div>
                      <div className="text-4xl font-black text-indigo-600">
                        {gscStats.rows?.reduce((acc: number, row: any) => acc + (row.clicks || 0), 0) || 0}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 font-bold">Last 30 Days</div>
                    </div>
                    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-100/50">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Impressions</div>
                      <div className="text-4xl font-black text-emerald-600">
                        {gscStats.rows?.reduce((acc: number, row: any) => acc + (row.impressions || 0), 0) || 0}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 font-bold">Visibility index</div>
                    </div>
                    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-100/50">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Avg CTR</div>
                      <div className="text-4xl font-black text-amber-600">
                        {((gscStats.rows?.reduce((acc: number, row: any) => acc + (row.ctr || 0), 0) / (gscStats.rows?.length || 1)) * 100).toFixed(1)}%
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 font-bold">Click-through rate</div>
                    </div>
                    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-100/50">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Avg Position</div>
                      <div className="text-4xl font-black text-rose-600">
                        {(gscStats.rows?.reduce((acc: number, row: any) => acc + (row.position || 0), 0) / (gscStats.rows?.length || 1)).toFixed(1)}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 font-bold">Search ranking</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Top Queries */}
                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
                      <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50">
                        <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">Top Search Queries</h3>
                      </div>
                      <div className="overflow-auto max-h-[400px]">
                        <table className="w-full text-left">
                          <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky top-0">
                            <tr>
                              <th className="px-8 py-4">Query</th>
                              <th className="px-4 py-4 text-center">Clicks</th>
                              <th className="px-4 py-4 text-center">Impr.</th>
                            </tr>
                          </thead>
                          <tbody className="text-xs font-bold text-slate-600 divide-y divide-slate-50">
                            {gscStats.rows?.slice(0, 20).map((row: any, i: number) => (
                              <tr key={i} className="hover:bg-slate-50 transition">
                                <td className="px-8 py-4 text-indigo-600">{row.keys[0]}</td>
                                <td className="px-4 py-4 text-center">{row.clicks}</td>
                                <td className="px-4 py-4 text-center text-slate-400">{row.impressions}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Top Pages */}
                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
                      <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50">
                        <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">Performance by Page</h3>
                      </div>
                      <div className="overflow-auto max-h-[400px]">
                        <table className="w-full text-left">
                          <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky top-0">
                            <tr>
                              <th className="px-8 py-4">Page URL</th>
                              <th className="px-4 py-4 text-center">Clicks</th>
                              <th className="px-4 py-4 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="text-xs font-bold text-slate-600 divide-y divide-slate-50">
                            {gscStats.rows?.slice(0, 20).map((row: any, i: number) => (
                              <tr key={i} className="hover:bg-slate-50 transition">
                                <td className="px-8 py-4 truncate max-w-[200px]">{row.keys[1].replace(currentSiteId || '', '')}</td>
                                <td className="px-4 py-4 text-center">{row.clicks}</td>
                                <td className="px-4 py-4 text-center">
                                  <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-[10px]">Indexed</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}


          {view === 'history' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-slate-800">Workflow History</h2>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg" onClick={() => { resetNewPageWorkflow(); setShowAddModal(true); }}>+ New Workflow</button>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {pages.filter((p: any) => p.meta?._seo_workflow_snapshot).length === 0 && (
                  <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-slate-300">
                    <div className="text-4xl mb-4">📜</div>
                    <div className="text-slate-500 font-medium">No active or historical workflows found.</div>
                    <button className="mt-4 text-indigo-600 font-bold hover:underline" onClick={() => setShowAddModal(true)}>Start your first one</button>
                  </div>
                )}
                {pages.filter((p: any) => p.meta?._seo_workflow_snapshot).map((p: any) => {
                  const snapshot = JSON.parse(p.meta?._seo_workflow_snapshot || '{}');
                  const lastStep = snapshot.steps?.findLast((s: any) => s.status === 'done' || s.status === 'running' || s.status === 'waiting');
                  const isComplete = snapshot.steps?.every((s: any) => s.status === 'done');
                  
                  return (
                    <div key={p.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-black text-slate-800 truncate">{p.meta?._seo_goal || p.title}</h3>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${isComplete ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {isComplete ? 'Completed' : 'In Progress'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-3">
                          <span>Status: <b className="text-slate-700">{lastStep?.title || 'Initial'}</b></span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span>Page ID: {p.id}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isComplete ? (
                          <button 
                            onClick={() => { setSelectedPage(p); setView('pageList'); }}
                            className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition"
                          >
                            View Analysis
                          </button>
                        ) : (
                          <button 
                            onClick={() => resumeWorkflow(p)}
                            className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition"
                          >
                            Resume Workflow
                          </button>
                        )}
                        <button 
                          onClick={() => deletePage(p.id)}
                          className="px-4 py-2 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl hover:bg-rose-100 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {view === 'drafts' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-slate-800">Draft Pages</h2>
                <div className="text-sm text-slate-500 font-medium">{pages.filter((p: any) => p.status === 'draft').length} Drafts Found</div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {pages.filter((p: any) => p.status === 'draft').length === 0 && (
                  <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-slate-300">
                    <div className="text-4xl mb-4">📄</div>
                    <div className="text-slate-500 font-medium">No draft pages found on this site.</div>
                  </div>
                )}
                {pages.filter((p: any) => p.status === 'draft').map((p: any) => (
                  <div key={p.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-slate-800 truncate mb-1">{p.title}</h3>
                      <div className="text-xs text-slate-500 flex items-center gap-3">
                        <span className="truncate max-w-[300px]">{p.link}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span>Score: <b className={p.score > 70 ? 'text-green-600' : 'text-amber-600'}>{p.score}</b></span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {p.meta?._seo_workflow_snapshot ? (
                        <button 
                          onClick={() => resumeWorkflow(p)}
                          className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition"
                        >
                          Resume Workflow
                        </button>
                      ) : (
                        <button 
                          onClick={() => { setSelectedPage(p); setView('pageList'); }}
                          className="px-4 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl hover:bg-indigo-100 transition"
                        >
                          Continue SEO
                        </button>
                      )}
                      <button 
                        onClick={() => deletePage(p.id)}
                        className="px-4 py-2 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl hover:bg-rose-100 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === 'pageList' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col grow">
              <div className="p-4 border-b border-slate-100 bg-slate-50 rounded-t-xl flex justify-between items-center">
                <h2 className="text-sm font-bold text-slate-700">All Pages (Total: {pages.length}, Published: {pages.filter((p: any) => p.status === 'publish').length})</h2>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      resetNewPageWorkflow();
                      setShowAddModal(true);
                    }}
                    className="w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center font-bold shadow-md hover:bg-green-600 transition"
                    title="Add New Page"
                  >
                    +
                  </button>
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
              </div>

              {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 p-4 md:p-6 overflow-auto">
                  <div className="w-full max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-300 overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center text-2xl">✨</div>
                          <div>
                            <h3 className="text-2xl font-black text-slate-900">Add New Page: Guided SEO Workflow</h3>
                            <p className="text-sm text-slate-600">Capture full strategy inputs, then run Step 1/2/3 in one progress watcher.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setShowAddModal(false);
                            resetNewPageWorkflow();
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-white/80 border border-slate-200"
                        >
                          Close
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-0">
                      <div className="p-6 md:p-8 border-r border-slate-100 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Type of Page</label>
                            <div className="flex gap-4">
                              <button
                                onClick={() => setNewPageWorkflowForm({ ...newPageWorkflowForm, pageType: 'normal' })}
                                className={`flex-1 p-4 rounded-2xl border-2 transition flex flex-col items-center gap-2 ${newPageWorkflowForm.pageType === 'normal' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                              >
                                <span className="text-2xl">📄</span>
                                <span className="text-xs font-black uppercase tracking-wider text-slate-700">Normal Page</span>
                                <span className="text-[9px] text-slate-500 font-bold">Standard SEO Landing Page</span>
                              </button>
                              <button
                                onClick={() => setNewPageWorkflowForm({ ...newPageWorkflowForm, pageType: 'blog' })}
                                className={`flex-1 p-4 rounded-2xl border-2 transition flex flex-col items-center gap-2 ${newPageWorkflowForm.pageType === 'blog' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                              >
                                <span className="text-2xl">✍️</span>
                                <span className="text-xs font-black uppercase tracking-wider text-slate-700">Blog / Article</span>
                                <span className="text-[9px] text-slate-500 font-bold">Informational & News Content</span>
                              </button>
                            </div>
                          </div>

                          {newPageWorkflowForm.pageType === 'blog' && (
                            <div className="md:col-span-2 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-4">
                              <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Blog Topics</label>
                                <button
                                  onClick={() => setNewPageWorkflowForm({ ...newPageWorkflowForm, blogTopics: [...newPageWorkflowForm.blogTopics, ''] })}
                                  className="text-[10px] bg-indigo-600 text-white px-2 py-1 rounded-lg font-black hover:bg-indigo-700 transition"
                                >
                                  + ADD MORE TOPICS
                                </button>
                              </div>
                              <div className="space-y-2">
                                {newPageWorkflowForm.blogTopics.map((topic, idx) => (
                                  <div key={idx} className="flex gap-2">
                                    <input
                                      type="text"
                                      className="flex-1 p-3 rounded-xl border-2 border-white bg-white text-xs focus:border-indigo-400 outline-none transition shadow-sm"
                                      placeholder={idx === 0 ? "First Blog Topic (Required)" : `Topic #${idx + 1}`}
                                      value={topic}
                                      onChange={(e) => {
                                        const next = [...newPageWorkflowForm.blogTopics];
                                        next[idx] = e.target.value;
                                        setNewPageWorkflowForm({ ...newPageWorkflowForm, blogTopics: next });
                                      }}
                                    />
                                    {newPageWorkflowForm.blogTopics.length > 1 && (
                                      <button
                                        onClick={() => {
                                          const next = newPageWorkflowForm.blogTopics.filter((_, i) => i !== idx);
                                          setNewPageWorkflowForm({ ...newPageWorkflowForm, blogTopics: next });
                                        }}
                                        className="w-10 h-10 flex items-center justify-center text-indigo-400 hover:text-rose-500 transition font-bold"
                                      >
                                        ×
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Goal of this page (required)</label>
                            <textarea
                              className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-sm focus:border-emerald-400 focus:bg-white outline-none transition min-h-[110px] resize-none"
                              placeholder="What is the strategic goal of this page?"
                              value={newPageWorkflowForm.goal}
                              onChange={(e) => setNewPageWorkflowForm({ ...newPageWorkflowForm, goal: e.target.value })}
                              autoFocus
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Cause of making this page (required)</label>
                            <textarea
                              className="w-full p-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-xs focus:border-emerald-400 focus:bg-white outline-none transition min-h-[88px] resize-none"
                              placeholder="Why this page is needed now"
                              value={newPageWorkflowForm.cause}
                              onChange={(e) => setNewPageWorkflowForm({ ...newPageWorkflowForm, cause: e.target.value })}
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Target audience (required)</label>
                            <textarea
                              className="w-full p-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-xs focus:border-emerald-400 focus:bg-white outline-none transition min-h-[88px] resize-none"
                              placeholder="Who should land and convert on this page"
                              value={newPageWorkflowForm.targetAudience}
                              onChange={(e) => setNewPageWorkflowForm({ ...newPageWorkflowForm, targetAudience: e.target.value })}
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Contact Email</label>
                            <input
                              type="text"
                              className="w-full p-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-xs focus:border-emerald-400 focus:bg-white outline-none transition"
                              placeholder="sales@example.com"
                              value={newPageWorkflowForm.contactEmail}
                              onChange={(e) => setNewPageWorkflowForm({ ...newPageWorkflowForm, contactEmail: e.target.value })}
                            />
                          </div>

                          <div className="md:col-span-2">
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Contact Persons & Mobile Numbers</label>
                              <button 
                                onClick={() => setNewPageWorkflowForm({
                                  ...newPageWorkflowForm,
                                  contacts: [...newPageWorkflowForm.contacts, { name: '', position: '', mobile: '' }]
                                })}
                                className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg font-black hover:bg-emerald-200 transition flex items-center gap-1"
                              >
                                <span className="text-sm">+</span> ADD CONTACT
                              </button>
                            </div>
                            <div className="space-y-3">
                              {newPageWorkflowForm.contacts.map((c, idx) => (
                                <div key={idx} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1.5fr_auto] gap-2 p-3 bg-white border border-slate-200 rounded-xl items-center">
                                  <input
                                    type="text"
                                    className="p-2 rounded-lg border border-slate-100 bg-slate-50 text-[11px] focus:border-emerald-400 outline-none transition"
                                    placeholder="Name"
                                    value={c.name}
                                    onChange={(e) => {
                                      const next = [...newPageWorkflowForm.contacts];
                                      next[idx].name = e.target.value;
                                      setNewPageWorkflowForm({ ...newPageWorkflowForm, contacts: next });
                                    }}
                                  />
                                  <input
                                    type="text"
                                    className="p-2 rounded-lg border border-slate-100 bg-slate-50 text-[11px] focus:border-emerald-400 outline-none transition"
                                    placeholder="Position (e.g. Purchaser)"
                                    value={c.position}
                                    onChange={(e) => {
                                      const next = [...newPageWorkflowForm.contacts];
                                      next[idx].position = e.target.value;
                                      setNewPageWorkflowForm({ ...newPageWorkflowForm, contacts: next });
                                    }}
                                  />
                                  <input
                                    type="text"
                                    className="p-2 rounded-lg border border-slate-100 bg-slate-50 text-[11px] focus:border-emerald-400 outline-none transition"
                                    placeholder="Mobile Number"
                                    value={c.mobile}
                                    onChange={(e) => {
                                      const next = [...newPageWorkflowForm.contacts];
                                      next[idx].mobile = e.target.value;
                                      setNewPageWorkflowForm({ ...newPageWorkflowForm, contacts: next });
                                    }}
                                  />
                                  {newPageWorkflowForm.contacts.length > 1 && (
                                    <button 
                                      onClick={() => {
                                        const next = newPageWorkflowForm.contacts.filter((_, i) => i !== idx);
                                        setNewPageWorkflowForm({ ...newPageWorkflowForm, contacts: next });
                                      }}
                                      className="w-6 h-6 flex items-center justify-center text-rose-500 hover:bg-rose-50 rounded-full transition font-bold"
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Contact links (email/whatsapp/tel URLs)</label>
                            <input
                              type="text"
                              className="w-full p-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-xs focus:border-emerald-400 focus:bg-white outline-none transition"
                              placeholder="mailto:..., https://wa.me/..."
                              value={newPageWorkflowForm.contactLinks}
                              onChange={(e) => setNewPageWorkflowForm({ ...newPageWorkflowForm, contactLinks: e.target.value })}
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Social media links (Facebook, Instagram, Snapchat, etc.)</label>
                            <textarea
                              className="w-full p-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-xs focus:border-emerald-400 focus:bg-white outline-none transition min-h-[80px] resize-none"
                              placeholder="One per line or comma separated"
                              value={newPageWorkflowForm.socialLinks}
                              onChange={(e) => setNewPageWorkflowForm({ ...newPageWorkflowForm, socialLinks: e.target.value })}
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Google Map Address (optional)</label>
                            <input
                              type="text"
                              className="w-full p-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-xs focus:border-emerald-400 focus:bg-white outline-none transition"
                              placeholder="Paste Google map address or map link"
                              value={newPageWorkflowForm.googleMapAddress}
                              onChange={(e) => setNewPageWorkflowForm({ ...newPageWorkflowForm, googleMapAddress: e.target.value })}
                            />
                          </div>

                          <div className="md:col-span-2 border border-slate-200 rounded-2xl p-4 bg-slate-50">
                            <div className="flex items-center justify-between gap-3 mb-3">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Upload Images (saved to WordPress media)</label>
                              <label className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white border border-emerald-600 text-xs font-black cursor-pointer hover:bg-emerald-600 shadow-md flex items-center gap-2 transition active:scale-95">
                                <span className="text-lg">+</span> UPLOAD IMAGES
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  className="hidden"
                                  onChange={(e) => onWorkflowImagesSelected(e.target.files)}
                                />
                              </label>
                            </div>
                            
                            <div className="flex items-center gap-2 mb-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                              <button 
                                onClick={() => setNewPageWorkflowForm({ ...newPageWorkflowForm, optimizeImages: !newPageWorkflowForm.optimizeImages })}
                                className={`w-10 h-5 rounded-full relative transition-colors ${newPageWorkflowForm.optimizeImages ? 'bg-emerald-500' : 'bg-slate-300'}`}
                              >
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${newPageWorkflowForm.optimizeImages ? 'left-6' : 'left-1'}`} />
                              </button>
                              <div>
                                <div className="text-[10px] font-black text-emerald-900 uppercase">Auto-Optimize Images (WebP + 80KB)</div>
                                <p className="text-[9px] text-emerald-700 font-medium">Faster loading, better SEO ranking, premium quality.</p>
                              </div>
                            </div>
                            {workflowUploadImages.length === 0 && (
                              <div className="text-[11px] text-slate-500">No images selected yet. Uploaded images will be reused while building the page draft.</div>
                            )}
                            {workflowUploadImages.length > 0 && (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {workflowUploadImages.map((img, idx) => (
                                  <div key={`${img.fileName}-${idx}`} className="bg-white border border-slate-200 rounded-xl p-2">
                                    <img src={img.previewUrl} alt={img.fileName} className="w-full h-20 object-cover rounded" />
                                    <div className="mt-1 text-[10px] text-slate-600 truncate" title={img.fileName}>{img.fileName}</div>
                                    <div className={`text-[10px] font-bold mt-1 ${img.sourceUrl ? 'text-emerald-600' : 'text-amber-600'}`}>
                                      {img.sourceUrl ? 'Saved' : 'Pending Save'}
                                    </div>
                                    <button
                                      className="mt-1 text-[10px] text-rose-600 font-bold"
                                      onClick={() => setWorkflowUploadImages((prev) => prev.filter((_, i) => i !== idx))}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Any App Code (Integrate existing code)</label>
                            <textarea
                              className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-900 text-emerald-400 text-xs font-mono focus:border-emerald-400 outline-none transition min-h-[120px] resize-none shadow-inner"
                              placeholder="Paste your React/HTML/JS code here... AI will integrate it into the page beautifully without breaking."
                              value={newPageWorkflowForm.appCode}
                              onChange={(e) => setNewPageWorkflowForm({ ...newPageWorkflowForm, appCode: e.target.value })}
                            />
                            <div className="mt-1 text-[9px] text-slate-400 font-bold italic flex items-center gap-1">
                              <span className="text-emerald-500 font-black">💡</span>
                              Agent will adjust space and layout to accommodate this code perfectly.
                            </div>
                          </div>

                          <div className="md:col-span-2 p-5 bg-indigo-50 border-2 border-indigo-100 rounded-3xl">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-xl shadow-lg">🔗</div>
                                <div>
                                  <h4 className="text-sm font-black text-indigo-900 uppercase tracking-tight">Navigation & Visibility</h4>
                                  <p className="text-[10px] text-indigo-700 font-bold">Automatically add this page to your main website menu?</p>
                                </div>
                              </div>
                              <div className="flex bg-white p-1 rounded-xl border border-indigo-100 shadow-sm">
                                <button 
                                  onClick={() => setNewPageWorkflowForm({ ...newPageWorkflowForm, addToMenu: true })}
                                  className={`px-6 py-2 rounded-lg text-xs font-black transition ${newPageWorkflowForm.addToMenu ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                  YES
                                </button>
                                <button 
                                  onClick={() => setNewPageWorkflowForm({ ...newPageWorkflowForm, addToMenu: false })}
                                  className={`px-6 py-2 rounded-lg text-xs font-black transition ${!newPageWorkflowForm.addToMenu ? 'bg-slate-200 text-slate-700 shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                  NO
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="md:col-span-2 border-2 border-slate-100 rounded-3xl p-6 bg-white shadow-sm">
                            <div className="flex items-center gap-2 mb-6">
                              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm">🎨</div>
                              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Page Design & Typography (Optional)</h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Background Options */}
                              <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div>
                                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Background Color</label>
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="color"
                                      className="w-10 h-10 rounded-lg cursor-pointer border-none p-0 bg-transparent"
                                      value={newPageWorkflowForm.bgColor || '#ffffff'}
                                      onChange={(e) => setNewPageWorkflowForm({ ...newPageWorkflowForm, bgColor: e.target.value })}
                                    />
                                    <input
                                      type="text"
                                      className="flex-1 p-2 rounded-lg border border-slate-200 text-xs font-mono uppercase"
                                      value={newPageWorkflowForm.bgColor}
                                      placeholder="#FFFFFF"
                                      onChange={(e) => setNewPageWorkflowForm({ ...newPageWorkflowForm, bgColor: e.target.value })}
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Background Image</label>
                                  <div className="space-y-3">
                                    <label className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-white transition group">
                                      <span className="text-xl group-hover:scale-110 transition">🖼️</span>
                                      <span className="text-[11px] font-bold text-slate-600">Select BG Image</span>
                                      <input type="file" className="hidden" accept="image/*" onChange={(e) => onWorkflowBgImageSelected(e.target.files)} />
                                    </label>
                                    {newPageWorkflowForm.bgImage && (
                                      <div className="relative group rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                                        <img src={newPageWorkflowForm.bgImage.previewUrl} className="w-full h-24 object-cover" alt="BG Preview" />
                                        <button 
                                          onClick={() => setNewPageWorkflowForm({ ...newPageWorkflowForm, bgImage: null })}
                                          className="absolute top-1 right-1 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md opacity-0 group-hover:opacity-100 transition"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Typography Options */}
                              <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="col-span-2">
                                    <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2 block">Headings Typography</label>
                                    <select 
                                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:border-indigo-500 outline-none transition bg-white shadow-sm"
                                      value={newPageWorkflowForm.headingFont}
                                      onChange={(e) => setNewPageWorkflowForm({ ...newPageWorkflowForm, headingFont: e.target.value })}
                                    >
                                      <option value="">Default AI Selection</option>
                                      <optgroup label="Luxury & Royal">
                                        <option value="'Playfair Display', serif">Playfair Display (Luxury)</option>
                                        <option value="'Cinzel', serif">Cinzel (Royal)</option>
                                        <option value="'Bodoni Moda', serif">Bodoni Moda (Elegant)</option>
                                      </optgroup>
                                      <optgroup label="Italian & Classic">
                                        <option value="'Marcellus', serif">Marcellus (Italian)</option>
                                        <option value="'Cormorant Garamond', serif">Cormorant (Classic)</option>
                                        <option value="'Montserrat', sans-serif">Montserrat (Modern Italian)</option>
                                      </optgroup>
                                      <optgroup label="Simple & Business">
                                        <option value="'Inter', sans-serif">Inter (Clean)</option>
                                        <option value="'Roboto', sans-serif">Roboto (Standard)</option>
                                        <option value="'Lato', sans-serif">Lato (Professional)</option>
                                      </optgroup>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-400 mb-1 block">H1 Size</label>
                                    <select 
                                      className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white"
                                      value={newPageWorkflowForm.headingSize}
                                      onChange={(e) => setNewPageWorkflowForm({ ...newPageWorkflowForm, headingSize: e.target.value })}
                                    >
                                      <option value="">Default</option>
                                      <option value="2.5rem">Small (40px)</option>
                                      <option value="3rem">Medium (48px)</option>
                                      <option value="4rem">Large (64px)</option>
                                      <option value="5rem">Hero (80px)</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200">
                                  <div className="col-span-2">
                                    <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 block">Paragraph Typography</label>
                                    <select 
                                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:border-emerald-500 outline-none transition bg-white shadow-sm"
                                      value={newPageWorkflowForm.paragraphFont}
                                      onChange={(e) => setNewPageWorkflowForm({ ...newPageWorkflowForm, paragraphFont: e.target.value })}
                                    >
                                      <option value="">Default AI Selection</option>
                                      <optgroup label="Modern Sans">
                                        <option value="'Outfit', sans-serif">Outfit (Modern)</option>
                                        <option value="'Plus Jakarta Sans', sans-serif">Jakarta (Fresh)</option>
                                      </optgroup>
                                      <optgroup label="Readable & Clean">
                                        <option value="'Inter', sans-serif">Inter (Standard)</option>
                                        <option value="'Poppins', sans-serif">Poppins (Smooth)</option>
                                      </optgroup>
                                      <optgroup label="Luxury Serif">
                                        <option value="'Lora', serif">Lora (Elegant)</option>
                                        <option value="'Crimson Pro', serif">Crimson (Classic)</option>
                                      </optgroup>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-400 mb-1 block">Text Size</label>
                                    <select 
                                      className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white"
                                      value={newPageWorkflowForm.paragraphSize}
                                      onChange={(e) => setNewPageWorkflowForm({ ...newPageWorkflowForm, paragraphSize: e.target.value })}
                                    >
                                      <option value="">Default</option>
                                      <option value="14px">Small (14px)</option>
                                      <option value="16px">Normal (16px)</option>
                                      <option value="18px">Comfort (18px)</option>
                                      <option value="20px">Large (20px)</option>
                                    </select>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200">
                                  <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block">Heading Alignment</label>
                                    <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                                      {['left', 'center', 'right'].map((align) => (
                                        <button
                                          key={align}
                                          onClick={() => setNewPageWorkflowForm({ ...newPageWorkflowForm, headingAlignment: align as any })}
                                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${newPageWorkflowForm.headingAlignment === align ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
                                        >
                                          {align}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block">Quote Style Paragraphs</label>
                                    <button
                                      onClick={() => setNewPageWorkflowForm({ ...newPageWorkflowForm, paragraphAsBlockquote: !newPageWorkflowForm.paragraphAsBlockquote })}
                                      className={`w-full py-2 rounded-xl border-2 transition-all flex items-center justify-center gap-2 font-black uppercase text-[10px] ${newPageWorkflowForm.paragraphAsBlockquote ? 'bg-emerald-600 text-white border-emerald-700 shadow-lg shadow-emerald-100' : 'bg-white text-slate-400 border-slate-100 hover:border-emerald-200 hover:text-emerald-600'}`}
                                    >
                                      {newPageWorkflowForm.paragraphAsBlockquote ? '✅ AS BLOCKQUOTES' : '❌ STANDARD TEXT'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px] text-indigo-700 font-bold italic flex items-center gap-2">
                              <span>⭐</span> AI Agent will incorporate these visual preferences into the design automatically.
                            </div>
                          </div>

                          <div className="md:col-span-2 border border-amber-200 bg-amber-50 rounded-2xl p-4">
                            <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-2 block">Owner recommended focus keyword</label>
                            <input
                              type="text"
                              className="w-full p-3 rounded-xl border-2 border-amber-100 bg-white text-xs focus:border-amber-400 outline-none transition"
                              placeholder="Optional owner-picked keyword"
                              value={newPageWorkflowForm.ownerFocusKeyword}
                              onChange={(e) => setNewPageWorkflowForm({ ...newPageWorkflowForm, ownerFocusKeyword: e.target.value })}
                            />

                            {newPageWorkflowForm.ownerFocusKeyword.trim() && (
                              <div className="mt-3 space-y-3">
                                <div className="text-[11px] font-bold text-amber-800">Did you check competitor keywords with Serper for this goal?</div>
                                <div className="flex gap-2">
                                  <button
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${newPageWorkflowForm.ownerKeywordChecked === 'yes' ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-white text-slate-600 border-slate-200'}`}
                                    onClick={() => setNewPageWorkflowForm({ ...newPageWorkflowForm, ownerKeywordChecked: 'yes' })}
                                  >
                                    Yes
                                  </button>
                                  <button
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${newPageWorkflowForm.ownerKeywordChecked === 'no' ? 'bg-rose-600 text-white border-rose-700' : 'bg-white text-slate-600 border-slate-200'}`}
                                    onClick={() => setNewPageWorkflowForm({ ...newPageWorkflowForm, ownerKeywordChecked: 'no' })}
                                  >
                                    No
                                  </button>
                                </div>

                                {newPageWorkflowForm.ownerKeywordChecked === 'no' && (
                                  <label className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
                                    <input
                                      type="checkbox"
                                      checked={newPageWorkflowForm.allowUnvalidatedOwnerKeyword}
                                      onChange={(e) => setNewPageWorkflowForm({ ...newPageWorkflowForm, allowUnvalidatedOwnerKeyword: e.target.checked })}
                                    />
                                    Still use owner focus keyword if AI quality check is weak
                                  </label>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
                          <div className="text-[11px] text-slate-500 font-semibold">
                            Required: goal, cause, target, one image alt key, at least one contact detail
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setShowAddModal(false);
                                resetNewPageWorkflow();
                              }}
                              className="px-5 py-3 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 border border-slate-200"
                            >
                              Cancel
                            </button>
                            <button
                              disabled={creatingPage || !canSaveNewWorkflow}
                              onClick={saveNewPageWorkflow}
                              className="px-5 py-3 bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition disabled:opacity-50"
                            >
                              {creatingPage ? 'Saving...' : 'Save Details'}
                            </button>
                          </div>
                        </div>

                        {workflowAskToStart && (
                          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <div className="text-xs font-black text-indigo-700 uppercase tracking-wider">Saved successfully</div>
                              <div className="text-sm text-indigo-900 font-semibold">Now start working on it?</div>
                            </div>
                            <div className="flex gap-2">
                               <button
                                 disabled={workflowBusy}
                                 onClick={() => {
                                   setWorkflowAutoMode(true);
                                   runWorkflowStep1();
                                 }}
                                 className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-[10px] font-black hover:bg-emerald-700 shadow-lg shadow-emerald-100 flex items-center gap-2 transition active:scale-95"
                               >
                                 🚀 ALL-IN-ONE AUTO APPROVAL
                               </button>
                               <button
                                 disabled={workflowBusy}
                                 onClick={() => {
                                   setWorkflowAutoMode(false);
                                   runWorkflowStep1();
                                 }}
                                 className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-[10px] font-black hover:bg-indigo-700 shadow-md transition active:scale-95"
                               >
                                 Manual Step-by-Step
                               </button>
                              <button
                                onClick={() => setWorkflowAskToStart(false)}
                                className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-bold"
                              >
                                Not now
                              </button>
                            </div>
                          </div>
                        )}

                        {workflowError && (
                          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">{workflowError}</div>
                        )}
                      </div>

                      <div className="p-6 md:p-8 bg-slate-50/70 space-y-4">
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Progress Watcher</h4>

                        <div className="bg-white rounded-xl border border-slate-200 p-3">
                          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">AI Integration Status</div>
                          <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                            <span className={`px-2 py-1 rounded-full ${integrationStatus.geminiConfigured ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                              Gemini API: {integrationStatus.geminiConfigured ? 'Connected' : 'Missing'}
                            </span>
                            <span className={`px-2 py-1 rounded-full ${integrationStatus.serperConfigured ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                              Serper API: {integrationStatus.serperConfigured ? 'Connected' : 'Missing (fallback mode)'}
                            </span>
                            <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
                              Model: {integrationStatus.geminiModel}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {workflowSteps.map((step) => (
                            <div key={step.id} className="bg-white rounded-xl border border-slate-200 p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="text-xs font-black text-slate-800">{step.title}</div>
                                  <div className="text-[11px] text-slate-500 mt-1">{step.description}</div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                                  step.status === 'done' ? 'bg-emerald-100 text-emerald-700' :
                                  step.status === 'running' ? 'bg-indigo-100 text-indigo-700' :
                                  step.status === 'waiting' ? 'bg-amber-100 text-amber-700' :
                                  step.status === 'failed' ? 'bg-rose-100 text-rose-700' :
                                  'bg-slate-100 text-slate-500'
                                }`}>
                                  {step.status}
                                </span>
                              </div>
                              {step.logs.length > 0 && (
                                <div className="mt-3 text-[11px] text-slate-600 space-y-1">
                                  {step.logs.slice(-3).map((log, idx) => (
                                    <div key={idx}>- {log}</div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {workflowRecommendations.length > 0 && (
                          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                            <div className="text-xs font-black text-slate-700 uppercase tracking-widest">Step 1 Recommendations</div>
                            <div className="max-h-56 overflow-auto pr-1 space-y-2">
                              {workflowRecommendations.map((rec, idx) => (
                                <button
                                  key={`${rec.keyword}-${idx}`}
                                  onClick={() => setWorkflowSelectedKeyword(rec.keyword || '')}
                                  className={`w-full text-left p-3 rounded-lg border text-xs transition ${workflowSelectedKeyword === rec.keyword ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-indigo-300'}`}
                                >
                                  <div className="font-black text-slate-800">{rec.keyword}</div>
                                  <div className="text-slate-600 mt-1">{rec.reason}</div>
                                  <div className="text-[10px] text-slate-500 mt-1">Trend: {rec.trendSignal || '-'} | Impression: {rec.impressionPotential || '-'} | Click: {rec.clickPotential || '-'}</div>
                                </button>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <button
                                disabled={workflowBusy || !workflowSelectedKeyword}
                                onClick={() => {
                                  updateWorkflowStep('step1', 'done', `Keyword confirmed: ${workflowSelectedKeyword}`);
                                  runWorkflowStep2();
                                }}
                                className="flex-1 px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-50"
                              >
                                Confirm Keyword & Run Step 2
                              </button>
                            </div>
                          </div>
                        )}

                        {workflowCompetitors.length > 0 && (
                          <div className="bg-white rounded-xl border border-slate-200 p-4">
                            <div className="text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Top 10 Competitors</div>
                            <div className="max-h-40 overflow-auto pr-1 space-y-1">
                              {workflowCompetitors.map((comp, idx) => (
                                <div key={`${comp.link || 'c'}-${idx}`} className="text-[11px] text-slate-600 border border-slate-100 rounded p-2 bg-slate-50">
                                  <div className="font-bold text-slate-700">{idx + 1}. {comp.title || 'Unknown title'}</div>
                                  <div className="truncate">{comp.link}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {workflowDraft && (
                          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                            <div className="text-xs font-black text-slate-700 uppercase tracking-widest">Step 2 Draft & Preview</div>
                            <div className="text-[11px] text-slate-600">
                              Draft created and pushed. Ask owner to preview live page, then add remarks below and finalize Step 3.
                            </div>
                            <div className="flex gap-2">
                              {workflowSavedPage?.link && (
                                <button
                                  onClick={() => window.open(workflowSavedPage.link, '_blank')}
                                  className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                                >
                                  Open Real Preview
                                </button>
                              )}
                              <button
                                disabled={workflowBusy}
                                onClick={runWorkflowStep3}
                                className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-50"
                              >
                                Run Step 3
                              </button>
                            </div>
                            <textarea
                              className="w-full p-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-xs focus:border-indigo-400 focus:bg-white outline-none transition min-h-[80px] resize-none"
                              placeholder="Remarks after owner preview (optional but recommended)"
                              value={newPageWorkflowForm.remarks}
                              onChange={(e) => setNewPageWorkflowForm({ ...newPageWorkflowForm, remarks: e.target.value })}
                            />
                          </div>
                        )}

                        {workflowSeoPackage && (
                          <div className="bg-white rounded-xl border border-emerald-200 p-4 space-y-2">
                            <div className="text-xs font-black text-emerald-700 uppercase tracking-widest">Workflow Completed</div>
                            <div className="text-[11px] text-slate-700"><b>SEO Title:</b> {workflowSeoPackage.seoTitle}</div>
                            <div className="text-[11px] text-slate-700"><b>Permalink:</b> {workflowSeoPackage.permalink}</div>
                            <div className="text-[11px] text-slate-700"><b>Meta Description:</b> {workflowSeoPackage.metaDescription}</div>
                            <button
                              className="mt-2 px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold"
                              onClick={() => {
                                if (workflowSavedPage) {
                                  setSelectedPage(workflowSavedPage);
                                  setView('pageDetail');
                                }
                                setShowAddModal(false);
                                resetNewPageWorkflow();
                              }}
                            >
                              Open Page Detail
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
                      <tr key={page.id} className="cursor-pointer hover:bg-slate-50" onClick={() => { 
                        setSelectedPage(page); 
                        setDetailCategory('htmlBlocks'); 
                        setPageGoal((page as any).meta?._seo_goal || '');
                        setKeywordSuggestions([]);
                        setView('pageDetail'); 
                      }}>
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
            <>
              <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-2xl font-bold">{(selectedPage as any).title}</h2>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      (selectedPage as any).score >= 80 ? 'bg-green-100 text-green-700' :
                      (selectedPage as any).score >= 60 ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>Score: {(selectedPage as any).score}/100</span>
                    <button
                      onClick={async () => {
                        setPushStatus({ type: 'loading', message: 'Adding to menu...' });
                        try {
                          const res = await fetch('/api/wordpress/add-to-menu', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ pageId: (selectedPage as any).id, title: (selectedPage as any).title })
                          });
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.error || 'Failed to add to menu');
                          setPushStatus({ type: 'success', message: 'Successfully added to main menu!' });
                        } catch (err: any) {
                          setPushStatus({ type: 'error', message: err.message });
                        }
                      }}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black hover:bg-indigo-700 transition"
                    >
                      + ADD TO MENU
                    </button>
                  </div>
                </div>
                <div className="mb-6">
                  <a href={(selectedPage as any).link} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:underline flex items-center gap-1">
                    🔗 {(selectedPage as any).link}
                  </a>
                </div>

                <div className="mb-8 p-6 bg-indigo-50 border-2 border-indigo-100 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-black text-xl shadow-lg">!</div>
                    <h3 className="text-lg font-bold text-indigo-900 tracking-tight">Strategic Optimization Workflow</h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Step 1: Set Goal */}
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 bg-indigo-200 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                          <h4 className="text-sm font-bold text-indigo-800 uppercase tracking-wider">Set the Goal</h4>
                        </div>
                        {(selectedPage as any).meta?._seo_goal && (
                          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            ✓ Saved Goal Active
                          </span>
                        )}
                      </div>
                      
                      {/* Fixed Display for Saved Goal */}
                      {(selectedPage as any).meta?._seo_goal && (
                        <div className="p-3 bg-white/80 border border-indigo-100 rounded-lg text-xs italic text-slate-600 shadow-sm">
                          <span className="font-bold text-indigo-600 not-italic mr-1">Active Goal:</span>
                          "{(selectedPage as any).meta?._seo_goal}"
                        </div>
                      )}

                      <textarea 
                        className="w-full p-4 rounded-xl border-2 border-white bg-white/50 text-sm focus:border-indigo-400 focus:bg-white outline-none transition shadow-inner min-h-[80px]"
                        placeholder={(selectedPage as any).meta?._seo_goal ? "Update your goal here..." : "e.g., Sell PET scrap to buyers in Sharjah Industrial Area..."}
                        value={pageGoal}
                        onChange={(e) => setPageGoal(e.target.value)}
                      />
                      <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-indigo-700 transition self-end flex items-center gap-2"
                        onClick={async () => {
                          setPushStatus({ type: 'loading', message: 'Saving Goal...' });
                          await fetch('/api/wordpress/update', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: (selectedPage as any).id, meta: { _seo_goal: pageGoal } })
                          });
                          setPushStatus({ type: 'success', message: 'Goal saved successfully!' });
                          fetchPages(); // Refresh to update (selectedPage).meta
                          setTimeout(() => setPushStatus({ type: 'idle', message: '' }), 2000);
                        }}>
                        {pushStatus.type === 'loading' ? '⏳ Saving...' : '💾 Save Goal'}
                      </button>
                    </div>

                    {/* Step 2: Set Focus Keyword */}
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-indigo-200 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                        <h4 className="text-sm font-bold text-indigo-800 uppercase tracking-wider">Set Focus Keyword</h4>
                      </div>
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          className="flex-1 p-3 rounded-xl border-2 border-white bg-white/50 text-sm focus:border-indigo-400 focus:bg-white outline-none transition shadow-inner"
                          placeholder="Enter Focus Keyword..."
                          value={(selectedPage as any).focusKeyword}
                          onChange={(e) => setSelectedPage({ ...selectedPage, focusKeyword: e.target.value })}
                        />
                        <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-indigo-700 transition"
                          onClick={async () => {
                            await fetch('/api/wordpress/update', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: (selectedPage as any).id, focusKeyword: (selectedPage as any).focusKeyword })
                            });
                            alert('Focus Keyword saved!');
                            fetchPages();
                          }}>
                          Save
                        </button>
                      </div>
                      
                      <button className="text-[10px] font-bold text-indigo-600 bg-indigo-100 hover:bg-indigo-200 py-2 px-3 rounded-lg border border-indigo-200 transition flex items-center justify-center gap-2"
                        disabled={loadingSuggestions}
                        onClick={async () => {
                          setLoadingSuggestions(true);
                          try {
                            // 1. Analyze competitors based on goal
                            let searchKeyword = pageGoal || (selectedPage as any).title || '';
                            if (searchKeyword && !searchKeyword.toLowerCase().includes('uae')) {
                              searchKeyword += ' UAE Sharjah';
                            }

                            const serpRes = await fetch('/api/serp/analyze', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ keyword: searchKeyword })
                            });
                            const serpData = await serpRes.json();
                            if (serpData.results) {
                              setCompetitorData(serpData.results.slice(0, 20)); // Top 20 competitors
                            }
                            
                            // 2. Get AI Keyword Suggestions from Backend
                            const aiRes = await fetch('/api/seo/suggest-keywords', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ goal: pageGoal || (selectedPage as any).title, serpData })
                            });
                            
                            if (!aiRes.ok) {
                              let errorMessage = `API Error: ${aiRes.status}`;
                              try {
                                const errorData = await aiRes.json();
                                if (errorData?.error) errorMessage = `${errorMessage} - ${errorData.error}`;
                              } catch {
                                // Keep the default message if response body is not JSON.
                              }
                              throw new Error(errorMessage);
                            }
                            
                            const aiData = await aiRes.json();
                            if (aiData.keywords) {
                              setKeywordSuggestions(aiData.keywords);
                              // Merge keywords into competitorData
                              if (aiData.competitorKeywords) {
                                setCompetitorData(prev => prev.map((c, idx) => ({ 
                                  ...c, 
                                  focusKeyword: aiData.competitorKeywords[idx] || 'Unknown' 
                                })));
                              }
                            } else {
                              throw new Error(aiData.error || 'Failed to get suggestions');
                            }
                          } catch (e) {
                            console.error(e);
                          } finally {
                            setLoadingSuggestions(false);
                          }
                        }}>
                        {loadingSuggestions ? '🔍 Analyzing Top 20 Websites...' : '🌍 Search Websites & Suggest Focus Keywords'}
                      </button>

                      {keywordSuggestions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {keywordSuggestions.map((kw, i) => (
                            <button key={i} className="text-[10px] bg-white border border-indigo-200 px-2 py-1 rounded-full hover:bg-indigo-600 hover:text-white transition shadow-sm"
                              onClick={() => setSelectedPage({ ...selectedPage, focusKeyword: kw })}>
                              + {kw}
                            </button>
                          ))}
                        </div>
                      )}

                      {competitorData.length > 0 && (
                        <div className="mt-4 p-4 bg-white/50 border border-indigo-100 rounded-xl">
                          <h5 className="text-[10px] font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
                            Top Competitor Websites Found:
                          </h5>
                          <div className="space-y-2 max-h-[400px] overflow-auto pr-2 custom-scrollbar">
                            {competitorData.map((comp, i) => (
                              <div key={i} className="flex items-center gap-4 p-3 bg-white rounded-lg border border-slate-100 shadow-sm hover:border-indigo-300 transition group">
                                <div className="w-6 h-6 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">{i+1}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-[11px] font-bold text-slate-700 truncate">{comp.title}</div>
                                  <a href={comp.link} target="_blank" rel="noreferrer" className="text-[9px] text-indigo-500 truncate hover:underline block">
                                    {comp.link}
                                  </a>
                                </div>
                                <div className="w-40 shrink-0">
                                  <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100 truncate text-center" title="Detected Focus Keyword">
                                    {comp.focusKeyword || 'Analyzing...'}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Blog Management Section */}
                {(() => {
                  let snapshot: any = null;
                  try {
                    const metaVal = (selectedPage as any).meta?._seo_workflow_snapshot;
                    if (metaVal) snapshot = JSON.parse(metaVal);
                  } catch(e) {}
                  
                  if (snapshot?.pageType === 'blog') {
                    return (
                      <div className="mb-8 p-6 bg-emerald-50 border-2 border-emerald-100 rounded-2xl shadow-sm">
                        <div className="flex items-center justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-black text-xl shadow-lg">✍️</div>
                            <div>
                              <h3 className="text-lg font-bold text-emerald-900 tracking-tight">Blog Management</h3>
                              <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest">Generate more informational content</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => setShowAddBlogModal(true)}
                            className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition active:scale-95 flex items-center gap-2"
                          >
                            <span>+</span> ADD MORE BLOGS
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Array.isArray(snapshot.blogTopics) && snapshot.blogTopics.map((topic: string, i: number) => (
                            <div key={i} className="p-3 bg-white border border-emerald-100 rounded-xl text-[11px] text-slate-700 flex items-center gap-2">
                              <span className="text-emerald-500">📜</span>
                              <span className="font-bold">Topic #{i+1}:</span> {topic}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                  {[
                    { id: 'title', label: 'SEO Title', val: (selectedPage as any).seoTitle },
                    { id: 'meta', label: 'Meta Desc', val: (selectedPage as any).metaDesc },
                    { id: 'focusKeyword', label: 'SEO Key', val: (selectedPage as any).focusKeyword || 'Not Set' },
                    { id: 'slug', label: 'Permalink', val: (selectedPage as any).slug }
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
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-slate-700 capitalize mb-3">Optimize {seoTab}</h3>
                      <div className="space-y-3">
                        {seoTab === 'meta' ? (
                          <textarea 
                            className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl text-xs focus:border-indigo-500 outline-none transition min-h-[100px]"
                            value={seoSuggestion[seoTab as keyof typeof seoSuggestion]}
                            onChange={(e) => setSeoSuggestion({ ...seoSuggestion, [seoTab]: e.target.value })}
                            placeholder={`Edit ${seoTab}...`}
                          />
                        ) : (
                          <input 
                            type="text"
                            className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl text-xs focus:border-indigo-500 outline-none transition"
                            value={seoSuggestion[seoTab as keyof typeof seoSuggestion]}
                            onChange={(e) => setSeoSuggestion({ ...seoSuggestion, [seoTab]: e.target.value })}
                            placeholder={`Edit ${seoTab}...`}
                          />
                        )}
                      </div>
                    </div>
                    <button className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-md hover:bg-indigo-700"
                      onClick={async () => {
                        setLoadingAI(true);
                        try {
                          const res = await fetch('/api/gemini-audit', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ page: selectedPage, focus: seoTab })
                          });
                          const data: any = await readJsonSafe(res, 'Gemini Audit API');
                          if (!res.ok) throw new Error(data?.details || data?.error || `Gemini audit failed (${res.status})`);

                          setSeoSuggestion({ 
                            title: data.newTitle || seoSuggestion.title,
                            meta: data.newMeta || seoSuggestion.meta,
                            h1: data.newH1 || seoSuggestion.h1,
                            slug: data.newSlug || seoSuggestion.slug,
                            focusKeyword: data.newFocusKeyword || seoSuggestion.focusKeyword,
                            benefitAnalysis: data.benefitAnalysis || ''
                          });
                        } catch (e: any) {
                          console.error('AI Suggestion failed', e);
                          alert(`AI Thinking Failed: ${e.message}`);
                        } finally {
                          setLoadingAI(false);
                        }
                      }}>
                      {loadingAI ? '🪄 Thinking...' : '✨ Get AI Suggestion'}
                    </button>
                  </div>

                  {seoSuggestion.benefitAnalysis && (
                    <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl animate-in fade-in slide-in-from-top-2 duration-500">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-indigo-600">📈</span>
                        <h4 className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Deep Strategy Analysis</h4>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed italic">
                        "{seoSuggestion.benefitAnalysis}"
                      </p>
                    </div>
                  )}

                  <div className="mt-6 flex gap-3">
                      <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-xs font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition flex-1"
                        disabled={pushStatus.type === 'loading'}
                        onClick={async () => {
                          const payload: any = { id: (selectedPage as any).id };
                          if (seoTab === 'title') payload.newTitle = seoSuggestion.title;
                          if (seoTab === 'meta') payload.newMeta = seoSuggestion.meta;
                          if (seoTab === 'h1') payload.newH1 = seoSuggestion.h1;
                          if (seoTab === 'slug') payload.newSlug = seoSuggestion.slug;
                          if (seoTab === 'focusKeyword') payload.newFocusKeyword = seoSuggestion.focusKeyword;
                          
                          if (!payload.newTitle && !payload.newMeta && !payload.newH1 && !payload.newSlug && !payload.newFocusKeyword) {
                            setPushStatus({ type: 'error', message: 'No changes to push. Get an AI suggestion first.' });
                            setTimeout(() => setPushStatus({ type: 'idle', message: '' }), 4000);
                            return;
                          }

                          setPushStatus({ type: 'loading', message: `Pushing ${seoTab} to WordPress...` });
                          try {
                            const res = await fetch('/api/wordpress/update', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ ...payload, currentContent: (selectedPage as any).rawContent })
                            });
                            const data: any = await readJsonSafe(res, 'WordPress Update API');
                            console.log('WordPress update response:', { status: res.status, ok: res.ok, data });
                            
                            if (!res.ok || data?.error) {
                              const errorMsg = data?.error || data?.message || `API error (${res.status})`;
                              setPushStatus({ type: 'error', message: `Failed: ${errorMsg}` });
                              console.error('WordPress push failed:', errorMsg, data);
                              setTimeout(() => setPushStatus({ type: 'idle', message: '' }), 6000);
                            } else if (!data?.success) {
                              const msg = data?.message || 'Update failed with unknown error';
                              setPushStatus({ type: 'error', message: `Failed: ${msg}` });
                              console.error('WordPress push incomplete:', msg, data);
                              setTimeout(() => setPushStatus({ type: 'idle', message: '' }), 6000);
                            } else {
                              console.log('WordPress push successful:', data.message);
                              setPushStatus({ type: 'success', message: `✓ ${data.message || seoTab + ' updated'}` });
                              setTimeout(async () => {
                                 try {
                                   await fetchPages();
                                 } catch (e) {
                                   console.error('Failed to refresh pages after push:', e);
                                 }
                                 setPushStatus({ type: 'idle', message: '' });
                               }, 1500);
                            }
                          } catch (err: any) {
                            const msg = err?.message || String(err);
                            setPushStatus({ type: 'error', message: `Error: ${msg}` });
                            console.error('WordPress push exception:', err);
                            setTimeout(() => setPushStatus({ type: 'idle', message: '' }), 6000);
                          }
                        }}>
                        🚀 Save & Push to WordPress
                      </button>
                    </div>

                  {neededInfoRequest && (
                    <div className="mt-6 p-6 bg-amber-50 border-2 border-amber-200 rounded-[30px] animate-in slide-in-from-top-4 shadow-xl shadow-amber-100/20">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-amber-200/50 animate-bounce">🙋‍♂️</div>
                        <div>
                          <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">AI Agent Needs Your Help!</h4>
                          <p className="text-[10px] text-amber-700 font-bold uppercase tracking-widest">Resolving: {neededInfoRequest.label}</p>
                        </div>
                      </div>
                      <div className="p-4 bg-white/60 border border-amber-200 rounded-2xl mb-4">
                        <p className="text-xs text-amber-900 font-medium leading-relaxed italic">"{neededInfoRequest.info}"</p>
                      </div>
                      <div className="flex gap-2">
                        <input 
                          className="flex-1 p-4 bg-white border-2 border-amber-100 rounded-2xl text-xs outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all"
                          placeholder="Provide the missing link or information here..."
                          value={humanHelpInput}
                          onChange={e => setHumanHelpInput(e.target.value)}
                        />
                        <button 
                          onClick={() => handleResolveIssue(neededInfoRequest.label, humanHelpInput)}
                          className="bg-amber-600 text-white px-8 py-4 rounded-2xl font-black text-xs shadow-xl shadow-amber-200 hover:bg-amber-700 hover:-translate-y-1 transition-all active:translate-y-0"
                        >
                          SUBMIT TO AGENT
                        </button>
                      </div>
                    </div>
                  )}

                  {pushStatus.message && (
                    <div className={`mt-4 p-4 rounded-xl text-xs font-bold animate-in fade-in slide-in-from-bottom-2 ${
                      pushStatus.type === 'loading' ? 'bg-indigo-50 text-indigo-600' :
                      pushStatus.type === 'success' ? 'bg-green-50 text-green-600' :
                      'bg-red-50 text-red-600'
                    }`}>
                      {pushStatus.message}
                    </div>
                  )}

                  {resolutionInfo && (
                    <div className="mt-8 overflow-hidden rounded-3xl border border-indigo-100 shadow-2xl animate-in zoom-in duration-300">
                      <div className="bg-indigo-600 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${resolutionInfo.status === 'resolving' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></div>
                          <h4 className="text-sm font-black text-white uppercase tracking-widest">
                            {resolutionInfo.status === 'resolving' ? 'AI Agent Resolution in Progress' : 'AI Resolution Successful'}
                          </h4>
                        </div>
                        <button onClick={() => setResolutionInfo(null)} className="text-indigo-200 hover:text-white transition text-2xl leading-none">×</button>
                      </div>
                      <div className="bg-white p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 bg-slate-300 rounded-full"></span>
                            Where is the problem?
                          </div>
                          <div className="text-xs text-slate-700 font-bold leading-relaxed">
                            {resolutionInfo.status === 'resolving' ? (
                              <div className="flex items-center gap-2 text-indigo-500 italic">
                                <span className="animate-spin text-xl">⚙</span> Scanning content structure...
                              </div>
                            ) : (
                              <div className="flex items-start gap-4">
                                <span className="text-2xl">📍</span>
                                <div>{resolutionInfo.found}</div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="p-6 bg-indigo-50/50 rounded-[24px] border border-indigo-100">
                          <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 bg-indigo-300 rounded-full"></span>
                            How is AI Agent solving it?
                          </div>
                          <div className="text-xs text-slate-700 font-bold leading-relaxed">
                            {resolutionInfo.status === 'resolving' ? (
                              <div className="flex items-center gap-2 text-indigo-500 italic">
                                <span className="animate-bounce text-xl">⚡</span> Engineering content fix...
                              </div>
                            ) : (
                              <div className="flex items-start gap-4">
                                <span className="text-2xl">🛠️</span>
                                <div>{resolutionInfo.action}</div>
                              </div>
                            )}
                          </div>
                        </div>
                        {resolutionInfo.status === 'done' && (
                          <div className="md:col-span-2 p-5 bg-emerald-50 text-emerald-700 text-xs font-black uppercase text-center rounded-[24px] border border-emerald-100 shadow-sm flex items-center justify-center gap-4 animate-in bounce-in duration-500">
                            <span className="text-3xl">✅</span>
                            Successfully Optimized: "{resolutionInfo.issue}" has been repaired and pushed to WordPress!
                          </div>
                        )}
                      </div>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <span className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-[10px]">1</span>
                          Rank Math: Basic SEO
                        </h4>
                        <div className="space-y-2">
                          {(selectedPage as any).rmIssues.filter((i:any) => i.type === 'basic').map((issue: any, i: number) => (
                            <div key={i} className={`flex items-center justify-between p-3 rounded-lg border text-xs transition-all ${issue.passed ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700 hover:shadow-md'}`}>
                              <div className="flex items-center gap-2">
                                <span className={`w-4 h-4 rounded-full flex items-center justify-center font-bold ${issue.passed ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                  {issue.passed ? '✓' : '✗'}
                                </span>
                                <span className="font-bold">{issue.label}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                {issue.info && <span className="opacity-60 font-mono text-[10px]">{issue.info}</span>}
                                {!issue.passed && (
                                  <button 
                                    onClick={() => handleResolveIssue(issue.label)}
                                    className="px-2 py-1 bg-white border border-red-200 text-red-600 rounded-lg font-black hover:bg-red-600 hover:text-white transition uppercase text-[9px]"
                                  >
                                    Should I resolve this problem?
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <span className="w-4 h-4 bg-indigo-500 text-white rounded-full flex items-center justify-center text-[10px]">2</span>
                          Rank Math: Additional
                        </h4>
                        <div className="space-y-2">
                          {(selectedPage as any).rmIssues.filter((i:any) => i.type === 'additional').map((issue: any, i: number) => (
                            <div key={i} className={`flex items-center justify-between p-3 rounded-lg border text-xs transition-all ${issue.passed ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700 hover:shadow-md'}`}>
                              <div className="flex items-center gap-2">
                                <span className={`w-4 h-4 rounded-full flex items-center justify-center font-bold ${issue.passed ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                  {issue.passed ? '✓' : '✗'}
                                </span>
                                <span className="font-bold">{issue.label}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                {issue.info && <span className="opacity-60 font-mono text-[10px]">{issue.info}</span>}
                                {!issue.passed && (
                                  <button 
                                    onClick={() => handleResolveIssue(issue.label)}
                                    className="px-2 py-1 bg-white border border-red-200 text-red-600 rounded-lg font-black hover:bg-red-600 hover:text-white transition uppercase text-[9px]"
                                  >
                                    Should I resolve this problem?
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                    <div className="mt-8 border-t pt-8">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">✨</span>
                            Live AI SEO Strategist
                          </h4>
                          <p className="text-[10px] text-slate-400 font-bold mt-1">This agent knows everything about your current page content and SEO progress.</p>
                        </div>
                        <button 
                          onClick={() => setChatMessages([])}
                          className="text-[10px] text-slate-400 hover:text-red-500 font-bold uppercase tracking-widest transition"
                        >
                          Reset Chat
                        </button>
                      </div>

                      <div className="bg-white border-2 border-slate-100 rounded-[32px] overflow-hidden shadow-2xl shadow-slate-200/50 flex flex-col h-[500px]">
                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/50">
                          {chatMessages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8">
                              <div className="w-16 h-16 bg-indigo-50 text-indigo-400 rounded-3xl flex items-center justify-center text-2xl mb-4 animate-bounce">💬</div>
                              <h5 className="text-slate-800 font-black text-sm">Your Personal SEO Agent is Ready</h5>
                              <p className="text-slate-400 text-[10px] max-w-[200px] mt-2 font-bold leading-relaxed">Ask me anything about improving "{(selectedPage as any).title}"</p>
                            </div>
                          )}
                          {chatMessages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                              <div className={`max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed shadow-sm ${
                                msg.role === 'user' 
                                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                                  : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                              }`}>
                                <div className="whitespace-pre-wrap">{msg.text}</div>
                              </div>
                            </div>
                          ))}
                          {loadingChat && (
                            <div className="flex justify-start animate-pulse">
                              <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                                AI Strategist is thinking...
                              </div>
                            </div>
                          )}
                          <div ref={chatEndRef} />
                        </div>

                        {/* Chat Input */}
                        <div className="p-4 bg-white border-t border-slate-100 flex gap-3 items-end">
                          <textarea 
                            className="flex-1 p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl text-xs outline-none transition-all resize-none min-h-[60px] max-h-[120px]"
                            placeholder="Ask for suggestions, content ideas, or technical fixes..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                sendChatMessage();
                              }
                            }}
                          />
                          <button 
                            disabled={loadingChat || !chatInput.trim()}
                            onClick={sendChatMessage}
                            className="bg-indigo-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all hover:-translate-y-0.5 active:translate-y-0"
                          >
                            <span className="text-xl">→</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 border-t pt-6">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Custom Audit Failures</h4>
                      <ul className="grid grid-cols-2 gap-2">
                        {(selectedPage as any).issues.map((issue: string, i: number) => (
                          <li key={i} className="text-[11px] bg-slate-50 text-slate-600 px-3 py-2 rounded-lg border border-slate-100 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
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
                          {Object.entries((selectedPage as any).pageBreakdown?.summary || {}).map(([key, count]) => (
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

                        {/* 🤖 AI Autonomous Visual & Page Editor Agent */}
                        <div className="mt-6 border-2 border-violet-200 rounded-3xl p-6 bg-gradient-to-br from-violet-50/50 via-white to-indigo-50/30 shadow-2xl relative overflow-hidden">
                          {/* Decorative elements */}
                          <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet-200/30 rounded-full blur-3xl pointer-events-none"></div>
                          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none"></div>
                          
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 relative z-10">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="flex h-3 w-3 relative">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-600"></span>
                                </span>
                                <h5 className="text-sm font-black text-violet-900 uppercase tracking-widest flex items-center gap-2">
                                  🤖 AI Autonomous Visual & Page Editor Agent
                                </h5>
                              </div>
                              <p className="text-[10.5px] text-slate-500 font-semibold mt-1">
                                Upload a sample mockup layout/image and give instructions. The agent will visually align, edit, add, or remove elements to rewrite the page content completely.
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase tracking-wider text-violet-600 bg-violet-100/80 px-3 py-1.5 rounded-full border border-violet-200 shadow-sm">
                                🚀 Multimodal Vision Power
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
                            {/* Left Column: Visual Mockup Upload & Form */}
                            <div className="lg:col-span-2 space-y-4">
                              <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">1. Reference Mockup/Sample Image (Optional)</label>
                                <div className="flex items-center gap-4">
                                  {!autonomousImage ? (
                                    <label className="flex-1 h-36 border-2 border-dashed border-violet-200 hover:border-violet-400 rounded-2xl flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-violet-50/50 transition-all duration-300 group shadow-sm">
                                      <div className="flex flex-col items-center gap-2 text-center p-4">
                                        <span className="text-3xl group-hover:scale-110 transition-transform">📸</span>
                                        <span className="text-xs font-bold text-slate-600">Drag & Drop or Click to Upload</span>
                                        <span className="text-[10px] text-slate-400 font-medium">Supports PNG, JPG, WEBP reference layouts</span>
                                      </div>
                                      <input 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*" 
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (!file) return;
                                          const reader = new FileReader();
                                          reader.onload = (re) => {
                                            const base64Data = (re.target?.result as string).split(',')[1];
                                            setAutonomousImage({
                                              fileName: file.name,
                                              mimeType: file.type,
                                              base64Data,
                                              previewUrl: URL.createObjectURL(file)
                                            });
                                          };
                                          reader.readAsDataURL(file);
                                        }}
                                      />
                                    </label>
                                  ) : (
                                    <div className="relative w-full h-36 rounded-2xl overflow-hidden group shadow-md border-2 border-violet-200 bg-white">
                                      <img src={autonomousImage.previewUrl} className="w-full h-full object-cover" />
                                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button 
                                          onClick={() => setAutonomousImage(null)}
                                          className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-3 py-1.5 text-xs font-bold shadow-lg transition-all"
                                        >
                                          🗑️ Remove Image
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">2. Autonomous Editing & Copywriting Instructions</label>
                                <textarea
                                  className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-white text-xs text-slate-800 placeholder-slate-400 focus:border-violet-500 outline-none transition min-h-[110px] resize-none shadow-sm focus:ring-2 focus:ring-violet-100"
                                  placeholder="Describe exactly what to edit, add, or remove. E.g., 'Add a sleek HDPE & PVC B2B scrap price table matching the style and fields in the sample image. Remove the old text-based FAQ block and replace it with a conversion-oriented Sharjah scrap trading benefit list.'"
                                  value={autonomousInstructions}
                                  onChange={(e) => setAutonomousInstructions(e.target.value)}
                                />
                              </div>

                              <button
                                disabled={autonomousRunning}
                                onClick={runAutonomousEditorAgent}
                                className={`w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-black shadow-xl shadow-indigo-100 transition-all active:scale-[0.99] flex items-center justify-center gap-2 ${
                                  autonomousRunning ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              >
                                {autonomousRunning ? (
                                  <>
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    <span>RUNNING AUTONOMOUS VISUAL EDITOR...</span>
                                  </>
                                ) : (
                                  <>
                                    <span>🚀 LAUNCH AI EDITOR AGENT</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Right Column: Execution Console Logs / Agent Progress */}
                            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-inner min-h-[280px]">
                              <div>
                                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                                    <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                                  </div>
                                  <span className="text-[9px] font-mono text-slate-500 font-bold uppercase">agent-console v2.0</span>
                                </div>

                                <div className="space-y-2 max-h-[220px] overflow-y-auto font-mono text-[10.5px] text-emerald-400 custom-scrollbar">
                                  {autonomousLogs.length === 0 ? (
                                    <div className="text-slate-500 italic p-2 text-center select-none">
                                      Console idle. Awaiting instruction launch...
                                    </div>
                                  ) : (
                                    autonomousLogs.map((log, index) => (
                                      <div key={index} className="flex gap-2 items-start leading-relaxed animate-in fade-in duration-200">
                                        <span className="text-slate-600 select-none">&gt;</span>
                                        <span className={log.startsWith('❌') ? 'text-rose-400 font-bold' : log.startsWith('🚀') ? 'text-amber-300 font-black' : ''}>{log}</span>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>

                              {autonomousError && (
                                <div className="mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-900 text-rose-400 font-mono text-[10px] leading-relaxed">
                                  ⚠️ <strong>Agent Alert:</strong> {autonomousError}
                                </div>
                              )}

                              {autonomousResults && (
                                <div className="mt-4 p-3.5 rounded-xl bg-violet-950/50 border border-violet-800 text-[10px] text-violet-200 leading-relaxed font-sans animate-in zoom-in-95 duration-300">
                                  <h6 className="font-black text-violet-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    🎉 Execution Complete!
                                  </h6>
                                  
                                  <div className="space-y-1.5">
                                    <div className="font-semibold text-violet-300">Changes Implemented:</div>
                                    <ul className="list-disc pl-4 space-y-1 text-slate-300">
                                      {autonomousResults.changesMade.map((change, i) => (
                                        <li key={i}>{change}</li>
                                      ))}
                                    </ul>
                                    <div className="mt-2 pt-2 border-t border-violet-800">
                                      <span className="font-semibold text-violet-300">SEO Impact: </span>
                                      <span className="text-slate-300">{autonomousResults.seoImprovement}</span>
                                    </div>
                                    {autonomousResults.imageUrl && (
                                      <div className="mt-2 text-slate-400 italic">
                                        * Sample image successfully added to WP Media Library.
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 border-2 border-indigo-200 rounded-2xl p-6 bg-white shadow-xl animate-fade-in">
                          <div className="flex justify-between items-center mb-4">
                            <div>
                              <h5 className="text-sm font-black text-indigo-800 uppercase tracking-widest">Master Page Editor</h5>
                              <p className="text-[10px] text-slate-400 font-bold">Edit the entire page content as one unified block (Gutenberg Style)</p>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => setShowMasterPreview(!showMasterPreview)}
                                className={`px-3 py-2 rounded-xl text-[10px] font-black border transition flex items-center gap-2 ${
                                  showMasterPreview ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                }`}
                              >
                                {showMasterPreview ? '📄 Edit HTML' : '👁️ Live Preview'}
                              </button>
                              <button 
                                disabled={loadingBlockAI}
                                onClick={async () => {
                                  setLoadingBlockAI(true);
                                  try {
                                    const r = await fetch('/api/seo/convert-to-html', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ 
                                        text: (selectedPage as any).rawContent,
                                        goal: pageGoal,
                                        tag: 'page' 
                                      })
                                    });
                                    const d = await r.json();
                                    if (d.html) {
                                      // Update local and WP
                                      await fetch('/api/wordpress/update-content', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ id: (selectedPage as any).id, content: d.html })
                                      });
                                      alert('AI has optimized the entire page! Reloading...');
                                      window.location.reload();
                                    }
                                  } catch (e) {
                                    alert('Full page optimization failed');
                                  } finally {
                                    setLoadingBlockAI(false);
                                  }
                                }}
                                className="bg-amber-100 text-amber-700 px-3 py-2 rounded-xl text-[10px] font-black border border-amber-200 hover:bg-amber-600 hover:text-white transition flex items-center gap-2"
                              >
                                {loadingBlockAI ? 'Optimizing...' : '✨ AI Full Page Rewrite'}
                              </button>
                              <button 
                                onClick={() => setShowAddMoreModal(true)}
                                className="bg-emerald-100 text-emerald-700 px-3 py-2 rounded-xl text-[10px] font-black border border-emerald-200 hover:bg-emerald-600 hover:text-white transition flex items-center gap-2"
                              >
                                ➕ Add More Content/Images
                              </button>
                            </div>
                          </div>

                          {showMasterPreview ? (
                            <div className="w-full p-8 border-2 border-slate-100 rounded-xl mb-4 bg-white min-h-[500px] overflow-auto shadow-inner">
                              <div className="prose prose-indigo max-w-none prose-sm"
                                dangerouslySetInnerHTML={{ __html: (selectedPage as any).rawContent }}
                              />
                            </div>
                          ) : (
                            <textarea 
                              className="w-full p-4 text-xs font-mono border-2 border-slate-100 rounded-xl mb-4 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all shadow-inner bg-slate-50 min-h-[500px]"
                              value={(selectedPage as any).rawContent}
                              onChange={(e) => setSelectedPage({ ...selectedPage, rawContent: e.target.value })}
                              placeholder="Full page HTML content..."
                            />
                          )}
                          
                          <div className="flex justify-between items-center mt-4">
                            <button 
                              onClick={() => setShowMoreFeatures(!showMoreFeatures)}
                              className="text-[10px] font-black text-indigo-500 hover:text-indigo-700 uppercase tracking-widest flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-lg transition"
                            >
                              {showMoreFeatures ? '🔼 Hide Block Inserter' : '🔽 Show More Features (Block Inserter)'}
                            </button>
                            <button className="bg-indigo-600 text-white px-8 py-3 rounded-xl text-xs font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
                              onClick={async () => {
                                await fetch('/api/wordpress/update-content', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ id: (selectedPage as any).id, content: (selectedPage as any).rawContent })
                                });
                                alert('Full page content updated successfully!');
                                fetchPages();
                              }}>
                              🚀 Save Full Page to WordPress
                            </button>
                          </div>

                          {showMoreFeatures && (
                            <div className="mt-6 p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl animate-in fade-in slide-in-from-top-4">
                              <div className="flex items-center gap-2 mb-4">
                                <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                                <h6 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quick Block Inserter (No HTML Needed)</h6>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                  { label: 'Heading', icon: 'H', tag: '<h2>New SEO Heading</h2>', color: 'indigo' },
                                  { label: 'Paragraph', icon: 'P', tag: '<p>Write your optimized content here...</p>', color: 'blue' },
                                  { label: 'List', icon: 'L', tag: '<ul>\n  <li>List Item 1</li>\n  <li>List Item 2</li>\n</ul>', color: 'emerald' },
                                  { label: 'Table', icon: 'T', tag: '<table border="1" style="width:100%; border-collapse: collapse;">\n  <tr><th style="padding: 10px; border: 1px solid #ddd;">Feature</th><th style="padding: 10px; border: 1px solid #ddd;">Value</th></tr>\n  <tr><td style="padding: 10px; border: 1px solid #ddd;">HDPE Grade</td><td style="padding: 10px; border: 1px solid #ddd;">Premium</td></tr>\n</table>', color: 'amber' },
                                ].map((block) => (
                                  <button 
                                    key={block.label}
                                    onClick={() => {
                                      const newContent = (selectedPage as any).rawContent + '\n' + block.tag;
                                      setSelectedPage({ ...selectedPage, rawContent: newContent });
                                    }}
                                    className="bg-white border-2 border-slate-100 p-4 rounded-2xl hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-50 transition group"
                                  >
                                    <div className={`w-10 h-10 bg-${block.color}-50 text-${block.color}-600 rounded-xl flex items-center justify-center font-black text-lg mb-2 group-hover:scale-110 transition`}>
                                      {block.icon}
                                    </div>
                                    <div className="text-[11px] font-black text-slate-700">{block.label}</div>
                                    <div className="text-[9px] text-slate-400 font-bold uppercase mt-1">Insert Block</div>
                                  </button>
                                ))}
                              </div>
                              <div className="mt-4 p-4 bg-indigo-600/5 rounded-xl border border-indigo-100 flex items-start gap-3">
                                <div className="text-indigo-600 text-lg">💡</div>
                                <div className="text-[10px] text-indigo-700 leading-relaxed font-medium">
                                  <b>SEO Tip:</b> Using <b>Headings (H)</b> and <b>Lists (L)</b> helps Google understand your content structure better. 
                                  Make sure to include your <b>Focus Keyword</b> in at least one new Heading block!
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        </div>
                      </div>
 
                        {/* Audit Details (Read Only) */}
                        <div className="mt-8 pt-6 border-t border-slate-100">
                           <h5 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Detailed Page Audit ({detailCategory})</h5>
                             {((selectedPage as any).pageBreakdown.details[detailCategory] || []).map((item: any, i: number) => (
                               <div key={i} className="group relative p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all">
                                 <div className="flex justify-between items-start mb-3">
                                   <div className="flex items-center gap-2">
                                     <span className="w-6 h-6 bg-indigo-50 text-indigo-400 rounded-lg flex items-center justify-center font-black text-[10px]">#{i+1}</span>
                                     {item.tag && (
                                       <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-[9px] font-black uppercase tracking-tighter">
                                         {item.tag}
                                       </span>
                                     )}
                                   </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                      <button 
                                        onClick={() => {
                                          setStylingBlock({ index: i, item });
                                          // Pre-fill with existing style if possible
                                          setStyleForm({
                                            font: 'Inter',
                                            size: item.tag?.startsWith('h') ? '24px' : '16px',
                                            color: '#1e293b',
                                            bg: 'transparent',
                                            bold: item.tag?.startsWith('h'),
                                            align: 'left',
                                            isBlockquote: item.tag === 'blockquote'
                                          });
                                        }}
                                        className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition shadow-sm"
                                        title="Quick Style Block"
                                      >
                                        🎨
                                      </button>
                                   </div>
                                 </div>
                                 <div className="text-[11px] text-slate-600 leading-relaxed font-medium">
                                   {item.text || item.src || 'Element Detected'}
                                   {detailCategory === 'media' && item.type === 'image' && (
                                     <div className="mt-3">
                                       <button 
                                         onClick={() => handleOptimizeImage(item.src)}
                                         disabled={optimizingImage === item.src}
                                         className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition shadow-xl ${optimizingImage === item.src ? 'bg-slate-100 text-slate-400' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200/50 hover:-translate-y-1'}`}
                                       >
                                         {optimizingImage === item.src ? '⏳ OPTIMIZING...' : '⚡ OPTIMIZE TO WEBP (80KB)'}
                                       </button>
                                     </div>
                                   )}
                                 </div>
                                 {item.words > 0 && (
                                   <div className="mt-2 pt-2 border-t border-slate-50 text-[9px] text-slate-400 font-bold uppercase">
                                     {item.words} Words
                                   </div>
                                 )}
                               </div>
                             ))}
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
                                meta: { rank_math_schema_data: JSON.stringify(schema) } 
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
              </>
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
          {/* Add Site Modal */}
          {showAddSiteModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
                <div className="bg-indigo-600 p-8 text-white shrink-0">
                  <h2 className="text-2xl font-black">Manage Websites</h2>
                  <p className="text-indigo-100 text-sm opacity-80">Test write permissions &amp; connect WordPress properties</p>
                </div>
                <div className="overflow-y-auto flex-1 p-6 space-y-6">

                  {/* Existing Sites List */}
                  {sites.length > 0 && (
                    <div className="space-y-3">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connected Sites</div>
                      {sites.map(s => {
                        const res = siteTestResults[s.id];
                        const loading = siteTestLoading[s.id];
                        const editing = editingSite[s.id];
                        const is401 = res?.restApiStatus === 401 || res?.createDraftStatus === 401;
                        return (
                          <div key={s.id} className="border-2 border-slate-100 rounded-2xl p-4 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="font-bold text-sm text-slate-800">{s.name}</div>
                                <div className="text-[11px] text-slate-400 break-all">{s.url}</div>
                                <div className="text-[11px] text-slate-400">User: {s.user}</div>
                              </div>
                              <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                                <button
                                  disabled={loading}
                                  onClick={async () => {
                                    setSiteTestLoading(p => ({ ...p, [s.id]: true }));
                                    try {
                                      const r = await fetch('/api/wordpress/test-connection', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ siteId: s.id })
                                      });
                                      const d = await r.json();
                                      setSiteTestResults(p => ({ ...p, [s.id]: d }));
                                    } catch (e) {
                                      setSiteTestResults(p => ({ ...p, [s.id]: { restApi: 'unreachable', restApiError: String(e) } }));
                                    } finally {
                                      setSiteTestLoading(p => ({ ...p, [s.id]: false }));
                                    }
                                  }}
                                  className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-[11px] font-black rounded-xl hover:bg-indigo-100 transition disabled:opacity-50"
                                >
                                  {loading ? 'Testing…' : 'Test'}
                                </button>
                                <button
                                  onClick={() => setEditingSite(p => ({
                                    ...p,
                                    [s.id]: p[s.id] ? undefined as any : { user: s.user, pass: '' }
                                  }))}
                                  className="px-3 py-1.5 bg-slate-100 text-slate-600 text-[11px] font-black rounded-xl hover:bg-slate-200 transition"
                                >
                                  {editing ? 'Cancel' : 'Edit'}
                                </button>
                                  <button
                                    onClick={() => deleteSite(s.id)}
                                    className="px-3 py-1.5 bg-red-50 text-red-700 text-[11px] font-black rounded-xl hover:bg-red-100 transition"
                                  >
                                    Delete
                                  </button>
                                  {currentSiteId !== s.id && (
                                    <button
                                      onClick={() => selectSite(s.id)}
                                      className="px-3 py-1.5 bg-green-50 text-green-700 text-[11px] font-black rounded-xl hover:bg-green-100 transition"
                                    >
                                      Activate
                                    </button>
                                  )}
                                  {currentSiteId === s.id && (
                                    <span className="px-3 py-1.5 bg-green-100 text-green-700 text-[11px] font-black rounded-xl text-center flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                      Active
                                    </span>
                                  )}
                              </div>
                            </div>

                            {/* Inline Edit Credentials */}
                            {editing && (
                              <div className="bg-slate-50 rounded-xl p-3 space-y-2">
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Update Credentials</div>
                                <input
                                  type="text"
                                  placeholder="WordPress Username (not email)"
                                  className="w-full p-2.5 text-xs bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-400 outline-none"
                                  value={editing.user}
                                  onChange={e => setEditingSite(p => ({ ...p, [s.id]: { ...p[s.id], user: e.target.value } }))}
                                />
                                <input
                                  type="password"
                                  placeholder="New Application Password (leave blank to keep current)"
                                  className="w-full p-2.5 text-xs bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-400 outline-none"
                                  value={editing.pass}
                                  onChange={e => setEditingSite(p => ({ ...p, [s.id]: { ...p[s.id], pass: e.target.value } }))}
                                />
                                <div className="flex gap-2 pt-1">
                                  <button
                                    onClick={async () => {
                                      await fetch('/api/sites/update', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ id: s.id, user: editing.user, ...(editing.pass ? { pass: editing.pass } : {}) })
                                      });
                                      await fetchSites();
                                      setEditingSite(p => { const n = {...p}; delete n[s.id]; return n; });
                                      setSiteTestResults(p => { const n = {...p}; delete n[s.id]; return n; });
                                    }}
                                    className="px-4 py-2 bg-indigo-600 text-white text-[11px] font-black rounded-xl hover:bg-indigo-700 transition"
                                  >
                                    Save & Re-test
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (!confirm('Delete this site?')) return;
                                      await fetch(`/api/sites/${s.id}`, { method: 'DELETE' });
                                      await fetchSites();
                                    }}
                                    className="px-4 py-2 bg-red-50 text-red-600 text-[11px] font-black rounded-xl hover:bg-red-100 transition"
                                  >
                                    Delete Site
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Test Results */}
                            {res && (
                              <div className="bg-slate-50 rounded-xl p-3 space-y-2 text-[11px]">
                                {is401 && (
                                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-2">
                                    <div className="font-black text-sm">🔐 Authentication Failed (401)</div>
                                    <div className="mt-1 space-y-1 text-red-600">
                                      <div>• Click <strong>Edit</strong> above and correct the username/password</div>
                                      <div>• Username must be the <strong>WordPress login name</strong> — go to WP Admin → Users → your profile → the "Username" field (not your email)</div>
                                      <div>• Application Password: WP Admin → Users → Edit User → scroll to "Application Passwords" → generate a new one and paste it here</div>
                                    </div>
                                  </div>
                                )}
                                {!is401 && (
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className={`flex items-center gap-1.5 font-semibold ${res.restApi === 'ok' ? 'text-green-700' : 'text-red-600'}`}>
                                      <span>{res.restApi === 'ok' ? '✓' : '✗'}</span> REST API
                                    </div>
                                    <div className={`flex items-center gap-1.5 font-semibold ${res.canCreateDraft ? 'text-green-700' : 'text-red-600'}`}>
                                      <span>{res.canCreateDraft ? '✓' : '✗'}</span> Can Create Pages
                                      {!res.canCreateDraft && res.createDraftError && <span className="text-slate-400 font-normal truncate" title={res.createDraftError}> — {res.createDraftError?.slice(0, 35)}</span>}
                                    </div>
                                    <div className={`flex items-center gap-1.5 font-semibold ${res.rankMathTitleExposed ? 'text-green-700' : 'text-amber-600'}`}>
                                      <span>{res.rankMathTitleExposed ? '✓' : '⚠'}</span> Rank Math Title
                                    </div>
                                    <div className={`flex items-center gap-1.5 font-semibold ${res.rankMathDescExposed ? 'text-green-700' : 'text-amber-600'}`}>
                                      <span>{res.rankMathDescExposed ? '✓' : '⚠'}</span> Rank Math Meta Desc
                                    </div>
                                    <div className={`flex items-center gap-1.5 font-semibold ${res.rankMathKeywordExposed ? 'text-green-700' : 'text-amber-600'}`}>
                                      <span>{res.rankMathKeywordExposed ? '✓' : '⚠'}</span> Rank Math Keyword
                                    </div>
                                    <div className={`flex items-center gap-1.5 font-semibold ${res.canWriteMeta ? 'text-green-700' : 'text-amber-600'}`}>
                                      <span>{res.canWriteMeta ? '✓' : '⚠'}</span> Meta Write Works
                                    </div>
                                  </div>
                                )}
                                {!is401 && (!res.rankMathTitleExposed || !res.rankMathDescExposed || !res.rankMathKeywordExposed) && (
                                  <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                                    <div className="text-amber-700 font-bold">⚠ Rank Math fields not exposed via REST API</div>
                                    <div className="text-amber-600 mt-0.5">You need to add a PHP snippet to your WordPress site.</div>
                                    <button
                                      onClick={() => setShowPhpSnippetFor(showPhpSnippetFor === s.id ? null : s.id)}
                                      className="mt-2 px-3 py-1.5 bg-amber-600 text-white font-black rounded-lg hover:bg-amber-700 transition text-[10px]"
                                    >
                                      {showPhpSnippetFor === s.id ? 'Hide Snippet' : 'View PHP Setup Snippet →'}
                                    </button>
                                  </div>
                                )}
                                {!is401 && res.canCreateDraft === false && (
                                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-red-700">
                                    <div className="font-bold">✗ Cannot create pages</div>
                                    <div className="mt-0.5">WordPress user must have <strong>Editor</strong> or <strong>Administrator</strong> role.</div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* PHP Snippet Panel */}
                            {showPhpSnippetFor === s.id && (
                              <div className="bg-slate-900 rounded-xl p-4 text-[10px] font-mono text-green-300 overflow-x-auto">
                                <div className="text-slate-400 mb-2 font-sans font-bold text-[11px]">Add to functions.php OR use "Code Snippets" plugin:</div>
                                <pre className="whitespace-pre-wrap leading-relaxed">{`<?php
add_action( 'rest_api_init', function () {
    $fields = [
        'rank_math_title',
        'rank_math_description',
        'rank_math_focus_keyword',
        'rank_math_robots',
        'rank_math_canonical_url',
        '_seo_goal',
        '_seo_workflow_snapshot',
    ];
    foreach ( $fields as $field ) {
        foreach ( [ 'page', 'post' ] as $post_type ) {
            register_post_meta( $post_type, $field, [
                'show_in_rest'  => true,
                'single'        => true,
                'type'          => 'string',
                'auth_callback' => function () {
                    return current_user_can( 'edit_posts' );
                },
            ] );
        }
    }
} );`}</pre>
                                <div className="mt-3 text-slate-400 font-sans text-[10px]">
                                  <strong className="text-white">Code Snippets plugin:</strong> Snippets → Add New → paste → Run Everywhere → Save &amp; Activate<br/>
                                  <strong className="text-white">functions.php:</strong> Appearance → Theme File Editor → functions.php → paste at bottom → Update File
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add New Site Form */}
                  <div className="border-t-2 border-slate-100 pt-5 space-y-4">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Add New Website</div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Website URL</label>
                      <input 
                        type="text" 
                        placeholder="https://example.com"
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none transition"
                        value={newSiteData.url}
                        onChange={e => setNewSiteData({...newSiteData, url: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">WordPress Username</label>
                      <input 
                        type="text" 
                        placeholder="admin"
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none transition"
                        value={newSiteData.user}
                        onChange={e => setNewSiteData({...newSiteData, user: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Application Password</label>
                      <input 
                        type="password" 
                        placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none transition"
                        value={newSiteData.pass}
                        onChange={e => setNewSiteData({...newSiteData, pass: e.target.value})}
                      />
                      <div className="text-[10px] text-slate-400 mt-1">Generate in WordPress → Users → Profile → Application Passwords</div>
                    </div>

                    <div className="border-t border-slate-100 pt-4 space-y-4">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                        Google Search Console Integration
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">GSC Property URL</label>
                        <input 
                          type="text" 
                          placeholder="https://example.com/"
                          className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none transition"
                          value={newSiteData.gscPropertyUrl || ''}
                          onChange={e => setNewSiteData({...newSiteData, gscPropertyUrl: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Service Account JSON</label>
                        <textarea 
                          placeholder='Paste your Google Service Account JSON here'
                          className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none transition text-[10px] font-mono h-24"
                          value={newSiteData.gscCredentials || ''}
                          onChange={e => setNewSiteData({...newSiteData, gscCredentials: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button 
                        disabled={addingSite || !newSiteData.url || !newSiteData.user || !newSiteData.pass}
                        onClick={async () => {
                          setAddingSite(true);
                          try {
                            const r = await fetch('/api/sites', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(newSiteData)
                            });
                            if (!r.ok) {
                              const errData = await r.json();
                              throw new Error(errData.error || 'Failed to add site');
                            }
                            await fetchSites();
                            setNewSiteData({ url: '', user: '', pass: '', name: '' });
                            setShowAddSiteModal(false);
                          } catch (e: any) {
                            alert(e.message || 'Failed to add site');
                          } finally {
                            setAddingSite(false);
                          }
                        }}
                        className="flex-1 bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition disabled:opacity-40"
                      >
                        {addingSite ? 'Connecting…' : 'Connect Website'}
                      </button>
                      <button 
                        onClick={() => setShowAddSiteModal(false)}
                        className="px-6 py-4 text-slate-400 font-bold hover:text-slate-600 transition"
                      >
                        Close
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Style Modal */}
      {stylingBlock && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-auto">
          <div className="w-full max-w-lg bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 bg-gradient-to-br from-indigo-50 to-white">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <span className="w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-sm shadow-lg shadow-indigo-100">🎨</span>
                    Style Master: {stylingBlock.item.tag?.toUpperCase() || 'BLOCK'} #{stylingBlock.index + 1}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Real-Time Design Customization</p>
                </div>
                <button onClick={() => setStylingBlock(null)} className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all shadow-sm">✕</button>
              </div>

              <div className="space-y-6">
                {/* Font Style */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Premium Font Styles</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'Luxury', family: "'Playfair Display', serif" },
                      { name: 'Italian', family: "'Bodoni Moda', serif" },
                      { name: 'Simple', family: 'Inter, sans-serif' },
                      { name: 'Business', family: 'Montserrat, sans-serif' },
                      { name: 'Modern', family: 'Outfit, sans-serif' },
                      { name: 'Classic', family: "'Libre Baskerville', serif" }
                    ].map(f => (
                      <button 
                        key={f.name}
                        onClick={() => setStyleForm({ ...styleForm, font: f.family })}
                        className={`p-3 rounded-2xl text-left border-2 transition-all ${styleForm.font === f.family ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-50 bg-slate-50/30 hover:border-indigo-200'}`}
                      >
                        <div className="text-xs font-bold text-slate-800" style={{ fontFamily: f.family }}>{f.name} Style</div>
                        <div className="text-[9px] text-slate-400 font-medium">Font Family: {f.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size and Weight */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Font Size</label>
                    <select 
                      value={styleForm.size}
                      onChange={e => setStyleForm({ ...styleForm, size: e.target.value })}
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold focus:border-indigo-500 outline-none transition"
                    >
                      {['12px', '14px', '16px', '18px', '20px', '24px', '32px', '40px', '48px', '64px'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Font Weight</label>
                    <button 
                      onClick={() => setStyleForm({ ...styleForm, bold: !styleForm.bold })}
                      className={`w-full p-4 rounded-2xl text-xs font-black transition-all ${styleForm.bold ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-500 border-2 border-slate-200'}`}
                    >
                      {styleForm.bold ? 'BOLD ENABLED' : 'NORMAL WEIGHT'}
                    </button>
                  </div>
                </div>

                {/* Colors */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Text Color</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color"
                        value={styleForm.color.startsWith('#') ? styleForm.color : '#1e293b'}
                        onChange={e => setStyleForm({ ...styleForm, color: e.target.value })}
                        className="w-12 h-12 p-1 bg-white border-2 border-slate-100 rounded-2xl cursor-pointer"
                      />
                      <input 
                        type="text"
                        value={styleForm.color}
                        onChange={e => setStyleForm({ ...styleForm, color: e.target.value })}
                        className="flex-1 p-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-[10px] font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Background Color</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color"
                        value={styleForm.bg.startsWith('#') ? styleForm.bg : '#ffffff'}
                        onChange={e => setStyleForm({ ...styleForm, bg: e.target.value })}
                        className="w-12 h-12 p-1 bg-white border-2 border-slate-100 rounded-2xl cursor-pointer"
                      />
                      <input 
                        type="text"
                        value={styleForm.bg}
                        onChange={e => setStyleForm({ ...styleForm, bg: e.target.value })}
                        className="flex-1 p-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-[10px] font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Text Alignment</label>
                    <div className="flex bg-slate-50 border-2 border-slate-100 rounded-2xl p-1">
                      {['left', 'center', 'right'].map((a) => (
                        <button
                          key={a}
                          onClick={() => setStyleForm({ ...styleForm, align: a as any })}
                          className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${styleForm.align === a ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white'}`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Formatting</label>
                    <button
                      onClick={() => setStyleForm({ ...styleForm, isBlockquote: !styleForm.isBlockquote })}
                      className={`w-full py-2.5 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 font-black uppercase text-[10px] ${styleForm.isBlockquote ? 'bg-emerald-600 text-white border-emerald-700 shadow-xl shadow-emerald-100' : 'bg-white text-slate-400 border-slate-100 hover:border-emerald-200'}`}
                    >
                      {styleForm.isBlockquote ? '📜 AS BLOCKQUOTE' : '📄 STANDARD TAG'}
                    </button>
                  </div>
                </div>

                {/* Action */}
                <button 
                  onClick={() => {
                    const styleStr = `font-family: ${styleForm.font}; font-size: ${styleForm.size}; color: ${styleForm.color}; background-color: ${styleForm.bg}; font-weight: ${styleForm.bold ? 'bold' : 'normal'}; text-align: ${styleForm.align}; padding: 15px; border-radius: 12px; display: block; line-height: 1.5;`;
                    
                    const parser = new DOMParser();
                    const doc = parser.parseFromString((selectedPage as any).rawContent, 'text/html');
                    const selector = stylingBlock.item.tag || 'p, h1, h2, h3, h4, h5, h6, li';
                    const elements = Array.from(doc.querySelectorAll(selector));
                    
                    const target = elements.find(el => el.textContent?.includes(stylingBlock.item.text?.slice(0, 20) || ''));
                    if (target) {
                      target.setAttribute('style', styleStr);
                      
                      // Tag conversion for blockquote
                      if (styleForm.isBlockquote && target.tagName !== 'BLOCKQUOTE') {
                        const bq = doc.createElement('blockquote');
                        bq.innerHTML = target.innerHTML;
                        bq.setAttribute('style', styleStr);
                        target.replaceWith(bq);
                      } else if (!styleForm.isBlockquote && target.tagName === 'BLOCKQUOTE') {
                        const p = doc.createElement('p');
                        p.innerHTML = target.innerHTML;
                        p.setAttribute('style', styleStr);
                        target.replaceWith(p);
                      }
                      
                      const newHtml = doc.body.innerHTML;
                      setSelectedPage({ ...selectedPage, rawContent: newHtml });
                      setStylingBlock(null);
                      alert('Design updated locally! Remember to click "Save Full Page" to publish.');
                    } else {
                      alert('Could not find the block in the editor. Please use the Master Editor below.');
                    }
                  }}
                  className="w-full bg-slate-900 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-slate-200 hover:bg-indigo-600 hover:-translate-y-1 transition-all active:translate-y-0"
                >
                  Apply Design Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AddMoreModal 
        isOpen={showAddMoreModal} 
        onClose={() => {
          setShowAddMoreModal(false);
          setAddMorePreview(null);
        }}
        form={addMoreForm}
        setForm={setAddMoreForm}
        onAdd={handleAddMore}
        preview={addMorePreview}
        previewTab={addMorePreviewTab}
        setPreviewTab={setAddMorePreviewTab}
        onApply={handleApplyAddMore}
        content={(selectedPage as any)?.rawContent}
      />

      {/* Add More Blog Modal */}
      {showAddBlogModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] p-4 flex items-center justify-center animate-fade-in">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 bg-emerald-50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✍️</span>
                <h3 className="text-xl font-black text-slate-900">Create New Blog Post</h3>
              </div>
              <button onClick={() => setShowAddBlogModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">×</button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Blog Name / Headline</label>
                  <input 
                    type="text" 
                    className="w-full p-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-sm focus:border-emerald-500 outline-none transition font-semibold"
                    placeholder="e.g. The Future of Plastic Recycling in UAE"
                    value={newBlogForm.name}
                    onChange={(e) => setNewBlogForm({ ...newBlogForm, name: e.target.value })}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Main Topic / Context</label>
                  <textarea 
                    className="w-full p-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-xs focus:border-emerald-500 outline-none transition min-h-[80px] resize-none"
                    placeholder="Provide specific details or key points for the AI to cover..."
                    value={newBlogForm.topic}
                    onChange={(e) => setNewBlogForm({ ...newBlogForm, topic: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Target Word Count</label>
                  <select 
                    className="w-full p-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-xs focus:border-emerald-500 outline-none transition font-bold"
                    value={newBlogForm.words}
                    onChange={(e) => setNewBlogForm({ ...newBlogForm, words: parseInt(e.target.value) })}
                  >
                    <option value={300}>300 Words (Short)</option>
                    <option value={500}>500 Words (Standard)</option>
                    <option value={800}>800 Words (Long Form)</option>
                    <option value={1200}>1200 Words (Deep Dive)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Any Recommendations?</label>
                  <input 
                    type="text" 
                    className="w-full p-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-xs focus:border-emerald-500 outline-none transition font-medium"
                    placeholder="Tone, specific keywords, style..."
                    value={newBlogForm.recommendations}
                    onChange={(e) => setNewBlogForm({ ...newBlogForm, recommendations: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Upload Images for Blog</label>
                  <div className="flex flex-wrap gap-3">
                    <label className="w-24 h-24 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition">
                      <span className="text-xl">➕</span>
                      <span className="text-[10px] font-bold text-slate-400">Add Image</span>
                      <input 
                        type="file" 
                        className="hidden" 
                        multiple 
                        accept="image/*" 
                        onChange={(e) => {
                          const files = e.target.files;
                          if (!files) return;
                          for (let i = 0; i < files.length; i++) {
                            const file = files[i];
                            const reader = new FileReader();
                            reader.onload = (re) => {
                              const base64Data = (re.target?.result as string).split(',')[1];
                              setNewBlogForm(prev => ({
                                ...prev,
                                images: [...prev.images, {
                                  fileName: file.name,
                                  mimeType: file.type,
                                  base64Data,
                                  previewUrl: URL.createObjectURL(file)
                                }]
                              }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    {newBlogForm.images.map((img, idx) => (
                      <div key={idx} className="relative w-24 h-24 rounded-2xl overflow-hidden group">
                        <img src={img.previewUrl} className="w-full h-full object-cover" />
                        <button 
                          onClick={() => setNewBlogForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                          className="absolute top-1 right-1 bg-rose-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => setShowAddBlogModal(false)}
                  className="flex-1 py-3 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    setPushStatus({ type: 'loading', message: 'Generating and saving blog...' });
                    try {
                      // 1. Upload Images
                      const uploadedImages = [];
                      for (const img of newBlogForm.images) {
                        const r = await fetch('/api/wordpress/upload-media', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            fileName: img.fileName,
                            mimeType: img.mimeType,
                            base64Data: img.base64Data,
                            altText: newBlogForm.name
                          })
                        });
                        const d = await r.json();
                        if (r.ok) uploadedImages.push(d.sourceUrl);
                      }

                      // 2. Compose Blog Content via AI
                      const res = await fetch('/api/seo/workflow/compose-page', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          goal: newBlogForm.name,
                          cause: newBlogForm.topic,
                          targetAudience: 'Blog Readers',
                          pageType: 'blog',
                          blogTopics: [newBlogForm.topic],
                          recommendations: newBlogForm.recommendations,
                          wordCount: newBlogForm.words,
                          uploadedImages: uploadedImages.map(url => ({ sourceUrl: url })),
                          isSubBlog: true
                        })
                      });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error || 'AI composition failed');

                      // 3. Create WordPress Post
                      const wpRes = await fetch('/api/wordpress/create-page', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          title: newBlogForm.name,
                          content: data.htmlContent,
                          status: 'publish'
                        })
                      });
                      if (!wpRes.ok) throw new Error('Failed to create WP post');

                      setPushStatus({ type: 'success', message: 'Blog published successfully!' });
                      setShowAddBlogModal(false);
                      setNewBlogForm({ name: '', topic: '', words: 500, recommendations: '', images: [] });
                      fetchPages();
                    } catch (err: any) {
                      setPushStatus({ type: 'error', message: err.message });
                    }
                  }}
                  className="flex-[2] py-3 rounded-xl bg-emerald-600 text-white text-xs font-black shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition"
                >
                  🚀 GENERATE & PUBLISH BLOG
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const AddMoreModal = ({ isOpen, onClose, form, setForm, onAdd, content, preview, previewTab, setPreviewTab, onApply }: any) => {
  if (!isOpen) return null;

  // Extract headings from HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(content || '', 'text/html');
  const headings = Array.from(doc.querySelectorAll('h1, h2, h3, h4')).map(h => h.textContent?.trim()).filter(Boolean);

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in duration-300">
        <div className="p-8 border-b border-slate-100 bg-gradient-to-br from-emerald-50 to-white">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <span className="w-10 h-10 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-lg shadow-lg shadow-emerald-100">
                {preview ? '👀' : '➕'}
              </span>
              {preview ? 'Review AI Generated Content' : 'Expand Your Page'}
            </h3>
            <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 transition shadow-sm text-2xl">×</button>
          </div>

          {!preview ? (
            <>
              <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl mb-8">
                <button 
                  onClick={() => setForm({ ...form, type: 'content' })}
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${form.type === 'content' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-400 hover:bg-white/50'}`}
                >
                  📄 Add Content
                </button>
                <button 
                  onClick={() => setForm({ ...form, type: 'image' })}
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${form.type === 'image' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-400 hover:bg-white/50'}`}
                >
                  🖼️ Add Image
                </button>
              </div>

              <div className="space-y-6">
                {form.type === 'content' ? (
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">What type of content should AI add?</label>
                    <textarea 
                      className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[24px] focus:border-emerald-500 outline-none transition text-sm font-medium"
                      rows={4}
                      placeholder="e.g. Add a detailed section about our HDPE recycling process in Sharjah, include benefits."
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                    />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Insert under which heading?</label>
                      <select 
                        className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[24px] focus:border-emerald-500 outline-none transition text-sm font-bold appearance-none"
                        value={form.targetHeading}
                        onChange={e => setForm({ ...form, targetHeading: e.target.value })}
                      >
                        <option value="">-- Select Heading --</option>
                        {headings.map((h, i) => (
                          <option key={i} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Image URL (or describe what you want)</label>
                      <input 
                        type="text"
                        className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[24px] focus:border-emerald-500 outline-none transition text-sm font-medium"
                        placeholder="https://example.com/image.jpg"
                        value={form.imageUrl}
                        onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <button 
                  onClick={onAdd}
                  disabled={form.isLoading || (form.type === 'content' ? !form.description : !form.targetHeading)}
                  className="w-full bg-emerald-600 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-emerald-100 hover:bg-emerald-700 hover:-translate-y-1 transition-all active:translate-y-0 disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-3"
                >
                  {form.isLoading ? (
                    <>
                      <span className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></span>
                      AI Agent is Engineering Content...
                    </>
                  ) : (
                    <>🚀 Generate New {form.type === 'content' ? 'Content' : 'Image Section'}</>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl mb-4">
                <button 
                  onClick={() => setPreviewTab('preview')}
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${previewTab === 'preview' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-400 hover:bg-white/50'}`}
                >
                  👁️ Visual Preview
                </button>
                <button 
                  onClick={() => setPreviewTab('html')}
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${previewTab === 'html' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-400 hover:bg-white/50'}`}
                >
                  <>{"</>"} HTML Code</>
                </button>
              </div>

              <div className="max-h-[400px] overflow-auto rounded-3xl border-2 border-slate-100 bg-slate-50 p-6 custom-scrollbar">
                {previewTab === 'preview' ? (
                  <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: preview }} />
                ) : (
                  <pre className="text-[10px] text-slate-600 font-mono whitespace-pre-wrap">{preview}</pre>
                )}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => onAdd()} // Regenerate
                  className="flex-1 bg-slate-100 text-slate-600 font-black py-5 rounded-[24px] hover:bg-slate-200 transition"
                >
                  🔄 Regenerate
                </button>
                <button 
                  onClick={onApply}
                  className="flex-[2] bg-emerald-600 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-emerald-100 hover:bg-emerald-700 hover:-translate-y-1 transition-all active:translate-y-0"
                >
                  ✅ Looks Great, Add to Page
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

