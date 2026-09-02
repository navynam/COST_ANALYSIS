/**
 * @fileoverview 메뉴 관리 / 내 권한 조회 서비스
 * @description GET /menus/my 가 사이드바 + 라우트 가드의 단일 소스(10.1).
 *   기존 서비스 관례대로 USE_API 시 API 우선, 실패하면 mock(localStorage) 로 fallback 한다.
 */
import apiClient from '../../../shared/api/apiClient';
import { USE_API } from '../../../shared/api/config';
import { store, mockDelay } from './mockStore';
import { buildMenuTree, buildPermissionSnapshot } from './permissionEngine';
import type { MenuNode, PermissionSnapshot } from '../types';

/**
 * 🐛 fix: "mock 으로 동작 중인가"를 USE_API 로 판단하면 안 된다.
 *   USE_API 는 localhost:3000 이면 무조건 true 인데, 백엔드가 없으면 실제로는 mock fallback 으로 돈다.
 *   이 경우 개발용 권한 전환(11.6)이 USE_API===true 라는 이유로 통째로 비활성화돼,
 *   시드 계정이 아닌 사번으로 로그인하면 조회자로 고정되고 바꿀 수단조차 없었다.
 *   → 마지막 권한 조회가 실제로 어디서 응답했는지를 기록해 그 값으로 판단한다.
 */
let servedByMock = !USE_API;
export const isServedByMock = (): boolean => servedByMock;

// ── API 호출 함수 ──
const fetchMyPermissionsApi = async (): Promise<PermissionSnapshot> => {
  const res = await apiClient.get('/menus/my');
  return res.data.data || res.data;
};

const fetchMenusApi = async (): Promise<MenuNode[]> => {
  const res = await apiClient.get('/menus');
  return res.data.data || res.data;
};

const updateMenuApi = async (menuId: number, patch: Partial<MenuNode>): Promise<MenuNode> => {
  const res = await apiClient.put(`/menus/${menuId}`, patch);
  return res.data.data || res.data;
};

// ── mock 함수 ──
const getMyPermissionsMock = async (roleCodeForEval: string): Promise<PermissionSnapshot> => {
  await mockDelay();
  return buildPermissionSnapshot(roleCodeForEval);
};

const getMenusMock = async (): Promise<MenuNode[]> => {
  await mockDelay();
  return buildMenuTree(store.getMenus());
};

const updateMenuMock = async (menuId: number, patch: Partial<MenuNode>): Promise<MenuNode> => {
  await mockDelay();
  const menus = store.getMenus();
  const idx = menus.findIndex(m => m.menuId === menuId);
  if (idx === -1) throw new Error('메뉴를 찾을 수 없습니다.');
  const updated = { ...menus[idx], ...patch, updatedAt: new Date().toISOString() };
  const next = [...menus];
  next[idx] = updated;
  store.setMenus(next);
  return updated;
};

// ── 통합 함수 ──

/**
 * 로그인 사원의 메뉴/권한 스냅샷을 조회한다.
 * mock 모드에서는 개발용 권한 전환(devRoleOverride) 이 설정돼 있으면 그 권한을 우선한다.
 */
export const getMyPermissions = async (roleCodeForMock: string): Promise<PermissionSnapshot> => {
  if (USE_API) {
    try {
      const result = await fetchMyPermissionsApi();
      servedByMock = false;   // 실제 백엔드가 응답함
      return result;
    } catch {
      servedByMock = true;    // 백엔드 없음 → mock 으로 동작 중
      return getMyPermissionsMock(roleCodeForMock);
    }
  }
  return getMyPermissionsMock(roleCodeForMock);
};

/** 관리자용 전체 메뉴 트리 조회 (권한 무관) */
export const getAllMenus = async (): Promise<MenuNode[]> => {
  if (USE_API) {
    try {
      return buildMenuTree(await fetchMenusApi());
    } catch {
      return getMenusMock();
    }
  }
  return getMenusMock();
};

/** 메뉴 수정 (D7: 신규 추가/삭제 없음, 수정만) */
export const updateMenu = async (menuId: number, patch: Partial<MenuNode>): Promise<MenuNode> => {
  if (USE_API) {
    try {
      return await updateMenuApi(menuId, patch);
    } catch {
      return updateMenuMock(menuId, patch);
    }
  }
  return updateMenuMock(menuId, patch);
};
