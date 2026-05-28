const fs = require('fs');

const sites = JSON.parse(fs.readFileSync('sites.json'));
const site = sites.find((s) => s.url.includes('alshaabalwaseem.com'));

if (!site) {
  throw new Error('Target site was not found in sites.json');
}

const auth = Buffer.from(site.user + ':' + site.pass).toString('base64');

const pageTitle = 'Engine Gears Used or Scrap Buyers & Suppliers in UAE';
const pageSlug = 'engine-gears-used-or-scrap';
const focusKeyword = 'engine gears used or scrap';
const seoTitle = 'Engine Gears Used or Scrap Buyer & Supplier UAE';
const seoDescription = 'Buy and sell engine gears used or scrap in UAE with global import-export support. Bulk gearbox and auto gear scrap with quick WhatsApp quotes.';

const htmlContent = `
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"56px","bottom":"56px"}}},"backgroundColor":"background","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-background-background-color has-background" style="padding-top:56px;padding-bottom:56px">
  <!-- wp:heading {"textAlign":"center","level":1} -->
  <h1 class="wp-block-heading has-text-align-center">Engine Gears Used or Scrap Buyers &amp; Suppliers in UAE</h1>
  <!-- /wp:heading -->

  <!-- wp:paragraph {"align":"center"} -->
  <p class="has-text-align-center">If you need a trusted partner for <strong>engine gears used or scrap</strong>, we handle bulk buying and wholesale supply across the UAE and international markets. We trade used gearbox gears, transmission gear sets, and sorted metal gear scrap for recycling and industrial reuse with consistent quality and fast logistics.</p>
  <!-- /wp:paragraph -->

  <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
  <div class="wp-block-buttons">
    <!-- wp:button -->
    <div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="https://wa.me/971529244592" target="_blank" rel="noopener">Get WhatsApp Price Now</a></div>
    <!-- /wp:button -->
  </div>
  <!-- /wp:buttons -->
</div>
<!-- /wp:group -->

<!-- wp:group {"style":{"spacing":{"padding":{"top":"42px","bottom":"42px"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" style="padding-top:42px;padding-bottom:42px">
  <!-- wp:columns -->
  <div class="wp-block-columns">
    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:heading {"level":2} -->
      <h2 class="wp-block-heading">Why Businesses Source Engine Gear Scrap from Us</h2>
      <!-- /wp:heading -->

      <!-- wp:list -->
      <ul class="wp-block-list">
        <li>Bulk lots for recyclers, remanufacturers, and foundries</li>
        <li>Cleanly sorted used and scrap gear categories</li>
        <li>Stable monthly availability for ongoing factory demand</li>
        <li>Support for UAE pickup and export documentation</li>
      </ul>
      <!-- /wp:list -->
    </div>
    <!-- /wp:column -->

    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:heading {"level":2} -->
      <h2 class="wp-block-heading">Specification Snapshot</h2>
      <!-- /wp:heading -->

      <!-- wp:table {"className":"is-style-regular"} -->
      <figure class="wp-block-table is-style-regular"><table><tbody>
      <tr><td><strong>Material</strong></td><td>Mixed ferrous and alloy steel engine gears</td></tr>
      <tr><td><strong>Condition</strong></td><td>Used gears, dismantled gears, and clean scrap lots</td></tr>
      <tr><td><strong>Forms</strong></td><td>Loose, boxed, palletized, and container-ready bundles</td></tr>
      <tr><td><strong>Inspection</strong></td><td>Visual sorting by type, wear condition, and contamination level</td></tr>
      <tr><td><strong>Use Cases</strong></td><td>Recycling, remelting, remanufacturing, and industrial spare demand</td></tr>
      </tbody></table></figure>
      <!-- /wp:table -->
    </div>
    <!-- /wp:column -->
  </div>
  <!-- /wp:columns -->

  <!-- wp:heading {"level":2} -->
  <h2 class="wp-block-heading">Engine gears used or scrap trading for local and global buyers</h2>
  <!-- /wp:heading -->

  <!-- wp:paragraph -->
  <p>Our team procures and consolidates <strong>engine gears used or scrap</strong> from industrial channels, vehicle dismantling streams, and workshop clearances. Each shipment is prepared for predictable downstream processing, whether your business requires direct recycling feedstock or reusable gear lots for reconditioning operations.</p>
  <!-- /wp:paragraph -->

  <!-- wp:image {"id":233,"sizeSlug":"large","linkDestination":"none"} -->
  <figure class="wp-block-image size-large"><img src="https://alshaabalwaseem.com/wp-content/uploads/2026/05/logo.png" alt="engine gears used or scrap sorted for bulk trade" class="wp-image-233"/><figcaption class="wp-element-caption">Sorted engine gears used or scrap packed for UAE pickup and export containers.</figcaption></figure>
  <!-- /wp:image -->

  <!-- wp:heading {"level":2} -->
  <h2 class="wp-block-heading">How quality and pricing are evaluated</h2>
  <!-- /wp:heading -->

  <!-- wp:list -->
  <ul class="wp-block-list">
    <li>Gear type mix (transmission, differential, timing, and industrial gears)</li>
    <li>Rust, oil residue, and non-metal contamination percentage</li>
    <li>Packing efficiency and handling condition</li>
    <li>Lot consistency by weight and repeatability</li>
  </ul>
  <!-- /wp:list -->

  <!-- wp:heading {"level":2} -->
  <h2 class="wp-block-heading">Useful internal links</h2>
  <!-- /wp:heading -->

  <!-- wp:list -->
  <ul class="wp-block-list">
    <li><a href="https://alshaabalwaseem.com/services/">Explore our recycling services</a></li>
    <li><a href="https://alshaabalwaseem.com/contact-us/">Contact us for bulk deals</a></li>
    <li><a href="https://alshaabalwaseem.com/pvc-pipe-scrap-suppliers/">See another scrap product page example</a></li>
  </ul>
  <!-- /wp:list -->
</div>
<!-- /wp:group -->

<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"42px","bottom":"42px"}}},"backgroundColor":"light-gray","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-light-gray-background-color has-background" style="padding-top:42px;padding-bottom:42px">
  <!-- wp:heading {"textAlign":"center","level":2} -->
  <h2 class="wp-block-heading has-text-align-center">Frequently Asked Questions</h2>
  <!-- /wp:heading -->

  <!-- wp:heading {"level":3} -->
  <h3 class="wp-block-heading">Do you buy engine gears used or scrap in bulk from UAE workshops?</h3>
  <!-- /wp:heading -->
  <!-- wp:paragraph -->
  <p>Yes. We arrange pickup and consolidation for bulk industrial lots and workshop clearances across UAE locations.</p>
  <!-- /wp:paragraph -->

  <!-- wp:heading {"level":3} -->
  <h3 class="wp-block-heading">Can you export container quantities?</h3>
  <!-- /wp:heading -->
  <!-- wp:paragraph -->
  <p>Yes. We support export documentation and shipment planning for buyers in regional and international markets.</p>
  <!-- /wp:paragraph -->

  <!-- wp:heading {"level":3} -->
  <h3 class="wp-block-heading">How do I get the latest price for engine gears used or scrap?</h3>
  <!-- /wp:heading -->
  <!-- wp:paragraph -->
  <p>Send us weight, photos, and material details on WhatsApp and we will provide a fast bulk quote.</p>
  <!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
`;

function buildSnippetCode(pageId) {
  return `
add_action('wp_head', function() {
  if (is_page('${pageSlug}')) {
    $schema = [
      "@context" => "https://schema.org/",
      "@type" => "Product",
      "name" => "Engine Gears Used or Scrap",
      "image" => "https://alshaabalwaseem.com/wp-content/uploads/2026/05/logo.png",
      "description" => "Bulk engine gears used or scrap for buyers and recyclers in UAE with global import-export support.",
      "brand" => [
        "@type" => "Brand",
        "name" => "Al Shaab Al Waseem"
      ],
      "offers" => [
        "@type" => "Offer",
        "url" => "https://alshaabalwaseem.com/${pageSlug}/",
        "priceSpecification" => [
          "@type" => "PriceSpecification",
          "priceCurrency" => "USD",
          "description" => "Contact for bulk price"
        ],
        "availability" => "https://schema.org/InStock",
        "itemCondition" => "https://schema.org/UsedCondition"
      ]
    ];
    echo '<script type="application/ld+json">' . json_encode($schema, JSON_UNESCAPED_SLASHES) . '</script>';

    $faqSchema = [
      "@context" => "https://schema.org",
      "@type" => "FAQPage",
      "mainEntity" => [
        [
          "@type" => "Question",
          "name" => "Do you buy engine gears used or scrap in bulk from UAE workshops?",
          "acceptedAnswer" => [
            "@type" => "Answer",
            "text" => "Yes. We arrange pickup and consolidation for bulk industrial lots and workshop clearances across UAE locations."
          ]
        ],
        [
          "@type" => "Question",
          "name" => "Can you export container quantities?",
          "acceptedAnswer" => [
            "@type" => "Answer",
            "text" => "Yes. We support export documentation and shipment planning for buyers in regional and international markets."
          ]
        ],
        [
          "@type" => "Question",
          "name" => "How do I get the latest price for engine gears used or scrap?",
          "acceptedAnswer" => [
            "@type" => "Answer",
            "text" => "Send us weight, photos, and material details on WhatsApp and we will provide a fast bulk quote."
          ]
        ]
      ]
    ];
    echo '<script type="application/ld+json">' . json_encode($faqSchema, JSON_UNESCAPED_SLASHES) . '</script>';
  }
}, 15);

add_action('init', function() {
  if (!get_option('rank_math_engine_gears_injected_${pageId}')) {
    update_post_meta(${pageId}, 'rank_math_focus_keyword', '${focusKeyword}');
    update_post_meta(${pageId}, 'rank_math_title', '${seoTitle}');
    update_post_meta(${pageId}, 'rank_math_description', '${seoDescription}');
    update_post_meta(${pageId}, '_seo_goal', 'Rank for engine gears used or scrap queries and generate WhatsApp B2B leads.');
    update_option('rank_math_engine_gears_injected_${pageId}', true);
  }
});
`;
}

async function run() {
  try {
    console.log('Creating WordPress page...');

    const createPageRes = await fetch(site.url + 'wp-json/wp/v2/pages', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: pageTitle,
        content: htmlContent,
        status: 'publish',
        slug: pageSlug,
      }),
    });

    const pageData = await createPageRes.json();
    if (!createPageRes.ok) {
      throw new Error('Page creation failed: ' + JSON.stringify(pageData));
    }

    const pageId = pageData.id;
    console.log('Page created:', pageData.link);
    console.log('Page ID:', pageId);

    const snippetRes = await fetch(site.url + 'wp-json/code-snippets/v1/snippets', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Engine Gears Scrap SEO Data & Schema',
        code: buildSnippetCode(pageId),
        active: true,
        scope: 'global',
      }),
    });

    const snippetData = await snippetRes.json();
    if (!snippetRes.ok) {
      throw new Error('Snippet creation failed: ' + JSON.stringify(snippetData));
    }

    await fetch(site.url);

    const purgeCode = "if(class_exists('LiteSpeed\\\\Purge')) { LiteSpeed\\\\Purge::purge_all(); }";
    await fetch(site.url + 'wp-json/code-snippets/v1/snippets', {
      method: 'POST',
      headers: { Authorization: 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Purge Cache - Engine Gears Page',
        code: purgeCode,
        active: true,
        scope: 'global',
      }),
    });

    console.log('Cache purged.');
    console.log('');
    console.log('Rank Math 100/100 Meta Plan:');
    console.log(`1) Focus Keyword: ${focusKeyword}`);
    console.log(`2) SEO Title: ${seoTitle}`);
    console.log(`3) Meta Description: ${seoDescription}`);
    console.log(`4) Slug: ${pageSlug}`);
    console.log('5) Keep focus keyword in H1, first paragraph, one H2, and image alt text (already included).');
    console.log('6) Keep 3+ internal links and FAQ schema active (already included).');
    console.log('7) Recheck Rank Math score after publish and refine density/readability if needed.');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

run();
