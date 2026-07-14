const fs = require('fs');
const sites = JSON.parse(fs.readFileSync('sites.json'));
const site = sites.find(s => s.url.includes('alshaabalwaseem.com'));
const auth = Buffer.from(site.user + ':' + site.pass).toString('base64');

fetch(site.url + 'wp-json/wp/v2/pages/7', {
  headers: { 'Authorization': 'Basic ' + auth }
}).then(r => r.json()).then(page => {
  let content = page.content.rendered;
  
  // 1. Replace the sticky sidebar HTML
  const oldSidebar = `<div class="custom-sticky-sidebar">
  <a href="mailto:nadeemalsaham@gmail.com" title="Email Us">✉ Email</a>
  <a href="tel:971554779240" title="Call Us">📞 Call</a>
  <a href="https://wa.me/971554779331" target="_blank" title="WhatsApp" rel="noopener">💬 WhatsApp</a>
</div>`;
  const newSidebar = `<div class="custom-sticky-sidebar">
  <a href="mailto:nadeemalsaham@gmail.com" title="Email Us">✉️</a>
  <a href="tel:971554779240" title="Call Us">📞</a>
  <a href="https://wa.me/971554779331" target="_blank" title="WhatsApp" rel="noopener">💬</a>
</div>`;
  content = content.replace(oldSidebar, newSidebar);
  
  // Also handle variations of whitespace
  content = content.replace(/<div class="custom-sticky-sidebar">[\s\S]*?<\/div>/, newSidebar);

  // 2. Modify the style block
  let oldStyles = content.match(/<style>[\s\S]*?<\/style>/)[0];
  let newStyles = oldStyles;
  
  // Replace the sticky sidebar CSS
  newStyles = newStyles.replace(/\.custom-sticky-sidebar a \{[\s\S]*?\}/, `.custom-sticky-sidebar a {
    background-color: transparent !important;
    color: #0d954d !important;
    padding: 10px !important;
    font-size: 35px !important;
    text-align: center;
    transition: all 0.3s;
    text-decoration: none;
    box-shadow: none !important;
}`);
  newStyles = newStyles.replace(/\.custom-sticky-sidebar a:hover \{[\s\S]*?\}/, `.custom-sticky-sidebar a:hover {
    background-color: transparent !important;
    color: #0a733b !important;
    transform: scale(1.1);
    padding-right: 10px !important;
}`);

  // Add the header position override
  const headerCSS = `
/* HEADER OVERRIDES */
.site-header, .ast-main-header-wrap, #masthead {
    position: absolute !important;
    top: 10px !important;
    right: 12px !important;
    width: auto !important;
    background: transparent !important;
    border: none !important;
    z-index: 9999 !important;
}
.ast-main-header-bar-alignment {
    justify-content: flex-end !important;
}
.site-branding, .site-title, .site-logo {
    display: none !important;
}
.main-header-menu > li > a, .ast-nav-menu > li > a {
    background: transparent !important;
    background-image: none !important;
    box-shadow: none !important;
}
.main-header-menu > li.current-menu-item > a,
.main-header-menu > li.current_page_item > a,
.ast-nav-menu > li.current-menu-item > a,
.ast-nav-menu > li.current_page_item > a {
    background: transparent !important;
    background-image: none !important;
}
.main-header-menu, .ast-nav-menu, .main-header-bar {
    background: transparent !important;
    background-image: none !important;
    background-color: transparent !important;
}
/* END HEADER OVERRIDES */
`;
  newStyles = newStyles.replace('</style>', headerCSS + '\n</style>');

  content = content.replace(oldStyles, newStyles);
  
  // Post it back
  return fetch(site.url + 'wp-json/wp/v2/pages/7', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + auth,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content: content })
  }).then(r => r.json()).then(d => {
    console.log('Design updated!');
  });
}).catch(console.error);
