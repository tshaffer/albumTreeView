export type AlbumNode = GroupNode | LeafAlbumNode;

export interface GroupNode {
  id: string;
  name: string;
  type: 'group';
  children: AlbumNode[];
}

export interface LeafAlbumNode {
  id: string;
  name: string;
  type: 'album';
  mediaCount: number;
}
