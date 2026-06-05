'use client';
import { actions, selectors } from '@/redux';
import { Card, Column } from '@/types';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io, Socket } from 'socket.io-client';

// Module-level socket ID read by the axios interceptor to set X-Socket-Id header.
// Using a plain object so the reference is stable and importable without React.
export const socketMeta: { id: string | null } = { id: null };

export const useSocket = (boardId: string | null) => {
  const dispatch = useDispatch();
  const user = useSelector(selectors.selectUser);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!boardId || !user?.accessToken) return;

    const socket = io(process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:8080', {
      auth: { token: `Bearer ${user.accessToken}` },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socketMeta.id = socket.id ?? null;
      socket.emit('join-board', boardId);
    });

    // On reconnect the board state may be stale — trigger a re-fetch via a
    // custom event that the kanban page listens to.
    socket.on('reconnect', () => {
      socket.emit('join-board', boardId);
      window.dispatchEvent(new CustomEvent('socket:reconnected'));
    });

    socket.on('column:created', ({ column }: { column: Column }) => {
      dispatch(actions.addColumn(column));
    });

    socket.on('column:updated', ({ column }: { column: Column }) => {
      dispatch(actions.updateColumn(column));
    });

    socket.on('column:deleted', ({ columnId }: { columnId: string }) => {
      dispatch(actions.removeColumn(columnId));
    });

    socket.on('card:created', ({ card }: { card: Card }) => {
      dispatch(actions.addCard(card));
    });

    socket.on('card:updated', ({ card }: { card: Card }) => {
      dispatch(actions.updateCard(card));
    });

    socket.on('card:deleted', ({ cardId, columnId }: { cardId: string; columnId: string }) => {
      dispatch(actions.removeCard({ cardId, columnId }));
    });

    socket.on('card:moved', ({ card, fromColumnId, toColumnId }: any) => {
      dispatch(actions.moveCard({ card, fromColumnId, toColumnId }));
    });

    socket.on('disconnect', () => {
      socketMeta.id = null;
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    return () => {
      socket.emit('leave-board', boardId);
      socket.disconnect();
      socketRef.current = null;
      socketMeta.id = null;
    };
  }, [boardId, user?.accessToken, dispatch]);

  return socketRef;
};
