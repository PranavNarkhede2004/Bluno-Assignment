import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const AuctionContext = createContext();

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const socket = io(SOCKET_URL);

export const useAuction = () => useContext(AuctionContext);

export const AuctionProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [loading, setLoading] = useState(true);

  // Fetch initial session
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

  useEffect(() => {
    fetchSession();

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    
    socket.on('auction:update', (updatedSession) => {
      setSession(updatedSession);
    });

    socket.on('bid:placed', ({ team, amount }) => {
      // We could use toast notifications here
      console.log(`Bid placed by ${team.name} for ${amount}`);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('auction:update');
      socket.off('bid:placed');
    };
  }, []);

  const value = {
    session,
    isConnected,
    loading,
    socket,
    apiUrl: SOCKET_URL
  };

  return (
    <AuctionContext.Provider value={value}>
      {children}
    </AuctionContext.Provider>
  );
};
