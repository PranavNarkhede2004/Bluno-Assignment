const request = require('supertest');
const express = require('express');
const playerRoutes = require('../routes/players');
const auctionRoutes = require('../routes/auction');
const Player = require('../models/Player');
const AuctionSession = require('../models/AuctionSession');

// Mock models
jest.mock('../models/Player');
jest.mock('../models/Team');
jest.mock('../models/AuctionSession');

const app = express();
app.use(express.json());
// Mock Socket.io
app.set('io', { emit: jest.fn() });

app.use('/api/players', playerRoutes);
app.use('/api/auction', auctionRoutes);

describe('Backend API Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/players', () => {
    it('returns 200 and an array of players', async () => {
      const mockPlayers = [{ name: 'Rohit Sharma', basePrice: 2000 }];
      // Setup mock
      Player.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockPlayers)
      });

      const res = await request(app).get('/api/players');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockPlayers);
    });
  });

  describe('POST /api/auction/start', () => {
    it('returns an active session when starting with valid playerId', async () => {
      const mockPlayer = { _id: 'player1', name: 'Player 1', basePrice: 1000, status: 'Available' };
      const mockSession = { save: jest.fn() };
      
      Player.findById.mockResolvedValue(mockPlayer);
      AuctionSession.findOne.mockResolvedValue(mockSession);
      AuctionSession.prototype.save = jest.fn();
      
      const res = await request(app)
        .post('/api/auction/start')
        .send({ playerId: 'player1' });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Auction started');
    });
  });
});
