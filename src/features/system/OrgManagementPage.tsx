/**
 * @fileoverview 조직관리 화면 (`/system/org`, SYS_ORG)
 * @description 부서 마스터 / 직위 마스터 CRUD (좌우 분할). D5: 시스템 내 마스터로 직접 관리.
 */
import React, { useState } from 'react';
import {
  Box, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Switch, FormControlLabel,
  Skeleton, Snackbar, Alert, IconButton, MenuItem,
} from '@mui/material';
import { Add, Edit, Delete, Refresh } from '@mui/icons-material';
import { useOrgManagement } from './hooks/useOrgManagement';
import { usePermission } from '../auth/usePermission';
import type { Department, Position } from './types';

const OrgManagementPage: React.FC = () => {
  const {
    departments, positions, loading, error, load,
    addDepartment, editDepartment, removeDepartment,
    addPosition, editPosition, removePosition,
    toast, setToast,
  } = useOrgManagement();
  const { canCreate, canUpdate, canDelete } = usePermission('SYS_ORG');

  const [deptDialog, setDeptDialog] = useState<{ open: boolean; editing: Department | null }>({ open: false, editing: null });
  const [deptForm, setDeptForm] = useState({ deptCode: '', deptName: '', parentDepartmentId: '' as number | '', sortOrder: 100, useYn: true });

  const [posDialog, setPosDialog] = useState<{ open: boolean; editing: Position | null }>({ open: false, editing: null });
  const [posForm, setPosForm] = useState({ positionCode: '', positionName: '', positionLevel: 10, useYn: true });

  const openDeptAdd = () => {
    setDeptForm({ deptCode: '', deptName: '', parentDepartmentId: '', sortOrder: 100, useYn: true });
    setDeptDialog({ open: true, editing: null });
  };
  const openDeptEdit = (d: Department) => {
    setDeptForm({ deptCode: d.deptCode, deptName: d.deptName, parentDepartmentId: d.parentDepartmentId ?? '', sortOrder: d.sortOrder, useYn: d.useYn });
    setDeptDialog({ open: true, editing: d });
  };
  const submitDept = async () => {
    const payload = { deptCode: deptForm.deptCode, deptName: deptForm.deptName, parentDepartmentId: deptForm.parentDepartmentId === '' ? null : deptForm.parentDepartmentId, sortOrder: deptForm.sortOrder, useYn: deptForm.useYn };
    if (deptDialog.editing) await editDepartment(deptDialog.editing.departmentId, payload);
    else await addDepartment(payload);
    setDeptDialog({ open: false, editing: null });
  };

  const openPosAdd = () => {
    setPosForm({ positionCode: '', positionName: '', positionLevel: 10, useYn: true });
    setPosDialog({ open: true, editing: null });
  };
  const openPosEdit = (p: Position) => {
    setPosForm({ positionCode: p.positionCode, positionName: p.positionName, positionLevel: p.positionLevel, useYn: p.useYn });
    setPosDialog({ open: true, editing: p });
  };
  const submitPos = async () => {
    if (posDialog.editing) await editPosition(posDialog.editing.positionId, posForm);
    else await addPosition(posForm);
    setPosDialog({ open: false, editing: null });
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>조직관리</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            부서·직위 마스터를 관리합니다. 미지정 부서/직위는 삭제·코드변경할 수 없습니다.
          </Typography>
        </Box>
        <Button startIcon={<Refresh />} onClick={load}>새로고침</Button>
      </Box>

      {error ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
          <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
          <Button variant="outlined" onClick={load}>다시 시도</Button>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {/* 부서 마스터 */}
          <Paper sx={{ flex: 1, minWidth: 420, p: 2.5, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle1" fontWeight={700}>부서 마스터</Typography>
              {canCreate && <Button size="small" startIcon={<Add sx={{ fontSize: 16 }} />} onClick={openDeptAdd}>부서 추가</Button>}
            </Box>
            {loading ? <Skeleton variant="rectangular" height={200} /> : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>코드</TableCell><TableCell>부서명</TableCell><TableCell align="center">순서</TableCell>
                    <TableCell align="center">사용</TableCell><TableCell align="center">관리</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {departments.map(d => (
                    <TableRow key={d.departmentId} hover>
                      <TableCell>{d.deptCode}{d.deptCode === 'UNASSIGNED' && <Chip label="시스템" size="small" sx={{ ml: 0.5, fontSize: 9, height: 16 }} />}</TableCell>
                      <TableCell>{d.deptName}</TableCell>
                      <TableCell align="center">{d.sortOrder}</TableCell>
                      <TableCell align="center">{d.useYn ? 'Y' : 'N'}</TableCell>
                      <TableCell align="center">
                        {canUpdate && <IconButton size="small" onClick={() => openDeptEdit(d)}><Edit sx={{ fontSize: 16 }} /></IconButton>}
                        {canDelete && d.deptCode !== 'UNASSIGNED' && (
                          <IconButton size="small" color="error" onClick={() => removeDepartment(d.departmentId)}><Delete sx={{ fontSize: 16 }} /></IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>

          {/* 직위 마스터 */}
          <Paper sx={{ flex: 1, minWidth: 380, p: 2.5, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle1" fontWeight={700}>직위 마스터</Typography>
              {canCreate && <Button size="small" startIcon={<Add sx={{ fontSize: 16 }} />} onClick={openPosAdd}>직위 추가</Button>}
            </Box>
            {loading ? <Skeleton variant="rectangular" height={200} /> : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>코드</TableCell><TableCell>직위명</TableCell><TableCell align="center">레벨</TableCell>
                    <TableCell align="center">사용</TableCell><TableCell align="center">관리</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {positions.map(p => (
                    <TableRow key={p.positionId} hover>
                      <TableCell>{p.positionCode}{p.positionCode === 'UNASSIGNED' && <Chip label="시스템" size="small" sx={{ ml: 0.5, fontSize: 9, height: 16 }} />}</TableCell>
                      <TableCell>{p.positionName}</TableCell>
                      <TableCell align="center">{p.positionLevel}</TableCell>
                      <TableCell align="center">{p.useYn ? 'Y' : 'N'}</TableCell>
                      <TableCell align="center">
                        {canUpdate && <IconButton size="small" onClick={() => openPosEdit(p)}><Edit sx={{ fontSize: 16 }} /></IconButton>}
                        {canDelete && p.positionCode !== 'UNASSIGNED' && (
                          <IconButton size="small" color="error" onClick={() => removePosition(p.positionId)}><Delete sx={{ fontSize: 16 }} /></IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        </Box>
      )}

      {/* 부서 추가/수정 */}
      <Dialog open={deptDialog.open} onClose={() => setDeptDialog({ open: false, editing: null })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{deptDialog.editing ? '부서 수정' : '부서 추가'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
          <TextField label="부서 코드" value={deptForm.deptCode} disabled={deptDialog.editing?.deptCode === 'UNASSIGNED'}
            onChange={e => setDeptForm(f => ({ ...f, deptCode: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '') }))} />
          <TextField label="부서명" value={deptForm.deptName} onChange={e => setDeptForm(f => ({ ...f, deptName: e.target.value }))} />
          <TextField select label="상위 부서" value={deptForm.parentDepartmentId}
            onChange={e => setDeptForm(f => ({ ...f, parentDepartmentId: e.target.value === '' ? '' : Number(e.target.value) }))}>
            <MenuItem value="">없음</MenuItem>
            {departments.filter(d => d.departmentId !== deptDialog.editing?.departmentId).map(d => (
              <MenuItem key={d.departmentId} value={d.departmentId}>{d.deptName}</MenuItem>
            ))}
          </TextField>
          <TextField label="정렬순서" type="number" value={deptForm.sortOrder} onChange={e => setDeptForm(f => ({ ...f, sortOrder: Number(e.target.value) }))} />
          <FormControlLabel control={<Switch checked={deptForm.useYn} onChange={e => setDeptForm(f => ({ ...f, useYn: e.target.checked }))} />} label="사용 여부" />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeptDialog({ open: false, editing: null })}>취소</Button>
          <Button variant="contained" disabled={!deptForm.deptCode || !deptForm.deptName} onClick={submitDept} sx={{ bgcolor: '#003875' }}>저장</Button>
        </DialogActions>
      </Dialog>

      {/* 직위 추가/수정 */}
      <Dialog open={posDialog.open} onClose={() => setPosDialog({ open: false, editing: null })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{posDialog.editing ? '직위 수정' : '직위 추가'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
          <TextField label="직위 코드" value={posForm.positionCode} disabled={posDialog.editing?.positionCode === 'UNASSIGNED'}
            onChange={e => setPosForm(f => ({ ...f, positionCode: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '') }))} />
          <TextField label="직위명" value={posForm.positionName} onChange={e => setPosForm(f => ({ ...f, positionName: e.target.value }))} />
          <TextField label="레벨 (클수록 상위)" type="number" value={posForm.positionLevel} onChange={e => setPosForm(f => ({ ...f, positionLevel: Number(e.target.value) }))} />
          <FormControlLabel control={<Switch checked={posForm.useYn} onChange={e => setPosForm(f => ({ ...f, useYn: e.target.checked }))} />} label="사용 여부" />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPosDialog({ open: false, editing: null })}>취소</Button>
          <Button variant="contained" disabled={!posForm.positionCode || !posForm.positionName} onClick={submitPos} sx={{ bgcolor: '#003875' }}>저장</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast(t => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={toast.severity} variant="filled" onClose={() => setToast(t => ({ ...t, open: false }))}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default OrgManagementPage;
