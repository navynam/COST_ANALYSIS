/**
 * @fileoverview 인증 서비스 레이어
 * @description 로그인 검증 로직을 hooks에서 분리, 향후 API 전환 대비
 */

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
