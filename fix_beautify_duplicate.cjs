require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

async function main() {
  const r = await fetch(WP_URL + '/wp-json/wp/v2/pages/363', {
    headers: { 'Authorization': 'Basic ' + auth }
  });
  const page = await r.json();
  let content = page.content?.rendered || '';
  
  // Remove the <script>...</script> block from the page content
  // Keep only the <style>...</style> blocks
  const scriptStart = content.indexOf('<script>');
  const scriptEnd = content.indexOf('</script>');
  
  if (scriptStart !== -1 && scriptEnd !== -1) {
    const before = content.substring(0, scriptStart);
    const after = content.substring(scriptEnd + '</script>'.length);
    content = before + after;
    console.log('Removed script tag from page content');
  } else {
    console.log('No script tag found in page content');
  }
  
  // Also update the page to fix
  await fetch(WP_URL + '/wp-json/wp/v2/pages/363', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: content })
  });
  console.log('Page 363 updated - script removed');
  
  // Now also need to clean up the snippet beautify code
  // The snippet already has the cleaner version so it should be fine
  // But let me verify it's still active
  const r2 = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/85', {
    headers: { 'Authorization': 'Basic ' + auth }
  });
  const s = await r2.json();
  console.log('Snippet 85 active:', s.active, '| code length:', s.code?.length);
  
  // If not active, reactivate
  if (!s.active) {
    await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/85', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: true })
    });
    console.log('Snippet 85 reactivated');
  }
  
  // Warm cache
  await fetch(WP_URL + '/manage-products/');
  console.log('Done!');
}
main().catch(e => console.error(e.message));
