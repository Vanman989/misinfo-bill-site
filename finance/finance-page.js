/* ============ Honest Politics Party, costings page ============ */
(function(){
'use strict';
function $(id){ return document.getElementById(id); }
function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function money(n){ return (n < 0 ? '−' : '') + '$' + Math.abs(Math.round(n)).toLocaleString('en-NZ'); }
function bn(b, sign){ return (sign && b > 0 ? '+' : b < 0 ? '−' : '') + '$' + Math.abs(b).toFixed(1).replace(/\.0$/, '') + 'b'; }
function pct(x){ return (Math.round(x * 10) / 10).toFixed(1).replace(/\.0$/, '') + '%'; }
function link(s){ return '<a href="' + esc(s[1]) + '" target="_blank" rel="noopener">' + esc(s[0]) + '</a>'; }
var BADGE = { official:'official source', party:'party costing', estimate:'estimate' };
function badge(c){ return '<span class="badge b-' + c + '">' + BADGE[c] + '</span>'; }
var T = SCHEDULES.today, O = SCHEDULES.ours;

/* summary */
$('sumCards').innerHTML =
  '<div class="sumCard up"><span>New money in</span><b>' + bn(FIN.totalIn) + '</b><p>a year, from taxing every kind of income</p></div>' +
  '<div class="sumCard down"><span>Tax cut on work</span><b>' + bn(FIN.cut.b) + '</b><p>a year; ' + Math.round(FIN.cut.sharePeopleBetter * 100) + '% of taxpayers pay less</p></div>' +
  '<div class="sumCard flame"><span>More for NZ</span><b>' + bn(FIN.services) + '</b><p>a year: free health care, transport, family incomes</p></div>' +
  '<div class="sumCard up"><span>Deficit cut</span><b>' + bn(FIN.net) + '</b><p>a year, of this year’s $' + FIN.deficit + 'b deficit</p></div>';

/* money in */
$('inTable').innerHTML = '<div class="tblWrap"><table class="tbl"><thead><tr><th>Tax</th><th class="num">A year</th></tr></thead><tbody>' +
  FIN.moneyIn.map(function(r){
    return '<tr><td>' + esc(r.label) + ' ' + badge(r.conf) + '<small>First years: ' + esc(r.early) + '. ' + link(r.src) + '</small></td><td class="num up">' + bn(r.b, true) + '</td></tr>';
  }).join('') +
  '<tr class="tot"><td>Total, at full strength</td><td class="num up">' + bn(FIN.totalIn, true) + '</td></tr></tbody></table></div>';

/* brackets */
function bandRows(bands){
  var lo = 0;
  return bands.map(function(b){
    var r = { from: lo, to: b[0], rate: b[1] }; lo = b[0]; return r;
  });
}
function range(r){ return '$' + r.from.toLocaleString('en-NZ') + (r.to === Infinity ? ' +' : ' to $' + r.to.toLocaleString('en-NZ')); }
var tR = bandRows(T), oR = bandRows(O);
$('bracketLead').innerHTML = esc(OUR_BANDS_LEAD);
$('bracketTable').innerHTML =
  '<div class="tblWrap"><table class="tbl"><thead><tr><th>Today</th><th class="num">Rate</th><th>Ours</th><th class="num">Rate</th></tr></thead><tbody>' +
  Array.from({ length: Math.max(tR.length, oR.length) }).map(function(_, i){
    var a = tR[i], b = oR[i];
    return '<tr><td>' + (a ? range(a) : '') + '</td><td class="num">' + (a ? a.rate + '%' : '') + '</td><td>' + (b ? range(b) : '') + '</td><td class="num ' + (b ? 'up' : '') + '">' + (b ? b.rate + '%' : '') + '</td></tr>';
  }).join('') + '</tbody></table></div>';

/* effective rate chart, $0 to $250k */
(function(){
  var W = 640, H = 300, L = 44, R = 12, Tp = 12, B = 34, max = 250000, ymax = 35;
  function x(v){ return L + v / max * (W - L - R); }
  function y(v){ return Tp + (1 - v / ymax) * (H - Tp - B); }
  function line(bands){
    var pts = [];
    for (var inc = 2000; inc <= max; inc += 2000) pts.push(x(inc).toFixed(1) + ',' + y(taxOn(inc, bands) / inc * 100).toFixed(1));
    return pts.join(' ');
  }
  var g = '';
  for (var v = 0; v <= ymax; v += 5) g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(v) + '" y2="' + y(v) + '" stroke="#E7E2D6"/><text x="' + (L - 6) + '" y="' + (y(v) + 4) + '" text-anchor="end" font-size="11" fill="#857F72">' + v + '%</text>';
  for (var k = 0; k <= max; k += 50000) g += '<text x="' + x(k) + '" y="' + (H - 12) + '" text-anchor="middle" font-size="11" fill="#857F72">$' + (k / 1000) + 'k</text>';
  $('rateChart').innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Average income tax rate by income, today and under our plan">' + g +
    '<polyline points="' + line(T) + '" fill="none" stroke="#13161B" stroke-width="2.5"/>' +
    '<polyline points="' + line(O) + '" fill="none" stroke="#1E7A55" stroke-width="3"/></svg>' +
    '<div class="chartKey"><span><i style="background:#13161B"></i>Today</span><span><i style="background:#1E7A55"></i>Our brackets</span></div>';
})();
$('bracketNote').innerHTML = '<p class="body">' + esc(OUR_BANDS_NOTE) + '</p><p class="src">Cost worked out on ' + link(INCOME_DIST.src) + ' (' + esc(INCOME_DIST.year) + ').</p>';

/* money out */
$('outTable').innerHTML = '<div class="tblWrap"><table class="tbl"><thead><tr><th>Spending</th><th class="num">A year</th></tr></thead><tbody>' +
  FIN.moneyOut.map(function(r){
    return '<tr><td>' + esc(r.label) + ' ' + badge(r.conf) + '<small>' + link(r.src) + '</small></td><td class="num down">' + bn(r.b, true) + '</td></tr>';
  }).join('') +
  '<tr class="tot"><td>Total</td><td class="num down">' + bn(FIN.totalOut, true) + '</td></tr></tbody></table></div>';
$('invTable').innerHTML = '<div class="tblWrap"><table class="tbl"><tbody>' + FIN.investments.map(function(r){
  return '<tr><td><b>' + esc(r.label) + '</b><small>' + esc(r.note) + ' ' + link(r.src) + '</small></td><td class="num">' + (r.b == null ? 'repaid' : '$' + r.b + 'b once') + '</td></tr>';
}).join('') + '</tbody></table></div>';

/* bottom line */
$('netBox').innerHTML = '<div class="netGrid">' +
  '<div class="netRow"><span>New money in</span><b>' + bn(FIN.totalIn, true) + '</b></div>' +
  '<div class="netRow"><span>Lower income tax</span><b>' + bn(-FIN.cut.b, true) + '</b></div>' +
  '<div class="netRow"><span>Free health care, transport, family incomes</span><b>' + bn(-FIN.services, true) + '</b></div>' +
  '<div class="netRow big"><span>Better off for the books, every year</span><b>' + bn(FIN.net, true) + '</b></div>' +
  '<div class="netRow"><span>Later: linking the pension age to life expectancy</span><b>' + bn(FIN.superLater, true) + '</b></div>' +
  '</div><p class="body">That cuts about ' + Math.round(FIN.net / FIN.deficit * 100) + '% off this year’s $' + FIN.deficit + 'b deficit, rising to about ' + Math.round((FIN.net + FIN.superLater) / FIN.deficit * 100) + '% once the pension change is in. ' +
  'In the first years the capital gains tax raises much less while gains build up, so the tax cut and the new services phase in as the money arrives. Nothing is paid for by borrowing.</p>';

/* who wins, who loses */
var PEOPLE = [
  { name:'Retiree on NZ Super', who:'Single, living alone: $647 a week before tax (Work and Income, April 2026)', inc:33663 },
  { name:'Part-time worker', who:'Working part-time', inc:20000 },
  { name:'Minimum wage worker', who:'Full-time on the minimum wage', inc:48900 },
  { name:'Median earner', who:'Half of earners make less, half more', inc:71800 },
  { name:'Nurse', who:'IRD’s $80,000 example', inc:80000 },
  { name:'Engineer', who:'A typical engineer’s salary', inc:124000 },
  { name:'High earner', who:'A specialist or senior manager', inc:250000 }
];
function personWage(p){
  var a = taxOn(p.inc, T), b = taxOn(p.inc, O), d = a - b;
  return '<div class="person"><h3>' + esc(p.name) + '</h3><div class="who">' + esc(p.who) + ', ' + money(p.inc) + ' a year</div>' +
    '<div class="row"><span>Income tax today</span><b>' + money(a) + ' (' + pct(a / p.inc * 100) + ')</b></div>' +
    '<div class="row"><span>Under our plan</span><b>' + money(b) + ' (' + pct(b / p.inc * 100) + ')</b></div>' +
    '<div class="verdict ' + (d > 1 ? 'win' : d < -1 ? 'lose' : 'same') + '">' + (d > 1 ? 'Keeps ' + money(d) + ' more a year' : d < -1 ? 'Pays ' + money(-d) + ' more a year' : 'No change') + '</div></div>';
}
var home = { inc:90000, gain:280000, years:10 }, rental = { inc:120000, gain:300000, years:10 };
function personGain(title, who, g, note){
  var tax = gainTax(g.inc, g.gain, g.years, O);
  return '<div class="person"><h3>' + esc(title) + '</h3><div class="who">' + esc(who) + '</div>' +
    '<div class="row"><span>Tax on the gain today</span><b>$0</b></div>' +
    '<div class="row"><span>Under our plan</span><b>' + money(tax) + '</b></div>' +
    '<div class="row"><span>Still keeps</span><b>' + money(g.gain - tax) + ' of the gain</b></div>' +
    '<div class="verdict lose">Pays ' + money(tax) + ' on a ' + money(g.gain) + ' gain</div><p class="note">' + note + '</p></div>';
}
$('people').innerHTML = PEOPLE.map(personWage).join('') +
  personGain('Family selling their home', 'Earns $90,000, sells after 10 years with the median gain of $280,000', home,
    'The gain is spread over the 10 years they owned it and taxed at their own rate. Median resale gain and holding time: ' + link(['Cotality Q2 2026', TAX_PLAN[0].src[1][1]]) + '.') +
  personGain('Landlord selling a rental', 'Earns $120,000, sells a rental after 10 years with a $300,000 gain', rental,
    'Spread over the years owned, taxed at their own rate, the same as wages.') +
  '<div class="person"><h3>The 311 wealthiest families</h3><div class="who">Median family worth $106 million</div>' +
    '<div class="row"><span>Tax on all their income today</span><b>8.9%</b></div>' +
    '<div class="row"><span>Under our plan, rough estimate</span><b>about 19%</b></div>' +
    '<div class="verdict lose">More than double</div>' +
    '<p class="note">If about a third of their gains are realised each year (Deloitte’s reading of IRD’s data) and taxed at 39%, their rate rises from 8.9% to about 19%. Gains never sold are caught by the inheritance tax when wealth passes on. ' + link(FACTS.rich311.src) + '</p></div>';

/* around the world */
$('world').innerHTML = WORLD_EXAMPLES.map(function(w){
  return '<div class="place"><span class="tag">' + esc(w.where) + '</span><h3>' + esc(w.title) + '</h3><p>' + esc(w.text) + '</p><p class="src">' + link(w.src) + '</p></div>';
}).join('');

/* method */
$('methodBox').innerHTML = '<ul>' + METHOD_NOTES.map(function(m){ return '<li>' + esc(m) + '</li>'; }).join('') + '</ul>';

$('promoter').innerHTML = PROMOTER ? 'Promoted by ' + esc(PROMOTER) + '.' : '<span class="need">Promoted by: add a name and contact details before this goes live.</span>';
})();
