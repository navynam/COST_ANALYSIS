/**
 * @fileoverview 로그인 페이지
 * @description 사번/비밀번호 기반 로그인. 5회 실패 시 계정 잠금 처리.
 */
import React from 'react';
import {
  Box, Card, CardContent, TextField, Button, Typography, Link, Alert, InputAdornment, IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, Person, Lock } from '@mui/icons-material';
import { useLoginPage } from './hooks/useLoginPage';

const LoginPage: React.FC = () => {
  const {
    register, handleSubmit, errors,
    showPassword, setShowPassword,
    error, locked, onSubmit,
  } = useLoginPage();

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #003875 50%, #0056A6 100%)',
    }}>
      <Card sx={{ width: 420, borderRadius: 3, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'visible' }}>
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
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
