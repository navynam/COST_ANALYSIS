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
import styles from './InsightPage.module.css';

const InsightPage: React.FC = () => {
  const {
    sessions, activeSessionId, setActiveSessionId,
    input, setInput, loading, messagesEndRef,
    activeSession, handleSend, handleNewSession,
  } = useInsightPage();

  return (
    <Box className={styles.root} sx={{ gap: 2 }}>
      {/* Sidebar */}
      <Paper className={styles.sidebar}>
        <Box sx={{ p: 2 }}>
          <Button variant="contained" fullWidth startIcon={<Add />} onClick={handleNewSession}
            className={styles.newChatBtn}>
            새 대화
          </Button>
        </Box>
        <Divider />
        <List className={styles.sessionList} sx={{ py: 0 }}>
          {sessions.map(s => (
            <ListItemButton key={s.id} selected={s.id === activeSessionId}
              onClick={() => setActiveSessionId(s.id)}
              sx={{ '&.Mui-selected': { bgcolor: 'rgba(0,56,117,0.08)' } }}>
              <ChatIcon className={styles.chatIcon} sx={{ mr: 1.5 }} />
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
      <Paper className={styles.chatMain}>
        <Box className={styles.chatHeader} sx={{ p: 2, gap: 1 }}>
          <AutoAwesome className={styles.chatHeaderIcon} />
          <Typography variant="h6" fontWeight={700}>인사이트 스튜디오</Typography>
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {(!activeSession?.messages.length) && (
            <Box className={styles.emptyState} sx={{ mt: 8 }}>
              <AutoAwesome className={styles.emptyIcon} sx={{ mb: 2 }} />
              <Typography color="text.secondary" gutterBottom>AI 기반 원가 분석 어시스턴트</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>궁금한 점을 질문해 보세요</Typography>
              <Box className={styles.exampleChips} sx={{ gap: 1 }}>
                {EXAMPLE_CHIPS.map(c => (
                  <Chip key={c} label={c} variant="outlined" clickable onClick={() => handleSend(c)}
                    className={styles.exampleChip} />
                ))}
              </Box>
            </Box>
          )}

          {activeSession?.messages.map(m => (
            <Box key={m.id} className={styles.messageRow} sx={{ justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', mb: 2 }}>
              <Paper elevation={0} className={m.role === 'user' ? styles.userBubble : styles.assistantBubble} sx={{ p: 2 }}>
                <Typography variant="body2" className={styles.messageText}>{m.content}</Typography>
                <Typography variant="caption" className={m.role === 'user' ? styles.timestampUser : styles.timestampAssistant} sx={{ mt: 0.5 }}>
                  {m.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Paper>
            </Box>
          ))}

          {loading && (
            <Box className={styles.loadingRow} sx={{ gap: 1, mb: 2 }}>
              <CircularProgress size={16} />
              <Typography variant="body2" color="text.secondary">분석 중...</Typography>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        <Box className={styles.inputArea} sx={{ p: 2, gap: 1 }}>
          <TextField fullWidth size="small" placeholder="질문을 입력하세요..." value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
          />
          <IconButton onClick={() => handleSend()} disabled={!input.trim() || loading}
            sx={{ '&.Mui-disabled': { bgcolor: '#ccc' } }}
            className={styles.sendBtn}>
            <Send />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default InsightPage;
