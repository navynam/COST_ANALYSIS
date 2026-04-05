# 현대모비스 견적서 분석 시스템

현대모비스 협력사 견적서를 자동 파싱·검증·분석·비교하는 웹 애플리케이션입니다.

## 업무 흐름

```
[1] 파싱(업로드)  →  [2] 검증  →  [3] 분석  →  [4] 비교
 /parsing             /verification  /analysis    /comparison
```

| 단계 | 경로 | 역할 |
|------|------|------|
| 1 파싱 | `/parsing`, `/parsing_card` | Excel 견적서 파일 업로드 및 AI 파싱 |
| 2 검증 | `/verification` | 파싱 결과 리뷰 및 이상치 승인/거부 |
| 3 분석 | `/analysis` | 재료비·가공비·제경비 항목별 심층 분석 |
| 4 비교 | `/comparison` | 여러 협력사 견적서 병렬 비교 |

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| UI 프레임워크 | React 18 + TypeScript 5 |
| 컴포넌트 라이브러리 | MUI v5 (Material UI) |
| 라우터 | React Router v6 (HashRouter, GitHub Pages 호환) |
| 상태 관리 | React Context API + Custom Hooks |
| HTTP 클라이언트 | axios |
| 차트 | Recharts |
| 스프레드시트 | Fortune Sheet / Handsontable |
| 빌드 | Create React App |
| 배포 | GitHub Pages (`npm run deploy`) |

---

## 프로젝트 구조

```
src/
├── features/          # 기능별 모듈 (페이지 + 훅 + 타입 + 데이터)
│   ├── auth/          # 로그인·인증 (AuthContext, LoginPage)
│   ├── parsing/       # 파싱/업로드 (1단계)
│   ├── verification/  # 검증/리뷰 (2단계)
│   ├── analysis/      # 분석 (3단계) ← 핵심 feature
│   ├── comparison/    # 비교 (4단계)
│   ├── dashboard/     # 대시보드 홈
│   ├── insight/       # AI 인사이트 스튜디오
│   ├── history/       # 작업 이력·알림
│   ├── model-management/ # 원가 모델 관리
│   └── settings/      # 시스템 설정
│
├── shared/            # 프로젝트 전체에서 재사용되는 공통 영역
│   ├── components/    # 공통 UI 컴포넌트 (ConfidenceBar, StatusChip 등)
│   ├── constants/     # 컬러 시스템 (colors.ts)
│   ├── contexts/      # ThemeContext (다크/라이트 테마 전환)
│   ├── layouts/       # 앱 셸 (MainLayout, Sidebar)
│   ├── styles/        # MUI sx 스타일 객체 모음 ← NEW
│   │   ├── tableStyles.ts   # 테이블 헤더·셀·소계·합계 스타일
│   │   ├── layoutStyles.ts  # 페이지 컨테이너·섹션·버튼 스타일
│   │   └── index.ts         # 단일 진입점 (re-export)
│   ├── themes/        # MUI 테마 (defaultTheme, tossTheme)
│   ├── types/         # 공통 타입 단일 진입점 (index.ts)
│   └── utils/         # 포맷팅 유틸 (format.ts)
│
├── services/          # API 호출 레이어 (axios 기반)
│   ├── api.ts         # axios 인스턴스 (baseURL 설정)
│   ├── auth.ts        # authAPI
│   ├── parsing.ts     # parsingAPI
│   ├── mapping.ts     # mappingAPI
│   ├── comparisonApi.ts
│   ├── quotationApi.ts
│   ├── vendorApi.ts
│   ├── productApi.ts
│   └── index.ts       # 단일 진입점 (re-export)
│
├── types/             # 레거시 타입 (shared/types/index.ts 로 re-export됨)
│   ├── auth.ts        # 인증 타입
│   ├── common.ts      # 채팅·이력 등 범용 타입
│   ├── estimate.ts    # 파싱·업로드 타입
│   └── mapping.ts     # 매핑 타입
│
├── hooks/             # 레거시 공통 훅 (useApi, useNotification)
├── components/        # 레거시 공통 컴포넌트 (신규 코드는 shared/components 사용)
├── App.tsx            # 라우팅 설정 + Provider 구성
└── index.tsx          # React 앱 진입점
```

### 각 feature 폴더 내부 구조 (analysis 예시)

```
features/analysis/
├── AnalysisPage.tsx          # 페이지 컴포넌트 (View만 담당)
├── types.ts                  # 이 feature에만 사용되는 타입
├── hooks/
│   ├── useAnalysisPage.ts    # 페이지 전체 상태 관리 훅
│   ├── useListViewRow.ts
│   └── useRelationView.ts
├── components/               # 이 페이지에서만 사용하는 서브 컴포넌트
│   ├── StatusBadge.tsx       # → shared/components/StatusChip 래퍼
│   ├── ConfidenceBar.tsx     # → shared/components/ConfidenceBar re-export
│   ├── ListView.tsx
│   ├── RelationView.tsx
│   └── ...
└── data/                     # 목업 데이터 (API 연동 전 임시)
    ├── costGroups.ts
    └── listData.ts
```

---

## 스타일 가이드

### 1. 색상 - `shared/constants/colors.ts`

```typescript
import { C, COLORS, STATUS_COLORS } from '../../shared/constants/colors';

// 단축 별칭 (기존 코드 호환)
C.blue   // #0071e3 (primary)
C.dark   // #1d1d1f
C.gray   // #86868b
C.border // #e5e5e7

// 전체 팔레트
COLORS.primary
COLORS.success
COLORS.material.main
```

### 2. 테이블 스타일 - `shared/styles/tableStyles.ts`

```typescript
import { tableHeaderSx, tableCellSx, tableCellNumSx, totalRowSx } from '../../shared/styles';

<TableCell sx={tableHeaderSx}>항목명</TableCell>
<TableCell sx={tableCellNumSx}>{amount}</TableCell>
<TableRow sx={totalRowSx}>...</TableRow>
```

### 3. 레이아웃 스타일 - `shared/styles/layoutStyles.ts`

```typescript
import { pageContainerSx, sectionHeaderSx, btnOutlineSx } from '../../shared/styles';

<Box sx={pageContainerSx}>...</Box>
<Box sx={sectionHeaderSx}>...</Box>
<Button sx={btnOutlineSx}>저장</Button>
```

### 4. 타입 import

```typescript
// 공통 타입은 shared/types 에서
import { CostItem, ItemStatus, Quotation } from '../../shared/types';

// Feature 특화 타입은 해당 feature의 types.ts 에서
import type { ListItem, CostRow } from '../types';
```

### 5. API 호출

```typescript
// services/index.ts 단일 진입점 사용
import { authAPI, parsingAPI, getComparison } from '../../services';
```

---

## 주요 컴포넌트

| 컴포넌트 | 위치 | 설명 |
|----------|------|------|
| `ConfidenceBar` | `shared/components/ConfidenceBar.tsx` | AI 신뢰도 프로그레스 바 |
| `StatusChip` | `shared/components/StatusChip.tsx` | 상태 배지 (정상/경고/오류/이상치) |
| `ThemeSwitcher` | `shared/components/ThemeSwitcher.tsx` | 테마 전환 토글 |
| `SmartGuide` | `shared/components/SmartGuide.tsx` | 워크플로우 단계 안내 |
| `MainLayout` | `shared/layouts/MainLayout.tsx` | 사이드바 + 헤더 셸 |
| `Sidebar` | `shared/layouts/Sidebar.tsx` | 좌측 네비게이션 메뉴 |

---

## 개발 환경 설정

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:3000)
npm start

# TypeScript 타입 검사
npx tsc --noEmit

# 프로덕션 빌드
npm run build

# GitHub Pages 배포
npm run deploy
```

### 환경 변수 (`.env`)

```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_MAPPING_API_URL=http://localhost:8000
```

---

## 인증 흐름

1. 로그인 페이지 (`/login`) → `features/auth/LoginPage.tsx`
2. `features/auth/AuthContext.tsx`가 전역 인증 상태 관리
3. `MainLayout`에서 `isAuthenticated` 체크 → 미인증 시 `/login`으로 리다이렉트
4. 인증 정보는 `localStorage`에 저장 (새로고침 후에도 유지)

```typescript
// 어느 컴포넌트에서든 인증 상태 접근
import { useAuth } from '../../features/auth/AuthContext';
const { user, isAuthenticated, login, logout } = useAuth();
```

---

## 테마 시스템

두 가지 테마를 런타임에 전환할 수 있습니다.

| 테마 | 파일 | 설명 |
|------|------|------|
| `hyundai` | `shared/themes/defaultTheme.ts` | 현대모비스 브랜딩 (Primary: #003875) |
| `toss` | `shared/themes/tossTheme.ts` | Toss 스타일 (Primary: #0064ff) |

```typescript
import { useTheme } from '../shared/contexts/ThemeContext';
const { theme, setTheme } = useTheme();
setTheme('toss');
```
