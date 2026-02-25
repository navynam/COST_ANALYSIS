/**
 * @fileoverview 매핑 관련 타입 정의
 * @description 표준항목 매핑, 유사도 매칭 결과 등에 사용되는 타입
 */

/** 매핑 결과 아이템 */
export interface MappingItem {
  item_index: number;
  original_name: string;
  matched_name: string;
  category: string;
  score: number;
  status: string;
  confirmed: boolean;
  confirmed_name: string | null;
}

/** 매핑 요약 정보 */
export interface MappingSummary {
  total: number;
  auto_mapped: number;
  needs_review: number;
  manual: number;
}
