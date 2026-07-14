require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

const css = '<style>' +
'@media(max-width:600px){' +
'[style*="padding:10px 15px;border-radius:8px"]{overflow-x:auto!important;-webkit-overflow-scrolling:touch!important;padding:8px!important;position:relative!important}' +
'[style*="padding:10px 15px;border-radius:8px"]>[style*="flex:1;min-width:0"]{flex:0 0 auto!important;width:100%!important;padding:4px 0 0!important;margin:0!important}' +
'[style*="padding:10px 15px;border-radius:8px"]>[style*="flex:1;min-width:0"]>:first-child{font-weight:600!important;font-size:0.85rem!important;color:#333!important}' +
'[style*="padding:10px 15px;border-radius:8px"]>[style*="flex:1;min-width:0"]>:nth-child(2){font-size:0.7rem!important;color:#888!important}' +
'[style*="padding:10px 15px;border-radius:8px"]>[style*="flex:1;min-width:0"]>:last-child{font-size:0.65rem!important;color:#bbb!important}' +
'[style*="padding:10px 15px;border-radius:8px"]>[style*="display:flex;gap:4px;flex-shrink:0"]{position:absolute!important;top:5px!important;right:5px!important}' +
'[style*="padding:10px 15px;border-radius:8px"]>img{flex-shrink:0!important}' +
'}</style>[product_admin]';

async function main() {
  const r = await fetch(WP_URL + '/wp-json/wp/v2/pages/363', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: css })
  });
  const d = await r.json();
  console.log('Updated! Page ID:', d.id);
  
  // Warm cache
  await fetch(WP_URL + '/manage-products/');
  console.log('Cache warmed!');
}
main().catch(e => console.error(e.message));
