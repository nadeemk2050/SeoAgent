/**
 * ADD FACEBOOK ICON (Top-Left) + CREATE BLOG/POSTS PAGE
 * ======================================================
 * 1. Fixed Facebook icon at top-left of every page → https://www.facebook.com/profile.php?id=61591928459525
 * 2. Create "Products" page as a blog/posts archive page
 * 3. Set it as the posts page in WordPress settings
 * 4. Create a sample product post
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

const FB_URL = 'https://www.facebook.com/profile.php?id=61591928459525';

// ===== FULL UPDATED SIDEBAR PHP (existing right-sidebar + Facebook top-left) =====
const sidebarPhpCode = `add_action('wp_footer', function() {
    echo '<style>
    /* === TOP-LEFT FACEBOOK ICON === */
    #fb-top-left {
        position: fixed;
        top: 15px;
        left: 15px;
        z-index: 99999999;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        background: #1877F2;
        border-radius: 50%;
        box-shadow: 0 4px 15px rgba(24,119,242,0.4);
        transition: all 0.3s ease;
        text-decoration: none;
    }
    #fb-top-left:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 25px rgba(24,119,242,0.6);
    }
    #fb-top-left svg {
        width: 26px;
        height: 26px;
        fill: #ffffff;
    }

    /* === RIGHT STICKY SIDEBAR === */
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
    #g-icon-phone svg { fill: #7B2D8E; }
    #g-icon-phone2 svg { fill: #FF6B35; }
    #g-icon-chat svg { fill: #25D366; }
    </style>';

    echo '<div id="fb-top-left">
        <a href="${FB_URL}" target="_blank" rel="noopener" title="Follow us on Facebook">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
        </a>
    </div>';

    echo '<div id="global-sticky-sidebar">
        <!-- Gmail-style Email Icon -->
        <a id="g-icon-email" href="mailto:nadeemalsaham@gmail.com" title="Email Us">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="eg" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#FF6B35"/>
                        <stop offset="100%" stop-color="#4CAF50"/>
                    </linearGradient>
                </defs>
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="url(#eg)"/>
            </svg>
        </a>
        <a id="g-icon-phone" href="tel:971554779240" title="Call +971 55 477 9240">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
        </a>
        <a id="g-icon-phone2" href="tel:971527455831" title="Call +971 52 745 5831">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
        </a>
        <a id="g-icon-chat" href="https://wa.me/971554779331" title="WhatsApp +971 55 477 9331" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 5.58 2 10c0 2.53 1.5 4.81 3.82 6.13.25.9-.66 2.6-1.55 3.32-.15.12-.17.34-.04.49.07.08.18.13.29.13.15 0 2.2-.13 3.65-1.15.14-.1.32-.12.48-.05 1.1.48 2.3.74 3.53.74 5.52 0 10-3.58 10-8s-4.48-8-10-8zm-4 9c-.83 0-1.5-.67-1.5-1.5S7.17 8 8 8s1.5.67 1.5 1.5S8.83 11 8 11zm4 0c-.83 0-1.5-.67-1.5-1.5S11.17 8 12 8s1.5.67 1.5 1.5S12.83 11 12 11zm4 0c-.83 0-1.5-.67-1.5-1.5S15.17 8 16 8s1.5.67 1.5 1.5S16.83 11 16 11z"/></svg>
        </a>
    </div>';
  }, 9999);`;

async function run() {
  try {
    console.log('============================================');
    console.log('👍 FACEBOOK ICON + BLOG PAGE CREATION');
    console.log('============================================\n');

    // STEP 1: Update sidebar to include Facebook top-left icon
    console.log('📋 Step 1: Adding Facebook icon top-left...');
    
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

    // Create new sidebar with Facebook
    const rSidebar = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Global Sidebar V6 + Facebook Top-Left',
        code: sidebarPhpCode,
        active: true,
        scope: 'global'
      })
    });
    const sidData = await rSidebar.json();
    console.log('   ✅ New sidebar + Facebook icon created! ID:', sidData.id);

    // STEP 2: Create "Products" blog page
    console.log('\n📋 Step 2: Creating Products/Blog page...');
    const rCreate = await fetch(WP_URL + '/wp-json/wp/v2/pages', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Products & Demands',
        content: '<p>Browse our latest products in demand, for sale, and market needs. Check back regularly for updates.</p>',
        slug: 'products-demands',
        status: 'publish'
      })
    });
    const newPage = await rCreate.json();
    const blogPageId = newPage.id;
    console.log('   ✅ Page "Products & Demands" created! ID:', blogPageId, '| Slug:', newPage.slug);

    // STEP 3: Set as posts page
    console.log('\n📋 Step 3: Setting as posts page in WordPress settings...');
    const rSettings = await fetch(WP_URL + '/wp-json/wp/v2/settings', {
      method: 'PUT',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ page_for_posts: blogPageId })
    });
    const settingsRes = await rSettings.json();
    console.log('   ✅ Posts page set! page_for_posts:', settingsRes.page_for_posts);

    // STEP 4: Create sample product post
    console.log('\n📋 Step 4: Creating a sample product post...');
    const samplePost = `
<!-- wp:paragraph -->
<p><strong>Material:</strong> HDPE100 Regrind<br>
<strong>Quantity:</strong> 500 MT<br>
<strong>Origin:</strong> UAE<br>
<strong>Price:</strong> Contact for best price</p>
<!-- /wp:paragraph -->
<!-- wp:paragraph -->
<p>We have high-quality HDPE100 regrind available for immediate export. Suitable for pipe extrusion, injection molding, and blow molding applications. 99.9% pure, hot-washed, moisture < 0.5%. Contact us for samples and pricing.</p>
<!-- /wp:paragraph -->
<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="https://wa.me/971554779331">Contact via WhatsApp</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons -->
`;
    const rPost = await fetch(WP_URL + '/wp-json/wp/v2/posts', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'HDPE100 Regrind – Premium Quality Available for Export',
        content: samplePost,
        status: 'publish',
        categories: [],
        tags: []
      })
    });
    const postData = await rPost.json();
    console.log('   ✅ Sample post created! ID:', postData.id, '| URL:', postData.link);

    // STEP 5: Purge cache and warm
    console.log('\n🧹 Step 5: Purging cache...');
    const purgeCode = "if(class_exists('LiteSpeed\\\\Purge')) { LiteSpeed\\\\Purge::purge_all(); }";
    await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Purge Cache FB Blog', code: purgeCode, active: true, scope: 'global' })
    });
    
    // Warm caches
    await fetch(WP_URL + '/');
    await fetch(WP_URL + '/products-demands/');
    
    console.log('\n============================================');
    console.log('✅ ALL DONE!');
    console.log('============================================');
    console.log('   👍 Facebook icon at top-left of every page');
    console.log('   📄 Products page: ' + WP_URL + '/products-demands/');
    console.log('   📝 Sample post created for HDPE100 Regrind');
    console.log('============================================\n');
  } catch(e) {
    console.error('\n❌ Error:', e.message);
  }
}
run();
