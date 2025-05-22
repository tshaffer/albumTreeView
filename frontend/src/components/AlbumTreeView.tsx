import React, { useState } from 'react';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { ExpandMore, ChevronRight } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';
import { Snackbar, Alert } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { startImport, finishImport } from '../models/importSlice';
import { RootState } from '../models/store';
import { AlbumNode } from '../types/AlbumTree';

interface Props {
  nodes: AlbumNode[];
}

const mockImportAlbum = async (albumId: string): Promise<void> => {
  console.log(`Starting mock import for album ${albumId}`);
  return new Promise(resolve => {
    setTimeout(() => {
      console.log(`Finished mock import for album ${albumId}`);
      resolve();
    }, 1000);
  });
};

export default function AlbumTreeView({ nodes }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const dispatch = useDispatch();
  const importingAlbumId = useSelector((state: RootState) => state.import.importingAlbumId);
  const completedAlbumImports = useSelector((state: RootState) => state.import.completedAlbumImports);
  const isImporting = selectedId !== null && importingAlbumId === selectedId;

  const handleImportClick = async () => {
    if (!selectedId) return;
    dispatch(startImport(selectedId));
    await mockImportAlbum(selectedId);
    dispatch(finishImport(selectedId));
    setSnackbarOpen(true);
  };

  const renderTree = (node: AlbumNode): React.ReactNode => {
    const isImported = completedAlbumImports.includes(node.id);
    const label = node.type === 'group'
      ? node.name
      : `${node.name} (${node.mediaCount})${isImported ? ' ✅' : ''}`;

    return (
      <TreeItem
        key={node.id}
        itemId={node.id}
        label={<span style={{ color: isImported ? '#999' : 'inherit' }}>{label}</span>}
      >
        {node.type === 'group' && node.children.map(renderTree)}
      </TreeItem>
    );
  };

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
        {nodes.map(renderTree)}
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
