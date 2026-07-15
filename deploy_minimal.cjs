require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const fs = require('fs');
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

// Build a minimal but functional product manager without emojis
const code = `
add_shortcode('product_admin', function() {
    $output = '';
    $auth_ok = isset($_POST['admin_pw']) && $_POST['admin_pw'] === 'abcd';
    $action = isset($_GET['act']) ? $_GET['act'] : (isset($_POST['act']) ? $_POST['act'] : '');
    
    // CREATE
    if ($auth_ok && $action === 'create' && isset($_POST['title'])) {
        $content = wp_kses_post($_POST['desc']);
        $ids = isset($_POST['img_ids']) ? array_filter(explode(',', $_POST['img_ids']), 'is_numeric') : array();
        $img_html = '';
        foreach ($ids as $iid) {
            $url = wp_get_attachment_url($iid);
            if ($url) $img_html .= '<img src="' . $url . '" alt="' . esc_attr($_POST['title']) . '" style="max-width:100%;height:auto;border-radius:6px;margin-bottom:10px;display:block;"><br>';
        }
        if ($img_html) $content = $img_html . "\n" . $content;
        
        $pid = wp_insert_post(array(
            'post_title' => sanitize_text_field($_POST['title']),
            'post_content' => $content,
            'post_status' => 'publish',
            'post_type' => 'post'
        ));
        if ($pid && !is_wp_error($pid)) {
            if (!empty($ids)) {
                set_post_thumbnail($pid, intval($ids[0]));
                update_post_meta($pid, '_product_images', $ids);
            }
            update_post_meta($pid, '_product_type', sanitize_text_field($_POST['product_type']));
            update_post_meta($pid, '_product_qty', sanitize_text_field($_POST['product_qty']));
            update_post_meta($pid, '_product_country', sanitize_text_field($_POST['product_country']));
            update_post_meta($pid, '_product_port', sanitize_text_field($_POST['product_port']));
            update_post_meta($pid, '_product_terms', sanitize_textarea_field($_POST['product_terms']));
            $output .= '<div style="background:#d4edda;color:#155724;padding:12px;border-radius:6px;margin-bottom:15px;">Published! <a href="' . get_permalink($pid) . '" style="color:#155724;font-weight:600;">' . esc_html(get_the_title($pid)) . '</a></div>';
        }
    }
    
    return $output . '<p>PM loaded</p>';
});
`;

async function main() {
  const r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'PM_Minimal', code, active: true, scope: 'global' })
  });
  const d = await r.json();
  console.log('ID:', d.id, 'Active:', d.active, 'Error:', JSON.stringify(d.code_error));
  
  // Check page
  const page = await fetch(WP_URL + '/manage-products/');
  const text = await page.text();
  console.log('Page has [product_admin]:', text.includes('[product_admin]'));
  console.log('Page has PM loaded:', text.includes('PM loaded'));
}
main().catch(e => console.error(e.message));
