const fs = require('fs');
const sites = JSON.parse(fs.readFileSync('sites.json'));
const site = sites.find(s => s.url.includes('alshaabalwaseem.com'));
const auth = Buffer.from(site.user + ':' + site.pass).toString('base64');

async function updatePage(id) {
    try {
        // Fetch current title
        const rGet = await fetch(site.url + 'wp-json/wp/v2/pages/' + id, {
            headers: { 'Authorization': 'Basic ' + auth }
        });
        const data = await rGet.json();
        const currentTitle = data.title.raw;
        
        // Force publish update
        const rPost = await fetch(site.url + 'wp-json/wp/v2/pages/' + id, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + auth,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: currentTitle
            })
        });
        console.log('Page ' + id + ' publish status:', rPost.status);
    } catch (e) {
        console.error('Error on page ' + id + ':', e.message);
    }
}

async function run() {
    console.log('Forcing cache flush by publishing pages...');
    await updatePage(203); // Contact Us
    await updatePage(218); // Aluminium ACSR
    await updatePage(174); // Services Plastic Recycling
    
    // Just in case, update the Homepage (ID 7)
    await updatePage(7);
    
    console.log('All targeted pages have been hard-published to the live server.');
}

run();
