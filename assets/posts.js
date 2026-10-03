/* ============ Honest Politics Party, social posts ============
   One entry per post. lines = the big text on the image ([text, size at
   1080px wide, colour]); sub = two small lines under the rule;
   short = caption for X, Bluesky, Threads, TikTok; long = caption for
   Instagram, Facebook, LinkedIn. Every claim matches /assets/data.js. */
const C = { paper:'#FAF8F4', flame:'#E0652E', amber:'#E5A024', green:'#6FD3A6', muted:'#B9B4AA' };
const TAGS = ['#NZPol', '#NZElection2026', '#TaxFairness', '#CapitalGainsTax', '#HonestPolitics'];

const POSTS = [
  { id:'labour', title:'Labour over wealth',
    lines:[['We value', 150, C.paper], ['labour', 150, C.flame], ['over wealth.', 150, C.paper]],
    sub:['Money earned is money taxed.', 'Working or owning, the same rules.'],
    short:'We value labour over wealth. Money earned is money taxed, whether you earned it working or owning.',
    long:'We value labour over wealth.\n\nMost New Zealanders get ahead by working, and the tax system should reward that. Right now a dollar of wages is taxed from the first cent, while a dollar made from a rising house price or a share sale mostly isn’t.\n\nWe’d tax all of it the same way, and use the money to bring the tax on work down.' },

  { id:'earned', title:'Money earned is money taxed',
    lines:[['Money', 160, C.paper], ['earned is', 160, C.paper], ['money taxed.', 160, C.amber]],
    sub:['A gain on a house or shares is income,', 'just like your wages.'],
    short:'Money earned is money taxed. A gain on a house or shares is income, just like your wages. We’d tax every gain at your normal rate and use it to cut the tax on work.',
    long:'Money earned is money taxed.\n\nSell a rental, shares, a business or a farm for more than you paid, and that gain is income. Today most of it is never taxed, while your wages are taxed before you even see them.\n\nOur plan: every capital gain added to your income for the year and taxed at your normal rate. Every dollar it raises goes into bringing the tax on work down.' },

  { id:'twice', title:'Myth: taxing the same dollar twice',
    lines:[['“It’s taxing', 118, C.muted], ['the same', 118, C.muted], ['dollar twice.”', 118, C.muted], ['No.', 150, C.flame]],
    sub:['It taxes the new dollar', 'the old one made.'],
    short:'“A capital gains tax taxes the same dollar twice.” No. Buy a rental for $600k with taxed money, sell for $900k. The $600k is never taxed again. The $300k gain has never been taxed at all.',
    long:'Myth: “A capital gains tax taxes the same dollar twice.”\n\nNo. It taxes the new dollar the old one made.\n\nSay you buy a rental for $600,000 with money you already paid tax on, and sell it for $900,000. The $600,000 is never taxed again. The $300,000 gain is new money that has never been taxed at all.\n\nYour wages get taxed the moment you earn them. A gain is earnings too.' },

  { id:'rate', title:'8.9% vs 22%',
    lines:[['8.9%', 330, C.amber], ['is the tax rate of', 64, C.paper], ['NZ’s 311 wealthiest families.', 64, C.paper]],
    sub:['A nurse on $80k pays 22%.', 'IRD study, 2023'],
    short:'NZ’s 311 wealthiest families pay 8.9% tax on everything they make. A nurse on $80k pays 22%. (IRD, 2023)',
    long:'NZ’s 311 wealthiest families pay an effective tax rate of 8.9% on everything they make. A nurse on $80,000 pays 22%.\n\nWhy? 80% of those families’ income is capital gains, and New Zealand mostly doesn’t tax them.\n\nSource: Inland Revenue’s High-Wealth Individuals study, 2023.' },

  { id:'525', title:'$525 for every worker',
    lines:[['$525', 330, C.green], ['back for every worker,', 64, C.paper], ['every year.', 64, C.paper]],
    sub:['First $5,000 tax-free,', 'paid for by taxing capital gains.'],
    short:'$525 back for every worker, every year. First $5,000 of income tax-free, paid for by taxing capital gains.',
    long:'$525 back in every worker’s pocket, every year.\n\nUnder our plan nobody pays income tax on their first $5,000. It’s paid for by taxing capital gains like wages, and as that tax grows, every extra dollar goes into lifting the tax-free amount further.\n\nTry your own numbers on our site.' },

  { id:'houses', title:'$370B of untaxed gains',
    lines:[['$370B', 300, C.amber], ['NZ houses gained', 64, C.paper], ['in value in 2021.', 64, C.paper]],
    sub:['More than every wage and profit combined.', 'Tax on most of it: $0.'],
    short:'In 2021 NZ houses gained $370B in value. That’s more than every wage, salary and business profit in the country ($268B). Tax on most of it: $0.',
    long:'In 2021, New Zealand’s houses gained $370 billion in value.\n\nEvery wage, salary and business profit in the country combined came to $268 billion.\n\nTax on most of those gains: $0. (2021 was a boom year, and these are paper gains. But the point stands: the biggest money in NZ is made by owning, and it’s the money we don’t tax.)' },

  { id:'1950', title:'76.5% in 1950',
    lines:[['76.5%', 300, C.green], ['NZ’s top tax rate', 64, C.paper], ['in 1950.', 64, C.paper]],
    sub:['NZ was one of the five', 'richest countries on Earth.'],
    short:'In 1950 NZ’s top tax rate was 76.5%, and New Zealand was one of the five richest countries on Earth. Taxing wealth built the state houses, hospitals and dams.',
    long:'In 1950 New Zealand’s top tax rate was 76.5%.\n\nAnd New Zealand was one of the five richest countries on Earth. Taxing wealth built the state houses, the free hospitals and the hydro dams.\n\nMany things drove that ranking. But a high top rate clearly didn’t stop it.' },

  { id:'richlist', title:'Rich List 23×',
    lines:[['23×', 330, C.amber], ['Rich List growth', 64, C.paper], ['since 1986.', 64, C.paper]],
    sub:['Average pay: about 4×.', 'Who did the work?'],
    short:'Since 1986 NZ’s Rich List grew 23 times over, from $5.3B to $129B. Average pay grew about 4 times. Who did the work?',
    long:'Since 1986, New Zealand’s Rich List has grown 23 times over: from $5.3 billion to $129 billion.\n\nThe average pay packet grew about 4 times, barely a quarter more after inflation.\n\nWe value labour over wealth. The tax system should too.' },

  { id:'family', title:'The rise of the family',
    lines:[['A home.', 150, C.paper], ['A doctor.', 150, C.paper], ['Time with', 150, C.paper], ['your kids.', 150, C.flame]],
    sub:['The rise of the family.', 'That is what a good economy is for.'],
    short:'A home. A doctor when you need one. Time with your kids. That’s what a good economy is for.',
    long:'A home you can afford. A doctor when you need one. Time with your kids.\n\nThat is what a good economy is for.\n\nOur plan: let cities build homes, three free GP visits a year, and family incomes lifted like the 2018 package that cut child poverty, paid for by taxing wealth like work.' },

  { id:'bill', title:'Our first bill',
    lines:[['Lie under oath:', 108, C.paper], ['prison.', 108, C.flame], ['Lie to voters?', 108, C.paper], ['No offence.', 108, C.flame]],
    sub:['Our first bill changes that.', 'honestpoliticsnz.pages.dev/bill'],
    short:'Lie under oath and you can go to prison. Lie to your boss and you can be sacked. Lie to voters as an MP? No offence. Our first bill changes that.',
    long:'Lie under oath and you can go to prison. Lie to your boss and you can be sacked.\n\nKnowingly lie to voters as an MP? No specific offence.\n\nOur first bill, the Political Integrity (Misinformation Accountability) Bill, changes that, with a 48-hour window to correct the record and genuine opinions protected. Read it on our site.' }
];
