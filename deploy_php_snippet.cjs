require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const fs = require('fs');
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

const code = fs.readFileSync('c:/app2026/SeoAgent/product_manager_code.php', 'utf8');

async function run() {
  try {
    const r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
      headers: { 'Authorization': 'Basic ' + auth }
    });
    const snips = await r.json();
    const list = Array.isArray(snips) ? snips : (snips?.data || []);
    for (const s of list) {
      if (s.name && s.name.includes('Product Manager') && s.active) {
        await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/' + s.id, {
          method: 'PUT', headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
          body: JSON.stringify({ active: false })
        });
        console.log('Deactivated:', s.name);
      }
    }
    const r2 = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
      method: 'POST', headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Product Manager with Images', code, active: true, scope: 'global' })
    });
    const d = await r2.json();
    console.log('Created! ID:', d.id || 'Failed');
    
    const purge = "if(class_exists('LiteSpeed\\\\Purge')) { LiteSpeed\\\\Purge::purge_all(); }";
    await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
      method: 'POST', headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Purge Img', code: purge, active: true, scope: 'global' })
    });
    await fetch(WP_URL + '/manage-products/');
    console.log('Done!');
  } catch(e) { console.error(e.message); }
}
run();
