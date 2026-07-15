require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const fs = require('fs');
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

// Read the working code from deploy_restore_final.cjs
let src = fs.readFileSync('deploy_restore_final.cjs', 'utf8');
let m = src.match(/const code = `([\s\S]*?)`;/);
let code = m[1];

// 1. Add post_to_fb function at the top (reads constants from snippet 174)
const fbFunc = `function post_to_fb($pid) {
    if (!defined('FB_PAGE_TOKEN') || !defined('FB_PAGE_ID')) return false;
    $token = FB_PAGE_TOKEN;
    $page_id = FB_PAGE_ID;
    $title = get_the_title($pid);
    $desc = wp_trim_words(strip_tags(get_post_field('post_content', $pid)), 50, '...');
    $link = get_permalink($pid);
    $msg = $title;
    $pt = get_post_meta($pid, '_product_type', true);
    $pq = get_post_meta($pid, '_product_qty', true);
    $pc = get_post_meta($pid, '_product_country', true);
    if ($pt === 'buy') $msg .= ' | Looking to Buy';
    elseif ($pt === 'sell') $msg .= ' | Available for Sell';
    if ($pq) $msg .= ' - ' . $pq;
    if ($pc) $msg .= ' - ' . $pc;
    $msg .= ' - ' . $desc . ' - ' . $link;
    $res = wp_remote_post('https://graph.facebook.com/v22.0/' . $page_id . '/feed', array(
        'body' => array('message' => $msg, 'access_token' => $token),
        'timeout' => 15
    ));
    if (is_wp_error($res)) return false;
    $result = json_decode(wp_remote_retrieve_body($res), true);
    return isset($result['id']);
}

`;

code = fbFunc + code;

// 2. Add FB icon after WhatsApp in the product listing
// Find the WhatsApp anchor closing and add FB icon after it
code = code.replace(
  "title=\"WhatsApp\"",
  "title=\"WhatsApp\""
); // no-op, just find the marker

const fbIconPHP = "title=\"FB\" style=\"text-decoration:none;\"><svg viewBox=\"0 0 24 24\" style=\"width:26px;height:26px;\"><path fill=\"#1877F2\" d=\"M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z\"/></svg></a>';";

// Insert FB icon after the WhatsApp SVG closing tag
code = code.replace(
  "path fill=\"#25D366\" d=\"M12 2C6.48 2 2 5.58 2 10c0 2.53 1.5 4.81 3.82 6.13.25.9-.66 2.6-1.55 3.32-.15.12-.17.34-.04.49.07.08.18.13.29.13.15 0 2.2-.13 3.65-1.15.14-.1.32-.12.48-.05 1.1.48 2.3.74 3.53.74 5.52 0 10-3.58 10-8s-4.48-8-10-8zm-4 9c-.83 0-1.5-.67-1.5-1.5S7.17 8 8 8s1.5.67 1.5 1.5S8.83 11 8 11zm4 0c-.83 0-1.5-.67-1.5-1.5S11.17 8 12 8s1.5.67 1.5 1.5S12.83 11 12 11zm4 0c-.83 0-1.5-.67-1.5-1.5S15.17 8 16 8s1.5.67 1.5 1.5S16.83 11 16 11z\"/></svg></a>';",
  "path fill=\"#25D366\" d=\"M12 2C6.48 2 2 5.58 2 10c0 2.53 1.5 4.81 3.82 6.13.25.9-.66 2.6-1.55 3.32-.15.12-.17.34-.04.49.07.08.18.13.29.13.15 0 2.2-.13 3.65-1.15.14-.1.32-.12.48-.05 1.1.48 2.3.74 3.53.74 5.52 0 10-3.58 10-8s-4.48-8-10-8zm-4 9c-.83 0-1.5-.67-1.5-1.5S7.17 8 8 8s1.5.67 1.5 1.5S8.83 11 8 11zm4 0c-.83 0-1.5-.67-1.5-1.5S11.17 8 12 8s1.5.67 1.5 1.5S12.83 11 12 11zm4 0c-.83 0-1.5-.67-1.5-1.5S15.17 8 16 8s1.5.67 1.5 1.5S16.83 11 16 11z\"/></svg></a>';" +
  "\n            $output .= '<a href=\"/manage-products/?act=push_fb&post_id=' . $pid . '\" " + fbIconPHP
);

// 3. Add push_fb handler before the DELETE section  
const fbHandler = `
    // --- FACEBOOK PUSH ---
    if ($action === 'push_fb' && isset($_GET['post_id'])) {
        $fbpid = intval($_GET['post_id']);
        if (!$auth_ok) {
            $output .= '<div style="max-width:400px;margin:20px 0;padding:25px;background:#fff;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.08);"><h3>Post to Facebook</h3><p style="color:#666;">Enter password to post to Facebook.</p><form method="post" style="display:flex;gap:10px;flex-wrap:wrap;"><input type="hidden" name="act" value="push_fb"><input type="hidden" name="post_id" value="' . $fbpid . '"><input type="password" name="admin_pw" placeholder="Password" style="flex:1;padding:10px;border:2px solid #e0e0e0;border-radius:6px;"><input type="submit" value="Post Now" style="background:#1877F2;color:#fff;padding:10px 20px;border:none;border-radius:6px;cursor:pointer;"></form></div>';
        } else {
            $fbok = post_to_fb($fbpid);
            if ($fbok) {
                $output .= '<div style="background:#d4edda;color:#155724;padding:12px;border-radius:6px;margin-bottom:15px;">Posted to Facebook! <a href="https://www.facebook.com/profile.php?id=1273833299139182" target="_blank" style="color:#155724;font-weight:600;">View Post</a></div>';
            } else {
                $output .= '<div style="background:#f8d7da;color:#721c24;padding:12px;border-radius:6px;margin-bottom:15px;">Failed.</div>';
            }
        }
    }
`;

code = code.replace(
  "if ($action === 'delete' && isset(\$_GET['del_id'])) {",
  fbHandler + "\n    if ($action === 'delete' && isset(\$_GET['del_id'])) {"
);

// Save the combined code
fs.writeFileSync('pm_combined_fb.php', code);
console.log('Combined code length:', code.length);

async function main() {
  // Create new snippet
  const r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'PM_WithFB', code, active: true, scope: 'global' })
  });
  const d = await r.json();
  console.log('ID:', d.id, 'Active:', d.active, 'Error:', d.code_error || 'none');
  
  if (d.active) {
    // Deactivate old snippets
    for (const id of [173, 174]) {
      await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/' + id, {
        method: 'POST', headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: false })
      });
    }
    console.log('Old snippets deactivated');
    
    // Warm cache
    await fetch(WP_URL + '/manage-products/');
    await fetch(WP_URL + '/manage-products/?act=add');
    console.log('Done!');
  }
}
main().catch(e => console.error(e.message));
