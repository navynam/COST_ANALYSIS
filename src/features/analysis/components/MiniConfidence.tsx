import React from 'react';
import { Box, Typography } from '@mui/material';
import { C } from '../../../shared/constants/colors';

const MiniConfidence: React.FC<{ value: number }> = ({ value }) => {
  const color = value >= 85 ? C.green : value >= 70 ? C.orange : C.red;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Box sx={{ width: 40, height: 3, bgcolor: '#e5e5e7', borderRadius: 2, overflow: 'hidden', display: 'inline-block' }}>
        <Box sx={{ width: `${value}%`, height: '100%', bgcolor: color, borderRadius: 2 }} />
      </Box>
      <Typography sx={{ fontSize: 10, color: value >= 85 ? C.gray : color }}>{value}%</Typography>
    </Box>
  );
};

export default MiniConfidence;
