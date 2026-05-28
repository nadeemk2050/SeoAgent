const fs = require('fs');
const sites = JSON.parse(fs.readFileSync('sites.json'));
const site = sites.find(s => s.url.includes('alshaabalwaseem.com'));
const auth = Buffer.from(site.user + ':' + site.pass).toString('base64');

fetch(site.url + 'wp-json/code-snippets/v1/snippets', {
  method: 'POST',
  headers: {
    'Authorization': 'Basic ' + auth,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Google Site Verification',
    code: "add_action('wp_head', function() { echo '<meta name=\"google-site-verification\" content=\"Qt2_jxWJ2phOZGJItLU7FWbKh-fceYayKEUbz4HjAds\" />\\n'; });",
    active: true,
    scope: 'front-end'
  })
}).then(r => r.json()).then(console.log).catch(console.error);
