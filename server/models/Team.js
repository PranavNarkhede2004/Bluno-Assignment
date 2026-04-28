/**
 * @fileoverview Team Model - Defines the schema for franchise teams in the NPL auction system
 * @description This model represents franchise teams participating in the auction.
 * Each team has a budget, manager, roster of players, and financial tracking.
 * 
 * Key Features:
 * - Team identification with unique short ID and name
 * - Budget management with initial and current budget tracking
 * - Player roster management
 * - Financial transaction history
 * - Manager assignment for team operations
 * 
 * @author NPL Auction System
 * @version 1.0.0
 */

const mongoose = require('mongoose');

/**
 * Team Schema Definition
 * Represents a franchise team participating in the auction
 */
const teamSchema = new mongoose.Schema({
  /**
   * Unique short identifier for the team
   * Used for routing and team identification
   * @type {Number}
   * @required true
   * @unique true
   * @example 1
   */
  shortId: {
    type: Number,
    required: true,
    unique: true,
  },
  
  /**
   * Full team name for display purposes
   * Must be unique across all teams
   * @type {String}
   * @required true
   * @unique true
   * @example "Mumbai Mavericks"
   */
  name: {
    type: String,
    required: true,
    unique: true,
  },
  
  /**
   * Name of the team manager responsible for bidding
   * @type {String}
   * @required true
   * @example "Aditya Sharma"
   */
  managerName: {
    type: String,
    required: true,
  },
  
  /**
   * Current available budget for bidding
   * Decreases as players are purchased
   * @type {Number}
   * @default 100000
   * @example 85000
   */
  budget: {
    type: Number,
    default: 100000,
  },
  
  /**
   * Initial budget assigned to the team
   * Used for budget reset and percentage calculations
   * @type {Number}
   * @default 100000
   * @example 100000
   */
  initialBudget: {
    type: Number,
    default: 100000,
  },
  
  /**
   * Array of players purchased by the team
   * Populated with Player document references
   * @type {ObjectId[]}
   * @ref 'Player'
   * @default []
   */
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
  }],
  
  /**
   * Total amount spent on player purchases
   * Calculated as sum of all player sale prices
   * @type {Number}
   * @default 0
   * @example 15000
   */
  totalSpent: {
    type: Number,
    default: 0,
  },
}, { 
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Team', teamSchema);
