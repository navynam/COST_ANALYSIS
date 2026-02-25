import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, IconButton, Badge, Avatar } from '@mui/material';
import { Notifications, AccountCircle } from '@mui/icons-material';
import Sidebar, { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED } from './Sidebar';
import { useAuth } from '../contexts/AuthContext';

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{ bgcolor: '#fff', borderBottom: '1px solid #e0e0e0' }}
        >
          <Toolbar sx={{ justifyContent: 'flex-end', gap: 1 }}>
            <IconButton>
              <Badge badgeContent={3} color="error">
                <Notifications sx={{ color: '#666' }} />
              </Badge>
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {user?.name || '사용자'}
              </Typography>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#003875', fontSize: 14 }}>
                {user?.name?.[0] || 'U'}
              </Avatar>
            </Box>
          </Toolbar>
        </AppBar>

        <Box sx={{ flex: 1, p: 3, bgcolor: '#F5F7FA' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
