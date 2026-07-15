require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const fs = require('fs');
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');
const code = fs.readFileSync('product_manager_code.php', 'utf8');

async function main() {
  // STEP 1: Create a completely new snippet
  console.log('Creating new snippet...');
  const r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      name: 'ProdMgr_' + Date.now(),
      code: code,
      scope: 'global',
      active: true
    })
  });
  const d = await r.json();
  console.log('Created:', d.id, 'API says active:', d.active);
  
  if (!d.active && d.id) {
    // STEP 2: Try the same request again (sometimes it works the second time)
    console.log('Retry activation...');
    const r2 = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/' + d.id, {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: true })
    });
    const d2 = await r2.json();
    console.log('Retry says active:', d2.active);
    
    if (!d2.active) {
      // STEP 3: Try to use WordPress admin-ajax to activate
      // First get a nonce
      console.log('Trying admin-ajax approach...');
      const nonceResp = await fetch(WP_URL + '/wp-admin/admin-ajax.php?action=rest-nonce', {
        headers: { 'Authorization': 'Basic ' + auth }
      });
      const nonce = await nonceResp.text();
      console.log('Nonce:', nonce.substring(0, 20));
      
      if (nonce && nonce.length > 5) {
        const r3 = await fetch(WP_URL + '/wp-admin/admin-ajax.php', {
          method: 'POST',
          headers: { 
            'Authorization': 'Basic ' + auth,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            action: 'code_snippets_ajax',
            sub_action: 'activate',
            snippet_id: d.id,
            _wpnonce: nonce
          })
        });
        const text = await r3.text();
        console.log('AJAX result:', text.substring(0, 200));
      }
    }
  }
  
  // STEP 4: Verify by checking page
  const pageCheck = await fetch(WP_URL + '/manage-products/');
  const pageText = await pageCheck.text();
  console.log('Page has product_admin shortcode visible:', pageText.includes('[product_admin]'));
  console.log('Page has products:', pageText.includes('tons') || pageText.includes('TONS'));
}
main().catch(e => console.error(e.message));
