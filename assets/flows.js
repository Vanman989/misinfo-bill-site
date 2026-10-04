/* ============ Honest Politics Party: follow the money ============
   1. gainsViz: 1986 to 2026, Rich List vs prices vs average pay.
   2. flowViz: where $11b a year goes, today vs our plan. Stream widths and
      the number of moving dots are both in proportion to the dollars.
   Needs data.js, finance.js. */
(function(){
'use strict';
function $(id){ return document.getElementById(id); }
function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function money(n){ return '$' + Math.round(n).toLocaleString('en-NZ'); }
function bn(b){ return '$' + (Math.round(b * 10) / 10).toFixed(1).replace(/\.0$/, '') + 'b'; }
function link(s){ return '<a href="' + esc(s[1]) + '" target="_blank" rel="noopener">' + esc(s[0]) + '</a>'; }
var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ======================= 1. who got the gains ======================= */
(function(){
  var el = $('gainsViz'); if (!el) return;
  var R = FACTS.richList, P = FACTS.pay;
  var rich = R.to / R.from, pay = P.to / P.from, cpi = P.cpi;
  var M = {
    nom:  { rich: rich, prices: cpi, pay: pay,
            head: 'Every $1 the Rich List had in 1986 is now <b>' + money(rich) + '</b>. Every $1 of weekly pay is now <b>$' + pay.toFixed(2) + '</b>.' },
    real: { rich: rich / cpi, prices: 1, pay: pay / cpi,
            head: 'After inflation, the Rich List grew <b>' + (rich / cpi).toFixed(1) + ' times</b>. Average pay grew about <b>' + (pay / cpi).toFixed(1) + ' times</b>: barely a third more in 40 years.' }
  };
  var mode = 'nom';
  el.innerHTML =
    '<div class="seg2" role="group" aria-label="Show figures"><button type="button" data-m="nom" aria-pressed="true">Before inflation</button><button type="button" data-m="real" aria-pressed="false">After inflation</button></div>' +
    '<p class="gvHead" id="gvHead"></p>' +
    '<div class="gvChart">' +
      col('rich', 'Rich List', '$' + R.from + 'b → $' + R.to + 'b') +
      col('prices', 'Prices', 'what things cost') +
      col('pay', 'Average pay', '$' + P.from + ' → ' + money(P.to) + ' a week') +
    '</div>' +
    '<p class="gvFoot">If average pay had grown like the Rich List, it would be <b>' + money(Math.round(P.from * rich / 100) * 100) + ' a week</b>. It is ' + money(P.to) + '.</p>' +
    '<p class="src">' + link(R.src) + ' · ' + link(P.src) + ' · ' + link(P.src2) + '. 1986 pay and the price rise (×' + cpi + ') are estimates.</p>';
  function col(k, name, sub){
    return '<div class="gvCol"><div class="gvBarWrap"><div class="gvBar gv-' + k + '" data-k="' + k + '"></div><b class="gvVal" data-k="' + k + '"></b></div><span class="gvName">' + name + '</span><small>' + sub + '</small></div>';
  }
  var shown = false;
  function draw(){
    var m = M[mode], max = M.nom.rich;
    $('gvHead').innerHTML = m.head;
    el.querySelectorAll('.gvBar').forEach(function(b){
      var v = m[b.dataset.k];
      b.style.transform = 'scaleY(' + (shown ? Math.max(0.012, v / max * 0.85) : 0) + ')';
    });
    el.querySelectorAll('.gvVal').forEach(function(b){
      var v = m[b.dataset.k];
      b.textContent = (v >= 10 ? Math.round(v) : v.toFixed(1)) + '×';
      b.style.bottom = 'calc(' + (shown ? Math.max(0.012, v / max * 0.85) * 100 : 0) + '% + 6px)';
    });
    el.querySelectorAll('.seg2 button').forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.m === mode)); });
  }
  el.querySelector('.seg2').addEventListener('click', function(e){
    var b = e.target.closest('button'); if (!b) return; mode = b.dataset.m; draw();
  });
  draw();
  if (still || !('IntersectionObserver' in window)){ shown = true; draw(); return; }
  var io = new IntersectionObserver(function(es){ if (es[0].isIntersecting){ shown = true; draw(); io.disconnect(); } }, { threshold:0.35 });
  io.observe(el);
})();

/* ======================= 2. where the money flows ======================= */
(function(){
  var el = $('moneyFlow'); if (!el) return;
  var total = FIN.totalIn;
  var D = [
    { k:'owner',  name:'The wealthiest, untaxed', cls:'d-owner',  b: total, today:true, col:'#C08A3E' },
    { k:'cut',    name:'Lower tax on work',        cls:'d-cut',    b: FIN.cut.b, col:'#1E7A55' },
    { k:'health', name:'Free GP, dental, prescriptions', cls:'d-svc', b: -FIN.moneyOut[1].b, col:'#2F5E8C' },
    { k:'fam',    name:'Family incomes',           cls:'d-svc',    b: -FIN.moneyOut[2].b, col:'#2F5E8C' },
    { k:'pt',     name:'Free transport, more trains', cls:'d-svc', b: -FIN.moneyOut[3].b, col:'#2F5E8C' },
    { k:'def',    name:'Cutting the deficit',      cls:'d-def',    b: Math.max(0, FIN.net), col:'#6F6A5E' }
  ];
  var mode = 'plan';
  el.innerHTML =
    '<div class="seg2" role="group" aria-label="Compare"><button type="button" data-m="today" aria-pressed="false">Today</button><button type="button" data-m="plan" aria-pressed="true">Our plan</button></div>' +
    '<p class="fvHead" id="fvHead" aria-live="polite"></p>' +
    '<div class="fvStage" id="fvStage"><canvas id="fvCanvas" aria-hidden="true"></canvas>' +
      '<div class="fvCols">' +
        '<div class="fvSrcCol"><div class="fchip fvSrc" id="fvSrc"><b>' + bn(total) + '</b><span>a year in gains, inheritances and windfalls that escape tax today</span></div></div>' +
        '<div class="fvMidCol"><div class="fchip fvPurse" id="fvPurse"><span>Public purse</span><b id="fvPurseAmt"></b></div></div>' +
        '<div class="fvDest" id="fvDest">' + D.map(function(d){
          return '<div class="fchip ' + d.cls + '" data-k="' + d.k + '"><span>' + esc(d.name) + '</span><b></b></div>';
        }).join('') + '</div>' +
      '</div></div>' +
    '<div class="fvYou"><label for="fvInc">Your income before tax</label><div class="fvYouRow"><span>$</span><input id="fvInc" inputmode="numeric" autocomplete="off" value="71,800"></div><p id="fvYouOut"></p></div>' +
    '<p class="src">At full strength, a year. Every figure: <a href="/finance/">the costings</a>.</p>';

  var stage = $('fvStage'), cv = $('fvCanvas'), ctx = cv.getContext('2d');
  var W = 0, H = 0, geo = null, dots = [], acc = 0, last = 0;

  function rel(node){
    var a = node.getBoundingClientRect(), s = stage.getBoundingClientRect();
    return { l:a.left - s.left, r:a.right - s.left, t:a.top - s.top, b:a.bottom - s.top, cy:(a.top + a.bottom) / 2 - s.top };
  }
  function layout(){
    var dpr = window.devicePixelRatio || 1;
    W = stage.clientWidth; H = stage.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var src = rel($('fvSrc')), purse = rel($('fvPurse'));
    var dest = {}; el.querySelectorAll('#fvDest .fchip').forEach(function(n){ dest[n.dataset.k] = rel(n); });
    var maxW = Math.min(64, (src.b - src.t) * 0.55);       // widest stream, px, for the whole $11b
    var k = maxW / total;
    // today: one stream, source to the wealthiest
    var today = [{ d:D[0], w:Math.max(3, total * k), path:[[src.r, src.t + (src.b - src.t) * 0.3], [dest.owner.l, dest.owner.cy]] }];
    // plan: source to purse, then fan out to each destination
    var plan = [], people = D.slice(1), pin = purse.cy - (people.reduce(function(a, d){ return a + d.b * k; }, 0)) / 2, pout = pin;
    people.forEach(function(d){
      var w = Math.max(2, d.b * k);
      var sy = src.t + (src.b - src.t) * 0.5 + (pin - purse.cy) + w / 2;
      plan.push({ d:d, w:w, path:[[src.r, sy], [purse.l, pin + w / 2], [purse.r, pout + w / 2], [dest[d.k].l, dest[d.k].cy]] });
      pin += d.b * k; pout += d.b * k;
    });
    geo = { today:today, plan:plan };
  }
  function bez(p0, p1, t){
    var mx = (p0[0] + p1[0]) / 2, u = 1 - t;
    return [u*u*u*p0[0] + 3*u*u*t*mx + 3*u*t*t*mx + t*t*t*p1[0], u*u*u*p0[1] + 3*u*u*t*p0[1] + 3*u*t*t*p1[1] + t*t*t*p1[1]];
  }
  function at(path, t){
    // the middle leg (through the purse) is straight; the others are curves
    var legs = path.length - 1, i = Math.min(legs - 1, Math.floor(t * legs)), lt = t * legs - i;
    var a = path[i], b = path[i + 1];
    if (legs === 3 && i === 1) return [a[0] + (b[0] - a[0]) * lt, a[1] + (b[1] - a[1]) * lt];
    return bez(a, b, lt);
  }
  function band(s, alpha){
    ctx.globalAlpha = alpha; ctx.strokeStyle = s.d.col; ctx.lineWidth = s.w; ctx.lineCap = 'butt';
    ctx.beginPath();
    for (var i = 0; i <= 60; i++){ var p = at(s.path, i / 60); if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }
    ctx.stroke(); ctx.globalAlpha = 1;
  }
  function frame(ts){
    if (!geo) return;
    var dt = last ? Math.min(0.05, (ts - last) / 1000) : 0; last = ts;
    ctx.clearRect(0, 0, W, H);
    var set = geo[mode];
    set.forEach(function(s){ band(s, 0.42); });
    if (!still){
      // dots per second in proportion to dollars: the whole $11b makes 140 a second
      acc += dt * 140;
      while (acc >= 1){
        acc -= 1;
        var r = Math.random() * total, s = set[0];
        for (var i = 0, c = 0; i < set.length; i++){ c += set[i].d.b; if (r <= c){ s = set[i]; break; } }
        dots.push({ s:s, t:0, off:(Math.random() - 0.5) * s.w * 0.8, v:0.32 + Math.random() * 0.12 });
      }
      for (var j = dots.length - 1; j >= 0; j--){
        var d = dots[j]; d.t += d.v * dt;
        if (d.t >= 1){ dots.splice(j, 1); continue; }
        var p = at(d.s.path, d.t);
        ctx.fillStyle = d.s.d.col; ctx.beginPath(); ctx.arc(p[0], p[1] + d.off, 2.8, 0, 6.283); ctx.fill();
      }
    }
    requestAnimationFrame(frame);
  }
  function setMode(m){
    mode = m;
    var plan = m === 'plan';
    el.querySelectorAll('.seg2 button').forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.m === m)); });
    $('fvHead').innerHTML = plan
      ? 'Our plan: the same <b>' + bn(total) + '</b> a year comes back to everyone. <b>' + bn(FIN.cut.b) + '</b> in lower tax on work and <b>' + bn(FIN.services) + '</b> in free health care, family incomes and transport.'
      : 'Today: <b>' + bn(total) + '</b> a year in gains, inheritances and windfalls flows to the people who own the most, and none of it is taxed.';
    $('fvPurseAmt').textContent = plan ? bn(total) : '$0';
    $('fvPurse').classList.toggle('off', !plan);
    el.querySelectorAll('#fvDest .fchip').forEach(function(n){
      var d = D.filter(function(x){ return x.k === n.dataset.k; })[0];
      var on = plan ? !d.today : d.today;
      n.classList.toggle('off', !on);
      n.querySelector('b').textContent = on ? bn(d.b) : '$0';
    });
    dots = []; acc = 0;
    you();
  }
  function you(){
    var inc = parseInt($('fvInc').value.replace(/[^0-9]/g, ''), 10) || 0;
    var d = taxOn(inc, SCHEDULES.today) - taxOn(inc, SCHEDULES.ours);
    $('fvYouOut').innerHTML = mode === 'plan'
      ? (inc > 0 ? 'You keep <b>' + money(d) + '</b> more a year in income tax, plus free GP visits, dental, prescriptions and public transport.' : 'Enter your income.')
      : 'Today you get <b>$0</b> of it.';
  }
  el.querySelector('.seg2').addEventListener('click', function(e){ var b = e.target.closest('button'); if (b) setMode(b.dataset.m); });
  $('fvInc').addEventListener('input', you);
  $('fvInc').addEventListener('blur', function(){ var v = parseInt($('fvInc').value.replace(/[^0-9]/g, ''), 10) || 0; $('fvInc').value = v.toLocaleString('en-NZ'); });
  setMode('plan');
  layout();
  if ('ResizeObserver' in window) new ResizeObserver(function(){ layout(); }).observe(stage);
  else window.addEventListener('resize', layout);
  requestAnimationFrame(frame);
})();
})();
