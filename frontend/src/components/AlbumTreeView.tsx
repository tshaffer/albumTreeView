import React, { useState } from 'react';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { ExpandMore, ChevronRight } from '@mui/icons-material';
import { AlbumNode } from '../types/AlbumTree';
import { SvgIconProps } from '@mui/material/SvgIcon';

import { startImport, finishImport } from '../models/importSlice'; // adjust path as needed
import { RootState } from '../models/store'; // your store’s root type
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Snackbar } from '@mui/material';

interface Props {
  nodes: AlbumNode[];
}

const renderTree = (node: AlbumNode, completedIds: string[]): React.ReactNode => {
  const isImported = completedIds.includes(node.id);
  const label = node.type === 'group'
    ? node.name
    : `${node.name} (${node.mediaCount})${isImported ? ' ✅' : ''}`;

  return (
    <TreeItem
      key={node.id}
      itemId={node.id}
      label={
        <span style={{ color: isImported ? '#999' : 'inherit' }}>{label}</span>
      }
    >
      {node.type === 'group' && node.children.map(child => renderTree(child, completedIds))}
    </TreeItem>
  );
};

export default function AlbumTreeView({ nodes }: Props) {

  const dispatch = useDispatch();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const mockImportAlbum = async (albumId: string): Promise<void> => {
    console.log(`Starting mock import for album ${albumId}`);
    return new Promise(resolve => {
      setTimeout(() => {
        console.log(`Finished mock import for album ${albumId}`);
        resolve();
      }, 1000);
    });
  };

  const handleImportClick = async () => {
    if (!selectedId) return;
    dispatch(startImport(selectedId));
    await mockImportAlbum(selectedId);
    dispatch(finishImport(selectedId));
    setSnackbarOpen(true);
  };

  const importingAlbumId = useSelector((state: RootState) => state.import.importingAlbumId);
  const completedAlbumImports = useSelector((state: RootState) => state.import.completedAlbumImports);
  const isImporting = selectedId !== null && importingAlbumId === selectedId;

  return (
    <>
      <SimpleTreeView
        onSelectedItemsChange={(event, ids) => {
          setSelectedId(ids?.[0] ?? null);
        }}
        slots={{
          expandIcon: ChevronRight as React.ComponentType<SvgIconProps>,
          collapseIcon: ExpandMore as React.ComponentType<SvgIconProps>,
        }}
      >
        {nodes.map(node => renderTree(node, completedAlbumImports))}
      </SimpleTreeView>

      <button
        onClick={handleImportClick}
        disabled={!selectedId || !!importingAlbumId}
      >
        {isImporting ? 'Importing...' : 'Import'}
      </button>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          Successfully imported album!
        </Alert>
      </Snackbar>
    </>
  );
}
