const express = require('express');
const router = express.Router();
const Team = require('../models/Team');

/**
 * @route GET /api/teams
 * @desc Get all teams with rosters
 */
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find().populate('players');
    res.json(teams);
  } catch (err) {
    console.error('Error fetching teams:', err);
    res.status(500).json({ error: 'Server error fetching teams' });
  }
});

/**
 * @route GET /api/teams/:id
 * @desc Get single team by id or shortId
 */
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    let team;
    if (id.length < 5 && !isNaN(id)) {
      team = await Team.findOne({ shortId: Number(id) }).populate('players');
    } else {
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
