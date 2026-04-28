# NPL Auction Platform - Code Documentation

## Overview

This document provides comprehensive documentation for the IIIT Nagpur Premier League (NPL) Auction Platform codebase. The application is a full-stack, real-time auction system built with modern web technologies.

## Architecture

### Technology Stack
- **Frontend**: React (Vite), Tailwind CSS v4, Socket.IO Client, Axios, React Router Dom
- **Backend**: Node.js, Express, Socket.IO, Mongoose
- **Database**: MongoDB Atlas
- **Real-time Communication**: WebSocket (Socket.IO)

### System Architecture
```
┌─────────────────┐    WebSocket    ┌─────────────────┐    HTTP/REST     ┌─────────────────┐
│   Frontend      │ ◄─────────────► │   Backend       │ ◄──────────────► │  MongoDB Atlas  │
│   (React App)   │                 │   (Express)     │                 │   (Database)    │
└─────────────────┘                 └─────────────────┘                 └─────────────────┘
```

## Backend Documentation

### Models

#### Player Model (`server/models/Player.js`)
Represents individual cricket players available for auction.

**Schema Fields:**
- `name`: Player's full name (String, required)
- `skillSet`: Primary skill - Batting/Bowling/All-Rounder (String, enum, required)
- `basePrice`: Starting auction price (Number, required)
- `status`: Auction status - Available/Sold/Unsold (String, enum, default: 'Available')
- `soldTo`: Reference to purchasing team (ObjectId, ref: 'Team', default: null)
- `soldPrice`: Final sale price (Number, default: null)

**Key Features:**
- Player categorization by skill type
- Base price tracking for auction bidding
- Status tracking through auction lifecycle
- Sale history when player is sold

#### Team Model (`server/models/Team.js`)
Represents franchise teams participating in the auction.

**Schema Fields:**
- `shortId`: Unique numeric identifier (Number, required, unique)
- `name`: Full team name (String, required, unique)
- `managerName`: Team manager's name (String, required)
- `budget`: Current available budget (Number, default: 100000)
- `initialBudget`: Original budget allocation (Number, default: 100000)
- `players`: Array of purchased player references (ObjectId[], ref: 'Player')
- `totalSpent`: Total amount spent on players (Number, default: 0)

**Key Features:**
- Team identification with unique short ID and name
- Budget management with initial and current budget tracking
- Player roster management
- Financial transaction history

#### AuctionSession Model (`server/models/AuctionSession.js`)
Manages the current state of live auction sessions.

**Schema Fields:**
- `currentPlayer`: Player currently being auctioned (ObjectId, ref: 'Player', default: null)
- `currentBid`: Current highest bid amount (Number, default: 0)
- `currentBidder`: Team with highest bid (ObjectId, ref: 'Team', default: null)
- `status`: Auction phase - Idle/Active/Hammer (String, enum, default: 'Idle')
- `bidHistory`: Array of bid records with timestamps (Object[])

**Key Features:**
- Real-time auction state management
- Current player and bid tracking
- Bid history with timestamps
- Auction status lifecycle management

### Controllers

#### Auction Controller (`server/controllers/auctionController.js`)
Handles all auction-related business logic and API endpoints.

**Functions:**
- `getSession()`: Retrieves current auction session state
- `startAuction()`: Initiates auction for a specific player
- `placeBid()`: Processes and validates team bids
- `acceptBid()`: Finalizes player sale and updates team budget
- `rejectBids()`: Marks player as unsold and resets session
- `resetAuction()`: Completely resets entire auction system

**Business Logic:**
- Bid validation and budget enforcement
- Transaction integrity and error handling
- Real-time WebSocket event broadcasting
- Complete auction lifecycle control

### Routes

#### Auction Routes (`server/routes/auction.js`)
API endpoints for auction operations.

**Endpoints:**
- `GET /api/auction/session`: Get current auction session
- `POST /api/auction/start`: Start auction for player
- `POST /api/auction/bid`: Place bid
- `POST /api/auction/accept`: Accept current bid
- `POST /api/auction/reject`: Reject all bids
- `POST /api/auction/reset`: Reset entire auction

#### Players Routes (`server/routes/players.js`)
API endpoints for player management.

**Endpoints:**
- `GET /api/players`: Get all players (optional status filter)
- `GET /api/players/:id`: Get specific player by ID

#### Teams Routes (`server/routes/teams.js`)
API endpoints for team management.

**Endpoints:**
- `GET /api/teams`: Get all teams with rosters
- `GET /api/teams/:id`: Get team by ID or shortId

### Socket.IO Handler (`server/socket/index.js`)
Manages real-time WebSocket connections and events.

**Events:**
- `connection`: New client connection
- `disconnect`: Client disconnection
- `auction:update`: Full session state changes
- `bid:placed`: New bid notifications
- `player:sold`: Player sale confirmations
- `player:unsold`: Player rejection notifications

## Frontend Documentation

### Context

#### Auction Context (`client/src/context/AuctionContext.jsx`)
Provides centralized state management for the entire auction system.

**Features:**
- Real-time WebSocket connection management
- Global auction state synchronization
- Event-driven updates and notifications
- Toast notification system integration
- Connection status monitoring

**State Variables:**
- `session`: Current auction session data
- `isConnected`: WebSocket connection status
- `loading`: Initial data loading state
- `lastPlayerEvent`: Event trigger counter

**Custom Hook:**
- `useAuction()`: Access auction context in components

### Components Structure

```
src/
├── components/          # Reusable UI components
├── context/            # React context providers
├── pages/              # Page-level components
│   ├── AuctioneerDashboard.jsx
│   ├── TeamDashboard.jsx
│   ├── PlayersPage.jsx
│   └── TeamsPage.jsx
└── App.jsx             # Main application component
```

## API Documentation

### Authentication
Currently, the system uses team-based identification without authentication.

### Response Format
All API responses follow consistent format:
```json
{
  "data": {}, // Response data
  "error": "string" // Error message if applicable
}
```

### Error Handling
- 400: Bad Request (validation errors)
- 404: Not Found (resource doesn't exist)
- 500: Internal Server Error (server issues)

## Real-time Communication

### WebSocket Events

**Client → Server:**
- Connection management handled automatically

**Server → Client:**
- `auction:update`: Complete session state changes
- `bid:placed`: New bid notifications with team and amount
- `player:sold`: Player sale confirmation with details
- `player:unsold`: Player rejection notifications

### Connection Management
- Automatic reconnection on connection loss
- Connection status monitoring
- Event cleanup on component unmount

## Database Schema

### Relationships
```
Team (1) ←→ (Many) Players
Team (1) ←→ (Many) BidHistory
Player (1) ←→ (1) AuctionSession (current player)
```

### Data Flow
1. Auction session references current player
2. Bids reference teams and amounts
3. Players reference purchasing teams when sold
4. Teams maintain player rosters and budget tracking

## Development Guidelines

### Code Documentation Standards
- All files include comprehensive JSDoc comments
- Functions document parameters, return values, and examples
- Complex logic includes inline comments explaining flow
- Business rules and validation logic clearly documented

### Error Handling
- Consistent error response format
- Proper HTTP status codes
- Client-side error handling with user feedback
- Server-side logging for debugging

### Real-time Updates
- All state changes broadcast via WebSocket
- Client components update automatically
- Toast notifications for user feedback
- Connection status monitoring

## Testing

### Backend Testing
- Unit tests for controller functions
- Integration tests for API endpoints
- Database operation testing
- WebSocket event testing

### Frontend Testing
- Component rendering tests
- User interaction testing
- WebSocket connection testing
- State management testing

## Deployment

### Environment Variables
- `MONGO_URI`: MongoDB Atlas connection string
- `PORT`: Server port (default: 5000)
- `CLIENT_URL`: Frontend URL for CORS

### Production Considerations
- MongoDB Atlas for production database
- Environment-specific configuration
- Error logging and monitoring
- Performance optimization

## Security Considerations

### Current Implementation
- Input validation on all endpoints
- CORS configuration for frontend access
- MongoDB connection security
- No sensitive data in client-side code

### Future Enhancements
- User authentication system
- Role-based access control
- Rate limiting for API endpoints
- Input sanitization and validation

## Performance Optimization

### Database Optimization
- Proper indexing on frequently queried fields
- Population strategies for related data
- Connection pooling for MongoDB

### Frontend Optimization
- Component memoization for performance
- Efficient state management
- Optimized WebSocket event handling
- Code splitting for large applications

## Contributing Guidelines

### Code Standards
- Follow existing documentation patterns
- Use meaningful variable and function names
- Add comprehensive comments for complex logic
- Maintain consistent code formatting

### Testing Requirements
- Write tests for new features
- Ensure existing tests pass
- Test both frontend and backend components
- Document any breaking changes

## Version Control

### Branch Strategy
- `main`: Production-ready code
- `develop`: Feature development
- `feature/*`: Specific feature branches
- `hotfix/*`: Critical bug fixes

### Commit Messages
- Use descriptive commit messages
- Reference relevant issues or tickets
- Follow conventional commit format
- Include documentation updates

---

**Author:** NPL Auction System Team  
**Version:** 1.0.0  
**Last Updated:** 2026-04-28
