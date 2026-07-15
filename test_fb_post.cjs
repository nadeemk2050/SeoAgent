require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

async function main() {
  // Create a product via REST API (snippet's FB code runs on wp_insert_post hook)
  // But actually the FB posting is in the snippet's shortcode handler, not hook
  // So let me test Facebook API directly with the page token
  const pageToken = process.env.FB_PAGE_TOKEN;
  const pageId = process.env.FB_PAGE_ID;
  
  console.log('Testing Facebook post directly...');
  const r = await fetch('https://graph.facebook.com/v22.0/' + pageId + '/feed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: '🔴 Available for Sell\n📦 Test: 500 MT HDPE100 Regrind\n🌍 Origin: UAE\n\nPremium quality HDPE100 regrind available for immediate export. 99.9% pure, hot-washed.\n\n🔗 https://alshaabalwaseem.com/hdpe100-regrind-premium-quality-available-for-export/',
      access_token: pageToken
    })
  });
  const d = await r.json();
  console.log('Facebook result:', JSON.stringify(d));
  
  if (d.id) {
    console.log('✅ Facebook post successful! ID:', d.id);
  }
}
main().catch(e => console.error(e.message));
