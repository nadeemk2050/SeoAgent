const fs = require('fs');
const sites = JSON.parse(fs.readFileSync('sites.json'));
const site = sites.find(s => s.url.includes('alshaabalwaseem.com'));
const auth = Buffer.from(site.user + ':' + site.pass).toString('base64');

const htmlContent = `
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"50px","bottom":"50px"},"margin":{"top":"0px","bottom":"0px"}}},"backgroundColor":"background","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-background-background-color has-background" style="margin-top:0px;margin-bottom:0px;padding-top:50px;padding-bottom:50px">
    <!-- wp:heading {"textAlign":"center","level":1} -->
    <h1 class="wp-block-heading has-text-align-center">PVC Pipe Scrap Supplier | Bulk uPVC Scrap Pipes for Sale</h1>
    <!-- /wp:heading -->

    <!-- wp:paragraph {"align":"center"} -->
    <p class="has-text-align-center">Looking to buy or sell <strong>PVC pipe scrap</strong>? We are the leading global buyers and suppliers of bulk PVC and uPVC pipe scrap, regrind, and bales. Connecting major recycling markets across Asia, the Middle East, Europe, and the Americas.</p>
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
            <h2 class="wp-block-heading">Global Supply &amp; Demand: The PVC Pipe Scrap Market</h2>
            <!-- /wp:heading -->
            <!-- wp:paragraph -->
            <p>At Al Saham Al Ahmar, we understand the immense value of rigid polyvinyl chloride (PVC) and unplasticized polyvinyl chloride (uPVC) in the modern circular economy. The demand for high-quality recycled PVC is surging, and as a premier PVC pipe scrap supplier, we facilitate massive volumes of this crucial industrial material across international borders.</p>
            <!-- /wp:paragraph -->
            <!-- wp:paragraph -->
            <p>Our operations are designed to handle both post-industrial and post-consumer PVC scrap pipe. We ensure that every batch, whether it is mixed PVC pipe scrap, clean white PVC conduit, or heavy-duty grey water pipes, meets the strict purity requirements of modern recycling extrusion plants.</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->

        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:heading {"level":2} -->
            <h2 class="wp-block-heading">Technical Specifications &amp; Quality</h2>
            <!-- /wp:heading -->
            <!-- wp:table {"className":"is-style-regular"} -->
            <figure class="wp-block-table is-style-regular"><table><tbody>
            <tr><td><strong>Material Type</strong></td><td>Rigid PVC Pipe Scrap, uPVC Scrap Pipes</td></tr>
            <tr><td><strong>Forms Available</strong></td><td>Baled, Crushed, Regrind, Flakes, Shredded PVC</td></tr>
            <tr><td><strong>Available Colors</strong></td><td>White PVC pipe scrap, Grey PVC pipe scrap, Mixed colors</td></tr>
            <tr><td><strong>Quality &amp; Condition</strong></td><td>Clean, Sorted, Contamination-free post-industrial</td></tr>
            <tr><td><strong>Packaging</strong></td><td>Jumbo Bags, Bundles, Custom Export Bales</td></tr>
            <tr><td><strong>Minimum Order (MOQ)</strong></td><td>Contact us for bulk wholesale container quantities</td></tr>
            </tbody></table></figure>
            <!-- /wp:table -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
    
    <!-- wp:heading {"level":2} -->
    <h2 class="wp-block-heading">Our Sourcing &amp; Export Destinations</h2>
    <!-- /wp:heading -->
    <!-- wp:paragraph -->
    <p>Being a true global player means maintaining a vast international network. We actively source and purchase massive tonnages of PVC pipe scrap from advanced recycling infrastructures in <strong>Japan, Malaysia, Singapore, Saudi Arabia, the USA, and Europe</strong>. By importing from these strictly regulated regions, we guarantee our buyers receive only the highest-grade raw materials.</p>
    <!-- /wp:paragraph -->
    <!-- wp:paragraph -->
    <p>We then process, consolidate, and export these high-quality PVC regrind and bales to rapidly developing industrial manufacturing sectors. Our primary export destinations include the <strong>United Arab Emirates (UAE), Pakistan, Oman, India, and Korea</strong>. Factories in these nations rely on our consistent monthly supply to produce new plumbing pipes, electrical conduits, window profiles, and various construction materials at highly competitive costs.</p>
    <!-- /wp:paragraph -->

    <!-- wp:heading {"level":2} -->
    <h2 class="wp-block-heading">The Recycling Process for Rigid PVC</h2>
    <!-- /wp:heading -->
    <!-- wp:paragraph -->
    <p>Recycling rigid PVC scrap pipe is a sophisticated process that significantly reduces the carbon footprint of the plastics industry. When we acquire raw PVC plumbing pipe scrap or conduit scrap, it is meticulously inspected to ensure it is free from non-compatible plastics like HDPE or PET, as well as metals or heavy soil. It is then mechanically shredded and ground down into uniform PVC flakes or granules. This regrind is then ready to be melted down and extruded by our manufacturing partners. Utilizing our premium uPVC scrap pipes saves massive amounts of energy compared to synthesizing virgin PVC resin.</p>
    <!-- /wp:paragraph -->
    
    <!-- wp:image {"id":233,"sizeSlug":"large","linkDestination":"none"} -->
    <figure class="wp-block-image size-large"><img src="https://alshaabalwaseem.com/wp-content/uploads/2026/05/logo.png" alt="PVC Pipe Scrap Supplier and uPVC regrind bales" class="wp-image-233"/><figcaption class="wp-element-caption">Bulk containers of premium PVC and uPVC pipe scrap ready for global export.</figcaption></figure>
    <!-- /wp:image -->

    <!-- wp:heading {"level":2} -->
    <h2 class="wp-block-heading">Why Partner with Us for PVC Scrap?</h2>
    <!-- /wp:heading -->
    <!-- wp:paragraph -->
    <p>Finding a reliable bulk PVC pipe scrap supplier can be challenging. Many buyers struggle with inconsistent quality, high moisture content, or unreliable shipping schedules. At Al Saham Al Ahmar, transparency and consistency are our core values. We provide clear documentation, accurate PVC pipe scrap prices per ton, and flexible Incoterms (FOB/CIF) to suit your specific import requirements. Whether you are searching for "PVC scrap near me" in the UAE or need a reliable exporter to ship containers to India or Korea, our logistics team is equipped to handle your bulk orders efficiently.</p>
    <!-- /wp:paragraph -->

</div>
<!-- /wp:group -->

<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"40px","bottom":"40px"}}},"backgroundColor":"light-gray","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-light-gray-background-color has-background" style="padding-top:40px;padding-bottom:40px">
    <!-- wp:heading {"textAlign":"center","level":2} -->
    <h2 class="wp-block-heading has-text-align-center">Get a Bulk Wholesale Quote Today</h2>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center"} -->
    <p class="has-text-align-center"><strong>Are you a Buyer?</strong> Connect with us for reliable supply and current prices for white, grey, and mixed PVC pipe scrap regrind and bales.<br><strong>Are you a Seller?</strong> We buy bulk PVC waste from the USA, Europe, Japan, and the Middle East.</p>
    <!-- /wp:paragraph -->
    <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
    <div class="wp-block-buttons">
        <!-- wp:button -->
        <div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="https://wa.me/971529244592" target="_blank" rel="noopener">Contact Us on WhatsApp Now</a></div>
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
                title: 'PVC Pipe Scrap Suppliers',
                content: htmlContent,
                status: 'publish',
                slug: 'pvc-pipe-scrap-suppliers'
            })
        });
        const pageData = await res.json();
        const pageId = pageData.id;
        console.log("Page created! URL:", pageData.link);
        console.log("Page ID is", pageId);

        console.log("Creating Code Snippet for Rank Math Meta & Schema...");
        const snippetCode = `
add_action('wp_head', function() {
    if (is_page('pvc-pipe-scrap-suppliers')) {
        $schema = [
            "@context" => "https://schema.org/",
            "@type" => "Product",
            "name" => "PVC Pipe Scrap & uPVC Regrind",
            "image" => "https://alshaabalwaseem.com/wp-content/uploads/2026/05/logo.png",
            "description" => "Bulk wholesale PVC pipe scrap, uPVC scrap pipes, bales, and regrind. Sourcing from Japan, USA, Europe. Exporting to UAE, India, Pakistan, Oman, and Korea.",
            "brand" => [
                "@type" => "Brand",
                "name" => "Al Saham Al Ahmar"
            ],
            "offers" => [
                "@type" => "Offer",
                "url" => "https://alshaabalwaseem.com/pvc-pipe-scrap-suppliers/",
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
    if(!get_option('rank_math_pvc_injected_${pageId}')) {
        update_post_meta(${pageId}, 'rank_math_focus_keyword', 'pvc pipe scrap');
        update_post_meta(${pageId}, 'rank_math_title', 'PVC Pipe Scrap Supplier | Bulk uPVC Scrap Pipes for Sale');
        update_post_meta(${pageId}, 'rank_math_description', 'Looking for a reliable PVC pipe scrap supplier? We buy and sell bulk uPVC scrap pipes, bales, and regrind globally. Fast quotes and reliable shipping.');
        update_option('rank_math_pvc_injected_${pageId}', true);
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
                name: 'PVC Scrap SEO Data & Schema',
                code: snippetCode,
                active: true,
                scope: 'global'
            })
        });
        console.log("Snippet injected!");

        // Trigger init to run the meta injection
        await fetch(site.url);
        
        // Purge Cache
        const purgeCode = "if(class_exists('LiteSpeed\\\\Purge')) { LiteSpeed\\\\Purge::purge_all(); }";
        await fetch(site.url + 'wp-json/code-snippets/v1/snippets', {
            method: 'POST',
            headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Purge Cache 19', code: purgeCode, active: true, scope: 'global' })
        });
        console.log('Cache Purged!');
        
    } catch(e) {
        console.error("Error:", e.message);
    }
}
run();
