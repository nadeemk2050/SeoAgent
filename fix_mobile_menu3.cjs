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
  
  // Direct string replacement  
  const search = '<li><a href="/pvc-pipe-scrap-suppliers/">PVC Pipe Scrap</a></li>';
  const add = '\n\t\t\t\t\t\t<li><a href="/manage-products/">Manage Products</a></li>';
  
  // Find PVC line regardless of leading whitespace
  const idx = code.indexOf('/pvc-pipe-scrap-suppliers/');
  if (idx >= 0 && !code.includes('/manage-products/')) {
    // Find the start of this line (go back to previous newline)
    const lineStart = code.lastIndexOf('\n', idx);
    const lineEnd = code.indexOf('\n', idx);
    const fullLine = code.substring(lineStart, lineEnd);
    
    // Insert after this line
    code = code.substring(0, lineEnd) + add + code.substring(lineEnd);
    
    const r2 = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/59', {
      method: 'PUT',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code, active: true })
    });
    const res = await r2.json();
    console.log('Result:', res.active === true ? '✅ Updated!' : '❌ Failed');
  } else {
    console.log('Not found or already has link');
    console.log('Idx:', idx, 'Already has:', code.includes('/manage-products/'));
  }
}
main().catch(e => console.error(e.message));
