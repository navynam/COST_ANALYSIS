/**
 * @fileoverview 메뉴관리 화면 상태/로직 (D7: 기존 메뉴 수정만, 신규/삭제 없음)
 */
import { useCallback, useEffect, useState } from 'react';
import { getAllMenus, updateMenu } from '../services/menuService';
import type { ActionCode, MenuNode } from '../types';

export interface MenuEditForm {
  menuName: string;
  parentMenuCode: string;
  path: string;
  aliasPaths: string;
  iconName: string;
  sortOrder: number;
  visibleInNav: boolean;
  supportedActions: ActionCode[];
  useYn: boolean;
  description: string;
}

const toForm = (menu: MenuNode): MenuEditForm => ({
  menuName: menu.menuName,
  parentMenuCode: menu.parentMenuCode || '',
  path: menu.path || '',
  aliasPaths: (menu.aliasPaths || []).join(', '),
  iconName: menu.iconName || '',
  sortOrder: menu.sortOrder,
  visibleInNav: menu.visibleInNav,
  supportedActions: menu.supportedActions,
  useYn: menu.useYn,
  description: menu.description || '',
});

export const useMenuManagement = () => {
  const [menus, setMenus] = useState<MenuNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [form, setForm] = useState<MenuEditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; severity: 'success' | 'error'; message: string }>({ open: false, severity: 'success', message: '' });

  const flatMenus = useCallback((tree: MenuNode[]): MenuNode[] => {
    const flat: MenuNode[] = [];
    const walk = (nodes: MenuNode[]) => nodes.forEach(n => { flat.push(n); if (n.children) walk(n.children); });
    walk(tree);
    return flat;
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllMenus();
      setMenus(data);
    } catch {
      setError('메뉴를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const allFlat = flatMenus(menus);
  const selectedMenu = selectedCode ? allFlat.find(m => m.menuCode === selectedCode) || null : null;

  const selectMenu = (menuCode: string) => {
    const menu = allFlat.find(m => m.menuCode === menuCode);
    if (!menu) return;
    setSelectedCode(menuCode);
    setForm(toForm(menu));
  };

  const parentOptions = allFlat.filter(m => m.depth === 1 && m.menuCode !== selectedCode);

  const save = async () => {
    if (!selectedMenu || !form) return;
    setSaving(true);
    try {
      await updateMenu(selectedMenu.menuId, {
        menuName: form.menuName,
        parentMenuCode: selectedMenu.depth === 2 ? (form.parentMenuCode || null) : null,
        path: form.path || null,
        aliasPaths: form.aliasPaths.split(',').map(s => s.trim()).filter(Boolean),
        iconName: form.iconName || null,
        sortOrder: form.sortOrder,
        visibleInNav: form.visibleInNav,
        supportedActions: form.supportedActions,
        useYn: form.useYn,
        description: form.description || null,
      });
      setToast({ open: true, severity: 'success', message: '메뉴 정보가 저장되었습니다.' });
      await load();
    } catch (e) {
      setToast({ open: true, severity: 'error', message: e instanceof Error ? e.message : '저장에 실패했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  return {
    menus, allFlat, loading, error, load,
    selectedCode, selectedMenu, selectMenu,
    form, setForm, parentOptions,
    saving, save, toast, setToast,
  };
};
