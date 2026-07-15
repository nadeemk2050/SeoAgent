require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const fs = require('fs');
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

// Build the complete code as a PHP string in Node.js
// Using arrays to avoid template literal issues
const lines = [];
lines.push('// === DISPLAY INQUIRY META ON SINGLE POST ===');
lines.push("add_filter('the_content', function($content) {");
lines.push("    if (!is_single() || !in_the_loop()) return $content;");
lines.push("    $pid = get_the_ID();");
lines.push("    $p_type = get_post_meta($pid, '_product_type', true);");
lines.push("    $p_qty = get_post_meta($pid, '_product_qty', true);");
lines.push("    $p_country = get_post_meta($pid, '_product_country', true);");
lines.push("    $p_port = get_post_meta($pid, '_product_port', true);");
lines.push("    $p_terms = get_post_meta($pid, '_product_terms', true);");
lines.push("    if (!$p_type && !$p_qty && !$p_country && !$p_port && !$p_terms) return $content;");
lines.push("    ");
lines.push("    $html = '<div style=\"background:#f8fff8;border:1px solid #d4edda;border-radius:8px;padding:15px 20px;margin-bottom:15px;\">';");
lines.push("    if ($p_type) $html .= '<div>' . ($p_type === 'buy' ? 'Looking to Buy' : 'Available for Sell') . '</div>';");
lines.push("    if ($p_qty) $html .= '<div>Quantity: ' . esc_html($p_qty) . '</div>';");
lines.push("    if ($p_country) $html .= '<div>Destination: ' . esc_html($p_country) . '</div>';");
lines.push("    if ($p_port) $html .= '<div>Port: ' . esc_html($p_port) . '</div>';");
lines.push("    if ($p_terms) $html .= '<div>Terms: ' . esc_html($p_terms) . '</div>';");
lines.push("    $html .= '</div>';");
lines.push("    return $html . $content;");
lines.push("}, 5);");

const code = lines.join('\n');

async function main() {
  const r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'FullMeta', code, active: true, scope: 'global' })
  });
  const d = await r.json();
  console.log('Meta - ID:', d.id, 'Active:', d.active, 'Error:', JSON.stringify(d.code_error));
}
main().catch(e => console.error(e.message));
