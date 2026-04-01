import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../AuthContext';
import type { LoginForm } from '../types';

export const useLoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const [showPassword, setShowPassword] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);

  const onSubmit = async (data: LoginForm) => {
    if (locked) return;
    try {
      if (data.employeeId && data.password) {
        setError('');
        setFailCount(0);
        login({ id: data.employeeId, name: 'HANY' });
        navigate('/dashboard');
      }
    } catch (err: any) {
      const newCount = failCount + 1;
      setFailCount(newCount);
      if (newCount >= 5) {
        setLocked(true);
        setError('로그인 5회 실패로 계정이 잠겼습니다. 관리자에게 문의하세요.');
      } else {
        setError(`아이디 또는 비밀번호가 올바르지 않습니다. (${newCount}/5)`);
      }
    }
  };

  return {
    register, handleSubmit, errors,
    showPassword, setShowPassword,
    error, locked, onSubmit,
  };
};
