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
  const lines = code.split('\n');
  let newLines = [];
  let added = false;
  
  for (let i = 0; i < lines.length; i++) {
    newLines.push(lines[i]);
    if (lines[i].includes('/pvc-pipe-scrap-suppliers/') && !added) {
      newLines.push('\t\t\t\t<li><a href="/manage-products/">Manage Products</a></li>');
      added = true;
    }
  }
  
  if (added) {
    code = newLines.join('\n');
    await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/59', {
      method: 'PUT', headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code, active: true })
    });
    console.log('Updated!');
  } else {
    console.log('Already added or not found');
  }
}
main().catch(e => console.error(e.message));
