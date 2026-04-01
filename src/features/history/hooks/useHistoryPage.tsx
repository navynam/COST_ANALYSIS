import React, { useState } from 'react';
import {
  CloudUpload, Description, FactCheck, CompareArrows, Warning, CheckCircle, NotificationsActive,
} from '@mui/icons-material';

export interface HistoryItem {
  id: string;
  icon: React.ReactNode;
  text: string;
  time: string;
  status: 'success' | 'warning' | 'error' | 'info';
  type: string;
}

export interface NotificationItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  time: string;
  read: boolean;
}

export const HISTORY_DATA: HistoryItem[] = [
  { id: '1', icon: <CloudUpload />, text: '견적서 A사_2026Q1.xlsx 업로드', time: '2026-02-23 09:30', status: 'success', type: '업로드' },
  { id: '2', icon: <Description />, text: '견적서 A사_2026Q1.xlsx 파싱 완료', time: '2026-02-23 09:31', status: 'success', type: '파싱' },
  { id: '3', icon: <Warning />, text: '이상치 3건 발견 - A사_2026Q1', time: '2026-02-23 09:32', status: 'warning', type: '검증' },
  { id: '4', icon: <FactCheck />, text: '검증 완료 - A사_2026Q1', time: '2026-02-23 09:45', status: 'success', type: '검증' },
  { id: '5', icon: <CompareArrows />, text: '비교 분석 실행 - A사 vs B사', time: '2026-02-22 16:20', status: 'info', type: '비교' },
  { id: '6', icon: <CloudUpload />, text: '견적서 B사_2026Q1.xlsx 업로드', time: '2026-02-22 15:00', status: 'success', type: '업로드' },
  { id: '7', icon: <Description />, text: '견적서 B사_2026Q1.xlsx 파싱 완료', time: '2026-02-22 15:02', status: 'success', type: '파싱' },
  { id: '8', icon: <FactCheck />, text: '검증 실패 - C사_2025Q4 (형식 오류)', time: '2026-02-21 11:30', status: 'error', type: '검증' },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: '1', icon: <CheckCircle color="success" />, title: '파싱 완료', desc: 'A사_2026Q1.xlsx 파싱이 완료되었습니다.', time: '10분 전', read: false },
  { id: '2', icon: <Warning color="warning" />, title: '이상치 발견', desc: '재료비 항목에서 이상치 3건이 발견되었습니다.', time: '12분 전', read: false },
  { id: '3', icon: <NotificationsActive color="info" />, title: '검증 요청', desc: 'B사 견적서 검증을 요청합니다.', time: '1시간 전', read: false },
  { id: '4', icon: <CheckCircle color="success" />, title: '파싱 완료', desc: 'B사_2026Q1.xlsx 파싱이 완료되었습니다.', time: '어제', read: true },
  { id: '5', icon: <CheckCircle color="success" />, title: '비교 완료', desc: 'A사 vs B사 비교 분석이 완료되었습니다.', time: '어제', read: true },
];

export const statusColor: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
  success: 'success', warning: 'warning', error: 'error', info: 'info',
};

export const useHistoryPage = () => {
  const [tab, setTab] = useState(0);
  const [typeFilter, setTypeFilter] = useState('전체');
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredHistory = typeFilter === '전체' ? HISTORY_DATA : HISTORY_DATA.filter(h => h.type === typeFilter);

  const handleReadAll = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  return { tab, setTab, typeFilter, setTypeFilter, notifications, unreadCount, filteredHistory, handleReadAll };
};
