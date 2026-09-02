/**
 * 🏛️ 메인 애플리케이션 컴포넌트
 * 
 * 🎯 역할:
 * - 전체 앱의 라우팅 설정 (어느 URL에서 어느 페이지를 보여줄지)
 * - 현대모비스 브랜딩 테마 적용 (색상, 폰트 등)
 * - 인증 상태 관리를 위한 AuthProvider 설정
 * - 모든 페이지의 공통 레이아웃(헤더, 사이드바) 설정
 * 
 * 📚 주요 페이지 구조:
 * - 📊 메인 플로우: 파싱 → 검증 → 분석 → 비교 (견적서 처리 워크플로우)
 * - 🎮 보조 페이지: 대시보드, 인사이트, 모델관리, 이력, 설정
 * - 🔐 인증: 로그인 페이지 (별도 레이아웃)
 * 
 * 🎨 디자인 시스템:
 * - Primary: #e60012 (현대모비스 빨간색)
 * - 폰트: Noto Sans KR (한글 최적화)
 */

import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import MainLayout from './shared/layouts/MainLayout';
import { AuthProvider } from './features/auth/AuthContext';
import { PermissionProvider } from './features/auth/PermissionContext';
import { ThemeProvider } from './shared/contexts/ThemeContext';
import { MessageDialogProvider } from './shared/components/MessageDialog';
import ProtectedRoute from './features/auth/ProtectedRoute';
import HomeRedirect from './features/auth/HomeRedirect';
import AccessDeniedPage from './features/auth/AccessDeniedPage';
import NoAccessPage from './features/auth/NoAccessPage';

// 📊 메인 워크플로우 페이지들 (견적서 처리 4단계)
import ParsingCardPage from './features/parsing/ParsingCardPage';       // 1단계: 파싱/업로드
import ParsedDataReviewPage from './features/verification/ParsedDataReviewPage'; // 2단계: 검증/리뷰
import AnalysisPage from './features/analysis/AnalysisPage';             // 3단계: 분석
import QuotationComparisonPage from './features/comparison/QuotationComparisonPage'; // 4단계: 비교

// 🎮 보조 기능 페이지들
import DashboardPage from './features/dashboard/DashboardPage';         // 📈 대시보드 (홈)
import InsightPage from './features/insight/InsightPage';               // 💡 AI 인사이트 스튜디오
import ModelManagementPage from './features/model-management/ModelManagementPage'; // ⚙️ 원가 모델 관리
import HistoryPage from './features/history/HistoryPage';               // 📜 작업 이력/알림
import SettingsPage from './features/settings/SettingsPage';           // 🔧 시스템 설정
import LoginPage from './features/auth/LoginPage';                     // 🔐 로그인 (별도 레이아웃)

// 🛡️ 시스템 관리 (메뉴/권한/사원/조직)
import MenuManagementPage from './features/system/MenuManagementPage';
import RoleManagementPage from './features/system/RoleManagementPage';
import EmployeeManagementPage from './features/system/EmployeeManagementPage';
import OrgManagementPage from './features/system/OrgManagementPage';

// 🎨 테마 시스템은 ThemeProvider에서 관리됨
// 현대모비스 테마와 Toss 테마 간 전환 가능

/**
 * 🚀 메인 App 컴포넌트
 * 
 * 계층 구조:
 * 1. ThemeProvider: 현대모비스 디자인 시스템 적용
 * 2. CssBaseline: 브라우저 기본 스타일 초기화
 * 3. AuthProvider: 로그인 상태 관리
 * 4. HashRouter: URL 라우팅 (GitHub Pages 호환)
 */
export default function App() {
  return (
    <ThemeProvider initialTheme="hyundai">
      {/* 🎨 브라우저 기본 CSS 초기화 (margin, padding 등) */}
      <CssBaseline />
      
      {/* 🔐 인증 상태를 전역에서 관리 (로그인/로그아웃) */}
      <AuthProvider>
        {/* 🛡️ 권한(메뉴/RBAC) 상태 관리 — AuthProvider 하위 (11.2) */}
        <PermissionProvider>
        <MessageDialogProvider>
        {/* 🗂️ 해시 라우터: URL 변경 시 페이지 전환 관리 */}
        <HashRouter>
          <Routes>
            {/* 🔐 로그인 페이지 (별도 레이아웃, 사이드바 없음) */}
            <Route path="/login" element={<LoginPage />} />

            {/* 🚫 시스템 예약 화면 (메뉴 아님, 권한 체크 제외) */}
            <Route path="/no-access" element={<NoAccessPage />} />

            {/* 🏠 메인 레이아웃 (헤더 + 사이드바 + 콘텐츠 영역) */}
            <Route element={<MainLayout />}>

              {/* 🔀 기본 경로 처리 — 대시보드 권한 있으면 대시보드, 없으면 첫 가용 메뉴, 없으면 /no-access */}
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/403" element={<AccessDeniedPage />} />

              {/* 📊 핵심 워크플로우 (견적서 처리 4단계) */}
              <Route path="/parsing" element={<ProtectedRoute menuCode="QUOTATION_PARSING"><ParsingCardPage /></ProtectedRoute>} />          {/* 1️⃣ 파싱/업로드 (하위호환) */}
              <Route path="/parsing_card" element={<ProtectedRoute menuCode="QUOTATION_PARSING"><ParsingCardPage /></ProtectedRoute>} />  {/* 1️⃣ 파싱/업로드 */}
              <Route path="/verification" element={<ProtectedRoute menuCode="QUOTATION_VERIFY"><ParsedDataReviewPage /></ProtectedRoute>} /> {/* 2️⃣ 검증/리뷰 */}
              <Route path="/analysis" element={<ProtectedRoute menuCode="QUOTATION_ANALYSIS"><AnalysisPage /></ProtectedRoute>} />         {/* 3️⃣ 분석 */}
              <Route path="/comparison" element={<ProtectedRoute menuCode="QUOTATION_COMPARE"><QuotationComparisonPage /></ProtectedRoute>} /> {/* 4️⃣ 비교 */}

              {/* 🎮 보조 기능들 */}
              <Route path="/dashboard" element={<ProtectedRoute menuCode="DASHBOARD"><DashboardPage /></ProtectedRoute>} />       {/* 📈 대시보드 홈 */}
              <Route path="/insight" element={<ProtectedRoute menuCode="INSIGHT"><InsightPage /></ProtectedRoute>} />           {/* 💡 AI 채팅 */}
              <Route path="/models" element={<ProtectedRoute menuCode="MODEL"><ModelManagementPage /></ProtectedRoute>} />    {/* ⚙️ 모델 관리 */}
              <Route path="/history" element={<ProtectedRoute menuCode="HISTORY"><HistoryPage /></ProtectedRoute>} />           {/* 📜 이력/알림 */}
              <Route path="/settings" element={<ProtectedRoute menuCode="SETTINGS"><SettingsPage /></ProtectedRoute>} />         {/* 🔧 설정 */}

              {/* 🛡️ 시스템 관리 (신규) */}
              <Route path="/system/menus" element={<ProtectedRoute menuCode="SYS_MENU"><MenuManagementPage /></ProtectedRoute>} />
              <Route path="/system/roles" element={<ProtectedRoute menuCode="SYS_ROLE"><RoleManagementPage /></ProtectedRoute>} />
              <Route path="/system/employees" element={<ProtectedRoute menuCode="SYS_EMPLOYEE"><EmployeeManagementPage /></ProtectedRoute>} />
              <Route path="/system/org" element={<ProtectedRoute menuCode="SYS_ORG"><OrgManagementPage /></ProtectedRoute>} />

              {/* 🔀 매핑되지 않은 경로 → 홈 리다이렉트 로직 재사용 (E8: 미매핑 라우트는 원칙적으로 없어야 함) */}
              <Route path="*" element={<HomeRedirect />} />
            </Route>
          </Routes>
        </HashRouter>
        </MessageDialogProvider>
        </PermissionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
