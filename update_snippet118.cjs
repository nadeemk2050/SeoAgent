require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

async function main() {
  // Get current code of snippet 118
  const r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/118', {
    headers: { 'Authorization': 'Basic ' + auth }
  });
  const d = await r.json();
  let code = d.code;
  
  // 1. Add responsive style block before the public product list section
  const styleBlock = "\n    \$output .= '" +
    "<style>\n" +
    "    @media (max-width: 600px) {\n" +
    "        .pm-card { flex-wrap:wrap !important; padding:8px !important; gap:6px !important; }\n" +
    "        .pm-card-imgs { width:100% !important; }\n" +
    "        .pm-card-imgs img { width:55px !important; height:55px !important; }\n" +
    "        .pm-card-text { width:100% !important; display:flex !important; flex-direction:row !important; align-items:center !important; gap:6px !important; }\n" +
    "        .pm-card-text .title { font-size:0.8rem !important; flex:1 !important; }\n" +
    "        .pm-card-text .desc { display:none !important; }\n" +
    "        .pm-card-text .date { font-size:0.65rem !important; flex-shrink:0 !important; }\n" +
    "        .pm-card-actions { position:absolute !important; top:3px !important; right:3px !important; }\n" +
    "        .pm-wrap { position:relative !important; }\n" +
    "    }\n" +
    "    <\/style>';";
  
  // Add style block before the product list (after "Public product list" comment)
  code = code.replace(
    "// Public product list",
    "// Public product list" + styleBlock
  );
  
  // 2. Add CSS classes to the existing HTML elements
  // Replace the card div
  code = code.replace(
    'style="display:flex;align-items:center;gap:10px;background:#fff;padding:10px 15px;border-radius:8px;box-shadow:0 1px 5px rgba(0,0,0,0.05);">',
    'class="pm-card pm-wrap" style="display:flex;align-items:center;gap:10px;background:#fff;padding:10px 15px;border-radius:8px;box-shadow:0 1px 5px rgba(0,0,0,0.05);">'
  );
  
  // Replace the images div
  code = code.replace(
    'style="display:flex;gap:4px;flex-shrink:0;">',
    'class="pm-card-imgs" style="display:flex;gap:4px;flex-shrink:0;">'
  );
  
  // Replace the text div
  code = code.replace(
    'style="flex:1;min-width:0;">',
    'class="pm-card-text" style="flex:1;min-width:0;">'
  );
  
  // Replace the title div
  code = code.replace(
    'style="font-weight:600;color:#333;font-size:0.85rem;">',
    'class="title" style="font-weight:600;color:#333;font-size:0.85rem;">'
  );
  
  // Replace the desc div
  code = code.replace(
    'style="color:#888;font-size:0.7rem;margin-top:1px;">',
    'class="desc" style="color:#888;font-size:0.7rem;margin-top:1px;">'
  );
  
  // Replace the date div
  code = code.replace(
    'style="color:#bbb;font-size:0.65rem;margin-top:1px;flex-shrink:0;">',
    'class="date" style="color:#bbb;font-size:0.65rem;margin-top:1px;flex-shrink:0;">'
  );
  
  // Replace the actions div
  code = code.replace(
    'style="display:flex;gap:4px;flex-shrink:0;align-items:center;">',
    'class="pm-card-actions" style="display:flex;gap:4px;flex-shrink:0;align-items:center;">'
  );
  
  // Update the snippet
  const r2 = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/118', {
    method: 'PUT',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });
  
  if (r2.ok) {
    console.log('✅ Snippet 118 updated successfully!');
  } else {
    const txt = await r2.text();
    console.log('❌ Failed:', txt.substring(0, 200));
  }
}
main().catch(e => console.error(e.message));
