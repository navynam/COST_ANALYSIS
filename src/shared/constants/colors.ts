/**
 * 🎨 컬러 시스템
 * 
 * @description 프로젝트 전반에서 사용되는 색상 상수들을 정의합니다.
 * @author PM 단무지
 * @since 2026-03-30
 */

/**
 * 메인 컬러 팔레트
 */
export const COLORS = {
  /** 기본 색상 */
  primary: '#0071e3',
  secondary: '#003875', 
  
  /** 상태 색상 */
  success: '#4caf50',
  warning: '#ff9800', 
  error: '#f44336',
  info: '#2196f3',
  
  /** 그레이 스케일 */
  dark: '#1d1d1f',
  gray: '#86868b',
  lightGray: '#e5e5e7',
  background: '#f5f5f7',
  
  /** 카테고리별 색상 */
  material: {
    main: '#0071e3',
    background: '#e8f4fd',
    light: '#f0f9ff'
  },
  process: {
    main: '#34c759', 
    background: '#e8fde8',
    light: '#f0fff4'
  },
  overhead: {
    main: '#ff3b30',
    background: '#fde8e8', 
    light: '#fff8f8'
  }
} as const;

/**
 * 상태별 색상 매핑
 */
export const STATUS_COLORS = {
  normal: {
    bg: '#e8f5e8',
    border: '#4caf50',
    text: '#2e7d32'
  },
  warning: {
    bg: '#fff8e1', 
    border: '#ff9800',
    text: '#ef6c00'
  },
  error: {
    bg: '#ffebee',
    border: '#f44336', 
    text: '#c62828'
  },
  anomaly: {
    bg: '#ffebee',
    border: '#f44336',
    text: '#c62828'
  }
} as const;

/**
 * 히트맵 색상 생성 함수
 * @param value 현재 값
 * @param min 최솟값
 * @param max 최댓값
 * @returns 배경색 코드
 */
export const getHeatmapColor = (value: number, min: number, max: number): string => {
  if (min === max) return 'transparent';
  
  const ratio = (value - min) / (max - min);
  
  if (value === min) return '#e8f5e8'; // 최솟값 (녹색)
  if (value === max) return '#ffebee'; // 최댓값 (빨간색)
  
  // 중간값들은 투명도로 표현
  const alpha = 0.1 + (ratio * 0.3);
  return `rgba(255, 152, 0, ${alpha})`; // 주황색 계열
};

export type StatusColorKey = keyof typeof STATUS_COLORS;

/**
 * 기존 코드 호환용 alias
 */
export const C = {
  blue: COLORS.primary,
  dark: COLORS.dark,
  gray: COLORS.gray,
  border: COLORS.lightGray,
  bg: COLORS.background,
  green: COLORS.success,
  orange: COLORS.warning,
  red: COLORS.error,
  purple: '#af52de',
  white: '#ffffff',
} as const;