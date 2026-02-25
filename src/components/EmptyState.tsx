/**
 * @fileoverview 빈 상태 컴포넌트
 * @description 데이터가 없을 때 표시하는 공통 빈 상태 UI
 */
import React from 'react';
import { Box, Typography } from '@mui/material';

interface EmptyStateProps {
  /** 안내 메시지 */
  message?: string;
  /** 아이콘 (이모지 또는 MUI 아이콘) */
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  message = '데이터가 없습니다.',
  icon,
}) => (
  <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
    {icon && <Box sx={{ fontSize: 48, mb: 1 }}>{icon}</Box>}
    <Typography variant="body1">{message}</Typography>
  </Box>
);

export default EmptyState;
