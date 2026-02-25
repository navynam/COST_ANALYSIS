/**
 * @fileoverview ② 데이터 검토 페이지 - UI 고도화
 * @description 좌우 Split, 원본↔구조화, 매핑 상태 칩, 3자비교 탭, 검토 완료 버튼
 */
import React, { useState } from 'react';
import {
  Box, Typography, Paper, Button, Chip, Tab, Tabs, Grid,
  Accordion, AccordionSummary, AccordionDetails,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Alert, Divider, Card, CardContent, Tooltip,
} from '@mui/material';
import {
  ExpandMore, CheckCircle, Warning, Error as ErrorIcon, NavigateNext,
  NavigateBefore,
} from '@mui/icons-material';
import WorkflowStepper from '../components/WorkflowStepper';
import { useNavigate } from 'react-router-dom';

/* ── Mock: 원본 셀 데이터 ── */
const mockRawData = [
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

/* ── Mock: 구조화 데이터 ── */
interface StructuredItem {
  name: string;
  unitPrice?: number;
  quantity?: number;
  amount: number;
  status: 'ok' | 'warn' | 'error';
  note?: string;
}

interface Section {
  name: string;
  items: StructuredItem[];
  subtotal: number;
}

const mockStructured: Section[] = [
  {
    name: '재료비',
    subtotal: 1057,
    items: [
      { name: 'PP+TD20 원재료', unitPrice: 2150, quantity: 0.45, amount: 967, status: 'ok' },
      { name: 'Masterbatch', unitPrice: 4500, quantity: 0.02, amount: 90, status: 'ok' },
    ],
  },
  {
    name: '가공비',
    subtotal: 1470,
    items: [
      { name: '노무비', amount: 850, status: 'ok' },
      { name: '경비', amount: 620, status: 'warn', note: '전분기 대비 18% 상승' },
    ],
  },
  {
    name: '제조원가',
    subtotal: 2527,
    items: [
      { name: '재료비+가공비', amount: 2527, status: 'ok' },
    ],
  },
  {
    name: '금형비',
    subtotal: 15000000,
    items: [
      { name: '금형 제작비', amount: 12000000, status: 'ok' },
      { name: '금형 수정비', amount: 3000000, status: 'error', note: '단가 미기재' },
    ],
  },
];

/* ── Mock: 3자비교 데이터 ── */
const mock3Way = {
  bidder: [
    { item: '재료비', amount: 1057 },
    { item: '가공비', amount: 1470 },
    { item: '경비', amount: 620 },
    { item: '이윤', amount: 380 },
    { item: '총원가', amount: 3527 },
  ],
  oem: [
    { item: '재료비', amount: 1120 },
    { item: '가공비', amount: 1380 },
    { item: '경비', amount: 590 },
    { item: '이윤', amount: 350 },
    { item: '총원가', amount: 3440 },
  ],
  mobis: [
    { item: '재료비', amount: 1090 },
    { item: '가공비', amount: 1500 },
    { item: '경비', amount: 610 },
    { item: '이윤', amount: 370 },
    { item: '총원가', amount: 3570 },
  ],
};

const statusChip = (status: 'ok' | 'warn' | 'error') => {
  switch (status) {
    case 'ok': return <Chip icon={<CheckCircle />} label="정상" size="small" color="success" sx={{ fontWeight: 600 }} />;
    case 'warn': return <Chip icon={<Warning />} label="확인필요" size="small" color="warning" sx={{ fontWeight: 600 }} />;
    case 'error': return <Chip icon={<ErrorIcon />} label="오류" size="small" color="error" sx={{ fontWeight: 600 }} />;
  }
};

const fmt = (n: number) => n.toLocaleString('ko-KR');

const ParsedDataReview: React.FC = () => {
  const navigate = useNavigate();
  const [tab3Way, setTab3Way] = useState(0);
  const [reviewed, setReviewed] = useState(false);
  const [highlightRow, setHighlightRow] = useState<number | null>(null);

  const totalOk = mockStructured.flatMap(s => s.items).filter(i => i.status === 'ok').length;
  const totalWarn = mockStructured.flatMap(s => s.items).filter(i => i.status === 'warn').length;
  const totalError = mockStructured.flatMap(s => s.items).filter(i => i.status === 'error').length;

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <WorkflowStepper activeStep={1} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5" fontWeight={700} color="#003875">데이터 검토</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip icon={<CheckCircle />} label={`정상 ${totalOk}`} size="small" color="success" variant="outlined" />
          <Chip icon={<Warning />} label={`확인필요 ${totalWarn}`} size="small" color="warning" variant="outlined" />
          <Chip icon={<ErrorIcon />} label={`오류 ${totalError}`} size="small" color="error" variant="outlined" />
        </Box>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        좌측 원본 데이터와 우측 구조화 결과를 대조하여 매핑 정확도를 확인하세요.
      </Typography>

      {/* ── 좌우 Split 레이아웃 ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* 좌: 원본 데이터 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: '#003875' }}>
              📄 원본 데이터 (셀 위치)
            </Typography>
            <TableContainer sx={{ maxHeight: 500 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f5f7fa', width: 60 }}>행</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f5f7fa', width: 40 }}>열</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f5f7fa' }}>값</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f5f7fa', width: 80 }}>유형</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockRawData.map((cell, i) => (
                    <TableRow
                      key={i}
                      hover
                      selected={highlightRow === cell.row}
                      onClick={() => setHighlightRow(cell.row)}
                      sx={{
                        cursor: 'pointer',
                        bgcolor: cell.type === '섹션 헤더' ? '#e8eef5' : cell.type === '소계' ? '#fff8e1' : undefined,
                      }}
                    >
                      <TableCell sx={{ fontFamily: 'monospace', color: '#666' }}>{cell.row}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', color: '#666' }}>{cell.col}</TableCell>
                      <TableCell sx={{ fontWeight: cell.type === '섹션 헤더' || cell.type === '소계' ? 700 : 400 }}>
                        {cell.value}
                      </TableCell>
                      <TableCell>
                        <Chip label={cell.type} size="small" variant="outlined"
                          sx={{ fontSize: 11, height: 22 }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* 우: 구조화 트리/아코디언 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: '#003875' }}>
              🏗️ 구조화된 데이터 (섹션별)
            </Typography>
            <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
              {mockStructured.map((section, si) => (
                <Accordion key={si} defaultExpanded={si < 2} sx={{ '&:before': { display: 'none' }, boxShadow: 'none', border: '1px solid #e0e0e0', mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: '#f8f9fc' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <Typography fontWeight={700}>{section.name}</Typography>
                      <Box sx={{ flex: 1 }} />
                      <Chip label={`₩${fmt(section.subtotal)}`} size="small"
                        sx={{ bgcolor: '#003875', color: '#fff', fontWeight: 700 }} />
                      <Chip label={`${section.items.length}건`} size="small" variant="outlined" />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 0 }}>
                    <Table size="small">
                      <TableBody>
                        {section.items.map((item, ii) => (
                          <TableRow key={ii} hover>
                            <TableCell sx={{ pl: 3 }}>{item.name}</TableCell>
                            <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                              {item.unitPrice ? `₩${fmt(item.unitPrice)}` : ''}
                            </TableCell>
                            <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                              {item.quantity ?? ''}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                              ₩{fmt(item.amount)}
                            </TableCell>
                            <TableCell align="center">{statusChip(item.status)}</TableCell>
                            <TableCell>
                              {item.note && (
                                <Tooltip title={item.note}>
                                  <Typography variant="caption" color="warning.main" sx={{ cursor: 'help' }}>
                                    ⚠ {item.note}
                                  </Typography>
                                </Tooltip>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ── 3자 비교 탭 ── */}
      <Paper sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ px: 2, pt: 1, bgcolor: '#f8f9fc' }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: '#003875' }}>
            📊 3자 비교 (입찰 / OEM / MOBIS)
          </Typography>
          <Tabs value={tab3Way} onChange={(_, v) => setTab3Way(v)} indicatorColor="primary">
            <Tab label="입찰" />
            <Tab label="OEM" />
            <Tab label="MOBIS" />
            <Tab label="나란히 비교" />
          </Tabs>
        </Box>
        <Box sx={{ p: 2 }}>
          {tab3Way < 3 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 700 }}>항목</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>금액 (원)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(tab3Way === 0 ? mock3Way.bidder : tab3Way === 1 ? mock3Way.oem : mock3Way.mobis).map((r, i) => (
                    <TableRow key={i} hover sx={{ bgcolor: r.item === '총원가' ? '#e8eef5' : undefined }}>
                      <TableCell sx={{ fontWeight: r.item === '총원가' ? 700 : 400 }}>{r.item}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: r.item === '총원가' ? 700 : 400, fontFamily: 'monospace' }}>
                        ₩{fmt(r.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 700 }}>항목</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>입찰</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>OEM</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>MOBIS</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>최대 차이</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mock3Way.bidder.map((r, i) => {
                    const oemVal = mock3Way.oem[i].amount;
                    const mobisVal = mock3Way.mobis[i].amount;
                    const vals = [r.amount, oemVal, mobisVal];
                    const minV = Math.min(...vals);
                    const maxV = Math.max(...vals);
                    const diff = minV > 0 ? ((maxV - minV) / minV * 100).toFixed(1) : '-';
                    return (
                      <TableRow key={i} hover sx={{ bgcolor: r.item === '총원가' ? '#e8eef5' : undefined }}>
                        <TableCell sx={{ fontWeight: r.item === '총원가' ? 700 : 400 }}>{r.item}</TableCell>
                        <TableCell align="right" sx={{
                          fontFamily: 'monospace',
                          bgcolor: r.amount === maxV && vals.filter(v => v === maxV).length === 1 ? '#ffebee' : undefined,
                          fontWeight: r.amount === minV ? 700 : 400,
                        }}>₩{fmt(r.amount)}</TableCell>
                        <TableCell align="right" sx={{
                          fontFamily: 'monospace',
                          bgcolor: oemVal === maxV && vals.filter(v => v === maxV).length === 1 ? '#ffebee' : undefined,
                          fontWeight: oemVal === minV ? 700 : 400,
                        }}>₩{fmt(oemVal)}</TableCell>
                        <TableCell align="right" sx={{
                          fontFamily: 'monospace',
                          bgcolor: mobisVal === maxV && vals.filter(v => v === maxV).length === 1 ? '#ffebee' : undefined,
                          fontWeight: mobisVal === minV ? 700 : 400,
                        }}>₩{fmt(mobisVal)}</TableCell>
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
          )}
        </Box>
      </Paper>

      {/* ── 검토 완료 / 네비게이션 ── */}
      {reviewed && (
        <Alert severity="success" sx={{ mb: 2 }}>
          데이터 검토가 완료되었습니다. 검증 단계로 진행할 수 있습니다.
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
              검토 완료
            </Button>
          )}
          <Button variant="contained" endIcon={<NavigateNext />}
            onClick={() => navigate('/verification')}
            disabled={!reviewed}
            sx={{ bgcolor: '#003875', px: 4 }}>
            검증으로 이동
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ParsedDataReview;
