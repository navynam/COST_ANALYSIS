/**
 * @fileoverview 인사이트 스튜디오 페이지
 * @description AI 기반 원가 분석 채팅 인터페이스. 세션 관리 및 대화 기능 제공
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, List, ListItemButton, ListItemText, Button, TextField,
  IconButton, Paper, Chip, CircularProgress, Divider,
} from '@mui/material';
import { Add, Send, Chat as ChatIcon, AutoAwesome } from '@mui/icons-material';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface Session {
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

const EXAMPLE_CHIPS = ['A사 재료비 분석', '지난 분기 비교', '이상치 원인', '원가 구조 요약'];

const Insight: React.FC = () => {
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

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 120px)', gap: 2 }}>
      {/* Sidebar */}
      <Paper sx={{ width: 250, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ p: 2 }}>
          <Button variant="contained" fullWidth startIcon={<Add />} onClick={handleNewSession}
            sx={{ bgcolor: '#003875', '&:hover': { bgcolor: '#002a5c' } }}>
            새 대화
          </Button>
        </Box>
        <Divider />
        <List sx={{ flex: 1, overflow: 'auto', py: 0 }}>
          {sessions.map(s => (
            <ListItemButton key={s.id} selected={s.id === activeSessionId}
              onClick={() => setActiveSessionId(s.id)}
              sx={{ '&.Mui-selected': { bgcolor: 'rgba(0,56,117,0.08)' } }}>
              <ChatIcon sx={{ mr: 1.5, fontSize: 18, color: '#666' }} />
              <ListItemText
                primary={s.title}
                secondary={s.date}
                primaryTypographyProps={{ fontSize: 13, fontWeight: s.id === activeSessionId ? 600 : 400, noWrap: true }}
                secondaryTypographyProps={{ fontSize: 11 }}
              />
            </ListItemButton>
          ))}
        </List>
      </Paper>

      {/* Main Chat */}
      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesome sx={{ color: '#003875' }} />
          <Typography variant="h6" fontWeight={700}>인사이트 스튜디오</Typography>
        </Box>

        {/* Messages */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {(!activeSession?.messages.length) && (
            <Box sx={{ textAlign: 'center', mt: 8 }}>
              <AutoAwesome sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
              <Typography color="text.secondary" gutterBottom>AI 기반 원가 분석 어시스턴트</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                궁금한 점을 질문해 보세요
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                {EXAMPLE_CHIPS.map(c => (
                  <Chip key={c} label={c} variant="outlined" clickable onClick={() => handleSend(c)}
                    sx={{ borderColor: '#003875', color: '#003875' }} />
                ))}
              </Box>
            </Box>
          )}

          {activeSession?.messages.map(m => (
            <Box key={m.id} sx={{
              display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', mb: 2,
            }}>
              <Paper elevation={0} sx={{
                maxWidth: '70%', p: 2, borderRadius: 2,
                bgcolor: m.role === 'user' ? '#003875' : '#f5f5f5',
                color: m.role === 'user' ? '#fff' : '#333',
              }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                  {m.content}
                </Typography>
                <Typography variant="caption" sx={{
                  display: 'block', mt: 0.5, textAlign: 'right',
                  color: m.role === 'user' ? 'rgba(255,255,255,0.6)' : '#999',
                }}>
                  {m.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Paper>
            </Box>
          ))}

          {loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CircularProgress size={16} />
              <Typography variant="body2" color="text.secondary">분석 중...</Typography>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Input */}
        <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', display: 'flex', gap: 1 }}>
          <TextField fullWidth size="small" placeholder="질문을 입력하세요..." value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
          />
          <IconButton onClick={() => handleSend()} disabled={!input.trim() || loading}
            sx={{ bgcolor: '#003875', color: '#fff', '&:hover': { bgcolor: '#002a5c' }, '&.Mui-disabled': { bgcolor: '#ccc' } }}>
            <Send />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default Insight;
