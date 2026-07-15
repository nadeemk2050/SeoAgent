require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const fs = require('fs');
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

async function tryActivate(name, snippetCode) {
  const r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, code: snippetCode, active: true, scope: 'global' })
  });
  const d = await r.json();
  console.log(name, '- ID:', d.id, 'Active:', d.active, 'Error:', d.code_error || 'none');
  return d;
}

async function main() {
  const fullCode = fs.readFileSync('product_manager_code.php', 'utf8').replace(/^<\?php\s*/i, '');
  
  // Test with 3000 chars
  await tryActivate('3k', fullCode.substring(0, 3000));
  
  // Test with 4000 chars
  await tryActivate('4k', fullCode.substring(0, 4000));
  
  // Test without the inline script tags (replace <script> with HTML entities)
  const noScript = fullCode.replace(/<script>/g, '&lt;script&gt;').replace(/<\/script>/g, '&lt;\/script&gt;');
  await tryActivate('NoScript', noScript.substring(0, 5000));
}
main().catch(e => console.error(e.message));
