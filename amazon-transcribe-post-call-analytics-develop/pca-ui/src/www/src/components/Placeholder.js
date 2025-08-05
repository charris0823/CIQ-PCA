import React from 'react';
import { Skeleton, Box } from '@mui/material';

export const Placeholder = () => {
  return (
    <Box sx={{ width: '100%' }}>
      <Skeleton variant="text" height={40} />
      <Skeleton variant="text" height={30} width="80%" />
      <Skeleton variant="rectangular" height={100} />
    </Box>
  );
};
