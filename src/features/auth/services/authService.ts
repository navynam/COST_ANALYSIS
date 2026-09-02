/**
 * @fileoverview 인증 서비스 레이어
 * @description 로그인 검증 로직을 hooks에서 분리, 향후 API 전환 대비
 */

import apiClient from '../../../shared/api/apiClient';
import { USE_API } from '../../../shared/api/config';

// ── 인증 로직 ──

const MAX_FAIL_COUNT = 5;

/** 로그인 시도 결과 */
export interface LoginResult {
  success: boolean;
  locked: boolean;
  errorMessage: string;
  failCount: number;
}

/** 로그인 검증 (향후 API 전환 예정) */
export const authenticate = async (
  employeeId: string,
  password: string,
  currentFailCount: number
): Promise<LoginResult> => {
  // TODO: 실제 API 연동 시 서버 인증으로 전환
  if (employeeId && password) {
    return { success: true, locked: false, errorMessage: '', failCount: 0 };
  }

  const newCount = currentFailCount + 1;
  if (newCount >= MAX_FAIL_COUNT) {
    return {
      success: false,
      locked: true,
      errorMessage: '로그인 5회 실패로 계정이 잠겼습니다. 관리자에게 문의하세요.',
      failCount: newCount,
    };
  }

  return {
    success: false,
    locked: false,
    errorMessage: `아이디 또는 비밀번호가 올바르지 않습니다. (${newCount}/${MAX_FAIL_COUNT})`,
    failCount: newCount,
  };
};

// ── API 호출 함수 ──

/** 로그인 API 호출 */
export const loginApi = async (
  employeeId: string,
  password: string
): Promise<LoginResult> => {
  const res = await apiClient.post('/auth/login', { employeeId, password });
  const { token, ...result } = res.data.data || res.data;
  if (token) {
    localStorage.setItem('access_token', token);
  }
  return { success: true, locked: false, errorMessage: '', failCount: 0, ...result };
};

// ── 통합 함수 ──

/** 로그인 (API 우선, 실패 시 로컬 fallback) */
export const login = async (
  employeeId: string,
  password: string,
  currentFailCount: number
): Promise<LoginResult> => {
  if (USE_API) {
    try {
      return await loginApi(employeeId, password);
    } catch {
      return authenticate(employeeId, password, currentFailCount);
    }
  }
  return authenticate(employeeId, password, currentFailCount);
};

// ── SSO 설정 조회 (8장) ──

/** SSO 활성화 여부. mock 모드/백엔드 미구현 시에는 mock provider 가 항상 활성인 것으로 간주 */
export interface SsoConfig {
  enabled: boolean;
  providerType: string;
  loginUrl: string | null;
}

const MOCK_SSO_CONFIG: SsoConfig = { enabled: true, providerType: 'mock', loginUrl: null };

export const getSsoConfigApi = async (): Promise<SsoConfig> => {
  const res = await apiClient.get('/auth/sso/config');
  return res.data.data || res.data;
};

export const getSsoConfig = async (): Promise<SsoConfig> => {
  if (USE_API) {
    try {
      return await getSsoConfigApi();
    } catch {
      return MOCK_SSO_CONFIG;
    }
  }
  return MOCK_SSO_CONFIG;
};

// ── SSO 로그인 API 호출 (JIT provisioning 은 system/employeeService.ssoLogin 에서 mock 으로 처리) ──

/** SSO 로그인 API 응답 (기존 LoginResponse 확장, 10.7) */
export interface SsoLoginApiResult {
  employeeId: string;
  name: string;
  departmentName?: string;
  positionName?: string;
  roleCode: string;
  provisioned: boolean;
}

export const ssoLoginApi = async (ssoToken: string): Promise<SsoLoginApiResult> => {
  const res = await apiClient.post('/auth/sso/login', { ssoToken });
  const { token, ...result } = res.data.data || res.data;
  if (token) localStorage.setItem('access_token', token);
  return result;
};
