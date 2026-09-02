/**
 * @fileoverview 시스템 관리(메뉴/권한/사원/조직) 관련 상수
 * @description RBAC mock 저장소 키, 권한 세트, 액션 라벨 등을 중앙 관리
 */

/** 5액션 코드 (조회/등록/수정/삭제/승인) */
export const ACTION_CODES = ['R', 'C', 'U', 'D', 'A'] as const;

/** 액션 코드 → 한글 라벨 */
export const ACTION_LABELS: Record<string, string> = {
  R: '조회',
  C: '등록',
  U: '수정',
  D: '삭제',
  A: '승인',
};

/** 확정된 기본 권한 세트 (D1) — 신규 권한은 관리자가 화면에서 추가 가능 */
export const ROLE_CODES = {
  SYS_ADMIN: 'SYS_ADMIN',
  COST_MANAGER: 'COST_MANAGER',
  COST_STAFF: 'COST_STAFF',
  VIEWER: 'VIEWER',
} as const;

/** 규칙 미매칭 시 fallback 권한 (D9) */
export const DEFAULT_ROLE_CODE = ROLE_CODES.VIEWER;

/** 시스템 관리 메뉴 코드 (자기보호 로직에서 참조) */
export const SYSTEM_MENU_CODES = ['SYS_MENU', 'SYS_ROLE', 'SYS_EMPLOYEE', 'SYS_ORG'] as const;

/** mock localStorage 키 모음 */
export const SYSTEM_STORAGE_KEYS = {
  MENUS: 'mock_sys_menus',
  ROLES: 'mock_sys_roles',
  ROLE_PERMISSIONS: 'mock_sys_role_permissions',
  EMPLOYEES: 'mock_sys_employees',
  DEPARTMENTS: 'mock_sys_departments',
  POSITIONS: 'mock_sys_positions',
  ROLE_RULES: 'mock_sys_role_rules',
  DEV_ROLE_OVERRIDE: 'mock_sys_dev_role_override',
} as const;

/** mock 응답 지연(ms) — 로딩 상태를 실제로 확인할 수 있도록 */
export const MOCK_DELAY_MS = 200;

/** 사원 목록 기본 페이지 크기 */
export const EMPLOYEE_PAGE_SIZE = 20;

/** 권한 일괄 변경 최대 인원 */
export const MAX_BULK_ROLE_ASSIGN = 200;
