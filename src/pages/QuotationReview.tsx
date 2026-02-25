import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, TextField, Chip, LinearProgress, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import CloseIcon from '@mui/icons-material/Close';
import { getQuotation, updateItem, reviewComplete, analyzeQuotation, getRawData, Quotation, QuotationItem } from '../services/quotationApi';

const statusChip = (status: string) => {
  const map: Record<string, { color: 'success' | 'warning' | 'error'; label: string }> = {
    auto: { color: 'success', label: '자동' },
    manual: { color: 'warning', label: '수동' },
    failed: { color: 'error', label: '실패' },
  };
  const s = map[status] || { color: 'warning' as const, label: status };
  return <Chip label={s.label} color={s.color} size="small" />;
};

export default function QuotationReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [rawDialogOpen, setRawDialogOpen] = useState(false);
  const [rawData, setRawData] = useState<string[][] | null>(null);
  const [rawLoading, setRawLoading] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const res = await getQuotation(Number(id));
    setQuotation(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]); // eslint-disable-line

  const handleSave = async (item: QuotationItem) => {
    await updateItem(Number(id), item.id, { mapped_value: parseFloat(editValue) });
    setEditingId(null);
    load();
  };

  const handleReviewComplete = async () => {
    await reviewComplete(Number(id));
    load();
  };

  const handleAnalyze = async () => {
    await analyzeQuotation(Number(id));
    navigate(`/analysis/${id}`);
  };

  const handleOpenRawData = async () => {
    setRawDialogOpen(true);
    setRawLoading(true);
    try {
      const res = await getRawData(Number(id));
      setRawData(res.data.rows);
    } catch {
      setRawData(null);
    }
    setRawLoading(false);
  };

  if (loading) return <LinearProgress />;
  if (!quotation) return <Typography>견적서를 찾을 수 없습니다.</Typography>;

  const items = quotation.items || [];
  const totalItems = items.length;
  const mappedItems = items.filter((i) => i.mapping_status !== 'failed').length;
  const accuracy = totalItems > 0 ? (mappedItems / totalItems) * 100 : 0;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">견적서 검토 — {quotation.file_name}</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<DescriptionIcon />} onClick={handleOpenRawData}>
            원본 파일 보기
          </Button>
          {quotation.status === 'review_pending' && (
            <Button variant="contained" color="success" onClick={handleReviewComplete}>검토 완료</Button>
          )}
          {quotation.status === 'review_done' && (
            <Button variant="contained" color="primary" onClick={handleAnalyze}>분석 실행</Button>
          )}
        </Stack>
      </Stack>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>카테고리</TableCell>
              <TableCell>항목명</TableCell>
              <TableCell>매핑값</TableCell>
              <TableCell>매핑상태</TableCell>
              <TableCell>신뢰도</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} sx={{ bgcolor: item.mapping_status === 'failed' ? 'error.light' : undefined }}>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.item_name}</TableCell>
                <TableCell
                  onClick={() => { if (editingId !== item.id) { setEditingId(item.id); setEditValue(String(item.mapped_value ?? '')); } }}
                  sx={{ cursor: 'pointer', minWidth: 120 }}
                >
                  {editingId === item.id ? (
                    <TextField
                      size="small"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave(item);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      onBlur={() => setEditingId(null)}
                      autoFocus
                      fullWidth
                    />
                  ) : (
                    item.mapped_value?.toLocaleString() ?? '-'
                  )}
                </TableCell>
                <TableCell>{statusChip(item.mapping_status)}</TableCell>
                <TableCell>
                  <LinearProgress variant="determinate" value={item.mapping_confidence * 100}
                    sx={{ width: 60, display: 'inline-block', mr: 1 }} />
                  {(item.mapping_confidence * 100).toFixed(0)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 하단: 매핑 정확도 + 검토 완료 버튼 */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="body1">
            매핑 정확도: <strong>{accuracy.toFixed(1)}%</strong> ({mappedItems}/{totalItems})
          </Typography>
          <LinearProgress variant="determinate" value={accuracy} sx={{ width: 200 }} />
        </Stack>
        {quotation.status === 'review_pending' && (
          <Button variant="contained" color="success" onClick={handleReviewComplete}>검토 완료</Button>
        )}
      </Stack>

      {/* 원본 파일 보기 모달 */}
      <Dialog open={rawDialogOpen} onClose={() => setRawDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          원본 파일 — {quotation.file_name}
          <IconButton onClick={() => setRawDialogOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {rawLoading && <LinearProgress />}
          {rawData && rawData.length > 0 ? (
            <TableContainer sx={{ maxHeight: 500 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {rawData[0].map((cell, i) => (
                      <TableCell key={i} sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>{cell}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rawData.slice(1).map((row, ri) => (
                    <TableRow key={ri}>
                      {row.map((cell, ci) => (
                        <TableCell key={ci}>{cell}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            !rawLoading && <Typography color="text.secondary">원본 데이터를 불러올 수 없습니다.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRawDialogOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
