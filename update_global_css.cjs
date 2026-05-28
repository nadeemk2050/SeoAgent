const fs = require('fs');
const sites = JSON.parse(fs.readFileSync('sites.json'));
const site = sites.find(s => s.url.includes('alshaabalwaseem.com'));
const auth = Buffer.from(site.user + ':' + site.pass).toString('base64');

async function run() {
  const cssCode = `add_action('wp_head', function() {
    echo '<style>
    /* FORCE MENU BOX TO DISAPPEAR - TARGETING ASTRA ABOVE HEADER */
    .ast-above-header-wrap, .ast-above-header-bar, .ast-primary-header-bar, .ast-main-header-bar, 
    .site-header, #masthead, .main-header-menu, .ast-builder-menu, .ast-builder-menu-1, .ast-nav-menu,
    .ast-header-break-point .ast-above-header-bar,
    .ast-above-header-navigation, .ast-above-header-menu-items {
        background: transparent !important;
        background-color: transparent !important;
        background-image: none !important;
        border: none !important;
        box-shadow: none !important;
    }
    
    /* REMOVE BACKGROUND FROM MENU ITEMS */
    .main-header-menu *, .ast-nav-menu *, .ast-above-header-navigation * {
        background: transparent !important;
        background-color: transparent !important;
        background-image: none !important;
        box-shadow: none !important;
    }

    /* HIDE SITE TITLE */
    .site-branding, .site-title, .site-logo, .ast-site-identity {
        display: none !important;
        visibility: hidden !important;
        width: 0 !important;
        height: 0 !important;
    }

    /* MOVE HEADER TO TOP RIGHT CORNER */
    .site-header, #masthead {
        position: absolute !important;
        top: 10px !important;
        right: 12px !important;
        width: 100% !important;
        display: flex !important;
        justify-content: flex-end !important;
        border: none !important;
        z-index: 999999 !important;
    }
    
    /* FIX THE STICKY SIDEBAR ICONS TO THE RIGHT CENTER */
    .custom-sticky-sidebar {
        position: fixed !important;
        right: 0 !important;
        top: 50% !important;
        transform: translateY(-50%) !important;
        z-index: 9999999 !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 5px !important;
        background: transparent !important;
    }
    
    /* FIX ICONS THEMSELVES */
    .custom-sticky-sidebar a {
        background: transparent !important;
        background-color: transparent !important;
        color: #0d954d !important;
        font-size: 35px !important;
        padding: 5px 15px !important;
        box-shadow: none !important;
        border: none !important;
        text-decoration: none !important;
        display: inline-block !important;
    }
    .custom-sticky-sidebar a:hover {
        transform: scale(1.1) !important;
        color: #0a733b !important;
        background: transparent !important;
    }
    .custom-sticky-sidebar br {
        display: none !important;
    }
    </style>';
  }, 9999);`;

  try {
    // Inject global CSS snippet
    const rSnippet = await fetch(site.url + 'wp-json/code-snippets/v1/snippets', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + auth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Ultimate Header & Sidebar CSS',
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
      body: JSON.stringify({ name: 'Purge Cache 4', code: purgeCode, active: true, scope: 'global' })
    });
    console.log('Cache Purged!');
  } catch(e) {
    console.error(e.message);
  }
}
run();
