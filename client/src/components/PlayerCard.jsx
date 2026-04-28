import React from 'react';
import StatusBadge from './StatusBadge';
import { User } from 'lucide-react';

const PlayerCard = ({ player }) => {
  if (!player) return null;
  
  return (
    <div className="bg-slate-800 rounded-2xl p-6 border border-white/5 shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4">
        <StatusBadge status={player.status} />
      </div>
      
      <div className="flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center mb-4 ring-4 ring-brand-500/20 group-hover:ring-brand-500/40 transition-all">
          <User className="w-12 h-12 text-slate-400" />
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-1">{player.name}</h3>
        <p className="text-brand-400 font-medium mb-4">{player.skillSet}</p>
        
        <div className="grid grid-cols-2 gap-4 w-full mt-2">
          <div className="bg-slate-900/50 rounded-xl p-3 border border-white/5">
            <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Base Price</p>
            <p className="font-mono text-lg font-semibold text-white">₹{player.basePrice}</p>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-3 border border-white/5">
            <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider">
              {player.status === 'Sold' ? 'Sold Price' : 'Current Bid'}
            </p>
            <p className="font-mono text-lg font-semibold text-brand-400">
              ₹{player.soldPrice || player.basePrice}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
