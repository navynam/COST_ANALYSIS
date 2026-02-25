/**
 * @fileoverview 파싱 API 서비스
 * @description 견적서 업로드, 목록 조회, 상세 조회, 삭제 등
 */
import { baseApi } from './api';

export const parsingAPI = {
  /** 견적서 파일 업로드 및 파싱 */
  uploadEstimate: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return baseApi.post('/api/parsing/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /** 견적서 목록 조회 (페이지네이션, 필터 지원) */
  getEstimates: (params: { page?: number; size?: number; status?: string; search?: string }) =>
    baseApi.get('/api/parsing/list', { params }),

  /** 견적서 상세 조회 */
  getEstimateDetail: (id: number) =>
    baseApi.get(`/api/parsing/${id}`),

  /** 견적서 단건 삭제 */
  deleteEstimate: (id: number) =>
    baseApi.delete(`/api/parsing/${id}`),

  /** 견적서 일괄 삭제 */
  batchDeleteEstimates: (ids: number[]) =>
    baseApi.post('/api/parsing/batch-delete', { ids }),
};
