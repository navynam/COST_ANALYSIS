/**
 * @fileoverview 대시보드 페이지
 * @description 견적서 요약 통계, 원가 구성 추이 차트, 최근 작업 목록 등 메인 화면
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Grid, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

// 더미 요약 데이터
const summaryData = {
  totalEstimates: 47,
  verificationRate: 82,
  anomalies: 12,
  mappingAccuracy: 91,
};

// 더미 월별 차트 데이터
const monthlyData = [
  { month: '2025-09', 재료비: 45, 가공비: 32, 제경비: 23 },
  { month: '2025-10', 재료비: 42, 가공비: 35, 제경비: 23 },
  { month: '2025-11', 재료비: 48, 가공비: 30, 제경비: 22 },
  { month: '2025-12', 재료비: 44, 가공비: 33, 제경비: 23 },
  { month: '2026-01', 재료비: 46, 가공비: 31, 제경비: 23 },
  { month: '2026-02', 재료비: 43, 가공비: 34, 제경비: 23 },
];

// 더미 검증 현황
const verificationStatus = [
  { name: '통과', value: 68, color: '#4caf50' },
  { name: '경고', value: 20, color: '#ff9800' },
  { name: '오류', value: 12, color: '#f44336' },
];

// 더미 최근 작업
const recentItems = [
  { id: 1, filename: '현대차_브레이크패드_견적서.xlsx', company: '현대자동차', status: '완료', items: 45, amount: 125000000, date: '2026-02-22' },
  { id: 2, filename: '기아_엔진마운트_견적서.xlsx', company: '기아자동차', status: '검증중', items: 32, amount: 87000000, date: '2026-02-21' },
  { id: 3, filename: '현대트랜시스_변속기_견적서.xlsx', company: '현대트랜시스', status: '이상치', items: 28, amount: 234000000, date: '2026-02-20' },
  { id: 4, filename: '만도_조향장치_견적서.xlsx', company: '만도', status: '완료', items: 51, amount: 156000000, date: '2026-02-19' },
  { id: 5, filename: '현대위아_구동축_견적서.xlsx', company: '현대위아', status: '완료', items: 38, amount: 198000000, date: '2026-02-18' },
];

const statusColor: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
  '완료': 'success', '검증중': 'info', '이상치': 'error',
};

const summaryCards = [
  { label: '총 견적서', value: `${summaryData.totalEstimates}건`, icon: '📄', color: '#003875' },
  { label: '검증 완료율', value: `${summaryData.verificationRate}%`, icon: '✅', color: '#0056a6' },
  { label: '이상치 발견', value: `${summaryData.anomalies}건`, icon: '⚠️', color: '#0070d4' },
  { label: '평균 매핑 정확도', value: `${summaryData.mappingAccuracy}%`, icon: '🎯', color: '#2196f3' },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('3m');

  return (
    <Box sx={{ p: 3 }}>
      {/* 상단 헤더 + 기간 필터 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>대시보드</Typography>
        <ToggleButtonGroup
          value={period}
          exclusive
          onChange={(_, v) => v && setPeriod(v)}
          size="small"
        >
          <ToggleButton value="1w">1주</ToggleButton>
          <ToggleButton value="1m">1개월</ToggleButton>
          <ToggleButton value="3m">3개월</ToggleButton>
          <ToggleButton value="all">전체</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* 요약 카드 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {summaryCards.map((card) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.label}>
            <Card sx={{
              bgcolor: card.color, color: '#fff', borderRadius: 2,
              '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
              transition: 'all 0.2s',
            }}>
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.85 }}>{card.label}</Typography>
                  <Typography variant="h4" fontWeight={700}>{card.value}</Typography>
                </Box>
                <Typography fontSize={40}>{card.icon}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 차트 영역 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 3, borderRadius: 2, height: 360 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>원가 구성 추이</Typography>
            <ResponsiveContainer width="100%" height={290}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} unit="%" />
                <Tooltip />
                <Legend />
                <Bar dataKey="재료비" stackId="a" fill="#003875" />
                <Bar dataKey="가공비" stackId="a" fill="#2196f3" />
                <Bar dataKey="제경비" stackId="a" fill="#81d4fa" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 3, borderRadius: 2, height: 360 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>최근 검증 현황</Typography>
            <ResponsiveContainer width="100%" height={290}>
              <PieChart>
                <Pie
                  data={verificationStatus}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={100}
                  paddingAngle={4} dataKey="value"
                  label={({ name, value }) => `${name} ${value}%`}
                >
                  {verificationStatus.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* 최근 작업 목록 */}
      <Paper sx={{ borderRadius: 2 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={600}>최근 작업 목록</Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                <TableCell>파일명</TableCell>
                <TableCell>업체명</TableCell>
                <TableCell>상태</TableCell>
                <TableCell align="right">항목수</TableCell>
                <TableCell align="right">금액</TableCell>
                <TableCell>날짜</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentItems.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/parsing`)}
                >
                  <TableCell>{row.filename}</TableCell>
                  <TableCell>{row.company}</TableCell>
                  <TableCell>
                    <Chip label={row.status} color={statusColor[row.status] || 'default'} size="small" />
                  </TableCell>
                  <TableCell align="right">{row.items}</TableCell>
                  <TableCell align="right">{(row.amount / 10000).toLocaleString()}만원</TableCell>
                  <TableCell>{row.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Dashboard;
