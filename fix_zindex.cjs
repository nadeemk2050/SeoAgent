const fs = require('fs');
const sites = JSON.parse(fs.readFileSync('sites.json'));
const site = sites.find(s => s.url.includes('alshaabalwaseem.com'));
const auth = Buffer.from(site.user + ':' + site.pass).toString('base64');

async function run() {
  const cssCode = `add_action('wp_head', function() {
    echo '<style>
    /* FIX MAIN MENU SHINING LIGHT BLUE COLOR (OVERRIDE EVERYTHING) */
    .main-header-menu a, .ast-nav-menu a, .menu-link, .ast-builder-menu-1 .menu-link, 
    .ast-primary-header-bar .menu-link, .site-header .menu-item > a {
        color: #00d2ff !important;
        text-shadow: 0 0 8px rgba(0, 210, 255, 0.6) !important;
        font-weight: bold !important;
    }
    
    /* FIX SUBMENU OVERLAP (Z-INDEX) AND COLORS */
    .main-header-menu .sub-menu, .ast-nav-menu .sub-menu, .ast-builder-menu-1 .sub-menu {
        background-color: #e0e0e0 !important; /* Slightly darker light grey for contrast */
        z-index: 9999999 !important; /* BRING TO ABSOLUTE FRONT */
        position: absolute !important;
    }
    
    /* SUB MENU FONTS - DARK BLUE */
    .main-header-menu .sub-menu a, .ast-nav-menu .sub-menu a, .ast-builder-menu-1 .sub-menu a,
    .main-header-menu .sub-menu .menu-link, .ast-builder-menu-1 .sub-menu .menu-link {
        color: #000080 !important; /* Dark Blue */
        text-shadow: none !important;
        font-weight: bold !important;
        z-index: 9999999 !important;
        position: relative !important;
    }
    </style>';
  }, 99999);`;

  try {
    const rSnippet = await fetch(site.url + 'wp-json/code-snippets/v1/snippets', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + auth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Z-Index and Color Fix',
        code: cssCode,
        active: true,
        scope: 'global'
      })
    });
    console.log('Snippet created:', await rSnippet.json());
    
    // Purge Cache
    const purgeCode = "if(class_exists('LiteSpeed\\\\Purge')) { LiteSpeed\\\\Purge::purge_all(); }";
    await fetch(site.url + 'wp-json/code-snippets/v1/snippets', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Purge Cache 8', code: purgeCode, active: true, scope: 'global' })
    });
    console.log('Cache Purged!');
  } catch(e) {
    console.error(e.message);
  }
}
run();
