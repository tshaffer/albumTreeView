import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AlbumNode } from '../types/AlbumTree';

interface AlbumTreeState {
  root: AlbumNode[]; // Multiple top-level groups allowed
}

const initialState: AlbumTreeState = {
  root: [],
};

const albumTreeSlice = createSlice({
  name: 'albumTree',
  initialState,
  reducers: {
    setAlbumTree(state, action: PayloadAction<AlbumNode[]>) {
      state.root = action.payload;
    },
    // Add other reducers like addNode, removeNode, etc. as needed
  },
});

export const { setAlbumTree } = albumTreeSlice.actions;
export default albumTreeSlice.reducer;
