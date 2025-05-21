import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../models/store';
import AlbumTreeView from './AlbumTreeView';
import { AlbumNode } from '../types/AlbumTree';

// Temporary static data to visualize the tree
const dummyData: AlbumNode[] = [
  {
    id: 'australia',
    name: 'Australia',
    type: 'group',
    children: [
      {
        id: 'sydney',
        name: 'Sydney',
        type: 'group',
        children: [
          {
            id: 'day1',
            name: 'Day 1 - Arrival',
            type: 'album',
            mediaCount: 45,
          },
          {
            id: 'day2',
            name: 'Day 2 - Harbor Walk',
            type: 'album',
            mediaCount: 38,
          },
        ],
      },
      {
        id: 'noosa',
        name: 'Noosa',
        type: 'group',
        children: [
          {
            id: 'day3',
            name: 'Day 3 - Beach',
            type: 'album',
            mediaCount: 50,
          },
        ],
      },
    ],
  },
];

const AppShell = () => {
  // Replace this with actual Redux state later if needed
  // const albumTree = useSelector((state: RootState) => state.albumTree.root);

  return (
    <div style={{ padding: '16px' }}>
      <h1>Album Tree View</h1>
      <AlbumTreeView nodes={dummyData} />
    </div>
  );
};

export default AppShell;
