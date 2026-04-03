export const liveDeals = [
  {
    id: 1, origin: 'RUH', destination: 'LHR', airline: 'Saudi Airlines',
    price: 1850, originalPrice: 3200, currency: 'SAR',
    departure: '2026-04-15T08:30', arrival: '2026-04-15T13:15',
    duration: 405, stops: 0, cabin: 'Economy', comfort: 7,
    loyaltyPoints: 2500, valueScore: 8.2, type: 'error_fare',
    expiresIn: '2h 15m',
  },
  {
    id: 2, origin: 'JED', destination: 'IST', airline: 'Turkish Airlines',
    price: 980, originalPrice: 1600, currency: 'SAR',
    departure: '2026-04-18T14:00', arrival: '2026-04-18T18:30',
    duration: 270, stops: 0, cabin: 'Economy', comfort: 8,
    loyaltyPoints: 3200, valueScore: 12.1, type: 'price_drop',
    expiresIn: '5h 30m',
  },
  {
    id: 3, origin: 'RUH', destination: 'MLE', airline: 'Flynas',
    price: 2100, originalPrice: 2800, currency: 'SAR',
    departure: '2026-05-01T22:00', arrival: '2026-05-02T06:45',
    duration: 525, stops: 1, cabin: 'Economy', comfort: 6,
    loyaltyPoints: 1800, valueScore: 5.4, type: 'deal',
    expiresIn: '1d 4h',
  },
  {
    id: 4, origin: 'RUH', destination: 'BKK', airline: 'Gulf Air',
    price: 1650, originalPrice: 2900, currency: 'SAR',
    departure: '2026-04-22T01:15', arrival: '2026-04-22T14:30',
    duration: 555, stops: 1, cabin: 'Economy', comfort: 7,
    loyaltyPoints: 2100, valueScore: 7.8, type: 'price_drop',
    expiresIn: '8h',
  },
  {
    id: 5, origin: 'JED', destination: 'CDG', airline: 'Air France',
    price: 2400, originalPrice: 4100, currency: 'SAR',
    departure: '2026-04-25T09:00', arrival: '2026-04-25T14:20',
    duration: 380, stops: 0, cabin: 'Business', comfort: 9,
    loyaltyPoints: 5500, valueScore: 15.3, type: 'error_fare',
    expiresIn: '45m',
  },
  {
    id: 6, origin: 'RUH', destination: 'KUL', airline: 'Malaysia Airlines',
    price: 1400, originalPrice: 2200, currency: 'SAR',
    departure: '2026-05-10T03:00', arrival: '2026-05-10T17:45',
    duration: 585, stops: 1, cabin: 'Economy', comfort: 7,
    loyaltyPoints: 2800, valueScore: 6.9, type: 'deal',
    expiresIn: '2d',
  },
];

export const priceHistory = [
  { date: 'Mar 1', ruhLhr: 3200, ruhIst: 1500, ruhBkk: 2800 },
  { date: 'Mar 5', ruhLhr: 3100, ruhIst: 1450, ruhBkk: 2750 },
  { date: 'Mar 10', ruhLhr: 2900, ruhIst: 1400, ruhBkk: 2600 },
  { date: 'Mar 15', ruhLhr: 2800, ruhIst: 1350, ruhBkk: 2500 },
  { date: 'Mar 20', ruhLhr: 2500, ruhIst: 1200, ruhBkk: 2400 },
  { date: 'Mar 25', ruhLhr: 2200, ruhIst: 1100, ruhBkk: 2200 },
  { date: 'Mar 30', ruhLhr: 1950, ruhIst: 980, ruhBkk: 1900 },
  { date: 'Apr 1', ruhLhr: 1850, ruhIst: 950, ruhBkk: 1650 },
];

export const trackedFlights = [
  { id: 1, route: 'RUH → LHR', targetPrice: 1500, currentPrice: 1850, trend: 'down', change: -8.2 },
  { id: 2, route: 'JED → IST', targetPrice: 800, currentPrice: 980, trend: 'down', change: -12.5 },
  { id: 3, route: 'RUH → BKK', targetPrice: 1200, currentPrice: 1650, trend: 'down', change: -5.1 },
  { id: 4, route: 'RUH → CDG', targetPrice: 2000, currentPrice: 2400, trend: 'up', change: 3.2 },
];

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
    id: 'anniversary',
    name: 'Anniversary Celebration',
    trigger: 'Special occasion travel',
    template: `Dear [Airline] Guest Relations Team,

I am writing to inquire about a potential upgrade opportunity for my upcoming flight [Flight Number] on [Date] from [Origin] to [Destination].

My partner and I are celebrating our [Xth] wedding anniversary, and this trip holds special significance for us. We are loyal [Loyalty Program] members (Member #[Number]) and have been flying with [Airline] for [X] years.

We would be grateful for any consideration regarding an upgrade to [Business/First] class, as this would make our anniversary celebration truly memorable.

Thank you for your time and consideration.

Warm regards,
[Your Name]`,
  },
  {
    id: 'loyalty_match',
    name: 'Loyalty Status Match',
    trigger: 'Have status with another airline',
    template: `Dear [Airline] Loyalty Team,

I am a [Status Level] member with [Competing Airline] (Member #[Number]) and am considering making [Airline] my primary carrier for routes from [Home Airport].

I would like to request a status match or challenge to your loyalty program. In the past 12 months, I have flown [X] segments and spent approximately [Amount] on air travel.

I am particularly interested in your [Target Status] tier and the benefits it offers for frequent travelers on the [Origin]-[Destination] corridor.

I would appreciate the opportunity to prove my loyalty through a status match or challenge program.

Best regards,
[Your Name]`,
  },
  {
    id: 'price_drop',
    name: 'Price Drop Rebooking',
    trigger: 'Price dropped after booking',
    template: `Dear [Airline] Customer Service,

I am writing regarding my existing booking [PNR/Confirmation Number] for flight [Flight Number] on [Date].

I have noticed that the current fare for the same route and date has decreased to [New Price], which is [Amount] less than what I paid ([Original Price]).

I kindly request one of the following:
1. A fare adjustment to reflect the current price
2. A travel credit for the difference
3. A rebooking at the lower fare

I understand policies vary, but as a loyal customer and [Loyalty Status] member, I hope you can accommodate this request.

Thank you for your assistance.

Sincerely,
[Your Name]`,
  },
];

export const airports = [
  { code: 'RUH', name: 'King Khalid Intl', city: 'Riyadh', lat: 24.96, lng: 46.70 },
  { code: 'JED', name: 'King Abdulaziz Intl', city: 'Jeddah', lat: 21.67, lng: 39.16 },
  { code: 'LHR', name: 'Heathrow', city: 'London', lat: 51.47, lng: -0.46 },
  { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', lat: 41.26, lng: 28.74 },
  { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', lat: 49.01, lng: 2.55 },
  { code: 'BKK', name: 'Suvarnabhumi', city: 'Bangkok', lat: 13.69, lng: 100.75 },
  { code: 'MLE', name: 'Velana Intl', city: 'Male', lat: 4.19, lng: 73.53 },
  { code: 'KUL', name: 'KLIA', city: 'Kuala Lumpur', lat: 2.74, lng: 101.70 },
  { code: 'DXB', name: 'Dubai Intl', city: 'Dubai', lat: 25.25, lng: 55.36 },
  { code: 'SIN', name: 'Changi', city: 'Singapore', lat: 1.36, lng: 103.99 },
  { code: 'MNL', name: 'Ninoy Aquino', city: 'Manila', lat: 14.51, lng: 121.02 },
  { code: 'CAI', name: 'Cairo Intl', city: 'Cairo', lat: 30.12, lng: 31.41 },
  { code: 'GVA', name: 'Geneva Airport', city: 'Geneva', lat: 46.24, lng: 6.11 },
  { code: 'FCO', name: 'Fiumicino', city: 'Rome', lat: 41.80, lng: 12.25 },
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

export const costComparisonData = {
  routes: [
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
  ],
};

export const sweetSpots = [
  { program: 'Avios', route: 'RUH → LHR', milesRequired: 25000, cashValue: 1850, centsPerMile: 7.4, rating: 'Excellent' },
  { program: 'Miles & Smiles', route: 'JED → IST', milesRequired: 15000, cashValue: 980, centsPerMile: 6.5, rating: 'Great' },
  { program: 'Skywards', route: 'RUH → BKK', milesRequired: 35000, cashValue: 1650, centsPerMile: 4.7, rating: 'Good' },
  { program: 'KrisFlyer', route: 'JED → SIN', milesRequired: 40000, cashValue: 2200, centsPerMile: 5.5, rating: 'Great' },
  { program: 'Alfursan', route: 'RUH → CDG', milesRequired: 30000, cashValue: 2400, centsPerMile: 8.0, rating: 'Excellent' },
];
