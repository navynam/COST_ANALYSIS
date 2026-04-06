/**
 * @fileoverview 모델 변경 워크플로우 훅
 * @description 역할 기반 모델 수정 요청 → 검토 → 승인/반려 워크플로우
 */
import { useState, useEffect, useCallback } from 'react';
import { Formula } from './useModelManagement';
import {
  loadUser,
  loadRequests,
  saveUser,
  saveRequests,
  calculateStats,
  countPendingForFormula,
  getRequestsForFormula as getRequestsForFormulaFromService,
  hasPendingByUser as hasPendingByUserFromService,
  findUserPreset,
} from '../services/workflowService';

// ── 타입 정의 ──
export type UserRole = 'admin' | 'user';

export interface CurrentUser {
  id: string;
  name: string;
  role: UserRole;
  department: string;
  taskName?: string;
}

export type ChangeRequestStatus = 'pending' | 'approved' | 'rejected';

export interface ChangeRequest {
  id: string;
  formulaId: string;
  requesterId: string;
  requesterName: string;
  department: string;
  taskName: string;
  originalFormula: Formula;
  modifiedFields: Partial<Formula>;
  status: ChangeRequestStatus;
  reason: string;
  createdAt: string;
  reviewedAt?: string;
  reviewerComment?: string;
  approvedDepartments?: string[]; // 승인 시 적용 부서 목록
}

// ── 데모용 사용자 프리셋 ──
export const userPresets: CurrentUser[] = [
  { id: 'admin1', name: '김관리', role: 'admin', department: '원가관리팀' },
  { id: 'user1', name: '이분석', role: 'user', department: '견적1팀', taskName: 'HEAD_LINING 원가분석' },
  { id: 'user2', name: '박검증', role: 'user', department: '견적2팀', taskName: 'DOOR_TRIM 견적검증' },
];

// ── Hook ──
export const useModelWorkflow = () => {
  const [currentUser, setCurrentUser] = useState<CurrentUser>(loadUser);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>(loadRequests);

  // localStorage 동기화
  useEffect(() => {
    saveUser(currentUser);
  }, [currentUser]);

  useEffect(() => {
    saveRequests(changeRequests);
  }, [changeRequests]);

  // 사용자 전환
  const switchUser = useCallback((userId: string) => {
    const user = findUserPreset(userId);
    if (user) setCurrentUser(user);
  }, []);

  const isAdmin = currentUser.role === 'admin';

  // 수정 요청 생성 (일반 사용자)
  const submitChangeRequest = useCallback((
    formula: Formula,
    modifiedFields: Partial<Formula>,
    reason: string
  ) => {
    const newRequest: ChangeRequest = {
      id: `cr${Date.now()}`,
      formulaId: formula.id,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      department: currentUser.department,
      taskName: currentUser.taskName || '',
      originalFormula: { ...formula },
      modifiedFields,
      status: 'pending',
      reason,
      createdAt: new Date().toISOString(),
    };
    setChangeRequests(prev => [newRequest, ...prev]);
    return newRequest;
  }, [currentUser]);

  // 승인 (관리자)
  const approveRequest = useCallback((requestId: string, comment: string, departments: string[]) => {
    setChangeRequests(prev => prev.map(r =>
      r.id === requestId
        ? { ...r, status: 'approved' as const, reviewedAt: new Date().toISOString(), reviewerComment: comment, approvedDepartments: departments }
        : r
    ));
  }, []);

  // 반려 (관리자)
  const rejectRequest = useCallback((requestId: string, comment: string) => {
    setChangeRequests(prev => prev.map(r =>
      r.id === requestId
        ? { ...r, status: 'rejected' as const, reviewedAt: new Date().toISOString(), reviewerComment: comment }
        : r
    ));
  }, []);

  // 특정 수식에 대한 대기 중인 요청 수
  const getPendingCount = useCallback((formulaId: string) => {
    return countPendingForFormula(changeRequests, formulaId);
  }, [changeRequests]);

  // 특정 수식에 대한 요청 목록 (팝업용)
  const getRequestsForFormula = useCallback((formulaId: string) => {
    return getRequestsForFormulaFromService(changeRequests, formulaId);
  }, [changeRequests]);

  // 현재 사용자가 해당 수식에 대기 중인 요청이 있는지
  const hasPendingByUser = useCallback((formulaId: string) => {
    return hasPendingByUserFromService(changeRequests, formulaId, currentUser.id);
  }, [changeRequests, currentUser.id]);

  // 요청 취소 (본인 대기 중 요청만)
  const cancelRequest = useCallback((requestId: string) => {
    setChangeRequests(prev => prev.filter(r => !(r.id === requestId && r.requesterId === currentUser.id && r.status === 'pending')));
  }, [currentUser.id]);

  // 통계
  const stats = calculateStats(changeRequests);

  return {
    currentUser,
    switchUser,
    isAdmin,
    changeRequests,
    submitChangeRequest,
    approveRequest,
    rejectRequest,
    cancelRequest,
    getPendingCount,
    getRequestsForFormula,
    hasPendingByUser,
    stats,
  };
};
