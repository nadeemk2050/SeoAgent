require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

(async () => {
  // 1. Force re-publish to bust cache
  console.log('Forcing re-publish of Contact Us page...');
  const r = await fetch(WP_URL + '/wp-json/wp/v2/pages/203', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'publish' })
  });
  const d = await r.json();
  console.log('Status:', r.status, '| Page status:', d.status);

  // 2. Purge LiteSpeed cache
  console.log('Purging LiteSpeed cache...');
  const purgeCode = "if(class_exists('LiteSpeed\\\\Purge')) { LiteSpeed\\\\Purge::purge_all(); }";
  await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Purge Cache Final',
      code: purgeCode,
      active: true,
      scope: 'global'
    })
  });
  
  // 3. Hit the page to warm cache
  console.log('Warming page cache...');
  await fetch('https://alshaabalwaseem.com/contact-us/');
  
  console.log('\nDone - Contact Us page is live!');
  console.log('URL: https://alshaabalwaseem.com/contact-us/');
})();
