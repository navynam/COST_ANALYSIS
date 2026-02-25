/**
 * @fileoverview 검증 리포트 페이지
 * @description 견적서 검증 결과 요약, 항목별 통과/경고/오류 상세, 이상치 분석 표시
 */
import React from 'react';
import {
  Box, Typography, Paper, Card, CardContent, Grid, Chip, Button, List, ListItem,
  ListItemIcon, ListItemText, Divider,
} from '@mui/material';
import {
  PictureAsPdf, Share, CheckCircle, Warning, Error as ErrorIcon,
} from '@mui/icons-material';

const summary = { total: 45, passed: 36, warnings: 6, errors: 3 };

const validationItems = [
  { name: '재료비 단가 범위', status: 'pass', detail: '모든 항목 정상 범위 내' },
  { name: '가공비 비율', status: 'pass', detail: '가공비 비율 32% — 업종 평균 범위' },
  { name: '수량 × 단가 계산', status: 'pass', detail: '모든 행 계산 일치' },
  { name: '합계 금액 검증', status: 'pass', detail: '소계/합계 일치' },
  { name: 'SUS304 단가', status: 'warning', detail: '시세 대비 15% 높음 (12,500원/kg vs 시세 10,870원/kg)' },
  { name: '도금 처리 비용', status: 'warning', detail: '전분기 대비 37% 상승' },
  { name: '알루미늄 중량', status: 'error', detail: '명시 중량 2.3kg, 추정 중량 1.8kg — 차이 27.8%' },
  { name: '열처리 공정수', status: 'warning', detail: '동종 부품 대비 공정 1단계 추가' },
  { name: '운송비 산정', status: 'pass', detail: '거리 기반 단가 정상' },
];

const anomalies = [
  { item: 'SUS304 강판 단가', reason: '시세 대비 15% 초과', current: '12,500원/kg', reference: '10,870원/kg' },
  { item: '도금 처리 비용', reason: '전분기 대비 급등', current: '5,200,000원', reference: '3,800,000원 (전분기)' },
  { item: '알루미늄 다이캐스팅 중량', reason: '설계 중량 불일치', current: '2.3kg', reference: '1.8kg (추정)' },
];

const statusIcon = {
  pass: <CheckCircle sx={{ color: '#4caf50' }} />,
  warning: <Warning sx={{ color: '#ff9800' }} />,
  error: <ErrorIcon sx={{ color: '#f44336' }} />,
};

const Report: React.FC = () => (
  <Box sx={{ p: 3 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Typography variant="h5" fontWeight={700}>검증 리포트</Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button variant="outlined" startIcon={<PictureAsPdf />}>PDF 다운로드</Button>
        <Button variant="outlined" startIcon={<Share />}>공유</Button>
      </Box>
    </Box>

    {/* 요약 카드 */}
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {[
        { label: '총 항목', value: summary.total, color: '#003875', icon: '📋' },
        { label: '통과', value: summary.passed, color: '#4caf50', icon: '✅' },
        { label: '경고', value: summary.warnings, color: '#ff9800', icon: '⚠️' },
        { label: '오류', value: summary.errors, color: '#f44336', icon: '❌' },
      ].map((c) => (
        <Grid size={{ xs: 6, md: 3 }} key={c.label}>
          <Card sx={{ borderLeft: `4px solid ${c.color}`, borderRadius: 2 }}>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" color="text.secondary">{c.label}</Typography>
                <Typography variant="h4" fontWeight={700}>{c.value}</Typography>
              </Box>
              <Typography fontSize={32}>{c.icon}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>

    {/* 검증 상세 */}
    <Paper sx={{ mb: 3, borderRadius: 2 }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={600}>검증 항목별 결과</Typography>
      </Box>
      <List disablePadding>
        {validationItems.map((item, i) => (
          <React.Fragment key={item.name}>
            {i > 0 && <Divider />}
            <ListItem>
              <ListItemIcon>{statusIcon[item.status as keyof typeof statusIcon]}</ListItemIcon>
              <ListItemText
                primary={item.name}
                secondary={item.detail}
                primaryTypographyProps={{ fontWeight: 500 }}
              />
              <Chip
                label={item.status === 'pass' ? '통과' : item.status === 'warning' ? '경고' : '오류'}
                color={item.status === 'pass' ? 'success' : item.status === 'warning' ? 'warning' : 'error'}
                size="small"
              />
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </Paper>

    {/* 이상치 상세 */}
    <Paper sx={{ borderRadius: 2 }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={600}>이상치 상세</Typography>
      </Box>
      {anomalies.map((a, i) => (
        <React.Fragment key={a.item}>
          {i > 0 && <Divider />}
          <Box sx={{ p: 2 }}>
            <Typography fontWeight={600} color="error.main">{a.item}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>사유: {a.reason}</Typography>
            <Box sx={{ display: 'flex', gap: 4, mt: 1 }}>
              <Typography variant="body2">현재값: <strong>{a.current}</strong></Typography>
              <Typography variant="body2">기준값: <strong>{a.reference}</strong></Typography>
            </Box>
          </Box>
        </React.Fragment>
      ))}
    </Paper>
  </Box>
);

export default Report;
