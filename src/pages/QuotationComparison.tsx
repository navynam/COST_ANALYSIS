import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, FormControl, InputLabel, Select, MenuItem, LinearProgress,
  Checkbox, Button, Stack, Stepper, Step, StepLabel, Chip,
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { getProducts, Product } from '../services/productApi';
import { getProductQuotations } from '../services/quotationApi';
import { getComparison, ComparisonData } from '../services/comparisonApi';
import { Quotation } from '../services/quotationApi';

const steps = ['제품 선택', '견적서 선택', '비교 결과'];

const statusLabel: Record<string, string> = {
  uploaded: '업로드',
  parsing: '파싱중',
  review_pending: '검토대기',
  review_done: '검토완료',
  analyzed: '분석완료',
};

export default function QuotationComparison() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState<number | ''>('');
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [data, setData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => { getProducts().then((r) => setProducts(r.data)); }, []);

  useEffect(() => {
    if (!productId) { setQuotations([]); setSelectedIds([]); setData(null); setActiveStep(0); return; }
    setActiveStep(1);
    setSelectedIds([]);
    setData(null);
    getProductQuotations(productId as number).then((r) => setQuotations(r.data));
  }, [productId]);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleCompare = async () => {
    if (selectedIds.length < 2) return;
    setLoading(true);
    const res = await getComparison(productId as number, selectedIds);
    setData(res.data);
    setActiveStep(2);
    setLoading(false);
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ color: '#003875' }} gutterBottom>④ 견적서 비교</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        제품을 선택한 후 해당 제품의 견적서들을 선택하여 업체별로 비교합니다.
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
        {steps.map((label) => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>

      {/* Step 1: 제품 선택 */}
      <FormControl sx={{ minWidth: 300, mb: 3 }}>
        <InputLabel>제품 선택</InputLabel>
        <Select value={productId} label="제품 선택" onChange={(e) => setProductId(e.target.value as number)}>
          {products.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
        </Select>
      </FormControl>

      {/* Step 2: 견적서 목록 + 체크박스 */}
      {productId && quotations.length > 0 && !data && (
        <Box mb={3}>
          <Typography variant="subtitle1" gutterBottom>견적서 목록 (2개 이상 선택)</Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" />
                  <TableCell>업체명</TableCell>
                  <TableCell>등록일</TableCell>
                  <TableCell>상태</TableCell>
                  <TableCell>파일명</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quotations.map((q) => (
                  <TableRow key={q.id} hover onClick={() => toggleSelect(q.id)} sx={{ cursor: 'pointer' }}>
                    <TableCell padding="checkbox">
                      <Checkbox checked={selectedIds.includes(q.id)} />
                    </TableCell>
                    <TableCell>{q.vendor_name || `업체 ${q.vendor_id}`}</TableCell>
                    <TableCell>{new Date(q.uploaded_at).toLocaleDateString('ko-KR')}</TableCell>
                    <TableCell>
                      <Chip label={statusLabel[q.status] || q.status} size="small" />
                    </TableCell>
                    <TableCell>{q.file_name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Stack direction="row" justifyContent="flex-end" mt={2}>
            <Button
              variant="contained"
              startIcon={<CompareArrowsIcon />}
              disabled={selectedIds.length < 2}
              onClick={handleCompare}
            >
              비교하기 ({selectedIds.length}개 선택)
            </Button>
          </Stack>
        </Box>
      )}

      {productId && quotations.length === 0 && !loading && (
        <Typography color="text.secondary">해당 제품의 견적서가 없습니다.</Typography>
      )}

      {loading && <LinearProgress />}

      {/* Step 3: 비교 결과 */}
      {data && data.items.length > 0 && (
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle1">비교 결과</Typography>
            <Button size="small" onClick={() => { setData(null); setActiveStep(1); }}>다시 선택</Button>
          </Stack>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>카테고리</TableCell>
                  <TableCell>항목</TableCell>
                  {data.vendors.map((v) => <TableCell key={v.id} align="right">{v.name}</TableCell>)}
                  <TableCell align="right">차이율</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.items.map((item, idx) => {
                  const diffRate = item.min_value && item.max_value && item.min_value > 0
                    ? ((item.max_value - item.min_value) / item.min_value) * 100
                    : null;
                  return (
                    <TableRow key={idx}>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.item_name}</TableCell>
                      {data.vendors.map((v) => {
                        const val = item.values[String(v.id)];
                        const isMin = val != null && val === item.min_value;
                        const isMax = val != null && val === item.max_value && data.vendors.length > 1;
                        return (
                          <TableCell key={v.id} align="right" sx={{
                            bgcolor: isMin ? 'success.light' : isMax ? 'error.light' : undefined,
                            fontWeight: (isMin || isMax) ? 'bold' : undefined,
                          }}>
                            {val?.toLocaleString() ?? '-'}
                          </TableCell>
                        );
                      })}
                      <TableCell align="right">
                        {diffRate != null ? `${diffRate.toFixed(1)}%` : '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {data && data.items.length === 0 && (
        <Typography color="text.secondary">비교할 항목이 없습니다. (검토 완료 이상 상태의 견적서가 필요합니다)</Typography>
      )}
    </Box>
  );
}
