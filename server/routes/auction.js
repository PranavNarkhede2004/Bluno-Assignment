/**
 * @fileoverview Auction Routes - Defines API endpoints for auction operations
 * @description This module defines all the REST API routes for auction-related operations.
 * It handles the complete auction workflow from session management to bid processing.
 * 
 * Key Features:
 * - Auction session management
 * - Player auction initiation
 * - Bid processing and validation
 * - Sale/unsold decisions
 * - Complete auction reset functionality
 * 
 * @author NPL Auction System
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');

/**
 * Retrieves the current auction session state
 * Returns complete session information including current player, bids, and status
 * 
 * @route GET /api/auction/session
 * @access Public
 * @returns {Object} Current auction session with populated data
 * @example
 * GET /api/auction/session
 * Response: { currentPlayer: {...}, currentBid: 18000, status: 'Active', ... }
 */
router.get('/session', auctionController.getSession);

/**
 * Initiates an auction for a specific player
 * Sets up the auction session and starts the bidding process
 * 
 * @route POST /api/auction/start
 * @access Public
 * @param {Object} req.body - Request body
 * @param {string} req.body.playerId - ID of the player to auction
 * @returns {Object} Auction start confirmation and updated session
 * @example
 * POST /api/auction/start
 * Body: { "playerId": "507f1f77bcf86cd799439011" }
 * Response: { "message": "Auction started", "session": {...} }
 */
router.post('/start', auctionController.startAuction);

/**
 * Processes and validates a bid from a team
 * Updates auction session with new highest bid
 * 
 * @route POST /api/auction/bid
 * @access Public
 * @param {Object} req.body - Request body
 * @param {string} req.body.teamId - ID of the team placing the bid
 * @param {number} req.body.amount - Bid amount
 * @returns {Object} Bid confirmation and updated session
 * @example
 * POST /api/auction/bid
 * Body: { "teamId": "507f1f77bcf86cd799439012", "amount": 20000 }
 * Response: { "message": "Bid placed successfully", "session": {...} }
 */
router.post('/bid', auctionController.placeBid);

/**
 * Accepts the current highest bid and finalizes the player sale
 * Updates player status, team budget, and resets auction session
 * 
 * @route POST /api/auction/accept
 * @access Public
 * @returns {Object} Sale confirmation and transaction details
 * @example
 * POST /api/auction/accept
 * Response: { "message": "Bid accepted, player sold", "player": {...}, "team": {...} }
 */
router.post('/accept', auctionController.acceptBid);

/**
 * Rejects all bids for the current player and marks them as unsold
 * Resets auction session without completing any sale
 * 
 * @route POST /api/auction/reject
 * @access Public
 * @returns {Object} Rejection confirmation and player details
 * @example
 * POST /api/auction/reject
 * Response: { "message": "Bids rejected, player unsold", "player": {...} }
 */
router.post('/reject', auctionController.rejectBids);

/**
 * Completely resets the entire auction system
 * Restores all players to available status and resets all team budgets
 * 
 * @route POST /api/auction/reset
 * @access Public
 * @returns {Object} Reset confirmation
 * @example
 * POST /api/auction/reset
 * Response: { "message": "Auction reset entirely" }
 */
router.post('/reset', auctionController.resetAuction);

module.exports = router;
