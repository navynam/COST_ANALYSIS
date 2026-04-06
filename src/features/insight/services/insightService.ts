/**
 * @fileoverview 인사이트 서비스 레이어
 * @description AI 대화 세션 및 메시지 처리 로직을 hooks에서 분리
 */

import type { Message, Session } from '../hooks/useInsightPage';

// ── 더미 AI 응답 데이터 ──
const DUMMY_RESPONSES = [
  'A사 재료비가 전분기 대비 12% 상승했습니다. 주원료 가격 인상이 주요 원인으로, 특히 냉연강판 단가가 톤당 85만원에서 95만원으로 상승했습니다.\n\n| 항목 | 전분기 | 당분기 | 변동률 |\n|------|--------|--------|--------|\n| 주원료 | 4,250만 | 4,760만 | +12.0% |\n| 부원료 | 820만 | 870만 | +6.1% |\n| 스크랩 | -320만 | -290만 | -9.4% |',
  '이상치로 분류된 3건 중 2건은 스크랩 부호 오류입니다. 나머지 1건은 가공비 항목에서 프레스 공정 단가가 업계 평균 대비 40% 높게 입력되어 있습니다.',
  '지난 분기 대비 총 생산원가는 8.5% 증가했습니다. 주요 변동 요인:\n\n1. 재료비: +12% (주원료 가격 인상)\n2. 가공비: +5.2% (프레스 공정 증가)\n3. 제경비: +3.1% (감가상각비 반영)\n\n전체적으로 원자재 시장 가격 상승이 주도한 것으로 분석됩니다.',
  '해당 견적서의 재료비 비율은 62%로, 업계 평균 55~65% 범위 내에 있습니다. 다만 가공비 비율이 28%로 평균(30~35%) 대비 낮은 편입니다.',
];

// ── AI 응답 로직 ──

/** AI 응답 생성 (향후 실제 API 연동 예정) */
export const fetchAiResponse = async (_message: string): Promise<Message> => {
  // TODO: 실제 API 연동 시 AI 서비스 호출로 전환
  return {
    id: (Date.now() + 1).toString(),
    role: 'ai',
    content: DUMMY_RESPONSES[Math.floor(Math.random() * DUMMY_RESPONSES.length)],
    timestamp: new Date(),
  };
};

// ── 세션 관리 로직 ──

/** 새 세션 생성 */
export const createNewSession = (): Session => {
  return {
    id: Date.now().toString(),
    title: '새 대화',
    date: new Date().toISOString().slice(0, 10),
    messages: [],
  };
};

/** 사용자 메시지 객체 생성 */
export const createUserMessage = (content: string): Message => {
  return {
    id: Date.now().toString(),
    role: 'user',
    content,
    timestamp: new Date(),
  };
};

/** 세션에 메시지 추가 */
export const addMessageToSession = (
  sessions: Session[],
  sessionId: string,
  message: Message
): Session[] => {
  return sessions.map(s =>
    s.id === sessionId ? { ...s, messages: [...s.messages, message] } : s
  );
};
