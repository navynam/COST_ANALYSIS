/**
 * @fileoverview 시스템 관리 mock 시드 데이터
 * @description USE_API=false(또는 백엔드 미구현) 시 localStorage 초기화에 사용하는 초기값.
 *   docs/specs/system-menu-rbac.md 0장 확정 결정사항 + 4.1 메뉴 트리 + 6.1 매트릭스를 근거로 시딩한다.
 */
import type {
  MenuNode, Role, RolePermissionEntry, Department, Position, Employee, DefaultRoleRule,
} from '../types';

// ── 메뉴 (4.1 전체 메뉴 목록) ──
// depth1 그룹 헤더(GRP_*)는 path=null, supportedActions=[] 이며 권한 매트릭스에 행을 갖지 않는다.
export const initialMenus: MenuNode[] = [
  { menuId: 1, menuCode: 'DASHBOARD', menuName: '대시보드', parentMenuCode: null, depth: 1, sortOrder: 100, path: '/dashboard', aliasPaths: [], iconName: 'Dashboard', visibleInNav: true, supportedActions: ['R'], useYn: true, description: '현재 사이드바 최상단 단독 블록' },
  { menuId: 2, menuCode: 'GRP_FLOW', menuName: '분석 플로우', parentMenuCode: null, depth: 1, sortOrder: 200, path: null, aliasPaths: [], iconName: null, visibleInNav: true, supportedActions: [], useYn: true, description: '그룹 헤더' },
  { menuId: 3, menuCode: 'QUOTATION_PARSING', menuName: '견적서 분석', parentMenuCode: 'GRP_FLOW', depth: 2, sortOrder: 210, path: '/parsing_card', aliasPaths: ['/parsing'], iconName: 'Description', visibleInNav: true, supportedActions: ['R', 'C', 'U', 'D'], useYn: true, description: null },
  { menuId: 4, menuCode: 'QUOTATION_VERIFY', menuName: '견적서 검증', parentMenuCode: 'GRP_FLOW', depth: 2, sortOrder: 220, path: '/verification', aliasPaths: [], iconName: 'FactCheck', visibleInNav: false, supportedActions: ['R', 'U'], useYn: true, description: '파싱 카드에서 진입. 메뉴 미노출 유지' },
  { menuId: 5, menuCode: 'QUOTATION_ANALYSIS', menuName: '원가 분석', parentMenuCode: 'GRP_FLOW', depth: 2, sortOrder: 230, path: '/analysis', aliasPaths: [], iconName: 'Analytics', visibleInNav: false, supportedActions: ['R', 'U'], useYn: true, description: '파싱/비교 화면에서 진입. 메뉴 미노출 유지' },
  { menuId: 6, menuCode: 'QUOTATION_COMPARE', menuName: '견적서 비교', parentMenuCode: 'GRP_FLOW', depth: 2, sortOrder: 240, path: '/comparison', aliasPaths: [], iconName: 'CompareArrows', visibleInNav: true, supportedActions: ['R', 'C', 'D'], useYn: true, description: null },
  { menuId: 7, menuCode: 'INSIGHT', menuName: '인사이트 스튜디오', parentMenuCode: 'GRP_FLOW', depth: 2, sortOrder: 250, path: '/insight', aliasPaths: [], iconName: 'AutoGraph', visibleInNav: true, supportedActions: ['R', 'C', 'D'], useYn: true, description: '세션 생성/삭제 = C/D' },
  { menuId: 8, menuCode: 'GRP_MANAGE', menuName: '관리', parentMenuCode: null, depth: 1, sortOrder: 300, path: null, aliasPaths: [], iconName: null, visibleInNav: true, supportedActions: [], useYn: true, description: '그룹 헤더' },
  { menuId: 9, menuCode: 'MODEL', menuName: '모델관리', parentMenuCode: 'GRP_MANAGE', depth: 2, sortOrder: 310, path: '/models', aliasPaths: [], iconName: 'ModelTraining', visibleInNav: true, supportedActions: ['R', 'C', 'U', 'D', 'A'], useYn: true, description: '수식 CRUD + 변경요청 승인(A)/반려' },
  { menuId: 10, menuCode: 'HISTORY', menuName: '이력/알림', parentMenuCode: 'GRP_MANAGE', depth: 2, sortOrder: 320, path: '/history', aliasPaths: [], iconName: 'History', visibleInNav: true, supportedActions: ['R', 'U'], useYn: true, description: '읽음처리 = U' },
  { menuId: 11, menuCode: 'SETTINGS', menuName: '설정', parentMenuCode: 'GRP_MANAGE', depth: 2, sortOrder: 330, path: '/settings', aliasPaths: [], iconName: 'Settings', visibleInNav: true, supportedActions: ['R', 'U'], useYn: true, description: '개인 설정. 전원 R,U 기본 부여' },
  { menuId: 12, menuCode: 'GRP_SYSTEM', menuName: '시스템 관리', parentMenuCode: null, depth: 1, sortOrder: 900, path: null, aliasPaths: [], iconName: null, visibleInNav: true, supportedActions: [], useYn: true, description: '그룹 헤더' },
  { menuId: 13, menuCode: 'SYS_MENU', menuName: '메뉴관리', parentMenuCode: 'GRP_SYSTEM', depth: 2, sortOrder: 910, path: '/system/menus', aliasPaths: [], iconName: 'ViewList', visibleInNav: true, supportedActions: ['R', 'U'], useYn: true, description: '기존 메뉴 수정만. 신규/삭제 없음(D7)' },
  { menuId: 14, menuCode: 'SYS_ROLE', menuName: '권한관리', parentMenuCode: 'GRP_SYSTEM', depth: 2, sortOrder: 920, path: '/system/roles', aliasPaths: [], iconName: 'AdminPanelSettings', visibleInNav: true, supportedActions: ['R', 'C', 'U', 'D'], useYn: true, description: '기본권한 규칙 탭 포함' },
  { menuId: 15, menuCode: 'SYS_EMPLOYEE', menuName: '사원관리', parentMenuCode: 'GRP_SYSTEM', depth: 2, sortOrder: 930, path: '/system/employees', aliasPaths: [], iconName: 'Group', visibleInNav: true, supportedActions: ['R', 'C', 'U', 'D'], useYn: true, description: null },
  { menuId: 16, menuCode: 'SYS_ORG', menuName: '조직관리', parentMenuCode: 'GRP_SYSTEM', depth: 2, sortOrder: 940, path: '/system/org', aliasPaths: [], iconName: 'AccountTree', visibleInNav: true, supportedActions: ['R', 'C', 'U', 'D'], useYn: true, description: '부서/직위 마스터 관리(D5)' },
];

// ── 권한(Role) — D1 확정 4종 + QA 검증용 권한없음 1종 ──
export const initialRoles: Role[] = [
  { roleId: 1, roleCode: 'SYS_ADMIN', roleName: '시스템관리자', description: '메뉴/권한/사원/조직 전체 관리', systemRoleYn: true, sortOrder: 10, useYn: true, updatedAt: '2026-09-01T09:00:00+09:00' },
  { roleId: 2, roleCode: 'COST_MANAGER', roleName: '원가관리자', description: '수식 변경요청 승인 주체', systemRoleYn: true, sortOrder: 20, useYn: true, updatedAt: '2026-09-01T09:00:00+09:00' },
  { roleId: 3, roleCode: 'COST_STAFF', roleName: '원가담당자', description: '견적 업로드/검증/분석 실무', systemRoleYn: true, sortOrder: 30, useYn: true, updatedAt: '2026-09-01T09:00:00+09:00' },
  { roleId: 4, roleCode: 'VIEWER', roleName: '조회자', description: '결과 열람 전용. 규칙 미매칭 fallback', systemRoleYn: true, sortOrder: 40, useYn: true, updatedAt: '2026-09-01T09:00:00+09:00' },
  { roleId: 5, roleCode: 'NO_ACCESS', roleName: '권한없음', description: 'QA 검증용(가용 메뉴 0개 시나리오)', systemRoleYn: false, sortOrder: 999, useYn: true, updatedAt: '2026-09-01T09:00:00+09:00' },
];

const P = (roleId: number, menuId: number, menuCode: string, r: boolean, c: boolean, u: boolean, d: boolean, a: boolean): RolePermissionEntry => (
  { roleId, menuId, menuCode, canRead: r, canCreate: c, canUpdate: u, canDelete: d, canApprove: a }
);

// ── 권한 × 메뉴 매트릭스 (6.1 제안 매트릭스 + MODEL 승인 액션 반영) ──
// NO_ACCESS(5) 는 의도적으로 행이 없다 = deny by default (E1)
export const initialRolePermissions: RolePermissionEntry[] = [
  // SYS_ADMIN — 전 메뉴 전체 액션
  P(1, 1, 'DASHBOARD', true, false, false, false, false),
  P(1, 3, 'QUOTATION_PARSING', true, true, true, true, false),
  P(1, 4, 'QUOTATION_VERIFY', true, false, true, false, false),
  P(1, 5, 'QUOTATION_ANALYSIS', true, false, true, false, false),
  P(1, 6, 'QUOTATION_COMPARE', true, true, false, true, false),
  P(1, 7, 'INSIGHT', true, true, false, true, false),
  P(1, 9, 'MODEL', true, true, true, true, true),
  P(1, 10, 'HISTORY', true, false, true, false, false),
  P(1, 11, 'SETTINGS', true, false, true, false, false),
  P(1, 13, 'SYS_MENU', true, false, true, false, false),
  P(1, 14, 'SYS_ROLE', true, true, true, true, false),
  P(1, 15, 'SYS_EMPLOYEE', true, true, true, true, false),
  P(1, 16, 'SYS_ORG', true, true, true, true, false),

  // COST_MANAGER — 업무 전 메뉴 + 모델 승인 주체
  P(2, 1, 'DASHBOARD', true, false, false, false, false),
  P(2, 3, 'QUOTATION_PARSING', true, true, true, true, false),
  P(2, 4, 'QUOTATION_VERIFY', true, false, true, false, false),
  P(2, 5, 'QUOTATION_ANALYSIS', true, false, true, false, false),
  P(2, 6, 'QUOTATION_COMPARE', true, true, false, true, false),
  P(2, 7, 'INSIGHT', true, true, false, true, false),
  P(2, 9, 'MODEL', true, true, true, true, true),
  P(2, 10, 'HISTORY', true, false, true, false, false),
  P(2, 11, 'SETTINGS', true, false, true, false, false),

  // COST_STAFF — 업무 전 메뉴, 모델은 조회+변경요청 생성만(승인 불가)
  P(3, 1, 'DASHBOARD', true, false, false, false, false),
  P(3, 3, 'QUOTATION_PARSING', true, true, true, true, false),
  P(3, 4, 'QUOTATION_VERIFY', true, false, true, false, false),
  P(3, 5, 'QUOTATION_ANALYSIS', true, false, true, false, false),
  P(3, 6, 'QUOTATION_COMPARE', true, true, false, true, false),
  P(3, 7, 'INSIGHT', true, true, false, true, false),
  // 🐛 fix: canCreate=true 면 COST_STAFF 가 승인 없이 수식을 즉시 생성할 수 있었다.
  //   APPROVE 를 별도 액션으로 분리(D3)한 이상 C/U/D 는 "직접 반영" 권한을 뜻하므로,
  //   원가담당자는 R 만 갖고 생성/수정/삭제는 모두 변경요청 워크플로로 폴백한다.
  P(3, 9, 'MODEL', true, false, false, false, false),
  P(3, 10, 'HISTORY', true, false, true, false, false),
  P(3, 11, 'SETTINGS', true, false, true, false, false),

  // VIEWER — 전 메뉴 조회만, 설정만 예외적으로 수정 허용
  P(4, 1, 'DASHBOARD', true, false, false, false, false),
  P(4, 3, 'QUOTATION_PARSING', true, false, false, false, false),
  P(4, 4, 'QUOTATION_VERIFY', true, false, false, false, false),
  P(4, 5, 'QUOTATION_ANALYSIS', true, false, false, false, false),
  P(4, 6, 'QUOTATION_COMPARE', true, false, false, false, false),
  P(4, 7, 'INSIGHT', true, false, false, false, false),
  P(4, 9, 'MODEL', true, false, false, false, false),
  P(4, 10, 'HISTORY', true, false, false, false, false),
  P(4, 11, 'SETTINGS', true, false, true, false, false),
];

// ── 부서 마스터 (D5) ──
export const initialDepartments: Department[] = [
  { departmentId: 1, deptCode: 'COST_PLAN', deptName: '원가기획팀', parentDepartmentId: null, sortOrder: 10, useYn: true },
  { departmentId: 2, deptCode: 'PURCHASE_PLAN', deptName: '구매기획팀', parentDepartmentId: null, sortOrder: 20, useYn: true },
  { departmentId: 3, deptCode: 'QUOTE1', deptName: '견적1팀', parentDepartmentId: null, sortOrder: 30, useYn: true },
  { departmentId: 4, deptCode: 'QUOTE2', deptName: '견적2팀', parentDepartmentId: null, sortOrder: 40, useYn: true },
  { departmentId: 5, deptCode: 'IT_SYSTEM', deptName: 'IT시스템팀', parentDepartmentId: null, sortOrder: 50, useYn: true },
  { departmentId: 6, deptCode: 'UNASSIGNED', deptName: '미지정', parentDepartmentId: null, sortOrder: 999, useYn: true },
];

// ── 직위 마스터 (D5) ──
export const initialPositions: Position[] = [
  { positionId: 1, positionCode: 'STAFF', positionName: '사원', positionLevel: 10, useYn: true },
  { positionId: 2, positionCode: 'SENIOR', positionName: '대리', positionLevel: 20, useYn: true },
  { positionId: 3, positionCode: 'MANAGER', positionName: '과장', positionLevel: 30, useYn: true },
  { positionId: 4, positionCode: 'DEPUTY', positionName: '차장', positionLevel: 40, useYn: true },
  { positionId: 5, positionCode: 'GM', positionName: '부장', positionLevel: 50, useYn: true },
  { positionId: 6, positionCode: 'UNASSIGNED', positionName: '미지정', positionLevel: 0, useYn: true },
];

const now = '2026-09-01T09:00:00+09:00';

// ── 사원 (10명 내외, 권한이 골고루 섞이도록) ──
export const initialEmployees: Employee[] = [
  { userId: 1, employeeId: 'admin01', name: '관리자1', departmentId: 5, positionId: 5, roleId: 1, roleAssignSource: 'MANUAL', email: 'admin01@mobis.com', phone: '010-1000-0001', status: 'ACTIVE', authSource: 'LOCAL', createdAt: now, updatedAt: now },
  { userId: 2, employeeId: 'admin02', name: '관리자2', departmentId: 5, positionId: 4, roleId: 1, roleAssignSource: 'MANUAL', email: 'admin02@mobis.com', phone: '010-1000-0002', status: 'ACTIVE', authSource: 'LOCAL', createdAt: now, updatedAt: now },
  { userId: 3, employeeId: 'mgr01', name: '김원가', departmentId: 1, positionId: 5, roleId: 2, roleAssignSource: 'RULE', email: 'mgr01@mobis.com', phone: '010-1000-0003', status: 'ACTIVE', authSource: 'LOCAL', createdAt: now, updatedAt: now },
  { userId: 4, employeeId: 'mgr02', name: '이승인', departmentId: 2, positionId: 4, roleId: 2, roleAssignSource: 'RULE', email: 'mgr02@mobis.com', phone: '010-1000-0004', status: 'ACTIVE', authSource: 'LOCAL', createdAt: now, updatedAt: now },
  { userId: 5, employeeId: 'staff01', name: '박담당', departmentId: 1, positionId: 2, roleId: 3, roleAssignSource: 'RULE', email: 'staff01@mobis.com', phone: '010-1000-0005', status: 'ACTIVE', authSource: 'LOCAL', createdAt: now, updatedAt: now },
  { userId: 6, employeeId: 'staff02', name: '최견적', departmentId: 3, positionId: 1, roleId: 3, roleAssignSource: 'RULE', email: 'staff02@mobis.com', phone: '010-1000-0006', status: 'ACTIVE', authSource: 'LOCAL', createdAt: now, updatedAt: now },
  { userId: 7, employeeId: 'staff03', name: '정검증', departmentId: 4, positionId: 2, roleId: 3, roleAssignSource: 'RULE', email: 'staff03@mobis.com', phone: '010-1000-0007', status: 'ACTIVE', authSource: 'SSO', firstLoginAt: now, lastLoginAt: now, createdAt: now, updatedAt: now },
  { userId: 8, employeeId: 'view01', name: '한조회', departmentId: 3, positionId: 1, roleId: 4, roleAssignSource: 'DEFAULT', email: 'view01@mobis.com', phone: '010-1000-0008', status: 'ACTIVE', authSource: 'LOCAL', createdAt: now, updatedAt: now },
  { userId: 9, employeeId: 'view02', name: '오열람', departmentId: 2, positionId: 1, roleId: 4, roleAssignSource: 'DEFAULT', email: 'view02@mobis.com', phone: '010-1000-0009', status: 'INACTIVE', authSource: 'LOCAL', createdAt: now, updatedAt: now },
  { userId: 10, employeeId: 'none01', name: '권한없음', departmentId: 6, positionId: 6, roleId: 5, roleAssignSource: 'MANUAL', email: 'none01@mobis.com', phone: '010-1000-0010', status: 'ACTIVE', authSource: 'LOCAL', createdAt: now, updatedAt: now },
];

// ── 기본 권한 규칙 (7장 구체성 알고리즘 검증용) ──
export const initialRoleRules: DefaultRoleRule[] = [
  { ruleId: 1, ruleName: '원가기획팀 전체', departmentId: 1, positionId: null, roleId: 4, priority: 10, useYn: true },
  { ruleId: 2, ruleName: '원가기획팀 대리', departmentId: 1, positionId: 2, roleId: 3, priority: 100, useYn: true },
  { ruleId: 3, ruleName: '과장 전체', departmentId: null, positionId: 3, roleId: 2, priority: 50, useYn: true },
  { ruleId: 4, ruleName: 'IT시스템팀 전체', departmentId: 5, positionId: null, roleId: 1, priority: 10, useYn: true },
];
