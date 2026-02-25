/**
 * @fileoverview 원가 모델관리 페이지
 * @description 원가 구조 수식 및 기준을 카드 형태로 관리
 */
import React, { useState } from 'react';
import {
  Box, Typography, Button, Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, IconButton, Snackbar, Alert,
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';

/* ── 타입 ── */
interface Formula {
  id: string;
  name: string;
  badge: 'core' | 'sub' | 'rate';
  expression: string;
  description: string;
  variables: string[];
}

const badgeConfig = {
  core: { label: '핵심', color: '#003875', bg: '#e8f4fd' },
  sub: { label: '하위', color: '#2e7d32', bg: '#e8fde8' },
  rate: { label: '비율', color: '#e65100', bg: '#fff3e0' },
};

/* ── Mock 데이터 ── */
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

const ModelManagement: React.FC = () => {
  const [formulas, setFormulas] = useState<Formula[]>(initialFormulas);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editTarget, setEditTarget] = useState<Formula | null>(null);
  const [form, setForm] = useState({ name: '', badge: 'sub' as Formula['badge'], expression: '', description: '', variables: '' });
  const [toast, setToast] = useState<{ open: boolean; severity: 'success' | 'error' | 'info'; message: string }>({ open: false, severity: 'info', message: '' });

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
      setFormulas(prev => [...prev, { id: `f${Date.now()}`, name: form.name, badge: form.badge, expression: form.expression, description: form.description, variables: vars }]);
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

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>원가 모델관리</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>원가 구조 수식 및 기준을 관리합니다</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openAdd}
          sx={{ bgcolor: '#003875', '&:hover': { bgcolor: '#002a5c' }, borderRadius: 2, px: 3 }}>
          새 수식 추가
        </Button>
      </Box>

      {/* 수식 카드 리스트 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {formulas.map(f => {
          const badge = badgeConfig[f.badge];
          return (
            <Paper key={f.id} sx={{ p: 3, borderRadius: 2.5, border: '1px solid #e0e0e0', '&:hover': { boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }, transition: 'box-shadow 0.2s' }}>
              {/* 카드 헤더 */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Typography variant="subtitle1" fontWeight={700}>{f.name}</Typography>
                <Chip label={badge.label} size="small"
                  sx={{ bgcolor: badge.bg, color: badge.color, fontWeight: 600, fontSize: 11, height: 22 }} />
              </Box>

              {/* 수식 */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, bgcolor: '#f8f9fa', borderRadius: 1.5, px: 2, py: 1 }}>
                <Typography sx={{ fontSize: 16 }}>📐</Typography>
                <Typography component="code" sx={{ fontFamily: 'monospace', fontSize: 13, color: '#333', fontWeight: 500 }}>
                  {f.expression}
                </Typography>
              </Box>

              {/* 설명 */}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                {f.description}
              </Typography>

              {/* 변수 태그 */}
              <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', mb: 2 }}>
                {f.variables.map(v => (
                  <Chip key={v} label={v} size="small" variant="outlined"
                    sx={{ fontSize: 11, height: 24, borderColor: '#ccc', color: '#555' }} />
                ))}
              </Box>

              {/* 액션 버튼 */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" startIcon={<Edit sx={{ fontSize: 14 }} />} onClick={() => openEdit(f)}
                  sx={{ color: '#003875', fontSize: 12, textTransform: 'none' }}>
                  편집
                </Button>
                <Button size="small" startIcon={<Delete sx={{ fontSize: 14 }} />} onClick={() => handleDelete(f)}
                  sx={{ color: '#999', fontSize: 12, textTransform: 'none', '&:hover': { color: '#d32f2f' } }}>
                  삭제
                </Button>
              </Box>
            </Paper>
          );
        })}
      </Box>

      {/* 수식 추가/편집 Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {modalMode === 'add' ? '새 수식 추가' : '수식 편집'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '16px !important' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="수식명" fullWidth value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <TextField label="유형" select value={form.badge} sx={{ minWidth: 120 }}
              onChange={e => setForm(f => ({ ...f, badge: e.target.value as Formula['badge'] }))}>
              <MenuItem value="core">핵심</MenuItem>
              <MenuItem value="sub">하위</MenuItem>
              <MenuItem value="rate">비율</MenuItem>
            </TextField>
          </Box>
          <TextField label="수식" fullWidth value={form.expression} placeholder="예: 생산원가 = 재료비 + 가공비 + 제경비"
            onChange={e => setForm(f => ({ ...f, expression: e.target.value }))} />
          <TextField label="설명" fullWidth multiline rows={2} value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <TextField label="변수 (쉼표 구분)" fullWidth value={form.variables} placeholder="재료비, 가공비, 제경비"
            onChange={e => setForm(f => ({ ...f, variables: e.target.value }))} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setModalOpen(false)}>취소</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: '#003875' }}>
            {modalMode === 'add' ? '추가' : '저장'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast(t => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={toast.severity} variant="filled" onClose={() => setToast(t => ({ ...t, open: false }))}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ModelManagement;
