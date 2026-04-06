import { useState, useEffect } from 'react';
import {
  loadFormulas,
  saveFormulas,
  parseVariables,
  normalizeDepartments,
  isCoreFormula,
  generateFormulaId,
} from '../services/modelService';

// ── 부서 목록 ──
export const ALL_DEPARTMENTS = ['전체', '원가관리팀', '견적1팀', '견적2팀', '견적3팀', '구매팀', '품질팀'];

export interface Formula {
  id: string;
  name: string;
  badge: 'core' | 'sub' | 'rate';
  expression: string;
  description: string;
  variables: string[];
  departments?: string[]; // 적용 부서 목록 ('전체' 또는 개별 부서)
}

export const badgeConfig = {
  core: { label: '핵심', color: '#003875', bg: '#e8f4fd' },
  sub: { label: '하위', color: '#2e7d32', bg: '#e8fde8' },
  rate: { label: '비율', color: '#e65100', bg: '#fff3e0' },
};

export const useModelManagement = () => {
  const [formulas, setFormulas] = useState<Formula[]>(loadFormulas);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editTarget, setEditTarget] = useState<Formula | null>(null);
  const [form, setForm] = useState({ name: '', badge: 'sub' as Formula['badge'], expression: '', description: '', variables: '', departments: ['전체'] as string[] });
  const [toast, setToast] = useState<{ open: boolean; severity: 'success' | 'error' | 'info'; message: string }>({ open: false, severity: 'info', message: '' });
  const [lastAddedFormulaId, setLastAddedFormulaId] = useState<string>('');

  // 📦 formulas 변경 시 localStorage에 자동 저장
  useEffect(() => {
    saveFormulas(formulas);
  }, [formulas]);

  const openAdd = () => {
    setModalMode('add');
    setForm({ name: '', badge: 'sub', expression: '', description: '', variables: '', departments: ['전체'] });
    setEditTarget(null);
    setModalOpen(true);
  };

  const openEdit = (f: Formula) => {
    setModalMode('edit');
    setEditTarget(f);
    setForm({ name: f.name, badge: f.badge, expression: f.expression, description: f.description, variables: f.variables.join(', '), departments: f.departments || ['전체'] });
    setModalOpen(true);
  };

  const handleSave = () => {
    const vars = parseVariables(form.variables);
    const depts = normalizeDepartments(form.departments);
    if (modalMode === 'add') {
      const newId = generateFormulaId();
      setFormulas(prev => [...prev, { id: newId, name: form.name, badge: form.badge, expression: form.expression, description: form.description, variables: vars, departments: depts }]);
      setLastAddedFormulaId(newId);
      setToast({ open: true, severity: 'success', message: '수식이 추가되었습니다.' });
    } else if (editTarget) {
      setFormulas(prev => prev.map(f => f.id === editTarget.id ? { ...f, name: form.name, badge: form.badge, expression: form.expression, description: form.description, variables: vars, departments: depts } : f));
      setToast({ open: true, severity: 'success', message: '수식이 수정되었습니다.' });
    }
    setModalOpen(false);
  };

  const handleDelete = (f: Formula) => {
    if (isCoreFormula(f)) {
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

  // 변경 요청 승인 시 수식에 직접 반영
  const applyChanges = (formulaId: string, modifiedFields: Partial<Formula>) => {
    // 새 수식 추가 요청인 경우 (id가 'new_'로 시작)
    if (formulaId.startsWith('new_')) {
      const newId = generateFormulaId();
      const newFormula: Formula = {
        id: newId,
        name: modifiedFields.name || '새 수식',
        badge: modifiedFields.badge || 'sub',
        expression: modifiedFields.expression || '',
        description: modifiedFields.description || '',
        variables: modifiedFields.variables || [],
        departments: modifiedFields.departments || ['전체'],
      };
      setFormulas(prev => [...prev, newFormula]);
      setLastAddedFormulaId(newId);
    } else {
      // 기존 수식 수정
      setFormulas(prev => prev.map(f =>
        f.id === formulaId ? { ...f, ...modifiedFields } : f
      ));
    }
  };

  return {
    formulas, modalOpen, setModalOpen,
    modalMode, editTarget, form, setForm, toast, setToast,
    openAdd, openEdit, handleSave, handleDelete,
    lastAddedFormulaId, clearLastAddedFormula, applyChanges,
  };
};
