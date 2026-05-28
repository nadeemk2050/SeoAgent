const fs = require('fs');
const sites = JSON.parse(fs.readFileSync('sites.json'));
const site = sites.find(s => s.url.includes('alshaabalwaseem.com'));
const auth = Buffer.from(site.user + ':' + site.pass).toString('base64');

const htmlContent = `
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"50px","bottom":"50px"},"margin":{"top":"0px","bottom":"0px"}}},"backgroundColor":"background","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-background-background-color has-background" style="margin-top:0px;margin-bottom:0px;padding-top:50px;padding-bottom:50px">
    <!-- wp:heading {"textAlign":"center","level":1} -->
    <h1 class="wp-block-heading has-text-align-center">PC Water Bottle Scrap Suppliers &amp; Exporters in UAE</h1>
    <!-- /wp:heading -->

    <!-- wp:paragraph {"align":"center"} -->
    <p class="has-text-align-center">Leading B2B industrial buyers, recyclers, and wholesale suppliers of premium Polycarbonate (PC) Water Bottle Scrap in the UAE. We export globally to the Middle East, USA, Canada, and beyond.</p>
    <!-- /wp:paragraph -->
</div>
<!-- /wp:group -->

<!-- wp:group {"style":{"spacing":{"padding":{"top":"40px","bottom":"40px"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" style="padding-top:40px;padding-bottom:40px">
    <!-- wp:columns -->
    <div class="wp-block-columns">
        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:heading {"level":2} -->
            <h2 class="wp-block-heading">Why Choose Our Polycarbonate Scrap?</h2>
            <!-- /wp:heading -->
            <!-- wp:paragraph -->
            <p>Our Polycarbonate (PC) bottle scrap comprises carefully processed discarded reusable water and beverage containers. Known for its exceptional durability, optical clarity, and heat resistance, our PC scrap is highly valued by manufacturing facilities worldwide.</p>
            <!-- /wp:paragraph -->
            <!-- wp:paragraph -->
            <p>We provide hot-washed, pure regrind and crushed flakes, entirely free from labels, caps, and contamination, ensuring your production runs smoothly.</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->

        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:heading {"level":2} -->
            <h2 class="wp-block-heading">Technical Specifications</h2>
            <!-- /wp:heading -->
            <!-- wp:table {"className":"is-style-regular"} -->
            <figure class="wp-block-table is-style-regular"><table><tbody>
            <tr><td><strong>Material</strong></td><td>100% Polycarbonate (PC) Water Bottles</td></tr>
            <tr><td><strong>Purity</strong></td><td>99.99% Pure, Contamination Free</td></tr>
            <tr><td><strong>Forms Available</strong></td><td>Regrind, Crushed Flakes, Baled</td></tr>
            <tr><td><strong>Colors</strong></td><td>Light Blue, Clear, Dull Natural</td></tr>
            <tr><td><strong>Processing</strong></td><td>Hot washed (Steam 80-90 degrees), Moisture 0.5% max</td></tr>
            <tr><td><strong>Packaging</strong></td><td>Jumbo Bags (Bulk Wholesale)</td></tr>
            </tbody></table></figure>
            <!-- /wp:table -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->

<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"40px","bottom":"40px"}}},"backgroundColor":"light-gray","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-light-gray-background-color has-background" style="padding-top:40px;padding-bottom:40px">
    <!-- wp:heading {"textAlign":"center","level":2} -->
    <h2 class="wp-block-heading has-text-align-center">Global Export &amp; Local Buying</h2>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center"} -->
    <p class="has-text-align-center"><strong>Selling Scrap?</strong> We are the top B2B buyers of industrial plastic waste in Sharjah and the UAE.<br><strong>Buying Scrap?</strong> We are regular wholesale suppliers of post-industrial PC scrap bales and regrind, actively exporting high-volume containers to manufacturers in the USA, Canada, and across the Middle East.</p>
    <!-- /wp:paragraph -->
    <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
    <div class="wp-block-buttons">
        <!-- wp:button -->
        <div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="https://wa.me/971529244592" target="_blank" rel="noopener">Contact Us on WhatsApp for Current Prices</a></div>
        <!-- /wp:button -->
    </div>
    <!-- /wp:buttons -->
</div>
<!-- /wp:group -->
`;

async function run() {
    try {
        console.log("Creating WordPress Page...");
        const res = await fetch(site.url + 'wp-json/wp/v2/pages', {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + auth,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: 'PC Water Bottle Scrap',
                content: htmlContent,
                status: 'publish',
                slug: 'pc-water-bottle-scrap'
            })
        });
        const data = await res.json();
        console.log("Page created! URL:", data.link);
        
        console.log("Creating Product SEO Schema Snippet...");
        const schemaCode = `add_action('wp_head', function() {
            if (is_page('pc-water-bottle-scrap')) {
                $schema = [
                    "@context" => "https://schema.org/",
                    "@type" => "Product",
                    "name" => "PC Water Bottle Scrap Regrind & Bales",
                    "image" => "https://alshaabalwaseem.com/wp-content/uploads/2026/05/logo.png",
                    "description" => "High purity 99.99% Polycarbonate (PC) Water Bottle Scrap. Available in hot-washed regrind, crushed flakes, and bales. Light Blue, Clear, and Dull Natural colors. Bulk export from UAE.",
                    "brand" => [
                        "@type" => "Brand",
                        "name" => "Al Saham Al Ahmar"
                    ],
                    "offers" => [
                        "@type" => "Offer",
                        "url" => "https://alshaabalwaseem.com/pc-water-bottle-scrap/",
                        "priceCurrency" => "USD",
                        "price" => "Contact for Bulk Price",
                        "availability" => "https://schema.org/InStock",
                        "itemCondition" => "https://schema.org/UsedCondition"
                    ]
                ];
                echo '<script type="application/ld+json">' . json_encode($schema, JSON_UNESCAPED_SLASHES) . '</script>';
            }
        }, 15);`;

        await fetch(site.url + 'wp-json/code-snippets/v1/snippets', {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + auth,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Product Schema for PC Scrap',
                code: schemaCode,
                active: true,
                scope: 'global'
            })
        });
        
        console.log("Product Schema injected!");
        
        // Purge Cache
        const purgeCode = "if(class_exists('LiteSpeed\\\\Purge')) { LiteSpeed\\\\Purge::purge_all(); }";
        await fetch(site.url + 'wp-json/code-snippets/v1/snippets', {
            method: 'POST',
            headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Purge Cache 17', code: purgeCode, active: true, scope: 'global' })
        });
        console.log('Cache Purged!');
        
    } catch(e) {
        console.error("Error:", e.message);
    }
}
run();
