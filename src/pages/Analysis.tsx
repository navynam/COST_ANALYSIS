/**
 * @fileoverview ③ 분석 페이지 — 표준/리스트/관계도/원본보기 4가지 뷰 탭
 */
import React, { useState } from 'react';
import {
  Box, Typography, Paper, Button, Chip, Popover, Tabs, Tab, Dialog, DialogTitle, DialogContent, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, ClickAwayListener, Collapse,
} from '@mui/material';
import { NavigateNext, NavigateBefore, Close, ExpandMore, ChevronRight } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/* ── 색상 상수 ── */
const C = {
  blue: '#0071e3', red: '#ff3b30', green: '#34c759', orange: '#ff9500',
  purple: '#af52de', gray: '#86868b', dark: '#1d1d1f', border: '#e5e5e7', bg: '#f5f5f7',
};

/* ── 데이터 타입 ── */
interface CostRow {
  level: 'L0' | 'L1';
  category: string;
  name: string;
  spec: string;
  unit: string;
  qty: number | string;
  unitPrice: string;
  amount: string;
  ratio: string;
  confidence: number;
  status: 'normal' | 'anomaly';
  anomalyReason?: string;
  hasSub?: boolean;
  editable?: boolean;
}

interface CostGroup {
  id: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  totalAmount: string;
  totalPct: string;
  anomalyCount: number;
  secondColHeader: string;
  rows: CostRow[];
}

/* ── 데모 데이터 (기존 HTML과 동일) ── */
const costGroups: CostGroup[] = [
  {
    id: 'material', icon: 'Ⅰ', iconBg: '#e8f4fd', iconColor: C.blue,
    title: '재료비', totalAmount: '₩45,200', totalPct: '58.9%', anomalyCount: 1,
    secondColHeader: '구분',
    rows: [
      { level: 'L0', category: '원자재', name: 'SUBSTRATE (기재)', spec: '1200×800×3T', unit: 'EA', qty: 1, unitPrice: '18,500', amount: '18,500', ratio: '24.1%', confidence: 95, status: 'normal', hasSub: true },
      { level: 'L1', category: '원자재', name: '└ BASE MATERIAL', spec: 'PP+GF30', unit: 'KG', qty: 2.4, unitPrice: '5,000', amount: '12,000', ratio: '15.6%', confidence: 94, status: 'normal' },
      { level: 'L1', category: '가공비', name: '└ 압출 성형', spec: '', unit: '회', qty: 1, unitPrice: '6,500', amount: '6,500', ratio: '8.5%', confidence: 94, status: 'normal' },
      { level: 'L0', category: '원자재', name: 'SKIN (표피재) ⚠️', spec: 'PVC 0.8mm', unit: 'M²', qty: 1.2, unitPrice: '18,917', amount: '22,700', ratio: '29.6%', confidence: 75, status: 'anomaly', editable: true, anomalyReason: '과거 3개 분기 평균 단가 ₩14,200 대비 +33.2% 높음. 동일 규격(PVC 0.8mm) 시장가 범위: ₩13,500~₩16,800. 현재 단가가 상한을 초과합니다.' },
      { level: 'L0', category: '원자재', name: 'ADHESIVE (접착제)', spec: 'WATER BASE', unit: 'KG', qty: 0.5, unitPrice: '4,400', amount: '2,200', ratio: '2.9%', confidence: 98, status: 'normal' },
      { level: 'L0', category: '부자재', name: 'CLIP', spec: 'PA66', unit: 'EA', qty: 12, unitPrice: '75', amount: '900', ratio: '1.2%', confidence: 98, status: 'normal' },
      { level: 'L0', category: '부자재', name: 'PACKING (포장재)', spec: '골판지', unit: 'SET', qty: 1, unitPrice: '900', amount: '900', ratio: '1.2%', confidence: 98, status: 'normal' },
    ],
  },
  {
    id: 'processing', icon: 'Ⅱ', iconBg: '#e8fde8', iconColor: C.green,
    title: '가공비', totalAmount: '₩23,100', totalPct: '30.1%', anomalyCount: 0,
    secondColHeader: '공정',
    rows: [
      { level: 'L0', category: '성형', name: '프레스 성형', spec: '', unit: '회', qty: 1, unitPrice: '8,500', amount: '8,500', ratio: '11.1%', confidence: 96, status: 'normal' },
      { level: 'L0', category: '접착', name: '접착 공정', spec: '', unit: '회', qty: 1, unitPrice: '6,200', amount: '6,200', ratio: '8.1%', confidence: 94, status: 'normal' },
      { level: 'L0', category: '후처리', name: '트리밍', spec: '', unit: '회', qty: 1, unitPrice: '5,400', amount: '5,400', ratio: '7.0%', confidence: 92, status: 'normal' },
      { level: 'L0', category: '검사', name: '검사/포장', spec: '', unit: '회', qty: 1, unitPrice: '3,000', amount: '3,000', ratio: '3.9%', confidence: 90, status: 'normal' },
    ],
  },
  {
    id: 'overhead', icon: 'Ⅲ', iconBg: '#fde8e8', iconColor: C.red,
    title: '제경비', totalAmount: '₩8,500', totalPct: '11.1%', anomalyCount: 1,
    secondColHeader: '구분',
    rows: [
      { level: 'L0', category: '감가상각', name: '감가상각비', spec: '', unit: '', qty: '', unitPrice: '', amount: '3,200', ratio: '4.2%', confidence: 90, status: 'normal' },
      { level: 'L0', category: '유틸리티', name: '전력비', spec: '', unit: '', qty: '', unitPrice: '', amount: '2,800', ratio: '3.6%', confidence: 88, status: 'normal' },
      { level: 'L0', category: '기타', name: '기타 경비 ⚠️', spec: '', unit: '', qty: '', unitPrice: '', amount: '2,500', ratio: '3.3%', confidence: 72, status: 'anomaly', editable: true, anomalyReason: '기타 경비가 전체 제경비의 29.4%를 차지하고 있어 일반적 범위(10~20%)를 초과합니다. 세부 내역 확인이 필요합니다.' },
    ],
  },
];

/* ── 소계 데이터 ── */
const summaryRows = [
  { label: 'Ⅰ. 재료비', amount: '₩45,200', pct: '58.9%', barWidth: 58.9, barColor: C.blue, anomalies: 1 },
  { label: 'Ⅱ. 가공비', amount: '₩23,100', pct: '30.1%', barWidth: 30.1, barColor: C.green, anomalies: 0 },
  { label: 'Ⅲ. 제경비', amount: '₩8,500', pct: '11.1%', barWidth: 11.1, barColor: C.orange, anomalies: 1 },
];

/* ── 리스트 뷰 데이터 ── */
interface ListItem {
  id: string;
  name: string;
  category: string;
  spec: string;
  unit: string;
  qty: number | string;
  unitPrice: string;
  amount: string;
  ratio: string;
  confidence: number;
  status: 'normal' | 'anomaly';
  children?: ListItem[];
}

interface ListGroup {
  id: string;
  title: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  items: ListItem[];
}

const listData: ListGroup[] = [
  {
    id: 'material', title: '재료비', icon: 'Ⅰ', iconBg: '#e8f4fd', iconColor: C.blue,
    items: [
      {
        id: 'substrate', name: 'SUBSTRATE (기재)', category: '원자재', spec: '1200×800×3T', unit: 'EA', qty: 1, unitPrice: '18,500', amount: '18,500', ratio: '24.1%', confidence: 95, status: 'normal',
        children: [
          { id: 'base', name: 'BASE MATERIAL', category: '원자재', spec: 'PP+GF30', unit: 'KG', qty: 2.4, unitPrice: '5,000', amount: '12,000', ratio: '15.6%', confidence: 94, status: 'normal' },
          { id: 'extrusion', name: '압출 성형', category: '가공비', spec: '', unit: '회', qty: 1, unitPrice: '6,500', amount: '6,500', ratio: '8.5%', confidence: 94, status: 'normal' },
        ],
      },
      { id: 'skin', name: 'SKIN (표피재)', category: '원자재', spec: 'PVC 0.8mm', unit: 'M²', qty: 1.2, unitPrice: '18,917', amount: '22,700', ratio: '29.6%', confidence: 75, status: 'anomaly' },
      { id: 'adhesive', name: 'ADHESIVE (접착제)', category: '원자재', spec: 'WATER BASE', unit: 'KG', qty: 0.5, unitPrice: '4,400', amount: '2,200', ratio: '2.9%', confidence: 98, status: 'normal' },
      { id: 'clip', name: 'CLIP', category: '부자재', spec: 'PA66', unit: 'EA', qty: 12, unitPrice: '75', amount: '900', ratio: '1.2%', confidence: 98, status: 'normal' },
      { id: 'packing', name: 'PACKING (포장재)', category: '부자재', spec: '골판지', unit: 'SET', qty: 1, unitPrice: '900', amount: '900', ratio: '1.2%', confidence: 98, status: 'normal' },
    ],
  },
  {
    id: 'processing', title: '가공비', icon: 'Ⅱ', iconBg: '#e8fde8', iconColor: C.green,
    items: [
      { id: 'press', name: '프레스 성형', category: '성형', spec: '', unit: '회', qty: 1, unitPrice: '8,500', amount: '8,500', ratio: '11.1%', confidence: 96, status: 'normal' },
      { id: 'bond', name: '접착 공정', category: '접착', spec: '', unit: '회', qty: 1, unitPrice: '6,200', amount: '6,200', ratio: '8.1%', confidence: 94, status: 'normal' },
      { id: 'trim', name: '트리밍', category: '후처리', spec: '', unit: '회', qty: 1, unitPrice: '5,400', amount: '5,400', ratio: '7.0%', confidence: 92, status: 'normal' },
      { id: 'inspect', name: '검사/포장', category: '검사', spec: '', unit: '회', qty: 1, unitPrice: '3,000', amount: '3,000', ratio: '3.9%', confidence: 90, status: 'normal' },
    ],
  },
  {
    id: 'overhead', title: '제경비', icon: 'Ⅲ', iconBg: '#fde8e8', iconColor: C.red,
    items: [
      { id: 'dep', name: '감가상각비', category: '감가상각', spec: '', unit: '', qty: '', unitPrice: '', amount: '3,200', ratio: '4.2%', confidence: 90, status: 'normal' },
      { id: 'elec', name: '전력비', category: '유틸리티', spec: '', unit: '', qty: '', unitPrice: '', amount: '2,800', ratio: '3.6%', confidence: 88, status: 'normal' },
      { id: 'etc', name: '기타 경비', category: '기타', spec: '', unit: '', qty: '', unitPrice: '', amount: '2,500', ratio: '3.3%', confidence: 72, status: 'anomaly' },
    ],
  },
];

/* ── 원본 엑셀 데이터 ── */
const excelData = [
  { cols: [{ text: '원 가 계 산 서', colSpan: 7, bold: true, align: 'center' as const, bg: '#fff' }] },
  { cols: [
    { text: 'E.O. NO.', bg: '#e8f4fd', bold: true }, { text: 'EO-2024-1201', colSpan: 2 }, { text: '' },
    { text: '품번', bg: '#e8f4fd', bold: true }, { text: 'HL-2024-001', colSpan: 2 },
  ]},
  { cols: [
    { text: '품명', bg: '#e8f4fd', bold: true }, { text: 'HEAD LINING', colSpan: 2 }, { text: '' },
    { text: '협력사', bg: '#e8f4fd', bold: true }, { text: '대한(주)', colSpan: 2 },
  ]},
  { cols: [
    { text: '구분', bg: '#4472C4', color: '#fff', bold: true },
    { text: '품명', bg: '#4472C4', color: '#fff', bold: true },
    { text: '규격', bg: '#4472C4', color: '#fff', bold: true },
    { text: '단위', bg: '#4472C4', color: '#fff', bold: true },
    { text: '수량', bg: '#4472C4', color: '#fff', bold: true },
    { text: '단가', bg: '#4472C4', color: '#fff', bold: true },
    { text: '금액', bg: '#4472C4', color: '#fff', bold: true },
  ]},
  { cols: [
    { text: '원자재' }, { text: 'SUBSTRATE (기재)' }, { text: '1200×800×3T' }, { text: 'EA' }, { text: '1' }, { text: '18,500', bg: '#d4edda' }, { text: '18,500', bg: '#d4edda' },
  ]},
  { cols: [
    { text: '원자재' }, { text: 'SKIN (표피재)' }, { text: 'PVC 0.8mm' }, { text: 'M²' }, { text: '1.2' }, { text: '18,917', bg: '#f8d7da' }, { text: '22,700', bg: '#f8d7da' },
  ]},
  { cols: [
    { text: '원자재' }, { text: 'ADHESIVE (접착제)' }, { text: 'WATER BASE' }, { text: 'KG' }, { text: '0.5' }, { text: '4,400', bg: '#d4edda' }, { text: '2,200', bg: '#d4edda' },
  ]},
  { cols: [
    { text: '부자재' }, { text: 'CLIP' }, { text: 'PA66' }, { text: 'EA' }, { text: '12' }, { text: '75', bg: '#d4edda' }, { text: '900', bg: '#d4edda' },
  ]},
  { cols: [
    { text: '부자재' }, { text: 'PACKING (포장재)' }, { text: '골판지' }, { text: 'SET' }, { text: '1' }, { text: '900', bg: '#d4edda' }, { text: '900', bg: '#d4edda' },
  ]},
  { cols: [
    { text: '성형' }, { text: '프레스 성형' }, { text: '' }, { text: '회' }, { text: '1' }, { text: '8,500', bg: '#d4edda' }, { text: '8,500', bg: '#d4edda' },
  ]},
  { cols: [
    { text: '접착' }, { text: '접착 공정' }, { text: '' }, { text: '회' }, { text: '1' }, { text: '6,200', bg: '#d4edda' }, { text: '6,200', bg: '#d4edda' },
  ]},
  { cols: [
    { text: '후처리' }, { text: '트리밍' }, { text: '' }, { text: '회' }, { text: '1' }, { text: '5,400', bg: '#d4edda' }, { text: '5,400', bg: '#d4edda' },
  ]},
  { cols: [
    { text: '검사' }, { text: '검사/포장' }, { text: '' }, { text: '회' }, { text: '1' }, { text: '3,000', bg: '#d4edda' }, { text: '3,000', bg: '#d4edda' },
  ]},
  { cols: [
    { text: '감가상각' }, { text: '감가상각비' }, { text: '' }, { text: '' }, { text: '' }, { text: '', bg: '#d4edda' }, { text: '3,200', bg: '#d4edda' },
  ]},
  { cols: [
    { text: '유틸리티' }, { text: '전력비' }, { text: '' }, { text: '' }, { text: '' }, { text: '', bg: '#d4edda' }, { text: '2,800', bg: '#d4edda' },
  ]},
  { cols: [
    { text: '기타' }, { text: '기타 경비' }, { text: '' }, { text: '' }, { text: '' }, { text: '', bg: '#f8d7da' }, { text: '2,500', bg: '#f8d7da' },
  ]},
  { cols: [
    { text: '합계', bold: true, bg: '#e8f4fd' }, { text: '', bg: '#e8f4fd' }, { text: '', bg: '#e8f4fd' }, { text: '', bg: '#e8f4fd' }, { text: '', bg: '#e8f4fd' }, { text: '', bg: '#e8f4fd' }, { text: '₩76,800', bold: true, bg: '#e8f4fd' },
  ]},
];

/* ── 컴포넌트 ── */
const MiniConfidence: React.FC<{ value: number }> = ({ value }) => {
  const color = value >= 85 ? C.green : value >= 70 ? C.orange : C.red;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Box sx={{ width: 40, height: 3, bgcolor: '#e5e5e7', borderRadius: 2, overflow: 'hidden', display: 'inline-block' }}>
        <Box sx={{ width: `${value}%`, height: '100%', bgcolor: color, borderRadius: 2 }} />
      </Box>
      <Typography sx={{ fontSize: 10, color: value >= 85 ? C.gray : color }}>{value}%</Typography>
    </Box>
  );
};

const ConfidenceBar: React.FC<{ value: number; width?: number }> = ({ value, width = 60 }) => {
  const color = value >= 85 ? C.green : value >= 70 ? C.orange : C.red;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
      <Box sx={{ width, height: 6, bgcolor: '#e5e5e7', borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ width: `${value}%`, height: '100%', bgcolor: color, borderRadius: 3 }} />
      </Box>
      <Typography sx={{ fontSize: 11, fontWeight: 600, color }}>{value}%</Typography>
    </Box>
  );
};

const LevelBadge: React.FC<{ level: 'L0' | 'L1' }> = ({ level }) => (
  <Box sx={{
    display: 'inline-block', fontSize: 10, fontWeight: 700, px: 0.75, py: 0.25, borderRadius: '4px',
    bgcolor: level === 'L0' ? '#e8edf3' : '#dce6f7',
    color: level === 'L0' ? '#555' : C.blue,
  }}>{level}</Box>
);

const StatusBadge: React.FC<{ status: 'normal' | 'anomaly' }> = ({ status }) => (
  <Box sx={{
    display: 'inline-block', fontSize: 10, fontWeight: 600, px: 0.75, py: 0.25, borderRadius: '4px',
    bgcolor: status === 'normal' ? '#d4edda' : '#f8d7da',
    color: status === 'normal' ? C.green : C.red,
  }}>{status === 'normal' ? '정상' : '이상치'}</Box>
);

/* ── 리스트 뷰 컴포넌트 ── */
const ListViewRow: React.FC<{ item: ListItem; depth?: number }> = ({ item, depth = 0 }) => {
  const [open, setOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isAnomaly = item.status === 'anomaly';

  return (
    <>
      <TableRow
        sx={{
          cursor: hasChildren ? 'pointer' : 'default',
          '&:hover': { bgcolor: '#f8f9ff' },
          ...(isAnomaly && { bgcolor: '#fff8f8' }),
        }}
        onClick={() => hasChildren && setOpen(!open)}
      >
        <TableCell sx={{ ...tdSx, pl: 1.5 + depth * 2, whiteSpace: 'nowrap' }}>
          {hasChildren && (open ? <ExpandMore sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} /> : <ChevronRight sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />)}
          {item.category}
        </TableCell>
        <TableCell sx={{ ...tdSx, fontWeight: 500 }}>
          {item.name}
          {isAnomaly && <Typography component="span" sx={{ ml: 0.5, color: C.red, fontSize: 11 }}>⚠️</Typography>}
        </TableCell>
        <TableCell sx={tdSx}>{item.spec}</TableCell>
        <TableCell sx={tdSx}>{item.unit}</TableCell>
        <TableCell sx={tdSx}>{item.qty}</TableCell>
        <TableCell sx={tdSx}>{item.unitPrice}</TableCell>
        <TableCell sx={{ ...tdSx, fontWeight: 600, ...(isAnomaly && { color: C.red }) }}>{item.amount}</TableCell>
        <TableCell sx={tdSx}>{item.ratio}</TableCell>
        <TableCell sx={tdSx}><MiniConfidence value={item.confidence} /></TableCell>
        <TableCell sx={tdSx}><StatusBadge status={item.status} /></TableCell>
      </TableRow>
      {hasChildren && (
        <TableRow>
          <TableCell colSpan={10} sx={{ p: 0, border: 'none' }}>
            <Collapse in={open}>
              <Table size="small">
                <TableBody>
                  {item.children!.map(child => (
                    <ListViewRow key={child.id} item={child} depth={depth + 1} />
                  ))}
                </TableBody>
              </Table>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

/* ── 관계도 뷰 ── */
const RelationView: React.FC = () => {
  const nodes = [
    { id: 'root', label: 'HEAD LINING', sub: '생산원가', amount: '₩76,800', detail: '파싱항목 24건', confidence: 92, x: 400, y: 30, w: 200, h: 100, status: 'normal' as const },
    { id: 'substrate', label: 'SUBSTRATE', sub: '기재', amount: '₩18,500', detail: '24.1%', confidence: 95, x: 100, y: 220, w: 180, h: 100, status: 'normal' as const },
    { id: 'processing', label: '가공비 합계', sub: '4개 공정', amount: '₩23,100', detail: '30.1%', confidence: 93, x: 400, y: 220, w: 180, h: 100, status: 'normal' as const },
    { id: 'skin', label: 'SKIN 표피재', sub: '이상치 감지', amount: '₩22,700', detail: '29.6%', confidence: 75, x: 700, y: 220, w: 180, h: 100, status: 'anomaly' as const },
  ];

  const edges = [
    { from: 'root', to: 'substrate', anomaly: false },
    { from: 'root', to: 'processing', anomaly: false },
    { from: 'root', to: 'skin', anomaly: true },
  ];

  const getCenter = (id: string) => {
    const n = nodes.find(n => n.id === id)!;
    return { x: n.x + n.w / 2, y: n.y + n.h / 2 };
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: 380, overflow: 'auto' }}>
      <svg width="980" height="380" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
        {edges.map(e => {
          const from = getCenter(e.from);
          const to = getCenter(e.to);
          const fromNode = nodes.find(n => n.id === e.from)!;
          const toNode = nodes.find(n => n.id === e.to)!;
          const y1 = fromNode.y + fromNode.h;
          const y2 = toNode.y;
          return (
            <path
              key={`${e.from}-${e.to}`}
              d={`M ${from.x} ${y1} C ${from.x} ${(y1 + y2) / 2}, ${to.x} ${(y1 + y2) / 2}, ${to.x} ${y2}`}
              fill="none"
              stroke={e.anomaly ? C.red : '#c0c0c0'}
              strokeWidth={e.anomaly ? 2.5 : 1.5}
              strokeDasharray={e.anomaly ? '6,3' : 'none'}
            />
          );
        })}
      </svg>
      {nodes.map(n => {
        const isAnomaly = n.status === 'anomaly';
        const isRoot = n.id === 'root';
        return (
          <Paper
            key={n.id}
            sx={{
              position: 'absolute',
              left: n.x,
              top: n.y,
              width: n.w,
              height: n.h,
              borderRadius: '12px',
              border: `2px solid ${isAnomaly ? C.red : isRoot ? C.blue : C.border}`,
              bgcolor: isAnomaly ? '#fff8f8' : '#fff',
              boxShadow: isRoot ? '0 4px 12px rgba(0,113,227,0.15)' : '0 2px 8px rgba(0,0,0,0.06)',
              p: 1.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              zIndex: 1,
            }}
          >
            <Typography sx={{ fontSize: 10, color: isAnomaly ? C.red : C.gray, fontWeight: 600, mb: 0.25 }}>
              {isAnomaly ? '⚠️ ' : ''}{n.sub}
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: C.dark, mb: 0.25 }}>{n.label}</Typography>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: isRoot ? C.blue : C.dark }}>{n.amount}</Typography>
            <Typography sx={{ fontSize: 10, color: C.gray, mb: 0.5 }}>{n.detail}</Typography>
            <ConfidenceBar value={n.confidence} width={n.w - 30} />
          </Paper>
        );
      })}
    </Box>
  );
};

/* ── 원본보기 뷰 ── */
const OriginalView: React.FC = () => (
  <Paper sx={{ borderRadius: '10px', border: `1px solid ${C.border}`, boxShadow: 'none', overflow: 'auto' }}>
    <Box sx={{ p: 2, bgcolor: '#f9f9fb', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography sx={{ fontSize: 14, fontWeight: 600 }}>📄 엑셀 원본 데이터</Typography>
      <Typography sx={{ fontSize: 11, color: C.gray }}>— 파싱 전 원본 셀 매핑</Typography>
    </Box>
    <Table size="small" sx={{ minWidth: 700 }}>
      <TableBody>
        {excelData.map((row, ri) => (
          <TableRow key={ri}>
            {/* Row number */}
            <TableCell sx={{ fontSize: 10, color: C.gray, bgcolor: '#f5f5f5', width: 30, textAlign: 'center', borderRight: `1px solid ${C.border}`, py: 0.75, px: 0.5 }}>
              {ri + 1}
            </TableCell>
            {row.cols.map((col: any, ci: number) => (
              <TableCell
                key={ci}
                colSpan={col.colSpan || 1}
                sx={{
                  fontSize: ri === 0 ? 15 : 12,
                  fontWeight: col.bold ? 700 : 400,
                  textAlign: col.align || 'left',
                  bgcolor: col.bg || '#fff',
                  color: col.color || C.dark,
                  py: ri === 0 ? 1.5 : 0.75,
                  px: 1,
                  border: `1px solid ${C.border}`,
                  whiteSpace: 'nowrap',
                }}
              >
                {col.text}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
    <Box sx={{ p: 1.5, bgcolor: '#f9f9fb', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Box sx={{ width: 12, height: 12, bgcolor: '#d4edda', borderRadius: 2, border: '1px solid #c3e6cb' }} />
        <Typography sx={{ fontSize: 10, color: C.gray }}>정상 파싱</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Box sx={{ width: 12, height: 12, bgcolor: '#f8d7da', borderRadius: 2, border: '1px solid #f5c6cb' }} />
        <Typography sx={{ fontSize: 10, color: C.gray }}>이상치 감지</Typography>
      </Box>
    </Box>
  </Paper>
);

/* ── 메인 컴포넌트 ── */
const Analysis: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [editCell, setEditCell] = useState<{ groupId: string; rowIdx: number; field: 'unitPrice' | 'amount' } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [anomalyAnchor, setAnomalyAnchor] = useState<{ el: HTMLElement; reason: string } | null>(null);

  const startEdit = (groupId: string, rowIdx: number, field: 'unitPrice' | 'amount', currentValue: string) => {
    setEditCell({ groupId, rowIdx, field });
    setEditValue(currentValue);
  };

  const isOverhead = (groupId: string) => groupId === 'overhead';

  const tabLabels = ['표준', '리스트', '관계도', '원본보기'];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: C.bg }}>
      {/* Header bar */}
      <Box sx={{ bgcolor: '#fff', borderBottom: `1px solid ${C.border}`, px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: 13, color: C.gray }}>분석 &gt;</Typography>
          <Typography sx={{ fontSize: 16, fontWeight: 700 }}>HEAD_LINING_원가계산서</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" size="small" sx={btnOutlineSx}>📄 원본보기</Button>
          <Button variant="outlined" size="small" sx={btnOutlineSx}>초기화</Button>
          <Button variant="outlined" size="small" sx={btnOutlineSx}>저장</Button>
          <Button variant="contained" size="small" sx={{ ...btnOutlineSx, bgcolor: C.blue, color: '#fff', borderColor: C.blue, '&:hover': { bgcolor: '#0077ED' } }}>
            완료 &amp; 학습
          </Button>
        </Box>
      </Box>

      {/* Status bar + View Tabs */}
      <Box sx={{ bgcolor: '#fff', borderBottom: `1px solid ${C.border}`, px: 3, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 3 }}>
          {[
            { label: '수정된 항목', value: '1개', color: C.dark },
            { label: '신뢰도', value: '92%', color: C.green },
            { label: '파싱항목', value: '24건', color: C.dark },
            { label: '이상치', value: '2건', color: C.red },
            { label: '하위 견적서', value: '3개', color: C.dark },
          ].map(s => (
            <Box key={s.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography sx={{ fontSize: 12, color: C.gray }}>{s.label}</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: s.color }}>{s.value}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Tab Bar */}
      <Box sx={{ bgcolor: '#fff', borderBottom: `1px solid ${C.border}`, px: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            minHeight: 40,
            '& .MuiTab-root': { minHeight: 40, fontSize: 13, fontWeight: 600, textTransform: 'none', px: 2.5 },
            '& .Mui-selected': { color: C.blue },
            '& .MuiTabs-indicator': { bgcolor: C.blue, height: 2.5 },
          }}
        >
          {tabLabels.map(label => <Tab key={label} label={label} />)}
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ p: 3 }}>
        {/* Info Cards (shared) */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          {[
            { label: 'E.O. NO.', value: 'EO-2024-1201' },
            { label: '품번 / 품명', value: 'HL-2024-001 · HEAD LINING' },
            { label: '협력사 / 담당자', value: '대한(주) · 김철수' },
          ].map(c => (
            <Paper key={c.label} sx={{ flex: 1, p: 2, borderRadius: '10px', border: `1px solid ${C.border}`, boxShadow: 'none' }}>
              <Typography sx={{ fontSize: 11, color: C.gray, mb: 0.5 }}>{c.label}</Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{c.value}</Typography>
            </Paper>
          ))}
          <Paper sx={{ flex: '0 0 140px', p: 2, borderRadius: '10px', border: `1px solid ${C.border}`, boxShadow: 'none' }}>
            <Typography sx={{ fontSize: 11, color: C.gray, mb: 0.5 }}>생산원가</Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: C.blue }}>₩76,800</Typography>
          </Paper>
        </Box>

        {/* ──── 표준 뷰 ──── */}
        {activeTab === 0 && (
          <>
            {costGroups.map(group => (
              <Paper key={group.id} sx={{ mb: 2, borderRadius: '10px', border: `1px solid ${C.border}`, boxShadow: 'none', overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2.5, py: 1.75, bgcolor: '#f9f9fb', borderBottom: `1px solid ${C.border}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Box sx={{ width: 26, height: 26, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, bgcolor: group.iconBg, color: group.iconColor }}>{group.icon}</Box>
                    <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{group.title}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 700 }}>{group.totalAmount}</Typography>
                    <Typography sx={{ fontSize: 13, color: C.gray }}>{group.totalPct}</Typography>
                    {group.anomalyCount > 0 && (
                      <Box sx={{ fontSize: 10, fontWeight: 600, px: 0.75, py: 0.25, borderRadius: '4px', bgcolor: '#f8d7da', color: C.red }}>이상치 {group.anomalyCount}</Box>
                    )}
                  </Box>
                </Box>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#fafafa' }}>
                      <TableCell sx={{ ...tthSx, width: 50 }}>레벨</TableCell>
                      <TableCell sx={{ ...tthSx, width: 80 }}>{group.secondColHeader}</TableCell>
                      <TableCell sx={tthSx}>{group.id === 'processing' ? '공정명' : '품명'}</TableCell>
                      {!isOverhead(group.id) && <TableCell sx={tthSx}>규격</TableCell>}
                      {!isOverhead(group.id) && <TableCell sx={{ ...tthSx, width: 50 }}>단위</TableCell>}
                      {!isOverhead(group.id) && <TableCell sx={{ ...tthSx, width: 50 }}>수량</TableCell>}
                      {!isOverhead(group.id) && <TableCell sx={{ ...tthSx, width: 90 }}>단가</TableCell>}
                      <TableCell sx={{ ...tthSx, width: 90 }}>금액</TableCell>
                      <TableCell sx={{ ...tthSx, width: 60 }}>비율</TableCell>
                      <TableCell sx={{ ...tthSx, width: 70 }}>신뢰도</TableCell>
                      <TableCell sx={{ ...tthSx, width: 60 }}>상태</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {group.rows.map((row, ri) => {
                      const isAnomaly = row.status === 'anomaly';
                      const isSubRow = row.level === 'L1';
                      return (
                        <TableRow key={ri} sx={{
                          ...(isAnomaly && { bgcolor: '#fff8f8 !important', '&:hover td': { bgcolor: '#fff0f0 !important' } }),
                          ...(isSubRow && { '& td': { color: '#666', bgcolor: '#fafcff' } }),
                          '&:hover': { bgcolor: '#f8f9ff' },
                        }}>
                          <TableCell sx={tdSx}><LevelBadge level={row.level} /></TableCell>
                          <TableCell sx={{ ...tdSx, ...(isSubRow && { color: C.gray }) }}>{row.category}</TableCell>
                          <TableCell sx={{ ...tdSx, fontWeight: 500, ...(isSubRow && { pl: 3.5 }) }}>
                            {row.name}
                            {row.hasSub && <Typography component="span" sx={{ fontSize: 11, ml: 1, color: C.blue }}>📎 하위 견적서</Typography>}
                          </TableCell>
                          {!isOverhead(group.id) && <TableCell sx={tdSx}>{row.spec}</TableCell>}
                          {!isOverhead(group.id) && <TableCell sx={tdSx}>{row.unit}</TableCell>}
                          {!isOverhead(group.id) && <TableCell sx={tdSx}>{row.qty}</TableCell>}
                          {!isOverhead(group.id) && (
                            <TableCell sx={{ ...tdSx, cursor: row.editable ? 'pointer' : 'default', '&:hover': row.editable ? { bgcolor: '#e8f4fd', borderRadius: '4px' } : {} }}
                              onClick={() => row.editable && startEdit(group.id, ri, 'unitPrice', row.unitPrice)}>
                              {editCell?.groupId === group.id && editCell.rowIdx === ri && editCell.field === 'unitPrice' ? (
                                <ClickAwayListener onClickAway={() => setEditCell(null)}>
                                  <TextField size="small" value={editValue} onChange={e => setEditValue(e.target.value)} autoFocus
                                    sx={{ '& input': { fontSize: 12, p: '4px 8px' } }} />
                                </ClickAwayListener>
                              ) : row.unitPrice}
                            </TableCell>
                          )}
                          <TableCell sx={{
                            ...tdSx, fontWeight: 600,
                            ...(isAnomaly && { color: C.red }),
                            cursor: row.editable ? 'pointer' : 'default',
                            '&:hover': row.editable ? { bgcolor: '#e8f4fd', borderRadius: '4px' } : {},
                          }} onClick={() => row.editable && startEdit(group.id, ri, 'amount', row.amount)}>
                            {editCell?.groupId === group.id && editCell.rowIdx === ri && editCell.field === 'amount' ? (
                              <ClickAwayListener onClickAway={() => setEditCell(null)}>
                                <TextField size="small" value={editValue} onChange={e => setEditValue(e.target.value)} autoFocus
                                  sx={{ '& input': { fontSize: 12, p: '4px 8px' } }} />
                              </ClickAwayListener>
                            ) : row.amount}
                          </TableCell>
                          <TableCell sx={tdSx}>{row.ratio}</TableCell>
                          <TableCell sx={tdSx}><MiniConfidence value={row.confidence} /></TableCell>
                          <TableCell sx={tdSx}>
                            {isAnomaly ? (
                              <Box sx={{ cursor: 'pointer' }} onClick={(e) => setAnomalyAnchor({ el: e.currentTarget as HTMLElement, reason: row.anomalyReason || '' })}>
                                <StatusBadge status="anomaly" />
                              </Box>
                            ) : (
                              <StatusBadge status="normal" />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Paper>
            ))}

            {/* Summary */}
            <Paper sx={{ mb: 3, borderRadius: '10px', border: `1px solid ${C.border}`, boxShadow: 'none', overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2.5, py: 1.75, bgcolor: '#f9f9fb', borderBottom: `1px solid ${C.border}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Box sx={{ width: 26, height: 26, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, bgcolor: C.dark, color: '#fff' }}>Σ</Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>소계 (생산원가)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Typography sx={{ fontSize: 18, fontWeight: 700, color: C.blue }}>₩76,800</Typography>
                  <Typography sx={{ fontSize: 13, color: C.gray }}>100%</Typography>
                </Box>
              </Box>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#fafafa' }}>
                    <TableCell sx={tthSx}>구분</TableCell>
                    <TableCell sx={{ ...tthSx, width: 120 }}>금액</TableCell>
                    <TableCell sx={{ ...tthSx, width: 80 }}>비율</TableCell>
                    <TableCell sx={{ ...tthSx, width: 200 }}>구성</TableCell>
                    <TableCell sx={{ ...tthSx, width: 80 }}>이상치</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {summaryRows.map(sr => (
                    <TableRow key={sr.label}>
                      <TableCell sx={{ ...tdSx, fontWeight: 600 }}>{sr.label}</TableCell>
                      <TableCell sx={{ ...tdSx, fontWeight: 600 }}>{sr.amount}</TableCell>
                      <TableCell sx={tdSx}>{sr.pct}</TableCell>
                      <TableCell sx={tdSx}>
                        <Box sx={{ display: 'flex', height: 8, bgcolor: '#e5e5e7', borderRadius: 4, overflow: 'hidden' }}>
                          <Box sx={{ width: `${sr.barWidth}%`, bgcolor: sr.barColor, height: '100%' }} />
                        </Box>
                      </TableCell>
                      <TableCell sx={{ ...tdSx, fontWeight: sr.anomalies ? 600 : 400, color: sr.anomalies ? C.red : C.gray }}>{sr.anomalies}건</TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ bgcolor: '#f0f4ff', fontWeight: 700 }}>
                    <TableCell sx={{ ...tdSx, fontWeight: 700 }}>합계</TableCell>
                    <TableCell sx={{ ...tdSx, fontWeight: 700, color: C.blue, fontSize: 15 }}>₩76,800</TableCell>
                    <TableCell sx={{ ...tdSx, fontWeight: 700 }}>100%</TableCell>
                    <TableCell sx={tdSx}>
                      <Box sx={{ display: 'flex', height: 8, bgcolor: '#e5e5e7', borderRadius: 4, overflow: 'hidden' }}>
                        <Box sx={{ width: '58.9%', bgcolor: C.blue, height: '100%' }} />
                        <Box sx={{ width: '30.1%', bgcolor: C.green, height: '100%' }} />
                        <Box sx={{ width: '11.1%', bgcolor: C.orange, height: '100%' }} />
                      </Box>
                    </TableCell>
                    <TableCell sx={{ ...tdSx, color: C.red, fontWeight: 700 }}>2건</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>
          </>
        )}

        {/* ──── 리스트 뷰 ──── */}
        {activeTab === 1 && (
          <>
            {listData.map(group => (
              <Paper key={group.id} sx={{ mb: 2, borderRadius: '10px', border: `1px solid ${C.border}`, boxShadow: 'none', overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 2.5, py: 1.75, bgcolor: '#f9f9fb', borderBottom: `1px solid ${C.border}` }}>
                  <Box sx={{ width: 26, height: 26, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, bgcolor: group.iconBg, color: group.iconColor }}>{group.icon}</Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{group.title}</Typography>
                </Box>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#fafafa' }}>
                      <TableCell sx={{ ...tthSx, width: 100 }}>구분</TableCell>
                      <TableCell sx={tthSx}>품명</TableCell>
                      <TableCell sx={tthSx}>규격</TableCell>
                      <TableCell sx={{ ...tthSx, width: 50 }}>단위</TableCell>
                      <TableCell sx={{ ...tthSx, width: 50 }}>수량</TableCell>
                      <TableCell sx={{ ...tthSx, width: 80 }}>단가</TableCell>
                      <TableCell sx={{ ...tthSx, width: 80 }}>금액</TableCell>
                      <TableCell sx={{ ...tthSx, width: 60 }}>비율</TableCell>
                      <TableCell sx={{ ...tthSx, width: 70 }}>신뢰도</TableCell>
                      <TableCell sx={{ ...tthSx, width: 60 }}>상태</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {group.items.map(item => (
                      <ListViewRow key={item.id} item={item} />
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            ))}
          </>
        )}

        {/* ──── 관계도 뷰 ──── */}
        {activeTab === 2 && (
          <Paper sx={{ borderRadius: '10px', border: `1px solid ${C.border}`, boxShadow: 'none', overflow: 'hidden' }}>
            <Box sx={{ px: 2.5, py: 1.75, bgcolor: '#f9f9fb', borderBottom: `1px solid ${C.border}` }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600 }}>🔗 원가 구조 관계도</Typography>
              <Typography sx={{ fontSize: 11, color: C.gray }}>노드 간 관계와 이상치를 시각적으로 확인합니다</Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <RelationView />
            </Box>
          </Paper>
        )}

        {/* ──── 원본보기 뷰 ──── */}
        {activeTab === 3 && <OriginalView />}

        {/* Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button variant="outlined" startIcon={<NavigateBefore />} onClick={() => navigate('/verification')}
            sx={{ textTransform: 'none', borderColor: C.border, color: C.dark }}>
            검증으로
          </Button>
          <Button variant="contained" endIcon={<NavigateNext />} onClick={() => navigate('/comparison')}
            sx={{ textTransform: 'none', bgcolor: C.blue, px: 4, '&:hover': { bgcolor: '#0077ED' } }}>
            비교로 이동
          </Button>
        </Box>
      </Box>

      {/* Anomaly Reason Popover */}
      <Popover
        open={!!anomalyAnchor}
        anchorEl={anomalyAnchor?.el}
        onClose={() => setAnomalyAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Box sx={{ bgcolor: C.dark, color: '#fff', borderRadius: '8px', p: 1.5, maxWidth: 260, fontSize: 12, lineHeight: 1.5 }}>
          <Typography sx={{ fontWeight: 600, mb: 0.75, color: C.orange, fontSize: 12 }}>🤖 AI 판단 근거</Typography>
          <Typography sx={{ fontSize: 12, color: '#ddd' }}>{anomalyAnchor?.reason}</Typography>
        </Box>
      </Popover>
    </Box>
  );
};

const tthSx = { fontSize: 11, fontWeight: 600, color: '#86868b', py: 1, px: 1.5, borderBottom: `1px solid #e5e5e7`, bgcolor: '#fafafa' };
const tdSx = { fontSize: 12, py: 1.25, px: 1.5, borderBottom: '1px solid #f0f0f0' };
const btnOutlineSx = { textTransform: 'none' as const, fontSize: 12, borderRadius: '6px', borderColor: '#e5e5e7', color: '#1d1d1f' };

export default Analysis;
