import React, { useState } from 'react';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { ExpandMore, ChevronRight } from '@mui/icons-material';
import { AlbumNode } from '../types/AlbumTree';
import { SvgIconProps } from '@mui/material/SvgIcon';

interface Props {
  nodes: AlbumNode[];
}

const renderTree = (node: AlbumNode) => {
  if (node.type === 'group') {
    return (
      <TreeItem key={node.id} itemId={node.id} label={node.name}>
        {node.children.map(child => renderTree(child))}
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

  return (
    <>
      <SimpleTreeView
        selectedItems={selectedId ? [selectedId] : []}
        onSelectedItemsChange={(event, ids) => {
          setSelectedId(ids[0] ?? null); // single selection
        }}
        slots={{
          expandIcon: ChevronRight as React.ComponentType<SvgIconProps>,
          collapseIcon: ExpandMore as React.ComponentType<SvgIconProps>,
        }}
      >
        {nodes.map(renderTree)}
      </SimpleTreeView>

      <button
        onClick={() => {
          if (selectedId) {
            console.log(`Import requested for album node: ${selectedId}`);
            // Trigger import logic here
          }
        }}
        disabled={!selectedId}
      >
        Import
      </button>
    </>
  );
}
