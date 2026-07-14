require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const WP_URL = (process.env.WP_URL || 'https://alshaabalwaseem.com').replace(/\/+$/, '');
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const auth = Buffer.from(WP_USER + ':' + WP_APP_PASS).toString('base64');

const code = [
"add_shortcode('seo_banner',function(){",
"return '<div style=\"max-width:1100px;margin:0 auto 30px;padding:20px;background:#f9fffb;border-radius:12px;border:1px solid #d4edda;\"><h2 style=\"font-size:1.5rem;font-weight:700;color:#1a1a1a;margin-bottom:15px;\">Why Buy Scrap Products for Sale UAE?</h2><p style=\"color:#444;\">Welcome to our marketplace for premium <strong>scrap products for sale UAE</strong>.</p><figure><img src=\"https://alshaabalwaseem.com/wp-content/uploads/2026/05/logo.png\" alt=\"scrap products for sale UAE\" style=\"max-width:100%;height:auto;border-radius:8px;\" /><figcaption style=\"color:#888;\">Premium scrap products for sale UAE.</figcaption></figure><p><a href=\"/manage-products/\" style=\"display:inline-block;background:#0d954d;color:#fff;padding:10px 25px;border-radius:6px;text-decoration:none;font-weight:600;\">+ Add New Product</a></p></div>';",
"});",
"",
"add_shortcode('recent_products',function(){",
"$pst=get_posts(array('post_type'=>'post','posts_per_page'=>10,'post_status'=>'publish'));",
"if(empty($pst))return '<p>No products yet.</p>';",
"$h='<div style=\"display:flex;flex-direction:column;gap:12px;\">';",
"foreach($pst as $p){",
"$img=get_the_post_thumbnail($p->ID,'thumbnail',array('style'=>'width:60px;height:60px;object-fit:cover;border-radius:4px;'));",
"$h.='<div style=\"display:flex;align-items:center;gap:15px;background:#fff;padding:15px;border-radius:8px;box-shadow:0 1px 5px rgba(0,0,0,0.05);\">'.($img?:'').'<div><h3 style=\"margin:0 0 3px;font-size:1.05rem;\"><a href=\"'.get_permalink($p->ID).'\" style=\"color:#0d954d;text-decoration:none;\">'.esc_html($p->post_title).'</a></h3><p style=\"color:#777;font-size:0.85rem;margin:0;\">'.get_the_date('M j, Y',$p->ID).'</p></div></div>';",
"}",
"return $h.'</div>';",
"});",
"",
"add_action('wp_ajax_upload_product_img',function(){",
"if($_POST['pw']!=='abcd'){wp_send_json_error('bad pw');}",
"$f=$_FILES['file']??null;if(!$f||$f['error']!==UPLOAD_ERR_OK){wp_send_json_error('no file');}",
"require_once ABSPATH.'wp-admin/includes/file.php';require_once ABSPATH.'wp-admin/includes/image.php';require_once ABSPATH.'wp-admin/includes/media.php';",
"$aid=media_handle_sideload(array('name'=>$f['name'],'type'=>$f['type'],'tmp_name'=>$f['tmp_name'],'error'=>$f['error'],'size'=>$f['size']),0);",
"if(is_wp_error($aid)){wp_send_json_error('upload fail');}",
"wp_send_json_success(array('id'=>$aid,'url'=>wp_get_attachment_url($aid),'thumb'=>wp_get_attachment_thumb_url($aid)));",
"});",
"",
"add_shortcode('product_admin',function(){",
"$o='';$pw=isset($_POST['admin_pw'])&&$_POST['admin_pw']==='abcd';",
"$act=isset($_GET['act'])?$_GET['act']:(isset($_POST['act'])?$_POST['act']:'');",
"if($pw&&$act==='create'&&isset($_POST['title'])){",
"$pid=wp_insert_post(array('post_title'=>sanitize_text_field($_POST['title']),'post_content'=>wp_kses_post($_POST['desc']),'post_status'=>'publish','post_type'=>'post'));",
"if($pid){",
"$ids=isset($_POST['img_ids'])?array_filter(explode(',',$_POST['img_ids']),'is_numeric'):array();",
"if(!empty($ids)){set_post_thumbnail($pid,intval($ids[0]));update_post_meta($pid,'_product_images',$ids);}",
"$o.='<div style=\"background:#d4edda;color:#155724;padding:12px;border-radius:6px;margin-bottom:15px;\">✅ Published! <a href=\"'.get_permalink($pid).'\" style=\"color:#155724;font-weight:600;\">View</a></div>';",
"}}",
"if($pw&&$act==='edit'&&isset($_POST['edit_id'])){",
"wp_update_post(array('ID'=>intval($_POST['edit_id']),'post_title'=>sanitize_text_field($_POST['title']),'post_content'=>wp_kses_post($_POST['desc'])));",
"$ids=isset($_POST['img_ids'])?array_filter(explode(',',$_POST['img_ids']),'is_numeric'):array();",
"if(!empty($ids)){set_post_thumbnail(intval($_POST['edit_id']),intval($ids[0]));update_post_meta(intval($_POST['edit_id']),'_product_images',$ids);}",
"$o.='<div style=\"background:#d4edda;color:#155724;padding:12px;border-radius:6px;margin-bottom:15px;\">✅ Updated!</div>';",
"}",
"if($act==='delete'&&isset($_GET['del_id'])){",
"if(!$pw){",
"$o.='<div style=\"max-width:400px;margin:20px 0;padding:25px;background:#fff;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.08);\"><h3>🔒 Password</h3><form method=\"post\" style=\"display:flex;gap:10px;flex-wrap:wrap;\"><input type=\"hidden\" name=\"act\" value=\"delete\"><input type=\"hidden\" name=\"del_id\" value=\"'.intval($_GET['del_id']).'\"><input type=\"password\" name=\"admin_pw\" placeholder=\"Password\" style=\"flex:1;padding:10px;border:2px solid #e0e0e0;border-radius:6px;\"><input type=\"submit\" value=\"Delete\" style=\"background:#c00;color:#fff;padding:10px 20px;border:none;border-radius:6px;cursor:pointer;\"></form></div>';",
"}else{wp_delete_post(intval($_GET['del_id']),true);$o.='<div style=\"background:#f8d7da;color:#721c24;padding:12px;border-radius:6px;margin-bottom:15px;\">🗑️ Deleted.</div>';}",
"}",
"$show=false;$mode='add';$et='';$ec='';$eid='';$eids=array();",
"if($act==='add'){if(!$pw){$show=true;$mode='pw';}else{$show=true;$mode='add';}}",
"if($act==='edit'&&isset($_GET['post_id'])){",
"$ep=get_post(intval($_GET['post_id']));",
"if($ep){if(!$pw){$show=true;$mode='pw';}else{$show=true;$mode='edit';$et=$ep->post_title;$ec=$ep->post_content;$eid=$ep->ID;$eids=get_post_meta($ep->ID,'_product_images',true)?:array();}}",
"}",
"if($show&&$mode==='pw'){",
"$o.='<div style=\"max-width:400px;margin:20px 0;padding:25px;background:#fff;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.08);\"><h3>🔒 Password Required</h3><form method=\"post\" style=\"display:flex;gap:10px;flex-wrap:wrap;\"><input type=\"hidden\" name=\"act\" value=\"'.$act.'\">'.(isset($_GET['post_id'])?'<input type=\"hidden\" name=\"post_id\" value=\"'.intval($_GET['post_id']).'\">':'').'<input type=\"password\" name=\"admin_pw\" placeholder=\"Password\" style=\"flex:1;padding:10px;border:2px solid #e0e0e0;border-radius:6px;\"><input type=\"submit\" value=\"Unlock\" style=\"background:#0d954d;color:#fff;padding:10px 20px;border:none;border-radius:6px;cursor:pointer;\"></form></div>';",
"}",
"if($show&&$mode!=='pw'){",
"$ajaxurl=admin_url('admin-ajax.php');",
"$o.='<div style=\"background:#fff;padding:25px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.08);margin-bottom:20px;\"><h3 style=\"margin-top:0;\">'.($mode==='edit'?'✏️ Edit Product':'➕ Add New Product').'</h3>';",
"$o.='<form id=\"pf\" method=\"post\" style=\"display:flex;flex-direction:column;gap:12px;\"><input type=\"hidden\" name=\"act\" value=\"'.($mode==='edit'?'edit':'create').'\"><input type=\"hidden\" name=\"admin_pw\" value=\"abcd\"><input type=\"hidden\" name=\"img_ids\" id=\"img_ids\" value=\"'.implode(',',$eids).'\">';",
"if($mode==='edit')$o.='<input type=\"hidden\" name=\"edit_id\" value=\"'.$eid.'\">';",
"$o.='<div style=\"border:2px dashed #ccc;border-radius:8px;padding:20px;text-align:center;\"><div id=\"imgPrev\" style=\"display:flex;gap:10px;flex-wrap:wrap;margin-bottom:10px;justify-content:center;\">';",
"foreach($eids as $iid){$u=wp_get_attachment_thumb_url($iid);if($u)$o.='<div style=\"position:relative;width:100px;height:100px;\"><img src=\"'.$u.'\" style=\"width:100%;height:100%;object-fit:cover;border-radius:6px;\"><span onclick=\"this.parentElement.remove();updIds()\" style=\"position:absolute;top:-6px;right:-6px;background:#c00;color:#fff;width:20px;height:20px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:12px;\">x</span></div>';}",
"$o.='</div><label style=\"display:inline-block;background:#0d954d;color:#fff;padding:10px 20px;border-radius:6px;cursor:pointer;font-weight:600;\">📷 Add Images (max 3)</label>';",
"$o.='<input type=\"file\" id=\"imgInp\" accept=\"image/*\" capture=\"environment\" style=\"display:none;\" multiple><p style=\"color:#888;font-size:0.85rem;margin:8px 0 0;\">Images auto-compressed to ≤100KB. Camera supported.</p></div>';",
"$o.='<div id=\"crM\" style=\"display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:999999;align-items:center;justify-content:center;\"><div style=\"background:#fff;border-radius:12px;padding:20px;max-width:600px;width:90%;max-height:90vh;overflow:auto;text-align:center;\"><h3 style=\"margin-top:0;\">✂️ Review Image</h3><img id=\"crImg\" style=\"max-width:100%;max-height:350px;\"><div style=\"display:flex;gap:10px;justify-content:center;margin-top:15px;\"><button type=\"button\" onclick=\"confCrop()\" style=\"background:#0d954d;color:#fff;padding:10px 25px;border:none;border-radius:6px;cursor:pointer;font-weight:600;\">✅ Confirm &amp; Compress</button><button type=\"button\" onclick=\"clCrop()\" style=\"background:#888;color:#fff;padding:10px 25px;border:none;border-radius:6px;cursor:pointer;\">Skip</button></div></div></div>';",
"$o.='<input type=\"text\" name=\"title\" placeholder=\"Product Title\" value=\"'.esc_attr($et).'\" required style=\"padding:12px;border:2px solid #e0e0e0;border-radius:6px;font-size:1rem;\">';",
"$o.='<textarea name=\"desc\" rows=\"6\" placeholder=\"Description, material, quantity, price...\" required style=\"padding:12px;border:2px solid #e0e0e0;border-radius:6px;font-size:1rem;\">'.esc_textarea($ec).'</textarea>';",
"$o.='<div style=\"display:flex;gap:10px;\"><input type=\"submit\" value=\"'.($mode==='edit'?'💾 Save':'📦 Publish').'\" style=\"background:#0d954d;color:#fff;padding:12px 25px;border:none;border-radius:6px;font-size:1rem;font-weight:600;cursor:pointer;\"><a href=\"/manage-products/\" style=\"padding:12px 20px;color:#666;text-decoration:none;\">Cancel</a></div>';",
"$o.='</form></div>';",
"$o.='<script>var ic='.count($eids).';var ajaxurl=\"'.$ajaxurl.'\";';",
"$o.='document.getElementById(\"imgInp\").onchange=function(){for(var f of this.files){if(ic>=3){alert(\"Max 3 images\");break;}var r=new FileReader();r.onload=function(e){document.getElementById(\"crImg\").src=e.target.result;document.getElementById(\"crM\").style.display=\"flex\";window._cf=e.target.result;};r.readAsDataURL(f);}this.value=\"\";};';",
"$o.='function clCrop(){document.getElementById(\"crM\").style.display=\"none\";}';",
"$o.='function confCrop(){var img=document.getElementById(\"crImg\");var c=document.createElement(\"canvas\");var mw=800,mh=800,w=img.naturalWidth||800,h=img.naturalHeight||800;if(w>mw){h*=mw/w;w=mw;}if(h>mh){w*=mh/h;h=mh;}c.width=Math.round(w);c.height=Math.round(h);c.getContext(\"2d\").drawImage(img,0,0,c.width,c.height);doCompress(c);clCrop();};';",
"$o.='function doCompress(c){var q=0.85;function go(){c.toBlob(function(b){if(b.size>100*1024&&q>0.1){q-=0.1;go();return;}uploadImg(b);},\"image/jpeg\",q);}go();};';",
"$o.='function uploadImg(b){var fd=new FormData();fd.append(\"action\",\"upload_product_img\");fd.append(\"pw\",\"abcd\");fd.append(\"file\",b,\"p_\"+Date.now()+\".jpg\");fetch(ajaxurl,{method:\"POST\",body:fd}).then(r=>r.json()).then(function(d){if(d.success){ic++;var div=document.createElement(\"div\");div.style.position=\"relative\";div.style.width=\"100px\";div.style.height=\"100px\";div.innerHTML=\"<img src=\\\\"\"+d.data.thumb+\"\\\" style=\\\\"width:100%;height:100%;object-fit:cover;border-radius:6px;\\\"><span onclick=\\\\"this.parentElement.remove();ic--;updIds()\\\" style=\\\\"position:absolute;top:-6px;right:-6px;background:#c00;color:#fff;width:20px;height:20px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:12px;\\\">x</span>\";div.dataset.id=d.data.id;document.getElementById(\"imgPrev\").appendChild(div);updIds();}});};';",
"$o.='function updIds(){var ids=[];document.querySelectorAll(\"#imgPrev div[data-id]\").forEach(function(el){ids.push(el.dataset.id)});document.getElementById(\"img_ids\").value=ids.join(\",\");};';  
"$o.='</script>';",
"}",
"$o.='<p style=\"margin-bottom:15px;\"><a href=\"/manage-products/?act=add\" style=\"display:inline-block;background:#0d954d;color:#fff;padding:10px 25px;border-radius:6px;text-decoration:none;font-weight:600;\">➕ Add New Product</a></p>';",
"$pst=get_posts(array('post_type'=>'post','posts_per_page'=>50,'post_status'=>'publish'));",
"if(empty($pst)){$o.='<p style=\"color:#888;padding:20px;background:#f9f9f9;border-radius:8px;\">No products yet.</p>';}else{",
"$o.='<div style=\"display:flex;flex-direction:column;gap:10px;\">';",
"foreach($pst as $p){",
"$t=get_the_post_thumbnail($p->ID,array(60,60),array('style'=>'width:60px;height:60px;object-fit:cover;border-radius:6px;'));",
"$o.='<div style=\"display:flex;align-items:center;gap:12px;background:#fff;padding:12px 18px;border-radius:8px;box-shadow:0 1px 5px rgba(0,0,0,0.05);\">'.($t?:'').'<div style=\"flex:1;\"><strong>'.esc_html($p->post_title).'</strong><span style=\"color:#999;font-size:0.85rem;margin-left:10px;\">'.get_the_date('M j, Y',$p->ID).'</span></div><div style=\"display:flex;gap:8px;\"><a href=\"/manage-products/?act=edit&post_id='.$p->ID.'\" style=\"background:#f0f0f0;color:#333;padding:6px 14px;border-radius:4px;text-decoration:none;font-size:0.9rem;\">✏️</a><a href=\"/manage-products/?act=delete&del_id='.$p->ID.'\" style=\"background:#fee;color:#c00;padding:6px 14px;border-radius:4px;text-decoration:none;font-size:0.9rem;\" onclick=\"return confirm(\\'Delete?\\')\">🗑️</a></div></div>';",
"}",
"$o.='</div>';}",
"return $o;",
"});"
].join('\n');

async function run() {
  try {
    const r = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
      headers: { 'Authorization': 'Basic ' + auth }
    });
    const snips = await r.json();
    const list = Array.isArray(snips) ? snips : (snips?.data || []);
    for (const s of list) {
      if (s.name && s.name.includes('Product Manager') && s.active) {
        await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets/' + s.id, {
          method: 'PUT', headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
          body: JSON.stringify({ active: false })
        });
        console.log('Deactivated:', s.name);
      }
    }
    const r2 = await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
      method: 'POST', headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Product Manager with Images', code, active: true, scope: 'global' })
    });
    const d = await r2.json();
    console.log('Created! ID:', d.id || JSON.stringify(d));
    const purge = "if(class_exists('LiteSpeed\\\\Purge')) { LiteSpeed\\\\Purge::purge_all(); }";
    await fetch(WP_URL + '/wp-json/code-snippets/v1/snippets', {
      method: 'POST', headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Purge Img', code: purge, active: true, scope: 'global' })
    });
    await fetch(WP_URL + '/manage-products/');
    console.log('Done!');
  } catch(e) { console.error(e.message); }
}
run();
