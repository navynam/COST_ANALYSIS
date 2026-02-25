/**
 * @fileoverview 설정 페이지
 * @description 프로필 수정, 비밀번호 변경, 알림/테마/언어 설정
 */
import React, { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Switch, FormControlLabel,
  Select, MenuItem, FormControl, InputLabel, Alert, Snackbar,
} from '@mui/material';
import { Settings as SettingsIcon, Save } from '@mui/icons-material';

const Settings: React.FC = () => {
  const [profile, setProfile] = useState({ name: '관리자', department: '구매본부', phone: '010-1234-5678' });
  const [password, setPassword] = useState({ current: '', new_: '', confirm: '' });
  const [notifications, setNotifications] = useState({ email: true, inApp: true });
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('ko');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const handleSave = () => setSnackbar({ open: true, message: '설정이 저장되었습니다.' });
  const handlePasswordChange = () => {
    if (password.new_ !== password.confirm) {
      setSnackbar({ open: true, message: '새 비밀번호가 일치하지 않습니다.' });
      return;
    }
    if (password.new_.length < 8) {
      setSnackbar({ open: true, message: '비밀번호는 8자 이상이어야 합니다.' });
      return;
    }
    setPassword({ current: '', new_: '', confirm: '' });
    setSnackbar({ open: true, message: '비밀번호가 변경되었습니다.' });
  };

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>{title}</Typography>
      {children}
    </Paper>
  );

  return (
    <Box sx={{ maxWidth: 700 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <SettingsIcon sx={{ color: '#003875' }} />
        <Typography variant="h5" fontWeight={700}>설정</Typography>
      </Box>

      <Section title="프로필">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="이름" size="small" value={profile.name}
            onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
          <TextField label="부서" size="small" value={profile.department}
            onChange={e => setProfile(p => ({ ...p, department: e.target.value }))} />
          <TextField label="연락처" size="small" value={profile.phone}
            onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
        </Box>
      </Section>

      <Section title="비밀번호 변경">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="현재 비밀번호" type="password" size="small" value={password.current}
            onChange={e => setPassword(p => ({ ...p, current: e.target.value }))} />
          <TextField label="새 비밀번호" type="password" size="small" value={password.new_}
            onChange={e => setPassword(p => ({ ...p, new_: e.target.value }))} />
          <TextField label="비밀번호 확인" type="password" size="small" value={password.confirm}
            onChange={e => setPassword(p => ({ ...p, confirm: e.target.value }))} />
          <Button variant="outlined" onClick={handlePasswordChange} sx={{ alignSelf: 'flex-start' }}>
            비밀번호 변경
          </Button>
        </Box>
      </Section>

      <Section title="알림 설정">
        <FormControlLabel control={<Switch checked={notifications.email}
          onChange={e => setNotifications(n => ({ ...n, email: e.target.checked }))} />}
          label="이메일 알림" />
        <FormControlLabel control={<Switch checked={notifications.inApp}
          onChange={e => setNotifications(n => ({ ...n, inApp: e.target.checked }))} />}
          label="인앱 알림" />
      </Section>

      <Section title="테마">
        <FormControlLabel control={<Switch checked={darkMode} onChange={e => setDarkMode(e.target.checked)} />}
          label={darkMode ? '다크 모드' : '라이트 모드'} />
      </Section>

      <Section title="언어">
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>언어</InputLabel>
          <Select value={language} label="언어" onChange={e => setLanguage(e.target.value)}>
            <MenuItem value="ko">한국어</MenuItem>
            <MenuItem value="en">English</MenuItem>
          </Select>
        </FormControl>
      </Section>

      <Button variant="contained" startIcon={<Save />} onClick={handleSave} size="large"
        sx={{ bgcolor: '#003875', '&:hover': { bgcolor: '#002a5c' } }}>
        설정 저장
      </Button>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSnackbar(s => ({ ...s, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
