/**
 * @fileoverview 시스템 관리 mock localStorage 저장소 공통 헬퍼
 * @description 키가 없으면 시드로 초기화하고, 이후에는 localStorage 를 단일 소스로 사용한다.
 *   모든 mock 호출에 지연을 넣어 로딩 상태를 실제로 확인할 수 있게 한다(11.6).
 */
import { SYSTEM_STORAGE_KEYS, MOCK_DELAY_MS } from '../../../constants/system';
import {
  initialMenus, initialRoles, initialRolePermissions,
  initialDepartments, initialPositions, initialEmployees, initialRoleRules,
} from '../data/mockData';
import type {
  MenuNode, Role, RolePermissionEntry, Department, Position, Employee, DefaultRoleRule,
} from '../types';

/** 개발 편의를 위한 인위적 지연 */
export const mockDelay = (ms: number = MOCK_DELAY_MS) => new Promise(resolve => setTimeout(resolve, ms));

function loadKey<T>(key: string, seed: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved) as T;
  } catch (error) {
    console.warn(`localStorage 로드 실패(${key}):`, error);
  }
  localStorage.setItem(key, JSON.stringify(seed));
  return seed;
}

function saveKey<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`localStorage 저장 실패(${key}):`, error);
  }
}

export const store = {
  getMenus: (): MenuNode[] => loadKey(SYSTEM_STORAGE_KEYS.MENUS, initialMenus),
  setMenus: (v: MenuNode[]) => saveKey(SYSTEM_STORAGE_KEYS.MENUS, v),

  getRoles: (): Role[] => loadKey(SYSTEM_STORAGE_KEYS.ROLES, initialRoles),
  setRoles: (v: Role[]) => saveKey(SYSTEM_STORAGE_KEYS.ROLES, v),

  getRolePermissions: (): RolePermissionEntry[] => loadKey(SYSTEM_STORAGE_KEYS.ROLE_PERMISSIONS, initialRolePermissions),
  setRolePermissions: (v: RolePermissionEntry[]) => saveKey(SYSTEM_STORAGE_KEYS.ROLE_PERMISSIONS, v),

  getDepartments: (): Department[] => loadKey(SYSTEM_STORAGE_KEYS.DEPARTMENTS, initialDepartments),
  setDepartments: (v: Department[]) => saveKey(SYSTEM_STORAGE_KEYS.DEPARTMENTS, v),

  getPositions: (): Position[] => loadKey(SYSTEM_STORAGE_KEYS.POSITIONS, initialPositions),
  setPositions: (v: Position[]) => saveKey(SYSTEM_STORAGE_KEYS.POSITIONS, v),

  getEmployees: (): Employee[] => loadKey(SYSTEM_STORAGE_KEYS.EMPLOYEES, initialEmployees),
  setEmployees: (v: Employee[]) => saveKey(SYSTEM_STORAGE_KEYS.EMPLOYEES, v),

  getRoleRules: (): DefaultRoleRule[] => loadKey(SYSTEM_STORAGE_KEYS.ROLE_RULES, initialRoleRules),
  setRoleRules: (v: DefaultRoleRule[]) => saveKey(SYSTEM_STORAGE_KEYS.ROLE_RULES, v),

  /** 개발용 권한 전환(현재 권한으로 보기) — mock 모드에서만 사용 */
  getDevRoleOverride: (): string | null => localStorage.getItem(SYSTEM_STORAGE_KEYS.DEV_ROLE_OVERRIDE),
  setDevRoleOverride: (roleCode: string | null) => {
    if (roleCode) localStorage.setItem(SYSTEM_STORAGE_KEYS.DEV_ROLE_OVERRIDE, roleCode);
    else localStorage.removeItem(SYSTEM_STORAGE_KEYS.DEV_ROLE_OVERRIDE);
  },
};

/** 개발용 초기화 — window.__resetSystemMock() 으로만 노출 (11.6) */
export function resetSystemMock(): void {
  Object.values(SYSTEM_STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  console.log('✅ 시스템 관리 mock 데이터가 초기화되었습니다. 새로고침하세요.');
}

declare global {
  interface Window {
    __resetSystemMock?: () => void;
  }
}
if (typeof window !== 'undefined') {
  window.__resetSystemMock = resetSystemMock;
}
