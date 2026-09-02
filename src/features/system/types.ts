/**
 * @fileoverview 시스템 관리(메뉴/권한/사원/조직) 도메인 타입
 * @description docs/specs/system-menu-rbac.md 0장 확정 결정사항 기준
 *   - 사원 1명 = 권한 1개 (단일, D2)
 *   - 5액션: 조회(R)/등록(C)/수정(U)/삭제(D)/승인(A) (D3)
 */

/** 5액션 코드 */
export type ActionCode = 'R' | 'C' | 'U' | 'D' | 'A';

/** 메뉴 트리 노드 */
export interface MenuNode {
  menuId: number;
  menuCode: string;
  menuName: string;
  parentMenuCode: string | null;
  depth: 1 | 2;
  sortOrder: number;
  path: string | null;
  aliasPaths: string[];
  iconName: string | null;
  /** 사이드바 노출 여부. false 면 권한 대상이지만 사이드바에는 표시하지 않는다 (예: /verification, /analysis) */
  visibleInNav: boolean;
  supportedActions: ActionCode[];
  useYn: boolean;
  description?: string | null;
  updatedAt?: string;
  updatedBy?: string;
  children?: MenuNode[];
}

/** 메뉴 1개에 대한 5액션 권한 */
export interface MenuPermission {
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canApprove: boolean;
}

/** 로그인 사원의 권한 스냅샷 (GET /menus/my 응답과 동일 형태) */
export interface PermissionSnapshot {
  permissionVersion: string;
  roleId: number;
  roleCode: string;
  roleName: string;
  /** canRead=true 인 메뉴만 포함된 트리 (그룹은 표시 가능한 자식이 있을 때만) */
  menus: MenuNode[];
  /** key = menuCode. menus 에 포함된 메뉴의 권한만 담는다 */
  permissions: Record<string, MenuPermission>;
}

/** 권한(Role) */
export interface Role {
  roleId: number;
  roleCode: string;
  roleName: string;
  description: string | null;
  /** 시스템 예약 롤 — 삭제/코드변경 불가 */
  systemRoleYn: boolean;
  sortOrder: number;
  useYn: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

/** 권한 × 메뉴 매트릭스 1행 */
export interface RolePermissionEntry {
  roleId: number;
  menuId: number;
  menuCode: string;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canApprove: boolean;
}

/** 권한 매트릭스 (낙관적 잠금용 baseUpdatedAt 포함) */
export interface RolePermissionMatrix {
  roleId: number;
  updatedAt: string;
  permissions: RolePermissionEntry[];
}

/** 부서 마스터 */
export interface Department {
  departmentId: number;
  deptCode: string;
  deptName: string;
  parentDepartmentId: number | null;
  sortOrder: number;
  useYn: boolean;
}

/** 직위 마스터 */
export interface Position {
  positionId: number;
  positionCode: string;
  positionName: string;
  positionLevel: number;
  useYn: boolean;
}

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'LOCKED';
export type AuthSource = 'LOCAL' | 'SSO';
export type RoleAssignSource = 'MANUAL' | 'RULE' | 'DEFAULT';

/** 사원 (기존 users 테이블 확장 개념) */
export interface Employee {
  userId: number;
  employeeId: string;
  name: string;
  departmentId: number | null;
  positionId: number | null;
  /** 단일 권한 (D2) */
  roleId: number;
  roleAssignSource: RoleAssignSource;
  email?: string | null;
  phone?: string | null;
  status: EmployeeStatus;
  authSource: AuthSource;
  firstLoginAt?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
}

/** 목록 화면용 조인된 사원 뷰 */
export interface EmployeeView extends Employee {
  departmentName: string;
  positionName: string;
  roleCode: string;
  roleName: string;
}

/** 기본 권한 매핑 규칙 */
export interface DefaultRoleRule {
  ruleId: number;
  ruleName: string;
  departmentId: number | null;
  positionId: number | null;
  roleId: number;
  priority: number;
  useYn: boolean;
}

/** 규칙 목록 화면용 조인 뷰 */
export interface DefaultRoleRuleView extends DefaultRoleRule {
  departmentName: string;
  positionName: string;
  roleCode: string;
  roleName: string;
  /** 구체성 점수 (30/20/10/0) */
  specificity: number;
}

/** 규칙 시뮬레이션 결과 */
export interface RoleRuleSimulation {
  matchedRules: { ruleId: number; ruleName: string; specificity: number; priority: number }[];
  selectedRuleId: number | null;
  resultRole: { roleId: number; roleCode: string; roleName: string };
  assignSource: RoleAssignSource;
}

/** 페이지 응답 (사원 목록 서버 사이드 페이징) */
export interface Page<T> {
  content: T[];
  totalElements: number;
  page: number;
  size: number;
}

/** 사원 목록 필터 */
export interface EmployeeFilter {
  keyword?: string;
  departmentId?: number;
  positionId?: number;
  roleId?: number;
  status?: EmployeeStatus;
  page?: number;
  size?: number;
}
