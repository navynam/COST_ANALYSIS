/**
 * 🔐 권한 컨텍스트 (Permission Context)
 *
 * 🎯 역할:
 * - 로그인 사원의 메뉴 트리 + 권한 맵을 보유한다 (GET /menus/my 스냅샷의 프론트 캐시)
 * - AuthContext 를 대체하지 않고 그 하위에 위치한다 (11.2)
 * - 사이드바 렌더링 + ProtectedRoute 판정의 단일 소스
 *
 * 🔧 갱신 시점:
 * - 로그인 성공 직후 / MainLayout 마운트 시 1회
 * - 브라우저 탭 focus 복귀 시 permissionVersion 재확인 (E9, 폴링 대체)
 */
import React, { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useAuth } from './AuthContext';
import { USE_API } from '../../shared/api/config';
import { ROLE_CODES } from '../../constants/system';
import { getMyPermissions, isServedByMock } from '../system/services/menuService';
import { store as systemStore } from '../system/services/mockStore';
import { findMockEmployeeByEmployeeId } from '../system/services/employeeService';
import { findMenuByPath as findMenuByPathInTree } from '../system/services/permissionEngine';
import type { MenuNode, MenuPermission, PermissionSnapshot, ActionCode } from '../system/types';

const SNAPSHOT_CACHE_KEY = 'permission_snapshot';

interface PermissionContextValue {
  loading: boolean;
  error: string | null;
  menus: MenuNode[];
  permissions: Record<string, MenuPermission>;
  permissionVersion: string;
  hasAnyMenu: boolean;
  refresh: () => Promise<void>;
  can: (menuCode: string, action: ActionCode) => boolean;
  findMenuByPath: (pathname: string) => MenuNode | null;
}

const PermissionContext = createContext<PermissionContextValue | undefined>(undefined);

/** mock 모드에서 로그인 사원의 권한 평가에 사용할 roleCode 를 결정한다 */
function resolveRoleCodeForMock(employeeId: string | undefined): string {
  // 🐛 fix: USE_API 가 아니라 "실제로 mock 이 응답 중인가"로 판단한다.
  //   localhost:3000 은 USE_API=true 라 백엔드가 없어도 개발용 권한 전환이 무시됐다.
  if (!USE_API || isServedByMock()) {
    const override = systemStore.getDevRoleOverride();
    if (override) return override;
  }
  if (employeeId) {
    const emp = findMockEmployeeByEmployeeId(employeeId);
    if (emp) return emp.roleCode;
  }
  return ROLE_CODES.VIEWER;
}

export const PermissionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [snapshot, setSnapshot] = useState<PermissionSnapshot | null>(() => {
    try {
      const cached = sessionStorage.getItem(SNAPSHOT_CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });
  // 🐛 fix: 인증은 됐는데 세션 캐시가 없는 최초 진입(첫 로그인/새 탭)에는 반드시 loading=true 로 시작해야 한다.
  //   false 로 시작하면 첫 렌더에서 snapshot===null 인 채로 HomeRedirect/ProtectedRoute 가
  //   "hasAnyMenu=false → /no-access" 로 단정해버린다(권한 미로딩과 권한 없음을 혼동하는 버그).
  const [loading, setLoading] = useState<boolean>(() => isAuthenticated && !snapshot);
  const [error, setError] = useState<string | null>(null);
  const [changedNotice, setChangedNotice] = useState(false);
  const lastVersion = useRef<string | null>(null);
  // 로그아웃→재로그인처럼 refresh() 가 겹쳐 호출될 때, 먼저 시작한 오래된 응답이
  // 나중에 도착해 최신 상태를 덮어쓰지 않도록 요청 순번으로 stale 응답을 무시한다.
  const requestSeq = useRef(0);

  const refresh = useCallback(async (silent = false) => {
    if (!isAuthenticated) return;
    const seq = ++requestSeq.current;
    if (!silent) setLoading(true);
    setError(null);
    try {
      const roleCode = resolveRoleCodeForMock(user?.id);
      const result = await getMyPermissions(roleCode);
      if (seq !== requestSeq.current) return; // stale 응답 무시
      if (silent && lastVersion.current && lastVersion.current !== result.permissionVersion) {
        setChangedNotice(true);
      }
      lastVersion.current = result.permissionVersion;
      setSnapshot(result);
      sessionStorage.setItem(SNAPSHOT_CACHE_KEY, JSON.stringify(result));
    } catch (e) {
      if (seq !== requestSeq.current) return;
      setError('권한 정보를 불러오지 못했습니다.');
      console.error('권한 조회 실패:', e);
    } finally {
      // 🐛 fix: !silent 조건을 빼야 한다. non-silent(seq=1) 가 loading=true 로 켠 뒤
      //   silent(seq=2) 가 최종 승자가 되면, seq=1 은 stale 이라 건너뛰고 seq=2 는 silent 라 건너뛰어
      //   loading 이 영구히 true 로 고착됐다. 최신 요청이 끝나면 무조건 내린다.
      if (seq === requestSeq.current) setLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  // 로그인 상태 변화 시 재조회
  // refresh() 내부에서 이미 동기적으로 setLoading(true) 를 호출하므로(첫 await 이전 구간) 별도 호출은 불필요
  useEffect(() => {
    if (isAuthenticated) {
      refresh();
    } else {
      requestSeq.current += 1; // 진행 중이던 refresh() 응답을 stale 처리
      setSnapshot(null);
      setLoading(false);
      setError(null);
      sessionStorage.removeItem(SNAPSHOT_CACHE_KEY);
      lastVersion.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

  // E9: 탭 focus 복귀 시 permissionVersion 재확인 (폴링 대체)
  useEffect(() => {
    if (!isAuthenticated) return undefined;
    const onFocus = () => { refresh(true); };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [isAuthenticated, refresh]);

  const can = useCallback((menuCode: string, action: ActionCode): boolean => {
    const perm = snapshot?.permissions[menuCode];
    if (!perm) return false;
    switch (action) {
      case 'R': return perm.canRead;
      case 'C': return perm.canCreate;
      case 'U': return perm.canUpdate;
      case 'D': return perm.canDelete;
      case 'A': return perm.canApprove;
      default: return false;
    }
  }, [snapshot]);

  const findMenuByPath = useCallback((pathname: string): MenuNode | null => {
    if (!snapshot) return null;
    return findMenuByPathInTree(snapshot.menus, pathname);
  }, [snapshot]);

  // 🐛 fix: PermissionProvider 는 /login 을 포함한 앱 전체를 감싸므로 앱 로드 시(비로그인)
  //   딱 한 번 마운트된다. 따라서 useState 의 lazy initializer 는 로그인 전환 시 재평가되지 않아
  //   `login() → navigate('/')` 경로에서 loading=false, snapshot=null 인 채로 HomeRedirect 가
  //   "권한 없음"으로 단정해 /no-access 에 고착됐다.
  //   → 매 렌더에서 파생 계산한다: 인증됐는데 스냅샷도 에러도 없으면 아직 로딩 중이다.
  const effectiveLoading = loading || (isAuthenticated && !snapshot && !error);

  const value: PermissionContextValue = {
    loading: effectiveLoading,
    error,
    menus: snapshot?.menus || [],
    permissions: snapshot?.permissions || {},
    permissionVersion: snapshot?.permissionVersion || '',
    hasAnyMenu: (snapshot?.menus.length || 0) > 0,
    refresh: () => refresh(false),
    can,
    findMenuByPath,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
      <Snackbar open={changedNotice} autoHideDuration={4000} onClose={() => setChangedNotice(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="info" variant="filled" onClose={() => setChangedNotice(false)}>
          권한이 변경되어 화면을 갱신했습니다.
        </Alert>
      </Snackbar>
    </PermissionContext.Provider>
  );
};

export const usePermissionContext = (): PermissionContextValue => {
  const ctx = useContext(PermissionContext);
  if (!ctx) throw new Error('usePermissionContext must be used within PermissionProvider');
  return ctx;
};
