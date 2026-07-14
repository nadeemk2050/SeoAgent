require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

async function main() {
  const r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/85', {
    headers: { 'Authorization': 'Basic ' + auth }
  });
  const d = await r.json();
  let code = d.code;
  
  const cssFix = "\n    @media (max-width: 600px) {\n" +
    "        .pm-card { flex-wrap: wrap !important; padding: 8px !important; gap: 6px !important; }\n" +
    "        .pm-card-imgs { width: 100% !important; }\n" +
    "        .pm-card-imgs img { width: 55px !important; height: 55px !important; }\n" +
    "        .pm-card-text { width: 100% !important; display: flex !important; flex-direction: row !important; align-items: center !important; gap: 6px !important; }\n" +
    "        .pm-card-text .title { font-size: 0.8rem !important; flex: 1 !important; }\n" +
    "        .pm-card-text .desc { display: none !important; }\n" +
    "        .pm-card-text .date { font-size: 0.65rem !important; flex-shrink: 0 !important; }\n" +
    "        .pm-card-actions { position: absolute !important; top: 3px !important; right: 3px !important; }\n" +
    "        .pm-wrap { position: relative !important; }\n" +
    "    }";
  
  if (code.includes('</style>')) {
    code = code.replace('</style>', cssFix + '\n    </style>');
    const r2 = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/85', {
      method: 'PUT', headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    const u = await r2.json();
    console.log('Updated! Active:', u.active);
  } else {
    console.log('No style tag found');
  }
}
main().catch(e => console.error(e.message));
