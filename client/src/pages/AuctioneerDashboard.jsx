import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuction } from '../context/AuctionContext';
import PlayerCard from '../components/PlayerCard';
import { Check, X, Play, RefreshCw, Users, Gavel } from 'lucide-react';

const AuctioneerDashboard = () => {
  const { session, apiUrl, lastPlayerEvent } = useAuction();
  const [allPlayers, setAllPlayers] = useState([]);
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    fetchAllPlayers();
  }, [session?.currentPlayer, session?.status, lastPlayerEvent]);

  const fetchAllPlayers = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/players`);
      setAllPlayers(res.data);
    } catch (err) {
      console.error('Error fetching players:', err);
      toast.error('Failed to load players');
    }
  };

  const availablePlayers = allPlayers.filter(p => p.status === 'Available');
  const soldPlayers = allPlayers.filter(p => p.status === 'Sold');
  const unsoldPlayers = allPlayers.filter(p => p.status === 'Unsold');

  const currentBidAmount = session?.currentBid || 0;
  const currentBidderName = session?.currentBidder?.name || 'No bids yet';

  const startAuction = async (playerId) => {
    try {
      setLoadingAction(true);
      await axios.post(`${apiUrl}/api/auction/start`, { playerId });
      toast.success('Auction started');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error starting auction');
    } finally {
      setLoadingAction(false);
    }
  };

  const acceptBid = async () => {
    try {
      setLoadingAction(true);
      await axios.post(`${apiUrl}/api/auction/accept`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error accepting bid');
    } finally {
      setLoadingAction(false);
    }
  };

  const rejectPlayer = async () => {
    try {
      setLoadingAction(true);
      await axios.post(`${apiUrl}/api/auction/reject`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error rejecting player');
    } finally {
      setLoadingAction(false);
    }
  };

  const resetAuction = async () => {
    if(!window.confirm('Are you sure you want to completely rest the auction? This deletes all bids, assignments, and budgets!')) return;
    try {
      setLoadingAction(true);
      await axios.post(`${apiUrl}/api/auction/reset`);
      toast.success('Auction completely reset');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error resetting auction');
    } finally {
      setLoadingAction(false);
    }
  };

  const isAuctionActive = session?.status === 'Active' && session?.currentPlayer;
  const currentPlayer = session?.currentPlayer;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column - Control Panel & Status */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-slate-800 rounded-2xl p-6 border border-white/5 shadow-xl">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-brand-500" />
            Auction Status
          </h2>
          
          <div className="grid grid-cols-3 gap-2 mb-6 border-b border-white/10 pb-6 text-center">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
              <p className="text-2xl font-bold text-blue-400">{availablePlayers.length}</p>
              <p className="text-xs text-slate-400 uppercase">Available</p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2">
              <p className="text-2xl font-bold text-emerald-400">{soldPlayers.length}</p>
              <p className="text-xs text-slate-400 uppercase">Sold</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2">
              <p className="text-2xl font-bold text-red-400">{unsoldPlayers.length}</p>
              <p className="text-xs text-slate-400 uppercase">Unsold</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {!isAuctionActive ? (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Next Player</h3>
                <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                  {availablePlayers.length > 0 ? availablePlayers.map(p => (
                    <div key={p._id} className="bg-slate-900/50 p-3 rounded-xl border border-white/5 flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-white">{p.name}</p>
                          <p className="text-xs text-slate-400">{p.skillSet}</p>
                        </div>
                        <p className="font-mono font-medium text-brand-400">₹{p.basePrice}</p>
                      </div>
                      <button
                        onClick={() => startAuction(p._id)}
                        disabled={loadingAction}
                        className="w-full flex justify-center items-center gap-1 bg-brand-600/20 text-brand-400 hover:bg-brand-600 py-1.5 rounded-lg text-sm font-medium transition-colors hover:text-white"
                      >
                        <Play className="w-4 h-4" /> Bring to Auction
                      </button>
                    </div>
                  )) : (
                    <p className="text-slate-500 text-sm text-center py-4">No available players left.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="text-center">
                  <button
                    onClick={acceptBid}
                    disabled={loadingAction || !session?.currentBidder}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-4 rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                    <Check className="w-5 h-5" />
                    Sold to {session?.currentBidder ? currentBidderName : '...'}
                  </button>
                  {!session?.currentBidder && (
                    <p className="text-xs text-slate-500 mt-2 italic">Waiting for first bid...</p>
                  )}
                </div>

                <button
                  onClick={rejectPlayer}
                  disabled={loadingAction}
                  className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-red-500/20 hover:text-red-400 text-slate-300 py-3 px-4 rounded-xl font-medium transition-colors border border-transparent hover:border-red-500/50"
                >
                  <X className="w-5 h-5" />
                  Pass / Unsold
                </button>
              </div>
            )}
            
            <button
              onClick={resetAuction}
              disabled={loadingAction}
              className="w-full mt-8 flex items-center justify-center gap-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 py-2 px-4 rounded-xl font-medium transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Entire Auction
            </button>
          </div>
        </div>
      </div>

      {/* Right Column - Active Player & Live Bid */}
      <div className="lg:col-span-2">
        {isAuctionActive ? (
          <div className="space-y-6">
            <PlayerCard player={currentPlayer} />
            
            <div className="bg-slate-800 rounded-2xl p-6 border border-white/5 shadow-xl">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Current Highest Bid</h3>
              <div className="flex items-end justify-between">
                <div className="text-5xl font-mono font-bold text-brand-400 flex items-center gap-4">
                  ₹{currentBidAmount}
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">Placed by</p>
                  <p className="text-xl font-medium text-white">{currentBidderName}</p>
                </div>
              </div>
            </div>
            
            {/* Bid History */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-white/5 shadow-xl">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Bid History</h3>
              <div className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                {session?.bidHistory && session.bidHistory.length > 0 ? (
                  // Create a copy of the array and reverse it securely to avoid mutating state
                  [...session.bidHistory].reverse().map((bid, index) => (
                    <div key={index} className="flex justify-between items-center bg-slate-900/50 p-3 rounded-xl border border-white/5">
                      <span className="font-medium text-slate-300">{bid.team?.name || 'Unknown Team'}</span>
                      <span className="font-mono font-semibold text-brand-400">₹{bid.amount}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm italic text-center py-4">No bids placed in this session yet.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-800/50 rounded-2xl border border-white/5 border-dashed">
            <GavelPlaceholder />
            <h3 className="text-2xl font-bold text-slate-300 mt-4">No Active Auction</h3>
            <p className="text-slate-500 mt-2">Bring the next player to start bidding</p>
          </div>
        )}
      </div>
    </div>
  );
};

const GavelPlaceholder = () => (
  <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center shadow-inner relative">
    <div className="absolute inset-0 border-2 border-brand-500 rounded-full animate-pulse opacity-50"></div>
    <Gavel className="w-10 h-10 text-brand-500" />
  </div>
);

export default AuctioneerDashboard;
