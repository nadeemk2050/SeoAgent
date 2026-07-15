require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const fs = require('fs');
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

// Read our working minimal version's code
const minimalCode = `
add_shortcode('product_admin', function() {
    $output = '';
    $auth_ok = isset($_POST['admin_pw']) && $_POST['admin_pw'] === 'abcd';
    $action = isset($_GET['act']) ? $_GET['act'] : (isset($_POST['act']) ? $_POST['act'] : '');
    
    if ($auth_ok && $action === 'create' && isset($_POST['title'])) {
        $content = wp_kses_post($_POST['desc']);
        $pid = wp_insert_post(array(
            'post_title' => sanitize_text_field($_POST['title']),
            'post_content' => $content,
            'post_status' => 'publish',
            'post_type' => 'post'
        ));
        if ($pid && !is_wp_error($pid)) {
            $output .= '<div style="background:#d4edda;color:#155724;padding:12px;border-radius:6px;margin-bottom:15px;">Published! <a href="' . get_permalink($pid) . '" style="color:#155724;font-weight:600;">' . esc_html(get_the_title($pid)) . '</a></div>';
        }
    }
    
    $output .= '<p>PM v2 loaded</p>';
    return $output;
});
`;

// Also create a snippet that just adds the display meta filter
const metaCode = `
add_filter('the_content', function($c) {
    if (!is_single() || !in_the_loop()) return $c;
    $pid = get_the_ID();
    $t = get_post_meta($pid, '_product_type', true);
    $q = get_post_meta($pid, '_product_qty', true);
    $co = get_post_meta($pid, '_product_country', true);
    $p = get_post_meta($pid, '_product_port', true);
    $te = get_post_meta($pid, '_product_terms', true);
    if (!$t && !$q && !$co && !$p && !$te) return $c;
    $h = '<div style="background:#f8fff8;border:1px solid #d4edda;border-radius:8px;padding:15px;margin-bottom:15px;">';
    if ($t) $h .= '<div>' . ($t === 'buy' ? 'Buy' : 'Sell') . '</div>';
    if ($q) $h .= '<div>Qty: ' . $q . '</div>';
    if ($co) $h .= '<div>Dest: ' . $co . '</div>';
    if ($p) $h .= '<div>Port: ' . $p . '</div>';
    if ($te) $h .= '<div>Terms: ' . $te . '</div>';
    return $h . $c;
}, 5);
`;

async function main() {
  // Create minimal v2
  let r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'PMv2', code: minimalCode, active: true, scope: 'global' })
  });
  let d = await r.json();
  console.log('PMv2 - ID:', d.id, 'Active:', d.active, 'Error:', JSON.stringify(d.code_error));
  
  // Create meta display snippet
  r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'MetaDisplay', code: metaCode, active: true, scope: 'global' })
  });
  d = await r.json();
  console.log('MetaDisplay - ID:', d.id, 'Active:', d.active, 'Error:', JSON.stringify(d.code_error));
  
  // Check page
  const page = await fetch(WP_URL + '/manage-products/');
  const text = await page.text();
  console.log('Page has [product_admin]:', text.includes('[product_admin]'));
}
main().catch(e => console.error(e.message));
