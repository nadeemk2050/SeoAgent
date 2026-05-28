const fs = require('fs');

fetch('https://alshaabalwaseem.com/').then(r=>r.text()).then(html => {
  // Find Astra dynamic css
  const styles = html.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || [];
  let found = false;
  styles.forEach(s => {
    if (s.includes('background') && (s.includes('gradient') || s.includes('menu'))) {
      const match = s.match(/([^{}]+?)\s*\{\s*[^}]*background[^}]*\}/gi);
      if (match) {
        match.forEach(m => {
          if (m.includes('gradient') || m.includes('header')) {
            console.log('Found background rule:', m.substring(0, 200));
          }
        });
      }
    }
  });
});
