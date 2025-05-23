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
  Menu,
  MenuItem,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { startImport, finishImport } from '../redux/importSlice';
import { markAlbumImported, addAlbum, addGroup, saveAlbumTree, moveNodeThunk } from '../redux/albumTreeSlice';
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

export default function AlbumTreeView() {
  const dispatch = useAppDispatch();

  const nodes = useSelector((state: RootState) => state.albumTree.nodes);
  const importingAlbumId = useSelector((state: RootState) => state.import.importingAlbumId);
  const completedAlbumImports = useSelector((state: RootState) => state.import.completedAlbumImports);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [addGroupDialogOpen, setAddGroupDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');

  const [contextMenuPosition, setContextMenuPosition] = useState<{ mouseX: number; mouseY: number } | null>(null);
  const [contextMenuNodeId, setContextMenuNodeId] = useState<string | null>(null);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [newParentId, setNewParentId] = useState<string | null>(null);

  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());

  React.useEffect(() => {
    if (nodes.length > 0) {
      dispatch(saveAlbumTree(nodes));
    }
  }, [nodes, dispatch]);

  const isImporting = selectedId !== null && importingAlbumId === selectedId;

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
                setSelectedId(node.id); // fallback for single click (optional)
              }
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenuNodeId(node.id);
              setContextMenuPosition({ mouseX: e.clientX - 2, mouseY: e.clientY - 4 });
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

  return (
    <>
      <Menu
        open={!!contextMenuPosition}
        onClose={() => setContextMenuPosition(null)}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenuPosition !== null
            ? { top: contextMenuPosition.mouseY, left: contextMenuPosition.mouseX }
            : undefined
        }
      >
        <MenuItem
          onClick={() => {
            setMoveDialogOpen(true);
            setContextMenuPosition(null);
          }}
        >
          Move To…
        </MenuItem>
      </Menu>

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

      <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
        <Button
          variant="contained"
          onClick={handleImportClick}
          disabled={!selectedId || !!importingAlbumId}
        >
          {isImporting ? 'Importing...' : 'Import'}
        </Button>

        <Button
          variant="outlined"
          onClick={() => setAddDialogOpen(true)}
        >
          Add Album
        </Button>

        <Button
          variant="outlined"
          onClick={() => setAddGroupDialogOpen(true)}
        >
          Add Group
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
        <DialogTitle>Move Album or Group</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="New Parent"
            fullWidth
            value={newParentId ?? ''}
            onChange={(e) => setNewParentId(e.target.value)}
          >
            <MenuItem value="" disabled>
              Select new parent
            </MenuItem>
            {getAllGroupNodes(nodes)
              .filter(n => n.id !== contextMenuNodeId)
              .map(n => (
                <MenuItem key={n.id} value={n.id}>{n.name}</MenuItem>
              ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMoveDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              if (contextMenuNodeId && newParentId) {
                dispatch(moveNodeThunk({ nodeId: contextMenuNodeId, newParentId }));
              }
              setMoveDialogOpen(false);
              setNewParentId(null);
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
    </>
  );
}
