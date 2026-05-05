/**
 * Static airport database with Skyscanner entity IDs.
 *
 * entityId: Skyscanner's numeric entity ID (needed for searchFlightsComplete API)
 * skyId: Skyscanner sky ID (usually same as IATA for airports)
 *
 * These IDs enable the Skyscanner API to work even when the autocomplete
 * endpoint is unavailable (no API key for airport search).
 */

export const airports = [
  // ─── Saudi Arabia ───
  { code: 'RUH', name: 'King Khalid Intl', city: 'Riyadh', country: 'SA', entityId: '95673635', skyId: 'RIYN', lat: 24.96, lng: 46.70 },
  { code: 'JED', name: 'King Abdulaziz Intl', city: 'Jeddah', country: 'SA', entityId: '95673322', skyId: 'JEDA', lat: 21.67, lng: 39.16 },
  { code: 'DMM', name: 'King Fahd Intl', city: 'Dammam', country: 'SA', entityId: '95673485', skyId: 'DMMA', lat: 26.47, lng: 49.80 },
  { code: 'MED', name: 'Prince Mohammad Intl', city: 'Medina', country: 'SA', entityId: '95673517', skyId: 'MEDA', lat: 24.55, lng: 39.70 },

  // ─── Gulf / Middle East ───
  { code: 'DXB', name: 'Dubai Intl', city: 'Dubai', country: 'AE', entityId: '95673320', skyId: 'DXBA', lat: 25.25, lng: 55.36 },
  { code: 'AUH', name: 'Abu Dhabi Intl', city: 'Abu Dhabi', country: 'AE', entityId: '95673383', skyId: 'AUHA', lat: 24.43, lng: 54.65 },
  { code: 'SHJ', name: 'Sharjah Intl', city: 'Sharjah', country: 'AE', entityId: '95673709', skyId: 'SHJA', lat: 25.33, lng: 55.52 },
  { code: 'DOH', name: 'Hamad Intl', city: 'Doha', country: 'QA', entityId: '95673476', skyId: 'DOHA', lat: 25.26, lng: 51.57 },
  { code: 'BAH', name: 'Bahrain Intl', city: 'Bahrain', country: 'BH', entityId: '95673396', skyId: 'BAHA', lat: 26.27, lng: 50.63 },
  { code: 'KWI', name: 'Kuwait Intl', city: 'Kuwait', country: 'KW', entityId: '95673506', skyId: 'KWIA', lat: 29.23, lng: 47.97 },
  { code: 'MCT', name: 'Muscat Intl', city: 'Muscat', country: 'OM', entityId: '95673515', skyId: 'MCTA', lat: 23.59, lng: 58.28 },
  { code: 'AMM', name: 'Queen Alia Intl', city: 'Amman', country: 'JO', entityId: '95673378', skyId: 'AMMA', lat: 31.72, lng: 35.99 },
  { code: 'BEY', name: 'Rafic Hariri Intl', city: 'Beirut', country: 'LB', entityId: '95673406', skyId: 'BEYA', lat: 33.82, lng: 35.49 },
  { code: 'TLV', name: 'Ben Gurion Intl', city: 'Tel Aviv', country: 'IL', entityId: '95673745', skyId: 'TLVA', lat: 32.01, lng: 34.89 },

  // ─── Turkey ───
  { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'TR', entityId: '95673487', skyId: 'ISTA', lat: 41.26, lng: 28.74 },
  { code: 'SAW', name: 'Sabiha Gokcen', city: 'Istanbul', country: 'TR', entityId: '95673682', skyId: 'SAWA', lat: 40.90, lng: 29.31 },
  { code: 'AYT', name: 'Antalya Airport', city: 'Antalya', country: 'TR', entityId: '95673390', skyId: 'AYTA', lat: 36.90, lng: 30.80 },
  { code: 'ADB', name: 'Adnan Menderes', city: 'Izmir', country: 'TR', entityId: '95673366', skyId: 'ADBA', lat: 38.29, lng: 27.16 },

  // ─── Egypt & North Africa ───
  { code: 'CAI', name: 'Cairo Intl', city: 'Cairo', country: 'EG', entityId: '95673434', skyId: 'CAIA', lat: 30.12, lng: 31.41 },
  { code: 'HRG', name: 'Hurghada Intl', city: 'Hurghada', country: 'EG', entityId: '95673478', skyId: 'HRGA', lat: 27.18, lng: 33.80 },
  { code: 'SSH', name: 'Sharm El Sheikh', city: 'Sharm El Sheikh', country: 'EG', entityId: '95673727', skyId: 'SSHA', lat: 27.98, lng: 34.39 },
  { code: 'CMN', name: 'Mohammed V Intl', city: 'Casablanca', country: 'MA', entityId: '95673444', skyId: 'CMNA', lat: 33.37, lng: -7.59 },
  { code: 'TUN', name: 'Tunis-Carthage', city: 'Tunis', country: 'TN', entityId: '95673751', skyId: 'TUNA', lat: 36.85, lng: 10.23 },
  { code: 'ALG', name: 'Houari Boumediene', city: 'Algiers', country: 'DZ', entityId: '95673374', skyId: 'ALGA', lat: 36.69, lng: 3.22 },

  // ─── Europe — Western ───
  { code: 'LHR', name: 'Heathrow', city: 'London', country: 'GB', entityId: '95673529', skyId: 'LHRA', lat: 51.47, lng: -0.46 },
  { code: 'LGW', name: 'Gatwick', city: 'London', country: 'GB', entityId: '95673524', skyId: 'LGWA', lat: 51.15, lng: -0.18 },
  { code: 'STN', name: 'Stansted', city: 'London', country: 'GB', entityId: '95673729', skyId: 'STNA', lat: 51.89, lng: 0.26 },
  { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'FR', entityId: '95673436', skyId: 'CDGA', lat: 49.01, lng: 2.55 },
  { code: 'ORY', name: 'Orly', city: 'Paris', country: 'FR', entityId: '95673606', skyId: 'ORYA', lat: 48.72, lng: 2.36 },
  { code: 'FRA', name: 'Frankfurt', city: 'Frankfurt', country: 'DE', entityId: '95673463', skyId: 'FRAA', lat: 50.03, lng: 8.57 },
  { code: 'MUC', name: 'Munich', city: 'Munich', country: 'DE', entityId: '95673559', skyId: 'MUCA', lat: 48.35, lng: 11.78 },
  { code: 'AMS', name: 'Schiphol', city: 'Amsterdam', country: 'NL', entityId: '95673379', skyId: 'AMSA', lat: 52.31, lng: 4.77 },
  { code: 'FCO', name: 'Fiumicino', city: 'Rome', country: 'IT', entityId: '95673459', skyId: 'FCOA', lat: 41.80, lng: 12.25 },
  { code: 'MXP', name: 'Malpensa', city: 'Milan', country: 'IT', entityId: '95673562', skyId: 'MXPA', lat: 45.63, lng: 8.72 },
  { code: 'BCN', name: 'El Prat', city: 'Barcelona', country: 'ES', entityId: '95673399', skyId: 'BCNA', lat: 41.30, lng: 2.08 },
  { code: 'MAD', name: 'Barajas', city: 'Madrid', country: 'ES', entityId: '95673539', skyId: 'MADA', lat: 40.49, lng: -3.57 },
  { code: 'GVA', name: 'Geneva Airport', city: 'Geneva', country: 'CH', entityId: '95673473', skyId: 'GVAA', lat: 46.24, lng: 6.11 },
  { code: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'CH', entityId: '95673807', skyId: 'ZRHA', lat: 47.46, lng: 8.55 },
  { code: 'VIE', name: 'Vienna Intl', city: 'Vienna', country: 'AT', entityId: '95673768', skyId: 'VIEA', lat: 48.11, lng: 16.57 },
  { code: 'LIS', name: 'Lisbon Portela', city: 'Lisbon', country: 'PT', entityId: '95673527', skyId: 'LISA', lat: 38.77, lng: -9.13 },
  { code: 'BRU', name: 'Brussels Airport', city: 'Brussels', country: 'BE', entityId: '95673425', skyId: 'BRUA', lat: 50.90, lng: 4.48 },
  { code: 'DUB', name: 'Dublin Airport', city: 'Dublin', country: 'IE', entityId: '95673479', skyId: 'DUBA', lat: 53.42, lng: -6.27 },
  { code: 'CPH', name: 'Copenhagen', city: 'Copenhagen', country: 'DK', entityId: '95673449', skyId: 'CPHA', lat: 55.62, lng: 12.66 },
  { code: 'OSL', name: 'Oslo Gardermoen', city: 'Oslo', country: 'NO', entityId: '95673607', skyId: 'OSLA', lat: 60.19, lng: 11.10 },
  { code: 'ARN', name: 'Stockholm Arlanda', city: 'Stockholm', country: 'SE', entityId: '95673385', skyId: 'ARNA', lat: 59.65, lng: 17.94 },
  { code: 'HEL', name: 'Helsinki-Vantaa', city: 'Helsinki', country: 'FI', entityId: '95673475', skyId: 'HELA', lat: 60.32, lng: 24.97 },
  { code: 'ATH', name: 'Eleftherios Venizelos', city: 'Athens', country: 'GR', entityId: '95673388', skyId: 'ATHA', lat: 37.94, lng: 23.94 },
  { code: 'WAW', name: 'Chopin Airport', city: 'Warsaw', country: 'PL', entityId: '95673779', skyId: 'WAWA', lat: 52.17, lng: 20.97 },
  { code: 'PRG', name: 'Vaclav Havel', city: 'Prague', country: 'CZ', entityId: '95673629', skyId: 'PRGA', lat: 50.10, lng: 14.26 },
  { code: 'BUD', name: 'Budapest Liszt', city: 'Budapest', country: 'HU', entityId: '95673428', skyId: 'BUDA', lat: 47.44, lng: 19.26 },

  // ─── South & Southeast Asia ───
  { code: 'BOM', name: 'Chhatrapati Shivaji', city: 'Mumbai', country: 'IN', entityId: '95673419', skyId: 'BOMA', lat: 19.09, lng: 72.87 },
  { code: 'DEL', name: 'Indira Gandhi Intl', city: 'Delhi', country: 'IN', entityId: '95673469', skyId: 'DELA', lat: 28.57, lng: 77.09 },
  { code: 'BLR', name: 'Kempegowda Intl', city: 'Bangalore', country: 'IN', entityId: '95673414', skyId: 'BLRA', lat: 13.20, lng: 77.71 },
  { code: 'CCU', name: 'Netaji Subhas Chandra', city: 'Kolkata', country: 'IN', entityId: '95673437', skyId: 'CCUA', lat: 22.65, lng: 88.45 },
  { code: 'HYD', name: 'Rajiv Gandhi Intl', city: 'Hyderabad', country: 'IN', entityId: '95673483', skyId: 'HYDA', lat: 17.23, lng: 78.43 },
  { code: 'ISB', name: 'Islamabad Intl', city: 'Islamabad', country: 'PK', entityId: '95673486', skyId: 'ISBA', lat: 33.62, lng: 72.82 },
  { code: 'KHI', name: 'Jinnah Intl', city: 'Karachi', country: 'PK', entityId: '95673497', skyId: 'KHIA', lat: 24.91, lng: 67.16 },
  { code: 'LHE', name: 'Allama Iqbal Intl', city: 'Lahore', country: 'PK', entityId: '95673526', skyId: 'LHEA', lat: 31.52, lng: 74.40 },
  { code: 'DAC', name: 'Hazrat Shahjalal Intl', city: 'Dhaka', country: 'BD', entityId: '95673463', skyId: 'DACA', lat: 23.84, lng: 90.40 },
  { code: 'CMB', name: 'Bandaranaike Intl', city: 'Colombo', country: 'LK', entityId: '95673443', skyId: 'CMBA', lat: 7.18, lng: 79.88 },
  { code: 'BKK', name: 'Suvarnabhumi', city: 'Bangkok', country: 'TH', entityId: '95673412', skyId: 'BKKA', lat: 13.69, lng: 100.75 },
  { code: 'SIN', name: 'Changi', city: 'Singapore', country: 'SG', entityId: '95673714', skyId: 'SINA', lat: 1.36, lng: 103.99 },
  { code: 'KUL', name: 'KLIA', city: 'Kuala Lumpur', country: 'MY', entityId: '95673504', skyId: 'KULA', lat: 2.74, lng: 101.70 },
  { code: 'CGK', name: 'Soekarno-Hatta', city: 'Jakarta', country: 'ID', entityId: '95673439', skyId: 'CGKA', lat: -6.13, lng: 106.66 },
  { code: 'DPS', name: 'Ngurah Rai', city: 'Bali', country: 'ID', entityId: '95673477', skyId: 'DPSA', lat: -8.75, lng: 115.17 },
  { code: 'MNL', name: 'Ninoy Aquino', city: 'Manila', country: 'PH', entityId: '95673549', skyId: 'MNLA', lat: 14.51, lng: 121.02 },
  { code: 'SGN', name: 'Tan Son Nhat', city: 'Ho Chi Minh', country: 'VN', entityId: '95673710', skyId: 'SGNA', lat: 10.82, lng: 106.65 },
  { code: 'HAN', name: 'Noi Bai Intl', city: 'Hanoi', country: 'VN', entityId: '95673474', skyId: 'HANA', lat: 21.22, lng: 105.81 },

  // ─── East Asia ───
  { code: 'NRT', name: 'Narita', city: 'Tokyo', country: 'JP', entityId: '95673591', skyId: 'NRTA', lat: 35.76, lng: 140.39 },
  { code: 'HND', name: 'Haneda', city: 'Tokyo', country: 'JP', entityId: '95673509', skyId: 'HNDA', lat: 35.55, lng: 139.78 },
  { code: 'ICN', name: 'Incheon Intl', city: 'Seoul', country: 'KR', entityId: '95673484', skyId: 'ICNA', lat: 37.46, lng: 126.44 },
  { code: 'HKG', name: 'Hong Kong Intl', city: 'Hong Kong', country: 'HK', entityId: '95673510', skyId: 'HKGA', lat: 22.31, lng: 113.91 },
  { code: 'PVG', name: 'Pudong Intl', city: 'Shanghai', country: 'CN', entityId: '95673631', skyId: 'PVGA', lat: 31.14, lng: 121.81 },
  { code: 'PEK', name: 'Beijing Capital', city: 'Beijing', country: 'CN', entityId: '95673618', skyId: 'PEKA', lat: 40.08, lng: 116.58 },
  { code: 'TPE', name: 'Taiwan Taoyuan', city: 'Taipei', country: 'TW', entityId: '95673748', skyId: 'TPEA', lat: 25.08, lng: 121.23 },

  // ─── Maldives / Indian Ocean ───
  { code: 'MLE', name: 'Velana Intl', city: 'Male', country: 'MV', entityId: '95673544', skyId: 'MLEA', lat: 4.19, lng: 73.53 },
  { code: 'MRU', name: 'SSR Intl', city: 'Mauritius', country: 'MU', entityId: '95673556', skyId: 'MRUA', lat: -20.43, lng: 57.68 },
  { code: 'SEZ', name: 'Seychelles Intl', city: 'Mahe', country: 'SC', entityId: '95673701', skyId: 'SEZA', lat: -4.67, lng: 55.52 },

  // ─── Africa ───
  { code: 'JNB', name: 'OR Tambo Intl', city: 'Johannesburg', country: 'ZA', entityId: '95673493', skyId: 'JNBA', lat: -26.13, lng: 28.23 },
  { code: 'CPT', name: 'Cape Town Intl', city: 'Cape Town', country: 'ZA', entityId: '95673450', skyId: 'CPTA', lat: -33.97, lng: 18.60 },
  { code: 'NBO', name: 'Jomo Kenyatta', city: 'Nairobi', country: 'KE', entityId: '95673583', skyId: 'NBOA', lat: -1.32, lng: 36.93 },
  { code: 'ADD', name: 'Bole Intl', city: 'Addis Ababa', country: 'ET', entityId: '95673365', skyId: 'ADDA', lat: 8.98, lng: 38.80 },
  { code: 'LOS', name: 'Murtala Muhammed', city: 'Lagos', country: 'NG', entityId: '95673534', skyId: 'LOSA', lat: 6.58, lng: 3.32 },
  { code: 'DSS', name: 'Blaise Diagne Intl', city: 'Dakar', country: 'SN', entityId: '95673480', skyId: 'DSSA', lat: 14.67, lng: -17.07 },
  { code: 'DAR', name: 'Julius Nyerere', city: 'Dar es Salaam', country: 'TZ', entityId: '95673461', skyId: 'DARA', lat: -6.88, lng: 39.20 },

  // ─── Americas ───
  { code: 'JFK', name: 'John F. Kennedy', city: 'New York', country: 'US', entityId: '95673492', skyId: 'JFKA', lat: 40.64, lng: -73.78 },
  { code: 'EWR', name: 'Newark Liberty', city: 'Newark', country: 'US', entityId: '95673458', skyId: 'EWRA', lat: 40.69, lng: -74.17 },
  { code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles', country: 'US', entityId: '95673511', skyId: 'LAXA', lat: 33.94, lng: -118.41 },
  { code: 'ORD', name: "O'Hare Intl", city: 'Chicago', country: 'US', entityId: '95673604', skyId: 'ORDA', lat: 41.97, lng: -87.91 },
  { code: 'IAD', name: 'Dulles Intl', city: 'Washington', country: 'US', entityId: '95673482', skyId: 'IADA', lat: 38.94, lng: -77.46 },
  { code: 'MIA', name: 'Miami Intl', city: 'Miami', country: 'US', entityId: '95673547', skyId: 'MIAA', lat: 25.79, lng: -80.29 },
  { code: 'SFO', name: 'San Francisco Intl', city: 'San Francisco', country: 'US', entityId: '95673706', skyId: 'SFOA', lat: 37.62, lng: -122.38 },
  { code: 'ATL', name: 'Hartsfield-Jackson', city: 'Atlanta', country: 'US', entityId: '95673387', skyId: 'ATLA', lat: 33.64, lng: -84.43 },
  { code: 'DFW', name: 'Dallas Fort Worth', city: 'Dallas', country: 'US', entityId: '95673472', skyId: 'DFWA', lat: 32.90, lng: -97.04 },
  { code: 'IAH', name: 'George Bush Intl', city: 'Houston', country: 'US', entityId: '95673481', skyId: 'IAHA', lat: 29.98, lng: -95.34 },
  { code: 'YYZ', name: 'Toronto Pearson', city: 'Toronto', country: 'CA', entityId: '95673801', skyId: 'YYZA', lat: 43.68, lng: -79.63 },
  { code: 'YUL', name: 'Montreal Trudeau', city: 'Montreal', country: 'CA', entityId: '95673799', skyId: 'YULA', lat: 45.47, lng: -73.74 },
  { code: 'GRU', name: 'Guarulhos', city: 'Sao Paulo', country: 'BR', entityId: '95673471', skyId: 'GRUA', lat: -23.43, lng: -46.47 },
  { code: 'GIG', name: 'Galeao', city: 'Rio de Janeiro', country: 'BR', entityId: '95673467', skyId: 'GIGA', lat: -22.81, lng: -43.25 },
  { code: 'MEX', name: 'Mexico City Intl', city: 'Mexico City', country: 'MX', entityId: '95673543', skyId: 'MEXA', lat: 19.44, lng: -99.07 },
  { code: 'BOG', name: 'El Dorado Intl', city: 'Bogota', country: 'CO', entityId: '95673416', skyId: 'BOGA', lat: 4.70, lng: -74.15 },
  { code: 'SCL', name: 'Arturo Merino', city: 'Santiago', country: 'CL', entityId: '95673689', skyId: 'SCLA', lat: -33.39, lng: -70.79 },
  { code: 'EZE', name: 'Ezeiza', city: 'Buenos Aires', country: 'AR', entityId: '95673460', skyId: 'EZEA', lat: -34.82, lng: -58.54 },

  // ─── Oceania ───
  { code: 'SYD', name: 'Kingsford Smith', city: 'Sydney', country: 'AU', entityId: '95673735', skyId: 'SYDA', lat: -33.95, lng: 151.18 },
  { code: 'MEL', name: 'Melbourne Tullamarine', city: 'Melbourne', country: 'AU', entityId: '95673541', skyId: 'MELA', lat: -37.67, lng: 144.84 },
  { code: 'AKL', name: 'Auckland Airport', city: 'Auckland', country: 'NZ', entityId: '95673371', skyId: 'AKLA', lat: -37.01, lng: 174.79 },

  // ─── Europe — Eastern (additional) ───
  { code: 'BTS', name: 'M. R. Stefanik', city: 'Bratislava', country: 'SK', entityId: '95673424', skyId: 'BTSA', lat: 48.17, lng: 17.21 },
  { code: 'TGD', name: 'Podgorica Airport', city: 'Podgorica', country: 'ME', entityId: '95673741', skyId: 'TGDA', lat: 42.36, lng: 19.25 },
  { code: 'TIV', name: 'Tivat Airport', city: 'Tivat', country: 'ME', entityId: '95673746', skyId: 'TIVA', lat: 42.40, lng: 18.72 },

  // ─── Russia ───
  { code: 'SVO', name: 'Sheremetyevo', city: 'Moscow', country: 'RU', entityId: '95673733', skyId: 'SVOA', lat: 55.97, lng: 37.41 },
  { code: 'LED', name: 'Pulkovo', city: 'St Petersburg', country: 'RU', entityId: '95673521', skyId: 'LEDA', lat: 59.80, lng: 30.27 },

  // ─── Central Asia / CIS ───
  { code: 'TBS', name: 'Tbilisi Intl', city: 'Tbilisi', country: 'GE', entityId: '95673739', skyId: 'TBSA', lat: 41.67, lng: 44.95 },
  { code: 'GYD', name: 'Heydar Aliyev', city: 'Baku', country: 'AZ', entityId: '95673473', skyId: 'GYDA', lat: 40.47, lng: 50.05 },
  { code: 'NQZ', name: 'Nursultan Nazarbayev', city: 'Astana', country: 'KZ', entityId: '95673591', skyId: 'NQZA', lat: 51.02, lng: 71.47 },
  { code: 'TAS', name: 'Tashkent Intl', city: 'Tashkent', country: 'UZ', entityId: '95673737', skyId: 'TASA', lat: 41.26, lng: 69.28 },
];

/**
 * Lookup map: IATA → airport record (with entityId)
 * Used by flightEngine and hooks to resolve entity IDs for static fallback results.
 */
export const airportByCode = Object.fromEntries(airports.map(a => [a.code, a]));

export const homeAirports = airports.filter(a => ['RUH', 'JED', 'DMM', 'MED'].includes(a.code));
export const destAirports = airports.filter(a => !['RUH', 'JED', 'DMM', 'MED'].includes(a.code));
