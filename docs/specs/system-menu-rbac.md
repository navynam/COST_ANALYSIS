# 시스템 관리 — 메뉴 / 권한 / 사원 관리

- 문서 버전: v0.2
- 작성일: 2026-09-01 (결정사항 반영 2026-09-02)
- 대상 레포: `cost-analysis-src` (프론트, 이번 구현 범위) / `cost-analysis-was` (백엔드, 다음 단계)
- 관련 문서: `docs/architecture/call-graph.md`, `docs/개발가이드_프론트엔드.md`

---

## 0. 확정 결정사항 (⚠️ 본문보다 우선)

사용자 확정(2026-09-01~02). **아래와 본문이 충돌하면 무조건 아래가 맞다.**
본문 중 특히 6장(매트릭스) · 5.8(사원↔권한) · 9장(화면) · 11.3(usePermission) 이 아직 구버전 서술이다.

| # | 항목 | 확정 내용 |
|---|---|---|
| D1 | 권한 세트 | 4종 확정 — `SYS_ADMIN` 시스템관리자 / `COST_MANAGER` 원가관리자 / `COST_STAFF` 원가담당자 / `VIEWER` 조회자 |
| D2 | 다중 권한 | **불가. 사원 1명 = 권한 1개(단일).** 합집합 연산 없음. `sys_employee_role` 조인 테이블 폐기 → `users.role_id` 다대일. 사원관리 화면은 단일 선택(셀렉트) |
| D3 | 액션 단위 | **5액션 — 조회(R) / 등록(C) / 수정(U) / 삭제(D) / 승인(A)**. `APPROVE` 를 별도 액션으로 추가. 모델관리 수식 승인/반려가 여기 매핑. `usePermission` 은 `canApprove` 도 반환 |
| D4 | 버튼 처리 | 권한 없는 버튼은 **숨김**(렌더링 안 함). 비활성/툴팁 방식 아님 |
| D5 | 조직 마스터 | 부서·직위를 **시스템 내 마스터로 직접 관리**. `sys_department` / `sys_position` CRUD 하는 **조직관리 화면(`/system/org`, `SYS_ORG`) 신규 추가**. 사원관리의 부서·직위 입력은 이 마스터 참조 드롭다운. SSO 값→마스터 코드 변환 매핑 테이블은 이번 범위 제외 |
| D6 | 시스템관리 하위메뉴 | **4개** — 메뉴관리(`SYS_MENU`) / 권한관리(`SYS_ROLE`) / 사원관리(`SYS_EMPLOYEE`) / 조직관리(`SYS_ORG`) |
| D7 | 메뉴관리 범위 | **기존 메뉴 수정만.** 신규 추가 버튼 없음, 삭제 없음(사용여부 OFF 로 대체). 메뉴명·아이콘·정렬순서·사용여부·계층 재배치만 편집. `SYS_MENU` 는 실질적으로 R/U 만 의미 있음 |
| D8 | 숨김 메뉴 | `/verification`, `/analysis` 는 **권한 대상으로 등록하되 사이드바 미노출**. 메뉴 엔티티에 `visibleInNav` 플래그로 구분하고 메뉴관리 화면에서도 이 구분이 보이게 |
| D9 | 규칙 미매칭 | SSO 신규 사원이 기본권한 규칙에 하나도 안 맞으면 **`VIEWER` 자동 부여**. '승인 대기' 상태 도입 안 함 |
| D10 | 부서 계층 상속 | 하지 않음(정확 일치). 마스터에 상위부서 필드는 두되 규칙 매칭엔 미사용 |
| D11 | SSO 재로그인 | 부서·직위 값은 SSO 값으로 갱신하되 **권한은 자동 재계산 안 함**. 관리자가 사원관리 화면에서 조정 |
| D12 | 규칙 소급 | 자동 소급 없음. `일괄 재적용` 버튼 + dryRun 미리보기. `MANUAL` 로 직접 지정된 사원은 재적용 대상에서 영구 제외 |
| D13 | 퇴사자 | **하드 삭제 불가, 비활성만.** 사원 삭제 API 없음 |
| D14 | 감사 로그 | 이번 범위 제외. 단 `updatedBy`/`updatedAt` 필드는 남겨 나중에 붙일 수 있게 |
| D15 | SSO | `SsoProvider` 인터페이스 + `MockSsoProvider` 만. 실제 SAML/OIDC 연동 없음 |
| D3-a | MODEL 액션 의미 | APPROVE 를 분리한 이상 **C/U/D 는 "직접 반영" 권한**을 뜻한다. 변경요청 워크플로는 권한 비트가 아니라 권한이 없을 때의 기본 폴백 경로다. 따라서 `COST_STAFF` 의 MODEL 은 **R 만** 갖고 생성·수정·삭제는 전부 요청 경로를 탄다(6.1 표의 `RC` 각주는 폐기). PM 판단, 2026-09-02 |
| D16 | 구현 범위 | **이번엔 프론트엔드만, mock 데이터.** 백엔드는 화면 확정 후 별도 단계. 단 API 계약은 문서에 유지 |

### 다음 단계 확인 필요 (미확정)

- SSO 실제 프로토콜(SAML 2.0 / OIDC)과 사번 클레임명 — 실연동 착수 전 필요
- 기존 `users.role='USER'` 사원을 어느 권한으로 이관할지 — 백엔드 착수 시 결정

---
---

## 1. 배경 / 문제

### 1.1 현재 상태 (코드 확인 결과)

| 항목 | 현재 구현 | 파일 |
|---|---|---|
| 메뉴 | 7개 항목이 **소스에 하드코딩**. `dashboardItem` / `mainFlowItems` / `subMenuItems` 3개 배열 | `src/shared/layouts/Sidebar.tsx` 12~24행 |
| 라우트 | 12개 Route. 메뉴에 없는 라우트 존재(`/parsing`, `/verification`, `/analysis`) | `src/App.tsx` 67~88행 |
| 인증 상태 | `user = { id, name }` 뿐. **권한 정보 없음** | `src/features/auth/AuthContext.tsx` |
| 라우트 가드 | `MainLayout` 의 `isAuthenticated` 체크뿐. **메뉴/기능 단위 가드 없음** | `src/shared/layouts/MainLayout.tsx` 69~71행 |
| 로그인 | `authenticate()` 가 아이디/비밀번호가 비어있지 않으면 무조건 성공 반환 | `src/features/auth/services/authService.ts` |
| 사용자 엔티티 | `role` **문자열 1개**(기본 `"USER"`, 검증 정규식 `USER\|ADMIN`), `department` 자유 텍스트, **직위 필드 없음** | `cost-analysis-was` `domain/user/entity/User.java`, `dto/UserCreateRequest.java` |
| 로그인 응답 | `LoginResponse { accessToken, refreshToken, accessExpiresIn, userId, name, role, department }` | `domain/auth/dto/LoginResponse.java` |

### 1.2 문제

1. **메뉴를 바꾸려면 배포해야 한다.** 조직/업무 변화에 따른 메뉴 노출 조정이 개발 작업이 된다.
2. **권한 개념이 사실상 없다.** 로그인만 하면 모든 화면·모든 버튼에 접근할 수 있다. 원가 수식 변경·모델 승인 같은 민감 기능이 조회 목적 사용자에게도 열려 있다.
3. **URL 직접 접근이 무방비다.** `#/models` 를 주소창에 치면 누구나 들어간다.
4. **사원 관리 화면이 없다.** 백엔드에 `POST /api/v1/users` 는 있으나 이를 호출하는 화면이 없다(`call-graph.md` 기준 user 도메인 `mock-only`).
5. **SSO 도입 시 받아낼 자리가 없다.** 사번을 외부에서 받아 최초 사용자를 만드는 흐름이 정의되어 있지 않다.

---

## 2. 목표 · 비목표

### 2.1 목표

- **G1.** 메뉴를 데이터로 관리한다. 사이드바가 서버(또는 mock) 응답으로 렌더링된다.
- **G2.** 권한 제어 단위를 **메뉴 × 기능(조회/등록/수정/삭제)** 로 정의하고, 화면 진입 차단과 **화면 내부 버튼 노출 제어**를 모두 지원한다.
- **G3.** 권한 부여를 두 경로로 지원한다. (a) 관리자가 사원별 직접 지정 (b) 부서 + 직위 → 기본 권한 자동 부여 규칙.
- **G4.** SSO **연동 지점(인터페이스 + mock)** 과 최초 로그인 시 자동 사원 등록(JIT provisioning) 흐름을 정의한다.
- **G5.** 시스템 관리 메뉴 3종(메뉴관리 / 권한관리 / 사원관리)을 신설한다.
- **G6.** 이번 구현은 **프론트엔드 + mock 데이터**로 화면·UX 를 확정하되, 백엔드가 그대로 구현할 수 있는 **API 계약**을 확정한다.

### 2.2 비목표 (이번에 하지 않는 것)

- **N1.** 실제 SAML / OIDC 프로토콜 연동. IdP 메타데이터, 인증서, 리다이렉트 플로우 구현 안 함.
- **N2.** 백엔드 구현. 이번 산출물은 프론트 + mock. 백엔드는 본 명세의 API 계약을 근거로 다음 단계에서 구현.
- **N3.** 데이터 행(row) 단위 권한(예: "내 부서 견적서만 조회"). 이번 범위는 메뉴 × 기능 단위까지.
- **N4.** 기존 화면들의 동작 변경. **예외**: 사이드바 하드코딩 → 동적 렌더링, 라우트에 가드 래핑, 각 화면의 등록/수정/삭제 버튼에 권한 체크 훅 적용. 그 외 기존 화면의 레이아웃·플로우는 손대지 않는다.
- **N5.** 권한 변경 감사 로그(audit trail) 화면. (데이터 모델에 `createdBy/updatedBy` 는 남기되 조회 화면은 만들지 않음 → 미결 질문 Q11)
- **N6.** 인사시스템(HR) 부서·직위 마스터 실시간 연동. 이번엔 수기 관리 + mock 시드.

---

## 3. 사용자 시나리오

### S1. 시스템관리자가 신규 권한을 만들고 메뉴 접근을 지정한다
구매기획팀 시스템관리자가 "견적 검토만 하는 협력사 담당" 역할이 필요해졌다.
→ `시스템 관리 > 권한관리` 진입 → `권한 추가` → 코드 `REVIEWER`, 명칭 `검토자` 입력 →
권한×메뉴 매트릭스에서 `견적서 분석`은 조회+수정, `모델관리`는 조회만, `시스템 관리`는 전부 OFF →
저장 → 이후 이 권한을 받은 사원은 사이드바에 시스템 관리 메뉴가 아예 보이지 않는다.

### S2. 조회자가 권한 없는 버튼을 보지 못한다
`VIEWER`(조회자) 권한 사원이 `모델관리` 화면에 들어간다.
→ 수식 목록은 보이지만 `수식 추가` / `수정` / `삭제` 버튼은 렌더링되지 않는다.
→ 주소창에 `#/system/roles` 를 직접 입력하면 "접근 권한이 없습니다" 화면이 뜬다.

### S3. 신규 입사자가 SSO 로 최초 로그인한다
원가기획팀 대리로 입사한 사원(사번 `M20260901`)이 SSO 로 최초 로그인한다.
→ 시스템에 해당 사번의 사원 레코드가 없다 → SSO 프로필(사번/이름/부서코드/직위코드)로 **자동 등록** →
기본권한 규칙 중 `부서=원가기획팀 AND 직위=대리` 규칙이 매칭 → `COST_STAFF`(원가담당자) 자동 부여 →
로그인 성공, 대시보드 진입. 관리자 개입 없음.

### S4. 관리자가 특정 사원의 권한을 개별 조정한다
관리자가 `시스템 관리 > 사원관리` 에서 사번으로 검색 → 해당 사원 상세 →
`권한` 항목을 `COST_STAFF` → `COST_MANAGER` 로 변경하고 저장 →
부여 출처가 `규칙(RULE)` 에서 `직접지정(MANUAL)` 로 바뀐다. 이후 규칙이 바뀌어도 이 사원은 영향받지 않는다.

### S5. 관리자가 자기 권한을 실수로 없애려 한다
관리자가 본인 계정의 권한을 `VIEWER` 로 바꾸려고 저장한다.
→ "본인의 시스템 관리 권한은 회수할 수 없습니다" 오류로 차단된다.

---

## 4. 메뉴 트리 정의

### 4.1 전체 메뉴 목록 (현재 라우트 전수 조사 + 신규)

`visibleInMenu = false` 인 항목은 사이드바에 표시하지 않지만 **권한 체크 대상**이다.

| menuCode | 메뉴명 | 상위 | depth | sortOrder | path | iconName | visibleInMenu | 지원 기능 | 비고 |
|---|---|---|---|---|---|---|---|---|---|
| `DASHBOARD` | 대시보드 | - | 1 | 100 | `/dashboard` | `Dashboard` | Y | R | 현재 사이드바 최상단 단독 블록 |
| `GRP_FLOW` | 분석 플로우 | - | 1 | 200 | (없음) | - | Y | - | 그룹 헤더. 현재 `Typography overline` 로 표현됨 |
| `QUOTATION_PARSING` | 견적서 분석 | `GRP_FLOW` | 2 | 210 | `/parsing_card` | `Description` | Y | R,C,U,D | alias `/parsing` (하위호환) |
| `QUOTATION_VERIFY` | 견적서 검증 | `GRP_FLOW` | 2 | 220 | `/verification` | `FactCheck` | **N** | R,U | 파싱 카드에서 진입. 메뉴 미노출 유지(Q14) |
| `QUOTATION_ANALYSIS` | 원가 분석 | `GRP_FLOW` | 2 | 230 | `/analysis` | `Analytics` | **N** | R,U | 파싱/비교 화면에서 진입. 메뉴 미노출 유지(Q14) |
| `QUOTATION_COMPARE` | 견적서 비교 | `GRP_FLOW` | 2 | 240 | `/comparison` | `CompareArrows` | Y | R,C,D | |
| `INSIGHT` | 인사이트 스튜디오 | `GRP_FLOW` | 2 | 250 | `/insight` | `AutoGraph` | Y | R,C,D | 세션 생성/삭제 = C/D |
| `GRP_MANAGE` | 관리 | - | 1 | 300 | (없음) | - | Y | - | 그룹 헤더 |
| `MODEL` | 모델관리 | `GRP_MANAGE` | 2 | 310 | `/models` | `ModelTraining` | Y | R,C,U,D | 수식 CRUD + 변경요청 승인/반려(Q3-a) |
| `HISTORY` | 이력/알림 | `GRP_MANAGE` | 2 | 320 | `/history` | `History` | Y | R,U | 읽음처리 = U |
| `SETTINGS` | 설정 | `GRP_MANAGE` | 2 | 330 | `/settings` | `Settings` | Y | R,U | **개인 설정**. 전원 R,U 기본 부여 권장 |
| `GRP_SYSTEM` | 시스템 관리 | - | 1 | 900 | (없음) | - | Y | - | **신규 그룹** |
| `SYS_MENU` | 메뉴관리 | `GRP_SYSTEM` | 2 | 910 | `/system/menus` | `ViewList` | Y | R,C,U,D | **신규** |
| `SYS_ROLE` | 권한관리 | `GRP_SYSTEM` | 2 | 920 | `/system/roles` | `AdminPanelSettings` | Y | R,C,U,D | **신규**. 기본권한 규칙 탭 포함 |
| `SYS_EMPLOYEE` | 사원관리 | `GRP_SYSTEM` | 2 | 930 | `/system/employees` | `Group` | Y | R,C,U,D | **신규**. 부서/직위 마스터 탭 포함 |

시스템 예약 화면(메뉴 아님, 권한 체크 제외): `/login`, `/403`(접근거부), `/no-access`(가용 메뉴 없음).

### 4.2 메뉴 속성 정의

| 속성 | 타입 | 설명 |
|---|---|---|
| `menuCode` | string(30) | 불변 식별자. 프론트 코드가 이 값으로 권한을 조회한다. **한 번 정하면 바꾸지 않는다** |
| `menuName` | string(50) | 사이드바 표시명 |
| `parentMenuCode` | string(30) \| null | 상위 메뉴. null 이면 1depth |
| `depth` | int | 1 = 대분류, 2 = 소분류. **최대 2단계** (현재 사이드바 구조상) |
| `sortOrder` | int | 같은 부모 내 정렬. 100 단위 간격으로 부여해 중간 삽입 여지를 둔다 |
| `path` | string(100) \| null | 라우트 경로. 그룹 메뉴는 null |
| `aliasPaths` | string(200) \| null | 쉼표 구분 별칭 경로. 예: `QUOTATION_PARSING` 의 `/parsing` |
| `iconName` | string(50) \| null | MUI 아이콘 컴포넌트명 문자열. 프론트에 화이트리스트 맵을 둔다 |
| `visibleInMenu` | boolean | 사이드바 표시 여부 |
| `supportedActions` | string(20) | 이 메뉴가 지원하는 기능 조합. `R`,`C`,`U`,`D` 문자 조합 (예: `RCUD`, `RU`, `R`) |
| `useYn` | boolean | 사용 여부. false 면 메뉴에도 안 보이고 라우트도 차단 |
| `description` | string(200) \| null | 관리자용 설명 |

> **아이콘 처리 방침**: DB 에 컴포넌트를 저장할 수 없으므로 `iconName` 문자열 → 프론트 `MENU_ICON_MAP` 화이트리스트로 매핑한다. 맵에 없는 이름이면 기본 아이콘(`Circle`)으로 폴백하고 콘솔 경고를 남긴다. (최종 아이콘 세트는 designer 가 확정)

> **그룹 메뉴 권한 방침**: `GRP_*` 메뉴는 권한 매트릭스에 행을 만들지 않는다. **자식 중 `canRead=true` 인 메뉴가 1개 이상**이면 그룹 헤더를 렌더링하고, 0개면 그룹 자체를 숨긴다.

---

## 5. 데이터 모델

### 5.1 ERD (논리)

```
DEPARTMENT ─┐                      ┌─ MENU (self-ref: parent_menu_id)
            ├─< EMPLOYEE >─┬──< EMPLOYEE_ROLE >──┬─ ROLE ──< ROLE_PERMISSION >─┘
POSITION  ──┘              │                     │
                           │                     │
                           └─────────────────────┴──< DEFAULT_ROLE_RULE >
                                                       (department_id, position_id → role_id)
```

### 5.2 MENU (메뉴) — 테이블 `sys_menu`

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `menu_id` | BIGINT | PK, AUTO_INCREMENT | |
| `menu_code` | VARCHAR(30) | NOT NULL, **UNIQUE** | 프론트 권한 조회 키 |
| `menu_name` | VARCHAR(50) | NOT NULL | |
| `parent_menu_id` | BIGINT | NULL, FK → `sys_menu.menu_id` | 자기참조. ON DELETE RESTRICT |
| `depth` | INT | NOT NULL, DEFAULT 1, CHECK (1~2) | |
| `sort_order` | INT | NOT NULL, DEFAULT 0 | |
| `path` | VARCHAR(100) | NULL | |
| `alias_paths` | VARCHAR(200) | NULL | 쉼표 구분 |
| `icon_name` | VARCHAR(50) | NULL | |
| `visible_in_menu` | BOOLEAN | NOT NULL, DEFAULT TRUE | |
| `supported_actions` | VARCHAR(20) | NOT NULL, DEFAULT 'R' | `R`/`C`/`U`/`D` 조합 |
| `use_yn` | BOOLEAN | NOT NULL, DEFAULT TRUE | |
| `description` | VARCHAR(200) | NULL | |
| `created_at` / `updated_at` | TIMESTAMPTZ | NOT NULL | `@CreationTimestamp`/`@UpdateTimestamp` (기존 `User` 규약 승계) |
| `created_by` / `updated_by` | VARCHAR(20) | NULL | 사번 |

인덱스: `uk_menu_code (menu_code)`, `idx_menu_parent_sort (parent_menu_id, sort_order)`, `idx_menu_path (path)`

### 5.3 ROLE (권한) — 테이블 `sys_role`

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `role_id` | BIGINT | PK | |
| `role_code` | VARCHAR(30) | NOT NULL, **UNIQUE** | 예: `SYS_ADMIN` |
| `role_name` | VARCHAR(50) | NOT NULL | 예: `시스템관리자` |
| `description` | VARCHAR(200) | NULL | |
| `system_role_yn` | BOOLEAN | NOT NULL, DEFAULT FALSE | TRUE = 시스템 예약. **삭제·코드변경 불가** |
| `sort_order` | INT | NOT NULL, DEFAULT 0 | |
| `use_yn` | BOOLEAN | NOT NULL, DEFAULT TRUE | |
| `created_at`/`updated_at`/`created_by`/`updated_by` | | | 위와 동일 |

### 5.4 ROLE_PERMISSION (권한 × 메뉴 매트릭스) — 테이블 `sys_role_permission`

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `role_permission_id` | BIGINT | PK | |
| `role_id` | BIGINT | NOT NULL, FK → `sys_role`, ON DELETE CASCADE | |
| `menu_id` | BIGINT | NOT NULL, FK → `sys_menu`, ON DELETE CASCADE | |
| `can_read` | BOOLEAN | NOT NULL, DEFAULT FALSE | |
| `can_create` | BOOLEAN | NOT NULL, DEFAULT FALSE | |
| `can_update` | BOOLEAN | NOT NULL, DEFAULT FALSE | |
| `can_delete` | BOOLEAN | NOT NULL, DEFAULT FALSE | |
| `updated_at` / `updated_by` | | | 낙관적 잠금 비교용 |

제약: **UNIQUE (`role_id`, `menu_id`)** — `uk_role_menu` / 인덱스: `idx_rp_role (role_id)`

> 레코드가 없는 (role, menu) 조합은 **전부 false** 로 간주한다(deny by default). 매트릭스 저장 시 모두 false 인 행은 삭제해 테이블을 희소하게 유지한다.

### 5.5 DEPARTMENT (부서) — 테이블 `sys_department`

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `department_id` | BIGINT | PK | |
| `dept_code` | VARCHAR(30) | NOT NULL, **UNIQUE** | SSO/HR 부서코드와 매칭하는 키 |
| `dept_name` | VARCHAR(100) | NOT NULL | |
| `parent_department_id` | BIGINT | NULL, FK → self | 조직 계층 |
| `sort_order` | INT | NOT NULL, DEFAULT 0 | |
| `use_yn` | BOOLEAN | NOT NULL, DEFAULT TRUE | |

시드에 **미지정 부서**(`dept_code='UNASSIGNED'`, `dept_name='미지정'`)를 반드시 포함한다 — SSO 부서코드 미매칭 시 귀속처.

### 5.6 POSITION (직위) — 테이블 `sys_position`

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `position_id` | BIGINT | PK | |
| `position_code` | VARCHAR(30) | NOT NULL, **UNIQUE** | |
| `position_name` | VARCHAR(50) | NOT NULL | 사원/대리/과장/차장/부장/임원 |
| `position_level` | INT | NOT NULL | 숫자가 클수록 상위. 정렬·표시용 |
| `use_yn` | BOOLEAN | NOT NULL, DEFAULT TRUE | |

시드에 **미지정 직위**(`position_code='UNASSIGNED'`) 포함.

### 5.7 EMPLOYEE (사원) — 기존 `users` 테이블 확장

기존 `User` 엔티티를 **확장**한다(새 테이블을 만들지 않는다).

| 컬럼 | 타입 | 제약 | 변경 구분 | 설명 |
|---|---|---|---|---|
| `id` | BIGINT | PK | 유지 | |
| `employee_id` | VARCHAR(20) | NOT NULL, UNIQUE | 유지 | 사번. SSO 매칭 키 |
| `password` | VARCHAR | **NULL 허용으로 변경** | **변경** | SSO 계정은 비밀번호가 없다 |
| `name` | VARCHAR(50) | NOT NULL | 유지 | |
| `department` | VARCHAR(100) | NULL | **DEPRECATED** | 자유 텍스트. 마이그레이션 후 조회 전용, 신규 쓰기 금지 |
| `department_id` | BIGINT | NULL, FK → `sys_department` | **신규** | |
| `position_id` | BIGINT | NULL, FK → `sys_position` | **신규** | |
| `email` | VARCHAR(100) | NULL | **신규** | SSO 프로필에서 수신 |
| `phone` | VARCHAR(20) | NULL | 유지 | |
| `role` | VARCHAR(20) | NOT NULL DEFAULT 'USER' | **DEPRECATED** | 하위호환용. `EMPLOYEE_ROLE` 의 대표 롤 코드를 동기화 기록 |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'ACTIVE' | **신규** | `ACTIVE` / `INACTIVE` / `LOCKED` |
| `active` | BOOLEAN | NOT NULL DEFAULT TRUE | 유지 | `status='ACTIVE'` ↔ `active=true` 로 동기화 |
| `auth_source` | VARCHAR(10) | NOT NULL, DEFAULT 'LOCAL' | **신규** | `LOCAL` / `SSO` |
| `role_assign_source` | VARCHAR(10) | NOT NULL, DEFAULT 'RULE' | **신규** | `MANUAL`(관리자 직접) / `RULE`(기본규칙) / `DEFAULT`(fallback) |
| `first_login_at` | TIMESTAMPTZ | NULL | **신규** | JIT provisioning 시각 |
| `last_login_at` | TIMESTAMPTZ | NULL | **신규** | |
| `language`, `notify_email`, `notify_in_app` | | | 유지 | |
| `created_at` / `updated_at` | | | 유지 | |

인덱스: `idx_user_dept_pos (department_id, position_id)`, `idx_user_status (status)`, `idx_user_name (name)`

**마이그레이션**: 기존 `role='ADMIN'` → `SYS_ADMIN`. `role='USER'` 는 Q10 확정 후 결정. `department` 자유 텍스트는 `dept_name` 완전일치로 매핑 시도하고 실패분은 `UNASSIGNED` 로.

### 5.8 EMPLOYEE_ROLE (사원 ↔ 권한) — 테이블 `sys_employee_role`

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `employee_role_id` | BIGINT | PK | |
| `user_id` | BIGINT | NOT NULL, FK → `users.id`, ON DELETE CASCADE | |
| `role_id` | BIGINT | NOT NULL, FK → `sys_role`, ON DELETE RESTRICT | |
| `assigned_by` | VARCHAR(20) | NULL | 부여자 사번. 규칙 부여 시 `SYSTEM` |
| `assigned_at` | TIMESTAMPTZ | NOT NULL | |

제약: UNIQUE (`user_id`, `role_id`)

> **다중 롤 허용 여부는 미결(Q2)**. 본 설계는 조인 테이블로 **다중 롤 + 권한 합집합(OR)** 을 기본 전제로 한다. 단일 롤로 확정되면 서비스 계층에서 행을 1개로 제약하면 되며 스키마 변경은 불필요하다.

### 5.9 DEFAULT_ROLE_RULE (기본 권한 매핑 규칙) — 테이블 `sys_default_role_rule`

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `rule_id` | BIGINT | PK | |
| `rule_name` | VARCHAR(100) | NOT NULL | 관리자용 식별명 |
| `department_id` | BIGINT | NULL, FK → `sys_department` | NULL = 전체 부서 |
| `position_id` | BIGINT | NULL, FK → `sys_position` | NULL = 전체 직위 |
| `role_id` | BIGINT | NOT NULL, FK → `sys_role` | 부여할 권한 |
| `priority` | INT | NOT NULL, DEFAULT 100 | 값이 **작을수록 우선** (동일 구체성일 때 타이브레이커) |
| `use_yn` | BOOLEAN | NOT NULL, DEFAULT TRUE | |
| `created_at`/`updated_at`/`created_by`/`updated_by` | | | |

제약: UNIQUE (`department_id`, `position_id`, `role_id`) — 동일 조합 중복 등록 방지
인덱스: `idx_rule_dept_pos (department_id, position_id)`

### 5.10 프론트 타입 (참고)

```ts
// src/features/system/types.ts
export type ActionCode = 'R' | 'C' | 'U' | 'D';

export interface MenuNode {
  menuCode: string;
  menuName: string;
  parentMenuCode: string | null;
  depth: 1 | 2;
  sortOrder: number;
  path: string | null;
  aliasPaths: string[];
  iconName: string | null;
  visibleInMenu: boolean;
  supportedActions: ActionCode[];
  useYn: boolean;
  children?: MenuNode[];
}

export interface MenuPermission {
  canRead: boolean; canCreate: boolean; canUpdate: boolean; canDelete: boolean;
}

/** 로그인 사용자의 권한 스냅샷 */
export interface PermissionSnapshot {
  permissionVersion: string;                       // 변경 감지용 해시
  menus: MenuNode[];                               // canRead=true 인 메뉴만 (그룹 포함)
  permissions: Record<string, MenuPermission>;     // key = menuCode
}
```

---

## 6. 초기 권한 세트 (제안 — 최종 확정은 Q1)

현재 업무 프로세스(파싱 → 검증 → 분석 → 비교, 모델 수식 변경요청/승인 워크플로)를 근거로 4종을 제안한다.

| roleCode | roleName | 근거 |
|---|---|---|
| `SYS_ADMIN` | 시스템관리자 | 메뉴/권한/사원 관리 주체가 반드시 필요. 시스템 예약(`system_role_yn=true`) |
| `COST_MANAGER` | 원가관리자 | 백엔드 `ChangeRequestController` 에 `approve`/`reject` 가 존재 → **승인 주체**가 별도로 필요 |
| `COST_STAFF` | 원가담당자 | 견적서 업로드·검증·분석 실무 + 수식 **변경요청 생성**(승인은 불가) |
| `VIEWER` | 조회자 | 결과 열람만. SSO 신규 사원 fallback 후보 |

### 6.1 제안 매트릭스

| 메뉴 | SYS_ADMIN | COST_MANAGER | COST_STAFF | VIEWER |
|---|---|---|---|---|
| `DASHBOARD` | R | R | R | R |
| `QUOTATION_PARSING` | RCUD | RCUD | RCUD | R |
| `QUOTATION_VERIFY` | RU | RU | RU | R |
| `QUOTATION_ANALYSIS` | RU | RU | RU | R |
| `QUOTATION_COMPARE` | RCD | RCD | RCD | R |
| `INSIGHT` | RCD | RCD | RCD | R |
| `MODEL` | RCUD | RCUD | RC | R |
| `HISTORY` | RU | RU | RU | R |
| `SETTINGS` | RU | RU | RU | RU |
| `SYS_MENU` | RCUD | - | - | - |
| `SYS_ROLE` | RCUD | - | - | - |
| `SYS_EMPLOYEE` | RCUD | - | - | - |

> `MODEL` 의 `COST_STAFF = RC`: 수식 조회 + 변경요청 생성은 되지만 직접 수정/삭제(= 승인 반영)는 불가라는 뜻. **승인/반려 버튼을 어느 액션에 매핑할지는 Q3-a 로 확인 필요.**

---

## 7. 기본 권한 규칙 — 매칭 알고리즘

### 7.1 구체성 점수 (specificity)

| 규칙 형태 | 점수 |
|---|---|
| `department_id` 지정 AND `position_id` 지정 | 30 |
| `department_id` 지정, `position_id` NULL | 20 |
| `department_id` NULL, `position_id` 지정 | 10 |
| 둘 다 NULL (전사 기본) | 0 |

### 7.2 해소 순서

1. `use_yn = true` 인 규칙 중 사원의 `(department_id, position_id)` 에 **매칭되는** 규칙을 모두 수집한다.
   - 매칭 정의: 규칙의 `department_id` 가 NULL 이거나 사원 부서와 일치, **그리고** 규칙의 `position_id` 가 NULL 이거나 사원 직위와 일치.
   - **부서 계층 상속은 하지 않는다**(정확 일치만). → 상속 필요 여부는 Q4.
2. 수집된 규칙 중 **최고 구체성 점수** 그룹만 남긴다.
3. 그 안에서 `priority` **오름차순**(작은 값 우선) 1건을 선택한다.
4. 그래도 동률이면 `rule_id` **오름차순** 1건을 선택한다.
5. 매칭 규칙이 0건이면 **시스템 기본 권한**(`DEFAULT_ROLE_CODE`, 제안값 `VIEWER`)을 부여하고 `role_assign_source='DEFAULT'` 로 기록한다.

> 다중 롤이 확정되면(Q2) 2단계에서 "최고 구체성 그룹 전체"를 부여하는 방식도 가능하다. 본 초안은 **단일 롤 선택**을 기본으로 하고, 다중 부여는 관리자 직접 지정으로만 열어둔다.

### 7.3 직접 지정과의 우선순위

- `role_assign_source = 'MANUAL'` 인 사원은 **규칙 재적용 대상에서 제외**한다. 규칙을 추가/수정/삭제해도 이 사원의 권한은 변하지 않는다.
- `RULE` / `DEFAULT` 인 사원에 대해서만 규칙 재적용이 유효하다.
- 관리자가 사원관리에서 `규칙 재적용` 을 실행하면 해당 사원의 `role_assign_source` 를 초기화하고 7.2 를 다시 실행한다.

---

## 8. SSO 연동 지점 (인터페이스 + mock)

### 8.1 인터페이스 (백엔드 구현 대상, 이번엔 계약만)

```java
// com.costanalysis.domain.auth.sso.SsoProvider
public interface SsoProvider {
    /** SSO 토큰/티켓을 검증하고 사원 프로필을 반환한다. 실패 시 SsoAuthException */
    SsoUserProfile resolve(String ssoToken);
    /** 이 Provider 식별자 (mock | saml | oidc) */
    String getProviderType();
}

// SsoUserProfile (모두 SSO 로부터 받는 값)
record SsoUserProfile(
    String employeeId,     // 필수. 사번 (시스템의 유일 매칭 키)
    String name,           // 필수
    String email,          // 선택
    String departmentCode, // 선택. sys_department.dept_code 와 매칭
    String positionCode    // 선택. sys_position.position_code 와 매칭
) {}
```

- 이번 단계 구현체: `MockSsoProvider` — 입력한 사번을 그대로 신뢰하고, 사전 정의된 mock 프로필 표에서 이름/부서/직위를 조회해 반환. (백엔드 `global/mock/` 패턴 승계)
- 실제 SAML/OIDC 구현체는 이 인터페이스만 구현하면 되고, **JIT provisioning 로직은 그대로 재사용된다.**

### 8.2 JIT Provisioning 흐름

```
[SSO 로그인 버튼] → POST /api/v1/auth/sso/login { ssoToken }
   ↓
SsoProvider.resolve(ssoToken) → SsoUserProfile
   ↓
users 에서 employee_id 조회
   ├─ 존재 O ──→ 프로필 동기화(name/email/부서/직위) → last_login_at 갱신 → 토큰 발급
   │              ※ 부서/직위 변경 시 권한 재계산 여부는 Q5
   └─ 존재 X ──→ 신규 사원 생성
                   status = ACTIVE, auth_source = SSO, password = NULL
                   department_id = dept_code 매칭 (실패 시 UNASSIGNED)
                   position_id   = position_code 매칭 (실패 시 UNASSIGNED)
                   first_login_at = now
                 → 기본 권한 규칙(7장) 실행 → EMPLOYEE_ROLE 생성
                 → role_assign_source = RULE 또는 DEFAULT
                 → 토큰 발급, 응답에 provisioned = true
```

- 부여 결과가 "모든 메뉴 접근 불가" 여도 로그인 자체는 성공시키고, 프론트는 `/no-access` 안내 화면을 띄운다(9.6).
- 프론트 mock: `USE_API=false` 일 때 로그인 화면의 `SSO 로그인` 버튼이 사번 입력 다이얼로그를 띄우고, `mockSsoService.login(employeeId)` 가 위 흐름을 localStorage 상에서 재현한다.

---

## 9. 화면 정의

> 레이아웃·색상·컴포넌트 비주얼은 designer 담당. 여기서는 **무엇이 있어야 하는가**까지만 정의한다.

### 9.1 공통

- 3개 화면 모두 해당 `SYS_*` 메뉴의 `canRead` 가 있어야 진입 가능. 없으면 접근 거부 화면.
- 각 화면의 `추가`/`저장`/`삭제` 버튼은 해당 메뉴의 `canCreate`/`canUpdate`/`canDelete` 로 노출 제어(기본 정책: **숨김**, Q3).
- 공통 상태: 로딩 / 빈 값 / 에러(재시도) / 권한없음.

---

### 9.2 메뉴관리 (`/system/menus`, `SYS_MENU`)

**진입 경로**: 사이드바 `시스템 관리 > 메뉴관리`

**표시 항목**
- 좌측: 메뉴 트리(2단계). 각 노드에 `메뉴명`, `menuCode`, `path`, 사용여부 배지, 미노출(`visibleInMenu=false`) 배지
- 우측: 선택 노드 상세 폼 — `menuCode`(신규 등록 시만 편집), `menuName`, `상위 메뉴`(1depth 목록 select), `path`, `aliasPaths`, `iconName`(아이콘 화이트리스트 select + 미리보기), `sortOrder`, `visibleInMenu`(토글), `supportedActions`(R/C/U/D 체크박스, `R` 은 항상 체크·비활성), `useYn`(토글), `description`

**사용자 액션**

| 액션 | 필요 권한 | 동작 |
|---|---|---|
| 메뉴 추가 | `canCreate` | 빈 폼. `menuCode` 중복 검사(blur 시) |
| 메뉴 수정 | `canUpdate` | `menuCode` 는 읽기 전용 |
| 순서 변경 | `canUpdate` | 드래그 앤 드롭 또는 위/아래 버튼. 확정 시 일괄 저장 |
| 사용 중지 | `canUpdate` | `useYn=false`. 즉시 사이드바/라우트에서 제외 |
| 메뉴 삭제 | `canDelete` | 하위 메뉴가 있으면 **차단**. 권한 매핑이 있으면 경고 후 CASCADE 삭제 확인 |

**상태**
- 로딩: 트리 영역 스켈레톤 3행
- 빈 값: 발생하지 않는 것이 정상(시드 메뉴 존재). 0건이면 "메뉴 데이터가 없습니다. 초기 데이터를 확인하세요"
- 에러: "메뉴를 불러오지 못했습니다" + `다시 시도`
- 권한없음: 접근 거부 화면

---

### 9.3 권한관리 (`/system/roles`, `SYS_ROLE`)

**진입 경로**: 사이드바 `시스템 관리 > 권한관리`
**탭 구성**: `권한 목록·매트릭스` / `기본권한 규칙`

#### 탭 A. 권한 목록 · 매트릭스

**표시 항목**
- 좌측 권한 목록: `roleCode`, `roleName`, 배정 사원 수, 시스템 예약 배지, 사용여부
- 우측 매트릭스: 행 = 메뉴(트리 들여쓰기, `GRP_*` 는 헤더 행으로만 표시하고 체크박스 없음), 열 = 조회/등록/수정/삭제
  - 메뉴가 `supportedActions` 에 포함하지 않는 액션 칸은 **비활성 + `-` 표시**
  - 열 헤더 클릭 = 해당 열 전체 토글, 행 우측 `전체` 체크 = 해당 행 전체 토글

**사용자 액션**

| 액션 | 필요 권한 | 동작 |
|---|---|---|
| 권한 추가 | `canCreate` | `roleCode`(대문자+언더스코어, 중복검사), `roleName`, `description` |
| 권한 수정 | `canUpdate` | 시스템 예약 롤은 `roleCode` 변경 불가 |
| 매트릭스 저장 | `canUpdate` | 변경분만 전송. 저장 전 diff 요약 표시("3개 메뉴, 7개 항목 변경") |
| 권한 복사 | `canCreate` | 기존 롤의 매트릭스를 복제해 새 롤 생성 |
| 권한 삭제 | `canDelete` | 시스템 예약 롤 차단. 배정 사원 1명 이상이면 차단(사원 목록 링크 제공) |

**상태**
- 로딩: 매트릭스 스켈레톤
- 빈 값: 권한 0건 → "등록된 권한이 없습니다" + `권한 추가`
- 에러 / 권한없음: 공통

#### 탭 B. 기본권한 규칙

**표시 항목**: 규칙 목록 표 — `규칙명`, `부서`(전체/특정), `직위`(전체/특정), `부여 권한`, `구체성`(30/20/10/0 배지), `priority`, `사용여부`.
**구체성 내림차순 → priority 오름차순**으로 정렬해 실제 평가 순서 그대로 보여준다.

**사용자 액션**

| 액션 | 필요 권한 | 동작 |
|---|---|---|
| 규칙 추가/수정 | `canCreate`/`canUpdate` | 부서(전체 포함) / 직위(전체 포함) / 권한 / priority. 동일 (부서,직위,권한) 조합 중복 차단 |
| 규칙 삭제 | `canDelete` | 확인 다이얼로그 |
| **시뮬레이션** | `canRead` | 부서+직위를 골라 "이 조건의 신규 사원은 `COST_STAFF` 를 받습니다" 를 매칭된 규칙 목록과 함께 표시 |
| 일괄 재적용 | `canUpdate` | `role_assign_source ∈ (RULE, DEFAULT)` 인 사원에 규칙 재실행. 영향 인원수 사전 표시 후 확인 (Q12) |

**상태**: 규칙 0건이면 "등록된 규칙이 없습니다. 모든 신규 사원은 기본 권한(`VIEWER`)을 받습니다" 안내

---

### 9.4 사원관리 (`/system/employees`, `SYS_EMPLOYEE`)

**진입 경로**: 사이드바 `시스템 관리 > 사원관리`
**탭 구성**: `사원 목록` / `부서 관리` / `직위 관리`

#### 탭 A. 사원 목록

**표시 항목(표)**: `사번`, `이름`, `부서`, `직위`, `권한`(칩, 다중이면 나열), `부여출처`(직접지정/규칙/기본), `상태`(활성/비활성/잠김), `인증`(LOCAL/SSO), `최근 로그인`
**필터**: 키워드(사번·이름), 부서, 직위, 권한, 상태. 서버 사이드 페이징(기본 20행)

**사용자 액션**

| 액션 | 필요 권한 | 동작 |
|---|---|---|
| 사원 등록 | `canCreate` | 사번/이름/부서/직위/권한/초기비밀번호. `auth_source=LOCAL` |
| 사원 수정 | `canUpdate` | 이름/부서/직위/연락처/이메일 |
| 권한 변경 | `canUpdate` | 권한 선택 → `role_assign_source='MANUAL'` 로 전환됨을 안내 |
| 권한 일괄 변경 | `canUpdate` | 체크박스 다중 선택 → 권한 일괄 지정(최대 200명) |
| 규칙 재적용 | `canUpdate` | 해당 사원의 MANUAL 지정을 풀고 7.2 재실행 |
| 상태 변경 | `canUpdate` | 활성 ↔ 비활성. 비활성 사원은 로그인 차단 |
| 비밀번호 초기화 | `canUpdate` | `auth_source=LOCAL` 만 가능. SSO 계정은 버튼 비활성 + 툴팁 |
| 사원 삭제 | `canDelete` | 정책 미확정(Q13). 기본은 **비활성 권장**, 삭제 시 확인 2단계 |

**상태**
- 로딩: 표 스켈레톤 5행
- 빈 값: 필터 결과 0건 → "조건에 맞는 사원이 없습니다" + `필터 초기화`
- 에러 / 권한없음: 공통

#### 탭 B. 부서 관리 / 탭 C. 직위 관리

- 부서: 트리(계층) + `dept_code`, `dept_name`, `상위부서`, `sortOrder`, `useYn`. `UNASSIGNED` 는 삭제·코드변경 불가
- 직위: 목록 + `position_code`, `position_name`, `position_level`, `useYn`. `UNASSIGNED` 는 삭제·코드변경 불가
- 삭제 시 해당 부서/직위에 소속된 사원 또는 참조하는 규칙이 있으면 **차단**하고 건수를 안내

---

### 9.5 접근 거부 화면 (`/403`)

- 표시: "접근 권한이 없습니다", 요청 경로, "권한이 필요하면 시스템관리자에게 문의하세요"
- 액션: `대시보드로 이동`(대시보드 권한이 있을 때) / `이전 화면으로`
- 라우트 가드는 리다이렉트가 아니라 **이 화면을 렌더링**한다. 사용자가 왜 막혔는지 알 수 있어야 하고, 리다이렉트 루프를 피한다.

### 9.6 가용 메뉴 없음 화면 (`/no-access`)

- 조건: 로그인은 성공했으나 `canRead=true` 인 메뉴가 **0개**
- 표시: "사용 가능한 메뉴가 없습니다. 권한 부여를 요청하세요", 사번/이름/부서/직위(관리자 문의용)
- 액션: `로그아웃`, `새로고침`(권한 재조회)

---

## 10. 데이터 · API 계약

- 공통 응답 래퍼는 기존 `ApiResponse<T>` 를 그대로 사용: `{ "success": boolean, "message": string|null, "data": T|null }`
- 모든 경로는 `/api/v1/...` (프론트 `apiClient` baseURL 이 `/api/v1` 이므로 서비스 코드에서는 앞부분 생략)
- 인증: `Authorization: Bearer {token}`

### 10.1 내 권한 / 메뉴

| Method | Path | 요청 | 응답 `data` | 비고 |
|---|---|---|---|---|
| GET | `/menus/my` | - | `PermissionSnapshot` | **사이드바 + 라우트 가드의 단일 소스**. 로그인 직후 1회 호출 |

```jsonc
// GET /api/v1/menus/my  →  data
{
  "permissionVersion": "a1b2c3d4",           // 권한 변경 감지용 해시
  "menus": [
    { "menuCode": "DASHBOARD", "menuName": "대시보드", "parentMenuCode": null,
      "depth": 1, "sortOrder": 100, "path": "/dashboard", "aliasPaths": [],
      "iconName": "Dashboard", "visibleInMenu": true,
      "supportedActions": ["R"], "useYn": true, "children": [] },
    { "menuCode": "GRP_FLOW", "menuName": "분석 플로우", "parentMenuCode": null,
      "depth": 1, "sortOrder": 200, "path": null, "aliasPaths": [],
      "iconName": null, "visibleInMenu": true, "supportedActions": [], "useYn": true,
      "children": [
        { "menuCode": "QUOTATION_PARSING", "menuName": "견적서 분석", "parentMenuCode": "GRP_FLOW",
          "depth": 2, "sortOrder": 210, "path": "/parsing_card", "aliasPaths": ["/parsing"],
          "iconName": "Description", "visibleInMenu": true,
          "supportedActions": ["R","C","U","D"], "useYn": true }
      ] }
  ],
  "permissions": {
    "DASHBOARD":         { "canRead": true, "canCreate": false, "canUpdate": false, "canDelete": false },
    "QUOTATION_PARSING": { "canRead": true, "canCreate": true,  "canUpdate": true,  "canDelete": true  }
  }
}
```

규칙: `menus` 에는 `canRead=true` 인 메뉴만 포함한다(그룹 메뉴는 표시 가능한 자식이 1개 이상일 때만). `permissions` 에는 `menus` 에 포함된 메뉴의 권한만 담는다.

### 10.2 메뉴 관리

| Method | Path | 요청 | 응답 `data` | 비고 |
|---|---|---|---|---|
| GET | `/menus` | `?useYn=&keyword=` | `MenuNode[]` (전체 트리) | 관리자용. 권한 무관 전체 |
| GET | `/menus/{menuId}` | - | `MenuNode` | |
| POST | `/menus` | `MenuUpsertRequest` | `MenuNode` | `menuCode` 중복 시 409 |
| PUT | `/menus/{menuId}` | `MenuUpsertRequest` | `MenuNode` | `menuCode` 변경 불가 |
| DELETE | `/menus/{menuId}` | - | `null` | 하위 메뉴 존재 시 409 |
| PUT | `/menus/order` | `{ "items": [{ "menuId": 1, "parentMenuId": null, "sortOrder": 100 }] }` | `MenuNode[]` | 일괄 정렬 |

```jsonc
// MenuUpsertRequest
{
  "menuCode": "SYS_MENU",          // POST 필수 / PUT 시 무시
  "menuName": "메뉴관리",
  "parentMenuId": 12,              // null 이면 1depth
  "sortOrder": 910,
  "path": "/system/menus",
  "aliasPaths": [],
  "iconName": "ViewList",
  "visibleInMenu": true,
  "supportedActions": ["R","C","U","D"],
  "useYn": true,
  "description": "메뉴 정보 관리"
}
```

### 10.3 권한(Role) 관리

| Method | Path | 요청 | 응답 `data` | 비고 |
|---|---|---|---|---|
| GET | `/roles` | `?useYn=&keyword=` | `RoleSummary[]` | `assignedCount` 포함 |
| GET | `/roles/{roleId}` | - | `RoleSummary` | |
| POST | `/roles` | `RoleUpsertRequest` | `RoleSummary` | `roleCode` 중복 409 |
| PUT | `/roles/{roleId}` | `RoleUpsertRequest` | `RoleSummary` | 시스템 예약 롤의 `roleCode` 변경 시 400 |
| DELETE | `/roles/{roleId}` | - | `null` | 시스템 예약 또는 배정 사원 존재 시 409 |
| POST | `/roles/{roleId}/copy` | `{ "roleCode": "...", "roleName": "..." }` | `RoleSummary` | 매트릭스 복제 |
| GET | `/roles/{roleId}/permissions` | - | `RolePermissionMatrix` | |
| PUT | `/roles/{roleId}/permissions` | `RolePermissionUpdateRequest` | `RolePermissionMatrix` | 낙관적 잠금 |

```jsonc
// RoleSummary
{ "roleId": 1, "roleCode": "SYS_ADMIN", "roleName": "시스템관리자",
  "description": "전체 시스템 관리", "systemRoleYn": true, "sortOrder": 10,
  "useYn": true, "assignedCount": 3, "updatedAt": "2026-09-01T10:00:00+09:00" }

// RoleUpsertRequest
{ "roleCode": "REVIEWER", "roleName": "검토자", "description": "...", "sortOrder": 50, "useYn": true }

// GET /roles/{roleId}/permissions → data (RolePermissionMatrix)
{ "roleId": 1, "updatedAt": "2026-09-01T10:00:00+09:00",
  "permissions": [
    { "menuId": 1, "menuCode": "DASHBOARD", "supportedActions": ["R"],
      "canRead": true, "canCreate": false, "canUpdate": false, "canDelete": false }
  ] }

// PUT /roles/{roleId}/permissions (요청, RolePermissionUpdateRequest)
{ "baseUpdatedAt": "2026-09-01T10:00:00+09:00",     // 불일치 시 409 CONFLICT
  "permissions": [
    { "menuId": 9, "canRead": true, "canCreate": true, "canUpdate": false, "canDelete": false }
  ] }
```

### 10.4 사원 관리

| Method | Path | 요청 | 응답 `data` | 비고 |
|---|---|---|---|---|
| GET | `/employees` | `?keyword=&departmentId=&positionId=&roleId=&status=&page=0&size=20&sort=name,asc` | `Page<EmployeeSummary>` | 서버 페이징 |
| GET | `/employees/{userId}` | - | `EmployeeDetail` | |
| POST | `/employees` | `EmployeeCreateRequest` | `EmployeeDetail` | 사번 중복 409 |
| PUT | `/employees/{userId}` | `EmployeeUpdateRequest` | `EmployeeDetail` | 프로필 필드만 |
| PUT | `/employees/{userId}/roles` | `{ "roleIds": [2] }` | `EmployeeDetail` | `roleAssignSource='MANUAL'` 로 전환 |
| PUT | `/employees/roles/bulk` | `{ "userIds": [1,2,3], "roleIds": [2] }` | `{ "updatedCount": 3 }` | 최대 200명 |
| PUT | `/employees/{userId}/status` | `{ "status": "INACTIVE" }` | `EmployeeDetail` | |
| POST | `/employees/{userId}/reapply-rule` | - | `EmployeeDetail` | MANUAL 해제 후 규칙 재적용 |
| POST | `/employees/{userId}/reset-password` | `{ "newPassword": "..." }` | `null` | `authSource=LOCAL` 만. SSO 는 400 |
| DELETE | `/employees/{userId}` | - | `null` | 정책 Q13 |

```jsonc
// EmployeeSummary
{ "userId": 7, "employeeId": "M20260901", "name": "김민준",
  "departmentId": 3, "departmentName": "원가기획팀",
  "positionId": 2,  "positionName": "대리",
  "roles": [{ "roleId": 3, "roleCode": "COST_STAFF", "roleName": "원가담당자" }],
  "roleAssignSource": "RULE", "status": "ACTIVE", "authSource": "SSO",
  "lastLoginAt": "2026-09-01T09:12:00+09:00" }

// EmployeeDetail = EmployeeSummary + { email, phone, firstLoginAt, createdAt, updatedAt }

// EmployeeCreateRequest
{ "employeeId": "M20260902", "name": "이서연", "password": "initPw1234",
  "departmentId": 3, "positionId": 1, "email": "...", "phone": "010-0000-0000",
  "roleIds": [4] }                                   // 생략 시 기본권한 규칙 적용

// EmployeeUpdateRequest
{ "name": "이서연", "departmentId": 3, "positionId": 2, "email": "...", "phone": "..." }
```

### 10.5 부서 / 직위 마스터

| Method | Path | 요청 | 응답 `data` |
|---|---|---|---|
| GET | `/departments` | `?useYn=` | `Department[]` (트리) |
| POST | `/departments` | `DepartmentUpsertRequest` | `Department` |
| PUT | `/departments/{departmentId}` | `DepartmentUpsertRequest` | `Department` |
| DELETE | `/departments/{departmentId}` | - | `null` (참조 존재 시 409) |
| GET | `/positions` | `?useYn=` | `Position[]` |
| POST | `/positions` | `PositionUpsertRequest` | `Position` |
| PUT | `/positions/{positionId}` | `PositionUpsertRequest` | `Position` |
| DELETE | `/positions/{positionId}` | - | `null` (참조 존재 시 409) |

```jsonc
// Department
{ "departmentId": 3, "deptCode": "COST_PLAN", "deptName": "원가기획팀",
  "parentDepartmentId": 1, "sortOrder": 30, "useYn": true, "children": [] }

// Position
{ "positionId": 2, "positionCode": "P02", "positionName": "대리",
  "positionLevel": 20, "useYn": true }
```

### 10.6 기본 권한 규칙

| Method | Path | 요청 | 응답 `data` | 비고 |
|---|---|---|---|---|
| GET | `/role-rules` | `?useYn=` | `RoleRule[]` | 구체성↓ → priority↑ 정렬 |
| POST | `/role-rules` | `RoleRuleUpsertRequest` | `RoleRule` | 중복 조합 409 |
| PUT | `/role-rules/{ruleId}` | `RoleRuleUpsertRequest` | `RoleRule` | |
| DELETE | `/role-rules/{ruleId}` | - | `null` | |
| POST | `/role-rules/simulate` | `{ "departmentId": 3, "positionId": 2 }` | `RoleRuleSimulation` | 저장 없이 결과만 |
| POST | `/role-rules/reapply` | `{ "dryRun": true }` | `{ "affectedCount": 42, "samples": [...] }` | `dryRun=false` 면 실제 반영 |

```jsonc
// RoleRule
{ "ruleId": 5, "ruleName": "원가기획팀 대리", "departmentId": 3, "departmentName": "원가기획팀",
  "positionId": 2, "positionName": "대리", "roleId": 3, "roleCode": "COST_STAFF",
  "specificity": 30, "priority": 100, "useYn": true }

// RoleRuleUpsertRequest
{ "ruleName": "원가기획팀 대리", "departmentId": 3, "positionId": 2, "roleId": 3,
  "priority": 100, "useYn": true }

// RoleRuleSimulation
{ "matchedRules": [ { "ruleId": 5, "specificity": 30, "priority": 100 },
                    { "ruleId": 9, "specificity": 20, "priority": 100 } ],
  "selectedRuleId": 5,
  "resultRole": { "roleId": 3, "roleCode": "COST_STAFF", "roleName": "원가담당자" },
  "assignSource": "RULE" }
```

### 10.7 SSO

| Method | Path | 요청 | 응답 `data` | 비고 |
|---|---|---|---|---|
| POST | `/auth/sso/login` | `{ "ssoToken": "..." }` | `SsoLoginResponse` | JIT provisioning 포함 |
| GET | `/auth/sso/config` | - | `{ "enabled": true, "providerType": "mock", "loginUrl": null }` | 로그인 화면의 SSO 버튼 노출 판단 |

```jsonc
// SsoLoginResponse — 기존 LoginResponse 확장
{ "accessToken": "...", "refreshToken": "...", "accessExpiresIn": 3600,
  "userId": 7, "employeeId": "M20260901", "name": "김민준",
  "departmentName": "원가기획팀", "positionName": "대리",
  "roles": ["COST_STAFF"],
  "provisioned": true,               // 이번 로그인에서 신규 생성되었는가
  "permissionVersion": "a1b2c3d4" }
```

> **기존 `POST /auth/login` 응답 확장 필요**: 현재 `LoginResponse` 의 `role`(단일 문자열)에 더해 `employeeId`, `roles[]`, `permissionVersion` 을 추가한다. 기존 필드는 하위호환을 위해 유지한다.

### 10.8 call-graph 갱신 의무

본 기능 구현 시 `docs/architecture/call-graph.yaml` 에 **`key: system` 도메인 블록을 신규 추가**하고, `npm run callgraph` → `npm run callgraph:verify` 를 통과시켜야 한다. `auth` 도메인에는 `/auth/sso/login`, `/auth/sso/config` 를 추가한다. (`CLAUDE.md` 호출 관계 문서 유지 규칙)

---

## 11. 프론트 적용 방식

### 11.1 디렉토리 (표준 계층 승계)

```
src/features/system/
├── MenuManagementPage.tsx
├── RoleManagementPage.tsx
├── EmployeeManagementPage.tsx
├── types.ts
├── hooks/
│   ├── useMenuManagement.ts
│   ├── useRoleManagement.ts
│   ├── useRoleRules.ts
│   └── useEmployeeManagement.ts
├── services/
│   ├── menuService.ts        // /menus, /menus/my
│   ├── roleService.ts        // /roles, /roles/{id}/permissions, /role-rules
│   └── employeeService.ts    // /employees, /departments, /positions
└── data/
    └── mockData.ts           // USE_API=false 시드 (메뉴/롤/매트릭스/사원/부서/직위/규칙)
```

기존 `model-management` 처럼 **도메인 1개에 여러 Page** 를 두는 형태를 따른다(신규 feature 디렉토리를 3개로 쪼개지 않는다). 서비스는 화면 단위 3개로 분리해 `call-graph.yaml` 의 `services[]` 매핑을 명확히 한다.

### 11.2 권한 상태 관리

- **`src/features/auth/PermissionContext.tsx` 신규.** `AuthContext` 를 대체하지 않고 그 **하위**에 `PermissionProvider` 를 둔다(기존 `useAuth()` 사용처를 깨지 않기 위해).
- `AuthContext` 의 `user` 타입은 `{ id, name }` → `{ id, name, employeeId?, departmentName?, positionName?, roles?: string[] }` 로 **확장**한다. 추가 필드가 모두 optional 이므로 기존 사용처에 영향이 없다.
- 제공 값:

```ts
interface PermissionContextValue {
  loading: boolean;
  error: string | null;
  menus: MenuNode[];                              // 표시 가능 메뉴 트리
  permissions: Record<string, MenuPermission>;
  permissionVersion: string;
  hasAnyMenu: boolean;
  refresh: () => Promise<void>;                   // /menus/my 재조회
  can: (menuCode: string, action: ActionCode) => boolean;
  findMenuByPath: (pathname: string) => MenuNode | null;  // aliasPaths 포함 매칭
}
```

- 데이터 획득: 로그인 성공 직후 + `MainLayout` 마운트 시 `GET /menus/my` 1회. 결과를 컨텍스트 + `sessionStorage`(키 `permission_snapshot`)에 캐시.

### 11.3 `usePermission` 훅

```ts
// 명시적 메뉴 코드
const { canRead, canCreate, canUpdate, canDelete } = usePermission('MODEL');

// 인자 생략 시 현재 라우트로 메뉴 자동 추론 (findMenuByPath)
const { canCreate } = usePermission();
```

기존 화면에 추가되는 유일한 변경 형태:

```tsx
const { canCreate, canDelete } = usePermission('MODEL');
{canCreate && <Button onClick={handleAdd}>수식 추가</Button>}
{canDelete && <IconButton onClick={handleDelete}><Delete /></IconButton>}
```

### 11.4 라우트 가드

`App.tsx` 의 각 Route element 를 래핑한다. **기존 페이지 컴포넌트 내부는 수정하지 않는다.**

```tsx
<Route path="/models" element={
  <ProtectedRoute menuCode="MODEL"><ModelManagementPage /></ProtectedRoute>
} />
```

`ProtectedRoute` 판정 순서:
1. `PermissionContext.loading` → 로딩 화면
2. `error` → 에러 + `다시 시도`
3. `hasAnyMenu === false` → `<Navigate to="/no-access" />`
4. 해당 `menuCode` 메뉴가 `useYn=false` 이거나 `canRead=false` → **`<AccessDeniedPage />` 렌더링**(리다이렉트 아님)
5. 통과 → `children`

**랜딩 경로 결정**: 현재 `/` 와 `*` 는 `/dashboard` 로 고정 리다이렉트. 이를 `<HomeRedirect />` 로 교체해 `canRead('DASHBOARD')` 면 `/dashboard`, 아니면 **표시 가능한 첫 번째 메뉴의 path**, 그것도 없으면 `/no-access` 로 보낸다.

### 11.5 Sidebar 동적 렌더링

`Sidebar.tsx` 의 `dashboardItem` / `mainFlowItems` / `subMenuItems` 하드코딩 배열을 제거하고 `PermissionContext.menus` 로 렌더링한다.

- 렌더링 규칙: depth1 중 `path != null` 인 것은 단독 항목(현재 대시보드와 동일한 블록), `path == null` 인 것은 그룹 헤더(`Typography overline`) + 자식 목록. **현재의 시각적 구조(단독 블록 → Divider → 그룹)를 그대로 유지**한다.
- `visibleInMenu=false` 메뉴는 사이드바에서 제외한다(권한은 여전히 평가됨).
- 아이콘: `MENU_ICON_MAP: Record<string, ReactNode>` 화이트리스트. 현재 사용 중인 7개 + 신규(`ViewList`, `AdminPanelSettings`, `Group`, `FactCheck`, `Analytics`)를 등록.
- collapsed 동작(폭 93px, 아이콘만 표시)은 현행 그대로.

### 11.6 mock 동작 (`USE_API === false`)

- 각 service 는 프로젝트 관례대로 `USE_API ? apiClient 호출 : mock 함수` 로 분기.
- mock 저장소: `localStorage` 키 — `mock_sys_menus`, `mock_sys_roles`, `mock_sys_role_permissions`, `mock_sys_employees`, `mock_sys_departments`, `mock_sys_positions`, `mock_sys_role_rules`
- 키가 없으면 `data/mockData.ts` 시드로 초기화. 개발용 리셋은 `window.__resetSystemMock()` 으로만 노출(설정 화면에는 두지 않음).
- 모든 mock 호출에 200ms 지연을 넣어 로딩 상태를 실제로 확인할 수 있게 한다.
- 로그인 mock: 입력한 사번으로 `mock_sys_employees` 를 조회해 권한 스냅샷을 구성. 사번이 없으면 (a) 일반 로그인은 실패, (b) SSO 로그인은 JIT provisioning 으로 신규 생성.
- **mock 시드 계정(화면 검증용, 최소 5개)**: `admin01`(SYS_ADMIN), `mgr01`(COST_MANAGER), `staff01`(COST_STAFF), `view01`(VIEWER), `none01`(권한 없음 — `/no-access` 검증용).

---

## 12. 규칙 · 엣지케이스

### 12.1 권한 평가

| # | 케이스 | 처리 |
|---|---|---|
| E1 | (role, menu) 레코드 없음 | 전부 `false` (deny by default) |
| E2 | 다중 롤 보유 | 각 액션별 **OR 합집합**. 하나라도 true 면 true |
| E3 | `canCreate/Update/Delete=true` 인데 `canRead=false` | 저장 시 **`canRead` 를 자동 ON** 하고 "조회 권한이 함께 부여되었습니다" 안내. 서버도 동일 보정 |
| E4 | 메뉴가 지원하지 않는 액션에 true 저장 시도 | 서버가 400. 프론트는 해당 칸을 비활성 처리해 애초에 불가 |
| E5 | 그룹 메뉴(`GRP_*`) 권한 | 매트릭스에 행 없음. 자식 중 `canRead` 가 1개 이상이면 헤더 표시 |
| E6 | `useYn=false` 메뉴 | 사이드바 제외 + 라우트 가드에서 접근 거부. 권한 매트릭스에는 회색 처리로 남김 |

### 12.2 접근 / 세션

| # | 케이스 | 처리 |
|---|---|---|
| E7 | 권한 없는 URL 직접 접근 (`#/system/roles`) | `AccessDeniedPage` 렌더링. **리다이렉트하지 않는다** |
| E8 | 라우트가 어떤 메뉴에도 매핑되지 않음 | 개발 실수. 콘솔 경고 + **차단(deny)**. 허용하지 않는다 |
| E9 | 로그인 중 관리자가 권한을 변경 | 서버가 **409 `PERMISSION_CHANGED`** 를 반환할 수 있게 하고, 프론트 인터셉터가 이를 받으면 `/menus/my` 재조회 → 스낵바 "권한이 변경되어 화면을 갱신했습니다" → 현재 화면 권한이 사라졌으면 `AccessDeniedPage`. 추가로 **브라우저 탭 focus 복귀 시** `permissionVersion` 재확인(폴링 대체) |
| E10 | 모든 메뉴가 꺼진 사원 | 로그인은 성공. `/no-access` 안내. 사이드바는 로고 + 로그아웃만 |
| E11 | 비활성/잠김 사원 로그인 시도 | 401 + "비활성화된 계정입니다. 관리자에게 문의하세요" |
| E12 | JWT 만료 | 기존 `apiClient` 401 인터셉터 유지(`#/login` 이동). 변경 없음 |

### 12.3 자기 보호 / 무결성

| # | 케이스 | 처리 |
|---|---|---|
| E13 | 자기 자신의 `SYS_ROLE`/`SYS_MENU`/`SYS_EMPLOYEE` 권한 회수 | **차단**. "본인의 시스템 관리 권한은 회수할 수 없습니다" (프론트 + 서버 양쪽 검증) |
| E14 | 자기 자신을 비활성/삭제 | **차단** |
| E15 | 시스템관리자 보유자가 1명뿐인데 회수/비활성 | **차단**. "시스템관리자는 최소 1명 이상 유지되어야 합니다" |
| E16 | 시스템 예약 롤(`system_role_yn=true`) 삭제/코드변경 | **차단** |
| E17 | 배정 사원이 있는 롤 삭제 | **차단** + 해당 사원 수·목록 링크 제공 |
| E18 | 하위 메뉴가 있는 메뉴 삭제 | **차단** |
| E19 | 사원/규칙이 참조하는 부서·직위 삭제 | **차단** + 참조 건수 안내 |
| E20 | `UNASSIGNED` 부서/직위 삭제·코드변경 | **차단** |
| E21 | 매트릭스 동시 편집 | `baseUpdatedAt` 낙관적 잠금. 불일치 시 **409** + "다른 사용자가 먼저 저장했습니다. 새로고침 후 다시 시도하세요" |

### 12.4 규칙 · 데이터

| # | 케이스 | 처리 |
|---|---|---|
| E22 | 규칙 0건 상태에서 SSO 신규 로그인 | fallback `DEFAULT_ROLE_CODE`(제안: `VIEWER`) 부여, `assignSource='DEFAULT'` |
| E23 | 동일 구체성 · 동일 priority 규칙 2건 | `rule_id` 오름차순 1건 선택. 규칙 등록 화면에서 **경고 표시** |
| E24 | SSO 부서/직위 코드가 마스터에 없음 | `UNASSIGNED` 로 귀속 + 관리자 알림(`Notification` 생성). 로그인은 성공 |
| E25 | 규칙 변경 후 기존 사원 | 기본은 **소급 적용 안 함**. `일괄 재적용` 으로 명시 실행(Q12). MANUAL 사원은 항상 제외 |
| E26 | 사원 10,000명 목록 | 서버 사이드 페이징(기본 20, 최대 100). 전체 내려받기는 이번 범위 밖 |
| E27 | 권한 일괄 변경 다중 선택 | 최대 200명. 초과 시 "200명 이하로 선택하세요" |
| E28 | 중복 사번 등록 | 409 + 필드 인라인 에러 |
| E29 | 부서 계층 순환 참조 (A→B→A) | 400 차단 |

---

## 13. 완료 기준 (Acceptance Criteria)

### AC-1. 사이드바 동적 렌더링
- **Given** `COST_STAFF` 권한 사원(`staff01`)으로 로그인한 상태에서
- **When** 대시보드에 진입하면
- **Then** 사이드바에 `대시보드 / 견적서 분석 / 견적서 비교 / 인사이트 스튜디오 / 모델관리 / 이력·알림 / 설정` 7개가 표시되고 `시스템 관리` 그룹은 **DOM 에 존재하지 않는다**.

### AC-2. 그룹 메뉴 자동 숨김
- **Given** `SYS_MENU`, `SYS_ROLE`, `SYS_EMPLOYEE` 의 `canRead` 가 모두 false 인 사원이
- **When** 로그인하면
- **Then** `시스템 관리` 그룹 헤더 텍스트가 화면에 렌더링되지 않는다.

### AC-3. 라우트 가드 (URL 직접 접근)
- **Given** `VIEWER` 권한 사원이 로그인한 상태에서
- **When** 주소창에 `#/system/roles` 를 입력하면
- **Then** 권한관리 화면 대신 "접근 권한이 없습니다" 화면이 표시되고, 요청 경로 `/system/roles` 가 함께 노출되며, URL 은 `#/system/roles` 를 유지한다(리다이렉트 없음).

### AC-4. 버튼 단위 권한 (등록)
- **Given** `MODEL` 메뉴에 `canRead=true, canCreate=false` 인 사원이
- **When** `#/models` 에 진입하면
- **Then** 수식 목록은 렌더링되고, `수식 추가` 버튼은 DOM 에 존재하지 않는다.

### AC-5. 버튼 단위 권한 (삭제)
- **Given** `MODEL` 메뉴에 `canDelete=false` 인 사원이 수식 목록 화면에 있을 때
- **When** 목록의 각 행을 확인하면
- **Then** 삭제 아이콘 버튼이 어느 행에도 렌더링되지 않는다.

### AC-6. 권한 매트릭스 저장
- **Given** 시스템관리자가 `권한관리 > COST_STAFF` 매트릭스에서
- **When** `MODEL` 행의 `수정` 을 체크하고 저장하면
- **Then** 저장 성공 안내가 표시되고, 새로고침 후에도 해당 체크가 유지되며, `COST_STAFF` 사원으로 재로그인 시 `#/models` 에서 `수정` 버튼이 보인다.

### AC-7. 조회 권한 자동 보정 (E3)
- **Given** 매트릭스에서 `canRead=false` 인 메뉴 행의 `등록` 만 체크하고
- **When** 저장하면
- **Then** 같은 행의 `조회` 가 자동으로 체크된 상태로 저장되고 "조회 권한이 함께 부여되었습니다" 안내가 표시된다.

### AC-8. 기본권한 규칙 매칭 (구체성 우선)
- **Given** 규칙 A(`부서=원가기획팀, 직위=전체 → VIEWER`, priority 10)와 규칙 B(`부서=원가기획팀, 직위=대리 → COST_STAFF`, priority 100)가 등록된 상태에서
- **When** 부서=원가기획팀, 직위=대리 조건으로 시뮬레이션을 실행하면
- **Then** 결과 권한은 **`COST_STAFF`**(규칙 B)이고, 매칭된 규칙 목록에 A(구체성 20)와 B(구체성 30)가 모두 표시되며 선택된 규칙은 B 다. (priority 가 더 낮은 A 가 아니라 구체성이 높은 B 가 이긴다)

### AC-9. 규칙 미매칭 fallback
- **Given** 어떤 규칙에도 매칭되지 않는 부서/직위 조합으로
- **When** 시뮬레이션을 실행하면
- **Then** 결과 권한은 시스템 기본 권한(`VIEWER`)이고 `assignSource` 가 `DEFAULT` 로 표시된다.

### AC-10. SSO 최초 로그인 JIT provisioning
- **Given** `mock_sys_employees` 에 존재하지 않는 사번 `M99999999` 로
- **When** 로그인 화면에서 `SSO 로그인` 을 실행하면
- **Then** 로그인이 성공하고, `사원관리` 목록에 해당 사번이 `인증=SSO`, `부여출처=RULE 또는 DEFAULT`, `상태=활성` 으로 조회된다.

### AC-11. SSO 부서/직위 미매칭
- **Given** SSO 프로필의 부서코드가 부서 마스터에 없는 사번으로
- **When** SSO 최초 로그인하면
- **Then** 사원이 생성되고 부서는 `미지정` 으로 표시되며 로그인은 실패하지 않는다.

### AC-12. 직접 지정 우선
- **Given** 사원 A 의 권한을 사원관리에서 `COST_MANAGER` 로 직접 변경(`부여출처=직접지정`)한 뒤
- **When** `기본권한 규칙 > 일괄 재적용` 을 실행하면
- **Then** 사원 A 의 권한은 `COST_MANAGER` 로 유지되고, 재적용 영향 인원 집계에도 포함되지 않는다.

### AC-13. 자기 권한 회수 방지
- **Given** 시스템관리자 본인이 사원관리에서 자기 계정을 열고
- **When** 권한을 `VIEWER` 로 바꿔 저장하면
- **Then** 저장이 거부되고 "본인의 시스템 관리 권한은 회수할 수 없습니다" 가 표시되며, 변경 전 권한이 그대로 유지된다.

### AC-14. 마지막 관리자 보호
- **Given** `SYS_ADMIN` 보유자가 시스템 전체에 1명뿐인 상태에서
- **When** 다른 계정으로 그 1명의 권한을 회수하거나 비활성화하려 하면
- **Then** 거부되고 "시스템관리자는 최소 1명 이상 유지되어야 합니다" 가 표시된다.

### AC-15. 사용 중인 권한 삭제 차단
- **Given** `COST_STAFF` 에 배정된 사원이 3명인 상태에서
- **When** `권한관리` 에서 `COST_STAFF` 삭제를 시도하면
- **Then** 삭제가 거부되고 "3명의 사원에게 배정되어 있어 삭제할 수 없습니다" 가 표시된다.

### AC-16. 메뉴 삭제 차단
- **Given** 하위 메뉴 3개를 가진 `시스템 관리` 그룹 메뉴에 대해
- **When** 삭제를 시도하면
- **Then** 삭제가 거부되고 "하위 메뉴 3개를 먼저 삭제하세요" 가 표시된다.

### AC-17. 가용 메뉴 0 사원
- **Given** 모든 메뉴 권한이 꺼진 사원(`none01`)으로
- **When** 로그인하면
- **Then** `/no-access` 안내 화면이 표시되고, 사이드바에 메뉴 항목이 0개이며, `로그아웃` 버튼은 정상 동작한다.

### AC-18. 메뉴 정렬 변경 반영
- **Given** 메뉴관리에서 `견적서 비교` 의 `sortOrder` 를 `견적서 분석` 보다 작게 변경하고 저장한 뒤
- **When** 화면을 새로고침하면
- **Then** 사이드바 `분석 플로우` 그룹에서 `견적서 비교` 가 `견적서 분석` 보다 위에 표시된다.

### AC-19. 메뉴 사용 중지
- **Given** 메뉴관리에서 `인사이트 스튜디오` 의 `useYn` 을 false 로 저장한 뒤
- **When** 새로고침하면
- **Then** 사이드바에서 해당 항목이 사라지고, `#/insight` 직접 접근 시 접근 거부 화면이 표시된다.

### AC-20. 로그인 중 권한 변경 감지
- **Given** 사용자가 `#/models` 화면에 머무는 동안 관리자가 해당 사용자의 `MODEL` 권한을 모두 해제한 뒤
- **When** 사용자가 브라우저 탭을 벗어났다 돌아오면
- **Then** 권한 스냅샷이 재조회되어 "권한이 변경되어 화면을 갱신했습니다" 안내가 뜨고, 사이드바에서 `모델관리` 가 사라지며 현재 화면은 접근 거부 화면으로 전환된다.

### AC-21. 사원 목록 검색 · 페이징
- **Given** mock 사원 데이터 1,000건이 있는 상태에서
- **When** 사원관리에서 부서 필터를 지정하면
- **Then** 결과가 20행 단위로 표시되고 총 건수가 함께 노출되며, 필터 적용부터 목록 렌더링 완료까지 **2초 이내**에 끝난다.

### AC-22. 매트릭스 동시 편집 충돌
- **Given** 두 관리자가 같은 롤의 매트릭스를 동시에 열어둔 상태에서
- **When** A 가 저장한 뒤 B 가 저장하면
- **Then** B 의 저장은 실패하고 "다른 사용자가 먼저 저장했습니다. 새로고침 후 다시 시도하세요" 가 표시되며, A 의 변경 내용은 유실되지 않는다.

### AC-23. mock 지속성
- **Given** `USE_API=false` 인 환경에서
- **When** 시스템 관리 3개 화면의 모든 CRUD 를 수행하면
- **Then** 네트워크 요청 없이 동작하고, 새로고침 후에도 변경 내용이 유지된다(localStorage 지속).

### AC-24. 기존 화면 무영향
- **Given** `SYS_ADMIN` 권한(전 메뉴 CRUD)으로 로그인한 상태에서
- **When** 기존 7개 화면(대시보드 / 견적서 분석 / 견적서 비교 / 인사이트 / 모델관리 / 이력·알림 / 설정)을 순회하면
- **Then** 이번 작업 이전과 동일한 항목·버튼이 모두 표시되고 기존 동작에 회귀가 없다.

---

## 14. 미결 질문 (사용자 결정 필요)

| # | 질문 | 기본(제안) 값 | 결정이 미치는 영향 |
|---|---|---|---|
| **Q1** | 초기 권한 세트를 `SYS_ADMIN`(시스템관리자) / `COST_MANAGER`(원가관리자) / `COST_STAFF`(원가담당자) / `VIEWER`(조회자) 4종으로 확정해도 되는가? 명칭·코드는? | 6장 제안대로 | 시드 데이터, 매트릭스, mock 계정 전부 |
| **Q2** | 사원 1명이 **여러 권한**을 동시에 가질 수 있는가(합집합 OR)? 아니면 **단일 권한**만? | 다중 허용, 합집합 | 사원관리 UI(단일 select vs 다중 select), `EMPLOYEE_ROLE` 제약, 기존 `User.role` 동기화 방식 |
| **Q3** | 권한 없는 버튼을 **숨김** 처리할 것인가, **비활성(disabled) + 툴팁**으로 존재는 보여줄 것인가? | 숨김 | 전 화면 UX. 감사 관점에서는 "존재는 보이되 못 누름"을 선호하는 조직도 있음 |
| **Q3-a** | 모델관리의 **변경요청 승인/반려** 버튼은 4개 액션 중 무엇에 매핑하는가? (`canUpdate` 로 볼지, `canDelete` 로 볼지, 별도 액션이 필요한지) | `canUpdate` | 승인 권한을 담당자와 분리할 수 있는지 여부. 별도 액션이 필요하면 액션 코드 확장 필요 |
| **Q4** | 기본권한 규칙에서 **부서 계층 상속**이 필요한가? (예: `구매본부` 규칙이 하위 `원가기획팀` 사원에게도 적용) | 상속 없음(정확 일치만) | 7.2 알고리즘, 규칙 등록 화면, 시뮬레이션 결과 표시 |
| **Q5** | SSO **재로그인 시** 부서/직위 변경이 감지되면 권한을 자동 재계산할 것인가? 재계산한다면 `MANUAL` 지정 사원도 포함하는가? | 재계산함. 단 `MANUAL` 은 제외 | 인사이동 시 권한 자동 반영 여부. 보안 정책과 직결 |
| **Q6** | **직위(Position) 마스터**를 이 시스템에서 직접 관리하는가, 인사시스템에서 받아오는가? 직위 코드 체계는? | 시스템에서 수기 관리(이번 범위) | 직위관리 탭 필요 여부, SSO `positionCode` 값 형식 |
| **Q7** | **부서 마스터**의 소스는? 수기 등록인가 인사 I/F 인가? 부서코드 체계는? | 수기 관리 + `UNASSIGNED` 폴백 | 부서관리 탭, SSO `departmentCode` 매칭 키 |
| **Q8** | 규칙 미매칭 시 **fallback 기본 권한**을 `VIEWER`(조회자)로 확정해도 되는가? 아니면 "권한 없음"으로 두고 관리자 승인을 기다리게 할 것인가? | `VIEWER` | 신규 입사자 온보딩 마찰 vs 보안. "권한 없음"이면 `/no-access` 를 자주 보게 됨 |
| **Q9** | 메뉴관리에서 **신규 메뉴 추가**는 실제로 무엇을 의미하는가? 프론트에 대응 컴포넌트가 없으면 새 화면은 만들 수 없다. (a) 기존 라우트의 메타데이터(이름/순서/노출/권한)만 관리하는 범위로 한정 (b) 임의 외부 URL 링크 메뉴까지 허용 | (a) 메타데이터 관리 한정 + 개발자가 라우트 추가 시 메뉴 등록 | 메뉴관리 화면의 `추가` 버튼 존재 여부, `path` 유효성 검증 방식 |
| **Q10** | 기존 `users.role` 마이그레이션 정책: `ADMIN` → `SYS_ADMIN` 은 자명한데, `USER` 는 `COST_STAFF` 인가 `VIEWER` 인가? | `COST_STAFF`(기존 사용자가 갑자기 못 쓰게 되는 것 방지) | 오픈 직후 기존 사용자 전원의 실제 권한 |
| **Q11** | **권한 변경 이력(감사 로그)** 을 이번 범위에 포함하는가? (누가 언제 누구의 권한을 바꿨는지 조회 화면) | 미포함(N5). 컬럼만 남김 | 별도 테이블·화면·API 추가 여부 |
| **Q12** | 기본권한 규칙을 수정했을 때 **기존 사원에게 소급 적용**할 것인가? 자동인가 수동(버튼)인가? | 수동 버튼(`일괄 재적용`) + dryRun 미리보기 | 규칙 수정 시 대량 권한 변동 리스크 |
| **Q13** | 퇴사자 처리: 사원을 **삭제**할 수 있게 할 것인가, **비활성만** 허용할 것인가? 보관 기간은? | 비활성만(삭제 버튼 미노출) | 사원관리 화면 액션, 데이터 보존 정책 |
| **Q14** | 현재 메뉴에 없는 `/verification`(검증), `/analysis`(분석) 라우트를 **사이드바에 노출**할 것인가, 지금처럼 숨김 유지할 것인가? | 숨김 유지(`visibleInMenu=false`) | 메뉴 트리 4.1, 사이드바 항목 수 |
| **Q15** | SSO 프로토콜은 **SAML 2.0** 인가 **OIDC** 인가? 사번이 담기는 **클레임/속성명**은? 부서·직위도 함께 내려오는가? | 미정(이번엔 mock 만) | 다음 단계 실연동 시 `SsoProvider` 구현체. 지금은 인터페이스만이라 진행에 지장은 없으나 조기 확인 권장 |
| **Q16** | 신규 사원이 SSO 로 자동 등록될 때 **관리자에게 알림**을 보낼 것인가? (기존 `notification` 도메인 활용 가능) | 부서 미매칭 시에만 알림(E24) | `notification` 도메인 연동 범위 |
