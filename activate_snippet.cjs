require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

async function main() {
  // Get the last working snippet (118) - it was active before
  // Actually 118 was deleted, so let's activate 127 and check error
  const r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/127', {
    headers: { 'Authorization': 'Basic ' + auth }
  });
  const d = await r.json();
  
  // Check if there's error info
  console.log('ID:', d.id, 'Active:', d.active);
  console.log('First 100 chars:', (d.code || '').substring(0, 100));
  console.log('Error:', d.code_error);
  
  // Try to activate - the issue might be that we removed <?php
  // Let's add it back
  let code = d.code || '';
  if (!code.startsWith('<?php')) {
    code = '<?php\n' + code;
    const r2 = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/127', {
      method: 'PUT',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code, active: true })
    });
    const d2 = await r2.json();
    console.log('After adding <?php - Active:', d2.active);
  }
}
main().catch(e => console.error(e.message));
