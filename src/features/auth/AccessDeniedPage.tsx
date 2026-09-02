/**
 * @fileoverview 접근 거부 화면 (/403, 9.5)
 * @description 라우트 가드가 리다이렉트 대신 렌더링하는 화면. URL 은 원래 경로를 유지한다.
 */
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Button, Stack } from '@mui/material';
import { Block, Home, ArrowBack } from '@mui/icons-material';
import { usePermissionContext } from './PermissionContext';

const AccessDeniedPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { permissions } = usePermissionContext();
  const canGoDashboard = permissions['DASHBOARD']?.canRead ?? false;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
      <Paper sx={{ p: 5, borderRadius: 3, textAlign: 'center', maxWidth: 440 }}>
        <Block sx={{ fontSize: 56, color: '#c62828', mb: 2 }} />
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>접근 권한이 없습니다</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          요청 경로: <code>{location.pathname}</code>
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          권한이 필요하면 시스템관리자에게 문의하세요.
        </Typography>
        <Stack direction="row" spacing={1.5} justifyContent="center">
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate(-1)}>이전 화면으로</Button>
          {canGoDashboard && (
            <Button variant="contained" startIcon={<Home />} onClick={() => navigate('/dashboard')}
              sx={{ bgcolor: '#003875', '&:hover': { bgcolor: '#002855' } }}>
              대시보드로 이동
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default AccessDeniedPage;
