/**
 * @fileoverview 인증 관련 타입 정의
 * @description 로그인, OTP, 사용자 정보 등 인증 흐름에 필요한 타입
 */

/** 인증 상태 */
export interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
}

/** 사용자 기본 정보 */
export interface UserInfo {
  id: string;
  name: string;
}

/** 인증 컨텍스트 타입 */
export interface AuthContextType extends AuthState {
  login: (user: UserInfo) => void;
  logout: () => void;
  setOtpVerified: () => void;
  isOtpVerified: boolean;
}

/** 로그인 폼 데이터 */
export interface LoginForm {
  employeeId: string;
  password: string;
}
