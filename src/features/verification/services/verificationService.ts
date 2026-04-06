/**
 * @fileoverview 검증 페이지 서비스 레이어
 * @description 검증 데이터의 집계 로직을 hooks에서 분리
 */

import { mockVerificationData } from '../data/mockData';
import type { VerificationItem } from '../types';

// ── 데이터 집계 로직 ──

/** 상태별 검증 항목 수 계산 */
export const calculateVerificationCounts = () => {
  const totalCorrect = mockVerificationData.filter(item => item.status === 'correct').length;
  const totalWarning = mockVerificationData.filter(item => item.status === 'warning').length;
  const totalError = mockVerificationData.filter(item => item.status === 'error').length;
  return { totalCorrect, totalWarning, totalError };
};

/** 검증 데이터 목록 로드 */
export const loadVerificationData = (): VerificationItem[] => {
  // 향후 API 연동 시 서버에서 조회
  return mockVerificationData;
};

// 향후 API 연동 시 확장 예정
/** 수정된 검증 값 저장 (현재 mock) */
export const saveCorrectedValue = async (_itemId: string, _value: string): Promise<void> => {
  // TODO: 실제 API 연동 시 서버에 수정값 전송
};
