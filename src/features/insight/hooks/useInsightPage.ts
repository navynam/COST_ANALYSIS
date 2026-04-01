import { useState, useRef, useEffect } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export interface Session {
  id: string;
  title: string;
  date: string;
  messages: Message[];
}

const DUMMY_RESPONSES = [
  'A사 재료비가 전분기 대비 12% 상승했습니다. 주원료 가격 인상이 주요 원인으로, 특히 냉연강판 단가가 톤당 85만원에서 95만원으로 상승했습니다.\n\n| 항목 | 전분기 | 당분기 | 변동률 |\n|------|--------|--------|--------|\n| 주원료 | 4,250만 | 4,760만 | +12.0% |\n| 부원료 | 820만 | 870만 | +6.1% |\n| 스크랩 | -320만 | -290만 | -9.4% |',
  '이상치로 분류된 3건 중 2건은 스크랩 부호 오류입니다. 나머지 1건은 가공비 항목에서 프레스 공정 단가가 업계 평균 대비 40% 높게 입력되어 있습니다.',
  '지난 분기 대비 총 생산원가는 8.5% 증가했습니다. 주요 변동 요인:\n\n1. 재료비: +12% (주원료 가격 인상)\n2. 가공비: +5.2% (프레스 공정 증가)\n3. 제경비: +3.1% (감가상각비 반영)\n\n전체적으로 원자재 시장 가격 상승이 주도한 것으로 분석됩니다.',
  '해당 견적서의 재료비 비율은 62%로, 업계 평균 55~65% 범위 내에 있습니다. 다만 가공비 비율이 28%로 평균(30~35%) 대비 낮은 편입니다.',
];

export const EXAMPLE_CHIPS = ['A사 재료비 분석', '지난 분기 비교', '이상치 원인', '원가 구조 요약'];

export const useInsightPage = () => {
  const [sessions, setSessions] = useState<Session[]>([
    { id: '1', title: 'A사 견적 분석', date: '2026-02-20', messages: [] },
    { id: '2', title: '이상치 검토', date: '2026-02-18', messages: [] },
    { id: '3', title: '분기별 비교', date: '2026-02-15', messages: [] },
  ]);
  const [activeSessionId, setActiveSessionId] = useState<string>('1');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: msg, timestamp: new Date() };
    setSessions(prev => prev.map(s =>
      s.id === activeSessionId ? { ...s, messages: [...s.messages, userMsg] } : s
    ));
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: DUMMY_RESPONSES[Math.floor(Math.random() * DUMMY_RESPONSES.length)],
        timestamp: new Date(),
      };
      setSessions(prev => prev.map(s =>
        s.id === activeSessionId ? { ...s, messages: [...s.messages, aiMsg] } : s
      ));
      setLoading(false);
    }, 1000);
  };

  const handleNewSession = () => {
    const newId = Date.now().toString();
    const newSession: Session = { id: newId, title: '새 대화', date: new Date().toISOString().slice(0, 10), messages: [] };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
  };

  return {
    sessions, activeSessionId, setActiveSessionId,
    input, setInput, loading, messagesEndRef,
    activeSession, handleSend, handleNewSession,
  };
};
