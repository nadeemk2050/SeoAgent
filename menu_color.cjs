const fs = require('fs');
const sites = JSON.parse(fs.readFileSync('sites.json'));
const site = sites.find(s => s.url.includes('alshaabalwaseem.com'));
const auth = Buffer.from(site.user + ':' + site.pass).toString('base64');

async function run() {
  const cssCode = `add_action('wp_head', function() {
    echo '<style>
    /* SHINING LIGHT BLUE MENU FONT */
    .ast-builder-menu-1 .main-header-menu .menu-item > .menu-link,
    .ast-builder-menu-1 .main-header-menu .menu-item:hover > .menu-link,
    .ast-builder-menu-1 .main-header-menu .menu-item.current-menu-item > .menu-link,
    .main-header-menu > li > a, .ast-nav-menu > li > a,
    .ast-above-header-navigation a,
    .elementor-nav-menu a,
    .site-header .menu-link {
        color: #00d2ff !important;
        text-shadow: 0 0 8px rgba(0, 210, 255, 0.6) !important;
        font-weight: bold !important;
    }
    
    /* SUB MENU FONT (No shadow to keep it readable, but still light blue) */
    .main-header-menu .sub-menu .menu-item > .menu-link,
    .ast-nav-menu .sub-menu .menu-item > .menu-link {
        color: #00d2ff !important;
        text-shadow: none !important;
    }
    </style>';
  }, 9999);`;

  try {
    const rSnippet = await fetch(site.url + 'wp-json/code-snippets/v1/snippets', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + auth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Shining Light Blue Menu Font',
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
      body: JSON.stringify({ name: 'Purge Cache 6', code: purgeCode, active: true, scope: 'global' })
    });
    console.log('Cache Purged!');
  } catch(e) {
    console.error(e.message);
  }
}
run();
