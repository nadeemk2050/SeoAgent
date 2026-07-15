require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

async function main() {
  // Get current page - the rendered content has the style blocks
  const r = await fetch(WP_URL + '/wp-json/wp/v2/pages/363', {
    headers: { 'Authorization': 'Basic ' + auth }
  });
  const page = await r.json();
  const rendered = page.content?.rendered || '';
  
  // Extract ALL style blocks from the rendered content
  const styleRegex = /<style[^>]*>[\s\S]*?<\/style>/g;
  const styleBlocks = [];
  let match;
  while ((match = styleRegex.exec(rendered)) !== null) {
    styleBlocks.push(match[0]);
  }
  
  if (styleBlocks.length === 0) {
    console.log('ERROR: No style blocks found in rendered content!');
    return;
  }
  
  // Reconstruct the page content: style blocks + [product_admin] shortcode
  const newContent = styleBlocks.join('\n') + '\n[product_admin]';
  
  console.log('Style blocks found:', styleBlocks.length);
  console.log('New content length:', newContent.length);
  console.log('First 100:', newContent.substring(0, 100));
  console.log('Last 100:', newContent.slice(-100));
  
  // Save it back
  const r2 = await fetch(WP_URL + '/wp-json/wp/v2/pages/363', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: newContent })
  });
  const updated = await r2.json();
  console.log('Page updated:', updated.id);
  
  // Warm cache
  await fetch(WP_URL + '/manage-products/');
  console.log('Done!');
}
main().catch(e => console.error(e.message));
