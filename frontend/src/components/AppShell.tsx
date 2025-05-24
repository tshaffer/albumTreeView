import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Container, Button, Box } from '@mui/material';
import { useAppDispatch } from '../redux/hooks';
import { loadAlbumTree, markAlbumImported, addAlbum, addGroup } from '../redux/albumTreeSlice';
import AlbumTreeView from './AlbumTreeView';
import ManageMenu from './ManageMenu';
import { startImport, finishImport } from '../redux/importSlice';

export default function AppShell() {
  const dispatch = useAppDispatch();
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newGroupName, setNewGroupName] = useState('');

  useEffect(() => {
    dispatch(loadAlbumTree());
  }, [dispatch]);

  const handleImportClick = async () => {
    if (!selectedId) return;
    setImportingId(selectedId);
    dispatch(startImport(selectedId));
    await new Promise(resolve => setTimeout(resolve, 1000)); // Mock import
    dispatch(finishImport(selectedId));
    dispatch(markAlbumImported(selectedId));
    setImportingId(null);
  };

  const handleAddAlbum = () => {
    if (!newAlbumName.trim()) return;
    dispatch(addAlbum({ name: newAlbumName, parentId: selectedId ?? undefined }));
    setNewAlbumName('');
  };

  const handleAddGroup = () => {
    if (!newGroupName.trim()) return;
    dispatch(addGroup({ name: newGroupName, parentId: selectedId ?? undefined }));
    setNewGroupName('');
  };

  const handleClearSelection = () => setSelectedNodeIds(new Set());

  const handleMove = () => {
    const event = new CustomEvent('open-move-dialog');
    window.dispatchEvent(event);
  };

  const handleRename = () => {
    if (selectedNodeIds.size !== 1) return;
    const onlyId = Array.from(selectedNodeIds)[0];
    const event = new CustomEvent('open-rename-dialog', { detail: { nodeId: onlyId } });
    window.dispatchEvent(event);
  };

  const handleDelete = () => {
    const event = new CustomEvent('delete-nodes', { detail: { nodeIds: Array.from(selectedNodeIds) } });
    window.dispatchEvent(event);
    setSelectedNodeIds(new Set());
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            Shafferography Album Manager
          </Typography>

          <ManageMenu
            selectionCount={selectedNodeIds.size}
            onClearSelection={handleClearSelection}
            onMove={handleMove}
            onRename={handleRename}
            onDelete={handleDelete}
          />
        </Toolbar>

        <Toolbar variant="dense" sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" onClick={handleImportClick} disabled={!selectedId || !!importingId}>
            {importingId ? 'Importing...' : 'Import'}
          </Button>

          <Box component="form" onSubmit={(e) => { e.preventDefault(); handleAddAlbum(); }} sx={{ display: 'flex', gap: 1 }}>
            <input
              type="text"
              placeholder="New Album Name"
              value={newAlbumName}
              onChange={(e) => setNewAlbumName(e.target.value)}
              style={{ padding: '4px', borderRadius: 4, border: '1px solid #ccc' }}
            />
            <Button variant="outlined" onClick={handleAddAlbum} disabled={!newAlbumName.trim()}>
              Add Album
            </Button>
          </Box>

          <Box component="form" onSubmit={(e) => { e.preventDefault(); handleAddGroup(); }} sx={{ display: 'flex', gap: 1 }}>
            <input
              type="text"
              placeholder="New Group Name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              style={{ padding: '4px', borderRadius: 4, border: '1px solid #ccc' }}
            />
            <Button variant="outlined" onClick={handleAddGroup} disabled={!newGroupName.trim()}>
              Add Group
            </Button>
          </Box>

          <Button variant="outlined" onClick={() => setSelectedId(null)}>
            Deselect
          </Button>
        </Toolbar>
      </AppBar>

      <Container>
        <AlbumTreeView
          selectedNodeIds={selectedNodeIds}
          setSelectedNodeIds={setSelectedNodeIds}
        />
      </Container>
    </>
  );
}
