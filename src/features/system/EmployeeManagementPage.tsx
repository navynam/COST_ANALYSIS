/**
 * @fileoverview 사원관리 화면 (`/system/employees`, SYS_EMPLOYEE)
 * @description 사원 목록/검색/필터, 권한 단일 변경, 활성/비활성 토글. 하드 삭제는 없다(D13).
 */
import React, { useState } from 'react';
import {
  Box, Paper, Typography, TextField, MenuItem, Button, Table, TableHead, TableRow, TableCell,
  TableBody, Chip, Checkbox, Skeleton, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
  Pagination, Switch, FormControlLabel,
} from '@mui/material';
import { Add, Refresh } from '@mui/icons-material';
import { useEmployeeManagement } from './hooks/useEmployeeManagement';
import { usePermission } from '../auth/usePermission';
import { useAuth } from '../auth/AuthContext';
import { createEmployee } from './services/employeeService';
import { EMPLOYEE_PAGE_SIZE, MAX_BULK_ROLE_ASSIGN } from '../../constants/system';
import type { EmployeeStatus } from './types';

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE: { label: '활성', color: '#2e7d32', bg: '#e8f5e9' },
  INACTIVE: { label: '비활성', color: '#757575', bg: '#eeeeee' },
  LOCKED: { label: '잠김', color: '#c62828', bg: '#ffebee' },
};
const SOURCE_LABEL: Record<string, string> = { MANUAL: '직접지정', RULE: '규칙', DEFAULT: '기본' };

const EmployeeManagementPage: React.FC = () => {
  const { user } = useAuth();
  const { canCreate, canUpdate } = usePermission('SYS_EMPLOYEE');
  const {
    content, totalElements, page, setPage,
    departments, positions, roles,
    loading, error, load,
    filter, applyFilter, resetFilter,
    selectedIds, setSelectedIds,
    changeRole, bulkChange, toggleStatus, reapplyRule,
    toast, setToast,
  } = useEmployeeManagement(user?.employeeId || user?.id || '');

  const [keyword, setKeyword] = useState('');
  const [bulkRoleId, setBulkRoleId] = useState<number | ''>('');
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ employeeId: '', name: '', departmentId: '' as number | '', positionId: '' as number | '', roleId: '' as number | '' });

  const pageCount = Math.max(1, Math.ceil(totalElements / EMPLOYEE_PAGE_SIZE));

  const handleSearch = () => applyFilter({ ...filter, keyword });

  const handleCreate = async () => {
    try {
      await createEmployee({
        employeeId: createForm.employeeId,
        name: createForm.name,
        departmentId: createForm.departmentId === '' ? null : createForm.departmentId,
        positionId: createForm.positionId === '' ? null : createForm.positionId,
        roleId: createForm.roleId === '' ? undefined : createForm.roleId,
      });
      setCreateOpen(false);
      setCreateForm({ employeeId: '', name: '', departmentId: '', positionId: '', roleId: '' });
      setToast({ open: true, severity: 'success', message: '사원이 등록되었습니다.' });
      await load();
    } catch (e) {
      setToast({ open: true, severity: 'error', message: e instanceof Error ? e.message : '등록에 실패했습니다.' });
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === content.length) setSelectedIds([]);
    else setSelectedIds(content.map(e => e.userId));
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>사원관리</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            사원 목록, 권한 변경, 활성/비활성 상태를 관리합니다. 사원은 삭제할 수 없고 비활성 처리만 가능합니다.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button startIcon={<Refresh />} onClick={load}>새로고침</Button>
          {canCreate && (
            <Button variant="contained" startIcon={<Add />} onClick={() => setCreateOpen(true)}
              sx={{ bgcolor: '#003875', '&:hover': { bgcolor: '#002855' } }}>사원 등록</Button>
          )}
        </Box>
      </Box>

      {/* 필터 */}
      <Paper sx={{ p: 2, borderRadius: 2, mb: 2, display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField size="small" label="사번·이름" value={keyword} onChange={e => setKeyword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()} sx={{ minWidth: 180 }} />
        <TextField size="small" select label="부서" value={filter.departmentId ?? ''} sx={{ minWidth: 140 }}
          onChange={e => applyFilter({ ...filter, departmentId: e.target.value === '' ? undefined : Number(e.target.value) })}>
          <MenuItem value="">전체</MenuItem>
          {departments.map(d => <MenuItem key={d.departmentId} value={d.departmentId}>{d.deptName}</MenuItem>)}
        </TextField>
        <TextField size="small" select label="직위" value={filter.positionId ?? ''} sx={{ minWidth: 140 }}
          onChange={e => applyFilter({ ...filter, positionId: e.target.value === '' ? undefined : Number(e.target.value) })}>
          <MenuItem value="">전체</MenuItem>
          {positions.map(p => <MenuItem key={p.positionId} value={p.positionId}>{p.positionName}</MenuItem>)}
        </TextField>
        <TextField size="small" select label="권한" value={filter.roleId ?? ''} sx={{ minWidth: 150 }}
          onChange={e => applyFilter({ ...filter, roleId: e.target.value === '' ? undefined : Number(e.target.value) })}>
          <MenuItem value="">전체</MenuItem>
          {roles.map(r => <MenuItem key={r.roleId} value={r.roleId}>{r.roleName}</MenuItem>)}
        </TextField>
        <TextField size="small" select label="상태" value={filter.status ?? ''} sx={{ minWidth: 120 }}
          onChange={e => applyFilter({ ...filter, status: (e.target.value || undefined) as EmployeeStatus | undefined })}>
          <MenuItem value="">전체</MenuItem>
          <MenuItem value="ACTIVE">활성</MenuItem>
          <MenuItem value="INACTIVE">비활성</MenuItem>
          <MenuItem value="LOCKED">잠김</MenuItem>
        </TextField>
        <Button variant="contained" size="small" onClick={handleSearch} sx={{ bgcolor: '#003875' }}>검색</Button>
        <Button size="small" onClick={() => { setKeyword(''); resetFilter(); }}>필터 초기화</Button>
      </Paper>

      {/* 일괄 변경 */}
      {canUpdate && selectedIds.length > 0 && (
        <Paper sx={{ p: 1.5, borderRadius: 2, mb: 2, display: 'flex', gap: 1.5, alignItems: 'center', bgcolor: '#e3f2fd' }}>
          <Typography variant="body2">{selectedIds.length}명 선택됨 (최대 {MAX_BULK_ROLE_ASSIGN}명)</Typography>
          <TextField size="small" select label="일괄 변경할 권한" value={bulkRoleId} sx={{ minWidth: 180 }}
            onChange={e => setBulkRoleId(e.target.value === '' ? '' : Number(e.target.value))}>
            {roles.map(r => <MenuItem key={r.roleId} value={r.roleId}>{r.roleName}</MenuItem>)}
          </TextField>
          <Button variant="contained" size="small" disabled={bulkRoleId === ''}
            onClick={() => bulkRoleId !== '' && bulkChange(bulkRoleId)} sx={{ bgcolor: '#003875' }}>일괄 적용</Button>
        </Paper>
      )}

      {error ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
          <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
          <Button variant="outlined" onClick={load}>다시 시도</Button>
        </Paper>
      ) : (
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ p: 2 }}>
              {[...Array(5)].map((_, i) => <Skeleton key={i} variant="rectangular" height={40} sx={{ mb: 1 }} />)}
            </Box>
          ) : content.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <Typography color="text.secondary" sx={{ mb: 2 }}>조건에 맞는 사원이 없습니다.</Typography>
              <Button variant="outlined" onClick={() => { setKeyword(''); resetFilter(); }}>필터 초기화</Button>
            </Box>
          ) : (
            <>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {canUpdate && (
                      <TableCell padding="checkbox">
                        <Checkbox size="small" checked={selectedIds.length === content.length && content.length > 0}
                          indeterminate={selectedIds.length > 0 && selectedIds.length < content.length}
                          onChange={toggleSelectAll} />
                      </TableCell>
                    )}
                    <TableCell>사번</TableCell>
                    <TableCell>이름</TableCell>
                    <TableCell>부서</TableCell>
                    <TableCell>직위</TableCell>
                    <TableCell>권한</TableCell>
                    <TableCell>부여출처</TableCell>
                    <TableCell>상태</TableCell>
                    <TableCell>인증</TableCell>
                    <TableCell>최근 로그인</TableCell>
                    {canUpdate && <TableCell align="center">관리</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {content.map(emp => (
                    <TableRow key={emp.userId} hover>
                      {canUpdate && (
                        <TableCell padding="checkbox">
                          <Checkbox size="small" checked={selectedIds.includes(emp.userId)}
                            onChange={() => setSelectedIds(prev => prev.includes(emp.userId) ? prev.filter(id => id !== emp.userId) : [...prev, emp.userId])} />
                        </TableCell>
                      )}
                      <TableCell>{emp.employeeId}</TableCell>
                      <TableCell>{emp.name}</TableCell>
                      <TableCell>{emp.departmentName}</TableCell>
                      <TableCell>{emp.positionName}</TableCell>
                      <TableCell>
                        {canUpdate ? (
                          <TextField select size="small" variant="standard" value={emp.roleId} sx={{ minWidth: 130 }}
                            onChange={e => changeRole(emp.userId, Number(e.target.value))}>
                            {roles.map(r => <MenuItem key={r.roleId} value={r.roleId}>{r.roleName}</MenuItem>)}
                          </TextField>
                        ) : (
                          <Chip label={emp.roleName} size="small" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip label={SOURCE_LABEL[emp.roleAssignSource]} size="small" variant="outlined" sx={{ fontSize: 11 }} />
                      </TableCell>
                      <TableCell>
                        <Chip label={STATUS_LABEL[emp.status].label} size="small"
                          sx={{ bgcolor: STATUS_LABEL[emp.status].bg, color: STATUS_LABEL[emp.status].color, fontSize: 11 }} />
                      </TableCell>
                      <TableCell>{emp.authSource}</TableCell>
                      <TableCell>{emp.lastLoginAt ? new Date(emp.lastLoginAt).toLocaleString('ko-KR') : '-'}</TableCell>
                      {canUpdate && (
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', justifyContent: 'center' }}>
                            <FormControlLabel sx={{ mr: 0 }} label=""
                              control={<Switch size="small" checked={emp.status === 'ACTIVE'}
                                onChange={() => toggleStatus(emp.userId, emp.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')} />} />
                            {emp.roleAssignSource !== 'MANUAL' ? null : (
                              <Button size="small" sx={{ fontSize: 11, textTransform: 'none' }} onClick={() => reapplyRule(emp.userId)}>
                                규칙재적용
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                <Typography variant="body2" color="text.secondary">전체 {totalElements}명</Typography>
                <Pagination count={pageCount} page={page + 1} onChange={(_, p) => setPage(p - 1)} size="small" />
              </Box>
            </>
          )}
        </Paper>
      )}

      {/* 사원 등록 */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>사원 등록</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
          <TextField label="사번" value={createForm.employeeId} onChange={e => setCreateForm(f => ({ ...f, employeeId: e.target.value }))} />
          <TextField label="이름" value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} />
          <TextField select label="부서" value={createForm.departmentId}
            onChange={e => setCreateForm(f => ({ ...f, departmentId: e.target.value === '' ? '' : Number(e.target.value) }))}>
            <MenuItem value="">미지정</MenuItem>
            {departments.map(d => <MenuItem key={d.departmentId} value={d.departmentId}>{d.deptName}</MenuItem>)}
          </TextField>
          <TextField select label="직위" value={createForm.positionId}
            onChange={e => setCreateForm(f => ({ ...f, positionId: e.target.value === '' ? '' : Number(e.target.value) }))}>
            <MenuItem value="">미지정</MenuItem>
            {positions.map(p => <MenuItem key={p.positionId} value={p.positionId}>{p.positionName}</MenuItem>)}
          </TextField>
          <TextField select label="권한 (생략 시 기본권한 규칙 자동 적용)" value={createForm.roleId}
            onChange={e => setCreateForm(f => ({ ...f, roleId: e.target.value === '' ? '' : Number(e.target.value) }))}>
            <MenuItem value="">자동(규칙 적용)</MenuItem>
            {roles.map(r => <MenuItem key={r.roleId} value={r.roleId}>{r.roleName}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateOpen(false)}>취소</Button>
          <Button variant="contained" disabled={!createForm.employeeId || !createForm.name} onClick={handleCreate}
            sx={{ bgcolor: '#003875' }}>등록</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast(t => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={toast.severity} variant="filled" onClose={() => setToast(t => ({ ...t, open: false }))}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default EmployeeManagementPage;
