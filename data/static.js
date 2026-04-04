export const creditCards = [
  {
    id: 1, name: 'Al Rajhi Visa Signature', bank: 'Al Rajhi Bank',
    annualFee: 500, signupBonus: 50000, minSpend: 5000, minSpendPeriod: '3 months',
    pointsPerSar: 1.5, loungeAccess: true, companionPass: false,
    transferPartners: ['Skywards', 'Miles & Smiles', 'Avios'],
    bestFor: 'Lounge access + Turkish Airlines transfers',
  },
  {
    id: 2, name: 'SNB World Elite', bank: 'Saudi National Bank',
    annualFee: 750, signupBonus: 75000, minSpend: 8000, minSpendPeriod: '3 months',
    pointsPerSar: 2.0, loungeAccess: true, companionPass: true,
    transferPartners: ['Alfursan', 'Skywards', 'KrisFlyer'],
    bestFor: 'Companion pass + Saudi Airlines loyalty',
  },
  {
    id: 3, name: 'Riyad Bank Infinite', bank: 'Riyad Bank',
    annualFee: 300, signupBonus: 30000, minSpend: 3000, minSpendPeriod: '3 months',
    pointsPerSar: 1.0, loungeAccess: false, companionPass: false,
    transferPartners: ['Avios', 'Miles & Smiles'],
    bestFor: 'Low fee entry to Avios transfers',
  },
];

export const upgradeTemplates = [
  {
    id: 'anniversary', name: 'Anniversary Celebration', trigger: 'Special occasion travel',
    template: `Dear [Airline] Guest Relations Team,\n\nI am writing to inquire about a potential upgrade opportunity for my upcoming flight [Flight Number] on [Date] from [Origin] to [Destination].\n\nMy partner and I are celebrating our [Xth] wedding anniversary, and this trip holds special significance for us. We are loyal [Loyalty Program] members (Member #[Number]) and have been flying with [Airline] for [X] years.\n\nWe would be grateful for any consideration regarding an upgrade to [Business/First] class, as this would make our anniversary celebration truly memorable.\n\nThank you for your time and consideration.\n\nWarm regards,\n[Your Name]`,
  },
  {
    id: 'loyalty_match', name: 'Loyalty Status Match', trigger: 'Have status with another airline',
    template: `Dear [Airline] Loyalty Team,\n\nI am a [Status Level] member with [Competing Airline] (Member #[Number]) and am considering making [Airline] my primary carrier for routes from [Home Airport].\n\nI would like to request a status match or challenge to your loyalty program. In the past 12 months, I have flown [X] segments and spent approximately [Amount] on air travel.\n\nI am particularly interested in your [Target Status] tier and the benefits it offers for frequent travelers on the [Origin]-[Destination] corridor.\n\nI would appreciate the opportunity to prove my loyalty through a status match or challenge program.\n\nBest regards,\n[Your Name]`,
  },
  {
    id: 'price_drop', name: 'Price Drop Rebooking', trigger: 'Price dropped after booking',
    template: `Dear [Airline] Customer Service,\n\nI am writing regarding my existing booking [PNR/Confirmation Number] for flight [Flight Number] on [Date].\n\nI have noticed that the current fare for the same route and date has decreased to [New Price], which is [Amount] less than what I paid ([Original Price]).\n\nI kindly request one of the following:\n1. A fare adjustment to reflect the current price\n2. A travel credit for the difference\n3. A rebooking at the lower fare\n\nI understand policies vary, but as a loyal customer and [Loyalty Status] member, I hope you can accommodate this request.\n\nThank you for your assistance.\n\nSincerely,\n[Your Name]`,
  },
];

export const sweetSpots = [
  { program: 'Avios', route: 'RUH → LHR', milesRequired: 25000, cashValue: 1850, centsPerMile: 7.4, rating: 'Excellent' },
  { program: 'Miles & Smiles', route: 'JED → IST', milesRequired: 15000, cashValue: 980, centsPerMile: 6.5, rating: 'Great' },
  { program: 'Skywards', route: 'RUH → BKK', milesRequired: 35000, cashValue: 1650, centsPerMile: 4.7, rating: 'Good' },
  { program: 'KrisFlyer', route: 'JED → SIN', milesRequired: 40000, cashValue: 2200, centsPerMile: 5.5, rating: 'Great' },
  { program: 'Alfursan', route: 'RUH → CDG', milesRequired: 30000, cashValue: 2400, centsPerMile: 8.0, rating: 'Excellent' },
];

export const costComparisonData = [
  {
    route: 'RUH → LHR',
    direct: { baseFare: 1750, baggage: 0, seatSelection: 0, cardSurcharge: 0, total: 1750 },
    expedia: { baseFare: 1680, baggage: 150, seatSelection: 75, cardSurcharge: 50, total: 1955 },
    skyscanner: { baseFare: 1700, baggage: 150, seatSelection: 75, cardSurcharge: 35, total: 1960 },
  },
  {
    route: 'JED → IST',
    direct: { baseFare: 950, baggage: 0, seatSelection: 0, cardSurcharge: 0, total: 950 },
    expedia: { baseFare: 880, baggage: 100, seatSelection: 50, cardSurcharge: 30, total: 1060 },
    skyscanner: { baseFare: 890, baggage: 100, seatSelection: 50, cardSurcharge: 25, total: 1065 },
  },
  {
    route: 'RUH → BKK',
    direct: { baseFare: 1600, baggage: 0, seatSelection: 0, cardSurcharge: 0, total: 1600 },
    expedia: { baseFare: 1520, baggage: 200, seatSelection: 80, cardSurcharge: 45, total: 1845 },
    skyscanner: { baseFare: 1540, baggage: 200, seatSelection: 80, cardSurcharge: 40, total: 1860 },
  },
];

export const tripChecklist = [
  { id: 1, category: 'Pre-Search', items: [
    { id: 'vpn', label: 'Enable VPN (set to destination country)', checked: false },
    { id: 'incognito', label: 'Open Incognito/Private browsing window', checked: false },
    { id: 'cookies', label: 'Clear cookies from airline sites', checked: false },
    { id: 'extensions', label: 'Disable price-tracking browser extensions', checked: false },
  ]},
  { id: 2, category: 'Search Strategy', items: [
    { id: 'multi-city', label: 'Check multi-city routing options', checked: false },
    { id: 'positioning', label: 'Check positioning flights (RUH→Hub→Dest)', checked: false },
    { id: 'nearby', label: 'Check nearby airports for better deals', checked: false },
    { id: 'flexible', label: 'Use flexible date search (+/- 3 days)', checked: false },
  ]},
  { id: 3, category: 'Booking', items: [
    { id: 'compare', label: 'Compare OTA vs Direct airline pricing', checked: false },
    { id: 'points', label: 'Check points/miles redemption value', checked: false },
    { id: 'card', label: 'Use optimal credit card for this purchase', checked: false },
    { id: 'screenshot', label: 'Screenshot fare before booking', checked: false },
  ]},
  { id: 4, category: 'Post-Booking', items: [
    { id: 'tracker', label: 'Set up price tracker for booked route', checked: false },
    { id: 'seat', label: 'Select seat (check SeatGuru)', checked: false },
    { id: 'honey', label: 'Run Honey/Rakuten for cashback', checked: false },
    { id: 'calendar', label: 'Add flights to calendar', checked: false },
  ]},
];
