export const airports = [
  { code: 'RUH', name: 'King Khalid Intl', city: 'Riyadh', country: 'SA', lat: 24.96, lng: 46.70 },
  { code: 'JED', name: 'King Abdulaziz Intl', city: 'Jeddah', country: 'SA', lat: 21.67, lng: 39.16 },
  { code: 'LHR', name: 'Heathrow', city: 'London', country: 'GB', lat: 51.47, lng: -0.46 },
  { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'TR', lat: 41.26, lng: 28.74 },
  { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'FR', lat: 49.01, lng: 2.55 },
  { code: 'BKK', name: 'Suvarnabhumi', city: 'Bangkok', country: 'TH', lat: 13.69, lng: 100.75 },
  { code: 'MLE', name: 'Velana Intl', city: 'Male', country: 'MV', lat: 4.19, lng: 73.53 },
  { code: 'KUL', name: 'KLIA', city: 'Kuala Lumpur', country: 'MY', lat: 2.74, lng: 101.70 },
  { code: 'DXB', name: 'Dubai Intl', city: 'Dubai', country: 'AE', lat: 25.25, lng: 55.36 },
  { code: 'SIN', name: 'Changi', city: 'Singapore', country: 'SG', lat: 1.36, lng: 103.99 },
  { code: 'MNL', name: 'Ninoy Aquino', city: 'Manila', country: 'PH', lat: 14.51, lng: 121.02 },
  { code: 'CAI', name: 'Cairo Intl', city: 'Cairo', country: 'EG', lat: 30.12, lng: 31.41 },
  { code: 'GVA', name: 'Geneva Airport', city: 'Geneva', country: 'CH', lat: 46.24, lng: 6.11 },
  { code: 'FCO', name: 'Fiumicino', city: 'Rome', country: 'IT', lat: 41.80, lng: 12.25 },
  { code: 'FRA', name: 'Frankfurt', city: 'Frankfurt', country: 'DE', lat: 50.03, lng: 8.57 },
  { code: 'AMS', name: 'Schiphol', city: 'Amsterdam', country: 'NL', lat: 52.31, lng: 4.77 },
  { code: 'BCN', name: 'El Prat', city: 'Barcelona', country: 'ES', lat: 41.30, lng: 2.08 },
  { code: 'NRT', name: 'Narita', city: 'Tokyo', country: 'JP', lat: 35.76, lng: 140.39 },
  { code: 'JFK', name: 'John F. Kennedy', city: 'New York', country: 'US', lat: 40.64, lng: -73.78 },
  { code: 'BOM', name: 'Chhatrapati Shivaji', city: 'Mumbai', country: 'IN', lat: 19.09, lng: 72.87 },
];

export const homeAirports = airports.filter(a => ['RUH', 'JED'].includes(a.code));
export const destAirports = airports.filter(a => !['RUH', 'JED'].includes(a.code));
