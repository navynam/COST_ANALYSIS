/**
 * @fileoverview 히스토리 서비스 레이어
 * @description 히스토리 필터링 및 알림 로직을 hooks에서 분리
 */

import type { HistoryItem, NotificationItem } from '../hooks/useHistoryPage';

// ── 데이터 필터 로직 ──

/** 타입 필터 적용하여 히스토리 목록 반환 */
export const filterHistory = (historyData: HistoryItem[], typeFilter: string): HistoryItem[] => {
  return typeFilter === '전체' ? historyData : historyData.filter(h => h.type === typeFilter);
};

/** 읽지 않은 알림 수 계산 */
export const countUnread = (notifications: NotificationItem[]): number => {
  return notifications.filter(n => !n.read).length;
};

/** 모든 알림을 읽음 처리 */
export const markAllAsRead = (notifications: NotificationItem[]): NotificationItem[] => {
  return notifications.map(n => ({ ...n, read: true }));
};

// 향후 API 연동 시 확장 예정
/** 히스토리 데이터 서버에서 로드 (현재 mock) */
export const loadHistory = async (): Promise<HistoryItem[]> => {
  // TODO: 실제 API 연동 시 서버에서 히스토리 조회
  return [];
};
