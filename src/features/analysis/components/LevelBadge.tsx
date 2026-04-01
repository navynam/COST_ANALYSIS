import React from 'react';
import { Box } from '@mui/material';
import { C } from '../../../shared/constants/colors';

const LevelBadge: React.FC<{ level: 'L0' | 'L1' }> = ({ level }) => (
  <Box sx={{
    display: 'inline-block', fontSize: 10, fontWeight: 700, px: 0.75, py: 0.25, borderRadius: '4px',
    bgcolor: level === 'L0' ? '#e8edf3' : '#dce6f7',
    color: level === 'L0' ? '#555' : C.blue,
  }}>{level}</Box>
);

export default LevelBadge;
