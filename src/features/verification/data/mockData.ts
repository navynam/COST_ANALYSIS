import type { VerificationItem, ExcelCell } from '../types';

export const mockVerificationData: VerificationItem[] = [
  { id: '1', fieldName: '재료비', originalValue: '1,250,000', parsedValue: '125,000', confidence: 75, status: 'error', cellRef: 'B12', message: '콤마 인식 오류로 인한 값 차이', category: 'material_cost' },
  { id: '2', fieldName: '가공비', originalValue: '800,000', parsedValue: '800,000', confidence: 98, status: 'correct', cellRef: 'B15', category: 'processing_cost' },
  { id: '3', fieldName: '제경비', originalValue: '350,000', parsedValue: '350,000', confidence: 95, status: 'correct', cellRef: 'B18', category: 'overhead_cost' },
  { id: '4', fieldName: '합계', originalValue: '2,400,000', parsedValue: '24,000', confidence: 45, status: 'error', cellRef: 'B21', message: '계산 검증: 1,250,000 + 800,000 + 350,000 = 2,400,000', category: 'total' },
  { id: '5', fieldName: '업체명', originalValue: '㈜대한제조', parsedValue: '대한제조', confidence: 82, status: 'warning', cellRef: 'C5', message: '법인 표기 누락', category: 'metadata' },
  { id: '6', fieldName: '견적일자', originalValue: '2024.02.15', parsedValue: '', confidence: 35, status: 'error', cellRef: 'C6', message: '날짜 형식 인식 실패', category: 'metadata' },
  { id: '7', fieldName: '단위중량', originalValue: '0.45kg', parsedValue: '0.45', confidence: 88, status: 'warning', cellRef: 'D8', message: '단위 정보 누락', category: 'material_cost' },
];

export const mockExcelData: ExcelCell[] = [
  { row: 12, col: 'B', field: '재료비', value: '1,250,000', type: 'number' },
  { row: 15, col: 'B', field: '가공비', value: '800,000', type: 'number' },
  { row: 18, col: 'B', field: '제경비', value: '350,000', type: 'number' },
  { row: 21, col: 'B', field: '합계', value: '2,400,000', type: 'number' },
  { row: 5, col: 'C', field: '업체명', value: '㈜대한제조', type: 'text' },
  { row: 6, col: 'C', field: '견적일자', value: '2024.02.15', type: 'date' },
  { row: 8, col: 'D', field: '단위중량', value: '0.45kg', type: 'text' },
];

export const statusColor = {
  correct: { bg: '#e8f5e8', border: '#4caf50', text: '#2e7d32' },
  warning: { bg: '#fff8e1', border: '#ff9800', text: '#ef6c00' },
  error: { bg: '#ffebee', border: '#f44336', text: '#c62828' },
};

export const confidenceColor = (confidence: number) => {
  if (confidence >= 90) return '#4caf50';
  if (confidence >= 70) return '#ff9800';
  return '#f44336';
};
