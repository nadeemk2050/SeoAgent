require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const fs = require('fs');
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

let code = fs.readFileSync('pm_manual_clean.php', 'utf8').replace(/^<\?php\s*/i, '');

// Remove Facebook defines and function
code = code.replace(/\/\/ === FACEBOOK CREDENTIALS ===[\s\S]*?\/\/ === DISPLAY INQUIRY META/, '// === DISPLAY INQUIRY META');
code = code.replace(/\/\/ --- FACEBOOK PUSH ---[\s\S]*?\/\/ --- DELETE ---/, '// --- DELETE ---');
// Remove FB icon HTML from cards
code = code.replace(/\n\s*\/\/ Facebook push icon[\s\S]*?<\/a>;\s*\n/g, '\n');

console.log('Code length:', code.length);
console.log('Has emoji:', /[^\x20-\x7E\n\r\t]/.test(code));
console.log('Has defines:', code.includes('FB_PAGE_TOKEN'));

async function main() {
  const r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'PM_Clean3', code, active: true, scope: 'global' })
  });
  const d = await r.json();
  console.log('ID:', d.id, 'Active:', d.active, 'Error:', JSON.stringify(d.code_error));
  
  if (d.active) {
    console.log('SUCCESS! Page should work now.');
  }
}
main().catch(e => console.error(e.message));
