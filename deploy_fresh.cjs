require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const fs = require('fs');
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');
const code = fs.readFileSync('product_manager_code.php', 'utf8');

async function main() {
  // Deactivate all old Product Manager snippets
  const r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
    headers: { 'Authorization': 'Basic ' + auth }
  });
  const snips = await r.json();
  for (const s of (Array.isArray(snips) ? snips : [])) {
    if (s.name && s.name.includes('Product Manager')) {
      await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/' + s.id, {
        method: 'POST',
        headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: false })
      });
    }
  }
  
  // Create new snippet - try with active:true in creation
  const r2 = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'PM v10', code: code, active: true, scope: 'global' })
  });
  const d = await r2.json();
  console.log('Created:', d.id, 'Active from create:', d.active);
  
  // If not active, try a separate activation with minimum payload
  if (!d.active && d.id) {
    await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/' + d.id, {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: true })
    });
    // Check status
    const ck = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/' + d.id, {
      headers: { 'Authorization': 'Basic ' + auth }
    });
    const st = await ck.json();
    console.log('Final status - Active:', st.active);
    
    if (!st.active) {
      console.log('Trying PUT instead...');
      await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/' + d.id, {
        method: 'PUT',
        headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: true })
      });
      const ck2 = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/' + d.id, {
        headers: { 'Authorization': 'Basic ' + auth }
      });
      const st2 = await ck2.json();
      console.log('PUT status - Active:', st2.active);
    }
  }
  
  // Warm caches
  await fetch(WP_URL + '/manage-products/');
  await fetch(WP_URL + '/products-demands/');
  console.log('Done!');
}
main().catch(e => console.error(e.message));
