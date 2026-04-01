import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, TextField, Button,
} from '@mui/material';
import { C } from '../../../shared/constants/colors';
import type { SearchFilters } from '../types';

interface SearchFilterDialogProps {
  open: boolean;
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onApply: () => void;
  onReset: () => void;
  onClose: () => void;
}

const SearchFilterDialog: React.FC<SearchFilterDialogProps> = ({
  open, filters, onChange, onApply, onReset, onClose,
}) => {
  const update = (key: keyof SearchFilters, value: string) =>
    onChange({ ...filters, [key]: value });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontSize: 16, fontWeight: 600 }}>상세 조회</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 1 }}>
          <TextField fullWidth label="문서명" value={filters.documentName} size="small" placeholder="문서명을 입력하세요"
            onChange={e => update('documentName', e.target.value)} />
          <TextField fullWidth label="등록자" value={filters.uploader} size="small" placeholder="등록자명을 입력하세요"
            onChange={e => update('uploader', e.target.value)} />
          <TextField fullWidth label="등록부서" value={filters.department} size="small" placeholder="부서명을 입력하세요"
            onChange={e => update('department', e.target.value)} />
          <Box />
          <TextField fullWidth type="date" label="업로드 시작일" value={filters.dateFrom} size="small"
            InputLabelProps={{ shrink: true }} onChange={e => update('dateFrom', e.target.value)} />
          <TextField fullWidth type="date" label="업로드 종료일" value={filters.dateTo} size="small"
            InputLabelProps={{ shrink: true }} onChange={e => update('dateTo', e.target.value)} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onReset} sx={{ color: C.gray }}>초기화</Button>
        <Button onClick={onClose} sx={{ color: C.gray }}>취소</Button>
        <Button onClick={onApply} variant="contained" sx={{ bgcolor: C.blue }}>조회</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SearchFilterDialog;
