import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../AuthContext';
import type { LoginForm } from '../types';
import { authenticate, getSsoConfig } from '../services/authService';
import { findMockEmployeeByEmployeeId, ssoLogin } from '../../system/services/employeeService';

export const useLoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const [showPassword, setShowPassword] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);
  const [ssoDialogOpen, setSsoDialogOpen] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);
  const [ssoEnabled, setSsoEnabled] = useState(false);

  // 로그인 화면의 SSO 버튼 노출 여부 (10.7 GET /auth/sso/config)
  useEffect(() => {
    getSsoConfig().then(cfg => setSsoEnabled(cfg.enabled)).catch(() => setSsoEnabled(false));
  }, []);

  /** mock 사원 정보를 AuthContext user 로 확장 (권한 조회의 근거) */
  const loginWithEmployeeLookup = (employeeId: string, fallbackName: string) => {
    const emp = findMockEmployeeByEmployeeId(employeeId);
    login({
      id: employeeId,
      name: emp?.name || fallbackName,
      employeeId,
      departmentName: emp?.departmentName,
      positionName: emp?.positionName,
      roles: emp ? [emp.roleCode] : undefined,
    });
    navigate('/');
  };

  const onSubmit = async (data: LoginForm) => {
    if (locked) return;
    const result = await authenticate(data.employeeId, data.password, failCount);
    if (result.success) {
      setError('');
      setFailCount(0);
      loginWithEmployeeLookup(data.employeeId, 'HANY');
    } else {
      setFailCount(result.failCount);
      setLocked(result.locked);
      setError(result.errorMessage);
    }
  };

  /** SSO 로그인 (mock JIT provisioning, 8장) */
  const handleSsoLogin = async (employeeId: string) => {
    if (!employeeId.trim()) return;
    setSsoLoading(true);
    try {
      const { employee } = await ssoLogin(employeeId.trim());
      login({
        id: employee.employeeId,
        name: employee.name,
        employeeId: employee.employeeId,
        departmentName: employee.departmentName,
        positionName: employee.positionName,
        roles: [employee.roleCode],
      });
      setSsoDialogOpen(false);
      navigate('/');
    } catch (e) {
      setError('SSO 로그인에 실패했습니다.');
    } finally {
      setSsoLoading(false);
    }
  };

  return {
    register, handleSubmit, errors,
    showPassword, setShowPassword,
    error, locked, onSubmit,
    ssoDialogOpen, setSsoDialogOpen, ssoLoading, handleSsoLogin, ssoEnabled,
  };
};
