/**
 * @fileoverview Teams Routes - Defines API endpoints for team management operations
 * @description This module defines all the REST API routes for team-related operations.
 * It handles team retrieval, roster management, and team data access.
 * 
 * Key Features:
 * - Retrieve all teams with player rosters
 * - Get individual team details by ID or short ID
 * - Flexible team identification (ObjectId or shortId)
 * - Complete roster population
 * 
 * @author NPL Auction System
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const Team = require('../models/Team');

/**
 * Retrieves all teams with their complete player rosters
 * Returns team list including budget, spending, and player details
 * 
 * @route GET /api/teams
 * @access Public
 * @returns {Object[]} Array of team objects with populated player data
 * @example
 * GET /api/teams
 * Response: [{ "name": "Mumbai Mavericks", "budget": 85000, "players": [...], ... }]
 */
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find().populate('players');  // Include complete player roster
    res.json(teams);
  } catch (err) {
    console.error('Error fetching teams:', err);
    res.status(500).json({ error: 'Server error fetching teams' });
  }
});

/**
 * Retrieves a specific team by ID or short ID
 * Supports flexible team identification and returns complete team details
 * 
 * @route GET /api/teams/:id
 * @access Public
 * @param {string} req.params.id - Team identifier (ObjectId or shortId)
 * @returns {Object} Team object with populated player roster
 * @example
 * GET /api/teams/1  (using shortId)
 * Response: { "name": "Mumbai Mavericks", "shortId": 1, "budget": 85000, "players": [...] }
 * 
 * GET /api/teams/507f1f77bcf86cd799439012  (using ObjectId)
 * Response: { "name": "Mumbai Mavericks", "budget": 85000, "players": [...] }
 */
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    let team;
    
    // Determine if ID is shortId (numeric) or ObjectId
    if (id.length < 5 && !isNaN(id)) {
      // Search by shortId for numeric IDs
      team = await Team.findOne({ shortId: Number(id) }).populate('players');
    } else {
      // Search by ObjectId for longer alphanumeric IDs
      team = await Team.findById(id).populate('players');
    }
    
    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.json(team);
  } catch (err) {
    console.error('Error fetching team by id:', err);
    res.status(500).json({ error: 'Server error fetching team by id' });
  }
});

module.exports = router;
