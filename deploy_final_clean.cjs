require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const fs = require('fs');
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

// Read original and strip ALL non-ASCII
let code = fs.readFileSync('product_manager_code.php', 'utf8');

// Remove Facebook defines and post_to_facebook function (handled separately)
code = code.replace(/\/\/ === FACEBOOK CREDENTIALS ===[\s\S]*?\/\/ === DISPLAY INQUIRY META/, '// === DISPLAY INQUIRY META');

// Remove push_fb action handler
code = code.replace(/\/\/ --- FACEBOOK PUSH ---[\s\S]*?\/\/ --- DELETE ---/, '// --- DELETE ---');

// Remove FB icon from cards
code = code.replace(/\/\/ Facebook push icon[\s\S]*?<\/a>;\s*\n\s*/g, '');

// Replace ALL emojis with text alternatives manually
const replacements = [
  ['✅ ', ''], ['❌ ', 'Failed: '], ['✏️ ', 'Edit '], ['🗑️ ', 'Delete '],
  ['➕ ', ''], ['🔒 ', ''], ['⚙️', ''], ['💾 ', 'Save '],
  ['📷 ', ''], ['📘 ', ''], ['🔗 ', ''], ['📸 ', ''],
  ['💬 ', ''], ['📌 ', ''], ['🟢', ''], ['🔴', ''],
  ['📦 ', ''], ['🌍 ', ''], ['🚢 ', ''], ['📋 ', ''],
  ['▶', '>'], ['◀', '<'],
  ['—', '-'], ['–', '-'], ['•', '*'],
  ['✨', ''], ['📞', ''], ['📧', ''],
  // Specific replacements  
  ['\n\n\n\n', '\n'],
  ['≤100KB', '<=100KB'],
];

for (const [from, to] of replacements) {
  code = code.split(from).join(to);
}

// Also strip any remaining non-ASCII
let clean = '';
for (let i = 0; i < code.length; i++) {
  const c = code.charCodeAt(i);
  if (c === 10 || c === 13 || c === 9 || (c >= 32 && c <= 126)) {
    clean += code[i];
  }
  // Skip non-ASCII (emojis, etc.)
}

// Save for inspection
fs.writeFileSync('pm_final_clean.php', clean);
console.log('Final code length:', clean.length);

async function main() {
  const r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'PM_FinalClean', code: clean, active: true, scope: 'global' })
  });
  const d = await r.json();
  console.log('ID:', d.id, 'Active:', d.active, 'Error:', JSON.stringify(d.code_error));
  
  // Check page
  const page = await fetch(WP_URL + '/manage-products/');
  const text = await page.text();
  console.log('Page has [product_admin]:', text.includes('[product_admin]'));
}
main().catch(e => console.error(e.message));
