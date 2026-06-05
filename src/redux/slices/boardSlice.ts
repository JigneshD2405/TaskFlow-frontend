import { Board, Card, Column } from '@/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BoardState {
  activeBoard: (Board & { columns: (Column & { cards: Card[] })[] }) | null;
  activeBoardId: string | null;
}

const initialState: BoardState = {
  activeBoard: null,
  activeBoardId: null,
};

const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    setActiveBoard: (state, { payload }) => {
      state.activeBoard = payload;
      state.activeBoardId = payload?._id || null;
    },
    setActiveBoardId: (state, { payload }: PayloadAction<string>) => {
      state.activeBoardId = payload;
    },
    addColumn: (state, { payload }: PayloadAction<Column>) => {
      if (state.activeBoard) {
        state.activeBoard.columns.push({ ...payload, cards: [] });
      }
    },
    updateColumn: (state, { payload }: PayloadAction<Column>) => {
      if (state.activeBoard) {
        const idx = state.activeBoard.columns.findIndex((c) => c._id === payload._id);
        if (idx !== -1) {
          state.activeBoard.columns[idx] = { ...state.activeBoard.columns[idx], ...payload };
        }
      }
    },
    removeColumn: (state, { payload }: PayloadAction<string>) => {
      if (state.activeBoard) {
        state.activeBoard.columns = state.activeBoard.columns.filter((c) => c._id !== payload);
      }
    },
    addCard: (state, { payload }: PayloadAction<Card>) => {
      if (state.activeBoard) {
        const col = state.activeBoard.columns.find((c) => c._id === payload.columnId);
        if (col) col.cards.push(payload);
      }
    },
    updateCard: (state, { payload }: PayloadAction<Card>) => {
      if (state.activeBoard) {
        for (const col of state.activeBoard.columns) {
          const idx = col.cards.findIndex((c) => c._id === payload._id);
          if (idx !== -1) {
            col.cards[idx] = payload;
            break;
          }
        }
      }
    },
    removeCard: (state, { payload }: PayloadAction<{ cardId: string; columnId: string }>) => {
      if (state.activeBoard) {
        const col = state.activeBoard.columns.find((c) => c._id === payload.columnId);
        if (col) col.cards = col.cards.filter((c) => c._id !== payload.cardId);
      }
    },
    moveCard: (
      state,
      {
        payload,
      }: PayloadAction<{ card: Card; fromColumnId: string; toColumnId: string }>
    ) => {
      if (!state.activeBoard) return;
      const fromCol = state.activeBoard.columns.find((c) => c._id === payload.fromColumnId);
      if (fromCol) fromCol.cards = fromCol.cards.filter((c) => c._id !== payload.card._id);
      const toCol = state.activeBoard.columns.find((c) => c._id === payload.toColumnId);
      if (toCol) {
        toCol.cards = toCol.cards.filter((c) => c._id !== payload.card._id);
        toCol.cards.splice(payload.card.order, 0, payload.card);
      }
    },
    clearBoard: () => initialState,
  },
  selectors: {
    selectActiveBoard: (state) => state.activeBoard,
    selectActiveBoardId: (state) => state.activeBoardId,
  },
});

export default boardSlice;
