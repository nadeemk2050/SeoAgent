require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const fs = require('fs');
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

async function main() {
  // Read the full code
  let code = fs.readFileSync('product_manager_code.php', 'utf8');
  
  // Upload as a text file via media library
  // The media endpoint accepts multipart form uploads
  const blob = Buffer.from(code, 'utf8');
  
  // Use wp/v2/media endpoint
  const boundary = '----WebKitFormBoundary' + Date.now();
  
  // Build multipart body manually
  const bodyParts = [];
  bodyParts.push('--' + boundary);
  bodyParts.push('Content-Disposition: form-data; name="file"; filename="pm_code.txt"');
  bodyParts.push('Content-Type: text/plain');
  bodyParts.push('');
  bodyParts.push(code);
  bodyParts.push('--' + boundary + '--');
  bodyParts.push('');
  
  const body = bodyParts.join('\r\n');
  
  const r = await fetch(WP_URL + '/wp-json/wp/v2/media', {
    method: 'POST',
    headers: { 
      'Authorization': 'Basic ' + auth,
      'Content-Type': 'multipart/form-data; boundary=' + boundary,
      'Content-Disposition': 'attachment; filename=pm_code.txt'
    },
    body: body
  });
  
  const result = await r.json();
  console.log('Upload result:', result.id ? 'OK - Media ID: ' + result.id + ', URL: ' + result.source_url : 'Failed');
  
  if (result.id) {
    // Now create a small snippet that loads this code
    const loaderCode = `add_action('init',function(){if(shortcode_exists('product_admin'))return;\$url='${result.source_url}';\$resp=wp_remote_get(\$url);if(!is_wp_error(\$resp)){eval(wp_remote_retrieve_body(\$resp));}});`;
    
    const r2 = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'PM_Loader', code: loaderCode, active: true, scope: 'global' })
    });
    const d2 = await r2.json();
    console.log('Loader snippet - ID:', d2.id, 'Active:', d2.active, 'Error:', d2.code_error);
  }
}
main().catch(e => console.error(e.message));
