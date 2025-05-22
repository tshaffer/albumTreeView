// src/redux/importSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ImportState {
  importingAlbumId: string | null;
  completedAlbumImports: string[];
}

const initialState: ImportState = {
  importingAlbumId: null,
  completedAlbumImports: [],
};

const importSlice = createSlice({
  name: 'import',
  initialState,
  reducers: {
    startImport(state, action: PayloadAction<string>) {
      state.importingAlbumId = action.payload;
    },
    finishImport(state, action: PayloadAction<string>) {
      state.importingAlbumId = null;
      state.completedAlbumImports.push(action.payload);
    },
  },
});

export const { startImport, finishImport } = importSlice.actions;
export default importSlice.reducer;
