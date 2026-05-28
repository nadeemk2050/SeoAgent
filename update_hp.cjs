const fs = require('fs');
const sites = JSON.parse(fs.readFileSync('sites.json'));
const site = sites.find(s => s.url.includes('alshaabalwaseem.com'));
const auth = Buffer.from(site.user + ':' + site.pass).toString('base64');
const hpData = JSON.parse(fs.readFileSync('hp.json'));

fetch(site.url + 'wp-json/wp/v2/pages/7', {
  method: 'POST',
  headers: {
    'Authorization': 'Basic ' + auth,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    content: '<!-- wp:html -->\n<meta name="google-site-verification" content="Qt2_jxWJ2phOZGJItLU7FWbKh-fceYayKEUbz4HjAds" />\n<!-- /wp:html -->\n' + hpData.content.raw
  })
}).then(r => r.json()).then(d => {
  fs.writeFileSync('hp_check.json', JSON.stringify(d));
  console.log('Updated homepage content, checking if meta tag survived:', d.content.raw.includes('google-site-verification'));
}).catch(console.error);
