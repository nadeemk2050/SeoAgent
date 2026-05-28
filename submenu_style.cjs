const fs = require('fs');
const sites = JSON.parse(fs.readFileSync('sites.json'));
const site = sites.find(s => s.url.includes('alshaabalwaseem.com'));
const auth = Buffer.from(site.user + ':' + site.pass).toString('base64');

async function run() {
  const cssCode = `add_action('wp_head', function() {
    echo '<style>
  /* PRIMARY MENU: DARK BLUE */
  #mega-menu-wrap-primary #mega-menu-primary > li.mega-menu-item > a.mega-menu-link,
  .main-header-menu > li > a,
  .ast-nav-menu > li > a {
    color: #00008b !important;
    text-shadow: none !important;
    font-weight: 600 !important;
  }

  #mega-menu-wrap-primary #mega-menu-primary > li.mega-menu-item:hover > a.mega-menu-link,
  #mega-menu-wrap-primary #mega-menu-primary > li.mega-current-menu-item > a.mega-menu-link {
    color: #00008b !important;
  }

  /* SUBMENU: LIGHT GREY BACKGROUND */
  #mega-menu-wrap-primary #mega-menu-primary li.mega-menu-item ul.mega-sub-menu,
  #mega-menu-wrap-primary #mega-menu-primary li.mega-menu-item ul.mega-sub-menu li,
  .main-header-menu .sub-menu,
  .main-header-menu .sub-menu li,
  .ast-nav-menu .sub-menu,
  .ast-nav-menu .sub-menu li {
    background: #f0f0f0 !important;
    background-color: #f0f0f0 !important;
  }

  /* SUBMENU FONT: DARK BLUE */
  #mega-menu-wrap-primary #mega-menu-primary li.mega-menu-item ul.mega-sub-menu li.mega-menu-item > a.mega-menu-link,
  .main-header-menu .sub-menu a,
  .ast-nav-menu .sub-menu a {
    color: #00008b !important;
    text-shadow: none !important;
    font-weight: 600 !important;
  }

  #mega-menu-wrap-primary #mega-menu-primary li.mega-menu-item ul.mega-sub-menu li.mega-menu-item > a.mega-menu-link:hover,
  .main-header-menu .sub-menu a:hover,
  .ast-nav-menu .sub-menu a:hover {
    color: #00008b !important;
    background: #e9e9e9 !important;
    background-color: #e9e9e9 !important;
  }
    </style>';
  }, 999999);`;

  try {
    const rSnippet = await fetch(site.url + 'wp-json/code-snippets/v1/snippets/19', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + auth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Final Menu Color Override',
        code: cssCode,
        active: true,
        scope: 'global'
      })
    });
    console.log('Snippet updated:', await rSnippet.json());
    
    // Purge Cache
    const purgeCode = "if(class_exists('LiteSpeed\\\\Purge')) { LiteSpeed\\\\Purge::purge_all(); }";
    await fetch(site.url + 'wp-json/code-snippets/v1/snippets', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Purge Cache 7', code: purgeCode, active: true, scope: 'global' })
    });
    console.log('Cache Purged!');
  } catch(e) {
    console.error(e.message);
  }
}
run();
