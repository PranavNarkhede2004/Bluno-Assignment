const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  skillSet: {
    type: String,
    enum: ['Batting', 'Bowling', 'All-Rounder'],
    required: true,
  },
  basePrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Available', 'Sold', 'Unsold'],
    default: 'Available',
  },
  soldTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null,
  },
  soldPrice: {
    type: Number,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('Player', playerSchema);
