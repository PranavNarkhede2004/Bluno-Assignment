import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuction } from '../context/AuctionContext';
import { Shield, Users, Wallet } from 'lucide-react';

const TeamsPage = () => {
  const { apiUrl, session } = useAuction();
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    fetchTeams();
  }, [session?.status]);

  const fetchTeams = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/teams`);
      setTeams(res.data);
    } catch (err) {
      console.error('Error fetching teams:', err);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white mb-8">Franchises Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teams.map(team => (
          <div key={team._id} className="bg-slate-800 rounded-2xl border border-white/5 overflow-hidden shadow-xl hover:border-brand-500/30 transition-all">
            <div className="p-6 border-b border-white/5 bg-slate-900/30">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-brand-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{team.name}</h2>
                    <p className="text-sm text-slate-400">Manager: {team.managerName}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 pb-4 flex gap-4">
              <div className="flex-1 bg-slate-900/50 rounded-xl p-3 border border-white/5 flex items-center gap-3">
                <Wallet className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="text-xs text-slate-400 uppercase">Remaining</p>
                  <p className="font-mono text-lg font-bold text-white">₹{team.budget}</p>
                </div>
              </div>
              <div className="flex-1 bg-slate-900/50 rounded-xl p-3 border border-white/5 flex items-center gap-3">
                <Users className="w-5 h-5 text-brand-500" />
                <div>
                  <p className="text-xs text-slate-400 uppercase">Squad Size</p>
                  <p className="font-mono text-lg font-bold text-white">{team.players.length}</p>
                </div>
              </div>
            </div>
            
            <div className="px-6 pb-6 pt-2">
              <h3 className="text-sm font-semibold text-slate-400 mb-3 border-b border-white/5 pb-2">Roster</h3>
              {team.players.length > 0 ? (
                <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar">
                  {team.players.map(p => (
                    <div key={p._id} className="flex justify-between items-center text-sm p-2 rounded hover:bg-slate-700/50 transition-colors">
                      <span className="text-slate-300">{p.name} <span className="text-slate-500 text-xs ml-1">({p.skillSet})</span></span>
                      <span className="font-mono text-brand-400">₹{p.soldPrice}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm italic">No players in roster yet.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamsPage;
