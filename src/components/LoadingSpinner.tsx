/**
 * @fileoverview 로딩 스피너 컴포넌트
 * @description 데이터 로딩 중 표시되는 공통 스피너. 인라인/전체화면 모드 지원.
 */
import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  /** 로딩 중 표시할 텍스트 */
  message?: string;
  /** 스피너 크기 (px) */
  size?: number;
  /** 전체 화면 중앙 정렬 여부 */
  fullPage?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = '로딩 중...',
  size = 24,
  fullPage = false,
}) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 1,
      ...(fullPage && { minHeight: '60vh' }),
      flexDirection: fullPage ? 'column' : 'row',
    }}
  >
    <CircularProgress size={size} />
    {message && (
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    )}
  </Box>
);

export default LoadingSpinner;
