require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

async function main() {
  const r = await fetch(WP_URL + '/wp-json/wp/v2/posts?per_page=1&orderby=date&order=desc', {
    headers: { 'Authorization': 'Basic ' + auth }
  });
  const posts = await r.json();
  const p = posts[0];
  console.log('Latest:', p.id, p.title?.rendered);
  console.log('Featured:', p.featured_media);
  
  const content = p.content?.rendered || '';
  const imgRegex = /<img[^>]+>/g;
  const imgs = content.match(imgRegex) || [];
  console.log('Images in content:', imgs.length);
  imgs.forEach((img, i) => {
    const m = img.match(/src="([^"]+)"/);
    console.log('  Img ' + (i+1) + ':', m ? m[1].substring(0, 60) : 'no src');
  });
  
  // Also check meta
  console.log('Meta:', JSON.stringify(p.meta));
}
main().catch(e => console.error(e.message));
