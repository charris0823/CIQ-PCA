import React from 'react';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

export const SentimentIcon = ({ score, size = "1.5em" }) => {
  if (score > 0) {
    return <SentimentSatisfiedAltIcon sx={{ color: 'green', fontSize: size }} />;
  }
  if (score < 0) {
    return <SentimentDissatisfiedIcon sx={{ color: 'red', fontSize: size }} />;
  }
  return <SentimentNeutralIcon sx={{ color: 'grey', fontSize: size }} />;
};
