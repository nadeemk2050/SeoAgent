require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

async function main() {
  // Create minimal test
  const code = "add_shortcode('product_admin',function(){return '<p>OK</p>';});";
  let r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'TestMini2', code, active: true, scope: 'global' })
  });
  let d = await r.json();
  console.log('TestMini2 - ID:', d.id, 'Active:', d.active, 'Error:', d.code_error);
}
main().catch(e => console.error(e.message));
