require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const fs = require('fs');
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');
const code = fs.readFileSync('product_manager_code.php', 'utf8');

async function main() {
  // Get all snippets
  const r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
    headers: { 'Authorization': 'Basic ' + auth }
  });
  const snips = await r.json();
  const list = Array.isArray(snips) ? snips : [];
  
  // Delete ALL product manager snippets entirely
  for (const s of list) {
    if (s.name && (s.name.includes('Product Manager') || s.name.includes('PM '))) {
      // Try DELETE first
      try {
        const d = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/' + s.id, {
          method: 'DELETE',
          headers: { 'Authorization': 'Basic ' + auth }
        });
        console.log('Deleted:', s.id, s.name, d.status);
      } catch(e) {
        console.log('Failed delete:', s.id, e.message);
      }
    }
  }
  
  // Create one fresh
  const r2 = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Product Manager Live', code: code, active: true, scope: 'global' })
  });
  const d2 = await r2.json();
  console.log('Created:', d2.id, 'Active:', d2.active);
  
  // If still not active, try via a different method - set active=1 in the URL params  
  if (!d2.active && d2.id) {
    // Try with GET parameter  
    const r3 = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/' + d2.id + '?active=1', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: true })
    });
    const d3 = await r3.json();
    console.log('With param - Active:', d3.active);
  }
}
main().catch(e => console.error(e.message));
