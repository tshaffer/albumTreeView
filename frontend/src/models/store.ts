import { configureStore } from '@reduxjs/toolkit';
import albumTreeSliceReducer from './slices/albumTreeSlice';

export const store = configureStore({
  reducer: {
    albumTreeState: albumTreeSliceReducer,
  },
});

export default store;