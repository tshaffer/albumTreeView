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

export const moveNodeThunk = createAsyncThunk(
  'albumTree/moveNodeThunk',
  async ({ nodeId, newParentId }: { nodeId: string; newParentId: string }, thunkAPI) => {
    const res = await fetch('/api/move-node', {
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

const moveNodeInTree = (
  nodes: AlbumNode[],
  nodeId: string,
  newParentId: string
): AlbumNode[] => {
  const deepClone = (nodes: AlbumNode[]): AlbumNode[] =>
    nodes.map(node => ({
      ...node,
      children: node.type === 'group' ? deepClone(node.children) : [],
    }));

  const [movedNode, remainingNodes] = (function findAndRemove(nodes: AlbumNode[]): [AlbumNode | null, AlbumNode[]] {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.id === nodeId) {
        return [node, [...nodes.slice(0, i), ...nodes.slice(i + 1)]];
      }
      if (node.type === 'group') {
        const [found, updatedChildren] = findAndRemove(node.children);
        if (found) {
          return [found, [
            ...nodes.slice(0, i),
            { ...node, children: updatedChildren },
            ...nodes.slice(i + 1),
          ]];
        }
      }
    }
    return [null, nodes];
  })(deepClone(nodes));

  if (!movedNode) return nodes;

  const insertNode = (nodes: AlbumNode[]): boolean => {
    for (let node of nodes) {
      if (node.id === newParentId && node.type === 'group') {
        node.children.push(movedNode);
        return true;
      }
      if (node.type === 'group' && insertNode(node.children)) {
        return true;
      }
    }
    return false;
  };

  insertNode(remainingNodes);
  return remainingNodes;
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

    moveNode(state, action) {
      const { nodeId, newParentId } = action.payload;
      state.nodes = moveNodeInTree(state.nodes, nodeId, newParentId);
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
      })
      .addCase(moveNodeThunk.fulfilled, (state, action) => {
        const { nodeId, newParentId } = action.payload;
        state.nodes = moveNodeInTree(state.nodes, nodeId, newParentId);
      });
  },
});

export const { addAlbum, addGroup, markAlbumImported } = albumTreeSlice.actions;
export default albumTreeSlice.reducer;
