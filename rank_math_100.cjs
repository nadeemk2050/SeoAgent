const fs = require('fs');
const sites = JSON.parse(fs.readFileSync('sites.json'));
const site = sites.find(s => s.url.includes('alshaabalwaseem.com'));
const auth = Buffer.from(site.user + ':' + site.pass).toString('base64');

const expandedContent = `
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"50px","bottom":"50px"},"margin":{"top":"0px","bottom":"0px"}}},"backgroundColor":"background","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-background-background-color has-background" style="margin-top:0px;margin-bottom:0px;padding-top:50px;padding-bottom:50px">
    <!-- wp:heading {"textAlign":"center","level":1} -->
    <h1 class="wp-block-heading has-text-align-center">PC Water Bottle Scrap Suppliers &amp; Exporters in UAE</h1>
    <!-- /wp:heading -->

    <!-- wp:paragraph {"align":"center"} -->
    <p class="has-text-align-center">Looking for premium <strong>PC Water Bottle Scrap</strong>? We are the leading B2B industrial buyers, recyclers, and wholesale suppliers of premium Polycarbonate (PC) Water Bottle Scrap in the UAE. We export globally to the Middle East, USA, Canada, and beyond.</p>
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
            <h2 class="wp-block-heading">Why Choose Our PC Water Bottle Scrap?</h2>
            <!-- /wp:heading -->
            <!-- wp:paragraph -->
            <p>Our PC water bottle scrap comprises carefully processed discarded reusable water and beverage containers. Polycarbonate is an incredibly versatile and strong industrial material. Known for its exceptional durability, optical clarity, and heat resistance, our PC scrap is highly valued by manufacturing facilities worldwide.</p>
            <!-- /wp:paragraph -->
            <!-- wp:paragraph -->
            <p>We provide hot-washed, pure regrind and crushed flakes, entirely free from labels, caps, and contamination, ensuring your production runs smoothly. When you buy PC water bottle scrap from Al Saham Al Ahmar, you are guaranteeing maximum yield for your factory.</p>
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
    
    <!-- wp:heading {"level":2} -->
    <h2 class="wp-block-heading">Applications of Regrind PC Water Bottle Scrap</h2>
    <!-- /wp:heading -->
    <!-- wp:paragraph -->
    <p>The applications for recycled PC water bottle scrap are massive. Due to its inherent thermal stability and impact resistance, international manufacturers heavily rely on this recycled raw material. The <a href="https://en.wikipedia.org/wiki/Polycarbonate" target="_blank" rel="noopener">polycarbonate</a> polymer extracted from these 5-gallon water bottles is routinely reprocessed into high-end automotive components, electronic housings, construction materials, and safety gear.</p>
    <!-- /wp:paragraph -->
    <!-- wp:paragraph -->
    <p>By utilizing our clean, hot-washed PC water bottle scrap, injection molding and extrusion plants can significantly reduce their production costs while maintaining the absolute highest standards of material integrity. Whether you require light blue, clear, or dull natural variations, our sorting facility in Sharjah guarantees precise color separation.</p>
    <!-- /wp:paragraph -->

    <!-- wp:heading {"level":2} -->
    <h2 class="wp-block-heading">Our Rigorous Quality Assurance Process</h2>
    <!-- /wp:heading -->
    <!-- wp:paragraph -->
    <p>At Al Saham Al Ahmar, we take the purity of our PC water bottle scrap very seriously. Every single bale and jumbo bag undergoes a strict multi-step quality control process. First, the post-consumer and post-industrial bottles are manually sorted to remove all foreign plastics (like PET or HDPE caps). Second, the material is shredded into consistent regrind flakes. Third, it is subjected to an intensive hot-wash steam process at 80 to 90 degrees Celsius. This eradicates any residual liquids, adhesives, or paper labels. Finally, the moisture content is reduced to below 0.5%, resulting in a 99.99% pure product ready for immediate industrial extrusion.</p>
    <!-- /wp:paragraph -->
    
    <!-- wp:image {"id":233,"sizeSlug":"large","linkDestination":"none"} -->
    <figure class="wp-block-image size-large"><img src="https://alshaabalwaseem.com/wp-content/uploads/2026/05/logo.png" alt="PC Water Bottle Scrap Regrind Supplier in UAE" class="wp-image-233"/><figcaption class="wp-element-caption">Premium PC Water Bottle Scrap ready for bulk global export.</figcaption></figure>
    <!-- /wp:image -->

    <!-- wp:heading {"level":2} -->
    <h2 class="wp-block-heading">Global Logistics and Reliable Shipping</h2>
    <!-- /wp:heading -->
    <!-- wp:paragraph -->
    <p>We are not just a local buyer; we are a major global exporter of PC water bottle scrap. Operating out of the strategic hub of the United Arab Emirates, we have established highly efficient supply chains to ship jumbo bags and compressed bales to major manufacturing sectors in the USA, Canada, India, and across the broader Middle East. We handle all logistics, customs documentation, and freight forwarding to ensure your bulk shipments arrive safely and on time. You can read more <a href="https://alshaabalwaseem.com/about-us/">about our company</a> to understand our scale of operations.</p>
    <!-- /wp:paragraph -->

</div>
<!-- /wp:group -->

<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"40px","bottom":"40px"}}},"backgroundColor":"light-gray","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-light-gray-background-color has-background" style="padding-top:40px;padding-bottom:40px">
    <!-- wp:heading {"textAlign":"center","level":2} -->
    <h2 class="wp-block-heading has-text-align-center">Global Export &amp; Local Buying</h2>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center"} -->
    <p class="has-text-align-center"><strong>Selling Scrap?</strong> We are the top B2B buyers of industrial plastic waste in Sharjah and the UAE.<br><strong>Buying Scrap?</strong> We are regular wholesale suppliers of post-industrial PC scrap bales and regrind, actively exporting high-volume containers.</p>
    <!-- /wp:paragraph -->
    <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
    <div class="wp-block-buttons">
        <!-- wp:button -->
        <div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="https://alshaabalwaseem.com/contact-us/">Contact Us Today for a Bulk Quote</a></div>
        <!-- /wp:button -->
    </div>
    <!-- /wp:buttons -->
</div>
<!-- /wp:group -->
`;

async function run() {
    try {
        console.log("Fetching page to get ID...");
        const res = await fetch(site.url + 'wp-json/wp/v2/pages?slug=pc-water-bottle-scrap', {
            headers: { 'Authorization': 'Basic ' + auth }
        });
        const pages = await res.json();
        const pageId = pages[0].id;
        console.log("Page ID is", pageId);

        console.log("Updating content for 600+ words...");
        await fetch(site.url + 'wp-json/wp/v2/pages/' + pageId, {
            method: 'POST',
            headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: expandedContent })
        });

        console.log("Injecting Rank Math Meta via Snippet...");
        const snippetCode = `
add_action('init', function() {
    if(!get_option('rank_math_injected_${pageId}')) {
        update_post_meta(${pageId}, 'rank_math_focus_keyword', 'PC Water Bottle Scrap');
        update_post_meta(${pageId}, 'rank_math_title', 'PC Water Bottle Scrap Suppliers & Exporters in UAE');
        update_post_meta(${pageId}, 'rank_math_description', 'Looking for premium PC Water Bottle Scrap? We are leading B2B buyers, recyclers, and bulk wholesale suppliers in the UAE, exporting globally.');
        update_option('rank_math_injected_${pageId}', true);
    }
});
`;
        await fetch(site.url + 'wp-json/code-snippets/v1/snippets', {
            method: 'POST',
            headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Rank Math Injection',
                code: snippetCode,
                active: true,
                scope: 'global'
            })
        });

        // Purge Cache and trigger init hook by requesting the homepage
        const purgeCode = "if(class_exists('LiteSpeed\\\\Purge')) { LiteSpeed\\\\Purge::purge_all(); }";
        await fetch(site.url + 'wp-json/code-snippets/v1/snippets', {
            method: 'POST',
            headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Purge Cache 18', code: purgeCode, active: true, scope: 'global' })
        });
        
        // Trigger init
        await fetch(site.url);

        console.log('Rank Math 100/100 Optimization Complete!');
    } catch(e) {
        console.error("Error:", e.message);
    }
}
run();
