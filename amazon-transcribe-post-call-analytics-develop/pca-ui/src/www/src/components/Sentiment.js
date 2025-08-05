import React from 'react';
import { SentimentIcon } from './SentimentIcon';
import { TrendIcon } from './TrendIcon';
import { Box, Typography } from '@mui/material';

export const Sentiment = ({ score, trend }) => {
  return (
    <Box display="flex" alignItems="center" gap={2}>
      <Typography variant="body2">Sentiment:</Typography> <SentimentIcon score={score} />
      <Typography variant="body2">Trend:</Typography> <TrendIcon trend={trend} />
    </Box>
  );
};
