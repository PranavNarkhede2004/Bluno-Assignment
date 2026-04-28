const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  shortId: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  managerName: {
    type: String,
    required: true,
  },
  budget: {
    type: Number,
    default: 15000,
  },
  initialBudget: {
    type: Number,
    default: 15000,
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
  }],
  totalSpent: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);
