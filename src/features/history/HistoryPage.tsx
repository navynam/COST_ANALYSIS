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
import styles from './HistoryPage.module.css';

const HistoryPage: React.FC = () => {
  const { tab, setTab, typeFilter, setTypeFilter, notifications, unreadCount, filteredHistory, handleReadAll } = useHistoryPage();

  return (
    <Box className={styles.container}>
      <Box className={styles.header}>
        <HistoryIcon className={styles.headerIcon} />
        <Typography variant="h5" fontWeight={700}>이력 / 알림</Typography>
      </Box>

      <Paper className={styles.paper}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} className={styles.tabs}>
          <Tab label="작업이력" />
          <Tab label={<Badge badgeContent={unreadCount} color="error">알림</Badge>} />
        </Tabs>

        {tab === 0 && (
          <Box className={styles.tabContent}>
            <Box className={styles.filterRow}>
              <FormControl size="small" className={styles.filterSelect}>
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
                <ListItem key={h.id}
                  className={`${styles.historyItem} ${i < filteredHistory.length - 1 ? styles.withConnector : ''}`}
                  sx={{ borderColor: `${h.status}.main` }}>
                  <ListItemIcon sx={{ color: `${h.status}.main` }}>{h.icon}</ListItemIcon>
                  <ListItemText primary={h.text} secondary={h.time}
                    primaryTypographyProps={{ className: styles.historyPrimary }}
                    secondaryTypographyProps={{ className: styles.historySecondary }} />
                  <Chip label={h.type} size="small" color={statusColor[h.status]} variant="outlined" />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {tab === 1 && (
          <Box className={styles.tabContent}>
            <Box className={styles.readAllRow}>
              <Button startIcon={<DoneAll />} size="small" onClick={handleReadAll} disabled={unreadCount === 0}>
                모두 읽음
              </Button>
            </Box>
            <List>
              {notifications.map(n => (
                <ListItem key={n.id}
                  className={`${styles.notificationItem} ${!n.read ? styles.unread : ''}`}>
                  {!n.read && <Circle className={styles.unreadDot} />}
                  <ListItemIcon>{n.icon}</ListItemIcon>
                  <ListItemText primary={n.title} secondary={n.desc}
                    primaryTypographyProps={{ className: n.read ? styles.notificationPrimary : styles.notificationPrimaryUnread }}
                    secondaryTypographyProps={{ className: styles.notificationSecondary }} />
                  <Typography variant="caption" color="text.secondary" className={styles.notificationTime}>{n.time}</Typography>
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
