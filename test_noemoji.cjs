require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const fs = require('fs');
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

// Read and strip emojis from the code
let code = fs.readFileSync('product_manager_code.php', 'utf8').replace(/^<\?php\s*/i, '');

// Replace emoji characters with text alternatives
const emojiMap = {
  '🟢': '[BUY]', '🔴': '[SELL]', '📦': '[QTY]', '🌍': '[CTRY]',
  '🚢': '[PRT]', '📋': '[TRM]', '✅': '[OK]', '❌': '[FAIL]',
  '✏️': '[EDIT]', '🗑️': '[DEL]', '➕': '[ADD]', '🔒': '[LOCK]',
  '⚙️': '[SET]', '💾': '[SAVE]', '📷': '[CAM]', '📘': '[FB]',
  '💰': '[CASH]', '📞': '[PHONE]', '📧': '[EMAIL]', '🌐': '[WEB]',
  '⭐': '[STAR]', '🔗': '[LINK]', '📸': '[PHOTO]', '💬': '[CHAT]'
};

for (const [emoji, text] of Object.entries(emojiMap)) {
  code = code.split(emoji).join(text);
}

// Also remove any other non-ASCII characters that might cause issues
// Keep only ASCII printable chars + newlines
let cleaned = '';
for (let i = 0; i < code.length; i++) {
  const c = code.charCodeAt(i);
  if (c === 10 || c === 13 || c === 9 || (c >= 32 && c <= 126)) {
    cleaned += code[i];
  } else if (c > 127) {
    // Replace non-ASCII with simple alternative
    cleaned += '?';
  } else {
    cleaned += code[i];
  }
}

fs.writeFileSync('product_manager_noemoji.php', cleaned);
console.log('Cleaned code length:', cleaned.length);

async function main() {
  const r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'PM_Clean', code: cleaned, active: true, scope: 'global' })
  });
  const d = await r.json();
  console.log('Result - ID:', d.id, 'Active:', d.active, 'Error:', d.code_error || 'none');
}
main().catch(e => console.error(e.message));
