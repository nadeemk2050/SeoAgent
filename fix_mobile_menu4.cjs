require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

async function main() {
  const r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/59', {
    headers: { 'Authorization': 'Basic ' + auth }
  });
  const d = await r.json();
  let code = d.code;
  
  const idx = code.indexOf('/pvc-pipe-scrap-suppliers/');
  const lineEnd = code.indexOf('\n', idx);
  const insert = '\n\t\t\t\t\t\t<li><a href="/manage-products/">Manage Products</a></li>';
  code = code.substring(0, lineEnd) + insert + code.substring(lineEnd);
  
  // Try POST (update) instead of PUT
  const r2 = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/59', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: code, active: true })
  });
  const res = await r2.json();
  const hasIt = (res.code || '').includes('/manage-products/');
  console.log('Updated:', hasIt, '| Active:', res.active);
}
main().catch(e => console.error(e.message));
