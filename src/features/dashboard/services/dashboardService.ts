/**
 * @fileoverview 대시보드 서비스 레이어
 * @description 향후 API 연동 시 확장 예정
 */

import apiClient from '../../../shared/api/apiClient';
import { USE_API } from '../../../shared/api/config';

// 향후 API 연동 시 확장 예정
// 현재 대시보드 훅은 UI 상태만 관리하며, 데이터 로직은 별도로 없음.
// API 연동 시 아래 함수들을 확장하여 사용합니다.

/** 대시보드 요약 데이터 로드 (향후 API 전환) */
export const loadDashboardSummary = async (_period: string) => {
  // TODO: 실제 API 연동 시 서버에서 대시보드 데이터 조회
  return null;
};

// ── API 호출 함수 ──

/** 대시보드 통계 데이터 API 조회 */
export const fetchDashboardStatsApi = async () => {
  const res = await apiClient.get('/dashboard/stats');
  return res.data.data || res.data;
};

// ── 통합 함수 ──

/** 대시보드 통계 데이터 조회 (API 우선, 실패 시 로컬 fallback) */
export const getDashboardStats = async (period: string = 'month') => {
  if (USE_API) {
    try {
      return await fetchDashboardStatsApi();
    } catch {
      return loadDashboardSummary(period);
    }
  }
  return loadDashboardSummary(period);
};
