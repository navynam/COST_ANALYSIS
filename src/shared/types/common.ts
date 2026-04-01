/**
 * 🔧 공통 타입 정의
 * 
 * @description 프로젝트 전반에서 사용되는 공통 데이터 타입들을 정의합니다.
 * @author PM 단무지
 * @since 2026-03-30
 */

/**
 * 견적서 항목의 상태
 */
export type ItemStatus = 'normal' | 'warning' | 'error' | 'anomaly';

/**
 * 견적서 카테고리
 */
export type CostCategory = 'material_cost' | 'processing_cost' | 'overhead_cost' | 'total' | 'metadata';

/**
 * 견적서 기본 정보
 */
export interface QuotationMetadata {
  /** E.O. 번호 */
  coNumber: string;
  /** 품번 */
  partNumber: string;
  /** 품명 */
  partName: string;
  /** 협력사명 */
  supplier: string;
  /** 담당자 */
  manager: string;
  /** 견적일자 */
  date?: string;
}

/**
 * 비용 항목 데이터
 */
export interface CostItem {
  id: string;
  /** 항목명 */
  name: string;
  /** 카테고리 */
  category: string;
  /** 규격 */
  spec?: string;
  /** 단위 */
  unit?: string;
  /** 수량 */
  qty?: number | string;
  /** 단가 */
  unitPrice?: string | number;
  /** 금액 */
  amount: string | number;
  /** 비율 */
  ratio: string;
  /** AI 신뢰도 (0-100) */
  confidence: number;
  /** 상태 */
  status: ItemStatus;
  /** 이상치 감지 이유 */
  anomalyReason?: string;
  /** 셀 참조 (Excel) */
  cellRef?: string;
}

/**
 * 비용 그룹 (재료비, 가공비, 제경비)
 */
export interface CostGroup {
  id: string;
  /** 그룹 아이콘 */
  icon: string;
  /** 아이콘 배경색 */
  iconBg: string;
  /** 아이콘 색상 */
  iconColor: string;
  /** 그룹 제목 */
  title: string;
  /** 총 금액 */
  totalAmount: string;
  /** 총 비율 */
  totalPct: string;
  /** 이상치 개수 */
  anomalyCount: number;
  /** 두 번째 컬럼 헤더 */
  secondColHeader: string;
  /** 항목 목록 */
  items: CostItem[];
}

/**
 * 견적서 정보
 */
export interface Quotation {
  id: string;
  /** 협력사명 */
  vendor: string;
  /** 견적일자 */
  date: string;
  /** 라벨 (표시용) */
  label?: string;
}

/**
 * 제품 정보
 */
export interface Product {
  id: string;
  /** 제품명 */
  name: string;
  /** 재질 */
  material: string;
  /** 견적서 개수 */
  quotationCount: number;
}

/**
 * 셀 데이터 (수정 추적용)
 */
export interface CellData {
  /** 값 */
  value: string | number;
  /** 셀 참조 */
  cell: string;
  /** 원본값 */
  originalValue?: string | number;
  /** 수정 여부 */
  isModified?: boolean;
  /** 수정자 */
  modifiedBy?: string;
  /** 수정 시간 */
  modifiedAt?: string;
}

/**
 * 팝오버 앵커 정보
 */
export interface PopoverAnchor<T = any> {
  /** 앵커 엘리먼트 */
  anchorEl: HTMLElement;
  /** 추가 데이터 */
  data?: T;
}