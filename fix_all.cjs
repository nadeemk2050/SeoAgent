const fs = require('fs');
const sites = JSON.parse(fs.readFileSync('sites.json'));
const site = sites.find(s => s.url.includes('alshaabalwaseem.com'));
const auth = Buffer.from(site.user + ':' + site.pass).toString('base64');

async function fixSite() {
  try {
    // 1. Fetch all pages
    console.log('Fetching all pages...');
    const rPages = await fetch(site.url + 'wp-json/wp/v2/pages', {
      headers: { 'Authorization': 'Basic ' + auth }
    });
    const pages = await rPages.json();
    
    // The target sidebar replacements
    const oldSidebar1 = `<a href="mailto:nadeemalsaham@gmail.com" title="Email Us">✉ Email</a>`;
    const oldSidebar2 = `<a href="tel:971554779240" title="Call Us">📞 Call</a>`;
    const oldSidebar3 = `<a href="https://wa.me/971554779331" target="_blank" title="WhatsApp" rel="noopener">💬 WhatsApp</a>`;
    
    for (const p of pages) {
      let content = p.content.rendered;
      let modified = false;
      
      if (content.includes('✉ Email</a>')) {
        content = content.replace(/✉ Email<\/a>/g, '✉️</a>');
        modified = true;
      }
      if (content.includes('📞 Call</a>')) {
        content = content.replace(/📞 Call<\/a>/g, '📞</a>');
        modified = true;
      }
      if (content.includes('💬 WhatsApp</a>')) {
        content = content.replace(/💬 WhatsApp<\/a>/g, '💬</a>');
        modified = true;
      }
      
      // Remove any lingering inline styles for the menu if they were hardcoded in the content
      if (modified) {
        await fetch(site.url + 'wp-json/wp/v2/pages/' + p.id, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + auth,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ content: content })
        });
        console.log(`Updated page: ${p.id} (${p.slug})`);
      }
    }
    
    // 2. Global CSS Injection via Code Snippets
    const cssCode = `add_action('wp_footer', function() {
      echo '<style>
        /* KILL MENU BACKGROUND BOXES */
        .ast-builder-menu, .main-header-menu, .ast-nav-menu, .ast-primary-header-bar, .site-header, #masthead {
            background: transparent !important;
            background-color: transparent !important;
            background-image: none !important;
            border: none !important;
            box-shadow: none !important;
        }
        .main-header-menu *, .ast-nav-menu * {
            background: transparent !important;
            background-color: transparent !important;
            background-image: none !important;
            box-shadow: none !important;
        }
        
        /* HIDE SITE TITLE COMPLETELY */
        .site-branding, .site-title, .site-logo, .ast-site-identity {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
            width: 0 !important;
            height: 0 !important;
        }
        
        /* MOVE MENU TO TOP RIGHT */
        .ast-primary-header-bar, .site-header, #masthead {
            position: absolute !important;
            top: 10px !important;
            right: 12px !important;
            width: 100% !important;
            display: flex !important;
            justify-content: flex-end !important;
        }
        
        /* CLEAN SIDEBAR ICONS */
        .custom-sticky-sidebar a {
            background: transparent !important;
            background-color: transparent !important;
            color: #0d954d !important;
            padding: 10px !important;
            font-size: 40px !important;
            box-shadow: none !important;
            border: none !important;
        }
        .custom-sticky-sidebar a:hover {
            transform: scale(1.1) !important;
            color: #0a733b !important;
            background: transparent !important;
        }
      </style>';
    }, 9999);`;
    
    const rSnippet = await fetch(site.url + 'wp-json/code-snippets/v1/snippets', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + auth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Global CSS Fixer 2',
        code: cssCode,
        active: true,
        scope: 'global'
      })
    });
    console.log('Snippet created:', await rSnippet.json());
    
    // 3. Purge Cache
    const purgeCode = "if(class_exists('LiteSpeed\\\\Purge')) { LiteSpeed\\\\Purge::purge_all(); }";
    await fetch(site.url + 'wp-json/code-snippets/v1/snippets', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Purge Cache 3', code: purgeCode, active: true, scope: 'global' })
    });
    console.log('Cache Purged!');
    
  } catch (e) {
    console.error(e.message);
  }
}
fixSite();
