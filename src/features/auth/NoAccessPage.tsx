/**
 * @fileoverview 가용 메뉴 없음 화면 (/no-access, 9.6)
 * @description 로그인은 성공했으나 canRead=true 인 메뉴가 0개인 경우 표시된다.
 */
import React from 'react';
import { Box, Paper, Typography, Button, Stack } from '@mui/material';
import { PersonOff, Logout, Refresh } from '@mui/icons-material';
import { useAuth } from './AuthContext';
import { usePermissionContext } from './PermissionContext';

const NoAccessPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { refresh } = usePermissionContext();

  const handleLogout = () => {
    logout();
    window.location.href = '/COST_ANALYSIS/#/login';
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', bgcolor: '#F5F7FA' }}>
      <Paper sx={{ p: 5, borderRadius: 3, textAlign: 'center', maxWidth: 460 }}>
        <PersonOff sx={{ fontSize: 56, color: '#546e7a', mb: 2 }} />
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>사용 가능한 메뉴가 없습니다</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          권한 부여를 요청하세요. 아래 정보를 시스템관리자에게 전달하면 빠르게 처리됩니다.
        </Typography>
        <Box sx={{ bgcolor: '#f5f5f5', borderRadius: 2, p: 2, mb: 3, textAlign: 'left' }}>
          <Typography variant="body2"><strong>사번:</strong> {user?.employeeId || user?.id || '-'}</Typography>
          <Typography variant="body2"><strong>이름:</strong> {user?.name || '-'}</Typography>
          <Typography variant="body2"><strong>부서:</strong> {user?.departmentName || '-'}</Typography>
          <Typography variant="body2"><strong>직위:</strong> {user?.positionName || '-'}</Typography>
        </Box>
        <Stack direction="row" spacing={1.5} justifyContent="center">
          <Button variant="outlined" startIcon={<Refresh />} onClick={() => refresh()}>새로고침</Button>
          <Button variant="contained" startIcon={<Logout />} onClick={handleLogout}
            sx={{ bgcolor: '#003875', '&:hover': { bgcolor: '#002855' } }}>
            로그아웃
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default NoAccessPage;
