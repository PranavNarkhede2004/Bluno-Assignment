const mongoose = require('mongoose');
const Player = require('../models/Player');
const Team = require('../models/Team');
const AuctionSession = require('../models/AuctionSession');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // Safely load .env from server root

const MONGO_URI = (process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/npl_auction').trim().replace(/^['"]|['"]$/g, '');

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected for Seeding');

    // Clear existing data
    await Player.deleteMany();
    await Team.deleteMany();
    await AuctionSession.deleteMany();

    const players = [
      { name: 'Rohit Sharma', skillSet: 'Batting', basePrice: 2500 },
      { name: 'Virat Kohli', skillSet: 'Batting', basePrice: 2800 },
      { name: 'MS Dhoni', skillSet: 'Batting', basePrice: 3000 },
      { name: 'Shubman Gill', skillSet: 'Batting', basePrice: 1500 },
      { name: 'KL Rahul', skillSet: 'Batting', basePrice: 1800 },
      { name: 'Suryakumar Yadav', skillSet: 'Batting', basePrice: 2200 },
      { name: 'Jasprit Bumrah', skillSet: 'Bowling', basePrice: 2600 },
      { name: 'Mohammed Siraj', skillSet: 'Bowling', basePrice: 1600 },
      { name: 'Mohammed Shami', skillSet: 'Bowling', basePrice: 1800 },
      { name: 'Kuldeep Yadav', skillSet: 'Bowling', basePrice: 1400 },
      { name: 'Yuzvendra Chahal', skillSet: 'Bowling', basePrice: 1500 },
      { name: 'Ravi Bishnoi', skillSet: 'Bowling', basePrice: 1000 },
      { name: 'Hardik Pandya', skillSet: 'All-Rounder', basePrice: 2500 },
      { name: 'Ravindra Jadeja', skillSet: 'All-Rounder', basePrice: 2400 },
      { name: 'Axar Patel', skillSet: 'All-Rounder', basePrice: 1700 },
      { name: 'Washington Sundar', skillSet: 'All-Rounder', basePrice: 1200 },
      { name: 'Rashid Khan', skillSet: 'Bowling', basePrice: 2700 },
      { name: 'Glenn Maxwell', skillSet: 'All-Rounder', basePrice: 2100 },
      { name: 'David Warner', skillSet: 'Batting', basePrice: 2000 },
      { name: 'Trent Boult', skillSet: 'Bowling', basePrice: 1900 },
    ];

    const teams = [
      { shortId: 1, name: 'Mumbai Mavericks', managerName: 'Aditya Sharma', budget: 15000, initialBudget: 15000 },
      { shortId: 2, name: 'Delhi Destroyers', managerName: 'Priya Kapoor', budget: 15000, initialBudget: 15000 },
      { shortId: 3, name: 'Bengaluru Blasters', managerName: 'Rohan Mehta', budget: 15000, initialBudget: 15000 },
      { shortId: 4, name: 'Chennai Champions', managerName: 'Sneha Iyer', budget: 15000, initialBudget: 15000 },
    ];

    await Player.insertMany(players);
    console.log('Players seeded');

    await Team.insertMany(teams);
    console.log('Teams seeded');

    await AuctionSession.create({});
    console.log('Auction session initialized');

    console.log('Seeding successful');
    process.exit();
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedData();
