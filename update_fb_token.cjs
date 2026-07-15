require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

const newToken = 'EAAV6XuCbNa0BRZBL469fnt3UaNtyLjORTUr3w7oNK7LWxoQ4VlHHjnbdJZAyCkRhDZBNMYE70YwxXJay9xcp6LI92rkivArgON7sZCzl7d66fhLWOMDnsa49zsh0v3cxVul9nDaUtYDGGUfEhi7OOLYcPFIvi5q1cgUouMyEmjUDyZAgZAtOud1DFk3xR0pSRSwGqGtZBZBZBhhLXSlNWJZBj6VCsnXpPIiIWmu3EgZAw6BxcvfPAGQ1XDSN1lmnxSq';

const code = "defined('FB_PAGE_ID') or define('FB_PAGE_ID','1273833299139182');defined('FB_PAGE_TOKEN') or define('FB_PAGE_TOKEN','" + newToken + "');";

async function main() {
  // Update snippet 177
  let r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/177', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, active: true })
  });
  let d = await r.json();
  console.log('177 Updated. Active:', d.active, 'Error:', d.code_error || 'none');
  
  if (!d.active) {
    r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/177', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: true })
    });
    d = await r.json();
    console.log('177 reactivated:', d.active);
  }
  
  // Also save to .env for scripts
  const envPath = require('path').join(__dirname, '.env');
  let env = require('fs').readFileSync(envPath, 'utf8');
  env = env.replace(/FB_PAGE_TOKEN=.*/, 'FB_PAGE_TOKEN="' + newToken + '"');
  require('fs').writeFileSync(envPath, env);
  console.log('Token saved to .env');
}
main().catch(e => console.error(e.message));
