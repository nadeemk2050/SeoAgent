require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const fs = require('fs');
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

async function main() {
  const r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/120', {
    headers: { 'Authorization': 'Basic ' + auth }
  });
  const s = await r.json();
  fs.writeFileSync('snippet120_dump.txt', s.code || 'NOCONTENT');
  console.log('Done, code length:', (s.code || '').length);
}
main().catch(e => console.error(e.message));
