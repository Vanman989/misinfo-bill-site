/* ============ Explore: the big buttons to every part of the site ============
   Any element with class "explore" gets the grid. data-current hides the page
   you are on; data-title sets the heading. Needs data.js + finance.js for the
   live figures on the tiles. */
(function(){
'use strict';
function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
var med = (typeof taxOn === 'function' && typeof SCHEDULES !== 'undefined')
  ? '$' + Math.round(taxOn(71800, SCHEDULES.today) - taxOn(71800, SCHEDULES.ours)).toLocaleString('en-NZ') : '';
var total = typeof FIN !== 'undefined' ? '$' + Math.round(FIN.totalIn) + 'b' : '$11b';
var TILES = [
  { id:'town', href:'/town/', big:'3D', title:'One town, now vs with us', text:'Drag from now to with us and watch the whole country change.', tone:'flame', feature:true },
  { id:'tax', href:'/tax/', big:med || 'You', title:'Your tax', text:'Put in your income and see what you keep. The median earner keeps ' + (med || 'more') + ' a year.', tone:'green' },
  { id:'money', href:'/money/', big:'24×', title:'Follow the money', text:'The richest got 24 times richer. See where ' + total + ' a year goes today, and with us.', tone:'amber' },
  { id:'plan', href:'/plan/', big:'Plan', title:'The plan', text:'Every gain taxed like wages. Free GP, dental and trains. Homes families can own.', tone:'flame' },
  { id:'myths', href:'/myths/', big:'?!', title:'Myths you’ve been sold', text:'Taxing the same dollar twice? Socialism? Trickle down? The answers, with sources.', tone:'red' },
  { id:'finance', href:'/finance/', big:'$', title:'Costings', text:'Every figure in one place, costed against Treasury’s own books.', tone:'blue' },
  { id:'history', href:'/history/', big:'1938', title:'History', text:'When countries tried to share the wealth: what happened, and New York now.', tone:'blue' },
  { id:'river', href:'/river/', big:'185', title:'The Tax River', text:'185 years of who paid tax in New Zealand, as a flowing river.', tone:'green' },
  { id:'bill', href:'/bill/', big:'Bill', title:'Our first bill', text:'Make knowingly lying to voters an offence for MPs.', tone:'red' },
  { id:'social', href:'/social/', big:'Share', title:'Share it', text:'Posts for every platform, sized and written, ready to go.', tone:'amber' }
];
document.querySelectorAll('.explore').forEach(function(el){
  var cur = el.dataset.current || '', max = +el.dataset.max || 99;
  var tiles = TILES.filter(function(t){ return t.id !== cur; }).slice(0, max);
  el.innerHTML = '<h2 class="exH">' + esc(el.dataset.title || 'Explore') + '</h2><div class="exGrid">' + tiles.map(function(t){
    return '<a class="exTile ex-' + t.tone + (t.feature && !cur ? ' exFeature' : '') + '" href="' + t.href + '">' +
      '<span class="exBig">' + esc(t.big) + '</span><span class="exBody"><b>' + esc(t.title) + '</b><span>' + esc(t.text) + '</span></span><span class="exGo" aria-hidden="true">→</span></a>';
  }).join('') + '</div>';
});
})();
