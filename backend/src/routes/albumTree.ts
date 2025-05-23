import express from 'express';
import { AlbumTreeModel } from '../models/AlbumTree';

const router = express.Router();

// GET /api/album-tree
router.get('/', async (req, res) => {
  const tree = await AlbumTreeModel.findById('singleton');
  res.json(tree ?? { nodes: [] });
});

// PUT /api/album-tree
router.put('/', async (req, res) => {
  const { nodes } = req.body;

  await AlbumTreeModel.findByIdAndUpdate(
    'singleton',
    { nodes },
    { upsert: true, new: true }
  );

  res.sendStatus(204);
});

router.post('/move-node', async (req, res) => {
  const { nodeId, newParentId } = req.body;

  try {
    const treeDoc = await AlbumTreeModel.findOne(); // adjust if you support multi-user
    if (!treeDoc) return res.status(404).send('Tree not found');

    const findAndRemove = (nodes: any[]): [any | null, any[]] => {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.id === nodeId) {
          return [node, [...nodes.slice(0, i), ...nodes.slice(i + 1)]];
        }
        if (node.type === 'group') {
          const [found, updatedChildren] = findAndRemove(node.children);
          if (found) {
            node.children = updatedChildren;
            return [found, nodes];
          }
        }
      }
      return [null, nodes];
    };

    const insertNode = (nodes: any[], nodeToInsert: any): boolean => {
      for (const node of nodes) {
        if (node.id === newParentId && node.type === 'group') {
          node.children.push(nodeToInsert);
          return true;
        }
        if (node.type === 'group' && insertNode(node.children, nodeToInsert)) {
          return true;
        }
      }
      return false;
    };

    let movedNode: any;
    [movedNode, treeDoc.nodes] = findAndRemove(treeDoc.nodes);
    if (!movedNode) return res.status(404).send('Node not found');

    const inserted = insertNode(treeDoc.nodes, movedNode);
    if (!inserted) return res.status(400).send('Parent not found');

    await treeDoc.save();
    res.send({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

export default router;
