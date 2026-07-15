require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const fs = require('fs');
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');
const code = fs.readFileSync('product_manager_code.php', 'utf8');

async function main() {
  // Delete all old Product Manager snippets first
  const r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
    headers: { 'Authorization': 'Basic ' + auth }
  });
  const snips = await r.json();
  const list = Array.isArray(snips) ? snips : [];
  
  // Deactivate all old ones
  for (const s of list) {
    if (s.name && s.name.includes('Product Manager')) {
      await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/' + s.id, {
        method: 'POST',
        headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: false })
      });
      console.log('Deactivated:', s.id);
    }
  }
  
  // Create new with unique name
  const r2 = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      name: 'Product Manager v7 FB', 
      code: code, 
      active: true, 
      scope: 'global' 
    })
  });
  const d = await r2.json();
  console.log('Created:', d.id, 'Active:', d.active);
  
  // If not active, try one more time
  if (!d.active) {
    const r3 = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/' + d.id, {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: true })
    });
    const d2 = await r3.json();
    console.log('Retry active:', d2.active);
  }
  
  // Purge everything
  await fetch(WP_URL + '/manage-products/');
  await fetch(WP_URL + '/products-demands/');
  console.log('Done!');
}
main().catch(e => console.error(e.message));
