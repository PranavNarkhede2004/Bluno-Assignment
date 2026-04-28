/**
 * @fileoverview Player Model - Defines the schema for cricket players in the NPL auction system
 * @description This model represents individual cricket players available for auction.
 * Each player has a name, skill set, base price, and auction status.
 * 
 * Key Features:
 * - Player categorization by skill type (Batting/Bowling/All-Rounder)
 * - Base price tracking for auction bidding
 * - Status tracking through auction lifecycle
 * - Sale history when player is sold
 * 
 * @author NPL Auction System
 * @version 1.0.0
 */

const mongoose = require('mongoose');

/**
 * Player Schema Definition
 * Represents a cricket player available in the auction
 */
const playerSchema = new mongoose.Schema({
  /**
   * Player's full name
   * @type {String}
   * @required true
   * @example "Virat Kohli"
   */
  name: {
    type: String,
    required: true,
  },
  
  /**
   * Player's primary skill set
   * Determines player category for team composition strategy
   * @type {String}
   * @enum {['Batting', 'Bowling', 'All-Rounder']}
   * @required true
   * @example "Batting"
   */
  skillSet: {
    type: String,
    enum: ['Batting', 'Bowling', 'All-Rounder'],
    required: true,
  },
  
  /**
   * Base price for auction bidding
   * Starting price from which bidding begins
   * @type {Number}
   * @required true
   * @example 18000
   */
  basePrice: {
    type: Number,
    required: true,
  },
  
  /**
   * Current auction status
   * Tracks player's position in auction lifecycle
   * @type {String}
   * @enum {['Available', 'Sold', 'Unsold']}
   * @default 'Available'
   */
  status: {
    type: String,
    enum: ['Available', 'Sold', 'Unsold'],
    default: 'Available',
  },
  
  /**
   * Reference to the team that purchased the player
   * Populated when player status changes to 'Sold'
   * @type {ObjectId}
   * @ref 'Team'
   * @default null
   */
  soldTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null,
  },
  
  /**
   * Final sale price when player is sold
   * Records the winning bid amount
   * @type {Number}
   * @default null
   * @example 25000
   */
  soldPrice: {
    type: Number,
    default: null,
  },
}, { 
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Player', playerSchema);
