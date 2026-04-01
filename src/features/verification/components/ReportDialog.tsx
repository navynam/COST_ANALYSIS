/**
 * @fileoverview 검증 리포트 다이얼로그
 * @description 검증 통과율, 이슈 Top10, 업체간 비교 요약, PDF/엑셀 다운로드
 */
import React from 'react';
import {
  Box, Typography, Paper, Button, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  List, ListItem, ListItemIcon, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
} from '@mui/material';
import { PictureAsPdf, TableChart, CheckCircle, Warning, Error as ErrorIcon, Close } from '@mui/icons-material';

const verificationSummary = { total: 10, pass: 6, warning: 2, fail: 2 };
const passRate = Math.round((verificationSummary.pass / verificationSummary.total) * 100);

const issuesTop10 = [
  { rank: 1, severity: 'fail', title: '#N/A 에러 - Sheet2!C15', detail: 'VLOOKUP 참조 오류' },
  { rank: 2, severity: 'fail', title: '#DIV/0! 에러 - Sheet3!E8', detail: '0으로 나눗셈' },
  { rank: 3, severity: 'fail', title: '금형 수정비 +85% 이상값', detail: '동종 부품 평균 대비 대폭 초과' },
  { rank: 4, severity: 'warning', title: '총원가 20원 불일치', detail: '반올림 차이 가능성' },
  { rank: 5, severity: 'warning', title: '경비 +18% 상승', detail: '전분기 평균 대비' },
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

interface ReportDialogProps {
  open: boolean;
  onClose: () => void;
}

const ReportDialog: React.FC<ReportDialogProps> = ({ open, onClose }) => (
  <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="h6" fontWeight={700} color="#003875">검증 리포트</Typography>
      <IconButton onClick={onClose} size="small"><Close /></IconButton>
    </DialogTitle>

    <DialogContent sx={{ pb: 2 }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>견적서들의 종합 검증 결과입니다</Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3, mb: 3 }}>
          {[
            { label: '총 검증 항목', value: verificationSummary.total, color: '#003875', border: '#e0e0e0' },
            { label: '검증 통과', value: verificationSummary.pass, color: '#4caf50', border: '#4caf50' },
            { label: '검토 필요', value: verificationSummary.warning, color: '#ff9800', border: '#ff9800' },
            { label: '검증 실패', value: verificationSummary.fail, color: '#f44336', border: '#f44336' },
          ].map(card => (
            <Card key={card.label} sx={{ borderRadius: 2, border: `1px solid ${card.border}` }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="h3" fontWeight={700} color={card.color} sx={{ mb: 1 }}>{card.value}</Typography>
                <Typography variant="body2" color="text.secondary">{card.label}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
          <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>검증 통과율</Typography>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h2" fontWeight={700} color="#4caf50" sx={{ mb: 1 }}>{passRate}%</Typography>
              <Typography variant="body2" color="text.secondary">{verificationSummary.pass}/{verificationSummary.total} 항목 통과</Typography>
            </Box>
          </Paper>
          <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>주요 검증 이슈 Top 5</Typography>
            <List dense>
              {issuesTop10.map(issue => (
                <ListItem key={issue.rank} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>{severityIcon(issue.severity)}</ListItemIcon>
                  <ListItemText
                    primary={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" sx={{ bgcolor: issue.severity === 'fail' ? '#ffebee' : '#fff8e1', color: issue.severity === 'fail' ? '#c62828' : '#f57c00', px: 1, py: 0.25, borderRadius: 1, fontWeight: 600, fontSize: 10 }}>#{issue.rank}</Typography>
                      <Typography variant="body2" fontWeight={500}>{issue.title}</Typography>
                    </Box>}
                    secondary={issue.detail}
                    secondaryTypographyProps={{ fontSize: 12 }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>

        <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>업체간 원가 비교 요약</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>구분</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>입찰업체</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>OEM 기준</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>MOBIS 기준</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vendorComparison.map(row => (
                  <TableRow key={row.item}>
                    <TableCell sx={{ fontWeight: 500 }}>{row.item}</TableCell>
                    <TableCell align="right">{fmt(row.bidder)}</TableCell>
                    <TableCell align="right">{fmt(row.oem)}</TableCell>
                    <TableCell align="right">{fmt(row.mobis)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </DialogContent>

    <DialogActions sx={{ px: 3, pb: 3 }}>
      <Button variant="outlined" startIcon={<TableChart />}>엑셀 다운로드</Button>
      <Button variant="contained" startIcon={<PictureAsPdf />} sx={{ bgcolor: '#003875' }}>PDF 다운로드</Button>
      <Button onClick={onClose} sx={{ ml: 2 }}>닫기</Button>
    </DialogActions>
  </Dialog>
);

export default ReportDialog;
