import { useState } from 'react';
import { useAuth } from '../../../features/auth/AuthContext';
import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED } from '../Sidebar';

export const useMainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH;

  return { collapsed, setCollapsed, user, isAuthenticated, sidebarWidth };
};
