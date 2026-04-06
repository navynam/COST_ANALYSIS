/**
 * @fileoverview 분석 페이지 서비스 레이어
 * @description localStorage 접근 및 데이터 로직을 hooks에서 분리
 */

import { excelData } from '../data/excelData';

// ── localStorage 키 ──
const PARSING_NOTES_KEY = 'parsing-notes';
const ANALYSIS_NOTES_KEY = 'analysis-notes';

// ── localStorage 접근 ──

/** 파싱 노트 목록 로드 */
export const loadParsingNotes = (): any[] => {
  try {
    return JSON.parse(localStorage.getItem(PARSING_NOTES_KEY) || '[]');
  } catch {
    return [];
  }
};

/** 분석 노트 목록 로드 */
export const loadAnalysisNotes = (): any[] => {
  try {
    return JSON.parse(localStorage.getItem(ANALYSIS_NOTES_KEY) || '[]');
  } catch {
    return [];
  }
};

// ── 데이터 계산 로직 ──

/** HEAD_LINING 관련 파싱 노트 + 분석 노트의 총 개수 계산 */
export const calculateTotalNotesCount = (): number => {
  const parsingNotes = loadParsingNotes();
  const analysisNotes = loadAnalysisNotes();

  const headLiningParsingNotes = parsingNotes.filter(
    (note: any) => note && note.fileName && note.fileName.includes('HEAD_LINING')
  );

  return headLiningParsingNotes.length + analysisNotes.length;
};

/** 수정된 셀 키 생성 */
export const buildCellKey = (groupId: string, rowIdx: number, field: string): string => {
  return `${groupId}-${rowIdx}-${field}`;
};

/** 해당 항목이 간접비(overhead) 그룹인지 확인 */
export const isOverhead = (groupId: string): boolean => groupId === 'overhead';

/** excelData에서 항목명에 해당하는 데이터가 있는지 확인 */
export const hasExcelData = (itemName: string): boolean => {
  const name = itemName.replace(' ⚠️', '');
  return excelData.some(row => row.cols.some((col: any) => col.text && col.text.includes(name)));
};

/** excelData에서 항목명에 해당하는 행 인덱스 조회 */
export const findExcelRowIndex = (itemName: string): number => {
  return excelData.findIndex(row =>
    row.cols.some((col: any) => col.text && col.text.includes(itemName.replace(' ⚠️', '')))
  );
};

// 향후 API 연동 시 확장 예정
/** 수정된 셀 데이터를 서버에 저장 (현재 mock) */
export const saveModifiedCells = async (modifiedCells: Record<string, string>): Promise<number> => {
  const count = Object.keys(modifiedCells).length;
  // TODO: 실제 API 연동 시 modifiedCells 데이터를 서버에 전송
  return count;
};
