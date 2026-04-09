/**
 * @fileoverview 원가 모델관리 페이지
 * @description 원가 구조 수식 및 기준을 카드 형태로 관리 + 역할 기반 워크플로우
 */
import React, { useState, useCallback } from 'react';
import {
  Box, Typography, Button, Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Snackbar, Alert, Tabs, Tab, Badge, Avatar, Menu,
  FormControlLabel, Checkbox, Divider,
} from '@mui/material';
import {
  Edit, Delete, Add, Send, ExpandMore,
} from '@mui/icons-material';
import FluentIcon from '../../shared/components/FluentIcon';
import { useModelManagement, badgeConfig, Formula, ALL_DEPARTMENTS } from './hooks/useModelManagement';
import { useModelWorkflow, userPresets, ChangeRequest } from './hooks/useModelWorkflow';
import SimpleKnowledgeGraphTab from './components/SimpleKnowledgeGraphTab';
import styles from './ModelManagementPage.module.css';
import { useMessageDialog } from '../../shared/components/MessageDialog';

// ── 상태 배지 설정 ──
const statusBadge: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: '대기', color: '#e65100', bg: '#fff3e0' },
  approved: { label: '승인', color: '#2e7d32', bg: '#e8f5e9' },
  rejected: { label: '반려', color: '#c62828', bg: '#ffebee' },
};

const ModelManagementPage: React.FC = () => {
  const { showConfirm } = useMessageDialog();
  const [currentTab, setCurrentTab] = useState(0);
  const {
    formulas, modalOpen, setModalOpen,
    modalMode, form, setForm, toast, setToast,
    openAdd, openEdit, handleSave, handleDelete,
    lastAddedFormulaId, clearLastAddedFormula, applyChanges,
  } = useModelManagement();

  const {
    currentUser, switchUser, isAdmin,
    changeRequests, submitChangeRequest, approveRequest, rejectRequest, cancelRequest,
    getPendingCount, getRequestsForFormula, hasPendingByUser, stats,
  } = useModelWorkflow();

  // ── 사용자 전환 메뉴 ──
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  // ── 수정 요청 다이얼로그 (일반 사용자) ──
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [requestTarget, setRequestTarget] = useState<Formula | null>(null);
  const [requestForm, setRequestForm] = useState({
    expression: '', description: '', variables: '', reason: '',
  });

  // ── 승인/반려 다이얼로그 (관리자) ──
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<ChangeRequest | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewDepts, setReviewDepts] = useState<string[]>(['전체']);

  // ── 변경 요청 필터 ──
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // ── 비관리자 새 수식 추가 요청 다이얼로그 ──
  const [addRequestDialogOpen, setAddRequestDialogOpen] = useState(false);
  const [addRequestForm, setAddRequestForm] = useState({
    name: '', badge: 'sub' as Formula['badge'], expression: '', description: '', variables: '', reason: '',
  });

  // ── 수식별 변경요청 상세 팝업 ──
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailFormulaId, setDetailFormulaId] = useState('');
  const detailRequests = detailFormulaId ? getRequestsForFormula(detailFormulaId) : [];

  // 🔄 새 수식 하이라이트 완료 후 처리
  const handleNewFormulaHighlighted = useCallback(() => {
    clearLastAddedFormula();
  }, [clearLastAddedFormula]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  // ── 수정 요청 열기 (일반 사용자) ──
  const openRequestDialog = (f: Formula) => {
    setRequestTarget(f);
    setRequestForm({
      expression: f.expression,
      description: f.description,
      variables: f.variables.join(', '),
      reason: '',
    });
    setRequestDialogOpen(true);
  };

  const handleSubmitRequest = () => {
    if (!requestTarget || !requestForm.reason.trim()) return;
    const vars = requestForm.variables.split(',').map(v => v.trim()).filter(Boolean);
    const modifiedFields: Partial<Formula> = {};
    if (requestForm.expression !== requestTarget.expression) modifiedFields.expression = requestForm.expression;
    if (requestForm.description !== requestTarget.description) modifiedFields.description = requestForm.description;
    if (requestForm.variables !== requestTarget.variables.join(', ')) modifiedFields.variables = vars;

    if (Object.keys(modifiedFields).length === 0) {
      setToast({ open: true, severity: 'error', message: '변경된 내용이 없습니다.' });
      return;
    }
    submitChangeRequest(requestTarget, modifiedFields, requestForm.reason);
    setRequestDialogOpen(false);
    setToast({ open: true, severity: 'success', message: '수정 요청이 제출되었습니다. 변경 요청 탭에서 확인할 수 있습니다.' });
    setCurrentTab(2); // 변경 요청 탭으로 이동
  };

  // ── 비관리자 새 수식 추가 요청 제출 ──
  const handleSubmitAddRequest = () => {
    if (!addRequestForm.name.trim() || !addRequestForm.expression.trim() || !addRequestForm.reason.trim()) return;
    const vars = addRequestForm.variables.split(',').map(v => v.trim()).filter(Boolean);
    const placeholderFormula: Formula = {
      id: `new_${Date.now()}`, name: addRequestForm.name, badge: addRequestForm.badge,
      expression: '', description: '', variables: [],
    };
    const modifiedFields: Partial<Formula> = {
      name: addRequestForm.name, badge: addRequestForm.badge,
      expression: addRequestForm.expression, description: addRequestForm.description, variables: vars,
    };
    submitChangeRequest(placeholderFormula, modifiedFields, `[새 수식 추가 요청] ${addRequestForm.reason}`);
    setAddRequestDialogOpen(false);
    setAddRequestForm({ name: '', badge: 'sub', expression: '', description: '', variables: '', reason: '' });
    setToast({ open: true, severity: 'success', message: '새 수식 추가 요청이 제출되었습니다.' });
    setCurrentTab(2);
  };

  // ── 필터링된 변경 요청 목록 ──
  const filteredRequests = statusFilter === 'all'
    ? changeRequests
    : changeRequests.filter(r => r.status === statusFilter);

  // ── 검토 열기 (관리자) ──
  const openReviewDialog = (cr: ChangeRequest) => {
    setReviewTarget(cr);
    setReviewComment('');
    setReviewDepts(['전체']);
    setReviewDialogOpen(true);
  };

  const handleApprove = () => {
    if (!reviewTarget) return;
    approveRequest(reviewTarget.id, reviewComment, reviewDepts);
    // 승인된 변경사항을 실제 수식에 반영 (부서 정보 포함)
    applyChanges(reviewTarget.formulaId, { ...reviewTarget.modifiedFields, departments: reviewDepts });
    setReviewDialogOpen(false);
    const deptLabel = reviewDepts.includes('전체') ? '전체 부서' : reviewDepts.join(', ');
    setToast({ open: true, severity: 'success', message: `변경 요청이 승인되어 [${deptLabel}]에 반영되었습니다.` });
  };

  const handleReject = () => {
    if (!reviewTarget) return;
    rejectRequest(reviewTarget.id, reviewComment);
    setReviewDialogOpen(false);
    setToast({ open: true, severity: 'info', message: '변경 요청이 반려되었습니다.' });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <Box className={styles.pageRoot}>
      {/* ── 페이지 헤더 ── */}
      <Box className={styles.pageHeader} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>원가 모델관리</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            원가 구조 수식 및 지식그래프를 관리합니다
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          {/* 사용자 전환 */}
          <Chip
            avatar={
              <Avatar sx={{ bgcolor: isAdmin ? '#003875' : '#7b1fa2', width: 24, height: 24 }}>
                {isAdmin ? <FluentIcon name="admin" size={14} /> : <FluentIcon name="person" size={14} />}
              </Avatar>
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{currentUser.name}</Typography>
                <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
                  {isAdmin ? '관리자' : currentUser.department}
                </Typography>
                <ExpandMore sx={{ fontSize: 14, color: 'text.secondary' }} />
              </Box>
            }
            variant="outlined"
            onClick={(e) => setUserMenuAnchor(e.currentTarget)}
            sx={{ borderRadius: 2, height: 36, cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' } }}
          />
          <Menu anchorEl={userMenuAnchor} open={Boolean(userMenuAnchor)} onClose={() => setUserMenuAnchor(null)}>
            <Box sx={{ px: 2, py: 1, borderBottom: '1px solid #eee' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>사용자 전환 (데모)</Typography>
            </Box>
            {userPresets.map(u => (
              <MenuItem
                key={u.id}
                selected={u.id === currentUser.id}
                onClick={() => { switchUser(u.id); setUserMenuAnchor(null); }}
                sx={{ fontSize: 13, py: 1 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: u.role === 'admin' ? '#003875' : '#7b1fa2', fontSize: 12 }}>
                    {u.role === 'admin' ? <FluentIcon name="admin" size={16} /> : <FluentIcon name="person" size={16} />}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{u.name}</Typography>
                    <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
                      {u.department}{u.taskName ? ` · ${u.taskName}` : ''}
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Menu>

          {/* 새 수식 추가 */}
          {currentTab === 0 && (
            isAdmin ? (
              <Button variant="contained" startIcon={<Add />} onClick={openAdd}
                sx={{ bgcolor: '#003875', '&:hover': { bgcolor: '#002a5c' }, borderRadius: 2, px: 3 }}>
                새 수식 추가
              </Button>
            ) : (
              <Button variant="contained" startIcon={<Add />}
                onClick={() => { setAddRequestForm({ name: '', badge: 'sub', expression: '', description: '', variables: '', reason: '' }); setAddRequestDialogOpen(true); }}
                sx={{ bgcolor: '#7b1fa2', '&:hover': { bgcolor: '#6a1b9a' }, borderRadius: 2, px: 3 }}>
                새 수식 추가 요청
              </Button>
            )
          )}
        </Box>
      </Box>

      {/* ── 탭 네비게이션 ── */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}
          sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: 14 } }}>
          <Tab icon={<FluentIcon name="settings" size={18} />} iconPosition="start" label="모델 관리" sx={{ minHeight: 48 }} />
          <Tab icon={<FluentIcon name="accounttree" size={18} />} iconPosition="start" label="지식그래프" sx={{ minHeight: 48 }} />
          <Tab
            icon={
              <Badge badgeContent={stats.pending} color="warning" sx={{ '& .MuiBadge-badge': { fontSize: 10, minWidth: 16, height: 16 } }}>
                <FluentIcon name="swap" size={18} />
              </Badge>
            }
            iconPosition="start"
            label="변경 요청"
            sx={{ minHeight: 48 }}
          />
        </Tabs>
      </Box>

      {/* ── 탭 콘텐츠 ── */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {currentTab === 0 ? (
          /* ── 모델 관리 탭 ── */
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%', overflow: 'auto' }}>
            {formulas.map(f => {
              const badge = badgeConfig[f.badge];
              const pendingCnt = getPendingCount(f.id);
              return (
                <Paper key={f.id} sx={{ p: 3, borderRadius: 2.5, border: '1px solid #e0e0e0', '&:hover': { boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }, transition: 'box-shadow 0.2s' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Typography variant="subtitle1" fontWeight={700}>{f.name}</Typography>
                    <Chip label={badge.label} size="small" sx={{ bgcolor: badge.bg, color: badge.color, fontWeight: 600, fontSize: 11, height: 22 }} />
                    {pendingCnt > 0 && (
                      <Chip
                        icon={<FluentIcon name="schedule" size={12} />}
                        label={`변경요청 ${pendingCnt}건`}
                        size="small"
                        onClick={() => { setDetailFormulaId(f.id); setDetailDialogOpen(true); }}
                        sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 600, fontSize: 10, height: 22, cursor: 'pointer', '&:hover': { bgcolor: '#ffe0b2' } }}
                      />
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, bgcolor: '#f8f9fa', borderRadius: 1.5, px: 2, py: 1 }}>
                    <Typography sx={{ fontSize: 16 }}><FluentIcon name="functions" size={16} /></Typography>
                    <Typography component="code" sx={{ fontFamily: 'monospace', fontSize: 13, color: '#333', fontWeight: 500 }}>{f.expression}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>{f.description}</Typography>
                  <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', mb: 1 }}>
                    {f.variables.map(v => (
                      <Chip key={v} label={v} size="small" variant="outlined" sx={{ fontSize: 11, height: 24, borderColor: '#ccc', color: '#555' }} />
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2, alignItems: 'center' }}>
                    <Typography sx={{ fontSize: 10, color: '#999', mr: 0.5 }}>적용부서:</Typography>
                    {(f.departments || ['전체']).map(d => (
                      <Chip key={d} label={d} size="small"
                        sx={{ fontSize: 10, height: 20, bgcolor: d === '전체' ? '#e3f2fd' : '#f3e5f5', color: d === '전체' ? '#1565c0' : '#7b1fa2' }} />
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {isAdmin ? (
                      <>
                        <Button size="small" startIcon={<Edit sx={{ fontSize: 14 }} />} onClick={() => openEdit(f)}
                          sx={{ color: '#003875', fontSize: 12, textTransform: 'none' }}>편집</Button>
                        <Button size="small" startIcon={<Delete sx={{ fontSize: 14 }} />} onClick={() => handleDelete(f, async (doDelete) => { const ok = await showConfirm('삭제하시겠습니까?', '이 수식을 삭제합니다.'); if (ok) doDelete(); })}
                          sx={{ color: '#999', fontSize: 12, textTransform: 'none', '&:hover': { color: '#d32f2f' } }}>삭제</Button>
                      </>
                    ) : (
                      hasPendingByUser(f.id) ? (
                        <Chip
                          icon={<FluentIcon name="schedule" size={12} />}
                          label="수정 요청 접수됨"
                          size="small"
                          onClick={() => { setDetailFormulaId(f.id); setDetailDialogOpen(true); }}
                          sx={{ bgcolor: '#f3e5f5', color: '#7b1fa2', fontWeight: 600, fontSize: 11, height: 28, cursor: 'pointer', '&:hover': { bgcolor: '#e1bee7' } }}
                        />
                      ) : (
                        <Button size="small" variant="outlined" startIcon={<Send sx={{ fontSize: 14 }} />}
                          onClick={() => openRequestDialog(f)}
                          sx={{ color: '#7b1fa2', borderColor: '#7b1fa2', fontSize: 12, textTransform: 'none', '&:hover': { bgcolor: '#f3e5f5', borderColor: '#7b1fa2' } }}>
                          수정 요청
                        </Button>
                      )
                    )}
                  </Box>
                </Paper>
              );
            })}
          </Box>
        ) : currentTab === 1 ? (
          /* ── 지식그래프 탭 ── */
          <SimpleKnowledgeGraphTab
            formulas={formulas}
            newlyAddedFormulaId={lastAddedFormulaId}
            onNewFormulaHighlighted={handleNewFormulaHighlighted}
          />
        ) : (
          /* ── 변경 요청 탭 ── */
          <Box sx={{ height: '100%', overflow: 'auto' }}>
            {/* 상단 필터 */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              {[
                { key: 'all' as const, label: '전체', count: stats.total, color: '#546e7a', bg: '#eceff1' },
                { key: 'pending' as const, label: '대기', count: stats.pending, color: '#e65100', bg: '#fff3e0' },
                { key: 'approved' as const, label: '승인', count: stats.approved, color: '#2e7d32', bg: '#e8f5e9' },
                { key: 'rejected' as const, label: '반려', count: stats.rejected, color: '#c62828', bg: '#ffebee' },
              ].map(s => (
                <Paper key={s.key}
                  onClick={() => setStatusFilter(s.key)}
                  sx={{
                    px: 3, py: 1.5, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1.5,
                    border: statusFilter === s.key ? `2px solid ${s.color}` : `1px solid ${s.bg}`,
                    bgcolor: statusFilter === s.key ? s.bg : '#fff',
                    cursor: 'pointer', transition: 'all 0.2s',
                    '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
                  }}>
                  <Typography variant="h5" fontWeight={700} sx={{ color: s.color }}>{s.count}</Typography>
                  <Typography variant="body2" sx={{ color: s.color, fontWeight: 600 }}>{s.label}</Typography>
                </Paper>
              ))}
            </Box>

            {/* 요청 목록 */}
            {filteredRequests.length === 0 ? (
              <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
                <Typography color="text.secondary">
                  {statusFilter === 'all' ? '변경 요청이 없습니다.' : `${statusBadge[statusFilter]?.label || ''} 상태의 요청이 없습니다.`}
                </Typography>
              </Paper>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {filteredRequests.map(cr => {
                  const sBadge = statusBadge[cr.status];
                  return (
                    <Paper key={cr.id} sx={{
                      p: 2.5, borderRadius: 2,
                      border: cr.status === 'pending' ? '1px solid #ffcc02' : '1px solid #e0e0e0',
                      bgcolor: cr.status === 'pending' ? '#fffde7' : '#fff',
                    }}>
                      {/* 헤더 */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: '#7b1fa2', fontSize: 11 }}>{cr.requesterName[0]}</Avatar>
                          <Box>
                            <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{cr.requesterName}</Typography>
                            <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>{cr.department} · {cr.taskName}</Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{formatDate(cr.createdAt)}</Typography>
                          <Chip label={sBadge.label} size="small" sx={{ bgcolor: sBadge.bg, color: sBadge.color, fontWeight: 700, fontSize: 11, height: 22 }} />
                        </Box>
                      </Box>

                      {/* 대상 수식 */}
                      <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#003875', mb: 0.5 }}>
                        대상: {cr.originalFormula.name}
                      </Typography>

                      {/* 변경 내용 diff */}
                      <Box sx={{ bgcolor: '#f5f5f5', borderRadius: 1.5, p: 1.5, mb: 1.5, fontSize: 12 }}>
                        {cr.modifiedFields.expression && (
                          <Box sx={{ mb: 0.5 }}>
                            <Typography sx={{ fontSize: 11, color: '#c62828', fontFamily: 'monospace' }}>- {cr.originalFormula.expression}</Typography>
                            <Typography sx={{ fontSize: 11, color: '#2e7d32', fontFamily: 'monospace' }}>+ {cr.modifiedFields.expression}</Typography>
                          </Box>
                        )}
                        {cr.modifiedFields.variables && (
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                            {cr.modifiedFields.variables.filter(v => !cr.originalFormula.variables.includes(v)).map(v => (
                              <Chip key={v} label={`+ ${v}`} size="small" sx={{ fontSize: 10, height: 20, bgcolor: '#e8f5e9', color: '#2e7d32' }} />
                            ))}
                          </Box>
                        )}
                      </Box>

                      {/* 요청 사유 */}
                      <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 1 }}>
                        <strong>요청 사유:</strong> {cr.reason}
                      </Typography>

                      {/* 승인 부서 표시 */}
                      {cr.status === 'approved' && cr.approvedDepartments && (
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                          {cr.approvedDepartments.map(d => (
                            <Chip key={d} label={d} size="small"
                              sx={{ fontSize: 10, height: 20, bgcolor: d === '전체' ? '#e3f2fd' : '#e8f5e9', color: d === '전체' ? '#1565c0' : '#2e7d32' }} />
                          ))}
                        </Box>
                      )}

                      {/* 검토 코멘트 */}
                      {cr.reviewerComment && (
                        <Box sx={{ bgcolor: cr.status === 'approved' ? '#e8f5e9' : '#ffebee', borderRadius: 1, px: 1.5, py: 1, mb: 1 }}>
                          <Typography sx={{ fontSize: 11, fontWeight: 600, color: cr.status === 'approved' ? '#2e7d32' : '#c62828' }}>
                            관리자 코멘트: {cr.reviewerComment}
                          </Typography>
                        </Box>
                      )}

                      {/* 관리자 승인/반려 버튼 */}
                      {isAdmin && cr.status === 'pending' && (
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Button size="small" variant="contained" startIcon={<FluentIcon name="check" size={14} />}
                            onClick={() => openReviewDialog(cr)}
                            sx={{ bgcolor: '#2e7d32', fontSize: 12, textTransform: 'none', '&:hover': { bgcolor: '#1b5e20' } }}>
                            검토 및 승인
                          </Button>
                          <Button size="small" variant="outlined" startIcon={<FluentIcon name="cross" size={14} />}
                            onClick={() => { setReviewTarget(cr); setReviewComment(''); setReviewDialogOpen(true); }}
                            sx={{ color: '#c62828', borderColor: '#c62828', fontSize: 12, textTransform: 'none' }}>
                            반려
                          </Button>
                        </Box>
                      )}

                      {/* 본인 요청 취소 버튼 */}
                      {!isAdmin && cr.requesterId === currentUser.id && cr.status === 'pending' && (
                        <Box sx={{ mt: 1 }}>
                          <Button size="small" variant="outlined" startIcon={<FluentIcon name="cross" size={14} />}
                            onClick={() => {
                              showConfirm('이 수정 요청을 취소하시겠습니까?', '대기 중인 요청이 삭제됩니다.').then(ok => { if (ok) {
                                cancelRequest(cr.id);
                                setToast({ open: true, severity: 'info', message: '수정 요청이 취소되었습니다.' });
                              } }); }}
                            sx={{ color: '#999', borderColor: '#ccc', fontSize: 12, textTransform: 'none', '&:hover': { color: '#c62828', borderColor: '#c62828' } }}>
                            요청 취소
                          </Button>
                        </Box>
                      )}
                    </Paper>
                  );
                })}
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* ── 수식 편집 다이얼로그 (관리자) ── */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{modalMode === 'add' ? '새 수식 추가' : '수식 편집'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '16px !important' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="수식명" fullWidth value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <TextField label="유형" select value={form.badge} sx={{ minWidth: 120 }} onChange={e => setForm(f => ({ ...f, badge: e.target.value as any }))}>
              <MenuItem value="core">핵심</MenuItem>
              <MenuItem value="sub">하위</MenuItem>
              <MenuItem value="rate">비율</MenuItem>
            </TextField>
          </Box>
          <TextField label="수식" fullWidth value={form.expression} placeholder="예: 생산원가 = 재료비 + 가공비 + 제경비" onChange={e => setForm(f => ({ ...f, expression: e.target.value }))} />
          <TextField label="설명" fullWidth multiline rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <TextField label="변수 (쉼표 구분)" fullWidth value={form.variables} placeholder="재료비, 가공비, 제경비" onChange={e => setForm(f => ({ ...f, variables: e.target.value }))} />
          <Divider />
          <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 0.5 }}>적용 부서</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {ALL_DEPARTMENTS.map(dept => (
              <FormControlLabel key={dept} sx={{ mr: 0 }}
                control={
                  <Checkbox size="small" checked={form.departments.includes(dept)}
                    onChange={(e) => {
                      if (dept === '전체') {
                        setForm(f => ({ ...f, departments: e.target.checked ? ['전체'] : [] }));
                      } else {
                        setForm(f => {
                          const next = e.target.checked
                            ? [...f.departments.filter(d => d !== '전체'), dept]
                            : f.departments.filter(d => d !== dept);
                          return { ...f, departments: next.length === 0 ? ['전체'] : next };
                        });
                      }
                    }}
                  />
                }
                label={<Typography sx={{ fontSize: 12 }}>{dept}</Typography>}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setModalOpen(false)}>취소</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: '#003875' }}>{modalMode === 'add' ? '추가' : '저장'}</Button>
        </DialogActions>
      </Dialog>

      {/* ── 수정 요청 다이얼로그 (일반 사용자) ── */}
      <Dialog open={requestDialogOpen} onClose={() => setRequestDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Send sx={{ fontSize: 20, color: '#7b1fa2' }} />
          수정 요청
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '16px !important' }}>
          {requestTarget && (
            <Box sx={{ bgcolor: '#f5f5f5', borderRadius: 1.5, p: 2 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#003875', mb: 0.5 }}>대상 수식: {requestTarget.name}</Typography>
              <Typography sx={{ fontSize: 11, fontFamily: 'monospace', color: '#666' }}>{requestTarget.expression}</Typography>
            </Box>
          )}
          <Divider />
          <Typography variant="subtitle2" fontWeight={600}>변경할 내용</Typography>
          <TextField label="수식" fullWidth value={requestForm.expression}
            onChange={e => setRequestForm(f => ({ ...f, expression: e.target.value }))}
            sx={requestForm.expression !== requestTarget?.expression ? { '& .MuiOutlinedInput-root': { bgcolor: '#e8f5e9' } } : {}}
          />
          <TextField label="설명" fullWidth multiline rows={2} value={requestForm.description}
            onChange={e => setRequestForm(f => ({ ...f, description: e.target.value }))}
            sx={requestForm.description !== requestTarget?.description ? { '& .MuiOutlinedInput-root': { bgcolor: '#e8f5e9' } } : {}}
          />
          <TextField label="변수 (쉼표 구분)" fullWidth value={requestForm.variables}
            onChange={e => setRequestForm(f => ({ ...f, variables: e.target.value }))}
            sx={requestForm.variables !== requestTarget?.variables.join(', ') ? { '& .MuiOutlinedInput-root': { bgcolor: '#e8f5e9' } } : {}}
          />
          <Divider />
          <TextField label="요청 사유 (필수)" fullWidth multiline rows={2} value={requestForm.reason}
            onChange={e => setRequestForm(f => ({ ...f, reason: e.target.value }))}
            placeholder="변경이 필요한 이유를 설명해주세요"
            required
          />
          <Box sx={{ bgcolor: '#f3e5f5', borderRadius: 1, px: 2, py: 1 }}>
            <Typography sx={{ fontSize: 11, color: '#7b1fa2' }}>
              요청자: {currentUser.name} ({currentUser.department}) · 적용 업무: {currentUser.taskName}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRequestDialogOpen(false)}>취소</Button>
          <Button variant="contained" onClick={handleSubmitRequest} disabled={!requestForm.reason.trim()}
            sx={{ bgcolor: '#7b1fa2', '&:hover': { bgcolor: '#6a1b9a' } }}
            startIcon={<Send sx={{ fontSize: 16 }} />}>
            요청 제출
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── 승인/반려 검토 다이얼로그 (관리자) ── */}
      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FluentIcon name="admin" size={20} />
          변경 요청 검토
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {reviewTarget && (
            <>
              {/* 요청 정보 */}
              <Box sx={{ bgcolor: '#f5f5f5', borderRadius: 1.5, p: 2 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.5 }}>
                  {reviewTarget.requesterName} ({reviewTarget.department})
                </Typography>
                <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                  업무: {reviewTarget.taskName} · {formatDate(reviewTarget.createdAt)}
                </Typography>
              </Box>

              {/* diff 표시 */}
              <Box sx={{ bgcolor: '#fafafa', borderRadius: 1.5, p: 2, border: '1px solid #eee' }}>
                <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 1, color: '#003875' }}>
                  대상: {reviewTarget.originalFormula.name}
                </Typography>
                {reviewTarget.modifiedFields.expression && (
                  <>
                    <Typography sx={{ fontSize: 11, color: '#c62828', fontFamily: 'monospace' }}>- {reviewTarget.originalFormula.expression}</Typography>
                    <Typography sx={{ fontSize: 11, color: '#2e7d32', fontFamily: 'monospace', mb: 1 }}>+ {reviewTarget.modifiedFields.expression}</Typography>
                  </>
                )}
                {reviewTarget.modifiedFields.description && (
                  <Typography sx={{ fontSize: 11, color: '#2e7d32', mt: 0.5 }}>설명 변경: {reviewTarget.modifiedFields.description}</Typography>
                )}
              </Box>

              {/* 요청 사유 */}
              <Box sx={{ bgcolor: '#fff3e0', borderRadius: 1, px: 2, py: 1.5 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 600 }}>요청 사유</Typography>
                <Typography sx={{ fontSize: 12, color: '#333' }}>{reviewTarget.reason}</Typography>
              </Box>

              <Divider />

              {/* 적용 부서 선택 */}
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1 }}>승인 시 적용 부서</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {ALL_DEPARTMENTS.map(dept => (
                    <FormControlLabel key={dept} sx={{ mr: 0 }}
                      control={
                        <Checkbox size="small" checked={reviewDepts.includes(dept)}
                          onChange={(e) => {
                            if (dept === '전체') {
                              setReviewDepts(e.target.checked ? ['전체'] : []);
                            } else {
                              setReviewDepts(prev => {
                                const next = e.target.checked
                                  ? [...prev.filter(d => d !== '전체'), dept]
                                  : prev.filter(d => d !== dept);
                                return next.length === 0 ? ['전체'] : next;
                              });
                            }
                          }}
                        />
                      }
                      label={<Typography sx={{ fontSize: 12 }}>{dept}</Typography>}
                    />
                  ))}
                </Box>
              </Box>

              <TextField label="검토 코멘트" fullWidth multiline rows={2} value={reviewComment}
                onChange={e => setReviewComment(e.target.value)} placeholder="승인/반려 사유를 입력하세요" />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setReviewDialogOpen(false)}>취소</Button>
          <Button variant="outlined" onClick={handleReject} startIcon={<FluentIcon name="cross" size={16} />}
            sx={{ color: '#c62828', borderColor: '#c62828' }}>
            반려
          </Button>
          <Button variant="contained" onClick={handleApprove} startIcon={<FluentIcon name="check" size={16} />}
            sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}>
            승인
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── 수식별 변경요청 상세 팝업 ── */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FluentIcon name="schedule" size={20} />
          변경 요청 내역
          {detailRequests.length > 0 && (
            <Typography sx={{ fontSize: 13, color: 'text.secondary', ml: 1 }}>
              ({detailRequests[0]?.originalFormula.name})
            </Typography>
          )}
        </DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          {detailRequests.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>변경 요청이 없습니다.</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {detailRequests.map(cr => {
                const sBadge = statusBadge[cr.status];
                return (
                  <Paper key={cr.id} variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: cr.status === 'pending' ? '#fffde7' : '#fff' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, bgcolor: '#7b1fa2', fontSize: 10 }}>{cr.requesterName[0]}</Avatar>
                        <Typography sx={{ fontSize: 12, fontWeight: 700 }}>{cr.requesterName}</Typography>
                        <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>{cr.department}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>{formatDate(cr.createdAt)}</Typography>
                        <Chip label={sBadge.label} size="small" sx={{ bgcolor: sBadge.bg, color: sBadge.color, fontWeight: 700, fontSize: 10, height: 20 }} />
                      </Box>
                    </Box>
                    {/* diff */}
                    <Box sx={{ bgcolor: '#f5f5f5', borderRadius: 1, p: 1.5, mb: 1 }}>
                      {cr.modifiedFields.expression && (
                        <>
                          <Typography sx={{ fontSize: 10, color: '#c62828', fontFamily: 'monospace' }}>- {cr.originalFormula.expression}</Typography>
                          <Typography sx={{ fontSize: 10, color: '#2e7d32', fontFamily: 'monospace' }}>+ {cr.modifiedFields.expression}</Typography>
                        </>
                      )}
                      {cr.modifiedFields.description && (
                        <Typography sx={{ fontSize: 10, color: '#2e7d32', mt: 0.5 }}>설명: {cr.modifiedFields.description}</Typography>
                      )}
                      {cr.modifiedFields.variables && (
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                          {cr.modifiedFields.variables.filter(v => !cr.originalFormula.variables.includes(v)).map(v => (
                            <Chip key={v} label={`+ ${v}`} size="small" sx={{ fontSize: 9, height: 18, bgcolor: '#e8f5e9', color: '#2e7d32' }} />
                          ))}
                        </Box>
                      )}
                    </Box>
                    <Typography sx={{ fontSize: 11, color: 'text.secondary' }}><strong>사유:</strong> {cr.reason}</Typography>
                    {cr.reviewerComment && (
                      <Box sx={{ bgcolor: cr.status === 'approved' ? '#e8f5e9' : '#ffebee', borderRadius: 1, px: 1.5, py: 0.5, mt: 1 }}>
                        <Typography sx={{ fontSize: 10, color: cr.status === 'approved' ? '#2e7d32' : '#c62828' }}>
                          관리자: {cr.reviewerComment}
                        </Typography>
                      </Box>
                    )}
                    {cr.status === 'approved' && cr.approvedDepartments && (
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                        {cr.approvedDepartments.map(d => (
                          <Chip key={d} label={d} size="small"
                            sx={{ fontSize: 9, height: 18, bgcolor: d === '전체' ? '#e3f2fd' : '#e8f5e9', color: d === '전체' ? '#1565c0' : '#2e7d32' }} />
                        ))}
                      </Box>
                    )}
                    {/* 본인 대기 중 요청 취소 */}
                    {cr.requesterId === currentUser.id && cr.status === 'pending' && (
                      <Box sx={{ mt: 1 }}>
                        <Button size="small" startIcon={<FluentIcon name="cross" size={12} />}
                          onClick={() => {
                            if (window.confirm('이 수정 요청을 취소하시겠습니까?')) {
                              cancelRequest(cr.id);
                              setToast({ open: true, severity: 'info', message: '수정 요청이 취소되었습니다.' });
                              if (detailRequests.length <= 1) setDetailDialogOpen(false);
                            }
                          }}
                          sx={{ color: '#999', fontSize: 11, textTransform: 'none', '&:hover': { color: '#c62828' } }}>
                          요청 취소
                        </Button>
                      </Box>
                    )}
                  </Paper>
                );
              })}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDetailDialogOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>

      {/* ── 비관리자 새 수식 추가 요청 다이얼로그 ── */}
      <Dialog open={addRequestDialogOpen} onClose={() => setAddRequestDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Add sx={{ fontSize: 20, color: '#7b1fa2' }} />
          새 수식 추가 요청
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '16px !important' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="수식명" fullWidth value={addRequestForm.name}
              onChange={e => setAddRequestForm(f => ({ ...f, name: e.target.value }))} />
            <TextField label="유형" select value={addRequestForm.badge} sx={{ minWidth: 120 }}
              onChange={e => setAddRequestForm(f => ({ ...f, badge: e.target.value as Formula['badge'] }))}>
              <MenuItem value="core">핵심</MenuItem>
              <MenuItem value="sub">하위</MenuItem>
              <MenuItem value="rate">비율</MenuItem>
            </TextField>
          </Box>
          <TextField label="수식" fullWidth value={addRequestForm.expression}
            placeholder="예: 생산원가 = 재료비 + 가공비 + 제경비"
            onChange={e => setAddRequestForm(f => ({ ...f, expression: e.target.value }))} />
          <TextField label="설명" fullWidth multiline rows={2} value={addRequestForm.description}
            onChange={e => setAddRequestForm(f => ({ ...f, description: e.target.value }))} />
          <TextField label="변수 (쉼표 구분)" fullWidth value={addRequestForm.variables}
            placeholder="재료비, 가공비, 제경비"
            onChange={e => setAddRequestForm(f => ({ ...f, variables: e.target.value }))} />
          <Divider />
          <TextField label="요청 사유 (필수)" fullWidth multiline rows={2} value={addRequestForm.reason}
            onChange={e => setAddRequestForm(f => ({ ...f, reason: e.target.value }))}
            placeholder="새 수식이 필요한 이유를 설명해주세요" required />
          <Box sx={{ bgcolor: '#f3e5f5', borderRadius: 1, px: 2, py: 1 }}>
            <Typography sx={{ fontSize: 11, color: '#7b1fa2' }}>
              요청자: {currentUser.name} ({currentUser.department}) · 적용 업무: {currentUser.taskName}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddRequestDialogOpen(false)}>취소</Button>
          <Button variant="contained"
            onClick={handleSubmitAddRequest}
            disabled={!addRequestForm.name.trim() || !addRequestForm.expression.trim() || !addRequestForm.reason.trim()}
            sx={{ bgcolor: '#7b1fa2', '&:hover': { bgcolor: '#6a1b9a' } }}
            startIcon={<Send sx={{ fontSize: 16 }} />}>
            추가 요청 제출
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── 토스트 알림 ── */}
      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast(t => ({ ...t, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={toast.severity} variant="filled" onClose={() => setToast(t => ({ ...t, open: false }))}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ModelManagementPage;
