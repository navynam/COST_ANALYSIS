/**
 * @fileoverview 대시보드 서비스 레이어
 * @description 향후 API 연동 시 확장 예정
 */

// 향후 API 연동 시 확장 예정
// 현재 대시보드 훅은 UI 상태만 관리하며, 데이터 로직은 별도로 없음.
// API 연동 시 아래 함수들을 확장하여 사용합니다.

/** 대시보드 요약 데이터 로드 (향후 API 전환) */
export const loadDashboardSummary = async (_period: string) => {
  // TODO: 실제 API 연동 시 서버에서 대시보드 데이터 조회
  return null;
};
