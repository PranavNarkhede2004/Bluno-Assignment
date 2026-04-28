import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuction } from '../context/AuctionContext';
import PlayerCard from '../components/PlayerCard';
import { Check, X, Play, RefreshCw, Users } from 'lucide-react';

const AuctioneerDashboard = () => {
  const { session, apiUrl } = useAuction();
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    fetchAvailablePlayers();
  }, [session?.currentPlayer]);

  const fetchAvailablePlayers = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/players?status=Available`);
      setAvailablePlayers(res.data);
    } catch (err) {
      console.error('Error fetching available players:', err);
    }
  };

  const currentBidAmount = session?.currentBid || 0;
  const currentBidderName = session?.currentBidder?.name || 'No bids yet';

  const startAuction = async () => {
    if (availablePlayers.length === 0) return alert('No available players left!');
    try {
      setLoadingAction(true);
      const nextPlayer = availablePlayers[0];
      await axios.post(`${apiUrl}/api/auction/start`, { playerId: nextPlayer._id });
    } catch (err) {
      alert(err.response?.data?.error || 'Error starting auction');
    } finally {
      setLoadingAction(false);
    }
  };

  const acceptBid = async () => {
    try {
      setLoadingAction(true);
      await axios.post(`${apiUrl}/api/auction/accept`);
    } catch (err) {
      alert(err.response?.data?.error || 'Error accepting bid');
    } finally {
      setLoadingAction(false);
    }
  };

  const rejectPlayer = async () => {
    try {
      setLoadingAction(true);
      await axios.post(`${apiUrl}/api/auction/reject`);
    } catch (err) {
      alert(err.response?.data?.error || 'Error rejecting player');
    } finally {
      setLoadingAction(false);
    }
  };

  const resetAuction = async () => {
    if(!window.confirm('Are you sure you want to completely rest the auction? This deletes all bids, assignments, and budgets!')) return;
    try {
      setLoadingAction(true);
      await axios.post(`${apiUrl}/api/auction/reset`);
    } catch (err) {
      alert(err.response?.data?.error || 'Error resetting auction');
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
          
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
            <span className="text-slate-400">Available Players</span>
            <span className="text-xl font-bold text-white">{availablePlayers.length}</span>
          </div>
          
          <div className="space-y-4">
            {!isAuctionActive ? (
              <button
                onClick={startAuction}
                disabled={loadingAction || availablePlayers.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white py-3 px-4 rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                <Play className="w-5 h-5" />
                {availablePlayers.length > 0 ? 'Bring Next Player' : 'Auction Complete'}
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  onClick={acceptBid}
                  disabled={loadingAction || !session?.currentBidder}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-4 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  <Check className="w-5 h-5" />
                  Sold to {currentBidderName}
                </button>
                <button
                  onClick={rejectPlayer}
                  disabled={loadingAction}
                  className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-red-500/20 hover:text-red-400 text-slate-300 py-3 px-4 rounded-xl font-medium transition-colors disabled:opacity-50 border border-transparent hover:border-red-500/50"
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
            
            {/* Bid History section would go here */}
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
  <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center shadow-inner">
    <Check className="w-10 h-10 text-slate-600" />
  </div>
);

export default AuctioneerDashboard;
