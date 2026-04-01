/**
 * @fileoverview 설정 페이지
 * @description 프로필 수정, 비밀번호 변경, 알림/테마/언어 설정
 */
import React from 'react';
import {
  Box, Paper, Typography, TextField, Button, Switch, FormControlLabel,
  Select, MenuItem, FormControl, InputLabel, Alert, Snackbar,
  Card, CardContent, Chip, ToggleButtonGroup, ToggleButton, Divider
} from '@mui/material';
import { 
  Settings as SettingsIcon, 
  Save,
  Palette as PaletteIcon,
  Business as BusinessIcon,
  Favorite as FavoriteIcon
} from '@mui/icons-material';
import { useSettingsPage } from './hooks/useSettingsPage';
import { useTheme, ThemeType, getThemeInfo } from '../../shared/contexts/ThemeContext';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Paper sx={{ p: 3, mb: 2 }}>
    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>{title}</Typography>
    {children}
  </Paper>
);

const SettingsPage: React.FC = () => {
  const {
    profile, setProfile,
    password, setPassword,
    notifications, setNotifications,
    language, setLanguage,
    snackbar, setSnackbar,
    handleSave, handlePasswordChange,
  } = useSettingsPage();

  // 🎨 테마 컨텍스트
  const { currentTheme, setTheme } = useTheme();

  // 🎨 테마 변경 핸들러
  const handleThemeChange = (
    event: React.MouseEvent<HTMLElement>,
    newTheme: ThemeType | null
  ) => {
    if (newTheme !== null) {
      setTheme(newTheme);
      setSnackbar({
        open: true,
        message: `${getThemeInfo(newTheme).name}로 변경되었습니다!`
      });
    }
  };

  return (
    <Box sx={{ maxWidth: 700 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <SettingsIcon sx={{ color: '#e60012' }} />
        <Typography variant="h5" fontWeight={700}>설정</Typography>
      </Box>

      <Section title="프로필">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="이름" size="small" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
          <TextField label="부서" size="small" value={profile.department} onChange={e => setProfile(p => ({ ...p, department: e.target.value }))} />
          <TextField label="연락처" size="small" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
        </Box>
      </Section>

      <Section title="비밀번호 변경">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="현재 비밀번호" type="password" size="small" value={password.current} onChange={e => setPassword(p => ({ ...p, current: e.target.value }))} />
          <TextField label="새 비밀번호" type="password" size="small" value={password.new_} onChange={e => setPassword(p => ({ ...p, new_: e.target.value }))} />
          <TextField label="비밀번호 확인" type="password" size="small" value={password.confirm} onChange={e => setPassword(p => ({ ...p, confirm: e.target.value }))} />
          <Button variant="outlined" onClick={handlePasswordChange} sx={{ alignSelf: 'flex-start' }}>비밀번호 변경</Button>
        </Box>
      </Section>

      <Section title="알림 설정">
        <FormControlLabel control={<Switch checked={notifications.email} onChange={e => setNotifications(n => ({ ...n, email: e.target.checked }))} />} label="이메일 알림" />
        <FormControlLabel control={<Switch checked={notifications.inApp} onChange={e => setNotifications(n => ({ ...n, inApp: e.target.checked }))} />} label="인앱 알림" />
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

      <Section title="🎨 테마 설정">
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            견적서 분석 시스템의 테마를 선택하세요. 언제든지 변경할 수 있습니다.
          </Typography>
          
          {/* 테마 토글 버튼 */}
          <ToggleButtonGroup
            value={currentTheme}
            exclusive
            onChange={handleThemeChange}
            size="medium"
            sx={{ mb: 3 }}
          >
            <ToggleButton value="hyundai" sx={{ px: 3, py: 2 }}>
              <BusinessIcon sx={{ mr: 1 }} />
              현대모비스 테마
            </ToggleButton>
            <ToggleButton value="toss" sx={{ px: 3, py: 2 }}>
              <FavoriteIcon sx={{ mr: 1 }} />
              Toss 스타일 테마
            </ToggleButton>
          </ToggleButtonGroup>

          {/* 현재 테마 정보 */}
          <Box sx={{ display: 'flex', gap: 3 }}>
            {/* 현재 테마 카드 */}
            <Card sx={{ 
              flex: 1, 
              border: '2px solid',
              borderColor: 'primary.main',
              bgcolor: 'primary.light',
              color: 'primary.contrastText'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <PaletteIcon />
                  <Typography variant="h6" fontWeight={600}>
                    현재 테마
                  </Typography>
                  <Chip 
                    label="적용됨" 
                    size="small" 
                    color="success"
                  />
                </Box>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  {getThemeInfo(currentTheme).name}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {getThemeInfo(currentTheme).description}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" fontWeight={600}>
                    특징:
                  </Typography>
                  {getThemeInfo(currentTheme).characteristics.map((characteristic, index) => (
                    <Typography 
                      key={index}
                      variant="caption" 
                      display="block" 
                      sx={{ opacity: 0.8, fontSize: '0.75rem' }}
                    >
                      • {characteristic}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* 다른 테마 미리보기 */}
            <Card sx={{ 
              flex: 1, 
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <PaletteIcon color="action" />
                  <Typography variant="h6" fontWeight={600} color="text.secondary">
                    다른 테마
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  {getThemeInfo(currentTheme === 'hyundai' ? 'toss' : 'hyundai').name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {getThemeInfo(currentTheme === 'hyundai' ? 'toss' : 'hyundai').description}
                </Typography>
                <Button 
                  size="small" 
                  variant="outlined" 
                  sx={{ mt: 2 }}
                  onClick={() => {
                    const newTheme = currentTheme === 'hyundai' ? 'toss' : 'hyundai';
                    setTheme(newTheme);
                    setSnackbar({
                      open: true,
                      message: `${getThemeInfo(newTheme).name}로 변경되었습니다!`
                    });
                  }}
                >
                  이 테마로 변경
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />
        
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            💡 <strong>팁:</strong> 테마는 실시간으로 적용되며, 모든 페이지에서 동일하게 표시됩니다. 
            검증 페이지에서 파싱 결과를 확인할 때도 선택한 테마가 적용됩니다.
          </Typography>
        </Alert>
      </Section>

      <Button variant="contained" startIcon={<Save />} onClick={handleSave} size="large"
        sx={{ bgcolor: '#e60012', '&:hover': { bgcolor: '#cc0010' } }}>
        설정 저장
      </Button>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSnackbar(s => ({ ...s, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPage;
