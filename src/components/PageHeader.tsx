/**
 * @fileoverview 페이지 헤더 컴포넌트
 * @description 각 페이지 상단의 제목 + 아이콘 표시 영역
 */
import React from 'react';
import { Box, Typography } from '@mui/material';

interface PageHeaderProps {
  /** 페이지 제목 */
  title: string;
  /** 제목 왼쪽 아이콘 (MUI 아이콘 컴포넌트) */
  icon?: React.ReactNode;
  /** 오른쪽 영역 (버튼 등) */
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, icon, actions }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {icon && <Box sx={{ color: '#003875', display: 'flex' }}>{icon}</Box>}
      <Typography variant="h5" fontWeight={700}>{title}</Typography>
    </Box>
    {actions && <Box>{actions}</Box>}
  </Box>
);

export default PageHeader;
