require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

async function main() {
  // Get current code
  let r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/173', {
    headers: { 'Authorization': 'Basic ' + auth }
  });
  let s = await r.json();
  let code = s.code || '';
  
  // Check if push_fb handler already exists
  if (code.includes('FACEBOOK PUSH SECTION')) {
    console.log('Already has FB push handler');
    return;
  }
  
  // Add the push_fb handler before the DELETE section
  const handler = `
    // FACEBOOK PUSH SECTION
    if ($action === 'push_fb' && isset($_GET['post_id'])) {
        $fbpid = intval($_GET['post_id']);
        if (!$auth_ok) {
            $output .= '<div style="max-width:400px;margin:20px 0;padding:25px;background:#fff;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.08);"><h3>Post to Facebook</h3><p style="color:#666;font-size:0.9rem;">Enter password to post to Facebook.</p><form method="post" style="display:flex;gap:10px;flex-wrap:wrap;"><input type="hidden" name="act" value="push_fb"><input type="hidden" name="post_id" value="' . $fbpid . '"><input type="password" name="admin_pw" placeholder="Password" style="flex:1;padding:10px;border:2px solid #e0e0e0;border-radius:6px;"><input type="submit" value="Post Now" style="background:#1877F2;color:#fff;padding:10px 20px;border:none;border-radius:6px;cursor:pointer;"></form></div>';
        } else {
            if (function_exists('post_to_fb')) {
                $fbok = post_to_fb($fbpid);
                if ($fbok) {
                    $output .= '<div style="background:#d4edda;color:#155724;padding:12px;border-radius:6px;margin-bottom:15px;">Posted to Facebook! <a href="https://www.facebook.com/profile.php?id=1273833299139182" target="_blank" style="color:#155724;font-weight:600;">View Post</a></div>';
                } else {
                    $output .= '<div style="background:#f8d7da;color:#721c24;padding:12px;border-radius:6px;margin-bottom:15px;">Facebook post failed.</div>';
                }
            } else {
                $output .= '<div style="background:#fff3cd;color:#856404;padding:12px;border-radius:6px;margin-bottom:15px;">FB feature not available.</div>';
            }
        }
    }
`;
  
  // Insert before "// DELETE" or the delete check
  if (code.includes("// --- DELETE ---")) {
    code = code.replace("// --- DELETE ---", handler + "\n    // --- DELETE ---");
  } else if (code.includes("if ($action === 'delete'")) {
    code = code.replace("if ($action === 'delete'", handler + "\n    if ($action === 'delete'");
  } else {
    console.log('Could not find insertion point');
    return;
  }
  
  // Update snippet
  r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/173', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, active: true })
  });
  let d = await r.json();
  console.log('173 Updated. Active:', d.active, 'Error:', d.code_error || 'none');
  
  // Warm cache
  await fetch(WP_URL + '/manage-products/');
  console.log('Done');
}
main().catch(e => console.error(e.message));
