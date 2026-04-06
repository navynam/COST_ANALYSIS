import { useState, useRef, useEffect } from 'react';
import {
  fetchAiResponse,
  createNewSession,
  createUserMessage,
  addMessageToSession,
} from '../services/insightService';

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

    const userMsg = createUserMessage(msg);
    setSessions(prev => addMessageToSession(prev, activeSessionId, userMsg));
    setInput('');
    setLoading(true);

    setTimeout(async () => {
      const aiMsg = await fetchAiResponse(msg);
      setSessions(prev => addMessageToSession(prev, activeSessionId, aiMsg));
      setLoading(false);
    }, 1000);
  };

  const handleNewSession = () => {
    const newSession = createNewSession();
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  return {
    sessions, activeSessionId, setActiveSessionId,
    input, setInput, loading, messagesEndRef,
    activeSession, handleSend, handleNewSession,
  };
};
