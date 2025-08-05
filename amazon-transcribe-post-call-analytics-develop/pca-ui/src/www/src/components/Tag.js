import React from 'react';
import { Chip } from '@mui/material';

export const Tag = ({ children, className = '', ...props }) => {
  return (
    <Chip
      label={children}
      className={className}
      sx={{ m: 0.5 }}
      {...props}
    />
  );
};
