import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, FormControl, InputLabel,
  Select, MenuItem, Stack, Alert,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useNavigate } from 'react-router-dom';
import { uploadQuotation, getQuotations, Quotation } from '../services/quotationApi';
import { getProducts, Product } from '../services/productApi';
import { getVendors, Vendor } from '../services/vendorApi';

const statusColors: Record<string, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  uploaded: 'default',
  parsing: 'info',
  review_pending: 'warning',
  review_done: 'success',
  analyzed: 'success',
};

const statusLabels: Record<string, string> = {
  uploaded: '업로드됨',
  parsing: '파싱 중',
  review_pending: '검토 대기',
  review_done: '검토 완료',
  analyzed: '분석 완료',
};

export default function QuotationUpload() {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorId, setVendorId] = useState<number | ''>('');
  const [productId, setProductId] = useState<number | ''>('');
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const [q, p, v] = await Promise.all([getQuotations(), getProducts(), getVendors()]);
    setQuotations(q.data);
    setProducts(p.data);
    setVendors(v.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async () => {
    if (!file || !vendorId || !productId) { setError('파일, 업체, 제품을 모두 선택하세요.'); return; }
    setError('');
    const fd = new FormData();
    fd.append('file', file);
    fd.append('vendor_id', String(vendorId));
    fd.append('product_id', String(productId));
    await uploadQuotation(fd);
    setFile(null);
    load();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) setFile(e.dataTransfer.files[0]);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>견적서 업로드</Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>업체 선택</InputLabel>
              <Select value={vendorId} label="업체 선택" onChange={(e) => setVendorId(e.target.value as number)}>
                {vendors.map((v) => <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>제품 선택</InputLabel>
              <Select value={productId} label="제품 선택" onChange={(e) => setProductId(e.target.value as number)}>
                {products.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>

          <Paper
            variant="outlined"
            sx={{
              p: 4, textAlign: 'center', cursor: 'pointer',
              bgcolor: dragOver ? 'action.hover' : 'background.default',
              border: '2px dashed', borderColor: dragOver ? 'primary.main' : 'divider',
            }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
            <Typography>{file ? file.name : '엑셀 파일을 드래그하거나 클릭하여 선택'}</Typography>
            <input id="file-input" type="file" hidden accept=".xlsx,.xls" onChange={(e) => e.target.files && setFile(e.target.files[0])} />
          </Paper>

          {error && <Alert severity="error">{error}</Alert>}
          <Button variant="contained" onClick={handleUpload} disabled={!file}>업로드</Button>
        </Stack>
      </Paper>

      <Typography variant="h6" gutterBottom>업로드된 견적서</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>파일명</TableCell>
              <TableCell>업체</TableCell>
              <TableCell>제품</TableCell>
              <TableCell>상태</TableCell>
              <TableCell>업로드일</TableCell>
              <TableCell>작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quotations.map((q) => (
              <TableRow key={q.id}>
                <TableCell>{q.file_name}</TableCell>
                <TableCell>{q.vendor_name}</TableCell>
                <TableCell>{q.product_name}</TableCell>
                <TableCell>
                  <Chip label={statusLabels[q.status] || q.status} color={statusColors[q.status] || 'default'} size="small" />
                </TableCell>
                <TableCell>{new Date(q.uploaded_at).toLocaleDateString('ko-KR')}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => navigate(`/review/${q.id}`)}>검토</Button>
                  {(q.status === 'review_done' || q.status === 'analyzed') && (
                    <Button size="small" onClick={() => navigate(`/analysis/${q.id}`)}>분석</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
