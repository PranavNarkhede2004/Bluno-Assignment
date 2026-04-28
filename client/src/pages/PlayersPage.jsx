import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuction } from '../context/AuctionContext';
import StatusBadge from '../components/StatusBadge';
import { Filter } from 'lucide-react';

const PlayersPage = () => {
  const { apiUrl, session } = useAuction();
  const [players, setPlayers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [skillFilter, setSkillFilter] = useState('All');

  useEffect(() => {
    fetchPlayers();
  }, [session?.status]);

  const fetchPlayers = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/players`);
      setPlayers(res.data);
    } catch (err) {
      console.error('Error fetching players:', err);
    }
  };

  const filteredPlayers = players.filter(p => {
    const statusMatch = statusFilter === 'All' || p.status === statusFilter;
    const skillMatch = skillFilter === 'All' || p.skillSet === skillFilter;
    return statusMatch && skillMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-white">Player Database</h1>
        
        <div className="flex bg-slate-800 p-2 rounded-xl border border-white/5 items-center gap-4">
          <Filter className="w-5 h-5 text-slate-400 ml-2" />
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-900 text-slate-300 border-none rounded-lg text-sm focus:ring-brand-500 py-1.5"
          >
            <option value="All">All Status</option>
            <option value="Available">Available</option>
            <option value="Sold">Sold</option>
            <option value="Unsold">Unsold</option>
          </select>
          <div className="w-px h-6 bg-white/10"></div>
          <select 
            value={skillFilter}
            onChange={e => setSkillFilter(e.target.value)}
            className="bg-slate-900 text-slate-300 border-none rounded-lg text-sm focus:ring-brand-500 py-1.5"
          >
            <option value="All">All Skills</option>
            <option value="Batting">Batting</option>
            <option value="Bowling">Bowling</option>
            <option value="All-Rounder">All-Rounder</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-900/50 text-slate-400">
              <tr>
                <th className="px-6 py-4">Player Name</th>
                <th className="px-6 py-4">Skill Set</th>
                <th className="px-6 py-4">Base Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Franchise</th>
                <th className="px-6 py-4">Sold Price</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map((player, index) => (
                <tr key={player._id} className="border-b border-white/5 hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{player.name}</td>
                  <td className="px-6 py-4">{player.skillSet}</td>
                  <td className="px-6 py-4 font-mono font-medium text-slate-400">₹{player.basePrice}</td>
                  <td className="px-6 py-4"><StatusBadge status={player.status} /></td>
                  <td className="px-6 py-4">
                    {player.soldTo ? (
                      <span className="text-brand-400 font-medium">{player.soldTo.name}</span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4">
                    {player.soldPrice ? (
                      <span className="font-mono font-medium text-brand-400">₹{player.soldPrice}</span>
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredPlayers.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No players match the current filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayersPage;
