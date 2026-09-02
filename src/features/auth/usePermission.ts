/**
 * @fileoverview usePermission 훅 (11.3)
 * @description 명시적 menuCode 를 주거나, 생략하면 현재 라우트로 메뉴를 자동 추론한다.
 *
 * 사용 예:
 *   const { canRead, canCreate, canUpdate, canDelete, canApprove } = usePermission('MODEL');
 *   const { canCreate } = usePermission();               // 현재 라우트로 자동 추론
 *   {canCreate && <Button onClick={handleAdd}>추가</Button>}
 */
import { useLocation } from 'react-router-dom';
import { usePermissionContext } from './PermissionContext';
import type { MenuPermission } from '../system/types';

const EMPTY_PERMISSION: MenuPermission = {
  canRead: false, canCreate: false, canUpdate: false, canDelete: false, canApprove: false,
};

export const usePermission = (menuCode?: string): MenuPermission => {
  const { permissions, findMenuByPath } = usePermissionContext();
  const location = useLocation();

  const resolvedCode = menuCode ?? findMenuByPath(location.pathname)?.menuCode;
  if (!resolvedCode) return EMPTY_PERMISSION;

  return permissions[resolvedCode] || EMPTY_PERMISSION;
};
