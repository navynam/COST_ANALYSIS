import React from 'react';

interface FluentIconProps {
  name: string;
  size?: number;
  style?: React.CSSProperties;
}

const iconPaths: Record<string, JSX.Element> = {
  // 📁 폴더/파일 (노란 폴더)
  folder: (
    <svg viewBox="0 0 32 32" fill="none">
      <path d="M3 7a2 2 0 012-2h7l3 3h12a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" fill="#FFB900"/>
      <path d="M3 12h26v12a2 2 0 01-2 2H5a2 2 0 01-2-2V12z" fill="#FFC83D"/>
    </svg>
  ),

  // 📅 달력
  calendar: (
    <svg viewBox="0 0 32 32" fill="none">
      <rect x="3" y="6" width="26" height="22" rx="3" fill="#3B82F6"/>
      <rect x="3" y="6" width="26" height="7" rx="3" fill="#2563EB"/>
      <rect x="7" y="16" width="4" height="3" rx="1" fill="#fff"/>
      <rect x="14" y="16" width="4" height="3" rx="1" fill="#fff"/>
      <rect x="21" y="16" width="4" height="3" rx="1" fill="#fff"/>
      <rect x="7" y="22" width="4" height="3" rx="1" fill="#BFDBFE"/>
      <rect x="14" y="22" width="4" height="3" rx="1" fill="#BFDBFE"/>
      <rect x="9" y="3" width="2" height="5" rx="1" fill="#1E40AF"/>
      <rect x="21" y="3" width="2" height="5" rx="1" fill="#1E40AF"/>
    </svg>
  ),

  // 👤 사용자
  person: (
    <svg viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="11" r="5" fill="#6366F1"/>
      <path d="M6 27c0-5.523 4.477-10 10-10s10 4.477 10 10H6z" fill="#818CF8"/>
    </svg>
  ),

  // 🏢 건물/부서
  building: (
    <svg viewBox="0 0 32 32" fill="none">
      <rect x="5" y="4" width="22" height="24" rx="2" fill="#6366F1"/>
      <rect x="9" y="8" width="4" height="3" rx="0.5" fill="#C7D2FE"/>
      <rect x="19" y="8" width="4" height="3" rx="0.5" fill="#C7D2FE"/>
      <rect x="9" y="14" width="4" height="3" rx="0.5" fill="#C7D2FE"/>
      <rect x="19" y="14" width="4" height="3" rx="0.5" fill="#C7D2FE"/>
      <rect x="13" y="22" width="6" height="6" rx="1" fill="#E0E7FF"/>
    </svg>
  ),

  // 📝 메모/노트
  memo: (
    <svg viewBox="0 0 32 32" fill="none">
      <rect x="5" y="3" width="22" height="26" rx="3" fill="#F59E0B"/>
      <rect x="9" y="9" width="14" height="2" rx="1" fill="#fff"/>
      <rect x="9" y="14" width="14" height="2" rx="1" fill="#fff"/>
      <rect x="9" y="19" width="10" height="2" rx="1" fill="#fff"/>
    </svg>
  ),

  // ✅ 완료/체크
  check: (
    <svg viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="13" fill="#10B981"/>
      <path d="M10 16l4 4 8-8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // ⚠️ 경고
  warning: (
    <svg viewBox="0 0 32 32" fill="none">
      <path d="M16 3L2 28h28L16 3z" fill="#F59E0B"/>
      <rect x="15" y="12" width="2" height="8" rx="1" fill="#fff"/>
      <circle cx="16" cy="23" r="1.2" fill="#fff"/>
    </svg>
  ),

  // ❌ 오류/취소
  cross: (
    <svg viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="13" fill="#EF4444"/>
      <path d="M11 11l10 10M21 11l-10 10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),

  // 🔍 검색/돋보기
  search: (
    <svg viewBox="0 0 32 32" fill="none">
      <circle cx="14" cy="14" r="8" stroke="#3B82F6" strokeWidth="3" fill="none"/>
      <path d="M20 20l8 8" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  ),

  // 💡 전구/팁
  lightbulb: (
    <svg viewBox="0 0 32 32" fill="none">
      <path d="M16 3C10.5 3 6 7.5 6 13c0 3.5 1.8 6.5 4.5 8.2V24a2 2 0 002 2h7a2 2 0 002-2v-2.8C24.2 19.5 26 16.5 26 13c0-5.5-4.5-10-10-10z" fill="#F59E0B"/>
      <rect x="12" y="26" width="8" height="3" rx="1.5" fill="#D97706"/>
      <path d="M13 14h6M16 11v6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),

  // 📊 차트/분석
  barchart: (
    <svg viewBox="0 0 32 32" fill="none">
      <rect x="3" y="18" width="5" height="10" rx="1" fill="#3B82F6"/>
      <rect x="10" y="12" width="5" height="16" rx="1" fill="#10B981"/>
      <rect x="17" y="6" width="5" height="22" rx="1" fill="#F59E0B"/>
      <rect x="24" y="14" width="5" height="14" rx="1" fill="#8B5CF6"/>
    </svg>
  ),

  // 📄 문서
  document: (
    <svg viewBox="0 0 32 32" fill="none">
      <path d="M7 4h12l6 6v18a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z" fill="#3B82F6"/>
      <path d="M19 4v6h6" fill="#93C5FD"/>
      <rect x="9" y="14" width="12" height="2" rx="1" fill="#fff"/>
      <rect x="9" y="19" width="8" height="2" rx="1" fill="#BFDBFE"/>
    </svg>
  ),

  // 📥 다운로드
  download: (
    <svg viewBox="0 0 32 32" fill="none">
      <rect x="4" y="20" width="24" height="8" rx="2" fill="#3B82F6"/>
      <path d="M16 4v14M10 14l6 6 6-6" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // 📤 업로드
  upload: (
    <svg viewBox="0 0 32 32" fill="none">
      <rect x="4" y="20" width="24" height="8" rx="2" fill="#10B981"/>
      <path d="M16 18V4M10 8l6-6 6 6" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // ⏳ 모래시계
  hourglass: (
    <svg viewBox="0 0 32 32" fill="none">
      <rect x="8" y="3" width="16" height="3" rx="1" fill="#F59E0B"/>
      <rect x="8" y="26" width="16" height="3" rx="1" fill="#F59E0B"/>
      <path d="M10 6c0 4.5 3 7 6 10-3 3-6 5.5-6 10h12c0-4.5-3-7-6-10 3-3 6-5.5 6-10H10z" fill="#FDE68A"/>
      <path d="M12 24c0-3 2-5 4-7 2 2 4 4 4 7H12z" fill="#F59E0B"/>
    </svg>
  ),

  // 🔬 현미경/분석중
  microscope: (
    <svg viewBox="0 0 32 32" fill="none">
      <circle cx="18" cy="8" r="4" stroke="#8B5CF6" strokeWidth="2.5" fill="none"/>
      <path d="M16 12v10" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round"/>
      <rect x="8" y="24" width="16" height="3" rx="1.5" fill="#8B5CF6"/>
      <path d="M12 22h8" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // 🧮 수식/계산
  abacus: (
    <svg viewBox="0 0 32 32" fill="none">
      <rect x="5" y="4" width="22" height="24" rx="2" stroke="#6366F1" strokeWidth="2" fill="none"/>
      <line x1="5" y1="11" x2="27" y2="11" stroke="#6366F1" strokeWidth="1.5"/>
      <line x1="5" y1="18" x2="27" y2="18" stroke="#6366F1" strokeWidth="1.5"/>
      <circle cx="11" cy="11" r="2" fill="#EF4444"/>
      <circle cx="18" cy="11" r="2" fill="#EF4444"/>
      <circle cx="14" cy="18" r="2" fill="#3B82F6"/>
      <circle cx="21" cy="18" r="2" fill="#3B82F6"/>
      <circle cx="10" cy="24" r="2" fill="#10B981"/>
    </svg>
  ),

  // 💰 돈/원가
  moneybag: (
    <svg viewBox="0 0 32 32" fill="none">
      <path d="M16 6c-6 0-10 5-10 12s4 10 10 10 10-3 10-10S22 6 16 6z" fill="#F59E0B"/>
      <path d="M13 3h6l-1 3h-4l-1-3z" fill="#D97706"/>
      <text x="16" y="20" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">₩</text>
    </svg>
  ),

  // 🤖 로봇/AI
  robot: (
    <svg viewBox="0 0 32 32" fill="none">
      <rect x="6" y="10" width="20" height="16" rx="3" fill="#6366F1"/>
      <circle cx="16" cy="7" r="2" fill="#A5B4FC"/>
      <line x1="16" y1="9" x2="16" y2="10" stroke="#A5B4FC" strokeWidth="2"/>
      <circle cx="12" cy="18" r="2.5" fill="#fff"/>
      <circle cx="20" cy="18" r="2.5" fill="#fff"/>
      <circle cx="12" cy="18" r="1" fill="#1E1B4B"/>
      <circle cx="20" cy="18" r="1" fill="#1E1B4B"/>
      <rect x="12" y="22" width="8" height="2" rx="1" fill="#C7D2FE"/>
    </svg>
  ),

  // 🏆 트로피/골든셋
  trophy: (
    <svg viewBox="0 0 32 32" fill="none">
      <path d="M10 5h12v10c0 3.3-2.7 6-6 6s-6-2.7-6-6V5z" fill="#F59E0B"/>
      <path d="M10 8H5c0 4 2 6 5 7v-7zM22 8h5c0 4-2 6-5 7V8z" fill="#FDE68A"/>
      <rect x="13" y="21" width="6" height="4" rx="1" fill="#D97706"/>
      <rect x="10" y="25" width="12" height="3" rx="1.5" fill="#F59E0B"/>
    </svg>
  ),

  // 🔔 알림/긴급
  bell: (
    <svg viewBox="0 0 32 32" fill="none">
      <path d="M16 4c-5 0-8 3-8 8v6l-2 3h20l-2-3v-6c0-5-3-8-8-8z" fill="#F59E0B"/>
      <circle cx="16" cy="27" r="2.5" fill="#D97706"/>
    </svg>
  ),

  // ⏰ 시계/지연
  alarm: (
    <svg viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="17" r="11" fill="#EF4444"/>
      <circle cx="16" cy="17" r="9" fill="#FEE2E2"/>
      <path d="M16 10v7l5 3" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 6L4 3M25 6l3-3" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // 📎 클립/첨부
  paperclip: (
    <svg viewBox="0 0 32 32" fill="none">
      <path d="M22 12l-9 9a4 4 0 01-5.66-5.66l9-9a2.5 2.5 0 013.54 3.54l-9 9a1 1 0 01-1.42-1.42l9-9" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  ),

  // 🌳 트리/관계도
  tree: (
    <svg viewBox="0 0 32 32" fill="none">
      <path d="M16 4l-9 10h5l-6 8h5l-4 6h18l-4-6h5l-6-8h5L16 4z" fill="#10B981"/>
      <rect x="14" y="26" width="4" height="4" rx="1" fill="#92400E"/>
    </svg>
  ),

  // 🚀 로켓
  rocket: (
    <svg viewBox="0 0 32 32" fill="none">
      <path d="M16 3c-3 3-5 8-5 14l-3 4 4 4 4-3c6 0 11-2 14-5L16 3z" fill="#3B82F6"/>
      <circle cx="20" cy="12" r="2" fill="#fff"/>
      <path d="M8 21l-3 5 5-3M11 24l-2 4 4-2" fill="#F59E0B"/>
    </svg>
  ),

  // 🔄 새로고침
  sync: (
    <svg viewBox="0 0 32 32" fill="none">
      <path d="M6 16a10 10 0 0118-6" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M26 16a10 10 0 01-18 6" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M24 6l2 4-4 2" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M8 26l-2-4 4-2" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  ),

  // 📌 핀/위치
  pin: (
    <svg viewBox="0 0 32 32" fill="none">
      <path d="M16 3C11 3 7 7 7 12c0 7 9 17 9 17s9-10 9-17c0-5-4-9-9-9z" fill="#EF4444"/>
      <circle cx="16" cy="12" r="3" fill="#fff"/>
    </svg>
  ),

  // 🖱️ 마우스
  mouse: (
    <svg viewBox="0 0 32 32" fill="none">
      <rect x="8" y="4" width="16" height="24" rx="8" fill="#6B7280"/>
      <line x1="16" y1="4" x2="16" y2="14" stroke="#D1D5DB" strokeWidth="1.5"/>
      <rect x="14" y="8" width="4" height="5" rx="2" fill="#D1D5DB"/>
    </svg>
  ),

  // 🎨 팔레트/테마
  palette: (
    <svg viewBox="0 0 32 32" fill="none">
      <path d="M16 3C8.8 3 3 8.8 3 16s5.8 13 13 13c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.4c4 0 7.6-3.4 7.6-7.6C29 8.1 23.2 3 16 3z" fill="#8B5CF6"/>
      <circle cx="10" cy="13" r="2.5" fill="#EF4444"/>
      <circle cx="16" cy="9" r="2.5" fill="#F59E0B"/>
      <circle cx="22" cy="13" r="2.5" fill="#10B981"/>
      <circle cx="11" cy="20" r="2.5" fill="#3B82F6"/>
    </svg>
  ),

  // ⭐ 별/추출완료
  star: (
    <svg viewBox="0 0 32 32" fill="none">
      <path d="M16 3l3.7 7.5L28 12l-6 5.8 1.4 8.2L16 22l-7.4 4 1.4-8.2L4 12l8.3-1.5L16 3z" fill="#F59E0B"/>
    </svg>
  ),

  // 📋 클립보드/리스트
  clipboard: (
    <svg viewBox="0 0 32 32" fill="none">
      <rect x="6" y="5" width="20" height="24" rx="2" fill="#3B82F6"/>
      <rect x="11" y="3" width="10" height="4" rx="2" fill="#1E40AF"/>
      <rect x="10" y="12" width="12" height="2" rx="1" fill="#fff"/>
      <rect x="10" y="17" width="12" height="2" rx="1" fill="#BFDBFE"/>
      <rect x="10" y="22" width="8" height="2" rx="1" fill="#BFDBFE"/>
    </svg>
  ),

  // 🎯 타겟
  target: (
    <svg viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="13" fill="#EF4444"/>
      <circle cx="16" cy="16" r="9" fill="#fff"/>
      <circle cx="16" cy="16" r="6" fill="#EF4444"/>
      <circle cx="16" cy="16" r="2.5" fill="#fff"/>
    </svg>
  ),

  // 🕐 스케줄/시계 (간단한 시계)
  schedule: (
    <svg viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="13" fill="#F59E0B"/>
      <circle cx="16" cy="16" r="11" fill="#FEF3C7"/>
      <path d="M16 9v7l5 3" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // ❌ 오류 (빨간 X 원형)
  error: (
    <svg viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="13" fill="#EF4444"/>
      <path d="M11 11l10 10M21 11l-10 10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),

  // ❓ 분석/Biotech
  biotech: (
    <svg viewBox="0 0 32 32" fill="none">
      <circle cx="20" cy="8" r="4" stroke="#6366F1" strokeWidth="2" fill="none"/>
      <path d="M14 12l-6 14h16l-6-14" fill="#818CF8"/>
      <circle cx="16" cy="20" r="2" fill="#fff"/>
    </svg>
  ),

  // 💵 금액/AttachMoney
  money: (
    <svg viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="13" fill="#10B981"/>
      <text x="16" y="21" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="700">₩</text>
    </svg>
  ),

  // 📋 ListAlt
  listalt: (
    <svg viewBox="0 0 32 32" fill="none">
      <rect x="4" y="4" width="24" height="24" rx="3" fill="#3B82F6"/>
      <circle cx="10" cy="11" r="1.5" fill="#fff"/>
      <rect x="14" y="10" width="10" height="2" rx="1" fill="#fff"/>
      <circle cx="10" cy="16" r="1.5" fill="#fff"/>
      <rect x="14" y="15" width="10" height="2" rx="1" fill="#BFDBFE"/>
      <circle cx="10" cy="21" r="1.5" fill="#fff"/>
      <rect x="14" y="20" width="8" height="2" rx="1" fill="#BFDBFE"/>
    </svg>
  ),

  // ➡️ 스킵/다음
  skipnext: (
    <svg viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="13" fill="#F59E0B"/>
      <path d="M12 10l8 6-8 6V10z" fill="#fff"/>
      <rect x="21" y="10" width="2" height="12" rx="1" fill="#fff"/>
    </svg>
  ),

  // 🔔 긴급 알림
  notification: (
    <svg viewBox="0 0 32 32" fill="none">
      <path d="M16 4c-5 0-8 3-8 8v6l-2 3h20l-2-3v-6c0-5-3-8-8-8z" fill="#EF4444"/>
      <circle cx="16" cy="27" r="2.5" fill="#B91C1C"/>
      <circle cx="24" cy="8" r="4" fill="#F59E0B"/>
    </svg>
  ),

  // 📎 첨부파일 (파일 아이콘 + 클립)
  attachfile: (
    <svg viewBox="0 0 32 32" fill="none">
      <path d="M8 4h10l6 6v18a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z" fill="#6366F1"/>
      <path d="M18 4v6h6" fill="#A5B4FC"/>
      <path d="M16 14v8a2 2 0 01-4 0v-9a3 3 0 016 0v8" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  ),

  // 🌐 관계도/AccountTree
  accounttree: (
    <svg viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="6" r="3" fill="#6366F1"/>
      <circle cx="8" cy="20" r="3" fill="#3B82F6"/>
      <circle cx="24" cy="20" r="3" fill="#10B981"/>
      <circle cx="16" cy="26" r="3" fill="#F59E0B"/>
      <path d="M16 9v3M12 14l-4 4M20 14l4 4M16 17v6" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),

  // 🔢 계산기/Calculate
  calculate: (
    <svg viewBox="0 0 32 32" fill="none">
      <rect x="5" y="3" width="22" height="26" rx="3" fill="#6366F1"/>
      <rect x="8" y="6" width="16" height="6" rx="1.5" fill="#C7D2FE"/>
      <circle cx="11" cy="17" r="2" fill="#fff"/>
      <circle cx="16" cy="17" r="2" fill="#fff"/>
      <circle cx="21" cy="17" r="2" fill="#fff"/>
      <circle cx="11" cy="23" r="2" fill="#fff"/>
      <circle cx="16" cy="23" r="2" fill="#fff"/>
      <rect x="19" y="21" width="4" height="4" rx="1" fill="#F59E0B"/>
    </svg>
  ),

  // ↔️ 교환/SwapHoriz
  swap: (
    <svg viewBox="0 0 32 32" fill="none">
      <path d="M4 12h20l-4-4M28 20H8l4 4" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  ),

  // 📂 업로드파일
  uploadfile: (
    <svg viewBox="0 0 32 32" fill="none">
      <path d="M7 4h12l6 6v18a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z" fill="#10B981"/>
      <path d="M19 4v6h6" fill="#6EE7B7"/>
      <path d="M16 22v-8M12 18l4-4 4 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // ✏️ 편집/EditNote
  editnote: (
    <svg viewBox="0 0 32 32" fill="none">
      <rect x="4" y="5" width="18" height="22" rx="2" fill="#3B82F6"/>
      <rect x="8" y="10" width="10" height="2" rx="1" fill="#fff"/>
      <rect x="8" y="15" width="8" height="2" rx="1" fill="#BFDBFE"/>
      <path d="M22 8l4 4-10 10H12v-4L22 8z" fill="#F59E0B"/>
    </svg>
  ),

  // 🧠 AI/SmartToy
  smarttoy: (
    <svg viewBox="0 0 32 32" fill="none">
      <rect x="6" y="10" width="20" height="16" rx="3" fill="#8B5CF6"/>
      <circle cx="16" cy="7" r="2" fill="#C4B5FD"/>
      <line x1="16" y1="9" x2="16" y2="10" stroke="#C4B5FD" strokeWidth="2"/>
      <circle cx="12" cy="18" r="2.5" fill="#fff"/>
      <circle cx="20" cy="18" r="2.5" fill="#fff"/>
      <circle cx="12" cy="18" r="1" fill="#4C1D95"/>
      <circle cx="20" cy="18" r="1" fill="#4C1D95"/>
      <path d="M13 23h6" stroke="#C4B5FD" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),

  // f(x) 수식/Functions
  functions: (
    <svg viewBox="0 0 32 32" fill="none">
      <rect x="4" y="4" width="24" height="24" rx="4" fill="#6366F1"/>
      <text x="16" y="22" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="700" fontStyle="italic">f(x)</text>
    </svg>
  ),

  // ⚙️ 설정
  settings: (
    <svg viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="5" fill="#6B7280"/>
      <path d="M16 2l2 3.5a10 10 0 014.3 2.5L26 6l2 3.5-3.5 2a10 10 0 010 5l3.5 2L26 22l-3.7-2a10 10 0 01-4.3 2.5L16 26l-2-3.5a10 10 0 01-4.3-2.5L6 22l-2-3.5 3.5-2a10 10 0 010-5L4 9.5 6 6l3.7 2a10 10 0 014.3-2.5L16 2z" fill="#9CA3AF"/>
    </svg>
  ),

  // 🖨️ 인쇄
  print: (
    <svg viewBox="0 0 32 32" fill="none">
      <rect x="6" y="12" width="20" height="12" rx="2" fill="#6B7280"/>
      <rect x="9" y="4" width="14" height="8" rx="1" fill="#D1D5DB"/>
      <rect x="9" y="20" width="14" height="8" rx="1" fill="#fff"/>
      <circle cx="22" cy="16" r="1.5" fill="#10B981"/>
    </svg>
  ),

  // 📥 엑셀다운로드
  exceldownload: (
    <svg viewBox="0 0 32 32" fill="none">
      <rect x="4" y="4" width="24" height="24" rx="3" fill="#10B981"/>
      <text x="16" y="18" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">XLS</text>
      <path d="M16 20v5M13 23l3 3 3-3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // 👥 관리자
  admin: (
    <svg viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="10" r="5" fill="#6366F1"/>
      <path d="M6 27c0-5.523 4.477-10 10-10s10 4.477 10 10H6z" fill="#818CF8"/>
      <circle cx="24" cy="8" r="5" fill="#F59E0B"/>
      <path d="M22 7l1.5 1.5 3-3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

const FluentIcon: React.FC<FluentIconProps> = ({ name, size = 16, style }) => {
  const icon = iconPaths[name];
  if (!icon) return null;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        verticalAlign: 'middle',
        flexShrink: 0,
        ...style,
      }}
    >
      {React.cloneElement(icon, {
        width: size,
        height: size,
        style: { width: size, height: size },
      })}
    </span>
  );
};

export default FluentIcon;
