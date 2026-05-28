const fs = require('fs');
const sites = JSON.parse(fs.readFileSync('sites.json'));
const site = sites.find(s => s.url.includes('alshaabalwaseem.com'));
const auth = Buffer.from(site.user + ':' + site.pass).toString('base64');

async function run() {
  const cssCode = `add_action('wp_head', function() {
    echo '<style>
    /* CONTACT US PAGE BACKGROUND FIX (Page ID 203) */
    body.page-id-203, 
    body.page-id-203 .site-content,
    body.page-id-203 .ast-container,
    body.page-id-203 .wp-block-cover,
    body.page-id-203 .wp-block-cover__background,
    body.page-id-203 .wp-block-group,
    body.page-id-203 .elementor-section,
    body.page-id-203 .elementor-background-overlay,
    body.page-id-203 .ast-builder-grid-row {
        background: #add8e6 !important; /* Light Blue */
        background-color: #add8e6 !important;
        background-image: none !important;
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
        name: 'Contact Us Page Light Blue BG',
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
      body: JSON.stringify({ name: 'Purge Cache 9', code: purgeCode, active: true, scope: 'global' })
    });
    console.log('Cache Purged!');
  } catch(e) {
    console.error(e.message);
  }
}
run();
