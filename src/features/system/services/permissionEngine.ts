/**
 * @fileoverview 권한 평가 엔진 (mock 전용)
 * @description 메뉴 트리 구성, 권한 스냅샷 계산, 기본권한 규칙 매칭(7장 구체성 알고리즘)을 담당한다.
 *   백엔드가 생기면 이 로직은 서버로 이전되고 프론트는 GET /menus/my 응답만 소비하게 된다.
 */
import { DEFAULT_ROLE_CODE } from '../../../constants/system';
import { store } from './mockStore';
import type {
  MenuNode, MenuPermission, PermissionSnapshot, RoleAssignSource, RoleRuleSimulation,
} from '../types';

/** 플랫 메뉴 목록 → 트리 (부모 sortOrder 기준 정렬) */
export function buildMenuTree(flat: MenuNode[]): MenuNode[] {
  const byCode = new Map(flat.map(m => [m.menuCode, { ...m, children: [] as MenuNode[] }]));
  const roots: MenuNode[] = [];
  byCode.forEach(node => {
    if (node.parentMenuCode && byCode.has(node.parentMenuCode)) {
      byCode.get(node.parentMenuCode)!.children!.push(node);
    } else {
      roots.push(node);
    }
  });
  const sortRec = (nodes: MenuNode[]) => {
    nodes.sort((a, b) => a.sortOrder - b.sortOrder);
    nodes.forEach(n => n.children && sortRec(n.children));
  };
  sortRec(roots);
  return roots;
}

const emptyPermission: MenuPermission = { canRead: false, canCreate: false, canUpdate: false, canDelete: false, canApprove: false };

/** 권한 변경 감지용 해시 (permRows 내용이 같으면 항상 같은 값) */
function hashPermissionState(roleId: number, rows: { menuId: number; canRead: boolean; canCreate: boolean; canUpdate: boolean; canDelete: boolean; canApprove: boolean }[]): string {
  const serialized = `${roleId}|${rows
    .slice()
    .sort((a, b) => a.menuId - b.menuId)
    .map(r => `${r.menuId}:${r.canRead ? 1 : 0}${r.canCreate ? 1 : 0}${r.canUpdate ? 1 : 0}${r.canDelete ? 1 : 0}${r.canApprove ? 1 : 0}`)
    .join(',')}`;
  let hash = 0;
  for (let i = 0; i < serialized.length; i += 1) {
    hash = (hash * 31 + serialized.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(16);
}

/** roleCode 기준으로 canRead=true 인 메뉴만 남긴 트리 + 권한 맵을 계산한다 */
export function buildPermissionSnapshot(roleCode: string): PermissionSnapshot {
  const roles = store.getRoles();
  const role = roles.find(r => r.roleCode === roleCode && r.useYn) || roles.find(r => r.roleCode === DEFAULT_ROLE_CODE)!;
  const permRows = store.getRolePermissions().filter(p => p.roleId === role.roleId);
  const permMap = new Map(permRows.map(p => [p.menuCode, p]));

  const flat = store.getMenus().filter(m => m.useYn);
  const permissions: Record<string, MenuPermission> = {};

  const readableCodes = new Set<string>();
  flat.forEach(m => {
    const row = permMap.get(m.menuCode);
    const perm: MenuPermission = row
      ? { canRead: row.canRead, canCreate: row.canCreate, canUpdate: row.canUpdate, canDelete: row.canDelete, canApprove: row.canApprove }
      : { ...emptyPermission };
    if (perm.canRead) {
      readableCodes.add(m.menuCode);
      permissions[m.menuCode] = perm;
    }
  });

  // 그룹 메뉴(GRP_*)는 자식 중 canRead 가 1개 이상이면 표시(E5)
  flat.filter(m => m.supportedActions.length === 0).forEach(grp => {
    const hasReadableChild = flat.some(child => child.parentMenuCode === grp.menuCode && readableCodes.has(child.menuCode));
    if (hasReadableChild) {
      readableCodes.add(grp.menuCode);
      permissions[grp.menuCode] = { canRead: true, canCreate: false, canUpdate: false, canDelete: false, canApprove: false };
    }
  });

  const visibleFlat = flat.filter(m => readableCodes.has(m.menuCode));
  const menus = buildMenuTree(visibleFlat);

  const permissionVersion = hashPermissionState(role.roleId, permRows);

  return {
    permissionVersion,
    roleId: role.roleId,
    roleCode: role.roleCode,
    roleName: role.roleName,
    menus,
    permissions,
  };
}

/** aliasPaths 포함, 현재 라우트 경로로 메뉴 찾기 (그룹 제외, 평면 탐색) */
export function findMenuByPath(menus: MenuNode[], pathname: string): MenuNode | null {
  const flat: MenuNode[] = [];
  const walk = (nodes: MenuNode[]) => nodes.forEach(n => { flat.push(n); if (n.children) walk(n.children); });
  walk(menus);
  return flat.find(m => m.path === pathname || (m.aliasPaths || []).includes(pathname)) || null;
}

// ── 기본권한 규칙 매칭 (7장) ──

function specificity(departmentId: number | null, positionId: number | null): number {
  if (departmentId != null && positionId != null) return 30;
  if (departmentId != null && positionId == null) return 20;
  if (departmentId == null && positionId != null) return 10;
  return 0;
}

/** 부서/직위 조합에 대해 규칙을 평가해 최종 권한을 결정한다 (7.2 해소 순서) */
export function resolveDefaultRole(departmentId: number | null, positionId: number | null): RoleRuleSimulation {
  const rules = store.getRoleRules().filter(r => r.useYn);
  const roles = store.getRoles();
  const matched = rules.filter(r => (
    (r.departmentId == null || r.departmentId === departmentId) &&
    (r.positionId == null || r.positionId === positionId)
  ));

  const matchedRules = matched
    .map(r => ({ ruleId: r.ruleId, ruleName: r.ruleName, specificity: specificity(r.departmentId, r.positionId), priority: r.priority, roleId: r.roleId }))
    .sort((a, b) => b.specificity - a.specificity || a.priority - b.priority || a.ruleId - b.ruleId);

  if (matchedRules.length === 0) {
    const fallbackRole = roles.find(r => r.roleCode === DEFAULT_ROLE_CODE)!;
    return {
      matchedRules: [],
      selectedRuleId: null,
      resultRole: { roleId: fallbackRole.roleId, roleCode: fallbackRole.roleCode, roleName: fallbackRole.roleName },
      assignSource: 'DEFAULT' as RoleAssignSource,
    };
  }

  const topSpecificity = matchedRules[0].specificity;
  const topGroup = matchedRules.filter(r => r.specificity === topSpecificity);
  const selected = topGroup.sort((a, b) => a.priority - b.priority || a.ruleId - b.ruleId)[0];
  const selectedRole = roles.find(r => r.roleId === selected.roleId)!;

  return {
    matchedRules: matchedRules.map(({ ruleId, ruleName, specificity: s, priority }) => ({ ruleId, ruleName, specificity: s, priority })),
    selectedRuleId: selected.ruleId,
    resultRole: { roleId: selectedRole.roleId, roleCode: selectedRole.roleCode, roleName: selectedRole.roleName },
    assignSource: 'RULE' as RoleAssignSource,
  };
}
