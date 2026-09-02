/**
 * @fileoverview 사원 / 부서 / 직위 관리 서비스 + SSO mock 로그인(JIT provisioning)
 */
import apiClient from '../../../shared/api/apiClient';
import { USE_API } from '../../../shared/api/config';
import { ROLE_CODES } from '../../../constants/system';
import { ssoLoginApi } from '../../auth/services/authService';
import { store, mockDelay } from './mockStore';
import { resolveDefaultRole } from './permissionEngine';
import type {
  Employee, EmployeeView, EmployeeFilter, Page, Department, Position,
} from '../types';

// ── 조인 뷰 변환 ──
const toView = (e: Employee): EmployeeView => {
  const dept = store.getDepartments().find(d => d.departmentId === e.departmentId);
  const pos = store.getPositions().find(p => p.positionId === e.positionId);
  const role = store.getRoles().find(r => r.roleId === e.roleId);
  return {
    ...e,
    departmentName: dept?.deptName || '미지정',
    positionName: pos?.positionName || '미지정',
    roleCode: role?.roleCode || '',
    roleName: role?.roleName || '',
  };
};

/**
 * "시스템관리자"인지는 반드시 roleCode === 'SYS_ADMIN' 로만 판정한다.
 * 🐛 fix: 이전에는 시스템 메뉴 4개의 canRead 매트릭스 상태로 파생 판정했는데, 이 경우 권한관리 화면에서
 *   SYS_ADMIN 롤의 매트릭스 체크박스 하나만 꺼도 자기보호/마지막 관리자 보호(E13~E15)가 함께 풀리는
 *   결함이 있었다. 역할 코드는 매트릭스 편집과 무관하게 불변이므로 이 기준으로 고정한다.
 */
const isSysAdminRole = (roleId: number): boolean => {
  const role = store.getRoles().find(r => r.roleId === roleId);
  return role?.roleCode === ROLE_CODES.SYS_ADMIN;
};

const countActiveSysAdmins = (excludeUserId?: number): number => {
  const roles = store.getRoles();
  return store.getEmployees().filter(e => {
    if (e.userId === excludeUserId) return false;
    if (e.status !== 'ACTIVE') return false;
    const role = roles.find(r => r.roleId === e.roleId);
    return role ? isSysAdminRole(role.roleId) : false;
  }).length;
};

// ── mock: 사원 목록 / 상세 ──
const getEmployeesMock = async (filter: EmployeeFilter): Promise<Page<EmployeeView>> => {
  await mockDelay();
  let list = store.getEmployees().map(toView);
  const kw = filter.keyword?.trim().toLowerCase();
  if (kw) list = list.filter(e => e.employeeId.toLowerCase().includes(kw) || e.name.toLowerCase().includes(kw));
  if (filter.departmentId != null) list = list.filter(e => e.departmentId === filter.departmentId);
  if (filter.positionId != null) list = list.filter(e => e.positionId === filter.positionId);
  if (filter.roleId != null) list = list.filter(e => e.roleId === filter.roleId);
  if (filter.status) list = list.filter(e => e.status === filter.status);

  const page = filter.page ?? 0;
  const size = filter.size ?? 20;
  const totalElements = list.length;
  const content = list.slice(page * size, page * size + size);
  return { content, totalElements, page, size };
};

const getEmployeeMock = async (userId: number): Promise<EmployeeView> => {
  await mockDelay();
  const emp = store.getEmployees().find(e => e.userId === userId);
  if (!emp) throw new Error('사원을 찾을 수 없습니다.');
  return toView(emp);
};

const createEmployeeMock = async (input: {
  employeeId: string; name: string; departmentId: number | null; positionId: number | null;
  roleId?: number; email?: string; phone?: string;
}): Promise<EmployeeView> => {
  await mockDelay();
  const employees = store.getEmployees();
  if (employees.some(e => e.employeeId === input.employeeId)) {
    throw new Error(`이미 존재하는 사번입니다: ${input.employeeId}`);
  }
  let roleId = input.roleId;
  let roleAssignSource: Employee['roleAssignSource'] = 'MANUAL';
  if (!roleId) {
    const resolved = resolveDefaultRole(input.departmentId, input.positionId);
    roleId = resolved.resultRole.roleId;
    roleAssignSource = resolved.assignSource;
  }
  const now = new Date().toISOString();
  const employee: Employee = {
    userId: Math.max(0, ...employees.map(e => e.userId)) + 1,
    employeeId: input.employeeId,
    name: input.name,
    departmentId: input.departmentId,
    positionId: input.positionId,
    roleId,
    roleAssignSource,
    email: input.email || null,
    phone: input.phone || null,
    status: 'ACTIVE',
    authSource: 'LOCAL',
    createdAt: now,
    updatedAt: now,
  };
  store.setEmployees([...employees, employee]);
  return toView(employee);
};

const updateEmployeeMock = async (userId: number, patch: Partial<Employee>): Promise<EmployeeView> => {
  await mockDelay();
  const employees = store.getEmployees();
  const idx = employees.findIndex(e => e.userId === userId);
  if (idx === -1) throw new Error('사원을 찾을 수 없습니다.');
  const updated = { ...employees[idx], ...patch, updatedAt: new Date().toISOString() };
  const next = [...employees];
  next[idx] = updated;
  store.setEmployees(next);
  return toView(updated);
};

/** 권한 변경 (E13 자기보호 / E15 마지막 관리자 보호 포함) */
const changeEmployeeRoleMock = async (userId: number, roleId: number, actingEmployeeId: string): Promise<EmployeeView> => {
  await mockDelay();
  const employees = store.getEmployees();
  const idx = employees.findIndex(e => e.userId === userId);
  if (idx === -1) throw new Error('사원을 찾을 수 없습니다.');
  const target = employees[idx];
  const isSelf = target.employeeId === actingEmployeeId;
  const wasSysAdmin = isSysAdminRole(target.roleId);
  const willBeSysAdmin = isSysAdminRole(roleId);

  if (isSelf && wasSysAdmin && !willBeSysAdmin) {
    throw new Error('본인의 시스템 관리 권한은 회수할 수 없습니다.');
  }
  if (wasSysAdmin && !willBeSysAdmin && countActiveSysAdmins(target.userId) === 0) {
    throw new Error('시스템관리자는 최소 1명 이상 유지되어야 합니다.');
  }

  const updated: Employee = { ...target, roleId, roleAssignSource: 'MANUAL', updatedAt: new Date().toISOString() };
  const next = [...employees];
  next[idx] = updated;
  store.setEmployees(next);
  return toView(updated);
};

const bulkChangeRoleMock = async (userIds: number[], roleId: number, actingEmployeeId: string): Promise<{ updatedCount: number }> => {
  await mockDelay();
  let updatedCount = 0;
  for (const id of userIds) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await changeEmployeeRoleMock(id, roleId, actingEmployeeId);
      updatedCount += 1;
    } catch {
      // 자기보호/마지막 관리자 케이스는 건너뛴다 (일괄 처리이므로 전체 실패시키지 않음)
    }
  }
  return { updatedCount };
};

/** 상태 변경 (E14 자기 비활성 차단 / E15 마지막 관리자 보호) */
const setEmployeeStatusMock = async (userId: number, status: Employee['status'], actingEmployeeId: string): Promise<EmployeeView> => {
  await mockDelay();
  const employees = store.getEmployees();
  const idx = employees.findIndex(e => e.userId === userId);
  if (idx === -1) throw new Error('사원을 찾을 수 없습니다.');
  const target = employees[idx];
  const isSelf = target.employeeId === actingEmployeeId;

  if (isSelf && status !== 'ACTIVE') {
    throw new Error('본인 계정은 비활성화할 수 없습니다.');
  }
  if (status !== 'ACTIVE' && isSysAdminRole(target.roleId) && countActiveSysAdmins(target.userId) === 0) {
    throw new Error('시스템관리자는 최소 1명 이상 유지되어야 합니다.');
  }

  const updated = { ...target, status, updatedAt: new Date().toISOString() };
  const next = [...employees];
  next[idx] = updated;
  store.setEmployees(next);
  return toView(updated);
};

const reapplyRuleForEmployeeMock = async (userId: number): Promise<EmployeeView> => {
  await mockDelay();
  const employees = store.getEmployees();
  const idx = employees.findIndex(e => e.userId === userId);
  if (idx === -1) throw new Error('사원을 찾을 수 없습니다.');
  const target = employees[idx];
  const resolved = resolveDefaultRole(target.departmentId, target.positionId);
  const updated = { ...target, roleId: resolved.resultRole.roleId, roleAssignSource: resolved.assignSource, updatedAt: new Date().toISOString() };
  const next = [...employees];
  next[idx] = updated;
  store.setEmployees(next);
  return toView(updated);
};

// ── mock: 부서/직위 ──
const assertNotUnassigned = (code: string) => {
  if (code === 'UNASSIGNED') throw new Error('미지정 부서/직위는 삭제하거나 코드를 변경할 수 없습니다.');
};

const getDepartmentsMock = async (): Promise<Department[]> => { await mockDelay(); return store.getDepartments(); };
const createDepartmentMock = async (input: Omit<Department, 'departmentId'>): Promise<Department> => {
  await mockDelay();
  const list = store.getDepartments();
  if (list.some(d => d.deptCode === input.deptCode)) throw new Error(`이미 존재하는 부서 코드입니다: ${input.deptCode}`);
  const dept: Department = { departmentId: Math.max(0, ...list.map(d => d.departmentId)) + 1, ...input };
  store.setDepartments([...list, dept]);
  return dept;
};
const updateDepartmentMock = async (departmentId: number, patch: Partial<Department>): Promise<Department> => {
  await mockDelay();
  const list = store.getDepartments();
  const idx = list.findIndex(d => d.departmentId === departmentId);
  if (idx === -1) throw new Error('부서를 찾을 수 없습니다.');
  if (patch.deptCode && patch.deptCode !== list[idx].deptCode) assertNotUnassigned(list[idx].deptCode);
  const updated = { ...list[idx], ...patch };
  const next = [...list];
  next[idx] = updated;
  store.setDepartments(next);
  return updated;
};
const deleteDepartmentMock = async (departmentId: number): Promise<void> => {
  await mockDelay();
  const list = store.getDepartments();
  const dept = list.find(d => d.departmentId === departmentId);
  if (!dept) throw new Error('부서를 찾을 수 없습니다.');
  assertNotUnassigned(dept.deptCode);
  const refCount = store.getEmployees().filter(e => e.departmentId === departmentId).length
    + store.getRoleRules().filter(r => r.departmentId === departmentId).length;
  if (refCount > 0) throw new Error(`${refCount}건의 사원/규칙이 참조하고 있어 삭제할 수 없습니다.`);
  store.setDepartments(list.filter(d => d.departmentId !== departmentId));
};

const getPositionsMock = async (): Promise<Position[]> => { await mockDelay(); return store.getPositions(); };
const createPositionMock = async (input: Omit<Position, 'positionId'>): Promise<Position> => {
  await mockDelay();
  const list = store.getPositions();
  if (list.some(p => p.positionCode === input.positionCode)) throw new Error(`이미 존재하는 직위 코드입니다: ${input.positionCode}`);
  const pos: Position = { positionId: Math.max(0, ...list.map(p => p.positionId)) + 1, ...input };
  store.setPositions([...list, pos]);
  return pos;
};
const updatePositionMock = async (positionId: number, patch: Partial<Position>): Promise<Position> => {
  await mockDelay();
  const list = store.getPositions();
  const idx = list.findIndex(p => p.positionId === positionId);
  if (idx === -1) throw new Error('직위를 찾을 수 없습니다.');
  if (patch.positionCode && patch.positionCode !== list[idx].positionCode) assertNotUnassigned(list[idx].positionCode);
  const updated = { ...list[idx], ...patch };
  const next = [...list];
  next[idx] = updated;
  store.setPositions(next);
  return updated;
};
const deletePositionMock = async (positionId: number): Promise<void> => {
  await mockDelay();
  const list = store.getPositions();
  const pos = list.find(p => p.positionId === positionId);
  if (!pos) throw new Error('직위를 찾을 수 없습니다.');
  assertNotUnassigned(pos.positionCode);
  const refCount = store.getEmployees().filter(e => e.positionId === positionId).length
    + store.getRoleRules().filter(r => r.positionId === positionId).length;
  if (refCount > 0) throw new Error(`${refCount}건의 사원/규칙이 참조하고 있어 삭제할 수 없습니다.`);
  store.setPositions(list.filter(p => p.positionId !== positionId));
};

// ── mock: SSO JIT provisioning (8장) ──
interface SsoMockProfile { employeeId: string; name: string; departmentCode?: string; positionCode?: string; email?: string }
/** MockSsoProvider — 사전 정의된 프로필 표. 표에 없는 사번은 이름만으로 즉석 생성 */
const SSO_MOCK_PROFILES: SsoMockProfile[] = [
  { employeeId: 'M20260901', name: '김민준', departmentCode: 'COST_PLAN', positionCode: 'SENIOR' },
];

export const ssoLoginMock = async (employeeId: string): Promise<{ employee: EmployeeView; provisioned: boolean }> => {
  await mockDelay();
  const employees = store.getEmployees();
  const existing = employees.find(e => e.employeeId === employeeId);
  if (existing) {
    const updated = { ...existing, lastLoginAt: new Date().toISOString() };
    store.setEmployees(employees.map(e => (e.userId === existing.userId ? updated : e)));
    return { employee: toView(updated), provisioned: false };
  }

  const profile = SSO_MOCK_PROFILES.find(p => p.employeeId === employeeId) || { employeeId, name: `SSO사용자(${employeeId})` };
  const dept = store.getDepartments().find(d => d.deptCode === profile.departmentCode);
  const pos = store.getPositions().find(p => p.positionCode === profile.positionCode);
  const unassignedDept = store.getDepartments().find(d => d.deptCode === 'UNASSIGNED')!;
  const unassignedPos = store.getPositions().find(p => p.positionCode === 'UNASSIGNED')!;
  const departmentId = dept?.departmentId ?? unassignedDept.departmentId;
  const positionId = pos?.positionId ?? unassignedPos.positionId;

  const resolved = resolveDefaultRole(departmentId, positionId);
  const now = new Date().toISOString();
  const employee: Employee = {
    userId: Math.max(0, ...employees.map(e => e.userId)) + 1,
    employeeId: profile.employeeId,
    name: profile.name,
    departmentId,
    positionId,
    roleId: resolved.resultRole.roleId,
    roleAssignSource: resolved.assignSource,
    email: profile.email || null,
    status: 'ACTIVE',
    authSource: 'SSO',
    firstLoginAt: now,
    lastLoginAt: now,
    createdAt: now,
    updatedAt: now,
  };
  store.setEmployees([...employees, employee]);
  return { employee: toView(employee), provisioned: true };
};

/** 일반(사번/비밀번호) mock 로그인 시 참고할 사원 조회 — 없으면 null(권한 로직에서 VIEWER fallback) */
export const findMockEmployeeByEmployeeId = (employeeId: string): EmployeeView | null => {
  const emp = store.getEmployees().find(e => e.employeeId === employeeId);
  return emp ? toView(emp) : null;
};

// ── 통합 함수 ──

export const getEmployees = async (filter: EmployeeFilter): Promise<Page<EmployeeView>> => {
  if (USE_API) {
    try {
      const res = await apiClient.get('/employees', { params: filter });
      return res.data.data || res.data;
    } catch { return getEmployeesMock(filter); }
  }
  return getEmployeesMock(filter);
};

export const getEmployee = async (userId: number): Promise<EmployeeView> => {
  if (USE_API) {
    try {
      const res = await apiClient.get(`/employees/${userId}`);
      return res.data.data || res.data;
    } catch { return getEmployeeMock(userId); }
  }
  return getEmployeeMock(userId);
};

export const createEmployee = async (input: Parameters<typeof createEmployeeMock>[0]): Promise<EmployeeView> => {
  if (USE_API) {
    try {
      const res = await apiClient.post('/employees', input);
      return res.data.data || res.data;
    } catch { return createEmployeeMock(input); }
  }
  return createEmployeeMock(input);
};

export const updateEmployee = async (userId: number, patch: Partial<Employee>): Promise<EmployeeView> => {
  if (USE_API) {
    try {
      const res = await apiClient.put(`/employees/${userId}`, patch);
      return res.data.data || res.data;
    } catch { return updateEmployeeMock(userId, patch); }
  }
  return updateEmployeeMock(userId, patch);
};

export const changeEmployeeRole = async (userId: number, roleId: number, actingEmployeeId: string): Promise<EmployeeView> => {
  if (USE_API) {
    try {
      const res = await apiClient.put(`/employees/${userId}/roles`, { roleIds: [roleId] });
      return res.data.data || res.data;
    } catch { return changeEmployeeRoleMock(userId, roleId, actingEmployeeId); }
  }
  return changeEmployeeRoleMock(userId, roleId, actingEmployeeId);
};

export const bulkChangeRole = async (userIds: number[], roleId: number, actingEmployeeId: string): Promise<{ updatedCount: number }> => {
  if (USE_API) {
    try {
      const res = await apiClient.put('/employees/roles/bulk', { userIds, roleIds: [roleId] });
      return res.data.data || res.data;
    } catch { return bulkChangeRoleMock(userIds, roleId, actingEmployeeId); }
  }
  return bulkChangeRoleMock(userIds, roleId, actingEmployeeId);
};

export const setEmployeeStatus = async (userId: number, status: Employee['status'], actingEmployeeId: string): Promise<EmployeeView> => {
  if (USE_API) {
    try {
      const res = await apiClient.put(`/employees/${userId}/status`, { status });
      return res.data.data || res.data;
    } catch { return setEmployeeStatusMock(userId, status, actingEmployeeId); }
  }
  return setEmployeeStatusMock(userId, status, actingEmployeeId);
};

export const reapplyRuleForEmployee = async (userId: number): Promise<EmployeeView> => {
  if (USE_API) {
    try {
      const res = await apiClient.post(`/employees/${userId}/reapply-rule`);
      return res.data.data || res.data;
    } catch { return reapplyRuleForEmployeeMock(userId); }
  }
  return reapplyRuleForEmployeeMock(userId);
};

export const getDepartments = async (): Promise<Department[]> => {
  if (USE_API) {
    try {
      const res = await apiClient.get('/departments');
      return res.data.data || res.data;
    } catch { return getDepartmentsMock(); }
  }
  return getDepartmentsMock();
};
export const createDepartment = async (input: Omit<Department, 'departmentId'>): Promise<Department> => {
  if (USE_API) {
    try {
      const res = await apiClient.post('/departments', input);
      return res.data.data || res.data;
    } catch { return createDepartmentMock(input); }
  }
  return createDepartmentMock(input);
};
export const updateDepartment = async (departmentId: number, patch: Partial<Department>): Promise<Department> => {
  if (USE_API) {
    try {
      const res = await apiClient.put(`/departments/${departmentId}`, patch);
      return res.data.data || res.data;
    } catch { return updateDepartmentMock(departmentId, patch); }
  }
  return updateDepartmentMock(departmentId, patch);
};
export const deleteDepartment = async (departmentId: number): Promise<void> => {
  if (USE_API) {
    try {
      await apiClient.delete(`/departments/${departmentId}`);
      return;
    } catch { return deleteDepartmentMock(departmentId); }
  }
  return deleteDepartmentMock(departmentId);
};

export const getPositions = async (): Promise<Position[]> => {
  if (USE_API) {
    try {
      const res = await apiClient.get('/positions');
      return res.data.data || res.data;
    } catch { return getPositionsMock(); }
  }
  return getPositionsMock();
};
export const createPosition = async (input: Omit<Position, 'positionId'>): Promise<Position> => {
  if (USE_API) {
    try {
      const res = await apiClient.post('/positions', input);
      return res.data.data || res.data;
    } catch { return createPositionMock(input); }
  }
  return createPositionMock(input);
};
export const updatePosition = async (positionId: number, patch: Partial<Position>): Promise<Position> => {
  if (USE_API) {
    try {
      const res = await apiClient.put(`/positions/${positionId}`, patch);
      return res.data.data || res.data;
    } catch { return updatePositionMock(positionId, patch); }
  }
  return updatePositionMock(positionId, patch);
};
export const deletePosition = async (positionId: number): Promise<void> => {
  if (USE_API) {
    try {
      await apiClient.delete(`/positions/${positionId}`);
      return;
    } catch { return deletePositionMock(positionId); }
  }
  return deletePositionMock(positionId);
};

export const ssoLogin = async (employeeId: string): Promise<{ employee: EmployeeView; provisioned: boolean }> => {
  if (USE_API) {
    try {
      const result = await ssoLoginApi(employeeId);
      const role = store.getRoles().find(r => r.roleCode === result.roleCode);
      const employee: EmployeeView = {
        userId: 0, employeeId: result.employeeId, name: result.name,
        departmentId: null, positionId: null, roleId: role?.roleId || 0,
        roleAssignSource: 'RULE', status: 'ACTIVE', authSource: 'SSO',
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        departmentName: result.departmentName || '미지정', positionName: result.positionName || '미지정',
        roleCode: result.roleCode, roleName: role?.roleName || result.roleCode,
      };
      return { employee, provisioned: result.provisioned };
    } catch { return ssoLoginMock(employeeId); }
  }
  return ssoLoginMock(employeeId);
};
