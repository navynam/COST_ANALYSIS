/**
 * @fileoverview 히스토리 서비스 레이어
 * @description 히스토리 필터링 및 알림 로직을 hooks에서 분리
 */

import apiClient from '../../../shared/api/apiClient';
import { USE_API } from '../../../shared/api/config';
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

// ── API 호출 함수 ──

/** 알림 목록 API 조회 */
export const fetchNotificationsApi = async (): Promise<NotificationItem[]> => {
  const res = await apiClient.get('/notifications');
  return res.data.data || res.data;
};

/** 활동 내역 API 조회 */
export const fetchActivitiesApi = async (): Promise<HistoryItem[]> => {
  const res = await apiClient.get('/notifications/activities');
  return res.data.data || res.data;
};

/** 모든 알림 읽음 처리 API */
export const markAllReadApi = async (): Promise<void> => {
  await apiClient.put('/notifications/read-all');
};

// ── 통합 함수 ──

/** 알림 목록 조회 (API 우선, 실패 시 빈 배열 반환) */
export const fetchNotifications = async (): Promise<NotificationItem[]> => {
  if (USE_API) {
    try {
      return await fetchNotificationsApi();
    } catch {
      return [];
    }
  }
  return [];
};

/** 활동 내역 조회 (API 우선, 실패 시 로컬 fallback) */
export const fetchActivities = async (): Promise<HistoryItem[]> => {
  if (USE_API) {
    try {
      return await fetchActivitiesApi();
    } catch {
      return loadHistory();
    }
  }
  return loadHistory();
};

/** 모든 알림 읽음 처리 (API 우선, 실패 시 무시) */
export const markAllRead = async (): Promise<void> => {
  if (USE_API) {
    try {
      await markAllReadApi();
    } catch {
      // fallback: 로컬에서 처리됨
    }
  }
};
