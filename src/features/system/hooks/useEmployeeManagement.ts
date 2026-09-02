/**
 * @fileoverview 사원관리 화면 상태/로직
 */
import { useCallback, useEffect, useState } from 'react';
import {
  getEmployees, changeEmployeeRole, bulkChangeRole, setEmployeeStatus, reapplyRuleForEmployee,
  getDepartments, getPositions,
} from '../services/employeeService';
import { getRoles } from '../services/roleService';
import { EMPLOYEE_PAGE_SIZE, MAX_BULK_ROLE_ASSIGN } from '../../../constants/system';
import type { Department, Employee, EmployeeFilter, EmployeeView, Position, Role } from '../types';

export const useEmployeeManagement = (actingEmployeeId: string) => {
  const [content, setContent] = useState<EmployeeView[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ open: boolean; severity: 'success' | 'error'; message: string }>({ open: false, severity: 'success', message: '' });

  const [filter, setFilter] = useState<EmployeeFilter>({});
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const loadMasters = useCallback(async () => {
    const [deptList, posList, roleList] = await Promise.all([getDepartments(), getPositions(), getRoles()]);
    setDepartments(deptList);
    setPositions(posList);
    setRoles(roleList);
  }, []);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getEmployees({ ...filter, page, size: EMPLOYEE_PAGE_SIZE });
      setContent(result.content);
      setTotalElements(result.totalElements);
    } catch {
      setError('사원 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => { loadMasters(); }, [loadMasters]);
  useEffect(() => { loadEmployees(); }, [loadEmployees]);

  const applyFilter = (next: EmployeeFilter) => {
    setFilter(next);
    setPage(0);
    setSelectedIds([]);
  };

  const resetFilter = () => applyFilter({});

  const changeRole = async (userId: number, roleId: number) => {
    try {
      await changeEmployeeRole(userId, roleId, actingEmployeeId);
      setToast({ open: true, severity: 'success', message: '권한이 변경되었습니다. (부여출처: 직접지정)' });
      await loadEmployees();
    } catch (e) {
      setToast({ open: true, severity: 'error', message: e instanceof Error ? e.message : '권한 변경에 실패했습니다.' });
    }
  };

  const bulkChange = async (roleId: number) => {
    if (selectedIds.length === 0) return;
    if (selectedIds.length > MAX_BULK_ROLE_ASSIGN) {
      setToast({ open: true, severity: 'error', message: `${MAX_BULK_ROLE_ASSIGN}명 이하로 선택하세요.` });
      return;
    }
    try {
      const result = await bulkChangeRole(selectedIds, roleId, actingEmployeeId);
      setToast({ open: true, severity: 'success', message: `${result.updatedCount}명의 권한이 일괄 변경되었습니다.` });
      setSelectedIds([]);
      await loadEmployees();
    } catch (e) {
      setToast({ open: true, severity: 'error', message: e instanceof Error ? e.message : '일괄 변경에 실패했습니다.' });
    }
  };

  const toggleStatus = async (userId: number, status: Employee['status']) => {
    try {
      await setEmployeeStatus(userId, status, actingEmployeeId);
      setToast({ open: true, severity: 'success', message: '상태가 변경되었습니다.' });
      await loadEmployees();
    } catch (e) {
      setToast({ open: true, severity: 'error', message: e instanceof Error ? e.message : '상태 변경에 실패했습니다.' });
    }
  };

  const reapplyRule = async (userId: number) => {
    try {
      await reapplyRuleForEmployee(userId);
      setToast({ open: true, severity: 'success', message: '기본권한 규칙이 재적용되었습니다.' });
      await loadEmployees();
    } catch (e) {
      setToast({ open: true, severity: 'error', message: e instanceof Error ? e.message : '재적용에 실패했습니다.' });
    }
  };

  return {
    content, totalElements, page, setPage,
    departments, positions, roles,
    loading, error, load: loadEmployees,
    filter, applyFilter, resetFilter,
    selectedIds, setSelectedIds,
    changeRole, bulkChange, toggleStatus, reapplyRule,
    toast, setToast,
  };
};
