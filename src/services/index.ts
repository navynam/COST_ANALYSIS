/**
 * 서비스 레이어 - 단일 진입점
 *
 * 모든 API 호출은 이 파일을 통해 import합니다.
 *
 * 사용법:
 *   import { authAPI, parsingAPI } from '../../services';
 *   import api from '../../services'; // 기본 axios 인스턴스
 *
 * 구성:
 *   api          - axios 기본 인스턴스 (baseURL: REACT_APP_API_URL)
 *   authAPI      - 로그인/로그아웃
 *   parsingAPI   - 파일 업로드 및 파싱
 *   mappingAPI   - 표준항목 매핑
 *   comparison   - 견적서 비교 (getComparison 등 개별 함수)
 *   quotation    - 견적서 CRUD (uploadQuotation, getQuotations 등)
 *   vendor       - 협력사 관리 (getVendors, createVendor)
 *   product      - 제품 관리 (getProducts, createProduct 등)
 */

// axios 인스턴스
export { default as api } from './api';

// 객체형 API 서비스
export { authAPI } from './auth';
export { parsingAPI } from './parsing';
export { mappingAPI } from './mapping';

// 함수형 API 서비스 (각 서비스 파일에 named export로 함수 제공)
export * from './comparisonApi';
export * from './quotationApi';
export * from './vendorApi';
export * from './productApi';

// 기본 내보내기(default export)도 유지 (기존 코드 호환)
export { default } from './api';
