import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';
import { AuctionProvider, useAuction } from './context/AuctionContext';
import AuctioneerDashboard from './pages/AuctioneerDashboard';
import TeamDashboard from './pages/TeamDashboard';
import PlayersPage from './pages/PlayersPage';
import TeamsPage from './pages/TeamsPage';
import { Gavel, Users, Shield, Landmark, Menu, X } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [teams, setTeams] = useState([]);
  const { apiUrl } = useAuction();

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/teams`);
        setTeams(res.data);
      } catch (err) {
        console.error('Error fetching teams for navbar:', err);
      }
    };
    if (apiUrl) fetchTeams();
  }, [apiUrl]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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
                    isActive ? 'text-brand-400' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
            
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white">
                Team Logins
              </button>
              <div className="absolute right-0 w-48 mt-2 py-2 bg-slate-800 rounded-md shadow-xl transition-all border border-white/10 invisible opacity-0 group-hover:visible group-hover:opacity-100 relative-block">
                {teams.length > 0 ? teams.map(t => (
                  <Link key={t.shortId} to={`/team/${t.shortId}`} className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">
                    {t.name}
                  </Link>
                )) : [1, 2, 3, 4].map(id => (
                  <Link key={id} to={`/team/${id}`} className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">
                    Team {id}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-300 hover:text-white p-2">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-800 border-b border-white/10 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                  isActive ? 'bg-brand-500/10 text-brand-400' : 'text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
          <div className="pt-4 pb-2 border-t border-white/10 mt-2">
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Team Logins</p>
            {teams.length > 0 ? teams.map(t => (
               <Link key={t.shortId} to={`/team/${t.shortId}`} className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-700/50">
                 {t.name}
               </Link>
            )) : [1, 2, 3, 4].map(id => (
              <Link key={id} to={`/team/${id}`} className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-700/50">
                Team {id}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

const Layout = ({ children }) => (
  <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
    <Navbar />
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {children}
    </main>
  </div>
);

function App() {
  return (
    <AuctionProvider>
      <BrowserRouter>
        <Toaster position="top-left" toastOptions={{ duration: 2000, style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' } }} />
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
