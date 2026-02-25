/**
 * @fileoverview ④ 견적 비교 페이지 - UI 고도화
 * @description 제품 선택, 3자 비교 히트맵 테이블, 재질 변경 하이라이트, 바 차트
 */
import React, { useState } from 'react';
import {
  Box, Typography, Paper, Button, Card, CardContent, Grid, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  FormControl, InputLabel, Select, MenuItem, Tooltip, Divider, LinearProgress,
} from '@mui/material';
import { NavigateNext, NavigateBefore, SwapHoriz } from '@mui/icons-material';
import WorkflowStepper from '../components/WorkflowStepper';
import { useNavigate } from 'react-router-dom';

/* ── Mock 데이터 ── */
const products = [
  { id: 1, name: 'DUCT ASSY-SD A/VENT, LH' },
  { id: 2, name: 'BRACKET-FENDER MTG, RH' },
  { id: 3, name: 'COVER-RELAY BOX, UPR' },
];

interface CompRow {
  item: string;
  bidder: number;
  oem: number;
  mobis: number;
  material?: { bidder: string; oem: string; mobis: string; changed: boolean };
}

const mockComparison: CompRow[] = [
  { item: '원재료', bidder: 967, oem: 1020, mobis: 990 },
  { item: 'Masterbatch', bidder: 90, oem: 85, mobis: 95 },
  { item: '재료비 소계', bidder: 1057, oem: 1105, mobis: 1085 },
  { item: '노무비', bidder: 850, oem: 780, mobis: 820 },
  { item: '경비', bidder: 620, oem: 590, mobis: 650 },
  { item: '가공비 소계', bidder: 1470, oem: 1370, mobis: 1470 },
  { item: '제조원가', bidder: 2527, oem: 2475, mobis: 2555 },
  { item: '일반관리비', bidder: 253, oem: 248, mobis: 256 },
  { item: '이윤', bidder: 380, oem: 350, mobis: 370 },
  { item: '총원가', bidder: 3160, oem: 3073, mobis: 3181 },
];

const mockMaterials: { part: string; bidder: string; oem: string; mobis: string; changed: boolean }[] = [
  { part: '본체', bidder: 'PP+TD20', oem: 'PP+TD20', mobis: 'PP+TD20', changed: false },
  { part: '브라켓', bidder: 'SPHC-P', oem: 'SPHC-P', mobis: 'SPCC', changed: true },
  { part: '클립', bidder: 'POM', oem: 'POM', mobis: 'PA66', changed: true },
];

const getHeatColor = (val: number, min: number, max: number) => {
  if (max === min) return 'transparent';
  const ratio = (val - min) / (max - min);
  if (ratio < 0.33) return 'rgba(33,150,243,0.12)'; // blue=cheap
  if (ratio > 0.66) return 'rgba(244,67,54,0.12)'; // red=expensive
  return 'transparent';
};

const fmt = (n: number) => n.toLocaleString('ko-KR');

const QuotationComparison: React.FC = () => {
  const navigate = useNavigate();
  const [productId, setProductId] = useState<number | ''>('');

  const selected = productId !== '';

  // Bar chart data (simple CSS-based)
  const totals = selected ? {
    bidder: mockComparison.find(r => r.item === '총원가')!.bidder,
    oem: mockComparison.find(r => r.item === '총원가')!.oem,
    mobis: mockComparison.find(r => r.item === '총원가')!.mobis,
  } : null;
  const maxTotal = totals ? Math.max(totals.bidder, totals.oem, totals.mobis) : 1;

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <WorkflowStepper activeStep={3} />

      <Typography variant="h5" fontWeight={700} color="#003875" sx={{ mb: 0.5 }}>견적 비교</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        제품을 선택하여 입찰(A) / OEM(b) / MOBIS(B) 3자의 견적을 비교합니다.
      </Typography>

      {/* ── 제품 선택 ── */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 350 }}>
          <InputLabel>제품 선택</InputLabel>
          <Select value={productId} label="제품 선택" onChange={e => setProductId(e.target.value as number)}>
            {products.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
          </Select>
        </FormControl>
        {selected && <Chip label="3자 비교 데이터 로드됨" color="success" size="small" />}
      </Paper>

      {selected && (
        <>
          {/* ── 총원가 비교 바 차트 ── */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, color: '#003875' }}>
              📊 총원가 비교
            </Typography>
            {[
              { label: '입찰 (A)', value: totals!.bidder, color: '#003875' },
              { label: 'OEM (b)', value: totals!.oem, color: '#1976d2' },
              { label: 'MOBIS (B)', value: totals!.mobis, color: '#42a5f5' },
            ].map(bar => (
              <Box key={bar.label} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                <Typography variant="body2" fontWeight={600} sx={{ width: 80 }}>{bar.label}</Typography>
                <Box sx={{ flex: 1, position: 'relative' }}>
                  <Box sx={{
                    height: 28, borderRadius: 1.5, bgcolor: bar.color,
                    width: `${(bar.value / maxTotal) * 100}%`,
                    transition: 'width 0.5s ease',
                    display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pr: 1.5,
                  }}>
                    <Typography variant="caption" fontWeight={700} color="#fff">
                      ₩{fmt(bar.value)}
                    </Typography>
                  </Box>
                </Box>
                {bar.value === Math.min(totals!.bidder, totals!.oem, totals!.mobis) && (
                  <Chip label="최저" size="small" color="success" sx={{ fontWeight: 700 }} />
                )}
              </Box>
            ))}
          </Paper>

          {/* ── 3자 비교 히트맵 테이블 ── */}
          <TableContainer component={Paper} sx={{ mb: 3, borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                  <TableCell sx={{ fontWeight: 700 }}>항목</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#003875' }}>입찰 (A)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#1976d2' }}>OEM (b)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#42a5f5' }}>MOBIS (B)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>차이율</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockComparison.map((row, i) => {
                  const vals = [row.bidder, row.oem, row.mobis];
                  const minV = Math.min(...vals);
                  const maxV = Math.max(...vals);
                  const diffPct = minV > 0 ? ((maxV - minV) / minV * 100).toFixed(1) : '0';
                  const isSubtotal = row.item.includes('소계') || row.item === '제조원가' || row.item === '총원가';
                  return (
                    <TableRow key={i} sx={{
                      bgcolor: row.item === '총원가' ? '#e8eef5' : undefined,
                      '&:hover': { bgcolor: '#f0f4ff' },
                    }}>
                      <TableCell sx={{ fontWeight: isSubtotal ? 700 : 400, pl: isSubtotal ? 2 : 3 }}>
                        {row.item}
                      </TableCell>
                      {[row.bidder, row.oem, row.mobis].map((v, vi) => (
                        <TableCell key={vi} align="right" sx={{
                          fontFamily: 'monospace', fontWeight: isSubtotal ? 700 : 400,
                          bgcolor: getHeatColor(v, minV, maxV),
                        }}>
                          ₩{fmt(v)}
                        </TableCell>
                      ))}
                      <TableCell align="right">
                        <Chip label={`${diffPct}%`} size="small"
                          color={Number(diffPct) > 10 ? 'error' : Number(diffPct) > 5 ? 'warning' : 'default'}
                          variant="outlined" sx={{ fontWeight: 600 }} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* ── 재질 변경 하이라이트 ── */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <SwapHoriz color="warning" />
              <Typography variant="subtitle1" fontWeight={700} color="#003875">재질 변경 부품</Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                    <TableCell sx={{ fontWeight: 700 }}>부품</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>입찰</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>OEM</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>MOBIS</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>변경 여부</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockMaterials.map((m, i) => (
                    <TableRow key={i} sx={{ bgcolor: m.changed ? '#fff3e0' : undefined }}>
                      <TableCell sx={{ fontWeight: 600 }}>{m.part}</TableCell>
                      <TableCell>{m.bidder}</TableCell>
                      <TableCell>{m.oem}</TableCell>
                      <TableCell sx={{ fontWeight: m.changed ? 700 : 400, color: m.changed ? '#e65100' : undefined }}>
                        {m.mobis}
                      </TableCell>
                      <TableCell>
                        {m.changed ? (
                          <Chip label="재질 변경" size="small" color="warning" sx={{ fontWeight: 700 }} />
                        ) : (
                          <Chip label="동일" size="small" variant="outlined" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}

      {!selected && (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            제품을 선택해주세요
          </Typography>
          <Typography variant="body2" color="text.disabled">
            제품 선택 후 입찰/OEM/MOBIS 3자 견적 비교 결과가 표시됩니다.
          </Typography>
        </Paper>
      )}

      {/* ── 네비게이션 ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button variant="outlined" startIcon={<NavigateBefore />} onClick={() => navigate('/verification')}>
          검증으로
        </Button>
        <Button variant="contained" endIcon={<NavigateNext />}
          onClick={() => navigate('/report')}
          disabled={!selected}
          sx={{ bgcolor: '#003875', px: 4 }}>
          리포트로 이동
        </Button>
      </Box>
    </Box>
  );
};

export default QuotationComparison;
