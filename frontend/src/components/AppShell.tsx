import { useEffect } from 'react';
import { useAppDispatch } from '../redux/hooks';
import { loadAlbumTree } from '../redux/albumTreeSlice';
import AlbumTreeView from './AlbumTreeView';

const AppShell = () => {

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadAlbumTree());
  }, [dispatch]);

  return (
    <div style={{ padding: '16px' }}>
      <h1>Album Tree View</h1>
      <AlbumTreeView />
    </div>
  );
};

export default AppShell;
