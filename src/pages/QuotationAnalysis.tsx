import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, LinearProgress,
} from '@mui/material';
import { getAnalysis, AnalysisResult } from '../services/quotationApi';

const statusIcon = (status: string) => {
  if (status === 'pass') return '✅';
  if (status === 'warning') return '⚠️';
  return '❌';
};

export default function QuotationAnalysis() {
  const { id } = useParams<{ id: string }>();
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getAnalysis(Number(id)).then((res) => { setResults(res.data); setLoading(false); });
  }, [id]);

  if (loading) return <LinearProgress />;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>분석 결과</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>상태</TableCell>
              <TableCell>규칙명</TableCell>
              <TableCell align="right">기대값</TableCell>
              <TableCell align="right">실제값</TableCell>
              <TableCell align="right">편차(%)</TableCell>
              <TableCell>메시지</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map((r) => (
              <TableRow key={r.id}>
                <TableCell sx={{ fontSize: 20 }}>{statusIcon(r.status)}</TableCell>
                <TableCell>{r.rule_name || '-'}</TableCell>
                <TableCell align="right">{r.expected_value?.toLocaleString() ?? '-'}</TableCell>
                <TableCell align="right">{r.actual_value?.toLocaleString() ?? '-'}</TableCell>
                <TableCell align="right">{r.deviation != null ? `${r.deviation.toFixed(1)}%` : '-'}</TableCell>
                <TableCell>{r.message}</TableCell>
              </TableRow>
            ))}
            {results.length === 0 && (
              <TableRow><TableCell colSpan={6} align="center">분석 결과가 없습니다.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
