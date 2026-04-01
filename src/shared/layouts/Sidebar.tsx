import React from 'react';
import {
  Box, List, ListItemButton, ListItemIcon, ListItemText, Typography, IconButton, Divider,
} from '@mui/material';
import {
  Dashboard, Description, CompareArrows, AutoGraph,
  ModelTraining, History, Settings, ChevronLeft, ChevronRight, Logout,
  ViewModule
} from '@mui/icons-material';
import { useSidebar } from './hooks/useSidebar';

const dashboardItem = { label: '대시보드', icon: <Dashboard />, path: '/dashboard' };

const mainFlowItems = [
  { label: '견적서 분석', icon: <Description />, path: '/parsing' },
  { label: '견적서 분석(Card)', icon: <ViewModule />, path: '/parsing_card' },
  { label: '견적서 비교', icon: <CompareArrows />, path: '/comparison' },
  { label: '인사이트 스튜디오', icon: <AutoGraph />, path: '/insight' },
];

const subMenuItems = [
  { label: '모델관리', icon: <ModelTraining />, path: '/models' },
  { label: '이력/알림', icon: <History />, path: '/history' },
  { label: '설정', icon: <Settings />, path: '/settings' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const SIDEBAR_WIDTH = 240;
const SIDEBAR_COLLAPSED = 93;

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { navigate, location, handleLogout } = useSidebar();

  return (
    <Box sx={{
      width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH,
      height: '100vh', 
      bgcolor: '#0a1628', 
      color: '#fff',
      transition: 'width 0.3s', 
      overflowY: 'auto',
      overflowX: 'hidden',
      display: 'flex', 
      flexDirection: 'column',
      '&::-webkit-scrollbar': {
        width: '6px',
      },
      '&::-webkit-scrollbar-track': {
        bgcolor: 'rgba(255, 255, 255, 0.1)',
      },
      '&::-webkit-scrollbar-thumb': {
        bgcolor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '3px',
        '&:hover': {
          bgcolor: 'rgba(255, 255, 255, 0.3)',
        },
      },
    }}>
      {/* 로고 + 토글 버튼 */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 64 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
          <Box sx={{
            width: 36, height: 36, bgcolor: '#e60012', borderRadius: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            position: 'relative', overflow: 'hidden',
          }}>
            <Box sx={{ fontSize: 24, fontWeight: 900, color: '#fff', fontFamily: '"Roboto", sans-serif', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>M</Box>
            <Box sx={{ position: 'absolute', bottom: 2, right: 3, width: 4, height: 4, bgcolor: '#fff', borderRadius: '50%', opacity: 0.8 }} />
          </Box>
          {!collapsed && (
            <Typography variant="subtitle2" fontWeight={700} noWrap
              sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8, textDecoration: 'underline' }, transition: 'all 0.2s' }}
              onClick={() => navigate('/')}>
              견적서 분석
            </Typography>
          )}
        </Box>
        <IconButton onClick={onToggle} sx={{ color: 'rgba(255,255,255,0.7)', width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }, transition: 'all 0.2s' }}>
          {collapsed ? <ChevronRight fontSize="small" /> : <ChevronLeft fontSize="small" />}
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* 대시보드 */}
      <List sx={{ py: 1 }}>
        {(() => {
          const active = location.pathname === dashboardItem.path;
          return (
            <ListItemButton onClick={() => navigate(dashboardItem.path)}
              sx={{ mx: 1, borderRadius: 1.5, mb: 0.5, bgcolor: active ? 'rgba(230,0,18,0.5)' : 'transparent', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' }, px: collapsed ? 1.5 : 2, justifyContent: collapsed ? 'center' : 'flex-start' }}>
              <ListItemIcon sx={{ color: active ? '#4dabf7' : 'rgba(255,255,255,0.6)', minWidth: collapsed ? 0 : 40 }}>{dashboardItem.icon}</ListItemIcon>
              {!collapsed && <ListItemText primary={dashboardItem.label} primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 600 : 400, color: active ? '#fff' : 'rgba(255,255,255,0.7)' }} />}
            </ListItemButton>
          );
        })()}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* 메인 플로우 메뉴 */}
      <List sx={{ py: 1 }}>
        {!collapsed && <Typography variant="overline" sx={{ px: 2, color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>분석 플로우</Typography>}
        {mainFlowItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <ListItemButton key={item.path} onClick={() => navigate(item.path)}
              sx={{ mx: 1, borderRadius: 1.5, mb: 0.5, bgcolor: active ? 'rgba(230,0,18,0.5)' : 'transparent', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' }, px: collapsed ? 1.5 : 2, justifyContent: collapsed ? 'center' : 'flex-start' }}>
              <ListItemIcon sx={{ color: active ? '#4dabf7' : 'rgba(255,255,255,0.6)', minWidth: collapsed ? 0 : 40 }}>{item.icon}</ListItemIcon>
              {!collapsed && <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 600 : 400, color: active ? '#fff' : 'rgba(255,255,255,0.7)' }} />}
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* 보조 메뉴 */}
      <List sx={{ flex: 1, py: 1 }}>
        {!collapsed && <Typography variant="overline" sx={{ px: 2, color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>관리</Typography>}
        {subMenuItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <ListItemButton key={item.path} onClick={() => navigate(item.path)}
              sx={{ mx: 1, borderRadius: 1.5, mb: 0.5, bgcolor: active ? 'rgba(230,0,18,0.5)' : 'transparent', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' }, px: collapsed ? 1.5 : 2, justifyContent: collapsed ? 'center' : 'flex-start' }}>
              <ListItemIcon sx={{ color: active ? '#4dabf7' : 'rgba(255,255,255,0.6)', minWidth: collapsed ? 0 : 40 }}>{item.icon}</ListItemIcon>
              {!collapsed && <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 600 : 400, color: active ? '#fff' : 'rgba(255,255,255,0.7)' }} />}
            </ListItemButton>
          );
        })}
      </List>

      {/* 로그아웃 버튼은 상단 헤더로 이동됨 */}
    </Box>
  );
};

export { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED };
export default Sidebar;
