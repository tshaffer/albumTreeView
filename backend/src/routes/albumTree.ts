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

export default router;
