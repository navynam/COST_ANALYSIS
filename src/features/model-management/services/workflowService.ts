/**
 * @fileoverview 모델 변경 워크플로우 서비스 레이어
 * @description 변경 요청 데이터의 localStorage 접근 및 통계 계산
 */

import apiClient from '../../../shared/api/apiClient';
import { USE_API } from '../../../shared/api/config';
import type { CurrentUser, ChangeRequest } from '../hooks/useModelWorkflow';
import { userPresets } from '../hooks/useModelWorkflow';

// ── localStorage 키 ──
const STORAGE_KEY_USER = 'cost-analysis-current-user';
const STORAGE_KEY_REQUESTS = 'cost-analysis-change-requests';

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
    reviewerComment: '물류비 포함 타당, 견적2팀에 한해 승인합니다.',
    approvedDepartments: ['견적2팀'],
  },
];

// ── localStorage 접근 ──

/** localStorage에서 현재 사용자 로드 */
export const loadUser = (): CurrentUser => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return userPresets[0]; // 기본: 관리자
};

/** localStorage에서 변경 요청 목록 로드 */
export const loadRequests = (): ChangeRequest[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_REQUESTS);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return initialRequests;
};

/** localStorage에 현재 사용자 저장 */
export const saveUser = (user: CurrentUser): void => {
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
};

/** localStorage에 변경 요청 목록 저장 */
export const saveRequests = (requests: ChangeRequest[]): void => {
  localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(requests));
};

// ── 데이터 계산 로직 ──

/** 변경 요청 통계 계산 */
export const calculateStats = (requests: ChangeRequest[]) => ({
  total: requests.length,
  pending: requests.filter(r => r.status === 'pending').length,
  approved: requests.filter(r => r.status === 'approved').length,
  rejected: requests.filter(r => r.status === 'rejected').length,
});

/** 특정 수식에 대한 대기 중인 요청 수 */
export const countPendingForFormula = (requests: ChangeRequest[], formulaId: string): number => {
  return requests.filter(r => r.formulaId === formulaId && r.status === 'pending').length;
};

/** 특정 수식에 대한 요청 목록 */
export const getRequestsForFormula = (requests: ChangeRequest[], formulaId: string): ChangeRequest[] => {
  return requests.filter(r => r.formulaId === formulaId);
};

/** 특정 사용자가 특정 수식에 대기 중인 요청이 있는지 */
export const hasPendingByUser = (requests: ChangeRequest[], formulaId: string, userId: string): boolean => {
  return requests.some(r => r.formulaId === formulaId && r.requesterId === userId && r.status === 'pending');
};

/** 사용자 프리셋에서 userId로 사용자 조회 */
export const findUserPreset = (userId: string): CurrentUser | undefined => {
  return userPresets.find(u => u.id === userId);
};

// ── API 호출 함수 ──

/** 변경 요청 목록 API 조회 */
export const fetchChangeRequestsApi = async (): Promise<ChangeRequest[]> => {
  const res = await apiClient.get('/models/change-requests');
  return res.data.data || res.data;
};

/** 변경 요청 제출 API */
export const submitChangeRequestApi = async (request: Omit<ChangeRequest, 'id' | 'status' | 'createdAt'>): Promise<ChangeRequest> => {
  const res = await apiClient.post('/models/change-requests', request);
  return res.data.data || res.data;
};

/** 변경 요청 승인 API */
export const approveRequestApi = async (id: string, comment?: string, departments?: string[]): Promise<ChangeRequest> => {
  const res = await apiClient.put(`/models/change-requests/${id}/approve`, { comment, departments });
  return res.data.data || res.data;
};

/** 변경 요청 반려 API */
export const rejectRequestApi = async (id: string, comment?: string): Promise<ChangeRequest> => {
  const res = await apiClient.put(`/models/change-requests/${id}/reject`, { comment });
  return res.data.data || res.data;
};

/** 변경 요청 취소 API */
export const cancelRequestApi = async (id: string): Promise<void> => {
  await apiClient.delete(`/models/change-requests/${id}`);
};

// ── 통합 함수 ──

/** 변경 요청 목록 조회 (API 우선, 실패 시 localStorage fallback) */
export const getChangeRequests = async (): Promise<ChangeRequest[]> => {
  if (USE_API) {
    try {
      return await fetchChangeRequestsApi();
    } catch {
      return loadRequests();
    }
  }
  return loadRequests();
};

/** 변경 요청 제출 (API 우선, 실패 시 localStorage fallback) */
export const submitChangeRequest = async (request: Omit<ChangeRequest, 'id' | 'status' | 'createdAt'>): Promise<ChangeRequest> => {
  if (USE_API) {
    try {
      return await submitChangeRequestApi(request);
    } catch {
      const newRequest: ChangeRequest = {
        ...request,
        id: `cr${Date.now()}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
      } as ChangeRequest;
      const requests = loadRequests();
      saveRequests([newRequest, ...requests]);
      return newRequest;
    }
  }
  const newRequest: ChangeRequest = {
    ...request,
    id: `cr${Date.now()}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  } as ChangeRequest;
  const requests = loadRequests();
  saveRequests([newRequest, ...requests]);
  return newRequest;
};

/** 변경 요청 승인 (API 우선, 실패 시 localStorage fallback) */
export const approveRequest = async (id: string, comment?: string, departments?: string[]): Promise<ChangeRequest> => {
  if (USE_API) {
    try {
      return await approveRequestApi(id, comment, departments);
    } catch {
      const requests = loadRequests();
      const updated = requests.map(r =>
        r.id === id ? { ...r, status: 'approved' as const, reviewerComment: comment, approvedDepartments: departments, reviewedAt: new Date().toISOString() } : r
      );
      saveRequests(updated);
      return updated.find(r => r.id === id)!;
    }
  }
  const requests = loadRequests();
  const updated = requests.map(r =>
    r.id === id ? { ...r, status: 'approved' as const, reviewerComment: comment, approvedDepartments: departments, reviewedAt: new Date().toISOString() } : r
  );
  saveRequests(updated);
  return updated.find(r => r.id === id)!;
};

/** 변경 요청 반려 (API 우선, 실패 시 localStorage fallback) */
export const rejectRequest = async (id: string, comment?: string): Promise<ChangeRequest> => {
  if (USE_API) {
    try {
      return await rejectRequestApi(id, comment);
    } catch {
      const requests = loadRequests();
      const updated = requests.map(r =>
        r.id === id ? { ...r, status: 'rejected' as const, reviewerComment: comment, reviewedAt: new Date().toISOString() } : r
      );
      saveRequests(updated);
      return updated.find(r => r.id === id)!;
    }
  }
  const requests = loadRequests();
  const updated = requests.map(r =>
    r.id === id ? { ...r, status: 'rejected' as const, reviewerComment: comment, reviewedAt: new Date().toISOString() } : r
  );
  saveRequests(updated);
  return updated.find(r => r.id === id)!;
};

/** 변경 요청 취소 (API 우선, 실패 시 localStorage fallback) */
export const cancelRequest = async (id: string): Promise<void> => {
  if (USE_API) {
    try {
      return await cancelRequestApi(id);
    } catch {
      const requests = loadRequests();
      saveRequests(requests.filter(r => r.id !== id));
      return;
    }
  }
  const requests = loadRequests();
  saveRequests(requests.filter(r => r.id !== id));
};
