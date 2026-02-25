/**
 * @fileoverview 이력/알림 페이지
 * @description 작업 이력 타임라인 및 알림 목록. 유형별 필터링, 일괄 읽음 처리 지원.
 */
import React, { useState } from 'react';
import {
  Box, Paper, Typography, Tabs, Tab, Chip, Button, IconButton, Badge,
  List, ListItem, ListItemIcon, ListItemText, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import {
  CloudUpload, Description, FactCheck, CompareArrows, Warning, CheckCircle,
  NotificationsActive, DoneAll, Circle, History as HistoryIcon,
} from '@mui/icons-material';

interface HistoryItem {
  id: string; icon: React.ReactNode; text: string; time: string;
  status: 'success' | 'warning' | 'error' | 'info'; type: string;
}

interface NotificationItem {
  id: string; icon: React.ReactNode; title: string; desc: string; time: string; read: boolean;
}

const HISTORY_DATA: HistoryItem[] = [
  { id: '1', icon: <CloudUpload />, text: '견적서 A사_2026Q1.xlsx 업로드', time: '2026-02-23 09:30', status: 'success', type: '업로드' },
  { id: '2', icon: <Description />, text: '견적서 A사_2026Q1.xlsx 파싱 완료', time: '2026-02-23 09:31', status: 'success', type: '파싱' },
  { id: '3', icon: <Warning />, text: '이상치 3건 발견 - A사_2026Q1', time: '2026-02-23 09:32', status: 'warning', type: '검증' },
  { id: '4', icon: <FactCheck />, text: '검증 완료 - A사_2026Q1', time: '2026-02-23 09:45', status: 'success', type: '검증' },
  { id: '5', icon: <CompareArrows />, text: '비교 분석 실행 - A사 vs B사', time: '2026-02-22 16:20', status: 'info', type: '비교' },
  { id: '6', icon: <CloudUpload />, text: '견적서 B사_2026Q1.xlsx 업로드', time: '2026-02-22 15:00', status: 'success', type: '업로드' },
  { id: '7', icon: <Description />, text: '견적서 B사_2026Q1.xlsx 파싱 완료', time: '2026-02-22 15:02', status: 'success', type: '파싱' },
  { id: '8', icon: <FactCheck />, text: '검증 실패 - C사_2025Q4 (형식 오류)', time: '2026-02-21 11:30', status: 'error', type: '검증' },
];

const NOTIFICATION_DATA: NotificationItem[] = [
  { id: '1', icon: <CheckCircle color="success" />, title: '파싱 완료', desc: 'A사_2026Q1.xlsx 파싱이 완료되었습니다.', time: '10분 전', read: false },
  { id: '2', icon: <Warning color="warning" />, title: '이상치 발견', desc: '재료비 항목에서 이상치 3건이 발견되었습니다.', time: '12분 전', read: false },
  { id: '3', icon: <NotificationsActive color="info" />, title: '검증 요청', desc: 'B사 견적서 검증을 요청합니다.', time: '1시간 전', read: false },
  { id: '4', icon: <CheckCircle color="success" />, title: '파싱 완료', desc: 'B사_2026Q1.xlsx 파싱이 완료되었습니다.', time: '어제', read: true },
  { id: '5', icon: <CheckCircle color="success" />, title: '비교 완료', desc: 'A사 vs B사 비교 분석이 완료되었습니다.', time: '어제', read: true },
];

const statusColor: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
  success: 'success', warning: 'warning', error: 'error', info: 'info',
};

const History: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [typeFilter, setTypeFilter] = useState('전체');
  const [notifications, setNotifications] = useState(NOTIFICATION_DATA);

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredHistory = typeFilter === '전체' ? HISTORY_DATA : HISTORY_DATA.filter(h => h.type === typeFilter);

  const handleReadAll = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <HistoryIcon sx={{ color: '#003875' }} />
        <Typography variant="h5" fontWeight={700}>이력 / 알림</Typography>
      </Box>

      <Paper sx={{ p: 0 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid #e0e0e0', px: 2 }}>
          <Tab label="작업이력" />
          <Tab label={<Badge badgeContent={unreadCount} color="error">알림</Badge>} />
        </Tabs>

        {tab === 0 && (
          <Box sx={{ p: 2 }}>
            <Box sx={{ mb: 2 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>유형</InputLabel>
                <Select value={typeFilter} label="유형" onChange={e => setTypeFilter(e.target.value)}>
                  {['전체', '업로드', '파싱', '검증', '비교'].map(t => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <List>
              {filteredHistory.map((h, i) => (
                <ListItem key={h.id} sx={{
                  borderLeft: '3px solid',
                  borderColor: `${h.status}.main`,
                  mb: 1, bgcolor: '#fafafa', borderRadius: '0 8px 8px 0',
                  position: 'relative',
                  '&::before': i < filteredHistory.length - 1 ? {
                    content: '""', position: 'absolute', left: -2, top: '100%',
                    width: 2, height: 8, bgcolor: '#e0e0e0',
                  } : {},
                }}>
                  <ListItemIcon sx={{ color: `${h.status}.main` }}>{h.icon}</ListItemIcon>
                  <ListItemText primary={h.text} secondary={h.time}
                    primaryTypographyProps={{ fontSize: 14 }}
                    secondaryTypographyProps={{ fontSize: 12 }} />
                  <Chip label={h.type} size="small" color={statusColor[h.status]} variant="outlined" />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {tab === 1 && (
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button startIcon={<DoneAll />} size="small" onClick={handleReadAll} disabled={unreadCount === 0}>
                모두 읽음
              </Button>
            </Box>

            <List>
              {notifications.map(n => (
                <ListItem key={n.id} sx={{
                  mb: 1, bgcolor: n.read ? '#fff' : 'rgba(0,56,117,0.03)',
                  border: '1px solid', borderColor: n.read ? '#eee' : 'rgba(0,56,117,0.1)',
                  borderRadius: 2,
                }}>
                  {!n.read && <Circle sx={{ fontSize: 8, color: '#1976d2', mr: 1 }} />}
                  <ListItemIcon>{n.icon}</ListItemIcon>
                  <ListItemText
                    primary={n.title} secondary={n.desc}
                    primaryTypographyProps={{ fontWeight: n.read ? 400 : 700, fontSize: 14 }}
                    secondaryTypographyProps={{ fontSize: 12 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                    {n.time}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default History;
