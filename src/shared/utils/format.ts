/**
 * 🎨 포맷팅 유틸리티
 * 
 * @description 숫자, 통화, 퍼센트 등의 포맷팅 함수들을 제공합니다.
 * @author PM 단무지
 * @since 2026-03-30
 */

/**
 * 숫자를 한국 통화 형식으로 포맷팅
 * @param value 숫자 값
 * @param showSymbol 통화 기호 표시 여부 (기본: false)
 * @returns 포맷된 문자열
 * @example formatCurrency(1000000) // "1,000,000"
 * @example formatCurrency(1000000, true) // "₩1,000,000"
 */
export const formatCurrency = (value: number | string, showSymbol = false): string => {
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value;
  
  if (isNaN(numValue)) return '0';
  
  const formatted = numValue.toLocaleString('ko-KR');
  return showSymbol ? `₩${formatted}` : formatted;
};

/**
 * 퍼센트 값을 포맷팅
 * @param value 퍼센트 값
 * @param decimals 소수점 자릿수 (기본: 1)
 * @returns 포맷된 문자열
 * @example formatPercent(15.678) // "15.7%"
 */
export const formatPercent = (value: number | string, decimals = 1): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0%';
  
  return `${numValue.toFixed(decimals)}%`;
};

/**
 * 큰 숫자를 K, M 단위로 축약
 * @param value 숫자 값
 * @returns 축약된 문자열
 * @example formatNumber(1500) // "1.5K"
 * @example formatNumber(2500000) // "2.5M"
 */
export const formatNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};

/**
 * 신뢰도에 따른 색상 반환
 * @param confidence 신뢰도 (0-100)
 * @returns 색상 코드
 */
export const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 90) return '#4caf50'; // 녹색
  if (confidence >= 70) return '#ff9800'; // 주황색
  return '#f44336'; // 빨간색
};

/**
 * 차이율에 따른 색상 반환
 * @param diffPercent 차이율
 * @param thresholds 임계값 { warning: number, error: number }
 * @returns MUI 색상 타입
 */
export const getDiffColor = (
  diffPercent: number, 
  thresholds = { warning: 10, error: 20 }
): 'success' | 'warning' | 'error' => {
  if (diffPercent <= thresholds.warning) return 'success';
  if (diffPercent <= thresholds.error) return 'warning';
  return 'error';
};