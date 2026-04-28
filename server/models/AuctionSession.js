const mongoose = require('mongoose');

const auctionSessionSchema = new mongoose.Schema({
  currentPlayer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    default: null,
  },
  currentBid: {
    type: Number,
    default: 0,
  },
  currentBidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null,
  },
  status: {
    type: String,
    enum: ['Idle', 'Active', 'Hammer'],
    default: 'Idle',
  },
  bidHistory: [{
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    amount: {
      type: Number,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
}, { timestamps: true });

module.exports = mongoose.model('AuctionSession', auctionSessionSchema);
