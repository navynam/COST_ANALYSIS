import React from 'react';
import {
  Box, List, ListItemButton, ListItemIcon, ListItemText, Typography, IconButton, Divider,
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useSidebar } from './hooks/useSidebar';
import { usePermissionContext } from '../../features/auth/PermissionContext';
import { resolveMenuIcon } from './menuIconMap';
import type { MenuNode } from '../../features/system/types';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const SIDEBAR_WIDTH = 240;
const SIDEBAR_COLLAPSED = 93;

const isActivePath = (pathname: string, item: MenuNode) => (
  pathname === item.path || (item.aliasPaths || []).includes(pathname)
);

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { navigate, location, handleLogout: _handleLogout } = useSidebar();
  const { menus } = usePermissionContext();

  // depth1 중 path 가 있는 것(단독 블록, 예: 대시보드) / path 가 없는 것(그룹 헤더)으로 분리
  // visibleInNav=false 인 메뉴는 사이드바에서 제외 (권한은 여전히 평가됨). 그룹은 노출 가능한 자식이 1개 이상일 때만 표시
  const standaloneItems = menus.filter(m => m.depth === 1 && m.path && m.visibleInNav);
  const groupItems = menus
    .filter(m => m.depth === 1 && !m.path && m.visibleInNav)
    .map(g => ({ ...g, children: (g.children || []).filter(c => c.visibleInNav) }))
    .filter(g => g.children.length > 0);

  const renderItem = (item: MenuNode) => {
    const active = isActivePath(location.pathname, item);
    return (
      <ListItemButton key={item.menuCode} onClick={() => item.path && navigate(item.path)}
        sx={{ mx: 1, borderRadius: 1.5, mb: 0.5, bgcolor: active ? 'rgba(230,0,18,0.5)' : 'transparent', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' }, px: collapsed ? 1.5 : 2, justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <ListItemIcon sx={{ color: active ? '#4dabf7' : 'rgba(255,255,255,0.6)', minWidth: collapsed ? 0 : 40 }}>
          {resolveMenuIcon(item.iconName)}
        </ListItemIcon>
        {!collapsed && <ListItemText primary={item.menuName} primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 600 : 400, color: active ? '#fff' : 'rgba(255,255,255,0.7)' }} />}
      </ListItemButton>
    );
  };

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
          <Box sx={{ width: 36, height: 36, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#fff', borderRadius: 1 }}>
            <img src={`${process.env.PUBLIC_URL}/mobis_logo.png`} alt="Mobis"
              style={{ width: 28, height: 28, objectFit: 'contain' }} />
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

      {/* 단독 블록 메뉴 (예: 대시보드) */}
      {standaloneItems.length > 0 && (
        <>
          <List sx={{ py: 1 }}>
            {standaloneItems.map(renderItem)}
          </List>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        </>
      )}

      {/* 그룹 메뉴 (분석 플로우 / 관리 / 시스템 관리 등) */}
      {groupItems.map((group, idx) => (
        <React.Fragment key={group.menuCode}>
          <List sx={idx === groupItems.length - 1 ? { flex: 1, py: 1 } : { py: 1 }}>
            {!collapsed && (
              <Typography variant="overline" sx={{ px: 2, color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>
                {group.menuName}
              </Typography>
            )}
            {(group.children || []).map(renderItem)}
          </List>
          {idx < groupItems.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />}
        </React.Fragment>
      ))}

      {/* 로그아웃 버튼은 상단 헤더로 이동됨 */}
    </Box>
  );
};

export { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED };
export default Sidebar;
