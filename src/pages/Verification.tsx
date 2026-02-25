/**
 * @fileoverview ③ 검증 페이지
 * @description 계산 정확성 확인. 온톨로지 규칙 기반 합산/비율 정합성 체크, 이상값 감지.
 */
import React, { useState } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Grid, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Alert, CircularProgress, Select, MenuItem, FormControl,
  InputLabel, Tooltip, LinearProgress,
} from '@mui/material';
import {
  PlayArrow, CheckCircle, Warning, Error as ErrorIcon, Rule,
} from '@mui/icons-material';

// 검증 규칙 타입
interface VerificationRule {
  id: string;
  ruleName: string;
  category: string;
  description: string;
  status: 'pass' | 'warning' | 'fail';
  expectedValue: number | null;
  actualValue: number | null;
  deviation: number | null;
  message: string;
}

// 더미 검증 결과 (실제 API 연동 시 교체)
const dummyResults: VerificationRule[] = [
  {
    id: '1', ruleName: '재료비 합산 검증', category: '합산 정합성',
    description: '하위 재료비 항목 합산이 재료비 소계와 일치하는지 확인',
    status: 'pass', expectedValue: 23500000, actualValue: 23500000, deviation: 0,
    message: '재료비 합산 정확',
  },
  {
    id: '2', ruleName: '가공비 비율 검증', category: '비율 정합성',
    description: '가공비가 총원가 대비 적정 비율(20~40%) 범위 내인지 확인',
    status: 'warning', expectedValue: 35, actualValue: 42.3, deviation: 7.3,
    message: '가공비 비율 42.3%로 기준 상한(40%) 초과',
  },
  {
    id: '3', ruleName: '제경비 합산 검증', category: '합산 정합성',
    description: '제경비 하위 항목 합산이 소계와 일치하는지 확인',
    status: 'pass', expectedValue: 8700000, actualValue: 8700000, deviation: 0,
    message: '제경비 합산 정확',
  },
  {
    id: '4', ruleName: '이익률 범위 검증', category: '비율 정합성',
    description: '이익률이 업종 평균 범위(5~15%) 내인지 확인',
    status: 'pass', expectedValue: 10, actualValue: 8.5, deviation: -1.5,
    message: '이익률 8.5%로 적정 범위 내',
  },
  {
    id: '5', ruleName: '단가 이상값 감지', category: '이상값 감지',
    description: '항목별 단가가 과거 평균 대비 ±30% 이상 벗어나는지 확인',
    status: 'fail', expectedValue: 15000, actualValue: 28500, deviation: 90,
    message: 'CNC 가공 단가 ₩28,500 → 과거 평균 ₩15,000 대비 90% 높음',
  },
  {
    id: '6', ruleName: '총합계 검증', category: '합산 정합성',
    description: '모든 대분류 합산이 총합계와 일치하는지 확인',
    status: 'pass', expectedValue: 49280000, actualValue: 49280000, deviation: 0,
    message: '총합계 일치',
  },
  {
    id: '7', ruleName: '수량×단가=금액 검증', category: '계산 정합성',
    description: '각 항목의 수량×단가가 금액과 일치하는지 확인',
    status: 'warning', expectedValue: 3600000, actualValue: 3540000, deviation: -1.7,
    message: '고무 실링: 수량(600)×단가(6,000)=3,600,000 ≠ 기재금액 3,540,000',
  },
];

const statusIcon = (status: string) => {
  switch (status) {
    case 'pass': return <CheckCircle sx={{ color: '#4caf50' }} />;
    case 'warning': return <Warning sx={{ color: '#ff9800' }} />;
    case 'fail': return <ErrorIcon sx={{ color: '#f44336' }} />;
    default: return null;
  }
};

const statusChipColor = (status: string): 'success' | 'warning' | 'error' => {
  switch (status) {
    case 'pass': return 'success';
    case 'warning': return 'warning';
    case 'fail': return 'error';
    default: return 'warning';
  }
};

const formatAmount = (amount: number) =>
  amount.toLocaleString('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 });

const Verification: React.FC = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [results, setResults] = useState<VerificationRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');

  const runVerification = async () => {
    if (!selectedId) return;
    setLoading(true);
    // TODO: 실제 API 연동 → await verificationAPI.run(selectedId)
    await new Promise(r => setTimeout(r, 1500));
    setResults(dummyResults);
    setLoading(false);
  };

  const filteredResults = categoryFilter
    ? results.filter(r => r.category === categoryFilter)
    : results;

  const summary = {
    total: results.length,
    pass: results.filter(r => r.status === 'pass').length,
    warning: results.filter(r => r.status === 'warning').length,
    fail: results.filter(r => r.status === 'fail').length,
  };

  const categories = Array.from(new Set(results.map(r => r.category)));

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1, color: '#003875' }}>
        ③ 검증
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        계산이 정확하게 되어 있는지 확인합니다. 온톨로지 규칙 기반으로 합산/비율 정합성을 체크하고 이상값을 감지합니다.
      </Typography>

      {/* 견적서 선택 + 검증 실행 */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 300 }}>
          <InputLabel>검증할 견적서 선택</InputLabel>
          <Select
            value={selectedId || ''}
            label="검증할 견적서 선택"
            onChange={(e) => setSelectedId(Number(e.target.value))}
          >
            <MenuItem value={1}>[1] 현대차_브레이크패드_견적서.xlsx</MenuItem>
            <MenuItem value={2}>[2] 기아_엔진마운트_견적서.xlsx</MenuItem>
            <MenuItem value={3}>[3] 현대트랜시스_변속기_견적서.xlsx</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Rule />}
          onClick={runVerification}
          disabled={!selectedId || loading}
          sx={{ bgcolor: '#003875' }}
        >
          검증 실행
        </Button>
        {results.length > 0 && (
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>규칙 카테고리</InputLabel>
            <Select
              value={categoryFilter}
              label="규칙 카테고리"
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <MenuItem value="">전체</MenuItem>
              {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
        )}
      </Paper>

      {/* 검증 결과 요약 */}
      {results.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: '전체 규칙', value: summary.total, color: '#1976d2', icon: <Rule /> },
            { label: '통과', value: summary.pass, color: '#4caf50', icon: <CheckCircle /> },
            { label: '경고', value: summary.warning, color: '#ff9800', icon: <Warning /> },
            { label: '실패', value: summary.fail, color: '#f44336', icon: <ErrorIcon /> },
          ].map((card) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.label}>
              <Card sx={{ borderLeft: `4px solid ${card.color}` }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                  <Box sx={{ color: card.color }}>{card.icon}</Box>
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color={card.color}>
                      {card.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {card.label}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* 검증 결과 테이블 */}
      {filteredResults.length > 0 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell width={60}>상태</TableCell>
                <TableCell>규칙명</TableCell>
                <TableCell>카테고리</TableCell>
                <TableCell align="right">기대값</TableCell>
                <TableCell align="right">실제값</TableCell>
                <TableCell align="right">편차</TableCell>
                <TableCell>메시지</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredResults.map((rule) => (
                <TableRow
                  key={rule.id}
                  sx={{
                    bgcolor: rule.status === 'fail' ? '#ffebee' :
                             rule.status === 'warning' ? '#fff8e1' : 'inherit',
                    '&:hover': { bgcolor: '#e3f2fd' },
                  }}
                >
                  <TableCell>{statusIcon(rule.status)}</TableCell>
                  <TableCell>
                    <Tooltip title={rule.description}>
                      <Typography variant="body2" fontWeight={600}>{rule.ruleName}</Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Chip label={rule.category} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="right">
                    {rule.expectedValue != null
                      ? (rule.expectedValue > 100 ? formatAmount(rule.expectedValue) : `${rule.expectedValue}%`)
                      : '-'}
                  </TableCell>
                  <TableCell align="right">
                    {rule.actualValue != null
                      ? (rule.actualValue > 100 ? formatAmount(rule.actualValue) : `${rule.actualValue}%`)
                      : '-'}
                  </TableCell>
                  <TableCell align="right">
                    {rule.deviation != null ? (
                      <Chip
                        label={`${rule.deviation > 0 ? '+' : ''}${rule.deviation.toFixed(1)}%`}
                        size="small"
                        color={statusChipColor(rule.status)}
                      />
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{rule.message}</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography color="text.secondary">온톨로지 규칙 기반 검증 중...</Typography>
        </Paper>
      )}

      {!selectedId && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Rule sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
          <Typography color="text.secondary">
            검증할 견적서를 선택하고 "검증 실행" 버튼을 클릭하세요.
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
            합산 정합성 · 비율 정합성 · 계산 정합성 · 이상값 감지
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default Verification;
