/**
 * @fileoverview ④ 견적서 비교 페이지
 * @description 3단계 선택 플로우: 아이템 → 견적서 복수선택 → 나란히 비교
 */
import React, { useState } from 'react';
import {
  Box, Typography, Paper, Button, Card, CardContent, CardActionArea, Grid, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Checkbox, FormControlLabel, FormGroup, Tooltip, Stepper, Step, StepLabel,
  Dialog, DialogTitle, DialogContent, TextField, IconButton,
} from '@mui/material';
import { NavigateNext, NavigateBefore, SwapHoriz, CheckCircle, Search, Close } from '@mui/icons-material';
import WorkflowStepper from '../components/WorkflowStepper';
import { useNavigate } from 'react-router-dom';

/* ── Mock 데이터 ── */
interface Product {
  id: string;
  name: string;
  material: string;
  quotationCount: number;
}

interface Quotation {
  id: string;
  vendor: string;
  date: string;
  label: string;
}

interface CompRow {
  item: string;
  isSubtotal?: boolean;
  values: Record<string, number>; // quotation id → amount
  material?: Record<string, string>; // quotation id → material name
}

const mockProducts: Product[] = [
  { id: '99919-AAA00', name: 'DUCT ASSY-SD A/VENT, LH', material: 'PP+TD20', quotationCount: 3 },
  { id: '86541-BBB00', name: 'BRACKET-FENDER MTG, RH', material: 'SPHC-P', quotationCount: 2 },
  { id: '91911-CCC00', name: 'COVER-RELAY BOX, UPR', material: 'PP+GF30', quotationCount: 4 },
  { id: '83301-DDD00', name: 'HEAD LINING', material: 'PP FELT', quotationCount: 3 },
  { id: '82310-EEE00', name: 'DOOR TRIM LH', material: 'PP+TD20', quotationCount: 2 },
  { id: '86511-FFF00', name: 'BUMPER ASSY FR', material: 'PP+EPDM', quotationCount: 5 },
  { id: '84611-GGG00', name: 'CONSOLE BOX', material: 'ABS', quotationCount: 3 },
  { id: '88100-HHH00', name: 'SEAT COVER FR', material: 'PVC LEATHER', quotationCount: 2 },
  { id: '87220-III00', name: 'GARNISH-ROOF, CTR', material: 'ABS+PC', quotationCount: 4 },
  { id: '84710-JJJ00', name: 'PANEL-INSTRUMENT', material: 'PP+TD20', quotationCount: 3 },
  { id: '86350-KKK00', name: 'GRILLE-RADIATOR', material: 'ABS+GF15', quotationCount: 2 },
  { id: '87210-LLL00', name: 'SPOILER-REAR', material: 'PP+GF20', quotationCount: 3 },
  { id: '82130-MMM00', name: 'WEATHERSTRIP-DOOR', material: 'EPDM', quotationCount: 2 },
  { id: '87710-NNN00', name: 'MOLDING-SIDE', material: 'PVC', quotationCount: 3 },
  { id: '92410-OOO00', name: 'LAMP ASSY-RR COMB', material: 'PC+ABS', quotationCount: 4 },
  { id: '86130-PPP00', name: 'FENDER ASSY FR, LH', material: 'STEEL', quotationCount: 2 },
  { id: '71101-QQQ00', name: 'HOOD ASSY', material: 'ALUMINIUM', quotationCount: 3 },
  { id: '83110-RRR00', name: 'ROOF PANEL', material: 'STEEL', quotationCount: 2 },
];

const mockQuotations: Record<string, Quotation[]> = {
  '99919-AAA00': [
    { id: 'q1', vendor: '한국ITW', date: '2021.07', label: '한국ITW 2021.07' },
    { id: 'q2', vendor: '한국ITW', date: '2020.12', label: '한국ITW 2020.12' },
    { id: 'q3', vendor: 'B업체', date: '2021.03', label: 'B업체 2021.03' },
  ],
  '86541-BBB00': [
    { id: 'q4', vendor: 'C업체', date: '2021.05', label: 'C업체 2021.05' },
    { id: 'q5', vendor: 'D업체', date: '2021.01', label: 'D업체 2021.01' },
  ],
  '91911-CCC00': [
    { id: 'q6', vendor: 'E업체', date: '2021.06', label: 'E업체 2021.06' },
    { id: 'q7', vendor: 'F업체', date: '2021.04', label: 'F업체 2021.04' },
    { id: 'q8', vendor: 'G업체', date: '2020.11', label: 'G업체 2020.11' },
    { id: 'q9', vendor: 'H업체', date: '2021.02', label: 'H업체 2021.02' },
  ],
};

const mockCompData: CompRow[] = [
  { item: '원재료', values: { q1: 967, q2: 940, q3: 1020 } },
  { item: 'Masterbatch', values: { q1: 90, q2: 88, q3: 95 } },
  { item: '재료비 소계', isSubtotal: true, values: { q1: 1057, q2: 1028, q3: 1115 } },
  { item: '노무비', values: { q1: 850, q2: 820, q3: 780 } },
  { item: '경비', values: { q1: 620, q2: 590, q3: 650 } },
  { item: '가공비 소계', isSubtotal: true, values: { q1: 1470, q2: 1410, q3: 1430 } },
  { item: '제조원가', isSubtotal: true, values: { q1: 2527, q2: 2438, q3: 2545 } },
  { item: '일반관리비', values: { q1: 253, q2: 244, q3: 255 } },
  { item: '이윤', values: { q1: 380, q2: 360, q3: 370 } },
  { item: '총원가', isSubtotal: true, values: { q1: 3160, q2: 3042, q3: 3170 } },
];

const mockMaterialChanges: { part: string; values: Record<string, string>; changed: boolean }[] = [
  { part: '본체', values: { q1: 'PP+TD20', q2: 'PP+TD20', q3: 'PP+TD20' }, changed: false },
  { part: '브라켓', values: { q1: 'SPHC-P', q2: 'SPHC-P', q3: 'SPCC' }, changed: true },
  { part: '클립', values: { q1: 'POM', q2: 'POM', q3: 'PA66' }, changed: true },
];

const fmt = (n: number) => n.toLocaleString('ko-KR');

const getHeatColor = (val: number, min: number, max: number) => {
  if (max === min) return 'transparent';
  const ratio = (val - min) / (max - min);
  if (ratio < 0.33) return 'rgba(33,150,243,0.12)';
  if (ratio > 0.66) return 'rgba(244,67,54,0.12)';
  return 'transparent';
};

const QuotationComparison: React.FC = () => {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedQuotations, setSelectedQuotations] = useState<string[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const quotations = selectedProduct ? mockQuotations[selectedProduct] || [] : [];
  const selectionStep = !selectedProduct ? 0 : selectedQuotations.length < 2 ? 1 : 2;

  const toggleQuotation = (qId: string) => {
    setSelectedQuotations(prev =>
      prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]
    );
  };

  const resetSelection = () => {
    setSelectedProduct(null);
    setSelectedQuotations([]);
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <WorkflowStepper activeStep={3} />

      <Typography variant="h5" fontWeight={700} color="#003875" sx={{ mb: 0.5 }}>견적서 비교</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        아이템 선택 → 견적서 복수 선택 → 나란히 비교
      </Typography>

      {/* 미니 스텝 표시 */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Stepper activeStep={selectionStep} alternativeLabel>
          <Step><StepLabel>아이템 선택</StepLabel></Step>
          <Step><StepLabel>견적서 선택 (2개 이상)</StepLabel></Step>
          <Step><StepLabel>비교 결과</StepLabel></Step>
        </Stepper>
      </Paper>

      {/* Step 1: 아이템(제품) 선택 — 검색 팝업 */}
      {!selectedProduct && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>1️⃣ 비교할 아이템을 선택하세요</Typography>
          <Button variant="contained" size="large" startIcon={<Search />}
            sx={{ bgcolor: '#003875', px: 4, py: 1.5, fontSize: 16 }}
            onClick={() => { setSearchOpen(true); setSearchQuery(''); }}>
            아이템 검색
          </Button>

          <Dialog open={searchOpen} onClose={() => setSearchOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#003875', color: '#fff' }}>
              아이템 검색
              <IconButton onClick={() => setSearchOpen(false)} sx={{ color: '#fff' }}><Close /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: '16px !important' }}>
              <TextField fullWidth placeholder="아이템 코드 또는 품명으로 검색" variant="outlined" size="small"
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)} autoFocus
                sx={{ mb: 2 }} InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.disabled' }} /> }} />
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>아이템코드</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>품명</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>재질</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>견적서 수</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockProducts
                      .filter(p => {
                        const q = searchQuery.toLowerCase();
                        return !q || p.id.toLowerCase().includes(q) || p.name.toLowerCase().includes(q);
                      })
                      .map(p => (
                        <TableRow key={p.id} hover sx={{ cursor: 'pointer' }}
                          onClick={() => { setSelectedProduct(p.id); setSelectedQuotations([]); setSearchOpen(false); }}>
                          <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.id}</TableCell>
                          <TableCell>{p.name}</TableCell>
                          <TableCell><Chip label={p.material} size="small" variant="outlined" /></TableCell>
                          <TableCell align="center"><Chip label={`${p.quotationCount}건`} size="small" color="primary" variant="outlined" /></TableCell>
                        </TableRow>
                      ))}
                    {mockProducts.filter(p => {
                      const q = searchQuery.toLowerCase();
                      return !q || p.id.toLowerCase().includes(q) || p.name.toLowerCase().includes(q);
                    }).length === 0 && (
                      <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.disabled' }}>검색 결과가 없습니다</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>
          </Dialog>
        </Box>
      )}

      {/* Step 2: 견적서 복수 선택 */}
      {selectedProduct && selectionStep < 2 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              2️⃣ 비교할 견적서를 선택하세요 (2개 이상)
            </Typography>
            <Button size="small" variant="text" onClick={resetSelection}>← 아이템 다시 선택</Button>
          </Box>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              선택된 아이템: <strong>{mockProducts.find(p => p.id === selectedProduct)?.name}</strong>
            </Typography>
            <FormGroup>
              {quotations.map(q => (
                <FormControlLabel key={q.id}
                  control={<Checkbox checked={selectedQuotations.includes(q.id)} onChange={() => toggleQuotation(q.id)} />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight={600}>{q.vendor}</Typography>
                      <Chip label={q.date} size="small" variant="outlined" sx={{ fontSize: 11 }} />
                    </Box>
                  }
                />
              ))}
            </FormGroup>
            {selectedQuotations.length >= 2 && (
              <Button variant="contained" sx={{ mt: 2, bgcolor: '#003875' }}
                onClick={() => {/* selectionStep auto-advances */}}>
                비교 시작 ({selectedQuotations.length}건)
              </Button>
            )}
          </Paper>
        </Box>
      )}

      {/* Step 3: 비교 결과 */}
      {selectionStep >= 2 && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700}>3️⃣ 비교 결과</Typography>
            <Button size="small" variant="text" onClick={resetSelection}>← 다시 선택</Button>
            <Chip label={`${selectedQuotations.length}건 비교 중`} size="small" color="primary" />
          </Box>

          {/* 총원가 비교 바 */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: '#003875' }}>📊 총원가 비교</Typography>
            {(() => {
              const totalRow = mockCompData.find(r => r.item === '총원가')!;
              const vals = selectedQuotations.map(qid => totalRow.values[qid] || 0);
              const maxVal = Math.max(...vals);
              const minVal = Math.min(...vals);
              return selectedQuotations.map((qid, i) => {
                const q = quotations.find(qq => qq.id === qid)!;
                const v = totalRow.values[qid] || 0;
                return (
                  <Box key={qid} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ width: 130, flexShrink: 0 }}>{q.label}</Typography>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{
                        height: 28, borderRadius: 1.5,
                        bgcolor: v === minVal ? '#1976d2' : '#90caf9',
                        width: `${(v / maxVal) * 100}%`,
                        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pr: 1.5,
                        transition: 'width 0.5s',
                      }}>
                        <Typography variant="caption" fontWeight={700} color="#fff">₩{fmt(v)}</Typography>
                      </Box>
                    </Box>
                    {v === minVal && <Chip label="최저" size="small" color="success" sx={{ fontWeight: 700 }} />}
                  </Box>
                );
              });
            })()}
          </Paper>

          {/* 히트맵 비교 테이블 */}
          <TableContainer component={Paper} sx={{ mb: 3, borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                  <TableCell sx={{ fontWeight: 700 }}>항목</TableCell>
                  {selectedQuotations.map(qid => {
                    const q = quotations.find(qq => qq.id === qid)!;
                    return <TableCell key={qid} align="right" sx={{ fontWeight: 700, color: '#003875' }}>{q.label}</TableCell>;
                  })}
                  <TableCell align="right" sx={{ fontWeight: 700 }}>차이율</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockCompData.map((row, i) => {
                  const vals = selectedQuotations.map(qid => row.values[qid] || 0);
                  const minV = Math.min(...vals);
                  const maxV = Math.max(...vals);
                  const diffPct = minV > 0 ? ((maxV - minV) / minV * 100).toFixed(1) : '0';
                  return (
                    <TableRow key={i} sx={{
                      bgcolor: row.item === '총원가' ? '#e8eef5' : undefined,
                      '&:hover': { bgcolor: '#f0f4ff' },
                    }}>
                      <TableCell sx={{ fontWeight: row.isSubtotal ? 700 : 400, pl: row.isSubtotal ? 2 : 3 }}>
                        {row.item}
                      </TableCell>
                      {selectedQuotations.map(qid => {
                        const v = row.values[qid] || 0;
                        return (
                          <TableCell key={qid} align="right" sx={{
                            fontFamily: 'monospace', fontWeight: row.isSubtotal ? 700 : 400,
                            bgcolor: getHeatColor(v, minV, maxV),
                          }}>
                            ₩{fmt(v)}
                          </TableCell>
                        );
                      })}
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

          {/* 재질 변경 하이라이트 */}
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
                    {selectedQuotations.map(qid => {
                      const q = quotations.find(qq => qq.id === qid)!;
                      return <TableCell key={qid} sx={{ fontWeight: 700 }}>{q.label}</TableCell>;
                    })}
                    <TableCell sx={{ fontWeight: 700 }}>변경 여부</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockMaterialChanges.map((m, i) => (
                    <TableRow key={i} sx={{ bgcolor: m.changed ? '#fff3e0' : undefined }}>
                      <TableCell sx={{ fontWeight: 600 }}>{m.part}</TableCell>
                      {selectedQuotations.map(qid => (
                        <TableCell key={qid} sx={{
                          fontWeight: m.changed ? 700 : 400,
                          color: m.changed && m.values[qid] !== m.values[selectedQuotations[0]] ? '#e65100' : undefined,
                        }}>
                          {m.values[qid] || '-'}
                        </TableCell>
                      ))}
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

      {/* 빈 상태 */}
      {!selectedProduct && (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2, mt: 3 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>위에서 아이템을 선택해주세요</Typography>
          <Typography variant="body2" color="text.disabled">아이템 → 견적서 선택 후 비교 결과가 표시됩니다.</Typography>
        </Paper>
      )}

      {/* 네비게이션 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button variant="outlined" startIcon={<NavigateBefore />} onClick={() => navigate('/analysis')}>
          분석으로
        </Button>
        <Button variant="contained" endIcon={<NavigateNext />}
          onClick={() => navigate('/report')}
          disabled={selectionStep < 2}
          sx={{ bgcolor: '#003875', px: 4 }}>
          리포트로 이동
        </Button>
      </Box>
    </Box>
  );
};

export default QuotationComparison;
