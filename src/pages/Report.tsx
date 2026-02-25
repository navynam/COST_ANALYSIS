/**
 * @fileoverview ⑤ 리포트 페이지 - UI 고도화
 * @description 검증 통과율 도넛, 이슈 Top10, 업체간 비교 요약, PDF/엑셀 다운로드
 */
import React from 'react';
import {
  Box, Typography, Paper, Button, Card, CardContent, Grid, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  List, ListItem, ListItemIcon, ListItemText, Divider,
} from '@mui/material';
import {
  PictureAsPdf, TableChart, NavigateBefore, CheckCircle, Warning,
  Error as ErrorIcon,
} from '@mui/icons-material';
import WorkflowStepper from '../components/WorkflowStepper';
import { useNavigate } from 'react-router-dom';

/* ── Mock 데이터 ── */
const verificationSummary = { total: 10, pass: 6, warning: 2, fail: 2 };
const passRate = Math.round((verificationSummary.pass / verificationSummary.total) * 100);

const issuesTop10 = [
  { rank: 1, severity: 'fail', title: '#N/A 에러 - Sheet2!C15', detail: 'VLOOKUP 참조 오류' },
  { rank: 2, severity: 'fail', title: '#DIV/0! 에러 - Sheet3!E8', detail: '0으로 나눗셈' },
  { rank: 3, severity: 'fail', title: '금형 수정비 +85% 이상값', detail: '동종 부품 평균 대비 대폭 초과' },
  { rank: 4, severity: 'warning', title: '총원가 20원 불일치', detail: '반올림 차이 가능성' },
  { rank: 5, severity: 'warning', title: '경비 +18% 상승', detail: '전분기 평균 대비' },
  { rank: 6, severity: 'warning', title: '단가 미입력 - Sheet1!B12', detail: '필수항목 빈 셀' },
  { rank: 7, severity: 'warning', title: 'MOBIS 브라켓 재질 변경', detail: 'SPHC-P → SPCC' },
  { rank: 8, severity: 'warning', title: 'MOBIS 클립 재질 변경', detail: 'POM → PA66' },
  { rank: 9, severity: 'pass', title: '가공비 비율 적정', detail: '범위 내 확인' },
  { rank: 10, severity: 'pass', title: '합산 검증 통과', detail: '모든 소계 정확' },
];

const vendorComparison = [
  { item: '재료비', bidder: 1057, oem: 1105, mobis: 1085 },
  { item: '가공비', bidder: 1470, oem: 1370, mobis: 1470 },
  { item: '제조원가', bidder: 2527, oem: 2475, mobis: 2555 },
  { item: '이윤', bidder: 380, oem: 350, mobis: 370 },
  { item: '총원가', bidder: 3160, oem: 3073, mobis: 3181 },
];

const fmt = (n: number) => n.toLocaleString('ko-KR');

const severityIcon = (s: string) => {
  if (s === 'pass') return <CheckCircle sx={{ color: '#4caf50' }} />;
  if (s === 'warning') return <Warning sx={{ color: '#ff9800' }} />;
  return <ErrorIcon sx={{ color: '#f44336' }} />;
};

const Report: React.FC = () => {
  const navigate = useNavigate();

  // Donut chart via CSS conic-gradient
  const passAngle = (verificationSummary.pass / verificationSummary.total) * 360;
  const warnAngle = (verificationSummary.warning / verificationSummary.total) * 360;
  const failAngle = (verificationSummary.fail / verificationSummary.total) * 360;

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <WorkflowStepper activeStep={4} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="#003875">리포트</Typography>
          <Typography variant="body2" color="text.secondary">
            견적서 분석 결과 종합 리포트입니다.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<PictureAsPdf />} color="error">
            PDF 다운로드
          </Button>
          <Button variant="outlined" startIcon={<TableChart />} color="success">
            엑셀 다운로드
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* ── 검증 통과율 도넛 차트 ── */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%', textAlign: 'center' }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>검증 통과율</Typography>
            {/* CSS Donut */}
            <Box sx={{
              width: 180, height: 180, borderRadius: '50%', mx: 'auto', mb: 2,
              background: `conic-gradient(
                #4caf50 0deg ${passAngle}deg,
                #ff9800 ${passAngle}deg ${passAngle + warnAngle}deg,
                #f44336 ${passAngle + warnAngle}deg ${passAngle + warnAngle + failAngle}deg
              )`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}>
              <Box sx={{
                width: 120, height: 120, borderRadius: '50%', bgcolor: '#fff',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <Typography variant="h3" fontWeight={800} color="#003875">{passRate}%</Typography>
                <Typography variant="caption" color="text.secondary">통과율</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Chip icon={<CheckCircle />} label={`Pass ${verificationSummary.pass}`} size="small" color="success" variant="outlined" />
              <Chip icon={<Warning />} label={`Warn ${verificationSummary.warning}`} size="small" color="warning" variant="outlined" />
              <Chip icon={<ErrorIcon />} label={`Fail ${verificationSummary.fail}`} size="small" color="error" variant="outlined" />
            </Box>
          </Paper>
        </Grid>

        {/* ── 주요 이슈 Top 10 ── */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 0, borderRadius: 2, height: '100%', overflow: 'hidden' }}>
            <Box sx={{ p: 2, bgcolor: '#f5f7fa' }}>
              <Typography variant="subtitle1" fontWeight={700}>🔥 주요 이슈 Top 10</Typography>
            </Box>
            <List dense disablePadding sx={{ maxHeight: 380, overflow: 'auto' }}>
              {issuesTop10.map((issue, i) => (
                <React.Fragment key={issue.rank}>
                  {i > 0 && <Divider />}
                  <ListItem sx={{ py: 1 }}>
                    <Box sx={{
                      width: 28, height: 28, borderRadius: '50%',
                      bgcolor: issue.severity === 'fail' ? '#ffebee' : issue.severity === 'warning' ? '#fff8e1' : '#e8f5e9',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1.5, flexShrink: 0,
                    }}>
                      <Typography variant="caption" fontWeight={800}>{issue.rank}</Typography>
                    </Box>
                    <ListItemIcon sx={{ minWidth: 32 }}>{severityIcon(issue.severity)}</ListItemIcon>
                    <ListItemText
                      primary={issue.title}
                      secondary={issue.detail}
                      primaryTypographyProps={{ fontWeight: 600, fontSize: 13 }}
                      secondaryTypographyProps={{ fontSize: 12 }}
                    />
                    <Chip label={issue.severity === 'fail' ? '오류' : issue.severity === 'warning' ? '경고' : '정상'}
                      size="small"
                      color={issue.severity === 'fail' ? 'error' : issue.severity === 'warning' ? 'warning' : 'success'}
                      variant="outlined" />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* ── 업체간 비교 요약 테이블 ── */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ p: 2, bgcolor: '#f5f7fa' }}>
              <Typography variant="subtitle1" fontWeight={700}>📋 업체간 비교 요약</Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#fafafa' }}>
                    <TableCell sx={{ fontWeight: 700 }}>항목</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#003875' }}>입찰 (A)</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#1976d2' }}>OEM (b)</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#42a5f5' }}>MOBIS (B)</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>최저</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>차이율</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vendorComparison.map((row, i) => {
                    const vals = [row.bidder, row.oem, row.mobis];
                    const minV = Math.min(...vals);
                    const maxV = Math.max(...vals);
                    const diff = minV > 0 ? ((maxV - minV) / minV * 100).toFixed(1) : '0';
                    const minLabel = row.bidder === minV ? '입찰' : row.oem === minV ? 'OEM' : 'MOBIS';
                    return (
                      <TableRow key={i} sx={{
                        bgcolor: row.item === '총원가' ? '#e8eef5' : undefined,
                        '&:hover': { bgcolor: '#f0f4ff' },
                      }}>
                        <TableCell sx={{ fontWeight: row.item === '총원가' ? 700 : 400 }}>{row.item}</TableCell>
                        <TableCell align="right" sx={{
                          fontFamily: 'monospace',
                          fontWeight: row.bidder === minV ? 700 : 400,
                          color: row.bidder === minV ? '#2e7d32' : undefined,
                        }}>₩{fmt(row.bidder)}</TableCell>
                        <TableCell align="right" sx={{
                          fontFamily: 'monospace',
                          fontWeight: row.oem === minV ? 700 : 400,
                          color: row.oem === minV ? '#2e7d32' : undefined,
                        }}>₩{fmt(row.oem)}</TableCell>
                        <TableCell align="right" sx={{
                          fontFamily: 'monospace',
                          fontWeight: row.mobis === minV ? 700 : 400,
                          color: row.mobis === minV ? '#2e7d32' : undefined,
                        }}>₩{fmt(row.mobis)}</TableCell>
                        <TableCell align="right">
                          <Chip label={minLabel} size="small" color="success" variant="outlined" />
                        </TableCell>
                        <TableCell align="right">
                          <Chip label={`${diff}%`} size="small" variant="outlined"
                            color={Number(diff) > 5 ? 'warning' : 'default'} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* ── 네비게이션 ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button variant="outlined" startIcon={<NavigateBefore />} onClick={() => navigate('/comparison')}>
          견적 비교로
        </Button>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: '36px' }}>
          ✅ 분석 플로우 완료
        </Typography>
      </Box>
    </Box>
  );
};

export default Report;
