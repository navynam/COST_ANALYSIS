import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, List, ListItemButton, ListItemIcon, ListItemText, Typography, IconButton, Divider,
} from '@mui/material';
import {
  Dashboard, Description, FactCheck, CompareArrows, Assessment, Insights,
  ModelTraining, History, Settings, ChevronLeft, ChevronRight,
} from '@mui/icons-material';

const mainFlowItems = [
  { label: '① 파싱 (업로드)', icon: <Description />, path: '/parsing' },
  { label: '② 데이터 검토', icon: <FactCheck />, path: '/review' },
  { label: '③ 검증', icon: <Assessment />, path: '/verification' },
  { label: '④ 견적서 비교', icon: <CompareArrows />, path: '/comparison' },
  { label: '⑤ 리포트', icon: <Insights />, path: '/report' },
];

const subMenuItems = [
  { label: '대시보드', icon: <Dashboard />, path: '/dashboard' },
  { label: '모델관리', icon: <ModelTraining />, path: '/models' },
  { label: '이력/알림', icon: <History />, path: '/history' },
  { label: '설정', icon: <Settings />, path: '/settings' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const SIDEBAR_WIDTH = 240;
const SIDEBAR_COLLAPSED = 68;

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{
      width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH,
      minHeight: '100vh', bgcolor: '#0a1628', color: '#fff',
      transition: 'width 0.3s', overflow: 'hidden', flexShrink: 0,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* 로고 */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, minHeight: 64 }}>
        <Box sx={{
          width: 36, height: 36, bgcolor: '#003875', borderRadius: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: 14 }}>HD</Typography>
        </Box>
        {!collapsed && (
          <Typography variant="subtitle2" fontWeight={700} noWrap>견적서 분석</Typography>
        )}
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* 메인 플로우 메뉴 */}
      <List sx={{ py: 1 }}>
        {!collapsed && (
          <Typography variant="overline" sx={{ px: 2, color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>
            분석 플로우
          </Typography>
        )}
        {mainFlowItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              onClick={() => navigate(item.path)}
              sx={{
                mx: 1, borderRadius: 1.5, mb: 0.5,
                bgcolor: active ? 'rgba(0,56,117,0.5)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                px: collapsed ? 1.5 : 2,
                justifyContent: collapsed ? 'center' : 'flex-start',
              }}
            >
              <ListItemIcon sx={{
                color: active ? '#4dabf7' : 'rgba(255,255,255,0.6)',
                minWidth: collapsed ? 0 : 40,
              }}>
                {item.icon}
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: 14, fontWeight: active ? 600 : 400,
                    color: active ? '#fff' : 'rgba(255,255,255,0.7)',
                  }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* 보조 메뉴 */}
      <List sx={{ flex: 1, py: 1 }}>
        {!collapsed && (
          <Typography variant="overline" sx={{ px: 2, color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>
            관리
          </Typography>
        )}
        {subMenuItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              onClick={() => navigate(item.path)}
              sx={{
                mx: 1, borderRadius: 1.5, mb: 0.5,
                bgcolor: active ? 'rgba(0,56,117,0.5)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                px: collapsed ? 1.5 : 2,
                justifyContent: collapsed ? 'center' : 'flex-start',
              }}
            >
              <ListItemIcon sx={{
                color: active ? '#4dabf7' : 'rgba(255,255,255,0.6)',
                minWidth: collapsed ? 0 : 40,
              }}>
                {item.icon}
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: 14, fontWeight: active ? 600 : 400,
                    color: active ? '#fff' : 'rgba(255,255,255,0.7)',
                  }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>

      {/* 토글 */}
      <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
        <IconButton onClick={onToggle} sx={{ color: 'rgba(255,255,255,0.5)' }}>
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </Box>
    </Box>
  );
};

export { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED };
export default Sidebar;
