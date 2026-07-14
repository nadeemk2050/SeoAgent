require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

async function main() {
  const r = await fetch(WP_URL + '/wp-json/wp/v2/posts/378', {
    headers: { 'Authorization': 'Basic ' + auth }
  });
  const p = await r.json();
  const title = p.title?.rendered || 'pvc lot 004';
  const desc = p.content?.rendered || '';
  const fm = p.featured_media;
  
  if (fm) {
    const r2 = await fetch(WP_URL + '/wp-json/wp/v2/media/' + fm, {
      headers: { 'Authorization': 'Basic ' + auth }
    });
    const media = await r2.json();
    const url = media.source_url || '';
    const imgHtml = '<img src="' + url + '" alt="' + title + '" style="max-width:100%;height:auto;border-radius:6px;margin-bottom:10px;display:block;">';
    const newContent = imgHtml + '\n' + desc;
    
    await fetch(WP_URL + '/wp-json/wp/v2/posts/378', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newContent })
    });
    console.log('Post 378 updated with image in content!');
  } else {
    console.log('No featured media');
  }
}
main().catch(e => console.error(e.message));
