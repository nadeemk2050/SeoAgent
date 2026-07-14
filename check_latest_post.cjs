require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

async function main() {
  // Get latest post
  const r = await fetch(WP_URL + '/wp-json/wp/v2/posts?per_page=1&orderby=date&order=desc', {
    headers: { 'Authorization': 'Basic ' + auth }
  });
  const posts = await r.json();
  const p = posts[0];
  
  console.log('Post:', p.id, p.title?.rendered);
  
  // Check _product_images meta via custom endpoint or direct
  // The meta might not be exposed via REST, so let's check the featured media
  console.log('Featured media ID:', p.featured_media);
  
  // Count images in content
  const c = p.content?.rendered || '';
  const imgs = c.match(/<img[^>]+>/g) || [];
  console.log('Images in content HTML:', imgs.length);
  
  // Also try to get the meta directly
  const r2 = await fetch(WP_URL + '/wp-json/wp/v2/posts/' + p.id, {
    headers: { 'Authorization': 'Basic ' + auth }
  });
  const p2 = await r2.json();
  console.log('All meta keys:', Object.keys(p2.meta || {}));
  console.log('Full meta:', JSON.stringify(p2.meta));
}
main().catch(e => console.error(e.message));
