/**
 * 🔐 인증 컨텍스트 (Authentication Context)
 * 
 * 🎯 역할:
 * - 전체 앱에서 로그인 상태를 관리하는 전역 상태 관리자
 * - React Context API를 사용하여 하위 컴포넌트들이 인증 상태에 접근
 * - 로컬 스토리지를 활용한 로그인 상태 지속성 제공
 * 
 * 📋 관리하는 상태:
 * - isAuthenticated: 로그인 여부 (boolean)
 * - user: 사용자 정보 (id, name)
 * - isOtpVerified: OTP 인증 완료 여부
 * 
 * 🔧 제공하는 기능:
 * - login(): 로그인 처리 + 로컬 스토리지 저장
 * - logout(): 로그아웃 처리 + 로컬 스토리지 정리
 * - setOtpVerified(): OTP 인증 완료 처리
 * 
 * 💾 데이터 지속성:
 * - localStorage에 인증 정보 저장
 * - 브라우저 새로고침 시에도 로그인 상태 유지
 * - 로그아웃 시 저장된 정보 완전 삭제
 * 
 * 🎭 사용 패턴:
 * 1. AuthProvider로 앱 전체를 감싸기
 * 2. 하위 컴포넌트에서 useAuth() 훅으로 상태 접근
 * 3. 인증이 필요한 페이지에서 isAuthenticated 체크
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 📋 인증 상태 인터페이스
interface AuthState {
  isAuthenticated: boolean;                               // 로그인 여부
  user: { id: string; name: string } | null;             // 사용자 정보 (id, 이름)
}

// 🔧 컨텍스트에서 제공하는 전체 기능 인터페이스
interface AuthContextType extends AuthState {
  login: (user: { id: string; name: string }) => void;   // 로그인 함수
  logout: () => void;                                    // 로그아웃 함수
  setOtpVerified: () => void;                           // OTP 인증 완료 함수
  isOtpVerified: boolean;                               // OTP 인증 상태
}

// 🏗️ React Context 생성 (초기값: undefined)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 🔐 인증 상태 제공자 컴포넌트
 * 앱 전체를 감싸서 하위 컴포넌트들이 인증 상태에 접근할 수 있게 함
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  
  // 📦 인증 상태 관리 (로컬 스토리지에서 초기값 복원)
  const [state, setState] = useState<AuthState>(() => {
    const stored = localStorage.getItem('auth');               // 저장된 인증 정보 확인
    return stored 
      ? JSON.parse(stored)                                     // 있으면 파싱해서 사용
      : { isAuthenticated: false, user: null };                // 없으면 기본값
  });
  
  // 🔢 OTP 인증 상태 관리 (별도 로컬 스토리지)
  const [isOtpVerified, setIsOtpVerified] = useState(() => {
    return localStorage.getItem('otpVerified') === 'true';     // 문자열 'true'를 boolean으로 변환
  });

  // 💾 인증 상태가 변경될 때마다 로컬 스토리지에 자동 저장
  useEffect(() => {
    localStorage.setItem('auth', JSON.stringify(state));
  }, [state]);

  // 🚪 로그인 처리 함수
  const login = (user: { id: string; name: string }) => {
    setState({ isAuthenticated: true, user });               // 인증 상태 업데이트
    setIsOtpVerified(true);                                 // OTP 인증 완료 처리
    localStorage.setItem('otpVerified', 'true');            // OTP 상태 저장
  };

  // 🔢 OTP 인증 완료 처리 함수
  const setOtpVerified = () => {
    setIsOtpVerified(true);                                 // OTP 상태 업데이트
    localStorage.setItem('otpVerified', 'true');            // OTP 상태 저장
    setState(prev => ({ ...prev, isAuthenticated: true })); // 인증 완료 처리
  };

  // 🚪 로그아웃 처리 함수
  const logout = () => {
    setState({ isAuthenticated: false, user: null });       // 인증 상태 초기화
    setIsOtpVerified(false);                               // OTP 상태 초기화
    localStorage.removeItem('auth');                        // 저장된 인증 정보 삭제
    localStorage.removeItem('otpVerified');                 // 저장된 OTP 정보 삭제
  };

  // 🎁 컨텍스트 값 제공 (상태 + 함수들)
  return (
    <AuthContext.Provider value={{ 
      ...state,                    // 인증 상태 (isAuthenticated, user)
      login,                       // 로그인 함수
      logout,                      // 로그아웃 함수
      setOtpVerified,             // OTP 인증 함수
      isOtpVerified               // OTP 상태
    }}>
      {children}                   {/* 하위 컴포넌트들 */}
    </AuthContext.Provider>
  );
};

/**
 * 🎣 인증 컨텍스트 사용 훅
 * 
 * 🎯 용도:
 * - 컴포넌트에서 인증 상태 및 함수들에 접근
 * - AuthProvider 내부에서만 사용 가능 (안전성 체크)
 * 
 * 📝 사용 예시:
 * ```tsx
 * const { isAuthenticated, user, login, logout } = useAuth();
 * 
 * if (!isAuthenticated) {
 *   return <Navigate to="/login" />;
 * }
 * ```
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  
  // 🚨 AuthProvider 외부에서 사용 시 에러 발생
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return ctx;
};
