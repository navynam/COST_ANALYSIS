import React from 'react';
import { Box, Typography } from '@mui/material';
import { C } from '../../../shared/constants/colors';

const ConfidenceBar: React.FC<{ value: number; width?: number }> = ({ value, width = 60 }) => {
  const color = value >= 85 ? C.green : value >= 70 ? C.orange : C.red;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
      <Box sx={{ width, height: 6, bgcolor: '#e5e5e7', borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ width: `${value}%`, height: '100%', bgcolor: color, borderRadius: 3 }} />
      </Box>
      <Typography sx={{ fontSize: 11, fontWeight: 600, color }}>{value}%</Typography>
    </Box>
  );
};

export default ConfidenceBar;
