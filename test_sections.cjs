require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const fs = require('fs');
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');
const fullCode = fs.readFileSync('product_manager_code.php', 'utf8');

// Remove <?php tag as Code Snippets adds it
const code = fullCode.replace(/^<\?php\s*/i, '');

async function tryActivate(name, snippetCode) {
  const r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, code: snippetCode, active: true, scope: 'global' })
  });
  const d = await r.json();
  console.log(name, '- ID:', d.id, 'Active:', d.active, 'Error:', d.code_error || 'none');
  return d;
}

async function main() {
  // Test 1: Just the shortcode without defines
  const part1 = `
add_shortcode('product_admin', function() {
  return '<p>PART 1 WORKS</p>';
});
add_shortcode('seo_banner', function() { return ''; });
add_shortcode('recent_products', function() { return ''; });
`;
  await tryActivate('Part1', part1);
  
  // Test 2: Add the defines
  const part2 = `
defined('FB_PAGE_ID') or define('FB_PAGE_ID', '1273833299139182');
defined('FB_PAGE_TOKEN') or define('FB_PAGE_TOKEN', 'test');
` + part1;
  await tryActivate('Part2', part2);
  
  // Test 3: Check if the issue is code length - split first 5000 chars
  const first5k = code.substring(0, 5000);
  await tryActivate('First5k', first5k);
  
  // Test 4: Check for syntax error - try PHP lint via a different approach
  // Look for problematic patterns
  const lines = code.split('\n');
  const problems = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('<?') && lines[i].includes('=') && !lines[i].includes('<?php')) {
      problems.push('Line ' + (i+1) + ': ' + lines[i].substring(0, 100));
    }
  }
  console.log('Potential issues:', problems.length ? problems.join('\n') : 'none found');
}
main().catch(e => console.error(e.message));
