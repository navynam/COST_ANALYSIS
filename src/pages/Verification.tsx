/**
 * @fileoverview ③ 검증 페이지 - UI 고도화
 * @description 요약 카드, 검증 항목 테이블(수식/에러/이상값), 드릴다운 하이라이트
 */
import React, { useState } from 'react';
import {
  Box, Typography, Paper, Button, Card, CardContent, Grid, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Alert, Collapse, Divider, Tooltip,
} from '@mui/material';
import {
  CheckCircle, Warning, Error as ErrorIcon, NavigateNext, NavigateBefore,
  KeyboardArrowDown, KeyboardArrowUp,
} from '@mui/icons-material';
import WorkflowStepper from '../components/WorkflowStepper';
import { useNavigate } from 'react-router-dom';

/* ── Mock 검증 결과 ── */
interface VRule {
  id: string;
  ruleName: string;
  category: '수식검증' | '에러감지' | '이상값';
  status: 'pass' | 'warning' | 'fail';
  expected: string;
  actual: string;
  diff: string;
  message: string;
  cellRef?: string; // e.g. "Sheet1!D7"
}

const mockRules: VRule[] = [
  { id: '1', ruleName: '재료비 소계 = 부품합', category: '수식검증', status: 'pass', expected: '1,057', actual: '1,057', diff: '0', message: '재료비 소계 정확', cellRef: 'Sheet1!D7' },
  { id: '2', ruleName: '가공비 = 노무비 + 경비', category: '수식검증', status: 'pass', expected: '1,470', actual: '1,470', diff: '0', message: '가공비 합산 정확', cellRef: 'Sheet1!D11' },
  { id: '3', ruleName: '제조원가 = 재료비 + 가공비', category: '수식검증', status: 'pass', expected: '2,527', actual: '2,527', diff: '0', message: '제조원가 정확', cellRef: 'Sheet1!D15' },
  { id: '4', ruleName: '총원가 합산 검증', category: '수식검증', status: 'warning', expected: '3,527', actual: '3,547', diff: '+0.6%', message: '총원가 20원 불일치 (반올림 차이 가능)', cellRef: 'Sheet1!D22' },
  { id: '5', ruleName: '#N/A 에러 감지', category: '에러감지', status: 'fail', expected: '없음', actual: '#N/A', diff: '-', message: 'Sheet2!C15 에 #N/A 에러 발견', cellRef: 'Sheet2!C15' },
  { id: '6', ruleName: '#DIV/0! 에러 감지', category: '에러감지', status: 'fail', expected: '없음', actual: '#DIV/0!', diff: '-', message: 'Sheet3!E8 에 #DIV/0! 에러 발견', cellRef: 'Sheet3!E8' },
  { id: '7', ruleName: '빈 셀 감지 (필수항목)', category: '에러감지', status: 'warning', expected: '값 존재', actual: '빈 셀', diff: '-', message: 'Sheet1!B12 단가 미입력', cellRef: 'Sheet1!B12' },
  { id: '8', ruleName: 'PP+TD20 단가 이상값', category: '이상값', status: 'pass', expected: '±30% 이내', actual: '2,150원', diff: '-5%', message: '기준 단가 대비 정상 범위', cellRef: 'Sheet1!B5' },
  { id: '9', ruleName: '경비 이상값', category: '이상값', status: 'warning', expected: '±30% 이내', actual: '620원', diff: '+18%', message: '전분기 평균 525원 대비 18% 상승', cellRef: 'Sheet1!D10' },
  { id: '10', ruleName: '금형 수정비 이상값', category: '이상값', status: 'fail', expected: '±30% 이내', actual: '3,000,000원', diff: '+85%', message: '동종 부품 평균 1,620,000원 대비 85% 초과', cellRef: 'Sheet1!D28' },
];

const statusIcon = (s: string) => {
  if (s === 'pass') return <CheckCircle sx={{ color: '#4caf50', fontSize: 20 }} />;
  if (s === 'warning') return <Warning sx={{ color: '#ff9800', fontSize: 20 }} />;
  return <ErrorIcon sx={{ color: '#f44336', fontSize: 20 }} />;
};

const Verification: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRule, setSelectedRule] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<string>('all');

  const passCount = mockRules.filter(r => r.status === 'pass').length;
  const warnCount = mockRules.filter(r => r.status === 'warning').length;
  const failCount = mockRules.filter(r => r.status === 'fail').length;

  const filtered = filterCat === 'all' ? mockRules : mockRules.filter(r => r.category === filterCat);

  const summaryCards = [
    { label: 'Pass', count: passCount, color: '#4caf50', icon: <CheckCircle sx={{ fontSize: 36 }} />, bg: '#e8f5e9' },
    { label: 'Warning', count: warnCount, color: '#ff9800', icon: <Warning sx={{ fontSize: 36 }} />, bg: '#fff8e1' },
    { label: 'Fail', count: failCount, color: '#f44336', icon: <ErrorIcon sx={{ fontSize: 36 }} />, bg: '#ffebee' },
  ];

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <WorkflowStepper activeStep={2} />

      <Typography variant="h5" fontWeight={700} color="#003875" sx={{ mb: 0.5 }}>검증</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        수식 정합성, 에러 셀 감지, 이상값 탐지 결과를 확인합니다. 행 클릭 시 해당 셀 위치를 확인할 수 있습니다.
      </Typography>

      {/* ── 요약 카드 3개 ── */}
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

      {/* ── 필터 칩 ── */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        {['all', '수식검증', '에러감지', '이상값'].map(cat => (
          <Chip key={cat} label={cat === 'all' ? '전체' : cat}
            onClick={() => setFilterCat(cat)}
            variant={filterCat === cat ? 'filled' : 'outlined'}
            color={filterCat === cat ? 'primary' : 'default'}
            sx={{ fontWeight: 600 }} />
        ))}
      </Box>

      {/* ── 검증 테이블 ── */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f7fa' }}>
              <TableCell width={50}>상태</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>규칙명</TableCell>
              <TableCell sx={{ fontWeight: 700 }} width={90}>카테고리</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">기대값</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">실제값</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">차이</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>셀 위치</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(rule => {
              const isSelected = selectedRule === rule.id;
              return (
                <React.Fragment key={rule.id}>
                  <TableRow
                    hover
                    selected={isSelected}
                    onClick={() => setSelectedRule(isSelected ? null : rule.id)}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: rule.status === 'fail' ? '#fff5f5' : rule.status === 'warning' ? '#fffdf5' : undefined,
                      '&:hover': { bgcolor: '#e3f2fd !important' },
                    }}
                  >
                    <TableCell>{statusIcon(rule.status)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" fontWeight={600}>{rule.ruleName}</Typography>
                        {isSelected ? <KeyboardArrowUp fontSize="small" /> : <KeyboardArrowDown fontSize="small" />}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={rule.category} size="small" variant="outlined" sx={{ fontSize: 11 }} />
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: 'monospace' }}>{rule.expected}</TableCell>
                    <TableCell align="right" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{rule.actual}</TableCell>
                    <TableCell align="right">
                      {rule.diff !== '-' && rule.diff !== '0' ? (
                        <Chip label={rule.diff} size="small"
                          color={rule.status === 'pass' ? 'success' : rule.status === 'warning' ? 'warning' : 'error'} />
                      ) : (
                        <Typography variant="body2" color="text.secondary">{rule.diff}</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip label={rule.cellRef || '-'} size="small" variant="outlined"
                        sx={{ fontFamily: 'monospace', fontSize: 11 }} />
                    </TableCell>
                  </TableRow>
                  {/* Drill-down detail */}
                  <TableRow>
                    <TableCell colSpan={7} sx={{ py: 0, border: 0 }}>
                      <Collapse in={isSelected} unmountOnExit>
                        <Box sx={{ p: 2, bgcolor: '#f8f9fc', borderRadius: 1, my: 1 }}>
                          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>상세 설명</Typography>
                          <Typography variant="body2" color="text.secondary">{rule.message}</Typography>
                          {rule.cellRef && (
                            <Box sx={{ mt: 1, p: 1.5, bgcolor: '#fff', borderRadius: 1, border: '1px solid #e0e0e0', display: 'inline-block' }}>
                              <Typography variant="caption" color="text.secondary">셀 위치</Typography>
                              <Typography variant="body1" fontWeight={700} fontFamily="monospace" color="#003875">
                                📍 {rule.cellRef}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── 네비게이션 ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="outlined" startIcon={<NavigateBefore />} onClick={() => navigate('/review')}>
          데이터 검토로
        </Button>
        <Button variant="contained" endIcon={<NavigateNext />}
          onClick={() => navigate('/comparison')}
          sx={{ bgcolor: '#003875', px: 4 }}>
          견적 비교로 이동
        </Button>
      </Box>
    </Box>
  );
};

export default Verification;
