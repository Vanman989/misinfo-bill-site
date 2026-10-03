/* ============================================================
   NZ Tax River, sourced data file
   Every number here traces to a source fetched + verified July 2026.
   confidence: 'solid' = verified against primary source
               'estimate' = market survey / secondary / derived
               'illustrative' = editorial synthesis, labelled on page
   ============================================================ */

/* ---------- Revenue mix, Treasury B.11 audited actuals, FY 2024/25 ----------
   Source: Financial Statements of the Government of NZ, y/e 30 June 2025,
   Note 4 (published 9 Oct 2025). Every figure verified against the PDF.
   https://www.treasury.govt.nz/sites/default/files/2025-10/fsgnz-2025.pdf */
const REVENUE = {
  year: '2024/25 actuals',
  totalB: 121.058,
  streams: [
    { id: 'individuals', label: 'Income tax (people)', b: 61.849, pct: 51.1 },
    { id: 'gst',         label: 'GST',                 b: 29.550, pct: 24.4 },
    { id: 'company',     label: 'Company tax',         b: 17.496, pct: 14.4 },
    { id: 'other',       label: 'Fuel, RUC, tobacco, alcohol…', b: 12.163, pct: 10.0 }
  ],
  sourceUrl: 'https://www.treasury.govt.nz/sites/default/files/2025-10/fsgnz-2025.pdf',
  sourceName: 'Treasury, Financial Statements of the Government 2024/25 (audited)'
};

/* ---------- Spending mix, Budget 2025 core Crown forecast 2025/26 ----------
   Treasury's own "how taxpayers' money is being spent" chart. Total $150.3B.
   https://www.treasury.govt.nz/sites/default/files/2025-05/b25-at-a-glance.pdf */
const SPENDING = {
  year: 'Budget 2025 forecast, 2025/26',
  totalB: 150.3,
  sinks: [
    { id: 'health',    emoji: '🏥', label: 'Health',            b: 32.7, pct: 21.8 },
    { id: 'welfare',   emoji: '🏘️', label: 'Welfare',           b: 25.5, pct: 17.0 },
    { id: 'super',     emoji: '👴', label: 'NZ Super',          b: 24.7, pct: 16.4 },
    { id: 'education', emoji: '🏫', label: 'Education',         b: 21.5, pct: 14.3 },
    { id: 'other',     emoji: '🧰', label: 'Everything else',   b: 21.9, pct: 14.6 },
    { id: 'debt',      emoji: '💼', label: 'Debt interest',     b: 9.5,  pct: 6.3 },
    { id: 'law',       emoji: '🚓', label: 'Law & order',       b: 7.3,  pct: 4.9 },
    { id: 'transport', emoji: '🛣️', label: 'Transport',         b: 7.2,  pct: 4.8 }
  ],
  note: 'Debt interest ($9.5B) ≈ Law & order + Transport combined.',
  sourceUrl: 'https://www.treasury.govt.nz/sites/default/files/2025-05/b25-at-a-glance.pdf',
  sourceName: 'Treasury, Budget 2025 at a Glance'
};

/* ---------- Current brackets + who pays what ----------
   Brackets: IRD official, from 1 April 2025 (post the 31 July 2024 change).
   https://www.ird.govt.nz/income-tax/income-tax-for-individuals/tax-codes-and-tax-rates-for-individuals/tax-rates-for-individuals
   Share of taxpayers / share of income tax: NZ Parliamentary Library research
   brief (y/e March 2019, the most recent official full band split; uses the
   pre-2024 thresholds $14k/$48k/$70k/$180k, bands shown are the nearest map).
   https://www3.parliament.nz/mi/pb/library-research-papers/research-papers/library-research-brief-income-tax-rates/
   People examples: 2025-26 official pay scales + Stats NZ (see PEOPLE). */
const BRACKETS = [
  {
    id: 'b1', range: '$0 – $15.6k', rate: 10.5,
    shareTaxpayers: 25.4, shareTax: 1.3,
    people: ['Part-timers & students', 'A quarter of all earners'],
    note: null
  },
  {
    id: 'b2', range: '$15.6k – $53.5k', rate: 17.5,
    shareTaxpayers: 40.2, shareTax: 16.9,
    people: ['Minimum wage full-time $48.9k', 'Aged-care worker $49–59k', 'Entry retail $48–52k'],
    note: 'The biggest group of earners'
  },
  {
    id: 'b3', range: '$53.5k – $78.1k', rate: 30,
    shareTaxpayers: 15.5, shareTax: 17.9,
    people: ['Median earner $71.8k', 'ECE teacher $57k+', 'Builder ~$76k', 'Teacher step 5 $77k'],
    note: null
  },
  {
    id: 'b4', range: '$78.1k – $180k', rate: 33,
    shareTaxpayers: 17.0, shareTax: 44.0,
    people: ['Nurse (mid-scale) $92k', 'Police (5th yr) ~$93k', 'Engineer ~$124k', 'MP $177k'],
    note: 'Pays the biggest slice of income tax'
  },
  {
    id: 'b5', range: '$180k +', rate: 39,
    shareTaxpayers: 1.9, shareTax: 19.8,
    people: ['Hospital specialist $207–273k', 'PM $510k', 'NZX CEO avg $2.7M'],
    note: 'Top ~2–4% of earners'
  }
];
const BRACKETS_SHARE_NOTE = 'Share of taxpayers / tax paid: official 2019 band data (Parliamentary Library), the latest full official split; bands mapped to today’s thresholds. IRD 2025: 3.7% of earners are over $180k.';

/* ---------- The wealthy few, IRD High-Wealth Individuals Research (2023) ----------
   Primary report read + verified. All 'solid'.
   https://www.ird.govt.nz/-/media/project/ir/home/documents/about-us/high-wealth-research-project/hwi-research-project/final-report-april-2023/report-high-wealth-individuals-research-project.pdf */
const THE311 = {
  families: 311,
  medianEffectiveRate: 8.9,        // % on full economic income (excl GST)
  medianRateOnTaxableOnly: 30,     // %, what they pay on the income the law can see
  comparatorWageEarner: 22,        // % effective for an $80k wage earner (excl GST)
  capitalGainsShare: 80,           // % of their economic income arriving as capital gains
  wagesShare: 7,                   // % of their income that is wages/salary
  trustShare: 67,                  // % earned through trusts
  peakEconomicIncomeB: 14.6,       // $B, y/e March 2021 (boom-year peak; volatile)
  medianFamilyNetWorthM: 106,
  meanFamilyNetWorthM: 276,
  sourceUrl: 'https://www.ird.govt.nz/-/media/project/ir/home/documents/about-us/high-wealth-research-project/hwi-research-project/final-report-april-2023/report-high-wealth-individuals-research-project.pdf',
  sourceName: 'IRD, High-Wealth Individuals Research Project (April 2023)'
};

/* ---------- The scale of untaxed gains ----------
   The stunning sourced comparison (accrued/paper gains, outlier boom year,
   labelled as such on the page):
   - NZ housing stock gained $370B in calendar 2021 ($1.35T → $1.72T, CoreLogic via RNZ)
     https://www.rnz.co.nz/news/business/460216/residential-real-estate-value-reaches-1-point-72-trillion-in-last-quarter-of-2021
   - Total taxable income of ALL individuals, 2024 tax year: $268.0B (IRD)
     https://www.ird.govt.nz/about-us/tax-statistics/revenue-refunds/income-distribution/individuals-total-taxable-income
   - Tax Working Group 2019: a broad CGT ≈ $8.3B over first 5 years, long-run ~1.2% GDP/yr
     https://taxworkinggroup.govt.nz/resources/future-tax-final-report-vol-i-html.html */
const UNTAXED = {
  housingGain2021B: 370,
  housingGainYear: '2021 (an extreme boom year, some years are flat or negative)',
  housingGainKind: 'accrued (paper) gains on the whole housing stock, not realised sales',
  allTaxableIncomeB: 268.0,
  allTaxableIncomeYear: '2024 tax year',
  twgCgt5yrB: 8.3,
  headline: 'In 2021, NZ houses gained more in value than every wage, salary and business profit of every New Zealander combined. Tax paid on those gains outside bright-line: $0.',
  headlineConfidence: 'solid (both figures sourced), but accrued vs realised, boom-year outlier; labelled on page'
};

/* ---------- History timeline, Te Ara / IRD / NZ Legislation / Treasury ----------
   topRate: top statutory personal rate at era end (or representative).
   flows: which inflow streams existed. built: what the tax bought (sourced).
   Sources per era listed at page footer; key: Te Ara "Taxes" pages 1-8,
   Treasury welfare-state history, NZ Legislation, IRD Tax Technical. */
const HISTORY = [
  {
    id: 'customs', years: '1840–1877', short: '1840', label: 'The customs colony',
    topRate: 0, gst: 0, hasIncomeTax: false, hasLandTax: false, hasDeathDuty: true, deathDutyFrom: 1866,
    loophole: 1.0,
    revenueStory: 'No income tax at all. Two-thirds of revenue from customs duties, over 60% of it from alcohol and tobacco.',
    built: 'Roads, ports and the colonial state, funded by drinkers, smokers and land sales.',
    fact: 'An 1860 estimate put the whole tax burden at ~4% of GDP. Wealth was essentially untouched.',
    confidence: 'solid'
  },
  {
    id: 'landtax', years: '1878–1890', short: '1878', label: 'First taxes on wealth',
    topRate: 0, gst: 0, hasIncomeTax: false, hasLandTax: true, hasDeathDuty: true,
    loophole: 0.95,
    revenueStory: 'Land Tax Act 1878, then a Property Tax (1879) at 0.4% with a £500 exemption, NZ’s first direct taxes.',
    built: 'The first crack at taxing the great estates rather than consumption.',
    fact: 'Stamp and death duties (1866) were forced by the cost of the New Zealand Wars.',
    confidence: 'solid'
  },
  {
    id: 'incometax', years: '1891–1913', short: '1891', label: 'Income tax is born',
    topRate: 5, gst: 0, hasIncomeTax: true, hasLandTax: true, hasDeathDuty: true,
    loophole: 0.9,
    revenueStory: 'The Liberals’ Land and Income Assessment Act 1891: top rate 5%, incomes under £300 exempt, most people paid nothing; it was aimed squarely at wealth.',
    built: 'The graduated land tax was designed to break up the giant estates, and it worked.',
    fact: 'In 1895 land tax raised 76% of all direct tax. Taxing wealth WAS the system.',
    scaleCards: [
      { range: 'under £300', rate: '0', note: 'most people, exempt' },
      { range: 'over £300',  rate: 'up to 5' }
    ],
    scaleNote: '1891 scale',
    confidence: 'solid'
  },
  {
    id: 'ww1', years: '1914–1935', short: '1914', label: 'War & depression',
    topRate: 43.75, gst: 0, hasIncomeTax: true, hasLandTax: true, hasDeathDuty: true,
    loophole: 0.8,
    revenueStory: 'WWI multiplied income tax revenue 11-fold, it overtook customs for good. Top rate: 6.67% (1914) → 43.75% (1921).',
    built: 'The war effort, then survival through the Depression.',
    fact: 'The top rate eased to 22.5% in the roaring 20s, then the Depression hit.',
    scaleCards: [
      { range: 'top rate 1914', rate: '6.67' },
      { range: 'top rate 1921', rate: '43.75', note: 'the war multiplied it' }
    ],
    scaleNote: 'wartime escalation, full ladder not digitised',
    confidence: 'solid'
  },
  {
    id: 'welfare', years: '1936–1945', short: '1938', label: 'Building the welfare state',
    topRate: 76.5, gst: 0, hasIncomeTax: true, hasLandTax: true, hasDeathDuty: true, hasSocialSecurity: true,
    loophole: 0.25,
    revenueStory: 'Top rate 42.9% by 1939 (57% on rent, interest and dividends, "unearned" income taxed HARDER than wages). WWII pushed the top rate to 76.5%+ (Te Ara cites a 90% wartime peak).',
    built: 'The Social Security Act 1938: free hospital care, free medicine, universal superannuation. State houses going up at 57 a week by 1939. A 1939 US federal report called it the first integrated economic-security system in the world.',
    fact: 'Walter Nash paid for most of WWII by taxing "to the limit that is practicable", about 28% of GDP.',
    scaleCards: [
      { range: 'wages',            rate: 'up to 42.9' },
      { range: 'rent & dividends', rate: '57', note: '“unearned” income taxed harder' },
      { range: 'WWII peak',        rate: '76.5+' }
    ],
    scaleNote: '1939 settings; wartime peak per Te Ara',
    confidence: 'solid (90% peak: estimate)'
  },
  {
    id: 'golden', years: '1946–1957', short: '1950', label: 'The golden weather',
    topRate: 76.5, gst: 0, hasIncomeTax: true, hasLandTax: true, hasDeathDuty: true, hasSocialSecurity: true,
    loophole: 0.2,
    revenueStory: 'Top rate stayed ~76.5% through the late 40s and 50s. Death duties rose to 60% on big estates (1958). Taxing wealth at the top was simply normal.',
    built: '~30,000 state houses by 1949, then ~10,000 a year. Universal Family Benefit (1946) paid to every mother. Hydro dams: Karāpiro, Tekapo, Roxburgh. Home ownership 61% → 69% (1951–66).',
    fact: 'Unemployment was so low that, as Treasury retells it, one month there were two registered unemployed in Auckland, and the Minister of Labour knew them both.',
    ladder: 'Rates then (1950): from 4% at £200, stepping up to ~76.5% over £4,000, ladder sketch, estimate',
    scaleCards: [
      { range: 'from £200',   rate: '4' },
      { range: 'graduated',   rate: '4 → 76', note: 'yearbook table not digitised' },
      { range: 'over £4,000', rate: '76.5' }
    ],
    scaleNote: '1950 sketch (estimate)',
    confidence: 'solid (state-house counts: estimate)'
  },
  {
    id: 'paye', years: '1958–1974', short: '1958', label: 'PAYE & full employment',
    topRate: 60, gst: 0, hasIncomeTax: true, hasLandTax: true, hasDeathDuty: true, hasSocialSecurity: true,
    loophole: 0.25,
    revenueStory: 'PAYE arrives 1958, tax deducted from the pay packet before you ever see it. Top rate ~60%.',
    built: 'Benmore and Aviemore dams, the inter-island HVDC link, secondary school rolls nearly quadrupling 1943–63, university enrolments doubling. From 1958 the Family Benefit could be capitalised into a first-home deposit.',
    fact: 'Working-age New Zealanders on a benefit in the early 1970s: about 2%.',
    ladder: 'By 1968 fiscal drag had the 60% rate cutting in from ~$8,100, brackets built for the rich, reached by wage inflation',
    scaleCards: [
      { range: 'below ~$8,100',          rate: 'graduated', note: 'full table not digitised' },
      { range: 'over ~$8,100 (1968)',    rate: '60', note: 'reached by ordinary wage inflation' }
    ],
    scaleNote: 'fiscal drag pulled workers up this ladder',
    confidence: 'solid'
  },
  {
    id: 'muldoon', years: '1975–1983', short: '1975', label: 'Fiscal drag & Muldoon',
    topRate: 66, gst: 0, hasIncomeTax: true, hasLandTax: true, hasDeathDuty: true,
    loophole: 0.45,
    revenueStory: 'Inflation dragged ordinary earners into top brackets built for the rich. Muldoon raised the top rate 60% → 66% (1982).',
    built: 'Think Big projects, funded increasingly by deficits, not tax.',
    fact: 'High earners famously sheltered income in tax-exempt kiwifruit orchards.',
    ladder: 'Rates then (1983/84): 20% · 31.25% from $6k · 45.1% from $24k · 56.1% from $30k · 66% from $38,000 (top three include Muldoon’s 10% surcharge)',
    scaleCards: [
      { range: '$0 – $6k',     rate: '20' },
      { range: '$6k – $24k',   rate: '31.25' },
      { range: '$24k – $30k',  rate: '45.1' },
      { range: '$30k – $38k',  rate: '56.1' },
      { range: '$38,000 +',    rate: '66' }
    ],
    scaleNote: '1983/84 scale, incl. the 10% surcharge (Rankin / NZ Official Yearbook)',
    confidence: 'solid'
  },
  {
    id: 'rogernomics', years: '1984–1990', short: '1984', label: 'Rogernomics',
    topRate: 33, gst: 12.5, hasIncomeTax: true, hasLandTax: false, hasDeathDuty: true,
    loophole: 0.9,
    revenueStory: 'The great reversal: top rate 66% → 48% (1988) → 33% (1989). GST invented, 10% on everything (1986), 12.5% by 1989. Land tax abolished.',
    built: 'Tax burden shifted from the top of the income ladder onto every checkout in the country.',
    fact: '"There is no alternative.", Roger Douglas',
    ladder: 'Rates then: 1987/88, 15% · 30% from $9.5k · 48% from $30k; by 1989/90, 15% · 28% · 33% from $30,875',
    scaleCards: [
      { range: '$0 – $9.5k',    rate: '15' },
      { range: '$9.5k – $30,875', rate: '28' },
      { range: '$30,875 +',     rate: '33', note: 'was 66% five years earlier' }
    ],
    scaleNote: '1989/90 end-state (1987/88 top was 48% from $30k)',
    confidence: 'solid'
  },
  {
    id: 'ruthanasia', years: '1991–1999', short: '1991', label: 'Ruthanasia',
    topRate: 33, gst: 12.5, hasIncomeTax: true, hasLandTax: false, hasDeathDuty: false,
    loophole: 0.95,
    revenueStory: 'Death duties abolished (1992), after 126 years, inherited wealth goes tax-free. Benefit cuts of up to $27/week in the Mother of all Budgets.',
    built: 'What it un-built: market rents on state houses, hospital charges, free university ended.',
    fact: 'The 1958-era 60% estate duty on big inheritances became 0% for deaths after 17 Dec 1992.',
    scaleCards: [
      { range: 'low rate',  rate: '24 → 19.5', note: 'cut 1996–98' },
      { range: 'top rate',  rate: '33', note: 'threshold raised twice instead' }
    ],
    scaleNote: '1990s settings (RBNZ)',
    confidence: 'solid'
  },
  {
    id: 'clark', years: '2000–2009', short: '2000', label: 'Clark & Cullen',
    topRate: 39, gst: 12.5, hasIncomeTax: true, hasLandTax: false, hasDeathDuty: false,
    loophole: 0.9,
    revenueStory: 'Top rate back to 39% (over $60k). Nine surpluses; net debt paid to ~zero.',
    built: 'Working for Families, KiwiSaver (2007), the Cullen Fund, interest-free student loans.',
    fact: 'Capital gains stayed untouched, the loophole outlived the left.',
    ladder: 'Rates then: the new 39% applied over $60,000 (April 2000); lower brackets unchanged',
    scaleCards: [
      { range: '$0 – $38k',   rate: '19.5' },
      { range: '$38k – $60k', rate: '33' },
      { range: '$60k +',      rate: '39', note: 'new, April 2000' }
    ],
    scaleNote: '2000s statutory scale (estimate, sources differ on composite lower rates)',
    confidence: 'solid'
  },
  {
    id: 'key', years: '2010–2016', short: '2010', label: 'The switch',
    topRate: 33, gst: 15, hasIncomeTax: true, hasLandTax: false, hasDeathDuty: false,
    loophole: 0.85,
    revenueStory: 'GST up to 15%; top rate cut 38% → 33% (Oct 2010). Sold as neutral; GST hits low earners hardest as a share of income.',
    built: 'Bright-line test invented 2015, a 2-year mini-CGT on flipped rentals. Brackets then frozen for 14 years.',
    fact: 'The 2010 "tax switch" moved weight from income (progressive) to consumption (regressive).',
    scaleCards: [
      { range: '$0 – $14k',   rate: '10.5' },
      { range: '$14k – $48k', rate: '17.5' },
      { range: '$48k – $70k', rate: '30' },
      { range: '$70k +',      rate: '33' }
    ],
    scaleNote: 'post-Oct-2010 scale, then frozen for 14 years',
    confidence: 'solid'
  },
  {
    id: 'ardern', years: '2017–2023', short: '2021', label: 'Tightening (briefly)',
    topRate: 39, gst: 15, hasIncomeTax: true, hasLandTax: false, hasDeathDuty: false,
    loophole: 0.4,
    revenueStory: '39% top rate on $180k+ (2021, ~2% of earners). Bright-line stretched to 10 years; landlord interest deductions removed; trust rate to 39%.',
    built: 'The 2019 Tax Working Group recommended a full CGT. Ardern ruled it out "while I am Prime Minister".',
    fact: 'The closest NZ ever came to taxing capital gains properly, and it died in coalition.',
    scaleCards: [
      { range: '$0 – $14k',    rate: '10.5' },
      { range: '$14k – $48k',  rate: '17.5' },
      { range: '$48k – $70k',  rate: '30' },
      { range: '$70k – $180k', rate: '33' },
      { range: '$180k +',      rate: '39', note: 'new, April 2021, top ~2% of earners' }
    ],
    scaleNote: '2021–2024 scale',
    confidence: 'solid'
  },
  {
    id: 'now', years: '2024–now', short: 'NOW', label: 'The reversal',
    topRate: 39, gst: 15, hasIncomeTax: true, hasLandTax: false, hasDeathDuty: false,
    loophole: 0.95,
    revenueStory: 'Bright-line cut back to 2 years (Jul 2024). Landlord interest deductibility restored to 100% (Apr 2025). Brackets adjusted for the first time in 14 years.',
    built: 'Nine years of property-tax tightening reversed in one Budget. Debt interest now $9.5B/yr, more than Law & order and Transport combined.',
    fact: 'NZ remains one of the only developed countries with no general capital gains tax, no wealth tax, no inheritance tax and no land tax.',
    confidence: 'solid'
  }
];

/* ---------- Party modes, announced policy as at July 2026 ----------
   Election due late 2026. Sources: RNZ, interest.co.nz, party releases.
   TPM figures are their July 2023 platform (still campaigned on, no 2026
   revision found); ACT bracket detail is contested, both labelled. */
const PARTIES = [
  {
    id: 'national', label: 'National', color: '#1B5CAB',
    summary: 'Status quo (enacted): 2024 brackets, bright-line 2 years, landlord interest deductibility 100%. Opposes CGT and wealth taxes.',
    topRate: 39, gst: 15, cgt: false, wealthTax: 0, taxFree: 0, loophole: 0.95,
    vaultLine: 'No CGT, no wealth tax, gains outside the 2-year bright-line still land here tax-free.',
    confidence: 'solid, these are the enacted settings it defends',
    sourceUrl: 'https://www.national.org.nz/policies/back-pocket-boost'
  },
  {
    id: 'labour', label: 'Labour', color: '#C8102E',
    summary: 'CGT announced Oct 2025: 28% on gains from investment residential + commercial property sold after 1 July 2027. Family home, farms, KiwiSaver, shares, business assets exempt. Revenue (~$100M yr 1 → ~$969M yr 3) funds 3 free GP visits/year.',
    topRate: 39, gst: 15, cgt: true, cgtRate: 28, cgtScope: 'investment + commercial property only', wealthTax: 0, taxFree: 0, loophole: 0.55,
    vaultLine: 'From 1 Jul 2027 investment-property and commercial gains pay 28% CGT, the family home, shares and business assets still flow here untaxed.',
    confidence: 'solid (revenue figures: estimate)',
    sourceUrl: 'https://www.rnz.co.nz/news/business/577065/what-you-need-to-know-seven-questions-about-a-capital-gains-tax'
  },
  {
    id: 'greens', label: 'Greens', color: '#1F8A4C',
    summary: '2026 package: 2.5%/yr wealth tax on net assets over $10M (family home exempt, $3.8–4.1B/yr) + 33% inheritance tax over $1M (~$1B/yr, ~1,100 people) + $10k tax-free income + 45% top rate over $160k + company tax 33% for big firms + 10-yr bright-line + interest deductibility removed.',
    topRate: 45, gst: 15, cgt: true, wealthTax: 2.5, wealthThresholdM: 10, inheritanceTax: 33, taxFree: 10000, loophole: 0.1,
    scaleCards: [
      { range: '$0 – $10k',    rate: '0',           note: 'tax-free' },
      { range: '$10k – $40k',  rate: '10 / 17.5' },
      { range: '$40k – $80k',  rate: '25.5 / 30.5' },
      { range: '$80k – $160k', rate: '33.5' },
      { range: '$160k +',      rate: '45' }
    ],
    scaleNote: 'proposed 2026 scale (RNZ-verified)',
    vaultLine: '2.5%/yr wealth tax over $10M + CGT + 33% inheritance tax over $1M, most of what lands here gets taxed.',
    confidence: 'solid (RNZ-verified parameters)',
    sourceUrl: 'https://www.rnz.co.nz/news/politics/609649/greens-propose-wealth-corporate-and-inheritance-taxes-to-fund-income-tax-changes'
  },
  {
    id: 'tpm', label: 'Te Pāti Māori', color: '#B5006D',
    summary: 'Platform (2023, still campaigned): first $30k tax-free; top rate 48% over $300k; tiered wealth tax 2%/$2M, 4%/$5M, 8%/$10M; company tax 33%; GST off ALL food; 2% ghost-house tax.',
    topRate: 48, gst: 15, gstOffFood: true, cgt: true, wealthTax: 8, wealthThresholdM: 2, taxFree: 30000, loophole: 0.05,
    scaleCards: [
      { range: '$0 – $30k', rate: '0',  note: 'tax-free' },
      { range: 'graduated', rate: '15' },
      { range: 'graduated', rate: '33 / 39' },
      { range: 'graduated', rate: '42' },
      { range: '$300k +',   rate: '48' }
    ],
    scaleNote: '2023 platform (middle thresholds not re-announced)',
    vaultLine: 'Tiered wealth tax 2% / 4% / 8% + CGT, this river nearly dries up.',
    confidence: 'estimate, 2023 platform figures, no 2026 revision found',
    sourceUrl: 'https://www.nzherald.co.nz/nz/politics/maori-party-wealth-tax-plan-over-98-per-cent-of-nzers-get-tax-cut-gst-off-kai-and-higher-top-rates/YEMJJZGV2ZFX5DJG5MFVDDRLQM/'
  },
  {
    id: 'act', label: 'ACT', color: '#FDE401',
    summary: 'Fewer, flatter brackets (long-standing two-rate proposal: 17.5% to $70k, 28% above, exact 2026 numbers unconfirmed). Opposes CGT and wealth taxes.',
    topRate: 28, gst: 15, cgt: false, wealthTax: 0, taxFree: 0, loophole: 1.0,
    scaleCards: [
      { range: '$0 – $70k', rate: '17.5' },
      { range: '$70k +',    rate: '28' }
    ],
    scaleNote: 'long-standing two-rate proposal (contested detail)',
    vaultLine: 'No CGT, no wealth tax, the gold river flows untouched.',
    confidence: 'contested, bracket detail from media reporting, not a 2026 costed release',
    sourceUrl: 'https://www.rnz.co.nz/news/political/507787/act-leader-david-seymour-says-simpler-tax-system-would-encourage-a-culture-of-success'
  },
  {
    id: 'nzf', label: 'NZ First', color: '#555555',
    summary: 'First $14k tax-free (by 2026-27); GST off basic foods (long-standing); no personal/company tax rises; no CGT, no wealth tax.',
    topRate: 39, gst: 15, gstOffFood: true, cgt: false, wealthTax: 0, taxFree: 14000, loophole: 0.95,
    scaleCards: [
      { range: '$0 – $14k',       rate: '0', note: 'tax-free' },
      { range: '$14k – $53.5k',   rate: '17.5' },
      { range: '$53.5k – $78.1k', rate: '30' },
      { range: '$78.1k – $180k',  rate: '33' },
      { range: '$180k +',         rate: '39' }
    ],
    scaleNote: '$14k tax-free commitment (estimate); other bands unchanged',
    vaultLine: 'No CGT, no wealth tax, unchanged.',
    confidence: 'estimate, from conference commitments, not a costed manifesto',
    sourceUrl: 'https://www.nzherald.co.nz/nz/politics/nz-firsts-winston-peters-promises-inflation-adjusted-income-tax-brackets-tax-incentives/5AAG7IE7NBA6BL5A6MVEMPWC4I/'
  }
];

/* ---------- Wealth concentration over time ----------
   Sources: Stats NZ HES net worth June 2024; Treasury WP 23/01 (capitalisation
   method, corrects the survey's undercount of the very top); VUW estate-duty
   thesis for the 1890s/1930s points; NBR Rich List via RNZ.
   HONESTY NOTE: no verified decade-by-decade top-1% series exists for
   1950–2010 (WID's NZ CSV couldn't be pulled), the timeline shows only the
   sourced points and says so. */
const WEALTH = {
  totalHouseholdNetWorth: { t: 2.5, basis: 'national-accounts basis, mid-2026', confidence: 'estimate',
    hesT: 2.067, hesBasis: 'Stats NZ HES survey, June 2024', hesConfidence: 'solid' },
  gdpB: 450, gdpYear: 'y/e March 2026',
  now: {
    top1: 26.1, top10: 67.2, top01: 8.3,
    basis: 'Treasury capitalisation method (WP 23/01, 2018 data), corrects the survey undercount of the very top',
    surveyTop10: 49, surveyBasis: 'Stats NZ HES June 2024 (survey, undercounts the top)',
    bottom50: 6.7,
    top1VsBottom50: 'The top 1% own more than twice the wealth of the bottom 50%.'
  },
  series: [
    { year: 1895, label: '1890s', top1: 57.5, range: '55–60%', note: 'Colonial concentration, the great estates', confidence: 'estimate' },
    { year: 1938, label: '1930s', top1: 27.5, range: '25–30%', note: 'After 40 years of land tax, death duties and rising top rates', confidence: 'estimate' },
    { year: 2018, label: '2018', top1: 26.1, range: '26.1%', note: 'Treasury capitalisation estimate (survey says ~20%, it misses the top)', confidence: 'solid' }
  ],
  seriesNote: 'Only three measurements of NZ’s top-1% wealth share have ever been made, nothing exists for 1950–2010, and nothing newer than 2018, so that 26.1% is still the figure quoted today (the flat dotted line). The shape, colonial high, mid-century fall under wealth taxes, post-1986 rise, is directionally supported; the Rich List below tracks the modern rise in hard dollars.',
  richList: [
    { year: 1986, totalB: 5.3, note: 'First NBR Rich List, 55 individuals + 12 families' },
    { year: 2025, totalB: 102.1, billionaires: 18 },
    { year: 2026, totalB: 129, billionaires: 26, note: '23× growth in 40 years; average individual lister $78M → $984M' }
  ],
  /* Same 40 years, ordinary pay: ≈$400/wk (1986, interpolated between the
     sourced $285/wk 1984 and $529/wk 1989, estimate) → $1,679/wk (Stats NZ
     QES June 2025, solid). CPI 1986→2025: 3.09× (triangulated). Real wage
     growth ~0.5–0.9%/yr corroborated by NZIER. */
  payCompare: {
    richMult: '23×', richRealMult: '≈7.4×',
    payMult: '≈4×', payRealMult: '≈1.2–1.4×',
    pay1986: '≈$400/wk', payNow: '$1,679/wk', cpiMult: '3.09×',
    line: 'Their pile grew 23×, more than sevenfold after inflation. The average pay packet grew ≈4×, barely a quarter more, in real terms, after 40 years.',
    caveat: 'Pay: ≈$400/wk 1986 (interpolated between sourced 1984/1989 figures, estimate) → $1,679/wk (Stats NZ, June 2025). Prices themselves rose 3.09× over the period.'
  },
  sources: [
    { name: 'Treasury WP 23/01, Estimating the distribution of wealth in NZ', url: 'https://www.treasury.govt.nz/sites/default/files/2023-04/twp23-01.pdf' },
    { name: 'Stats NZ, Household net worth statistics, June 2024', url: 'https://www.stats.govt.nz/information-releases/household-net-worth-statistics-year-ended-june-2024/' },
    { name: 'RNZ, Rich Listers reach $129B (2026)', url: 'https://www.rnz.co.nz/news/business/598201/tech-drives-rich-list-growth-with-aotearoa-s-wealthiest-worth-total-of-129-billion' },
    { name: 'RNZ, NZ household wealth ~$2.5T (2026)', url: 'https://www.rnz.co.nz/news/business/598209/elon-musk-only-marginally-less-wealthy-than-all-new-zealanders-combined' },
    { name: 'VUW thesis, Wealth and Income in NZ c.1870–c.1939', url: 'https://openaccess.wgtn.ac.nz/articles/thesis/Wealth_and_Income_in_New_Zealand_c_1870_to_c_1939/16949485' },
    { name: 'NZHistory, The 1980s overview (1984/1989 average wages)', url: 'https://nzhistory.govt.nz/culture/the-1980s/overview' },
    { name: 'NZIER, Looking at the Numbers (real wage growth series)', url: 'https://www.nzier.org.nz/hubfs/Public%20Publications/Public%20good/looking_at_the_numbers__updated_text_2016.pdf' }
  ]
};

/* ---------- How the wealthy few fared, era by era ----------
   Shown on the vault in historical eras (the 8.9% IRD study is 2015-21 data
   and would be anachronistic earlier). Every line traces to sourced facts
   already cited in HISTORY / the research pass. */
const WEALTHY_BY_ERA = {
  customs:     'No income tax, no land tax, wealth passed untouched. Over 60% of revenue came from booze-and-tobacco duties everyone paid.',
  landtax:     'The first taxes aimed at wealth: land tax (1878), property tax 0.4% over £500 (1879), death duties since 1866.',
  incometax:   'A system built to tax the rich: incomes under £300 exempt (most people paid nothing), graduated land tax broke up the great estates, land tax was 76% of direct tax revenue in 1895.',
  ww1:         'Top rate 43.75% by 1921, death duties and land tax still biting, the war was paid for from the top.',
  welfare:     'Rent, interest and dividends taxed at 57% by 1939, "unearned" income taxed HARDER than wages. WWII pushed the top rate past 76%.',
  golden:      'Top rate 76.5%, death duties up to 60% on big estates, land tax still in force, wealth paid at every turn, and NZ built houses, hospitals and dams with it.',
  paye:        'Top rate ~60%, death duties, land tax, still no escape hatch for wealth.',
  muldoon:     '66% top rate (1982), but the kiwifruit-orchard shelters showed the dodging had begun.',
  rogernomics: 'The escape hatch opens: top rate 66% → 33% in two years, land tax abolished.',
  ruthanasia:  'Death duties abolished 1992, after 126 years, inherited wealth passes 100% tax-free.',
  clark:       'Top rate back to 39%, but capital gains stay completely untaxed.',
  key:         'The bright-line arrives (2015): 2 years, easily waited out.',
  ardern:      'The loophole squeezed: 10-year bright-line, interest deductions removed, trust rate 39%.',
  now:         null /* modern IRD-study lines show instead */
};

/* ---------- Them vs us, in every era ----------
   IRD's effective-rate study (8.9% vs 22%) only exists for 2015-21, so for
   historical eras we show the STATUTORY rates each side faced, drawn from
   the same sourced ladders as the era cards, and labelled as statutory. */
const ERA_RATES = {
  customs:     { them: '0%', us: '0%', kind: 'income tax, it didn’t exist yet',
                 note: 'Over 60% of all revenue came from duties on alcohol and tobacco, paid at the same price by everyone, so it took a far bigger bite of a labourer’s wage.' },
  landtax:     { them: '0.4%', us: '0%', kind: 'the new property tax (over a £500 exemption)',
                 note: 'The first tax aimed squarely at wealth. Wage earners paid none of it.' },
  incometax:   { them: 'up to 5%', us: '0%', kind: 'statutory income tax',
                 note: 'Incomes under £300 were exempt, most people paid nothing. The tax was designed to reach the wealthy only.' },
  ww1:         { them: '43.75%', us: 'nil or near-nil', kind: 'top statutory rate, 1921',
                 note: 'The war was paid for from the top.' },
  welfare:     { them: '57%', us: '≈5%', kind: 'statutory, their rent/interest/dividends vs a worker’s social-security tax',
                 note: '“Unearned” income was deliberately taxed HARDER than wages. The wartime top rate reached 76.5%+.' },
  golden:      { them: '76.5%', us: '≈4%', kind: 'statutory top rate vs the bottom of the ladder (from £200)',
                 note: 'Plus death duties up to 60% on big estates, and land tax. Wealth paid at every turn, and it built the state houses, the free hospitals and the dams.' },
  paye:        { them: '60%', us: '≈20%', kind: 'statutory top rate vs the bottom rate',
                 note: 'PAYE arrives (1958), a worker’s tax comes out before they ever see the money.' },
  muldoon:     { them: '66%', us: '20%', kind: 'statutory, theirs applied over $38,000',
                 note: 'Fiscal drag hauled ordinary workers up a ladder built for the rich. High earners sheltered income in tax-exempt kiwifruit orchards.' },
  rogernomics: { them: '33%', us: '15% + GST', kind: 'statutory, theirs fell from 66% in two years',
                 note: 'The burden shifts off the top of the income ladder and onto every checkout in the country.' },
  ruthanasia:  { them: '33%', us: '19.5–24%', kind: 'statutory, and death duties abolished (1992)',
                 note: 'After 126 years, inherited wealth passes completely tax-free.' },
  clark:       { them: '39%', us: '19.5%', kind: 'statutory, theirs applied over $60,000',
                 note: 'Capital gains stayed untouched, the loophole outlived the left.' },
  key:         { them: '33%', us: '10.5% + GST 15%', kind: 'statutory',
                 note: 'Income tax down, GST up: weight moved from the progressive tax to the regressive one.' },
  ardern:      { them: '39%', us: '10.5–30%', kind: 'statutory, theirs applied over $180,000',
                 note: 'The closest NZ came to taxing capital gains properly, and it died in coalition.' }
};
const MODERN_RATES_NOTE = 'Effective rates: what they actually pay on ALL their income, capital gains included (IRD’s 2023 study of the 311 wealthiest families). No such study existed before then, earlier eras show statutory rates.';

/* ---------- What each party's policy would do to the wealthy few ----------
   Derived by simple arithmetic from IRD's median wealthy family (net worth
   $106M, economic income ~$8M/yr, tax ~$0.64M/yr, HWI report 2018 figures)
   applied to each party's announced parameters. LABELLED ILLUSTRATIVE on the
   page: this is transparent arithmetic, not an official costing. */
const PARTY_WEALTHY_RATE = {
  national: { rate: '8.9% → 8.9%', line: 'Unchanged, no CGT, no wealth tax.', derived: false },
  labour:   { rate: '8.9% → ≈9–10%', line: 'Barely moves for the 311, most of their gains sit in exempt assets (shares, businesses, trusts); only property gains pay the 28% CGT.', derived: true },
  greens:   { rate: '8.9% → ≈38%', derived: true,
              line: '≈38% of a normal year’s income. The 2.5% wealth tax over $10M ≈ $2.4M a year on the median $106M fortune, plus income tax, with CGT and a 33% inheritance tax on top.' },
  tpm:      { rate: '8.9% → ≈100%', derived: true,
              line: '≈100% of a normal year’s income, because their 2/4/8% tiers ≈ $7.9M a year, about everything a $106M fortune earns in a year (~7.5% return). The fortune stops growing. It’s ~8% of their wealth, not all of it.' },
  act:      { rate: '8.9% → 8.9% or lower', line: 'No CGT, no wealth tax; 28% top rate.', derived: false },
  nzf:      { rate: '8.9% → 8.9%', line: 'Unchanged, no CGT, no wealth tax.', derived: false }
};

/* ---------- What actually changed, 2010 → 2018 ----------
   The ONLY stretch NZ has ever measured properly (Treasury WP 23/01,
   capitalisation method, individual basis). The top 1%'s SHARE fell, while
   their average wealth rose $2.3M and the middle person's rose $18,000. */
const NZ_SHIFT = {
  period: '2010 → 2018',
  top1Gain: 2300000, midGain: 18000,
  ratio: 128,                                   // 2.3M ÷ 18k, rounded
  shares: [
    { year: 2010, top1: 28.8, top10: 71.1, top01: 10.6 },
    { year: 2015, top1: 24.2, top10: 64.6, top01: 8.6 },
    { year: 2018, top1: 26.1, top10: 67.2, top01: 8.3 }
  ],
  shareLine: 'Their share even <b>fell</b>, 28.8% → 26.1%, because the whole pool grew. Share is not the story. Dollars are.',
  note: 'Average wealth per person, 2010 → 2018, in Q2-2022 dollars. Top 1% vs decile 5 (the middle New Zealander). Treasury’s capitalisation method, the first and only NZ wealth-distribution estimate of its kind.',
  sourceUrl: 'https://www.treasury.govt.nz/sites/default/files/2023-04/twp23-01.pdf'
};

/* ---------- Who owns the world ----------
   Shares: World Inequality Report 2026 (top 1% = 37%, bottom 50% = 2%) and
   WIR2022 (top 10% = 76%, middle 40% = 22%). Total: UBS Global Wealth Report
   2025 (2024 data, 56 markets ≈ 92% of world wealth). */
const WORLD = {
  totalT: 471,
  top1: 37, next9: 39, mid40: 22, bottom50: 2,
  basis: 'WIR 2026 · UBS 2025',
  headline: 'The richest 1% own <b>37%</b> of everything, eighteen times more than the entire bottom half of humanity, who own <b>2%</b>.',
  extra: 'Fewer than 60,000 people, the top 0.001%, own three times more wealth than the poorest four billion combined.',
  growth: 'Since the mid-1990s the top 1% captured <b>38%</b> of all the new wealth the world created. The bottom half captured <b>2%</b>.',
  caveat: 'Different methods disagree at the very top: UBS’s survey basis puts the top 1% nearer 45%, WID’s national-accounts basis at 37%. The shape is the same either way.',
  sources: [
    { name: 'World Inequality Report 2026, global economic inequity', url: 'https://wir2026.wid.world/insight/global-economic-inequity/' },
    { name: 'World Inequality Report 2022, global wealth inequality', url: 'https://wir2022.wid.world/chapter-4/' },
    { name: 'UBS Global Wealth Report 2025', url: 'https://www.ubs.com/global/en/media/display-page-ndp/en-20250618-gwr-2025.html' }
  ]
};

/* ---------- NZ's world income ranking over time ----------
   The famous slide: among the world's richest per person in the early 1950s,
   ~20th by the 1990s. Primary series: Brian Easton's Maddison-OECD table
   (solid); the ubiquitous "3rd in the world" media figure is real but no
   primary dataset states it (Motu says 3rd in OECD 1950; Easton says 5th at
   148% of OECD average), shown as "top 3–5". Current rank: OECD PPP. */
const RANKING = {
  slide: [
    { label: '1950',  big: 'top 3–5',   rate: '76.5%',   sub: 'richest per person on Earth · 148% of OECD avg', tone: 'good' },
    { label: '1960',  big: '5th',       rate: '≈60–76%', sub: 'in the OECD · 131% of avg', tone: 'good' },
    { label: '1970',  big: '11th',      rate: '60%',     sub: 'the slide begins', tone: '' },
    { label: '1979',  big: '18th',      rate: '60%',     sub: 'the crash decade (UK joins EEC, oil shocks)', tone: 'hot' },
    { label: '1990',  big: '19th',      rate: '33%',     sub: '89% of OECD avg', tone: 'hot' },
    { label: '2000',  big: '20th',      rate: '39%',     sub: '84% of OECD avg', tone: 'hot' },
    { label: 'today', big: '18th / 38', rate: '39%',     sub: 'GDP per person, PPP (2025)', tone: '' }
  ],
  headline: 'When the top tax rate was 76.5%, a New Zealand income was among the best on Earth.',
  caveat: 'Top rates shown at the nearest sourced year (76.5% is the 1949 scale; the 60% figures are the 1968 and 1979 scales). Ranking driven by many forces, Britain joining the EEC in 1973 took ~half of NZ’s export market, then the oil shocks; one study puts NZ ~20% poorer a decade later than a no-EEC counterfactual. Sources: Easton (Maddison-OECD series), Treasury WP 02/14, Motu, LSE/Grier & Munger, Rankin/NZOYB.',
  byEra: {
    golden:      'Top 3–5 richest countries per person (1950, 148% of OECD average)',
    paye:        '5th in the OECD in 1960 (131% of average); still top-5 to the mid-60s, 11th by 1970',
    muldoon:     'The crash: ~6th (1974) → 18th (1979); 19th by 1980',
    rogernomics: '19th in the OECD (89–100% of average through the late 80s)',
    ruthanasia:  '19th–20th, Ireland overtakes NZ in 1997',
    clark:       '20th in the OECD (2000, 84% of average)',
    key:         '≈20th in the OECD',
    ardern:      '≈18th–20th in the OECD',
    now:         '18th of 38 in the OECD (GDP per person, PPP, 2025)'
  },
  sources: [
    { name: 'Easton, NZ post-war growth vs the OECD (Maddison-OECD series)', url: 'https://www.eastonbh.ac.nz/2002/08/new_zealands_postwar_economic_growth_performance_comparison_with_the_oecd/' },
    { name: 'Treasury WP 02/14, Measuring economic growth in NZ', url: 'https://www.treasury.govt.nz/publications/wp/measuring-economic-growth-new-zealand-wp-02-14' },
    { name: 'Motu, Why are New Zealanders so wealthy?', url: 'https://www.motu.nz/our-research/wellbeing-and-macroeconomics/economic-performance/why-are-new-zealanders-so-wealthy' },
    { name: 'LSE, What Brexit can learn from NZ (EEC shock estimate)', url: 'https://blogs.lse.ac.uk/politicsandpolicy/new-zealand-brexit/' }
  ]
};

/* ---------- What each party's scale means for an $80k earner ----------
   Pure bracket arithmetic (no credits/ACC), matching the IRD study's $80k
   comparator. Current scale bill: $16,278/yr (20.3%). Derived, labelled
   illustrative. TPM's middle thresholds were never re-announced, not
   computable without inventing numbers. */
const PARTY_80K = {
  current:  { bill: 16278, rate: 20.3 },
  national: { bill: 16278, rate: 20.3, delta: 0,     note: 'unchanged' },
  labour:   { bill: 16278, rate: 20.3, delta: 0,     note: 'unchanged, the CGT doesn’t touch wages' },
  greens:   { bill: 15700, rate: 19.6, delta: -578,  note: 'their proposed scale' },
  tpm:      { bill: null,  rate: null, delta: null,  note: 'middle thresholds unannounced, not computable (the party claims 98% get a cut)' },
  act:      { bill: 15050, rate: 18.8, delta: -1228, note: 'two-rate proposal (contested detail)' },
  nzf:      { bill: 14920, rate: 18.7, delta: -1358, note: 'first $14k tax-free' }
};

/* ---------- Sources for the footer ---------- */
const SOURCES = [
  { name: 'Treasury, Financial Statements of the Government 2024/25 (audited actuals)', url: 'https://www.treasury.govt.nz/sites/default/files/2025-10/fsgnz-2025.pdf' },
  { name: 'Treasury, Budget 2025 at a Glance', url: 'https://www.treasury.govt.nz/sites/default/files/2025-05/b25-at-a-glance.pdf' },
  { name: 'IRD, Tax rates for individuals', url: 'https://www.ird.govt.nz/income-tax/income-tax-for-individuals/tax-codes-and-tax-rates-for-individuals/tax-rates-for-individuals' },
  { name: 'NZ Parliamentary Library, Income tax rates research brief', url: 'https://www3.parliament.nz/mi/pb/library-research-papers/research-papers/library-research-brief-income-tax-rates/' },
  { name: 'IRD, High-Wealth Individuals Research Project (2023)', url: 'https://www.ird.govt.nz/-/media/project/ir/home/documents/about-us/high-wealth-research-project/hwi-research-project/final-report-april-2023/report-high-wealth-individuals-research-project.pdf' },
  { name: 'Te Ara, Taxes (history of NZ taxation)', url: 'https://teara.govt.nz/en/taxes' },
  { name: 'Treasury, History of the Welfare State in NZ (Carpinter 2012)', url: 'https://www.treasury.govt.nz/sites/default/files/2012-10/ltfep-s2-03.pdf' },
  { name: 'NZ Legislation, Estate Duty Abolition Act 1993', url: 'https://www.legislation.govt.nz/act/public/1993/0013/latest/whole.html' },
  { name: 'Tax Working Group, Future of Tax, Final Report (2019)', url: 'https://taxworkinggroup.govt.nz/resources/future-tax-final-report-vol-i-html.html' },
  { name: 'RNZ, CoreLogic: residential real estate reaches $1.72T (2021)', url: 'https://www.rnz.co.nz/news/business/460216/residential-real-estate-value-reaches-1-point-72-trillion-in-last-quarter-of-2021' },
  { name: 'IRD, Individuals’ total taxable income', url: 'https://www.ird.govt.nz/about-us/tax-statistics/revenue-refunds/income-distribution/individuals-total-taxable-income' },
  { name: 'RNZ, Greens propose wealth, corporate and inheritance taxes (2026)', url: 'https://www.rnz.co.nz/news/politics/609649/greens-propose-wealth-corporate-and-inheritance-taxes-to-fund-income-tax-changes' },
  { name: 'RNZ, Labour CGT: seven questions (2025)', url: 'https://www.rnz.co.nz/news/business/577065/what-you-need-to-know-seven-questions-about-a-capital-gains-tax' },
  { name: 'Stats NZ, Labour market statistics (income), June 2025', url: 'https://www.stats.govt.nz/information-releases/labour-market-statistics-income-june-2025-quarter/' },
  { name: 'Rankin (2014), NZ income tax in the Muldoon years 1967-84 (NZOYB rate tables)', url: 'http://keithrankin.co.nz/Rankin_Muldoon-years_Hamilton-conference_2014.pdf' },
  { name: 'Treasury WP 12/04, Average marginal income tax rates for NZ, 1907-2009', url: 'https://www.treasury.govt.nz/publications/wp/average-marginal-income-tax-rates-new-zealand-1907-2009-wp-12-04' }
];
