import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Container } from '@mui/material';
import AlbumTreeView from './AlbumTreeView';
import ManageMenu from './ManageMenu';

export default function App() {
  const [selectedCount, setSelectedCount] = useState(0);

  const handleClearSelection = () => {
    alert('Clear Selection Clicked!');
    setSelectedCount(0);
  };

  const handleMove = () => {
    alert('Move Clicked!');
  };

  const handleRename = () => {
    alert('Rename Clicked!');
  };

  const handleDelete = () => {
    alert('Delete Clicked!');
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            My Test App
          </Typography>
          <ManageMenu
            selectionCount={selectedCount}
            onClearSelection={handleClearSelection}
            onMove={handleMove}
            onRename={handleRename}
            onDelete={handleDelete}
          />
        </Toolbar>
      </AppBar>

      <Container>
        <Typography variant="h4" gutterBottom>
          Album Tree View
        </Typography>
        {/* For demonstration, we'll fake selection count updates */}
        <button onClick={() => setSelectedCount(1)}>Select 1</button>
        <button onClick={() => setSelectedCount(3)}>Select 3</button>
        <button onClick={() => setSelectedCount(0)}>Clear</button>

        <AlbumTreeView />
      </Container>
    </>
  );
}
