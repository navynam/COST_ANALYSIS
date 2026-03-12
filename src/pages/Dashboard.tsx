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

// 견적서 샘플 기반 요약 데이터
const summaryData = {
  totalEstimates: 47,
  verificationRate: 80.9, // 38/47
  anomalies: 7, // 이상치 감지 건수
  averageCost: 76.8, // HEAD_LINING 기준 평균 천원
};

// 견적서 샘플 기반 월별 원가 구성 데이터 (실제 HEAD_LINING 기준)
const monthlyData = [
  { month: '2025-09', 재료비: 58.2, 가공비: 30.5, 제경비: 11.3 },
  { month: '2025-10', 재료비: 59.1, 가공비: 29.8, 제경비: 11.1 },
  { month: '2025-11', 재료비: 57.8, 가공비: 31.2, 제경비: 11.0 },
  { month: '2025-12', 재료비: 58.9, 가공비: 30.1, 제경비: 11.0 },
  { month: '2026-01', 재료비: 57.5, 가공비: 31.5, 제경비: 11.0 },
  { month: '2026-02', 재료비: 58.9, 가공비: 30.1, 제경비: 11.1 }, // HEAD_LINING 실제 비율
];

// 더미 검증 현황
const verificationStatus = [
  { name: '통과', value: 68, color: '#4caf50' },
  { name: '경고', value: 20, color: '#ff9800' },
  { name: '오류', value: 12, color: '#f44336' },
];

// 견적서 샘플 기반 최근 작업 (실제 구조 반영)
const recentItems = [
  { 
    id: 1, 
    filename: 'HEAD_LINING_원가계산서.xlsx', 
    company: '대한(주)', 
    status: '완료', 
    items: 24, // 파싱 항목 수 
    materialCost: 45200, // 재료비 (원)
    processCost: 23100, // 가공비 (원)
    overheadCost: 8500, // 제경비 (원)
    totalCost: 76800, // 총 생산원가 (원)
    date: '2026-02-21',
    anomalies: 2, // SKIN 표피재, 기타 경비 이상치
  },
  { id: 2, filename: 'DOOR_TRIM_견적서.xlsx', company: '현대부품(주)', status: '완료', items: 18, materialCost: 38500, processCost: 19200, overheadCost: 6300, totalCost: 64000, date: '2026-02-19', anomalies: 0 },
  { id: 3, filename: 'CONSOLE_BOX_원가명세.xlsx', company: '모비스파츠', status: '추출중', items: 0, materialCost: 0, processCost: 0, overheadCost: 0, totalCost: 0, date: '2026-02-19', anomalies: 0 },
  { id: 4, filename: 'BUMPER_ASSY_Q4견적.xlsx', company: '현대플라스틱', status: '분석완료', items: 32, materialCost: 52300, processCost: 28400, overheadCost: 9200, totalCost: 89900, date: '2026-02-15', anomalies: 0 },
  { id: 5, filename: 'SEAT_COVER_원가분석.xlsx', company: '현대시트', status: '실패', items: 0, materialCost: 0, processCost: 0, overheadCost: 0, totalCost: 0, date: '2026-02-16', anomalies: 0 },
];

const statusColor: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
  '완료': 'success', '검증중': 'info', '이상치': 'error',
};

const summaryCards = [
  { label: '총 견적서', value: `${summaryData.totalEstimates}건`, icon: '📄', color: '#003875' },
  { label: '검증 완료율', value: `${summaryData.verificationRate}%`, icon: '✅', color: '#0056a6' },
  { label: '이상치 발견', value: `${summaryData.anomalies}건`, icon: '⚠️', color: '#0070d4' },
  { label: '평균 생산원가', value: `₩${summaryData.averageCost}천`, icon: '💰', color: '#2196f3' },
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
                <TableCell align="right">재료비</TableCell>
                <TableCell align="right">가공비</TableCell>
                <TableCell align="right">제경비</TableCell>
                <TableCell align="right">생산원가</TableCell>
                <TableCell align="right">이상치</TableCell>
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
                  <TableCell align="right">{row.items || '-'}</TableCell>
                  <TableCell align="right">₩{row.materialCost ? (row.materialCost / 1000).toFixed(1) + 'K' : '-'}</TableCell>
                  <TableCell align="right">₩{row.processCost ? (row.processCost / 1000).toFixed(1) + 'K' : '-'}</TableCell>
                  <TableCell align="right">₩{row.overheadCost ? (row.overheadCost / 1000).toFixed(1) + 'K' : '-'}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>₩{row.totalCost ? (row.totalCost / 1000).toFixed(1) + 'K' : '-'}</TableCell>
                  <TableCell align="right">
                    {row.anomalies > 0 ? (
                      <Chip label={`${row.anomalies}건`} color="warning" size="small" />
                    ) : (
                      <Chip label="정상" color="success" size="small" />
                    )}
                  </TableCell>
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
