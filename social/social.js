/* ============ Honest Politics Party, social posts page ============ */
(function(){
'use strict';

function $(id){ return document.getElementById(id); }
function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

/* Image sizes and caption rules per platform (see the guide below the posts). */
var PLATFORMS = [
  { id:'instagram', label:'Instagram', w:1080, h:1350, cap:'long', limit:2200, link:'bio', tags:5,
    info:'Portrait image 1080 × 1350. Caption up to 2,200 characters. Links in captions are not clickable, so the caption points to the link in your bio.' },
  { id:'facebook', label:'Facebook', w:1080, h:1350, cap:'long', limit:5000, link:true, tags:0,
    info:'Portrait image 1080 × 1350. Longer captions work; the link is clickable.' },
  { id:'linkedin', label:'LinkedIn', w:1080, h:1350, cap:'long', limit:3000, link:true, tags:3,
    info:'Portrait image 1080 × 1350. Caption up to 3,000 characters. LinkedIn bans paid political ads; normal posts are fine.' },
  { id:'x', label:'X', w:1600, h:900, cap:'short', limit:280, link:true, tags:0, urlCost:23,
    info:'Landscape image 1600 × 900. 280 characters; any link counts as 23.' },
  { id:'threads', label:'Threads', w:1080, h:1350, cap:'short', limit:500, link:true, tags:0,
    info:'Portrait image 1080 × 1350. 500 characters.' },
  { id:'bluesky', label:'Bluesky', w:1600, h:900, cap:'short', limit:300, link:true, tags:0,
    info:'Landscape image 1600 × 900. 300 characters.' },
  { id:'tiktok', label:'TikTok', w:1080, h:1920, cap:'short', limit:4000, link:'bio', tags:5,
    info:'Photo post 1080 × 1920. Links are not clickable, so point to your bio. TikTok bans paid political ads; normal posts are fine.' }
];
var plat = PLATFORMS[0];
var KEY = 'hpp.promoter';
var promoter = PROMOTER;
try { promoter = localStorage.getItem(KEY) || PROMOTER; } catch (e) {}

/* ---------- captions ---------- */
function postUrl(p){ return SITE + (p.id === 'bill' ? '/bill/' : '/'); }
function caption(p, pl){
  var t = pl.cap === 'long' ? p.long : p.short;
  if (pl.link === true) t += '\n\n' + postUrl(p);
  if (pl.link === 'bio') t += '\n\nLink in bio.';
  if (pl.tags) t += '\n\n' + TAGS.slice(0, pl.tags).join(' ');
  return t;
}
function charCount(t, pl){
  if (!pl.urlCost) return Array.from(t).length;
  return Array.from(t.replace(/https?:\/\/\S+/g, '')).length + (t.match(/https?:\/\/\S+/g) || []).length * pl.urlCost;
}

/* ---------- the image ----------
   Fonts are Georgia and Arial so the saved PNG looks the same as the preview. */
function cardSVG(p, w, h){
  var k = Math.min(w, h) / 1080, m = 80 * k;
  var yTop = 205 * k, yBot = h - 285 * k, room = yBot - yTop;
  var natural = p.lines.reduce(function(a, l){ return a + l[1] * k * 1.1; }, 0);
  var s = Math.min(1, room / natural);
  p.lines.forEach(function(l){ s = Math.min(s, (w - 2 * m) / (Array.from(l[0]).length * l[1] * k * 0.56)); });
  var y = yTop + (room - natural * s) / 2, big = [];
  p.lines.forEach(function(l){
    var fs = l[1] * k * s;
    y += fs * 0.92;
    big.push('<text x="' + m.toFixed(0) + '" y="' + y.toFixed(0) + '" font-family="Georgia, \'Times New Roman\', serif" font-weight="700" font-size="' + fs.toFixed(0) + '" fill="' + l[2] + '" letter-spacing="' + (-fs * 0.02).toFixed(1) + '">' + esc(l[0]) + '</text>');
    y += fs * 0.18;
  });
  var ry = h - 250 * k, promo = promoter.trim() ? 'Promoted by ' + promoter.trim() : 'Promoted by ADD NAME AND CONTACT DETAILS';
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '">' +
    '<rect width="' + w + '" height="' + h + '" fill="#13161B"/>' +
    '<circle cx="' + (w - 40 * k) + '" cy="' + (40 * k) + '" r="' + (300 * k) + '" fill="#D2541F" opacity=".16"/>' +
    '<rect x="' + m + '" y="' + (80 * k) + '" width="' + (72 * k) + '" height="' + (72 * k) + '" rx="' + (16 * k) + '" fill="#D2541F"/>' +
    '<text x="' + (m + 36 * k) + '" y="' + (131 * k) + '" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="' + (42 * k) + '" fill="#FAF8F4">H</text>' +
    '<text x="' + (m + 96 * k) + '" y="' + (127 * k) + '" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="' + (27 * k) + '" letter-spacing="' + (5 * k) + '" fill="#FAF8F4">HONEST POLITICS PARTY</text>' +
    big.join('') +
    '<rect x="' + m + '" y="' + ry + '" width="' + (w - 2 * m) + '" height="' + (2 * k) + '" fill="#3A3E47"/>' +
    '<text x="' + m + '" y="' + (ry + 66 * k) + '" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="' + (38 * k) + '" fill="#FAF8F4">' + esc(p.sub[0]) + '</text>' +
    '<text x="' + m + '" y="' + (ry + 116 * k) + '" font-family="Arial, Helvetica, sans-serif" font-size="' + (38 * k) + '" fill="#B9B4AA">' + esc(p.sub[1]) + '</text>' +
    '<text x="' + m + '" y="' + (h - 56 * k) + '" font-family="Arial, Helvetica, sans-serif" font-size="' + (22 * k) + '" fill="' + (promoter.trim() ? '#8A857B' : '#FF6B5B') + '">' + esc(promo) + '</text>' +
    '<text x="' + (w - m) + '" y="' + (h - 56 * k) + '" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="' + (22 * k) + '" fill="#E5A024">honestpoliticsnz.pages.dev</text>' +
    '</svg>';
}
function toPng(svg, w, h){
  return new Promise(function(res, rej){
    var img = new Image();
    img.onload = function(){
      var c = document.createElement('canvas'); c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      c.toBlob(res, 'image/png');
    };
    img.onerror = rej;
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
}
function saveBlob(blob, name){
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function(){ URL.revokeObjectURL(a.href); }, 4000);
}
function toast(msg){ var t = $('toast'); t.textContent = msg; t.classList.add('on'); setTimeout(function(){ t.classList.remove('on'); }, 1800); }
function fileName(p, pl, n){ return String(n).padStart(2, '0') + '-' + p.id + '-' + pl.id + '.png'; }

/* ---------- rendering ---------- */
function renderPlats(){
  $('plats').innerHTML = PLATFORMS.map(function(pl){
    return '<button type="button" role="tab" data-p="' + pl.id + '" aria-selected="' + (pl === plat) + '">' + esc(pl.label) + '</button>';
  }).join('');
  $('platInfo').textContent = plat.info;
}
function renderPosts(){
  $('posts').innerHTML = POSTS.map(function(p, i){
    var cap = caption(p, plat), n = charCount(cap, plat), over = n > plat.limit;
    return '<article class="post">' +
      '<div class="postImg" style="aspect-ratio:' + plat.w + '/' + plat.h + '">' + cardSVG(p, plat.w, plat.h) + '</div>' +
      '<div class="postBody"><h3><span>' + (i + 1) + '</span>' + esc(p.title) + '</h3>' +
        '<textarea readonly rows="7" aria-label="Caption for ' + esc(plat.label) + '">' + esc(cap) + '</textarea>' +
        '<div class="count' + (over ? ' over' : '') + '">' + n.toLocaleString('en-NZ') + ' / ' + plat.limit.toLocaleString('en-NZ') + (over ? ' : too long' : '') + '</div>' +
        '<div class="acts"><button type="button" data-a="copy" data-i="' + i + '">Copy caption</button>' +
        '<button type="button" data-a="save" data-i="' + i + '">Save image</button>' +
        '<button type="button" class="fill" data-a="share" data-i="' + i + '">Share</button></div></div></article>';
  }).join('');
}
function renderPromo(){
  var p = promoter.trim();
  $('promoNote').innerHTML = (p ? 'Added to every image, so boosted posts carry it too.' : '<span class="need">Election ads need a promoter statement. Until you add one, the images show a red reminder.</span>') +
    ' For normal (unboosted) posts, the Electoral Commission lets it sit in each account’s bio or About section instead of every caption.';
  $('promoter').innerHTML = p ? 'Promoted by ' + esc(p) + '.' : '<span class="need">Promoted by: add a name and contact details before this goes live.</span>';
}

/* ---------- events ---------- */
$('promoIn').value = promoter;
$('promoIn').addEventListener('input', function(e){
  promoter = e.target.value;
  try { localStorage.setItem(KEY, promoter); } catch (err) {}
  renderPromo(); renderPosts();
});
$('plats').addEventListener('click', function(e){
  var b = e.target.closest('button'); if (!b) return;
  plat = PLATFORMS.filter(function(pl){ return pl.id === b.dataset.p; })[0];
  renderPlats(); renderPosts();
});
$('posts').addEventListener('click', function(e){
  var b = e.target.closest('button'); if (!b) return;
  var p = POSTS[+b.dataset.i], a = b.dataset.a, cap = caption(p, plat), name = fileName(p, plat, +b.dataset.i + 1);
  if (a === 'copy'){
    (navigator.clipboard ? navigator.clipboard.writeText(cap) : Promise.reject()).then(function(){ toast('Caption copied'); }, function(){ toast('Select the caption and copy it'); });
    return;
  }
  toPng(cardSVG(p, plat.w, plat.h), plat.w, plat.h).then(function(blob){
    if (a === 'share'){
      var file = new File([blob], name, { type:'image/png' });
      if (navigator.canShare && navigator.canShare({ files:[file] })){
        if (navigator.clipboard) navigator.clipboard.writeText(cap).catch(function(){});
        navigator.share({ files:[file], text:cap }).catch(function(){});
        return;
      }
    }
    saveBlob(blob, name);
  });
});

/* A simple plan: one post every two days, starting the next Monday. */
function schedule(){
  var d = new Date(); d.setHours(9, 0, 0, 0);
  d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7));
  return POSTS.map(function(p, i){
    var x = new Date(d); x.setDate(d.getDate() + i * 2);
    if (x.getFullYear() === 2026 && x.getMonth() === 10 && x.getDate() === 7) x.setDate(8); // nothing new on election day
    return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0') + ' 09:00';
  });
}
function csvCell(s){ return '"' + String(s).replace(/"/g, '""') + '"'; }
function buildCsv(platforms){
  var dates = schedule(), rows = [['Date', 'Platform', 'Post', 'Caption', 'Image file']];
  platforms.forEach(function(pl){
    POSTS.forEach(function(p, i){ rows.push([dates[i], pl.label, p.title, caption(p, pl), fileName(p, pl, i + 1)]); });
  });
  return rows.map(function(r){ return r.map(csvCell).join(','); }).join('\r\n');
}
$('dlCsv').addEventListener('click', function(){
  saveBlob(new Blob(['﻿' + buildCsv(PLATFORMS)], { type:'text/csv' }), 'honest-politics-schedule.csv');
});
$('dlAll').addEventListener('click', function(){
  if (!window.JSZip){ toast('Zip tool did not load'); return; }
  var zip = new JSZip(), jobs = [], b = $('dlAll');
  b.disabled = true; b.textContent = 'Building…';
  PLATFORMS.forEach(function(pl){
    var folder = zip.folder(pl.id), caps = [];
    POSTS.forEach(function(p, i){
      var name = fileName(p, pl, i + 1);
      jobs.push(toPng(cardSVG(p, pl.w, pl.h), pl.w, pl.h).then(function(blob){ folder.file(name, blob); }));
      caps.push('=== ' + name + ' ===\n' + caption(p, pl) + '\n');
    });
    folder.file('captions.txt', caps.join('\n'));
  });
  zip.file('schedule.csv', '﻿' + buildCsv(PLATFORMS));
  Promise.all(jobs).then(function(){ return zip.generateAsync({ type:'blob' }); }).then(function(blob){
    saveBlob(blob, 'honest-politics-posts.zip');
    b.disabled = false; b.textContent = 'Download all images + captions (.zip)';
  });
});

renderPlats(); renderPosts(); renderPromo();
if (typeof HOWTO !== 'undefined') $('howTo').innerHTML = HOWTO;

/* exposed for checks */
window.HPP_SOCIAL = { cardSVG:cardSVG, caption:caption, charCount:charCount, PLATFORMS:PLATFORMS };
})();
