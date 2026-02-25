/**
 * @fileoverview 견적서 비교 페이지
 * @description 두 견적서의 항목별 금액 차이 및 원가 구성비를 비교 분석
 */
import React, { useState } from 'react';
import {
  Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

// 더미 견적서 목록
const estimates = [
  { id: 1, name: '현대차_브레이크패드_견적서.xlsx' },
  { id: 2, name: '기아_엔진마운트_견적서.xlsx' },
  { id: 3, name: '현대트랜시스_변속기_견적서.xlsx' },
  { id: 4, name: '만도_조향장치_견적서.xlsx' },
];

// 더미 비교 데이터
const compareItems = [
  { name: 'SUS304 강판', amountA: 12500000, amountB: 13200000 },
  { name: '알루미늄 다이캐스팅', amountA: 8700000, amountB: 8500000 },
  { name: '고무 실링', amountA: 2300000, amountB: 3100000 },
  { name: 'CNC 가공비', amountA: 15600000, amountB: 14800000 },
  { name: '열처리', amountA: 4200000, amountB: 4500000 },
  { name: '도금 처리', amountA: 3800000, amountB: 5200000 },
  { name: '검사비', amountA: 1200000, amountB: 1250000 },
  { name: '포장/운송', amountA: 980000, amountB: 1100000 },
];

const costComparison = [
  { category: '재료비', 견적서A: 45, 견적서B: 48 },
  { category: '가공비', 견적서A: 32, 견적서B: 30 },
  { category: '제경비', 견적서A: 23, 견적서B: 22 },
];

const Compare: React.FC = () => {
  const [estimateA, setEstimateA] = useState<number>(1);
  const [estimateB, setEstimateB] = useState<number>(2);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>견적서 비교</Typography>

      {/* 비교 대상 선택 */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 300 }}>
            <InputLabel>견적서 A</InputLabel>
            <Select value={estimateA} label="견적서 A" onChange={(e) => setEstimateA(e.target.value as number)}>
              {estimates.map((e) => <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>)}
            </Select>
          </FormControl>
          <Typography variant="h6" color="text.secondary">vs</Typography>
          <FormControl sx={{ minWidth: 300 }}>
            <InputLabel>견적서 B</InputLabel>
            <Select value={estimateB} label="견적서 B" onChange={(e) => setEstimateB(e.target.value as number)}>
              {estimates.map((e) => <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>)}
            </Select>
          </FormControl>
          <Button variant="contained" startIcon={<SaveIcon />} sx={{ bgcolor: '#003875' }}>
            리포트 저장
          </Button>
        </Box>
      </Paper>

      {/* 비교 테이블 */}
      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                <TableCell>항목명</TableCell>
                <TableCell align="right">견적서A 금액</TableCell>
                <TableCell align="right">견적서B 금액</TableCell>
                <TableCell align="right">차이</TableCell>
                <TableCell align="right">차이율(%)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {compareItems.map((item) => {
                const diff = item.amountB - item.amountA;
                const diffRate = ((diff / item.amountA) * 100);
                const isHighlight = Math.abs(diffRate) >= 10;
                return (
                  <TableRow key={item.name}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell align="right">{item.amountA.toLocaleString()}원</TableCell>
                    <TableCell align="right">{item.amountB.toLocaleString()}원</TableCell>
                    <TableCell align="right" sx={{ color: diff > 0 ? '#f44336' : diff < 0 ? '#4caf50' : 'inherit' }}>
                      {diff > 0 ? '+' : ''}{diff.toLocaleString()}원
                    </TableCell>
                    <TableCell align="right" sx={{
                      color: isHighlight ? '#f44336' : 'inherit',
                      fontWeight: isHighlight ? 700 : 400,
                      bgcolor: isHighlight ? '#ffebee' : 'inherit',
                    }}>
                      {diffRate > 0 ? '+' : ''}{diffRate.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 구성비 비교 차트 */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>원가 구성비 비교</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={costComparison}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis unit="%" />
            <Tooltip />
            <Legend />
            <Bar dataKey="견적서A" fill="#003875" />
            <Bar dataKey="견적서B" fill="#2196f3" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};

export default Compare;
