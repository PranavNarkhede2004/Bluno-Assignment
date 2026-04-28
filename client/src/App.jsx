import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuctionProvider } from './context/AuctionContext';
import AuctioneerDashboard from './pages/AuctioneerDashboard';
import TeamDashboard from './pages/TeamDashboard';
import PlayersPage from './pages/PlayersPage';
import TeamsPage from './pages/TeamsPage';
import { Gavel, Users, Shield, Landmark } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Auctioneer', path: '/auctioneer', icon: Gavel },
    { name: 'Players Base', path: '/players', icon: Users },
    { name: 'Franchises', path: '/teams', icon: Shield },
  ];

  return (
    <nav className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <Landmark className="w-8 h-8 text-brand-500" />
            <span className="text-xl flex font-bold bg-gradient-to-r from-brand-400 to-neon-purple text-transparent bg-clip-text">
              NPL Auction
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                    isActive 
                      ? 'text-brand-400' 
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
            
            {/* Quick links to teams for easy testing */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white">
                Team Logins
              </button>
              <div className="absolute right-0 w-48 mt-2 py-2 bg-slate-800 rounded-md shadow-xl opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 hidden group-hover:block">
                {[1, 2, 3, 4].map(id => (
                  <Link key={id} to={`/team/${id}`} className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">
                    Team {id} Manager
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Layout = ({ children }) => (
  <div className="min-h-screen bg-slate-900 text-slate-100">
    <Navbar />
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {children}
    </main>
  </div>
);

function App() {
  return (
    <AuctionProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<AuctioneerDashboard />} />
            <Route path="/auctioneer" element={<AuctioneerDashboard />} />
            <Route path="/team/:teamId" element={<TeamDashboard />} />
            <Route path="/players" element={<PlayersPage />} />
            <Route path="/teams" element={<TeamsPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuctionProvider>
  );
}

export default App;
