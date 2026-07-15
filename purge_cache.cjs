require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

async function main() {
  // Purge cache
  const purgeCode = "<?php if(class_exists('LiteSpeed\\Purge')){LiteSpeed\\Purge::purge_all();} ?>";
  await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'PurgeCache', code: purgeCode, active: true, scope: 'global' })
  });
  
  // Warm up the page
  await fetch(WP_URL + '/manage-products/');
  await fetch(WP_URL + '/manage-products/?act=add');
  console.log('Cache purged!');
}
main().catch(e => console.error(e.message));
