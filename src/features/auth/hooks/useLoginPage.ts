import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../AuthContext';
import type { LoginForm } from '../types';
import { authenticate } from '../services/authService';

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
    const result = await authenticate(data.employeeId, data.password, failCount);
    if (result.success) {
      setError('');
      setFailCount(0);
      login({ id: data.employeeId, name: 'HANY' });
      navigate('/dashboard');
    } else {
      setFailCount(result.failCount);
      setLocked(result.locked);
      setError(result.errorMessage);
    }
  };

  return {
    register, handleSubmit, errors,
    showPassword, setShowPassword,
    error, locked, onSubmit,
  };
};
