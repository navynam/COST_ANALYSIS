/**
 * @fileoverview 매핑 API 서비스
 * @description 자동 매핑 실행, 결과 조회, 항목 수정 등
 */
import { mappingAxios } from './api';

export const mappingAPI = {
  /** 자동 매핑 실행 */
  autoMap: (estimateId: number) =>
    mappingAxios.post(`/api/mapping/auto-map/${estimateId}`),

  /** 매핑 결과 조회 */
  getMapping: (estimateId: number) =>
    mappingAxios.get(`/api/mapping/${estimateId}`),

  /** 매핑 항목 수동 수정 */
  updateItem: (estimateId: number, itemIndex: number, data: { confirmed_name: string; category?: string }) =>
    mappingAxios.put(`/api/mapping/${estimateId}/item/${itemIndex}`, data),
};
