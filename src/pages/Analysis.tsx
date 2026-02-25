/**
 * @fileoverview ③ 분석 페이지 — 계산 검증
 * @description 셀 클릭 시 Dialog로 계산 로직 표시, Pass/Warning/Fail 요약 카드
 */
import React, { useState } from 'react';
import {
  Box, Typography, Paper, Button, Card, CardContent, Grid, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider, IconButton, Alert,
} from '@mui/material';
import {
  CheckCircle, Warning, Error as ErrorIcon, NavigateNext, NavigateBefore,
  Close, Calculate,
} from '@mui/icons-material';
import WorkflowStepper from '../components/WorkflowStepper';
import { useNavigate } from 'react-router-dom';

/* ── Mock: 원가 구조 데이터 (클릭 가능한 셀) ── */
interface CostCell {
  id: string;
  label: string;
  value: number;
  status: 'pass' | 'warning' | 'fail';
  formula?: string;
  components?: { label: string; value: number }[];
  expected?: number;
  actual?: number;
  note?: string;
}

const mockCostStructure: { section: string; cells: CostCell[] }[] = [
  {
    section: '재료비',
    cells: [
      {
        id: 'm1', label: 'PP+TD20 원재료', value: 967, status: 'pass',
        formula: '단가 × 수량',
        components: [{ label: '단가', value: 2150 }, { label: '수량(kg)', value: 0.45 }],
        expected: 967.5, actual: 967, note: '반올림 적용 (967.5 → 967)',
      },
      {
        id: 'm2', label: 'Masterbatch', value: 90, status: 'pass',
        formula: '단가 × 수량',
        components: [{ label: '단가', value: 4500 }, { label: '수량(kg)', value: 0.02 }],
        expected: 90, actual: 90,
      },
      {
        id: 'm3', label: '재료비 소계', value: 1057, status: 'pass',
        formula: '∑ 재료비 항목',
        components: [{ label: 'PP+TD20 원재료', value: 967 }, { label: 'Masterbatch', value: 90 }],
        expected: 1057, actual: 1057,
      },
    ],
  },
  {
    section: '가공비',
    cells: [
      { id: 'p1', label: '노무비', value: 850, status: 'pass', note: '직접 입력값' },
      { id: 'p2', label: '경비', value: 620, status: 'warning', note: '전분기 평균 525원 대비 +18% 상승' },
      {
        id: 'p3', label: '가공비 소계', value: 1470, status: 'pass',
        formula: '노무비 + 경비',
        components: [{ label: '노무비', value: 850 }, { label: '경비', value: 620 }],
        expected: 1470, actual: 1470,
      },
    ],
  },
  {
    section: '제조원가',
    cells: [
      {
        id: 'c1', label: '제조원가', value: 2527, status: 'pass',
        formula: '재료비 + 가공비',
        components: [{ label: '재료비 소계', value: 1057 }, { label: '가공비 소계', value: 1470 }],
        expected: 2527, actual: 2527,
      },
    ],
  },
  {
    section: '총원가',
    cells: [
      { id: 't1', label: '일반관리비', value: 253, status: 'pass', formula: '제조원가 × 10%', expected: 252.7, actual: 253, note: '반올림' },
      { id: 't2', label: '이윤', value: 380, status: 'pass', note: '직접 입력값' },
      {
        id: 't3', label: '총원가', value: 3160, status: 'warning',
        formula: '제조원가 + 일반관리비 + 이윤',
        components: [{ label: '제조원가', value: 2527 }, { label: '일반관리비', value: 253 }, { label: '이윤', value: 380 }],
        expected: 3160, actual: 3180, note: '20원 차이 — 반올림 누적 가능',
      },
    ],
  },
  {
    section: '금형비',
    cells: [
      { id: 'g1', label: '금형 제작비', value: 12000000, status: 'pass', note: '직접 입력값' },
      {
        id: 'g2', label: '금형 수정비', value: 3000000, status: 'fail',
        note: '동종 부품 평균 1,620,000원 대비 +85% 초과',
        expected: 1620000, actual: 3000000,
      },
    ],
  },
];

const allCells = mockCostStructure.flatMap(s => s.cells);
const fmt = (n: number) => n.toLocaleString('ko-KR');

const statusIcon = (s: string, size = 20) => {
  if (s === 'pass') return <CheckCircle sx={{ color: '#4caf50', fontSize: size }} />;
  if (s === 'warning') return <Warning sx={{ color: '#ff9800', fontSize: size }} />;
  return <ErrorIcon sx={{ color: '#f44336', fontSize: size }} />;
};

const Analysis: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCell, setSelectedCell] = useState<CostCell | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const passCount = allCells.filter(c => c.status === 'pass').length;
  const warnCount = allCells.filter(c => c.status === 'warning').length;
  const failCount = allCells.filter(c => c.status === 'fail').length;

  const summaryCards = [
    { label: 'Pass', count: passCount, color: '#4caf50', icon: <CheckCircle sx={{ fontSize: 36 }} />, bg: '#e8f5e9' },
    { label: 'Warning', count: warnCount, color: '#ff9800', icon: <Warning sx={{ fontSize: 36 }} />, bg: '#fff8e1' },
    { label: 'Fail', count: failCount, color: '#f44336', icon: <ErrorIcon sx={{ fontSize: 36 }} />, bg: '#ffebee' },
  ];

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <WorkflowStepper activeStep={2} />

      <Typography variant="h5" fontWeight={700} color="#003875" sx={{ mb: 0.5 }}>분석</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        각 셀의 계산 로직을 검증합니다. <strong>셀(값)을 클릭</strong>하면 상세 계산 내역을 확인할 수 있습니다.
      </Typography>

      {/* 요약 카드 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {summaryCards.map(c => (
          <Grid size={{ xs: 12, sm: 4 }} key={c.label}>
            <Card sx={{ borderRadius: 3, border: `2px solid ${c.color}20`, bgcolor: c.bg }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 3, '&:last-child': { pb: 3 } }}>
                <Box sx={{ color: c.color }}>{c.icon}</Box>
                <Box>
                  <Typography variant="h3" fontWeight={800} color={c.color}>{c.count}</Typography>
                  <Typography variant="body2" fontWeight={600} color="text.secondary">{c.label}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 필터 */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        {['all', 'pass', 'warning', 'fail'].map(s => (
          <Chip key={s} label={s === 'all' ? '전체' : s === 'pass' ? 'Pass' : s === 'warning' ? 'Warning' : 'Fail'}
            onClick={() => setFilterStatus(s)}
            variant={filterStatus === s ? 'filled' : 'outlined'}
            color={filterStatus === s ? (s === 'pass' ? 'success' : s === 'warning' ? 'warning' : s === 'fail' ? 'error' : 'primary') : 'default'}
            sx={{ fontWeight: 600 }} />
        ))}
      </Box>

      {/* 원가 구조 테이블 — 셀 클릭 가능 */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f7fa' }}>
              <TableCell sx={{ fontWeight: 700 }}>섹션</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>항목</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>금액 (원)</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }} width={80}>상태</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>비고</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockCostStructure.map(section =>
              section.cells
                .filter(cell => filterStatus === 'all' || cell.status === filterStatus)
                .map((cell, ci) => (
                  <TableRow
                    key={cell.id}
                    hover
                    onClick={() => setSelectedCell(cell)}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: cell.status === 'fail' ? '#fff5f5' : cell.status === 'warning' ? '#fffdf5' : undefined,
                      '&:hover': { bgcolor: '#e3f2fd !important' },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 700, color: '#003875' }}>
                      {ci === 0 ? section.section : ''}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Calculate sx={{ fontSize: 16, color: '#999' }} />
                        <Typography variant="body2" fontWeight={600}>{cell.label}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{
                      fontFamily: 'monospace', fontWeight: 700, fontSize: 14,
                      color: cell.status === 'fail' ? '#f44336' : cell.status === 'warning' ? '#e65100' : '#003875',
                      textDecoration: 'underline dotted',
                    }}>
                      ₩{fmt(cell.value)}
                    </TableCell>
                    <TableCell align="center">{statusIcon(cell.status)}</TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {cell.formula || cell.note || '-'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── 계산 로직 Dialog ── */}
      <Dialog open={!!selectedCell} onClose={() => setSelectedCell(null)} maxWidth="sm" fullWidth>
        {selectedCell && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#f5f7fa' }}>
              <Calculate sx={{ color: '#003875' }} />
              <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>
                {selectedCell.label} 계산 상세
              </Typography>
              {statusIcon(selectedCell.status, 24)}
              <IconButton size="small" onClick={() => setSelectedCell(null)}><Close /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              {/* 현재 값 */}
              <Box sx={{ textAlign: 'center', mb: 3, p: 2, bgcolor: '#f8f9fc', borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary">현재 값</Typography>
                <Typography variant="h4" fontWeight={800} color="#003875">
                  ₩{fmt(selectedCell.value)}
                </Typography>
              </Box>

              {/* 수식 */}
              {selectedCell.formula && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>📐 수식</Typography>
                  <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#fafafa', fontFamily: 'monospace', fontSize: 14 }}>
                    {selectedCell.label} = {selectedCell.formula}
                  </Paper>
                </Box>
              )}

              {/* 구성 항목 */}
              {selectedCell.components && selectedCell.components.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>📋 구성 항목</Typography>
                  <Table size="small">
                    <TableBody>
                      {selectedCell.components.map((comp, i) => (
                        <TableRow key={i}>
                          <TableCell sx={{ border: 0, py: 0.5 }}>{comp.label}</TableCell>
                          <TableCell align="right" sx={{ border: 0, py: 0.5, fontFamily: 'monospace', fontWeight: 600 }}>
                            {fmt(comp.value)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell sx={{ borderTop: '2px solid #003875', py: 1, fontWeight: 700 }}>합계</TableCell>
                        <TableCell align="right" sx={{ borderTop: '2px solid #003875', py: 1, fontFamily: 'monospace', fontWeight: 800, color: '#003875' }}>
                          {fmt(selectedCell.components.reduce((sum, c) => sum + c.value, 0))}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              {/* 검증 결과 */}
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>✅ 검증 결과</Typography>
                {selectedCell.expected !== undefined && selectedCell.actual !== undefined ? (
                  <Paper variant="outlined" sx={{
                    p: 2, borderRadius: 2,
                    borderColor: selectedCell.status === 'pass' ? '#4caf50' : selectedCell.status === 'warning' ? '#ff9800' : '#f44336',
                    bgcolor: selectedCell.status === 'pass' ? '#f1f8e9' : selectedCell.status === 'warning' ? '#fff8e1' : '#ffebee',
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">기대값:</Typography>
                      <Typography variant="body2" fontWeight={700} fontFamily="monospace">₩{fmt(selectedCell.expected)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">실제값:</Typography>
                      <Typography variant="body2" fontWeight={700} fontFamily="monospace">₩{fmt(selectedCell.actual)}</Typography>
                    </Box>
                    {selectedCell.expected !== selectedCell.actual && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">차이:</Typography>
                        <Typography variant="body2" fontWeight={700} fontFamily="monospace"
                          color={selectedCell.status === 'pass' ? 'success.main' : 'error.main'}>
                          {selectedCell.actual - selectedCell.expected > 0 ? '+' : ''}{fmt(selectedCell.actual - selectedCell.expected)}
                          {' '}
                          {selectedCell.status === 'pass' ? '✅' : selectedCell.status === 'warning' ? '⚠️' : '❌'}
                        </Typography>
                      </Box>
                    )}
                    {selectedCell.expected === selectedCell.actual && (
                      <Typography variant="body2" fontWeight={700} color="success.main" sx={{ textAlign: 'center', mt: 1 }}>
                        ✅ 정확히 일치
                      </Typography>
                    )}
                  </Paper>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {selectedCell.note || '직접 입력값 — 수식 검증 대상 아님'}
                  </Typography>
                )}
              </Box>

              {/* 추가 비고 */}
              {selectedCell.note && selectedCell.expected !== undefined && (
                <Alert severity={selectedCell.status === 'fail' ? 'error' : selectedCell.status === 'warning' ? 'warning' : 'info'} sx={{ mt: 2 }}>
                  {selectedCell.note}
                </Alert>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setSelectedCell(null)} variant="outlined">닫기</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* 네비게이션 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="outlined" startIcon={<NavigateBefore />} onClick={() => navigate('/verification')}>
          검증으로
        </Button>
        <Button variant="contained" endIcon={<NavigateNext />}
          onClick={() => navigate('/comparison')}
          sx={{ bgcolor: '#003875', px: 4 }}>
          비교로 이동
        </Button>
      </Box>
    </Box>
  );
};

export default Analysis;
