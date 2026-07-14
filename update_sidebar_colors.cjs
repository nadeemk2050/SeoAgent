/**
 * UPDATE SIDEBAR ICON COLORS + FIX HDPE PAGE TEXT
 * ================================================
 * 1. WhatsApp icon → WhatsApp green (#25D366)
 * 2. Phone1 icon → Purple (#7B2D8E)
 * 3. Phone2 icon → Orange (#FF6B35)
 * 4. Email icon → Gmail "M" style with orange→green gradient
 * 5. Fix HDPE page body text color from #f0f0f0 → #333333
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

const NEW_WA = '971554779331';
const NEW_WA_DISPLAY = '+971 55 477 9331';
const NEW_PHONE = '971554779240';
const NEW_PHONE_DISPLAY = '+971 55 477 9240';
const EXTRA_PHONE = '971527455831';
const EXTRA_PHONE_DISPLAY = '+971 52 745 5831';

// ===== UPDATED SIDEBAR with new colors + Gmail-style email icon =====
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
        gap: 18px;
        padding-right: 12px;
    }
    #global-sticky-sidebar a {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 42px;
        height: 42px;
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
        width: 36px;
        height: 36px;
    }
    /* Email - Gmail style (inline gradient) */
    #g-icon-email svg { }
    /* Phone 1 - Purple */
    #g-icon-phone svg { fill: #7B2D8E; }
    /* Phone 2 - Orange */
    #g-icon-phone2 svg { fill: #FF6B35; }
    /* WhatsApp - WhatsApp Green */
    #g-icon-chat svg { fill: #25D366; }
    </style>';

    echo '<div id="global-sticky-sidebar">
        <!-- Gmail-style Email Icon with orange-to-green gradient -->
        <a id="g-icon-email" href="mailto:nadeemalsaham@gmail.com" title="Email Us">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="eg" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#FF6B35"/>
                        <stop offset="100%" stop-color="#4CAF50"/>
                    </linearGradient>
                </defs>
                <!-- Gmail M-style envelope with orange-to-green gradient -->
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="url(#eg)"/>
            </svg>
        </a>
        <!-- Phone 1 - Purple -->
        <a id="g-icon-phone" href="tel:${NEW_PHONE}" title="Call ${NEW_PHONE_DISPLAY}">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
        </a>
        <!-- Phone 2 - Orange -->
        <a id="g-icon-phone2" href="tel:${EXTRA_PHONE}" title="Call ${EXTRA_PHONE_DISPLAY}">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
        </a>
        <!-- WhatsApp - WhatsApp Green -->
        <a id="g-icon-chat" href="https://wa.me/${NEW_WA}" title="WhatsApp ${NEW_WA_DISPLAY}" target="_blank" rel="noopener">
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

async function run() {
  try {
    console.log('============================================');
    console.log('🎨 SIDEBAR COLORS + HDPE PAGE FIX');
    console.log('============================================\n');

    // STEP 1: Update sidebar colors
    console.log('📋 Step 1: Updating sticky sidebar colors...');
    
    // Deactivate old sidebar snippets
    try {
      const snippetsRes = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
        headers: { 'Authorization': 'Basic ' + auth }
      });
      const snippets = await snippetsRes.json();
      const snippetList = Array.isArray(snippets) ? snippets : (snippets?.data || []);
      
      for (const s of snippetList) {
        if (s.name && (s.name.includes('Sidebar') || s.name.includes('sidebar')) && s.active) {
          console.log('   🔄 Deactivating old:', s.name, '(ID:', s.id, ')');
          await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/' + s.id, {
            method: 'PUT',
            headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
            body: JSON.stringify({ active: false })
          });
        }
      }
    } catch(e) {
      console.log('   ⚠️ Snippet fetch:', e.message);
    }

    // Create new sidebar
    const rSidebar = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Global Sticky Sidebar V5 - Colored Icons',
        code: sidebarPhpCode,
        active: true,
        scope: 'global'
      })
    });
    const sidebarData = await rSidebar.json();
    console.log('   ✅ New sidebar created! ID:', sidebarData.id);

    // STEP 2: Fix HDPE page text color
    console.log('\n📋 Step 2: Fixing HDPE page white text...');
    const rHdpe = await fetch(WP_URL + '/wp-json/wp/v2/pages/220', {
      headers: { 'Authorization': 'Basic ' + auth }
    });
    const hdpePage = await rHdpe.json();
    let hdpeContent = hdpePage.content?.rendered || '';
    
    // Fix body text color from #f0f0f0 to #333333
    if (hdpeContent.includes('color: #f0f0f0')) {
      hdpeContent = hdpeContent.replace('color: #f0f0f0', 'color: #333333');
      hdpeContent = hdpeContent.replace('color:#f0f0f0', 'color:#333333');
      
      await fetch(WP_URL + '/wp-json/wp/v2/pages/220', {
        method: 'POST',
        headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: hdpeContent })
      });
      console.log('   ✅ HDPE page text color fixed!');
    } else {
      console.log('   ✅ HDPE page text already fixed or not found');
    }

    // STEP 3: Purge cache
    console.log('\n🧹 Step 3: Purging cache...');
    const purgeCode = "if(class_exists('LiteSpeed\\\\Purge')) { LiteSpeed\\\\Purge::purge_all(); }";
    await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Purge Cache Colors', code: purgeCode, active: true, scope: 'global' })
    });
    
    // Warm caches
    await fetch(WP_URL + '/contact-us/');
    await fetch(WP_URL + '/hdpe100-regrind-scrap-trading/');

    console.log('\n============================================');
    console.log('✅ ALL UPDATES APPLIED!');
    console.log('============================================');
    console.log('   💬 WhatsApp → Green (#25D366)');
    console.log('   📞 Phone 1 → Purple (#7B2D8E)');
    console.log('   📞 Phone 2 → Orange (#FF6B35)');
    console.log('   ✉️ Email → Gmail-style orange→green gradient');
    console.log('   📄 HDPE page text → Dark (#333333)');
    console.log('============================================\n');

  } catch(e) {
    console.error('\n❌ Error:', e.message);
  }
}
run();
