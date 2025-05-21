import AlbumTreeView from './AlbumTreeView';
import { AlbumNode } from '../types/AlbumTree';

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
        ],
      },
    ],
  },
];

const AppShell = () => {
  return (
    <div style={{ padding: '16px' }}>
      <h1>Album Tree</h1>
      <AlbumTreeView nodes={dummyData} />
    </div>
  );
};
