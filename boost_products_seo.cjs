/**
 * BOOST Products Page - Fix H1 duplicate + reach 600+ words
 */
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

const PAGE_ID = 357;
const KEYWORD = 'scrap products for sale UAE';
const seoTitle = 'Top 5 Scrap Products for Sale UAE | Al Saham Al Ahmar';
const seoDescription = 'Browse premium scrap products for sale UAE including HDPE, PVC, PC, aluminium, and copper scrap. Best prices, instant quotes, and global export available.';

// Content with H1 removed (theme provides it), more text to reach 600+ words
const content = `
<p style="color: #444; font-size: 1.05rem; line-height: 1.8; margin-bottom: 20px;">
  Welcome to our marketplace for premium <strong>scrap products for sale UAE</strong>. At Al Saham Al Ahmar, we connect buyers and sellers across the global scrap trading industry. Whether you are looking for high-quality industrial scrap materials to purchase or want to list your scrap inventory for sale, this is your dedicated platform. We update our listings regularly to reflect the latest market demands, available stock, and competitive pricing. Browse our current offerings below and feel free to reach out for bulk quotes, sample requests, or partnership inquiries.
</p>

<figure style="margin: 25px 0; text-align: center;">
  <img src="https://alshaabalwaseem.com/wp-content/uploads/2026/05/logo.png" alt="scrap products for sale UAE - Al Saham Al Ahmar premium scrap materials" style="max-width: 100%; height: auto; border-radius: 8px;" />
  <figcaption style="color: #888; font-size: 0.85rem; margin-top: 8px;">Premium scrap products for sale UAE — quality you can trust from Al Saham Al Ahmar.</figcaption>
</figure>

<h2 style="font-size: 1.5rem; font-weight: 700; color: #1a1a1a; margin-top: 35px;">Why Buy Scrap Products for Sale UAE?</h2>

<p style="color: #444; font-size: 1.05rem; line-height: 1.8; margin-bottom: 18px;">
  The UAE has emerged as a global hub for scrap trading, and our platform makes it easy to find verified <strong>scrap products for sale UAE</strong>. We offer a wide range of materials including ferrous and non-ferrous metals, plastic scrap, and industrial recyclables. Each listing includes detailed specifications, available quantities, pricing, and origin information so you can make informed purchasing decisions with confidence.
</p>

<p style="color: #444; font-size: 1.05rem; line-height: 1.8; margin-bottom: 18px;">
  Our team at Al Saham Al Ahmar personally verifies every product listing to ensure accuracy and quality. When you browse our <strong>scrap products for sale UAE</strong>, you are accessing a curated selection of materials from trusted suppliers across the Emirates including Sharjah, Dubai, Abu Dhabi, Ajman, and Ras Al Khaimah. We maintain strict quality standards and only partner with verified sellers who meet our rigorous requirements for material grading, sorting, and preparation.
</p>

<h2 style="font-size: 1.5rem; font-weight: 700; color: #1a1a1a; margin-top: 35px;">Current Scrap Products Available</h2>

<h3 style="font-size: 1.2rem; font-weight: 700; color: #1a1a1a; margin-top: 25px;">1. HDPE100 Regrind – Premium Quality</h3>
<p style="color: #444; font-size: 1.05rem; line-height: 1.8; margin-bottom: 15px;">
  High-density polyethylene regrind sourced from post-industrial PE100 pipes. 99.9% pure, hot-washed, moisture under 0.5%. Ideal for pipe extrusion, injection molding, and blow molding applications across multiple industries. Available in jumbo bags for bulk export. <a href="https://alshaabalwaseem.com/hdpe100-regrind-scrap-trading/" style="color: #0d954d;">Learn more about our HDPE scrap</a>.
</p>

<h3 style="font-size: 1.2rem; font-weight: 700; color: #1a1a1a; margin-top: 25px;">2. Aluminium ACSR Cable Scrap</h3>
<p style="color: #444; font-size: 1.05rem; line-height: 1.8; margin-bottom: 15px;">
  High-conductivity aluminium cable scrap from decommissioned power lines across the GCC region. Cleanly stripped, free from steel core and insulation residues. Suitable for smelters and rerolling mills worldwide. <a href="https://alshaabalwaseem.com/aluminium-acsr-scrap/" style="color: #0d954d;">View aluminium ACSR scrap details</a>.
</p>

<h3 style="font-size: 1.2rem; font-weight: 700; color: #1a1a1a; margin-top: 25px;">3. PC Water Bottle Scrap Regrind</h3>
<p style="color: #444; font-size: 1.05rem; line-height: 1.8; margin-bottom: 15px;">
  Clean polycarbonate water bottle scrap available in regrind, crushed flakes, and compressed bales. Available in light blue, clear, and dull natural color variations. Steam-washed at 80–90°C for maximum purity levels. <a href="https://alshaabalwaseem.com/pc-water-bottle-scrap/" style="color: #0d954d;">Check PC water bottle scrap specs</a>.
</p>

<h3 style="font-size: 1.2rem; font-weight: 700; color: #1a1a1a; margin-top: 25px;">4. PVC Pipe Scrap – White &amp; Mixed</h3>
<p style="color: #444; font-size: 1.05rem; line-height: 1.8; margin-bottom: 15px;">
  Post-industrial PVC pipe scrap in white, grey, and mixed grades. Sourced from Japan, USA, and European markets. Processed into consistent regrind and dense bales for efficient global export logistics. <a href="https://alshaabalwaseem.com/pvc-pipe-scrap-suppliers/" style="color: #0d954d;">Browse PVC pipe scrap options</a>.
</p>

<h3 style="font-size: 1.2rem; font-weight: 700; color: #1a1a1a; margin-top: 25px;">5. Manila Rope / PP Ship Rope Scrap</h3>
<p style="color: #444; font-size: 1.05rem; line-height: 1.8; margin-bottom: 15px;">
  Heavy-duty manila and polypropylene ship rope scrap available for industrial recycling programs. Suitable for fibre recovery, plastic granulation operations, and direct industrial reuse applications. <a href="https://alshaabalwaseem.com/manila-pp-ship-rope-scrap/" style="color: #0d954d;">See Manila rope scrap details</a>.
</p>

<h2 style="font-size: 1.5rem; font-weight: 700; color: #1a1a1a; margin-top: 35px;">How to Purchase Scrap Products for Sale UAE</h2>

<p style="color: #444; font-size: 1.05rem; line-height: 1.8; margin-bottom: 18px;">
  Buying <strong>scrap products for sale UAE</strong> from Al Saham Al Ahmar is a straightforward process. Browse our listings above, identify the materials that match your manufacturing or trading requirements, and contact our dedicated sales team for current pricing and stock availability. We offer flexible payment terms for established buyers, significant bulk discounts for regular container-volume orders, and comprehensive worldwide shipping through our well-established logistics partner network.
</p>

<p style="color: #444; font-size: 1.05rem; line-height: 1.8; margin-bottom: 18px;">
  Every order placed through our platform includes full documentation including certified weight certificates, detailed material analysis reports, and customs-ready export paperwork for smooth international shipping. Our experienced logistics team coordinates all aspects including container loading, freight booking, and door-to-door delivery to destinations across the Middle East, Asia, Europe, Africa, and North and South America.
</p>

<h2 style="font-size: 1.5rem; font-weight: 700; color: #1a1a1a; margin-top: 35px;">Sell Your Scrap Through Our Platform</h2>

<p style="color: #444; font-size: 1.05rem; line-height: 1.8; margin-bottom: 18px;">
  If you have scrap materials to sell, we welcome you to list your <strong>scrap products for sale UAE</strong> on our growing platform. We are actively buying aluminium scrap, copper scrap, brass scrap, plastic scrap, HDPE regrind, PVC scrap, and many other industrial materials. Our professional procurement team provides highly competitive pricing based on real-time international market rates, offers fast pickup services across all seven Emirates, and guarantees transparent digital weighing and prompt payment processes.
</p>

<p style="color: #444; font-size: 1.05rem; line-height: 1.8; margin-bottom: 18px;">
  To get started as a seller, simply <a href="https://alshaabalwaseem.com/contact-us/" style="color: #0d954d; font-weight: 600;">contact our procurement team</a> via phone, WhatsApp, or email. Send us comprehensive details about your available material including type, estimated quantity, location, and preferred pricing, and we will respond with a firm quotation within the same business day. At Al Saham Al Ahmar, we are committed to building long-term, mutually beneficial trading relationships founded on trust, reliability, transparency, and shared growth in the global scrap industry.
</p>

<div style="background: #f0faf4; padding: 25px; border-radius: 8px; margin-top: 30px; text-align: center; border: 1px solid #d4edda;">
  <p style="font-size: 1.1rem; font-weight: 600; color: #1a1a1a; margin-bottom: 10px;">Ready to buy or sell scrap materials today?</p>
  <p style="color: #444; font-size: 1rem;">
    Call us: <strong>+971 55 477 9240</strong> | WhatsApp: <strong>+971 55 477 9331</strong><br>
    Email: <strong>nadeemalsaham@gmail.com</strong>
  </p>
</div>
`;

async function run() {
  try {
    console.log('🚀 Boosting Products page SEO...');
    
    const r = await fetch(WP_URL + '/wp-json/wp/v2/pages/' + PAGE_ID, {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Products & Demands',
        content: content,
        meta: {
          rank_math_title: seoTitle,
          rank_math_description: seoDescription,
          rank_math_focus_keyword: KEYWORD
        }
      })
    });
    const d = await r.json();
    console.log('✅ Page updated!');

    // Purge
    const purgeCode = "if(class_exists('LiteSpeed\\\\Purge')) { LiteSpeed\\\\Purge::purge_all(); }";
    await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Purge Boost', code: purgeCode, active: true, scope: 'global' })
    });
    await fetch(WP_URL + '/products-demands/');
    console.log('✅ Cache purged!');
  } catch(e) {
    console.error('❌', e.message);
  }
}
run();
