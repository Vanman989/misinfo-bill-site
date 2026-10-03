/* ============================================================
   IRD: how many people earn what (taxable income by $5,000 band)
   2024 tax year, the latest complete table, as republished by
   Figure.NZ from IRD. Incomes are grown to IRD's 2025 total
   ($278.2b against $268.0b) before costing. Each row:
   [band from, band to, number of people, total income $m].
   Check: today's 2024 brackets applied to these bands give $60.9b of
   income tax; IRD's own figure for the same people is $60.7b.
   ============================================================ */
const INCOME_DIST = {
  year:'IRD taxable income by band, 2024 tax year, grown to 2025 totals',
  src:['IRD taxable income distribution (via Figure.NZ)', 'https://figure.nz/table/R9wuqbMnwiIW7PA2'],
  scale:278.2 / 267.99,
  rows:[
    [0,0,54800,0.0],
    [0.01,5000,624100,488.7],
    [5001,10000,140120,1045.2],
    [10001,15000,140080,1755.7],
    [15001,20000,179810,3172.8],
    [20001,25000,417800,9418.0],
    [25001,30000,304790,8431.8],
    [30001,35000,293160,9340.1],
    [35001,40000,173690,6503.4],
    [40001,45000,156460,6647.3],
    [45001,50000,165890,7888.1],
    [50001,55000,166710,8754.2],
    [55001,60000,168750,9703.0],
    [60001,65000,165730,10354.0],
    [65001,70000,167810,11349.5],
    [70001,75000,152730,11052.0],
    [75001,80000,130320,10091.3],
    [80001,85000,115320,9505.5],
    [85001,90000,101170,8845.3],
    [90001,95000,89960,8315.3],
    [95001,100000,80100,7806.7],
    [100001,105000,74400,7617.7],
    [105001,110000,62640,6729.7],
    [110001,115000,55230,6207.9],
    [115001,120000,48680,5716.8],
    [120001,125000,43510,5324.4],
    [125001,130000,38450,4900.3],
    [130001,135000,34170,4525.4],
    [135001,140000,29950,4116.6],
    [140001,145000,27280,3885.0],
    [145001,150000,24330,3588.4],
    [150001,155000,22550,3437.6],
    [155001,160000,19670,3097.2],
    [160001,165000,18200,2954.7],
    [165001,170000,16400,2746.4],
    [170001,175000,15330,2645.9],
    [175001,180000,20050,3568.3],
    [180001,185000,14540,2647.2],
    [185001,190000,10450,1957.5],
    [190001,195000,9180,1765.4],
    [195001,200000,8300,1639.0],
    [200001,205000,7920,1602.2],
    [205001,210000,6690,1388.7],
    [210001,215000,6050,1285.0],
    [215001,220000,5470,1189.7],
    [220001,225000,4980,1108.5],
    [225001,230000,4600,1046.1],
    [230001,235000,4170,969.0],
    [235001,240000,3810,903.7],
    [240001,245000,3520,852.5],
    [245001,250000,3280,812.7],
    [250001,255000,3050,770.7],
    [255001,260000,2720,700.4],
    [260001,265000,2510,658.2],
    [265001,270000,2360,630.6],
    [270001,275000,2160,587.9],
    [275001,280000,2080,576.6],
    [280001,285000,2010,566.9],
    [285001,290000,1780,511.4],
    [290001,295000,1720,502.4],
    [295001,300000,1590,473.8],
    [300001,Infinity,38840,21312.9]
  ]
};

/* Our brackets: the first $12,000 tax-free, everything else as today.
   Costed on the table above at $5.05b a year; it starts at $5,000
   ($2.16b) in year one and rises as the capital gains tax builds up. */
const OUR_BANDS = [[12000,0],[15600,10.5],[53500,17.5],[78100,30],[180000,33],[Infinity,39]];
const OUR_BANDS_LEAD = 'Nobody pays income tax on their first $12,000. That is $1,260 more a year for everyone earning over $12,000, and it is worth most to lower earners: someone on $20,000 goes from paying 12.0% of their income to 5.7%.';
const OUR_BANDS_NOTE = 'Why this shape: a tax-free amount gives everyone the same dollars, so it cuts the rate most for the lowest paid, and it is the simplest change to explain and run. It starts at $5,000 in year one (about $2.2b) and rises to $12,000 as the capital gains tax builds up. Every dollar the capital gains tax raises beyond our costing goes into lifting it further. The top rates stay as they are: people at the top now pay through the capital gains tax.';

const METHOD_NOTES = [
  'Every figure is a full year at full strength unless it says otherwise, with its source and how sure it is (official source, party costing or our estimate) shown beside it.',
  'The bracket cost uses IRD’s count of people in each $5,000 band, each person taken at their band’s average income, grown to 2025 totals. It checks out: applied to today’s IRD figures it reproduces income tax within 0.3%. Incomes are higher again by 2026/27, so the real cost is a few percent more.',
  'Capital gains on homes is our estimate, not an official one: about $10b a year of resale gains on owner-occupied homes, taxed at 28%. It ignores the cost of improvements, so treat it as a ceiling. Spreading gains over the years owned lowers it a little.',
  'In the first years the capital gains tax raises far less, about $1.7b a year for everything except homes, while gains build up. The tax-free amount and the new services phase in only as that money arrives, so nothing is paid for by borrowing.',
  'Not yet costed: the extra trains, the family home building programme, and taxing gains at death.',
  'No allowance is made for people changing what they do because of the tax. Official costings would add that.'
];
