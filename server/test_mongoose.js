const mongoose = require('mongoose');
const AuctionSession = require('./models/AuctionSession');
const Player = require('./models/Player');
const Team = require('./models/Team');
require('dotenv').config({ path: './.env' });
const MONGO_URI = (process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/npl_auction').trim().replace(/^['"]|['"]$/g, '');

const test = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const session = await AuctionSession.findOne()
      .populate('currentPlayer')
      .populate('currentBidder')
      .populate('bidHistory.team', 'name');
    console.log("Success:", session?._id);
  } catch(e) {
    console.error("Test Error:", e);
  }
  process.exit(0);
}
test();
