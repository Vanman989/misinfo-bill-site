/* ============ History page: map, timeline and the stories ============ */
(function(){
'use strict';
function $(id){ return document.getElementById(id); }
function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function links(list){ return list.map(function(s){ return '<a href="' + esc(s[1]) + '" target="_blank" rel="noopener">' + esc(s[0]) + '</a>'; }).join(' · '); }

var ALL = CASES.concat(WORKED).concat([NYC]);
var KIND = { pressure:'Faced outside pressure', worked:'Made it work', now:'Trying now' };
var ANCHOR = { pressure:'case-', worked:'worked-', now:'nyc' };
// ISO numeric country codes on the map, coloured by story
var COUNTRY = { 320:'pressure', 364:'pressure', 152:'pressure', 192:'pressure', 862:'pressure',
                554:'worked', 826:'worked', 208:'worked', 578:'worked', 752:'worked', 246:'worked', 840:'now' };
var filter = 'all', selected = null;

/* ---------- the stories ---------- */
$('hxCases').innerHTML = CASES.map(function(c, i){
  return '<article class="hxCase" id="case-' + c.id + '">' +
    '<header><span class="hxNum">' + (i + 1) + '</span><div><h3>' + esc(c.place) + '</h3><span class="hxYears">' + esc(c.years) + '</span></div></header>' +
    row('tried', 'What they tried', c.tried) + row('outside', 'What came from outside', c.outside) +
    row('home', 'What went wrong at home', c.home) + row('after', 'What happened next', c.after) +
    '<p class="hxLesson">' + esc(c.lesson) + '</p><p class="src">' + links(c.src) + '</p></article>';
}).join('');
function row(k, label, text){ return '<div class="hxRow hx-' + k + '"><b>' + label + '</b><p>' + esc(text) + '</p></div>'; }

$('hxWorked').innerHTML = WORKED.map(function(w){
  return '<article class="hxWork" id="worked-' + w.id + '"><span class="hxYears">' + esc(w.years) + '</span><h3>' + esc(w.place) + '</h3><p>' + esc(w.text) + '</p><p class="src">' + links(w.src) + '</p></article>';
}).join('');

function nycList(cls, title, items){
  return '<div class="nycCol ' + cls + '"><h3>' + title + '</h3>' + items.map(function(x){
    return '<div class="nycItem"><b>' + esc(x[0]) + '</b><p>' + esc(x[1]) + '</p><p class="src">' + links([x[2]]) + '</p></div>';
  }).join('') + '</div>';
}
$('hxNyc').innerHTML = '<p class="lead">' + esc(NYC.intro) + '</p><div class="nycGrid">' +
  nycList('nyc-work', 'Working', NYC.working) + nycList('nyc-early', 'Too early to tell', NYC.early) + nycList('nyc-block', 'Blocked so far', NYC.blocked) + '</div>';

$('hxLessons').innerHTML = LESSONS.map(function(l){ return '<li>' + esc(l) + '</li>'; }).join('');
$('promoter').innerHTML = PROMOTER ? 'Promoted by ' + esc(PROMOTER) + '.' : '<span class="need">Promoted by: add a name and contact details before this goes live.</span>';

/* ---------- filters and timeline ---------- */
var FILTERS = [['all', 'Everything'], ['pressure', 'Outside pressure'], ['worked', 'Where it worked'], ['now', 'New York now']];
$('hxFilters').innerHTML = FILTERS.map(function(f){
  return '<button type="button" role="tab" data-f="' + f[0] + '" aria-selected="' + (f[0] === filter) + '">' + f[1] + '</button>';
}).join('');
$('hxFilters').addEventListener('click', function(e){
  var b = e.target.closest('button'); if (!b) return;
  filter = b.dataset.f;
  $('hxFilters').querySelectorAll('button').forEach(function(x){ x.setAttribute('aria-selected', String(x === b)); });
  if (selected && filter !== 'all' && selected.kind !== filter) select(null);
  paint();
});
var sorted = ALL.slice().sort(function(a, b){ return a.year - b.year; });
$('hxTimeline').innerHTML = '<div class="tlRail"></div>' + sorted.map(function(x){
  return '<button type="button" class="tlDot tl-' + x.kind + '" data-id="' + x.id + '"><i></i><b>' + esc(x.id === 'nordics' ? 'today' : String(x.year)) + '</b><span>' + esc(x.place) + '</span></button>';
}).join('');
$('hxTimeline').addEventListener('click', function(e){
  var b = e.target.closest('.tlDot'); if (b) select(byId(b.dataset.id), true);
});
function byId(id){ return ALL.filter(function(x){ return x.id === id; })[0]; }
function anchorOf(x){ return x.kind === 'now' ? 'nyc' : ANCHOR[x.kind] + x.id; }

/* ---------- the map ---------- */
var svg, proj, pinsG, countriesG, pop;
function drawMap(world){
  var box = $('hxMap'), W = box.clientWidth, H = Math.round(W * 0.52);
  box.innerHTML = '';
  svg = d3.select(box).append('svg').attr('viewBox', '0 0 ' + W + ' ' + H).attr('role', 'img').attr('aria-label', 'World map of the stories on this page');
  var land = topojson.feature(world, world.objects.countries);
  proj = d3.geoNaturalEarth1().fitExtent([[6, 6], [W - 6, H - 6]], { type:'Sphere' });
  var path = d3.geoPath(proj);
  svg.append('path').attr('d', path({ type:'Sphere' })).attr('class', 'sea');
  countriesG = svg.append('g');
  countriesG.selectAll('path').data(land.features).join('path').attr('d', path)
    .attr('class', function(f){ return 'land ' + (COUNTRY[+f.id] ? 'c-' + COUNTRY[+f.id] : ''); });
  pinsG = svg.append('g');
  var pins = pinsG.selectAll('g').data(ALL).join('g').attr('class', function(x){ return 'pin pin-' + x.kind; })
    .attr('transform', function(x){ var p = proj([x.lon, x.lat]); return 'translate(' + p[0] + ',' + p[1] + ')'; })
    .attr('tabindex', 0).attr('role', 'button').attr('aria-label', function(x){ return x.place + ', ' + KIND[x.kind]; })
    .on('click', function(e, x){ select(x); })
    .on('keydown', function(e, x){ if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); select(x); } });
  pins.append('circle').attr('class', 'pulse').attr('r', 9);
  pins.append('circle').attr('class', 'dot').attr('r', 7);
  pop = d3.select(box).append('div').attr('class', 'hxPop').attr('aria-live', 'polite');
  paint();
}
function paint(){
  if (pinsG) pinsG.selectAll('g').classed('dim', function(x){ return filter !== 'all' && x.kind !== filter; })
    .classed('sel', function(x){ return selected && x.id === selected.id; });
  if (countriesG) countriesG.selectAll('path').classed('dim', function(f){ var k = COUNTRY[+f.id]; return filter !== 'all' && k && k !== filter; });
  document.querySelectorAll('.tlDot').forEach(function(b){
    var x = byId(b.dataset.id);
    b.classList.toggle('dim', filter !== 'all' && x.kind !== filter);
    b.classList.toggle('sel', !!selected && x.id === selected.id);
  });
}
function select(x, fromTimeline){
  selected = x; paint();
  if (!pop) return;
  if (!x){ pop.classed('on', false); return; }
  var summary = x.kind === 'pressure' ? x.lesson : x.kind === 'worked' ? x.text.split('. ')[0] + '.' : NYC.intro;
  pop.html('<span class="popKind pk-' + x.kind + '">' + KIND[x.kind] + ' · ' + esc(x.years) + '</span><h3>' + esc(x.place) + '</h3><p>' + esc(summary) + '</p>' +
    '<a href="#' + anchorOf(x) + '">Read the full story →</a><button type="button" aria-label="Close">×</button>');
  pop.classed('on', true);
  pop.select('button').on('click', function(){ select(null); });
  if (fromTimeline) $('hxMap').scrollIntoView({ behavior:'smooth', block:'center' });
}

if (window.d3 && window.topojson){
  fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(function(r){ return r.json(); }).then(function(world){
    drawMap(world);
    var w = $('hxMap').clientWidth;
    window.addEventListener('resize', function(){ if (Math.abs($('hxMap').clientWidth - w) > 40){ w = $('hxMap').clientWidth; drawMap(world); if (selected) select(selected); } });
  }).catch(noMap);
} else noMap();
function noMap(){ $('hxMap').innerHTML = '<div class="hxMapMsg">The map could not load here. Every story is below.</div>'; }
})();
