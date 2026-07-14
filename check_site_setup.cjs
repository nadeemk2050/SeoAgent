require('dotenv').config({ path: 'c:/app2026/SeoAgent/.env' });
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

(async () => {
  // Settings
  const r1 = await fetch(WP_URL + '/wp-json/wp/v2/settings', { headers: { 'Authorization': 'Basic ' + auth } });
  const s = await r1.json();
  console.log('=== Settings ===');
  console.log('page_on_front:', s.page_on_front);
  console.log('page_for_posts:', s.page_for_posts);
  console.log('show_on_front:', s.show_on_front);

  // Pages
  const r2 = await fetch(WP_URL + '/wp-json/wp/v2/pages?per_page=100', { headers: { 'Authorization': 'Basic ' + auth } });
  const pages = await r2.json();
  console.log('\n=== Pages ===');
  pages.forEach(p => console.log(p.id, '|', p.slug, '|', p.title?.rendered, '| status:', p.status));

  // Posts
  const r3 = await fetch(WP_URL + '/wp-json/wp/v2/posts?per_page=5', { headers: { 'Authorization': 'Basic ' + auth } });
  const posts = await r3.json();
  console.log('\n=== Posts ===');
  if (Array.isArray(posts)) {
    posts.forEach(p => console.log(p.id, '|', p.slug, '|', p.title?.rendered, '| status:', p.status));
    console.log('Total:', posts.length);
  } else {
    console.log('No posts or error:', JSON.stringify(posts).substring(0, 200));
  }

  // Check if there's a blog/posts page already
  const blogPage = pages.find(p => p.slug === 'blog' || p.slug === 'posts' || p.slug === 'products');
  if (blogPage) console.log('\nBlog page exists:', blogPage.id, blogPage.slug);
  else console.log('\nNo blog/posts/products page found');
})();
