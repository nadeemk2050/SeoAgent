require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const fs = require('fs');
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

let code = fs.readFileSync('product_manager_code.php', 'utf8').replace(/^<\?php\s*/i, '');

// Only replace emojis (multi-byte UTF-8 symbols with code points > U+2000)
// Common emojis used in the code
const replacements = [
  ['?', '[OK]'], ['?', '[FAIL]'], ['?', '[EDIT]'], ['?', '[DEL]'],
  ['?', '[LOCK]'], ['?', '[ADD]'], ['?', '[SAVE]'], ['?', '[CAM]'],
  ['?', '[FB]'], ['?', '[LINK]'], ['?', '[PHOTO]'], ['?', '[CHAT]'],
  ['?', '[SET]'],
  // These are specific emojis we use
  ['\u{1F7E2}', '[BUY]'],  // 🟢
  ['\u{1F534}', '[SELL]'], // 🔴
  ['\u{1F4E6}', '[QTY]'],  // 📦
  ['\u{1F30D}', '[CTRY]'], // 🌍
  ['\u{1F6A2}', '[PRT]'],  // 🚢
  ['\u{1F4CB}', '[TRM]'],  // 📋
  ['\u{2705}', '[OK]'],    // ✅
  ['\u{274C}', '[FAIL]'],  // ❌
  ['\u{270F}\u{FE0F}', '[EDIT]'], // ✏️
  ['\u{1F5D1}\u{FE0F}', '[DEL]'], // 🗑️
  ['\u{2795}', '[ADD]'],   // ➕
  ['\u{1F512}', '[LOCK]'], // 🔒
  ['\u{2699}\u{FE0F}', '[SET]'], // ⚙️
  ['\u{1F4BE}', '[SAVE]'], // 💾
  ['\u{1F4F7}', '[CAM]'],  // 📷
  ['\u{1F4D8}', '[FB]'],   // 📘
  ['\u{1F517}', '[LINK]'], // 🔗
  ['\u{1F4F8}', '[PHOTO]'],// 📸
  ['\u{1F4AC}', '[CHAT]'], // 💬
];

for (const [emoji, text] of replacements) {
  code = code.replaceAll(emoji, text);
}

// Save cleaned version
fs.writeFileSync('product_manager_clean.php', code);
console.log('Cleaned code length:', code.length);

async function main() {
  const r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'PM_Clean2', code, active: true, scope: 'global' })
  });
  const d = await r.json();
  console.log('Result - ID:', d.id, 'Active:', d.active, 'Error:', d.code_error || 'none');
  
  // Also restore snippet 85
  const original85 = fs.readFileSync('snippet85_dump.txt', 'utf8');
  await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/85', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: original85 })
  });
  await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/85', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ active: true })
  });
  console.log('85 restored');
}
main().catch(e => console.error(e.message));
