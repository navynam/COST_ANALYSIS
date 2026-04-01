/**
 * @fileoverview 원가 모델관리 페이지
 * @description 원가 구조 수식 및 기준을 카드 형태로 관리
 */
import React, { useState, useCallback } from 'react';
import {
  Box, Typography, Button, Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Snackbar, Alert, Tabs, Tab,
} from '@mui/material';
import { Edit, Delete, Add, AccountTree, Settings } from '@mui/icons-material';
import { useModelManagement, badgeConfig } from './hooks/useModelManagement';
import SimpleKnowledgeGraphTab from './components/SimpleKnowledgeGraphTab';

const ModelManagementPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const {
    formulas, modalOpen, setModalOpen,
    modalMode, form, setForm, toast, setToast,
    openAdd, openEdit, handleSave, handleDelete,
    lastAddedFormulaId, clearLastAddedFormula,
  } = useModelManagement();

  // 🔄 새 수식 하이라이트 완료 후 처리
  const handleNewFormulaHighlighted = useCallback(() => {
    clearLastAddedFormula();
  }, [clearLastAddedFormula]);

  // 🎯 탭 변경 처리
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    
    // 지식그래프 탭으로 이동할 때 로그 출력
    if (newValue === 1) {
      console.log('🧠 지식그래프 탭으로 전환:', {
        수식개수: formulas.length,
        시간: new Date().toLocaleTimeString()
      });
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 📊 페이지 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>원가 모델관리</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            원가 구조 수식 및 지식그래프를 관리합니다
          </Typography>
        </Box>
        {currentTab === 0 && (
          <Button variant="contained" startIcon={<Add />} onClick={openAdd}
            sx={{ bgcolor: '#003875', '&:hover': { bgcolor: '#002a5c' }, borderRadius: 2, px: 3 }}>
            새 수식 추가
          </Button>
        )}
      </Box>

      {/* 📋 탭 네비게이션 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: 14,
            }
          }}
        >
          <Tab 
            icon={<Settings />} 
            iconPosition="start" 
            label="모델 관리" 
            sx={{ minHeight: 48 }}
          />
          <Tab 
            icon={<AccountTree />} 
            iconPosition="start" 
            label="지식그래프" 
            sx={{ minHeight: 48 }}
          />
        </Tabs>
      </Box>

      {/* 📊 탭 콘텐츠 */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {currentTab === 0 ? (
          // 🔧 모델 관리 탭
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%', overflow: 'auto' }}>
        {formulas.map(f => {
          const badge = badgeConfig[f.badge];
          return (
            <Paper key={f.id} sx={{ p: 3, borderRadius: 2.5, border: '1px solid #e0e0e0', '&:hover': { boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }, transition: 'box-shadow 0.2s' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Typography variant="subtitle1" fontWeight={700}>{f.name}</Typography>
                <Chip label={badge.label} size="small" sx={{ bgcolor: badge.bg, color: badge.color, fontWeight: 600, fontSize: 11, height: 22 }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, bgcolor: '#f8f9fa', borderRadius: 1.5, px: 2, py: 1 }}>
                <Typography sx={{ fontSize: 16 }}>📐</Typography>
                <Typography component="code" sx={{ fontFamily: 'monospace', fontSize: 13, color: '#333', fontWeight: 500 }}>{f.expression}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>{f.description}</Typography>
              <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', mb: 2 }}>
                {f.variables.map(v => (
                  <Chip key={v} label={v} size="small" variant="outlined" sx={{ fontSize: 11, height: 24, borderColor: '#ccc', color: '#555' }} />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" startIcon={<Edit sx={{ fontSize: 14 }} />} onClick={() => openEdit(f)} sx={{ color: '#003875', fontSize: 12, textTransform: 'none' }}>편집</Button>
                <Button size="small" startIcon={<Delete sx={{ fontSize: 14 }} />} onClick={() => handleDelete(f)} sx={{ color: '#999', fontSize: 12, textTransform: 'none', '&:hover': { color: '#d32f2f' } }}>삭제</Button>
              </Box>
            </Paper>
          );
        })}
          </Box>
        ) : (
          // 🧠 지식그래프 탭 (실제 데이터 props로 전달, localStorage로 동기화)
          <SimpleKnowledgeGraphTab 
            formulas={formulas}
            newlyAddedFormulaId={lastAddedFormulaId}
            onNewFormulaHighlighted={handleNewFormulaHighlighted}
          />
        )}
      </Box>

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
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setModalOpen(false)}>취소</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: '#003875' }}>{modalMode === 'add' ? '추가' : '저장'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast(t => ({ ...t, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={toast.severity} variant="filled" onClose={() => setToast(t => ({ ...t, open: false }))}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ModelManagementPage;
