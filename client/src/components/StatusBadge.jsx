import React from 'react';

const StatusBadge = ({ status }) => {
  const colors = {
    Available: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Sold: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Unsold: 'bg-red-500/10 text-red-400 border-red-500/20'
  };
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[status] || colors.Available}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
