require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const fs = require('fs');
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

// Read the file and extract only the product_admin shortcode and its dependencies
let code = fs.readFileSync('product_manager_code.php', 'utf8').replace(/^<\?php\s*/i, '');

// Split into sections
const sections = code.split('\n// === ');

// Find product_admin section
const paSection = sections.find(s => s.includes('PRODUCT ADMIN'));
// Find AJAX section  
const ajaxSection = sections.find(s => s.includes('AJAX IMAGE UPLOAD'));
// Find seo_banner and recent_products
const seoSection = sections.find(s => s.includes('SEO BANNER'));
const rpSection = sections.find(s => s.includes('RECENT PRODUCTS'));

// Build just what we need
const combined = '// === ' + ajaxSection + '\n\n// === ' + seoSection + '\n\n// === ' + rpSection + '\n\n// === ' + paSection;

// Remove emojis
const clean = combined.replace(/[^\x20-\x7E\n\r\t]/g, '');

console.log('Combined length:', clean.length);

async function main() {
  const r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'PM_CoreOnly', code: clean, active: true, scope: 'global' })
  });
  const d = await r.json();
  console.log('ID:', d.id, 'Active:', d.active, 'Error:', d.code_error ? JSON.stringify(d.code_error) : 'none');
  
  if (d.active) {
    // Deactivate old loader
    await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/168', {
      method: 'POST', headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: false })
    });
    console.log('Old loader deactivated');
    
    // Check page
    const page = await fetch(WP_URL + '/manage-products/');
    const text = await page.text();
    console.log('Page OK:', !text.includes('[product_admin]') && text.includes('Add New Product'));
  }
}
main().catch(e => console.error(e.message));
