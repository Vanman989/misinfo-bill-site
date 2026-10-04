/* ============================================================
   History page data: when countries tried to share the wealth.
   Researched 5 October 2026 from declassified US records, official
   reports and academic sources. Each case says what came from
   outside AND what went wrong at home, so it stands up to scrutiny.
   reported:true marks a figure taken from a secondary source.
   ============================================================ */
const CASES = [
  { id:'guatemala', place:'Guatemala', years:'1951 to 1954', year:1952, lat:15.5, lon:-90.3, kind:'pressure',
    tried:'Land reform (Decree 900, 1952): idle land over 223 acres on big estates was taken and paid for in 25-year bonds, then given to farmers.',
    outside:'The CIA ran Operation PBSuccess, authorised in August 1953 at about $3 million: airstrikes, propaganda and work on army officers. President Árbenz resigned on 27 June 1954. The US State Department records show it had pressed for compensation for United Fruit’s 234,000 acres.',
    home:'Árbenz drafted the reform with the Communist party, which fed the Cold War fear Washington used to justify the coup. When the crisis came, the army would not fight for him.',
    after:'The reform was reversed and military rule followed. A later truth commission blamed state forces for most of the violence in the long civil war that came after.',
    lesson:'Covert force, not economic failure, ended this reform.',
    src:[['US State Department, Foreign Relations of the US: Guatemala 1952 to 1954', 'https://history.state.gov/historicaldocuments/frus1952-54Guat/intro'],
         ['US State Department, PBSuccess document', 'https://history.state.gov/historicaldocuments/frus1950-55Intel/d154']] },
  { id:'iran', place:'Iran', years:'1951 to 1953', year:1951, lat:32.4, lon:53.7, kind:'pressure',
    tried:'Nationalised the Anglo-Iranian Oil Company in March 1951, so Iran’s oil money would stay in Iran.',
    outside:'Britain froze Iran’s sterling assets and blocked trade. In 1953 a coup removed Prime Minister Mosaddegh. In 2013 the CIA released documents confirming the coup was carried out under CIA direction.',
    home:'Mosaddegh took emergency powers in 1952 and dissolved parliament in 1953 after a disputed referendum, and his coalition was already splitting.',
    after:'The Shah ruled with US backing for 26 years, until the 1979 revolution.',
    lesson:'A boycott and a coup brought him down, but his own coalition was already fraying.',
    src:[['US State Department, Foreign Relations of the US: Iran 1951 to 1954', 'https://history.state.gov/historicaldocuments/frus1951-54Iran/preface'],
         ['National Security Archive, CIA admits role in 1953 coup', 'https://nsarchive2.gwu.edu/NSAEBB/NSAEBB435/']] },
  { id:'chile', place:'Chile', years:'1970 to 1973', year:1970, lat:-35.7, lon:-71.5, kind:'pressure',
    tried:'President Allende nationalised copper and took over large companies. The economy grew 7.7% in his first year.',
    outside:'CIA director Helms’s notes from a 1970 meeting with President Nixon read “make the economy scream”. The US Senate’s Church Committee found about $8 million of covert spending and that the US cut off aid and denied credit. It found no evidence of a direct US role in the 1973 coup.',
    home:'The budget deficit grew from about 2% of GDP to over 23%, and inflation passed 120% a year by early 1973. Those were Chile’s own numbers.',
    after:'A military coup in September 1973 brought 17 years of dictatorship under Pinochet.',
    lesson:'The outside pressure is documented, but so are the deficits and inflation at home.',
    src:[['National Security Archive, Helms notes and Chile documents', 'https://nsarchive2.gwu.edu/NSAEBB/NSAEBB8/nsaebb8i.htm'],
         ['Church Committee report, Covert Action in Chile', 'https://academic.brooklyn.cuny.edu/history/johnson/churchreport.htm'],
         ['Library of Congress country study, Chile', 'https://countrystudies.us/chile/60.htm']] },
  { id:'cuba', place:'Cuba', years:'1962 to now', year:1962, lat:21.5, lon:-79.0, kind:'pressure',
    tried:'Took over land and foreign-owned businesses after the 1959 revolution, with free health care and education for all.',
    outside:'A 1960 US State Department memo proposed weakening Cuba’s economy to bring “hunger, desperation and overthrow of government”. The full US embargo began in 1962. In October 2025 the UN General Assembly voted 165 to 7 to call for it to end.',
    home:'Cuba’s economy shrank by about a third when Soviet support ended in 1989 to 1993, and it shrank again in 2023 to 2025. Human Rights Watch reports hundreds of political prisoners and state control of all media.',
    after:'Cuba says the embargo costs it about $8 billion a year; that is the government’s own figure, not an independent one.',
    lesson:'The embargo and Cuba’s own one-party system have both hurt ordinary Cubans.',
    src:[['US State Department, Mallory memo (1960)', 'https://history.state.gov/historicaldocuments/frus1958-60v06/d499'],
         ['UN General Assembly vote, October 2025', 'https://press.un.org/en/2025/ga12723.doc.htm'],
         ['Human Rights Watch via ecoi.net, Cuba', 'https://www.ecoi.net/en/document/2136203.html']] },
  { id:'venezuela', place:'Venezuela', years:'2017 to 2026', year:2017, lat:7.0, lon:-66.0, kind:'pressure',
    tried:'Used oil money to fund social programmes, food subsidies and price controls.',
    outside:'US financial sanctions from August 2017, then sanctions on the state oil company from January 2019. A 2019 study by economists Weisbrot and Sachs estimated over 40,000 deaths from the 2017 sanctions; other economists at Brookings said its method could not prove that.',
    home:'The collapse started before the sanctions: oil prices fell by about 70% in 2014, oil output was already falling, and the US Congressional Research Service records widespread corruption and economic mismanagement. The economy shrank by over 80% from 2013 to 2020.',
    after:'In March 2026 the US eased its oil sanctions.',
    lesson:'The collapse began at home; the sanctions deepened it. The 40,000 deaths figure is disputed.',
    src:[['US Energy Information Administration, Venezuela oil output', 'https://www.eia.gov/todayinenergy/detail.php?id=39532'],
         ['Brookings, evidence on the 2017 sanctions', 'https://www.brookings.edu/articles/revisiting-the-evidence-impact-of-the-2017-sanctions-on-venezuela/'],
         ['Congressional Research Service, Venezuela', 'https://www.everycrsreport.com/reports/IF10230.html']] }
];

const WORKED = [
  { id:'nz', place:'New Zealand', years:'1938 to the 1970s', year:1938, lat:-41.3, lon:174.8, kind:'worked',
    text:'The Social Security Act 1938 brought free hospital care and a pension for everyone, paid for with high taxes at the top. It came with nearly 25 years of full employment. The good years ended with outside shocks: wool prices fell 40% in 1966 to 1967 and Britain joined the European market in 1973.',
    src:[['Te Ara, economic history of New Zealand', 'https://teara.govt.nz/en/economic-history/print']] },
  { id:'uk', place:'United Kingdom', years:'1948 to now', year:1948, lat:52.5, lon:-1.5, kind:'worked',
    text:'The NHS began on 5 July 1948, free for everyone, paid for through National Insurance, despite warnings of a “financial Dunkirk”. It is still running today.',
    src:[['UK Government History blog, the NHS at 75', 'https://history.blog.gov.uk/2023/07/13/the-founding-of-the-nhs-75-years-on/']] },
  { id:'nordics', place:'Nordic countries', years:'today', year:1990, lat:62.0, lon:15.0, kind:'worked',
    text:'Denmark, Norway, Sweden and Finland pair high taxes and universal services with open, competitive market economies, and are among the most equal rich countries. When Sweden hit a banking crisis in the early 1990s, it fixed its budget and pensions and carried on.',
    src:[['The Conversation, what the world can learn from the Nordic model', 'https://theconversation.com/what-the-world-can-learn-about-equality-from-the-nordic-model-99797']] }
];

const NYC = {
  id:'nyc', place:'New York City', years:'2026, now', year:2026, lat:40.7, lon:-74.0, kind:'now',
  intro:'Mayor Zohran Mamdani took office on 1 January 2026 promising a city working people can afford. Nine months in:',
  working:[
    ['Rent freeze', 'About 2.5 million tenants in rent-stabilised homes get no rent rise on one- or two-year leases from 1 October 2026.', ['NYC Rent Guidelines Board, 2026 to 2027', 'https://rentguidelinesboard.cityofnewyork.us/adopted-summary-of-guidelines-2026-27/']],
    ['Faster buses', 'Buses averaged 8.5 mph in August 2026, the fastest in four years.', ['Streetsblog NYC', 'https://nyc.streetsblog.org/2026/09/29/wheels-up-city-bus-speeds-hit-four-year-high-under-mayor-mamdani']],
    ['Free childcare for two-year-olds', 'Started in September 2026 for about 2,000 children, saving families over $20,000 each, aiming for 12,000 next year.', ['Chalkbeat New York', 'https://www.chalkbeat.org/newyork/2026/09/10/mamdani-2-k-program-launches-with-cost-savings-payment-delays/']],
    ['Safer streets', 'Murders and shootings to August 2026 were the lowest on record.', ['NYPD', 'https://www.nyc.gov/site/nypd/news/PR014/nypd-safest-summer-shooting-incidents-shooting-victims-murders-recorded']],
    ['Popular', '60% of New York City voters view him favourably (Quinnipiac, September 2026).', ['Quinnipiac poll', 'https://poll.qu.edu/poll-release?releaseid=3967']]
  ],
  early:[
    ['City-owned supermarkets', 'Five planned, one per borough, aiming to sell produce, meat and pantry staples 30% cheaper. The first opens at the end of 2027.', ['NYC Mayor’s Office', 'https://www.nyc.gov/mayors-office/news/2026/07/mayor-mamdani-unveils-30--discount---including-all-produce--all-']]
  ],
  blocked:[
    ['Free buses', 'The state runs the buses and sets fares, so the city cannot make them free on its own.', ['NY1', 'https://ny1.com/nyc/all-boroughs/traffic_and_transit/2026/05/11/meet-mamdani-senior-advisor-for-fast-and-free-buses']],
    ['Millionaire tax', 'The state budget did not raise income or company taxes. A tax on second homes worth $5 million or more passed, but its rollout is in court.', ['NYS Focus, state budget', 'https://nysfocus.com/2026/05/29/new-york-final-state-budget-2026-funding-guide-hochul']]
  ]
};

const LESSONS = [
  'Outside pressure was real and is on the record in every case, but in none was it the only cause.',
  'Fair-share policies lasted where budgets stayed sound, prices stayed steady and elections stayed free. They struggled where deficits, controls or rule by decree took over.',
  'Check who wrote every number. Some of the most quoted figures, on both sides, are claims rather than settled facts.'
];
