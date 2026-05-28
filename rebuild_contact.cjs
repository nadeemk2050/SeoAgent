const fs = require('fs');
const sites = JSON.parse(fs.readFileSync('sites.json'));
const site = sites.find(s => s.url.includes('alshaabalwaseem.com'));
const auth = Buffer.from(site.user + ':' + site.pass).toString('base64');

async function run() {
  const pageHtml = `
<div style="width: 100%; max-width: 1200px; margin: 0 auto; padding: 40px 20px; font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  
  <h1 style="font-size: 3rem; font-weight: 800; color: #333333; margin-bottom: 50px;">Get in Touch</h1>

  <div style="display: flex; flex-wrap: wrap; gap: 60px; justify-content: space-between;">
    
    <!-- LEFT COLUMN: Contact Form Card -->
    <div style="flex: 1 1 500px; background: #ffffff; padding: 50px; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.05);">
      <h2 style="font-size: 2rem; font-weight: 700; color: #333333; margin-top: 0; margin-bottom: 20px;">Let's Talk !</h2>
      <p style="color: #666666; font-size: 0.95rem; line-height: 1.6; margin-bottom: 40px;">
        If you would like more information on recycled products, inquiries, or would like to explore partnership opportunities or schedule a consultation, please fill in the required details.
      </p>
      
      <form action="#" method="POST" style="display: flex; flex-direction: column; gap: 25px;">
        <div style="display: flex; flex-wrap: wrap; gap: 25px;">
          <div style="flex: 1 1 200px;">
            <label style="display: block; font-size: 0.85rem; color: #666; margin-bottom: 8px;">Name <span style="color: red;">*</span></label>
            <input type="text" style="width: 100%; padding: 15px; border: none; background: #f9f9f9; border-radius: 6px; color: #333;" required />
          </div>
          <div style="flex: 1 1 200px;">
            <label style="display: block; font-size: 0.85rem; color: #666; margin-bottom: 8px;">Country</label>
            <input type="text" style="width: 100%; padding: 15px; border: none; background: #f9f9f9; border-radius: 6px; color: #333;" />
          </div>
        </div>
        
        <div style="display: flex; flex-wrap: wrap; gap: 25px;">
          <div style="flex: 1 1 200px;">
            <label style="display: block; font-size: 0.85rem; color: #666; margin-bottom: 8px;">Email Address <span style="color: red;">*</span></label>
            <input type="email" style="width: 100%; padding: 15px; border: none; background: #f9f9f9; border-radius: 6px; color: #333;" required />
          </div>
          <div style="flex: 1 1 200px;">
            <label style="display: block; font-size: 0.85rem; color: #666; margin-bottom: 8px;">Phone/Whatsapp</label>
            <input type="text" style="width: 100%; padding: 15px; border: none; background: #f9f9f9; border-radius: 6px; color: #333;" />
          </div>
        </div>
        
        <div>
          <label style="display: block; font-size: 0.85rem; color: #666; margin-bottom: 8px;">Message <span style="color: red;">*</span></label>
          <textarea rows="5" style="width: 100%; padding: 15px; border: none; background: #f9f9f9; border-radius: 6px; color: #333;" required></textarea>
        </div>
        
        <button type="submit" style="background: #0d954d; color: #ffffff; font-weight: bold; padding: 15px 30px; border: none; border-radius: 6px; cursor: pointer; align-self: flex-start; font-size: 1rem;">Submit</button>
      </form>
    </div>

    <!-- RIGHT COLUMN: Contact Info -->
    <div style="flex: 1 1 400px; display: flex; flex-direction: column; gap: 40px; padding-top: 20px;">
      
      <div>
        <h2 style="font-size: 2rem; font-weight: 700; color: #333333; margin-top: 0; margin-bottom: 15px;">Our Contact</h2>
        <p style="color: #666666; font-size: 0.95rem; line-height: 1.6; margin: 0;">
          Feel free to send us your needs. We will contact you as soon as possible to provide a comprehensive solution! You can also visit us in person according to the address.
        </p>
      </div>
      
      <div>
        <h3 style="font-size: 1.25rem; font-weight: 700; color: #333333; margin-bottom: 10px;">E-mail:</h3>
        <a href="mailto:nadeemalsaham@gmail.com" style="font-size: 1.3rem; font-weight: 800; color: #0d954d; text-decoration: none;">nadeemalsaham@gmail.com</a>
      </div>
      
      <div>
        <h3 style="font-size: 1.25rem; font-weight: 700; color: #333333; margin-bottom: 10px;">Call Us & WhatsApp:</h3>
        <a href="tel:00971554779240" style="display: block; font-size: 1.3rem; font-weight: 800; color: #0d954d; text-decoration: none; margin-bottom: 5px;">00971 55 477 9240</a>
        <a href="https://wa.me/971529244592" style="display: block; font-size: 1.3rem; font-weight: 800; color: #0d954d; text-decoration: none;">+971 52 924 4592</a>
      </div>
      
      <div>
        <h3 style="font-size: 1.25rem; font-weight: 700; color: #333333; margin-bottom: 10px;">Office Address:</h3>
        <p style="font-size: 1.3rem; font-weight: 800; color: #0d954d; margin: 0;">Industrial Area 11, Sharjah, UAE</p>
      </div>

    </div>
  </div>
</div>
`;

  const cssCode = `add_action('wp_head', function() {
    echo '<style>
    /* CONTACT US PAGE REBUILD CSS (Page ID 203) */
    body.page-id-203, 
    body.page-id-203 .site-content,
    body.page-id-203 .ast-container,
    body.page-id-203 .wp-block-group {
        background: linear-gradient(135deg, #ffffff 0%, #ebf7f4 100%) !important;
        background-color: transparent !important;
    }
    
    body.page-id-203 input:focus, body.page-id-203 textarea:focus {
        outline: 2px solid #0d954d !important;
        background: #ffffff !important;
    }
    
    body.page-id-203 button:hover {
        background: #0a733b !important;
        transform: translateY(-2px);
        transition: all 0.3s ease;
    }
    </style>';
  }, 99999);`;

  try {
    // 1. Update Page Content
    console.log('Publishing new layout to Page 203...');
    const rUpdate = await fetch(site.url + 'wp-json/wp/v2/pages/203', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + auth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: pageHtml
      })
    });
    console.log('Page published status:', rUpdate.status);

    // 2. Add New CSS Snippet
    const rSnippet = await fetch(site.url + 'wp-json/code-snippets/v1/snippets', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + auth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Contact Us Dongsheng Layout CSS',
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
      body: JSON.stringify({ name: 'Purge Cache 11', code: purgeCode, active: true, scope: 'global' })
    });
    console.log('Cache Purged!');
  } catch(e) {
    console.error(e.message);
  }
}
run();
