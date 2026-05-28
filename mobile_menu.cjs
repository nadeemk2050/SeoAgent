const fs = require('fs');
const sites = JSON.parse(fs.readFileSync('sites.json'));
const site = sites.find(s => s.url.includes('alshaabalwaseem.com'));
const auth = Buffer.from(site.user + ':' + site.pass).toString('base64');

async function run() {
  const cssCode = `add_action('wp_head', function() {
    echo '<style>
    /* Hide the hamburger button on mobile */
    .ast-header-break-point .ast-mobile-menu-buttons {
        display: none !important;
    }
    
    /* Force the main menu to show on mobile */
    .ast-header-break-point .main-header-bar .main-navigation {
        display: block !important;
        width: 100% !important;
    }
    
    /* Display the menu horizontally like desktop, with horizontal scroll if it overflows */
    @media (max-width: 921px) {
        .ast-header-break-point .main-navigation ul.main-header-menu {
            display: flex !important;
            flex-direction: row !important;
            overflow-x: auto !important;
            white-space: nowrap !important;
            background: transparent !important;
            padding: 0 !important;
            border-top: none !important;
        }
        
        .ast-header-break-point .main-navigation ul.main-header-menu > li {
            display: inline-block !important;
            width: auto !important;
            border: none !important;
        }
        
        .ast-header-break-point .main-navigation ul.main-header-menu > li > a {
            padding: 10px 15px !important;
            font-size: 14px !important;
            display: inline-block !important;
        }
        
        /* Hide mobile submenu dropdown toggles since it is desktop view */
        .ast-header-break-point .ast-menu-toggle {
            display: none !important;
        }
        
        /* Show submenus on hover like desktop */
        .ast-header-break-point .main-navigation ul.main-header-menu > li:hover > ul.sub-menu {
            display: block !important;
            position: absolute !important;
            background: #d3d3d3 !important; /* Light grey */
            left: auto !important;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1) !important;
            z-index: 99999 !important;
        }
        
        .ast-header-break-point .main-navigation ul.main-header-menu > li > ul.sub-menu > li > a {
            color: #00008B !important; /* Dark Blue */
            font-size: 14px !important;
            padding: 10px 20px !important;
            display: block !important;
        }
        
        /* Hide scrollbar for a cleaner look */
        .ast-header-break-point .main-navigation ul.main-header-menu::-webkit-scrollbar {
            display: none;
        }
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
        name: 'Force Desktop Menu on Mobile',
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
      body: JSON.stringify({ name: 'Purge Cache 20', code: purgeCode, active: true, scope: 'global' })
    });
    console.log('Cache Purged!');
  } catch(e) {
    console.error(e.message);
  }
}
run();
