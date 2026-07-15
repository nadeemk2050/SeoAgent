require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

const code = "defined('FB_PAGE_ID') or define('FB_PAGE_ID','1273833299139182');defined('FB_PAGE_TOKEN') or define('FB_PAGE_TOKEN','EAAV6XuCbNa0BRzINGqkqGpYn2RAu0LRRIWC0oXwVGgHZBMg71JVi9ILErFVx87H9d2CJf2eeaDsvBrhDHYsMOfmxF96wMd4BW8cqT4p2uvxeutmyoDkWopAO7v7xLClEJZCWXSZCdL4WNOxZCjDMkZCx5jDNs7qypzrl4Do1xzE3xyUs6iGYMLn36OlIkPfrDck4QUyieu0xDVo8YAFY6HfGjeJwvfXIaUpxxCQD8JFy3YQB3pY4za6grLEGZB');";

async function main() {
  const r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'FB_Token_Const', code, active: true, scope: 'global' })
  });
  const d = await r.json();
  console.log(d.id, 'Active:', d.active, 'Error:', d.code_error || 'none');
}
main().catch(e => console.error(e.message));
