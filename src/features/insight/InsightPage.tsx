/**
 * @fileoverview 인사이트 스튜디오 페이지
 * @description AI 기반 원가 분석 채팅 인터페이스. 세션 관리 및 대화 기능 제공
 */
import React from 'react';
import {
  Box, Typography, List, ListItemButton, ListItemText, Button, TextField,
  IconButton, Paper, Chip, CircularProgress, Divider,
} from '@mui/material';
import { Add, Send, Chat as ChatIcon, AutoAwesome } from '@mui/icons-material';
import { useInsightPage, EXAMPLE_CHIPS } from './hooks/useInsightPage';

const InsightPage: React.FC = () => {
  const {
    sessions, activeSessionId, setActiveSessionId,
    input, setInput, loading, messagesEndRef,
    activeSession, handleSend, handleNewSession,
  } = useInsightPage();

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
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesome sx={{ color: '#003875' }} />
          <Typography variant="h6" fontWeight={700}>인사이트 스튜디오</Typography>
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {(!activeSession?.messages.length) && (
            <Box sx={{ textAlign: 'center', mt: 8 }}>
              <AutoAwesome sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
              <Typography color="text.secondary" gutterBottom>AI 기반 원가 분석 어시스턴트</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>궁금한 점을 질문해 보세요</Typography>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                {EXAMPLE_CHIPS.map(c => (
                  <Chip key={c} label={c} variant="outlined" clickable onClick={() => handleSend(c)}
                    sx={{ borderColor: '#003875', color: '#003875' }} />
                ))}
              </Box>
            </Box>
          )}

          {activeSession?.messages.map(m => (
            <Box key={m.id} sx={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', mb: 2 }}>
              <Paper elevation={0} sx={{
                maxWidth: '70%', p: 2, borderRadius: 2,
                bgcolor: m.role === 'user' ? '#003875' : '#f5f5f5',
                color: m.role === 'user' ? '#fff' : '#333',
              }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{m.content}</Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, textAlign: 'right', color: m.role === 'user' ? 'rgba(255,255,255,0.6)' : '#999' }}>
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

export default InsightPage;
