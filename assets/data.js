/* ============================================================
   Honest Politics Party, sourced data file
   Every number traces to the source listed with it.
   confidence: 'official' = Treasury / IRD / OECD / peer-reviewed;
   'party' = a party's own costing; 'estimate' = our arithmetic on
   sourced inputs, with the working shown.
   ============================================================ */

/* Promoter statement: name and contact details. Election ads must carry
   one. Leave empty and every page shows a red reminder instead. */
const PROMOTER = '';
const SITE = 'https://honestpoliticsnz.pages.dev';

const VALUES = [
  { id:'labour', title:'Labour over wealth',
    text:'Most New Zealanders get ahead by working. The tax system should reward work, not just ownership.' },
  { id:'earned', title:'Money earned is money taxed',
    text:'A dollar from a rising house price or a share sale is income, just like a dollar in your pay packet. We tax all of it the same way, and use it to bring the tax on work down.' },
  { id:'giveback', title:'Give back to the country that made you',
    text:'Roads, schools, hospitals, courts and skilled workers make every fortune possible. Using all of that and paying 8.9% is not giving back.' },
  { id:'family', title:'The rise of the family',
    text:'A home you can afford, a doctor when you need one, and time with your kids. That is what a good economy is for.' },
  { id:'ai', title:'Ready for AI',
    text:'When machines do more of the work, a tax system built on wages runs dry. Taxing every kind of income keeps hospitals, schools and Super funded.' }
];

/* ---------- Facts reused across the site (all sourced) ---------- */
const FACTS = {
  rich311: { rate:8.9, nurse:22, gains:80, wages:7, families:311,
    src:['IRD, High-Wealth Individuals Research Project (2023)', 'https://www.ird.govt.nz/-/media/project/ir/home/documents/about-us/high-wealth-research-project/hwi-research-project/final-report-april-2023/report-high-wealth-individuals-research-project.pdf'] },
  houses2021: { gainB:370, allIncomeB:268,
    src:['RNZ / CoreLogic: housing reached $1.72T in 2021', 'https://www.rnz.co.nz/news/business/460216/residential-real-estate-value-reaches-1-point-72-trillion-in-last-quarter-of-2021'],
    src2:['IRD, individuals’ total taxable income (2024 tax year)', 'https://www.ird.govt.nz/about-us/tax-statistics/revenue-refunds/income-distribution/individuals-total-taxable-income'] },
  richList: { from:5.3, to:129, mult:'23×', payMult:'about 4×',
    src:['RNZ: Rich List reaches $129B (2026)', 'https://www.rnz.co.nz/news/business/598201/tech-drives-rich-list-growth-with-aotearoa-s-wealthiest-worth-total-of-129-billion'] },
  wealthShare: { top1:26.1, bottom50:6.7,
    src:['Treasury WP 23/01, distribution of wealth (2018 data)', 'https://www.treasury.govt.nz/sites/default/files/2023-04/twp23-01.pdf'] },
  topRate1950: { rate:76.5, rank:'one of the five richest countries on Earth',
    src:['Te Ara, Taxes', 'https://teara.govt.nz/en/taxes'],
    src2:['Easton, NZ vs the OECD (Maddison series)', 'https://www.eastonbh.ac.nz/2002/08/new_zealands_postwar_economic_growth_performance_comparison_with_the_oecd/'] }
};

/* ---------- The government's books ----------
   Treasury Pre-Election Economic and Fiscal Update, 29 Sep 2026, Table 2.1. */
const BOOKS = {
  year:'2026/27', taxB:137.2, spendB:154.6, obegalB:-8.7,
  netDebtB:209.6, netDebtPctGdp:43.7, surplusYear:'2028/29',
  gdpB:480,  // derived: $137.2b is 28.6% of GDP
  source:['Treasury, Pre-Election Fiscal Update 2026', 'https://www.treasury.govt.nz/sites/default/files/2026-09/prefu26.pdf']
};

/* ---------- How tax works now: Budget 2026 at a Glance, 2026/27 ---------- */
const TAX_IN = [
  { label:'Income tax on people', b:67.9 },
  { label:'GST', b:33.1 },
  { label:'Company tax', b:20.3 },
  { label:'Fuel, alcohol, tobacco and other', b:8.1 },
  { label:'Other direct taxes', b:3.6 }
];
const SPEND_OUT = [
  { label:'Health', b:34.2 }, { label:'Welfare', b:27.0 }, { label:'NZ Super', b:26.5 },
  { label:'Education', b:22.4 }, { label:'Everything else', b:15.1 }, { label:'Interest on debt', b:10.2 },
  { label:'Law and order', b:7.6 }, { label:'Running government', b:6.6 }, { label:'Transport', b:5.1 }
];
const BUDGET_SRC = ['Budget 2026 at a Glance', 'https://budget.govt.nz/budget/pdfs/at-a-glance/b26-at-a-glance.pdf'];
const TODAY_BANDS = [[15600,10.5],[53500,17.5],[78100,30],[180000,33],[Infinity,39]]; // IRD, from 1 April 2025

/* ---------- The tax plan: money earned is money taxed ----------
   b = $b a year at full strength (positive raises money, negative costs). */
const TAX_PLAN = [
  { id:'cgt', title:'Tax every capital gain like wages',
    plain:'Sell anything for more than you paid, a rental, shares, a business, a farm, a bach or a house, and the gain is added to your income for that year and taxed at your normal rate.',
    who:'Anyone who sells an asset for a gain made after the start date.',
    b:5.8, money:'At least $5.8b a year once it has built up (about $8.3b over the first five years).',
    working:'The Tax Working Group estimated 1.2% of GDP a year for a tax that left out the family home: 1.2% of $480b = $5.8b. Including every home raises more; that has not been costed.',
    why:'The 2019 Tax Working Group recommended taxing capital gains. 80% of the wealthiest families’ income is capital gains, which today mostly escape tax.',
    confidence:'official',
    src:[['Tax Working Group 2019, Final Report Vol I', 'https://taxpolicy.ird.govt.nz/-/media/project/ir/tp/publications/2020/2020-tax-working-group/twg-final-report-voli-feb19-v1-pdf.pdf']] },
  { id:'inherit', title:'Tax big inheritances like income',
    plain:'What a person inherits over their lifetime above $1 million is taxed at 33%, like income. Below $1 million: nothing.',
    who:'About 1,100 people a year.',
    b:1.0, money:'$953m in the first year, rising to $1.1b.',
    working:'Green Party costing of the same threshold and rate.',
    why:'Money you receive is money you earn. The OECD favours taxing the person who receives, over their lifetime. New Zealand taxed estates for 126 years, until 1992.',
    confidence:'party',
    src:[['1News, inheritance tax costing (2026)', 'https://www.1news.co.nz/2026/06/21/greens-propose-wealth-inheritance-taxes-to-fund-income-tax-changes/'],
         ['OECD, Inheritance Taxation in OECD Countries (2021)', 'https://www.oecd.org/en/publications/inheritance-taxation-in-oecd-countries_e2879a7d-en/full-report/component-7.html']] },
  { id:'windfall', title:'Share the rezoning windfall',
    plain:'When a council rezones land so more can be built on it, its value jumps overnight. Half of that jump is taxed.',
    who:'Landowners whose land is upzoned.',
    b:1.4, money:'About 0.3% of GDP a year.',
    working:'0.3% of $480b GDP = $1.4b.',
    why:'The owner did nothing to earn it; a public decision created it. Recommended in the OECD’s 2026 survey of New Zealand.',
    confidence:'official',
    src:[['OECD Economic Survey of New Zealand 2026', 'https://www.oecd.org/en/publications/oecd-economic-surveys-new-zealand-2026_3ec5de98-en.html']] },
  { id:'free5k', title:'Bring the tax on work down',
    plain:'Nobody pays income tax on their first $5,000. Everyone earning $5,000 or more keeps $525 more a year. As the capital gains tax grows, every extra dollar goes into lifting that tax-free amount.',
    who:'Every worker, pensioner and student with income. Worth most, as a share of income, to the lowest paid.',
    b:-2.0, money:'About $2b a year.',
    working:'NZIER (2011, Treasury data): about $1.5b net for a $5,000 threshold. Upper bound today: $525 × about 4.2m earners = $2.2b. Needs an IRD costing.',
    why:'The Tax Working Group suggested a higher bottom threshold. A flat dollar cut helps the many more than a cut at the top.',
    confidence:'estimate',
    src:[['NZIER Insight 24, tax-free threshold', 'https://www.nzier.org.nz/hubfs/Public%20Publications/Insights/nzier_insight_24_-_getting_real_on_tax-free_threshold.pdf']] }
];
const NOT_CHOSEN = {
  title:'Why tax income, not wealth?',
  text:'We tax what you make, not what you have. A yearly wealth tax charges people on assets that may have made nothing that year. The OECD finds little case for one on top of good taxes on capital income and inheritances. Taxing every gain when it is made reaches the same fortunes, fairly.',
  src:[['OECD, The Role and Design of Net Wealth Taxes', 'https://www.oecd.org/en/publications/the-role-and-design-of-net-wealth-taxes-in-the-oecd_9789264290303-en/full-report/component-8.html']]
};

/* ---------- For families ---------- */
const POLICIES = [
  { id:'homes', title:'Let cities build homes',
    plain:'Allow townhouses and apartments near jobs and transport, everywhere, the way Auckland did in 2016.',
    evidence:'Auckland’s upzoning led to about 21,800 extra homes being consented, 4% more homes than the city had. Peer-reviewed study.',
    b:0, costLabel:'About $0',
    src:[['Greenaway-McGrevy and Phillips, Journal of Urban Economics', 'https://cowles.yale.edu/sites/default/files/2024-02/p1863.pdf']] },
  { id:'gp', title:'Three free GP visits a year',
    plain:'Everyone gets three doctor’s visits a year at no charge.',
    evidence:'One in seven adults (14.9%) skipped seeing a GP because of cost in 2024/25.',
    b:-0.49, costLabel:'$490m a year',
    src:[['Labour costing of the same policy', 'https://www.labour.org.nz/election-policy-pages/free-doctor-s-visits-with-the-medicard/'],
         ['Ministry of Health, NZ Health Survey 2024/25', 'https://www.health.govt.nz/system/files/2026-06/H2025074911-Aide-Memoire-Publication-of-results-from-the-2024-25-New-Zealand-Health-Survey.pdf']] },
  { id:'kids', title:'Lift family incomes',
    plain:'Raise Working for Families and Best Start at the same scale as the 2018 Families Package.',
    evidence:'That package cut the number of children in low-income homes by about 77,000, with no sign of people working less. It cost $5.53b over four years.',
    b:-1.4, costLabel:'About $1.4b a year',
    src:[['MSD, Families Package final evaluation', 'https://www.msd.govt.nz/documents/about-msd-and-our-work/publications-resources/evaluation/families-package-reports/summaries-of-findings/families-package-final-report.pdf']] },
  { id:'super', title:'Keep NZ Super for everyone, for good',
    plain:'Keep the pension universal. Link the age to how long people live, never past 69.',
    evidence:'Recommended in the OECD’s 2026 survey. NZ Super already costs $26.5b a year.',
    b:2.9, costLabel:'Saves about $2.9b a year, long run', longRun:true,
    working:'0.6% of $480b GDP, once fully phased in.',
    src:[['OECD Economic Survey of New Zealand 2026', 'https://www.oecd.org/en/publications/oecd-economic-surveys-new-zealand-2026_3ec5de98-en.html']] }
];

/* ---------- Our bills ---------- */
const BILLS = [
  { title:'Political Integrity (Misinformation Accountability) Bill', status:'Drafted',
    text:'Lie under oath and you can go to prison. Lie to your boss and you can be sacked. This bill makes knowingly lying to voters an offence for MPs, with a 48-hour window to correct the record.',
    href:'/bill/', cta:'Read the bill' },
  { title:'The tax plan, as a bill', status:'Next',
    text:'The plan on this page, written into law: every capital gain taxed like wages, big inheritances taxed like income, and the money used to bring the tax on work down.',
    href:'#plan', cta:'See the plan' }
];

/* ---------- The books we read ---------- */
const READING = [
  { title:'Tax by Design', who:'The Mirrlees Review, Institute for Fiscal Studies (2011)', took:'Treat different kinds of income consistently, tax land, and tax wealth when it passes on rather than every year.', url:'https://ifs.org.uk/sites/default/files/2022-08/20.%20Conclusions%20and%20recommendations%20for%20reform.pdf' },
  { title:'Future of Tax', who:'NZ Tax Working Group (2019)', took:'How to tax capital gains, what it raises, and a higher bottom threshold.', url:'https://taxpolicy.ird.govt.nz/-/media/project/ir/tp/publications/2020/2020-tax-working-group/twg-final-report-voli-feb19-v1-pdf.pdf' },
  { title:'Whakamana Tāngata', who:'Welfare Expert Advisory Group (2019)', took:'Income support that lets families live with dignity.', url:'https://www.msd.govt.nz/documents/about-msd-and-our-work/publications-resources/information-releases/weag-report-release/cabinet-paper-welfare-overhaul-advice-from-the-welfare-expert-advisor....pdf' },
  { title:'Inheritance Taxation in OECD Countries', who:'OECD (2021)', took:'Tax the person who receives, over their lifetime, with few loopholes.', url:'https://www.oecd.org/en/publications/inheritance-taxation-in-oecd-countries_e2879a7d-en/full-report/component-7.html' },
  { title:'Taxing Immovable Property', who:'IMF Working Paper 13/129 (2013)', took:'Taxes on land and property do the least harm to growth.', url:'https://www.imf.org/external/pubs/ft/wp/2013/wp13129.pdf' },
  { title:'The Triumph of Injustice', who:'Saez and Zucman (2019)', took:'Read and weighed. Their yearly wealth tax was not chosen: we tax what you make, not what you have.', url:'https://eml.berkeley.edu/~saez/saez-zucman-wealthtax-warren-feb21.pdf' }
];

/* MYTHS and AI_FACTS are filled in below once each source is verified. */
const MYTHS = [];
const AI_FACTS = [];
