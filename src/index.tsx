/**
 * 📱 애플리케이션 진입점 (Entry Point)
 * 
 * 🎯 역할:
 * - React 앱을 HTML DOM에 마운트하는 시작점
 * - App 컴포넌트를 렌더링하여 전체 애플리케이션을 시작
 * 
 * 🔧 기술 요소:
 * - React 18의 createRoot API 사용 (기존 render 방식에서 업그레이드)
 * - StrictMode: 개발 중 잠재적 문제를 조기에 발견하기 위한 개발 도구
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// HTML의 id="root" 요소를 찾아서 React 앱을 마운트할 컨테이너로 설정
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

// StrictMode로 감싸서 개발 중 잠재적 버그를 조기 발견
// App 컴포넌트를 렌더링하여 전체 애플리케이션 시작
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
