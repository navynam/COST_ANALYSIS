/**
 * @fileoverview 설정 서비스 레이어
 * @description 설정 검증 및 저장 로직을 hooks에서 분리
 */

// ── 검증 로직 ──

export interface PasswordValidationResult {
  valid: boolean;
  errorMessage: string;
}

/** 비밀번호 변경 유효성 검증 */
export const validatePasswordChange = (newPassword: string, confirmPassword: string): PasswordValidationResult => {
  if (newPassword !== confirmPassword) {
    return { valid: false, errorMessage: '새 비밀번호가 일치하지 않습니다.' };
  }
  if (newPassword.length < 8) {
    return { valid: false, errorMessage: '비밀번호는 8자 이상이어야 합니다.' };
  }
  return { valid: true, errorMessage: '' };
};

// 향후 API 연동 시 확장 예정
/** 프로필 설정 저장 (현재 mock) */
export const saveProfile = async (_profile: { name: string; department: string; phone: string }): Promise<void> => {
  // TODO: 실제 API 연동 시 서버에 프로필 저장
};

/** 비밀번호 변경 요청 (현재 mock) */
export const changePassword = async (_currentPassword: string, _newPassword: string): Promise<void> => {
  // TODO: 실제 API 연동 시 서버에 비밀번호 변경 요청
};
