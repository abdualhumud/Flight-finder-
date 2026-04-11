import './globals.css';
import Sidebar from '../components/Sidebar';
import StatusBar from '../components/StatusBar';
import Providers from '../lib/providers';

export const metadata = {
  title: 'Flight Finder — Travel Arbitrage Engine',
  description: 'Real-time flight deal intelligence, geo-pricing arbitrage, and travel optimization.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" dir="ltr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
              <StatusBar />
              <main className="flex-1 overflow-y-auto p-3 md:p-6 pb-20 md:pb-6">
                <div className="max-w-screen-xl mx-auto">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
