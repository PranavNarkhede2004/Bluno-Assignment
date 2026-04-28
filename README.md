# IIIT Nagpur Premier League (NPL) Auction Platform

A full-stack, real-time auction platform to facilitate the NPL bidding process.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS v4, Socket.IO Client, Axios, React Router Dom
- **Backend**: Node.js, Express, Socket.IO, Mongoose
- **Database**: MongoDB

## Features
- **Auctioneer Dashboard**: Control the flow of the entire auction (start bidding, accept/reject).
- **Franchise Dashboard**: Place real-time interactive bids against other teams. Budget logic limits ensure bidding rules are followed.
- **Player & Franchise Overview Pages**: Data visualization panels for players data and active franchise performance.
- **WebSocket Synchronization**: Instantaneous bid matching and real-time state broadcast everywhere without needing to refresh anywhere.

## Setup Instructions

### Prerequisites
1. Node.js installed (v18+)
2. Local MongoDB server running at `127.0.0.1:27017`

### Backend Setup
1. Open a terminal and run:
   ```bash
   cd server
   npm install
   ```
2. Your local MongoDB should be running.
3. **Seed the Database** with NPL data:
   ```bash
   node seed/seed.js
   ```
4. Start the server (runs on port 5000):
   ```bash
   npm run dev
   ```

### Frontend Setup
1. In a new terminal, navigate to the client folder:
   ```bash
   cd client
   npm install
   ```
2. Start the Vite React app:
   ```bash
   npm run dev
   ```
   The app will run at `http://localhost:5173`.

## Auction Flow Summary
1. **Initiate**: The Auctioneer goes to `/auctioneer`, sees the next available player, and clicks "Bring Next Player".
2. **Global Sync**: Socket.IO broadcasts that an active auction has started for that player.
3. **Bidding war**: Team Managers (going to `/team/1`, `/team/2`, etc.) will see the player automatically appear on their screen. They can press "Place Bid" as long as they hold sufficient funds.
4. **Resolution**: The Auctioneer watches the dashboard. Bids instantly show up as the "Current Highest Bid". The Auctioneer can press "Sold" to definitively close the transaction (funds subtracted & player added to roster instantly) or "Pass/Unsold".
5. Loop repeats.

## License
MIT
