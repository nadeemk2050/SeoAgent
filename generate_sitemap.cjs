const fs = require('fs');
const sites = JSON.parse(fs.readFileSync('sites.json'));
const site = sites.find(s => s.url.includes('alshaabalwaseem.com'));
const auth = Buffer.from(site.user + ':' + site.pass).toString('base64');

const phpCode = `
$sitemap = '<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://alshaabalwaseem.com/</loc></url>
  <url><loc>https://alshaabalwaseem.com/about-al-saham-al-ahmar/</loc></url>
  <url><loc>https://alshaabalwaseem.com/contact-us/</loc></url>
  <url><loc>https://alshaabalwaseem.com/aluminium-acsr-scrap/</loc></url>
  <url><loc>https://alshaabalwaseem.com/plastic-scrap-recycling-trading/</loc></url>
  <url><loc>https://alshaabalwaseem.com/hdpe100-regrind-scrap-trading/</loc></url>
  <url><loc>https://alshaabalwaseem.com/services/al-saham-plastic-scrap-trading-uae/</loc></url>
  <url><loc>https://alshaabalwaseem.com/services/al-saham-plastic-recycling-uae/</loc></url>
</urlset>';
file_put_contents(ABSPATH . 'sitemap.xml', $sitemap);
`;

fetch(site.url + 'wp-json/code-snippets/v1/snippets', {
  method: 'POST',
  headers: {
    'Authorization': 'Basic ' + auth,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Generate Static Sitemap',
    code: phpCode,
    active: true,
    scope: 'global'
  })
}).then(r => r.json()).then(d => {
  console.log(d);
  return fetch('https://alshaabalwaseem.com/sitemap.xml');
}).then(r2 => {
  console.log('Static Sitemap status:', r2.status);
}).catch(console.error);
