import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Container } from '@mui/material';
import { useAppDispatch } from '../redux/hooks';
import { loadAlbumTree, deleteNodes, saveAlbumTree, renameNode } from '../redux/albumTreeSlice';
import AlbumTreeView from './AlbumTreeView';
import ManageMenu from './ManageMenu';

export default function AppShell() {
  const dispatch = useAppDispatch();
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    dispatch(loadAlbumTree());
  }, [dispatch]);

  const handleClearSelection = () => setSelectedNodeIds(new Set());

  const handleMove = () => {
    // The existing move dialog in AlbumTreeView will handle this when open
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
    // Check for content using existing logic
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
