import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import MainLayout from './layouts/MainLayout';
import { AuthProvider } from './contexts/AuthContext';

// 메인 플로우 4단계
import Parsing from './pages/Parsing';
import ParsedDataReview from './pages/ParsedDataReview';
import Verification from './pages/Verification';
import QuotationComparison from './pages/QuotationComparison';

// 보조 페이지
import Dashboard from './pages/Dashboard';
import Report from './pages/Report';
import ModelManagement from './pages/ModelManagement';
import History from './pages/History';
import Settings from './pages/Settings';
import Login from './pages/Login';

const theme = createTheme({
  palette: {
    primary: { main: '#003875' },
    secondary: { main: '#f57c00' },
  },
  typography: { fontFamily: 'Roboto, "Noto Sans KR", sans-serif' },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<MainLayout />}>
            {/* 메인 플로우 */}
            <Route path="/parsing" element={<Parsing />} />
            <Route path="/review" element={<ParsedDataReview />} />
            <Route path="/verification" element={<Verification />} />
            <Route path="/comparison" element={<QuotationComparison />} />

            {/* 보조 페이지 */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/report" element={<Report />} />
            <Route path="/models" element={<ModelManagement />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />

            {/* 기본 리다이렉트 */}
            <Route path="/" element={<Navigate to="/parsing" replace />} />
            <Route path="*" element={<Navigate to="/parsing" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
