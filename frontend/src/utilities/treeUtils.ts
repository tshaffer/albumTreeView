// treeUtils.ts
import { AlbumNode } from '../types/AlbumTree';

/**
 * Deep clone a tree of AlbumNode objects.
 */
export const deepCloneTree = (nodes: AlbumNode[]): AlbumNode[] => {
  return nodes.map(node => {
    if (node.type === 'group') {
      return {
        ...node,
        children: deepCloneTree(node.children),
      };
    } else {
      return { ...node };
    }
  });
};

/**
 * Insert a new node under a parent by ID.
 */
export const insertNode = (
  nodes: AlbumNode[],
  parentId: string | undefined,
  newNode: AlbumNode
): boolean => {
  for (const node of nodes) {
    if (node.type === 'group' && node.id === parentId) {
      node.children.push(newNode);
      return true;
    }
    if (node.type === 'group') {
      const added = insertNode(node.children, parentId, newNode);
      if (added) return true;
    }
  }
  return false;
};

/**
 * Move a node from its current location to a new parent by ID.
 */
export const moveNodeInTree = (
  nodes: AlbumNode[],
  nodeId: string,
  newParentId: string
): AlbumNode[] => {
  const sourceTree = deepCloneTree(nodes);

  const [movedNode, remainingTree] = (function findAndRemove(
    nodes: AlbumNode[]
  ): [AlbumNode | null, AlbumNode[]] {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.id === nodeId) {
        return [node, [...nodes.slice(0, i), ...nodes.slice(i + 1)]];
      }
      if (node.type === 'group') {
        const [found, updatedChildren] = findAndRemove(node.children);
        if (found) {
          return [found, [
            ...nodes.slice(0, i),
            { ...node, children: updatedChildren },
            ...nodes.slice(i + 1),
          ]];
        }
      }
    }
    return [null, nodes];
  })(sourceTree);

  if (!movedNode) return nodes;

  const didInsert = (function insert(
    nodes: AlbumNode[]
  ): boolean {
    for (const node of nodes) {
      if (node.type === 'group' && node.id === newParentId) {
        node.children.push(movedNode);
        return true;
      }
      if (node.type === 'group' && insert(node.children)) {
        return true;
      }
    }
    return false;
  })(remainingTree);

  return didInsert ? remainingTree : nodes;
};

export const getAllGroupNodes = (nodes: AlbumNode[]): AlbumNode[] => {
  const result: AlbumNode[] = [];

  const traverse = (nodeList: AlbumNode[]) => {
    for (const node of nodeList) {
      if (node.type === 'group') {
        result.push(node);
        traverse(node.children);
      }
    }
  };

  traverse(nodes);
  return result;
};
