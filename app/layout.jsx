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
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <StatusBar />
              <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-7xl mx-auto">
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
