/**
 * @fileoverview 모델 변경 워크플로우 훅
 * @description 역할 기반 모델 수정 요청 → 검토 → 승인/반려 워크플로우
 */
import { useState, useEffect, useCallback } from 'react';
import { Formula } from './useModelManagement';

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
export type AppliedScope = 'task' | 'global';

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
  appliedScope?: AppliedScope;
}

// ── 데모용 사용자 프리셋 ──
export const userPresets: CurrentUser[] = [
  { id: 'admin1', name: '김관리', role: 'admin', department: '원가관리팀' },
  { id: 'user1', name: '이분석', role: 'user', department: '견적1팀', taskName: 'HEAD_LINING 원가분석' },
  { id: 'user2', name: '박검증', role: 'user', department: '견적2팀', taskName: 'DOOR_TRIM 견적검증' },
];

// ── 데모용 초기 변경요청 데이터 ──
const initialRequests: ChangeRequest[] = [
  {
    id: 'cr1',
    formulaId: 'f2',
    requesterId: 'user1',
    requesterName: '이분석',
    department: '견적1팀',
    taskName: 'HEAD_LINING 원가분석',
    originalFormula: {
      id: 'f2', name: '재료비 소계', badge: 'sub',
      expression: '재료비 = Σ(단가 × 수량 × (1 + 로스율))',
      description: '원자재 및 부자재의 합계를 산출합니다. 로스율을 반영합니다.',
      variables: ['단가', '수량', '로스율'],
    },
    modifiedFields: {
      expression: '재료비 = Σ(단가 × 수량 × (1 + 로스율) × 환율보정계수)',
      description: '원자재 및 부자재의 합계를 산출합니다. 로스율 및 환율 보정을 반영합니다.',
      variables: ['단가', '수량', '로스율', '환율보정계수'],
    },
    status: 'pending',
    reason: 'HEAD_LINING 수입 원자재에 환율 보정계수 반영이 필요합니다.',
    createdAt: '2026-04-05T14:30:00',
  },
  {
    id: 'cr2',
    formulaId: 'f4',
    requesterId: 'user2',
    requesterName: '박검증',
    department: '견적2팀',
    taskName: 'DOOR_TRIM 견적검증',
    originalFormula: {
      id: 'f4', name: '제경비율', badge: 'rate',
      expression: '제경비율 = 제경비 / (재료비 + 가공비) × 100',
      description: '제경비의 비율을 산출합니다. 일반적 범위: 8~15%',
      variables: ['제경비', '재료비', '가공비'],
    },
    modifiedFields: {
      expression: '제경비율 = (제경비 + 물류비) / (재료비 + 가공비) × 100',
      variables: ['제경비', '물류비', '재료비', '가공비'],
    },
    status: 'approved',
    reason: 'DOOR_TRIM 해외 납품건 물류비를 제경비에 포함해야 합니다.',
    createdAt: '2026-04-03T09:15:00',
    reviewedAt: '2026-04-04T11:00:00',
    reviewerComment: '물류비 포함 타당, 해당 업무에 한해 승인합니다.',
    appliedScope: 'task',
  },
];

// ── localStorage 키 ──
const STORAGE_KEY_USER = 'cost-analysis-current-user';
const STORAGE_KEY_REQUESTS = 'cost-analysis-change-requests';

const loadUser = (): CurrentUser => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return userPresets[0]; // 기본: 관리자
};

const loadRequests = (): ChangeRequest[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_REQUESTS);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return initialRequests;
};

// ── Hook ──
export const useModelWorkflow = () => {
  const [currentUser, setCurrentUser] = useState<CurrentUser>(loadUser);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>(loadRequests);

  // localStorage 동기화
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(changeRequests));
  }, [changeRequests]);

  // 사용자 전환
  const switchUser = useCallback((userId: string) => {
    const user = userPresets.find(u => u.id === userId);
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
  const approveRequest = useCallback((requestId: string, comment: string, scope: AppliedScope) => {
    setChangeRequests(prev => prev.map(r =>
      r.id === requestId
        ? { ...r, status: 'approved' as const, reviewedAt: new Date().toISOString(), reviewerComment: comment, appliedScope: scope }
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
    return changeRequests.filter(r => r.formulaId === formulaId && r.status === 'pending').length;
  }, [changeRequests]);

  // 통계
  const stats = {
    total: changeRequests.length,
    pending: changeRequests.filter(r => r.status === 'pending').length,
    approved: changeRequests.filter(r => r.status === 'approved').length,
    rejected: changeRequests.filter(r => r.status === 'rejected').length,
  };

  return {
    currentUser,
    switchUser,
    isAdmin,
    changeRequests,
    submitChangeRequest,
    approveRequest,
    rejectRequest,
    getPendingCount,
    stats,
  };
};
