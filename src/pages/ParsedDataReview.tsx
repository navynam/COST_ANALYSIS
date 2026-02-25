/**
 * @fileoverview ② 검증 페이지 — 파싱 데이터 검증
 * @description 원본 ↔ 파싱 데이터를 나란히 비교, 차이 하이라이트, 매핑 상태 칩
 */
import React, { useState } from 'react';
import {
  Box, Typography, Paper, Button, Chip, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Alert, Tooltip,
} from '@mui/material';
import {
  CheckCircle, Warning, Error as ErrorIcon, NavigateNext, NavigateBefore,
} from '@mui/icons-material';
import WorkflowStepper from '../components/WorkflowStepper';
import { useNavigate } from 'react-router-dom';

/* ── Mock: 원본 엑셀 데이터 ── */
interface RawCell {
  row: number;
  col: string;
  value: string;
  type: string;
}

const mockRawData: RawCell[] = [
  { row: 3, col: 'A', value: 'DUCT ASSY-SD A/VENT, LH', type: '부품명' },
  { row: 3, col: 'B', value: 'PP+TD20', type: '재질' },
  { row: 3, col: 'C', value: '0.45', type: '중량(kg)' },
  { row: 4, col: 'A', value: '재료비', type: '섹션 헤더' },
  { row: 5, col: 'A', value: 'PP+TD20 원재료', type: '항목명' },
  { row: 5, col: 'B', value: '2,150', type: '단가' },
  { row: 5, col: 'C', value: '0.45', type: '수량(kg)' },
  { row: 5, col: 'D', value: '967', type: '금액' },
  { row: 6, col: 'A', value: 'Masterbatch', type: '항목명' },
  { row: 6, col: 'B', value: '4,500', type: '단가' },
  { row: 6, col: 'C', value: '0.02', type: '수량(kg)' },
  { row: 6, col: 'D', value: '90', type: '금액' },
  { row: 7, col: 'A', value: '재료비 소계', type: '소계' },
  { row: 7, col: 'D', value: '1,057', type: '금액' },
  { row: 8, col: 'A', value: '가공비', type: '섹션 헤더' },
  { row: 9, col: 'A', value: '노무비', type: '항목명' },
  { row: 9, col: 'D', value: '850', type: '금액' },
  { row: 10, col: 'A', value: '경비', type: '항목명' },
  { row: 10, col: 'D', value: '620', type: '금액' },
  { row: 11, col: 'A', value: '가공비 소계', type: '소계' },
  { row: 11, col: 'D', value: '1,470', type: '금액' },
];

/* ── Mock: 파싱(구조화) 결과 — 원본과 1:1 매핑 ── */
interface ParsedCell {
  row: number;
  col: string;
  parsedValue: string;
  mappedField: string;
  status: 'ok' | 'warn' | 'error';
  diff?: string; // 원본과 차이가 있는 경우
}

const mockParsedData: ParsedCell[] = [
  { row: 3, col: 'A', parsedValue: 'DUCT ASSY-SD A/VENT, LH', mappedField: 'product_name', status: 'ok' },
  { row: 3, col: 'B', parsedValue: 'PP+TD20', mappedField: 'material', status: 'ok' },
  { row: 3, col: 'C', parsedValue: '0.45', mappedField: 'weight_kg', status: 'ok' },
  { row: 4, col: 'A', parsedValue: '재료비', mappedField: 'section_header', status: 'ok' },
  { row: 5, col: 'A', parsedValue: 'PP+TD20 원재료', mappedField: 'item_name', status: 'ok' },
  { row: 5, col: 'B', parsedValue: '2,150', mappedField: 'unit_price', status: 'ok' },
  { row: 5, col: 'C', parsedValue: '0.45', mappedField: 'quantity', status: 'ok' },
  { row: 5, col: 'D', parsedValue: '967', mappedField: 'amount', status: 'ok' },
  { row: 6, col: 'A', parsedValue: 'Masterbatch', mappedField: 'item_name', status: 'ok' },
  { row: 6, col: 'B', parsedValue: '4,500', mappedField: 'unit_price', status: 'ok' },
  { row: 6, col: 'C', parsedValue: '0.02', mappedField: 'quantity', status: 'ok' },
  { row: 6, col: 'D', parsedValue: '90', mappedField: 'amount', status: 'ok' },
  { row: 7, col: 'A', parsedValue: '재료비 소계', mappedField: 'subtotal_label', status: 'ok' },
  { row: 7, col: 'D', parsedValue: '1,057', mappedField: 'subtotal_amount', status: 'ok' },
  { row: 8, col: 'A', parsedValue: '가공비', mappedField: 'section_header', status: 'ok' },
  { row: 9, col: 'A', parsedValue: '노무비', mappedField: 'item_name', status: 'ok' },
  { row: 9, col: 'D', parsedValue: '850', mappedField: 'amount', status: 'ok' },
  { row: 10, col: 'A', parsedValue: '경비', mappedField: 'item_name', status: 'warn', diff: '필드 매핑 확인 필요 — overhead vs expense' },
  { row: 10, col: 'D', parsedValue: '620', mappedField: 'amount', status: 'ok' },
  { row: 11, col: 'A', parsedValue: '가공비 소계', mappedField: 'subtotal_label', status: 'ok' },
  { row: 11, col: 'D', parsedValue: '1,470', mappedField: 'subtotal_amount', status: 'error', diff: '원본: 1,470 / 파싱: 1,470 — 타입 불일치 (string vs number)' },
];

const statusChip = (status: 'ok' | 'warn' | 'error') => {
  switch (status) {
    case 'ok': return <Chip icon={<CheckCircle />} label="🟢" size="small" color="success" sx={{ fontWeight: 600, minWidth: 50 }} />;
    case 'warn': return <Chip icon={<Warning />} label="🟡" size="small" color="warning" sx={{ fontWeight: 600, minWidth: 50 }} />;
    case 'error': return <Chip icon={<ErrorIcon />} label="🔴" size="small" color="error" sx={{ fontWeight: 600, minWidth: 50 }} />;
  }
};

const ParsedDataReview: React.FC = () => {
  const navigate = useNavigate();
  const [highlightRow, setHighlightRow] = useState<string | null>(null);
  const [reviewed, setReviewed] = useState(false);

  const totalOk = mockParsedData.filter(c => c.status === 'ok').length;
  const totalWarn = mockParsedData.filter(c => c.status === 'warn').length;
  const totalError = mockParsedData.filter(c => c.status === 'error').length;

  const rowKey = (row: number, col: string) => `${row}-${col}`;

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <WorkflowStepper activeStep={1} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5" fontWeight={700} color="#003875">검증</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip icon={<CheckCircle />} label={`정상 ${totalOk}`} size="small" color="success" variant="outlined" />
          <Chip icon={<Warning />} label={`확인필요 ${totalWarn}`} size="small" color="warning" variant="outlined" />
          <Chip icon={<ErrorIcon />} label={`오류 ${totalError}`} size="small" color="error" variant="outlined" />
        </Box>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        원본 엑셀 데이터와 파싱된 구조화 데이터를 나란히 비교하여 파싱 정확도를 확인하세요. 차이가 있는 셀은 하이라이트됩니다.
      </Typography>

      {/* ── 좌우 비교 레이아웃 ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* 좌: 원본 데이터 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: '#003875' }}>
              📄 원본 엑셀 데이터
            </Typography>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f5f7fa', width: 50 }}>행</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f5f7fa', width: 40 }}>열</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f5f7fa' }}>값</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f5f7fa', width: 80 }}>유형</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockRawData.map((cell, i) => {
                    const key = rowKey(cell.row, cell.col);
                    const parsed = mockParsedData.find(p => p.row === cell.row && p.col === cell.col);
                    const hasDiff = parsed?.status === 'warn' || parsed?.status === 'error';
                    return (
                      <TableRow
                        key={i}
                        hover
                        selected={highlightRow === key}
                        onClick={() => setHighlightRow(highlightRow === key ? null : key)}
                        sx={{
                          cursor: 'pointer',
                          bgcolor: highlightRow === key ? '#e3f2fd' :
                            hasDiff ? (parsed?.status === 'error' ? '#ffebee' : '#fff8e1') :
                            cell.type === '섹션 헤더' ? '#e8eef5' : cell.type === '소계' ? '#f5f5f5' : undefined,
                          transition: 'background-color 0.2s',
                        }}
                      >
                        <TableCell sx={{ fontFamily: 'monospace', color: '#666' }}>{cell.row}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', color: '#666' }}>{cell.col}</TableCell>
                        <TableCell sx={{
                          fontWeight: cell.type === '섹션 헤더' || cell.type === '소계' ? 700 : 400,
                          ...(hasDiff && { borderLeft: `3px solid ${parsed?.status === 'error' ? '#f44336' : '#ff9800'}` }),
                        }}>
                          {cell.value}
                        </TableCell>
                        <TableCell>
                          <Chip label={cell.type} size="small" variant="outlined" sx={{ fontSize: 11, height: 22 }} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* 우: 파싱 데이터 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: '#003875' }}>
              🏗️ 파싱된 구조화 데이터
            </Typography>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f5f7fa', width: 50 }}>행</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f5f7fa', width: 40 }}>열</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f5f7fa' }}>파싱값</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f5f7fa', width: 110 }}>매핑 필드</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f5f7fa', width: 60 }} align="center">상태</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockParsedData.map((cell, i) => {
                    const key = rowKey(cell.row, cell.col);
                    const hasDiff = cell.status === 'warn' || cell.status === 'error';
                    return (
                      <TableRow
                        key={i}
                        hover
                        selected={highlightRow === key}
                        onClick={() => setHighlightRow(highlightRow === key ? null : key)}
                        sx={{
                          cursor: 'pointer',
                          bgcolor: highlightRow === key ? '#e3f2fd' :
                            hasDiff ? (cell.status === 'error' ? '#ffebee' : '#fff8e1') : undefined,
                          transition: 'background-color 0.2s',
                        }}
                      >
                        <TableCell sx={{ fontFamily: 'monospace', color: '#666' }}>{cell.row}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', color: '#666' }}>{cell.col}</TableCell>
                        <TableCell sx={{
                          fontWeight: 600,
                          ...(hasDiff && { borderLeft: `3px solid ${cell.status === 'error' ? '#f44336' : '#ff9800'}` }),
                        }}>
                          {hasDiff ? (
                            <Tooltip title={cell.diff || ''} arrow>
                              <Box component="span" sx={{ cursor: 'help' }}>
                                {cell.parsedValue}
                                {cell.status === 'error' ? ' ❌' : ' ⚠️'}
                              </Box>
                            </Tooltip>
                          ) : cell.parsedValue}
                        </TableCell>
                        <TableCell>
                          <Chip label={cell.mappedField} size="small" variant="outlined"
                            sx={{ fontSize: 10, height: 22, fontFamily: 'monospace' }} />
                        </TableCell>
                        <TableCell align="center">{statusChip(cell.status)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* 차이 요약 */}
      {(totalWarn > 0 || totalError > 0) && (
        <Alert severity={totalError > 0 ? 'error' : 'warning'} sx={{ mb: 3 }}>
          {totalError > 0 && `오류 ${totalError}건 — 파싱 결과를 재확인하세요. `}
          {totalWarn > 0 && `확인필요 ${totalWarn}건 — 매핑 정확도를 점검하세요.`}
        </Alert>
      )}

      {/* 검토 완료 / 네비게이션 */}
      {reviewed && (
        <Alert severity="success" sx={{ mb: 2 }}>
          검증이 완료되었습니다. 분석 단계로 진행할 수 있습니다.
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="outlined" startIcon={<NavigateBefore />} onClick={() => navigate('/parsing')}>
          파싱으로 돌아가기
        </Button>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {!reviewed && (
            <Button variant="contained" color="success" startIcon={<CheckCircle />}
              onClick={() => setReviewed(true)} sx={{ fontWeight: 700 }}>
              검증 완료
            </Button>
          )}
          <Button variant="contained" endIcon={<NavigateNext />}
            onClick={() => navigate('/analysis')}
            disabled={!reviewed}
            sx={{ bgcolor: '#003875', px: 4 }}>
            분석으로 이동
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ParsedDataReview;
