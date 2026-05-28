const fs = require('fs');
const sites = JSON.parse(fs.readFileSync('sites.json'));
const site = sites.find(s => s.url.includes('alshaabalwaseem.com'));
const auth = Buffer.from(site.user + ':' + site.pass).toString('base64');

async function run() {
  const cssCode = `add_action('wp_head', function() {
    echo '<style id="ultimate-menu-fix">
    /* ASTRA MENU LINKS BACKGROUND STRIP */
    .ast-builder-menu-1 .main-header-menu .menu-item > .menu-link,
    .ast-builder-menu-1 .main-header-menu .menu-item:hover > .menu-link,
    .ast-builder-menu-1 .main-header-menu .menu-item.current-menu-item > .menu-link,
    .ast-builder-menu .main-header-menu .menu-item > .menu-link,
    .ast-builder-menu .main-header-menu .menu-item:hover > .menu-link,
    .ast-primary-menu-child > a,
    #masthead .main-header-menu .menu-item > .menu-link,
    .main-header-menu, .ast-nav-menu, .ast-builder-menu,
    .site-header-primary-section-right, .site-header-primary-section-left,
    .ast-above-header-wrap, .ast-above-header-bar, .ast-primary-header-bar,
    .elementor-nav-menu, .elementor-nav-menu--main, .elementor-nav-menu a {
        background: transparent !important;
        background-color: transparent !important;
        background-image: none !important;
        border: none !important;
        box-shadow: none !important;
    }
    
    /* REMOVE ALL BACKGROUNDS FROM ALL MENU ELEMENTS */
    .main-header-menu *, .ast-nav-menu *, .ast-above-header-navigation *, .ast-builder-menu-1 * {
        background: transparent !important;
        background-color: transparent !important;
        background-image: none !important;
    }
    
    /* EXCEPTION FOR DROPDOWN MENUS TO REMAIN READABLE */
    .main-header-menu .sub-menu, .ast-nav-menu .sub-menu, .main-header-menu .sub-menu *, .ast-nav-menu .sub-menu * {
        background-color: #fff !important;
    }
    </style>';
    
    // Fallback JavaScript to manually strip styles
    echo "<script>
    document.addEventListener('DOMContentLoaded', function() {
        var items = document.querySelectorAll('.main-header-menu .menu-item, .main-header-menu .menu-link, .ast-builder-menu-1, .ast-above-header-bar, .ast-primary-header-bar');
        for(var i=0; i<items.length; i++) {
            items[i].style.setProperty('background', 'transparent', 'important');
            items[i].style.setProperty('background-color', 'transparent', 'important');
            items[i].style.setProperty('background-image', 'none', 'important');
        }
    });
    </script>";
  }, 9999);`;

  try {
    const rSnippet = await fetch(site.url + 'wp-json/code-snippets/v1/snippets', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + auth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Ultimate Menu Box Strip',
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
      body: JSON.stringify({ name: 'Purge Cache 5', code: purgeCode, active: true, scope: 'global' })
    });
    console.log('Cache Purged!');
  } catch(e) {
    console.error(e.message);
  }
}
run();
