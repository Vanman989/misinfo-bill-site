/* ============================================================
   Honest Politics Party, the finance model
   One place that adds up every figure. Needs /assets/data.js and
   /assets/income-dist.js (IRD's count of people by income band).
   ============================================================ */

/* Income tax brackets: [top of band, rate %]. */
const SCHEDULES = {
  today: TODAY_BANDS,
  ours:  OUR_BANDS   // set in income-dist.js with the costing it was designed against
};

function taxOn(inc, bands){
  var t = 0, lo = 0;
  for (var i = 0; i < bands.length; i++){
    var hi = bands[i][0];
    if (inc > lo) t += (Math.min(inc, hi) - lo) * bands[i][1] / 100;
    lo = hi;
  }
  return t;
}

/* A capital gain is spread over the years it was owned: each year's share
   is added to that year's income and taxed at that year's rates. */
function gainTax(income, gain, years, bands){
  var per = gain / years;
  return (taxOn(income + per, bands) - taxOn(income, bands)) * years;
}

/* Cost of changing the brackets, from IRD's distribution: each band is
   treated as its count of people all on the band's average income. */
function bracketCost(from, to){
  var c = 0, people = 0, better = 0;
  INCOME_DIST.rows.forEach(function(r){
    var n = r[2], avg = r[3] * 1e6 / Math.max(1, n) * INCOME_DIST.scale;
    var d = taxOn(avg, from) - taxOn(avg, to);
    c += n * d; people += n; if (d > 0.5) better += n;
  });
  return { b: c / 1e9, sharePeopleBetter: better / people };
}

/* ---------- The whole plan, added up ($b a year, full strength) ---------- */
const FIN = (function(){
  var cut = bracketCost(SCHEDULES.today, SCHEDULES.ours);
  var moneyIn = [
    { label:'Capital gains, everything except homes', b:5.8, early:'about $1.7b a year over the first five years', conf:'official',
      src:TAX_PLAN[0].src[0] },
    { label:'Capital gains on homes', b:2.8, early:'small at first, building as homes are sold', conf:'estimate',
      src:TAX_PLAN[0].src[1] },
    { label:'Inheritances over $1 million', b:1.0, early:'$953m in year one', conf:'party', src:TAX_PLAN[1].src[0] },
    { label:'Rezoning windfalls', b:1.4, early:'grows as councils rezone', conf:'official', src:TAX_PLAN[2].src[0] }
  ];
  var byId = {}; POLICIES.forEach(function(p){ byId[p.id] = p; });
  var moneyOut = [
    { label:'Lower income tax for low and middle earners', b:-cut.b, conf:'estimate', src:INCOME_DIST.src },
    { label:'Free health care: GP, dental, prescriptions', b:byId.health.b, conf:'party', src:byId.health.src[0] },
    { label:'Lift family incomes', b:byId.kids.b, conf:'official', src:byId.kids.src[0] },
    { label:'Free public transport', b:byId.transport.b, conf:'estimate', src:byId.transport.src[0] }
  ];
  var investments = [
    { label:'Public supermarket chain', b:2.8, note:'One-off, to set up 120 stores. The chain then pays its own way.', src:byId.supermarket.src[1] },
    { label:'State family home loans', b:null, note:'Lent at the Government’s borrowing cost and paid back with interest. Size depends on how many homes are built.', src:byId.familyhomes.src[1] }
  ];
  var sum = function(list){ return list.reduce(function(a, x){ return a + x.b; }, 0); };
  var tin = sum(moneyIn), tout = sum(moneyOut);
  var services = sum(moneyOut.slice(1));
  return {
    cut: cut, moneyIn: moneyIn, moneyOut: moneyOut, investments: investments,
    totalIn: tin, totalOut: tout, net: tin + tout, services: -services,
    superLater: byId.super.b, deficit: Math.abs(BOOKS.obegalB)
  };
})();
