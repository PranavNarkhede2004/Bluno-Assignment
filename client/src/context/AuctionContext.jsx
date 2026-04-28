import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuctionContext = createContext();

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useAuction = () => useContext(AuctionContext);

export const AuctionProvider = ({ children }) => {
  const socketRef = useRef(null);
  if (!socketRef.current) {
    socketRef.current = io(SOCKET_URL);
  }
  const socket = socketRef.current;

  const [session, setSession] = useState(null);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [loading, setLoading] = useState(true);
  const [lastPlayerEvent, setLastPlayerEvent] = useState(0);

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
      toast(`Bid placed by ${team.name} for ₹${amount}`, { icon: '💰' });
    });

    socket.on('player:sold', ({ player, team, price }) => {
      toast.success(`${player.name} sold to ${team.name} for ₹${price}!`);
      setLastPlayerEvent(prev => prev + 1);
    });

    socket.on('player:unsold', ({ player }) => {
      toast.error(`${player.name} went unsold.`);
      setLastPlayerEvent(prev => prev + 1);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('auction:update');
      socket.off('bid:placed');
      socket.off('player:sold');
      socket.off('player:unsold');
    };
  }, []);

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
