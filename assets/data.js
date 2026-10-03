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
  { id:'giveback', title:'No more laundering money from the society you earn it in',
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
  { id:'cgt', title:'Tax every capital gain like wages, homes included',
    plain:'Sell anything for more than you paid, shares, a rental, a business, a farm, a bach or your own home, and the gain is taxed like wages. It is spread over the years you owned it, so one sale doesn’t push you into a higher bracket.',
    who:'Anyone who sells an asset for a gain made after the start date.',
    b:8.6, money:'About $8.6b a year once built up.',
    working:'$5.8b from everything except homes: the Tax Working Group’s 1.2% of GDP ($480b). Up to $2.8b from homes, our estimate: about $10b a year of resale gains on owner-occupied homes (Cotality Q2 2026 gains × 4 × 66.8% owner-occupied) at 28%. Nobody official has costed homes, so treat that part as a ceiling.',
    why:'Money earned is money taxed. 80% of the wealthiest families’ income is capital gains, which today mostly escape tax.',
    confidence:'estimate',
    src:[['Tax Working Group 2019, Final Report Vol I', 'https://taxpolicy.ird.govt.nz/-/media/project/ir/tp/publications/2020/2020-tax-working-group/twg-final-report-voli-feb19-v1-pdf.pdf'],
         ['Cotality, Pain and Gain Q2 2026', 'https://www.cotality.com/nz/insights/articles/share-of-nz-homes-selling-for-a-profit-falls-to-lowest-level-since-2012'],
         ['interest.co.nz, owner-occupied share of homes', 'https://interest.co.nz/property/131456/home-ownership-rate-has-dropped-74-total-housing-stock-q1-1991-67-q4-2024']] },
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
  { id:'brackets', title:'Lower tax on work, most for lower earners',
    plain:'',  // filled from OUR_BANDS_LEAD in income-dist.js
    who:'Every worker, pensioner and student with income.',
    b:0, money:'', working:'Worked out on IRD’s count of how many people earn what.',
    why:'Money from wealth should come back to the people who work. Lower earners get the biggest cut as a share of their pay.',
    confidence:'estimate',
    src:[] }  // filled from INCOME_DIST in income-dist.js
];
const NOT_CHOSEN = {
  title:'Why tax income, not wealth?',
  text:'We tax what you make, not what you have. A yearly wealth tax charges people on assets that may have made nothing that year. The OECD finds little case for one on top of good taxes on capital income and inheritances. Taxing every gain when it is made reaches the same fortunes, fairly.',
  src:[['OECD, The Role and Design of Net Wealth Taxes', 'https://www.oecd.org/en/publications/the-role-and-design-of-net-wealth-taxes-in-the-oecd_9789264290303-en/full-report/component-8.html']]
};

/* ---------- For families ---------- */
const POLICIES = [
  { id:'health', title:'Free health care',
    plain:'Three free GP visits a year for everyone, free dental care for adults, and no prescription charge.',
    evidence:'One in seven adults (14.9%) skipped the GP because of cost in 2024/25. People who couldn’t afford the $5 prescription charge were 34% more likely to end up in hospital. Adults average 2.5 GP visits a year, so three covers most people.',
    b:-2.28, costLabel:'About $2.3b a year',
    working:'GP: $553m (Labour’s costing of three free visits). Dental: $1.71b (Green Party costing). Prescriptions: about $23m (bringing the $5 charge back saves $116m over five years). Unlimited free GP visits have never been costed in NZ.',
    src:[['Labour, Medicard costing', 'https://www.labour.org.nz/election-policy-pages/free-doctor-s-visits-with-the-medicard/'],
         ['ODT, Greens free dental costing', 'https://www.odt.co.nz/news/greens-promise-free-dental-for-all-bpreowzy'],
         ['1News, prescription charge returns (2024)', 'https://www.1news.co.nz/2024/05/30/budget-2024-5-prescription-fee-back-in-weeks-with-some-exceptions/'],
         ['VUW, prescription charges and hospital admissions', 'https://www.wgtn.ac.nz/news/2024/05/prescription-co-payments-linked-to-more-hospital-admissions-study-finds']] },
  { id:'transport', title:'Free buses, trains and ferries',
    plain:'Public transport free for everyone, everywhere in New Zealand.',
    evidence:'Fares bring in about $300m a year nationally. Luxembourg went fare-free in 2020. The honest result there: free fares alone moved few people out of cars, so frequent service matters as much as price.',
    b:-0.3, costLabel:'About $300m a year, plus more services',
    working:'Cost is the fares no longer collected. Extra services to carry more people are on top and not yet costed.',
    src:[['Greater Auckland, NZ fare revenue share', 'https://www.greaterauckland.org.nz/2024/11/27/nzta-pushing-for-pt-fare-hikes-and-service-cuts/'],
         ['STATEC Luxembourg, commuting 2011 to 2021', 'https://statistiques.public.lu/en/actualites/2025/rp2021-transports-18.html']] },
  { id:'familyhomes', title:'Family homes on 99-year leases',
    plain:'The Government builds homes on Crown land and sells the house on a 99-year lease, with a low ground rent that only rises with inflation. Families buy the home, not the land, with a state home loan at the Government’s own borrowing cost.',
    evidence:'Singapore: 77% of households live in 99-year leasehold flats and 91% of them own their home; its state home loan is fixed at 2.6%. Queenstown’s housing trust already sells homes on 100-year leases. We use 99 years, not 80: Singapore starts rebuilding at about 70.',
    b:0, costLabel:'Investment: loans are repaid',
    working:'The loans come back with interest, so they are an investment, not yearly spending. The building programme has not been costed yet.',
    src:[['Singapore Department of Statistics, households 2025', 'https://www.singstat.gov.sg/find-data/explore-data-themes/households/resident-households/latest-news-data'],
         ['CPF Board, HDB loan', 'https://www.cpf.gov.sg/member/infohub/educational-resources/3-differences-between-hdb-loan-and-bank-loan'],
         ['Queenstown Lakes Community Housing Trust, Secure Home', 'https://www.qlcht.org.nz/assets/Uploads/PDFs/Secure-Home-Brochure-Sep24.pdf']] },
  { id:'supermarket', title:'A public supermarket chain',
    plain:'A state-owned chain of supermarkets, run to cover its costs rather than for maximum profit, to break the duopoly.',
    evidence:'The Commerce Commission found the big two make about $1 million a day in excess profit. When Mexico opened state milk shops, private milk got 2.4% cheaper nearby. The US military’s 235 supermarkets sell about 25% below normal prices. Not every attempt works: a small town-run store in Florida closed on weak sales.',
    b:0, costLabel:'Investment: $2.8b to set up',
    working:'Green Party costing (Parliamentary Library modelling) for 120 stores and 2 distribution centres: $1.3b, plus $1.5b of capital. Critics say it is too low.',
    src:[['Commerce Commission, grocery market study (2022)', 'https://comcom.govt.nz/news-and-media/media-releases/2022/grocery-market-study-recommends-changes-to-improve-competition-and-benefit-consumers'],
         ['interest.co.nz, KiwiMart costing', 'https://www.interest.co.nz/public-policy/140129/greens-pledge-publicly-owned-supermarket-chain-called-kiwimart-foodstuffs-and']] },
  { id:'zoning', title:'Let cities build homes',
    plain:'Allow townhouses and apartments near jobs and transport, everywhere, the way Auckland did in 2016.',
    evidence:'Auckland’s upzoning led to about 21,800 extra homes being consented, 4% more homes than the city had. Peer-reviewed study.',
    b:0, costLabel:'About $0',
    src:[['Greenaway-McGrevy and Phillips, Journal of Urban Economics', 'https://cowles.yale.edu/sites/default/files/2024-02/p1863.pdf']] },
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

/* ---------- Unbrainwashing: the myths ---------- */
const SRC_TWG_INTERIM = ['Tax Working Group, Interim Report (2018)', 'https://taxworkinggroup.govt.nz/sites/default/files/2018-09/twg-interim-report-sep18.pdf'];
const SRC_OECD_CGT = ['OECD Taxation Working Paper 72, Taxing capital gains (2025), Table 1', 'https://www.grantthornton.sa/globalassets/_markets_/sau/media/pdfs/oecd-taxing-capital-gains.pdf'];
const MYTHS = [
  { myth:'A capital gains tax taxes the same dollar twice.',
    truth:'It taxes the new dollar the old one made.',
    text:'The money you bought with was taxed once and is never taxed again. The gain is new money that has never been taxed at all. As Tax Working Group member Robin Oliver put it: “There is no double taxation.” The one real overlap, company profits and share gains, is largely handled by imputation credits.',
    eg:'Buy a rental for $600,000 with taxed money. Sell it for $900,000. The $600,000 is never taxed again. Only the $300,000 gain is taxed, once.',
    src:[['Robin Oliver, TWG note on double taxation (2018)', 'https://taxworkinggroup.govt.nz/sites/default/files/2019-02/twg-bg-4047874-double-taxation-and-option-b.pdf'], SRC_TWG_INTERIM] },
  { myth:'The rich already pay most of the tax.',
    truth:'They pay a lot of income tax because the law only sees part of their income.',
    text:'Count everything they make, gains included, and New Zealand’s 311 wealthiest families pay 8.9%. A wage earner on $80,000 pays 22%. 80% of the families’ income is capital gains, which mostly go untaxed.',
    src:[FACTS.rich311.src] },
  { myth:'Cut taxes at the top and it trickles down.',
    truth:'Fifty years of evidence says it doesn’t.',
    text:'A London School of Economics study of 18 rich countries from 1965 to 2015 found that major tax cuts for the rich raised inequality and had no significant effect on economic growth or unemployment.',
    src:[['Hope and Limberg, Socio-Economic Review (2022)', 'https://academic.oup.com/ser/article/20/2/539/6287898']] },
  { myth:'Tax the rich and they’ll all leave.',
    truth:'A few move. Most don’t, and the tax still pays.',
    text:'Studies of US millionaire taxes found tax flight happens “only at the margins”. Norway’s 2022 wealth tax rise did push some of its richest abroad, which is one reason we tax gains when they are made rather than wealth every year. And land can’t leave: a gain on New Zealand property is taxed whoever owns it.',
    src:[['Young et al, American Sociological Review (2016)', 'https://inequality.stanford.edu/node/7506'], ['Blandhol, Norway wealth tax study', 'https://cblandhol.github.io/JMP/blandhol_JMP.pdf']] },
  { myth:'Everyone taxes like we do.',
    truth:'Most rich countries tax capital gains. We mostly don’t.',
    text:'In the OECD’s 2023 table of 38 countries, New Zealand is one of seven that don’t tax gains on long-held shares, and it has no general capital gains tax at all. Australia, the UK, the US and Canada all tax capital gains.',
    src:[SRC_OECD_CGT, SRC_TWG_INTERIM] },
  { myth:'They earned it.',
    truth:'Most of it was owned, not worked for.',
    text:'80% of the wealthiest families’ income is capital gains; only 7% is wages. Since 1986 the Rich List has grown 23 times over, from $5.3B to $129B, while average pay grew about 4 times.',
    src:[FACTS.rich311.src, FACTS.richList.src] },
  { myth:'GST is fair because everyone pays the same rate.',
    truth:'Same rate, very different bite.',
    text:'Someone on a low income spends everything they earn, so GST takes a bigger share of their income than it takes from someone who can save. Measured against yearly income, the Tax Working Group found GST looks regressive.',
    src:[['Tax Working Group, GST background paper (2018)', 'https://taxworkinggroup.govt.nz/sites/default/files/2018-09/twg-bg-gst.pdf']] },
  { myth:'We can’t afford better public services.',
    truth:'The money is there. We just don’t tax it.',
    text:'In 2021 New Zealand’s houses gained $370B in value, more than every wage, salary and business profit in the country ($268B). Tax on most of it: $0. That was a boom year, but the pattern holds: the biggest money is made by owning.',
    src:[FACTS.houses2021.src, FACTS.houses2021.src2] }
];

/* ---------- Ready for AI ---------- */
const AI_FACTS = [
  { big:'60%', text:'of jobs in rich countries are exposed to AI, says the IMF. About half of those could be hurt by it.',
    src:[['IMF Staff Discussion Note 2024/001, Gen-AI and the Future of Work', 'https://www.developmentaid.org/api/frontend/cms/file/2024/01/SDNEA2024001-1.pdf']] },
  { big:'51%', text:'of all New Zealand’s tax is income tax on people: $67.9b of $133.0b. If AI shrinks wages, that is the money that disappears.',
    src:[BUDGET_SRC] },
  { big:'IMF', text:'says taxes on capital income “should be strengthened” to protect the tax base as AI shifts income from workers to owners.',
    src:[['IMF Staff Discussion Note 2024/002, Broadening the Gains from Generative AI', 'https://key4biz.it/wp-content/uploads/2024/06/SDNEA2024002.pdf']] }
];
