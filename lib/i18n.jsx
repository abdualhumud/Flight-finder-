'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const translations = {
  en: {
    // Navigation
    'nav.missionControl': 'Mission Control',
    'nav.missionControl.sub': 'Live Deals',
    'nav.hackerLab': 'Hacker Lab',
    'nav.hackerLab.sub': 'Smart Search',
    'nav.geoPricing': 'Geo-Pricing',
    'nav.geoPricing.sub': 'Arbitrage',
    'nav.priceWatchdog': 'Price Watchdog',
    'nav.priceWatchdog.sub': 'Tracker',
    'nav.upgradeSuite': 'Upgrade Suite',
    'nav.upgradeSuite.sub': 'Negotiate',
    'nav.walletStrategy': 'Wallet Strategy',
    'nav.walletStrategy.sub': 'Points & Cards',
    'nav.trueCost': 'True Cost',
    'nav.trueCost.sub': 'Calculator',
    'nav.hackerTools': 'Hacker Tools',
    'nav.hackerTools.sub': 'Sweet Spots',
    'nav.brand': 'Flight Finder',
    'nav.subtitle': 'Arbitrage Engine',

    // Status bar
    'status.online': 'ENGINE ONLINE',
    'status.multiSource': 'Multi-Source',
    'status.vpn': 'VPN Ready',
    'status.incognito': 'Incognito Mode',
    'status.sources': 'Amadeus + Skyscanner',

    // Search
    'search.origin': 'Origin',
    'search.destination': 'Destination',
    'search.departure': 'Departure Date',
    'search.return': 'Return Date',
    'search.cabin': 'Cabin',
    'search.passengers': 'Passengers',
    'search.tripType': 'Trip Type',
    'search.oneWay': 'One Way',
    'search.roundTrip': 'Round Trip',
    'search.economy': 'Economy',
    'search.business': 'Business',
    'search.first': 'First',
    'search.searchFlights': 'Search Flights',
    'search.searching': 'Searching...',
    'search.selectDest': 'Select destination',
    'search.anyDest': 'Any destination',
    'search.results': 'results',
    'search.loadMore': 'Load More Results',
    'search.loadingMore': 'Loading more flights...',
    'search.noResults': 'No flights found. Try a different search.',
    'search.valueFormula': 'Value Score = (Comfort + Loyalty) / (Price × Duration) — higher is better',
    'search.flexibleDates': 'Flexible Dates (±3 days)',
    'search.cheapest': 'CHEAPEST',
    'search.positioningTitle': 'Positioning Flight Suggestions',
    'search.positioningDesc': 'Flying to a hub first could save you money on your final destination',
    'search.alsoSearchOn': 'Also search on:',
    'search.typeToSearch': 'Type to search airports...',
    'search.flexibility': 'Flexibility',
    'search.exact': 'Exact',
    'search.pm3Days': '±3 Days',
    'search.wholeMonth': 'Month',
    'search.anytime': 'Anytime',
    'search.monthView': 'Month Calendar — cheapest days',
    'search.cheapestInYear': 'Cheapest Month to Fly',
    'search.clickMarket': 'Click a market for proxy setup',

    // Sort
    'sort.bestValue': 'Best Value',
    'sort.cheapest': 'Cheapest',
    'sort.fastest': 'Fastest',
    'sort.biggestSavings': 'Biggest Savings',
    'sort.valueScore': 'Value Score',

    // Filter
    'filter.all': 'All Deals',
    'filter.errorFare': 'Error Fares',
    'filter.priceDrop': 'Price Drops',
    'filter.deal': 'Deals',

    // Mission Control
    'mc.title': 'Mission Control',
    'mc.subtitle': 'Real-time flight deal intelligence',
    'mc.routesMonitored': 'routes monitored',
    'mc.refresh': 'Refresh',
    'mc.liveRefresh': 'Live — 60s refresh',
    'mc.activeDeals': 'Active Deals',
    'mc.errorFares': 'Error Fares',
    'mc.priceDrops': 'Price Drops',
    'mc.avgSavings': 'Avg Savings',

    // Flight table
    'flight.best': 'Best',
    'flight.fast': 'Fast',
    'flight.errorFare': 'ERROR FARE',
    'flight.priceDrop': 'PRICE DROP',
    'flight.deal': 'DEAL',
    'flight.direct': 'Direct',
    'flight.stop': 'stop',
    'flight.stops': 'stops',
    'flight.left': 'left',
    'flight.bookOn': 'Book on:',
    'flight.expires': 'Expires:',
    'flight.vs': 'VS',
    'flight.source': 'Source:',
    'flight.live': 'LIVE',
    'flight.simulated': 'SIM',
    'flight.seats': 'seats',

    // Geo-Pricing
    'geo.title': 'Geo-Pricing Arbitrage',
    'geo.subtitle': 'Compare prices across regional markets — find the cheapest point-of-sale',
    'geo.howTitle': 'How Regional Price Arbitrage Works',
    'geo.howDesc': 'Airlines price flights differently based on the buyer\'s country/currency. By setting your VPN to a "Low-Cost POS" country and searching in their local currency, you can find fares 15-35% cheaper than your home market.',
    'geo.runScan': 'Run Geo-Scan',
    'geo.scanning': 'Scanning 8 regional markets simultaneously...',
    'geo.cheapestFound': 'Cheapest Market Found',
    'geo.saveUpTo': 'Save up to',
    'geo.vsOther': 'vs other markets',
    'geo.setVpn': 'Set VPN to',
    'geo.marketComparison': 'Market Comparison',
    'geo.market': 'Market',
    'geo.currency': 'Currency',
    'geo.cheapestPrice': 'Cheapest Price',
    'geo.savings': 'Savings',
    'geo.vpnLocation': 'VPN Location',
    'geo.action': 'Action',
    'geo.homeMarket': 'Home market',
    'geo.base': 'Base',
    'geo.best': 'BEST',
    'geo.vpnGuide': 'VPN Setup Guide',
    'geo.step1Title': '1. Connect VPN',
    'geo.step1Desc': 'Set your VPN server to the recommended country shown above',
    'geo.step2Title': '2. Incognito Mode',
    'geo.step2Desc': 'Open a new incognito/private window and clear cookies first',
    'geo.step3Title': '3. Search & Book',
    'geo.step3Desc': 'Search on the airline\'s local site for that country to get regional pricing',
    'geo.proxyTitle': 'Geo-Proxy Navigator',
    'geo.proxyDesc': 'Generate POS-specific URLs with proxy/VPN configuration for regional pricing',
    'geo.targetMarket': 'Target Market',
    'geo.platform': 'Platform',
    'geo.generatedUrl': 'POS-Specific URL',
    'geo.proxyWorkflow': 'Copy & Open Incognito Workflow',
    'geo.proxyStep1': 'Connect VPN/Proxy to target country',
    'geo.proxyStep2': 'Open incognito window',
    'geo.proxyStep3': 'Paste URL and search for regional price',
    'geo.proxyConfig': 'Advanced: Proxy Server Configuration',

    // Tracker
    'tracker.title': 'Price Watchdog',
    'tracker.subtitle': 'Automated price tracking with smart alerts',
    'tracker.alertCenter': 'Alert Center',
    'tracker.priceHistory': 'Price History (30 Days)',
    'tracker.trackedRoutes': 'Tracked Routes',
    'tracker.target': 'Target:',
    'tracker.route': 'Route (e.g. RUH → SIN)',
    'tracker.targetPrice': 'Target price',
    'tracker.track': 'Track',

    // Upgrade
    'upgrade.title': 'Upgrade Suite',
    'upgrade.subtitle': 'Smart negotiation templates for upgrades and rebooking',
    'upgrade.flightDetails': 'Your Flight Details (auto-fills templates)',
    'upgrade.copyToClipboard': 'Copy to Clipboard',
    'upgrade.copied': 'Copied!',

    // Wallet
    'wallet.title': 'Wallet Strategy',
    'wallet.subtitle': 'Credit card comparison with points optimizer',
    'wallet.card': 'Card',
    'wallet.annualFee': 'Annual Fee',
    'wallet.signupBonus': 'Sign-up Bonus',
    'wallet.minSpend': 'Min Spend',
    'wallet.pointsPerSar': 'Points/SAR',
    'wallet.lounge': 'Lounge',
    'wallet.companion': 'Companion',
    'wallet.spendProgress': 'Minimum Spend Progress',
    'wallet.transferPartners': 'Transfer Partners',
    'wallet.recommended': 'Recommended',

    // Calculator
    'calc.title': 'True Cost Calculator',
    'calc.subtitle': 'OTA vs Direct booking with all hidden fees exposed',
    'calc.warning': 'The "cheap" OTA fare isn\'t always cheaper',
    'calc.warningDesc': 'After baggage, seat selection, and card surcharges, the "Final Landing Price" often favors direct booking.',
    'calc.feeBreakdown': 'Fee Breakdown',
    'calc.directAirline': 'Direct Airline',
    'calc.baseFare': 'Base Fare',
    'calc.baggage': 'Baggage (23kg)',
    'calc.seatSelection': 'Seat Selection',
    'calc.cardSurcharge': 'Card Surcharge',
    'calc.finalPrice': 'FINAL LANDING PRICE',
    'calc.best': 'Best:',

    // Tools
    'tools.title': 'Hacker Tools',
    'tools.subtitle': 'Mileage sweet spots, trip checklist, and cheap zone map',
    'tools.sweetSpots': 'Mileage Redemption Sweet Spots',
    'tools.cheapZones': 'Cheap Zones from Home Base',
    'tools.tripChecklist': 'Trip Checklist 2.0',
    'tools.complete': 'complete',
    'tools.reset': 'Reset',

    // General
    'general.language': 'Language',
    'general.english': 'English',
    'general.arabic': 'العربية',
  },
  ar: {
    // Navigation
    'nav.missionControl': 'مركز القيادة',
    'nav.missionControl.sub': 'عروض حية',
    'nav.hackerLab': 'مختبر البحث',
    'nav.hackerLab.sub': 'بحث ذكي',
    'nav.geoPricing': 'تسعير جغرافي',
    'nav.geoPricing.sub': 'المراجحة',
    'nav.priceWatchdog': 'مراقب الأسعار',
    'nav.priceWatchdog.sub': 'تتبع',
    'nav.upgradeSuite': 'جناح الترقية',
    'nav.upgradeSuite.sub': 'تفاوض',
    'nav.walletStrategy': 'استراتيجية المحفظة',
    'nav.walletStrategy.sub': 'نقاط وبطاقات',
    'nav.trueCost': 'التكلفة الحقيقية',
    'nav.trueCost.sub': 'حاسبة',
    'nav.hackerTools': 'أدوات ذكية',
    'nav.hackerTools.sub': 'فرص ذهبية',
    'nav.brand': 'فلايت فايندر',
    'nav.subtitle': 'محرك المراجحة',

    // Status bar
    'status.online': 'النظام يعمل',
    'status.multiSource': 'مصادر متعددة',
    'status.vpn': 'VPN جاهز',
    'status.incognito': 'وضع التخفي',
    'status.sources': 'أماديوس + سكاي سكانر',

    // Search
    'search.origin': 'المغادرة من',
    'search.destination': 'الوجهة',
    'search.departure': 'تاريخ المغادرة',
    'search.return': 'تاريخ العودة',
    'search.cabin': 'الدرجة',
    'search.passengers': 'المسافرون',
    'search.tripType': 'نوع الرحلة',
    'search.oneWay': 'ذهاب فقط',
    'search.roundTrip': 'ذهاب وعودة',
    'search.economy': 'اقتصادية',
    'search.business': 'أعمال',
    'search.first': 'أولى',
    'search.searchFlights': 'بحث عن رحلات',
    'search.searching': 'جاري البحث...',
    'search.selectDest': 'اختر الوجهة',
    'search.anyDest': 'أي وجهة',
    'search.results': 'نتائج',
    'search.loadMore': 'تحميل المزيد',
    'search.loadingMore': 'جاري تحميل المزيد...',
    'search.noResults': 'لم يتم العثور على رحلات. جرّب بحثًا مختلفًا.',
    'search.valueFormula': 'نقاط القيمة = (الراحة + الولاء) / (السعر × المدة) — كلما زاد كان أفضل',
    'search.flexibleDates': 'تواريخ مرنة (±3 أيام)',
    'search.cheapest': 'الأرخص',
    'search.positioningTitle': 'اقتراحات رحلات التموضع',
    'search.positioningDesc': 'السفر إلى مركز أولاً قد يوفر لك المال على وجهتك النهائية',
    'search.alsoSearchOn': 'ابحث أيضًا على:',
    'search.typeToSearch': 'اكتب للبحث عن المطارات...',
    'search.flexibility': 'المرونة',
    'search.exact': 'محدد',
    'search.pm3Days': '±3 أيام',
    'search.wholeMonth': 'الشهر',
    'search.anytime': 'أي وقت',
    'search.monthView': 'تقويم الشهر — أرخص الأيام',
    'search.cheapestInYear': 'أرخص شهر للسفر',
    'search.clickMarket': 'انقر على سوق لإعداد البروكسي',

    // Sort
    'sort.bestValue': 'أفضل قيمة',
    'sort.cheapest': 'الأرخص',
    'sort.fastest': 'الأسرع',
    'sort.biggestSavings': 'أكبر توفير',
    'sort.valueScore': 'نقاط القيمة',

    // Filter
    'filter.all': 'جميع العروض',
    'filter.errorFare': 'أسعار خاطئة',
    'filter.priceDrop': 'تخفيضات',
    'filter.deal': 'عروض',

    // Mission Control
    'mc.title': 'مركز القيادة',
    'mc.subtitle': 'استخبارات عروض الطيران الحية',
    'mc.routesMonitored': 'مسارات مراقبة',
    'mc.refresh': 'تحديث',
    'mc.liveRefresh': 'مباشر — تحديث كل 60 ثانية',
    'mc.activeDeals': 'عروض نشطة',
    'mc.errorFares': 'أسعار خاطئة',
    'mc.priceDrops': 'تخفيضات',
    'mc.avgSavings': 'متوسط التوفير',

    // Flight table
    'flight.best': 'الأفضل',
    'flight.fast': 'سريع',
    'flight.errorFare': 'سعر خاطئ',
    'flight.priceDrop': 'تخفيض سعر',
    'flight.deal': 'عرض',
    'flight.direct': 'مباشر',
    'flight.stop': 'توقف',
    'flight.stops': 'توقفات',
    'flight.left': 'متبقي',
    'flight.bookOn': 'احجز على:',
    'flight.expires': 'ينتهي:',
    'flight.vs': 'ق.ق',
    'flight.source': 'المصدر:',
    'flight.live': 'مباشر',
    'flight.simulated': 'محاكاة',
    'flight.seats': 'مقاعد',

    // Geo-Pricing
    'geo.title': 'التسعير الجغرافي',
    'geo.subtitle': 'قارن الأسعار عبر الأسواق الإقليمية — ابحث عن أرخص نقطة بيع',
    'geo.howTitle': 'كيف تعمل المراجحة الجغرافية',
    'geo.howDesc': 'تسعّر شركات الطيران الرحلات بشكل مختلف بناءً على بلد/عملة المشتري. بضبط VPN الخاص بك إلى بلد "منخفض التكلفة" والبحث بعملتهم المحلية، يمكنك العثور على أسعار أرخص بنسبة 15-35%.',
    'geo.runScan': 'تشغيل المسح الجغرافي',
    'geo.scanning': 'جاري مسح 8 أسواق إقليمية...',
    'geo.cheapestFound': 'أرخص سوق',
    'geo.saveUpTo': 'وفّر حتى',
    'geo.vsOther': 'مقارنة بالأسواق الأخرى',
    'geo.setVpn': 'اضبط VPN على',
    'geo.marketComparison': 'مقارنة الأسواق',
    'geo.market': 'السوق',
    'geo.currency': 'العملة',
    'geo.cheapestPrice': 'أرخص سعر',
    'geo.savings': 'التوفير',
    'geo.vpnLocation': 'موقع VPN',
    'geo.action': 'إجراء',
    'geo.homeMarket': 'السوق المحلي',
    'geo.base': 'أساسي',
    'geo.best': 'الأفضل',
    'geo.vpnGuide': 'دليل إعداد VPN',
    'geo.step1Title': '1. اتصل بـ VPN',
    'geo.step1Desc': 'اضبط خادم VPN على البلد الموصى به أعلاه',
    'geo.step2Title': '2. وضع التخفي',
    'geo.step2Desc': 'افتح نافذة تخفي جديدة وامسح ملفات تعريف الارتباط أولاً',
    'geo.step3Title': '3. ابحث واحجز',
    'geo.step3Desc': 'ابحث على الموقع المحلي لشركة الطيران للحصول على تسعير إقليمي',
    'geo.proxyTitle': 'ملاح التسعير الجغرافي',
    'geo.proxyDesc': 'إنشاء روابط خاصة بنقطة البيع مع إعدادات VPN/بروكسي للتسعير الإقليمي',
    'geo.targetMarket': 'السوق المستهدف',
    'geo.platform': 'المنصة',
    'geo.generatedUrl': 'رابط نقطة البيع',
    'geo.proxyWorkflow': 'سير عمل النسخ والفتح في وضع التخفي',
    'geo.proxyStep1': 'اتصل بـ VPN/بروكسي للبلد المستهدف',
    'geo.proxyStep2': 'افتح نافذة تخفي',
    'geo.proxyStep3': 'الصق الرابط وابحث عن السعر الإقليمي',
    'geo.proxyConfig': 'متقدم: إعداد خادم البروكسي',

    // Tracker
    'tracker.title': 'مراقب الأسعار',
    'tracker.subtitle': 'تتبع الأسعار التلقائي مع تنبيهات ذكية',
    'tracker.alertCenter': 'مركز التنبيهات',
    'tracker.priceHistory': 'سجل الأسعار (30 يوم)',
    'tracker.trackedRoutes': 'المسارات المتتبعة',
    'tracker.target': 'الهدف:',
    'tracker.route': 'المسار (مثل: RUH → SIN)',
    'tracker.targetPrice': 'السعر المستهدف',
    'tracker.track': 'تتبع',

    // Upgrade
    'upgrade.title': 'جناح الترقية',
    'upgrade.subtitle': 'قوالب تفاوض ذكية للترقيات وإعادة الحجز',
    'upgrade.flightDetails': 'تفاصيل رحلتك (ملء تلقائي للقوالب)',
    'upgrade.copyToClipboard': 'نسخ إلى الحافظة',
    'upgrade.copied': 'تم النسخ!',

    // Wallet
    'wallet.title': 'استراتيجية المحفظة',
    'wallet.subtitle': 'مقارنة بطاقات الائتمان مع محسّن النقاط',
    'wallet.card': 'البطاقة',
    'wallet.annualFee': 'الرسوم السنوية',
    'wallet.signupBonus': 'مكافأة التسجيل',
    'wallet.minSpend': 'الحد الأدنى للإنفاق',
    'wallet.pointsPerSar': 'نقاط/ريال',
    'wallet.lounge': 'صالة',
    'wallet.companion': 'مرافق',
    'wallet.spendProgress': 'تقدم الإنفاق الأدنى',
    'wallet.transferPartners': 'شركاء التحويل',
    'wallet.recommended': 'موصى به',

    // Calculator
    'calc.title': 'حاسبة التكلفة الحقيقية',
    'calc.subtitle': 'مقارنة وكالات السفر مع الحجز المباشر مع كشف الرسوم المخفية',
    'calc.warning': 'السعر "الرخيص" من الوكالات ليس دائمًا أرخص',
    'calc.warningDesc': 'بعد الأمتعة واختيار المقعد ورسوم البطاقة، غالبًا ما يفضل "سعر الهبوط النهائي" الحجز المباشر.',
    'calc.feeBreakdown': 'تفصيل الرسوم',
    'calc.directAirline': 'حجز مباشر',
    'calc.baseFare': 'السعر الأساسي',
    'calc.baggage': 'الأمتعة (23 كجم)',
    'calc.seatSelection': 'اختيار المقعد',
    'calc.cardSurcharge': 'رسوم البطاقة',
    'calc.finalPrice': 'سعر الهبوط النهائي',
    'calc.best': 'الأفضل:',

    // Tools
    'tools.title': 'أدوات ذكية',
    'tools.subtitle': 'فرص الأميال الذهبية، قائمة المهام، وخريطة المناطق الرخيصة',
    'tools.sweetSpots': 'فرص استبدال الأميال الذهبية',
    'tools.cheapZones': 'المناطق الرخيصة من قاعدتك',
    'tools.tripChecklist': 'قائمة مهام الرحلة 2.0',
    'tools.complete': 'مكتمل',
    'tools.reset': 'إعادة تعيين',

    // General
    'general.language': 'اللغة',
    'general.english': 'English',
    'general.arabic': 'العربية',
  },
};

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('locale');
      if (saved === 'ar' || saved === 'en') setLocale(saved);
    } catch {}
  }, []);

  const changeLocale = useCallback((newLocale) => {
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);
    document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLocale;
  }, []);

  useEffect(() => {
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  }, [locale]);

  const t = useCallback((key) => {
    return translations[locale]?.[key] || translations.en[key] || key;
  }, [locale]);

  const isRTL = locale === 'ar';

  return (
    <I18nContext.Provider value={{ locale, changeLocale, t, isRTL }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
}
