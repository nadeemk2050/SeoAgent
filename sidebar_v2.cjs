const fs = require('fs');
const sites = JSON.parse(fs.readFileSync('sites.json'));
const site = sites.find(s => s.url.includes('alshaabalwaseem.com'));
const auth = Buffer.from(site.user + ':' + site.pass).toString('base64');

async function run() {
  const phpCode = `add_action('wp_footer', function() {
    echo '<style>
    #global-sticky-sidebar {
        position: fixed;
        top: 50%;
        right: 0;
        transform: translateY(-50%);
        z-index: 9999999;
        display: flex;
        flex-direction: column;
        gap: 25px;
        padding-right: 15px;
    }
    #global-sticky-sidebar a {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 45px;
        height: 45px;
        background: transparent;
        border-radius: 50%;
        transition: transform 0.3s ease;
        box-shadow: none;
        text-decoration: none;
    }
    #global-sticky-sidebar a:hover {
        transform: scale(1.15) translateX(-5px);
    }
    #global-sticky-sidebar svg {
        width: 40px;
        height: 40px;
    }
    #g-icon-email svg { fill: #b8cddb; }
    #g-icon-phone svg { fill: #364147; }
    #g-icon-chat svg { fill: #bce0fd; }
    </style>';

    echo '<div id="global-sticky-sidebar">
        <a id="g-icon-email" href="mailto:nadeemalsaham@gmail.com" title="Email Us">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
        </a>
        <a id="g-icon-phone" href="tel:971554779240" title="Call Us">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
        </a>
        <a id="g-icon-chat" href="https://wa.me/971554779331" title="WhatsApp Chat" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 5.58 2 10c0 2.53 1.5 4.81 3.82 6.13.25.9-.66 2.6-1.55 3.32-.15.12-.17.34-.04.49.07.08.18.13.29.13.15 0 2.2-.13 3.65-1.15.14-.1.32-.12.48-.05 1.1.48 2.3.74 3.53.74 5.52 0 10-3.58 10-8s-4.48-8-10-8zm-4 9c-.83 0-1.5-.67-1.5-1.5S7.17 8 8 8s1.5.67 1.5 1.5S8.83 11 8 11zm4 0c-.83 0-1.5-.67-1.5-1.5S11.17 8 12 8s1.5.67 1.5 1.5S12.83 11 12 11zm4 0c-.83 0-1.5-.67-1.5-1.5S15.17 8 16 8s1.5.67 1.5 1.5S16.83 11 16 11z"/></svg>
        </a>
    </div>';

    echo '<script>
    document.addEventListener("DOMContentLoaded", function() {
        var oldSidebars = document.querySelectorAll(".custom-sticky-sidebar");
        oldSidebars.forEach(function(sb) { sb.remove(); });
    });
    </script>';
  }, 9999);`;

  try {
    // Ensure the snippet works and doesn't crash
    const rSnippet = await fetch(site.url + 'wp-json/code-snippets/v1/snippets', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + auth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Global SVG Sidebar V2',
        code: phpCode,
        active: true,
        scope: 'global'
      })
    });
    console.log('Snippet created:', await rSnippet.json());
    
    // Deactivate the broken snippet if it exists (ID 39)
    await fetch(site.url + 'wp-json/code-snippets/v1/snippets/39', {
      method: 'PUT',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: false })
    });

    // Purge Cache
    const purgeCode = "if(class_exists('LiteSpeed\\\\Purge')) { LiteSpeed\\\\Purge::purge_all(); }";
    await fetch(site.url + 'wp-json/code-snippets/v1/snippets', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Purge Cache 13', code: purgeCode, active: true, scope: 'global' })
    });
    console.log('Cache Purged!');
  } catch(e) {
    console.error(e.message);
  }
}
run();
