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
    name: 'Flush Permalinks',
    code: "add_action('init', function() { flush_rewrite_rules(); });",
    active: true,
    scope: 'global'
  })
}).then(r => r.json()).then(d => {
  console.log(d);
  return fetch(site.url);
}).then(() => {
  console.log('Flushed!');
}).catch(console.error);
