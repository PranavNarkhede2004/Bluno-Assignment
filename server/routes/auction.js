const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');

/**
 * @route GET /api/auction/session
 */
router.get('/session', auctionController.getSession);

/**
 * @route POST /api/auction/start
 */
router.post('/start', auctionController.startAuction);

/**
 * @route POST /api/auction/bid
 */
router.post('/bid', auctionController.placeBid);

/**
 * @route POST /api/auction/accept
 */
router.post('/accept', auctionController.acceptBid);

/**
 * @route POST /api/auction/reject
 */
router.post('/reject', auctionController.rejectBids);

/**
 * @route POST /api/auction/reset
 */
router.post('/reset', auctionController.resetAuction);

module.exports = router;
