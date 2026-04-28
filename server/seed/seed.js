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
      { name: 'Virat Kohli', skillSet: 'Batting', basePrice: 18000 },
      { name: 'Rohit Sharma', skillSet: 'Batting', basePrice: 16800 },
      { name: 'Jasprit Bumrah', skillSet: 'Bowling', basePrice: 16800 },
      { name: 'MS Dhoni', skillSet: 'Batting', basePrice: 15000 },
      { name: 'Hardik Pandya', skillSet: 'All-Rounder', basePrice: 15000 },
      { name: 'Suryakumar Yadav', skillSet: 'Batting', basePrice: 12000 },
      { name: 'Ravindra Jadeja', skillSet: 'All-Rounder', basePrice: 12000 },
      { name: 'Rashid Khan', skillSet: 'Bowling', basePrice: 10800 },
      { name: 'KL Rahul', skillSet: 'Batting', basePrice: 10800 },
      { name: 'David Warner', skillSet: 'Batting', basePrice: 9600 },
      { name: 'Glenn Maxwell', skillSet: 'All-Rounder', basePrice: 8400 },
      { name: 'Mohammed Shami', skillSet: 'Bowling', basePrice: 7200 },
      { name: 'Trent Boult', skillSet: 'Bowling', basePrice: 7200 },
      { name: 'Shreyas Iyer', skillSet: 'Batting', basePrice: 6000 },
      { name: 'Rishabh Pant', skillSet: 'Batting', basePrice: 6000 },
      { name: 'Mohammed Siraj', skillSet: 'Bowling', basePrice: 4800 },
      { name: 'Yuzvendra Chahal', skillSet: 'Bowling', basePrice: 4200 },
      { name: 'Kuldeep Yadav', skillSet: 'Bowling', basePrice: 3600 },
      { name: 'Axar Patel', skillSet: 'All-Rounder', basePrice: 3600 },
      { name: 'Washington Sundar', skillSet: 'All-Rounder', basePrice: 3000 },
    ];

    const teams = [
      { shortId: 1, name: 'Mumbai Mavericks', managerName: 'Aditya Sharma', budget: 100000, initialBudget: 100000 },
      { shortId: 2, name: 'Delhi Destroyers', managerName: 'Priya Kapoor', budget: 100000, initialBudget: 100000 },
      { shortId: 3, name: 'Bengaluru Blasters', managerName: 'Rohan Mehta', budget: 100000, initialBudget: 100000 },
      { shortId: 4, name: 'Chennai Champions', managerName: 'Sneha Iyer', budget: 100000, initialBudget: 100000 },
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
