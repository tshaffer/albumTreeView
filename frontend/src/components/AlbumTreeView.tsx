import { TreeView, TreeItem } from '@mui/lab';
import { ExpandMore, ChevronRight } from '@mui/icons-material';
import { AlbumNode } from '../types/AlbumTree';

interface Props {
  nodes: AlbumNode[];
}

const renderTree = (node: AlbumNode) => {
  if (node.type === 'group') {
    return (
      <TreeItem key={node.id} nodeId={node.id} label={node.name}>
        {node.children.map(child => renderTree(child))}
      </TreeItem>
    );
  } else {
    return (
      <TreeItem key={node.id} nodeId={node.id} label={`${node.name} (${node.mediaCount})`} />
    );
  }
};

export default function AlbumTreeView({ nodes }: Props) {
  return (
    <TreeView
      defaultCollapseIcon={<ExpandMore />}
      defaultExpandIcon={<ChevronRight />}
    >
      {nodes.map(renderTree)}
    </TreeView>
  );
}
