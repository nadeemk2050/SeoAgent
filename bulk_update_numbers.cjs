/**
 * BULK PHONE NUMBER UPDATE - All Pages
 * =====================================
 * Changes across ALL pages:
 *   wa.me/971529244592  →  wa.me/971554779331
 *   +971529244592       →  +971554779331
 *   +971 52 924 4592    →  +971 55 477 9331
 *   tel:00971554779240   →  tel:971554779240
 *   00971554779240       →  +971554779240
 * 
 * Also adds +971527455831 as an extra calling number on the Contact Us page
 * and updates the global sticky sidebar with all 3 contact points.
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

// Replacement map: old strings -> new strings (applied in order to content)
const replacements = [
  // WhatsApp links
  ['wa.me/971529244592', 'wa.me/' + NEW_WA],
  // Plain WhatsApp number
  ['+971529244592', NEW_WA],
  // Old WhatsApp display format
  ['+971 52 924 4592', NEW_WA_DISPLAY],
  // Tel links with old format
  ['tel:00971554779240', 'tel:' + NEW_PHONE],
  // Old phone number with 00 prefix (in text)
  ['00971554779240', NEW_PHONE_DISPLAY],
];

// ===== GLOBAL STICKY SIDEBAR with ALL 3 numbers =====
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
    #g-icon-email svg { fill: #b8cddb; }
    #g-icon-phone svg { fill: #364147; }
    #g-icon-chat svg { fill: #bce0fd; }
    #g-icon-phone2 svg { fill: #364147; }
    </style>';

    echo '<div id="global-sticky-sidebar">
        <a id="g-icon-email" href="mailto:nadeemalsaham@gmail.com" title="Email Us">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
        </a>
        <a id="g-icon-phone" href="tel:${NEW_PHONE}" title="Call ${NEW_PHONE_DISPLAY}">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
        </a>
        <a id="g-icon-phone2" href="tel:${EXTRA_PHONE}" title="Call ${EXTRA_PHONE_DISPLAY}">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
        </a>
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

function applyReplacements(text) {
  for (const [oldStr, newStr] of replacements) {
    text = text.split(oldStr).join(newStr);
  }
  return text;
}

async function run() {
  try {
    console.log('============================================');
    console.log('📞 BULK PHONE NUMBER UPDATE - ALL PAGES');
    console.log('============================================\n');

    // STEP 1: Fetch all pages
    console.log('📋 Fetching all pages...');
    const r = await fetch(WP_URL + '/wp-json/wp/v2/pages?per_page=100', {
      headers: { 'Authorization': 'Basic ' + auth }
    });
    const pages = await r.json();
    console.log('   Total pages:', pages.length, '\n');

    // STEP 2: Update each page content
    let updatedCount = 0;
    for (const p of pages) {
      const rawContent = p.content?.raw || p.content?.rendered || '';
      const newContent = applyReplacements(rawContent);
      
      if (newContent !== rawContent) {
        console.log('   🔄 Updating page ' + p.id + ' | ' + p.slug + ' | "' + (p.title?.rendered || '') + '"');
        
        await fetch(WP_URL + '/wp-json/wp/v2/pages/' + p.id, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + auth,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ content: newContent })
        });
        updatedCount++;
      }
    }
    console.log('\n   ✅ Updated ' + updatedCount + ' pages with new numbers!\n');

    // STEP 3: Update Contact Us page with extra number
    console.log('📝 Adding extra calling number +971527455831 to Contact Us page...');
    const rContact = await fetch(WP_URL + '/wp-json/wp/v2/pages/203', {
      headers: { 'Authorization': 'Basic ' + auth }
    });
    const contactPage = await rContact.json();
    let contactContent = contactPage.content?.raw || contactPage.content?.rendered || '';
    
    // Add the extra number in the "Call Us & WhatsApp" section
    if (contactContent.includes('Call Us & WhatsApp')) {
      contactContent = contactContent.replace(
        '<a href="tel:971554779240" style="display: block; font-size: 1.3rem; font-weight: 800; color: #0d954d; text-decoration: none; margin-bottom: 5px;">+971 55 477 9240</a>',
        '<a href="tel:971554779240" style="display: block; font-size: 1.3rem; font-weight: 800; color: #0d954d; text-decoration: none; margin-bottom: 5px;">+971 55 477 9240</a>\n        <a href="tel:' + EXTRA_PHONE + '" style="display: block; font-size: 1.3rem; font-weight: 800; color: #0d954d; text-decoration: none; margin-bottom: 5px;">' + EXTRA_PHONE_DISPLAY + '</a>'
      );
      
      await fetch(WP_URL + '/wp-json/wp/v2/pages/203', {
        method: 'POST',
        headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: contactContent })
      });
      console.log('   ✅ Extra number added to Contact Us page!\n');
    }

    // STEP 4: Update global sticky sidebar
    console.log('💬 Updating global sticky sidebar with all 3 numbers...');
    
    // Deactivate old sidebar snippets
    try {
      const snippetsRes = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
        headers: { 'Authorization': 'Basic ' + auth }
      });
      const snippets = await snippetsRes.json();
      const snippetList = Array.isArray(snippets) ? snippets : (snippets?.data || []);
      
      for (const s of snippetList) {
        if (s.name && (s.name.includes('Sidebar') || s.name.includes('sidebar') || s.name.includes('SVG')) && s.active) {
          console.log('   🔄 Deactivating old snippet:', s.name, '(ID:', s.id, ')');
          await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/' + s.id, {
            method: 'PUT',
            headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
            body: JSON.stringify({ active: false })
          });
        }
      }
    } catch(e) {
      console.log('   ⚠️ Snippet fetch warning:', e.message);
    }

    // Create new sidebar with all numbers
    await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Global Sticky Sidebar V4 - 3 Numbers',
        code: sidebarPhpCode,
        active: true,
        scope: 'global'
      })
    });
    console.log('   ✅ New sidebar snippet created!\n');

    // STEP 5: Purge all cache
    console.log('🧹 Purging cache...');
    const purgeCode = "if(class_exists('LiteSpeed\\\\Purge')) { LiteSpeed\\\\Purge::purge_all(); }";
    await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Purge Cache Bulk Numbers', code: purgeCode, active: true, scope: 'global' })
    });
    
    // Warm cache
    await fetch(WP_URL + '/contact-us/');
    await fetch(WP_URL + '/');

    console.log('\n============================================');
    console.log('✅ BULK UPDATE COMPLETE!');
    console.log('============================================');
    console.log('   Pages updated: ' + updatedCount);
    console.log('   Old WhatsApp: 971529244592 → ' + NEW_WA);
    console.log('   Old Phone: 00971554779240 → ' + NEW_PHONE_DISPLAY);
    console.log('   Extra number added: ' + EXTRA_PHONE_DISPLAY);
    console.log('   Sidebar: Email + Phone1 + Phone2 + WhatsApp');
    console.log('============================================\n');

  } catch(e) {
    console.error('\n❌ Error:', e.message);
  }
}
run();
