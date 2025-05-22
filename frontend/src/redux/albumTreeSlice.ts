import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { AlbumNode } from '../types/AlbumTree';

interface AlbumTreeState {
  nodes: AlbumNode[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

interface AddAlbumPayload {
  name: string;
  parentId?: string;
}

interface AddGroupPayload {
  name: string;
  parentId?: string;
}

const initialState: AlbumTreeState = {
  nodes: [],
  status: 'idle',
};

// ✅ Async Thunks
export const loadAlbumTree = createAsyncThunk('albumTree/load', async () => {
  const response = await axios.get('/api/album-tree');
  return response.data.nodes as AlbumNode[];
});

export const saveAlbumTree = createAsyncThunk('albumTree/save', async (nodes: AlbumNode[]) => {
  await axios.put('/api/album-tree', { nodes });
});

// ✅ Utility
const findAndInsert = (
  nodes: AlbumNode[],
  parentId: string | undefined,
  newNode: AlbumNode
): boolean => {
  for (const node of nodes) {
    if (node.type === 'group' && node.id === parentId) {
      node.children.push(newNode);
      return true;
    }
    if (node.type === 'group') {
      const added = findAndInsert(node.children, parentId, newNode);
      if (added) return true;
    }
  }
  return false;
};

// ✅ Slice
const albumTreeSlice = createSlice({
  name: 'albumTree',
  initialState,
  reducers: {
    markAlbumImported(state, action: PayloadAction<string>) {
      const markRecursive = (nodes: AlbumNode[]): void => {
        for (const node of nodes) {
          if (node.id === action.payload && node.type === 'album') {
            (node as any).imported = true;
          } else if (node.type === 'group') {
            markRecursive(node.children);
          }
        }
      };
      markRecursive(state.nodes);
    },

    addAlbum(state, action: PayloadAction<AddAlbumPayload>) {
      const newAlbum: AlbumNode = {
        id: uuidv4(),
        name: action.payload.name,
        type: 'album',
        mediaCount: 0,
      };
      const added = findAndInsert(state.nodes, action.payload.parentId, newAlbum);
      if (!added) state.nodes.push(newAlbum);
    },

    addGroup(state, action: PayloadAction<AddGroupPayload>) {
      const newGroup: AlbumNode = {
        id: uuidv4(),
        name: action.payload.name,
        type: 'group',
        children: [],
      };
      const added = findAndInsert(state.nodes, action.payload.parentId, newGroup);
      if (!added) state.nodes.push(newGroup);
    },
  },

  extraReducers: builder => {
    builder
      .addCase(loadAlbumTree.pending, state => {
        state.status = 'loading';
      })
      .addCase(loadAlbumTree.fulfilled, (state, action) => {
        state.nodes = action.payload;
        state.status = 'succeeded';
      })
      .addCase(loadAlbumTree.rejected, state => {
        state.status = 'failed';
      });
  },
});

export const { addAlbum, addGroup, markAlbumImported } = albumTreeSlice.actions;
export default albumTreeSlice.reducer;
