const fs = require('fs');
const sites = JSON.parse(fs.readFileSync('sites.json'));
const site = sites.find(s => s.url.includes('alshaabalwaseem.com'));
const auth = Buffer.from(site.user + ':' + site.pass).toString('base64');

// Load original hp.json
const hp = JSON.parse(fs.readFileSync('hp.json'));
let content = hp.content.rendered;

// 1. Remove text and just keep icons for sidebar
content = content.replace('✉ Email</a>', '✉️</a>');
content = content.replace('📞 Call</a>', '📞</a>');
content = content.replace('💬 WhatsApp</a>', '💬</a>');

// 2. CSS Updates
let oldStyles = content.match(/<style>[\s\S]*?<\/style>/)[0];
let newStyles = oldStyles;

// Fix sidebar CSS
newStyles = newStyles.replace(/\.custom-sticky-sidebar a \{[\s\S]*?\}/, `.custom-sticky-sidebar a {
    background-color: transparent !important;
    color: #0d954d !important;
    padding: 10px !important;
    font-size: 40px !important;
    text-align: center;
    transition: all 0.3s;
    text-decoration: none;
    box-shadow: none !important;
}`);
newStyles = newStyles.replace(/\.custom-sticky-sidebar a:hover \{[\s\S]*?\}/, `.custom-sticky-sidebar a:hover {
    background-color: transparent !important;
    color: #0a733b !important;
    transform: scale(1.2);
    padding-right: 10px !important;
}`);

// Add header CSS for moving menu and hiding title
const headerCSS = `
/* HEADER OVERRIDES */
.site-header, .ast-main-header-wrap, #masthead, .ast-primary-header-bar {
    position: absolute !important;
    top: 10px !important;
    right: 12px !important;
    width: 100% !important;
    background: transparent !important;
    border: none !important;
    z-index: 9999 !important;
    display: flex !important;
    justify-content: flex-end !important;
}
.site-branding, .site-title, .site-logo, .ast-site-identity {
    display: none !important;
}
.main-header-menu, .ast-nav-menu {
    background: transparent !important;
    display: flex !important;
    justify-content: flex-end !important;
}
.main-header-menu > li > a, .ast-nav-menu > li > a {
    background: transparent !important;
    background-image: none !important;
    box-shadow: none !important;
    background-color: transparent !important;
}
.main-header-menu > li.current-menu-item > a,
.main-header-menu > li.current_page_item > a,
.ast-nav-menu > li.current-menu-item > a,
.ast-nav-menu > li.current_page_item > a,
.main-header-menu > li:hover > a,
.ast-nav-menu > li:hover > a {
    background: transparent !important;
    background-image: none !important;
    background-color: transparent !important;
}
.main-header-menu li, .ast-nav-menu li {
    background-color: transparent !important;
}
/* END HEADER OVERRIDES */
`;
newStyles = newStyles.replace('</style>', headerCSS + '\n</style>');

content = content.replace(oldStyles, newStyles);

// Save back to WP
fetch(site.url + 'wp-json/wp/v2/pages/7', {
  method: 'POST',
  headers: {
    'Authorization': 'Basic ' + auth,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ content: content })
}).then(r => r.json()).then(d => {
  console.log('Design updated in WP!');
  
  // Clear LiteSpeed Cache via code snippet
  const purgeCode = "if(class_exists('LiteSpeed\\\\Purge')) { LiteSpeed\\\\Purge::purge_all(); }";
  return fetch(site.url + 'wp-json/code-snippets/v1/snippets', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Purge Cache', code: purgeCode, active: true, scope: 'global' })
  });
}).then(r => r.json()).then(d => {
  console.log('Cache purged!');
}).catch(console.error);
