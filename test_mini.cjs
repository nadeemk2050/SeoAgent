require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

async function main() {
  // Test 1: Minimal PHP
  const simple = "<?php\nadd_shortcode('product_admin',function(){return '<p>MINI TEST</p>';});\n";
  let r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'MiniTest', code: simple, active: true, scope: 'global' })
  });
  let d = await r.json();
  console.log('Mini test - ID:', d.id, 'Active:', d.active);
  
  // Test 2: Our product code without <?php tag
  const fs = require('fs');
  const fullCode = fs.readFileSync('product_manager_code.php', 'utf8');
  const noPHPTag = fullCode.replace(/^<\?php\s*/i, '');
  
  r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'PM_NoTag', code: noPHPTag, active: true, scope: 'global' })
  });
  d = await r.json();
  console.log('No PHP tag - ID:', d.id, 'Active:', d.active);
  
  // Check page
  const page = await fetch(WP_URL + '/manage-products/');
  const text = await page.text();
  console.log('Page has shortcode:', text.includes('[product_admin]'));
}
main().catch(e => console.error(e.message));
