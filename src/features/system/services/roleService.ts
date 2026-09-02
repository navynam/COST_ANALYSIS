/**
 * @fileoverview 권한(Role) 관리 서비스 — 매트릭스 CRUD + 기본권한 규칙
 */
import apiClient from '../../../shared/api/apiClient';
import { USE_API } from '../../../shared/api/config';
import { ROLE_CODES, SYSTEM_MENU_CODES } from '../../../constants/system';
import { store, mockDelay } from './mockStore';
import { resolveDefaultRole } from './permissionEngine';
import type {
  Role, RolePermissionMatrix, RolePermissionEntry, DefaultRoleRule, DefaultRoleRuleView, RoleRuleSimulation,
} from '../types';

// ── 조회 헬퍼 ──
const withAssignedCount = (role: Role): Role & { assignedCount: number } => ({
  ...role,
  assignedCount: store.getEmployees().filter(e => e.roleId === role.roleId).length,
});

const specificity = (departmentId: number | null, positionId: number | null): number => {
  if (departmentId != null && positionId != null) return 30;
  if (departmentId != null && positionId == null) return 20;
  if (departmentId == null && positionId != null) return 10;
  return 0;
};

const toRuleView = (rule: DefaultRoleRule): DefaultRoleRuleView => {
  const dept = store.getDepartments().find(d => d.departmentId === rule.departmentId);
  const pos = store.getPositions().find(p => p.positionId === rule.positionId);
  const role = store.getRoles().find(r => r.roleId === rule.roleId);
  return {
    ...rule,
    departmentName: dept?.deptName || '전체',
    positionName: pos?.positionName || '전체',
    roleCode: role?.roleCode || '',
    roleName: role?.roleName || '',
    specificity: specificity(rule.departmentId, rule.positionId),
  };
};

// ── mock: 권한 목록 ──
const getRolesMock = async (): Promise<(Role & { assignedCount: number })[]> => {
  await mockDelay();
  return store.getRoles().map(withAssignedCount);
};

const createRoleMock = async (input: { roleCode: string; roleName: string; description?: string }): Promise<Role> => {
  await mockDelay();
  const roles = store.getRoles();
  if (roles.some(r => r.roleCode === input.roleCode)) {
    throw new Error(`이미 존재하는 권한 코드입니다: ${input.roleCode}`);
  }
  const role: Role = {
    roleId: Math.max(0, ...roles.map(r => r.roleId)) + 1,
    roleCode: input.roleCode,
    roleName: input.roleName,
    description: input.description || null,
    systemRoleYn: false,
    sortOrder: Math.max(0, ...roles.map(r => r.sortOrder)) + 10,
    useYn: true,
    updatedAt: new Date().toISOString(),
  };
  store.setRoles([...roles, role]);
  return role;
};

const updateRoleMock = async (roleId: number, patch: Partial<Role>): Promise<Role> => {
  await mockDelay();
  const roles = store.getRoles();
  const idx = roles.findIndex(r => r.roleId === roleId);
  if (idx === -1) throw new Error('권한을 찾을 수 없습니다.');
  const current = roles[idx];
  if (current.systemRoleYn && patch.roleCode && patch.roleCode !== current.roleCode) {
    throw new Error('시스템 예약 권한은 코드(roleCode)를 변경할 수 없습니다.');
  }
  const updated = { ...current, ...patch, updatedAt: new Date().toISOString() };
  const next = [...roles];
  next[idx] = updated;
  store.setRoles(next);
  return updated;
};

const deleteRoleMock = async (roleId: number): Promise<void> => {
  await mockDelay();
  const roles = store.getRoles();
  const role = roles.find(r => r.roleId === roleId);
  if (!role) throw new Error('권한을 찾을 수 없습니다.');
  if (role.systemRoleYn) throw new Error('시스템 예약 권한은 삭제할 수 없습니다.');
  const assignedCount = store.getEmployees().filter(e => e.roleId === roleId).length;
  if (assignedCount > 0) throw new Error(`${assignedCount}명의 사원에게 배정되어 있어 삭제할 수 없습니다.`);
  store.setRoles(roles.filter(r => r.roleId !== roleId));
  store.setRolePermissions(store.getRolePermissions().filter(p => p.roleId !== roleId));
};

const copyRoleMock = async (roleId: number, roleCode: string, roleName: string): Promise<Role> => {
  await mockDelay();
  const source = store.getRoles().find(r => r.roleId === roleId);
  if (!source) throw new Error('원본 권한을 찾을 수 없습니다.');
  const created = await createRoleMock({ roleCode, roleName, description: `${source.roleName} 복제` });
  const sourceRows = store.getRolePermissions().filter(p => p.roleId === roleId);
  const clonedRows: RolePermissionEntry[] = sourceRows.map(row => ({ ...row, roleId: created.roleId }));
  store.setRolePermissions([...store.getRolePermissions(), ...clonedRows]);
  return created;
};

// ── mock: 매트릭스 ──
const getRolePermissionMatrixMock = async (roleId: number): Promise<RolePermissionMatrix> => {
  await mockDelay();
  const role = store.getRoles().find(r => r.roleId === roleId);
  if (!role) throw new Error('권한을 찾을 수 없습니다.');
  const menus = store.getMenus().filter(m => m.supportedActions.length > 0 && m.useYn);
  const rows = store.getRolePermissions().filter(p => p.roleId === roleId);
  const rowMap = new Map(rows.map(r => [r.menuId, r]));
  const permissions: RolePermissionEntry[] = menus.map(m => rowMap.get(m.menuId) || {
    roleId, menuId: m.menuId, menuCode: m.menuCode,
    canRead: false, canCreate: false, canUpdate: false, canDelete: false, canApprove: false,
  });
  return { roleId, updatedAt: role.updatedAt || new Date().toISOString(), permissions };
};

interface SaveMatrixResult extends RolePermissionMatrix {
  autoReadGranted: boolean;
}

const saveRolePermissionMatrixMock = async (
  roleId: number,
  baseUpdatedAt: string,
  entries: RolePermissionEntry[],
): Promise<SaveMatrixResult> => {
  await mockDelay();
  const roles = store.getRoles();
  const roleIdx = roles.findIndex(r => r.roleId === roleId);
  if (roleIdx === -1) throw new Error('권한을 찾을 수 없습니다.');
  const role = roles[roleIdx];
  if (role.updatedAt && baseUpdatedAt && role.updatedAt !== baseUpdatedAt) {
    throw new Error('다른 사용자가 먼저 저장했습니다. 새로고침 후 다시 시도하세요.');
  }

  const menus = store.getMenus();

  // 🐛 fix: SYS_ADMIN 롤의 시스템 관리 메뉴(SYS_MENU/SYS_ROLE/SYS_EMPLOYEE/SYS_ORG) 조회 권한은
  //   매트릭스 화면에서 해제할 수 없다. 이 4개를 끄면 employeeService.isSysAdminRole() 판정과
  //   무관하게(그건 이제 roleCode 기준으로 고정됐다) 실질적으로 관리 화면 자체에 아무도 못 들어오는
  //   상황을 만들 수 있어 매트릭스 저장 단계에서부터 차단한다.
  if (role.roleCode === ROLE_CODES.SYS_ADMIN) {
    const blocked = entries.find(e => {
      const menu = menus.find(m => m.menuId === e.menuId);
      return menu && (SYSTEM_MENU_CODES as readonly string[]).includes(menu.menuCode) && !e.canRead;
    });
    if (blocked) {
      const menuName = menus.find(m => m.menuId === blocked.menuId)?.menuName || blocked.menuCode;
      throw new Error(`시스템관리자 권한은 시스템 관리 메뉴(${menuName})의 조회 권한을 해제할 수 없습니다.`);
    }
  }

  let autoReadGranted = false;
  const normalized: RolePermissionEntry[] = entries.map(e => {
    const menu = menus.find(m => m.menuId === e.menuId);
    const supported = new Set(menu?.supportedActions || []);
    let canRead = supported.has('R') ? e.canRead : false;
    const canCreate = supported.has('C') ? e.canCreate : false;
    const canUpdate = supported.has('U') ? e.canUpdate : false;
    const canDelete = supported.has('D') ? e.canDelete : false;
    const canApprove = supported.has('A') ? e.canApprove : false;
    // E3: C/U/D/A 중 하나라도 true 인데 canRead=false 면 자동 보정
    if ((canCreate || canUpdate || canDelete || canApprove) && !canRead) {
      canRead = true;
      autoReadGranted = true;
    }
    return { roleId, menuId: e.menuId, menuCode: menu?.menuCode || e.menuCode, canRead, canCreate, canUpdate, canDelete, canApprove };
  });

  // 희소 테이블 유지: 전부 false 인 행은 제거(12.4장 취지)
  const kept = normalized.filter(e => e.canRead || e.canCreate || e.canUpdate || e.canDelete || e.canApprove);
  const others = store.getRolePermissions().filter(p => p.roleId !== roleId);
  store.setRolePermissions([...others, ...kept]);

  const updatedAt = new Date().toISOString();
  const nextRoles = [...roles];
  nextRoles[roleIdx] = { ...role, updatedAt };
  store.setRoles(nextRoles);

  return { roleId, updatedAt, permissions: normalized, autoReadGranted };
};

// ── mock: 기본권한 규칙 ──
const getRoleRulesMock = async (): Promise<DefaultRoleRuleView[]> => {
  await mockDelay();
  return store.getRoleRules()
    .map(toRuleView)
    .sort((a, b) => b.specificity - a.specificity || a.priority - b.priority || a.ruleId - b.ruleId);
};

const createRoleRuleMock = async (input: Omit<DefaultRoleRule, 'ruleId'>): Promise<DefaultRoleRule> => {
  await mockDelay();
  const rules = store.getRoleRules();
  const dup = rules.some(r => r.departmentId === input.departmentId && r.positionId === input.positionId && r.roleId === input.roleId);
  if (dup) throw new Error('동일한 부서·직위·권한 조합의 규칙이 이미 존재합니다.');
  const rule: DefaultRoleRule = { ruleId: Math.max(0, ...rules.map(r => r.ruleId)) + 1, ...input };
  store.setRoleRules([...rules, rule]);
  return rule;
};

const updateRoleRuleMock = async (ruleId: number, patch: Partial<DefaultRoleRule>): Promise<DefaultRoleRule> => {
  await mockDelay();
  const rules = store.getRoleRules();
  const idx = rules.findIndex(r => r.ruleId === ruleId);
  if (idx === -1) throw new Error('규칙을 찾을 수 없습니다.');
  const updated = { ...rules[idx], ...patch };
  const next = [...rules];
  next[idx] = updated;
  store.setRoleRules(next);
  return updated;
};

const deleteRoleRuleMock = async (ruleId: number): Promise<void> => {
  await mockDelay();
  store.setRoleRules(store.getRoleRules().filter(r => r.ruleId !== ruleId));
};

const simulateRoleRuleMock = async (departmentId: number | null, positionId: number | null): Promise<RoleRuleSimulation> => {
  await mockDelay();
  return resolveDefaultRole(departmentId, positionId);
};

const reapplyRoleRulesMock = async (dryRun: boolean): Promise<{ affectedCount: number; samples: { employeeId: string; name: string; fromRoleCode: string; toRoleCode: string }[] }> => {
  await mockDelay();
  const roles = store.getRoles();
  const employees = store.getEmployees();
  const targets = employees.filter(e => e.roleAssignSource === 'RULE' || e.roleAssignSource === 'DEFAULT');

  const samples: { employeeId: string; name: string; fromRoleCode: string; toRoleCode: string }[] = [];
  const nextEmployees = employees.map(e => e);
  let affectedCount = 0;

  targets.forEach(emp => {
    const result = resolveDefaultRole(emp.departmentId, emp.positionId);
    const fromRole = roles.find(r => r.roleId === emp.roleId);
    if (result.resultRole.roleId !== emp.roleId) {
      affectedCount += 1;
      samples.push({ employeeId: emp.employeeId, name: emp.name, fromRoleCode: fromRole?.roleCode || '', toRoleCode: result.resultRole.roleCode });
      if (!dryRun) {
        const idx = nextEmployees.findIndex(x => x.userId === emp.userId);
        nextEmployees[idx] = { ...emp, roleId: result.resultRole.roleId, roleAssignSource: result.assignSource, updatedAt: new Date().toISOString() };
      }
    }
  });

  if (!dryRun) store.setEmployees(nextEmployees);
  return { affectedCount, samples: samples.slice(0, 20) };
};

// ── 통합 함수 (USE_API 우선, 실패 시 mock) ──

export const getRoles = async (): Promise<(Role & { assignedCount: number })[]> => {
  if (USE_API) {
    try {
      const res = await apiClient.get('/roles');
      return res.data.data || res.data;
    } catch { return getRolesMock(); }
  }
  return getRolesMock();
};

export const createRole = async (input: { roleCode: string; roleName: string; description?: string }): Promise<Role> => {
  if (USE_API) {
    try {
      const res = await apiClient.post('/roles', input);
      return res.data.data || res.data;
    } catch { return createRoleMock(input); }
  }
  return createRoleMock(input);
};

export const updateRole = async (roleId: number, patch: Partial<Role>): Promise<Role> => {
  if (USE_API) {
    try {
      const res = await apiClient.put(`/roles/${roleId}`, patch);
      return res.data.data || res.data;
    } catch { return updateRoleMock(roleId, patch); }
  }
  return updateRoleMock(roleId, patch);
};

export const deleteRole = async (roleId: number): Promise<void> => {
  if (USE_API) {
    try {
      await apiClient.delete(`/roles/${roleId}`);
      return;
    } catch { return deleteRoleMock(roleId); }
  }
  return deleteRoleMock(roleId);
};

export const copyRole = async (roleId: number, roleCode: string, roleName: string): Promise<Role> => {
  if (USE_API) {
    try {
      const res = await apiClient.post(`/roles/${roleId}/copy`, { roleCode, roleName });
      return res.data.data || res.data;
    } catch { return copyRoleMock(roleId, roleCode, roleName); }
  }
  return copyRoleMock(roleId, roleCode, roleName);
};

export const getRolePermissionMatrix = async (roleId: number): Promise<RolePermissionMatrix> => {
  if (USE_API) {
    try {
      const res = await apiClient.get(`/roles/${roleId}/permissions`);
      return res.data.data || res.data;
    } catch { return getRolePermissionMatrixMock(roleId); }
  }
  return getRolePermissionMatrixMock(roleId);
};

export const saveRolePermissionMatrix = async (
  roleId: number, baseUpdatedAt: string, entries: RolePermissionEntry[],
): Promise<SaveMatrixResult> => {
  if (USE_API) {
    try {
      const res = await apiClient.put(`/roles/${roleId}/permissions`, { baseUpdatedAt, permissions: entries });
      return res.data.data || res.data;
    } catch { return saveRolePermissionMatrixMock(roleId, baseUpdatedAt, entries); }
  }
  return saveRolePermissionMatrixMock(roleId, baseUpdatedAt, entries);
};

export const getRoleRules = async (): Promise<DefaultRoleRuleView[]> => {
  if (USE_API) {
    try {
      const res = await apiClient.get('/role-rules');
      return res.data.data || res.data;
    } catch { return getRoleRulesMock(); }
  }
  return getRoleRulesMock();
};

export const createRoleRule = async (input: Omit<DefaultRoleRule, 'ruleId'>): Promise<DefaultRoleRule> => {
  if (USE_API) {
    try {
      const res = await apiClient.post('/role-rules', input);
      return res.data.data || res.data;
    } catch { return createRoleRuleMock(input); }
  }
  return createRoleRuleMock(input);
};

export const updateRoleRule = async (ruleId: number, patch: Partial<DefaultRoleRule>): Promise<DefaultRoleRule> => {
  if (USE_API) {
    try {
      const res = await apiClient.put(`/role-rules/${ruleId}`, patch);
      return res.data.data || res.data;
    } catch { return updateRoleRuleMock(ruleId, patch); }
  }
  return updateRoleRuleMock(ruleId, patch);
};

export const deleteRoleRule = async (ruleId: number): Promise<void> => {
  if (USE_API) {
    try {
      await apiClient.delete(`/role-rules/${ruleId}`);
      return;
    } catch { return deleteRoleRuleMock(ruleId); }
  }
  return deleteRoleRuleMock(ruleId);
};

export const simulateRoleRule = async (departmentId: number | null, positionId: number | null): Promise<RoleRuleSimulation> => {
  if (USE_API) {
    try {
      const res = await apiClient.post('/role-rules/simulate', { departmentId, positionId });
      return res.data.data || res.data;
    } catch { return simulateRoleRuleMock(departmentId, positionId); }
  }
  return simulateRoleRuleMock(departmentId, positionId);
};

export const reapplyRoleRules = async (dryRun: boolean) => {
  if (USE_API) {
    try {
      const res = await apiClient.post('/role-rules/reapply', { dryRun });
      return res.data.data || res.data;
    } catch { return reapplyRoleRulesMock(dryRun); }
  }
  return reapplyRoleRulesMock(dryRun);
};
