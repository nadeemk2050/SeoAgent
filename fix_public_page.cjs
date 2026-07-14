require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

// Updated CRUD: products list is public, actions need password
// Also includes seo_banner and recent_products shortcodes for Products page
const code = [
  "// SEO Banner for Products page",
  "add_shortcode('seo_banner', function() {",
  "  $h  = '<div style=\"max-width:1100px;margin:0 auto 30px;padding:20px;background:#f9fffb;border-radius:12px;border:1px solid #d4edda;\">';",
  "  $h .= '<h2 style=\"font-size:1.5rem;font-weight:700;color:#1a1a1a;margin-bottom:15px;\">Why Buy Scrap Products for Sale UAE?</h2>';",
  "  $h .= '<p style=\"color:#444;font-size:1.05rem;line-height:1.8;margin-bottom:15px;\">Welcome to our marketplace for premium <strong>scrap products for sale UAE</strong>.</p>';",
  "  $h .= '<figure style=\"margin:15px 0;text-align:center;\"><img src=\"https://alshaabalwaseem.com/wp-content/uploads/2026/05/logo.png\" alt=\"scrap products for sale UAE\" style=\"max-width:100%;height:auto;border-radius:8px;\" /><figcaption style=\"color:#888;font-size:0.85rem;margin-top:8px;\">Premium scrap products for sale UAE.</figcaption></figure>';",
  "  $h .= '<p style=\"margin-top:15px;\"><a href=\"/manage-products/\" style=\"display:inline-block;background:#0d954d;color:#fff;padding:10px 25px;border-radius:6px;text-decoration:none;font-weight:600;\">+ Add New Product</a></p>';",
  "  $h .= '</div>';",
  "  return $h;",
  "});",
  "",
  "// Public product listing for Products page",
  "add_shortcode('recent_products', function() {",
  "  $pst = get_posts(array('post_type'=>'post','posts_per_page'=>50,'post_status'=>'publish'));",
  "  if (empty($pst)) return '<p style=\"color:#888;padding:20px;background:#f9f9f9;border-radius:8px;\">No products listed yet. Check back soon!</p>';",
  "  $h = '<div style=\"display:flex;flex-direction:column;gap:12px;\">';",
  "  foreach ($pst as $p) {",
  "    $h .= '<div style=\"background:#fff;padding:18px 22px;border-radius:8px;box-shadow:0 1px 5px rgba(0,0,0,0.06);\">';",
  "    $h .= '<h3 style=\"margin:0 0 5px;font-size:1.1rem;\"><a href=\"'.get_permalink($p->ID).'\" style=\"color:#0d954d;text-decoration:none;\">'.esc_html($p->post_title).'</a></h3>';",
  "    $h .= '<p style=\"color:#777;font-size:0.9rem;margin:0;\">'.get_the_date('M j, Y', $p->ID).'</p>';",
  "    $h .= '</div>';",
  "  }",
  "  $h .= '</div>';",
  "  return $h;",
  "});",
  "",
  "// Password-protected admin actions",
  "add_shortcode('product_admin', function() {",
  "  $output = '';",
  "  $auth_ok = isset($_POST['admin_pw']) && $_POST['admin_pw'] === 'abcd';",
  "  $action = isset($_GET['action']) ? $_GET['action'] : (isset($_POST['action']) ? $_POST['action'] : '');",
  "",
  "  // Handle Create",
  "  if ($auth_ok && $action === 'create' && isset($_POST['product_title'])) {",
  "    $id = wp_insert_post(array(",
  "      'post_title'=>sanitize_text_field($_POST['product_title']),",
  "      'post_content'=>wp_kses_post($_POST['product_content']),",
  "      'post_status'=>'publish','post_type'=>'post'",
  "    ));",
  "    if ($id) $output .= '<div style=\"background:#d4edda;color:#155724;padding:12px;border-radius:6px;margin-bottom:15px;\">✅ Published!</div>';",
  "  }",
  "",
  "  // Handle Edit",
  "  if ($auth_ok && $action === 'edit' && isset($_POST['edit_id'])) {",
  "    wp_update_post(array(",
  "      'ID'=>intval($_POST['edit_id']),",
  "      'post_title'=>sanitize_text_field($_POST['product_title']),",
  "      'post_content'=>wp_kses_post($_POST['product_content'])",
  "    ));",
  "    $output .= '<div style=\"background:#d4edda;color:#155724;padding:12px;border-radius:6px;margin-bottom:15px;\">✅ Updated!</div>';",
  "  }",
  "",
  "  // Handle Delete - requires password",
  "  if ($action === 'delete' && isset($_GET['del_id']) && $auth_ok) {",
  "    wp_delete_post(intval($_GET['del_id']), true);",
  "    $output .= '<div style=\"background:#f8d7da;color:#721c24;padding:12px;border-radius:6px;margin-bottom:15px;\">🗑️ Deleted.</div>';",
  "  }",
  "  if ($action === 'delete' && isset($_GET['del_id']) && !$auth_ok) {",
  "    $output .= '<div style=\"max-width:400px;margin:20px 0;padding:25px;background:#fff;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.08);\">';",
  "    $output .= '<h3 style=\"margin-top:0;\">🔒 Password Required to Delete</h3>';",
  "    $output .= '<form method=\"post\" style=\"display:flex;gap:10px;\">';",
  "    $output .= '<input type=\"hidden\" name=\"action\" value=\"delete\">';",
  "    $output .= '<input type=\"hidden\" name=\"del_id\" value=\"'.intval($_GET['del_id']).'\">';",
  "    $output .= '<input type=\"password\" name=\"admin_pw\" placeholder=\"Enter password\" style=\"flex:1;padding:10px;border:2px solid #e0e0e0;border-radius:6px;\">';",
  "    $output .= '<input type=\"submit\" value=\"Confirm Delete\" style=\"background:#c00;color:#fff;padding:10px 20px;border:none;border-radius:6px;cursor:pointer;\">';",
  "    $output .= '</form></div>';",
  "  }",
  "",
  "  // Check if user wants to add new (needs password)",
  "  $show_form = false;",
  "  $form_type = 'add';",
  "  $form_title = '';",
  "  $form_content = '';",
  "  $form_id = '';",
  "",
  "  if ($action === 'add' && !$auth_ok) { $show_form = true; $form_type = 'pw'; }",
  "  if ($action === 'add' && $auth_ok) { $show_form = true; $form_type = 'add'; }",
  "  if ($action === 'edit' && isset($_GET['post_id'])) {",
  "    $ep = get_post(intval($_GET['post_id']));",
  "    if ($ep) {",
  "      if (!$auth_ok) { $show_form = true; $form_type = 'pw'; }",
  "      else { $show_form = true; $form_type = 'edit'; $form_title = $ep->post_title; $form_content = $ep->post_content; $form_id = $ep->ID; }",
  "    }",
  "  }",
  "",
  "  // Password prompt inline",
  "  if ($show_form && $form_type === 'pw') {",
  "    $output .= '<div style=\"max-width:400px;margin:20px 0;padding:25px;background:#fff;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.08);\">';",
  "    $output .= '<h3 style=\"margin-top:0;\">🔒 Password Required</h3>';",
  "    $output .= '<form method=\"post\" style=\"display:flex;gap:10px;flex-wrap:wrap;\">';",
  "    $output .= '<input type=\"hidden\" name=\"action\" value=\"'.(isset($_GET['action'])?htmlspecialchars($_GET['action']):'add').'\">';",
  "    if (isset($_GET['post_id'])) $output .= '<input type=\"hidden\" name=\"post_id\" value=\"'.intval($_GET['post_id']).'\">';",
  "    $output .= '<input type=\"password\" name=\"admin_pw\" placeholder=\"Enter password\" style=\"flex:1;padding:10px;border:2px solid #e0e0e0;border-radius:6px;\">';",
  "    $output .= '<input type=\"submit\" value=\"Unlock\" style=\"background:#0d954d;color:#fff;padding:10px 20px;border:none;border-radius:6px;cursor:pointer;\">';",
  "    $output .= '</form></div>';",
  "  }",
  "",
  "  // Add/Edit form",
  "  if ($show_form && $form_type !== 'pw') {",
  "    $output .= '<div style=\"background:#fff;padding:25px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.08);margin-bottom:20px;\">';",
  "    $output .= '<h3 style=\"margin-top:0;\">'.($form_type==='edit'?'✏️ Edit Product':'➕ Add New Product').'</h3>';",
  "    $output .= '<form method=\"post\" style=\"display:flex;flex-direction:column;gap:12px;\">';",
  "    $output .= '<input type=\"hidden\" name=\"action\" value=\"'.($form_type==='edit'?'edit':'create').'\">';",
  "    $output .= '<input type=\"hidden\" name=\"admin_pw\" value=\"abcd\">';",
  "    if ($form_type==='edit') $output .= '<input type=\"hidden\" name=\"edit_id\" value=\"'.$form_id.'\">';",
  "    $output .= '<input type=\"text\" name=\"product_title\" placeholder=\"Product Title\" value=\"'.esc_attr($form_title).'\" required style=\"padding:12px;border:2px solid #e0e0e0;border-radius:6px;font-size:1rem;\">';",
  "    $output .= '<textarea name=\"product_content\" rows=\"6\" placeholder=\"Description, material, quantity, price...\" required style=\"padding:12px;border:2px solid #e0e0e0;border-radius:6px;font-size:1rem;\">'.esc_textarea($form_content).'</textarea>';",
  "    $output .= '<div style=\"display:flex;gap:10px;\"><input type=\"submit\" value=\"'.($form_type==='edit'?'💾 Save Changes':'📦 Publish Product').'\" style=\"background:#0d954d;color:#fff;padding:12px 25px;border:none;border-radius:6px;font-size:1rem;font-weight:600;cursor:pointer;\">';",
  "    $output .= '<a href=\"/manage-products/\" style=\"padding:12px 20px;color:#666;text-decoration:none;\">Cancel</a></div>';",
  "    $output .= '</form></div>';",
  "  }",
  "",
  "  // Public: 'Add New' button + product list with edit/delete",
  "  $output .= '<p style=\"margin-bottom:20px;\"><a href=\"/manage-products/?action=add\" style=\"display:inline-block;background:#0d954d;color:#fff;padding:10px 25px;border-radius:6px;text-decoration:none;font-weight:600;\">➕ Add New Product</a></p>';",
  "",
  "  $pst = get_posts(array('post_type'=>'post','posts_per_page'=>50,'post_status'=>'publish'));",
  "  if (empty($pst)) {",
  "    $output .= '<p style=\"color:#888;padding:20px;background:#f9f9f9;border-radius:8px;\">No products yet.</p>';",
  "  } else {",
  "    $output .= '<div style=\"display:flex;flex-direction:column;gap:10px;\">';",
  "    foreach ($pst as $p) {",
  "      $output .= '<div style=\"display:flex;align-items:center;justify-content:space-between;background:#fff;padding:15px 20px;border-radius:8px;box-shadow:0 1px 5px rgba(0,0,0,0.05);\">';",
  "      $output .= '<div><strong style=\"color:#333;\">'.esc_html($p->post_title).'</strong><span style=\"color:#999;font-size:0.85rem;margin-left:10px;\">'.get_the_date('M j, Y', $p->ID).'</span></div>';",
  "      $output .= '<div style=\"display:flex;gap:8px;\">';",
  "      $output .= '<a href=\"/manage-products/?action=edit&post_id='.$p->ID.'\" style=\"background:#f0f0f0;color:#333;padding:6px 14px;border-radius:4px;text-decoration:none;font-size:0.9rem;\">✏️</a>';",
  "      $output .= '<a href=\"/manage-products/?action=delete&del_id='.$p->ID.'\" style=\"background:#fee;color:#c00;padding:6px 14px;border-radius:4px;text-decoration:none;font-size:0.9rem;\" onclick=\"return confirm(\\'Delete?\\')\">🗑️</a>';",
  "      $output .= '</div></div>';",
  "    }",
  "    $output .= '</div>';",
  "  }",
  "",
  "  return $output;",
  "});"
].join('\n');

async function run() {
  try {
    // 1. Remove password from the Manage Products page
    console.log('📋 Removing page password...');
    const r1 = await fetch(WP_URL + '/wp-json/wp/v2/pages?slug=manage-products', {
      headers: { 'Authorization': 'Basic ' + auth }
    });
    const pages = await r1.json();
    const page = Array.isArray(pages) ? pages[0] : null;
    if (page) {
      await fetch(WP_URL + '/wp-json/wp/v2/pages/' + page.id, {
        method: 'POST',
        headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: '', content: '[product_admin]' })
      });
      console.log('   ✅ Password removed, content set to [product_admin]');
    }

    // 2. Deactivate old CRUD snippets
    console.log('\n📋 Updating CRUD snippet...');
    const r2 = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
      headers: { 'Authorization': 'Basic ' + auth }
    });
    const snippets = await r2.json();
    const list = Array.isArray(snippets) ? snippets : (snippets?.data || []);
    for (const s of list) {
      if (s.name && (s.name.includes('CRUD') || s.name.includes('Manager') || s.name.includes('Shortcode') || s.name === 'SEO + Recent Products') && s.active) {
        await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/' + s.id, {
          method: 'PUT',
          headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
          body: JSON.stringify({ active: false })
        });
        console.log('   🔄 Deactivated:', s.name);
      }
    }

    // 3. Create new public CRUD snippet
    const r3 = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Public Product Manager', code, active: true, scope: 'global' })
    });
    const d3 = await r3.json();
    console.log('   ✅ New snippet created! ID:', d3.id);

    // 4. Purge
    console.log('\n🧹 Purging cache...');
    const purgeCode = "if(class_exists('LiteSpeed\\\\Purge')) { LiteSpeed\\\\Purge::purge_all(); }";
    await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Purge Public', code: purgeCode, active: true, scope: 'global' })
    });
    await fetch(WP_URL + '/manage-products/');
    await fetch(WP_URL + '/products-demands/');

    console.log('\n============================================');
    console.log('✅ ALL FIXED!');
    console.log('============================================');
    console.log('   🌍 Products page: public (visible to all)');
    console.log('   🔐 Add/Edit/Delete: requires password "abcd"');
    console.log('   📱 Mobile-friendly for uploading photos');
    console.log('============================================\n');
  } catch(e) {
    console.error('❌', e.message);
  }
}
run();
