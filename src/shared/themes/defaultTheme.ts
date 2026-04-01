/**
 * 🏢 현대모비스 브랜딩 테마
 * 
 * 현대모비스 CI 기반 전문적인 기업용 테마:
 * 1. 진중하고 신뢰감 있는 색상 팔레트
 * 2. 높은 정보 밀도 최적화
 * 3. 기업용 UI/UX 패턴
 * 4. 한글 타이포그래피 최적화
 */

import { createTheme } from '@mui/material/styles';

// 🏢 현대모비스 브랜드 컬러
const hyundaiColors = {
  // 현대모비스 메인 컬러 (진중한 빨간색)
  primary: '#e60012',
  
  // 현대모비스 서브 컬러 (차분한 파란색) 
  secondary: '#003875',
  
  // 상태 컬러
  success: '#34c759',
  warning: '#ff9500', 
  error: '#e60012',
  
  // 그레이 스케일
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121'
  }
};

// 🏢 현대모비스 테마 정의
export const defaultTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { 
      main: hyundaiColors.primary,
      contrastText: '#ffffff'
    },
    secondary: { 
      main: hyundaiColors.secondary,
      contrastText: '#ffffff'
    },
    error: { 
      main: hyundaiColors.error
    },
    warning: { 
      main: hyundaiColors.warning
    },
    success: { 
      main: hyundaiColors.success
    },
    grey: hyundaiColors.grey,
    background: {
      default: '#ffffff',
      paper: '#ffffff'
    },
    text: {
      primary: hyundaiColors.grey[900],
      secondary: hyundaiColors.grey[600]
    }
  },
  
  typography: { 
    fontFamily: '"Noto Sans KR", Roboto, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 }
  },
  
  // 🏢 기업용 컴포넌트 스타일
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          textTransform: 'none'
        }
      }
    },
    
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }
      }
    },
    
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500
        }
      }
    }
  },
  
  shape: {
    borderRadius: 8
  }
});

export default defaultTheme;