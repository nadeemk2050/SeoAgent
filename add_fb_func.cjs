require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

async function main() {
  // Get snippet 173 code
  let r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/173', {
    headers: { 'Authorization': 'Basic ' + auth }
  });
  let s = await r.json();
  let code = s.code || '';
  
  // Add post_to_fb function right at the beginning (after add_action calls)
  // Uses the constant defined in snippet 174
  const funcDef = `
function post_to_fb($pid) {
    if (!defined('FB_PAGE_TOKEN') || !defined('FB_PAGE_ID')) return false;
    $token = FB_PAGE_TOKEN;
    $page_id = FB_PAGE_ID;
    $title = get_the_title($pid);
    $desc = wp_trim_words(strip_tags(get_post_field('post_content', $pid)), 50, '...');
    $permalink = get_permalink($pid);
    $p_type = get_post_meta($pid, '_product_type', true);
    $p_qty = get_post_meta($pid, '_product_qty', true);
    $p_country = get_post_meta($pid, '_product_country', true);
    $msg = $title;
    if ($p_type === 'buy') $msg .= ' | Looking to Buy';
    elseif ($p_type === 'sell') $msg .= ' | Available for Sell';
    if ($p_qty) $msg .= ' - ' . $p_qty;
    if ($p_country) $msg .= ' - ' . $p_country;
    $msg .= ' - ' . $desc . ' - ' . $permalink;
    $res = wp_remote_post('https://graph.facebook.com/v22.0/' . $page_id . '/feed', array(
        'body' => array('message' => $msg, 'access_token' => $token),
        'timeout' => 15
    ));
    if (is_wp_error($res)) return false;
    $result = json_decode(wp_remote_retrieve_body($res), true);
    return isset($result['id']);
}
`;

  // Insert after the add_action calls (after all add_action and add_shortcode lines at the top)
  code = code.replace(
    "add_shortcode('product_admin', function() {",
    funcDef + "\nadd_shortcode('product_admin', function() {"
  );
  
  // Update snippet
  r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/173', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, active: true })
  });
  let d = await r.json();
  console.log('173 Updated. Active:', d.active, 'Error:', d.code_error || 'none');
  
  // Warm pages
  await fetch(WP_URL + '/manage-products/');
  console.log('Done');
}
main().catch(e => console.error(e.message));
