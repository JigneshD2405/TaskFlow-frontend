import { configureStore } from '@reduxjs/toolkit';
import { PersistConfig, persistReducer, persistStore } from 'redux-persist';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';
import rootReducer from './rootReducer';

const createNoopStorage = () => ({
  getItem: (): Promise<string | null> => Promise.resolve(null),
  setItem: (_key: string, value: string): Promise<string> => Promise.resolve(value),
  removeItem: (): Promise<void> => Promise.resolve(),
});

const storage =
  typeof window !== 'undefined' ? createWebStorage('local') : createNoopStorage();

const persistConfig: PersistConfig<ReturnType<typeof rootReducer>> = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['auth'] as (keyof ReturnType<typeof rootReducer>)[],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = Omit<ReturnType<typeof store.getState>, '_persist'>;
export type AppDispatch = typeof store.dispatch;

export const persistor = persistStore(store);
