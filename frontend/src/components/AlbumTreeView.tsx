import React, { useState } from 'react';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { ExpandMore, ChevronRight } from '@mui/icons-material';
import { AlbumNode } from '../types/AlbumTree';
import { SvgIconProps } from '@mui/material/SvgIcon';

import { startImport, finishImport } from '../models/importSlice'; // adjust path as needed
import { RootState } from '../models/store'; // your store’s root type
import { useDispatch, useSelector } from 'react-redux';

interface Props {
  nodes: AlbumNode[];
}

const renderTree = (node: AlbumNode): React.ReactNode => {
  if (node.type === 'group') {
    return (
      <TreeItem key={node.id} itemId={node.id} label={node.name}>
        {node.children.map(renderTree)}
      </TreeItem>
    );
  } else {
    return (
      <TreeItem
        key={node.id}
        itemId={node.id}
        label={`${node.name} (${node.mediaCount})`}
      />
    );
  }
};

export default function AlbumTreeView({ nodes }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // const [isImporting, setIsImporting] = useState(false);

  const dispatch = useDispatch();
  const importingAlbumId = useSelector((state: RootState) => state.import.importingAlbumId);
  const isImporting = selectedId !== null && importingAlbumId === selectedId;

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

      <button onClick={handleImportClick} disabled={!selectedId || !!importingAlbumId}>
        {isImporting ? 'Importing...' : 'Import'}
      </button>

    </>
  );
}
