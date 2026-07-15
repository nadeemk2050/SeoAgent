/**
 * Product Manager with Image Upload
 * Supports: crop, compress to 100KB, camera capture, max 3 images
 */

// === FACEBOOK CREDENTIALS ===
defined('FB_PAGE_ID') or define('FB_PAGE_ID', '1273833299139182');
defined('FB_PAGE_TOKEN') or define('FB_PAGE_TOKEN', 'EAAV6XuCbNa0BRzINGqkqGpYn2RAu0LRRIWC0oXwVGgHZBMg71JVi9ILErFVx87H9d2CJf2eeaDsvBrhDHYsMOfmxF96wMd4BW8cqT4p2uvxeutmyoDkWopAO7v7xLClEJZCWXSZCdL4WNOxZCjDMkZCx5jDNs7qypzrl4Do1xzE3xyUs6iGYMLn36OlIkPfrDck4QUyieu0xDVo8YAFY6HfGjeJwvfXIaUpxxCQD8JFy3YQB3pY4za6grLEGZB');

// === FACEBOOK AUTO-POST ===
function post_to_facebook($pid) {
    $token = defined('FB_PAGE_TOKEN') ? FB_PAGE_TOKEN : '';
    $page_id = defined('FB_PAGE_ID') ? FB_PAGE_ID : '';
    if (!$token || !$page_id) return false;
    
    $title = get_the_title($pid);
    $desc = wp_trim_words(strip_tags(get_post_field('post_content', $pid)), 50, '...');
    $permalink = get_permalink($pid);
    $img = get_the_post_thumbnail_url($pid, 'full');
    if (!$img) {
        $imgs = get_post_meta($pid, '_product_images', true);
        if (!empty($imgs)) $img = wp_get_attachment_url($imgs[0]);
    }
    
    $p_type = get_post_meta($pid, '_product_type', true);
    $p_qty = get_post_meta($pid, '_product_qty', true);
    $p_country = get_post_meta($pid, '_product_country', true);
    
    $msg = $title;
    if ($p_type || $p_qty || $p_country) {
        $msg .= "\n";
        if ($p_type === 'buy') $msg .= ' Looking to Buy';
        elseif ($p_type === 'sell') $msg .= ' Available for Sell';
        if ($p_qty) $msg .= ' |  ' . $p_qty;
        if ($p_country) $msg .= ' |  ' . $p_country;
    }
    $msg .= "\n\n" . $desc . "\n\n " . $permalink;
    
    $fb_data = array('message' => $msg, 'access_token' => $token);
    if ($img) $fb_data['link'] = $permalink;
    
    $res = wp_remote_post('https://graph.facebook.com/v22.0/' . $page_id . '/feed', array(
        'body' => $fb_data,
        'timeout' => 15
    ));
    
    if (is_wp_error($res)) return false;
    $result = json_decode(wp_remote_retrieve_body($res), true);
    return isset($result['id']) ? true : false;
}

// === DISPLAY INQUIRY META ON SINGLE POST ===
add_filter('the_content', function($content) {
    if (!is_single() || !in_the_loop()) return $content;
    $pid = get_the_ID();
    $p_type = get_post_meta($pid, '_product_type', true);
    $p_qty = get_post_meta($pid, '_product_qty', true);
    $p_country = get_post_meta($pid, '_product_country', true);
    $p_port = get_post_meta($pid, '_product_port', true);
    $p_terms = get_post_meta($pid, '_product_terms', true);
    if (!$p_type && !$p_qty && !$p_country && !$p_port && !$p_terms) return $content;
    
    $html = '<div style="background:#f8fff8;border:1px solid #d4edda;border-radius:8px;padding:15px 20px;margin-bottom:15px;display:flex;flex-wrap:wrap;gap:12px;font-size:0.9rem;">';
    if ($p_type) {
        $badge = $p_type === 'buy' ? ' Buy' : ' Sell';
        $html .= '<div style="background:' . ($p_type === 'buy' ? '#e8f5e9' : '#ffebee') . ';padding:5px 14px;border-radius:20px;font-weight:700;font-size:0.85rem;color:' . ($p_type === 'buy' ? '#2e7d32' : '#c62828') . ';">' . $badge . '</div>';
    }
    if ($p_qty) $html .= '<div> <strong>Quantity:</strong> ' . esc_html($p_qty) . '</div>';
    if ($p_country) $html .= '<div> <strong>Destination:</strong> ' . esc_html($p_country) . '</div>';
    if ($p_port) $html .= '<div> <strong>Port:</strong> ' . esc_html($p_port) . '</div>';
    if ($p_terms) $html .= '<div style="width:100%;padding-top:6px;border-top:1px dashed #d4edda;color:#555;"> <strong>Terms:</strong> ' . esc_html($p_terms) . '</div>';
    $html .= '</div>';
    
    return $html . $content;
}, 5);

// === SEO BANNER ===
add_shortcode('seo_banner', function() {
    $html = '<div style="max-width:1100px;margin:0 auto 30px;padding:20px;background:#f9fffb;border-radius:12px;border:1px solid #d4edda;">';
    $html .= '<h2 style="font-size:1.5rem;font-weight:700;color:#1a1a1a;margin-bottom:15px;">Why Buy Scrap Products for Sale UAE?</h2>';
    $html .= '<p style="color:#444;">Welcome to our marketplace for premium <strong>scrap products for sale UAE</strong>.</p>';
    $html .= '<figure><img src="https://alshaabalwaseem.com/wp-content/uploads/2026/05/logo.png" alt="scrap products for sale UAE" style="max-width:100%;height:auto;border-radius:8px;"><figcaption style="color:#888;">Premium scrap products for sale UAE.</figcaption></figure>';
    $html .= '<p><a href="/manage-products/" style="display:inline-block;background:#0d954d;color:#fff;padding:10px 25px;border-radius:6px;text-decoration:none;font-weight:600;">+ Add New Product</a></p>';
    $html .= '</div>';
    return $html;
});

// === RECENT PRODUCTS ===
add_shortcode('recent_products', function() {
    $posts = get_posts(array('post_type' => 'post', 'posts_per_page' => 10, 'post_status' => 'publish'));
    if (empty($posts)) return '<p>No products yet.</p>';
    $html = '<div style="display:flex;flex-direction:column;gap:12px;">';
    foreach ($posts as $p) {
        $img = get_the_post_thumbnail($p->ID, array(80, 80), array('style' => 'width:50px;height:50px;object-fit:cover;border-radius:4px;'));
        $exc = wp_trim_words(strip_tags($p->post_content), 6, '...');
        $h .= '<div style="display:flex;align-items:center;gap:12px;background:#fff;padding:12px 15px;border-radius:8px;box-shadow:0 1px 5px rgba(0,0,0,0.05);">';
        if ($img) $h .= $img;
        $h .= '<div style="flex:1;min-width:0;"><div style="font-weight:600;color:#333;font-size:0.9rem;"><a href="' . get_permalink($p->ID) . '" style="color:#0d954d;text-decoration:none;">' . esc_html($p->post_title) . '</a></div>';
        if ($exc) $h .= '<div style="color:#888;font-size:0.75rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' . $exc . '</div>';
        $h .= '<div style="color:#bbb;font-size:0.7rem;">' . get_the_date('M j, Y', $p->ID) . '</div></div></div>';
    }
    return $html . '</div>';
});

// === AJAX IMAGE UPLOAD ENDPOINT (works for all users) ===
add_action('wp_ajax_upload_product_img', 'handle_img_upload');
add_action('wp_ajax_nopriv_upload_product_img', 'handle_img_upload');
function handle_img_upload() {
    if ($_POST['pw'] !== 'abcd') wp_send_json_error('bad pw');
    $file = $_FILES['file'] ?? null;
    if (!$file || $file['error'] !== UPLOAD_ERR_OK) wp_send_json_error('no file');
    
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';
    
    $aid = media_handle_sideload(array(
        'name' => $file['name'],
        'type' => $file['type'],
        'tmp_name' => $file['tmp_name'],
        'error' => $file['error'],
        'size' => $file['size']
    ), 0);
    
    if (is_wp_error($aid)) wp_send_json_error('upload fail');
    wp_send_json_success(array(
        'id' => $aid,
        'url' => wp_get_attachment_url($aid),
        'thumb' => wp_get_attachment_thumb_url($aid)
    ));
}

// === PRODUCT ADMIN ===
add_shortcode('product_admin', function() {
    $output = '';
    $auth_ok = isset($_POST['admin_pw']) && $_POST['admin_pw'] === 'abcd';
    $action = isset($_GET['act']) ? $_GET['act'] : (isset($_POST['act']) ? $_POST['act'] : (isset($_GET['action']) ? $_GET['action'] : (isset($_POST['action']) ? $_POST['action'] : '')));
    
    // --- CREATE --- with images embedded in content
    if ($auth_ok && $action === 'create' && isset($_POST['title'])) {
        // Build content with embedded images first
        $content = wp_kses_post($_POST['desc']);
        $ids = isset($_POST['img_ids']) ? array_filter(explode(',', $_POST['img_ids']), 'is_numeric') : array();
        $img_html = '';
        foreach ($ids as $iid) {
            $url = wp_get_attachment_url($iid);
            if ($url) $img_html .= '<img src="' . $url . '" alt="' . esc_attr($_POST['title']) . '" style="max-width:100%;height:auto;border-radius:6px;margin-bottom:10px;display:block;"><br>';
        }
        if ($img_html) $content = $img_html . "\n" . $content;
        
        $pid = wp_insert_post(array(
            'post_title' => sanitize_text_field($_POST['title']),
            'post_content' => $content,
            'post_status' => 'publish',
            'post_type' => 'post'
        ));
        if ($pid && !is_wp_error($pid)) {
            if (!empty($ids)) {
                set_post_thumbnail($pid, intval($ids[0]));
                update_post_meta($pid, '_product_images', $ids);
            }
            // Save inquiry fields
            update_post_meta($pid, '_product_type', sanitize_text_field($_POST['product_type']));
            update_post_meta($pid, '_product_qty', sanitize_text_field($_POST['product_qty']));
            update_post_meta($pid, '_product_country', sanitize_text_field($_POST['product_country']));
            update_post_meta($pid, '_product_port', sanitize_text_field($_POST['product_port']));
            update_post_meta($pid, '_product_terms', sanitize_textarea_field($_POST['product_terms']));
            $output .= '<div style="background:#d4edda;color:#155724;padding:12px;border-radius:6px;margin-bottom:15px;"> Published! <a href="' . get_permalink($pid) . '" style="color:#155724;font-weight:600;">' . esc_html(get_the_title($pid)) . '</a></div>';
        } else {
            $err = is_wp_error($pid) ? $pid->get_error_message() : 'Unknown error';
            $output .= '<div style="background:#f8d7da;color:#721c24;padding:12px;border-radius:6px;margin-bottom:15px;"> Failed: ' . $err . '</div>';
        }
    }
    
    // --- EDIT --- with images
    if ($auth_ok && $action === 'edit' && isset($_POST['edit_id'])) {
        $content = wp_kses_post($_POST['desc']);
        $ids = isset($_POST['img_ids']) ? array_filter(explode(',', $_POST['img_ids']), 'is_numeric') : array();
        $img_html = '';
        foreach ($ids as $iid) {
            $url = wp_get_attachment_url($iid);
            if ($url) $img_html .= '<img src="' . $url . '" alt="' . esc_attr($_POST['title']) . '" style="max-width:100%;height:auto;border-radius:6px;margin-bottom:10px;display:block;"><br>';
        }
        if ($img_html) $content = $img_html . "\n" . $content;
        
        wp_update_post(array(
            'ID' => intval($_POST['edit_id']),
            'post_title' => sanitize_text_field($_POST['title']),
            'post_content' => $content
        ));
        if (!empty($ids)) {
            set_post_thumbnail(intval($_POST['edit_id']), intval($ids[0]));
            update_post_meta(intval($_POST['edit_id']), '_product_images', $ids);
        }
        // Save inquiry fields
        update_post_meta(intval($_POST['edit_id']), '_product_type', sanitize_text_field($_POST['product_type']));
        update_post_meta(intval($_POST['edit_id']), '_product_qty', sanitize_text_field($_POST['product_qty']));
        update_post_meta(intval($_POST['edit_id']), '_product_country', sanitize_text_field($_POST['product_country']));
        update_post_meta(intval($_POST['edit_id']), '_product_port', sanitize_text_field($_POST['product_port']));
        update_post_meta(intval($_POST['edit_id']), '_product_terms', sanitize_textarea_field($_POST['product_terms']));
        $output .= '<div style="background:#d4edda;color:#155724;padding:12px;border-radius:6px;margin-bottom:15px;"> Updated!</div>';
    }
    
    // --- FACEBOOK PUSH ---
    if ($action === 'push_fb' && isset($_GET['post_id'])) {
        $pid = intval($_GET['post_id']);
        if (!$auth_ok) {
            $output .= '<div style="max-width:400px;margin:20px 0;padding:25px;background:#fff;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.08);"><h3> Post to Facebook</h3>
            <p style="color:#666;font-size:0.9rem;margin-bottom:12px;">Enter password to post this product to Facebook Page.</p>
            <form method="post" style="display:flex;gap:10px;flex-wrap:wrap;">
            <input type="hidden" name="act" value="push_fb">
            <input type="hidden" name="post_id" value="' . $pid . '">
            <input type="password" name="admin_pw" placeholder="Password" style="flex:1;padding:10px;border:2px solid #e0e0e0;border-radius:6px;">
            <input type="submit" value=" Post Now" style="background:#1877F2;color:#fff;padding:10px 20px;border:none;border-radius:6px;cursor:pointer;">
            </form></div>';
        } else {
            $result = post_to_facebook($pid);
            if ($result) {
                $output .= '<div style="background:#d4edda;color:#155724;padding:12px;border-radius:6px;margin-bottom:15px;"> Posted to Facebook! <a href="https://www.facebook.com/profile.php?id=' . FB_PAGE_ID . '" target="_blank" style="color:#155724;font-weight:600;">View Post</a></div>';
            } else {
                $output .= '<div style="background:#f8d7da;color:#721c24;padding:12px;border-radius:6px;margin-bottom:15px;"> Facebook post failed. Check token.</div>';
            }
        }
    }
    
    // --- DELETE ---
    if ($action === 'delete' && isset($_GET['del_id'])) {
        if (!$auth_ok) {
            $output .= '<div style="max-width:400px;margin:20px 0;padding:25px;background:#fff;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.08);"><h3> Password</h3>
            <form method="post" style="display:flex;gap:10px;flex-wrap:wrap;">
            <input type="hidden" name="act" value="delete">
            <input type="hidden" name="del_id" value="' . intval($_GET['del_id']) . '">
            <input type="password" name="admin_pw" placeholder="Password" style="flex:1;padding:10px;border:2px solid #e0e0e0;border-radius:6px;">
            <input type="submit" value="Delete" style="background:#c00;color:#fff;padding:10px 20px;border:none;border-radius:6px;cursor:pointer;">
            </form></div>';
        } else {
            wp_delete_post(intval($_GET['del_id']), true);
            $output .= '<div style="background:#f8d7da;color:#721c24;padding:12px;border-radius:6px;margin-bottom:15px;"> Deleted.</div>';
        }
    }
    
    // --- PASSWORD GATE ---
    $show_form = false; $mode = 'add'; $edit_title = ''; $edit_content = ''; $edit_id = ''; $edit_imgs = array();
    $edit_type = ''; $edit_qty = ''; $edit_country = ''; $edit_port = ''; $edit_terms = '';
    
    if ($action === 'add') {
        $show_form = true;
        $mode = $auth_ok ? 'add' : 'pw';
    }
    if ($action === 'edit' && isset($_GET['post_id'])) {
        $ep = get_post(intval($_GET['post_id']));
        if ($ep) {
            $show_form = true;
            if (!$auth_ok) $mode = 'pw';
            else {
                $mode = 'edit';
                $edit_title = $ep->post_title;
                $edit_content = $ep->post_content;
                $edit_id = $ep->ID;
                $edit_imgs = get_post_meta($ep->ID, '_product_images', true) ?: array();
                $edit_type = get_post_meta($ep->ID, '_product_type', true) ?: '';
                $edit_qty = get_post_meta($ep->ID, '_product_qty', true) ?: '';
                $edit_country = get_post_meta($ep->ID, '_product_country', true) ?: '';
                $edit_port = get_post_meta($ep->ID, '_product_port', true) ?: '';
                $edit_terms = get_post_meta($ep->ID, '_product_terms', true) ?: '';
            }
        }
    }
    
    // Password form
    if ($show_form && $mode === 'pw') {
        $output .= '<div style="max-width:400px;margin:20px 0;padding:25px;background:#fff;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.08);"><h3> Password Required</h3>';
        $output .= '<form method="post" style="display:flex;gap:10px;flex-wrap:wrap;">';
        $output .= '<input type="hidden" name="act" value="' . htmlspecialchars($action) . '">';
        if (isset($_GET['post_id'])) $output .= '<input type="hidden" name="post_id" value="' . intval($_GET['post_id']) . '">';
        $output .= '<input type="password" name="admin_pw" placeholder="Password" style="flex:1;padding:10px;border:2px solid #e0e0e0;border-radius:6px;">';
        $output .= '<input type="submit" value="Unlock" style="background:#0d954d;color:#fff;padding:10px 20px;border:none;border-radius:6px;cursor:pointer;">';
        $output .= '</form></div>';
    }
    
    // Add/Edit form with image upload
    if ($show_form && $mode !== 'pw') {
        $ajaxurl = admin_url('admin-ajax.php');
        $img_ids_str = implode(',', $edit_imgs);
        
        $output .= '<div style="background:#fff;padding:25px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.08);margin-bottom:20px;">';
        $output .= '<h3 style="margin-top:0;">' . ($mode === 'edit' ? ' Edit Product' : ' Add New Product') . '</h3>';
        
        $output .= '<form id="pf" method="post" action="/manage-products/" style="display:flex;flex-direction:column;gap:12px;" enctype="multipart/form-data">';
        $output .= '<input type="hidden" name="act" value="' . ($mode === 'edit' ? 'edit' : 'create') . '">';
        $output .= '<input type="hidden" name="admin_pw" value="abcd">';
        $output .= '<input type="hidden" name="img_ids" id="img_ids" value="' . $img_ids_str . '">';
        if ($mode === 'edit') $output .= '<input type="hidden" name="edit_id" value="' . $edit_id . '">';
        
        // Image upload zone
        $output .= '<div style="border:2px dashed #ccc;border-radius:8px;padding:20px;text-align:center;">';
        $output .= '<div id="imgPrev" style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:10px;justify-content:center;">';
        foreach ($edit_imgs as $iid) {
            $url = wp_get_attachment_thumb_url($iid);
            if ($url) {
                $output .= '<div style="position:relative;width:100px;height:100px;" data-id="' . $iid . '">';
                $output .= '<img src="' . $url . '" style="width:100%;height:100%;object-fit:cover;border-radius:6px;">';
                $output .= '<span onclick="this.parentElement.remove();updImgIds()" style="position:absolute;top:-6px;right:-6px;background:#c00;color:#fff;width:20px;height:20px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:12px;">x</span>';
                $output .= '</div>';
            }
        }
        $output .= '</div>';
        $output .= '<label for="imgInput" style="display:inline-block;background:#0d954d;color:#fff;padding:10px 20px;border-radius:6px;cursor:pointer;font-weight:600;"> Add Images (max 3)</label>';
        $output .= '<input type="file" id="imgInput" accept="image/*" style="display:none;" multiple>';
        $output .= '<div style="margin-top:4px;">';
        $output .= '<label for="camInput" style="color:#888;font-size:0.8rem;cursor:pointer;text-decoration:underline;"> Use Camera instead</label>';
        $output .= '<input type="file" id="camInput" accept="image/*" capture="environment" style="display:none;">';
        $output .= '</div>';
        $output .= '<p style="color:#888;font-size:0.85rem;margin:8px 0 0;">Images auto-compressed to 100KB. Max 3 images.</p>';
        $output .= '</div>';
        
        // Crop modal
        $output .= '<div id="crModal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:999999;align-items:center;justify-content:center;">';
        $output .= '<div style="background:#fff;border-radius:12px;padding:20px;max-width:600px;width:90%;max-height:90vh;overflow:auto;text-align:center;">';
        $output .= '<h3 style="margin-top:0;"> Review Image</h3>';
        $output .= '<img id="crImg" style="max-width:100%;max-height:350px;">';
        $output .= '<div style="display:flex;gap:10px;justify-content:center;margin-top:15px;">';
        $output .= '<button type="button" onclick="confirmCrop()" style="background:#0d954d;color:#fff;padding:10px 25px;border:none;border-radius:6px;cursor:pointer;font-weight:600;"> Confirm &amp; Compress</button>';
        $output .= '<button type="button" onclick="closeCrop()" style="background:#888;color:#fff;padding:10px 25px;border:none;border-radius:6px;cursor:pointer;">Skip</button>';
        $output .= '</div></div></div>';
        
        // Form fields
        $output .= '<input type="text" name="title" placeholder="Product Title" value="' . esc_attr($edit_title) . '" required style="padding:12px;border:2px solid #e0e0e0;border-radius:6px;font-size:1rem;">';
        
        // Inquiry fields in a 2-column grid
        $output .= '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">';
        // Type: Buy / Sell
        $sel_buy = $edit_type === 'buy' ? 'selected' : '';
        $sel_sell = $edit_type === 'sell' ? 'selected' : '';
        $output .= '<select name="product_type" style="padding:12px;border:2px solid #e0e0e0;border-radius:6px;font-size:0.9rem;color:#333;">';
        $output .= '<option value=""> Buy / Sell?</option>';
        $output .= '<option value="buy" ' . $sel_buy . '> I want to Buy</option>';
        $output .= '<option value="sell" ' . $sel_sell . '> I want to Sell</option>';
        $output .= '</select>';
        // Quantity
        $output .= '<input type="text" name="product_qty" placeholder=" Material Quantity (e.g. 500 MT)" value="' . esc_attr($edit_qty) . '" style="padding:12px;border:2px solid #e0e0e0;border-radius:6px;font-size:0.9rem;">';
        // Country
        $output .= '<input type="text" name="product_country" placeholder=" Destination Country / CNF" value="' . esc_attr($edit_country) . '" style="padding:12px;border:2px solid #e0e0e0;border-radius:6px;font-size:0.9rem;">';
        // Port
        $output .= '<input type="text" name="product_port" placeholder=" Port of Loading" value="' . esc_attr($edit_port) . '" style="padding:12px;border:2px solid #e0e0e0;border-radius:6px;font-size:0.9rem;">';
        $output .= '</div>';
        // Terms
        $output .= '<textarea name="product_terms" rows="2" placeholder=" Other Terms (payment, inspection, packaging...)" style="padding:12px;border:2px solid #e0e0e0;border-radius:6px;font-size:0.9rem;">' . esc_textarea($edit_terms) . '</textarea>';
        
        // Description
        $output .= '<textarea name="desc" rows="5" placeholder="Full description, material specs, price..." required style="padding:12px;border:2px solid #e0e0e0;border-radius:6px;font-size:1rem;">' . esc_textarea($edit_content) . '</textarea>';
        $output .= '<div style="display:flex;gap:10px;">';
        $output .= '<input type="submit" value="' . ($mode === 'edit' ? ' Save' : ' Publish') . '" style="background:#0d954d;color:#fff;padding:12px 25px;border:none;border-radius:6px;font-size:1rem;font-weight:600;cursor:pointer;">';
        $output .= '<a href="/manage-products/" style="padding:12px 20px;color:#666;text-decoration:none;">Cancel</a>';
        $output .= '</div>';
        $output .= '</form></div>';
        
        // JavaScript
        $output .= '<script>
var imgCount = ' . count($edit_imgs) . ';
var ajaxurl = "' . $ajaxurl . '";

function handleFiles(files) {
    for (var i = 0; i < files.length; i++) {
        if (imgCount >= 3) { alert("Max 3 images"); break; }
        var r = new FileReader();
        r.onload = function(e) {
            document.getElementById("crImg").src = e.target.result;
            document.getElementById("crModal").style.display = "flex";
        };
        r.readAsDataURL(files[i]);
    }
}

document.getElementById("imgInput").onchange = function() { handleFiles(this.files); this.value = ""; };
document.getElementById("camInput").onchange = function() { handleFiles(this.files); this.value = ""; };

function closeCrop() { document.getElementById("crModal").style.display = "none"; }

function confirmCrop() {
    var img = document.getElementById("crImg");
    var c = document.createElement("canvas");
    var mw = 800, mh = 800, w = img.naturalWidth || 800, h = img.naturalHeight || 800;
    if (w > mw) { h *= mw / w; w = mw; }
    if (h > mh) { w *= mh / h; h = mh; }
    c.width = Math.round(w);
    c.height = Math.round(h);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    doCompress(c);
    closeCrop();
}

function doCompress(c) {
    var q = 0.85;
    function go() {
        c.toBlob(function(b) {
            if (b.size > 100 * 1024 && q > 0.1) { q -= 0.1; go(); return; }
            uploadImg(b);
        }, "image/jpeg", q);
    }
    go();
}

function uploadImg(b) {
    var fd = new FormData();
    fd.append("action", "upload_product_img");
    fd.append("pw", "abcd");
    fd.append("file", b, "product_" + Date.now() + ".jpg");
    fetch(ajaxurl, { method: "POST", body: fd })
    .then(function(r) { return r.json(); })
    .then(function(d) {
        if (d.success) {
            imgCount++;
            var div = document.createElement("div");
            div.style.position = "relative";
            div.style.width = "100px";
            div.style.height = "100px";
            div.dataset.id = d.data.id;
            var html = "<img src=\"" + d.data.thumb + "\" style=\"width:100px;height:100px;object-fit:cover;border-radius:6px;\">";
                html += "<span onclick=\"this.parentElement.remove();imgCount--;updImgIds()\" style=\"position:absolute;top:-6px;right:-6px;background:#c00;color:#fff;width:20px;height:20px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:12px;\">x</span>";
            div.innerHTML = html;
            document.getElementById("imgPrev").appendChild(div);
            updImgIds();
        }
    });
}

function updImgIds() {
    var ids = [];
    document.querySelectorAll("#imgPrev div[data-id]").forEach(function(el) { ids.push(el.dataset.id); });
    document.getElementById("img_ids").value = ids.join(",");
}
</script>';
    }
    
    // Public product list with responsive mobile layout
    $output .= '<style>
    @media (max-width: 600px) {
        .pm-card { flex-wrap:wrap !important; padding:8px !important; gap:6px !important; }
        .pm-card-imgs { width:100% !important; }
        .pm-card-imgs img { width:55px !important; height:55px !important; }
        .pm-card-text { width:100% !important; display:flex !important; flex-direction:row !important; align-items:center !important; gap:6px !important; padding-top:0 !important; }
        .pm-card-text .title { font-size:0.8rem !important; flex:1 !important; }
        .pm-card-text .desc { display:none !important; }
        .pm-card-text .date { font-size:0.65rem !important; flex-shrink:0 !important; }
        .pm-card-actions { position:absolute !important; top:3px !important; right:3px !important; }
        .pm-wrap { position:relative !important; }
    }
    </style>';
    $output .= '<p style="margin-bottom:15px;"><a href="/manage-products/?act=add" style="display:inline-block;background:#0d954d;color:#fff;padding:10px 25px;border-radius:6px;text-decoration:none;font-weight:600;"> Add New Product</a></p>';
    
    $posts = get_posts(array('post_type' => 'post', 'posts_per_page' => 50, 'post_status' => 'publish'));
    if (empty($posts)) {
        $output .= '<p style="color:#888;padding:20px;background:#f9f9f9;border-radius:8px;">No products yet.</p>';
    } else {
        $output .= '<div style="display:flex;flex-direction:column;gap:10px;">';
        foreach ($posts as $p) {
            $all_ids = get_post_meta($p->ID, '_product_images', true) ?: array();
            $pid = $p->ID;
            $title = esc_html($p->post_title);
            $excerpt = wp_trim_words(strip_tags($p->post_content), 10, '...');
            $date = get_the_date('M j, Y', $pid);
            $permalink = get_permalink($pid);
            
            // Get inquiry meta
            $p_type = get_post_meta($pid, '_product_type', true) ?: '';
            $p_qty = get_post_meta($pid, '_product_qty', true) ?: '';
            $p_country = get_post_meta($pid, '_product_country', true) ?: '';
            $p_port = get_post_meta($pid, '_product_port', true) ?: '';
            
            // Type badge
            $type_badge = '';
            if ($p_type === 'buy') $type_badge = '<span style="display:inline-block;background:#e8f5e9;color:#2e7d32;font-size:0.65rem;font-weight:700;padding:2px 8px;border-radius:10px;margin-right:4px;">BUY</span>';
            elseif ($p_type === 'sell') $type_badge = '<span style="display:inline-block;background:#ffebee;color:#c62828;font-size:0.65rem;font-weight:700;padding:2px 8px;border-radius:10px;margin-right:4px;">SELL</span>';
            
            // WhatsApp message with product details  
            $wa_text = 'Hi, I am interested in: ' . $p->post_title;
            if ($p_qty) $wa_text .= ' (' . $p_qty . ')';
            $wa_text .= '%0D%0A' . strip_tags($p->post_content) . '%0D%0ALink: ' . $permalink;
            $wa_url = 'https://wa.me/971554779331?text=' . $wa_text;
            
            $output .= '<div class="pm-card pm-wrap" data-link="' . $permalink . '" style="display:flex;align-items:center;gap:10px;background:#fff;padding:10px 15px;border-radius:8px;box-shadow:0 1px 5px rgba(0,0,0,0.05);cursor:pointer;transition:box-shadow 0.2s,transform 0.2s;" onmouseenter="this.style.boxShadow=\'0 3px 15px rgba(0,0,0,0.12)\';this.style.transform=\'translateY(-1px)\'" onmouseleave="this.style.boxShadow=\'0 1px 5px rgba(0,0,0,0.05)\';this.style.transform=\'none\'">';
            
            // Images
            $output .= '<div class="pm-card-imgs" style="display:flex;gap:4px;flex-shrink:0;">';
            $img_count = 0;
            foreach ($all_ids as $iid) {
                if ($img_count >= 3) break;
                $url = wp_get_attachment_thumb_url($iid);
                if ($url) { $output .= '<img src="' . $url . '" style="width:60px;height:60px;object-fit:cover;border-radius:6px;">'; $img_count++; }
            }
            if ($img_count === 0) {
                $thumb = get_the_post_thumbnail($pid, array(60, 60), array('style' => 'width:60px;height:60px;object-fit:cover;border-radius:6px;'));
                if ($thumb) $output .= $thumb;
            }
            $output .= '</div>';
            
            // Title + meta badges + excerpt + date
            $output .= '<div class="pm-card-text" style="flex:1;min-width:0;">';
            $output .= '<div class="title" style="font-weight:600;color:#333;font-size:0.85rem;">' . $type_badge . $title . '</div>';
            // Show meta info line
            $meta_parts = array();
            if ($p_qty) $meta_parts[] = ' ' . $p_qty;
            if ($p_country) $meta_parts[] = ' ' . $p_country;
            if ($p_port) $meta_parts[] = ' ' . $p_port;
            if (!empty($meta_parts)) {
                $output .= '<div style="color:#666;font-size:0.7rem;margin-top:2px;">' . implode(' | ', $meta_parts) . '</div>';
            }
            if ($excerpt) $output .= '<div class="desc" style="color:#888;font-size:0.7rem;margin-top:1px;">' . $excerpt . '</div>';
            $output .= '<div class="date" style="color:#bbb;font-size:0.65rem;margin-top:1px;">' . $date . '</div>';
            $output .= '</div>';
            
            // WhatsApp icon (stop prop to not trigger card click)
            $output .= '<div class="pm-card-actions" style="display:flex;gap:4px;flex-shrink:0;align-items:center;">';
            // WhatsApp icon
            $output .= '<a href="' . $wa_url . '" target="_blank" rel="noopener" title="Inquire via WhatsApp" style="text-decoration:none;" onclick="event.stopPropagation();">';
            $output .= '<svg viewBox="0 0 24 24" style="width:28px;height:28px;"><path fill="#25D366" d="M12 2C6.48 2 2 5.58 2 10c0 2.53 1.5 4.81 3.82 6.13.25.9-.66 2.6-1.55 3.32-.15.12-.17.34-.04.49.07.08.18.13.29.13.15 0 2.2-.13 3.65-1.15.14-.1.32-.12.48-.05 1.1.48 2.3.74 3.53.74 5.52 0 10-3.58 10-8s-4.48-8-10-8zm-4 9c-.83 0-1.5-.67-1.5-1.5S7.17 8 8 8s1.5.67 1.5 1.5S8.83 11 8 11zm4 0c-.83 0-1.5-.67-1.5-1.5S11.17 8 12 8s1.5.67 1.5 1.5S12.83 11 12 11zm4 0c-.83 0-1.5-.67-1.5-1.5S15.17 8 16 8s1.5.67 1.5 1.5S16.83 11 16 11z"/></svg>';
            $output .= '</a>';
            
            // Facebook push icon (manual post to page)
            $output .= '<a href="/manage-products/?act=push_fb&post_id=' . $pid . '" onclick="event.stopPropagation();" title="Post to Facebook" style="text-decoration:none;">';
            $output .= '<svg viewBox="0 0 24 24" style="width:26px;height:26px;"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>';
            $output .= '</a>';
            
            // Gear icon
            $output .= '<div style="position:relative;">';
            $output .= '<span id="gear_' . $pid . '" onclick="event.stopPropagation();toggleAdmin(' . $pid . ')" style="cursor:pointer;display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;background:#f0f0f0;border-radius:50%;font-size:14px;user-select:none;"></span>';
            $output .= '<div id="admin_' . $pid . '" style="display:none;position:absolute;top:0;right:100%;margin-right:5px;background:#fff;padding:5px 8px;border-radius:6px;box-shadow:0 2px 10px rgba(0,0,0,0.15);white-space:nowrap;z-index:999;">';
            $output .= '<span id="pwform_' . $pid . '">';
            $output .= '<input type="password" id="pwinp_' . $pid . '" placeholder="Password" style="width:70px;padding:4px 6px;border:1px solid #ddd;border-radius:4px;font-size:0.75rem;">';
            $output .= '<button onclick="checkPw(' . $pid . ')" style="background:#0d954d;color:#fff;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:0.75rem;margin-left:3px;">Unlock</button>';
            $output .= '</span>';
            $output .= '<span id="actions_' . $pid . '" style="display:none;">';
            $output .= '<a href="/manage-products/?act=edit&post_id=' . $pid . '" style="background:#f0f0f0;color:#333;padding:4px 8px;border-radius:4px;text-decoration:none;font-size:0.8rem;margin-right:3px;"> Edit</a>';
            $output .= '<a href="/manage-products/?act=delete&del_id=' . $pid . '" style="background:#fee;color:#c00;padding:4px 8px;border-radius:4px;text-decoration:none;font-size:0.8rem;"> Delete</a>';
            $output .= '</span></div></div></div></div>';
        }
        $output .= '</div>';
        
        // JavaScript for gear password + card click
        $output .= '<script>
// Card click - navigate only if clicking card background, not interactive elements
document.addEventListener("click", function(e) {
    var card = e.target.closest(".pm-card");
    if (!card) return;
    // Don't navigate if clicking interactive elements
    if (e.target.closest("a, span, button, input, img, svg, path")) return;
    var link = card.getAttribute("data-link");
    if (link) location.href = link;
});

function toggleAdmin(id) {
    var box = document.getElementById("admin_" + id);
    box.style.display = box.style.display === "none" ? "block" : "none";
    document.getElementById("pwinp_" + id).value = "";
    document.getElementById("pwform_" + id).style.display = "";
    document.getElementById("actions_" + id).style.display = "none";
}
function checkPw(id) {
    var pw = document.getElementById("pwinp_" + id).value;
    if (pw === "abcd") {
        document.getElementById("pwform_" + id).style.display = "none";
        document.getElementById("actions_" + id).style.display = "";
    } else {
        alert("Wrong password!");
    }
}
</script>';
    }
    
    return $output;
});
