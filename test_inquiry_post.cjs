require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

async function main() {
  const pid = await fetch(WP_URL + '/wp-json/wp/v2/posts', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Test Product with Inquiry Fields',
      content: '<p>This is a test product to verify the new inquiry fields work correctly. High quality material available for export.</p>',
      status: 'publish',
      meta: {
        _product_type: 'sell',
        _product_qty: '1000 MT',
        _product_country: 'UAE / Dubai',
        _product_port: 'Jebel Ali Port',
        _product_terms: 'LC at sight, FOB Dubai'
      }
    })
  }).then(r => r.json()).then(p => {
    console.log('Created post:', p.id, p.title?.rendered);
    // Set custom meta via post_meta endpoint
    return p.id;
  });
  
  // Set meta directly
  await fetch(WP_URL + '/wp-json/wp/v2/posts/' + pid, {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      meta: {
        _product_type: 'sell',
        _product_qty: '1000 MT',
        _product_country: 'UAE / Dubai',
        _product_port: 'Jebel Ali Port',
        _product_terms: 'LC at sight, FOB Dubai'
      }
    })
  });
  console.log('Meta set');
  console.log('View at:', WP_URL + '/?p=' + pid);
}
main().catch(e => console.error(e.message));
