/**
 * @fileoverview Players Routes - Defines API endpoints for player management operations
 * @description This module defines all the REST API routes for player-related operations.
 * It handles player retrieval, filtering, and individual player data access.
 * 
 * Key Features:
 * - Retrieve all players with optional filtering
 * - Get individual player details
 * - Status-based player filtering
 * - Team ownership information
 * 
 * @author NPL Auction System
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const Player = require('../models/Player');

/**
 * Retrieves all players with optional status filtering
 * Returns complete player list with team ownership details
 * 
 * @route GET /api/players
 * @access Public
 * @param {Object} req.query - Query parameters
 * @param {string} [req.query.status] - Filter by player status (Available/Sold/Unsold)
 * @returns {Object[]} Array of player objects with populated team data
 * @example
 * GET /api/players
 * Response: [{ "name": "Virat Kohli", "skillSet": "Batting", "basePrice": 18000, ... }]
 * 
 * GET /api/players?status=Sold
 * Response: [{ "name": "Virat Kohli", "status": "Sold", "soldTo": {...}, ... }]
 */
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};  // Apply status filter if provided
    const players = await Player.find(filter).populate('soldTo', 'name');  // Include team name if sold
    res.json(players);
  } catch (err) {
    console.error('Error fetching players:', err);
    res.status(500).json({ error: 'Server error fetching players' });
  }
});

/**
 * Retrieves a specific player by their ID
 * Returns complete player details including team ownership information
 * 
 * @route GET /api/players/:id
 * @access Public
 * @param {string} req.params.id - Unique identifier of the player
 * @returns {Object} Player object with populated team data
 * @example
 * GET /api/players/507f1f77bcf86cd799439011
 * Response: { "name": "Virat Kohli", "skillSet": "Batting", "basePrice": 18000, "soldTo": {...}, ... }
 */
router.get('/:id', async (req, res) => {
  try {
    const player = await Player.findById(req.params.id).populate('soldTo', 'name');
    if (!player) return res.status(404).json({ error: 'Player not found' });
    res.json(player);
  } catch (err) {
    console.error('Error fetching player by id:', err);
    res.status(500).json({ error: 'Server error fetching player by id' });
  }
});

module.exports = router;
