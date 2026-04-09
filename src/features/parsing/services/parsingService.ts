/**
 * @fileoverview 파싱 페이지 서비스 레이어
 * @description 파일 필터링, 정렬, 카운트 등 순수 데이터 로직
 */

import apiClient from '../../../shared/api/apiClient';
import { USE_API } from '../../../shared/api/config';
import type { FileItem, FileStatus, SearchFilters, SortField, SortDirection } from '../types';

// ── 데이터 필터 및 정렬 로직 ──

/** 파일 목록을 필터 조건과 검색 쿼리에 따라 필터링 */
export const filterFiles = (
  files: FileItem[],
  filter: 'all' | FileStatus,
  searchQuery: string,
  searchFilters: SearchFilters
): FileItem[] => {
  return files.filter(f => {
    if (filter !== 'all' && f.status !== filter) return false;
    if (searchQuery && !f.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (searchFilters.documentName && !f.name.toLowerCase().includes(searchFilters.documentName.toLowerCase())) return false;
    if (searchFilters.uploader && !f.uploader?.toLowerCase().includes(searchFilters.uploader.toLowerCase())) return false;
    if (searchFilters.department && !f.department?.toLowerCase().includes(searchFilters.department.toLowerCase())) return false;
    if (searchFilters.dateFrom && f.uploadDate < searchFilters.dateFrom) return false;
    if (searchFilters.dateTo && f.uploadDate > searchFilters.dateTo) return false;
    return true;
  });
};

/** 파일 목록을 필드 기준으로 정렬 */
export const sortFiles = (
  files: FileItem[],
  sortField: SortField | null,
  sortDirection: SortDirection
): FileItem[] => {
  if (!sortField) return files;

  return [...files].sort((a, b) => {
    const aVal: any = a[sortField] ?? '';
    const bVal: any = b[sortField] ?? '';
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
};

/** 상태별 파일 개수 계산 */
export const calculateCounts = (files: FileItem[]) => ({
  all: files.length,
  extracting: files.filter(f => f.status === 'extracting').length,
  verifying: files.filter(f => f.status === 'verifying').length,
  verified: files.filter(f => f.status === 'verified').length,
  analyzing: files.filter(f => f.status === 'analyzing').length,
  inAnalysis: files.filter(f => f.status === 'inAnalysis').length,
  analyzed: files.filter(f => f.status === 'analyzed').length,
  failed: files.filter(f => f.status === 'failed').length,
});

/** 검색 필터가 활성화되어 있는지 확인 */
export const isSearchActive = (searchFilters: SearchFilters): boolean => {
  return Object.values(searchFilters).some(v => v.trim() !== '');
};

// 향후 API 연동 시 확장 예정
/** 파일 업로드 처리 (현재 mock - 향후 API 전환) */
export const uploadFiles = async (_files: File[]): Promise<void> => {
  // TODO: 실제 API 연동 시 서버에 파일 업로드
};

// ── API 호출 함수 ──

/** 견적서 목록 API 조회 */
export const fetchQuotationsApi = async (filters?: Record<string, string>): Promise<FileItem[]> => {
  const res = await apiClient.get('/quotations', { params: filters });
  return res.data.data || res.data;
};

/** 파일 업로드 API */
export const uploadFilesApi = async (files: File[]): Promise<void> => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  await apiClient.post('/quotations/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// ── 통합 함수 ──

/** 견적서 목록 조회 (API 우선, 실패 시 빈 배열 반환) */
export const fetchQuotations = async (filters?: Record<string, string>): Promise<FileItem[]> => {
  if (USE_API) {
    try {
      return await fetchQuotationsApi(filters);
    } catch {
      return []; // fallback - 로컬 데이터는 호출 측에서 관리
    }
  }
  return [];
};

/** 파일 업로드 통합 (API 우선, 실패 시 로컬 mock) */
export const uploadQuotationFiles = async (files: File[]): Promise<void> => {
  if (USE_API) {
    try {
      return await uploadFilesApi(files);
    } catch {
      return uploadFiles(files);
    }
  }
  return uploadFiles(files);
};
