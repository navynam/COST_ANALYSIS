/**
 * @fileoverview 권한관리 — 권한 목록 + 매트릭스 상태/로직
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getRoles, createRole, updateRole, deleteRole, copyRole,
  getRolePermissionMatrix, saveRolePermissionMatrix,
} from '../services/roleService';
import { getAllMenus } from '../services/menuService';
import type { ActionCode, MenuNode, Role, RolePermissionEntry } from '../types';

type RoleWithCount = Role & { assignedCount: number };
type PermissionKey = 'canRead' | 'canCreate' | 'canUpdate' | 'canDelete' | 'canApprove';

const ACTION_TO_KEY: Record<ActionCode, PermissionKey> = {
  R: 'canRead', C: 'canCreate', U: 'canUpdate', D: 'canDelete', A: 'canApprove',
};

const flattenMenus = (tree: MenuNode[]): MenuNode[] => {
  const flat: MenuNode[] = [];
  const walk = (nodes: MenuNode[]) => nodes.forEach(n => { flat.push(n); if (n.children) walk(n.children); });
  walk(tree);
  return flat;
};

export const useRoleManagement = () => {
  const [roles, setRoles] = useState<RoleWithCount[]>([]);
  const [menus, setMenus] = useState<MenuNode[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [matrixRows, setMatrixRows] = useState<RolePermissionEntry[]>([]);
  const [matrixBaseUpdatedAt, setMatrixBaseUpdatedAt] = useState<string>('');
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [matrixLoading, setMatrixLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; severity: 'success' | 'error'; message: string }>({ open: false, severity: 'success', message: '' });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [roleList, menuTree] = await Promise.all([getRoles(), getAllMenus()]);
      setRoles(roleList);
      setMenus(flattenMenus(menuTree).filter(m => m.supportedActions.length > 0));
      if (!selectedRoleId && roleList.length > 0) setSelectedRoleId(roleList[0].roleId);
    } catch {
      setError('권한 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { load(); }, [load]);

  const loadMatrix = useCallback(async (roleId: number) => {
    setMatrixLoading(true);
    try {
      const matrix = await getRolePermissionMatrix(roleId);
      setMatrixRows(matrix.permissions);
      setMatrixBaseUpdatedAt(matrix.updatedAt);
      setDirty(false);
    } catch {
      setToast({ open: true, severity: 'error', message: '매트릭스를 불러오지 못했습니다.' });
    } finally {
      setMatrixLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedRoleId) loadMatrix(selectedRoleId);
  }, [selectedRoleId, loadMatrix]);

  const selectedRole = useMemo(() => roles.find(r => r.roleId === selectedRoleId) || null, [roles, selectedRoleId]);

  const toggleCell = (menuId: number, action: ActionCode) => {
    const key = ACTION_TO_KEY[action];
    setMatrixRows(prev => prev.map(row => (row.menuId !== menuId ? row : { ...row, [key]: !row[key] })));
    setDirty(true);
  };

  const toggleColumn = (action: ActionCode) => {
    const key = ACTION_TO_KEY[action];
    const supportingRows = matrixRows.filter(row => menus.find(m => m.menuId === row.menuId)?.supportedActions.includes(action));
    const allChecked = supportingRows.length > 0 && supportingRows.every(row => row[key]);
    setMatrixRows(prev => prev.map(row => (
      !menus.find(m => m.menuId === row.menuId)?.supportedActions.includes(action) ? row : { ...row, [key]: !allChecked }
    )));
    setDirty(true);
  };

  const toggleRow = (menuId: number) => {
    const menu = menus.find(m => m.menuId === menuId);
    if (!menu) return;
    setMatrixRows(prev => prev.map(row => {
      if (row.menuId !== menuId) return row;
      const allOn = menu.supportedActions.every(a => row[ACTION_TO_KEY[a]]);
      const next: RolePermissionEntry = { ...row };
      menu.supportedActions.forEach(a => { next[ACTION_TO_KEY[a]] = !allOn; });
      return next;
    }));
    setDirty(true);
  };

  const saveMatrix = async () => {
    if (!selectedRoleId) return;
    setSaving(true);
    try {
      const result = await saveRolePermissionMatrix(selectedRoleId, matrixBaseUpdatedAt, matrixRows);
      setMatrixRows(result.permissions);
      setMatrixBaseUpdatedAt(result.updatedAt);
      setDirty(false);
      setToast({
        open: true, severity: 'success',
        message: result.autoReadGranted ? '저장되었습니다. 조회 권한이 함께 부여되었습니다.' : '매트릭스가 저장되었습니다.',
      });
      await load();
    } catch (e) {
      setToast({ open: true, severity: 'error', message: e instanceof Error ? e.message : '저장에 실패했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  const addRole = async (input: { roleCode: string; roleName: string; description?: string }) => {
    const created = await createRole(input);
    await load();
    setSelectedRoleId(created.roleId);
  };

  const editRole = async (roleId: number, patch: Partial<Role>) => {
    await updateRole(roleId, patch);
    await load();
  };

  const removeRole = async (roleId: number) => {
    await deleteRole(roleId);
    if (selectedRoleId === roleId) setSelectedRoleId(null);
    await load();
  };

  const duplicateRole = async (roleId: number, roleCode: string, roleName: string) => {
    const created = await copyRole(roleId, roleCode, roleName);
    await load();
    setSelectedRoleId(created.roleId);
  };

  return {
    roles, menus, loading, error, load,
    selectedRoleId, setSelectedRoleId, selectedRole,
    matrixRows, matrixLoading, dirty,
    toggleCell, toggleColumn, toggleRow, saveMatrix, saving,
    addRole, editRole, removeRole, duplicateRole,
    toast, setToast,
  };
};
