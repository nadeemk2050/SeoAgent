require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');
const fs = require('fs');

// Read original snippet code from backup
let originalCode = fs.readFileSync('snippet85_dump.txt', 'utf8');

// The beautify JS - using double quotes inside JS to avoid PHP single-quote issues
// All JS strings use double quotes so they don't break PHP echo '...'
const beautifyJS = `
  if (window.location.pathname.includes("manage-products")) {
    setTimeout(function() {
      var ta = document.querySelector("textarea[name=desc]");
      if (!ta) return;
      var container = ta.parentNode;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.style.cssText = "background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border:none;padding:8px 18px;border-radius:6px;cursor:pointer;font-weight:600;font-size:0.85rem;margin-bottom:8px";
      btn.textContent = "\u2728 Beautify";
      btn.onclick = function() {
        var txt = ta.value;
        if (!txt.trim()) { alert("Paste some text first!"); return; }
        var lines = txt.split("\\n");
        var result = [];
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i].trim();
          if (!line) { result.push(""); continue; }
          if (/^\\d+[.)]\\s/.test(line)) {
            var content = line.substring(line.indexOf(" ") + 1);
            result.push("<h3>" + content + "</h3>");
            continue;
          }
          if (/^[A-Z][A-Z\\s]+:/.test(line) && line.length < 50) {
            result.push("<h3>" + line + "</h3>");
            continue;
          }
          line = line.replace(/^([A-Za-z\\s]+:)/, "<strong>$1</strong>");
          result.push("<p>" + line + "</p>");
        }
        ta.value = result.join("\\n");
      };
      container.insertBefore(btn, ta);
    }, 500);
  }
`;

// Insert beautify JS into the snippet code, right after add_action line
const updatedCode = originalCode.replace(
  "add_action('wp_footer', function() {",
  "add_action('wp_footer', function() {\n    echo '<script>';\n    ?>" + beautifyJS + "<?php\n    echo '</script>';"
);

async function main() {
  const r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/85', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: updatedCode,
      active: true,
      priority: 10
    })
  });
  const d = await r.json();
  console.log('Status:', r.status);
  console.log('Active:', d.active);
  console.log('Code length:', d.code?.length);
  
  if (d.active) {
    console.log('Snippet updated and active!');
  } else {
    console.log('Snippet updated but NOT active - trying to reactivate...');
    // Try one more time with active:true
    const r2 = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/85', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: true })
    });
    const d2 = await r2.json();
    console.log('Reactivate status:', r2.status, 'Active:', d2.active);
  }
}
main().catch(e => console.error(e.message));
