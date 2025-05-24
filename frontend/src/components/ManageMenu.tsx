import React from 'react';
import { Button, Menu, MenuItem, Divider } from '@mui/material';

interface ManageMenuProps {
  selectionCount: number;
  onClearSelection: () => void;
  onMove: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export default function ManageMenu({
  selectionCount,
  onClearSelection,
  onMove,
  onRename,
  onDelete,
}: ManageMenuProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button variant="outlined" onClick={handleClick} disabled={selectionCount === 0}>
        Manage ({selectionCount})
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={() => { onMove(); handleClose(); }}>Move</MenuItem>
        <MenuItem onClick={() => { onRename(); handleClose(); }} disabled={selectionCount !== 1}>Rename</MenuItem>
        <MenuItem onClick={() => { onDelete(); handleClose(); }}>Delete</MenuItem>
        <Divider />
        <MenuItem onClick={() => { onClearSelection(); handleClose(); }}>Clear Selection</MenuItem>
      </Menu>
    </>
  );
}
