require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

const code = `
add_filter('the_content', function($content) {
    static $shown = false;
    if (is_home() && !$shown) {
        $shown = true;
        $banner = '<div style="max-width:1100px; margin:0 auto 30px; padding:20px; background:#f9fffb; border-radius:12px; border:1px solid #d4edda;">';
        $banner .= '<h2 style="font-size:1.5rem; font-weight:700; color:#1a1a1a; margin-bottom:15px;">Why Buy Scrap Products for Sale UAE?</h2>';
        $banner .= '<p style="color:#444; font-size:1.05rem; line-height:1.8; margin-bottom:15px;">Welcome to our marketplace for premium <strong>scrap products for sale UAE</strong>. At Al Saham Al Ahmar, we connect buyers and sellers across the global scrap trading industry. Browse our latest product listings below.</p>';
        $banner .= '<figure style="margin:15px 0; text-align:center;"><img src="https://alshaabalwaseem.com/wp-content/uploads/2026/05/logo.png" alt="scrap products for sale UAE - premium scrap materials" style="max-width:100%; height:auto; border-radius:8px;" /><figcaption style="color:#888; font-size:0.85rem; margin-top:8px;">Premium scrap products for sale UAE.</figcaption></figure>';
        $banner .= '<p style="margin-top:15px;"><a href="/manage-products/" style="display:inline-block; background:#0d954d; color:#fff; padding:10px 25px; border-radius:6px; text-decoration:none; font-weight:600;">+ Add New Product</a></p>';
        $banner .= '</div>';
        return $banner . $content;
    }
    return $content;
}, 5);
`;

async function run() {
  try {
    const r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
      headers: { 'Authorization': 'Basic ' + auth }
    });
    const snippets = await r.json();
    const list = Array.isArray(snippets) ? snippets : (snippets?.data || []);
    for (const s of list) {
      if (s.name && s.name.includes('Banner') && s.active) {
        await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/' + s.id, {
          method: 'PUT',
          headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
          body: JSON.stringify({ active: false })
        });
        console.log('Deactivated:', s.name);
      }
    }

    await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Products Page Banner Final', code, active: true, scope: 'global' })
    });
    console.log('New banner created!');

    const purgeCode = "if(class_exists('LiteSpeed\\\\Purge')) { LiteSpeed\\\\Purge::purge_all(); }";
    await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Purge FinalBanner', code: purgeCode, active: true, scope: 'global' })
    });
    await fetch(WP_URL + '/products-demands/');
    console.log('Done!');
  } catch(e) {
    console.error(e.message);
  }
}
run();
