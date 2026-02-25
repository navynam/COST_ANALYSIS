/**
 * @fileoverview 견적서 관련 타입 정의
 * @description 파싱, 업로드, 검증 등 견적서 처리에 필요한 타입
 */

/** 파싱된 견적서 항목 */
export interface EstimateItem {
  original_name: string;
  amount: number;
  unit_price?: number;
  quantity?: number;
  section?: string;
  row_number?: number;
  sheet_name?: string;
  note?: string;
}

/** 견적서 목록 아이템 */
export interface Estimate {
  id: number;
  file_name: string;
  file_size: number;
  company_name?: string;
  item_count: number;
  total_amount: number;
  status: string;
  upload_date?: string;
  created_at?: string;
}

/** 업로드 큐 아이템 */
export interface UploadQueueItem {
  file: File;
  status: 'pending' | 'uploading' | 'parsing' | 'done' | 'error';
  progress: number;
  error?: string;
}

/** 상태별 설정 (라벨, 색상) */
export interface StatusConfig {
  label: string;
  color: 'success' | 'error' | 'warning' | 'info' | 'default';
}

/** 대시보드 요약 데이터 */
export interface DashboardSummary {
  totalEstimates: number;
  verificationRate: number;
  anomalies: number;
  mappingAccuracy: number;
}

/** 최근 작업 아이템 */
export interface RecentItem {
  id: number;
  filename: string;
  company: string;
  status: string;
  items: number;
  amount: number;
  date: string;
}
