require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const fs = require('fs');
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');
const code = fs.readFileSync('product_manager_code.php', 'utf8');

async function main() {
  // Get current theme name
  const r = await fetch(WP_URL + '/wp-json/wp/v2/themes?status=active', {
    headers: { 'Authorization': 'Basic ' + auth }
  });
  const themes = await r.json();
  const theme = Array.isArray(themes) ? themes[0] : themes?.data?.[0];
  console.log('Active theme:', theme?.stylesheet || theme?.theme || 'astra');
  
  // Use the theme file editor to add our code to functions.php
  // First read current functions.php
  const themeName = theme?.stylesheet || 'astra';
  
  const r2 = await fetch(WP_URL + '/wp-json/code-snipperts/v1/snippets?search=Product Manager', {
    headers: { 'Authorization': 'Basic ' + auth }
  });
  
  // Alternative: Create a simple standalone snippet that just includes our file
  // Or use wp_insert_post directly via the REST API
  
  // Actually, let me try to create a MU plugin via the REST API
  // WordPress has a file editor endpoint
  const fileContent = '<?php\n/**\n * Product Manager Auto-loaded\n */\n' + 
    "add_action('init', function() {\n" +
    "    if (shortcode_exists('product_admin')) return;\n" +
    "    // Load the code\n" +
    "    eval(substr(file_get_contents(__FILE__), 0, 0));\n" +
    "});\n";
  
  // Try to write to wp-content/mu-plugins/product-manager.php via REST
  // First check if we can use the theme file editor
  
  // Let me try a different approach - use the Code Snippets REST API but
  // after creation, use the WordPress post API to directly update the snippet's active status
  // by finding its post ID
  
  // Try getting the snippet post directly from wp/v2 with the slug
  const r3 = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/139', {
    headers: { 'Authorization': 'Basic ' + auth }
  });
  const s139 = await r3.json();
  console.log('Snippet 139 exists:', !!s139.id);
  
  // Try the approach from the code snippets plugin documentation
  // The proper way is to set 'active' as 1 not true
  const r4 = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/139', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ active: '1' })  // Try string '1' instead of boolean true
  });
  const d4 = await r4.json();
  console.log('With active=string1:', d4.active);
  
  // Try with integer 1
  const r5 = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/139', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ active: 1 })  // Try integer 1
  });
  const d5 = await r5.json();
  console.log('With active=int1:', d5.active);
  
  // Last resort - create with all fields at once including active as 1
  const r6 = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      name: 'PM Final',
      code: code,
      active: '1',
      scope: 'global',
      priority: 10
    })
  });
  const d6 = await r6.json();
  console.log('New snippet - ID:', d6.id, 'Active:', d6.active);
}
main().catch(e => console.error(e.message));
