/**
 * @fileoverview OTP 인증 페이지
 * @description 6자리 OTP 입력, 타이머, 재발송 기능. 로그인 후 2차 인증 단계.
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Button, Link, Alert } from '@mui/material';
import { PhoneAndroid } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const OTP_LENGTH = 6;
const TIMER_SECONDS = 180;

const OtpVerify: React.FC = () => {
  const navigate = useNavigate();
  const { setOtpVerified } = useAuth();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [error, setError] = useState('');
  const [resent, setResent] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = useCallback((s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const newOtp = [...otp];
    pasted.split('').forEach((ch, i) => { newOtp[i] = ch; });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      setError('인증번호 6자리를 모두 입력해주세요.');
      return;
    }
    if (timeLeft <= 0) {
      setError('인증 시간이 만료되었습니다. 재발송 후 다시 시도해주세요.');
      return;
    }
    try {
      // TODO: await authAPI.verifyOtp(code);
      setOtpVerified();
      navigate('/dashboard');
    } catch {
      setError('인증번호가 올바르지 않습니다.');
    }
  };

  const handleResend = () => {
    // TODO: await authAPI.resendOtp();
    setTimeLeft(TIMER_SECONDS);
    setOtp(Array(OTP_LENGTH).fill(''));
    setError('');
    setResent(true);
    inputRefs.current[0]?.focus();
    setTimeout(() => setResent(false), 3000);
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #003875 50%, #764ba2 100%)',
    }}>
      <Card sx={{ width: 420, borderRadius: 3, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <CardContent sx={{ p: 5, textAlign: 'center' }}>
          <Box sx={{
            width: 56, height: 56, mx: 'auto', mb: 2, borderRadius: '50%',
            bgcolor: '#E8EEF5', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <PhoneAndroid sx={{ color: '#003875', fontSize: 28 }} />
          </Box>

          <Typography variant="h6" fontWeight={700} gutterBottom>
            본인 인증
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            등록된 휴대폰으로 인증번호를 발송했습니다.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            📱 010-****-5678
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
          {resent && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>인증번호가 재발송되었습니다.</Alert>}

          {/* OTP 입력 */}
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 2 }} onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                style={{
                  width: 48, height: 56, textAlign: 'center', fontSize: 24, fontWeight: 700,
                  border: '2px solid #ddd', borderRadius: 10, outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = '#003875'; }}
                onBlur={e => { e.target.style.borderColor = '#ddd'; }}
              />
            ))}
          </Box>

          {/* 타이머 */}
          <Typography
            variant="h6"
            sx={{ color: timeLeft <= 30 ? '#e74c3c' : '#003875', fontWeight: 700, mb: 3 }}
          >
            {formatTime(timeLeft)}
          </Typography>

          <Button
            fullWidth variant="contained" size="large"
            onClick={handleVerify}
            sx={{
              py: 1.5, mb: 2, bgcolor: '#003875',
              '&:hover': { bgcolor: '#002855' },
              fontSize: 16, fontWeight: 600, borderRadius: 2,
            }}
          >
            인증 확인
          </Button>

          <Link
            component="button" variant="body2" underline="hover"
            onClick={handleResend} color="text.secondary"
          >
            인증번호 재발송
          </Link>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OtpVerify;
