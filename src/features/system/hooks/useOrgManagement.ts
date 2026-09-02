/**
 * @fileoverview 조직관리(부서/직위 마스터) 상태/로직 (D5)
 */
import { useCallback, useEffect, useState } from 'react';
import {
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getPositions, createPosition, updatePosition, deletePosition,
} from '../services/employeeService';
import type { Department, Position } from '../types';

export const useOrgManagement = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ open: boolean; severity: 'success' | 'error'; message: string }>({ open: false, severity: 'success', message: '' });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [deptList, posList] = await Promise.all([getDepartments(), getPositions()]);
      setDepartments(deptList);
      setPositions(posList);
    } catch {
      setError('조직 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const runOrError = async (fn: () => Promise<void>, successMessage: string) => {
    try {
      await fn();
      setToast({ open: true, severity: 'success', message: successMessage });
      await load();
    } catch (e) {
      setToast({ open: true, severity: 'error', message: e instanceof Error ? e.message : '처리에 실패했습니다.' });
    }
  };

  const addDepartment = (input: Omit<Department, 'departmentId'>) => runOrError(async () => { await createDepartment(input); }, '부서가 등록되었습니다.');
  const editDepartment = (id: number, patch: Partial<Department>) => runOrError(async () => { await updateDepartment(id, patch); }, '부서 정보가 저장되었습니다.');
  const removeDepartment = (id: number) => runOrError(async () => { await deleteDepartment(id); }, '부서가 삭제되었습니다.');

  const addPosition = (input: Omit<Position, 'positionId'>) => runOrError(async () => { await createPosition(input); }, '직위가 등록되었습니다.');
  const editPosition = (id: number, patch: Partial<Position>) => runOrError(async () => { await updatePosition(id, patch); }, '직위 정보가 저장되었습니다.');
  const removePosition = (id: number) => runOrError(async () => { await deletePosition(id); }, '직위가 삭제되었습니다.');

  return {
    departments, positions, loading, error, load,
    addDepartment, editDepartment, removeDepartment,
    addPosition, editPosition, removePosition,
    toast, setToast,
  };
};
