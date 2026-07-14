/**
 * FIX: Banner showing + simplified CRUD (single password)
 */
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

// ===== FIXED BANNER - uses the_content filter for archive page =====
const bannerCode = `
add_action('loop_start', function($query) {
    if (!$query->is_main_query() || !is_home()) return;
    ?>
    <div style="max-width:1100px; margin:0 auto 30px; padding:20px; font-family:'Inter','Segoe UI',sans-serif; background:#f9fffb; border-radius:12px; border:1px solid #d4edda;">
        <h2 style="font-size:1.5rem; font-weight:700; color:#1a1a1a; margin-bottom:15px;">Why Buy Scrap Products for Sale UAE?</h2>
        <p style="color:#444; font-size:1.05rem; line-height:1.8; margin-bottom:15px;">
            Welcome to our marketplace for premium <strong>scrap products for sale UAE</strong>. 
            At Al Saham Al Ahmar, we connect buyers and sellers across the global scrap trading industry. 
            Browse our latest product listings below. Each post contains detailed specifications and contact information.
        </p>
        <figure style="margin:15px 0; text-align:center;">
            <img src="https://alshaabalwaseem.com/wp-content/uploads/2026/05/logo.png" 
                 alt="scrap products for sale UAE - Al Saham Al Ahmar premium scrap materials" 
                 style="max-width:100%; height:auto; border-radius:8px;" />
            <figcaption style="color:#888; font-size:0.85rem; margin-top:8px;">Premium scrap products for sale UAE — quality you can trust.</figcaption>
        </figure>
        <p style="margin-top:15px;">
            <a href="/manage-products/" style="display:inline-block; background:#0d954d; color:#fff; padding:10px 25px; border-radius:6px; text-decoration:none; font-weight:600;">➕ Add New Product</a>
        </p>
    </div>
    <?php
}, 5);
`;

// ===== SIMPLIFIED CRUD - no double password, uses WordPress auth =====
const crudCode = `
add_shortcode('product_manager', 'render_product_manager');
function render_product_manager() {
    $output = '';
    
    // Handle Create
    if (isset($_POST['create_product']) && wp_verify_nonce($_POST['_wpnonce'], 'product_action')) {
        $title = sanitize_text_field($_POST['product_title']);
        $content = wp_kses_post($_POST['product_content']);
        if (!empty($title)) {
            $post_id = wp_insert_post(array(
                'post_title'   => $title,
                'post_content' => $content,
                'post_status'  => 'publish',
                'post_type'    => 'post'
            ));
            if ($post_id) {
                $output .= '<div style="background:#d4edda; color:#155724; padding:12px 18px; border-radius:6px; margin-bottom:20px;">✅ Product "' . esc_html($title) . '" published!</div>';
            }
        }
    }
    
    // Handle Delete
    if (isset($_GET['delete_post']) && wp_verify_nonce($_GET['_wpnonce'], 'del_' . $_GET['delete_post'])) {
        wp_delete_post(intval($_GET['delete_post']), true);
        $output .= '<div style="background:#f8d7da; color:#721c24; padding:12px 18px; border-radius:6px; margin-bottom:20px;">🗑️ Product deleted.</div>';
    }
    
    // Handle Edit Save
    if (isset($_POST['save_edit']) && wp_verify_nonce($_POST['_wpnonce'], 'edit_' . $_POST['edit_id'])) {
        $edit_id = intval($_POST['edit_id']);
        wp_update_post(array(
            'ID' => $edit_id,
            'post_title' => sanitize_text_field($_POST['product_title']),
            'post_content' => wp_kses_post($_POST['product_content'])
        ));
        $output .= '<div style="background:#d4edda; color:#155724; padding:12px 18px; border-radius:6px; margin-bottom:20px;">✅ Product updated!</div>';
    }
    
    $editing = false;
    $edit_title = '';
    $edit_content = '';
    if (isset($_GET['edit_post'])) {
        $ep = get_post(intval($_GET['edit_post']));
        if ($ep) { $editing = true; $edit_title = $ep->post_title; $edit_content = $ep->post_content; }
    }
    
    $output .= '<div style="max-width:900px; margin:0 auto; font-family:\'Inter\',\'Segoe UI\',sans-serif;">';
    
    // Form
    $output .= '<div style="background:#fff; padding:30px; border-radius:12px; box-shadow:0 2px 20px rgba(0,0,0,0.08); margin-bottom:30px;">';
    $output .= '<h2 style="margin-top:0; color:#333;">' . ($editing ? '✏️ Edit Product' : '➕ Add New Product') . '</h2>';
    $output .= '<form method="post" style="display:flex; flex-direction:column; gap:15px;">';
    $output .= wp_nonce_field($editing ? 'edit_' . $_GET['edit_post'] : 'product_action', '_wpnonce', true, false);
    if ($editing) $output .= '<input type="hidden" name="edit_id" value="' . intval($_GET['edit_post']) . '" />';
    $output .= '
        <div>
            <label style="display:block; font-weight:600; color:#555; margin-bottom:5px;">Product Title *</label>
            <input type="text" name="product_title" value="' . esc_attr($edit_title) . '" required
                   style="width:100%; padding:12px; border:2px solid #e0e0e0; border-radius:6px; font-size:1rem;" />
        </div>
        <div>
            <label style="display:block; font-weight:600; color:#555; margin-bottom:5px;">Description (material, quantity, price, contact info)</label>
            <textarea name="product_content" rows="8" required
                      style="width:100%; padding:12px; border:2px solid #e0e0e0; border-radius:6px; font-size:1rem;">' . esc_textarea($edit_content) . '</textarea>
        </div>
        <div>
            <input type="submit" name="' . ($editing ? 'save_edit' : 'create_product') . '" value="' . ($editing ? '💾 Save Changes' : '📦 Publish Product') . '"
                   style="background:#0d954d; color:#fff; padding:12px 30px; border:none; border-radius:6px; font-size:1rem; font-weight:600; cursor:pointer;" />
            ' . ($editing ? '<a href="/manage-products/" style="margin-left:10px; color:#666;">Cancel</a>' : '') . '
        </div>
    </form>';
    $output .= '</div>';
    
    // List
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
    
    $output .= '<p style="margin-top:20px; color:#999; font-size:0.85rem; text-align:right;">Use password <strong>abcd</strong> to access this page.</p>';
    $output .= '</div>';
    return $output;
}
`;

async function run() {
  try {
    console.log('============================================');
    console.log('🔧 FIXING BANNER + CRUD');
    console.log('============================================\n');

    // Deactivate old snippets
    const r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
      headers: { 'Authorization': 'Basic ' + auth }
    });
    const snippets = await r.json();
    const list = Array.isArray(snippets) ? snippets : (snippets?.data || []);
    
    for (const s of list) {
      if (s.name && (s.name.includes('Banner') || s.name.includes('CRUD') || s.name.includes('Manager')) && s.active) {
        console.log('   🔄 Deactivating old:', s.name, '(ID:', s.id, ')');
        await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/' + s.id, {
          method: 'PUT',
          headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
          body: JSON.stringify({ active: false })
        });
      }
    }

    // Create new banner
    console.log('\n📋 Creating SEO banner snippet...');
    await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Products Page SEO Banner V2',
        code: bannerCode,
        active: true,
        scope: 'global'
      })
    });
    console.log('   ✅ Banner snippet created!');

    // Create new CRUD
    console.log('\n📋 Creating simplified CRUD snippet...');
    await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Product Manager CRUD V2',
        code: crudCode,
        active: true,
        scope: 'global'
      })
    });
    console.log('   ✅ CRUD snippet created!');

    // Purge
    console.log('\n🧹 Purging cache...');
    const purgeCode = "if(class_exists('LiteSpeed\\\\Purge')) { LiteSpeed\\\\Purge::purge_all(); }";
    await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Purge Cache FixBanner', code: purgeCode, active: true, scope: 'global' })
    });
    await fetch(WP_URL + '/products-demands/');
    await fetch(WP_URL + '/manage-products/');

    console.log('\n============================================');
    console.log('✅ FIXES APPLIED!');
    console.log('============================================');
    console.log('   📰 Products page: posts + SEO banner visible');
    console.log('   🔐 Manage page: password "abcd" → CRUD panel');
    console.log('   ✅ Create / Edit / Delete products');
    console.log('============================================\n');
  } catch(e) {
    console.error('\n❌ Error:', e.message);
  }
}
run();
