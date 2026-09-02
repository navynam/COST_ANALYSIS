/**
 * @fileoverview 로그인 페이지
 * @description 사번/비밀번호 기반 로그인. 5회 실패 시 계정 잠금 처리.
 */
import React, { useState } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Typography, Link, Alert, InputAdornment, IconButton,
  Divider, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { Visibility, VisibilityOff, Person, Lock, Badge } from '@mui/icons-material';
import { useLoginPage } from './hooks/useLoginPage';
import styles from './LoginPage.module.css';

const LoginPage: React.FC = () => {
  const {
    register, handleSubmit, errors,
    showPassword, setShowPassword,
    error, locked, onSubmit,
    ssoDialogOpen, setSsoDialogOpen, ssoLoading, handleSsoLogin, ssoEnabled,
  } = useLoginPage();
  const [ssoEmployeeId, setSsoEmployeeId] = useState('');

  return (
    <Box className={styles.container}>
      <Card className={styles.card}>
        <CardContent sx={{ p: 5 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ width: 56, height: 56, mx: 'auto', mb: 2, background: 'linear-gradient(135deg, #003875, #0056A6)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: 20 }}>M</Typography>
            </Box>
            <Typography variant="h5" fontWeight={700} color="#1a1a2e">견적서 분석 시스템</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>구매원가 AI 분석 플랫폼</Typography>
          </Box>

          {error && (
            <Alert severity={locked ? 'error' : 'warning'} sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField fullWidth label="아이디 (사번)" placeholder="사번을 입력하세요"
              {...register('employeeId', { required: '사번을 입력해주세요' })}
              error={!!errors.employeeId} helperText={errors.employeeId?.message} disabled={locked} sx={{ mb: 2.5 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><Person color="action" /></InputAdornment> }} />
            <TextField fullWidth label="비밀번호" type={showPassword ? 'text' : 'password'} placeholder="비밀번호를 입력하세요"
              {...register('password', { required: '비밀번호를 입력해주세요' })}
              error={!!errors.password} helperText={errors.password?.message} disabled={locked} sx={{ mb: 3 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }} />
            <Button type="submit" fullWidth variant="contained" size="large" disabled={locked}
              sx={{ py: 1.5, mb: 2, bgcolor: '#003875', '&:hover': { bgcolor: '#002855' }, fontSize: 16, fontWeight: 600, borderRadius: 2 }}>
              로그인
            </Button>
          </form>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Link href="#" underline="hover" variant="body2" color="text.secondary">비밀번호 찾기</Link>
            <Typography variant="body2" color="text.disabled">|</Typography>
            <Link href="#" underline="hover" variant="body2" color="text.secondary">비밀번호 변경</Link>
          </Box>

          {ssoEnabled && (
            <>
              <Divider sx={{ my: 2.5 }}>또는</Divider>
              <Button fullWidth variant="outlined" size="large" startIcon={<Badge />}
                onClick={() => setSsoDialogOpen(true)}
                sx={{ py: 1.3, borderRadius: 2, fontWeight: 600 }}>
                SSO 로그인
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* SSO 로그인 (mock JIT provisioning) */}
      <Dialog open={ssoDialogOpen} onClose={() => setSsoDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>SSO 로그인</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            사번을 입력하면 SSO 프로필로 로그인합니다. 최초 로그인 사번은 자동으로 사원 등록(JIT)되며
            기본권한 규칙에 따라 권한이 자동 부여됩니다.
          </Typography>
          <TextField fullWidth autoFocus label="사번" placeholder="예: M20260901"
            value={ssoEmployeeId} onChange={e => setSsoEmployeeId(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Person color="action" /></InputAdornment> }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setSsoDialogOpen(false)}>취소</Button>
          <Button variant="contained" disabled={!ssoEmployeeId.trim() || ssoLoading}
            onClick={() => handleSsoLogin(ssoEmployeeId)}
            sx={{ bgcolor: '#003875', '&:hover': { bgcolor: '#002855' } }}>
            {ssoLoading ? '로그인 중...' : '로그인'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoginPage;
