/**
 * 🎨 테마 컨텍스트 및 스위처
 * 
 * 기존 현대모비스 테마와 새로운 Toss 테마 간 전환 지원
 * 사용자가 실시간으로 디자인을 비교할 수 있도록 구현
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, Theme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { defaultTheme } from '../themes/defaultTheme';
import { tossTheme } from '../themes/tossTheme';

// 🎨 테마 타입 정의
export type ThemeType = 'hyundai' | 'toss';

interface ThemeContextValue {
  currentTheme: ThemeType;
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (themeType: ThemeType) => void;
}

// 🎨 테마 컨텍스트 생성
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// 🎨 테마 프로바이더 Props
interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: ThemeType;
}

// 🎨 테마 프로바이더 컴포넌트
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  initialTheme = 'hyundai' 
}) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(
    // 로컬 스토리지에서 테마 복원 또는 초기값 사용
    (localStorage.getItem('app-theme') as ThemeType) || initialTheme
  );

  // 🎨 테마 객체 매핑
  const themes: Record<ThemeType, Theme> = {
    hyundai: defaultTheme,
    toss: tossTheme
  };

  // 🎨 현재 테마 객체
  const theme = themes[currentTheme];

  // 🎨 테마 전환 함수
  const toggleTheme = () => {
    const newTheme: ThemeType = currentTheme === 'hyundai' ? 'toss' : 'hyundai';
    setCurrentTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
    
    console.log('🎨 테마 전환:', {
      이전: currentTheme,
      현재: newTheme,
      저장됨: 'localStorage'
    });
  };

  // 🎨 특정 테마로 설정
  const setTheme = (themeType: ThemeType) => {
    setCurrentTheme(themeType);
    localStorage.setItem('app-theme', themeType);
    
    console.log('🎨 테마 설정:', {
      테마: themeType,
      저장됨: 'localStorage'
    });
  };

  // 🎨 컨텍스트 값
  const contextValue: ThemeContextValue = {
    currentTheme,
    theme,
    toggleTheme,
    setTheme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// 🎨 테마 훅 (컨텍스트 사용 편의 함수)
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

// 🎨 테마 정보 (디버깅 및 개발용)
export const getThemeInfo = (themeType: ThemeType) => {
  const themes = {
    hyundai: {
      name: '현대모비스 테마',
      description: '기업 브랜딩 중심의 전문적인 디자인',
      primaryColor: '#003875',
      characteristics: [
        '진중하고 신뢰감 있는 색상',
        '기업용 UI/UX',
        '높은 정보 밀도',
        '전문적인 인터페이스'
      ]
    },
    toss: {
      name: 'Toss 스타일 테마',  
      description: '친근하고 직관적인 사용자 경험 중심',
      primaryColor: '#0094FF',
      characteristics: [
        '밝고 친근한 색상',
        '사용자 친화적 UI/UX',
        '부드러운 인터랙션',
        '직관적인 인터페이스'
      ]
    }
  };
  
  return themes[themeType];
};

export default ThemeProvider;