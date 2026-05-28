const fs = require('fs');
const sites = JSON.parse(fs.readFileSync('sites.json'));
const site = sites.find(s => s.url.includes('alshaabalwaseem.com'));
const auth = Buffer.from(site.user + ':' + site.pass).toString('base64');

const htmlContent = `
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"50px","bottom":"50px"},"margin":{"top":"0px","bottom":"0px"}}},"backgroundColor":"background","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-background-background-color has-background" style="margin-top:0px;margin-bottom:0px;padding-top:50px;padding-bottom:50px">
    <!-- wp:heading {"textAlign":"center","level":1} -->
    <h1 class="wp-block-heading has-text-align-center">Engine Gears Used &amp; Scrap | Bulk Buyers &amp; Suppliers in UAE</h1>
    <!-- /wp:heading -->

    <!-- wp:paragraph {"align":"center"} -->
    <p class="has-text-align-center">Leading B2B buyers and wholesale suppliers of <strong>used engine gears</strong> and <strong>scrap engine gears</strong> in the UAE. We source, process, and export industrial gear scrap globally to recyclers and remanufacturers across Asia, the Middle East, Europe, and the Americas.</p>
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
            <h2 class="wp-block-heading">Why Buy or Sell Engine Gear Scrap With Us?</h2>
            <!-- /wp:heading -->
            <!-- wp:paragraph -->
            <p>Engine gears — whether recovered from dismantled vehicles, industrial machinery, or heavy equipment — represent a significant source of high-grade ferrous and non-ferrous metals. At Al Saham Al Ahmar, we specialize in the bulk purchase and export of used and scrap engine gears, ensuring maximum value recovery for our clients.</p>
            <!-- /wp:paragraph -->
            <!-- wp:paragraph -->
            <p>Our team carefully sorts, inspects, and consolidates gear scrap by material type, including cast iron gears, steel spur gears, alloy steel helical gears, and brass or bronze worm gears. This meticulous processing guarantees that our buyers receive clean, consistent material ready for smelting or remanufacturing.</p>
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
            <tr><td><strong>Material Types</strong></td><td>Cast Iron, Alloy Steel, Carbon Steel, Brass, Bronze Gears</td></tr>
            <tr><td><strong>Condition</strong></td><td>Used / Scrap / Post-Industrial</td></tr>
            <tr><td><strong>Gear Types</strong></td><td>Spur, Helical, Bevel, Worm, Ring &amp; Pinion Gears</td></tr>
            <tr><td><strong>Applications</strong></td><td>Automotive Engines, Industrial Gearboxes, Heavy Machinery</td></tr>
            <tr><td><strong>Forms Available</strong></td><td>Loose Scrap, Sorted Bales, Mixed Gear Scrap</td></tr>
            <tr><td><strong>Packaging</strong></td><td>Bulk Loose, Jumbo Bags, 20ft / 40ft Export Containers</td></tr>
            </tbody></table></figure>
            <!-- /wp:table -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->

    <!-- wp:heading {"level":2} -->
    <h2 class="wp-block-heading">Global Sourcing &amp; Export Destinations</h2>
    <!-- /wp:heading -->
    <!-- wp:paragraph -->
    <p>We actively source large volumes of used and scrap engine gears from automotive dismantlers, foundries, heavy equipment workshops, and industrial facilities across the <strong>UAE, Saudi Arabia, Oman, USA, Germany, and Japan</strong>. Our rigorous quality inspection process ensures that every shipment meets the exacting standards demanded by international smelters and gear remanufacturers.</p>
    <!-- /wp:paragraph -->
    <!-- wp:paragraph -->
    <p>Our primary export markets for engine gear scrap include <strong>India, Pakistan, China, Korea, Turkey, and across the broader Middle East</strong>. Steel mills and metal recycling plants in these regions rely on our consistent monthly supply of clean gear scrap to feed their furnaces and remanufacturing lines, reducing their dependence on costly virgin raw materials.</p>
    <!-- /wp:paragraph -->

    <!-- wp:heading {"level":2} -->
    <h2 class="wp-block-heading">Types of Engine Gears We Buy &amp; Sell</h2>
    <!-- /wp:heading -->
    <!-- wp:paragraph -->
    <p>Our expertise covers the full spectrum of industrial and automotive gearing components:</p>
    <!-- /wp:paragraph -->
    <!-- wp:list -->
    <ul class="wp-block-list">
        <li><strong>Automotive Differential Gears</strong> – Ring and pinion sets from cars, trucks, and SUVs.</li>
        <li><strong>Transmission Gears</strong> – Layshaft gears, synchro hubs, and planetary gear sets from manual and automatic gearboxes.</li>
        <li><strong>Industrial Gearbox Components</strong> – Helical and spur gear wheels from heavy-duty industrial reducers.</li>
        <li><strong>Crankshaft Timing Gears</strong> – Cast iron and steel timing sprockets recovered during engine rebuilds.</li>
        <li><strong>Camshaft &amp; Balance Shaft Gears</strong> – Precision alloy steel components from petrol and diesel engines.</li>
        <li><strong>Worm Gears (Brass/Bronze)</strong> – High-value non-ferrous worm gear sets from conveyor and lifting equipment.</li>
    </ul>
    <!-- /wp:list -->

    <!-- wp:heading {"level":2} -->
    <h2 class="wp-block-heading">Why Engine Gear Scrap Has High Metal Value</h2>
    <!-- /wp:heading -->
    <!-- wp:paragraph -->
    <p>Engine gears are precision-manufactured from high-specification alloy steels and cast irons designed to withstand extreme stress and wear. This engineering excellence translates directly into exceptional scrap value. Alloy steel gears, for instance, contain significant percentages of chromium, nickel, and molybdenum, making them far more valuable per ton than ordinary mild steel scrap. Our buyers in India and China pay a premium for sorted, clean alloy gear scrap, and we pass this advantage on to our sellers in the UAE and the Gulf region.</p>
    <!-- /wp:paragraph -->
</div>
<!-- /wp:group -->

<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"40px","bottom":"40px"}}},"backgroundColor":"light-gray","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-light-gray-background-color has-background" style="padding-top:40px;padding-bottom:40px">
    <!-- wp:heading {"textAlign":"center","level":2} -->
    <h2 class="wp-block-heading has-text-align-center">Get a Bulk Quote for Engine Gear Scrap</h2>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center"} -->
    <p class="has-text-align-center"><strong>Selling Scrap?</strong> We are top B2B buyers of used and scrap engine gears in Sharjah and across the UAE. Get the best prices for your industrial metal waste.<br><strong>Buying Scrap?</strong> We are regular wholesale suppliers of sorted engine gear scrap, actively exporting high-volume containers to smelters and remanufacturers worldwide.</p>
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
        console.log("Creating WordPress Page: Engine Gears Used & Scrap...");
        const res = await fetch(site.url + 'wp-json/wp/v2/pages', {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + auth,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: 'Engine Gears Used & Scrap',
                content: htmlContent,
                status: 'publish',
                slug: 'engine-gears-used-scrap'
            })
        });
        const pageData = await res.json();
        const pageId = pageData.id;
        console.log("Page created! URL:", pageData.link);
        console.log("Page ID:", pageId);

        console.log("Creating Code Snippet for SEO Meta & Product Schema...");
        const snippetCode = `
add_action('wp_head', function() {
    if (is_page('engine-gears-used-scrap')) {
        $schema = [
            "@context" => "https://schema.org/",
            "@type" => "Product",
            "name" => "Engine Gears Used & Scrap",
            "image" => "https://alshaabalwaseem.com/wp-content/uploads/2026/05/logo.png",
            "description" => "Bulk wholesale used and scrap engine gears in UAE. We buy and sell cast iron, alloy steel, and brass engine gears. Exporting globally to India, Pakistan, China, Korea, and the Middle East.",
            "brand" => [
                "@type" => "Brand",
                "name" => "Al Saham Al Ahmar"
            ],
            "offers" => [
                "@type" => "Offer",
                "url" => "https://alshaabalwaseem.com/engine-gears-used-scrap/",
                "priceCurrency" => "USD",
                "price" => "Contact for Bulk Price",
                "availability" => "https://schema.org/InStock",
                "itemCondition" => "https://schema.org/UsedCondition"
            ]
        ];
        echo '<script type="application/ld+json">' . json_encode($schema, JSON_UNESCAPED_SLASHES) . '</script>';
    }
}, 15);

add_action('init', function() {
    if(!get_option('rank_math_engine_gears_injected_${pageId}')) {
        update_post_meta(${pageId}, 'rank_math_focus_keyword', 'engine gears scrap');
        update_post_meta(${pageId}, 'rank_math_title', 'Engine Gears Used & Scrap | Bulk Buyers & Suppliers in UAE');
        update_post_meta(${pageId}, 'rank_math_description', 'Looking to buy or sell used engine gears and scrap engine gears in UAE? Al Saham Al Ahmar are top B2B buyers and global exporters. Get the best bulk prices today.');
        update_option('rank_math_engine_gears_injected_${pageId}', true);
    }
});
`;

        await fetch(site.url + 'wp-json/code-snippets/v1/snippets', {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + auth,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Engine Gears Scrap SEO Data & Schema',
                code: snippetCode,
                active: true,
                scope: 'global'
            })
        });
        console.log("SEO Snippet injected!");

        // Trigger a page load so WordPress fires the 'init' hook and executes the
        // Rank Math meta injection on the first natural request after snippet activation.
        await fetch(site.url);

        // Purge Cache
        const purgeCode = "if(class_exists('LiteSpeed\\\\Purge')) { LiteSpeed\\\\Purge::purge_all(); }";
        await fetch(site.url + 'wp-json/code-snippets/v1/snippets', {
            method: 'POST',
            headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Purge Cache Engine Gears', code: purgeCode, active: true, scope: 'global' })
        });
        console.log('Cache Purged!');

        console.log('\nDone! Page "Engine Gears Used & Scrap" is now live at:', pageData.link);
    } catch(e) {
        console.error("Error:", e.message);
    }
}
run();
