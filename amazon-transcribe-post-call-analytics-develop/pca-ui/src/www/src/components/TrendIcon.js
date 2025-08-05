import React from 'react';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

export const TrendIcon = ({ trend, size = "1.5em" }) => {
  if (trend >= 0.4) {
    return <TrendingUpIcon sx={{ color: 'green', fontSize: size }} />;
  }
  if (trend <= -0.4) {
    return <TrendingDownIcon sx={{ color: 'red', fontSize: size }} />;
  }
  return <TrendingFlatIcon sx={{ color: 'grey', fontSize: size }} />;
};
