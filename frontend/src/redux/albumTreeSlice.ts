import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { AlbumNode } from '../types/AlbumTree';
import { insertNode, moveNodeInTree } from '../utilities/treeUtils';

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

interface MoveNodePayload {
  nodeId: string;
  newParentId: string;
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

export const moveNodeThunk = createAsyncThunk(
  'albumTree/moveNodeThunk',
  async ({ nodeId, newParentId }: { nodeId: string; newParentId: string }, thunkAPI) => {
    const res = await fetch('/api/album-tree/move-node', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodeId, newParentId }),
    });

    if (!res.ok) {
      throw new Error('Failed to move node');
    }

    return { nodeId, newParentId };
  }
);

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
      const added = insertNode(state.nodes, action.payload.parentId, newAlbum);
      if (!added) state.nodes.push(newAlbum);
    },

    addGroup(state, action: PayloadAction<AddGroupPayload>) {
      const newGroup: AlbumNode = {
        id: uuidv4(),
        name: action.payload.name,
        type: 'group',
        children: [],
      };
      const added = insertNode(state.nodes, action.payload.parentId, newGroup);
      if (!added) state.nodes.push(newGroup);
    },

    moveNode(state, action: PayloadAction<MoveNodePayload>) {
      const { nodeId, newParentId } = action.payload;
      state.nodes = moveNodeInTree(state.nodes, nodeId, newParentId);
    },

    renameNode(state, action: PayloadAction<{ nodeId: string; newName: string }>) {
      const rename = (nodes: AlbumNode[]) => {
        for (const node of nodes) {
          if (node.id === action.payload.nodeId) {
            node.name = action.payload.newName;
            return true;
          }
          if (node.type === 'group') {
            if (rename(node.children)) return true;
          }
        }
        return false;
      };
      rename(state.nodes);
    },

    deleteNodes(state, action: PayloadAction<string[]>) {
      const idsToDelete = new Set(action.payload);

      const filterTree = (nodes: AlbumNode[]): AlbumNode[] => {
        return nodes
          .filter(node => !idsToDelete.has(node.id))
          .map(node =>
            node.type === 'group'
              ? { ...node, children: filterTree(node.children) }
              : node
          );
      };

      state.nodes = filterTree(state.nodes);
    }

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
      })
      .addCase(moveNodeThunk.fulfilled, (state, action) => {
        const { nodeId, newParentId } = action.payload;
        state.nodes = moveNodeInTree(state.nodes, nodeId, newParentId);
      });
  },
});

export const { addAlbum, addGroup, markAlbumImported, renameNode, deleteNodes } = albumTreeSlice.actions;
export default albumTreeSlice.reducer;
