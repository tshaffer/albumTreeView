// src/redux/albumTreeSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AlbumNode } from '../types/AlbumTree';

interface AlbumTreeState {
  nodes: AlbumNode[];
}

const initialState: AlbumTreeState = {
  nodes: [
    // TEMP: example static tree to test
    {
      id: '1',
      name: '2024',
      type: 'group',
      children: [
        { id: '2', name: 'January', type: 'album', mediaCount: 20 },
        { id: '3', name: 'February', type: 'album', mediaCount: 12 },
      ],
    },
    {
      id: '4',
      name: 'Trips',
      type: 'group',
      children: [
        { id: '5', name: 'Hawaii', type: 'album', mediaCount: 42 },
      ],
    },
  ],
};

const albumTreeSlice = createSlice({
  name: 'albumTree',
  initialState,
  reducers: {
    markAlbumImported(state, action: PayloadAction<string>) {
      const markRecursive = (nodes: AlbumNode[]): void => {
        for (const node of nodes) {
          if (node.id === action.payload && node.type === 'album') {
            (node as any).imported = true; // Temporary flag
          } else if (node.type === 'group') {
            markRecursive(node.children);
          }
        }
      };
      markRecursive(state.nodes);
    },
    // Future: renameAlbum, deleteNode, etc.
  },
});

export const { markAlbumImported } = albumTreeSlice.actions;
export default albumTreeSlice.reducer;
