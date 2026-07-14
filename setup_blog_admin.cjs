/**
 * SETUP BLOG POSTING PAGE + PASSWORD-PROTECTED ADMIN
 * ===================================================
 * 1. Set Products & Demands as posts archive page
 * 2. Inject SEO banner above posts via code snippet
 * 3. Create "Manage Products" password-protected page (password: abcd)
 * 4. Add PHP code for front-end CRUD (create, edit, delete posts)
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

const PRODUCTS_PAGE_ID = 357;
const KEYWORD = 'scrap products for sale UAE';

// ===== PHP SNIPPET 1: Inject SEO banner above posts on Products page =====
const bannerSnippetCode = `
add_action('astra_content_top', function() {
    if (is_page('products-demands') || is_home()) {
        // Only show on the products archive page
        if (!is_page('products-demands') && !is_home()) return;
        // Check if this is the products page specifically
        global $post;
        if (is_home() && isset($post->ID) && $post->ID != ${PRODUCTS_PAGE_ID}) return;
        ?>
        <div style="max-width:1100px; margin:0 auto; padding:30px 20px 10px; font-family:'Inter','Segoe UI',sans-serif;">
            <h2 style="font-size:1.5rem; font-weight:700; color:#1a1a1a; margin-bottom:15px;">Why Buy Scrap Products for Sale UAE?</h2>
            <p style="color:#444; font-size:1.05rem; line-height:1.8; margin-bottom:18px;">
                Welcome to our marketplace for premium <strong>scrap products for sale UAE</strong>. 
                At Al Saham Al Ahmar, we connect buyers and sellers across the global scrap trading industry. 
                Browse our latest product listings below. Each post contains detailed specifications, quantities, and contact information.
            </p>
            <figure style="margin:20px 0; text-align:center;">
                <img src="https://alshaabalwaseem.com/wp-content/uploads/2026/05/logo.png" 
                     alt="scrap products for sale UAE - Al Saham Al Ahmar premium scrap materials" 
                     style="max-width:100%; height:auto; border-radius:8px;" />
                <figcaption style="color:#888; font-size:0.85rem; margin-top:8px;">Premium scrap products for sale UAE — quality you can trust.</figcaption>
            </figure>
            <p style="color:#444; font-size:1rem; line-height:1.8; margin-top:10px;">
                <a href="/manage-products/" style="display:inline-block; background:#0d954d; color:#fff; padding:10px 25px; border-radius:6px; text-decoration:none; font-weight:600;">➕ Add New Product</a>
            </p>
        </div>
        <?php
    }
}, 5);
`;

// ===== PHP SNIPPET 2: Front-end CRUD for managing posts (password protected) =====
const crudSnippetCode = `
// === FRONT-END POST MANAGER ===
add_shortcode('product_manager', 'render_product_manager');
function render_product_manager() {
    // Check password
    $password_verified = isset($_SESSION['product_mgr_auth']) && $_SESSION['product_mgr_auth'] === true;
    $submitted_pw = isset($_POST['mgmt_password']) ? $_POST['mgmt_password'] : '';
    
    if (!$password_verified && $submitted_pw !== 'abcd') {
        return render_login_form();
    }
    
    if (!$password_verified && $submitted_pw === 'abcd') {
        if (!session_id()) session_start();
        $_SESSION['product_mgr_auth'] = true;
        $password_verified = true;
    }
    
    if ($password_verified) {
        return render_admin_panel();
    }
    
    return render_login_form();
}

function render_login_form() {
    return '
    <div style="max-width:400px; margin:50px auto; padding:40px; background:#fff; border-radius:12px; box-shadow:0 5px 30px rgba(0,0,0,0.1); text-align:center;">
        <h2 style="margin-bottom:10px; color:#333;">🔒 Manage Products</h2>
        <p style="color:#666; margin-bottom:25px;">Enter the management password to continue.</p>
        <form method="post" style="display:flex; flex-direction:column; gap:15px;">
            <input type="password" name="mgmt_password" placeholder="Enter password" required
                   style="padding:14px; border:2px solid #e0e0e0; border-radius:6px; font-size:1rem; text-align:center;" />
            <input type="submit" value="Unlock"
                   style="background:#0d954d; color:#fff; padding:14px; border:none; border-radius:6px; font-size:1rem; font-weight:600; cursor:pointer;" />
        </form>
    </div>';
}

function render_admin_panel() {
    $output = '';
    
    // Handle Create
    if (isset($_POST['create_product']) && wp_verify_nonce($_POST['_wpnonce'], 'product_action')) {
        $title = sanitize_text_field($_POST['product_title']);
        $content = wp_kses_post($_POST['product_content']);
        $cat = isset($_POST['product_cat']) ? sanitize_text_field($_POST['product_cat']) : '';
        
        if (!empty($title)) {
            $post_id = wp_insert_post(array(
                'post_title'   => $title,
                'post_content' => $content,
                'post_status'  => 'publish',
                'post_type'    => 'post',
                'post_category' => $cat ? array($cat) : array()
            ));
            if ($post_id) {
                $output .= '<div style="background:#d4edda; color:#155724; padding:12px 18px; border-radius:6px; margin-bottom:20px;">✅ Product "' . esc_html($title) . '" created successfully!</div>';
            }
        }
    }
    
    // Handle Delete
    if (isset($_GET['delete_post']) && wp_verify_nonce($_GET['_wpnonce'], 'del_' . $_GET['delete_post'])) {
        $del_id = intval($_GET['delete_post']);
        wp_delete_post($del_id, true);
        $output .= '<div style="background:#f8d7da; color:#721c24; padding:12px 18px; border-radius:6px; margin-bottom:20px;">🗑️ Post deleted.</div>';
    }
    
    // Handle Edit Save
    if (isset($_POST['save_edit']) && wp_verify_nonce($_POST['_wpnonce'], 'edit_' . $_POST['edit_id'])) {
        $edit_id = intval($_POST['edit_id']);
        $title = sanitize_text_field($_POST['product_title']);
        $content = wp_kses_post($_POST['product_content']);
        wp_update_post(array('ID' => $edit_id, 'post_title' => $title, 'post_content' => $content));
        $output .= '<div style="background:#d4edda; color:#155724; padding:12px 18px; border-radius:6px; margin-bottom:20px;">✅ Product updated!</div>';
    }
    
    // Check if editing a specific post
    $editing = false;
    $edit_title = '';
    $edit_content = '';
    if (isset($_GET['edit_post'])) {
        $edit_post = get_post(intval($_GET['edit_post']));
        if ($edit_post) {
            $editing = true;
            $edit_title = $edit_post->post_title;
            $edit_content = $edit_post->post_content;
        }
    }
    
    $output .= '<div style="max-width:900px; margin:30px auto; font-family:\'Inter\',\'Segoe UI\',sans-serif;">';
    
    // --- Create/Edit Form ---
    $output .= '<div style="background:#fff; padding:30px; border-radius:12px; box-shadow:0 2px 20px rgba(0,0,0,0.08); margin-bottom:30px;">';
    $output .= '<h2 style="margin-top:0; color:#333;">' . ($editing ? '✏️ Edit Product' : '➕ Add New Product') . '</h2>';
    $output .= '<form method="post" style="display:flex; flex-direction:column; gap:15px;">';
    $output .= wp_nonce_field($editing ? 'edit_' . $_GET['edit_post'] : 'product_action', '_wpnonce', true, false);
    if ($editing) {
        $output .= '<input type="hidden" name="edit_id" value="' . intval($_GET['edit_post']) . '" />';
    }
    $output .= '
        <div>
            <label style="display:block; font-weight:600; color:#555; margin-bottom:5px;">Product Title</label>
            <input type="text" name="product_title" value="' . esc_attr($edit_title) . '" required
                   style="width:100%; padding:12px; border:2px solid #e0e0e0; border-radius:6px; font-size:1rem;" />
        </div>
        <div>
            <label style="display:block; font-weight:600; color:#555; margin-bottom:5px;">Description (include material, quantity, price, etc.)</label>
            <textarea name="product_content" rows="8" required
                      style="width:100%; padding:12px; border:2px solid #e0e0e0; border-radius:6px; font-size:1rem; font-family:monospace;">' . esc_textarea($edit_content) . '</textarea>
        </div>
        <div>
            <input type="submit" name="' . ($editing ? 'save_edit' : 'create_product') . '" value="' . ($editing ? '💾 Save Changes' : '📦 Publish Product') . '"
                   style="background:#0d954d; color:#fff; padding:12px 30px; border:none; border-radius:6px; font-size:1rem; font-weight:600; cursor:pointer;" />
            ' . ($editing ? '<a href="/manage-products/" style="margin-left:10px; color:#666;">Cancel</a>' : '') . '
        </div>
    </form>';
    $output .= '</div>';
    
    // --- List Existing Products ---
    $output .= '<h2 style="color:#333; margin-bottom:15px;">📋 Your Products</h2>';
    $posts = get_posts(array('post_type' => 'post', 'posts_per_page' => 50, 'post_status' => 'publish'));
    
    if (empty($posts)) {
        $output .= '<p style="color:#888; padding:20px; background:#f9f9f9; border-radius:8px;">No products yet. Create your first one above!</p>';
    } else {
        $output .= '<div style="display:flex; flex-direction:column; gap:10px;">';
        foreach ($posts as $p) {
            $del_url = wp_nonce_url('/manage-products/?delete_post=' . $p->ID, 'del_' . $p->ID, '_wpnonce');
            $edit_url = '/manage-products/?edit_post=' . $p->ID;
            $output .= '
            <div style="display:flex; align-items:center; justify-content:space-between; background:#fff; padding:15px 20px; border-radius:8px; box-shadow:0 1px 5px rgba(0,0,0,0.05);">
                <div style="flex:1;">
                    <strong style="font-size:1.05rem; color:#333;">' . esc_html($p->post_title) . '</strong>
                    <span style="color:#999; font-size:0.85rem; margin-left:10px;">' . get_the_date('M j, Y', $p->ID) . '</span>
                </div>
                <div style="display:flex; gap:8px; flex-shrink:0;">
                    <a href="' . $edit_url . '" style="background:#f0f0f0; color:#333; padding:6px 14px; border-radius:4px; text-decoration:none; font-size:0.9rem;">✏️ Edit</a>
                    <a href="' . $del_url . '" style="background:#fee; color:#c00; padding:6px 14px; border-radius:4px; text-decoration:none; font-size:0.9rem;" onclick="return confirm(\'Delete this product?\')">🗑️ Delete</a>
                </div>
            </div>';
        }
        $output .= '</div>';
    }
    
    // Logout button
    $output .= '<p style="margin-top:30px; text-align:right;"><a href="/manage-products/?logout=1" style="color:#999; font-size:0.9rem;">🔒 Lock</a></p>';
    
    $output .= '</div>';
    return $output;
}

// Handle logout and session start
add_action('init', function() {
    if (!session_id()) session_start();
    if (isset($_GET['logout']) && $_GET['logout'] == 1) {
        $_SESSION['product_mgr_auth'] = false;
        unset($_SESSION['product_mgr_auth']);
        wp_redirect('/manage-products/');
        exit;
    }
});

// Remove default editor content filter for password-protected page
add_filter('the_password_form', function() {
    return '';
});
`;

async function run() {
  try {
    console.log('============================================');
    console.log('📰 SETUP BLOG + PASSWORD ADMIN');
    console.log('============================================\n');

    // STEP 1: Set page_for_posts back
    console.log('📋 Step 1: Setting Products page as posts archive...');
    await fetch(WP_URL + '/wp-json/wp/v2/settings', {
      method: 'PUT',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ page_for_posts: PRODUCTS_PAGE_ID })
    });
    console.log('   ✅ Posts page set!');

    // STEP 2: Update page content (keep it clean, posts will be listed below)
    console.log('\n📋 Step 2: Updating Products page content...');
    await fetch(WP_URL + '/wp-json/wp/v2/pages/' + PRODUCTS_PAGE_ID, {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Products & Demands',
        content: '<!-- Products listing appears below -->',
        meta: {
          rank_math_title: 'Top 5 Scrap Products for Sale UAE | Al Saham Al Ahmar',
          rank_math_description: 'Browse premium scrap products for sale UAE including HDPE, PVC, PC, aluminium, and copper scrap. Best prices, instant quotes, and global export available.',
          rank_math_focus_keyword: KEYWORD
        }
      })
    });
    console.log('   ✅ Page content updated!');

    // STEP 3: Create SEO banner snippet
    console.log('\n📋 Step 3: Creating SEO banner snippet...');
    
    // Deactivate old banner snippets
    try {
      const rSnippets = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
        headers: { 'Authorization': 'Basic ' + auth }
      });
      const snippets = await rSnippets.json();
      const list = Array.isArray(snippets) ? snippets : (snippets?.data || []);
      for (const s of list) {
        if (s.name && (s.name.includes('Banner') || s.name.includes('banner') || s.name.includes('SEO')) && s.active) {
          await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/' + s.id, {
            method: 'PUT',
            headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
            body: JSON.stringify({ active: false })
          });
        }
      }
    } catch(e) {}

    await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Products Page SEO Banner',
        code: bannerSnippetCode,
        active: true,
        scope: 'global'
      })
    });
    console.log('   ✅ SEO banner snippet created!');

    // STEP 4: Create "Manage Products" password-protected page
    console.log('\n📋 Step 4: Creating "Manage Products" page (password: abcd)...');
    
    // Check if it already exists
    const rPages = await fetch(WP_URL + '/wp-json/wp/v2/pages?slug=manage-products', {
      headers: { 'Authorization': 'Basic ' + auth }
    });
    const existingPages = await rPages.json();
    
    if (Array.isArray(existingPages) && existingPages.length > 0) {
      console.log('   ⚠️ Page already exists, skipping creation');
    } else {
      await fetch(WP_URL + '/wp-json/wp/v2/pages', {
        method: 'POST',
        headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Manage Products',
          content: '[product_manager]',
          slug: 'manage-products',
          status: 'publish',
          password: 'abcd'
        })
      });
      console.log('   ✅ Manage Products page created with password "abcd"!');
    }

    // STEP 5: Create CRUD snippet
    console.log('\n📋 Step 5: Creating front-end CRUD snippet...');
    await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Product Manager CRUD',
        code: crudSnippetCode,
        active: true,
        scope: 'global'
      })
    });
    console.log('   ✅ Product Manager CRUD snippet created!');

    // STEP 6: Purge cache
    console.log('\n🧹 Step 6: Purging cache...');
    const purgeCode = "if(class_exists('LiteSpeed\\\\Purge')) { LiteSpeed\\\\Purge::purge_all(); }";
    await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Purge Cache Blog', code: purgeCode, active: true, scope: 'global' })
    });
    
    await fetch(WP_URL + '/products-demands/');
    await fetch(WP_URL + '/manage-products/');
    
    console.log('\n============================================');
    console.log('✅ ALL DONE!');
    console.log('============================================');
    console.log('   📰 Products page: /products-demands/');
    console.log('   🔐 Manage page: /manage-products/ (password: abcd)');
    console.log('   ✅ Create, Edit, Delete products');
    console.log('   ✅ SEO content shows above posts');
    console.log('============================================\n');

  } catch(e) {
    console.error('\n❌ Error:', e.message);
  }
}
run();
