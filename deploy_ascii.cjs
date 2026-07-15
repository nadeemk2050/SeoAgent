require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const fs = require('fs');
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');
const code = fs.readFileSync('pm_ascii.php', 'utf8').replace(/^<\?php\s*/i, '');

async function main() {
  const r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'PM_ASCII', code, active: true, scope: 'global' })
  });
  const d = await r.json();
  console.log('ID:', d.id, 'Active:', d.active, 'Error:', JSON.stringify(d.code_error));
  
  // Check page
  const page = await fetch(WP_URL + '/manage-products/');
  const text = await page.text();
  console.log('Page has [product_admin]:', text.includes('[product_admin]'));
}
main().catch(e => console.error(e.message));
