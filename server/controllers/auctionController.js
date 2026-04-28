const AuctionSession = require('../models/AuctionSession');
const Player = require('../models/Player');
const Team = require('../models/Team');

// Helper to broadcast full session to clients
const broadcastSessionUpdate = async (io) => {
  try {
    const session = await AuctionSession.findOne().populate('currentPlayer').populate('currentBidder');
    io.emit('auction:update', session);
  } catch (err) {
    console.error('Error broadcasting session update:', err);
  }
};

exports.getSession = async (req, res) => {
  try {
    let session = await AuctionSession.findOne().populate('currentPlayer').populate('currentBidder', 'name');
    if (!session) {
      session = await AuctionSession.create({});
    }
    res.json(session);
  } catch (err) {
    console.error('Error fetching session:', err);
    res.status(500).json({ error: 'Server error fetching session' });
  }
};

exports.startAuction = async (req, res) => {
  const { playerId } = req.body;
  const io = req.app.get('io');
  
  try {
    const player = await Player.findById(playerId);
    if (!player) return res.status(404).json({ error: 'Player not found' });
    if (player.status !== 'Available') return res.status(400).json({ error: 'Player is not available for auction' });
    
    let session = await AuctionSession.findOne();
    if (!session) session = new AuctionSession({});
    
    session.currentPlayer = player._id;
    session.currentBid = player.basePrice;
    session.currentBidder = null;
    session.status = 'Active';
    session.bidHistory = [];
    
    await session.save();
    await broadcastSessionUpdate(io);
    res.json({ message: 'Auction started', session });
  } catch (err) {
    console.error('Error starting auction:', err);
    res.status(500).json({ error: 'Server error starting auction' });
  }
};

exports.placeBid = async (req, res) => {
  const { teamId, amount } = req.body;
  const io = req.app.get('io');
  
  try {
    const session = await AuctionSession.findOne();
    if (!session || session.status !== 'Active' || !session.currentPlayer) {
      return res.status(400).json({ error: 'No active auction to bid on' });
    }
    
    // Validate bid amount
    if (amount <= session.currentBid && session.currentBidder) {
      return res.status(400).json({ error: 'Bid must be higher than current bid' });
    }
    
    // Ensure the first bid is at least the base price
    if (!session.currentBidder && amount < session.currentBid) {
      return res.status(400).json({ error: 'Minimum bid is the base price' });
    }
    
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    
    if (team.budget < amount) return res.status(400).json({ error: 'Insufficient budget to place bid' });
    
    session.currentBid = amount;
    session.currentBidder = teamId;
    session.bidHistory.push({ team: teamId, amount });
    
    await session.save();
    
    // Broadcast event
    io.emit('bid:placed', { team: { _id: team._id, name: team.name }, amount });
    await broadcastSessionUpdate(io);
    
    res.json({ message: 'Bid placed successfully', session });
  } catch (err) {
    console.error('Error placing bid:', err);
    res.status(500).json({ error: 'Server error placing bid' });
  }
};

exports.acceptBid = async (req, res) => {
  const io = req.app.get('io');
  
  try {
    const session = await AuctionSession.findOne();
    if (!session || session.status !== 'Active' || !session.currentPlayer) {
      return res.status(400).json({ error: 'No active auction to accept' });
    }
    
    if (!session.currentBidder) {
      return res.status(400).json({ error: 'Cannot accept, no bids have been placed' });
    }
    
    const player = await Player.findById(session.currentPlayer);
    const team = await Team.findById(session.currentBidder);
    
    // Process the sale
    player.status = 'Sold';
    player.soldTo = team._id;
    player.soldPrice = session.currentBid;
    await player.save();
    
    team.budget -= session.currentBid;
    team.totalSpent += session.currentBid;
    team.players.push(player._id);
    await team.save();
    
    // Reset session
    session.currentPlayer = null;
    session.currentBid = 0;
    session.currentBidder = null;
    session.status = 'Idle';
    session.bidHistory = [];
    await session.save();
    
    io.emit('player:sold', { player, team, price: player.soldPrice });
    await broadcastSessionUpdate(io);
    
    res.json({ message: 'Bid accepted, player sold', player, team });
  } catch (err) {
    console.error('Error accepting bid:', err);
    res.status(500).json({ error: 'Server error accepting bid' });
  }
};

exports.rejectBids = async (req, res) => {
  const io = req.app.get('io');
  
  try {
    const session = await AuctionSession.findOne();
    if (!session || session.status !== 'Active' || !session.currentPlayer) {
      return res.status(400).json({ error: 'No active auction to reject' });
    }
    
    const player = await Player.findById(session.currentPlayer);
    
    // Mark as unsold
    player.status = 'Unsold';
    await player.save();
    
    // Reset session
    session.currentPlayer = null;
    session.currentBid = 0;
    session.currentBidder = null;
    session.status = 'Idle';
    session.bidHistory = [];
    await session.save();
    
    io.emit('player:unsold', { player });
    await broadcastSessionUpdate(io);
    
    res.json({ message: 'Bids rejected, player unsold', player });
  } catch (err) {
    console.error('Error rejecting bids:', err);
    res.status(500).json({ error: 'Server error rejecting bids' });
  }
};

exports.resetAuction = async (req, res) => {
  const io = req.app.get('io');
  
  try {
    await Player.updateMany({}, { $set: { status: 'Available', soldTo: null, soldPrice: null } });
    const teams = await Team.find();
    for (const team of teams) {
      // Assuming initial budget was 15000, resetting
      team.budget = 15000;
      team.players = [];
      team.totalSpent = 0;
      await team.save();
    }
    await AuctionSession.deleteMany({});
    await AuctionSession.create({});
    
    await broadcastSessionUpdate(io);
    res.json({ message: 'Auction reset entirely' });
  } catch (err) {
    console.error('Error resetting auction:', err);
    res.status(500).json({ error: 'Server error resetting auction' });
  }
};
