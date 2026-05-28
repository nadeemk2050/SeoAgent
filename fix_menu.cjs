const fs = require('fs');
const sites = JSON.parse(fs.readFileSync('sites.json'));
const site = sites.find(s => s.url.includes('alshaabalwaseem.com'));
const auth = Buffer.from(site.user + ':' + site.pass).toString('base64');

const phpCode = `add_action('wp_head', function() {
    echo '<style>
    .main-header-menu, .ast-nav-menu, .main-header-bar, .ast-primary-header-bar {
        background: transparent !important;
        background-color: transparent !important;
        background-image: none !important;
        border: none !important;
        box-shadow: none !important;
    }
    .main-header-menu > li > a, .ast-nav-menu > li > a,
    .main-header-menu li, .ast-nav-menu li {
        background: transparent !important;
        background-color: transparent !important;
        background-image: none !important;
        box-shadow: none !important;
    }
    .main-header-menu > li.current-menu-item > a,
    .main-header-menu > li.current_page_item > a,
    .ast-nav-menu > li.current-menu-item > a,
    .ast-nav-menu > li.current_page_item > a,
    .main-header-menu > li:hover > a,
    .ast-nav-menu > li:hover > a {
        background: transparent !important;
        background-color: transparent !important;
        background-image: none !important;
        box-shadow: none !important;
    }
    </style>';
});`;

fetch(site.url + 'wp-json/code-snippets/v1/snippets', {
  method: 'POST',
  headers: {
    'Authorization': 'Basic ' + auth,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Remove Menu Box Design',
    code: phpCode,
    active: true,
    scope: 'global'
  })
}).then(r => r.json()).then(d => {
  console.log('Snippet created:', d);
  // Clear LiteSpeed Cache via code snippet
  const purgeCode = "if(class_exists('LiteSpeed\\\\Purge')) { LiteSpeed\\\\Purge::purge_all(); }";
  return fetch(site.url + 'wp-json/code-snippets/v1/snippets', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Purge Cache 2', code: purgeCode, active: true, scope: 'global' })
  });
}).then(r => r.json()).then(d => {
  console.log('Cache purged!');
}).catch(console.error);
