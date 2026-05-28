fetch('https://alshaabalwaseem.com/').then(r=>r.text()).then(html => { 
  const headerMatch = html.match(/<header[\s\S]*?<\/header>/i); 
  if(headerMatch) console.log('HEADER:', headerMatch[0].substring(0, 1500)); 
  
  const sidebarMatch = html.match(/<div class="custom-sticky-sidebar[\s\S]*?<\/div>/i); 
  if(sidebarMatch) console.log('SIDEBAR:', sidebarMatch[0]); 
});
