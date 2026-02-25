/**
 * @fileoverview ② 파싱 데이터 검토 페이지
 * @description 파싱된 데이터가 정확한지 확인 + 수동 보정. 매핑 정확도 사전 확인.
 */
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Grid, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, IconButton, Alert, CircularProgress, LinearProgress,
  Select, MenuItem, FormControl, InputLabel, Tooltip,
} from '@mui/material';
import { Check, Edit, PlayArrow, Save, Cancel } from '@mui/icons-material';
import { mappingAPI } from '../services/mapping';
import { parsingAPI } from '../services/parsing';
import type { MappingItem, MappingSummary } from '../types/mapping';

const statusColor = (status: string) => {
  switch (status) {
    case 'auto_mapped': return '#4caf50';
    case 'needs_review': return '#ff9800';
    case 'manual': return '#f44336';
    default: return '#9e9e9e';
  }
};

const statusLabel = (status: string) => {
  switch (status) {
    case 'auto_mapped': return '자동매핑';
    case 'needs_review': return '검토필요';
    case 'manual': return '수동매핑';
    default: return status;
  }
};

const ParsedDataReview: React.FC = () => {
  const [estimates, setEstimates] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mappingItems, setMappingItems] = useState<MappingItem[]>([]);
  const [summary, setSummary] = useState<MappingSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    loadEstimates();
  }, []);

  const loadEstimates = async () => {
    try {
      const res = await parsingAPI.getEstimates({ page: 1, size: 100, status: 'parsed' });
      setEstimates(res.data.data?.items || []);
    } catch {
      try {
        const res = await parsingAPI.getEstimates({ page: 1, size: 100 });
        setEstimates(res.data.data?.items || []);
      } catch {}
    }
  };

  const runAutoMap = async () => {
    if (!selectedId) return;
    setLoading(true);
    setError('');
    try {
      await mappingAPI.autoMap(selectedId);
      await loadMapping(selectedId);
    } catch (e: any) {
      setError(e.response?.data?.detail || '자동 매핑 실행 실패');
    }
    setLoading(false);
  };

  const loadMapping = async (id: number) => {
    try {
      const res = await mappingAPI.getMapping(id);
      const data = res.data.data;
      setMappingItems(data.items);
      setSummary(data.summary);
    } catch {
      setMappingItems([]);
      setSummary(null);
    }
  };

  const handleEdit = (index: number, currentName: string) => {
    setEditingIndex(index);
    setEditValue(currentName);
  };

  const handleSave = async (index: number) => {
    if (!selectedId) return;
    try {
      await mappingAPI.updateItem(selectedId, index, { confirmed_name: editValue });
      setEditingIndex(null);
      await loadMapping(selectedId);
    } catch (e: any) {
      setError('수정 실패');
    }
  };

  const handleSelectEstimate = (id: number) => {
    setSelectedId(id);
    loadMapping(id);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1, color: '#003875' }}>
        ② 파싱 데이터 검토
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        파싱된 데이터가 정확한지 확인하고, 매핑이 잘못된 항목은 수동으로 보정합니다. 매핑 정확도를 사전에 확인하세요.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* 견적서 선택 + 자동매핑 실행 */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 300 }}>
          <InputLabel>검토할 견적서 선택</InputLabel>
          <Select
            value={selectedId || ''}
            label="검토할 견적서 선택"
            onChange={(e) => handleSelectEstimate(Number(e.target.value))}
          >
            {estimates.map((est) => (
              <MenuItem key={est.id} value={est.id}>
                [{est.id}] {est.file_name} ({est.status})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
          onClick={runAutoMap}
          disabled={!selectedId || loading}
          sx={{ bgcolor: '#003875' }}
        >
          자동 매핑 실행
        </Button>
      </Paper>

      {/* 매핑 정확도 요약 카드 */}
      {summary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: '전체 항목', value: summary.total, color: '#1976d2' },
            { label: '자동매핑 (정확)', value: summary.auto_mapped, color: '#4caf50' },
            { label: '검토 필요', value: summary.needs_review, color: '#ff9800' },
            { label: '수동 보정 필요', value: summary.manual, color: '#f44336' },
          ].map((card) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.label}>
              <Card sx={{ borderLeft: `4px solid ${card.color}` }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" fontWeight="bold" color={card.color}>
                    {card.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* 매핑 정확도 바 */}
      {summary && summary.total > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" fontWeight={600}>매핑 정확도:</Typography>
            <LinearProgress
              variant="determinate"
              value={(summary.auto_mapped / summary.total) * 100}
              sx={{ flex: 1, height: 8, borderRadius: 4 }}
            />
            <Typography variant="body2" fontWeight={700} color="#003875">
              {((summary.auto_mapped / summary.total) * 100).toFixed(1)}%
            </Typography>
          </Box>
        </Paper>
      )}

      {/* 매핑 결과 테이블 */}
      {mappingItems.length > 0 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell width={50}>#</TableCell>
                <TableCell>원본 항목명</TableCell>
                <TableCell>→</TableCell>
                <TableCell>표준 매핑명</TableCell>
                <TableCell>카테고리</TableCell>
                <TableCell width={80}>신뢰도</TableCell>
                <TableCell width={100}>상태</TableCell>
                <TableCell width={80}>액션</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mappingItems.map((item) => (
                <TableRow
                  key={item.item_index}
                  sx={{
                    bgcolor: item.confirmed ? '#f1f8e9' : item.status === 'needs_review' ? '#fff8e1' : 'inherit',
                    '&:hover': { bgcolor: '#e3f2fd' }
                  }}
                >
                  <TableCell>{item.item_index + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{item.original_name}</TableCell>
                  <TableCell>→</TableCell>
                  <TableCell>
                    {editingIndex === item.item_index ? (
                      <TextField
                        size="small"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        autoFocus
                        fullWidth
                      />
                    ) : (
                      <Typography sx={{ color: statusColor(item.status), fontWeight: 'bold' }}>
                        {item.matched_name || '-'}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip label={item.category || '-'} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ color: statusColor(item.status), fontWeight: 'bold' }}>
                      {(item.score * 100).toFixed(0)}%
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={statusLabel(item.status)}
                      size="small"
                      sx={{ bgcolor: statusColor(item.status), color: 'white', fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell>
                    {editingIndex === item.item_index ? (
                      <>
                        <Tooltip title="저장">
                          <IconButton size="small" color="primary" onClick={() => handleSave(item.item_index)}>
                            <Save />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="취소">
                          <IconButton size="small" onClick={() => setEditingIndex(null)}>
                            <Cancel />
                          </IconButton>
                        </Tooltip>
                      </>
                    ) : (
                      <Tooltip title="수동 보정">
                        <IconButton size="small" onClick={() => handleEdit(item.item_index, item.matched_name)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                    )}
                    {item.confirmed && <Check fontSize="small" color="success" />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {selectedId && mappingItems.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            매핑 데이터가 없습니다. "자동 매핑 실행" 버튼을 클릭하여 매핑을 시작하세요.
          </Typography>
        </Paper>
      )}

      {!selectedId && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            검토할 견적서를 선택하세요. 파싱이 완료된 견적서만 표시됩니다.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default ParsedDataReview;
