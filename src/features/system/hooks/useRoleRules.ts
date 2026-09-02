/**
 * @fileoverview 권한관리 — 기본권한 규칙 탭 상태/로직
 */
import { useCallback, useEffect, useState } from 'react';
import {
  getRoleRules, createRoleRule, updateRoleRule, deleteRoleRule, simulateRoleRule, reapplyRoleRules, getRoles,
} from '../services/roleService';
import { getDepartments, getPositions } from '../services/employeeService';
import type { Department, DefaultRoleRule, DefaultRoleRuleView, Position, Role, RoleRuleSimulation } from '../types';

export const useRoleRules = () => {
  const [rules, setRules] = useState<DefaultRoleRuleView[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ open: boolean; severity: 'success' | 'error' | 'info'; message: string }>({ open: false, severity: 'success', message: '' });

  const [simDeptId, setSimDeptId] = useState<number | ''>('');
  const [simPosId, setSimPosId] = useState<number | ''>('');
  const [simResult, setSimResult] = useState<RoleRuleSimulation | null>(null);

  interface ReapplySample { employeeId: string; name: string; fromRoleCode: string; toRoleCode: string }
  const [reapplyPreview, setReapplyPreview] = useState<{ affectedCount: number; samples: ReapplySample[] } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ruleList, deptList, posList, roleList] = await Promise.all([
        getRoleRules(), getDepartments(), getPositions(), getRoles(),
      ]);
      setRules(ruleList);
      setDepartments(deptList);
      setPositions(posList);
      setRoles(roleList);
    } catch {
      setError('기본권한 규칙을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addRule = async (input: Omit<DefaultRoleRule, 'ruleId'>) => {
    await createRoleRule(input);
    await load();
  };

  const editRule = async (ruleId: number, patch: Partial<DefaultRoleRule>) => {
    await updateRoleRule(ruleId, patch);
    await load();
  };

  const removeRule = async (ruleId: number) => {
    await deleteRoleRule(ruleId);
    await load();
  };

  const runSimulation = async () => {
    const result = await simulateRoleRule(simDeptId === '' ? null : simDeptId, simPosId === '' ? null : simPosId);
    setSimResult(result);
  };

  const previewReapply = async () => {
    const result = await reapplyRoleRules(true);
    setReapplyPreview(result);
  };

  const confirmReapply = async () => {
    const result = await reapplyRoleRules(false);
    setReapplyPreview(null);
    setToast({ open: true, severity: 'success', message: `${result.affectedCount}명의 권한이 재적용되었습니다.` });
    await load();
  };

  return {
    rules, departments, positions, roles, loading, error, load,
    addRule, editRule, removeRule,
    simDeptId, setSimDeptId, simPosId, setSimPosId, simResult, runSimulation,
    reapplyPreview, setReapplyPreview, previewReapply, confirmReapply,
    toast, setToast,
  };
};
