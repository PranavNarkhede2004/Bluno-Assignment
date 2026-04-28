/**
 * @fileoverview Auction Context - Manages global auction state and WebSocket connections
 * @description This context provides centralized state management for the entire auction system.
 * It handles WebSocket connections, real-time updates, and global auction data synchronization.
 * 
 * Key Features:
 * - Real-time WebSocket connection management
 * - Global auction state synchronization
 * - Event-driven updates and notifications
 * - Toast notification system integration
 * - Connection status monitoring
 * 
 * @author NPL Auction System
 * @version 1.0.0
 */

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import toast from 'react-hot-toast';

/**
 * WebSocket server URL for real-time communication
 * Falls back to localhost:5000 for development
 */
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Custom hook to access auction context
 * Provides access to global auction state and methods
 * 
 * @returns {Object} Auction context value containing session state and utilities
 */
export const useAuction = () => useContext(AuctionContext);

/**
 * Auction Context Provider Component
 * Manages WebSocket connections and global auction state
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap
 * @returns {JSX.Element} Context provider with auction state management
 */
export const AuctionProvider = ({ children }) => {
  /**
   * WebSocket connection reference
   * Maintains persistent socket connection across component re-renders
   * @type {React.RefObject<Socket>}
   */
  const socketRef = useRef(null);
  if (!socketRef.current) {
    socketRef.current = io(SOCKET_URL);
  }
  const socket = socketRef.current;

  /**
   * Current auction session state
   * Contains complete auction information including current player, bids, etc.
   * @type {Object|null}
   */
  const [session, setSession] = useState(null);
  
  /**
   * WebSocket connection status
   * Tracks whether real-time connection is active
   * @type {boolean}
   */
  const [isConnected, setIsConnected] = useState(socket.connected);
  
  /**
   * Loading state for initial data fetch
   * Prevents UI rendering before data is loaded
   * @type {boolean}
   */
  const [loading, setLoading] = useState(true);
  
  /**
   * Trigger for component updates when player events occur
   * Forces re-render of dependent components
   * @type {number}
   */
  const [lastPlayerEvent, setLastPlayerEvent] = useState(0);

  /**
   * Fetches initial auction session data from server
   * Establishes baseline state for the auction system
   * 
   * @async
   * @returns {Promise<void>}
   * @throws {Error} If session fetch fails
   */
  const fetchSession = async () => {
    try {
      const res = await axios.get(`${SOCKET_URL}/api/auction/session`);
      setSession(res.data);
    } catch (err) {
      console.error('Error fetching session:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sets up WebSocket event listeners and initial data fetch
   * Manages real-time updates and connection lifecycle
   */
  useEffect(() => {
    // Initialize session data
    fetchSession();

    // WebSocket connection event handlers
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    
    // Auction state updates
    socket.on('auction:update', (updatedSession) => {
      setSession(updatedSession);
    });

    // Bid placement notifications
    socket.on('bid:placed', ({ team, amount }) => {
      toast(`Bid placed by ${team.name} for ₹${amount}`, { icon: '💰' });
    });

    // Player sale notifications
    socket.on('player:sold', ({ player, team, price }) => {
      toast.success(`${player.name} sold to ${team.name} for ₹${price}!`);
      setLastPlayerEvent(prev => prev + 1);  // Trigger component updates
    });

    // Player unsold notifications
    socket.on('player:unsold', ({ player }) => {
      toast.error(`${player.name} went unsold.`);
      setLastPlayerEvent(prev => prev + 1);  // Trigger component updates
    });

    // Cleanup event listeners on component unmount
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('auction:update');
      socket.off('bid:placed');
      socket.off('player:sold');
      socket.off('player:unsold');
    };
  }, []);

  /**
   * Context value object
   * Provides auction state and utilities to consumer components
   * 
   * @type {Object}
   * @property {Object|null} session - Current auction session data
   * @property {boolean} isConnected - WebSocket connection status
   * @property {boolean} loading - Initial loading state
   * @property {number} lastPlayerEvent - Event trigger counter
   * @property {string} apiUrl - WebSocket server URL
   */
  const value = {
    session,
    isConnected,
    loading,
    lastPlayerEvent,
    apiUrl: SOCKET_URL
  };

  return (
    <AuctionContext.Provider value={value}>
      {children}
    </AuctionContext.Provider>
  );
};

/**
 * React context for auction state management
 * Created and exported for use with useContext hook
 */
const AuctionContext = createContext();
