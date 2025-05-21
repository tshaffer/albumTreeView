import { configureStore } from '@reduxjs/toolkit';
import albumTreeReducer from './albumTreeSlice';

export const store = configureStore({
  reducer: {
    albumTree: albumTreeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
