/**
 * @fileoverview Auction Controller - Handles all auction-related business logic and API endpoints
 * @description This controller manages the complete auction workflow including:
 * - Session management and state tracking
 * - Player auction initiation and management
 * - Bid processing and validation
 * - Player sale/unsold decisions
 * - Auction reset functionality
 * 
 * Key Features:
 * - Real-time auction state management
 * - Bid validation and budget enforcement
 * - WebSocket event broadcasting
 * - Transaction integrity and error handling
 * - Complete auction lifecycle control
 * 
 * @author NPL Auction System
 * @version 1.0.0
 */

const AuctionSession = require('../models/AuctionSession');
const Player = require('../models/Player');
const Team = require('../models/Team');

/**
 * Broadcasts the current auction session state to all connected clients
 * This function ensures real-time synchronization across all frontend instances
 * 
 * @param {Object} io - Socket.IO instance for broadcasting
 * @returns {Promise<void>} Resolves when broadcast is complete
 * @throws {Error} If database query or broadcast fails
 */
const broadcastSessionUpdate = async (io) => {
  try {
    // Fetch complete session with populated references
    const session = await AuctionSession.findOne()
      .populate('currentPlayer')      // Include current player details
      .populate('currentBidder')      // Include current bidder team info
      .populate('bidHistory.team', 'name'); // Include team names in bid history
    
    // Broadcast updated session to all connected clients
    io.emit('auction:update', session);
  } catch (err) {
    console.error('Error broadcasting session update:', err);
    throw err;
  }
};

/**
 * Retrieves the current auction session state
 * Creates a new session if none exists
 * 
 * @route GET /api/auction/session
 * @access Public
 * @returns {Promise<void>} Resolves with session data or error response
 * @description
 * Returns the complete auction session including:
 * - Current player being auctioned (if any)
 * - Current bid amount and bidder
 * - Complete bid history with team names
 * - Auction status (Idle/Active/Hammer)
 */
exports.getSession = async (req, res) => {
  try {
    // Fetch session with populated references for complete data
    let session = await AuctionSession.findOne()
      .populate('currentPlayer')      // Include current player details
      .populate('currentBidder', 'name') // Include current bidder name only
      .populate('bidHistory.team', 'name'); // Include team names in bid history
    
    // Create new session if none exists
    if (!session) {
      session = await AuctionSession.create({});
    }
    
    res.json(session);
  } catch (err) {
    console.error('Error fetching session:', err);
    res.status(500).json({ error: 'Server error fetching session' });
  }
};

/**
 * Initiates an auction for a specific player
 * Sets up the auction session and starts the bidding process
 * 
 * @route POST /api/auction/start
 * @access Public
 * @param {Object} req.body - Request body
 * @param {string} req.body.playerId - ID of the player to auction
 * @returns {Promise<void>} Resolves with auction start confirmation or error
 * @description
 * Process flow:
 * 1. Validate player exists and is available
 * 2. Create or update auction session
 * 3. Set current player and initial bid (base price)
 * 4. Activate auction status
 * 5. Clear previous bid history
 * 6. Broadcast update to all clients
 * 
 * Business rules:
 * - Only available players can be auctioned
 * - Initial bid starts at player's base price
 * - Only one auction can be active at a time
 */
exports.startAuction = async (req, res) => {
  const { playerId } = req.body;
  const io = req.app.get('io');
  
  try {
    // Validate player exists and is available for auction
    const player = await Player.findById(playerId);
    if (!player) return res.status(404).json({ error: 'Player not found' });
    if (player.status !== 'Available') return res.status(400).json({ error: 'Player is not available for auction' });
    
    // Get or create auction session
    let session = await AuctionSession.findOne();
    if (!session) session = new AuctionSession({});
    
    // Configure auction session for new player
    session.currentPlayer = player._id;      // Set player being auctioned
    session.currentBid = player.basePrice;    // Start bid at base price
    session.currentBidder = null;              // No initial bidder
    session.status = 'Active';                // Activate auction
    session.bidHistory = [];                  // Clear previous bids
    
    await session.save();
    await broadcastSessionUpdate(io);          // Sync all clients
    res.json({ message: 'Auction started', session });
  } catch (err) {
    console.error('Error starting auction:', err);
    res.status(500).json({ error: 'Server error starting auction' });
  }
};

/**
 * Processes and validates a bid from a team
 * Updates auction session with new highest bid
 * 
 * @route POST /api/auction/bid
 * @access Public
 * @param {Object} req.body - Request body
 * @param {string} req.body.teamId - ID of the team placing the bid
 * @param {number} req.body.amount - Bid amount
 * @returns {Promise<void>} Resolves with bid confirmation or error
 * @description
 * Process flow:
 * 1. Validate active auction exists
 * 2. Validate bid amount (higher than current bid)
 * 3. Validate team exists and has sufficient budget
 * 4. Update session with new bid
 * 5. Record bid in history
 * 6. Broadcast bid event to all clients
 * 
 * Business rules:
 * - Bid must be higher than current bid (except first bid)
 * - First bid must be at least base price
 * - Team must have sufficient budget
 * - Only one auction can be active at a time
 */
exports.placeBid = async (req, res) => {
  const { teamId, amount } = req.body;
  const io = req.app.get('io');
  
  try {
    // Validate active auction exists
    const session = await AuctionSession.findOne();
    if (!session || session.status !== 'Active' || !session.currentPlayer) {
      return res.status(400).json({ error: 'No active auction to bid on' });
    }
    
    // Validate bid amount is higher than current bid (if bids exist)
    if (amount <= session.currentBid && session.currentBidder) {
      return res.status(400).json({ error: 'Bid must be higher than current bid' });
    }
    
    // Ensure first bid meets minimum base price requirement
    if (!session.currentBidder && amount < session.currentBid) {
      return res.status(400).json({ error: 'Minimum bid is the base price' });
    }
    
    // Validate team exists and has sufficient budget
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    
    if (team.budget < amount) return res.status(400).json({ error: 'Insufficient budget to place bid' });
    
    // Update auction session with new bid
    session.currentBid = amount;              // Set new highest bid
    session.currentBidder = teamId;             // Set new highest bidder
    session.bidHistory.push({ team: teamId, amount }); // Record in history
    
    await session.save();
    
    // Broadcast bid event to all connected clients
    io.emit('bid:placed', { team: { _id: team._id, name: team.name }, amount });
    await broadcastSessionUpdate(io);          // Sync all clients
    
    res.json({ message: 'Bid placed successfully', session });
  } catch (err) {
    console.error('Error placing bid:', err);
    res.status(500).json({ error: 'Server error placing bid' });
  }
};

/**
 * Accepts the current highest bid and finalizes the player sale
 * Updates player status, team budget, and resets auction session
 * 
 * @route POST /api/auction/accept
 * @access Public
 * @returns {Promise<void>} Resolves with sale confirmation or error
 * @description
 * Process flow:
 * 1. Validate active auction exists with bids
 * 2. Update player status to 'Sold'
 * 3. Record sale price and team
 * 4. Update team budget and add player to roster
 * 5. Reset auction session for next player
 * 6. Broadcast sale event to all clients
 * 
 * Business rules:
 * - Cannot accept if no bids have been placed
 * - Player cannot be auctioned again once sold
 * - Team budget is immediately reduced
 * - Player is added to team's roster
 */
exports.acceptBid = async (req, res) => {
  const io = req.app.get('io');
  
  try {
    // Validate active auction exists
    const session = await AuctionSession.findOne();
    if (!session || session.status !== 'Active' || !session.currentPlayer) {
      return res.status(400).json({ error: 'No active auction to accept' });
    }
    
    // Ensure bids have been placed before accepting
    if (!session.currentBidder) {
      return res.status(400).json({ error: 'Cannot accept, no bids have been placed' });
    }
    
    // Get player and team details
    const player = await Player.findById(session.currentPlayer);
    const team = await Team.findById(session.currentBidder);
    
    // Process the sale transaction
    player.status = 'Sold';                    // Mark player as sold
    player.soldTo = team._id;                   // Record purchasing team
    player.soldPrice = session.currentBid;      // Record final sale price
    await player.save();
    
    // Update team finances and roster
    team.budget -= session.currentBid;          // Deduct sale price from budget
    team.totalSpent += session.currentBid;      // Add to total spent
    team.players.push(player._id);              // Add player to roster
    await team.save();
    
    // Reset auction session for next player
    session.currentPlayer = null;               // Clear current player
    session.currentBid = 0;                     // Reset bid amount
    session.currentBidder = null;               // Clear current bidder
    session.status = 'Idle';                    // Set to idle state
    session.bidHistory = [];                    // Clear bid history
    await session.save();
    
    // Broadcast sale event to all clients
    io.emit('player:sold', { player, team, price: player.soldPrice });
    await broadcastSessionUpdate(io);          // Sync all clients
    
    res.json({ message: 'Bid accepted, player sold', player, team });
  } catch (err) {
    console.error('Error accepting bid:', err);
    res.status(500).json({ error: 'Server error accepting bid' });
  }
};

/**
 * Rejects all bids for the current player and marks them as unsold
 * Resets auction session without completing any sale
 * 
 * @route POST /api/auction/reject
 * @access Public
 * @returns {Promise<void>} Resolves with rejection confirmation or error
 * @description
 * Process flow:
 * 1. Validate active auction exists
 * 2. Mark player status as 'Unsold'
 * 3. Reset auction session for next player
 * 4. Broadcast unsold event to all clients
 * 
 * Business rules:
 * - Player cannot be auctioned again once marked unsold
 * - No team budgets or rosters are affected
 * - Player remains in available pool but with unsold status
 */
exports.rejectBids = async (req, res) => {
  const io = req.app.get('io');
  
  try {
    // Validate active auction exists
    const session = await AuctionSession.findOne();
    if (!session || session.status !== 'Active' || !session.currentPlayer) {
      return res.status(400).json({ error: 'No active auction to reject' });
    }
    
    // Get player details
    const player = await Player.findById(session.currentPlayer);
    
    // Mark player as unsold
    player.status = 'Unsold';
    await player.save();
    
    // Reset auction session for next player
    session.currentPlayer = null;               // Clear current player
    session.currentBid = 0;                     // Reset bid amount
    session.currentBidder = null;               // Clear current bidder
    session.status = 'Idle';                    // Set to idle state
    session.bidHistory = [];                    // Clear bid history
    await session.save();
    
    // Broadcast unsold event to all clients
    io.emit('player:unsold', { player });
    await broadcastSessionUpdate(io);          // Sync all clients
    
    res.json({ message: 'Bids rejected, player unsold', player });
  } catch (err) {
    console.error('Error rejecting bids:', err);
    res.status(500).json({ error: 'Server error rejecting bids' });
  }
};

/**
 * Completely resets the entire auction system
 * Restores all players to available status and resets all team budgets
 * 
 * @route POST /api/auction/reset
 * @access Public
 * @returns {Promise<void>} Resolves with reset confirmation or error
 * @description
 * Process flow:
 * 1. Reset all players to 'Available' status
 * 2. Clear all player sale information
 * 3. Reset all team budgets to initial values
 * 4. Clear all team rosters and spending
 * 5. Delete and recreate auction session
 * 6. Broadcast reset event to all clients
 * 
 * Business rules:
 * - All players become available for auction again
 * - Teams regain full initial budget
 * - All previous transactions are cleared
 * - Fresh auction session is created
 */
exports.resetAuction = async (req, res) => {
  const io = req.app.get('io');
  
  try {
    // Reset all players to available status
    await Player.updateMany({}, { $set: { status: 'Available', soldTo: null, soldPrice: null } });
    
    // Reset all teams to initial state
    const teams = await Team.find();
    for (const team of teams) {
      // Resetting based on logic
      team.budget = team.initialBudget || 100000; // Restore initial budget
      team.players = [];                              // Clear roster
      team.totalSpent = 0;                           // Reset spending
      await team.save();
    }
    
    // Reset auction session
    await AuctionSession.deleteMany({});           // Delete existing sessions
    await AuctionSession.create({});                // Create fresh session
    
    await broadcastSessionUpdate(io);              // Sync all clients
    res.json({ message: 'Auction reset entirely' });
  } catch (err) {
    console.error('Error resetting auction:', err);
    res.status(500).json({ error: 'Server error resetting auction' });
  }
};
