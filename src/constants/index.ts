/**
 * @fileoverview 공통 상수 정의
 * @description 하드코딩된 값을 중앙 관리
 */

/** 현대모비스 브랜드 색상 */
export const BRAND_COLORS = {
  PRIMARY: '#003875',
  PRIMARY_DARK: '#002a5c',
  PRIMARY_HOVER: '#002855',
  BACKGROUND: '#F5F7FA',
  SIDEBAR_BG: '#0a1628',
} as const;

/** 파싱 상태 라벨 매핑 */
export const PARSING_STATUS_MAP: Record<string, { label: string; color: 'success' | 'error' | 'warning' | 'info' | 'default' }> = {
  uploading: { label: '업로드중', color: 'info' },
  parsing: { label: '파싱중', color: 'warning' },
  parsed: { label: '완료', color: 'success' },
  failed: { label: '실패', color: 'error' },
};

/** 매핑 상태 라벨 */
export const MAPPING_STATUS_LABELS: Record<string, string> = {
  auto_mapped: '자동매핑',
  needs_review: '검토필요',
  manual: '수동매핑',
};

/** 매핑 상태별 색상 */
export const MAPPING_STATUS_COLORS: Record<string, string> = {
  auto_mapped: '#4caf50',
  needs_review: '#ff9800',
  manual: '#f44336',
};

/** OTP 설정 */
export const OTP_LENGTH = 6;
export const OTP_TIMER_SECONDS = 180;

/** 페이지네이션 기본값 */
export const DEFAULT_PAGE_SIZE = 20;

/** 허용 파일 확장자 */
export const ALLOWED_FILE_EXTENSIONS = '.xlsx,.xls,.xlsm';
