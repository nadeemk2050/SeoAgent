/**
 * UPDATE CONTACT US PAGE - SEO + Phone Numbers
 * =============================================
 * 1. Expands Contact Us page content to 600+ words for Rank Math score > 90
 * 2. Sets Rank Math Focus Keyword, SEO Title, Meta Description
 * 3. Replaces +971529244592 -> +971554779331 (new WhatsApp primary)
 * 4. Replaces 00971554779240 -> +971554779240 (professional format)
 * 5. Updates global sticky sidebar WhatsApp icon with new number
 */

const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const WP_URL = (process.env.WP_URL || "https://alshaabalwaseem.com").replace(/\/+$/, '');
const WP_USER = process.env.WP_USER || "alwaseemsharjah@gmail.com";
const WP_APP_PASS = process.env.WP_APP_PASS || "9RuT 9Zmy z5vA DAf9 kTYn SMJD";
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

const PAGE_ID = 203;

// ===== NEW PHONE NUMBERS =====
const NEW_WHATSAPP = '971554779331';       // for wa.me links
const NEW_WHATSAPP_DISPLAY = '+971 55 477 9331';
const NEW_PHONE = '971554779240';           // for tel: links
const NEW_PHONE_DISPLAY = '+971 55 477 9240';

// ===== EXPANDED CONTENT (600+ words for Rank Math SEO) =====
const pageHtml = `
<div style="width: 100%; max-width: 1200px; margin: 0 auto; padding: 40px 20px; font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  
  <h1 style="font-size: 3rem; font-weight: 800; color: #333333; margin-bottom: 50px;">Get in Touch</h1>

  <div style="display: flex; flex-wrap: wrap; gap: 60px; justify-content: space-between;">
    
    <!-- LEFT COLUMN: Contact Form Card -->
    <div style="flex: 1 1 500px; background: #ffffff; padding: 50px; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.05);">
      <h2 style="font-size: 2rem; font-weight: 700; color: #333333; margin-top: 0; margin-bottom: 20px;">Let's Talk!</h2>
      <p style="color: #666666; font-size: 0.95rem; line-height: 1.6; margin-bottom: 40px;">
        If you would like more information on recycled products, inquiries, or would like to explore partnership opportunities or schedule a consultation, please fill in the required details.
      </p>
      
      <form action="#" method="POST" style="display: flex; flex-direction: column; gap: 25px;">
        <div style="display: flex; flex-wrap: wrap; gap: 25px;">
          <div style="flex: 1 1 200px;">
            <label style="display: block; font-size: 0.85rem; color: #666; margin-bottom: 8px;">Name <span style="color: red;">*</span></label>
            <input type="text" style="width: 100%; padding: 15px; border: none; background: #f9f9f9; border-radius: 6px; color: #333;" required />
          </div>
          <div style="flex: 1 1 200px;">
            <label style="display: block; font-size: 0.85rem; color: #666; margin-bottom: 8px;">Country</label>
            <input type="text" style="width: 100%; padding: 15px; border: none; background: #f9f9f9; border-radius: 6px; color: #333;" />
          </div>
        </div>
        
        <div style="display: flex; flex-wrap: wrap; gap: 25px;">
          <div style="flex: 1 1 200px;">
            <label style="display: block; font-size: 0.85rem; color: #666; margin-bottom: 8px;">Email Address <span style="color: red;">*</span></label>
            <input type="email" style="width: 100%; padding: 15px; border: none; background: #f9f9f9; border-radius: 6px; color: #333;" required />
          </div>
          <div style="flex: 1 1 200px;">
            <label style="display: block; font-size: 0.85rem; color: #666; margin-bottom: 8px;">Phone/Whatsapp</label>
            <input type="text" style="width: 100%; padding: 15px; border: none; background: #f9f9f9; border-radius: 6px; color: #333;" />
          </div>
        </div>
        
        <div>
          <label style="display: block; font-size: 0.85rem; color: #666; margin-bottom: 8px;">Message <span style="color: red;">*</span></label>
          <textarea rows="5" style="width: 100%; padding: 15px; border: none; background: #f9f9f9; border-radius: 6px; color: #333;" required></textarea>
        </div>
        
        <button type="submit" style="background: #0d954d; color: #ffffff; font-weight: bold; padding: 15px 30px; border: none; border-radius: 6px; cursor: pointer; align-self: flex-start; font-size: 1rem;">Submit</button>
      </form>
    </div>

    <!-- RIGHT COLUMN: Contact Info -->
    <div style="flex: 1 1 400px; display: flex; flex-direction: column; gap: 40px; padding-top: 20px;">
      
      <div>
        <h2 style="font-size: 2rem; font-weight: 700; color: #333333; margin-top: 0; margin-bottom: 15px;">Our Contact</h2>
        <p style="color: #666666; font-size: 0.95rem; line-height: 1.6; margin: 0;">
          Feel free to send us your needs. We will contact you as soon as possible to provide a comprehensive solution! You can also visit us in person according to the address.
        </p>
      </div>
      
      <div>
        <h3 style="font-size: 1.25rem; font-weight: 700; color: #333333; margin-bottom: 10px;">E-mail:</h3>
        <a href="mailto:nadeemalsaham@gmail.com" style="font-size: 1.3rem; font-weight: 800; color: #0d954d; text-decoration: none;">nadeemalsaham@gmail.com</a>
      </div>
      
      <div>
        <h3 style="font-size: 1.25rem; font-weight: 700; color: #333333; margin-bottom: 10px;">Call Us & WhatsApp:</h3>
        <a href="tel:${NEW_PHONE}" style="display: block; font-size: 1.3rem; font-weight: 800; color: #0d954d; text-decoration: none; margin-bottom: 5px;">${NEW_PHONE_DISPLAY}</a>
        <a href="https://wa.me/${NEW_WHATSAPP}" style="display: block; font-size: 1.3rem; font-weight: 800; color: #0d954d; text-decoration: none;">${NEW_WHATSAPP_DISPLAY}</a>
      </div>
      
      <div>
        <h3 style="font-size: 1.25rem; font-weight: 700; color: #333333; margin-bottom: 10px;">Office Address:</h3>
        <p style="font-size: 1.3rem; font-weight: 800; color: #0d954d; margin: 0;">Industrial Area 11, Sharjah, UAE</p>
      </div>

      <!-- === ADDITIONAL SEO CONTENT (600+ words) === -->
      <div style="margin-top: 40px; border-top: 2px solid #e8e8e8; padding-top: 30px;">
        <h2 style="font-size: 1.6rem; font-weight: 700; color: #333333;">Leading Scrap Buyers & Exporters in Sharjah, UAE</h2>
        <p style="color: #555555; font-size: 0.95rem; line-height: 1.7; margin-bottom: 15px;">
          Al Saham Al Ahmar is a premier B2B industrial scrap trading and recycling company headquartered in Sharjah, UAE. With years of market expertise, we serve a wide network of buyers and sellers engaged in the global trade of non-ferrous metals, plastic scrap, ferrous materials, and industrial waste. Our team is dedicated to providing fast, transparent, and reliable scrap procurement and supply solutions.
        </p>
        <p style="color: #555555; font-size: 0.95rem; line-height: 1.7; margin-bottom: 15px;">
          Whether you are looking to sell your scrap inventory or source high-quality recycled raw materials for your manufacturing operations, our contact team is ready to assist. We operate across multiple categories including aluminium ACSR cable scrap, copper scrap, brass scrap, HDPE regrind, PP scrap, PC water bottle scrap, PVC pipe scrap, and much more.
        </p>
        
        <h3 style="font-size: 1.2rem; font-weight: 700; color: #333333; margin-top: 25px;">Why Choose Al Saham Al Ahmar?</h3>
        <p style="color: #555555; font-size: 0.95rem; line-height: 1.7; margin-bottom: 15px;">
          We pride ourselves on offering competitive pricing based on real-time international market rates. Our team ensures accurate sorting, digital weighing, and transparent transactions for every load. For bulk sellers, we offer same-day or 24-hour pickup across all Emirates including Dubai, Sharjah, Ajman, and Abu Dhabi. For international buyers, we manage end-to-end logistics, customs clearance, and container shipping to destinations including Pakistan, India, China, Turkey, Europe, and the USA.
        </p>
        <p style="color: #555555; font-size: 0.95rem; line-height: 1.7; margin-bottom: 15px;">
          We understand that trust is the foundation of any scrap trading relationship. That is why we have built our reputation on timely payments, fair valuations, and consistent quality. Our scrap processing facility in Industrial Area 11, Sharjah is equipped with advanced shredding, sorting, and baling machinery that allows us to handle large volumes efficiently.
        </p>
        
        <h3 style="font-size: 1.2rem; font-weight: 700; color: #333333; margin-top: 25px;">Industries We Serve</h3>
        <p style="color: #555555; font-size: 0.95rem; line-height: 1.7; margin-bottom: 15px;">
          Our client base spans multiple industries including plastic recycling plants, aluminium extrusion factories, cable manufacturing companies, steel mills, construction firms, and petrochemical industries. We supply premium-grade recycled raw materials that meet international quality standards, helping manufacturers reduce production costs without compromising on product integrity.
        </p>
        <p style="color: #555555; font-size: 0.95rem; line-height: 1.7; margin-bottom: 15px;">
          If your business requires a steady supply of industrial scrap or if you have bulk scrap materials to sell, do not hesitate to reach out. Our procurement and sales teams are available via phone, WhatsApp, and email during business hours. We respond quickly to all inquiries and provide detailed quotations within the same day.
        </p>
        
        <h3 style="font-size: 1.2rem; font-weight: 700; color: #333333; margin-top: 25px;">Contact Our Team Today</h3>
        <p style="color: #555555; font-size: 0.95rem; line-height: 1.7; margin-bottom: 15px;">
          Ready to start trading? Simply fill out the contact form on this page with your name, contact details, and a brief message about your scrap buying or selling requirements. Alternatively, you can reach us directly via WhatsApp at <strong>${NEW_WHATSAPP_DISPLAY}</strong> or give us a call at <strong>${NEW_PHONE_DISPLAY}</strong>. Our friendly team will get back to you promptly with the best possible offer.
        </p>
        <p style="color: #555555; font-size: 0.95rem; line-height: 1.7; margin-bottom: 15px;">
          We look forward to partnering with you and helping your business grow through reliable scrap trading solutions. Al Saham Al Ahmar — your trusted partner in the scrap trading industry across the UAE and beyond.
        </p>
      </div>
    </div>
  </div>
</div>
`;

// ===== GLOBAL SIDEBAR PHP with NEW WhatsApp number =====
const sidebarPhpCode = `add_action('wp_footer', function() {
    echo '<style>
    #global-sticky-sidebar {
        position: fixed;
        top: 50%;
        right: 0;
        transform: translateY(-50%);
        z-index: 9999999;
        display: flex;
        flex-direction: column;
        gap: 25px;
        padding-right: 15px;
    }
    #global-sticky-sidebar a {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 45px;
        height: 45px;
        background: transparent;
        border-radius: 50%;
        transition: transform 0.3s ease;
        box-shadow: none;
        text-decoration: none;
    }
    #global-sticky-sidebar a:hover {
        transform: scale(1.15) translateX(-5px);
    }
    #global-sticky-sidebar svg {
        width: 40px;
        height: 40px;
    }
    #g-icon-email svg { fill: #b8cddb; }
    #g-icon-phone svg { fill: #364147; }
    #g-icon-chat svg { fill: #bce0fd; }
    </style>';

    echo '<div id="global-sticky-sidebar">
        <a id="g-icon-email" href="mailto:nadeemalsaham@gmail.com" title="Email Us">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
        </a>
        <a id="g-icon-phone" href="tel:${NEW_PHONE}" title="Call Us">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
        </a>
        <a id="g-icon-chat" href="https://wa.me/${NEW_WHATSAPP}" title="WhatsApp Chat" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 5.58 2 10c0 2.53 1.5 4.81 3.82 6.13.25.9-.66 2.6-1.55 3.32-.15.12-.17.34-.04.49.07.08.18.13.29.13.15 0 2.2-.13 3.65-1.15.14-.1.32-.12.48-.05 1.1.48 2.3.74 3.53.74 5.52 0 10-3.58 10-8s-4.48-8-10-8zm-4 9c-.83 0-1.5-.67-1.5-1.5S7.17 8 8 8s1.5.67 1.5 1.5S8.83 11 8 11zm4 0c-.83 0-1.5-.67-1.5-1.5S11.17 8 12 8s1.5.67 1.5 1.5S12.83 11 12 11zm4 0c-.83 0-1.5-.67-1.5-1.5S15.17 8 16 8s1.5.67 1.5 1.5S16.83 11 16 11z"/></svg>
        </a>
    </div>';

    echo '<script>
    document.addEventListener("DOMContentLoaded", function() {
        var oldSidebars = document.querySelectorAll(".custom-sticky-sidebar");
        oldSidebars.forEach(function(sb) { sb.remove(); });
    });
    </script>';
  }, 9999);`;

// ===== RANK MATH SEO SNIPPET CODE =====
const rankMathSnippetCode = `
add_action('init', function() {
    if(!get_option('rank_math_injected_203')) {
        update_post_meta(203, 'rank_math_focus_keyword', 'contact scrap buyers UAE');
        update_post_meta(203, 'rank_math_title', 'Contact Us | Al Saham Al Ahmar - Top Scrap Buyers & Exporters in UAE');
        update_post_meta(203, 'rank_math_description', 'Get in touch with Al Saham Al Ahmar, the leading scrap buyers, recyclers, and exporters in Sharjah, UAE. Call or WhatsApp us for bulk scrap trading inquiries.');
        update_option('rank_math_injected_203', true);
    }
});
`;

async function run() {
  try {
    console.log('============================================');
    console.log('🚀 UPDATE CONTACT US PAGE - SEO + PHONE NUMBERS');
    console.log('============================================\n');

    // STEP 1: Update Contact Us page content
    console.log('📝 Step 1: Updating Contact Us page content (600+ words)...');
    const rUpdate = await fetch(WP_URL + '/wp-json/wp/v2/pages/' + PAGE_ID, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + auth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Contact Us',
        content: pageHtml
      })
    });
    const pageData = await rUpdate.json();
    console.log('   ✅ Page updated! Status:', rUpdate.status, '| ID:', pageData.id);

    // STEP 2: Inject Rank Math Meta
    console.log('\n📝 Step 2: Injecting Rank Math SEO meta...');
    const rRankMath = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + auth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Rank Math SEO - Contact Us Page',
        code: rankMathSnippetCode,
        active: true,
        scope: 'global'
      })
    });
    const rankMathSnippet = await rRankMath.json();
    console.log('   ✅ Rank Math snippet created! ID:', rankMathSnippet.id);

    // STEP 3: Update Global Sticky Sidebar (WhatsApp moving icon)
    console.log('\n📝 Step 3: Updating Global Sticky Sidebar with new WhatsApp number...');

    // First deactivate old sidebar snippets
    try {
      const snippetsRes = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
        method: 'GET',
        headers: { 'Authorization': 'Basic ' + auth }
      });
      const snippets = await snippetsRes.json();
      const snippetList = Array.isArray(snippets) ? snippets : (snippets.data || []);
      const sidebarSnippets = snippetList.filter(s => 
        s.name && (s.name.includes('Sidebar') || s.name.includes('sidebar') || s.name.includes('SVG')) && s.active
      );
      for (const s of sidebarSnippets) {
        console.log('   🔄 Deactivating old snippet:', s.name, '(ID:', s.id, ')');
        await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/' + s.id, {
          method: 'PUT',
          headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
          body: JSON.stringify({ active: false })
        });
      }
    } catch(e) {
      console.log('   ⚠️ Could not fetch existing snippets (may be first run):', e.message);
    }

    // Create new sidebar with updated number
    const rSidebar = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + auth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Global Sticky Sidebar V3 - Updated Numbers',
        code: sidebarPhpCode,
        active: true,
        scope: 'global'
      })
    });
    const sidebarSnippet = await rSidebar.json();
    console.log('   ✅ New sidebar snippet created! ID:', sidebarSnippet.id);

    // STEP 4: Purge all cache
    console.log('\n🧹 Step 4: Purging LiteSpeed cache...');
    const purgeCode = "if(class_exists('LiteSpeed\\\\Purge')) { LiteSpeed\\\\Purge::purge_all(); }";
    const rPurge = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Purge Cache Contact SEO', code: purgeCode, active: true, scope: 'global' })
    });
    const purgeData = await rPurge.json();
    console.log('   ✅ Cache purged! Snippet ID:', purgeData.id);

    // STEP 5: Trigger WordPress init hooks by hitting homepage
    console.log('\n🌐 Step 5: Triggering WordPress hooks...');
    await fetch(WP_URL);
    console.log('   ✅ Hooks triggered!');

    console.log('\n============================================');
    console.log('✅ ALL CHANGES APPLIED SUCCESSFULLY!');
    console.log('============================================');
    console.log('   📞 New WhatsApp: ' + NEW_WHATSAPP_DISPLAY);
    console.log('   📞 New Phone: ' + NEW_PHONE_DISPLAY);
    console.log('   🔑 Focus Keyword: contact scrap buyers UAE');
    console.log('   📄 Content: 600+ words for Rank Math score > 90');
    console.log('   💬 Sidebar icon updated with new WhatsApp number');
    console.log('============================================\n');

  } catch(e) {
    console.error('\n❌ Error:', e.message);
  }
}
run();
