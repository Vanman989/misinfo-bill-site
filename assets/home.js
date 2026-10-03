/* ============ Honest Politics Party, home page ============
   All numbers come from /assets/data.js. */
(function(){
'use strict';

function $(id){ return document.getElementById(id); }
function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function money(n){ return '$' + Math.round(n).toLocaleString('en-NZ'); }
function bn(b, sign){ return (sign && b > 0 ? '+' : b < 0 ? '−' : '') + '$' + Math.abs(b).toFixed(1).replace(/\.0$/, '') + 'b'; }
function srcLinks(list){ return list.map(function(s){ return '<a href="' + esc(s[1]) + '" target="_blank" rel="noopener">' + esc(s[0]) + '</a>'; }).join(' · '); }
var BADGE = { official:'official source', party:'party costing', estimate:'estimate' };
function badge(c){ return '<span class="badge b-' + c + '">' + BADGE[c] + '</span>'; }

/* values */
$('valuesList').innerHTML = VALUES.map(function(v, i){
  return '<div class="value"><span class="n">' + (i + 1) + '</span><h3>' + esc(v.title) + '</h3><p>' + esc(v.text) + '</p></div>';
}).join('');

/* how tax works */
(function(){
  var steps = [
    ['You earn', 'Income tax comes out of your pay before you see it.', '$' + TAX_IN[0].b + 'b', ''],
    ['You spend', '15% GST on almost everything you buy.', '$' + TAX_IN[1].b + 'b', ''],
    ['Firms profit', '28% company tax on profits.', '$' + TAX_IN[2].b + 'b', ''],
    ['Assets grow', 'Sell a rental after two years, shares or a business for a gain: usually no tax at all.', '$0', 'stepRed']
  ];
  $('steps').innerHTML = steps.map(function(s, i){
    return '<div class="step ' + s[3] + '"><div class="stepN">' + (i + 1) + '</div><div><b>' + esc(s[0]) + '</b><p>' + esc(s[1]) + '</p></div><div class="stepAmt">' + esc(s[2]) + '</div></div>';
  }).join('');
  function stack(list, cls){
    var tot = list.reduce(function(a, x){ return a + x.b; }, 0);
    function op(i){ return (1 - i * (0.55 / list.length)).toFixed(2); }
    return '<div class="stack">' + list.map(function(x, i){ return '<div class="seg ' + cls + '" style="flex:' + x.b + ';opacity:' + op(i) + '" title="' + esc(x.label) + '"></div>'; }).join('') + '</div>' +
      '<ul class="legend">' + list.map(function(x, i){
        return '<li><i class="' + cls + '" style="opacity:' + op(i) + '"></i><span>' + esc(x.label) + '</span><b>$' + x.b + 'b</b><em>' + Math.round(x.b / tot * 100) + '%</em></li>';
      }).join('') + '</ul>';
  }
  $('flowViz').innerHTML =
    '<div class="flow"><h3>Where the tax comes from</h3>' + stack(TAX_IN, 'cIn') + '</div>' +
    '<div class="flow"><h3>Where the money goes</h3>' + stack(SPEND_OUT, 'cOut') + '</div>' +
    '<p class="src">Source: ' + srcLinks([BUDGET_SRC]) + ', 2026/27 forecast. Treasury’s September update lifted total tax to $' + BOOKS.taxB + 'b.</p>';
})();

/* the plan */
$('taxCards').innerHTML = TAX_PLAN.map(function(t){
  return '<article class="card">' +
    '<div class="cardTop"><h3>' + esc(t.title) + '</h3><span class="amt ' + (t.b >= 0 ? 'amtUp' : 'amtDown') + '">' + bn(t.b, true) + '<small>a year</small></span></div>' +
    '<p class="plain">' + esc(t.plain) + '</p>' +
    '<dl><dt>Who</dt><dd>' + esc(t.who) + '</dd><dt>Why</dt><dd>' + esc(t.why) + '</dd><dt>Money</dt><dd>' + esc(t.money) + ' ' + esc(t.working) + ' ' + badge(t.confidence) + '</dd></dl>' +
    '<p class="src">' + srcLinks(t.src) + '</p></article>';
}).join('');
$('notChosen').innerHTML = '<h3>' + esc(NOT_CHOSEN.title) + '</h3><p>' + esc(NOT_CHOSEN.text) + '</p><p class="src">' + srcLinks(NOT_CHOSEN.src) + '</p>';

/* your tax */
var PLAN_BANDS = [[5000,0]].concat(TODAY_BANDS);
function taxOn(inc, bands){
  var t = 0, lo = 0;
  for (var i = 0; i < bands.length; i++){ var hi = bands[i][0]; if (inc > lo) t += (Math.min(inc, hi) - lo) * bands[i][1] / 100; lo = hi; }
  return t;
}
function updateCalc(inc){
  var now = taxOn(inc, TODAY_BANDS), plan = taxOn(inc, PLAN_BANDS), d = now - plan;
  $('calcOut').innerHTML =
    '<div class="cmp"><div><span>Income tax today</span><b>' + money(now) + '</b></div><div><span>Under our plan</span><b class="g">' + money(plan) + '</b></div></div>' +
    '<div class="keep">' + (inc > 0 ? 'You keep <b>' + money(d) + '</b> more a year, from day one.' : 'Enter your income.') + '</div>' +
    '<p class="body">And if you sell anything for more than you paid, the gain is added to your income for that year and taxed at your normal rate, the same as wages.</p>' +
    '<p class="src">Today: IRD rates from 1 April 2025, before ACC levy and tax credits.</p>';
}
(function(){
  var t = $('inc'), r = $('incR');
  function val(){ return parseInt(t.value.replace(/[^0-9]/g, ''), 10) || 0; }
  t.addEventListener('input', function(){ r.value = Math.min(val(), +r.max); updateCalc(val()); });
  t.addEventListener('blur', function(){ t.value = val().toLocaleString('en-NZ'); });
  r.addEventListener('input', function(){ t.value = (+r.value).toLocaleString('en-NZ'); updateCalc(+r.value); });
  updateCalc(60000);
})();

/* myths */
$('mythList').innerHTML = MYTHS.map(function(m, i){
  return '<article class="myth"><div class="mythQ"><small>Myth ' + (i + 1) + '</small><p>“' + esc(m.myth) + '”</p></div>' +
    '<div class="mythA"><h3>' + esc(m.truth) + '</h3><p>' + esc(m.text) + '</p>' + (m.eg ? '<div class="eg">' + esc(m.eg) + '</div>' : '') +
    '<p class="src">' + srcLinks(m.src) + '</p></div></article>';
}).join('');

/* AI */
$('aiStats').innerHTML = AI_FACTS.map(function(a){
  return '<div class="aiStat"><b>' + esc(a.big) + '</b><p>' + esc(a.text) + '</p><p class="src">' + srcLinks(a.src) + '</p></div>';
}).join('');

/* families */
$('famCards').innerHTML = POLICIES.map(function(p){
  return '<article class="card">' +
    '<div class="cardTop"><h3>' + esc(p.title) + '</h3><span class="amt ' + (p.b > 0 ? 'amtUp' : p.b < 0 ? 'amtDown' : 'amtZero') + '">' + esc(p.costLabel) + '</span></div>' +
    '<p class="plain">' + esc(p.plain) + '</p>' +
    '<p class="ev"><b>Evidence:</b> ' + esc(p.evidence) + (p.working ? ' ' + esc(p.working) : '') + '</p>' +
    '<p class="src">' + srcLinks(p.src) + '</p></article>';
}).join('');

/* the books + ledger */
(function(){
  var B = BOOKS, w = B.taxB / B.spendB * 100;
  $('booksViz').innerHTML =
    '<div class="bigs">' +
      '<div class="big"><span>Tax collected</span><b>$' + B.taxB + 'b</b><i>' + B.year + '</i></div>' +
      '<div class="big"><span>Spending</span><b>$' + B.spendB + 'b</b><i>' + B.year + '</i></div>' +
      '<div class="big bigRed"><span>Deficit</span><b>−$' + Math.abs(B.obegalB) + 'b</b><i>after other income</i></div>' +
    '</div>' +
    '<div class="pair">' +
      '<div class="pairRow"><span>In</span><div class="pairTrack"><div class="pairBar pIn" style="width:' + w.toFixed(1) + '%"></div></div></div>' +
      '<div class="pairRow"><span>Out</span><div class="pairTrack"><div class="pairBar pOut" style="width:100%"></div></div></div>' +
    '</div>' +
    '<p class="body">Net debt is <b>$' + B.netDebtB + 'b</b>, ' + B.netDebtPctGdp + '% of everything New Zealand produces in a year. Fees, investment returns and other income cover part of the difference between tax and spending, leaving the official deficit of $' + Math.abs(B.obegalB) + 'b.</p>' +
    '<p class="src">Source: ' + srcLinks([B.source]) + ', Table 2.1</p>';

  var rows = TAX_PLAN.map(function(t){ return [t.title, t.b]; })
    .concat(POLICIES.filter(function(p){ return p.b && !p.longRun; }).map(function(p){ return [p.title, p.b]; }));
  var net = rows.reduce(function(a, r){ return a + r[1]; }, 0);
  var sup = POLICIES.filter(function(p){ return p.longRun; })[0];
  var gap = Math.abs(BOOKS.obegalB);
  var cgtEarly = 8.3 / 5, early = net - TAX_PLAN[0].b + cgtEarly;
  $('ledger').innerHTML =
    '<table class="ledger"><tbody>' + rows.map(function(r){
      return '<tr><td>' + esc(r[0]) + '</td><td class="' + (r[1] >= 0 ? 'up' : 'down') + '">' + bn(r[1], true) + '</td></tr>';
    }).join('') +
    '<tr class="tot"><td>Every year, at full strength</td><td class="up">' + bn(net, true) + '</td></tr>' +
    '<tr><td>Later: linking the pension age to life expectancy</td><td class="up">' + bn(sup.b, true) + '</td></tr>' +
    '</tbody></table>' +
    '<div class="gap"><div class="gapLbl">This year’s $' + gap + 'b deficit, and how much of it the plan closes</div>' +
      '<div class="gapTrack"><div class="gapA" style="width:' + (net / gap * 100).toFixed(1) + '%"></div><div class="gapB" style="width:' + (sup.b / gap * 100).toFixed(1) + '%"></div></div>' +
      '<div class="gapKey"><span><i class="kA"></i>full-strength plan ' + bn(net) + '</span><span><i class="kB"></i>pension age link, later ' + bn(sup.b) + '</span></div></div>' +
    '<p class="body">At full strength the plan adds about <b>' + bn(net) + '</b> a year to the books while cutting income tax for every worker. In the first years, while the capital gains tax builds up (about $' + cgtEarly.toFixed(1) + 'b a year), it comes out at about ' + bn(early) + ': roughly break-even, so the tax cut is never paid for by borrowing.</p>' +
    '<p class="src">Sums of the costings above, each with its own source. GDP of about $' + BOOKS.gdpB + 'b is derived from Treasury’s own tax-to-GDP ratio.</p>';
})();

/* bills */
$('billList').innerHTML = BILLS.map(function(b){
  return '<a class="billCard" href="' + esc(b.href) + '"><span class="st">' + esc(b.status) + '</span><h3>' + esc(b.title) + '</h3><p>' + esc(b.text) + '</p><span class="go">' + esc(b.cta) + ' →</span></a>';
}).join('');

/* reading */
$('readingList').innerHTML = READING.map(function(r){
  return '<a class="book" href="' + esc(r.url) + '" target="_blank" rel="noopener"><b>' + esc(r.title) + '</b><span>' + esc(r.who) + '</span><p>' + esc(r.took) + '</p></a>';
}).join('');

/* promoter statement */
$('promoter').innerHTML = PROMOTER ? 'Promoted by ' + esc(PROMOTER) + '.' : '<span class="need">Promoted by: add a name and contact details before this goes live.</span>';
})();
