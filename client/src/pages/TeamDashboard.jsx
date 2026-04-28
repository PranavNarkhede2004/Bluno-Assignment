import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuction } from '../context/AuctionContext';
import PlayerCard from '../components/PlayerCard';
import { IndianRupee, Shield } from 'lucide-react';

const TeamDashboard = () => {
  const { teamId } = useParams(); // Using 1, 2, 3, 4 for ease from URL
  const { session, apiUrl } = useAuction();
  const [team, setTeam] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [placingBid, setPlacingBid] = useState(false);

  useEffect(() => {
    fetchTeam();
  }, [teamId, session?.status]);

  const fetchTeam = async () => {
    try {
      // In a real app we'd fetch by ID, but for the assignment let's fetch all and pick by index (since we seed 4)
      const res = await axios.get(`${apiUrl}/api/teams`);
      const teams = res.data;
      if (teams.length >= teamId) {
        setTeam(teams[teamId - 1]);
      }
    } catch (err) {
      console.error('Error fetching team:', err);
    }
  };

  useEffect(() => {
    // Auto-suggest next bid amount
    if (session?.currentBid) {
      setBidAmount(session.currentBid + 100);
    }
  }, [session?.currentBid]);

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!team) return;
    
    try {
      setPlacingBid(true);
      await axios.post(`${apiUrl}/api/auction/bid`, {
        teamId: team._id,
        amount: Number(bidAmount)
      });
    } catch (err) {
      alert(err.response?.data?.error || 'Error placing bid');
    } finally {
      setPlacingBid(false);
    }
  };

  if (!team) return <div className="text-center p-8 text-slate-400">Loading team data...</div>;

  const isAuctionActive = session?.status === 'Active' && session?.currentPlayer;
  const isHighestBidder = session?.currentBidder?._id === team._id || session?.currentBidder === team._id;
  const canAfford = team.budget >= Number(bidAmount);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Target Player */}
      <div className="lg:col-span-2 space-y-6">
        {isAuctionActive ? (
          <>
            <PlayerCard player={session.currentPlayer} />
            
            <div className={`p-6 rounded-2xl border ${isHighestBidder ? 'bg-brand-500/10 border-brand-500/30' : 'bg-slate-800 border-white/5'}`}>
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider">Current Market Bid</p>
                  <p className="text-4xl font-mono font-bold text-white flex items-center">
                    ₹{session.currentBid}
                  </p>
                </div>
                {isHighestBidder && (
                  <div className="bg-brand-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold">
                    You hold the highest bid
                  </div>
                )}
              </div>

              <form onSubmit={handlePlaceBid} className="flex gap-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-mono">₹</span>
                  </div>
                  <input
                    type="number"
                    min={session.currentBid + 100}
                    step={100}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    disabled={isHighestBidder || placingBid}
                    className="block w-full pl-10 pr-4 py-4 bg-slate-900 border border-white/10 rounded-xl text-xl text-white font-mono focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none disabled:opacity-50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isHighestBidder || placingBid || !canAfford}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-8 rounded-xl transition-colors disabled:opacity-50 disabled:hover:bg-emerald-600 shadow-lg shadow-emerald-900/20"
                >
                  {placingBid ? 'Bidding...' : 'Place Bid'}
                </button>
              </form>
              {!canAfford && <p className="text-red-400 mt-2 text-sm">Insufficient budget for this bid.</p>}
            </div>
          </>
        ) : (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-800/50 rounded-2xl border border-white/5 border-dashed">
            <h3 className="text-2xl font-bold text-slate-300 mt-4">Waiting for Auctioneer</h3>
            <p className="text-slate-500 mt-2">The next player will appear here</p>
          </div>
        )}
      </div>

      {/* Team Details */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-slate-800 rounded-2xl p-6 border border-white/5 border-t-4 border-t-brand-500">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-brand-500" />
            <div>
              <h2 className="text-xl font-bold text-white">{team.name}</h2>
              <p className="text-sm text-slate-400">Manager: {team.managerName}</p>
            </div>
          </div>
          
          <div className="bg-slate-900 rounded-xl p-4 mb-6">
            <p className="text-slate-400 text-sm mb-1">Remaining Budget</p>
            <p className="text-3xl font-mono font-bold text-brand-400">₹{team.budget}</p>
          </div>

          <h3 className="font-semibold text-white mb-4 border-b border-white/10 pb-2">Secured Players ({team.players.length})</h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {team.players.map(p => (
              <div key={p._id} className="bg-slate-900/50 p-3 rounded-lg flex justify-between items-center border border-white/5">
                <div>
                  <p className="font-medium text-white">{p.name}</p>
                  <p className="text-xs text-slate-400">{p.skillSet}</p>
                </div>
                <div className="font-mono font-semibold text-brand-400">
                  ₹{p.soldPrice}
                </div>
              </div>
            ))}
            {team.players.length === 0 && (
              <p className="text-slate-500 text-sm italic">No players secrued yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDashboard;
