/**
 * @fileoverview AuctionSession Model - Defines the schema for live auction sessions in the NPL auction system
 * @description This model represents the current state of an active auction session.
 * It tracks the current player being auctioned, bidding status, and bid history.
 * 
 * Key Features:
 * - Real-time auction state management
 * - Current player and bid tracking
 * - Bid history with timestamps
 * - Auction status lifecycle management
 * - Team bidding activity tracking
 * 
 * @author NPL Auction System
 * @version 1.0.0
 */

const mongoose = require('mongoose');

/**
 * AuctionSession Schema Definition
 * Represents the current state of an active auction
 * Only one active session should exist at any time
 */
const auctionSessionSchema = new mongoose.Schema({
  /**
   * Reference to the player currently being auctioned
   * Null when no auction is active
   * @type {ObjectId}
   * @ref 'Player'
   * @default null
   */
  currentPlayer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    default: null,
  },
  
  /**
   * Current highest bid amount for the active player
   * Resets to 0 when no auction is active
   * @type {Number}
   * @default 0
   * @example 25000
   */
  currentBid: {
    type: Number,
    default: 0,
  },
  
  /**
   * Reference to the team with the current highest bid
   * Null when no bids have been placed or auction is inactive
   * @type {ObjectId}
   * @ref 'Team'
   * @default null
   */
  currentBidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null,
  },
  
  /**
   * Current auction status
   * Tracks the phase of the auction lifecycle
   * @type {String}
   * @enum {['Idle', 'Active', 'Hammer']}
   * @default 'Idle'
   * @description
   * - Idle: No active auction
   * - Active: Player is being auctioned, accepting bids
   * - Hammer: Final decision phase (sold/unsold)
   */
  status: {
    type: String,
    enum: ['Idle', 'Active', 'Hammer'],
    default: 'Idle',
  },
  
  /**
   * Array of all bids placed in the current auction
   * Tracks bidding activity and history
   * @type {Object[]}
   * @property {ObjectId} team - Reference to the team that placed the bid
   * @property {Number} amount - Bid amount
   * @property {Date} timestamp - When the bid was placed
   */
  bidHistory: [{
    /**
     * Reference to the team that placed this bid
     * @type {ObjectId}
     * @ref 'Team'
     */
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    
    /**
     * Amount bid by the team
     * @type {Number}
     * @example 22000
     */
    amount: {
      type: Number,
    },
    
    /**
     * Timestamp when the bid was placed
     * Automatically set to current time
     * @type {Date}
     * @default Date.now
     */
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
}, { 
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('AuctionSession', auctionSessionSchema);
