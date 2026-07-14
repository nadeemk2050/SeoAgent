require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

const code = [
  "add_shortcode('seo_banner', function() {",
  "  $h  = '<div style=\"max-width:1100px;margin:0 auto 30px;padding:20px;background:#f9fffb;border-radius:12px;border:1px solid #d4edda;\">';",
  "  $h .= '<h2 style=\"font-size:1.5rem;font-weight:700;color:#1a1a1a;margin-bottom:15px;\">Why Buy Scrap Products for Sale UAE?</h2>';",
  "  $h .= '<p style=\"color:#444;font-size:1.05rem;line-height:1.8;margin-bottom:15px;\">Welcome to our marketplace for premium <strong>scrap products for sale UAE</strong>. At Al Saham Al Ahmar, we connect buyers and sellers across the global scrap trading industry.</p>';",
  "  $h .= '<figure style=\"margin:15px 0;text-align:center;\"><img src=\"https://alshaabalwaseem.com/wp-content/uploads/2026/05/logo.png\" alt=\"scrap products for sale UAE - premium scrap materials\" style=\"max-width:100%;height:auto;border-radius:8px;\" /><figcaption style=\"color:#888;font-size:0.85rem;margin-top:8px;\">Premium scrap products for sale UAE.</figcaption></figure>';",
  "  $h .= '<p style=\"margin-top:15px;\"><a href=\"/manage-products/\" style=\"display:inline-block;background:#0d954d;color:#fff;padding:10px 25px;border-radius:6px;text-decoration:none;font-weight:600;\">+ Add New Product</a></p>';",
  "  $h .= '</div>';",
  "  return $h;",
  "});",
  "add_shortcode('recent_products', function() {",
  "  $pst = get_posts(array('post_type'=>'post','posts_per_page'=>10,'post_status'=>'publish'));",
  "  if (empty($pst)) return '<p style=\"color:#888;\">No products listed yet.</p>';",
  "  $h = '<div style=\"display:flex;flex-direction:column;gap:12px;\">';",
  "  foreach ($pst as $p) {",
  "    $h .= '<div style=\"background:#fff;padding:18px 22px;border-radius:8px;box-shadow:0 1px 5px rgba(0,0,0,0.06);\">';",
  "    $h .= '<h3 style=\"margin:0 0 5px;font-size:1.1rem;\"><a href=\"'.get_permalink($p->ID).'\" style=\"color:#0d954d;text-decoration:none;\">'.esc_html($p->post_title).'</a></h3>';",
  "    $h .= '<p style=\"color:#777;font-size:0.9rem;margin:0;\">'.get_the_date('M j, Y', $p->ID).'</p>';",
  "    $h .= '</div>';",
  "  }",
  "  $h .= '</div>';",
  "  return $h;",
  "});"
].join('\n');

async function run() {
  try {
    const r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
      headers: { 'Authorization': 'Basic ' + auth }
    });
    const snippets = await r.json();
    const list = Array.isArray(snippets) ? snippets : (snippets?.data || []);
    for (const s of list) {
      if (s.name && (s.name.includes('Banner') || s.name.includes('banner') || s.name.includes('Shortcode')) && s.active) {
        await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/' + s.id, {
          method: 'PUT',
          headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
          body: JSON.stringify({ active: false })
        });
        console.log('Deactivated:', s.name);
      }
    }

    const r2 = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'SEO + Recent Products', code, active: true, scope: 'global' })
    });
    const d2 = await r2.json();
    console.log('Shortcodes created!', d2.id ? 'ID: '+d2.id : 'FAILED');

    await fetch(WP_URL + '/wp-json/wp/v2/settings', {
      method: 'PUT',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ page_for_posts: 0 })
    });
    console.log('page_for_posts unset');

    const pageContent = [
      '[seo_banner]',
      '',
      '<h2 style="font-size:1.5rem;font-weight:700;color:#1a1a1a;">Recent Product Listings</h2>',
      '<p style="color:#444;">Below are our latest product posts.</p>',
      '[recent_products]',
      '',
      '<h2 style="font-size:1.5rem;font-weight:700;color:#1a1a1a;">How to Purchase</h2>',
      '<p style="color:#444;">Browse listings above and contact us for pricing.</p>',
      '<div style="background:#f0faf4;padding:25px;border-radius:8px;text-align:center;border:1px solid #d4edda;">',
      '<p style="font-size:1.1rem;font-weight:600;color:#1a1a1a;">Ready to buy or sell?</p>',
      '<p style="color:#444;">Call: <strong>+971 55 477 9240</strong> | WhatsApp: <strong>+971 55 477 9331</strong></p>',
      '</div>'
    ].join('\n');

    await fetch(WP_URL + '/wp-json/wp/v2/pages/357', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: pageContent,
        meta: {
          rank_math_title: 'Top 5 Scrap Products for Sale UAE | Al Saham Al Ahmar',
          rank_math_description: 'Browse premium scrap products for sale UAE including HDPE, PVC, PC, aluminium, and copper scrap. Best prices, instant quotes, and global export available.',
          rank_math_focus_keyword: 'scrap products for sale UAE'
        }
      })
    });
    console.log('Page updated!');

    const purgeCode = "if(class_exists('LiteSpeed\\\\Purge')) { LiteSpeed\\\\Purge::purge_all(); }";
    await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Purge Final', code: purgeCode, active: true, scope: 'global' })
    });
    await fetch(WP_URL + '/products-demands/');
    console.log('\nAll done!');
  } catch(e) {
    console.error('Error:', e.message);
  }
}
run();
