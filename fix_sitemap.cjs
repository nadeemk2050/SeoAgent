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
    name: 'Fix Sitemap',
    code: "$modules = get_option('rank_math_modules', array()); $modules['sitemap'] = 'on'; update_option('rank_math_modules', $modules); flush_rewrite_rules();",
    active: true,
    scope: 'global'
  })
}).then(r => r.json()).then(d => {
  console.log(d);
  return fetch('https://alshaabalwaseem.com/sitemap_index.xml');
}).then(r2 => {
  console.log('Sitemap status:', r2.status);
}).catch(console.error);
