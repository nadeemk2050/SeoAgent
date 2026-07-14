require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

async function main() {
  const r = await fetch(WP_URL + '/wp-json/wp/v2/pages?per_page=100', {
    headers: { 'Authorization': 'Basic ' + auth }
  });
  const pages = await r.json();
  
  console.log('Total pages:', pages.length, '\n');

  for (const p of pages) {
    const content = p.content?.rendered || '';
    const title = p.title?.rendered || p.slug;
    const hasOldWA = content.includes('971529244592') || content.includes('wa.me/971529244592');
    const hasOldPhone = content.includes('00971554779240') || content.includes('tel:00971554779240');
    
    if (hasOldWA || hasOldPhone) {
      console.log('Page ' + p.id + ' | ' + p.slug + ' | "' + title + '"');
      if (hasOldWA) console.log('  -> Has OLD WhatsApp: 971529244592');
      if (hasOldPhone) console.log('  -> Has OLD Phone: 00971554779240');
      console.log('');
    }
  }

  console.log('--- All unique phone patterns in content ---');
  const patterns = new Set();
  for (const p of pages) {
    const c = p.content?.rendered || '';
    (c.match(/\+971[\d\s-]{8,15}/g) || []).forEach(m => patterns.add(m.trim()));
    (c.match(/00\d[\d\s-]{8,15}/g) || []).forEach(m => patterns.add(m.trim()));
    (c.match(/tel:[\d]+/g) || []).forEach(m => patterns.add(m));
    (c.match(/wa\.me\/[\d]+/g) || []).forEach(m => patterns.add(m));
  }
  patterns.forEach(p => console.log('  ', p));
}

main().catch(e => console.error('Error:', e.message));
