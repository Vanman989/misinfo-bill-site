/* ============================================================
   Honest Politics Party: One town, now vs with us
   A low-poly island town. One slider sweeps it from how New Zealand
   works now to how it works with us. Every figure comes from
   /assets/data.js, /assets/income-dist.js and /assets/finance.js.
   A classic script on purpose: if three.js (unpkg, via the import map)
   or WebGL is not available, the plain 2D version still works.
   Add ?fallback=1 to the address to see the 2D version.
   ============================================================ */
(function(){
'use strict';

/* ---------------- helpers ---------------- */
function $(id){ return document.getElementById(id); }
function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function money(n){ return '$' + Math.round(n).toLocaleString('en-NZ'); }
function bn(b){ var r = Math.round(Math.abs(b) * 10) / 10; return '$' + (r % 1 ? r.toFixed(1) : r.toFixed(0)) + 'b'; }
function link(s){ return '<a href="' + esc(s[1]) + '" target="_blank" rel="noopener">' + esc(s[0]) + '</a>'; }
function clamp(v, a, b){ return v < a ? a : v > b ? b : v; }
function sstep(a, b, x){ var k = clamp((x - a) / (b - a), 0, 1); return k * k * (3 - 2 * k); }
function lerp(a, b, k){ return a + (b - a) * k; }
function easeIO(k){ return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }
function easeSine(k){ return -(Math.cos(Math.PI * k) - 1) / 2; }
function easeBack(k){ var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); }
var Q = new URLSearchParams(location.search);
// ?motion=1 plays the full animation even when the device asks for reduced motion (for testing)
var reduce = !Q.has('motion') && !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
var body = document.body;
var coarse = !!(window.matchMedia && matchMedia('(pointer: coarse)').matches);
var scrollMode = coarse || (navigator.maxTouchPoints > 0 && Math.min(innerWidth, innerHeight) < 820);
var promoterHTML = (typeof PROMOTER !== 'undefined' && PROMOTER)
  ? 'Promoted by ' + esc(PROMOTER) + '.'
  : '<span class="need">Promoted by: add a name and contact details before this goes live.</span>';

/* ---------------- the changes: one per building ---------------- */
var CH = null, BY = {}, MED = 71800, GAINS, CUT, BACK, NET, SERV, HEALTH_B, FAM_B, PT_B;
try {
  var P = {}, TP = {};
  POLICIES.forEach(function(p){ P[p.id] = p; });
  TAX_PLAN.forEach(function(p){ TP[p.id] = p; });
  var TAX_NOW = taxOn(MED, SCHEDULES.today), TAX_US = taxOn(MED, SCHEDULES.ours), KEEP = TAX_NOW - TAX_US;
  GAINS = FIN.totalIn; CUT = FIN.cut.b; BACK = -FIN.totalOut; NET = FIN.net; SERV = FIN.services;
  HEALTH_B = -FIN.moneyOut[1].b; FAM_B = -FIN.moneyOut[2].b; PT_B = -FIN.moneyOut[3].b;
  var taxSum = TAX_IN.reduce(function(a, x){ return a + x.b; }, 0);
  var workShare = Math.round((TAX_IN[0].b + TAX_IN[1].b) / taxSum * 100);
  var superB = SPEND_OUT.filter(function(x){ return x.label === 'NZ Super'; })[0].b;
  var R311 = FACTS.rich311;

  CH = [
    { id:'mansion', name:'The mansion',
      now: bn(GAINS) + ' a year in gains, untaxed', us: bn(GAINS) + ' a year taxed like wages',
      title:'Money earned is money taxed',
      nowLong:'Every year about ' + bn(GAINS) + ' in capital gains, big inheritances and rezoning windfalls goes untaxed. Counting everything they make, New Zealand’s ' + R311.families + ' wealthiest families pay ' + R311.rate + '% tax. A nurse pays ' + R311.nurse + '%.',
      usLong:'Every capital gain is taxed like wages, homes included, spread over the years it was owned. Inheritances over $1 million are taxed like income. Half of every rezoning windfall is taxed. Together that is ' + bn(GAINS) + ' a year.',
      figs:[[bn(GAINS), 'a year, taxed instead of escaping'], [R311.rate + '%', 'what the ' + R311.families + ' wealthiest families pay today, on everything they make']],
      list:{ head:'Where the ' + bn(GAINS) + ' comes from', rows: FIN.moneyIn.map(function(m){ return [m.label, bn(m.b)]; }) },
      paras:[TP.cgt.plain, TP.inherit.plain, TP.cgt.why],
      src:[TP.cgt.src[0], TP.inherit.src[0], R311.src] },
    { id:'purse', name:'Public purse (IRD)',
      now:'Gets $0 of the ' + bn(GAINS), us: bn(GAINS) + ' in, ' + bn(BACK) + ' back out',
      title:'Every dollar in, every dollar out',
      nowLong:'The public purse gets nothing from the ' + bn(GAINS) + ' a year in untaxed gains. Today ' + workShare + '% of all tax comes from income tax and GST: from work and spending.',
      usLong: bn(GAINS) + ' a year comes in. ' + bn(BACK) + ' goes straight back out as lower tax on work and free services, and ' + bn(NET) + ' a year goes to the books. Nothing is paid for by borrowing.',
      figs:[[bn(GAINS), 'comes in a year'], [bn(BACK), 'goes back out to people'], ['+' + bn(NET), 'a year for the books']],
      list:{ head:'Where it goes', rows: FIN.moneyOut.map(function(m){ return [m.label, bn(-m.b)]; }).concat([['Left over for the books', bn(NET)]]) },
      paras:[METHOD_NOTES[0], METHOD_NOTES[3]],
      src:[BOOKS.source, BUDGET_SRC] },
    { id:'homes', name:'Worker homes',
      now:'Median earner pays ' + money(TAX_NOW) + ' tax', us:'Pays ' + money(TAX_US) + ', keeps ' + money(KEEP) + ' more',
      title: TP.brackets.title,
      nowLong:'Someone on the median income of ' + money(MED) + ' pays ' + money(TAX_NOW) + ' in income tax a year.',
      usLong:'They pay ' + money(TAX_US) + ' and keep ' + money(KEEP) + ' more, every year. Across the country ' + bn(CUT) + ' a year goes back to the people who work.',
      figs:[[money(KEEP), 'more a year for the median earner'], [bn(CUT), 'a year back to people who work']],
      paras:[OUR_BANDS_LEAD, OUR_BANDS_NOTE],
      src:[INCOME_DIST.src] },
    { id:'health', name:'Health centre',
      now:'GP and dentist: you pay', us:'GP, dentist, prescriptions: free',
      title: P.health.title,
      nowLong:'You pay to see a GP, you pay the dentist, and every prescription has a charge.',
      usLong: P.health.plain,
      figs:[[bn(HEALTH_B), 'a year for free health care']],
      paras:[P.health.evidence, P.health.working],
      src: P.health.src },
    { id:'station', name:'Train station',
      now:'Pay a fare, trains not often', us:'Free, and more trains',
      title: P.transport.title,
      nowLong:'Every trip costs a fare, and trains do not come often.',
      usLong: P.transport.plain,
      figs:[[bn(PT_B), 'a year in fares no longer charged']],
      paras:[P.transport.evidence, P.transport.working],
      src: P.transport.src },
    { id:'market', name:'Supermarket',
      now:'Duopoly: $1m a day excess profit', us:'Public: whole food, no added sugar',
      title: P.supermarket.title,
      nowLong:'Two big chains run the grocery market. The Commerce Commission found they make about $1 million a day in excess profit.',
      usLong: P.supermarket.plain,
      figs:[[bn(FIN.investments[0].b), 'one-off to set up, then it pays its own way']],
      paras:[P.supermarket.evidence, P.supermarket.working],
      src: P.supermarket.src },
    { id:'lease', name:'New family homes',
      now:'For sale: out of reach', us:'99-year lease plus state home loan',
      title: P.familyhomes.title,
      nowLong:'For many families, buying a first home is out of reach.',
      usLong: P.familyhomes.plain,
      figs:[['99 years', 'a lease with a low ground rent that only rises with inflation'], ['State loan', 'at the Government’s own borrowing cost, paid back with interest']],
      paras:[P.familyhomes.evidence, P.familyhomes.working],
      src: P.familyhomes.src },
    { id:'families', name:'Families with kids',
      now:'Too many kids in low-income homes', us: bn(FAM_B) + ' a year lifts family incomes',
      title: P.kids.title,
      nowLong:'Too many children grow up in homes on low incomes.',
      usLong: P.kids.plain,
      figs:[[bn(FAM_B), 'a year to families with kids']],
      paras:[P.kids.evidence],
      src: P.kids.src },
    { id:'towns', name:'Land near the station',
      now:'One house only, windfall untaxed', us:'Townhouses, windfall shared',
      title:'Build homes near trains, and share the windfall',
      nowLong:'In many places only one house is allowed on a section. When a council rezones land its value jumps overnight, and the owner keeps all of it.',
      usLong: P.zoning.plain + ' ' + TP.windfall.plain,
      figs:[[bn(TP.windfall.b), 'a year from rezoning windfalls']],
      paras:[P.zoning.evidence, TP.windfall.why],
      src: P.zoning.src.concat(TP.windfall.src) },
    { id:'bowls', name:'NZ Super',
      now:'Age not linked to how long we live', us:'For everyone, for good, never past 69',
      title: P.super.title,
      nowLong:'NZ Super costs ' + bn(superB) + ' a year, and the age it starts is not linked to how long people live.',
      usLong: P.super.plain,
      figs:[[bn(P.super.b), 'a year saved, long run']],
      paras:[P.super.evidence],
      src: P.super.src }
  ];
  CH.forEach(function(c){ BY[c.id] = c; });
} catch (e){ CH = null; }

/* ---------------- shared page pieces ---------------- */
function chip(cls, label, val){ return '<span class="lgc"><i class="' + cls + '"></i>' + esc(label) + ' <b>' + esc(val) + '</b></span>'; }
function headlines(){
  $('hNow').textContent = 'Today, ' + bn(GAINS) + ' a year flows to the top, untaxed.';
  $('hUs').innerHTML = 'With us, it comes back <em>to everyone.</em>';
  $('tLeg').innerHTML =
    '<div id="lgNow">' + chip('c-gold', 'Untaxed gains', bn(GAINS)) + chip('c-grey', 'Tax on work we would cut', bn(CUT)) + '<span class="lgNote">Dots in proportion to dollars, a year</span></div>' +
    '<div id="lgUs">' + chip('c-gold', 'Gains taxed', bn(GAINS)) + chip('c-green', 'Tax cut', bn(CUT)) + chip('c-blue', 'Free services', bn(SERV)) + chip('c-slate', 'To the books', bn(NET)) + '<span class="lgNote">Dots in proportion to dollars, a year</span></div>';
}
/* the key to the dots sits under the headline on phones, in the control bar on wider screens */
function placeLegend(){
  var leg = $('tLeg'), target = innerWidth >= 761 ? $('ctrlLeg') : $('hudIn');
  if (leg && target && leg.parentNode !== target) target.appendChild(leg);
}

function youBox(root, id, closable){
  root.innerHTML =
    '<div class="youHead"><label class="youLbl" for="' + id + '">Your income</label>' + (closable ? '<button class="youX" type="button" aria-label="Close">×</button>' : '') + '</div>' +
    '<div class="youRow"><span>$</span><input id="' + id + '" inputmode="numeric" autocomplete="off" value="' + MED.toLocaleString('en-NZ') + '"></div>' +
    '<p class="youSub">Before tax, a year</p><div class="youOut" aria-live="polite"></div>';
  var inp = root.querySelector('input'), out = root.querySelector('.youOut');
  function val(){ return parseInt(inp.value.replace(/[^0-9]/g, ''), 10) || 0; }
  function calc(){
    var inc = val();
    if (!inc){ out.innerHTML = '<p class="youTax">Enter your income to see what you keep.</p>'; return; }
    var a = taxOn(inc, SCHEDULES.today), b = taxOn(inc, SCHEDULES.ours), d = a - b;
    out.innerHTML =
      '<p class="youKeep">You keep <b>' + money(d) + '</b> more a year</p>' +
      '<p class="youTax">Income tax today ' + money(a) + '. With us ' + money(b) + '.</p>' +
      '<p class="youPlus">Free GP visits, dental, prescriptions and public transport.</p>';
  }
  inp.addEventListener('input', calc);
  inp.addEventListener('blur', function(){ var v = val(); inp.value = v ? v.toLocaleString('en-NZ') : ''; });
  calc();
}

function detailHTML(c){
  return '<div class="shKick">' + esc(c.name) + '</div>' +
    '<h2 class="shT" id="shTitle">' + esc(c.title) + '</h2>' +
    '<div class="shCmp"><div class="shNow"><span>Now</span><p>' + esc(c.nowLong) + '</p></div>' +
      '<div class="shUs"><span>With us</span><p>' + esc(c.usLong) + '</p></div></div>' +
    (c.figs ? '<div class="shFigs">' + c.figs.map(function(f){ return '<div><b>' + esc(f[0]) + '</b><span>' + esc(f[1]) + '</span></div>'; }).join('') + '</div>' : '') +
    (c.list ? '<table class="shList"><caption>' + esc(c.list.head) + '</caption>' + c.list.rows.map(function(r){ return '<tr><td>' + esc(r[0]) + '</td><td>' + esc(r[1]) + '</td></tr>'; }).join('') + '</table>' : '') +
    c.paras.filter(Boolean).map(function(p){ return '<p class="shP">' + esc(p) + '</p>'; }).join('') +
    '<p class="src">Sources: ' + c.src.map(link).join(' · ') + '</p>' +
    '<div class="shFoot"><a class="btn btnFlame" href="/finance/">See every figure</a><a class="btn btnGhostInk" href="/#plan" style="border:1.5px solid var(--rule);color:var(--ink)">Read the plan</a></div>' +
    '<p class="src">' + promoterHTML + '</p>';
}

/* ---------------- the 2D version ---------------- */
var dead = false, ready = false, stop3D = null, fbShown = false;
function showFallback(reason){
  if (fbShown) return;
  fbShown = true; dead = true;
  if (stop3D) { try { stop3D(); } catch (e){} }
  body.classList.remove('is3d', 'scrollMode'); body.classList.add('fbMode');
  var fb = $('fallback'); fb.hidden = false;
  if (!CH){
    fb.innerHTML = '<div class="fbWrap"><div class="tKick">One town: now vs with us</div><h1 class="fbH">The figures did not load.</h1><p class="fbNote"><a href="/#plan">Read the plan</a> or <a href="/finance/">see every figure</a>.</p></div>';
    return;
  }
  var notes = {
    forced:'The plain version of the town: every change, now and with us.',
    webgl:'Your browser could not start the 3D town, so here is every change in plain words.',
    load:'The 3D engine could not load here, so here is every change in plain words.',
    slow:'The 3D town took too long to load, so here is every change in plain words.',
    error:'The 3D town hit a problem, so here is every change in plain words.'
  };
  fb.innerHTML = '<div class="fbWrap">' +
    '<div class="tKick">One town: now vs with us</div>' +
    '<h1 class="fbH">Today, ' + esc(bn(GAINS)) + ' a year flows to the top, untaxed. <em>With us, it comes back to everyone.</em></h1>' +
    '<p class="fbNote">' + esc(notes[reason] || notes.error) + '</p>' +
    '<section class="fbPanel fbNow"><h2><i>Now</i>How New Zealand works today</h2><ol class="fbList">' +
      CH.map(function(c){ return '<li><b>' + esc(c.name) + '</b><strong>' + esc(c.now) + '</strong><p>' + esc(c.nowLong) + '</p></li>'; }).join('') +
    '</ol></section>' +
    '<div class="fbArrow">With us</div>' +
    '<section class="fbPanel fbUs"><h2><i>With us</i>How it works with the plan</h2><ol class="fbList">' +
      CH.map(function(c){ return '<li><b>' + esc(c.name) + '</b><strong>' + esc(c.us) + '</strong><p>' + esc(c.usLong) + '</p><p class="src">' + c.src.slice(0, 2).map(link).join(' · ') + '</p></li>'; }).join('') +
    '</ol></section>' +
    '<div class="you fbYou" id="fbYou"></div>' +
    '<p class="fbFoot"><a class="btn btnFlame" href="/finance/">See every figure</a></p>' +
    '<p class="fbFoot">' + promoterHTML + '</p>' +
  '</div>';
  youBox($('fbYou'), 'fbInc', false);
  window.scrollTo(0, 0);
}

/* ---------------- detail sheet ---------------- */
var sheetOpen = false, lastFocus = null, onSheet = null;
function openSheet(id){
  var c = BY[id]; if (!c) return;
  $('shBody').innerHTML = detailHTML(c);
  var sh = $('sheet'), bk = $('sheetBack');
  bk.hidden = false; void bk.offsetWidth; bk.classList.add('on');
  sh.classList.add('open'); sh.setAttribute('aria-hidden', 'false'); sh.scrollTop = 0;
  lastFocus = document.activeElement;
  sheetOpen = true;
  setTimeout(function(){ try { $('shX').focus({ preventScroll:true }); } catch (e){} }, 80);
  if (onSheet) onSheet(id, true);
}
function closeSheet(){
  if (!sheetOpen) return;
  var sh = $('sheet'), bk = $('sheetBack');
  sheetOpen = false;
  bk.classList.remove('on'); setTimeout(function(){ if (!sheetOpen) bk.hidden = true; }, 320);
  sh.classList.remove('open'); sh.setAttribute('aria-hidden', 'true');
  if (lastFocus && lastFocus.focus) { try { lastFocus.focus({ preventScroll:true }); } catch (e){} }
  if (onSheet) onSheet(null, false);
}
$('shX').addEventListener('click', closeSheet);
$('sheetBack').addEventListener('click', closeSheet);
document.addEventListener('keydown', function(e){
  if (e.key === 'Escape'){ closeSheet(); var y = $('you'); if (y.classList.contains('open')) toggleYou(false); }
});
function toggleYou(open){
  var y = $('you'), b = $('youBtn');
  if (open === undefined) open = !y.classList.contains('open');
  y.classList.toggle('open', open); b.setAttribute('aria-expanded', String(open));
  if (open){ var i = y.querySelector('input'); if (i) setTimeout(function(){ i.focus({ preventScroll:true }); }, 30); }
  if (window.__townMeasure) window.__townMeasure();
}

/* ---------------- boot ---------------- */
if (!CH){ showFallback('data'); return; }
headlines();
placeLegend();
youBox($('you'), 'youInc', true);
$('you').addEventListener('click', function(e){ if (e.target.closest('.youX')) toggleYou(false); });
$('youBtn').addEventListener('click', function(){ toggleYou(); });
if (scrollMode) body.classList.add('scrollMode');

function webglOK(){
  try {
    var c = document.createElement('canvas');
    var gl = c.getContext('webgl2') || c.getContext('webgl');
    if (!gl) return false;
    var x = gl.getExtension('WEBGL_lose_context'); if (x) x.loseContext();
    return true;
  } catch (e){ return false; }
}
function setMsg(m){ var el = $('ldMsg'); if (el) el.textContent = m; }

if (Q.has('fallback')){ showFallback('forced'); return; }
if (!webglOK()){ showFallback('webgl'); return; }
var dynImport;
try { dynImport = new Function('u', 'return import(u)'); } catch (e){ showFallback('load'); return; }
var watchdog = setTimeout(function(){ if (!ready) showFallback('slow'); }, 25000);
function fontsReady(){
  if (!document.fonts || !document.fonts.load) return Promise.resolve();
  return Promise.race([
    Promise.all([document.fonts.load('800 64px "Public Sans"'), document.fonts.load('700 40px Newsreader')]).catch(function(){}),
    new Promise(function(r){ setTimeout(r, 2500); })
  ]);
}
setMsg('Fetching the 3D engine');
Promise.all([dynImport('three'), dynImport('three/addons/controls/OrbitControls.js'), fontsReady()]).then(function(m){
  if (dead) return;
  setMsg('Raising the houses');
  setTimeout(function(){
    if (dead) return;
    try { start3D(m[0], m[1].OrbitControls); }
    catch (err){ console.warn('3D town failed to start:', err); showFallback('error'); }
  }, 30);
}).catch(function(err){ console.warn('3D town could not load:', err); showFallback('load'); });

/* ============================================================
   THE 3D TOWN
   ============================================================ */
function start3D(THREE, OrbitControls){
  var stage = $('stage'), glBox = $('gl'), slider = $('slider'), cardsBox = $('cards');
  var W = stage.clientWidth || innerWidth, H = stage.clientHeight || innerHeight;
  var small = Math.min(W, H) < 700 || coarse;
  var pr = Math.min(window.devicePixelRatio || 1, small ? 1.75 : 2);

  /* ---------- renderer ---------- */
  var renderer = new THREE.WebGLRenderer({ antialias: pr < 1.75, powerPreference: 'high-performance' });
  if (!renderer.getContext()) throw new Error('No WebGL context');
  renderer.setPixelRatio(pr);
  renderer.setSize(W, H);
  renderer.setClearColor(0xF4EFE5, 1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  glBox.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xF3EEE4, 300, 900);
  var camera = new THREE.PerspectiveCamera(W / H < 0.8 ? 50 : 36, W / H, 1, 2600);

  /* ---------- the sweep: everything left of the line is "with us" ----------
     One shared uniform drives every material: right of the line is greyed,
     faded and a touch cooler; left of it is full, warm colour. */
  var WIPE = { uWipeX: { value: -1e7 }, uWipeSoft: { value: 16 * pr } };
  var WIPE_DECL = 'uniform float uWipeX;\nuniform float uWipeSoft;\n';
  var WIPE_GLSL = [
    '{',
    '  float wk = smoothstep(uWipeX - uWipeSoft, uWipeX + uWipeSoft, gl_FragCoord.x);',
    '  vec3 wc = gl_FragColor.rgb;',
    '  float wl = dot(wc, vec3(0.299, 0.587, 0.114));',
    '  vec3 wn = mix(vec3(wl), wc, 0.16) * 0.86 + vec3(0.028, 0.036, 0.05);',
    '  float we = 1.0 - smoothstep(0.0, uWipeSoft * 2.6, abs(gl_FragCoord.x - uWipeX));',
    '  gl_FragColor.rgb = mix(wc, wn, wk) + vec3(0.30, 0.16, 0.0) * we * 0.45;',
    '}'].join('\n');
  function patch(mat){
    mat.onBeforeCompile = function(sh){
      sh.uniforms.uWipeX = WIPE.uWipeX; sh.uniforms.uWipeSoft = WIPE.uWipeSoft;
      sh.fragmentShader = WIPE_DECL + sh.fragmentShader.replace('#include <dithering_fragment>', WIPE_GLSL + '\n#include <dithering_fragment>');
    };
    mat.customProgramCacheKey = function(){ return 'wipe1'; };
    return mat;
  }
  var MAT = patch(new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }));
  var MAT_GLOW = patch(new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, emissive: new THREE.Color('#FFB347'), emissiveIntensity: 0.6 }));
  function v3(hex){ return new THREE.Vector3(parseInt(hex.slice(1, 3), 16) / 255, parseInt(hex.slice(3, 5), 16) / 255, parseInt(hex.slice(5, 7), 16) / 255); }

  /* ---------- light: soft daylight ---------- */
  var hemi = new THREE.HemisphereLight(0xF4F8FC, 0xD9CDB0, 1.75);
  scene.add(hemi);
  var sun = new THREE.DirectionalLight(0xFFF1DC, 1.95);
  sun.position.set(55, 95, 48);
  scene.add(sun); scene.add(sun.target);
  sun.castShadow = true;
  var SM = small ? 1024 : 2048;
  sun.shadow.mapSize.set(SM, SM);
  var sc = sun.shadow.camera;
  sc.left = -74; sc.right = 74; sc.top = 74; sc.bottom = -74; sc.near = 20; sc.far = 260;
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.06;
  var shadowsOn = true, shadowDirty = true;

  /* ---------- sky and sea ---------- */
  var sky = new THREE.Mesh(new THREE.SphereGeometry(1200, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: { uWipeX: WIPE.uWipeX, uWipeSoft: WIPE.uWipeSoft, uTop: { value: v3('#AED2EA') }, uHor: { value: v3('#F8F1E4') }, uSun: { value: new THREE.Vector3(55, 95, 48).normalize() } },
    vertexShader: 'varying vec3 vD;\nvoid main(){ vD = (modelMatrix * vec4(position, 1.0)).xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: WIPE_DECL + 'uniform vec3 uTop; uniform vec3 uHor; uniform vec3 uSun; varying vec3 vD;\nvoid main(){\n vec3 d = normalize(vD);\n vec3 c = mix(uHor, uTop, smoothstep(0.0, 0.6, d.y));\n float s = max(dot(d, uSun), 0.0);\n c += vec3(1.0, 0.86, 0.62) * pow(s, 28.0) * 0.2;\n gl_FragColor = vec4(c, 1.0);\n' + WIPE_GLSL + '\n}'
  }));
  sky.frustumCulled = false; sky.renderOrder = -10;
  scene.add(sky);

  var seaMat = new THREE.ShaderMaterial({
    uniforms: { uWipeX: WIPE.uWipeX, uWipeSoft: WIPE.uWipeSoft, uTime: { value: 0 }, uShallow: { value: v3('#A9DED7') }, uDeep: { value: v3('#7CB9D6') },
      uFoam: { value: v3('#FFFFFF') }, uFog: { value: v3('#F4EEE3') }, uFogN: { value: 300 }, uFogF: { value: 900 } },
    vertexShader: 'varying vec3 vW;\nvoid main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: WIPE_DECL + [
      'uniform float uTime; uniform vec3 uShallow; uniform vec3 uDeep; uniform vec3 uFoam; uniform vec3 uFog; uniform float uFogN; uniform float uFogF; varying vec3 vW;',
      'float coastR(float a){ return 58.0 + 3.2 * sin(3.0 * a + 1.0) + 2.1 * sin(5.0 * a + 2.3) + 1.2 * sin(9.0 * a + 0.7); }',
      'void main(){',
      '  float d = length(vW.xz);',
      '  float e = d - coastR(atan(vW.z, vW.x));',
      '  vec3 c = mix(uShallow, uDeep, smoothstep(-1.0, 26.0, e));',
      '  float w = sin(e * 1.05 + uTime * 1.25);',
      '  float foam = (1.0 - smoothstep(-0.5, 9.0, e)) * smoothstep(0.62, 1.0, w);',
      '  c = mix(c, uFoam, foam * 0.5);',
      '  float g = sin(vW.x * 0.33 + uTime * 0.55) * sin(vW.z * 0.29 - uTime * 0.45);',
      '  c += smoothstep(0.9, 1.0, g) * 0.06;',
      '  c = mix(c, uFog, smoothstep(uFogN, uFogF, distance(vW, cameraPosition)));',
      '  gl_FragColor = vec4(c, 1.0);',
      WIPE_GLSL,
      '}'].join('\n')
  });
  var sea = new THREE.Mesh(new THREE.CircleGeometry(1150, 72), seaMat);
  sea.rotation.x = -Math.PI / 2; sea.position.y = -0.42;
  scene.add(sea);

  /* ---------- the land ---------- */
  function coastR(a){ return 58 + 3.2 * Math.sin(3 * a + 1) + 2.1 * Math.sin(5 * a + 2.3) + 1.2 * Math.sin(9 * a + 0.7); }
  function hill(x, z, cx, cz, r0, r1, h){
    var d = Math.hypot(x - cx, z - cz);
    if (d <= r0) return h; if (d >= r1) return 0;
    var k = 1 - (d - r0) / (r1 - r0); return h * k * k * (3 - 2 * k);
  }
  function terrainH(x, z){
    var d = Math.hypot(x, z), R = coastR(Math.atan2(z, x)), h;
    if (d < R - 6) h = 0;
    else if (d < R){ var k = (d - (R - 6)) / 6; h = -0.62 * k * k; }
    else { h = -0.62 - 3.2 * Math.min(1, (d - R) / 9); }
    h += hill(x, z, 22, -21, 7.5, 12.5, 4.2);   // the mansion's hill
    h += hill(x, z, -37, -36, 0, 9, 5.5);       // north-west headland
    h += hill(x, z, 43, 31, 0, 7, 3.0);         // south-east knoll
    return h;
  }
  function hash2(x, z){ var s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); }
  var seed = 7;
  function rnd(){ seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
  function pick(a){ return a[Math.floor(rnd() * a.length)]; }

  /* ---------- geometry kit: everything static is merged by colour ---------- */
  function tpl(g){ var n = g.index ? g.toNonIndexed() : g; if (n.attributes.uv) n.deleteAttribute('uv'); n.computeVertexNormals(); return n; }
  var T_BOX = tpl(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0));
  var T_CYL6 = tpl(new THREE.CylinderGeometry(0.5, 0.5, 1, 6).translate(0, 0.5, 0));
  var T_CYL10 = tpl(new THREE.CylinderGeometry(0.5, 0.5, 1, 10).translate(0, 0.5, 0));
  var T_CYL16 = tpl(new THREE.CylinderGeometry(0.5, 0.5, 1, 16).translate(0, 0.5, 0));
  var T_CONE6 = tpl(new THREE.ConeGeometry(0.5, 1, 6).translate(0, 0.5, 0));
  var T_CONE4 = tpl(new THREE.ConeGeometry(0.5, 1, 4).translate(0, 0.5, 0));
  var T_ICO = tpl(new THREE.IcosahedronGeometry(0.5, 0));
  var T_ICO1 = tpl(new THREE.IcosahedronGeometry(0.5, 1));
  var T_DOME = tpl(new THREE.SphereGeometry(0.5, 14, 7, 0, Math.PI * 2, 0, Math.PI / 2));
  var T_DISC = tpl(new THREE.CircleGeometry(0.5, 44).rotateX(-Math.PI / 2));
  var T_GABLE = (function(){
    var v = [], A = [-0.5, 0, 0.5], B = [0.5, 0, 0.5], C = [0.5, 0, -0.5], D = [-0.5, 0, -0.5], E = [-0.5, 1, 0], F = [0.5, 1, 0];
    function tri(a, b, c){ v.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); }
    tri(A, B, F); tri(A, F, E); tri(C, D, E); tri(C, E, F); tri(D, A, E); tri(B, C, F); tri(A, D, C); tri(A, C, B);
    var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.computeVertexNormals(); return g;
  })();
  var PLANE = new THREE.PlaneGeometry(1, 1);

  var UPV = new THREE.Vector3(0, 1, 0), ONE = new THREE.Vector3(1, 1, 1);
  var _q = new THREE.Quaternion(), _e = new THREE.Euler(0, 0, 0, 'YXZ'), _p = new THREE.Vector3(), _s = new THREE.Vector3();
  var _L = new THREE.Matrix4(), _M = new THREE.Matrix4(), _c = new THREE.Color(), _v = new THREE.Vector3(), _nm = new THREE.Matrix3();
  var BK = {}, U = {};

  function newBucket(anchor){ return { anchor: anchor, std: { p: [], n: [], c: [] }, glow: { p: [], n: [], c: [] }, extras: [] }; }
  function bucket(key, b){
    var k = BK[key];
    if (!k) k = BK[key] = newBucket(key === 'static' ? new THREE.Vector3() : new THREE.Vector3(b.x, b.y, b.z));
    return k;
  }
  function addGeo(L, g, M, hex){
    var p = g.attributes.position.array, n = g.attributes.normal.array;
    _nm.getNormalMatrix(M); _c.set(hex);
    for (var i = 0; i < p.length; i += 3){
      _v.set(p[i], p[i + 1], p[i + 2]).applyMatrix4(M); L.p.push(_v.x, _v.y, _v.z);
      _v.set(n[i], n[i + 1], n[i + 2]).applyMatrix3(_nm).normalize(); L.n.push(_v.x, _v.y, _v.z);
      L.c.push(_c.r, _c.g, _c.b);
    }
  }
  function triW(L, a, b, c, hex){
    _c.set(hex);
    var ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    var nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    if (ny < 0){ var t = b; b = c; c = t; nx = -nx; ny = -ny; nz = -nz; }
    var l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
    [a, b, c].forEach(function(q){ L.p.push(q[0], q[1], q[2]); L.n.push(nx, ny, nz); L.c.push(_c.r, _c.g, _c.b); });
  }

  function Bld(key, x, z, ry, y){
    this.key = key; this.x = x; this.z = z; this.y = y || 0; this.tmp = null;
    this.F = new THREE.Matrix4().compose(new THREE.Vector3(x, this.y, z), new THREE.Quaternion().setFromAxisAngle(UPV, ry || 0), ONE);
  }
  Bld.prototype.sub = function(lx, ly, lz, ry){
    var b = Object.create(Bld.prototype);
    b.key = this.key; b.x = this.x; b.y = this.y; b.z = this.z; b.tmp = this.tmp;
    b.F = this.F.clone().multiply(new THREE.Matrix4().compose(new THREE.Vector3(lx, ly, lz), new THREE.Quaternion().setFromAxisAngle(UPV, ry || 0), ONE));
    return b;
  };
  Bld.prototype.put = function(g, lx, ly, lz, sx, sy, sz, hex, o){
    o = o || {};
    _e.set(o.rx || 0, o.ry || 0, o.rz || 0, 'YXZ'); _q.setFromEuler(_e);
    _L.compose(_p.set(lx, ly, lz), _q, _s.set(sx, sy, sz));
    _M.multiplyMatrices(this.F, _L);
    var bk = this.tmp || bucket(o.key || this.key, this);
    addGeo(o.glow ? bk.glow : bk.std, g, _M, hex);
    return this;
  };
  Bld.prototype.box = function(lx, ly, lz, w, h, d, hex, o){ return this.put(T_BOX, lx, ly, lz, w, h, d, hex, o); };
  Bld.prototype.cyl = function(lx, ly, lz, r, h, hex, o, seg){ return this.put(seg >= 16 ? T_CYL16 : seg >= 10 ? T_CYL10 : T_CYL6, lx, ly, lz, r * 2, h, r * 2, hex, o); };
  Bld.prototype.gable = function(lx, ly, lz, w, h, d, hex, o){ return this.put(T_GABLE, lx, ly, lz, w, h, d, hex, o); };
  Bld.prototype.local = function(lx, ly, lz){ return new THREE.Vector3(lx, ly, lz).applyMatrix4(this.F); };
  var SKINS = ['#F1D2B3', '#E0B48C', '#B9845A', '#8A5A3C', '#F4D9C0'];
  var SHIRTS = ['#D2541F', '#2F5E8C', '#E5A024', '#1E7A55', '#7A4E9C', '#C0392B', '#3E8FA8', '#E07A5F', '#5B6C8F'];
  Bld.prototype.person = function(lx, lz, o){
    o = o || {}; var s = o.s || 1, y = o.y || 0;
    this.put(T_CYL6, lx, y, lz, 0.62 * s, 1.05 * s, 0.62 * s, o.shirt || pick(SHIRTS), o);
    this.put(T_ICO, lx, y + 1.33 * s, lz, 0.56 * s, 0.56 * s, 0.56 * s, o.skin || pick(SKINS), o);
    return this;
  };
  Bld.prototype.car = function(lx, lz, ry, col){
    var b = this.sub(lx, 0, lz, ry);
    b.box(0, 0.32, 0, 1.9, 0.85, 3.7, col); b.box(0, 1.17, -0.25, 1.62, 0.72, 1.95, col);
    b.box(0, 1.2, 0.74, 1.5, 0.55, 0.06, '#A9CCE0');
    [-1.15, 1.15].forEach(function(z){ b.put(T_CYL10, -0.98, 0.37, z, 0.74, 0.3, 0.74, '#3B3F45', { rz: Math.PI / 2 }); b.put(T_CYL10, 1.28, 0.37, z, 0.74, 0.3, 0.74, '#3B3F45', { rz: Math.PI / 2 }); });
    return this;
  };

  /* signs: canvas text on a plane */
  var ST = {
    civic: { bg: '#FFFFFF', fg: '#13161B' }, red: { bg: '#B23A2B', fg: '#FFFFFF' }, green: { bg: '#1E7A55', fg: '#FFFFFF' },
    flame: { bg: '#D2541F', fg: '#FFFFFF' }, amber: { bg: '#E5A024', fg: '#13161B' }, grey: { bg: '#6E747C', fg: '#FFFFFF' }, steel: { bg: '#5F666E', fg: '#F2E2B6' }
  };
  var maxAniso = renderer.capabilities.getMaxAnisotropy();
  function signTex(text, st){
    var fs = 64, pad = 30, c = document.createElement('canvas'), x = c.getContext('2d');
    var font = '800 ' + fs + 'px "Public Sans", system-ui, sans-serif';
    x.font = font;
    c.width = Math.min(2048, Math.ceil(x.measureText(text).width) + pad * 2); c.height = 112;
    x = c.getContext('2d');
    x.fillStyle = st.bg; x.fillRect(0, 0, c.width, c.height);
    x.strokeStyle = 'rgba(0,0,0,.12)'; x.lineWidth = 6; x.strokeRect(3, 3, c.width - 6, c.height - 6);
    x.font = font; x.fillStyle = st.fg; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(text, c.width / 2, c.height / 2 + 4);
    var t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = Math.min(4, maxAniso);
    return { tex: t, aspect: c.width / c.height };
  }
  Bld.prototype.sign = function(text, lx, ly, lz, h, st, o){
    o = o || {};
    var tx = signTex(text, st), w = h * tx.aspect;
    var m = new THREE.Mesh(PLANE, new THREE.MeshBasicMaterial({ map: tx.tex }));
    _e.set(0, o.ry || 0, 0, 'YXZ'); _q.setFromEuler(_e);
    _L.compose(_p.set(lx, ly, lz), _q, _s.set(w, h, 1));
    _M.multiplyMatrices(this.F, _L);
    _M.decompose(m.position, m.quaternion, m.scale);
    (this.tmp || bucket(o.key || this.key, this)).extras.push(m);
    if (o.posts){
      var pc = o.postCol || '#8D9298';
      this.box(lx - w / 2 + 0.12, 0, lz - 0.1, 0.14, ly + h / 2, 0.14, pc, { key: o.key });
      this.box(lx + w / 2 - 0.12, 0, lz - 0.1, 0.14, ly + h / 2, 0.14, pc, { key: o.key });
    }
    if (o.board !== false) this.box(lx, ly - h / 2 - 0.05, lz - 0.08, w + 0.2, h + 0.1, 0.1, st.bg, { key: o.key });
    return this;
  };
  function unit(id, x, y, z){ U[id] = { id: id, pos: new THREE.Vector3(x, y, z), s: 0, state: false, v: 0, groups: { now: [], us: [] } }; }

  /* places the trees must keep clear of */
  var RECTS = [], CIRCS = [], SEGS = [];
  function blockRect(cx, cz, w, d, pad){ pad = pad || 0; RECTS.push([cx - w / 2 - pad, cz - d / 2 - pad, cx + w / 2 + pad, cz + d / 2 + pad]); }
  function blockCircle(x, z, r){ CIRCS.push([x, z, r]); }
  function blocked(x, z){
    if (Math.hypot(x, z) < 16.5) return true;
    var e = Math.sqrt((x / 46) * (x / 46) + (z / 42) * (z / 42)); if (Math.abs(e - 1) < 0.08) return true;
    for (var i = 0; i < RECTS.length; i++){ var r = RECTS[i]; if (x > r[0] && x < r[2] && z > r[1] && z < r[3]) return true; }
    for (i = 0; i < CIRCS.length; i++){ var c = CIRCS[i]; if (Math.hypot(x - c[0], z - c[1]) < c[2]) return true; }
    for (i = 0; i < SEGS.length; i++){
      var s = SEGS[i], dx = s[2] - s[0], dz = s[3] - s[1], l2 = dx * dx + dz * dz, k = clamp(((x - s[0]) * dx + (z - s[1]) * dz) / (l2 || 1), 0, 1);
      if (Math.hypot(x - (s[0] + dx * k), z - (s[1] + dz * k)) < s[4]) return true;
    }
    return false;
  }

  var WIN_OFF = '#5D6A77', WIN_ON = '#FFD27A';
  var WALLS = ['#F6EFE2', '#F3E3CF', '#EAF0E6', '#F7E9D9', '#EEE9F2', '#F4ECD6', '#E8EEF3'];
  var ROOFS = ['#C9643F', '#6C8BA8', '#D2541F', '#7FA36B', '#B5654A', '#5F7E9C', '#C77B47'];
  var PASTEL = ['#F2C6A0', '#BFD8C2', '#F4E1A6', '#C9D6E8', '#F1C9C3', '#D8E5B8'];
  var GLOW = { glow: true };

  /* ---------- roads, plaza and the railway ---------- */
  var ST_B = bucket('static', null);
  function ribbon(pts, w, y, hex, closed){
    var n = pts.length, L = [], R = [];
    for (var i = 0; i < n; i++){
      var p = pts[i], a = pts[closed ? (i - 1 + n) % n : Math.max(0, i - 1)], b = pts[closed ? (i + 1) % n : Math.min(n - 1, i + 1)];
      var dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
      L.push([p[0] - dz * w / 2, y, p[1] + dx * w / 2]); R.push([p[0] + dz * w / 2, y, p[1] - dx * w / 2]);
    }
    for (var j = 0; j < (closed ? n : n - 1); j++){ var k = (j + 1) % n; triW(ST_B.std, L[j], R[j], L[k], hex); triW(ST_B.std, R[j], R[k], L[k], hex); }
  }
  var ROADS = [
    [[[-35.5, 0], [-14, 0]], 3.2], [[[14, 0], [36, 0]], 3.2], [[[0, -14], [0, -36]], 3.2], [[[0, 14], [0, 33]], 3.2],
    [[[-31, 21], [36, 21]], 2.8], [[[36, 0], [36, 21]], 2.8], [[[-31, 0], [-31, 21]], 2.8], [[[-31, -14], [0, -14]], 2.8], [[[-31, 0], [-31, -14]], 2.8]
  ];
  ROADS.forEach(function(r, i){
    ribbon(r[0], r[1], 0.04 + (i % 3) * 0.008, '#D9D2C3', false);
    SEGS.push([r[0][0][0], r[0][0][1], r[0][1][0], r[0][1][1], r[1] / 2 + 1.6]);
    if (r[1] > 3){ // centre dashes on the avenues
      var a = r[0][0], b = r[0][1], len = Math.hypot(b[0] - a[0], b[1] - a[1]), ang = Math.atan2(b[0] - a[0], b[1] - a[1]);
      var sb = new Bld('static', 0, 0, 0);
      for (var d = 2; d < len - 1; d += 3.4){ var k = d / len; sb.put(T_BOX, lerp(a[0], b[0], k), 0.06, lerp(a[1], b[1], k), 0.2, 0.02, 1.4, '#F7F3EA', { ry: ang }); }
    }
  });
  var SB = new Bld('static', 0, 0, 0);
  // the ring road round the plaza, and the plaza itself
  (function(){
    var ring = [];
    for (var i = 0; i < 64; i++){ var a = i / 64 * Math.PI * 2; ring.push([Math.cos(a) * 12.5, Math.sin(a) * 12.5]); }
    ribbon(ring, 3.0, 0.05, '#D9D2C3', true);
    SB.put(T_DISC, 0, 0.065, 0, 21.4, 1, 21.4, '#EDE6D7');
    SB.put(T_DISC, 0, 0.07, 0, 16.2, 1, 16.2, '#E5DCCA');
    SB.put(T_DISC, 0, 0.075, 0, 15.2, 1, 15.2, '#EEE7D9');
  })();
  // the mansion's private drive, up the hill
  (function(){
    var pts = [], i;
    for (i = 0; i <= 12; i++){ var k = i / 12, x = lerp(9.5, 17.6, k), z = lerp(-9.6, -16.6, k); pts.push([x, z]); }
    var L = [], R = [];
    pts.forEach(function(p, j){
      var a = pts[Math.max(0, j - 1)], b = pts[Math.min(pts.length - 1, j + 1)], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz); dx /= l; dz /= l;
      L.push([p[0] - dz * 1.2, terrainH(p[0] - dz * 1.2, p[1] + dx * 1.2) + 0.06, p[1] + dx * 1.2]);
      R.push([p[0] + dz * 1.2, terrainH(p[0] + dz * 1.2, p[1] - dx * 1.2) + 0.06, p[1] - dx * 1.2]);
    });
    for (i = 0; i < pts.length - 1; i++){ triW(ST_B.std, L[i], R[i], L[i + 1], '#E2D6BC'); triW(ST_B.std, R[i], R[i + 1], L[i + 1], '#E2D6BC'); }
    SEGS.push([9.5, -9.6, 17.6, -16.6, 2.6]);
  })();
  // the railway loop
  var TRACK = new THREE.EllipseCurve(0, 0, 46, 42, 0, Math.PI * 2, false, 0);
  TRACK.arcLengthDivisions = 500;
  (function(){
    var pts = TRACK.getSpacedPoints(220).slice(0, 220).map(function(p){ return [p.x, p.y]; });
    ribbon(pts, 3.4, 0.07, '#CEC5B2', true);
    var rl = [], rr = [];
    pts.forEach(function(p, i){
      var a = pts[(i - 1 + 220) % 220], b = pts[(i + 1) % 220], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz); dx /= l; dz /= l;
      rl.push([p[0] - dz * 0.75, p[1] + dx * 0.75]); rr.push([p[0] + dz * 0.75, p[1] - dx * 0.75]);
      if (i % 1 === 0) SB.put(T_BOX, p[0], 0.08, p[1], 2.7, 0.12, 0.42, '#A08A6B', { ry: Math.atan2(dx, dz) });
    });
    ribbon(rl, 0.2, 0.24, '#7E8187', true);
    ribbon(rr, 0.2, 0.24, '#7E8187', true);
  })();

  /* ---------- the buildings ---------- */
  var PTS = {}; // where money flows start and end
  // the public purse (IRD), in the middle of the plaza
  (function(){
    var s = new Bld('static', 0, 0, 0), n = new Bld('purse:now', 0, 0, 0), u = new Bld('purse:us', 0, 0, 0);
    s.box(0, 0, 0, 15, 0.9, 11, '#E4DBC8');
    s.box(0, 0, 6.1, 9.4, 0.3, 1.4, '#EDE6D7'); s.box(0, 0, 5.5, 9.4, 0.6, 1.2, '#E9E1D0');
    s.box(0, 0.9, -0.6, 11.4, 5, 7.6, '#F5F0E6');
    for (var i = 0; i < 6; i++) s.cyl(-4.6 + i * 1.84, 0.9, 4.25, 0.38, 4.45, '#FFFFFF', null, 10);
    s.box(0, 5.3, 2.9, 12.4, 0.85, 3.3, '#EFE8DA');
    s.put(T_GABLE, 0, 6.15, 2.9, 3.3, 1.7, 12.4, '#F2ECE0', { ry: Math.PI / 2 });
    s.box(0, 5.9, -0.6, 11.8, 0.35, 7.9, '#E3DACA');
    s.cyl(0, 6.2, -0.9, 3.1, 1.4, '#EFE8DA', null, 16);
    s.put(T_DOME, 0, 7.55, -0.9, 5.9, 5.6, 5.9, '#E5A024');
    s.cyl(0, 10.3, -0.9, 0.42, 0.9, '#FFFFFF', null, 10);
    s.cyl(0, 11.2, -0.9, 0.06, 3.0, '#8A8F96');
    s.sign('IRD · PUBLIC PURSE', 0, 5.72, 4.62, 0.58, ST.civic, { board: false });
    var wins = [];
    for (var j = 0; j < 3; j++){ wins.push([5.74, 2.6, -3.4 + j * 2.6, 0.1, 1.8, 1.1]); wins.push([-5.74, 2.6, -3.4 + j * 2.6, 0.1, 1.8, 1.1]); }
    wins.push([-3.3, 2.0, 3.24, 1.2, 2.0, 0.1]); wins.push([3.3, 2.0, 3.24, 1.2, 2.0, 0.1]);
    wins.forEach(function(w){ n.box(w[0], w[1], w[2], w[3], w[4], w[5], WIN_OFF); u.box(w[0], w[1], w[2], w[3], w[4], w[5], WIN_ON, GLOW); });
    n.box(0, 0.9, 3.22, 2.4, 3.2, 0.14, '#5E636B');
    u.box(0, 0.9, 3.22, 2.4, 3.2, 0.14, WIN_ON, GLOW);
    n.box(0.72, 13.25, -0.9, 1.3, 0.8, 0.05, '#9A9DA2');
    u.box(1.0, 13.0, -0.9, 1.9, 1.15, 0.06, '#D2541F');
    u.person(-3.2, 7.4); u.person(-1.8, 8.1); u.person(2.6, 7.6); u.person(3.8, 7.0); u.person(0.4, 8.6, { s: 0.68 });
    unit('purse', 0, 6, 0);
    PTS.purse = new THREE.Vector3(0, 11.2, -0.9);
  })();

  // the mansion on its hill, and the vault behind it
  var HY = terrainH(22, -21);
  (function(){
    var ry = -Math.PI / 4;
    var s = new Bld('static', 22, -21, ry, HY), n = new Bld('mansion:now', 22, -21, ry, HY), u = new Bld('mansion:us', 22, -21, ry, HY);
    s.box(0, -1.4, 0, 15, 1.6, 11, '#E7DDCB');
    s.box(0, 0.2, -0.6, 12, 3.6, 7, '#FBF8F2');
    s.box(-1.4, 3.8, -1.3, 8.2, 3.0, 5.6, '#FBF8F2');
    s.box(0, 3.8, -0.6, 12.6, 0.35, 7.6, '#4F5761');
    s.box(-1.4, 6.8, -1.3, 8.8, 0.35, 6.2, '#4F5761');
    s.box(0, 0.7, 2.93, 10.4, 2.4, 0.1, '#9CC3DA');
    s.box(-1.4, 4.3, 1.53, 7.2, 2.0, 0.1, '#9CC3DA');
    s.box(4.9, 0.2, 2.6, 0.5, 3.6, 0.5, '#E5A024'); s.box(-4.9, 0.2, 2.6, 0.5, 3.6, 0.5, '#E5A024');
    s.box(3.4, 0.2, 5.0, 6.6, 0.25, 3.6, '#EADFC6');
    s.box(3.4, 0.27, 5.0, 5.2, 0.2, 2.4, '#63C3DC');
    s.box(-4.0, 0.2, 4.7, 3.4, 0.7, 2.6, '#79B262');
    s.box(6.9, 0.2, -1.4, 3.2, 2.6, 4.6, '#F1ECE2'); s.box(6.9, 2.8, -1.4, 3.5, 0.3, 4.9, '#4F5761');
    s.car(-6.6, 1.6, 0.2, '#E5A024');
    // now: gold piled on the lawn
    [[-3.2, 6.8], [-2.2, 7.3], [-4.2, 7.4]].forEach(function(g){ n.box(g[0], 0.2, g[1], 0.9, 0.36, 0.5, '#F2B53A', GLOW); n.box(g[0] + 0.1, 0.56, g[1], 0.7, 0.3, 0.42, '#F2B53A', GLOW); });
    u.sign('TAXED LIKE WAGES', -0.6, 1.55, 7.2, 0.5, ST.green, { posts: true });
    unit('mansion', 22, HY + 3, -21);
    blockCircle(22, -21, 9.2);
    PTS.mansion = s.local(-1.4, 7.4, -1.3);
  })();
  (function(){
    var vx = 33.5, vz = -13.5, hy = terrainH(vx, vz) - 0.6, ry = 0.35;
    var s = new Bld('static', vx, vz, ry, hy), n = new Bld('mansion:now:v', vx, vz, ry, hy), u = new Bld('mansion:us:v', vx, vz, ry, hy);
    s.box(0, -1.2, 0, 6.6, 5.6, 5.4, '#8D959E');
    s.box(0, 4.4, 0, 6.0, 0.5, 4.8, '#A3ABB4');
    s.box(0, 0.25, 2.72, 4.2, 3.7, 0.2, '#B3BAC2');
    s.sign('VAULT', 0, 4.25, 2.86, 0.48, ST.steel, { board: false });
    n.box(0, 0.45, 2.66, 3.2, 3.2, 0.12, '#FFC64D', GLOW);
    n.put(T_CYL16, 2.45, 2.05, 3.0, 3.1, 0.42, 3.1, '#C9A227', { rx: Math.PI / 2, ry: 1.25 });
    [[-1.2, 3.8], [-0.2, 4.2], [0.9, 3.9]].forEach(function(g){ n.box(g[0], 0.25, g[1], 0.8, 0.32, 0.45, '#F2B53A', GLOW); });
    u.put(T_CYL16, 0, 2.05, 2.82, 3.1, 0.42, 3.1, '#C9A227', { rx: Math.PI / 2 });
    u.put(T_CYL10, 0, 2.05, 3.24, 0.9, 0.25, 0.9, '#8A6F1C', { rx: Math.PI / 2 });
    blockCircle(vx, vz, 5.4);
    PTS.vault = s.local(0, 2.0, 3.0);
    VX = { x: vx, z: vz, y: hy, ry: ry };
  })();
  var VX;

  // the health centre: a GP and a dentist
  (function(){
    var s = new Bld('static', 22, 12, 0), n = new Bld('health:now', 22, 12, 0), u = new Bld('health:us', 22, 12, 0);
    s.box(0, 0, 0, 12, 4, 7, '#FAFBF8');
    s.box(0, 3.1, 0, 12.08, 0.55, 7.08, '#86CDB0');
    s.box(0, 4, 0, 12.4, 0.35, 7.4, '#DDE8E3');
    s.box(0, 4.35, 2.3, 0.8, 2.4, 0.45, '#2E9E6E'); s.box(0, 5.15, 2.3, 2.4, 0.8, 0.45, '#2E9E6E');
    s.box(-3, 0, 3.52, 2.3, 2.85, 0.1, '#E4EEEA'); s.box(3, 0, 3.52, 2.3, 2.85, 0.1, '#E4EEEA');
    s.sign('GP', -3, 3.37, 3.64, 0.48, ST.civic, { board: false });
    s.sign('DENTIST', 3, 3.37, 3.64, 0.48, ST.civic, { board: false });
    [[-5.1, 3.55, 1.4, 0.1], [0, 3.55, 1.4, 0.1], [5.1, 3.55, 1.4, 0.1]].forEach(function(w){ n.box(w[0], 1.3, w[1], w[2], 1.3, w[3], WIN_OFF); u.box(w[0], 1.3, w[1], w[2], 1.3, w[3], WIN_ON, GLOW); });
    [-1.6, 1.6].forEach(function(z){ n.box(6.04, 1.3, z, 0.1, 1.3, 1.6, WIN_OFF); n.box(-6.04, 1.3, z, 0.1, 1.3, 1.6, WIN_OFF); u.box(6.04, 1.3, z, 0.1, 1.3, 1.6, WIN_ON, GLOW); u.box(-6.04, 1.3, z, 0.1, 1.3, 1.6, WIN_ON, GLOW); });
    n.box(-3, 0, 3.6, 1.7, 2.5, 0.08, '#8D949B'); n.box(3, 0, 3.6, 1.7, 2.5, 0.08, '#8D949B');
    n.sign('FEES', -3, 1.75, 3.74, 0.42, ST.amber);
    n.sign('CLOSED', 3, 1.75, 3.74, 0.42, ST.red);
    n.person(-0.8, 5.8); n.person(5.4, 6.3);
    u.box(-3, 0, 3.6, 1.7, 2.5, 0.08, '#FFE3A3', GLOW); u.box(3, 0, 3.6, 1.7, 2.5, 0.08, '#FFE3A3', GLOW);
    u.sign('FREE', -3, 2.75, 3.74, 0.42, ST.green); u.sign('FREE', 3, 2.75, 3.74, 0.42, ST.green);
    u.person(-3.4, 4.6); u.person(-2.3, 5.5); u.person(2.6, 4.7); u.person(3.7, 5.7, { s: 0.7 }); u.person(5.4, 6.2);
    u.box(-0.4, 0, 5.6, 2.4, 0.5, 0.7, '#A07A55'); u.person(-1.0, 5.6, { y: 0.1 }); u.person(0.2, 5.6, { y: 0.1 });
    unit('health', 22, 3, 12);
    blockRect(22, 13, 13, 10, 0.5);
    PTS.health = new THREE.Vector3(22, 5.0, 12);
  })();

  // the train station, on the loop line
  (function(){
    var X = -39.5, ry = Math.PI / 2;
    var s = new Bld('static', X, 0, ry), n = new Bld('station:now', X, 0, ry), u = new Bld('station:us', X, 0, ry);
    s.box(0, 0, -3.4, 20, 0.95, 2.6, '#DAD3C4');
    s.box(0, 0.95, -4.55, 20, 0.03, 0.22, '#E5A024');
    for (var k = -2; k <= 2; k++) s.cyl(k * 4.2, 0.95, -3.0, 0.13, 3.0, '#8D9298');
    s.box(0, 3.95, -3.25, 19.2, 0.28, 3.3, '#D2541F');
    s.box(0, 0, 1.5, 9, 3.7, 5, '#F2E8D7');
    s.gable(0, 3.7, 1.5, 9.6, 1.8, 5.7, '#C9643F');
    s.box(0, 0, 4.02, 2, 2.5, 0.1, '#7A6A58');
    s.sign('STATION', 0, 2.98, 4.12, 0.5, ST.civic, { board: false });
    [-2.9, 2.9].forEach(function(x){ n.box(x, 1.2, 4.04, 1.4, 1.2, 0.08, WIN_OFF); u.box(x, 1.2, 4.04, 1.4, 1.2, 0.08, WIN_ON, GLOW); });
    for (k = -1; k <= 1; k++){ n.box(k * 1.25, 0, 4.75, 0.32, 1.15, 0.9, '#7D838B'); n.box(k * 1.25, 1.15, 4.75, 0.36, 0.12, 0.94, '#B23A2B'); }
    n.sign('FARE GATES', 0, 2.25, 5.25, 0.42, ST.grey, { posts: true });
    n.person(-0.6, 6.6); n.person(0.9, 7.2); n.person(5.6, -3.3, { y: 0.95 });
    for (k = 0; k < 13; k++) u.box(-9 + k * 1.5, 3.5, -1.58, 0.62, 0.42, 0.05, k % 2 ? '#E5A024' : '#D2541F');
    u.sign('FREE · MORE TRAINS', 0, 1.65, 5.6, 0.5, ST.flame, { posts: true });
    [-7.5, -5.4, -1.8, 0.9, 3.6, 6.8].forEach(function(x, i){ u.person(x, -3.2 - (i % 2) * 0.5, { y: 0.95 }); });
    u.person(1.6, 6.4); u.person(-1.4, 6.9, { s: 0.7 });
    unit('station', -39.5, 3, 0);
    blockRect(-40.5, 0, 9, 22, 0.5);
    PTS.station = new THREE.Vector3(-38, 5.6, 0);
  })();

  // the supermarket: the duopoly now, a public market with us
  (function(){
    var s = new Bld('static', -12, -25, 0), n = new Bld('market:now', -12, -25, 0), u = new Bld('market:us', -12, -25, 0);
    s.box(0, 0, 6.0, 14, 0.06, 4.4, '#D3CCBE');
    n.box(0, 0, 0, 13, 4.6, 8, '#CFCBC4'); n.box(0, 4.6, 0, 13.4, 0.4, 8.4, '#B7B2A9');
    n.box(-3.4, 0, 4.03, 2.6, 2.6, 0.1, '#6D737B'); n.box(3.4, 0, 4.03, 2.6, 2.6, 0.1, '#6D737B');
    n.sign('THE BIG TWO', 0, 3.6, 4.14, 0.78, ST.grey);
    n.sign('$1M A DAY', 0, 1.55, 4.14, 0.5, ST.red);
    n.car(-4.6, 6.2, 0, '#9AA1A9'); n.car(-1.8, 6.6, 0.1, '#B6AEA4'); n.car(4.4, 6.1, 0, '#8E969F');
    u.box(0, 0, -0.6, 13, 4.0, 7, '#F7EFDF'); u.gable(0, 4.0, -0.6, 13.6, 2.0, 7.6, '#5DA872');
    for (var k = 0; k < 9; k++) u.box(-6 + k * 1.5, 2.8, 3.85, 1.5, 0.22, 2.0, k % 2 ? '#FFFFFF' : '#4E9E66', { rx: 0.32 });
    u.sign('PUBLIC MARKET', 0, 3.48, 3.0, 0.62, ST.green);
    u.box(0, 0, 2.93, 2.6, 2.4, 0.1, WIN_ON, GLOW);
    [[-3.6], [3.6]].forEach(function(w){ u.box(w[0], 1.0, 2.93, 2.2, 1.4, 0.1, WIN_ON, GLOW); });
    u.sign('WHOLE FOOD · NO ADDED SUGAR', 0, 1.3, 6.9, 0.5, ST.civic, { posts: true });
    var FR = ['#D9453A', '#F08A24', '#7DBA4A', '#F2C230', '#9B5DB0', '#E86A5A', '#5FAE4E'];
    for (k = 0; k < 7; k++){
      var x = -5.8 + k * 1.0 + (k > 2 ? 4.6 : 0);
      u.box(x, 0, 4.7, 0.85, 0.5, 0.7, '#B88B5A');
      for (var f = 0; f < 3; f++) u.put(T_ICO, x - 0.25 + f * 0.25, 0.62, 4.7 + (f % 2) * 0.12 - 0.06, 0.3, 0.3, 0.3, FR[k]);
    }
    u.person(-2.2, 6.0); u.person(1.6, 5.6); u.person(4.6, 7.4); u.person(-4.8, 7.8); u.person(2.8, 8.4, { s: 0.68 });
    unit('market', -12, 3, -25);
    blockRect(-12, -23, 15, 14, 0.5);
  })();

  // the new family homes on 99-year leases (an empty lot now)
  (function(){
    var X = 20, Z = 27, ry = Math.PI;
    var s = new Bld('static', X, Z, ry), n = new Bld('lease:now', X, Z, ry), u = new Bld('lease:us', X, Z, ry);
    n.box(0, 0, 0, 20, 0.08, 7, '#D6C39C');
    for (var x = -10; x <= 10; x += 2.5){ n.box(x, 0, 3.5, 0.15, 1.1, 0.15, '#FFFFFF'); n.box(x, 0, -3.5, 0.15, 1.1, 0.15, '#FFFFFF'); }
    n.box(0, 0.75, 3.5, 20, 0.1, 0.08, '#FFFFFF'); n.box(0, 0.75, -3.5, 20, 0.1, 0.08, '#FFFFFF');
    n.box(10, 0.75, 0, 0.08, 0.1, 7, '#FFFFFF'); n.box(-10, 0.75, 0, 0.08, 0.1, 7, '#FFFFFF');
    n.box(0, 0, -0.8, 6.2, 3.3, 4.4, '#EEE8DC'); n.gable(0, 3.3, -0.8, 6.8, 2.0, 5.0, '#5F6873');
    n.box(-1.6, 1.3, 1.43, 1.5, 1.0, 0.08, WIN_OFF); n.box(1.6, 1.3, 1.43, 1.5, 1.0, 0.08, WIN_OFF);
    n.sign('FOR SALE: OUT OF REACH', 0, 2.2, 4.4, 0.66, ST.red, { posts: true });
    for (var k = 0; k < 6; k++){
      var hx = -8.75 + k * 3.5;
      u.box(hx, 0, 0, 3.35, 3.4, 5.2, PASTEL[k]);
      u.gable(hx, 3.4, 0, 3.5, 1.6, 5.8, k % 2 ? '#C9643F' : '#D2541F');
      u.box(hx - 0.75, 1.8, 2.63, 0.95, 0.9, 0.08, WIN_ON, GLOW);
      u.box(hx + 0.75, 0, 2.63, 0.85, 1.75, 0.08, '#7A5C45');
      u.box(hx, 2.55, 2.63, 1.6, 0.6, 0.08, WIN_ON, GLOW);
      u.box(hx - 0.7, 0, 3.6, 1.6, 0.5, 0.45, '#6FA85A');
    }
    u.sign('99-YEAR LEASE HOMES', -6.6, 1.5, 4.5, 0.5, ST.flame, { posts: true });
    var van = u.sub(-12.2, 0, 0.6, Math.PI / 2);
    van.box(0, 0.35, -0.7, 2.1, 2.5, 4.4, '#FFFFFF'); van.box(0, 0.35, 2.3, 2.0, 1.75, 1.6, '#D2541F'); van.box(0, 1.25, 3.11, 1.7, 0.6, 0.04, '#A9CCE0');
    [-1.9, 2.3].forEach(function(z){ van.put(T_CYL10, -1.0, 0.38, z, 0.76, 0.3, 0.76, '#3B3F45', { rz: Math.PI / 2 }); van.put(T_CYL10, 1.3, 0.38, z, 0.76, 0.3, 0.76, '#3B3F45', { rz: Math.PI / 2 }); });
    [[-9.6, 3.0], [-9.0, 3.3], [-2.4, 3.2]].forEach(function(b){ u.box(b[0], 0, b[1], 0.6, 0.5, 0.5, '#C49A6C'); });
    u.person(-1.0, 4.8); u.person(2.6, 4.9, { s: 0.68 }); u.person(5.8, 4.6);
    unit('lease', X, 3, Z);
    blockRect(X, Z, 23, 9, 0.5);
  })();

  // land near the station: one house now, townhouses with us
  (function(){
    var s = new Bld('static', -22, -8, 0), n = new Bld('towns:now', -22, -8, 0), u = new Bld('towns:us', -22, -8, 0);
    s.box(0, 0, 0, 10.6, 0.06, 6.4, '#B7D79A');
    n.box(-2.4, 0, -0.6, 4.6, 2.7, 4.2, '#EAE2D3'); n.gable(-2.4, 2.7, -0.6, 5.2, 1.7, 4.8, '#8C8F94');
    n.box(-2.4, 1.0, 1.53, 1.6, 0.9, 0.08, WIN_OFF);
    n.sign('ONE HOUSE ONLY', 2.6, 1.3, 2.4, 0.46, ST.grey, { posts: true });
    for (var k = 0; k < 3; k++){
      var x = -3.45 + k * 3.45;
      u.box(x, 0, -0.4, 3.3, 7.4, 5, ['#F1C9C3', '#C9D6E8', '#F4E1A6'][k]);
      u.box(x, 7.4, -0.4, 3.5, 0.35, 5.2, '#5F7E9C');
      for (var f = 0; f < 3; f++){
        u.box(x, 1.0 + f * 2.35, 2.13, 1.7, 1.0, 0.08, WIN_ON, GLOW);
        if (f) u.box(x, f * 2.35 - 0.05, 2.5, 2.4, 0.12, 0.8, '#FFFFFF');
      }
    }
    u.person(-1.6, 3.2); u.person(2.4, 3.0, { s: 0.68 });
    unit('towns', -22, 4, -8);
    blockRect(-22, -8, 11, 7, 0.5);
  })();

  // the bowls club: NZ Super
  (function(){
    var X = -8, Z = 34, ry = Math.PI;
    var s = new Bld('static', X, Z, ry), n = new Bld('bowls:now', X, Z, ry), u = new Bld('bowls:us', X, Z, ry);
    s.box(0, 0, 0, 9.4, 0.1, 6.8, '#F4EFE5'); s.box(0, 0.1, 0, 8.8, 0.06, 6.2, '#7CC46A');
    s.box(6.6, 0, 0, 4, 2.6, 3.4, '#F4EBDB'); s.gable(6.6, 2.6, 0, 4.5, 1.4, 3.9, '#6C8BA8');
    s.sign('BOWLS CLUB', 6.6, 1.95, 1.8, 0.42, ST.civic, { board: false });
    [[-2.6, 1.6], [1.4, -1.2], [2.6, 1.8], [-1.0, -2.0]].forEach(function(b){ s.put(T_ICO, b[0], 0.3, b[1], 0.32, 0.32, 0.32, '#3B3F45'); });
    s.person(-2.0, 1.0, { shirt: '#FFFFFF' }); s.person(1.6, -0.8, { shirt: '#FFFFFF' });
    n.box(-3.6, 0, 3.7, 2.2, 0.5, 0.6, '#A07A55'); n.person(-3.6, 3.7, { shirt: '#9A9DA2', y: 0.1 });
    u.sign('SUPER FOR ALL, FOR GOOD', 0, 1.9, 4.1, 0.56, ST.flame, { posts: true });
    u.person(-3.0, -1.4, { shirt: '#FFFFFF' }); u.person(3.2, 0.4, { shirt: '#FFFFFF' }); u.person(0.4, 2.2, { shirt: '#FFFFFF' }); u.person(-1.0, 4.2);
    unit('bowls', -9, 1.5, 34);
    blockRect(-11, 34, 16, 8, 0.5);
  })();

  // the school (scenery: kids appear with us)
  (function(){
    var s = new Bld('static', -30, -22, 0), n = new Bld('school:now', -30, -22, 0), u = new Bld('school:us', -30, -22, 0);
    s.box(0, 0, -0.5, 9, 3.4, 6, '#E9B496'); s.box(0, 3.0, -0.5, 9.05, 0.25, 6.05, '#FFFFFF');
    s.gable(0, 3.4, -0.5, 9.6, 1.8, 6.6, '#6C8BA8');
    s.box(0, 5.0, -0.5, 1.5, 1.7, 1.5, '#F4EADB'); s.put(T_CONE4, 0, 6.7, -0.5, 2.2, 1.5, 2.2, '#C9643F', { ry: Math.PI / 4 });
    s.box(0, 0, 2.53, 1.8, 2.3, 0.08, '#2F5E8C'); s.sign('SCHOOL', 0, 2.72, 2.62, 0.42, ST.civic, { board: false });
    s.box(6.6, 0, 0, 3.8, 0.06, 5, '#E3C99F');
    s.box(6.2, 0, -1.4, 0.8, 1.6, 0.8, '#E5A024'); s.box(6.2, 0.55, -0.1, 0.8, 0.12, 2.4, '#D2541F', { rx: 0.48 });
    s.box(7.6, 0, 1.4, 0.12, 2.0, 0.12, '#8D9298'); s.box(7.6, 0, -0.4, 0.12, 2.0, 0.12, '#8D9298'); s.box(7.6, 2.0, 0.5, 0.14, 0.12, 2.0, '#8D9298');
    [-3.6, -2.2, 2.2, 3.6].forEach(function(x){ n.box(x, 1.2, 2.54, 1.0, 1.1, 0.08, WIN_OFF); u.box(x, 1.2, 2.54, 1.0, 1.1, 0.08, WIN_ON, GLOW); });
    u.person(5.6, 1.6, { s: 0.65 }); u.person(7.0, 2.2, { s: 0.62 }); u.person(5.4, -0.4, { s: 0.66 }); u.person(2.0, 3.6, { s: 0.64 }); u.person(-2.0, 3.8, { s: 0.6 });
    unit('school', -30, 3, -22);
    blockRect(-27, -22, 15, 8, 0.5);
  })();

  // homes: four worker homes facing the street, three family homes across it
  var HOMES = [];
  function home(id, x, z, ry, i, fam){
    var s = new Bld('static', x, z, ry), n = new Bld(id + ':now', x, z, ry), u = new Bld(id + ':us', x, z, ry);
    var W = 4.6, D = 4.2, fz = D / 2 + 0.04;
    s.box(0, -0.2, 0, W + 0.3, 0.35, D + 0.3, '#E2D8C6');
    s.box(0, 0, 0, W, 2.9, D, WALLS[i % WALLS.length]);
    s.gable(0, 2.9, 0, W + 0.6, 1.9, D + 0.7, ROOFS[i % ROOFS.length]);
    s.box(1.3, 3.3, -0.7, 0.6, 1.7, 0.6, '#B98B6E');
    s.box(-1.25, 0, fz, 0.9, 1.75, 0.08, '#7A5C45');
    s.box(-1.25, 0, D / 2 + 1.6, 0.9, 0.05, 3.0, '#E7DDC8');
    if (!fam){ s.box(1.0, 0, D / 2 + 2.3, 2.6, 0.55, 0.5, '#6FA85A'); }
    var wins = [[0.85, 1.05, fz, 1.5, 0.95, 0.09], [W / 2 + 0.04, 1.05, 0, 0.09, 0.95, 1.4], [-W / 2 - 0.04, 1.05, 0, 0.09, 0.95, 1.4]];
    wins.forEach(function(w){ n.box(w[0], w[1], w[2], w[3], w[4], w[5], WIN_OFF); u.box(w[0], w[1], w[2], w[3], w[4], w[5], WIN_ON, GLOW); });
    u.box(-1.25, 1.95, fz + 0.02, 0.3, 0.3, 0.1, '#FFE7A8', GLOW);
    ['#F06A8A', '#F2C230', '#E8553F', '#B07CDB', '#F2C230'].forEach(function(col, k){ u.put(T_ICO, 0.0 + k * 0.5, 0.62, D / 2 + 2.3 + (fam ? -1.6 : 0) + (k % 2) * 0.1, 0.36, 0.36, 0.36, col); });
    if (fam){
      var sw = u.sub(1.7, 0, D / 2 + 1.7, 0);
      sw.box(-0.9, 0, 0, 0.1, 1.7, 0.1, '#8D9298'); sw.box(0.9, 0, 0, 0.1, 1.7, 0.1, '#8D9298'); sw.box(0, 1.7, 0, 1.9, 0.1, 0.1, '#8D9298');
      sw.box(-0.35, 0.45, 0, 0.45, 0.06, 0.3, '#D2541F'); sw.box(0.4, 0.45, 0, 0.45, 0.06, 0.3, '#E5A024');
      u.person(-2.6, D / 2 + 2.0, { s: 0.66 }); u.person(-3.2, D / 2 + 1.0, { s: 0.6 });
      u.person(0.2, D / 2 + 1.0, { s: 1 });
    } else {
      u.person(2.4, D / 2 + 1.3);
    }
    unit(id, x, 2, z);
    blockRect(x, z + (ry ? -1.4 : 1.4), W + 1.6, D + 5, 0.3);
    var h = { id: id, x: x, z: z, fam: fam, top: new THREE.Vector3(x, 5.6, z) };
    HOMES.push(h); return h;
  }
  [-27, -20, -13, -6].forEach(function(x, i){ home('home' + i, x, 14, 0, i, false); });
  [-24, -17, -10].forEach(function(x, i){ home('fam' + i, x, 28, Math.PI, i + 4, true); });

  // little shops, the books, a lighthouse and a jetty
  function shop(x, z, ry, col, aw){
    var s = new Bld('static', x, z, ry);
    s.box(0, 0, 0, 5, 3, 4, col); s.box(0, 3, 0, 5.3, 0.3, 4.3, '#E3DACA');
    for (var k = 0; k < 4; k++) s.box(-1.875 + k * 1.25, 2.1, 2.55, 1.25, 0.16, 1.2, k % 2 ? '#FFFFFF' : aw, { rx: 0.3 });
    s.box(0, 0, 2.03, 1.0, 2.0, 0.06, '#7A6A58');
    s.box(-1.55, 0.9, 2.03, 1.3, 1.0, 0.06, '#A8CBE0'); s.box(1.55, 0.9, 2.03, 1.3, 1.0, 0.06, '#A8CBE0');
    blockRect(x, z, 5.5, 5.5, 0.5);
  }
  shop(-22.5, 6.2, Math.PI, '#F7E3C8', '#D2541F');
  shop(-16.5, 6.2, Math.PI, '#E3EEF0', '#2F5E8C');
  shop(17.4, 5.0, Math.PI, '#F3E9F1', '#E5A024');
  (function(){
    var s = new Bld('static', 8, -16, -0.5);
    s.box(0, 0, 0, 3.2, 0.8, 3.2, '#E2D8C5');
    s.cyl(0, 0.8, 0, 0.12, 2.7, '#8A8F96');
    s.box(0, 3.4, 0, 3.4, 0.14, 0.16, '#C9A227');
    [-1.6, 1.6].forEach(function(x){ s.box(x, 2.45, 0, 0.04, 0.95, 0.04, '#8A8F96'); s.cyl(x, 2.3, 0, 0.6, 0.12, '#C9A227', null, 10); });
    s.sign('THE BOOKS', 0, 0.42, 1.66, 0.42, ST.civic, { board: false });
    blockCircle(8, -16, 3.2);
    PTS.books = new THREE.Vector3(8, 3.6, -16);
  })();
  (function(){
    var s = new Bld('static', 49, 16, 0);
    s.cyl(0, 0, 0, 2.3, 0.8, '#E2D8C5', null, 10);
    for (var k = 0; k < 5; k++) s.cyl(0, 0.8 + k * 1.5, 0, 1.3 - k * 0.09, 1.5, k % 2 ? '#D2541F' : '#FFFFFF', null, 10);
    s.cyl(0, 8.3, 0, 1.1, 0.15, '#4F5761', null, 10);
    s.cyl(0, 8.45, 0, 0.75, 1.0, '#FFE7A8', GLOW, 10);
    s.put(T_CONE6, 0, 9.45, 0, 1.9, 1.2, 1.9, '#D2541F');
    blockCircle(49, 16, 3.5);
  })();
  (function(){
    var s = new Bld('static', 15, 55, -0.15);
    s.box(0, 0.25, 0, 2.4, 0.22, 13, '#B89A72');
    for (var k = 0; k < 6; k++){ s.cyl(-1.1, -1.6, -6 + k * 2.4, 0.14, 2.0, '#8A6F52'); s.cyl(1.1, -1.6, -6 + k * 2.4, 0.14, 2.0, '#8A6F52'); }
    blockCircle(15, 50, 3);
  })();

  /* ---------- build the merged meshes ---------- */
  function toGeo(L, a){
    var n = L.p.length; if (!n) return null;
    var pos = new Float32Array(n);
    for (var i = 0; i < n; i += 3){ pos[i] = L.p[i] - a.x; pos[i + 1] = L.p[i + 1] - a.y; pos[i + 2] = L.p[i + 2] - a.z; }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(L.n), 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(L.c), 3));
    g.computeBoundingSphere();
    return g;
  }
  Object.keys(BK).forEach(function(key){
    var b = BK[key], a = b.anchor, g = new THREE.Group();
    g.position.copy(a);
    var gs = toGeo(b.std, a), gg = toGeo(b.glow, a);
    if (gs){ var m = new THREE.Mesh(gs, MAT); m.castShadow = true; m.receiveShadow = true; g.add(m); }
    if (gg){ var m2 = new THREE.Mesh(gg, MAT_GLOW); m2.receiveShadow = true; g.add(m2); }
    b.extras.forEach(function(o){ o.position.sub(a); g.add(o); });
    scene.add(g);
    var parts = key.split(':');
    if (parts[0] !== 'static' && U[parts[0]]){ U[parts[0]].groups[parts[1]].push(g); g.visible = parts[1] === 'now'; if (parts[1] === 'us') g.scale.set(0.82, 0.001, 0.82); }
  });

  // terrain (built after the hills are known), coloured in soft patches
  (function(){
    var seg = small ? 72 : 96;
    var tg = new THREE.PlaneGeometry(164, 164, seg, seg); tg.rotateX(-Math.PI / 2);
    var tp = tg.attributes.position;
    for (var i = 0; i < tp.count; i++){
      var x = tp.getX(i), z = tp.getZ(i), h = terrainH(x, z);
      if (h < -0.05 || (h > 0.2 && h < 4.1)) h += (hash2(x, z) - 0.5) * 0.36;
      tp.setY(i, h);
    }
    var tn = tg.toNonIndexed(); tn.deleteAttribute('uv'); tn.computeVertexNormals();
    var a = tn.attributes.position.array, col = new Float32Array(a.length);
    for (i = 0; i < a.length; i += 9){
      var cx = (a[i] + a[i + 3] + a[i + 6]) / 3, cy = (a[i + 1] + a[i + 4] + a[i + 7]) / 3, cz = (a[i + 2] + a[i + 5] + a[i + 8]) / 3;
      var d = Math.hypot(cx, cz), R = coastR(Math.atan2(cz, cx)), hex;
      if (cy < -0.45) hex = '#D9C79C';
      else if (cy < -0.03 || d > R - 1.5) hex = '#ECDDB2';
      else if (cy > 0.25) hex = cy > 2.8 ? '#8EBF70' : '#98C67A';
      else {
        var nz = Math.sin(cx * 0.11 + 1.3) * Math.sin(cz * 0.13 - 0.7) + 0.55 * Math.sin(cx * 0.27 + cz * 0.21 + 2.0);
        hex = nz > 0.75 ? '#B3D795' : nz > 0.1 ? '#A8D08A' : nz > -0.6 ? '#A1CA83' : '#99C47C';
      }
      _c.set(hex);
      for (var k = 0; k < 3; k++){ col[i + k * 3] = _c.r; col[i + k * 3 + 1] = _c.g; col[i + k * 3 + 2] = _c.b; }
    }
    tn.setAttribute('color', new THREE.BufferAttribute(col, 3));
    var ground = new THREE.Mesh(tn, MAT); ground.receiveShadow = true;
    scene.add(ground);
  })();

  /* ---------- small things made once and repeated ---------- */
  function makeGeo(fn){
    var tmp = newBucket(new THREE.Vector3());
    var b = new Bld(null, 0, 0, 0); b.tmp = tmp; fn(b);
    return toGeo(tmp.std, tmp.anchor);
  }
  // trees
  (function(){
    var gRound = makeGeo(function(b){ b.cyl(0, 0, 0, 0.22, 1.5, '#8B6B4E'); b.put(T_ICO1, 0, 2.3, 0, 2.7, 2.6, 2.7, '#78B460'); });
    var gPine = makeGeo(function(b){ b.cyl(0, 0, 0, 0.2, 1.0, '#8B6B4E'); b.put(T_CONE6, 0, 0.8, 0, 2.6, 2.6, 2.6, '#5E9E58'); b.put(T_CONE6, 0, 2.3, 0, 1.9, 2.1, 1.9, '#69A960'); });
    var want = small ? 120 : 175, spots = [];
    for (var tries = 0; tries < 5000 && spots.length < want; tries++){
      var x = (rnd() - 0.5) * 116, z = (rnd() - 0.5) * 116, d = Math.hypot(x, z);
      if (d > coastR(Math.atan2(z, x)) - 7.5) continue;
      if (blocked(x, z)) continue;
      var ok = true;
      for (var j = 0; j < spots.length; j++){ if (Math.hypot(spots[j][0] - x, spots[j][1] - z) < 2.9){ ok = false; break; } }
      if (ok) spots.push([x, z]);
    }
    var rounds = spots.filter(function(_, i){ return i % 3 !== 0; }), pines = spots.filter(function(_, i){ return i % 3 === 0; });
    [[gRound, rounds], [gPine, pines]].forEach(function(pair){
      var im = new THREE.InstancedMesh(pair[0], MAT, pair[1].length), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
      pair[1].forEach(function(p, i){
        var s = 0.8 + rnd() * 0.55, y = terrainH(p[0], p[1]) - 0.1;
        q.setFromAxisAngle(UPV, rnd() * 6.28);
        m4.compose(new THREE.Vector3(p[0], y, p[1]), q, new THREE.Vector3(s, s * (0.9 + rnd() * 0.3), s));
        im.setMatrixAt(i, m4);
        var k = 0.86 + rnd() * 0.24; im.setColorAt(i, c.setRGB(k, k * (0.98 + rnd() * 0.06), k * 0.96));
      });
      im.castShadow = true; im.receiveShadow = true;
      scene.add(im);
    });
  })();

  // clouds
  var CLOUDS = [];
  (function(){
    var g = makeGeo(function(b){ [[0, 0, 0, 6], [3.5, -0.6, 0.5, 4.4], [-3.6, -0.8, -0.3, 4.2], [1.2, 1.4, -0.4, 4.4], [-1.4, 1.0, 0.8, 3.6]].forEach(function(c){ b.put(T_ICO1, c[0], c[1], c[2], c[3], c[3] * 0.7, c[3], '#FFFFFF'); }); });
    var n = 7, im = new THREE.InstancedMesh(g, MAT, n);
    for (var i = 0; i < n; i++) CLOUDS.push({ a: i / n * 6.28 + rnd(), r: 170 + rnd() * 120, y: 62 + rnd() * 26, s: 1.3 + rnd() * 1.1, sp: 0.004 + rnd() * 0.004 });
    im.frustumCulled = false; scene.add(im); CLOUDS.im = im;
  })();
  // cars on two loops (they keep left, as in New Zealand)
  function loopCurve(pts){
    var out = [], n = pts.length;
    for (var i = 0; i < n; i++){
      var p = pts[i], a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n];
      var ax = p[0] - a[0], az = p[1] - a[1], bx = b[0] - p[0], bz = b[1] - p[1];
      var la = Math.hypot(ax, az), lb = Math.hypot(bx, bz);
      var turn = Math.acos(clamp((ax * bx + az * bz) / (la * lb), -1, 1));
      if (turn > 0.6){ var c = Math.min(2.4, la / 2, lb / 2); out.push([p[0] - ax / la * c, p[1] - az / la * c]); out.push([p[0] + bx / lb * c, p[1] + bz / lb * c]); }
      else out.push(p);
    }
    var curve = new THREE.CatmullRomCurve3(out.map(function(p){ return new THREE.Vector3(p[0], 0, p[1]); }), true, 'centripetal');
    curve.arcLengthDivisions = 800;
    return { curve: curve, len: curve.getLength() };
  }
  function arc(a0, a1, n){ var o = []; for (var i = 0; i <= n; i++){ var a = lerp(a0, a1, i / n); o.push([Math.cos(a) * 12.5, Math.sin(a) * 12.5]); } return o; }
  var ROUTES = [
    loopCurve([[-31, 0]].concat(arc(Math.PI, 0, 8)).concat([[36, 0], [36, 21], [-31, 21]])),
    loopCurve([[-31, 0]].concat(arc(Math.PI, Math.PI * 1.5, 5)).concat([[0, -14], [-31, -14]]))
  ];
  var CARS = [];
  (function(){
    var g = makeGeo(function(b){ b.car(0, 0, 0, '#FFFFFF'); });
    var cols = ['#D2541F', '#2F5E8C', '#F2F0EA', '#E5A024', '#5D9E7A', '#9AA1A9', '#C0392B', '#3E8FA8'];
    var n = small ? 6 : 9, im = new THREE.InstancedMesh(g, MAT, n), c = new THREE.Color();
    for (var i = 0; i < n; i++){
      var r = i % 3 === 2 ? 1 : 0;
      CARS.push({ r: r, u: rnd(), sp: 5 + rnd() * 2.4 });
      im.setColorAt(i, c.set(cols[i % cols.length]));
    }
    im.frustumCulled = false; scene.add(im); CARS.im = im;
  })();
  // trains on the loop line
  var TRAINS = [], PERIM = TRACK.getLength(), CAR_DU = 6.0 / PERIM;
  (function(){
    var g = makeGeo(function(b){
      b.box(0, 0.12, 0, 2.2, 0.5, 5.3, '#4F5761'); b.box(0, 0.62, 0, 2.35, 2.0, 5.5, '#F5EEE2');
      b.box(0, 0.98, 0, 2.39, 0.32, 5.52, '#D2541F'); b.box(0, 1.6, 0, 2.4, 0.64, 4.7, '#8DB5CD'); b.box(0, 2.62, 0, 2.1, 0.3, 5.2, '#D4CEC4');
    });
    for (var t = 0; t < 2; t++){
      var grp = new THREE.Group(), cars = [];
      for (var k = 0; k < 3; k++){ var m = new THREE.Mesh(g, MAT); m.userData.id = 'station'; grp.add(m); cars.push(m); }
      scene.add(grp);
      TRAINS.push({ grp: grp, cars: cars, u: t ? 0.0 : 0.5, v: 0, dwell: t ? 0 : 3, k: t ? 0 : 1 });
    }
  })();
  // people walking
  var WALK = [];
  function walker(unitId, when, pts, sp, s, y){ WALK.push({ u: unitId, when: when, pts: pts.map(function(p){ return new THREE.Vector3(p[0], y || 0, p[1]); }), sp: sp, d: rnd() * 20, s: s || 1, k: 0 }); }
  walker('lease', 'us', [[33, 22.9], [12, 22.9]], 1.6); walker('lease', 'us', [[31.5, 23.1], [17, 23.1]], 1.4); walker('lease', 'us', [[32, 22.7], [24, 22.7]], 1.8, 0.66);
  walker('lease', 'now', [[22.5, 22.6], [17.5, 22.6]], 0.8);
  walker('market', 'us', [[-14.5, -15.8], [-12, -20.4]], 1.4); walker('market', 'us', [[-7.5, -16.0], [-11, -20.4]], 1.3); walker('market', 'us', [[-17, -16.2], [-6, -16.2]], 1.6);
  walker('station', 'us', [[-32.4, 3.5], [-34.8, 0.6]], 1.2); walker('station', 'us', [[-42.9, -8], [-42.9, 8]], 1.3, 1, 0.95); walker('station', 'us', [[-42.6, 7], [-42.6, -6]], 1.1, 1, 0.95);
  walker('station', 'now', [[-33.2, -2], [-33.2, 2]], 0.7);
  walker('health', 'us', [[26.5, 19.4], [25, 15.9]], 1.2); walker('health', 'us', [[19, 19.3], [19, 15.9]], 1.1);
  walker('purse', 'us', [[-5.5, 8.6], [5.5, 8.6]], 1.3); walker('purse', 'us', [[6, -8.8], [-6, -8.8]], 1.5);
  walker('fam0', 'us', [[-25.6, 24.2], [-22.6, 24.2]], 2.2, 0.62); walker('fam2', 'us', [[-11.6, 24.0], [-8.4, 24.0]], 2.0, 0.6);
  (function(){
    var gb = makeGeo(function(b){ b.put(T_CYL6, 0, 0, 0, 0.62, 1.05, 0.62, '#FFFFFF'); });
    var gh = makeGeo(function(b){ b.put(T_ICO, 0, 1.33, 0, 0.56, 0.56, 0.56, '#FFFFFF'); });
    var bi = new THREE.InstancedMesh(gb, MAT, WALK.length), hi = new THREE.InstancedMesh(gh, MAT, WALK.length), c = new THREE.Color();
    WALK.forEach(function(w, i){
      bi.setColorAt(i, c.set(SHIRTS[i % SHIRTS.length])); hi.setColorAt(i, c.set(SKINS[i % SKINS.length]));
      w.len = 0; for (var j = 1; j < w.pts.length; j++) w.len += w.pts[j].distanceTo(w.pts[j - 1]);
    });
    bi.frustumCulled = hi.frustumCulled = false; scene.add(bi); scene.add(hi); WALK.bi = bi; WALK.hi = hi;
  })();
  // boats
  var BOATS = [];
  (function(){
    var g = makeGeo(function(b){
      b.box(0, -0.2, 0, 1.7, 0.75, 4.2, '#FFFFFF'); b.box(0, 0.32, 0, 1.74, 0.14, 4.24, '#D2541F'); b.box(0, 0.55, -0.7, 1.2, 0.6, 1.5, '#F1EBDD');
      b.cyl(0, 0.55, 0.5, 0.07, 5.0, '#8A8F96'); b.put(T_GABLE, 0, 1.0, 0.6, 0.06, 4.3, 2.8, '#FFF8EC');
    });
    [[66, 0.012, 0], [74, -0.009, 2.6], [63, 0.0, 1.43]].forEach(function(b, i){
      var m = new THREE.Mesh(g, MAT); scene.add(m);
      BOATS.push({ m: m, r: b[0], sp: b[1], a: b[2], ph: i * 1.7 });
    });
  })();

  /* ---------- money: glowing dots, as many as the dollars ---------- */
  var COL = {
    gold: { hex: '#E8A320', rgb: [0.95, 0.66, 0.16], size: 1.15 },
    grey: { hex: '#6B655C', rgb: [0.40, 0.38, 0.35], size: 1.1 },
    green: { hex: '#29A86B', rgb: [0.16, 0.66, 0.42], size: 1.0 },
    blue: { hex: '#3380D9', rgb: [0.2, 0.5, 0.85], size: 1.0 },
    slate: { hex: '#6B6B73', rgb: [0.42, 0.42, 0.45], size: 1.0 }
  };
  var PER_B = small ? 8 : 13, LIFE = 3.6, CAP = 600;
  var FL = [];
  function addFlow(id, from, to, b, col, owner, when, gold){
    var dist = from.distanceTo(to), h = (gold ? 3.5 : 4.5) + dist * 0.2;
    var p1 = from.clone().lerp(to, 0.25); p1.y += h;
    var p2 = from.clone().lerp(to, 0.75); p2.y += h;
    var curve = new THREE.CubicBezierCurve3(from.clone(), p1, p2, to.clone());
    var r = Math.max(0.1, 0.1 * b);
    var tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, r, 7, false), new THREE.MeshBasicMaterial({ color: col.hex, transparent: true, opacity: 0, depthWrite: false }));
    tube.renderOrder = 5; tube.visible = false; scene.add(tube);
    FL.push({ id: id, pts: curve.getPoints(48), b: b, col: col, owner: owner, when: when, r: r, tube: tube, acc: rnd(), op: 0, base: gold ? 0.3 : 0.22 });
  }
  addFlow('goldNow', PTS.mansion, PTS.vault, GAINS, COL.gold, 'mansion', 'now', true);
  addFlow('goldUs', PTS.mansion, PTS.purse, GAINS, COL.gold, 'mansion', 'us', true);
  HOMES.forEach(function(h){
    addFlow('tax-' + h.id, h.top, PTS.purse, CUT / HOMES.length, COL.grey, h.id, 'now');
    addFlow('cut-' + h.id, PTS.purse, h.top, CUT / HOMES.length, COL.green, h.id, 'us');
  });
  var famHomes = HOMES.filter(function(h){ return h.fam; });
  famHomes.forEach(function(h){ addFlow('fam-' + h.id, PTS.purse, h.top.clone().add(new THREE.Vector3(1.4, -0.4, 0)), FAM_B / famHomes.length, COL.blue, h.id, 'us'); });
  addFlow('health', PTS.purse, PTS.health, HEALTH_B, COL.blue, 'health', 'us');
  addFlow('train', PTS.purse, PTS.station, PT_B, COL.blue, 'station', 'us');
  addFlow('books', PTS.purse, PTS.books, NET, COL.slate, 'purse', 'us');

  var pPos = new Float32Array(CAP * 3), pCol = new Float32Array(CAP * 3), pA = new Float32Array(CAP), pS = new Float32Array(CAP);
  var pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3).setUsage(THREE.DynamicDrawUsage));
  pGeo.setAttribute('pcol', new THREE.BufferAttribute(pCol, 3).setUsage(THREE.DynamicDrawUsage));
  pGeo.setAttribute('palpha', new THREE.BufferAttribute(pA, 1).setUsage(THREE.DynamicDrawUsage));
  pGeo.setAttribute('psize', new THREE.BufferAttribute(pS, 1).setUsage(THREE.DynamicDrawUsage));
  pGeo.setDrawRange(0, 0);
  var pMat = new THREE.ShaderMaterial({
    uniforms: { uScale: { value: 400 }, uMax: { value: 16 * pr } }, transparent: true, depthWrite: false,
    vertexShader: 'attribute vec3 pcol; attribute float palpha; attribute float psize; uniform float uScale; uniform float uMax; varying vec3 vC; varying float vA;\nvoid main(){ vC = pcol; vA = palpha; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = clamp(psize * uScale / -mv.z, 2.5, uMax); }',
    fragmentShader: 'varying vec3 vC; varying float vA;\nvoid main(){ vec2 p = gl_PointCoord * 2.0 - 1.0; float d = dot(p, p); if (d > 1.0) discard;\n vec3 c = mix(vC * 0.78, mix(vC, vec3(1.0), 0.5), smoothstep(0.6, 0.0, d));\n gl_FragColor = vec4(c, vA * (1.0 - smoothstep(0.72, 1.0, d))); }'
  });
  var points = new THREE.Points(pGeo, pMat); points.frustumCulled = false; points.renderOrder = 10;
  scene.add(points);
  var parts = [];

  function flowAt(f, k, out){
    var n = f.pts.length - 1, x = k * n, i = Math.min(n - 1, Math.floor(x)), r = x - i, a = f.pts[i], b = f.pts[i + 1];
    return out.set(a.x + (b.x - a.x) * r, a.y + (b.y - a.y) * r, a.z + (b.z - a.z) * r);
  }

  /* ---------- hit boxes for taps ---------- */
  var HITS = [], HITGEO = new THREE.BoxGeometry(1, 1, 1), HITMAT = new THREE.MeshBasicMaterial();
  function hit(id, x, y, z, w, h, d, ry){ var m = new THREE.Mesh(HITGEO, HITMAT); m.position.set(x, y + h / 2, z); m.scale.set(w, h, d); m.rotation.y = ry || 0; m.updateMatrixWorld(true); m.userData.id = id; HITS.push(m); }
  hit('mansion', 22, HY - 1, -21, 14, 9.5, 10, -Math.PI / 4); hit('mansion', VX.x, VX.y, VX.z, 7, 6, 6, VX.ry);
  hit('purse', 0, 0, 0, 15, 13, 11); hit('purse', 8, 0, -16, 3.6, 4, 3.6);
  HOMES.forEach(function(h){ hit(h.fam ? 'families' : 'homes', h.x, 0, h.z, 5.4, 5.2, 5); });
  hit('health', 22, 0, 12, 12.5, 6.5, 7.6); hit('station', -40.5, 0, 0, 8, 6.5, 20.5); hit('market', -12, 0, -25, 13.6, 6.5, 9);
  hit('lease', 20, 0, 27, 20, 5.5, 7.6); hit('towns', -22, 0, -8, 10.6, 8.5, 6.6); hit('bowls', -11, 0, 34, 15.5, 3.6, 7);
  hit('families', -30, 0, -22, 9.6, 7, 6.6);
  var ANCH = {
    mansion: new THREE.Vector3(22, HY + 9.8, -21), purse: new THREE.Vector3(0, 14.8, -0.9), homes: new THREE.Vector3(-16.5, 6.2, 14),
    families: new THREE.Vector3(-17, 6.2, 28), health: new THREE.Vector3(22, 7.6, 12), station: new THREE.Vector3(-39.5, 6.8, 0),
    market: new THREE.Vector3(-12, 7, -25), lease: new THREE.Vector3(20, 6.2, 27), towns: new THREE.Vector3(-22, 9.6, -8), bowls: new THREE.Vector3(-8, 3.6, 34)
  };
  var FOCUS = {
    mansion: [24, 3, -22], purse: [0, 2, 0], homes: [-16.5, 1, 15], families: [-17, 1, 27], health: [22, 1, 12], station: [-39, 1, 0],
    market: [-12, 1, -24], lease: [20, 1, 26], towns: [-22, 2, -8], bowls: [-9, 0, 33]
  };

  /* ---------- camera and controls ---------- */
  var controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.07;
  controls.enablePan = false; controls.rotateSpeed = 0.7; controls.zoomSpeed = 0.8;
  controls.minPolarAngle = 0.3; controls.maxPolarAngle = 1.24;
  controls.autoRotate = false; controls.autoRotateSpeed = 0.32;
  if (scrollMode){
    renderer.domElement.style.touchAction = 'pan-y';
    renderer.domElement.addEventListener('touchmove', function(e){ if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
  }
  var sph = new THREE.Spherical(), _off = new THREE.Vector3();
  var HOME = { r: 160, ph: 0.98, th: 0.5, x: 0, y: 1, z: 4 };
  function camGet(){ _off.copy(camera.position).sub(controls.target); sph.setFromVector3(_off); return { r: sph.radius, ph: sph.phi, th: sph.theta, x: controls.target.x, y: controls.target.y, z: controls.target.z }; }
  function camSet(c){ controls.target.set(c.x, c.y, c.z); sph.set(c.r, c.ph, c.th); camera.position.setFromSpherical(sph).add(controls.target); camera.lookAt(controls.target); }
  function camLerp(a, b, k){ var d = b.th - a.th; d = Math.atan2(Math.sin(d), Math.cos(d)); return { r: lerp(a.r, b.r, k), ph: lerp(a.ph, b.ph, k), th: a.th + d * k, x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), z: lerp(a.z, b.z, k) }; }
  var camAnim = null, play = null, userHold = false, idle = 0;
  function flyTo(to, dur, done){
    if (reduce){ camSet(to); controls.update(); if (done) done(); return; }
    camAnim = { from: camGet(), to: to, dur: dur, el: 0, done: done };
  }
  function stepCam(dt){
    camAnim.el += dt;
    var k = clamp(camAnim.el / camAnim.dur, 0, 1);
    camSet(camLerp(camAnim.from, camAnim.to, easeIO(k)));
    if (k >= 1){ var d = camAnim.done; camAnim = null; controls.update(); if (d) d(); }
  }
  controls.addEventListener('start', function(){ userHold = true; controls.autoRotate = false; camAnim = null; if (play) stopPlay(); });
  controls.addEventListener('end', function(){ userHold = false; idle = 9; });

  /* ---------- layout of the page chrome ---------- */
  var ui = { top: 150, bot: 150, topbar: 52, ctrlTop: H - 150, obst: [], sl: { left: 0, width: W } };
  var THUMB = 56, fit = 160, vOff = 0;
  function r4(r, pad){ pad = pad === undefined ? 6 : pad; return [r.left - pad, r.top - pad, r.right + pad, r.bottom + pad]; }
  function union(a, b){ return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])]; }
  var _rg = document.createRange();
  function textRect(el){ _rg.selectNodeContents(el); return _rg.getBoundingClientRect(); }
  function measureUI(){
    placeLegend();
    var tb = document.querySelector('.top').getBoundingClientRect();
    var ct = $('ctrl').getBoundingClientRect(), you = $('you');
    var narrow = W < 761;
    ui.topbar = tb.bottom; ui.ctrlTop = ct.top; ui.bot = H - ct.top;
    // the headline's own text, not its full-width box, so cards can sit beside it
    var hudRect = union(union(r4(textRect(document.querySelector('.hudIn .tKick'))), r4(textRect($('hNow')))), r4(textRect($('hUs'))));
    if (narrow){
      var leg = $('tLeg').getBoundingClientRect();
      hudRect = union(hudRect, r4(leg)); hudRect[0] = 0; hudRect[2] = W;
    }
    ui.top = hudRect[3];
    ui.obst = [r4(tb, 2), hudRect, r4(ct, 4)];
    if (you.offsetParent){ var yr = you.getBoundingClientRect(); if (yr.width) ui.obst.push(r4(yr)); }
    ui.sl = slider.getBoundingClientRect();
    document.documentElement.style.setProperty('--ctrlH', (H - ct.top + 10) + 'px');
  }
  window.__townMeasure = function(){ measureUI(); };
  function computeFit(){
    var th = Math.tan(camera.fov * Math.PI / 360);
    var availH = Math.max(220, H - ui.top - ui.bot);
    var tanV = th * availH / H, tanH = th * W / H, portrait = W / H < 0.8;
    var R = portrait ? 38 : 50;
    return Math.max(R / tanH, R * 0.56 / tanV);
  }
  function applyFit(){
    fit = computeFit();
    HOME.r = fit;
    controls.minDistance = fit * 0.34; controls.maxDistance = fit * 1.6;
    scene.fog.near = fit * 1.5; scene.fog.far = fit * 4.6;
    seaMat.uniforms.uFogN.value = fit * 1.5; seaMat.uniforms.uFogF.value = fit * 5;
  }
  function setOffset(dt){
    var target = sheetOpen ? (ui.topbar - Math.min(H * 0.84, $('sheet').offsetHeight)) / 2 : (ui.top - ui.bot) / 2;
    var nv = dt > 0 ? vOff + (target - vOff) * Math.min(1, dt * 4) : target;
    if (Math.abs(nv - vOff) > 0.25 || dt === 0){ vOff = nv; camera.setViewOffset(W, H, 0, -vOff, W, H); camera.updateProjectionMatrix(); }
  }
  function onResize(){
    W = stage.clientWidth || innerWidth; H = stage.clientHeight || innerHeight;
    renderer.setSize(W, H);
    camera.aspect = W / H; camera.fov = W / H < 0.8 ? 50 : 36;
    measureUI(); applyFit(); setOffset(0);
    pMat.uniforms.uScale.value = H * pr / (2 * Math.tan(camera.fov * Math.PI / 360));
    pMat.uniforms.uMax.value = 16 * pr;
    WIPE.uWipeSoft.value = 16 * pr;
    measureCards();
    if (scrollMode) maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  }
  var rzPending = false;
  window.addEventListener('resize', function(){ if (rzPending) return; rzPending = true; requestAnimationFrame(function(){ rzPending = false; onResize(); }); });

  /* ---------- the slider ---------- */
  var t = 0, lineX = -1e4, headUs = null;
  var hNow = $('hNow'), hUs = $('hUs'), sweep = $('sweep'), hint = $('scrollHint');
  var lgNow, lgUs;
  var maxScroll = 1, lastSetScroll = -99;
  function setT(v, src){
    t = clamp(v, 0, 1);
    if (src !== 'slider') slider.value = String(Math.round(t * 1000));
    var px = THUMB / 2 + t * (ui.sl.width - THUMB);
    slider.style.setProperty('--p', px + 'px');
    var usSide = t >= 0.5;
    if (usSide !== headUs){
      headUs = usSide;
      lgNow = lgNow || $('lgNow'); lgUs = lgUs || $('lgUs');
      hNow.classList.toggle('on', !usSide); hUs.classList.toggle('on', usSide);
      lgNow.classList.toggle('on', !usSide); lgUs.classList.toggle('on', usSide);
      hNow.setAttribute('aria-hidden', String(usSide)); hUs.setAttribute('aria-hidden', String(!usSide));
    }
    slider.setAttribute('aria-valuetext', t < 0.02 ? 'Now' : t > 0.98 ? 'With us' : Math.round(t * 100) + '% of the way to with us');
    if (hint && t > 0.04) hint.style.opacity = 0;
    if (src !== 'scroll') syncScroll();
    updatePlayBtn();
  }
  function syncScroll(){
    if (!scrollMode) return;
    var y = Math.round(t * maxScroll); lastSetScroll = y;
    window.scrollTo(0, y);
  }
  slider.addEventListener('input', function(){ if (play) stopPlay(); $('play').classList.remove('pulse'); setT(slider.value / 1000, 'slider'); });
  if (scrollMode){
    window.addEventListener('scroll', function(){
      var y = window.scrollY;
      if (Math.abs(y - lastSetScroll) < 2) return;
      lastSetScroll = -99;
      if (play) stopPlay();
      $('play').classList.remove('pulse');
      setT(y / maxScroll, 'scroll');
    }, { passive: true });
  }

  /* ---------- play: the cinematic sweep ---------- */
  var playBtn = $('play'), playTxt = $('playTxt'), playIcon = $('playIcon');
  function updatePlayBtn(){
    var label = play ? 'Pause' : t > 0.98 ? 'Watch again' : 'Watch it change';
    if (playTxt.textContent !== label) playTxt.textContent = label;
    playIcon.setAttribute('d', play ? 'M8.6 7h2.6v10H8.6zM12.8 7h2.6v10h-2.6z' : 'M9.5 7.5v9l7.5-4.5z');
  }
  function startPlay(){
    playBtn.classList.remove('pulse');
    if (reduce){ setT(t > 0.5 ? 0 : 1); return; }
    camAnim = null; controls.autoRotate = false;
    var c0 = camGet();
    var k1 = { r: fit * 0.55, ph: 0.94, th: -0.45, x: 25, y: 3, z: -15 };
    var k2 = { r: fit * 0.95, ph: 1.0, th: 0.32, x: 0, y: 1, z: 4 };
    var k3 = { r: fit, ph: 0.96, th: 0.5, x: 0, y: 1, z: 4 };
    play = { el: 0, t0: t, keys: [[0, c0], [1.8, k1], [9.0, k2], [10.8, k3]] };
    updatePlayBtn();
  }
  function stopPlay(){ play = null; controls.update(); idle = 6; updatePlayBtn(); }
  function stepPlay(dt){
    play.el += dt;
    var e = play.el, K = play.keys;
    for (var i = 0; i < K.length - 1; i++){
      if (e <= K[i + 1][0] || i === K.length - 2){
        var k = clamp((e - K[i][0]) / (K[i + 1][0] - K[i][0]), 0, 1);
        camSet(camLerp(K[i][1], K[i + 1][1], easeIO(k)));
        break;
      }
    }
    var tt = e < 1.2 ? lerp(play.t0, 0, easeIO(e / 1.2)) : e < 2.0 ? 0 : easeSine(clamp((e - 2.0) / 6.8, 0, 1));
    setT(tt, 'play');
    if (e >= K[K.length - 1][0]){ play = null; controls.update(); idle = 3; updatePlayBtn(); }
  }
  playBtn.addEventListener('click', function(){ if (play) stopPlay(); else startPlay(); });
  $('reset').addEventListener('click', function(){ if (play) stopPlay(); flyTo(HOME, 1.4); });

  /* ---------- cards ---------- */
  var CARDS = [];
  CH.forEach(function(c){
    var stem = document.createElement('span'); stem.className = 'stem';
    var el = document.createElement('button'); el.type = 'button'; el.className = 'tc'; el.setAttribute('role', 'listitem');
    el.setAttribute('aria-label', c.name + '. Now: ' + c.now + '. With us: ' + c.us + '. Open the detail.');
    el.innerHTML = '<span class="tcIn"><span class="tcName">' + esc(c.name) + '</span><span class="tcLines"><span class="tcL tcNow"><i>Now</i>' + esc(c.now) + '</span><span class="tcL tcUs"><i>With us</i>' + esc(c.us) + '</span></span></span>';
    cardsBox.appendChild(stem); cardsBox.appendChild(el);
    el.addEventListener('click', function(){ openSheet(c.id); });
    el.addEventListener('pointerenter', function(){ hotId = c.id; });
    el.addEventListener('pointerleave', function(){ if (hotId === c.id) hotId = null; });
    CARDS.push({ id: c.id, el: el, stem: stem, nowEl: el.querySelector('.tcNow'), usEl: el.querySelector('.tcUs'), anchor: ANCH[c.id],
      mode: 'hide', pend: null, pn: 0, cand: -1, try: 0, w: 0, h: 0, pw: 0, ph: 0, x: -1, y: -1, s: -1, us: null, sx: 0, sy: 0, stemTop: 0, stemH: 0, stemX: 0 });
  });
  var hotId = null;
  function measureCards(){
    CARDS.forEach(function(c){
      c.el.classList.remove('pin'); c.w = c.el.offsetWidth; c.h = c.el.offsetHeight;
      c.el.classList.add('pin'); c.pw = c.el.offsetWidth; c.ph = c.el.offsetHeight;
      c.el.classList.toggle('pin', c.mode === 'pin');
    });
  }
  var RANK = { hide: 0, pin: 1, full: 2 };
  function overlaps(r, list){ for (var i = 0; i < list.length; i++){ var o = list[i]; if (r[0] < o[2] && r[2] > o[0] && r[1] < o[3] && r[3] > o[1]) return true; } return false; }
  var _sp = new THREE.Vector3();
  function project(p){ _sp.copy(p).project(camera); return { x: (_sp.x + 1) / 2 * W, y: (1 - _sp.y) / 2 * H, z: _sp.z }; }
  function sideOf(sx){ if (t <= 0.003) return 0; if (t >= 0.997) return 1; return sstep(lineX + 26, lineX - 26, sx); }
  var gap = 14;
  // spots 0-8 sit above the building (centred, nudged left, nudged right, then higher); 9-11 hang below it
  function cardRect(c, a, k){
    var side = c.w / 2 - 28, dx = [0, -side, side][k % 3];
    var x0 = clamp(a.x - c.w / 2 + dx, 6, W - 6 - c.w);
    if (k >= 9){ var y0 = a.y + gap + 6; return [x0, y0, x0 + c.w, y0 + c.h]; }
    var y1 = a.y - gap - Math.floor(k / 3) * (c.h * 0.5 + 10);
    return [x0, y1 - c.h, x0 + c.w, y1];
  }
  function layoutCards(){
    var placed = ui.obst.slice(), top = ui.topbar + 4, bottom = ui.ctrlTop - 4, fulls = 0;
    var maxFull = W < 761 ? 4 : W < 1100 ? 6 : 7;
    for (var i = 0; i < CARDS.length; i++){
      var c = CARDS[i], a = project(c.anchor);
      var onScreen = a.z < 1 && a.x > -20 && a.x < W + 20 && a.y > top + 10 && a.y < bottom;
      var want = 'hide', rect = null;
      if (onScreen && fulls < maxFull){
        // try above the building, then nudged left or right, then a little higher;
        // the spot that worked last frame is tried first, so cards stay put
        var order = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        if (c.cand >= 0) order.unshift(c.cand);
        for (var oi = 0; oi < order.length && want === 'hide'; oi++){
          var r = cardRect(c, a, order[oi]);
          if (r[1] >= top && r[3] <= bottom && !overlaps(r, placed)){ want = 'full'; rect = r; c.try = order[oi]; }
        }
      }
      if (onScreen){
        if (want === 'hide'){
          var px0 = clamp(a.x - c.pw / 2, 6, W - 6 - c.pw), py1 = a.y - gap, pr2 = [px0, py1 - c.ph, px0 + c.pw, py1];
          if (pr2[1] >= top && !overlaps(pr2, placed)){ want = 'pin'; rect = pr2; }
        }
      }
      // settle: drop quickly, grow back slowly, so cards do not flicker
      if (!onScreen){ c.mode = 'hide'; c.pn = 0; }
      else if (want !== c.mode){
        if (c.pend !== want){ c.pend = want; c.pn = 0; }
        c.pn++;
        if (c.pn >= (RANK[want] < RANK[c.mode] ? 2 : 10)){ c.mode = want; c.pn = 0; }
      } else c.pn = 0;
      if (c.mode === 'full' && want === 'full') c.cand = c.try;
      if (c.mode !== want || !rect){
        if (c.mode === 'full') rect = cardRect(c, a, c.cand >= 0 ? c.cand : 0);
        else if (c.mode === 'pin'){ var xx = clamp(a.x - c.pw / 2, 6, W - 6 - c.pw); rect = [xx, a.y - gap - c.ph, xx + c.pw, a.y - gap]; }
      }
      if (rect && c.mode !== 'hide') placed.push([rect[0] - 4, rect[1] - 4, rect[2] + 4, rect[3] + 4]);
      if (c.mode === 'full') fulls++;
      // write
      var isUs = sideOf(a.x) > 0.5;
      if (isUs !== c.us){ c.us = isUs; c.el.classList.toggle('us', isUs); c.stem.classList.toggle('us', isUs); }
      var vis = c.mode !== 'hide' && rect;
      c.el.classList.toggle('pin', c.mode === 'pin');
      c.el.classList.toggle('hot', hotId === c.id);
      c.el.style.opacity = vis ? 1 : 0; c.el.style.pointerEvents = vis ? 'auto' : 'none';
      c.stem.style.opacity = vis ? 1 : 0;
      if (vis){
        var nx = Math.round(rect[0]), ny = Math.round(rect[1]);
        if (nx !== c.x || ny !== c.y){ c.x = nx; c.y = ny; c.el.style.transform = 'translate3d(' + nx + 'px,' + ny + 'px,0)'; }
        var below = rect[1] > a.y;
        var sx = Math.round(a.x), st = Math.round(below ? a.y : rect[3]), sh = Math.max(0, Math.round(below ? rect[1] - a.y : a.y - rect[3]));
        if (below !== c.below){ c.below = below; c.stem.classList.toggle('down', below); }
        if (sx !== c.stemX || st !== c.stemTop || sh !== c.stemH){ c.stemX = sx; c.stemTop = st; c.stemH = sh; c.stem.style.transform = 'translate3d(' + sx + 'px,' + st + 'px,0)'; c.stem.style.height = sh + 'px'; }
      }
    }
  }

  /* ---------- taps and hover ---------- */
  var ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  var trainMeshes = []; TRAINS.forEach(function(tr){ trainMeshes = trainMeshes.concat(tr.cars); });
  function pickAt(cx, cy){
    var r = renderer.domElement.getBoundingClientRect();
    ndc.set((cx - r.left) / r.width * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    var hits = ray.intersectObjects(HITS.concat(trainMeshes.filter(function(m){ return m.parent.visible; })), false);
    return hits.length ? hits[0].object.userData.id : null;
  }
  var down = null;
  renderer.domElement.addEventListener('pointerdown', function(e){ down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
  renderer.domElement.addEventListener('pointercancel', function(){ down = null; });
  renderer.domElement.addEventListener('pointerup', function(e){
    if (!down) return;
    var dx = e.clientX - down.x, dy = e.clientY - down.y, quick = performance.now() - down.t < 600;
    down = null;
    if (dx * dx + dy * dy < 81 && quick){ var id = pickAt(e.clientX, e.clientY); if (id) openSheet(id); }
  });
  var hoverAt = 0;
  renderer.domElement.addEventListener('pointermove', function(e){
    if (e.pointerType !== 'mouse' || e.buttons) return;
    var now = performance.now(); if (now - hoverAt < 90) return; hoverAt = now;
    var id = pickAt(e.clientX, e.clientY);
    hotId = id; renderer.domElement.style.cursor = id ? 'pointer' : '';
  });
  onSheet = function(id, open){
    if (open && FOCUS[id]){
      if (play) stopPlay();
      controls.autoRotate = false;
      var f = FOCUS[id], c = camGet();
      flyTo({ r: fit * 0.55, ph: 0.95, th: c.th, x: f[0], y: f[1], z: f[2] }, 1.1);
    }
    if (!open) idle = 6;
  };

  /* ---------- per-frame updates ---------- */
  function updateUnits(dt){
    var any = false;
    Object.keys(U).forEach(function(id){
      var u = U[id], a = project(u.pos), s = sideOf(a.x);
      u.s = s;
      var want = u.state ? s > 0.4 : s > 0.6;
      if (want !== u.state){ u.state = want; }
      var target = u.state ? 1 : 0;
      if (u.v !== target){
        u.v = reduce ? target : (target > u.v ? Math.min(target, u.v + dt / 0.7) : Math.max(target, u.v - dt / 0.7));
        var kU = easeBack(u.v), kN = easeBack(1 - u.v);
        u.groups.us.forEach(function(g){ setK(g, kU); });
        u.groups.now.forEach(function(g){ setK(g, kN); });
        any = true;
      }
    });
    if (any) shadowDirty = true;
  }
  function setK(g, k){
    var vis = k > 0.004; g.visible = vis;
    if (vis) g.scale.set(0.82 + 0.18 * k, Math.max(0.001, k), 0.82 + 0.18 * k);
  }
  var _fp = new THREE.Vector3();
  function updateFlows(dt){
    var i, f;
    for (i = 0; i < FL.length; i++){
      f = FL[i];
      var active = (f.when === 'us') === U[f.owner].state;
      f.op += ((active ? 1 : 0) - f.op) * Math.min(1, dt * 3);
      var o = f.op * f.base;
      f.tube.visible = o > 0.01; f.tube.material.opacity = o;
      f.active = active;
      if (active && !reduce){
        f.acc = Math.min(f.acc + dt * PER_B * f.b / LIFE, 4);
        while (f.acc >= 1 && parts.length < CAP){
          f.acc -= 1;
          var th = rnd() * 6.283, rr = Math.sqrt(rnd()) * f.r * 0.9;
          parts.push({ f: f, k: 0, sp: (0.92 + rnd() * 0.16) / LIFE, ox: Math.cos(th) * rr, oy: (rnd() - 0.5) * f.r * 1.2, oz: Math.sin(th) * rr });
        }
      }
    }
    var n = 0;
    if (reduce){
      for (i = 0; i < FL.length; i++){
        f = FL[i]; if (f.op < 0.02) continue;
        var cnt = Math.max(1, Math.round(PER_B * f.b));
        for (var j = 0; j < cnt && n < CAP; j++){
          flowAt(f, (j + 0.5) / cnt, _fp);
          pPos[n * 3] = _fp.x; pPos[n * 3 + 1] = _fp.y; pPos[n * 3 + 2] = _fp.z;
          pCol[n * 3] = f.col.rgb[0]; pCol[n * 3 + 1] = f.col.rgb[1]; pCol[n * 3 + 2] = f.col.rgb[2];
          pA[n] = f.op; pS[n] = f.col.size; n++;
        }
      }
    } else {
      for (i = parts.length - 1; i >= 0; i--){
        var p = parts[i]; p.k += p.sp * dt;
        if (p.k >= 1){ parts[i] = parts[parts.length - 1]; parts.pop(); continue; }
      }
      for (i = 0; i < parts.length && n < CAP; i++){
        var q = parts[i], env = Math.sin(Math.PI * q.k);
        flowAt(q.f, q.k, _fp);
        pPos[n * 3] = _fp.x + q.ox * env; pPos[n * 3 + 1] = _fp.y + q.oy * env; pPos[n * 3 + 2] = _fp.z + q.oz * env;
        var c = q.f.col.rgb; pCol[n * 3] = c[0]; pCol[n * 3 + 1] = c[1]; pCol[n * 3 + 2] = c[2];
        pA[n] = sstep(0, 0.06, q.k) * (1 - sstep(0.93, 1, q.k)) * (0.35 + 0.65 * q.f.op);
        pS[n] = q.f.col.size; n++;
      }
    }
    pGeo.setDrawRange(0, n);
    pGeo.attributes.position.needsUpdate = true; pGeo.attributes.pcol.needsUpdate = true;
    pGeo.attributes.palpha.needsUpdate = true; pGeo.attributes.psize.needsUpdate = true;
    window.__town.dots = n;
  }
  var _m4 = new THREE.Matrix4(), _qq = new THREE.Quaternion(), _sc = new THREE.Vector3(1, 1, 1), _pt = new THREE.Vector3(), _tn = new THREE.Vector3();
  function trackAt(u, out){ var p = TRACK.getPointAt(((u % 1) + 1) % 1); return out.set(p.x, 0.3, p.y); }
  function trackHeading(u){ var d = TRACK.getTangentAt(((u % 1) + 1) % 1); return Math.atan2(d.x, d.y); }
  function stepTrain(tr, dt, lap, dwell){
    if (tr.dwell > 0){ tr.dwell -= dt; tr.v = 0; return; }
    var vT = 1 / lap, ahead = ((0.5 - tr.u) % 1 + 1) % 1;
    if (ahead < 0.05) vT *= Math.max(0.12, ahead / 0.05);
    tr.v += (vT - tr.v) * Math.min(1, dt * 1.2);
    var step = tr.v * dt;
    if (ahead > 1e-4 && step >= ahead){ tr.u = 0.5; tr.dwell = dwell; tr.v = 0; }
    else tr.u = ((tr.u + step) % 1 + 1) % 1;
  }
  function updateMovers(dt, time){
    // trains: one slow train now; two quick ones with us
    var on = U.station.state;
    TRAINS.forEach(function(tr, i){
      if (!reduce){
        if (i === 0) stepTrain(tr, dt, on ? 17 : 32, on ? 1.4 : 6);
        else {
          if (on && tr.k < 0.01 && tr.v === 0 && tr.dwell <= 0) tr.u = (TRAINS[0].u + 0.5) % 1;
          if (on) stepTrain(tr, dt, 17, 1.4);
        }
      }
      var target = i === 0 ? 1 : on ? 1 : 0;
      tr.k += (target - tr.k) * Math.min(1, dt * 3);
      if (reduce) tr.k = target;
      tr.grp.visible = tr.k > 0.01;
      if (!tr.grp.visible) return;
      tr.cars.forEach(function(m, k){
        var uu = tr.u - k * CAR_DU;
        trackAt(uu, m.position); m.rotation.y = trackHeading(uu);
        m.scale.set(1, tr.k, 1);
      });
    });
    if (reduce) return;
    // cars
    CARS.forEach(function(c, i){
      var R = ROUTES[c.r]; c.u = (c.u + c.sp * dt / R.len) % 1;
      R.curve.getPointAt(c.u, _pt); R.curve.getTangentAt(c.u, _tn);
      var lx = _tn.z, lz = -_tn.x;
      _pt.x += lx * 0.75; _pt.z += lz * 0.75; _pt.y = 0.02;
      _qq.setFromAxisAngle(UPV, Math.atan2(_tn.x, _tn.z));
      _m4.compose(_pt, _qq, _sc.set(0.8, 0.8, 0.8));
      CARS.im.setMatrixAt(i, _m4);
    });
    CARS.im.instanceMatrix.needsUpdate = true;
    // walkers
    WALK.forEach(function(w, i){
      var vis = (w.when === 'us') === U[w.u].state;
      w.k += ((vis ? 1 : 0) - w.k) * Math.min(1, dt * 3);
      w.d += w.sp * dt;
      var L = w.len, d = w.d % (2 * L), back = d > L; if (back) d = 2 * L - d;
      var acc = 0, a = w.pts[0], b = w.pts[1];
      for (var j = 1; j < w.pts.length; j++){ var sl = w.pts[j].distanceTo(w.pts[j - 1]); if (acc + sl >= d){ a = w.pts[j - 1]; b = w.pts[j]; d -= acc; break; } acc += sl; }
      var seg = a.distanceTo(b) || 1;
      _pt.copy(a).lerp(b, d / seg); _pt.y += Math.abs(Math.sin(time * 7 + i)) * 0.09;
      var hdg = Math.atan2(b.x - a.x, b.z - a.z) + (back ? Math.PI : 0);
      var s = w.s * Math.max(0.001, w.k);
      _qq.setFromAxisAngle(UPV, hdg); _m4.compose(_pt, _qq, _sc.set(s, s, s));
      WALK.bi.setMatrixAt(i, _m4); WALK.hi.setMatrixAt(i, _m4);
    });
    WALK.bi.instanceMatrix.needsUpdate = true; WALK.hi.instanceMatrix.needsUpdate = true;
    // boats and clouds
    BOATS.forEach(function(b){
      b.a += b.sp * dt;
      b.m.position.set(Math.cos(b.a) * b.r, -0.2 + Math.sin(time * 1.3 + b.ph) * 0.08, Math.sin(b.a) * b.r);
      b.m.rotation.set(Math.sin(time * 1.1 + b.ph) * 0.05, -b.a + (b.sp >= 0 ? Math.PI : 0), 0);
    });
    CLOUDS.forEach(function(c, i){
      c.a += c.sp * dt;
      _pt.set(Math.cos(c.a) * c.r, c.y, Math.sin(c.a) * c.r); _qq.setFromAxisAngle(UPV, c.a);
      _m4.compose(_pt, _qq, _sc.set(c.s, c.s, c.s)); CLOUDS.im.setMatrixAt(i, _m4);
    });
    CLOUDS.im.instanceMatrix.needsUpdate = true;
  }
  // first placement of things that move, so reduced motion still shows them
  (function(){
    CARS.forEach(function(c, i){
      var R = ROUTES[c.r]; R.curve.getPointAt(c.u, _pt); R.curve.getTangentAt(c.u, _tn);
      _pt.x += _tn.z * 0.75; _pt.z += -_tn.x * 0.75; _pt.y = 0.02;
      _qq.setFromAxisAngle(UPV, Math.atan2(_tn.x, _tn.z)); _m4.compose(_pt, _qq, _sc.set(0.8, 0.8, 0.8)); CARS.im.setMatrixAt(i, _m4);
    });
    CLOUDS.forEach(function(c, i){ _pt.set(Math.cos(c.a) * c.r, c.y, Math.sin(c.a) * c.r); _qq.setFromAxisAngle(UPV, c.a); _m4.compose(_pt, _qq, _sc.set(c.s, c.s, c.s)); CLOUDS.im.setMatrixAt(i, _m4); });
    WALK.forEach(function(w, i){ _m4.compose(w.pts[0], _qq.identity(), _sc.set(0.001, 0.001, 0.001)); WALK.bi.setMatrixAt(i, _m4); WALK.hi.setMatrixAt(i, _m4); });
    BOATS.forEach(function(b){ b.m.position.set(Math.cos(b.a) * b.r, -0.2, Math.sin(b.a) * b.r); b.m.rotation.y = -b.a + Math.PI; });
  })();

  /* ---------- quality: drop resolution, then shadows, if frames run slow ---------- */
  var perfN = 0, perfT = 0, perfWarm = 0, fpsAvg = 60, slowRuns = 0;
  function perf(dt){
    if (dt > 0.07) return;               // a stall or a hidden tab, not a slow device
    perfWarm += dt; if (perfWarm < 3) return;
    perfN++; perfT += dt;
    if (perfN >= 90){
      var avg = perfT / perfN; perfN = 0; perfT = 0; fpsAvg = 1 / avg;
      window.__town.fps = Math.round(fpsAvg);
      slowRuns = avg > 0.026 ? slowRuns + 1 : 0;   // under about 38 frames a second, twice running
      if (slowRuns >= 2){
        slowRuns = 0;
        if (pr > 1.01){ pr = Math.max(1, pr - 0.25); renderer.setPixelRatio(pr); onResize(); }
        else if (shadowsOn){ shadowsOn = false; sun.castShadow = false; }
      }
    }
  }

  /* ---------- the loop ---------- */
  var clock = new THREE.Clock(), raf = 0, time = 0, firstFrame = true;
  window.__town = { fps: 0, dots: 0, get t(){ return t; }, setT: function(v){ setT(v, 'test'); }, play: function(){ startPlay(); }, get playing(){ return !!play; },
    cards: function(){ return CARDS.map(function(c){ return c.id + ':' + c.mode + ':' + (c.us ? 'us' : 'now'); }); },
    units: function(){ return Object.keys(U).map(function(k){ return k + ':' + (U[k].state ? 'us' : 'now'); }); },
    get pr(){ return pr; }, get shadows(){ return shadowsOn; }, open: openSheet,
    stats: function(){ var r = renderer.info.render; return { drawCalls: r.calls, triangles: r.triangles, points: r.points }; },
    layout: function(){ return { ui: ui, W: W, H: H, fit: fit, vOff: vOff, cards: CARDS.map(function(c){ var a = project(c.anchor); return { id: c.id, mode: c.mode, ax: Math.round(a.x), ay: Math.round(a.y), x: c.x, y: c.y, w: c.w, h: c.h }; }) }; } };
  function frame(){
    raf = requestAnimationFrame(frame);
    step(Math.min(clock.getDelta(), 0.1));
  }
  // also used by tests: window.__town.tick(frames) steps the town by hand when the tab is hidden
  window.__town.tick = function(n, d){ for (var i = 0; i < (n || 1); i++) step(d || 1 / 60); return window.__town.cards(); };
  function step(dt){
    if (dead) return;
    time += dt;
    try {
      if (play) stepPlay(dt);
      else if (camAnim) stepCam(dt);
      else {
        if (!userHold && idle > 0){ idle -= dt; if (idle <= 0 && !reduce && !sheetOpen) controls.autoRotate = true; }
        controls.update(dt);
      }
      setOffset(dt);
      lineX = ui.sl.left + THUMB / 2 + t * (ui.sl.width - THUMB);
      WIPE.uWipeX.value = t <= 0.003 ? -1e7 : t >= 0.997 ? 1e7 : lineX * pr;
      sweep.style.transform = 'translate3d(' + lineX.toFixed(1) + 'px,0,0)';
      sweep.style.opacity = t > 0.003 && t < 0.997 ? 1 : 0;
      updateUnits(dt);
      updateFlows(dt);
      updateMovers(dt, time);
      seaMat.uniforms.uTime.value = reduce ? 0 : time;
      var warm = sstep(0, 1, t);
      sun.intensity = lerp(1.8, 2.05, warm); hemi.intensity = lerp(1.62, 1.8, warm);
      if (shadowDirty && shadowsOn){ renderer.shadowMap.needsUpdate = true; shadowDirty = false; }
      renderer.render(scene, camera);
      layoutCards();
      perf(dt);
    } catch (err){
      cancelAnimationFrame(raf); raf = 0;
      console.warn('3D town stopped:', err);
      showFallback('error');
      return;
    }
    if (firstFrame){
      firstFrame = false; ready = true; clearTimeout(watchdog);
      $('loading').classList.add('done');
      setTimeout(function(){ var l = $('loading'); if (l) l.style.display = 'none'; }, 800);
      if (!reduce){
        camSet({ r: fit * 1.75, ph: 0.62, th: -0.55, x: 0, y: 1, z: 4 });
        flyTo(HOME, 3.4, function(){ idle = 2.5; });
      }
    }
  }
  stop3D = function(){ if (raf) cancelAnimationFrame(raf); raf = 0; try { renderer.dispose(); } catch (e){} };
  document.addEventListener('visibilitychange', function(){
    if (dead) return;
    if (document.hidden){ if (raf){ cancelAnimationFrame(raf); raf = 0; } }
    else if (!raf){ clock.getDelta(); raf = requestAnimationFrame(frame); }
  });

  /* ---------- go ---------- */
  measureUI();
  applyFit();
  setOffset(0);
  pMat.uniforms.uScale.value = H * pr / (2 * Math.tan(camera.fov * Math.PI / 360));
  measureCards();
  if (scrollMode){ maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight); setT(window.scrollY / maxScroll, 'scroll'); }
  else setT(0, 'init');
  camSet(HOME);
  controls.update();
  if (reduce){ idle = 0; controls.autoRotate = false; }
  frame();
}
})();
