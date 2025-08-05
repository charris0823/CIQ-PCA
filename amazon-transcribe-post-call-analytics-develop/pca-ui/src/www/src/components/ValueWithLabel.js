import React from 'react';
import { Typography, Box } from '@mui/material';

export const ValueWithLabel = ({ label, index, children }) => (
  <Box sx={{ mb: 1 }}>
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ display: 'block' }}
      tabIndex={index}
    >
      {label}
    </Typography>
    {children}
  </Box>
);
