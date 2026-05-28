const fs = require('fs');
const sites = JSON.parse(fs.readFileSync('sites.json'));
const site = sites.find(s => s.url.includes('alshaabalwaseem.com'));
const auth = Buffer.from(site.user + ':' + site.pass).toString('base64');

async function run() {
  const schemaCode = `add_action('wp_head', function() {
    $schema = [
        "@context" => "https://schema.org",
        "@type" => "RecyclingCenter",
        "name" => "Al Saham Al Ahmar Plastic Scrap Trading",
        "url" => "https://alshaabalwaseem.com/",
        "logo" => "https://alshaabalwaseem.com/wp-content/uploads/2026/05/logo.png", 
        "description" => "Leading B2B industrial plastic and metal scrap buyers and recyclers in the UAE. We specialize in HDPE100, PC bottles, Aluminium ACSR, and sustainable recycling solutions.",
        "address" => [
            "@type" => "PostalAddress",
            "streetAddress" => "Industrial Area 11",
            "addressLocality" => "Sharjah",
            "addressRegion" => "Sharjah",
            "addressCountry" => "AE"
        ],
        "contactPoint" => [
            "@type" => "ContactPoint",
            "telephone" => "+971-55-477-9240",
            "contactType" => "customer service"
        ],
        "sameAs" => [
            // These will be the links to their social media once they create them
            "https://www.facebook.com/alsahamalahmar",
            "https://www.linkedin.com/company/alsahamalahmar"
        ]
    ];
    echo '<script type="application/ld+json">' . json_encode($schema, JSON_UNESCAPED_SLASHES) . '</script>';
  }, 10);`;

  try {
    const rSnippet = await fetch(site.url + 'wp-json/code-snippets/v1/snippets', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + auth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Local Business SEO Schema',
        code: schemaCode,
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
      body: JSON.stringify({ name: 'Purge Cache 15', code: purgeCode, active: true, scope: 'global' })
    });
    console.log('Cache Purged!');
  } catch(e) {
    console.error(e.message);
  }
}
run();
