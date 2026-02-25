/**
 * @fileoverview 인증 API 서비스
 * @description 로그인, OTP 인증, 토큰 갱신 등 인증 관련 API 호출
 */
import api from './api';

export const authAPI = {
  /** 사번/비밀번호 로그인 */
  login: (employee_id: string, password: string) =>
    api.post('/auth/login', { employee_id, password }),

  /** OTP 코드 검증 */
  verifyOtp: (otp_code: string) =>
    api.post('/auth/otp/verify', { otp_code }),

  /** OTP 재발송 요청 */
  resendOtp: () =>
    api.post('/auth/otp/resend'),
};
