require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const fs = require('fs');
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

let code = fs.readFileSync('product_manager_code.php', 'utf8').replace(/^<\?php\s*/i, '');

// Remove Facebook defines and post_to_facebook function entirely
// The Facebook push is handled separately
code = code.replace(/\/\/ === FACEBOOK CREDENTIALS ===[\s\S]*?\/\/ === FACEBOOK AUTO-POST ===[\s\S]*?\/\/ === DISPLAY INQUIRY META/, '// === DISPLAY INQUIRY META');

// Also remove push_fb action handler (since no post_to_facebook function)
code = code.replace(/\/\/ --- FACEBOOK PUSH ---[\s\S]*?\/\/ --- DELETE ---/, '// --- DELETE ---');

// Also remove the FB icon from card (since no function to call)
code = code.replace(/\/\/ Facebook push icon[\s\S]*?<\/a>;\s*\n\s*(\/\/ Gear icon)/, '$1');

// Replace emojis in remaining code
const emojiMap = {
  '🟢': '(Buy)', '🔴': '(Sell)', '📦': '', '🌍': '', '🚢': '',
  '📋': '', '✅': '', '❌': '', '✏️': '', '🗑️': '',
  '➕': '', '🔒': '', '⚙️': '', '💾': '', '📷': '',
  '📘': '', '🔗': '', '📸': '', '💬': '', '📌': '',
  '📞': '', '📧': ''
};
for (const [e, t] of Object.entries(emojiMap)) {
  code = code.split(e).join(t);
}

fs.writeFileSync('product_manager_stripped.php', code);
console.log('Stripped code length:', code.length);

async function main() {
  const r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'PM_Stripped', code, active: true, scope: 'global' })
  });
  const d = await r.json();
  console.log('Result - ID:', d.id, 'Active:', d.active, 'Error:', d.code_error || 'none');
  
  // Check page
  const page = await fetch(WP_URL + '/manage-products/');
  const text = await page.text();
  console.log('Page has [product_admin] visible:', text.includes('[product_admin]'));
}
main().catch(e => console.error(e.message));
