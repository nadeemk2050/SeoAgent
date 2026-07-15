require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const fs = require('fs');
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

// Read the code, strip only what's absolutely necessary
let code = fs.readFileSync('product_manager_code.php', 'utf8')
  .replace(/^<\?php\s*/i, '')
  // Remove Facebook sections (line-by-line to avoid regex issues)
const lines = code.split('\n');
let result = [];
let skip = false;
for (const line of lines) {
  if (line.includes('FACEBOOK CREDENTIALS') || line.includes('FACEBOOK AUTO-POST')) {
    skip = true;
    continue;
  }
  if (line.includes('DISPLAY INQUIRY META ON SINGLE POST')) {
    skip = false;
  }
  if (!skip) result.push(line);
}
code = result.join('\n');

// Remove push_fb section  
result = []; skip = false;
for (const line of code.split('\n')) {
  if (line.includes('FACEBOOK PUSH')) { skip = true; continue; }
  if (line.includes('--- DELETE ---')) { skip = false; if (!result.length || result[result.length-1].includes('--- DELETE ---')) continue; }
  if (!skip) result.push(line);
}
code = result.join('\n');

// Remove FB icon HTML
code = code.replace(/Facebook push icon[\s\S]*?<\/a>;\s*/g, '');

// Remove ALL non-ASCII
code = code.replace(/[^\x20-\x7E\n\r\t]/g, '');

console.log('Code length:', code.length);
console.log('Has emoji:', /[^\x20-\x7E\n\r\t]/.test(code));
console.log('Has FB token:', code.includes('FB_PAGE'));

async function main() {
  // Update the loader snippet to use inline code instead of eval
  const inlineCode = code;
  
  // Deactivate old loader
  await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/168', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ active: false })
  });
  
  // Create new snippet with the cleaned code directly
  const r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'PM_Restored', code: inlineCode, active: true, scope: 'global' })
  });
  const d = await r.json();
  console.log('New snippet - ID:', d.id, 'Active:', d.active, 'Error:', JSON.stringify(d.code_error));
  
  // Force purge
  await fetch(WP_URL + '/manage-products/');
  await fetch(WP_URL + '/?p=1');
  console.log('Done');
}
main().catch(e => console.error(e.message));
