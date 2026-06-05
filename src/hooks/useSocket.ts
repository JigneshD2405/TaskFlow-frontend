"use client";
import { ROUTES } from "@/constants/routes";
import { actions, selectors } from "@/redux";
import { Card, Column } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";

export const socketMeta: { id: string | null } = { id: null };

export const useSocket = (boardId: string | null) => {
  const dispatch = useDispatch();
  const user = useSelector(selectors.selectUser);
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!boardId || !user?.accessToken) return;
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:8080";
    const socketUrl = (() => {
      try {
        return new URL(backendUrl).origin;
      } catch {
        return backendUrl;
      }
    })();

    const socket = io(socketUrl, {
      auth: { token: `Bearer ${user.accessToken}` },
      transports: ["websocket"],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socketMeta.id = socket.id ?? null;
      socket.emit("join-board", boardId);
    });

    socket.io.on("reconnect", () => {
      window.dispatchEvent(new CustomEvent("socket:reconnected"));
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    socket.on("column:created", ({ column }: { column: Column }) => {
      dispatch(actions.addColumn(column));
    });

    socket.on("column:updated", ({ column }: { column: Column }) => {
      dispatch(actions.updateColumn(column));
    });

    socket.on("column:deleted", ({ columnId }: { columnId: string }) => {
      dispatch(actions.removeColumn(columnId));
    });

    socket.on("card:created", ({ card }: { card: Card }) => {
      dispatch(actions.addCard(card));
    });

    socket.on("card:updated", ({ card }: { card: Card }) => {
      dispatch(actions.updateCard(card));
    });

    socket.on("card:deleted", ({ cardId, columnId }: { cardId: string; columnId: string }) => {
      dispatch(actions.removeCard({ cardId, columnId }));
    });

    socket.on("card:moved", ({ card, fromColumnId, toColumnId }: any) => {
      dispatch(actions.moveCard({ card, fromColumnId, toColumnId }));
    });

    socket.on("board:deleted", () => {
      dispatch(actions.clearBoard());
      router.replace(ROUTES.board.list);
    });

    socket.on("disconnect", () => {
      socketMeta.id = null;
    });

    const connectTimer = setTimeout(() => socket.connect(), 0);

    return () => {
      clearTimeout(connectTimer);
      socket.emit("leave-board", boardId);
      socket.disconnect();
      socketRef.current = null;
      socketMeta.id = null;
    };
  }, [boardId, user?.accessToken, dispatch, router]);

  return socketRef;
};
