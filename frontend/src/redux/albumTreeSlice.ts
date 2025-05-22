// src/redux/albumTreeSlice.ts
import { v4 as uuidv4 } from 'uuid';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AlbumNode } from '../types/AlbumTree';

interface AlbumTreeState {
  nodes: AlbumNode[];
}

interface AddGroupPayload {
  name: string;
  parentId?: string;
}

interface AddAlbumPayload {
  name: string;
  parentId?: string;
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
    addGroup(state, action: PayloadAction<AddGroupPayload>) {
      const newGroup: AlbumNode = {
        id: uuidv4(),
        name: action.payload.name,
        type: 'group',
        children: [],
      };

      const addToParent = (nodes: AlbumNode[]): boolean => {
        for (const node of nodes) {
          if (node.type === 'group' && node.id === action.payload.parentId) {
            node.children.push(newGroup);
            return true;
          } else if (node.type === 'group') {
            if (addToParent(node.children)) return true;
          }
        }
        return false;
      };

      if (!action.payload.parentId || !addToParent(state.nodes)) {
        state.nodes.push(newGroup); // top-level fallback
      }
    },
    addAlbum(state, action: PayloadAction<AddAlbumPayload>) {
      const newAlbum: AlbumNode = {
        id: uuidv4(),
        name: action.payload.name,
        type: 'album',
        mediaCount: 0,
      };

      const addToParent = (nodes: AlbumNode[]): boolean => {
        for (const node of nodes) {
          if (node.type === 'group' && node.id === action.payload.parentId) {
            node.children.push(newAlbum);
            return true;
          } else if (node.type === 'group') {
            if (addToParent(node.children)) return true;
          }
        }
        return false;
      };

      if (!action.payload.parentId || !addToParent(state.nodes)) {
        state.nodes.push(newAlbum); // add to root if no parent found
      }
    },
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

export const { addGroup, addAlbum, markAlbumImported } = albumTreeSlice.actions;
export default albumTreeSlice.reducer;
