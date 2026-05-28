const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const WP_URL = process.env.WP_URL;
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;

async function checkMeta() {
    const auth = Buffer.from(`${WP_USER}:${WP_APP_PASS}`).toString('base64');
    // Fetch a known page (e.g., ID 2 or similar, or just get all pages and take the first one)
    const response = await fetch(`${WP_URL}/wp-json/wp/v2/pages?per_page=1`, {
        headers: { 'Authorization': `Basic ${auth}` }
    });
    const data = await response.json();
    if (data.length > 0) {
        console.log('Page ID:', data[0].id);
        console.log('Available Meta Fields:', Object.keys(data[0].meta || {}));
        console.log('Meta Data:', JSON.stringify(data[0].meta, null, 2));
    } else {
        console.log('No pages found.');
    }
}

checkMeta();
