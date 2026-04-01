/**
 * 🎨 Toss 스타일 테마
 * 
 * Toss 디자인 철학 반영:
 * 1. 심플하고 깔끔한 디자인
 * 2. 친근하고 따뜻한 색상
 * 3. 직관적인 사용자 경험
 * 4. 높은 가독성과 접근성
 * 5. 일관된 디자인 시스템
 */

import { createTheme, ThemeOptions } from '@mui/material/styles';

// 🎨 Toss 브랜드 컬러팔레트
const tossColors = {
  // 메인 브랜드 컬러 (Toss Blue)
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB', 
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#0094FF', // Toss 메인 블루
    600: '#1976D2',
    700: '#1565C0',
    800: '#0D47A1',
    900: '#0A3D91'
  },
  
  // 포인트 컬러 (따뜻한 오렌지)
  secondary: {
    50: '#FFF3E0',
    100: '#FFE0B2',
    200: '#FFCC80', 
    300: '#FFB74D',
    400: '#FFA726',
    500: '#FF8F00', // Toss 오렌지
    600: '#F57C00',
    700: '#EF6C00',
    800: '#E65100',
    900: '#D84315'
  },
  
  // 성공/긍정 (부드러운 그린)
  success: {
    50: '#E8F5E8',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50', // 성공 그린
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20'
  },
  
  // 경고/주의 (따뜻한 옐로우)
  warning: {
    50: '#FFFDE7',
    100: '#FFF9C4',
    200: '#FFF59D',
    300: '#FFF176',
    400: '#FFEE58',
    500: '#FFD600', // 경고 옐로우
    600: '#FFC107',
    700: '#FF8F00',
    800: '#FF6F00',
    900: '#E65100'
  },
  
  // 오류/위험 (부드러운 레드)
  error: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#F44336', // 오류 레드
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C'
  },
  
  // 그레이 스케일 (따뜻한 뉴트럴)
  grey: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121'
  }
};

// 🎨 Toss 타이포그래피 (가독성 우선)
const tossTypography = {
  fontFamily: [
    'Pretendard',
    'Apple SD Gothic Neo', 
    'Noto Sans KR',
    'Malgun Gothic',
    'sans-serif'
  ].join(','),
  
  // 헤더 폰트
  h1: {
    fontSize: '2rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.02em'
  },
  h2: {
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.01em'
  },
  h3: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.3
  },
  h4: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.4
  },
  h5: {
    fontSize: '1.125rem',
    fontWeight: 600,
    lineHeight: 1.4
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 600,
    lineHeight: 1.5
  },
  
  // 본문 폰트
  body1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.6,
    letterSpacing: '0.01em'
  },
  body2: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0.01em'
  },
  
  // 버튼 폰트
  button: {
    fontSize: '0.875rem',
    fontWeight: 600,
    textTransform: 'none' as const,
    letterSpacing: '0.02em'
  },
  
  // 캡션
  caption: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.4,
    letterSpacing: '0.03em'
  }
};

// 🎨 Toss 컴포넌트 스타일링
const tossComponents = {
  // 버튼 스타일 (라운드하고 친근한)
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        padding: '12px 24px',
        fontSize: '0.875rem',
        fontWeight: 600,
        textTransform: 'none' as const,
        boxShadow: 'none',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 148, 255, 0.2)',
          transform: 'translateY(-1px)'
        }
      },
      contained: {
        '&:hover': {
          boxShadow: '0 6px 16px rgba(0, 148, 255, 0.3)'
        }
      },
      outlined: {
        borderWidth: 1.5,
        '&:hover': {
          borderWidth: 1.5
        }
      }
    }
  },
  
  // 카드 스타일 (부드러운 그림자)
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 6px 24px rgba(0, 0, 0, 0.12)',
          transform: 'translateY(-2px)'
        }
      }
    }
  },
  
  // 입력 필드 (깔끔하고 접근성 좋은)
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 12,
          backgroundColor: '#FAFAFA',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: '#F5F5F5'
          },
          '&.Mui-focused': {
            backgroundColor: '#FFFFFF',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: tossColors.primary[500],
              borderWidth: 2
            }
          }
        }
      }
    }
  },
  
  // 칩 스타일 (부드럽고 친근한)
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 20,
        fontSize: '0.75rem',
        fontWeight: 500,
        height: 28
      },
      filled: {
        backgroundColor: tossColors.grey[100],
        color: tossColors.grey[700],
        '&:hover': {
          backgroundColor: tossColors.grey[200]
        }
      }
    }
  },
  
  // 탭 스타일 (깔끔한 언더라인)
  MuiTabs: {
    styleOverrides: {
      root: {
        borderBottom: `1px solid ${tossColors.grey[200]}`,
        '& .MuiTabs-indicator': {
          height: 3,
          borderRadius: '3px 3px 0 0',
          backgroundColor: tossColors.primary[500]
        }
      }
    }
  },
  
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none' as const,
        fontWeight: 500,
        fontSize: '0.875rem',
        minHeight: 48,
        '&.Mui-selected': {
          fontWeight: 600,
          color: tossColors.primary[500]
        }
      }
    }
  },
  
  // 다이얼로그 (깔끔한 모달)
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 20,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
      }
    }
  },
  
  // 아이콘 버튼 (부드러운 호버)
  MuiIconButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          backgroundColor: 'rgba(0, 148, 255, 0.08)',
          transform: 'scale(1.05)'
        }
      }
    }
  }
};

// 🎨 Toss 테마 정의
export const tossTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: tossColors.primary[500],
      light: tossColors.primary[300],
      dark: tossColors.primary[700],
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: tossColors.secondary[500],
      light: tossColors.secondary[300],
      dark: tossColors.secondary[700],
      contrastText: '#FFFFFF'
    },
    success: {
      main: tossColors.success[500],
      light: tossColors.success[300],
      dark: tossColors.success[700]
    },
    warning: {
      main: tossColors.warning[500],
      light: tossColors.warning[300],
      dark: tossColors.warning[700]
    },
    error: {
      main: tossColors.error[500],
      light: tossColors.error[300],
      dark: tossColors.error[700]
    },
    grey: tossColors.grey,
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF'
    },
    text: {
      primary: tossColors.grey[900],
      secondary: tossColors.grey[600]
    }
  },
  
  typography: tossTypography,
  
  components: tossComponents,
  
  shape: {
    borderRadius: 12 // 전체적으로 부드러운 모서리
  },
  
  // 커스텀 토큰 (Toss 스타일)
  spacing: 8, // 8px 기본 스페이싱
  
  // 그림자 (부드럽고 자연스러운)
  shadows: [
    'none',
    '0 1px 3px rgba(0, 0, 0, 0.06)',
    '0 2px 6px rgba(0, 0, 0, 0.08)', 
    '0 3px 9px rgba(0, 0, 0, 0.1)',
    '0 4px 12px rgba(0, 0, 0, 0.12)',
    '0 6px 16px rgba(0, 0, 0, 0.14)',
    '0 8px 20px rgba(0, 0, 0, 0.16)',
    '0 10px 24px rgba(0, 0, 0, 0.18)',
    '0 12px 28px rgba(0, 0, 0, 0.2)',
    '0 14px 32px rgba(0, 0, 0, 0.22)',
    '0 16px 36px rgba(0, 0, 0, 0.24)',
    '0 18px 40px rgba(0, 0, 0, 0.26)',
    '0 20px 44px rgba(0, 0, 0, 0.28)',
    '0 22px 48px rgba(0, 0, 0, 0.3)',
    '0 24px 52px rgba(0, 0, 0, 0.32)',
    '0 26px 56px rgba(0, 0, 0, 0.34)',
    '0 28px 60px rgba(0, 0, 0, 0.36)',
    '0 30px 64px rgba(0, 0, 0, 0.38)',
    '0 32px 68px rgba(0, 0, 0, 0.4)',
    '0 34px 72px rgba(0, 0, 0, 0.42)',
    '0 36px 76px rgba(0, 0, 0, 0.44)',
    '0 38px 80px rgba(0, 0, 0, 0.46)',
    '0 40px 84px rgba(0, 0, 0, 0.48)',
    '0 42px 88px rgba(0, 0, 0, 0.5)',
    '0 44px 92px rgba(0, 0, 0, 0.52)'
  ]
} as ThemeOptions);

export default tossTheme;