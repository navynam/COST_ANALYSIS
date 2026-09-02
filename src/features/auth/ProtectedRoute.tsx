/**
 * @fileoverview 메뉴 단위 라우트 가드 (11.4)
 * @description 권한이 없으면 리다이렉트가 아니라 AccessDeniedPage 를 렌더링한다 (리다이렉트 루프 회피, E7).
 */
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { usePermissionContext } from './PermissionContext';
import AccessDeniedPage from './AccessDeniedPage';

interface ProtectedRouteProps {
  menuCode: string;
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ menuCode, children }) => {
  const { loading, error, hasAnyMenu, permissions, refresh } = usePermissionContext();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2 }}>
        <CircularProgress />
        <Typography color="text.secondary">권한 정보를 확인하는 중입니다...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2 }}>
        <Typography color="error">{error}</Typography>
        <Button variant="outlined" startIcon={<Refresh />} onClick={() => refresh()}>다시 시도</Button>
      </Box>
    );
  }

  if (!hasAnyMenu) {
    return <Navigate to="/no-access" replace />;
  }

  const canRead = permissions[menuCode]?.canRead ?? false;
  if (!canRead) {
    return <AccessDeniedPage />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
