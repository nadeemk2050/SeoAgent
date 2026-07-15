require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

async function main() {
  const r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/85', {
    headers: { 'Authorization': 'Basic ' + auth }
  });
  const s = await r.json();
  // Output the full code
  require('fs').writeFileSync('snippet85_dump.txt', s.code || 'NO CODE');
  console.log('Code length:', s.code?.length);
  console.log('Last 200 chars:', s.code?.slice(-200));
}
main().catch(e => console.error(e.message));
