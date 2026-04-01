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

const thSx = { fontSize: 11, fontWeight: 600, color: '#86868b', py: 1.5 };

const SortIcon: React.FC<{ field: SortField; active: SortField | null; direction: SortDirection }> = ({ field, active, direction }) =>
  active === field ? (direction === 'asc' ? <ArrowUpward sx={{ fontSize: 14 }} /> : <ArrowDownward sx={{ fontSize: 14 }} />) : null;

const FileTable: React.FC<FileTableProps> = ({
  files, selectedIds, sortField, sortDirection,
  onToggleSelect, onToggleAll, onSort, onRowClick, onVerify, onAnalysis, onFailedDetail,
  onNoteClick, getNoteCount,
}) => {
  const columns: { key: SortField; label: string; width?: number }[] = [
    { key: 'name', label: '문서명', width: 200 },
    { key: 'status', label: '상태', width: 130 },
    { key: 'progress', label: '진행률', width: 100 },
    { key: 'parsedItems', label: '파싱항목', width: 80 },
    { key: 'anomalies', label: '이상치', width: 80 },
    { key: 'uploader', label: '등록자', width: 80 },
    { key: 'department', label: '등록부서', width: 100 },
    { key: 'uploadDate', label: '업로드일', width: 100 },
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
                <TableCell key={col.key} sx={{ ...thSx, width: col.width, cursor: 'pointer' }} onClick={() => onSort(col.key)}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {col.label}
                    <SortIcon field={col.key} active={sortField} direction={sortDirection} />
                  </Box>
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
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: 12, fontWeight: 600, px: 1.25, py: 0.375, borderRadius: '12px', color: sc.color, bgcolor: sc.color + '15' }}>
                      {sc.emoji} {sc.label}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 80, height: 6, bgcolor: '#e5e5e7', borderRadius: 3, overflow: 'hidden' }}>
                        <Box sx={{ width: `${f.progress}%`, height: '100%', bgcolor: progressColor[f.status], borderRadius: 3 }} />
                      </Box>
                      <Typography sx={{ fontSize: 11, color: C.gray }}>{f.progress}%</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontSize: 13, color: f.parsedItems != null ? C.dark : C.gray }}>
                    {f.parsedItems != null ? `${f.parsedItems}건` : '—'}
                  </TableCell>
                  <TableCell sx={{ fontSize: 13, fontWeight: f.anomalies ? 600 : 400, color: f.anomalies ? C.red : C.gray }}>
                    {f.anomalies != null ? `${f.anomalies}건` : '—'}
                  </TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{f.uploader || '—'}</TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{f.department || '—'}</TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{f.uploadDate}</TableCell>
                  <TableCell onClick={e => e.stopPropagation()}>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {/* 📝 노트 버튼 - 모든 상태에서 표시 */}
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => onNoteClick(f.id.toString())}
                        sx={{ 
                          fontSize: 11,
                          minWidth: 'auto',
                          px: 1,
                          py: 0.5,
                          textTransform: 'none',
                          borderRadius: '6px',
                          borderColor: C.blue,
                          color: C.blue,
                          '&:hover': {
                            borderColor: '#0077ED',
                            bgcolor: 'rgba(0, 100, 255, 0.04)'
                          }
                        }}
                      >
                        📝 노트({getNoteCount(f.id.toString())})
                      </Button>

                      {/* 메인 액션 버튼 */}
                      {f.status === 'complete' && (
                        <Button size="small" variant="contained"
                          sx={{ fontSize: 12, textTransform: 'none', bgcolor: C.blue, borderRadius: '6px', boxShadow: 'none', '&:hover': { bgcolor: '#0077ED' } }}
                          onClick={() => onVerify(f.id.toString(), f.name)}>검증하기</Button>
                      )}
                      {f.status === 'extracting' && (
                        <Button size="small" variant="outlined" disabled sx={{ fontSize: 12, textTransform: 'none', borderRadius: '6px' }}>처리중</Button>
                      )}
                      {f.status === 'failed' && (
                        <Button size="small" variant="outlined"
                          sx={{ fontSize: 12, textTransform: 'none', borderRadius: '6px', color: C.red, borderColor: C.red }}
                          onClick={e => { e.stopPropagation(); onFailedDetail(f); }}>추출실패</Button>
                      )}
                      {f.status === 'analyzing' && (
                        <Button size="small" variant="contained"
                          sx={{ fontSize: 12, textTransform: 'none', bgcolor: C.blue, borderRadius: '6px', boxShadow: 'none' }}
                          onClick={onAnalysis}>상세보기</Button>
                      )}
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
