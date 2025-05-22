import mongoose from 'mongoose';

const albumNodeSchema = new mongoose.Schema({
  id: String,
  name: String,
  type: { type: String, enum: ['album', 'group'] },
  mediaCount: Number,
  children: [mongoose.Schema.Types.Mixed], // placeholder, will assign below
}, { _id: false });

// Now define children as recursive
albumNodeSchema.add({
  children: [albumNodeSchema]
});

const albumTreeSchema = new mongoose.Schema({
  _id: { type: String, default: 'singleton' },
  nodes: [albumNodeSchema],
});

export const AlbumTreeModel = mongoose.model('albumtree', albumTreeSchema);
