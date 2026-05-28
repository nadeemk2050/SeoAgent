const fs = require('fs');
const sites = JSON.parse(fs.readFileSync('sites.json'));
const site = sites.find(s => s.url.includes('alshaabalwaseem.com'));
const auth = Buffer.from(site.user + ':' + site.pass).toString('base64');

async function run() {
  const phpCode = `add_action('template_redirect', function() {
    $redirects = [
        '/about' => '/about-al-saham-al-ahmar/',
        '/contact' => '/contact-us/',
        '/blog-post' => '/',
        '/blog-post2' => '/',
        '/blog-post3' => '/',
        '/blog-post5' => '/',
        '/zero-waste-scrap-vision' => '/',
        '/directory-of-scrap-traders-and-recyclers' => '/',
        '/marketplace' => '/',
        '/marketplace2' => '/',
        '/metals-scrap-plastic-scrap-in-uae-pakistan' => '/',
        '/pc-bottle-scrap-recycling-in-uae' => '/',
        '/the-global-plastic-and-metal-revolution-how-al-saham-ahmar-is-making-the-earth-livea' => '/',
        '/the-global-plastic-and-metal-revolution-how-al-saham-ahmar-is-making-the-earth-liveable' => '/'
    ];
    
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $path = rtrim($path, '/'); // normalize
    
    if (array_key_exists($path, $redirects)) {
        wp_redirect(home_url($redirects[$path]), 301);
        exit;
    }
});`;

  try {
    const rSnippet = await fetch(site.url + 'wp-json/code-snippets/v1/snippets', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + auth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'SEO 301 Redirects for Old URLs',
        code: phpCode,
        active: true,
        scope: 'global'
      })
    });
    console.log('Snippet created:', await rSnippet.json());
    
    const purgeCode = "if(class_exists('LiteSpeed\\\\Purge')) { LiteSpeed\\\\Purge::purge_all(); }";
    await fetch(site.url + 'wp-json/code-snippets/v1/snippets', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Purge Cache 14', code: purgeCode, active: true, scope: 'global' })
    });
    console.log('Cache Purged!');
  } catch(e) {
    console.error(e.message);
  }
}
run();
