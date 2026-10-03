/* ============================================================
   The Tax River, app.js
   Particle engine ported from the tax-lab A+ prototype.
   EVERY displayed number comes from ./data.js.
   ============================================================ */
(function(){
'use strict';

/* ================= theme =================
   Default is THE PAPER (light editorial). ?theme=dark restores the
   midnight edition. CSS reads html[data-theme="dark"]; the canvas
   engine reads THEME_DARK below. */
var THEME_DARK = (function(){
  try { return new URLSearchParams(location.search).get('theme') === 'dark'; }
  catch(e){ return false; }
})();
if (THEME_DARK){
  document.documentElement.dataset.theme = 'dark';
  var _mc = document.querySelector('meta[name="theme-color"]');
  if (_mc) _mc.setAttribute('content', '#0E1522');
}

var stage = document.getElementById('stage');
if (typeof REVENUE === 'undefined' || typeof HISTORY === 'undefined' ||
    typeof BRACKETS === 'undefined' || typeof PARTIES === 'undefined'){
  stage.insertAdjacentHTML('beforeend',
    '<div class="dataerr">Could not load ./data.js, serve this folder statically.</div>');
  return;
}

/* ================= helpers ================= */
function clamp01(v){ return v < 0 ? 0 : (v > 1 ? 1 : v); }
function lerp(a,b,t){ return a + (b-a)*t; }
function ease(u){ return u < 0.5 ? 4*u*u*u : 1 - Math.pow(-2*u+2,3)/2; }
function mulberry(a){
  return function(){
    a |= 0; a = a + 0x6D2B79F5 | 0;
    var t = Math.imul(a ^ a>>>15, 1 | a);
    t = t + Math.imul(t ^ t>>>7, 61 | t) ^ t;
    return ((t ^ t>>>14) >>> 0) / 4294967296;
  };
}
function esc(s){
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function fmtB(b){
  var v = Math.round(b*10)/10;
  return '$' + (v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)) + 'B';
}

/* ================= hero stat (from THE311) ================= */
document.getElementById('heroStat').innerHTML =
  '<div class="fo foThem"><b>' + THE311.medianEffectiveRate + '%</b><span>the ' + THE311.families +
    ' wealthiest families</span><i>pay on all their income</i></div>' +
  '<div class="foVs">vs</div>' +
  '<div class="fo foUs"><b>' + THE311.comparatorWageEarner + '%</b><span>a nurse on $80k</span>' +
    '<i>pays on their wages</i></div>' +
  '<p class="foNote">Effective tax rates, IRD High-Wealth Individuals study 2023</p>';

/* ================= rotating hero questions ================= */
(function(){
  var slEl = document.getElementById('slogan');
  if (!slEl) return;
  var MED = 71760;                                   /* Stats NZ median wage/salary, FTE, June 2025 */
  var bil = Math.round(1e9 / MED / 1000) * 1000;     /* ≈ 14,000 */
  var tril = Math.round(1e12 / MED / 1e6);           /* ≈ 14 (million) */
  var Q = [
    'Why should having more mean you contribute&nbsp;<em>less</em>?',
    'Why should having more money mean <em>more ways to pay less tax</em>?',
    'Does a billionaire work <em>' + bil.toLocaleString('en-NZ') + '&times;</em> harder than someone on the median wage?',
    'Would a trillionaire work <em>' + tril + ' million&times;</em> harder?',
    'Are they working harder? Smarter? More <em>deserving</em>?',
    'Or just people, like the rest of us, trying to raise a family and enjoy&nbsp;life?'
  ];
  var i = 0, paused = false;
  var RMq = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  slEl.addEventListener('mouseenter', function(){ paused = true; });
  slEl.addEventListener('mouseleave', function(){ paused = false; });
  function tick(){
    if (paused || document.hidden) return;
    i = (i + 1) % Q.length;
    /* wrap in a span: the slogan is a flex container and bare text + <em>
       become separate flex items, which swallows the space between them */
    if (RMq){ slEl.innerHTML = '<span>' + Q[i] + '</span>'; return; }
    slEl.style.opacity = '0';
    setTimeout(function(){ slEl.innerHTML = '<span>' + Q[i] + '</span>'; slEl.style.opacity = '1'; }, 340);
  }
  setInterval(tick, 5200);
})();

/* ================= engine config (prototype) ================= */
var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var SAMP = 64, MAXP = 2600;
var cv = document.getElementById('cv');
var ctx = cv.getContext('2d');
var overlay = document.getElementById('overlay');
var W = 0, H = 0, dpr = 1, sf = 1, mobile = false;

/* canvas theme: paper = flat ink ribbons + multiply "ink on newsprint"
   particles; dark = the original additive-glow set. */
var KCOL = THEME_DARK ? {
  'in':     { under:'#0E4634', underA:0.50, core:'#23C08B', coreA:0.30 },
  'out':    { under:'#2E2A5E', underA:0.50, core:'#8B7CF6', coreA:0.28 },
  'gold':   { under:'#7A5405', underA:0.62, core:'#F5B72F', coreA:0.34 },
  'goldin': { under:'#7A5405', underA:0.55, core:'#F5B72F', coreA:0.30 }
} : {
  'in':     { under:'#DCE8E2', underA:0.90, core:'#2C5E4E', coreA:0.85 },
  'out':    { under:'#DEE9F0', underA:0.90, core:'#3B6E8F', coreA:0.85 },
  'gold':   { under:'#EAD9B8', underA:0.92, core:'#A8763C', coreA:0.88 },
  'goldin': { under:'#EAD9B8', underA:0.88, core:'#A8763C', coreA:0.82 }
};
/* additive glow is invisible on paper, multiply deepens like ink instead */
var COMP      = THEME_DARK ? 'lighter' : 'multiply';
var GLYPH_COL = THEME_DARK ? '#FFE08A' : '#7A5405';
var PULSE_A   = THEME_DARK ? 0.9  : 0.35;   /* pulse alpha boost (multiply darkens, keep it gentle on paper) */
var PULSE_S   = THEME_DARK ? 0.3  : 0.15;   /* pulse size boost */
var KIND = {
  'in':     { rate:13, speed:62,  size:6.0,  bMin:1.5, bMax:30 },
  'out':    { rate:11, speed:62,  size:6.4,  bMin:1.5, bMax:24 },
  'gold':   { rate:50, speed:100, size:12.0, bMin:2.5, bMax:52 },
  'goldin': { rate:24, speed:88,  size:8.5,  bMin:1.5, bMax:14 }
};
var LAYERS = [
  { scale:3.4,  alpha:0.13, speed:0.45, par:0.35, spread:2.6 },
  { scale:1.0,  alpha:0.55, speed:1.0,  par:0.80, spread:0.95 },
  { scale:0.62, alpha:0.95, speed:1.55, par:1.50, spread:0.5 }
];

/* sprites: dark = glow trios with white-hot cores (additive);
   paper = ink-dot radial gradients, solid deep centre fading out,
   NO white core (white cores only make sense under 'lighter'). */
function makeSprite(inner, mid, outer){
  var s = 64, c = document.createElement('canvas');
  c.width = s; c.height = s;
  var g = c.getContext('2d');
  var grad = g.createRadialGradient(s/2, s/2, 0, s/2, s/2, s/2);
  grad.addColorStop(0, inner);
  grad.addColorStop(0.22, mid);
  grad.addColorStop(1, outer);
  g.fillStyle = grad;
  g.fillRect(0, 0, s, s);
  return c;
}
var SPR = THEME_DARK ? {
  'in':   [ makeSprite('rgba(230,255,245,.95)','rgba(35,192,139,.55)','rgba(35,192,139,0)'),
            makeSprite('rgba(255,255,255,1)','rgba(127,224,189,.8)','rgba(127,224,189,0)') ],
  'out':  [ makeSprite('rgba(240,236,255,.95)','rgba(139,124,246,.55)','rgba(139,124,246,0)'),
            makeSprite('rgba(255,255,255,1)','rgba(191,180,255,.8)','rgba(191,180,255,0)') ],
  'gold': [ makeSprite('rgba(255,244,214,.95)','rgba(245,183,47,.6)','rgba(245,183,47,0)'),
            makeSprite('rgba(255,255,255,1)','rgba(255,224,138,.85)','rgba(255,224,138,0)') ]
} : {
  'in':   [ makeSprite('rgba(44,94,78,.50)','rgba(44,94,78,.30)','rgba(44,94,78,0)'),
            makeSprite('rgba(44,94,78,.62)','rgba(44,94,78,.42)','rgba(44,94,78,0)') ],
  'out':  [ makeSprite('rgba(59,110,143,.50)','rgba(59,110,143,.30)','rgba(59,110,143,0)'),
            makeSprite('rgba(59,110,143,.62)','rgba(59,110,143,.42)','rgba(59,110,143,0)') ],
  'gold': [ makeSprite('rgba(168,118,60,.52)','rgba(168,118,60,.32)','rgba(168,118,60,0)'),
            makeSprite('rgba(122,84,5,.60)','rgba(168,118,60,.40)','rgba(168,118,60,0)') ]
};
SPR.goldin = SPR.gold;

/* ================= data shortcuts ================= */
var IND = REVENUE.streams[0];       /* Income tax (people) 51.1% */
var GST = REVENUE.streams[1];
var CO  = REVENUE.streams[2];
var OTH = REVENUE.streams[3];
var NOW_ERA = HISTORY.filter(function(e){ return e.id === 'now'; })[0];
function sh(p){ return clamp01(p / 26); }   /* revenue-share % -> stream weight */

/* ================= stream superset =================
   Order = slot order in the left column when visible. */
var SRC_STREAMS = [];
BRACKETS.forEach(function(br){
  SRC_STREAMS.push({ id: br.id, type:'bracket', br: br, slotW: 1.35 });
});
SRC_STREAMS.push({ id:'incometax', type:'histBig', slotW: 1.5 });
SRC_STREAMS.push({ id:'socsec',    type:'simple', nm:'Social security tax', subt:'Social Security Act 1938', slotW: 0.9 });
SRC_STREAMS.push({ id:'customs',   type:'simple', nm:'Customs duties', subt:'over 60% alcohol & tobacco', slotW: 1.0 });
SRC_STREAMS.push({ id:'landtax',   type:'simple', nm:'Land tax', subt:'NZ’s first direct tax on wealth', slotW: 0.9 });
SRC_STREAMS.push({ id:'deathduty', type:'simple', nm:'Death duties', subt:'since 1866', slotW: 0.9 });
SRC_STREAMS.push({ id:'gst',       type:'gst', slotW: 1.0 });
SRC_STREAMS.push({ id:'company',   type:'simple', nm: CO.label, amt: fmtB(CO.b), pct: CO.pct + '%', slotW: 0.95 });
SRC_STREAMS.push({ id:'other',     type:'simple', nm: OTH.label, amt: fmtB(OTH.b), pct: OTH.pct + '%', slotW: 0.85 });
var SRC_BY_ID = {};
SRC_STREAMS.forEach(function(s){
  SRC_BY_ID[s.id] = s;
  s.x = 0; s.y = 0; s.fx = 0; s.fy = 0; s.tx = 0; s.ty = 0;
  s.visIdx = 0; s.visN = 1; s.moved = false;
});

/* pipe registry: fixed indices so live particles survive re-plumbing */
var pipes = [], pipeIdx = {}, PIPE_DEFS = [];
SRC_STREAMS.forEach(function(s){ PIPE_DEFS.push({ id: s.id, kind:'in' }); });
PIPE_DEFS.push({ id:'wpaid', kind:'in' });      /* the ~20% the wealthy do pay */
PIPE_DEFS.push({ id:'wtax',  kind:'goldin' });  /* party wealth-tax stream */
PIPE_DEFS.push({ id:'gold',  kind:'gold' });    /* the villain river */
SPENDING.sinks.forEach(function(s){ PIPE_DEFS.push({ id:'out-' + s.id, kind:'out' }); });
PIPE_DEFS.forEach(function(d, i){ pipeIdx[d.id] = i; pipes.push(null); });
var ALL_KEYS = PIPE_DEFS.map(function(d){ return d.id; });

/* ================= overlay DOM ================= */
var nodeEls = {}, headLSub, irdName, irdSub, wtaxLblEl, wealthySubEl;

function el(cls, html){
  var d = document.createElement('div');
  d.className = cls;
  d.innerHTML = html;
  overlay.appendChild(d);
  return d;
}

function buildOverlay(){
  /* column headers */
  nodeEls.headL = el('colHead',
    'Where the money comes from<i id="headLSub"></i>');
  nodeEls.headR = el('colHead',
    'What we all get<i class="hideHist">' + fmtB(SPENDING.totalB) + ' · ' + esc(SPENDING.year) + '</i>');
  nodeEls.spendNote = el('spendNote', esc(SPENDING.note));
  headLSub = document.getElementById('headLSub');

  /* source stream cards */
  SRC_STREAMS.forEach(function(s){
    var d = document.createElement('div');
    d.className = 'node scard off';
    if (s.type === 'bracket'){
      var br = s.br;
      d.classList.add('bracket');
      d.innerHTML =
        '<div class="row1"><b class="rng">' + esc(br.range) + '</b><span class="rate">' + br.rate + '%</span></div>' +
        '<div class="shares"><b>' + br.shareTax + '%</b> of income tax<span class="sp2"> · ' + br.shareTaxpayers + '% of earners</span></div>' +
        '<div class="ppl">' + br.people.map(function(p){ return '<span>' + esc(p) + '</span>'; }).join('') + '</div>' +
        '<div class="anno"></div>';
      if (br.note) d.title = br.note;
    } else if (s.type === 'histBig'){
      d.classList.add('histBig');
      d.innerHTML = '<div class="nm">Income tax</div><div class="bigRate">0%</div><div class="subt">top rate</div>';
    } else if (s.type === 'gst'){
      d.classList.add('simple');
      d.innerHTML =
        '<span class="nm">GST</span>' +
        '<span class="amt gstModern">' + fmtB(GST.b) + '<small>' + GST.pct + '%</small></span>' +
        '<span class="amt gstHist"><span class="gstRate"></span><small>on everything</small></span>' +
        '<div class="anno"></div>';
    } else {
      d.classList.add('simple');
      d.innerHTML =
        '<span class="nm">' + esc(s.nm) + '</span>' +
        (s.amt ? '<span class="amt">' + s.amt + '<small>' + s.pct + '</small></span>' : '') +
        (s.subt ? '<span class="subt">' + esc(s.subt) + '</span>' : '');
    }
    overlay.appendChild(d);
    s.el = d;
    s.annoEl = d.querySelector('.anno');
    if (s.type === 'bracket'){
      s.parts = {
        rng: d.querySelector('.rng'), rate: d.querySelector('.rate'),
        shares: d.querySelector('.shares'), ppl: d.querySelector('.ppl')
      };
    }
  });

  /* IRD */
  nodeEls.ird = el('node card ird',
    '<span class="em">🏛️</span><b id="irdName"></b><i id="irdSub"></i>');
  irdName = document.getElementById('irdName');
  irdSub  = document.getElementById('irdSub');

  /* sinks */
  SPENDING.sinks.forEach(function(s){
    nodeEls['sink-' + s.id] = el('node chipN sinkN',
      '<span class="em">' + s.emoji + '</span><span class="tx"><b>' + esc(s.label) +
      '</b><i class="money">' + fmtB(s.b) + ' · ' + s.pct + '%</i></span>');
  });

  /* the wealthy few */
  nodeEls.wealthy = el('node chipN villain',
    '<span class="em">👑</span><span class="tx"><b>The wealthy few</b><i>' +
    THE311.families + ' families · median net worth $' + THE311.medianFamilyNetWorthM + 'M</i></span>');

  /* the private vault */
  nodeEls.vault = el('node card vault',
    '<span class="em">🔐</span><b>BACK TO THEMSELVES</b>' +
    '<i class="vSub">shared with no one</i>' +
    '<div class="vRates" id="vaultRates"></div>' +
    '<span id="vaultModern">' +
      '<i class="vLine">~' + THE311.capitalGainsShare + '% of their income arrives as untaxed capital gains</i>' +
      '<i class="vLine vSmall">on the income the law can see they pay ' + THE311.medianRateOnTaxableOnly +
        '%, but ~' + THE311.capitalGainsShare + '% of it is invisible to the law</i>' +
    '</span>' +
    '<i class="vLine" id="vaultEra" hidden></i>' +
    '<i class="vLine vParty" id="vaultParty" hidden></i>' +
    '<i class="vLine vParty" id="vaultPartyRate" hidden></i>');
  wealthySubEl = nodeEls.wealthy.querySelector('i');

  /* wealth summary strip above the IRD */
  nodeEls.wstrip = el('node wstrip', '<b id="wsTop"></b><i id="wsSub"></i>');

  /* wealth-tax pipe label (party mode) */
  wtaxLblEl = el('node wtaxLbl off', '');
}
/* ================= pipes ================= */
function bez(p0, c1, c2, p1, t){
  var mt = 1 - t;
  var a = mt*mt*mt, b = 3*mt*mt*t, c = 3*mt*t*t, d = t*t*t;
  return { x: a*p0.x + b*c1.x + c*c2.x + d*p1.x,
           y: a*p0.y + b*c1.y + c*c2.y + d*p1.y };
}
function makePipe(key, kind, p0, c1, c2, p1){
  var pts = [], i, t, len = 0;
  for (i = 0; i < SAMP; i++){
    t = i / (SAMP - 1);
    pts.push(bez(p0, c1, c2, p1, t));
  }
  for (i = 0; i < SAMP; i++){
    var a = pts[Math.max(0, i-1)], b = pts[Math.min(SAMP-1, i+1)];
    var dx = b.x - a.x, dy = b.y - a.y;
    var d = Math.sqrt(dx*dx + dy*dy) || 1;
    pts[i].nx = -dy / d; pts[i].ny = dx / d;
    if (i > 0){
      var ex = pts[i].x - pts[i-1].x, ey = pts[i].y - pts[i-1].y;
      len += Math.sqrt(ex*ex + ey*ey);
    }
  }
  var path = new Path2D();
  path.moveTo(p0.x, p0.y);
  path.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, p1.x, p1.y);
  var old = pipes[pipeIdx[key]];
  return { key:key, kind:kind, pts:pts, len:Math.max(1,len), path:path,
           acc: old ? old.acc : Math.random()*0.8, curW: old ? old.curW : 3 };
}
var _s = { x:0, y:0, nx:0, ny:0 };
function sample(pipe, t){
  var f = t * (SAMP - 1);
  var i0 = f | 0;
  if (i0 >= SAMP - 1) i0 = SAMP - 2;
  var fr = f - i0;
  var a = pipe.pts[i0], b = pipe.pts[i0 + 1];
  _s.x  = a.x  + (b.x  - a.x ) * fr;
  _s.y  = a.y  + (b.y  - a.y ) * fr;
  _s.nx = a.nx + (b.nx - a.nx) * fr;
  _s.ny = a.ny + (b.ny - a.ny) * fr;
  return _s;
}

/* ================= layout ================= */
var nodes = {};
/* Mobile layout is anchored in PIXELS, not fractions of the stage, so the stage
   can shrink to hug its content, and grow only when the vault grows. */
var MOB = { row0:96, pitch:92, cardH:78, irdGap:140, sinkGap:126, sinkPitch:82,
            sinkH:46, vaultGap:16, pad:14, min:700 };
var curVisN = 8;   /* visible source streams, drives the wealthy-few slot */

function mobileGeom(){
  var rowsSrc = Math.ceil((curVisN + 1) / 3);        /* +1 = the wealthy-few slot */
  var srcBottom = MOB.row0 + (rowsSrc - 1) * MOB.pitch + MOB.cardH / 2;
  var irdY  = srcBottom + MOB.irdGap;
  var sink1 = irdY + MOB.sinkGap;
  var sink2 = sink1 + MOB.sinkPitch;
  var vaultH = (nodeEls.vault && nodeEls.vault.offsetHeight) || 200;
  var vaultY = sink2 + MOB.sinkH / 2 + MOB.vaultGap + vaultH / 2;
  return { rowsSrc:rowsSrc, irdY:irdY, sink1:sink1, sink2:sink2, vaultY:vaultY,
           H: Math.max(MOB.min, Math.round(vaultY + vaultH / 2 + MOB.pad)) };
}
/* size the stage to its content (mobile) before any measuring happens */
function sizeStage(){
  if (window.innerWidth < 820){
    var want = mobileGeom().H;
    if (Math.abs(stage.clientHeight - want) > 1) stage.style.height = want + 'px';
  } else if (stage.style.height){
    stage.style.height = '';
  }
}

function setNodeXY(elm, x, y){
  elm.style.left = x + 'px';
  elm.style.top  = y + 'px';
}

function fixedLayout(){
  if (!mobile){
    nodes.ird     = { x: W*0.50,  y: H*0.42 };
    nodes.wealthy = { x: W*0.115, y: H*0.945 };
    /* bottom-anchored: the card grows upward when party lines appear */
    /* clamp so the 344px vault never runs past the stage's right edge on 820-1273px stages */
    nodes.vault   = { x: Math.min(W*0.865, W - nodeEls.vault.offsetWidth / 2 - 10), y: H - Math.max(118, nodeEls.vault.offsetHeight / 2 + 14) };
    SPENDING.sinks.forEach(function(s, i){
      nodes['sink-' + s.id] = { x: W*0.872, y: H*(0.132 + i*0.054) };
    });
    setNodeXY(nodeEls.headL, Math.max(W*0.115, 172), H*0.028);
    setNodeXY(nodeEls.headR, W*0.872, H*0.040);
    setNodeXY(nodeEls.spendNote, W*0.872, H*0.083);
  } else {
    var g = mobileGeom();
    nodes.ird     = { x: W*0.44, y: g.irdY };
    /* wealthy few takes the next free grid slot, right of Fuel/RUC in NOW */
    var wrow = Math.floor(curVisN / 3), wcol = curVisN % 3;
    nodes.wealthy = { x: W * (wcol === 0 ? 0.5 : [0.18, 0.5, 0.82][wcol]),
                      y: MOB.row0 + wrow * MOB.pitch };
    /* vault sits BELOW the spending rows and grows downward (Jeremy) */
    nodes.vault   = { x: W*0.55, y: g.vaultY };
    var kx = [0.135, 0.375, 0.615, 0.855];
    SPENDING.sinks.forEach(function(s, i){
      nodes['sink-' + s.id] = { x: W * kx[i % 4], y: i < 4 ? g.sink1 : g.sink2 };
    });
    setNodeXY(nodeEls.headL, W*0.5, 20);
    setNodeXY(nodeEls.headR, W*0.5, g.sink1 - 48);
    setNodeXY(nodeEls.spendNote, W*0.5, H*0.762);
  }
  setNodeXY(nodeEls.ird, nodes.ird.x, nodes.ird.y);
  setNodeXY(nodeEls.wstrip, nodes.ird.x, nodes.ird.y - (mobile ? 92 : 106));
  setNodeXY(nodeEls.wealthy, nodes.wealthy.x, nodes.wealthy.y);
  setNodeXY(nodeEls.vault, nodes.vault.x, nodes.vault.y);
  SPENDING.sinks.forEach(function(s){
    var n = nodes['sink-' + s.id];
    setNodeXY(nodeEls['sink-' + s.id], n.x, n.y);
  });

  /* fixed pipes: gold, wpaid, wtax, sinks */
  var wl = nodes.wealthy, vt = nodes.vault, ird = nodes.ird;
  if (!mobile){
    pipes[pipeIdx.gold] = makePipe('gold', 'gold',
      { x: wl.x + 95, y: wl.y - 2 },
      { x: W*0.36, y: H*0.952 },
      { x: W*0.62, y: H*0.938 },
      { x: vt.x - 135, y: vt.y + 8 });
    pipes[pipeIdx.wpaid] = makePipe('wpaid', 'in',
      { x: wl.x + 82, y: wl.y - 22 },
      { x: W*0.30, y: H*0.74 },
      { x: ird.x - 170, y: ird.y + 130 },
      { x: ird.x - 74, y: ird.y + 44 });
    pipes[pipeIdx.wtax] = makePipe('wtax', 'goldin',
      { x: wl.x + 82, y: wl.y - 34 },
      { x: W*0.33, y: H*0.66 },
      { x: ird.x - 150, y: ird.y + 98 },
      { x: ird.x - 62, y: ird.y + 32 });
    SPENDING.sinks.forEach(function(s, i){
      var a = nodes['sink-' + s.id];
      var p0 = { x: ird.x + 88, y: ird.y + (i - 3.5) * 9 };
      var p1 = { x: a.x - 70, y: a.y };
      var midX = lerp(p0.x, p1.x, 0.5);
      pipes[pipeIdx['out-' + s.id]] = makePipe('out-' + s.id, 'out',
        p0, { x: midX, y: p0.y }, { x: midX, y: p1.y }, p1);
    });
  } else {
    pipes[pipeIdx.gold] = makePipe('gold', 'gold',
      { x: wl.x + 20, y: wl.y + 26 },
      { x: W*0.975, y: lerp(wl.y, vt.y, 0.42) },
      { x: W*0.98,  y: vt.y - 100 },
      { x: vt.x + 92, y: vt.y - 12 });
    pipes[pipeIdx.wpaid] = makePipe('wpaid', 'in',
      { x: wl.x - 52, y: wl.y + 14 },
      { x: W*0.50, y: lerp(wl.y, ird.y, 0.40) },
      { x: ird.x + 90, y: ird.y - 90 },
      { x: ird.x + 52, y: ird.y - 42 });
    pipes[pipeIdx.wtax] = makePipe('wtax', 'goldin',
      { x: wl.x - 52, y: wl.y + 26 },
      { x: W*0.54, y: lerp(wl.y, ird.y, 0.52) },
      { x: ird.x + 110, y: ird.y - 66 },
      { x: ird.x + 62, y: ird.y - 26 });
    SPENDING.sinks.forEach(function(s, i){
      var a = nodes['sink-' + s.id];
      var p0 = { x: ird.x + (i - 3.5) * 10, y: ird.y + 44 };
      var p1 = { x: a.x, y: a.y - 26 };
      var midY = lerp(p0.y, p1.y, 0.55);
      pipes[pipeIdx['out-' + s.id]] = makePipe('out-' + s.id, 'out',
        p0, { x: p0.x, y: midY }, { x: p1.x, y: midY }, p1);
    });
  }
}

function rebuildSourcePipe(s){
  var ird = nodes.ird;
  var fan = (s.visIdx - (s.visN - 1) / 2);
  var p0, p1, c1, c2;
  if (!mobile){
    p0 = { x: s.x + 106, y: s.y };
    p1 = { x: ird.x - 90, y: ird.y + fan * 11 };
    var midX = lerp(p0.x, p1.x, 0.5);
    c1 = { x: midX, y: p0.y }; c2 = { x: midX, y: p1.y };
  } else {
    p0 = { x: s.x, y: s.y + 28 };
    p1 = { x: ird.x + fan * 10, y: ird.y - 46 };
    var midY = lerp(p0.y, p1.y, 0.5);
    c1 = { x: p0.x, y: midY }; c2 = { x: p1.x, y: midY };
  }
  pipes[pipeIdx[s.id]] = makePipe(s.id, 'in', p0, c1, c2, p1);
}

/* place visible sources into left-column (desktop) or top-grid (mobile) slots */
function sourceTargets(vis){
  var out = {};
  if (!mobile){
    var totW = 0;
    vis.forEach(function(s){ totW += s.slotW; });
    var yFrac = 0.035;
    vis.forEach(function(s){
      var h = 0.845 * s.slotW / totW;
      out[s.id] = { x: W*0.115, y: H*(yFrac + h/2) };
      yFrac += h;
    });
  } else {
    var n = vis.length, rows = Math.ceil(n / 3);
    vis.forEach(function(s, i){
      var row = Math.floor(i / 3);
      var inRow = (row === rows - 1) ? (n - row*3) : 3;
      var colXs = inRow === 3 ? [0.18, 0.5, 0.82] : (inRow === 2 ? [0.18, 0.5] : [0.18]);
      out[s.id] = { x: W * colXs[i - row*3], y: MOB.row0 + row * MOB.pitch };
    });
  }
  return out;
}

/* ================= weights per mode ================= */
var BUILT_TONE = {
  customs:'warn', landtax:'proud', incometax:'proud', ww1:'neutral',
  welfare:'proud', golden:'proud', paye:'proud', muldoon:'warn',
  rogernomics:'warn', ruthanasia:'warn', clark:'proud', key:'warn',
  ardern:'proud', now:'warn'
};
var CUSTOMS_W = { customs:1, landtax:0.85, incometax:0.55, ww1:0.3 };
var LANDTAX_W = { landtax:0.3, incometax:0.6, ww1:0.22, welfare:0.14, golden:0.12, paye:0.10, muldoon:0.08 };

function targetsFor(mode){
  var w = {};
  ALL_KEYS.forEach(function(k){ w[k] = 0; });
  var isParty = mode.kind === 'party';
  var era = isParty ? NOW_ERA : mode.data;
  var p = isParty ? mode.data : null;
  var loophole = isParty ? p.loophole : era.loophole;
  var modern = isParty || era.id === 'now';

  if (modern){
    if (p && p.scaleCards){
      /* party proposes its own scale: split the income share across its bands
         (illustrative widths, proposed scales have no revenue-share data) */
      var N = p.scaleCards.length;
      BRACKETS.forEach(function(br, i){
        if (i >= N){ w[br.id] = 0; return; }
        var sc = p.scaleCards[i];
        if (sc.rate === '0') w[br.id] = 0.03;
        else if (i === N - 1) w[br.id] = clamp01(sh(IND.pct / N) * p.topRate / 39);
        else w[br.id] = sh(IND.pct / N);
      });
    } else {
      BRACKETS.forEach(function(br){ w[br.id] = sh(IND.pct * br.shareTax / 100); });
      if (p){
        /* keep the marked bottom-bracket card visible even when fully tax-free */
        if (p.taxFree > 0) w.b1 = Math.max(0.02, w.b1 * Math.max(0, 15600 - p.taxFree) / 15600);
        w.b5 = clamp01(w.b5 * p.topRate / 39);
      }
    }
    w.gst = sh(GST.pct) * (p && p.gstOffFood ? 0.82 : 1);
    w.company = sh(CO.pct);
    w.other = sh(OTH.pct);
    if (p && p.wealthTax > 0) w.wtax = clamp01(0.15 + p.wealthTax / 6);
  } else {
    if (era.hasIncomeTax){
      var totInc = Math.max(0.15, era.topRate / 76.5);
      if (era.scaleCards){
        /* the era's full sourced rate ladder, one stream per band, like NOW */
        var N = era.scaleCards.length;
        BRACKETS.forEach(function(br, i){
          if (i >= N){ w[br.id] = 0; return; }
          var sc = era.scaleCards[i];
          w[br.id] = sc.rate === '0' ? 0.03 : Math.max(0.05, totInc / N);
        });
      } else {
        w.incometax = totInc;
      }
    }
    if (CUSTOMS_W[era.id]) w.customs = CUSTOMS_W[era.id];
    if (era.hasLandTax) w.landtax = LANDTAX_W[era.id] || 0.1;
    if (era.hasDeathDuty) w.deathduty = 0.14;
    if (era.hasSocialSecurity) w.socsec = 0.3;
    if (era.gst > 0) w.gst = sh(era.gst / 15 * GST.pct);
  }
  w.gold = loophole;
  w.wpaid = 0.05 + 0.18 * (1 - loophole);
  SPENDING.sinks.forEach(function(s){ w['out-' + s.id] = modern ? sh(s.pct) : 0.35; });
  return { w:w, modern:modern, era:era, party:p, loophole:loophole };
}

/* ================= particle pool ================= */
var P = [], free = [];
(function(){
  for (var i = 0; i < MAXP; i++){
    P.push({ on:false, pipe:0, t:0, tSpeed:0, layer:1, size:4, alpha:0.7,
             offFrac:0, wobF:1, phase:0, glyph:false, spr:null });
    free.push(i);
  }
})();

function spawnP(pi, t0){
  if (!free.length) return;
  var pipe = pipes[pi];
  if (!pipe) return;
  var p = P[free.pop()];
  var kd = KIND[pipe.kind];
  var w = clamp01(Wcur[pipe.key] || 0);
  var r = Math.random();
  p.layer = r < 0.22 ? 0 : (r < 0.88 ? 1 : 2);
  var lp = LAYERS[p.layer];
  p.on = true;
  p.pipe = pi;
  p.t = t0;
  p.tSpeed = (kd.speed * (0.7 + Math.random()*0.7) * lp.speed * sf) / pipe.len;
  p.size = kd.size * (0.7 + Math.random()*0.8) * (0.55 + 0.5*w) * sf;
  p.offFrac = (Math.random() - 0.5) * lp.spread;
  p.wobF = 0.8 + Math.random()*1.6;
  p.phase = Math.random()*6.283;
  p.alpha = (pipe.kind === 'gold' || pipe.kind === 'goldin') ? 0.85 : 0.7;
  p.glyph = false;
  p.spr = p.layer === 2 ? SPR[pipe.kind][1] : SPR[pipe.kind][0];
  if (pipe.kind === 'gold' && p.layer === 1 && Math.random() < 0.05 * (0.25 + 0.75 * w)){
    p.glyph = true;
    p.size *= 1.6;
    p.spr = SPR.gold[1];
  }
}

/* ================= mode state + tween ================= */
var curMode = null, curModeId = '';
var Wcur = {}, Wfrom = {}, Wto = {};
ALL_KEYS.forEach(function(k){ Wcur[k] = 0; Wfrom[k] = 0; Wto[k] = 0; });
var tween = { active:false, t0:0, dur:620 };
var movedSrcs = [];
var pulse = 0;
var chipEls = {};

function applyCardState(t){
  var era = t.era, p = t.party;
  stage.classList.toggle('hist', !t.modern);

  if (t.modern){
    irdName.textContent = 'IRD';
    irdSub.textContent = 'collects ' + fmtB(REVENUE.totalB) + ', ' + REVENUE.year;
    headLSub.textContent = REVENUE.year;
  } else {
    irdName.textContent = 'The public purse';
    irdSub.textContent = era.years;
    headLSub.textContent = era.years;
  }

  /* historical single income-tax card: top rate BIG */
  var it = SRC_BY_ID.incometax;
  it.el.querySelector('.bigRate').textContent = era.topRate + '%';
  /* historical GST card rate */
  var gstEl = SRC_BY_ID.gst.el;
  gstEl.querySelector('.gstRate').textContent = era.gst + '%';

  /* party annotations on the NOW river */
  SRC_STREAMS.forEach(function(s){
    if (s.annoEl){ s.annoEl.classList.remove('on'); s.annoEl.textContent = ''; }
  });
  if (p){
    if (p.taxFree > 0){
      var a1 = SRC_BY_ID.b1.annoEl;
      a1.textContent = 'first $' + (p.taxFree/1000) + 'k tax-free';
      a1.classList.add('on');
    }
    if (p.topRate !== 39){
      var a5 = SRC_BY_ID.b5.annoEl;
      a5.textContent = 'top rate ' + p.topRate + '%';
      a5.classList.add('on');
    }
    if (p.gstOffFood){
      var ag = SRC_BY_ID.gst.annoEl;
      ag.textContent = 'GST off food';
      ag.classList.add('on');
    }
  }

  /* wealth-tax label chip on its pipe */
  if (p && p.wealthTax > 0){
    wtaxLblEl.textContent = 'wealth tax ' + p.wealthTax + '% over $' + p.wealthThresholdM + 'M';
    wtaxLblEl.classList.remove('off');
    positionWtaxLbl();
  } else {
    wtaxLblEl.classList.add('off');
  }
}

function positionWtaxLbl(){
  var pipe = pipes[pipeIdx.wtax];
  if (!pipe) return;
  var pos = sample(pipe, 0.52);
  setNodeXY(wtaxLblEl, pos.x, pos.y - 20);
}

/* swap bracket cards to any mode's own scale (historical era OR party proposal), and back */
function fmtRate(r){
  return /^[\d.]+$/.test(r) ? r + '%' : r;   /* '31.25' → '31.25%'; 'graduated', '4 → 76', '76.5+' shown raw */
}
function setBracketCards(mode){
  var d = mode.data;
  var custom = d.scaleCards;
  var isParty = mode.kind === 'party';
  var bi = 0;
  SRC_STREAMS.forEach(function(s){
    if (s.type !== 'bracket') return;
    var i = bi++;
    if (custom){
      var sc = custom[i];
      if (!sc) return; /* card hidden via zero weight */
      s.parts.rng.textContent = sc.range;
      s.parts.rate.textContent = fmtRate(sc.rate);
      s.parts.shares.innerHTML = '<b>' + esc(sc.note || (isParty ? 'proposed band' : 'the scale then')) + '</b><span class="sp2"> · ' + esc(d.scaleNote) + '</span>';
      s.parts.ppl.style.display = 'none';
    } else {
      var br = s.br;
      s.parts.rng.textContent = br.range;
      s.parts.rate.textContent = br.rate + '%';
      s.parts.shares.innerHTML = '<b>' + br.shareTax + '%</b> of income tax<span class="sp2"> · ' + br.shareTaxpayers + '% of earners</span>';
      s.parts.ppl.style.display = '';
    }
  });
}

/* the vault's story changes with the era AND under each party's policy */
function setVaultParty(mode){
  var vp = document.getElementById('vaultParty');
  var vr = document.getElementById('vaultPartyRate');
  var ve = document.getElementById('vaultEra');
  var vm = document.getElementById('vaultModern');
  var vRates = document.getElementById('vaultRates');
  var isParty = mode.kind === 'party';
  var eraText = !isParty ? WEALTHY_BY_ERA[mode.data.id] : null;

  /* "8.9% → ≈100%": today's rate big, the party's rate as a bold line under it */
  function rateCell(v){
    var p = String(v).split(' → ');
    return '<b>' + esc(p[0]) + '</b>' + (p.length > 1 ? '<em class="vrTo">→ ' + esc(p.slice(1).join(' → ')) + '</em>' : '');
  }
  /* the rate face-off, shown for EVERY selection (Jeremy) */
  (function(){
    var them, us, themLbl, usLbl, kind, tag = '';
    if (isParty){
      var pw = PARTY_WEALTHY_RATE[mode.data.id];
      var k  = PARTY_80K[mode.data.id];
      them = pw ? pw.rate : '-';
      us   = k ? (k.bill === null ? PARTY_80K.current.rate + '% → ?' : PARTY_80K.current.rate + '% → ' + k.rate + '%') : '-';
      themLbl = 'The 311 wealthiest'; usLbl = 'An $80k earner';
      kind = 'share of a normal year’s income, illustrative';
      tag = 'eff';
    } else if (eraText){
      var er = ERA_RATES[mode.data.id];
      them = er ? er.them : '-'; us = er ? er.us : '-';
      themLbl = 'The wealthy'; usLbl = 'An ordinary worker';
      kind = er ? er.kind : ''; tag = 'stat';
    } else {
      them = THE311.medianEffectiveRate + '%'; us = THE311.comparatorWageEarner + '%';
      themLbl = 'The 311 wealthiest'; usLbl = 'A nurse on $80k';
      kind = 'rate, what they actually pay on ALL their income, capital gains included'; tag = 'eff';
    }
    var tagHtml = tag === 'eff' ? '<span class="vrTag tagEff">effective</span> '
                : tag === 'stat' ? '<span class="vrTag tagStat">statutory</span> ' : '';
    /* the tag already prints the word, drop a leading duplicate from the text */
    if (tag) kind = kind.replace(/^\s*(effective|statutory)\b[\s,–-]*/i, '');
    vRates.innerHTML =
      '<div class="vr vrThem"><i>' + esc(themLbl) + '</i>' + rateCell(them) + '</div>' +
      '<div class="vr vrUs"><i>' + esc(usLbl) + '</i>' + rateCell(us) + '</div>' +
      '<em class="vrKind">' + tagHtml + esc(kind) + '</em>';
  })();

  if (eraText){
    /* historical era: the 2015-21 IRD-study lines would be anachronistic */
    vm.hidden = true; ve.hidden = false; vp.hidden = true; vr.hidden = true;
    ve.textContent = eraText;
    wealthySubEl.textContent = 'the estates · the landlords · the fortunes';
  } else {
    vm.hidden = false; ve.hidden = true;
    wealthySubEl.textContent = THE311.families + ' families · median net worth $' + THE311.medianFamilyNetWorthM + 'M';
    var vSmall = nodeEls.vault.querySelector('.vSmall');
    if (isParty && mode.data.vaultLine){
      vm.hidden = true;       /* party mode: the vault tells the party story only */
      vSmall.hidden = true;
      vp.hidden = false;
      vp.textContent = 'Under ' + mode.data.label + ': ' + mode.data.vaultLine;
      var pw = PARTY_WEALTHY_RATE[mode.data.id];
      if (pw){
        vr.hidden = false;
        vr.innerHTML = esc(pw.line) +
          (pw.derived ? '<em class="ill">illustrative arithmetic on IRD’s median wealthy family, not an official costing</em>' : '');
      } else vr.hidden = true;
    } else { vSmall.hidden = false; vp.hidden = true; vr.hidden = true; }
  }
  sizeStage();     /* the stage follows the vault's height */
  fixedLayout();
}

/* wealth summary above the IRD, top 1% AND top 10% vs everyone else, per era, sourced points only */
function updateWealthStrip(mode){
  var top = document.getElementById('wsTop'), sub = document.getElementById('wsSub');
  var eraId = mode.kind === 'era' ? mode.data.id : null;
  var s1890 = WEALTH.series[0], s1938 = WEALTH.series[1];
  if (eraId === 'customs' || eraId === 'landtax' || eraId === 'incometax'){
    top.textContent = 'Top 1% held ' + s1890.range + ' of NZ’s wealth, everyone else shared the rest';
    sub.textContent = '1890s estimate · top-10% series only starts 2010';
  } else if (eraId === 'ww1'){
    top.textContent = 'Top 1% share falling: ' + s1890.range + ' (1890s) → ' + s1938.range + ' (late 1930s)';
    sub.textContent = 'the great flattening begins, sourced points either side of this era';
  } else if (eraId === 'welfare' || eraId === 'golden' || eraId === 'paye'){
    top.textContent = 'Top 1% down to ' + s1938.range + ', half their 1890s share';
    sub.textContent = 'late-1930s point, land tax, death duties and high top rates did this';
  } else if (eraId === 'muldoon'){
    top.textContent = 'Top 1%: no verified 1970s figure, last sourced ' + s1938.range + ' (1930s)';
    sub.textContent = 'after 1986 the Rich List grows 23×, the re-widening starts here';
  } else {
    top.textContent = 'Top 1% hold ≈' + Math.round(WEALTH.now.top1) + '% · top 10% hold ≈' + Math.round(WEALTH.now.top10) + '% of NZ’s ≈$' + WEALTH.totalHouseholdNetWorth.t + 'T';
    sub.textContent = 'the other 90% share a third · bottom half: ' + WEALTH.now.bottom50 + '% · Rich List 23× since 1986 · full story below ↓';
  }
}

/* ---- the panel binds river + chips + card: one accent, one caret, one flash ---- */
var panelEl = null, flashT = null;
function positionCaret(id){
  var chip = chipEls[id], card = document.getElementById('modeCard');
  if (!chip || !card) return;
  var cr = chip.getBoundingClientRect(), dr = card.getBoundingClientRect();
  if (dr.width < 2) return;
  var x = cr.left + cr.width / 2 - dr.left;
  card.style.setProperty('--caretX', Math.round(Math.max(22, Math.min(dr.width - 22, x))) + 'px');
}
function linkPanel(mode, id){
  panelEl = panelEl || document.getElementById('riverPanel');
  if (!panelEl) return;
  panelEl.style.setProperty('--accent', mode.kind === 'party' ? mode.data.color : 'var(--txt)');
  positionCaret(id);
  panelEl.classList.remove('flash');
  void panelEl.offsetWidth;                      /* restart the transition */
  panelEl.classList.add('flash');
  clearTimeout(flashT);
  flashT = setTimeout(function(){ panelEl.classList.remove('flash'); }, 950);
}
window.addEventListener('resize', function(){ if (curModeId) positionCaret(curModeId); }, { passive: true });

function setMode(id, instant){
  if (id === curModeId) return;
  var mode = null;
  HISTORY.forEach(function(e){ if ('era:' + e.id === id) mode = { kind:'era', data:e }; });
  PARTIES.forEach(function(pp){ if ('party:' + pp.id === id) mode = { kind:'party', data:pp }; });
  if (!mode) return;
  var oldLoop = curMode ? targetsFor(curMode).loophole : 0;
  curMode = mode; curModeId = id;

  Object.keys(chipEls).forEach(function(k){
    chipEls[k].classList.toggle('on', k === id);
    chipEls[k].setAttribute('aria-pressed', k === id ? 'true' : 'false');
  });

  var t = targetsFor(mode);
  curVisN = SRC_STREAMS.filter(function(s){ return (t.w[s.id] || 0) > 0.001; }).length;
  setBracketCards(mode);
  setVaultParty(mode);
  updateWealthStrip(mode);
  applyCardState(t);
  renderModeCard(mode, t);
  linkPanel(mode, id);

  /* re-plumb the left column */
  var vis = SRC_STREAMS.filter(function(s){ return (t.w[s.id] || 0) > 0.001; });
  var tgt = sourceTargets(vis);
  movedSrcs = [];
  vis.forEach(function(s, i){
    s.visIdx = i; s.visN = vis.length;
    var g = tgt[s.id];
    var entering = (Wcur[s.id] || 0) <= 0.001;
    if (entering || instant || RM){
      s.x = g.x; s.y = g.y; s.fx = g.x; s.fy = g.y; s.tx = g.x; s.ty = g.y;
      rebuildSourcePipe(s);
      setNodeXY(s.el, s.x, s.y);
    } else if (Math.abs(s.x - g.x) > 0.5 || Math.abs(s.y - g.y) > 0.5){
      s.fx = s.x; s.fy = s.y; s.tx = g.x; s.ty = g.y;
      movedSrcs.push(s);
    }
  });
  SRC_STREAMS.forEach(function(s){
    s.el.classList.toggle('off', (t.w[s.id] || 0) <= 0.001);
  });

  if (instant || RM){
    ALL_KEYS.forEach(function(k){ Wcur[k] = t.w[k]; });
    tween.active = false;
    movedSrcs = [];
    if (RM) drawStatic();
  } else {
    ALL_KEYS.forEach(function(k){ Wfrom[k] = Wcur[k]; Wto[k] = t.w[k]; });
    tween.active = true;
    tween.t0 = performance.now();
    /* gold pulse when the loophole swings wide */
    if (t.loophole - oldLoop > 0.25){
      pulse = 1;
      var gi = pipeIdx.gold;
      for (var n = 0; n < 45; n++) spawnP(gi, Math.random());
    }
  }
}

/* ================= parallax (prototype) ================= */
var ptX = 0, ptY = 0, parX = 0, parY = 0, scrollPar = 0;
if (!RM){
  if (window.matchMedia('(pointer:fine)').matches){
    window.addEventListener('mousemove', function(e){
      var r = stage.getBoundingClientRect();
      if (r.width < 1) return;
      ptX = ((e.clientX - r.left) / r.width  - 0.5) * 22;
      ptY = ((e.clientY - r.top)  / r.height - 0.5) * 16;
    }, { passive:true });
  }
  var gyro = false, baseBeta = null;
  var onDO = function(e){
    if (e.gamma == null && e.beta == null) return;
    gyro = true;
    if (baseBeta === null) baseBeta = e.beta || 0;
    ptX = Math.max(-30, Math.min(30, e.gamma || 0)) / 30 * 16;
    ptY = Math.max(-25, Math.min(25, (e.beta || 0) - baseBeta)) / 25 * 13;
  };
  window.addEventListener('deviceorientation', onDO);
  setTimeout(function(){ if (!gyro) window.removeEventListener('deviceorientation', onDO); }, 1200);
  window.addEventListener('scroll', function(){
    scrollPar = Math.max(-16, Math.min(16, (window.scrollY || 0) * 0.05));
  }, { passive:true });
}

/* ================= render (prototype) ================= */
function strokePipes(){
  ctx.globalCompositeOperation = 'source-over';
  ctx.lineCap = 'round';
  for (var i = 0; i < pipes.length; i++){
    var p = pipes[i];
    if (!p) continue;
    var kd = KIND[p.kind];
    var w = clamp01(Wcur[p.key] || 0);
    if (w <= 0.001){ p.curW = kd.bMin * sf; continue; }
    var bw = (kd.bMin + w * (kd.bMax - kd.bMin)) * sf;
    p.curW = bw;
    var C = KCOL[p.kind];
    var extra = p.kind === 'gold' ? pulse : 0;
    ctx.strokeStyle = C.under;
    ctx.globalAlpha = Math.min(1, C.underA + extra * 0.15) * Math.min(1, w * 8);
    ctx.lineWidth = bw * 1.9;
    ctx.stroke(p.path);
    ctx.strokeStyle = C.core;
    ctx.globalAlpha = Math.min(1, C.coreA + extra * 0.25) * Math.min(1, w * 8);
    ctx.lineWidth = bw;
    ctx.stroke(p.path);
  }
  ctx.globalAlpha = 1;
}

function drawLayer(l, now){
  var lp = LAYERS[l];
  for (var i = 0; i < MAXP; i++){
    var p = P[i];
    if (!p.on || p.layer !== l) continue;
    var pipe = pipes[p.pipe];
    if (!pipe) { p.on = false; free.push(i); continue; }
    var pos = sample(pipe, p.t);
    var off = p.offFrac * pipe.curW + Math.sin(now * p.wobF + p.phase) * pipe.curW * 0.12;
    var x = pos.x + pos.nx * off + parX * lp.par;
    var y = pos.y + pos.ny * off + parY * lp.par;
    var fade = Math.min(1, p.t * 12, (1 - p.t) * 9);
    var a = p.alpha * lp.alpha * fade;
    var s = p.size * lp.scale;
    if (pipe.kind === 'gold' && pulse > 0){
      a = a * (1 + pulse * PULSE_A);
      s = s * (1 + pulse * PULSE_S);
    }
    ctx.globalAlpha = Math.min(1, a);
    if (p.glyph){
      ctx.drawImage(p.spr, x - s, y - s, s * 2, s * 2);
      ctx.font = '700 ' + Math.round(s * 1.9) + 'px "Public Sans", sans-serif';
      ctx.fillStyle = GLYPH_COL;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', x, y);
    } else {
      ctx.drawImage(p.spr, x - s/2, y - s/2, s, s);
    }
  }
}

function step(dt, nowMs){
  if (tween.active){
    var u = Math.min(1, (nowMs - tween.t0) / tween.dur);
    var e = ease(u);
    for (var ki = 0; ki < ALL_KEYS.length; ki++){
      var k = ALL_KEYS[ki];
      Wcur[k] = Wfrom[k] + (Wto[k] - Wfrom[k]) * e;
    }
    for (var mi = 0; mi < movedSrcs.length; mi++){
      var s = movedSrcs[mi];
      s.x = lerp(s.fx, s.tx, e);
      s.y = lerp(s.fy, s.ty, e);
      rebuildSourcePipe(s);
      setNodeXY(s.el, s.x, s.y);
    }
    if (u >= 1){ tween.active = false; movedSrcs = []; }
  }
  pulse *= Math.exp(-dt * 2.2);
  if (pulse < 0.01) pulse = 0;

  for (var i = 0; i < pipes.length; i++){
    var pipe = pipes[i];
    if (!pipe) continue;
    var kd = KIND[pipe.kind];
    var w = clamp01(Wcur[pipe.key] || 0);
    if (w <= 0.001) continue;
    var rate = kd.rate * (0.12 + 0.88 * w);
    if (pipe.kind === 'gold') rate *= (1 + pulse * 1.2);
    pipe.acc += rate * dt;
    while (pipe.acc >= 1){
      pipe.acc -= 1;
      spawnP(i, Math.random() * 0.02);
    }
  }
  for (var j = 0; j < MAXP; j++){
    var p = P[j];
    if (!p.on) continue;
    p.t += p.tSpeed * dt;
    if (p.t >= 1){ p.on = false; free.push(j); }
  }
}

var raf = 0, running = false, last = 0;
function frame(nowMs){
  raf = requestAnimationFrame(frame);
  var dt = Math.min(0.05, (nowMs - last) / 1000);
  last = nowMs;
  var now = nowMs * 0.001;
  step(dt, nowMs);
  ctx.clearRect(0, 0, W, H);
  parX += (ptX - parX) * 0.06;
  parY += (ptY + scrollPar - parY) * 0.06;
  ctx.globalCompositeOperation = COMP;
  drawLayer(0, now);
  strokePipes();
  ctx.globalCompositeOperation = COMP;
  drawLayer(1, now);
  drawLayer(2, now);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
}

/* static frame for prefers-reduced-motion (mulberry PRNG) */
function drawStatic(){
  ctx.clearRect(0, 0, W, H);
  strokePipes();
  ctx.globalCompositeOperation = COMP;
  for (var i = 0; i < pipes.length; i++){
    var pipe = pipes[i];
    if (!pipe) continue;
    var kd = KIND[pipe.kind];
    var w = clamp01(Wcur[pipe.key] || 0);
    if (w <= 0.001) continue;
    var n = Math.round((pipe.kind === 'gold' ? 80 : 26) * (0.15 + 0.85 * w));
    var rnd = mulberry(i * 7919 + 13);
    for (var k = 0; k < n; k++){
      var t = rnd();
      var r = rnd();
      var l = r < 0.22 ? 0 : (r < 0.88 ? 1 : 2);
      var lp = LAYERS[l];
      var size = kd.size * (0.7 + rnd()*0.8) * (0.55 + 0.5*w) * sf * lp.scale;
      var off = (rnd() - 0.5) * lp.spread * pipe.curW;
      var pos = sample(pipe, t);
      var fade = Math.min(1, t * 12, (1 - t) * 9);
      ctx.globalAlpha = Math.min(1, ((pipe.kind === 'gold' || pipe.kind === 'goldin') ? 0.85 : 0.7) * lp.alpha * fade);
      var spr = l === 2 ? SPR[pipe.kind][1] : SPR[pipe.kind][0];
      ctx.drawImage(spr, pos.x + pos.nx*off - size/2, pos.y + pos.ny*off - size/2, size, size);
    }
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
}

/* ================= resize ================= */
function resize(){
  sizeStage();
  var r = stage.getBoundingClientRect();
  if (r.width < 2 || r.height < 2) return;
  W = r.width; H = r.height;
  dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = Math.round(W * dpr);
  cv.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  sf = Math.max(0.62, Math.min(1.35, Math.min(W, H) / 760));
  mobile = window.innerWidth < 820;
  fixedLayout();
  if (curMode){
    var t = targetsFor(curMode);
    var vis = SRC_STREAMS.filter(function(s){ return (t.w[s.id] || 0) > 0.001; });
    var tgt = sourceTargets(vis);
    vis.forEach(function(s, i){
      s.visIdx = i; s.visN = vis.length;
      var g = tgt[s.id];
      s.x = g.x; s.y = g.y; s.fx = g.x; s.fy = g.y; s.tx = g.x; s.ty = g.y;
      rebuildSourcePipe(s);
      setNodeXY(s.el, s.x, s.y);
    });
    if (!wtaxLblEl.classList.contains('off')) positionWtaxLbl();
  }
  if (RM) drawStatic();
}
/* ================= chips ================= */
function buildChips(){
  var eraNav = document.getElementById('eraChips');
  HISTORY.forEach(function(era){
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'chipE';
    b.innerHTML = esc(era.short) + '<small>' + esc(era.label) + '</small>';
    b.setAttribute('aria-pressed', 'false');
    b.setAttribute('aria-label', era.label + ', ' + era.years);
    b.title = era.label + ' · ' + era.years;
    b.addEventListener('click', function(){ setMode('era:' + era.id, false); });
    eraNav.appendChild(b);
    chipEls['era:' + era.id] = b;
  });
  var partyNav = document.getElementById('partyChips');
  PARTIES.forEach(function(p){
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'chipE chipP';
    b.style.setProperty('--c', p.color);
    b.innerHTML = '<span class="dot"></span>' + esc(p.label);
    b.setAttribute('aria-pressed', 'false');
    b.setAttribute('aria-label', p.label + ' 2026 tax policy');
    b.addEventListener('click', function(){ setMode('party:' + p.id, false); });
    partyNav.appendChild(b);
    chipEls['party:' + p.id] = b;
  });
}

/* ================= era / party detail card ================= */
function renderModeCard(mode, t){
  var box = document.getElementById('modeCard');
  if (mode.kind === 'era'){
    var era = mode.data;
    var big = era.hasIncomeTax ? era.topRate + '%' : 'none';
    var tone = BUILT_TONE[era.id] || 'neutral';
    var builtLbl = /^What it un-built/i.test(era.built) ? '' : '<b>What it built:</b> ';
    box.innerHTML =
      '<div class="ecHead"><span class="ecLabel">' + esc(era.label) + '</span>' +
      '<span class="ecYears">' + esc(era.years) + '</span>' +
      '<span class="ecTop"><b>' + big + '</b><span>top income-tax rate</span></span></div>' +
      '<p class="ecStory">' + esc(era.revenueStory) + '</p>' +
      (era.ladder ? '<p class="ecLadder">' + esc(era.ladder) + '</p>' : '') +
      (RANKING.byEra[era.id] ? '<p class="ecRank">🌍 World income rank: ' + esc(RANKING.byEra[era.id]) + '</p>' : '') +
      '<p class="ecBuilt ' + tone + '">' + builtLbl + esc(era.built) + '</p>' +
      '<p class="ecFact">' + esc(era.fact) + '</p>' +
      (era.confidence !== 'solid'
        ? '<p class="ecConf"><span class="badge amber">partly estimated</span> ' + esc(era.confidence) + '</p>'
        : '');
  } else {
    var p = mode.data;
    var head = p.confidence.split(/[,(]/)[0].trim();
    var cls = head === 'solid' ? 'solidB' : 'amber';
    box.innerHTML =
      '<div class="ecHead"><span class="pDot" style="--c:' + p.color + '"></span>' +
      '<span class="ecLabel">' + esc(p.label) + '</span>' +
      '<span class="badge ' + cls + '">' + esc(head) + '</span>' +
      '<span class="ecTop"><b>' + p.topRate + '%</b><span>top income-tax rate</span></span></div>' +
      '<p class="ecStory">' + esc(p.summary) + '</p>' +
      (function(){
        var k = PARTY_80K[p.id];
        if (!k) return '';
        if (k.bill === null) return '<p class="ecRank">💰 An $80k earner’s income-tax rate: 20.3% → ?, ' + esc(k.note) + '</p>';
        var d = k.delta === 0 ? 'unchanged' :
          'saves ≈$' + Math.abs(k.delta).toLocaleString('en-NZ') + '/yr';
        return '<p class="ecRank">💰 An $80k earner’s income-tax rate: <b>' + PARTY_80K.current.rate + '% → ' + k.rate + '%</b> (' + d +
          (k.delta !== 0 ? ' vs today' : '') + ') · ' + esc(k.note) +
          ' <span class="badge amber">illustrative</span></p>';
      })() +
      '<p class="ecConf">' + esc(p.confidence) + ' · <a class="ecSrc" href="' + p.sourceUrl +
      '" target="_blank" rel="noopener">source ↗</a></p>';
  }
}

/* ================= the world-ranking slide strip ================= */
function renderSlide(){
  var el = document.getElementById('slideCard');
  if (!el) return;
  el.innerHTML =
    '<h3>' + esc(RANKING.headline) + '</h3>' +
    '<div class="slideRow">' +
    RANKING.slide.map(function(p){
      return '<div class="slidePt ' + (p.tone || '') + '"><i>' + esc(p.label) + '</i><b>' + esc(p.big) + '</b>' +
        (p.rate ? '<span class="slideRate">top rate ' + esc(p.rate) + '</span>' : '') +
        '<i>' + esc(p.sub) + '</i></div>';
    }).join('') +
    '</div>' +
    '<p class="slideCap">' + esc(RANKING.caveat) + '</p>';
}
renderSlide();

/* ================= untaxed headline card ================= */
function renderUntaxed(){
  var u = UNTAXED;
  document.getElementById('untaxedCard').innerHTML =
    '<div class="uHead">The gains nobody taxes</div>' +
    '<div class="uVs"><span class="gold">' + fmtB(u.housingGain2021B) + '</span><i>housing gains, 2021</i>' +
    '<em>vs</em>' +
    '<span class="teal">' + fmtB(u.allTaxableIncomeB) + '</span><i>all taxable income, ' + esc(u.allTaxableIncomeYear) + '</i></div>' +
    '<p class="uHeadline">' + esc(u.headline) + '</p>' +
    '<p class="uCaveat">Housing figure is ' + esc(u.housingGainKind) + ', ' + esc(u.housingGainYear) +
    '. For scale: the 2019 Tax Working Group costed a broad capital-gains tax at ≈ $' + u.twgCgt5yrB +
    'B over its first 5 years.</p>';
}

/* ================= wealth panel ================= */
/* one bar, four segments: [top 1%, next 9%, middle 40%, bottom 50%] */
function poolBarHTML(p){
  var cls = ['segTop1', 'segNext9', 'segMid', 'segBottom'];
  var who = ['1 in 100', '9 in 100', '40 in 100'];
  /* the bottom half's people-count rides in the red label above its sliver,
     printed in the scale row it would collide with "40 in 100" on narrow bars */
  return '<div class="poolTop"><span class="ptRed">50 in 100 own just ' + p[3] + '% ↓</span></div>' +
    '<div class="poolBar">' + p.map(function(v, i){
      return '<div class="seg ' + cls[i] + '" style="width:' + v + '%">' +
        (i < 3 ? '<span>' + v + '%</span>' : '') + '</div>';
    }).join('') + '</div>' +
    '<div class="poolScale">' + who.map(function(lbl, i){
      return '<span style="width:' + p[i] + '%">' + lbl + '</span>';
    }).join('') + '</div>';
}

/* --- what actually changed, 2010→2018: dollars, not shares --- */
function renderShift(){
  var s = NZ_SHIFT;
  function money(n){ return n >= 1e6 ? '$' + (n / 1e6).toFixed(1) + 'M' : '$' + n.toLocaleString('en-NZ'); }
  var midPct = Math.max(0.55, s.midGain / s.top1Gain * 100);   // ≈0.8%, that IS the point
  document.getElementById('wShift').innerHTML =
    '<h3>What actually changed, ' + esc(s.period) + '</h3>' +
    '<p class="wsub">The only stretch New Zealand has ever measured properly. Shares barely moved. Dollars exploded.</p>' +
    '<div class="gapRow gapTop"><div class="gLbl"><span>The top 1%, average wealth gained</span><b>+' + money(s.top1Gain) + '</b></div>' +
      '<div class="gapBar" style="width:100%"></div></div>' +
    '<div class="gapRow gapMid"><div class="gLbl"><span>The middle New Zealander, average wealth gained</span><b>+' + money(s.midGain) + '</b></div>' +
      '<div class="gapBar" style="width:' + midPct.toFixed(2) + '%"></div></div>' +
    '<p class="gapRatio">For every <b>$1</b> the middle New Zealander gained, the top 1% gained <b>$' + s.ratio + '</b>.</p>' +
    '<p class="wkey">' + s.shareLine + '</p>' +
    '<p class="wnote">' + esc(s.note) + ' <a class="ecSrc" href="' + s.sourceUrl + '" target="_blank" rel="noopener">source ↗</a></p>';
}

/* --- and who owns the world --- */
function renderWorld(){
  var w = WORLD;
  document.getElementById('wWorld').innerHTML =
    '<h3>And who owns the world</h3>' +
    '<p class="wsub">The same bar, for every human being alive. New Zealand is not the worst of it, it is a mild version of it.</p>' +
    '<div class="poolHead"><b>≈ US$' + w.totalT + ' trillion</b><span class="badge amber">' + esc(w.basis) + '</span></div>' +
    poolBarHTML([w.top1, w.next9, w.mid40, w.bottom50]) +
    '<div class="poolLegend">' +
      '<div class="pl"><i class="sw swTop1"></i><b>The top 1%</b><span>' + w.top1 + '%, 56 million adults, about the population of Britain</span></div>' +
      '<div class="pl"><i class="sw swNext9"></i><b>The next 9%</b><span>' + w.next9 + '%, together the top tenth holds three-quarters of everything</span></div>' +
      '<div class="pl"><i class="sw swMid"></i><b>The middle 40%</b><span>' + w.mid40 + '%</span></div>' +
      '<div class="pl"><i class="sw swBottom"></i><b>The poorer half, four billion people</b><span>' + w.bottom50 + '%</span></div>' +
    '</div>' +
    '<p class="wkey">' + w.headline + '</p>' +
    '<p class="wkey">' + w.extra + '</p>' +
    '<p class="wkey wkeyHist">' + w.growth + '</p>' +
    '<p class="wnote">' + esc(w.caveat) + '</p>';
}

function renderWealth(){
  var tw = WEALTH.totalHouseholdNetWorth;

  function bar(big, lbl, wPct, sub, color, badge){
    return '<div class="pbar"><div class="lbl"><span>' + esc(lbl) +
      (badge ? ' <span class="badge amber">' + esc(badge) + '</span>' : '') +
      '</span><b>' + big + '</b></div>' +
      '<div class="track"><div class="fill" style="width:' + wPct.toFixed(1) + '%;background:' + color + '"></div></div>' +
      '<div class="sub">' + esc(sub) + '</div></div>';
  }
  /* one bar = ALL of NZ's wealth, split by who holds it (Treasury corrected shares).
     Dollar figures are the shares applied to today's ≈$2.5T pool, labelled illustrative. */
  var poolB = tw.t * 1000;                                   // ≈2500 ($B)
  var top1B  = Math.round(poolB * WEALTH.now.top1 / 100);    // ≈652
  var next9P = WEALTH.now.top10 - WEALTH.now.top1;           // 41.1
  var next9B = Math.round(poolB * next9P / 100);
  var bottom50P = WEALTH.now.bottom50;                       // 6.7
  var mid40P = 100 - WEALTH.now.top10 - bottom50P;           // 26.1, the 40% between
  var mid40B = Math.round(poolB * mid40P / 100);
  var bottom50B = Math.round(poolB * bottom50P / 100);       // ≈168
  document.getElementById('wPool').innerHTML =
    '<h3>The pool, all of New Zealand’s wealth, and who holds it</h3>' +
    '<div class="poolHead"><b>≈ $' + tw.t + ' trillion</b><span class="badge amber">illustrative split</span></div>' +
    poolBarHTML([WEALTH.now.top1, +next9P.toFixed(1), +mid40P.toFixed(1), bottom50P]) +
    '<div class="poolLegend">' +
      '<div class="pl"><i class="sw swTop1"></i><b>The top 1%</b><span>≈ $' + top1B + 'B (' + WEALTH.now.top1 + '%), one in a hundred adults holds a quarter of everything. Within it, the top 0.1%, one in a thousand, hold ≈ $' + Math.round(poolB * WEALTH.now.top01 / 100) + 'B (' + WEALTH.now.top01 + '%).</span></div>' +
      '<div class="pl"><i class="sw swNext9"></i><b>The next 9%</b><span>≈ $' + (next9B/1000).toFixed(2).replace(/0$/,'') + 'T (' + next9P.toFixed(1) + '%), together the top tenth holds ' + Math.round(WEALTH.now.top10) + '% of everything</span></div>' +
      '<div class="pl"><i class="sw swMid"></i><b>The middle 40%</b><span>≈ $' + (mid40B/1000).toFixed(2).replace(/0$/,'') + 'T (' + mid40P.toFixed(1) + '%)</span></div>' +
      '<div class="pl"><i class="sw swBottom"></i><b>The poorer half</b><span>≈ $' + bottom50B + 'B (' + bottom50P + '%), that thin red sliver is half of New Zealand</span></div>' +
    '</div>' +
    '<p class="wkey">' + esc(WEALTH.now.top1VsBottom50) + '</p>' +
    '<p class="wkey">One person in a thousand (' + WEALTH.now.top01 + '%) holds more than the entire poorer half of New Zealand combined (' + bottom50P + '%). And the richest 1% hold the same share (' + WEALTH.now.top1 + '%) as the 40 in every 100 New Zealanders sitting between the middle and the top tenth (' + mid40P.toFixed(1) + '%).</p>' +
    '<div class="poolGdp"><div class="gdpTick" style="width:' + (WEALTH.gdpB / poolB * 100).toFixed(1) + '%"></div>' +
      '<span>NZ’s entire annual GDP, $' + WEALTH.gdpB + 'B, for scale: the top 1% hold about a year and a half of everything the whole country produces</span></div>' +
    '<p class="wkey wkeyHist">Wealth taxes worked, when we had them. The top 1% held <b>' + WEALTH.series[0].range +
      '</b> of everything in the 1890s. After forty years of land tax, death duties and 60–90% top rates, they held <b>' +
      WEALTH.series[1].range + '</b> by the 1930s. Those two, plus Treasury’s <b>' + WEALTH.now.top1 +
      '%</b> for 2018, are the only three measurements ever taken of this number. Nothing since. <span class="badge amber">1890s &amp; 1930s: estimates</span></p>' +
    '<p class="wnote">Shares: Treasury capitalisation method (2018, corrects the survey undercount of the very top; the survey alone says the top 10% own ' + WEALTH.now.surveyTop10 + '%) applied to the ≈$' + tw.t + 'T pool (' + esc(tw.basis) + '). Survey measure: $' + tw.hesT + 'T (' + esc(tw.hesBasis) + ').</p>';
  /* --- Rich List strip --- */
  var rl = WEALTH.richList;
  document.getElementById('wRich').innerHTML =
    '<h3>The NBR Rich List</h3>' +
    '<div class="rich">' +
    rl.map(function(r){
      return '<div class="rmile"><div class="yr">' + r.year + '</div><b>' + fmtB(r.totalB) + '</b>' +
        (r.billionaires ? '<i>' + r.billionaires + ' billionaires</i>' : '') +
        (r.note ? '<i>' + esc(r.note) + '</i>' : '') +
        '</div>';
    }).join('') +
    '</div>' +
    (function(){
      var pc = WEALTH.payCompare;
      if (!pc) return '';
      return '<div class="payVs">' +
        '<div class="pv pvRich"><i>The Rich List</i><b>' + pc.richMult + '</b><em>in 40 years</em><span>' + pc.richRealMult + ' after inflation</span></div>' +
        '<div class="pv pvPay"><i>The average pay packet</i><b>' + pc.payMult + '</b><em>in 40 years</em><span>' + pc.payRealMult + ' after inflation · ' + esc(pc.pay1986) + ' → ' + esc(pc.payNow) + '</span></div>' +
        '</div>' +
        '<p class="wkey">' + esc(pc.line) + '</p>' +
        '<p class="wnote">' + esc(pc.caveat) + ' <span class="badge amber">1986 pay: estimate</span></p>';
    })();
}

/* ================= footer ================= */
function renderFooter(){
  var links = SOURCES.concat(WEALTH.sources, RANKING.sources, WORLD.sources,
    [{ name: 'Treasury WP 23/01, NZ wealth distribution, 2010–2018', url: NZ_SHIFT.sourceUrl }]);
  document.getElementById('foot').innerHTML =
    '<h3>Sources</h3>' +
    '<ul class="srcList">' + links.map(function(s){
      return '<li><a href="' + s.url + '" target="_blank" rel="noopener">' + esc(s.name) + '</a></li>';
    }).join('') + '</ul>' +
    '<h4>Party policy sources</h4>' +
    '<ul class="srcList">' + PARTIES.map(function(p){
      return '<li><a href="' + p.sourceUrl + '" target="_blank" rel="noopener">' + esc(p.label) + ', announced 2026 policy</a></li>';
    }).join('') + '</ul>' +
    '<div class="fnotes">' +
    '<p>' + esc(BRACKETS_SHARE_NOTE) + '</p>' +
    '<p>Untaxed-gains headline: ' + esc(UNTAXED.headlineConfidence) + '.</p>' +
    '<p><span class="badge amber">estimate</span><span class="badge amber">contested</span> mark figures from market surveys, secondary sources or party statements not independently costed. Everything unbadged is verified against the primary source listed above.</p>' +
    '</div>' +
    '<p class="themeLine">' + (THEME_DARK
      ? 'Prefer the paper version? <a href="?theme=light">?theme=light</a>'
      : 'Prefer the midnight version? <a href="?theme=dark">?theme=dark</a>') + '</p>';
}

/* ================= boot ================= */
buildOverlay();
buildChips();
renderUntaxed();
renderWealth();
renderShift();
renderWorld();
renderFooter();
resize();
setMode('era:now', true);

if (typeof ResizeObserver !== 'undefined'){
  new ResizeObserver(function(){ resize(); }).observe(stage);
} else {
  window.addEventListener('resize', resize);
}

if (!RM){
  running = true;
  last = performance.now();
  raf = requestAnimationFrame(frame);
  document.addEventListener('visibilitychange', function(){
    if (document.hidden){
      if (running){ cancelAnimationFrame(raf); running = false; }
    } else if (!running){
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  });
} else {
  drawStatic();
}
})();
