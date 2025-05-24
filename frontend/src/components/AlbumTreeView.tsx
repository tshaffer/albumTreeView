import React, { useState } from 'react';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { ExpandMore, ChevronRight } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';
import {
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { startImport, finishImport } from '../redux/importSlice';
import { markAlbumImported, addAlbum, addGroup, saveAlbumTree } from '../redux/albumTreeSlice';
import { moveNodeThunk } from '../redux/albumTreeSlice';
import { RootState } from '../redux/store';
import { AlbumNode } from '../types/AlbumTree';
import { useAppDispatch } from '../redux/hooks';
import { getAllGroupNodes } from '../utilities/treeUtils';

const mockImportAlbum = async (albumId: string): Promise<void> => {
  console.log(`Starting mock import for album ${albumId}`);
  return new Promise(resolve => {
    setTimeout(() => {
      console.log(`Finished mock import for album ${albumId}`);
      resolve();
    }, 1000);
  });
};

const mockHasContent = (albumId: string): boolean => {
  // Mock logic: pretend albums with odd-length IDs have content
  return albumId.length % 2 === 1;
};

export default function AlbumTreeView() {
  const dispatch = useAppDispatch();

  const nodes = useSelector((state: RootState) => state.albumTree.nodes);
  const importingAlbumId = useSelector((state: RootState) => state.import.importingAlbumId);
  const completedAlbumImports = useSelector((state: RootState) => state.import.completedAlbumImports);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [addGroupDialogOpen, setAddGroupDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');

  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameTargetId, setRenameTargetId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [newParentId, setNewParentId] = useState<string | null>(null);

  React.useEffect(() => {
    if (nodes.length > 0) {
      dispatch(saveAlbumTree(nodes));
    }
  }, [nodes, dispatch]);

  const isImporting = selectedId !== null && importingAlbumId === selectedId;

  const hasBlockingAlbums = (nodes: AlbumNode[]): boolean => {
    for (const node of nodes) {
      if (node.type === 'album' && mockHasContent(node.id)) {
        return true;
      }
      if (node.type === 'group' && hasBlockingAlbums(node.children)) {
        return true;
      }
    }
    return false;
  };

  const getNodesByIds = (allNodes: AlbumNode[], ids: Set<string>): AlbumNode[] => {
    const result: AlbumNode[] = [];

    const traverse = (nodes: AlbumNode[]) => {
      for (const node of nodes) {
        if (ids.has(node.id)) {
          result.push(node);
        }
        if (node.type === 'group') {
          traverse(node.children);
        }
      }
    };

    traverse(allNodes);
    return result;
  };


  const handleImportClick = async () => {
    if (!selectedId) return;
    dispatch(startImport(selectedId));
    await mockImportAlbum(selectedId);
    dispatch(finishImport(selectedId));
    dispatch(markAlbumImported(selectedId));
    setSnackbarOpen(true);
  };

  const renderTree = (node: AlbumNode): React.ReactNode => {
    const isImported = completedAlbumImports.includes(node.id);
    const label =
      node.type === 'group'
        ? node.name
        : `${node.name} (${node.mediaCount})${isImported ? ' ✅' : ''}`;

    return (
      <TreeItem
        key={node.id}
        itemId={node.id}
        label={
          <span
            onClick={(e) => {
              if (e.shiftKey || e.metaKey || e.ctrlKey) {
                setSelectedNodeIds(prev => {
                  const newSet = new Set(prev);
                  if (newSet.has(node.id)) {
                    newSet.delete(node.id);
                  } else {
                    newSet.add(node.id);
                  }
                  return newSet;
                });
              } else {
                setSelectedId(node.id);
              }
            }}
            style={{
              color: isImported ? '#999' : 'inherit',
              cursor: 'pointer',
              backgroundColor: selectedNodeIds.has(node.id) ? '#e0f7fa' : 'transparent',
              borderRadius: 4,
              padding: '2px 6px',
              display: 'inline-block'
            }}
          >
            {label}
          </span>
        }
      >
        {node.type === 'group' && node.children.map(renderTree)}
      </TreeItem>
    );
  };

  const findNodeById = (nodes: AlbumNode[], id: string): AlbumNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.type === 'group') {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  return (
    <>
      <SimpleTreeView
        onSelectedItemsChange={(event, id) => {
          setSelectedId(id ?? null);
        }}
        slots={{
          expandIcon: ChevronRight as React.ComponentType<SvgIconProps>,
          collapseIcon: ExpandMore as React.ComponentType<SvgIconProps>,
        }}
      >
        {nodes.map(renderTree)}
      </SimpleTreeView>

      {selectedNodeIds.size > 0 && (
        <div
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#f0f0f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <span>{selectedNodeIds.size} selected</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="outlined" onClick={() => setSelectedNodeIds(new Set())}>
              Clear Selection
            </Button>
            {selectedNodeIds.size === 1 && (
              <Button
                variant="outlined"
                onClick={() => {
                  const onlyId = Array.from(selectedNodeIds)[0];
                  const node = findNodeById(nodes, onlyId);
                  if (node) {
                    setRenameTargetId(onlyId);
                    setRenameValue(node.name);
                    setRenameDialogOpen(true);
                  }
                }}
              >
                Rename
              </Button>
            )}
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                const getNodesByIds = (allNodes: AlbumNode[], ids: Set<string>): AlbumNode[] => {
                  const result: AlbumNode[] = [];
                  const traverse = (nodes: AlbumNode[]) => {
                    for (const node of nodes) {
                      if (ids.has(node.id)) {
                        result.push(node);
                      }
                      if (node.type === 'group') {
                        traverse(node.children);
                      }
                    }
                  };
                  traverse(allNodes);
                  return result;
                };

                const hasBlockingAlbums = (nodes: AlbumNode[]): boolean => {
                  for (const node of nodes) {
                    if (node.type === 'album' && mockHasContent(node.id)) {
                      return true;
                    }
                    if (node.type === 'group' && hasBlockingAlbums(node.children)) {
                      return true;
                    }
                  }
                  return false;
                };

                const nodesToDelete = getNodesByIds(nodes, selectedNodeIds);
                const hasBlocked = hasBlockingAlbums(nodesToDelete);
                if (hasBlocked) {
                  alert('One or more selected items contain albums with content. Cannot delete.');
                  return;
                }

                dispatch({ type: 'albumTree/deleteNodes', payload: Array.from(selectedNodeIds) });
                dispatch(saveAlbumTree(nodes));
                setSelectedNodeIds(new Set());
              }}
            >
              Delete
            </Button>
            <Button variant="contained" onClick={() => setMoveDialogOpen(true)}>
              Move To…
            </Button>
          </div>
        </div>
      )}

      <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
        <Button
          variant="contained"
          onClick={handleImportClick}
          disabled={!selectedId || !!importingAlbumId}
        >
          {isImporting ? 'Importing...' : 'Import'}
        </Button>

        <Button variant="outlined" onClick={() => setAddDialogOpen(true)}>
          Add Album
        </Button>

        <Button variant="outlined" onClick={() => setAddGroupDialogOpen(true)}>
          Add Group
        </Button>

        <Button variant="outlined" onClick={() => setSelectedId(null)}>
          Deselect
        </Button>
      </div>

      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
        <DialogTitle>Add New Album</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Album Name"
            value={newAlbumName}
            onChange={(e) => setNewAlbumName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              dispatch(addAlbum({ name: newAlbumName, parentId: selectedId ?? undefined }));
              setNewAlbumName('');
              setAddDialogOpen(false);
            }}
            disabled={!newAlbumName.trim()}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addGroupDialogOpen} onClose={() => setAddGroupDialogOpen(false)}>
        <DialogTitle>Add New Group</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Group Name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddGroupDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              dispatch(addGroup({ name: newGroupName, parentId: selectedId ?? undefined }));
              setNewGroupName('');
              setAddGroupDialogOpen(false);
            }}
            disabled={!newGroupName.trim()}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={moveDialogOpen} onClose={() => setMoveDialogOpen(false)}>
        <DialogTitle>Move Selected Albums or Groups</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="New Parent"
            fullWidth
            value={newParentId ?? ''}
            onChange={(e) => setNewParentId(e.target.value)}
          >
            <MenuItem value="" disabled>Select new parent</MenuItem>
            {getAllGroupNodes(nodes)
              .filter(n => !selectedNodeIds.has(n.id))
              .map(n => (
                <MenuItem key={n.id} value={n.id}>{n.name}</MenuItem>
              ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMoveDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              for (const nodeId of selectedNodeIds) {
                dispatch(moveNodeThunk({ nodeId, newParentId: newParentId! }));
              }
              setMoveDialogOpen(false);
              setNewParentId(null);
              setSelectedNodeIds(new Set());
            }}
            disabled={!newParentId}
          >
            Move
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          Successfully imported album!
        </Alert>
      </Snackbar>

      <Dialog open={renameDialogOpen} onClose={() => setRenameDialogOpen(false)}>
        <DialogTitle>Rename Node</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="New Name"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              if (renameTargetId && renameValue.trim()) {
                dispatch({ type: 'albumTree/renameNode', payload: { nodeId: renameTargetId, newName: renameValue.trim() } });
                dispatch(saveAlbumTree(nodes));
              }
              setRenameDialogOpen(false);
              setRenameTargetId(null);
              setRenameValue('');
            }}
          >
            Rename
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
