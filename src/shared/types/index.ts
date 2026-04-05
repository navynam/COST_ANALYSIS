/**
 * 공통 타입 시스템 - 단일 진입점
 *
 * 프로젝트 전반의 공용 타입은 모두 이 파일을 통해 import합니다.
 * Feature별 특화 타입은 각 feature 폴더의 types.ts를 사용하세요.
 *
 * 사용법:
 *   import { CostItem, ItemStatus, Quotation } from '../../shared/types';
 *
 * 포함 범위:
 *   - shared/types/common.ts  : 견적서·비용·셀 등 핵심 도메인 타입
 *   - src/types/auth.ts       : 인증 관련 타입
 *   - src/types/common.ts     : 채팅·이력 등 범용 타입
 *   - src/types/estimate.ts   : 파싱·업로드·대시보드 타입
 *   - src/types/mapping.ts    : 표준항목 매핑 타입
 */

// 핵심 도메인 타입 (신규)
export * from './common';

// 레거시 타입 → shared/types 로 흡수 (기존 src/types/* 에서 이동)
export type { AuthState, AuthContextType, UserInfo, LoginForm } from '../../types/auth';
export type {
  Message,
  InsightSession,
  HistoryItem,
  NotificationItem,
  CostItemHistory,
} from '../../types/common';
// CostItem이 common.ts(신규)에도 있으므로 estimate.ts의 것은 제외하고 나머지만 re-export
export type {
  EstimateItem,
  Estimate,
  UploadQueueItem,
  StatusConfig,
  DashboardSummary,
  RecentItem,
} from '../../types/estimate';
export type { MappingItem, MappingSummary } from '../../types/mapping';
