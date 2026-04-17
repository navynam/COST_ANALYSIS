import React from 'react';
import {
  Box, Typography, Paper, Button, Checkbox,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { C } from '../../../shared/constants/colors';
import { statusConfig, progressColor } from '../data/mockData';
import type { FileItem, SortField, SortDirection } from '../types';

interface FileTableProps {
  files: FileItem[];
  selectedIds: Set<number>;
  sortField: SortField | null;
  sortDirection: SortDirection;
  onToggleSelect: (id: number) => void;
  onToggleAll: () => void;
  onSort: (field: SortField) => void;
  onRowClick: (file: FileItem) => void;
  onVerify: (fileId: string, fileName: string) => void;
  onAnalysis: () => void;
  onFailedDetail: (file: FileItem) => void;
  onNoteClick: (fileId: string) => void;
  getNoteCount: (fileId: string) => number;
}

const thSx = { fontSize: 12, fontWeight: 700, color: '#4e5968', py: 1.5, textAlign: 'center' as const };

const SortIcon: React.FC<{ field: SortField; active: SortField | null; direction: SortDirection }> = ({ field, active, direction }) =>
  active === field ? (direction === 'asc' ? <ArrowUpward sx={{ fontSize: 14 }} /> : <ArrowDownward sx={{ fontSize: 14 }} />) : null;

const FileTable: React.FC<FileTableProps> = ({
  files, selectedIds, sortField, sortDirection,
  onToggleSelect, onToggleAll, onSort, onRowClick, onVerify, onAnalysis, onFailedDetail,
  onNoteClick, getNoteCount,
}) => {
  const columns: { key: string; sortKey?: SortField; label: string; width?: number }[] = [
    { key: 'name', sortKey: 'name', label: '문서명', width: 200 },
    { key: 'status', sortKey: 'status', label: '상태', width: 130 },
    { key: 'progress', sortKey: 'progress', label: '진행률', width: 100 },
    { key: 'parsedItems', sortKey: 'parsedItems', label: '파싱항목', width: 80 },
    { key: 'reliability', label: '신뢰도', width: 80 },
    { key: 'anomalies', sortKey: 'anomalies', label: '이상치', width: 80 },
    { key: 'uploader', sortKey: 'uploader', label: '등록자', width: 80 },
    { key: 'department', sortKey: 'department', label: '등록부서', width: 100 },
    { key: 'uploadDate', sortKey: 'uploadDate', label: '업로드일', width: 100 },
  ];

  return (
    <Box sx={{ px: 3, pb: 3 }}>
      <TableContainer component={Paper} sx={{ borderRadius: '10px', border: `1px solid ${C.border}`, boxShadow: 'none' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f9f9fb' }}>
              <TableCell padding="checkbox" sx={{ width: 30 }}>
                <Checkbox size="small" checked={selectedIds.size === files.length && files.length > 0} onChange={onToggleAll} />
              </TableCell>
              {columns.map(col => (
                <TableCell key={col.key} sx={{ ...thSx, width: col.width }}>
                  {col.label}
                </TableCell>
              ))}
              <TableCell sx={{ ...thSx, width: 220 }}>액션</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {files.map(f => {
              const sc = statusConfig[f.status];
              return (
                <TableRow key={f.id} hover onClick={() => onRowClick(f)} sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f8f9ff' } }}>
                  <TableCell padding="checkbox" onClick={e => e.stopPropagation()}>
                    <Checkbox size="small" checked={selectedIds.has(f.id)} onChange={() => onToggleSelect(f.id)} />
                  </TableCell>
                  <TableCell sx={{ fontSize: 13, fontWeight: 500 }}>{f.name}</TableCell>
                  <TableCell>
                    <Box sx={{
                      display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: 11, fontWeight: 600,
                      px: 1.5, py: 0.4, borderRadius: '20px', minWidth: 90, justifyContent: 'center',
                      color: f.status === 'analyzed' ? '#fff' : sc.color,
                      bgcolor: f.status === 'analyzed' ? '#10B981' : `${sc.color}10`,
                      border: `1px solid ${f.status === 'analyzed' ? '#10B981' : sc.color + '25'}`,
                    }}>
                      {sc.label}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {(f.status === 'extracting' || f.status === 'analyzing') ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 80, height: 6, bgcolor: '#e5e5e7', borderRadius: 3, overflow: 'hidden' }}>
                          <Box sx={{ width: `${f.progress}%`, height: '100%', bgcolor: progressColor[f.status], borderRadius: 3 }} />
                        </Box>
                        <Typography sx={{ fontSize: 11, color: progressColor[f.status], fontWeight: 600 }}>{f.progress}%</Typography>
                      </Box>
                    ) : (
                      <Typography sx={{ fontSize: 11, color: C.gray }}>—</Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ fontSize: 13, color: f.parsedItems != null ? C.dark : C.gray }}>
                    {f.parsedItems != null ? `${f.parsedItems}건` : '—'}
                  </TableCell>
                  <TableCell sx={{ fontSize: 13, color: f.parsedItems != null ? '#00c896' : C.gray, fontWeight: 600 }}>
                    {f.parsedItems != null && f.anomalies != null
                      ? `${Math.round(((f.parsedItems - f.anomalies) / f.parsedItems) * 100)}%`
                      : '—'}
                  </TableCell>
                  <TableCell sx={{ fontSize: 13, fontWeight: f.anomalies ? 600 : 400, color: f.anomalies ? C.red : C.gray }}>
                    {f.anomalies != null ? `${f.anomalies}건` : '—'}
                  </TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{f.uploader || '—'}</TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{f.department || '—'}</TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{f.uploadDate}</TableCell>
                  <TableCell onClick={e => e.stopPropagation()}>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      {/* 📝 노트 버튼 - 모든 상태에서 표시 */}
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => onNoteClick(f.id.toString())}
                        sx={{
                          fontSize: 11,
                          minWidth: 70,
                          py: 0.4,
                          textTransform: 'none',
                          borderRadius: '6px',
                          fontWeight: 600,
                          borderColor: '#D1D5DB',
                          color: '#6B7280',
                          '&:hover': { borderColor: '#9CA3AF', bgcolor: '#F9FAFB' }
                        }}
                      >
                        노트({getNoteCount(f.id.toString())})
                      </Button>

                      {/* 메인 액션 버튼 — 통일 너비, 차분한 아웃라인 스타일 */}
                      {(() => {
                        const btnBase = { fontSize: 11, textTransform: 'none' as const, borderRadius: '6px', minWidth: 110, py: 0.4, boxShadow: 'none', fontWeight: 600 };
                        const sc2 = statusConfig[f.status];
                        switch (f.status) {
                          case 'extracting':
                            return <Button size="small" variant="outlined" disabled sx={{ ...btnBase, borderColor: `${sc2.color}40`, color: sc2.color }}>처리중</Button>;
                          case 'verifying':
                            return <Button size="small" variant="outlined" sx={{ ...btnBase, color: sc2.color, borderColor: `${sc2.color}50`, '&:hover': { bgcolor: `${sc2.color}08`, borderColor: sc2.color } }} onClick={() => onVerify(f.id.toString(), f.name)}>검증하기</Button>;
                          case 'verified':
                            return <Button size="small" variant="outlined" sx={{ ...btnBase, color: sc2.color, borderColor: `${sc2.color}50`, '&:hover': { bgcolor: `${sc2.color}08`, borderColor: sc2.color } }} onClick={onAnalysis}>검증하기</Button>;
                          case 'analyzing':
                            return <Button size="small" variant="outlined" disabled sx={{ ...btnBase, borderColor: `${sc2.color}40`, color: sc2.color }}>검증중...</Button>;
                          case 'inAnalysis':
                            return <Button size="small" variant="outlined" sx={{ ...btnBase, color: sc2.color, borderColor: `${sc2.color}50`, '&:hover': { bgcolor: `${sc2.color}08`, borderColor: sc2.color } }} onClick={onAnalysis}>검증 상세보기</Button>;
                          case 'analyzed':
                            return <Button size="small" variant="outlined" sx={{ ...btnBase, color: sc2.color, borderColor: `${sc2.color}50`, '&:hover': { bgcolor: `${sc2.color}08`, borderColor: sc2.color } }} onClick={onAnalysis}>검증 결과 보기</Button>;
                          case 'failed':
                            return <Button size="small" variant="outlined" sx={{ ...btnBase, color: sc2.color, borderColor: `${sc2.color}50`, '&:hover': { bgcolor: `${sc2.color}08`, borderColor: sc2.color } }} onClick={e => { e.stopPropagation(); onFailedDetail(f); }}>오류 확인</Button>;
                          default:
                            return null;
                        }
                      })()}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default FileTable;
