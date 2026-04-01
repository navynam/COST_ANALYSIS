import { useState } from 'react';

export const useSettingsPage = () => {
  const [profile, setProfile] = useState({ name: '관리자', department: '구매본부', phone: '010-1234-5678' });
  const [password, setPassword] = useState({ current: '', new_: '', confirm: '' });
  const [notifications, setNotifications] = useState({ email: true, inApp: true });
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

  return {
    profile, setProfile,
    password, setPassword,
    notifications, setNotifications,
    language, setLanguage,
    snackbar, setSnackbar,
    handleSave, handlePasswordChange,
  };
};
