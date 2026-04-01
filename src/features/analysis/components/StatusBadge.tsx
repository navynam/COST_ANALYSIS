import React from 'react';
import { Box } from '@mui/material';
import { C } from '../../../shared/constants/colors';

const StatusBadge: React.FC<{ status: 'normal' | 'anomaly' }> = ({ status }) => (
  <Box sx={{
    display: 'inline-block', fontSize: 10, fontWeight: 600, px: 0.75, py: 0.25, borderRadius: '4px',
    bgcolor: status === 'normal' ? '#d4edda' : '#f8d7da',
    color: status === 'normal' ? C.green : C.red,
  }}>{status === 'normal' ? '정상' : '이상치'}</Box>
);

export default StatusBadge;
