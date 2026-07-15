require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const fs = require('fs');
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

// Read the original file, strip <?php tag and emojis
let code = fs.readFileSync('product_manager_code.php', 'utf8').replace(/^<\?php\s*/i, '');
code = code.replace(/[^\x20-\x7E\n\r\t]/g, '');

// Remove the Facebook defines and function
const cleanLines = [];
let skip = false;
for (const line of code.split('\n')) {
  if (line.includes('FACEBOOK CREDENTIALS') || line.includes('FACEBOOK AUTO-POST')) {
    skip = true;
    continue;
  }
  if (line.includes('DISPLAY INQUIRY META')) {
    skip = false;
  }
  if (!skip) cleanLines.push(line);
}
let cleanCode = cleanLines.join('\n');

// Remove push FB section
cleanCode = cleanCode.replace(/\/\/ --- FACEBOOK PUSH ---[\s\S]*?\/\/ --- DELETE ---/, '// --- DELETE ---');
cleanCode = cleanCode.replace(/Facebook push icon[\s\S]*?<\/a>;\s*/g, '');

// Write to a temp file
fs.writeFileSync('temp_clean.php', cleanCode);
console.log('Cleaned code length:', cleanCode.length);

// Now create a CODE SNIPPET that just includes this file
// Upload the PHP file as a media attachment
const boundary = '----FormBoundary' + Date.now();
const header = '--' + boundary + '\r\n' +
  'Content-Disposition: form-data; name="file"; filename="pm_loader.php"\r\n' +
  'Content-Type: application/octet-stream\r\n\r\n';
const footer = '\r\n--' + boundary + '--\r\n';
const body = header + '<?php include_once(ABSPATH . "wp-content/uploads/pm_code.php"); ?>' + footer;

async function main() {
  // Upload the main code file as wp-content upload
  const fileBuf = fs.readFileSync('temp_clean.php');
  
  // Use the media endpoint to upload the PHP file
  const formData = new FormData();
  formData.append('file', new Blob([fileBuf], { type: 'application/octet-stream' }), 'pm_code.php');
  
  const r = await fetch(WP_URL + '/wp-json/wp/v2/media', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Disposition': 'attachment; filename=pm_code.php' },
    body: formData
  });
  
  const result = await r.json();
  console.log('Upload result:', result.id ? 'OK ID: ' + result.id : 'Failed: ' + JSON.stringify(result).substring(0, 200));
}
main().catch(e => console.error(e.message));
