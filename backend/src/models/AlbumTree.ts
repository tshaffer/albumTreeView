import mongoose from 'mongoose';

const albumNodeSchema = new mongoose.Schema({
  id: String,
  name: String,
  type: { type: String, enum: ['album', 'group'] },
  mediaCount: Number,
  children: [this], // recursive
}, { _id: false });

const albumTreeSchema = new mongoose.Schema({
  _id: { type: String, default: 'singleton' }, // enforce only one tree
  nodes: [albumNodeSchema],
});

export const AlbumTreeModel = mongoose.model('AlbumTree', albumTreeSchema);
