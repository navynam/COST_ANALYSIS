/**
 * @fileoverview 랜딩 경로 결정 (11.4)
 * @description `/`, `*` 진입 시 canRead('DASHBOARD') 면 대시보드, 아니면 표시 가능한 첫 메뉴,
 *   그것도 없으면 /no-access 로 보낸다.
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { usePermissionContext } from './PermissionContext';
import type { MenuNode } from '../system/types';

function findFirstPath(menus: MenuNode[]): string | null {
  for (const menu of menus) {
    if (menu.path) return menu.path;
    if (menu.children) {
      const childPath = findFirstPath(menu.children);
      if (childPath) return childPath;
    }
  }
  return null;
}

const HomeRedirect: React.FC = () => {
  const { loading, error, permissions, menus, hasAnyMenu, refresh } = usePermissionContext();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // 🐛 fix: 권한 조회가 "실패"한 것과 권한이 "없는" 것은 다르다.
  //   error 를 확인하지 않으면 네트워크/서버 오류인데도 /no-access 로 보내
  //   "권한 부여를 요청하세요"라는 엉뚱한 안내를 하게 된다. ProtectedRoute 와 동일하게 처리한다.
  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2 }}>
        <Typography color="error">{error}</Typography>
        <Button variant="outlined" startIcon={<Refresh />} onClick={() => refresh()}>다시 시도</Button>
      </Box>
    );
  }

  if (permissions['DASHBOARD']?.canRead) {
    return <Navigate to="/dashboard" replace />;
  }
  if (hasAnyMenu) {
    const firstPath = findFirstPath(menus);
    if (firstPath) return <Navigate to={firstPath} replace />;
  }
  return <Navigate to="/no-access" replace />;
};

export default HomeRedirect;
