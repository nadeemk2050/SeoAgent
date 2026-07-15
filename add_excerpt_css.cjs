require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');
const fs = require('fs');

async function main() {
  // Read current page content
  const r = await fetch(WP_URL + '/wp-json/wp/v2/pages/363', {
    headers: { 'Authorization': 'Basic ' + auth }
  });
  const page = await r.json();
  let content = page.content?.rendered || '';
  
  // Check if excerpt CSS already added
  if (content.includes('pm-desc-clamp')) {
    console.log('Excerpt CSS already added!');
    return;
  }
  
  // Add excerpt truncation CSS + post page styling inside the existing style block
  const excerptCSS = `
    /* Product listing excerpt - 4 lines with Read More */
    .pm-desc-clamp {
      display: -webkit-box;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
      overflow: hidden;
      position: relative;
      margin-bottom: 4px;
    }
    .pm-read-more {
      color: #0d954d;
      font-weight: 600;
      font-size: 0.8rem;
      text-decoration: none;
      display: inline-block;
      margin-top: 2px;
    }
    .pm-read-more:hover {
      text-decoration: underline;
    }
    /* Single post page beautification */
    .single-post .entry-content {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      font-family: "Inter", "Segoe UI", sans-serif;
      line-height: 1.8;
      color: #333;
    }
    .single-post .entry-content h2 {
      font-size: 1.3rem;
      font-weight: 700;
      color: #1a1a1a;
      margin-top: 30px;
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 2px solid #0d954d;
    }
    .single-post .entry-content h3 {
      font-size: 1.1rem;
      font-weight: 700;
      color: #1a1a1a;
      margin-top: 20px;
      margin-bottom: 8px;
    }
    .single-post .entry-content p {
      font-size: 1rem;
      color: #444;
      margin-bottom: 12px;
      line-height: 1.8;
    }
    .single-post .entry-content strong {
      color: #1a1a1a;
    }
    .single-post .entry-content img {
      border-radius: 8px;
      margin: 15px 0;
      max-width: 100%;
      height: auto;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .single-post .entry-content ul,
    .single-post .entry-content ol {
      padding-left: 20px;
      margin-bottom: 15px;
    }
    .single-post .entry-content li {
      margin-bottom: 5px;
      color: #444;
    }
    .single-post .entry-header {
      text-align: center;
      padding: 30px 20px 10px;
    }
    .single-post .entry-header h1 {
      font-size: 2rem;
      font-weight: 800;
      color: #1a1a1a;
      line-height: 1.3;
    }
    .single-post .entry-header .meta {
      color: #999;
      font-size: 0.85rem;
    }
    @media (max-width: 600px) {
      .single-post .entry-content { padding: 12px; }
      .single-post .entry-content h1 { font-size: 1.4rem; }
      .single-post .entry-content h2 { font-size: 1.1rem; }
      .single-post .entry-header h1 { font-size: 1.5rem; }
    }
  `;
  
  // Insert excerpt CSS after the existing closing style tag
  content = content.replace('</style>', '\n    ' + excerptCSS.trim() + '\n    </style>');
  
  // Update the page
  const r2 = await fetch(WP_URL + '/wp-json/wp/v2/pages/363', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: content })
  });
  const updated = await r2.json();
  console.log('Page updated:', updated.id);
}
main().catch(e => console.error(e.message));
