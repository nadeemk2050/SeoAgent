require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

// Update Manage Products page with Beautify button + post styling + Read More
// Preserve existing mobile CSS + add new features
const pageContent = '<style>' +
  '/* Mobile responsive */' +
  '@media(max-width:600px){' +
  '[style*="padding:10px 15px;border-radius:8px"]{overflow-x:auto!important;-webkit-overflow-scrolling:touch!important;padding:8px!important;position:relative!important}' +
  '[style*="padding:10px 15px;border-radius:8px"]>[style*="flex:1;min-width:0"]{flex:0 0 auto!important;width:100%!important;padding:4px 0 0!important;margin:0!important}' +
  '[style*="padding:10px 15px;border-radius:8px"]>[style*="flex:1;min-width:0"]>:first-child{font-weight:600!important;font-size:0.85rem!important;color:#333!important}' +
  '[style*="padding:10px 15px;border-radius:8px"]>[style*="flex:1;min-width:0"]>:nth-child(2){font-size:0.7rem!important;color:#888!important}' +
  '[style*="padding:10px 15px;border-radius:8px"]>[style*="flex:1;min-width:0"]>:last-child{font-size:0.65rem!important;color:#bbb!important}' +
  '[style*="padding:10px 15px;border-radius:8px"]>[style*="display:flex;gap:4px;flex-shrink:0"]{position:absolute!important;top:5px!important;right:5px!important}' +
  '[style*="padding:10px 15px;border-radius:8px"]>img{flex-shrink:0!important}' +
  '}' +
  '/* Beautify button */' +
  '.btn-beautify{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border:none;padding:8px 18px;border-radius:6px;cursor:pointer;font-weight:600;font-size:0.85rem;margin-bottom:8px}' +
  '.btn-beautify:hover{opacity:0.9}' +
  '/* Single post page styling */' +
  '.single-post .entry-content{max-width:800px;margin:0 auto;padding:20px;font-family:"Inter","Segoe UI",sans-serif;line-height:1.8;color:#333}' +
  '.single-post .entry-content h2{font-size:1.3rem;font-weight:700;color:#1a1a1a;margin-top:30px;margin-bottom:10px;padding-bottom:5px;border-bottom:2px solid #0d954d}' +
  '.single-post .entry-content h3{font-size:1.1rem;font-weight:700;color:#333;margin-top:20px;margin-bottom:8px}' +
  '.single-post .entry-content p{font-size:1rem;color:#444;margin-bottom:12px}' +
  '.single-post .entry-content strong{color:#1a1a1a}' +
  '.single-post .entry-content img{border-radius:8px;margin:15px 0;max-width:100%;height:auto}' +
  '.single-post .entry-content ul,.single-post .entry-content ol{padding-left:20px;margin-bottom:15px}' +
  '.single-post .entry-content li{margin-bottom:5px;color:#444}' +
  '.single-post .entry-header{text-align:center;padding:30px 20px 10px}' +
  '.single-post .entry-header h1{font-size:2rem;font-weight:800;color:#1a1a1a}' +
  '.single-post .entry-header .meta{color:#999;font-size:0.85rem}' +
  '@media(max-width:600px){.single-post .entry-content{padding:12px}.single-post .entry-content h1{font-size:1.4rem}.single-post .entry-content h2{font-size:1.1rem}.single-post .entry-header h1{font-size:1.5rem}}' +
  '</style>' +
  '<script>' +
  '// Add Beautify button above textarea' +
  'document.addEventListener("DOMContentLoaded",function(){' +
  'var ta=document.querySelector("textarea[name=desc]");' +
  'if(!ta)return;' +
  'var btn=document.createElement("button");' +
  'btn.type="button";' +
  'btn.className="btn-beautify";' +
  'btn.innerHTML="✨ Beautify";' +
  'btn.onclick=function(){' +
  'var txt=ta.value;' +
  'if(!txt.trim()){alert("Paste some text first!");return}' +
  'var lines=txt.split("\\n");' +
  'var result=[];' +
  'for(var i=0;i<lines.length;i++){' +
  'var line=lines[i].trim();' +
  'if(!line){result.push("");continue}' +
  'if(/^\\d+[.)]\\s/.test(line)){' +
  'var idx=line.search(/\\d+[.)]\\s/);' +
  'var content=line.substring(line.indexOf(" ")+1);' +
  'result.push("<h3>"+content+"</h3>");' +
  'continue}' +
  'if(/^[A-Z][A-Z\\s]+:/.test(line)&&line.length<50){' +
  'result.push("<h3>"+line+"</h3>");' +
  'continue}' +
  'line=line.replace(/^([A-Za-z\\s]+:)/,"<strong>$1</strong>");' +
  'result.push("<p>"+line+"</p>");' +
  '}' +
  'ta.value=result.join("\\n");' +
  '};' +
  'ta.parentNode.insertBefore(btn,ta);' +
  '});' +
  '</script>[product_admin]';

async function main() {
  // Update the manage products page
  const r = await fetch(WP_URL + '/wp-json/wp/v2/pages/363', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: pageContent })
  });
  const d = await r.json();
  console.log('Page updated! ID:', d.id);
  
  // Add post page styling via sidebar snippet (ID 85)
  const r2 = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/85', {
    headers: { 'Authorization': 'Basic ' + auth }
  });
  const s = await r2.json();
  let sidebarCode = s.code || '';

  // Add beautify JS (runs on manage-products page only)
  const beautifyJS = `
  if (window.location.pathname.includes('manage-products')) {
    setTimeout(function() {
      var ta = document.querySelector('textarea[name=desc]');
      if (!ta) return;
      var container = ta.closest('div, p, td') || ta.parentNode;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.style.cssText = 'background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border:none;padding:8px 18px;border-radius:6px;cursor:pointer;font-weight:600;font-size:0.85rem;margin-bottom:8px';
      btn.textContent = '\\u2728 Beautify';
      btn.onclick = function() {
        var txt = ta.value;
        if (!txt.trim()) { alert('Paste some text first!'); return; }
        var lines = txt.split('\\n');
        var result = [];
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i].trim();
          if (!line) { result.push(''); continue; }
          if (/^\\d+[.)]\\s/.test(line)) {
            var content = line.substring(line.indexOf(' ') + 1);
            result.push('<h3>' + content + '</h3>');
            continue;
          }
          if (/^[A-Z][A-Z\\s]+:/.test(line) && line.length < 50) {
            result.push('<h3>' + line + '</h3>');
            continue;
          }
          line = line.replace(/^([A-Za-z\\s]+:)/, '<strong>$1</strong>');
          result.push('<p>' + line + '</p>');
        }
        ta.value = result.join('\\n');
      };
      container.insertBefore(btn, ta);
    }, 500);
  }
  `;
  
  // Escape backticks for PHP single-quoted echo
  const beautifyJSEscaped = beautifyJS.replace(/\`/g, '\\`');
  
  // Check if we already added it
  if (!sidebarCode.includes('Beautify')) {
    // Insert before the closing of wp_footer action
    sidebarCode = sidebarCode.replace(
      "add_action('wp_footer', function() {",
      "add_action('wp_footer', function() {\n    echo '<script>" + beautifyJS + "</script>';"
    );
    await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/85', {
      method: 'PUT',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: sidebarCode })
    });
    console.log('Sidebar updated with beautify JS!');
  }
  
  // Warm caches
  await fetch(WP_URL + '/manage-products/');
  await fetch(WP_URL + '/hdpe100-regrind-premium-quality-available-for-export/');
  console.log('Done!');
}
main().catch(e => console.error(e.message));
