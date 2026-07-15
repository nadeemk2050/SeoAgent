require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const fs = require('fs');
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

let code = fs.readFileSync('product_manager_code.php', 'utf8');

// Replace emojis with plain text
const reps = {
  '\u{1F7E2}': '(Buy)','\u{1F534}': '(Sell)','\u{1F4E6}': '[Qty]','\u{1F30D}': '[Dest]',
  '\u{1F6A2}': '[Port]','\u{1F4CB}': '[Terms]','\u{2705}': 'OK ','\u{274C}': 'Fail: ',
  '\u{270F}\u{FE0F}': 'Edit ','\u{1F5D1}\u{FE0F}': 'Delete ','\u{2795}': 'Add ',
  '\u{1F512}': '','\u{2699}\u{FE0F}': '','\u{1F4BE}': 'Save','\u{1F4F7}': '',
  '\u{1F4D8}': 'FB','\u{1F517}': '','\u{1F4F8}': '','\u{1F4AC}': '',
  '\u{1F4CD}': '','\u{1F4CE}': '','\u{00B0}': '','\u{2192}': '->',
  '\u{00AB}': '<<','\u{00BB}': '>>','\u{2013}': '-','\u{2014}': '-',
  '\u{2018}': "'",'\u{2019}': "'",'\u{201C}': '"','\u{201D}': '"',
  '\u{2022}': '*','\u{2026}': '...','\u{2122}': '(TM)','\u{FE0F}': '',
  '\u{2702}': '',
};
for (const [e, r] of Object.entries(reps)) {
  code = code.split(e).join(r);
}

// Remove <?php tag
code = code.replace(/^<\?php\s*/i, '');

// STRIP: Facebook credentials + Facebook function (they cause parser issues)
// Find line with FACEBOOK CREDENTIALS and remove through DISPLAY INQUIRY META
const lines = code.split('\n');
let keep = true;
let result = [];
for (const line of lines) {
  if (line.includes('FACEBOOK CREDENTIALS') || line.includes('FACEBOOK AUTO-POST')) {
    keep = false;
    continue;
  }
  if (line.includes('DISPLAY INQUIRY META')) {
    keep = true;
  }
  if (keep) result.push(line);
}
code = result.join('\n');

// Also remove push_fb handler
code = code.replace(/\/\/ --- FACEBOOK PUSH ---[\s\S]*?(?=\/\/ --- DELETE ---)/, '');

// Remove FB icon HTML
code = code.replace(/Facebook push icon[\s\S]*?<\/a>;\s*/g, '');

// Final check - strip any remaining non-ASCII
let clean = '';
for (let i = 0; i < code.length; i++) {
  const c = code.charCodeAt(i);
  if (c === 10 || c === 13 || c === 9 || (c >= 32 && c <= 126) || (c >= 128 && c <= 255)) {
    clean += code[i];
  }
}

console.log('Clean length:', clean.length);
console.log('Has FB_PAGE_TOKEN:', clean.includes('FB_PAGE'));
console.log('Has emoji:', /[^\x20-\x7E\n\r\t]/.test(clean));

async function main() {
  const r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'PM_Complete', code: clean, active: true, scope: 'global' })
  });
  const d = await r.json();
  console.log('ID:', d.id, 'Active:', d.active, 'Error:', JSON.stringify(d.code_error));
}
main().catch(e => console.error(e.message));
