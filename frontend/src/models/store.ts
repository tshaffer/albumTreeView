import { configureStore } from '@reduxjs/toolkit';
import albumTreeReducer from './albumTreeSlice';
import importSliceReducer from './importSlice';

export const store = configureStore({
  reducer: {
    albumTree: albumTreeReducer,
    import: importSliceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
