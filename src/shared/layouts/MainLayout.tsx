/**
 * 🏠 메인 레이아웃 컴포넌트
 * 
 * 🎯 역할:
 * - 로그인 후 모든 페이지의 공통 레이아웃을 제공
 * - 좌측 사이드바 + 상단 헤더 + 메인 콘텐츠 영역으로 구성
 * - 인증되지 않은 사용자는 자동으로 로그인 페이지로 리다이렉트
 * 
 * 📐 레이아웃 구조:
 * ┌─────────────────────────────────┐
 * │ [사이드바]  │    [상단 헤더]      │
 * │           │ (알림, 사용자정보)   │
 * │  메뉴      ├─────────────────────│
 * │  목록      │                    │
 * │           │   [메인 콘텐츠]      │
 * │           │    <Outlet />      │
 * │           │                    │
 * └───────────┴─────────────────────┘
 * 
 * 🔧 주요 기능:
 * - 사이드바 접기/펼치기 토글 기능
 * - 실시간 알림 배지 표시 (현재: 3개)
 * - 사용자 아바타 및 이름 표시
 */

import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, IconButton, Badge, Avatar, Tooltip } from '@mui/material';
import { Notifications, Help as HelpIcon, Logout } from '@mui/icons-material';
import Sidebar from './Sidebar';
import OnboardingTour, { defaultOnboardingSteps } from '../components/OnboardingTour';
import SmartGuide from '../components/SmartGuide';
import { useMainLayout } from './hooks/useMainLayout';
import { useAuth } from '../../features/auth/AuthContext';

const MainLayout: React.FC = () => {
  // 🎛️ 레이아웃 상태 및 사용자 정보 관리 훅
  const { collapsed, setCollapsed, user, isAuthenticated } = useMainLayout();
  
  // 🔐 인증 관리
  const { logout } = useAuth();
  
  // 🎯 사용성 기능 상태
  const [onboardingOpen, setOnboardingOpen] = React.useState(false);
  const [showSmartGuide, setShowSmartGuide] = React.useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_userMenuOpen, _setUserMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    // GitHub Pages 호환을 위해 hash router 방식으로 변경
    window.location.href = '/COST_ANALYSIS/#/login';
  };

  // 🎯 첫 방문자 온보딩 체크
  React.useEffect(() => {
    const isFirstVisit = !localStorage.getItem('onboarding-completed');
    const hasSeenTour = localStorage.getItem('tour-seen') === 'true';
    
    if (isFirstVisit && !hasSeenTour) {
      // 2초 후 온보딩 시작
      setTimeout(() => {
        setOnboardingOpen(true);
        localStorage.setItem('tour-seen', 'true');
      }, 2000);
    }
  }, []);

  // 🔐 인증 확인: 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* 🏗️ 전체 레이아웃 컨테이너 (좌우 배치) */}
      
      {/* 📄 좌측 사이드바 (고정형 메뉴 네비게이션) */}
      <Box sx={{ 
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        zIndex: 1200,
        overflow: 'auto'
      }}>
        <Sidebar 
          collapsed={collapsed}                              
          onToggle={() => setCollapsed(!collapsed)}          
        />
      </Box>

      {/* 📱 우측 메인 영역 (헤더 + 콘텐츠) - 사이드바 너비만큼 마진 */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        marginLeft: collapsed ? '93px' : '240px',
        transition: 'margin-left 0.3s ease'
      }}>
        
        {/* 🎯 상단 헤더 (고정형 AppBar) */}
        <AppBar 
          position="sticky"                                
          elevation={0}                                    
          sx={{ bgcolor: '#fff', borderBottom: '1px solid #e0e0e0' }}
        >
          <Toolbar sx={{ justifyContent: 'flex-end', gap: 1 }}>
            
            {/* 💡 도움말 버튼 */}
            <Tooltip title="사용 가이드 및 도움말">
              <IconButton onClick={() => setOnboardingOpen(true)}>
                <HelpIcon sx={{ color: '#666' }} />
              </IconButton>
            </Tooltip>
            
            {/* 🔔 알림 아이콘 (배지 포함) */}
            <IconButton>
              <Badge badgeContent={3} color="error">
                <Notifications sx={{ color: '#666' }} />
              </Badge>
            </IconButton>
            
            {/* 👤 사용자 정보 영역 - 드롭다운 메뉴 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
              {/* 사용자 이름 */}
              <Typography variant="body2" color="text.secondary">
                {user?.name || 'HANY'}
              </Typography>
              
              {/* 사용자 아바타 (이름의 첫 글자 표시) */}
              <Avatar sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: '#003875',
                fontSize: 14 
              }}>
                {(user?.name || 'HANY')[0]}
              </Avatar>

              {/* 로그아웃 버튼 */}
              <Tooltip title="로그아웃">
                <IconButton 
                  onClick={handleLogout}
                  sx={{ 
                    ml: 0.5, 
                    color: '#666',
                    '&:hover': { 
                      bgcolor: 'rgba(255, 87, 87, 0.1)',
                      color: '#ff5757'
                    }
                  }}
                >
                  <Logout sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </AppBar>

        {/* 📄 메인 콘텐츠 영역 */}
        <Box sx={{ 
          flex: 1,
          p: 3,
          bgcolor: '#F5F7FA',
          position: 'relative'
        }}>
          {/* 💡 스마트 가이드 (상단 고정) */}
          <SmartGuide visible={showSmartGuide} onDismiss={() => setShowSmartGuide(false)} />
          
          {/* 🔄 자식 라우트 컴포넌트가 여기에 렌더링됨 */}
          <Outlet />
        </Box>
      </Box>
      
      {/* 🎯 온보딩 투어 */}
      <OnboardingTour 
        open={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        steps={defaultOnboardingSteps}
        onComplete={() => console.log('온보딩 완료!')}
      />
    </Box>
  );
};

export default MainLayout;
