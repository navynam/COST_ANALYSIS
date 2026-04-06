/**
 * @fileoverview 모델 관리 서비스 레이어
 * @description 수식 데이터의 localStorage 접근 및 데이터 변환 로직
 */

import type { Formula } from '../hooks/useModelManagement';

// ── localStorage 키 ──
const STORAGE_KEY = 'cost-analysis-formulas';

// ── 초기 데이터 ──
const initialFormulas: Formula[] = [
  {
    id: 'f1', name: '생산원가', badge: 'core',
    expression: '생산원가 = 재료비 + 가공비 + 제경비',
    description: '제품의 총 생산원가를 산출하는 핵심 수식입니다.',
    variables: ['재료비', '가공비', '제경비'],
    departments: ['전체'],
  },
  {
    id: 'f2', name: '재료비 소계', badge: 'sub',
    expression: '재료비 = Σ(단가 × 수량 × (1 + 로스율))',
    description: '원자재 및 부자재의 합계를 산출합니다. 로스율을 반영합니다.',
    variables: ['단가', '수량', '로스율'],
    departments: ['전체'],
  },
  {
    id: 'f3', name: '가공비 단가', badge: 'sub',
    expression: '가공비 = (설비감가상각 + 인건비) / 생산수량 × CT',
    description: '공정별 가공비 단가를 산출합니다. CT는 사이클타임(분)입니다.',
    variables: ['설비감가상각', '인건비', '생산수량', 'CT'],
    departments: ['전체'],
  },
  {
    id: 'f4', name: '제경비율', badge: 'rate',
    expression: '제경비율 = 제경비 / (재료비 + 가공비) × 100',
    description: '제경비의 비율을 산출합니다. 일반적 범위: 8~15%',
    variables: ['제경비', '재료비', '가공비'],
    departments: ['견적1팀', '견적2팀'],
  },
];

// ── localStorage 접근 ──

/** localStorage에서 수식 데이터 로드 (departments 마이그레이션 포함) */
export const loadFormulas = (): Formula[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed: Formula[] = JSON.parse(saved);
      return parsed.map(f => ({
        ...f,
        departments: f.departments || initialFormulas.find(init => init.id === f.id)?.departments || ['전체'],
      }));
    }
  } catch (error) {
    console.warn('localStorage 로드 실패:', error);
  }
  return initialFormulas;
};

/** localStorage에 수식 데이터 저장 */
export const saveFormulas = (formulas: Formula[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formulas));
    console.log('📦 수식 데이터 저장됨:', formulas.length, '개');
  } catch (error) {
    console.warn('localStorage 저장 실패:', error);
  }
};

// ── 데이터 변환 로직 ──

/** 쉼표 구분 문자열을 변수 배열로 변환 */
export const parseVariables = (variablesStr: string): string[] => {
  return variablesStr.split(',').map(v => v.trim()).filter(Boolean);
};

/** 부서 목록 정규화 (빈 배열이면 ['전체'] 반환) */
export const normalizeDepartments = (departments: string[]): string[] => {
  return departments.length > 0 ? departments : ['전체'];
};

/** 핵심 수식 여부 확인 (삭제 불가) */
export const isCoreFormula = (formula: Formula): boolean => {
  return formula.badge === 'core';
};

/** 새 수식 ID 생성 */
export const generateFormulaId = (): string => {
  return `f${Date.now()}`;
};
