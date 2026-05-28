const fs = require('fs');
const sites = JSON.parse(fs.readFileSync('sites.json'));
const site = sites.find(s => s.url.includes('alshaabalwaseem.com'));
const auth = Buffer.from(site.user + ':' + site.pass).toString('base64');

async function run() {
  const cssCode = `add_action('wp_head', function() {
    echo '<style>
    /* Reset Astra Mobile Menu to display properly on the left with a solid background */
    @media (max-width: 921px) {
        /* Ensure the mobile header wrapper is positioned correctly */
        .ast-header-break-point .main-header-bar .main-header-bar-navigation {
            position: absolute !important;
            top: 100% !important;
            left: 0 !important;
            right: auto !important;
            width: 100% !important;
            max-width: 100vw !important;
            background-color: #ffffff !important;
            box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
            z-index: 999999 !important;
        }

        /* Fix the actual menu list container */
        .ast-header-break-point .main-navigation ul.main-header-menu {
            display: block !important;
            background-color: #ffffff !important;
            padding: 10px 0 !important;
            margin: 0 !important;
            border-top: 2px solid #00008B !important;
            box-sizing: border-box !important;
            width: 100% !important;
        }

        /* Fix the menu items */
        .ast-header-break-point .main-navigation ul.main-header-menu > li {
            width: 100% !important;
            display: block !important;
            border-bottom: 1px solid #eeeeee !important;
            text-align: left !important;
            padding: 0 !important;
            margin: 0 !important;
        }

        /* Fix the links */
        .ast-header-break-point .main-navigation ul.main-header-menu > li > a {
            display: block !important;
            padding: 15px 20px !important;
            color: #00008B !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            width: 100% !important;
            box-sizing: border-box !important;
            white-space: normal !important; /* Allow wrapping if too long */
        }
        
        /* Make sure the hamburger button is visible */
        .ast-header-break-point .ast-mobile-menu-buttons {
            display: flex !important;
        }
        
        /* Stop horizontal scrolling */
        body, html {
            overflow-x: hidden !important;
        }
    }
    </style>';
  }, 9999);`;

  try {
    // Disable previous broken snippet if exists
    const fetchRes = await fetch(site.url + 'wp-json/code-snippets/v1/snippets', {
        headers: { 'Authorization': 'Basic ' + auth }
    });
    const snippets = await fetchRes.json();
    const oldSnippet = snippets.find(s => s.name === 'Force Desktop Menu on Mobile');
    if (oldSnippet) {
        await fetch(site.url + 'wp-json/code-snippets/v1/snippets/' + oldSnippet.id, {
            method: 'PUT',
            headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
            body: JSON.stringify({ active: false })
        });
        console.log('Disabled old broken snippet');
    }

    // Create new fix snippet
    const rSnippet = await fetch(site.url + 'wp-json/code-snippets/v1/snippets', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + auth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Fix Mobile Menu Off-Canvas Issue',
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
      body: JSON.stringify({ name: 'Purge Cache 21', code: purgeCode, active: true, scope: 'global' })
    });
    console.log('Cache Purged!');
  } catch(e) {
    console.error(e.message);
  }
}
run();
