/**
 * @fileoverview 견적서 파싱 페이지
 * @description 엑셀 견적서 업로드, 파싱 결과 목록 조회, 상세 보기 등을 제공
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Button, IconButton, Chip, LinearProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Checkbox, TextField, InputAdornment, MenuItem, Select, FormControl,
  InputLabel, Dialog, DialogTitle, DialogContent, DialogActions,
  Card, CardContent, Tooltip, Alert,
} from '@mui/material';
import {
  CloudUpload, Delete, Search, Close, InsertDriveFile,
  CheckCircle, Error as ErrorIcon, HourglassEmpty, Visibility,
} from '@mui/icons-material';
import { parsingAPI } from '../services/parsing';
import type { EstimateItem, Estimate, UploadQueueItem } from '../types/estimate';

const statusConfig: Record<string, { label: string; color: 'success' | 'error' | 'warning' | 'info' | 'default' }> = {
  uploading: { label: '업로드중', color: 'info' },
  parsing: { label: '파싱중', color: 'warning' },
  parsed: { label: '완료', color: 'success' },
  failed: { label: '실패', color: 'error' },
};

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

const formatAmount = (amount: number) =>
  amount.toLocaleString('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 });

const Parsing: React.FC = () => {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<number[]>([]);
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItems, setDetailItems] = useState<EstimateItem[]>([]);
  const [detailEstimate, setDetailEstimate] = useState<Estimate | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchEstimates = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, size };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const { data } = await parsingAPI.getEstimates(params);
      setEstimates(data.items);
      setTotal(data.total);
    } catch (e) {
      // 목록 조회 실패 시 빈 상태 유지
    } finally {
      setLoading(false);
    }
  }, [page, size, statusFilter, search]);

  useEffect(() => { fetchEstimates(); }, [fetchEstimates]);

  const handleFiles = async (files: FileList | File[]) => {
    const fileArr = Array.from(files);
    const queueItems: UploadQueueItem[] = fileArr.map(f => ({ file: f, status: 'pending', progress: 0 }));
    setUploadQueue(prev => [...prev, ...queueItems]);

    for (let i = 0; i < fileArr.length; i++) {
      const idx = uploadQueue.length + i;
      setUploadQueue(prev => prev.map((item, j) =>
        j === idx ? { ...item, status: 'uploading', progress: 30 } : item
      ));
      try {
        setUploadQueue(prev => prev.map((item, j) =>
          j === idx ? { ...item, status: 'parsing', progress: 60 } : item
        ));
        await parsingAPI.uploadEstimate(fileArr[i]);
        setUploadQueue(prev => prev.map((item, j) =>
          j === idx ? { ...item, status: 'done', progress: 100 } : item
        ));
      } catch (e: any) {
        setUploadQueue(prev => prev.map((item, j) =>
          j === idx ? { ...item, status: 'error', progress: 0, error: e?.response?.data?.detail || '업로드 실패' } : item
        ));
      }
    }
    fetchEstimates();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFiles(e.target.files);
    e.target.value = '';
  };

  const handleSelectAll = (checked: boolean) => {
    setSelected(checked ? estimates.map(e => e.id) : []);
  };

  const handleSelect = (id: number) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    await parsingAPI.deleteEstimate(id);
    fetchEstimates();
  };

  const handleBatchDelete = async () => {
    if (!selected.length || !window.confirm(`${selected.length}건을 삭제하시겠습니까?`)) return;
    await parsingAPI.batchDeleteEstimates(selected);
    setSelected([]);
    fetchEstimates();
  };

  const handleDetail = async (est: Estimate) => {
    try {
      const { data } = await parsingAPI.getEstimateDetail(est.id);
      setDetailEstimate(est);
      setDetailItems(data.items || []);
      setDetailOpen(true);
    } catch (e) {
      // 상세 조회 실패 시 무시
    }
  };

  const removeQueueItem = (idx: number) => {
    setUploadQueue(prev => prev.filter((_, i) => i !== idx));
  };

  // Section subtotals for detail modal
  const sectionSubtotals = detailItems.reduce<Record<string, number>>((acc, item) => {
    const section = item.section || '기타';
    acc[section] = (acc[section] || 0) + (item.amount || 0);
    return acc;
  }, {});

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1, color: '#003875' }}>
        ① 파싱 (업로드)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        엑셀 견적서를 드래그앤드롭으로 업로드하면 AI가 자동으로 파싱합니다.
      </Typography>

      {/* Upload Area */}
      <Paper
        sx={{
          p: 4, mb: 3, border: '2px dashed',
          borderColor: dragOver ? '#003875' : '#ccc',
          bgcolor: dragOver ? 'rgba(0,56,117,0.04)' : '#fafafa',
          textAlign: 'center', cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input" type="file" hidden multiple
          accept=".xlsx,.xls,.xlsm"
          onChange={handleFileInput}
        />
        <CloudUpload sx={{ fontSize: 48, color: '#003875', mb: 1 }} />
        <Typography variant="body1" color="text.secondary">
          파일을 드래그하거나 클릭하여 업로드
        </Typography>
        <Typography variant="caption" color="text.disabled">
          Excel 파일 (.xlsx, .xls) · 다중 파일 지원
        </Typography>
      </Paper>

      {/* Upload Queue */}
      {uploadQueue.length > 0 && (
        <Paper sx={{ mb: 3, p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>업로드 큐</Typography>
          {uploadQueue.map((item, idx) => (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <InsertDriveFile fontSize="small" color="action" />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" noWrap>{item.file.name}</Typography>
                <Typography variant="caption" color="text.secondary">{formatBytes(item.file.size)}</Typography>
                <LinearProgress
                  variant={item.status === 'parsing' ? 'indeterminate' : 'determinate'}
                  value={item.progress}
                  sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                  color={item.status === 'error' ? 'error' : item.status === 'done' ? 'success' : 'primary'}
                />
              </Box>
              <Chip
                size="small"
                label={item.status === 'pending' ? '대기' : item.status === 'uploading' ? '업로드중' :
                  item.status === 'parsing' ? '파싱중' : item.status === 'done' ? '완료' : '실패'}
                color={item.status === 'done' ? 'success' : item.status === 'error' ? 'error' : 'default'}
              />
              <IconButton size="small" onClick={() => removeQueueItem(idx)}>
                <Close fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Paper>
      )}

      {/* Filters */}
      <Paper sx={{ mb: 2, p: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          size="small" placeholder="파일명 검색" value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && fetchEstimates()}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
          }}
          sx={{ width: 250 }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>상태</InputLabel>
          <Select value={statusFilter} label="상태" onChange={e => setStatusFilter(e.target.value)}>
            <MenuItem value="">전체</MenuItem>
            <MenuItem value="parsed">완료</MenuItem>
            <MenuItem value="parsing">파싱중</MenuItem>
            <MenuItem value="failed">실패</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ flex: 1 }} />
        {selected.length > 0 && (
          <Button variant="outlined" color="error" startIcon={<Delete />} onClick={handleBatchDelete}>
            {selected.length}건 삭제
          </Button>
        )}
        <Typography variant="body2" color="text.secondary">총 {total}건</Typography>
      </Paper>

      {/* Table */}
      {loading && <LinearProgress sx={{ mb: 1 }} />}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selected.length === estimates.length && estimates.length > 0}
                  indeterminate={selected.length > 0 && selected.length < estimates.length}
                  onChange={(_, checked) => handleSelectAll(checked)}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>파일명</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>업체명</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">항목 수</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">총금액</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>상태</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>업로드일</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">액션</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {estimates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  업로드된 견적서가 없습니다.
                </TableCell>
              </TableRow>
            ) : estimates.map(est => {
              const sc = statusConfig[est.status] || { label: est.status, color: 'default' as const };
              return (
                <TableRow
                  key={est.id} hover
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0,56,117,0.03)' } }}
                  onClick={() => handleDetail(est)}
                >
                  <TableCell padding="checkbox" onClick={e => e.stopPropagation()}>
                    <Checkbox checked={selected.includes(est.id)} onChange={() => handleSelect(est.id)} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <InsertDriveFile fontSize="small" color="action" />
                      <Typography variant="body2" noWrap sx={{ maxWidth: 250 }}>{est.file_name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{est.company_name || '-'}</TableCell>
                  <TableCell align="right">{est.item_count}</TableCell>
                  <TableCell align="right">{formatAmount(est.total_amount)}</TableCell>
                  <TableCell>
                    <Chip size="small" label={sc.label} color={sc.color}
                      icon={est.status === 'parsed' ? <CheckCircle /> : est.status === 'failed' ? <ErrorIcon /> : <HourglassEmpty />}
                    />
                  </TableCell>
                  <TableCell>
                    {est.created_at ? new Date(est.created_at).toLocaleDateString('ko-KR') : '-'}
                  </TableCell>
                  <TableCell align="center" onClick={e => e.stopPropagation()}>
                    <Tooltip title="상세보기">
                      <IconButton size="small" onClick={() => handleDetail(est)}>
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="삭제">
                      <IconButton size="small" color="error" onClick={() => handleDelete(est.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination - simple */}
      {total > size && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
          <Button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>이전</Button>
          <Typography variant="body2" sx={{ lineHeight: '36px' }}>
            {page} / {Math.ceil(total / size)}
          </Typography>
          <Button disabled={page >= Math.ceil(total / size)} onClick={() => setPage(p => p + 1)}>다음</Button>
        </Box>
      )}

      {/* Detail Modal */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={600}>
            파싱 결과 — {detailEstimate?.file_name}
          </Typography>
          <IconButton onClick={() => setDetailOpen(false)}><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {/* Section Subtotals */}
          {Object.keys(sectionSubtotals).length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              {Object.entries(sectionSubtotals).map(([section, amount]) => (
                <Card variant="outlined" key={section} sx={{ minWidth: 180, flex: '1 1 200px', maxWidth: 280 }}>
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Typography variant="caption" color="text.secondary">{section}</Typography>
                    <Typography variant="subtitle1" fontWeight={600}>{formatAmount(amount)}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {detailItems.length === 0 ? (
            <Alert severity="info">파싱된 항목이 없습니다.</Alert>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>원본명</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">금액</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">단가</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">수량</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>섹션</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>시트</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">행번호</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detailItems.map((item, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{item.original_name}</TableCell>
                      <TableCell align="right">{formatAmount(item.amount)}</TableCell>
                      <TableCell align="right">{item.unit_price ? formatAmount(item.unit_price) : '-'}</TableCell>
                      <TableCell align="right">{item.quantity ?? '-'}</TableCell>
                      <TableCell>{item.section || '-'}</TableCell>
                      <TableCell>{item.sheet_name || '-'}</TableCell>
                      <TableCell align="right">{item.row_number ?? '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Parsing;
