/**
 * @fileoverview 권한관리 화면 (`/system/roles`, SYS_ROLE)
 * @description 권한 목록 + 메뉴 × 5액션 매트릭스(탭 A), 기본권한 규칙(탭 B).
 *   이번 구현의 핵심 화면 — 매트릭스 편집/저장/diff 안내/낙관적 잠금까지 지원한다.
 */
import React, { useState } from 'react';
import {
  Box, Paper, Typography, Tabs, Tab, List, ListItemButton, ListItemText, Chip, Button,
  Table, TableHead, TableRow, TableCell, TableBody, Checkbox, Skeleton, Snackbar, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Tooltip, MenuItem,
} from '@mui/material';
import { Add, ContentCopy, Delete, Save, Refresh, PlayArrow } from '@mui/icons-material';
import { useRoleManagement } from './hooks/useRoleManagement';
import { useRoleRules } from './hooks/useRoleRules';
import { usePermission } from '../auth/usePermission';
import { ACTION_LABELS } from '../../constants/system';
import type { ActionCode, DefaultRoleRule } from './types';

const ALL_ACTIONS: ActionCode[] = ['R', 'C', 'U', 'D', 'A'];

const RoleManagementPage: React.FC = () => {
  const [tab, setTab] = useState(0);
  const { canCreate, canUpdate, canDelete } = usePermission('SYS_ROLE');

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>권한관리</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          권한별 메뉴 × 조회/등록/수정/삭제/승인 매트릭스를 관리합니다.
        </Typography>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="권한 목록 · 매트릭스" sx={{ textTransform: 'none', fontWeight: 600 }} />
        <Tab label="기본권한 규칙" sx={{ textTransform: 'none', fontWeight: 600 }} />
      </Tabs>

      {tab === 0
        ? <MatrixTab canCreate={canCreate} canUpdate={canUpdate} canDelete={canDelete} />
        : <RulesTab canCreate={canCreate} canUpdate={canUpdate} canDelete={canDelete} />}
    </Box>
  );
};

// ── 탭 A: 권한 목록 · 매트릭스 ──
const MatrixTab: React.FC<{ canCreate: boolean; canUpdate: boolean; canDelete: boolean }> = ({ canCreate, canUpdate, canDelete }) => {
  const {
    roles, menus, loading, error, load,
    selectedRoleId, setSelectedRoleId, selectedRole,
    matrixRows, matrixLoading, dirty,
    toggleCell, toggleColumn, toggleRow, saveMatrix, saving,
    addRole, editRole, removeRole, duplicateRole,
    toast, setToast,
  } = useRoleManagement();

  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ roleCode: '', roleName: '', description: '' });
  const [copyOpen, setCopyOpen] = useState(false);
  const [copyForm, setCopyForm] = useState({ roleCode: '', roleName: '' });
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ roleName: '', description: '' });
  const [confirmDelete, setConfirmDelete] = useState(false);

  const rowMenu = (menuId: number) => menus.find(m => m.menuId === menuId);

  const handleAddRole = async () => {
    try {
      await addRole(addForm);
      setAddOpen(false);
      setAddForm({ roleCode: '', roleName: '', description: '' });
      setToast({ open: true, severity: 'success', message: '권한이 추가되었습니다.' });
    } catch (e) {
      setToast({ open: true, severity: 'error', message: e instanceof Error ? e.message : '추가에 실패했습니다.' });
    }
  };

  const handleCopyRole = async () => {
    if (!selectedRoleId) return;
    try {
      await duplicateRole(selectedRoleId, copyForm.roleCode, copyForm.roleName);
      setCopyOpen(false);
      setCopyForm({ roleCode: '', roleName: '' });
      setToast({ open: true, severity: 'success', message: '권한이 복제되었습니다.' });
    } catch (e) {
      setToast({ open: true, severity: 'error', message: e instanceof Error ? e.message : '복제에 실패했습니다.' });
    }
  };

  const openEdit = () => {
    if (!selectedRole) return;
    setEditForm({ roleName: selectedRole.roleName, description: selectedRole.description || '' });
    setEditOpen(true);
  };

  const handleEditRole = async () => {
    if (!selectedRoleId) return;
    try {
      await editRole(selectedRoleId, editForm);
      setEditOpen(false);
      setToast({ open: true, severity: 'success', message: '권한 정보가 저장되었습니다.' });
    } catch (e) {
      setToast({ open: true, severity: 'error', message: e instanceof Error ? e.message : '저장에 실패했습니다.' });
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRoleId) return;
    try {
      await removeRole(selectedRoleId);
      setConfirmDelete(false);
      setToast({ open: true, severity: 'success', message: '권한이 삭제되었습니다.' });
    } catch (e) {
      setConfirmDelete(false);
      setToast({ open: true, severity: 'error', message: e instanceof Error ? e.message : '삭제에 실패했습니다.' });
    }
  };

  if (error) {
    return (
      <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
        <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
        <Button variant="outlined" onClick={load}>다시 시도</Button>
      </Paper>
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 3 }}>
      {/* 좌측: 권한 목록 */}
      <Paper sx={{ width: 300, p: 2, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" fontWeight={700}>권한 목록</Typography>
          {canCreate && (
            <Button size="small" startIcon={<Add sx={{ fontSize: 16 }} />} onClick={() => setAddOpen(true)}>추가</Button>
          )}
        </Box>
        {loading ? (
          <Skeleton variant="rectangular" height={200} />
        ) : roles.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography color="text.secondary" sx={{ mb: 1 }}>등록된 권한이 없습니다.</Typography>
            {canCreate && <Button size="small" variant="outlined" onClick={() => setAddOpen(true)}>권한 추가</Button>}
          </Box>
        ) : (
          <List dense>
            {roles.map(r => (
              <ListItemButton key={r.roleId} selected={r.roleId === selectedRoleId} onClick={() => setSelectedRoleId(r.roleId)}
                sx={{ borderRadius: 1, mb: 0.5 }}>
                <ListItemText
                  primary={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{r.roleName}</Typography>
                    {r.systemRoleYn && <Chip label="예약" size="small" sx={{ fontSize: 9, height: 16, bgcolor: '#e3f2fd', color: '#1565c0' }} />}
                  </Box>}
                  secondary={<Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{r.roleCode} · {r.assignedCount}명</Typography>}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Paper>

      {/* 우측: 매트릭스 */}
      <Paper sx={{ flex: 1, p: 3, borderRadius: 2, overflow: 'auto' }}>
        {!selectedRole ? (
          <Typography color="text.secondary">좌측에서 권한을 선택하세요.</Typography>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>{selectedRole.roleName} ({selectedRole.roleCode})</Typography>
                <Typography variant="body2" color="text.secondary">{selectedRole.description}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {canUpdate && <Button size="small" onClick={openEdit}>정보 수정</Button>}
                {canCreate && <Button size="small" startIcon={<ContentCopy sx={{ fontSize: 16 }} />} onClick={() => setCopyOpen(true)}>복사</Button>}
                {canDelete && !selectedRole.systemRoleYn && (
                  <Button size="small" color="error" startIcon={<Delete sx={{ fontSize: 16 }} />} onClick={() => setConfirmDelete(true)}>삭제</Button>
                )}
                {canUpdate && (
                  <Button variant="contained" size="small" startIcon={<Save sx={{ fontSize: 16 }} />}
                    disabled={!dirty || saving} onClick={saveMatrix}
                    sx={{ bgcolor: '#003875', '&:hover': { bgcolor: '#002855' } }}>
                    {saving ? '저장 중...' : '매트릭스 저장'}
                  </Button>
                )}
              </Box>
            </Box>

            {matrixLoading ? (
              <Skeleton variant="rectangular" height={300} />
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>메뉴</TableCell>
                    {ALL_ACTIONS.map(a => (
                      <TableCell key={a} align="center" sx={{ fontWeight: 700, cursor: canUpdate ? 'pointer' : 'default' }}
                        onClick={() => canUpdate && toggleColumn(a)}>
                        <Tooltip title={canUpdate ? '열 전체 토글' : ''}>
                          <span>{ACTION_LABELS[a]}</span>
                        </Tooltip>
                      </TableCell>
                    ))}
                    <TableCell align="center" sx={{ fontWeight: 700 }}>전체</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {matrixRows.map(row => {
                    const menu = rowMenu(row.menuId);
                    const supported = new Set(menu?.supportedActions || []);
                    return (
                      <TableRow key={row.menuId} hover>
                        <TableCell sx={{ pl: menu?.depth === 2 ? 3 : 1 }}>{menu?.menuName || row.menuCode}</TableCell>
                        {ALL_ACTIONS.map(a => {
                          const key = a === 'R' ? 'canRead' : a === 'C' ? 'canCreate' : a === 'U' ? 'canUpdate' : a === 'D' ? 'canDelete' : 'canApprove';
                          if (!supported.has(a)) {
                            return <TableCell key={a} align="center" sx={{ color: '#bbb' }}>-</TableCell>;
                          }
                          return (
                            <TableCell key={a} align="center">
                              <Checkbox size="small" checked={row[key]} disabled={!canUpdate}
                                onChange={() => toggleCell(row.menuId, a)} />
                            </TableCell>
                          );
                        })}
                        <TableCell align="center">
                          <Checkbox size="small" disabled={!canUpdate}
                            checked={menu ? menu.supportedActions.every(a => {
                              const key = a === 'R' ? 'canRead' : a === 'C' ? 'canCreate' : a === 'U' ? 'canUpdate' : a === 'D' ? 'canDelete' : 'canApprove';
                              return row[key];
                            }) : false}
                            onChange={() => toggleRow(row.menuId)} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </>
        )}
      </Paper>

      {/* 권한 추가 */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>권한 추가</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
          <TextField label="권한 코드 (roleCode)" value={addForm.roleCode} placeholder="예: REVIEWER"
            onChange={e => setAddForm(f => ({ ...f, roleCode: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '') }))} />
          <TextField label="권한명" value={addForm.roleName} onChange={e => setAddForm(f => ({ ...f, roleName: e.target.value }))} />
          <TextField label="설명" value={addForm.description} multiline rows={2} onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddOpen(false)}>취소</Button>
          <Button variant="contained" disabled={!addForm.roleCode || !addForm.roleName} onClick={handleAddRole}
            sx={{ bgcolor: '#003875' }}>추가</Button>
        </DialogActions>
      </Dialog>

      {/* 권한 복사 */}
      <Dialog open={copyOpen} onClose={() => setCopyOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>권한 복사</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
          <Typography variant="body2" color="text.secondary">{selectedRole?.roleName} 의 매트릭스를 복제해 새 권한을 만듭니다.</Typography>
          <TextField label="새 권한 코드" value={copyForm.roleCode}
            onChange={e => setCopyForm(f => ({ ...f, roleCode: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '') }))} />
          <TextField label="새 권한명" value={copyForm.roleName} onChange={e => setCopyForm(f => ({ ...f, roleName: e.target.value }))} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCopyOpen(false)}>취소</Button>
          <Button variant="contained" disabled={!copyForm.roleCode || !copyForm.roleName} onClick={handleCopyRole}
            sx={{ bgcolor: '#003875' }}>복사</Button>
        </DialogActions>
      </Dialog>

      {/* 권한 정보 수정 */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>권한 정보 수정</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
          <TextField label="권한명" value={editForm.roleName} onChange={e => setEditForm(f => ({ ...f, roleName: e.target.value }))} />
          <TextField label="설명" value={editForm.description} multiline rows={2} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditOpen(false)}>취소</Button>
          <Button variant="contained" onClick={handleEditRole} sx={{ bgcolor: '#003875' }}>저장</Button>
        </DialogActions>
      </Dialog>

      {/* 삭제 확인 */}
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>권한 삭제</DialogTitle>
        <DialogContent>
          <Typography variant="body2">{selectedRole?.roleName} 권한을 삭제하시겠습니까? 배정된 사원이 있으면 삭제할 수 없습니다.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmDelete(false)}>취소</Button>
          <Button variant="contained" color="error" onClick={handleDeleteRole}>삭제</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast(t => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={toast.severity} variant="filled" onClose={() => setToast(t => ({ ...t, open: false }))}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
};

// ── 탭 B: 기본권한 규칙 ──
const RulesTab: React.FC<{ canCreate: boolean; canUpdate: boolean; canDelete: boolean }> = ({ canCreate, canUpdate, canDelete }) => {
  const {
    rules, departments, positions, roles, loading, error, load,
    addRule, editRule, removeRule,
    simDeptId, setSimDeptId, simPosId, setSimPosId, simResult, runSimulation,
    reapplyPreview, setReapplyPreview, previewReapply, confirmReapply,
    toast, setToast,
  } = useRoleRules();

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<DefaultRoleRule, 'ruleId'>>({
    ruleName: '', departmentId: null, positionId: null, roleId: roles[0]?.roleId || 0, priority: 100, useYn: true,
  });

  const openAdd = () => {
    setEditingId(null);
    setForm({ ruleName: '', departmentId: null, positionId: null, roleId: roles[0]?.roleId || 0, priority: 100, useYn: true });
    setFormOpen(true);
  };

  const openEdit = (rule: DefaultRoleRule) => {
    setEditingId(rule.ruleId);
    setForm({ ruleName: rule.ruleName, departmentId: rule.departmentId, positionId: rule.positionId, roleId: rule.roleId, priority: rule.priority, useYn: rule.useYn });
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingId) await editRule(editingId, form);
      else await addRule(form);
      setFormOpen(false);
      setToast({ open: true, severity: 'success', message: '규칙이 저장되었습니다.' });
    } catch (e) {
      setToast({ open: true, severity: 'error', message: e instanceof Error ? e.message : '저장에 실패했습니다.' });
    }
  };

  const handleDelete = async (ruleId: number) => {
    await removeRule(ruleId);
    setToast({ open: true, severity: 'success', message: '규칙이 삭제되었습니다.' });
  };

  if (error) {
    return (
      <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
        <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
        <Button variant="outlined" onClick={load}>다시 시도</Button>
      </Paper>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* 시뮬레이션 */}
      <Paper sx={{ p: 2.5, borderRadius: 2 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>규칙 시뮬레이션</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField select size="small" label="부서" value={simDeptId} sx={{ minWidth: 160 }}
            onChange={e => setSimDeptId(e.target.value === '' ? '' : Number(e.target.value))}>
            <MenuItem value="">전체</MenuItem>
            {departments.map(d => <MenuItem key={d.departmentId} value={d.departmentId}>{d.deptName}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="직위" value={simPosId} sx={{ minWidth: 160 }}
            onChange={e => setSimPosId(e.target.value === '' ? '' : Number(e.target.value))}>
            <MenuItem value="">전체</MenuItem>
            {positions.map(p => <MenuItem key={p.positionId} value={p.positionId}>{p.positionName}</MenuItem>)}
          </TextField>
          <Button variant="outlined" startIcon={<PlayArrow />} onClick={runSimulation}>시뮬레이션 실행</Button>
          {simResult && (
            <Chip label={`결과: ${simResult.resultRole.roleName} (${simResult.assignSource})`}
              sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 600 }} />
          )}
        </Box>
        {simResult && simResult.matchedRules.length > 0 && (
          <Box sx={{ mt: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {simResult.matchedRules.map(r => (
              <Chip key={r.ruleId} size="small"
                label={`${r.ruleName} (구체성${r.specificity}/우선순위${r.priority})${r.ruleId === simResult.selectedRuleId ? ' ✓선택' : ''}`}
                sx={{ fontSize: 11, bgcolor: r.ruleId === simResult.selectedRuleId ? '#e8f5e9' : '#f5f5f5', color: r.ruleId === simResult.selectedRuleId ? '#2e7d32' : '#666' }} />
            ))}
          </Box>
        )}
      </Paper>

      {/* 규칙 목록 */}
      <Paper sx={{ p: 2.5, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={700}>기본권한 규칙 (구체성↓ → priority↑ 순)</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {canUpdate && <Button size="small" startIcon={<Refresh sx={{ fontSize: 16 }} />} onClick={previewReapply}>일괄 재적용</Button>}
            {canCreate && <Button size="small" variant="contained" startIcon={<Add sx={{ fontSize: 16 }} />} onClick={openAdd}
              sx={{ bgcolor: '#003875' }}>규칙 추가</Button>}
          </Box>
        </Box>
        {loading ? (
          <Skeleton variant="rectangular" height={160} />
        ) : rules.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 2 }}>등록된 규칙이 없습니다. 모든 신규 사원은 기본 권한(조회자)을 받습니다.</Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>규칙명</TableCell>
                <TableCell>부서</TableCell>
                <TableCell>직위</TableCell>
                <TableCell>부여 권한</TableCell>
                <TableCell align="center">구체성</TableCell>
                <TableCell align="center">priority</TableCell>
                <TableCell align="center">사용</TableCell>
                <TableCell align="center">관리</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rules.map(r => (
                <TableRow key={r.ruleId} hover>
                  <TableCell>{r.ruleName}</TableCell>
                  <TableCell>{r.departmentName}</TableCell>
                  <TableCell>{r.positionName}</TableCell>
                  <TableCell><Chip label={r.roleName} size="small" sx={{ fontSize: 11 }} /></TableCell>
                  <TableCell align="center">{r.specificity}</TableCell>
                  <TableCell align="center">{r.priority}</TableCell>
                  <TableCell align="center">{r.useYn ? 'Y' : 'N'}</TableCell>
                  <TableCell align="center">
                    {canUpdate && <IconButton size="small" onClick={() => openEdit(r)}><Typography sx={{ fontSize: 12 }}>수정</Typography></IconButton>}
                    {canDelete && <IconButton size="small" color="error" onClick={() => handleDelete(r.ruleId)}><Delete sx={{ fontSize: 16 }} /></IconButton>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* 규칙 추가/수정 */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingId ? '규칙 수정' : '규칙 추가'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
          <TextField label="규칙명" value={form.ruleName} onChange={e => setForm(f => ({ ...f, ruleName: e.target.value }))} />
          <TextField select label="부서" value={form.departmentId ?? ''}
            onChange={e => setForm(f => ({ ...f, departmentId: e.target.value === '' ? null : Number(e.target.value) }))}>
            <MenuItem value="">전체</MenuItem>
            {departments.map(d => <MenuItem key={d.departmentId} value={d.departmentId}>{d.deptName}</MenuItem>)}
          </TextField>
          <TextField select label="직위" value={form.positionId ?? ''}
            onChange={e => setForm(f => ({ ...f, positionId: e.target.value === '' ? null : Number(e.target.value) }))}>
            <MenuItem value="">전체</MenuItem>
            {positions.map(p => <MenuItem key={p.positionId} value={p.positionId}>{p.positionName}</MenuItem>)}
          </TextField>
          <TextField select label="부여 권한" value={form.roleId}
            onChange={e => setForm(f => ({ ...f, roleId: Number(e.target.value) }))}>
            {roles.map(r => <MenuItem key={r.roleId} value={r.roleId}>{r.roleName}</MenuItem>)}
          </TextField>
          <TextField label="priority (작을수록 우선)" type="number" value={form.priority}
            onChange={e => setForm(f => ({ ...f, priority: Number(e.target.value) }))} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setFormOpen(false)}>취소</Button>
          <Button variant="contained" disabled={!form.ruleName} onClick={handleSubmit} sx={{ bgcolor: '#003875' }}>저장</Button>
        </DialogActions>
      </Dialog>

      {/* 일괄 재적용 미리보기 */}
      <Dialog open={!!reapplyPreview} onClose={() => setReapplyPreview(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>일괄 재적용 미리보기</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1.5 }}>영향 인원: <strong>{reapplyPreview?.affectedCount ?? 0}명</strong> (MANUAL 지정 사원은 제외)</Typography>
          {(reapplyPreview?.samples || []).map(s => (
            <Typography key={s.employeeId} variant="body2" sx={{ fontSize: 12 }}>
              {s.employeeId} {s.name}: {s.fromRoleCode} → {s.toRoleCode}
            </Typography>
          ))}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setReapplyPreview(null)}>취소</Button>
          <Button variant="contained" onClick={confirmReapply} sx={{ bgcolor: '#003875' }}>실제 반영</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast(t => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={toast.severity} variant="filled" onClose={() => setToast(t => ({ ...t, open: false }))}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default RoleManagementPage;
