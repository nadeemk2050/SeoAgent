const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const WP_URL = "https://alshaabalwaseem.com";
const WP_USER = "www.alshaabalwaseem.com";
const WP_APP_PASS = "9vEi u0uE 71mb sDwK Pk8J wxl2";

async function testWordPress() {
    console.log('--- WordPress API Tester ---');
    console.log(`URL: ${WP_URL}`);
    console.log(`User: ${WP_USER}`);
    
    if (!WP_URL || !WP_USER || !WP_APP_PASS) {
        console.error('Error: Missing WordPress credentials in .env');
        return;
    }

    const auth = Buffer.from(`${WP_USER}:${WP_APP_PASS}`).toString('base64');
    const endpoint = `${WP_URL}/wp-json/wp/v2/pages`; // Trying pages now

    console.log(`Endpoint: ${endpoint}`);

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: 'welcome to nadeem seo',
                content: 'Welcome to nadeem seo - testing page creation.',
                status: 'publish' 
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('SUCCESS: Page Published!');
            const pageId = data.id;
            console.log(`Page ID: ${pageId}`);
            
            console.log('\n--- Testing Rank Math Meta Update ---');
            const updateRes = await fetch(`${endpoint}/${pageId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    meta: {
                        rank_math_title: 'Rank Math Title Test',
                        rank_math_description: 'Rank Math Description Test',
                        rank_math_focus_keyword: 'nadeem seo'
                    }
                })
            });

            const updateData = await updateRes.json();
            if (updateRes.ok) {
                console.log('SUCCESS: Update Request Accepted!');
                // Check if the fields actually persisted
                if (updateData.meta && updateData.meta.rank_math_title === 'Rank Math Title Test') {
                    console.log('CONFIRMED: Rank Math fields were WRITTEN successfully!');
                } else {
                    console.warn('WARNING: Rank Math fields were IGNORED by WordPress.');
                    console.log('Current Meta in Response:', JSON.stringify(updateData.meta, null, 2));
                }
            } else {
                console.error('FAILED: Meta Update Request!');
                console.error(`Status: ${updateRes.status}`);
                console.error('Error Data:', JSON.stringify(updateData, null, 2));
            }
        } else {
            console.error('FAILED!');
            console.error(`Status: ${response.status} ${response.statusText}`);
            console.error('Error Data:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('ERROR during fetch:', error.message);
    }
}

testWordPress();
