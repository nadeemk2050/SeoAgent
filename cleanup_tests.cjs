const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const WP_URL = process.env.WP_URL;
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;

const pageIds = [48, 49, 50, 52, 53, 55];

async function cleanup() {
    const auth = Buffer.from(`${WP_USER}:${WP_APP_PASS}`).toString('base64');
    
    for (const id of pageIds) {
        console.log(`Deleting Page/Post ID: ${id}...`);
        try {
            // Try posts and pages
            const res = await fetch(`${WP_URL}/wp-json/wp/v2/pages/${id}?force=true`, {
                method: 'DELETE',
                headers: { 'Authorization': `Basic ${auth}` }
            });
            if (res.ok) {
                console.log(`ID ${id} deleted (Page).`);
            } else {
                const res2 = await fetch(`${WP_URL}/wp-json/wp/v2/posts/${id}?force=true`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Basic ${auth}` }
                });
                if (res2.ok) {
                    console.log(`ID ${id} deleted (Post).`);
                } else {
                    console.log(`ID ${id} could not be deleted or doesn't exist.`);
                }
            }
        } catch (e) {
            console.error(`Error deleting ${id}:`, e.message);
        }
    }
}

cleanup();
