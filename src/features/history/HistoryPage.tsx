/**
 * @fileoverview 이력/알림 페이지
 * @description 작업 이력 타임라인 및 알림 목록. 유형별 필터링, 일괄 읽음 처리 지원.
 */
import React from 'react';
import {
  Box, Paper, Typography, Tabs, Tab, Chip, Button, Badge,
  List, ListItem, ListItemIcon, ListItemText, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import { DoneAll, Circle, History as HistoryIcon } from '@mui/icons-material';
import { useHistoryPage, statusColor } from './hooks/useHistoryPage';

const HistoryPage: React.FC = () => {
  const { tab, setTab, typeFilter, setTypeFilter, notifications, unreadCount, filteredHistory, handleReadAll } = useHistoryPage();

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
                  borderLeft: '3px solid', borderColor: `${h.status}.main`,
                  mb: 1, bgcolor: '#fafafa', borderRadius: '0 8px 8px 0', position: 'relative',
                  '&::before': i < filteredHistory.length - 1 ? {
                    content: '""', position: 'absolute', left: -2, top: '100%', width: 2, height: 8, bgcolor: '#e0e0e0',
                  } : {},
                }}>
                  <ListItemIcon sx={{ color: `${h.status}.main` }}>{h.icon}</ListItemIcon>
                  <ListItemText primary={h.text} secondary={h.time}
                    primaryTypographyProps={{ fontSize: 14 }} secondaryTypographyProps={{ fontSize: 12 }} />
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
                  border: '1px solid', borderColor: n.read ? '#eee' : 'rgba(0,56,117,0.1)', borderRadius: 2,
                }}>
                  {!n.read && <Circle sx={{ fontSize: 8, color: '#1976d2', mr: 1 }} />}
                  <ListItemIcon>{n.icon}</ListItemIcon>
                  <ListItemText primary={n.title} secondary={n.desc}
                    primaryTypographyProps={{ fontWeight: n.read ? 400 : 700, fontSize: 14 }}
                    secondaryTypographyProps={{ fontSize: 12 }} />
                  <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>{n.time}</Typography>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default HistoryPage;
