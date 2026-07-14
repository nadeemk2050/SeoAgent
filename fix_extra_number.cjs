require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

const EXTRA = '971527455831';
const EXTRA_DISPLAY = '+971 52 745 5831';

async function main() {
  // Fetch contact page
  const r = await fetch(WP_URL + '/wp-json/wp/v2/pages/203', {
    headers: { 'Authorization': 'Basic ' + auth }
  });
  const page = await r.json();
  let c = page.content?.rendered || '';
  
  // Add extra number after the first phone number
  const phoneBlock = '<a href="tel:971554779240" style="display: block; font-size: 1.3rem; font-weight: 800; color: #0d954d; text-decoration: none; margin-bottom: 5px;">+971 55 477 9240</a>';
  const extraBlock = '<a href="tel:' + EXTRA + '" style="display: block; font-size: 1.3rem; font-weight: 800; color: #0d954d; text-decoration: none; margin-bottom: 5px;">' + EXTRA_DISPLAY + '</a>';
  
  if (c.includes(phoneBlock) && !c.includes(EXTRA)) {
    c = c.replace(phoneBlock, phoneBlock + '\n        ' + extraBlock);
    await fetch(WP_URL + '/wp-json/wp/v2/pages/203', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: c })
    });
    console.log('✅ Extra number added to Contact Us page!');
  } else if (c.includes(EXTRA)) {
    console.log('✅ Extra number already present on Contact Us page');
  } else {
    console.log('⚠️ Could not find phone block');
    // Try to find what the content looks like around "Call Us"
    const idx = c.indexOf('Call Us');
    if (idx > -1) console.log('Around Call Us:', c.substring(idx, idx + 300));
  }

  // Verify no old numbers remain site-wide
  console.log('');
  console.log('📋 Verifying no old numbers remain...');
  const r2 = await fetch(WP_URL + '/wp-json/wp/v2/pages?per_page=100', {
    headers: { 'Authorization': 'Basic ' + auth }
  });
  const pages = await r2.json();
  let oldCount = 0;
  for (const p of pages) {
    const content = p.content?.rendered || '';
    if (content.includes('971529244592') || content.includes('00971554779240') || content.includes('tel:00971')) {
      console.log('  ⚠️ Old number still on page:', p.id, p.slug);
      oldCount++;
    }
  }
  if (oldCount === 0) console.log('  ✅ No old numbers remain anywhere!');
  else console.log('  ⚠️', oldCount, 'pages still have old numbers');
}

main().catch(e => console.error('Error:', e.message));
