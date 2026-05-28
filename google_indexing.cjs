const { google } = require('googleapis');
const key = require('./dominonad-d18c24fb4b4f.json');

const jwtClient = new google.auth.JWT({
  keyFile: 'c:/app2026/SeoAgent/dominonad-d18c24fb4b4f.json',
  scopes: ['https://www.googleapis.com/auth/indexing']
});

const oldUrls = [
  'https://alshaabalwaseem.com/aluminium-acsr-scrap-buyers-sellers/',
  'https://alshaabalwaseem.com/hdpe100-pipe-production-procedure/',
  'https://alshaabalwaseem.com/global-hdpe100-regrind-scrap-buyers/',
  'https://alshaabalwaseem.com/types-of-plastic-scrap-your-comprehensive-waste-guide/',
  'https://alshaabalwaseem.com/industrial-plastic-recycling-scrap-buyers-uae/',
  'https://alshaabalwaseem.com/contact/'
];

const newUrls = [
  'https://alshaabalwaseem.com/about-al-saham-al-ahmar/',
  'https://alshaabalwaseem.com/contact-us/',
  'https://alshaabalwaseem.com/aluminium-acsr-scrap/',
  'https://alshaabalwaseem.com/plastic-scrap-recycling-trading/',
  'https://alshaabalwaseem.com/hdpe100-regrind-scrap-trading/',
  'https://alshaabalwaseem.com/services/al-saham-plastic-scrap-trading-uae/',
  'https://alshaabalwaseem.com/services/al-saham-plastic-recycling-uae/'
];

async function run() {
  console.log("Authorizing with Google Indexing API...");
  try {
      await jwtClient.authorize();
      console.log("✅ Authorized successfully!");
  } catch (err) {
      console.error("❌ Authorization failed:", err.message);
      return;
  }

  console.log("\\n--- REQUESTING DELETIONS ---");
  for (const url of oldUrls) {
    try {
      const response = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtClient.credentials.access_token}`
        },
        body: JSON.stringify({ url: url, type: 'URL_DELETED' })
      });
      const data = await response.json();
      console.log(`Deleted: ${url} -> Status: ${response.status} | Notification: ${data?.urlNotificationMetadata?.latestUpdate?.type || JSON.stringify(data)}`);
    } catch (e) { console.error(`Error deleting ${url}:`, e.message); }
  }

  console.log("\\n--- REQUESTING INDEXING ---");
  for (const url of newUrls) {
    try {
      const response = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtClient.credentials.access_token}`
        },
        body: JSON.stringify({ url: url, type: 'URL_UPDATED' })
      });
      const data = await response.json();
      console.log(`Indexed: ${url} -> Status: ${response.status} | Notification: ${data?.urlNotificationMetadata?.latestUpdate?.type || JSON.stringify(data)}`);
    } catch (e) { console.error(`Error indexing ${url}:`, e.message); }
  }
}

run();
