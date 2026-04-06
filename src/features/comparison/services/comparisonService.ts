/**
 * @fileoverview 비교 분석 서비스 레이어
 * @description 제품 검색 및 견적 데이터 로직을 hooks에서 분리
 */

import { mockProducts, mockQuotations } from '../data/mockData';

// ── 데이터 조회 로직 ──

/** 제품명/ID로 필터링된 제품 목록 반환 */
export const filterProducts = (searchQuery: string) => {
  const q = searchQuery.toLowerCase();
  return mockProducts.filter(p =>
    !q || p.id.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)
  );
};

/** 선택된 제품의 견적 목록 조회 */
export const getQuotationsForProduct = (productId: string | null) => {
  return productId ? mockQuotations[productId] || [] : [];
};

/** 선택 단계 계산 (0: 제품 미선택, 1: 견적 선택중, 2: 비교 진행) */
export const calculateSelectionStep = (
  selectedProduct: string | null,
  showComparison: boolean
): number => {
  if (!selectedProduct) return 0;
  if (!showComparison) return 1;
  return 2;
};

/** 견적 선택 토글 (최대 4개) */
export const toggleQuotationSelection = (
  selectedQuotations: string[],
  quotationId: string,
  maxCount = 4
): string[] => {
  if (selectedQuotations.includes(quotationId)) {
    return selectedQuotations.filter(id => id !== quotationId);
  } else if (selectedQuotations.length < maxCount) {
    return [...selectedQuotations, quotationId];
  }
  return selectedQuotations;
};

// 향후 API 연동 시 확장 예정
/** 비교 분석 결과 조회 (현재 mock) */
export const loadComparisonResult = async (_quotationIds: string[]) => {
  // TODO: 실제 API 연동 시 서버에서 비교 결과 조회
  return null;
};
