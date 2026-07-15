require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const fs = require('fs');
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

// Read current snippet 173 code
const baseCode = fs.readFileSync('deploy_restore_final.cjs', 'utf8');
const codeMatch = baseCode.match(/const code = `([\s\S]*?)`;/);
if (!codeMatch) { console.log('Could not extract code'); process.exit(1); }
let mainCode = codeMatch[1];

// Add Facebook icon after WhatsApp icon
const fbIcon = `$output .= '<a href="/manage-products/?act=push_fb&post_id=' . $pid . '" title="FB" style="text-decoration:none;"><svg viewBox="0 0 24 24" style="width:26px;height:26px;"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>';`;

// Insert after WhatsApp icon line (before the gear icon div)
mainCode = mainCode.replace(
  "rel=\"noopener\" title=\"WhatsApp\" style=\"text-decoration:none;\"><svg viewBox=\"0 0 24 24\" style=\"width:28px;height:28px;\"><path fill=\"#25D366\" d=\"M12 2C6.48 2 2 5.58 2 10c0 2.53 1.5 4.81 3.82 6.13.25.9-.66 2.6-1.55 3.32-.15.12-.17.34-.04.49.07.08.18.13.29.13.15 0 2.2-.13 3.65-1.15.14-.1.32-.12.48-.05 1.1.48 2.3.74 3.53.74 5.52 0 10-3.58 10-8s-4.48-8-10-8zm-4 9c-.83 0-1.5-.67-1.5-1.5S7.17 8 8 8s1.5.67 1.5 1.5S8.83 11 8 11zm4 0c-.83 0-1.5-.67-1.5-1.5S11.17 8 12 8s1.5.67 1.5 1.5S12.83 11 12 11zm4 0c-.83 0-1.5-.67-1.5-1.5S15.17 8 16 8s1.5.67 1.5 1.5S16.83 11 16 11z\"/></svg></a>';",
  "rel=\"noopener\" title=\"WhatsApp\" style=\"text-decoration:none;\"><svg viewBox=\"0 0 24 24\" style=\"width:28px;height:28px;\"><path fill=\"#25D366\" d=\"M12 2C6.48 2 2 5.58 2 10c0 2.53 1.5 4.81 3.82 6.13.25.9-.66 2.6-1.55 3.32-.15.12-.17.34-.04.49.07.08.18.13.29.13.15 0 2.2-.13 3.65-1.15.14-.1.32-.12.48-.05 1.1.48 2.3.74 3.53.74 5.52 0 10-3.58 10-8s-4.48-8-10-8zm-4 9c-.83 0-1.5-.67-1.5-1.5S7.17 8 8 8s1.5.67 1.5 1.5S8.83 11 8 11zm4 0c-.83 0-1.5-.67-1.5-1.5S11.17 8 12 8s1.5.67 1.5 1.5S12.83 11 12 11zm4 0c-.83 0-1.5-.67-1.5-1.5S15.17 8 16 8s1.5.67 1.5 1.5S16.83 11 16 11z\"/></svg></a>';" +
  "\n            " + fbIcon
);

// Facebook handler snippet code (separate, with token)
const fbHandlerCode = `
defined('FB_PAGE_ID') or define('FB_PAGE_ID', '1273833299139182');
defined('FB_PAGE_TOKEN') or define('FB_PAGE_TOKEN', 'EAAV6XuCbNa0BRzINGqkqGpYn2RAu0LRRIWC0oXwVGgHZBMg71JVi9ILErFVx87H9d2CJf2eeaDsvBrhDHYsMOfmxF96wMd4BW8cqT4p2uvxeutmyoDkWopAO7v7xLClEJZCWXSZCdL4WNOxZCjDMkZCx5jDNs7qypzrl4Do1xzE3xyUs6iGYMLn36OlIkPfrDck4QUyieu0xDVo8YAFY6HfGjeJwvfXIaUpxxCQD8JFy3YQB3pY4za6grLEGZB');

function post_to_fb($pid) {
    $token = FB_PAGE_TOKEN;
    $page_id = FB_PAGE_ID;
    $title = get_the_title($pid);
    $desc = wp_trim_words(strip_tags(get_post_field('post_content', $pid)), 50, '...');
    $permalink = get_permalink($pid);
    $p_type = get_post_meta($pid, '_product_type', true);
    $p_qty = get_post_meta($pid, '_product_qty', true);
    $p_country = get_post_meta($pid, '_product_country', true);
    $msg = $title;
    if ($p_type || $p_qty || $p_country) {
        $msg .= ' | ';
        if ($p_type === 'buy') $msg .= 'Looking to Buy';
        elseif ($p_type === 'sell') $msg .= 'Available for Sell';
        if ($p_qty) $msg .= ' - ' . $p_qty;
        if ($p_country) $msg .= ' - ' . $p_country;
    }
    $msg .= ' - ' . $desc . ' - ' . $permalink;
    
    $res = wp_remote_post('https://graph.facebook.com/v22.0/' . $page_id . '/feed', array(
        'body' => array('message' => $msg, 'access_token' => $token),
        'timeout' => 15
    ));
    if (is_wp_error($res)) return false;
    $result = json_decode(wp_remote_retrieve_body($res), true);
    return isset($result['id']);
}

add_shortcode('fb_push', function() {
    $output = '';
    $auth_ok = isset($_POST['admin_pw']) && $_POST['admin_pw'] === 'abcd';
    $pid = isset($_GET['post_id']) ? intval($_GET['post_id']) : 0;
    if (!$pid) return '<p>No product specified.</p>';
    
    if (!$auth_ok) {
        $output .= '<div style="max-width:400px;margin:20px 0;padding:25px;background:#fff;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.08);"><h3>Post to Facebook</h3><p style="color:#666;">Enter password to post this product to Facebook.</p><form method="post" style="display:flex;gap:10px;flex-wrap:wrap;"><input type="hidden" name="act" value="push_fb"><input type="hidden" name="post_id" value="' . $pid . '"><input type="password" name="admin_pw" placeholder="Password" style="flex:1;padding:10px;border:2px solid #e0e0e0;border-radius:6px;"><input type="submit" value="Post Now" style="background:#1877F2;color:#fff;padding:10px 20px;border:none;border-radius:6px;cursor:pointer;"></form></div>';
    } else {
        $ok = post_to_fb($pid);
        if ($ok) {
            $output .= '<div style="background:#d4edda;color:#155724;padding:12px;border-radius:6px;margin-bottom:15px;">Posted to Facebook! <a href="https://www.facebook.com/profile.php?id=' . FB_PAGE_ID . '" target="_blank" style="color:#155724;">View</a></div>';
        } else {
            $output .= '<div style="background:#f8d7da;color:#721c24;padding:12px;border-radius:6px;margin-bottom:15px;">Facebook post failed.</div>';
        }
    }
    return $output;
});

// Also handle push_fb action via the product_admin page
add_action('init', function() {
    if (!isset($_GET['act']) || $_GET['act'] !== 'push_fb' || !isset($_GET['post_id'])) return;
    $auth_ok = isset($_POST['admin_pw']) && $_POST['admin_pw'] === 'abcd';
    $pid = intval($_GET['post_id']);
    if ($auth_ok && $pid) {
        post_to_fb($pid);
        $_SESSION['fb_result'] = $ok ? 'ok' : 'fail';
    }
});
`;

async function main() {
  // STEP 1: Update snippet 173 with Facebook icon
  console.log('Updating snippet 173 with Facebook icon...');
  let r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/173', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: mainCode, active: true })
  });
  let d = await r.json();
  console.log('173 updated. Active:', d.active, 'Error:', d.code_error || 'none');
  
  if (!d.active) {
    console.log('173 deactivated! Reactivating...');
    r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/173', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: true })
    });
    d = await r.json();
    console.log('173 reactivated:', d.active);
  }
  
  // STEP 2: Create Facebook handler snippet
  console.log('Creating Facebook handler snippet...');
  r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'FB Push Handler', code: fbHandlerCode, active: true, scope: 'global' })
  });
  d = await r.json();
  console.log('FB handler - ID:', d.id, 'Active:', d.active, 'Error:', d.code_error || 'none');
  
  // Warm cache
  await fetch(WP_URL + '/manage-products/');
  console.log('Done!');
}
main().catch(e => console.error(e.message));
