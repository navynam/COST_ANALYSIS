/**
 * @fileoverview 공통 타입 정의
 * @description 여러 모듈에서 공유하는 범용 타입
 */

/** 채팅 메시지 */
export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

/** 인사이트 세션 */
export interface InsightSession {
  id: string;
  title: string;
  date: string;
  messages: Message[];
}

/** 작업 이력 아이템 */
export interface HistoryItem {
  id: string;
  icon: React.ReactNode;
  text: string;
  time: string;
  status: 'success' | 'warning' | 'error' | 'info';
  type: string;
}

/** 알림 아이템 */
export interface NotificationItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  time: string;
  read: boolean;
}

/** 원가 모델 항목 */
export interface CostItem {
  name: string;
  formula: string;
  minRatio: number;
  maxRatio: number;
  history: CostItemHistory[];
}

/** 원가 항목 변경 이력 */
export interface CostItemHistory {
  date: string;
  field: string;
  before: string;
  after: string;
  user: string;
}
