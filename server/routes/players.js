const express = require('express');
const router = express.Router();
const Player = require('../models/Player');

/**
 * @route GET /api/players
 * @desc Get all players, optionally filtered by status
 */
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const players = await Player.find(filter).populate('soldTo', 'name');
    res.json(players);
  } catch (err) {
    console.error('Error fetching players:', err);
    res.status(500).json({ error: 'Server error fetching players' });
  }
});

/**
 * @route GET /api/players/:id
 * @desc Get player by id
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
