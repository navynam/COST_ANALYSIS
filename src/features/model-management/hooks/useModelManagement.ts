import { useState, useEffect } from 'react';

export interface Formula {
  id: string;
  name: string;
  badge: 'core' | 'sub' | 'rate';
  expression: string;
  description: string;
  variables: string[];
}

export const badgeConfig = {
  core: { label: '핵심', color: '#003875', bg: '#e8f4fd' },
  sub: { label: '하위', color: '#2e7d32', bg: '#e8fde8' },
  rate: { label: '비율', color: '#e65100', bg: '#fff3e0' },
};

const initialFormulas: Formula[] = [
  {
    id: 'f1', name: '생산원가', badge: 'core',
    expression: '생산원가 = 재료비 + 가공비 + 제경비',
    description: '제품의 총 생산원가를 산출하는 핵심 수식입니다.',
    variables: ['재료비', '가공비', '제경비'],
  },
  {
    id: 'f2', name: '재료비 소계', badge: 'sub',
    expression: '재료비 = Σ(단가 × 수량 × (1 + 로스율))',
    description: '원자재 및 부자재의 합계를 산출합니다. 로스율을 반영합니다.',
    variables: ['단가', '수량', '로스율'],
  },
  {
    id: 'f3', name: '가공비 단가', badge: 'sub',
    expression: '가공비 = (설비감가상각 + 인건비) / 생산수량 × CT',
    description: '공정별 가공비 단가를 산출합니다. CT는 사이클타임(분)입니다.',
    variables: ['설비감가상각', '인건비', '생산수량', 'CT'],
  },
  {
    id: 'f4', name: '제경비율', badge: 'rate',
    expression: '제경비율 = 제경비 / (재료비 + 가공비) × 100',
    description: '제경비의 비율을 산출합니다. 일반적 범위: 8~15%',
    variables: ['제경비', '재료비', '가공비'],
  },
];

// 🔧 localStorage 키
const STORAGE_KEY = 'cost-analysis-formulas';

// 📦 localStorage에서 수식 데이터 로드
const loadFormulas = (): Formula[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.warn('localStorage 로드 실패:', error);
  }
  return initialFormulas; // 기본 데이터 반환
};

// 💾 localStorage에 수식 데이터 저장
const saveFormulas = (formulas: Formula[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formulas));
    console.log('📦 수식 데이터 저장됨:', formulas.length, '개');
  } catch (error) {
    console.warn('localStorage 저장 실패:', error);
  }
};

export const useModelManagement = () => {
  const [formulas, setFormulas] = useState<Formula[]>(loadFormulas);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editTarget, setEditTarget] = useState<Formula | null>(null);
  const [form, setForm] = useState({ name: '', badge: 'sub' as Formula['badge'], expression: '', description: '', variables: '' });
  const [toast, setToast] = useState<{ open: boolean; severity: 'success' | 'error' | 'info'; message: string }>({ open: false, severity: 'info', message: '' });
  const [lastAddedFormulaId, setLastAddedFormulaId] = useState<string>('');

  // 📦 formulas 변경 시 localStorage에 자동 저장
  useEffect(() => {
    saveFormulas(formulas);
  }, [formulas]);

  const openAdd = () => {
    setModalMode('add');
    setForm({ name: '', badge: 'sub', expression: '', description: '', variables: '' });
    setEditTarget(null);
    setModalOpen(true);
  };

  const openEdit = (f: Formula) => {
    setModalMode('edit');
    setEditTarget(f);
    setForm({ name: f.name, badge: f.badge, expression: f.expression, description: f.description, variables: f.variables.join(', ') });
    setModalOpen(true);
  };

  const handleSave = () => {
    const vars = form.variables.split(',').map(v => v.trim()).filter(Boolean);
    if (modalMode === 'add') {
      const newId = `f${Date.now()}`;
      setFormulas(prev => [...prev, { id: newId, name: form.name, badge: form.badge, expression: form.expression, description: form.description, variables: vars }]);
      setLastAddedFormulaId(newId); // 새로 추가된 수식 ID 저장
      setToast({ open: true, severity: 'success', message: '수식이 추가되었습니다.' });
    } else if (editTarget) {
      setFormulas(prev => prev.map(f => f.id === editTarget.id ? { ...f, name: form.name, badge: form.badge, expression: form.expression, description: form.description, variables: vars } : f));
      setToast({ open: true, severity: 'success', message: '수식이 수정되었습니다.' });
    }
    setModalOpen(false);
  };

  const handleDelete = (f: Formula) => {
    if (f.badge === 'core') {
      setToast({ open: true, severity: 'error', message: '핵심 수식은 삭제할 수 없습니다.' });
      return;
    }
    if (window.confirm('삭제하시겠습니까?')) {
      setFormulas(prev => prev.filter(item => item.id !== f.id));
      setToast({ open: true, severity: 'success', message: '수식이 삭제되었습니다.' });
    }
  };

  const clearLastAddedFormula = () => {
    setLastAddedFormulaId('');
  };

  return {
    formulas, modalOpen, setModalOpen,
    modalMode, editTarget, form, setForm, toast, setToast,
    openAdd, openEdit, handleSave, handleDelete,
    lastAddedFormulaId, clearLastAddedFormula,
  };
};
