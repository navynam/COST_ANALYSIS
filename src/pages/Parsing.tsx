/**
 * @fileoverview ① 파싱(업로드) 페이지 — 기존 HTML 와이어프레임 스타일 반영
 */
import React, { useState, useCallback, useRef } from 'react';
import {
  Box, Typography, Paper, Button, IconButton, Chip, LinearProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, InputAdornment, Checkbox, Drawer, Divider,
} from '@mui/material';
import {
  Close, Search, Delete, Download, Visibility,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/* ── 색상 상수 (기존 HTML :root 기준) ── */
const C = {
  blue: '#0071e3', red: '#ff3b30', green: '#34c759', orange: '#ff9500',
  purple: '#af52de', gray: '#86868b', dark: '#1d1d1f', border: '#e5e5e7', bg: '#f5f5f7',
};

/* ── 상태 정의 ── */
type FileStatus = 'extracting' | 'complete' | 'failed' | 'analyzing';

interface FileItem {
  id: number;
  name: string;
  status: FileStatus;
  progress: number;
  parsedItems: number | null;
  anomalies: number | null;
  uploadDate: string;
  fileSize?: string;
  sheets?: number;
}

const initialFiles: FileItem[] = [
  { id: 1, name: 'CONSOLE_BOX_원가명세.xlsx', status: 'extracting', progress: 65, parsedItems: null, anomalies: null, uploadDate: '2026-02-19', fileSize: '2.4 MB', sheets: 3 },
  { id: 2, name: 'HEAD_LINING_원가계산서.xlsx', status: 'complete', progress: 100, parsedItems: 24, anomalies: 2, uploadDate: '2026-02-18', fileSize: '3.1 MB', sheets: 4 },
  { id: 3, name: 'DOOR_TRIM_견적서.xlsx', status: 'complete', progress: 100, parsedItems: 18, anomalies: 0, uploadDate: '2026-02-17', fileSize: '1.8 MB', sheets: 2 },
  { id: 4, name: 'SEAT_COVER_원가분석.xlsx', status: 'failed', progress: 30, parsedItems: null, anomalies: null, uploadDate: '2026-02-16', fileSize: '4.2 MB', sheets: 1 },
  { id: 5, name: 'BUMPER_ASSY_Q4견적.xlsx', status: 'analyzing', progress: 100, parsedItems: 32, anomalies: 0, uploadDate: '2026-02-15', fileSize: '2.9 MB', sheets: 3 },
];

const statusConfig: Record<FileStatus, { label: string; emoji: string; color: string }> = {
  extracting: { label: '추출중', emoji: '⏳', color: C.orange },
  complete: { label: '추출완료', emoji: '✅', color: C.green },
  failed: { label: '추출실패', emoji: '❌', color: C.red },
  analyzing: { label: '분석완료', emoji: '🟣', color: C.purple },
};

const progressColor: Record<FileStatus, string> = {
  extracting: C.orange, complete: C.green, failed: C.red, analyzing: C.purple,
};

interface UploadQueueItem { file: File; progress: number; }

const Parsing: React.FC = () => {
  const navigate = useNavigate();
  const [files] = useState<FileItem[]>(initialFiles);
  const [filter, setFilter] = useState<'all' | FileStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [dragOver, setDragOver] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [drawerFile, setDrawerFile] = useState<FileItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter & search
  const filtered = files.filter(f => {
    if (filter !== 'all' && f.status !== filter) return false;
    if (searchQuery && !f.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Status counts
  const counts = {
    all: files.length,
    extracting: files.filter(f => f.status === 'extracting').length,
    complete: files.filter(f => f.status === 'complete').length,
    failed: files.filter(f => f.status === 'failed').length,
    analyzing: files.filter(f => f.status === 'analyzing').length,
  };

  // Upload handling
  const handleFiles = useCallback((fileList: FileList | File[]) => {
    const items: UploadQueueItem[] = Array.from(fileList).map(f => ({ file: f, progress: 0 }));
    setUploadQueue(prev => [...prev, ...items]);
    // Simulate progress
    items.forEach((_, i) => {
      let prog = 0;
      const iv = setInterval(() => {
        prog += Math.random() * 20;
        if (prog >= 100) { prog = 100; clearInterval(iv); }
        setUploadQueue(prev => prev.map((q, qi) => qi === prev.length - items.length + i ? { ...q, progress: Math.min(100, Math.round(prog)) } : q));
      }, 500);
    });
  }, []);

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files); };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };
  const toggleAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map(f => f.id)));
  };

  const statusCards: { key: 'all' | FileStatus; label: string; colorKey: string }[] = [
    { key: 'all', label: '전체', colorKey: C.dark },
    { key: 'extracting', label: '추출중', colorKey: C.orange },
    { key: 'complete', label: '완료', colorKey: C.green },
    { key: 'failed', label: '실패', colorKey: C.red },
    { key: 'analyzing', label: '분석완료', colorKey: C.purple },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: C.bg }}>
      {/* Page Header */}
      <Box sx={{ px: 3, pt: 2.5 }}>
        <Typography sx={{ fontSize: 20, fontWeight: 700, mb: 0.25, color: C.dark }}>견적서 파싱</Typography>
        <Typography sx={{ fontSize: 13, color: C.gray, mb: 2 }}>파일을 업로드하면 AI가 자동으로 데이터를 추출합니다</Typography>
      </Box>

      {/* Upload Area */}
      <Box
        sx={{
          mx: 3, mb: 2, p: 4, border: '2px dashed', borderRadius: '12px',
          borderColor: dragOver ? C.blue : '#d2d2d7',
          bgcolor: dragOver ? '#e8f4fd' : '#fff',
          textAlign: 'center', cursor: 'pointer',
          transition: 'all 0.3s',
          '&:hover': { borderColor: C.blue, bgcolor: '#f8fbff' },
        }}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" hidden multiple accept=".xlsx,.xls,.jpg,.jpeg,.png" onChange={e => { if (e.target.files?.length) handleFiles(e.target.files); e.target.value = ''; }} />
        <Box sx={{ fontSize: 40, mb: 1.5 }}>📁</Box>
        <Typography sx={{ fontSize: 14, color: C.gray, mb: 1 }}>
          파일을 드래그하거나 <strong style={{ color: C.blue }}>클릭하여 업로드</strong>
        </Typography>
        <Typography sx={{ fontSize: 11, color: '#a1a1a6' }}>
          지원 형식: xls, xlsx, 이미지(jpg, png) · 최대 50MB · 다중 파일 가능
        </Typography>
      </Box>

      {/* Upload Queue */}
      {uploadQueue.length > 0 && (
        <Box sx={{ px: 3, pb: 2 }}>
          {uploadQueue.map((q, i) => (
            <Box key={i} sx={{
              bgcolor: '#fff', border: `1px solid ${C.border}`, borderRadius: '8px',
              p: '10px 16px', mb: 1, display: 'flex', alignItems: 'center', gap: 1.5,
            }}>
              <span>📄</span>
              <Typography sx={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{q.file.name}</Typography>
              <Box sx={{ width: 120, height: 4, bgcolor: '#e5e5e7', borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ width: `${q.progress}%`, height: '100%', bgcolor: C.blue, borderRadius: 2, transition: 'width 0.3s' }} />
              </Box>
              <Typography sx={{ fontSize: 11, color: C.gray, minWidth: 30 }}>{q.progress}%</Typography>
              <IconButton size="small" onClick={() => setUploadQueue(prev => prev.filter((_, j) => j !== i))}
                sx={{ width: 24, height: 24, bgcolor: '#e5e5e7', '&:hover': { bgcolor: '#f8d7da', color: C.red } }}>
                <Close sx={{ fontSize: 12 }} />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}

      {/* Search & Toolbar */}
      <Box sx={{ display: 'flex', gap: 1.25, px: 3, mb: 2 }}>
        <TextField
          size="small" fullWidth placeholder="문서명으로 검색..."
          value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18, color: C.gray }} /></InputAdornment>,
            sx: { fontSize: 13, bgcolor: '#fff', borderRadius: '8px' },
          }}
        />
        <Button variant="outlined" size="small" sx={{ whiteSpace: 'nowrap', fontSize: 12, borderColor: C.border, color: C.dark }}>
          🔍 상세조회
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, px: 3, mb: 1.5, alignItems: 'center' }}>
        <Checkbox size="small" checked={selectedIds.size === filtered.length && filtered.length > 0} onChange={toggleAll} />
        <Typography sx={{ fontSize: 12 }}>전체 선택</Typography>
        <Button size="small" startIcon={<Delete sx={{ fontSize: 14 }} />} sx={{ fontSize: 12, ml: 1 }}>일괄 삭제</Button>
        <Button size="small" startIcon={<Download sx={{ fontSize: 14 }} />} sx={{ fontSize: 12 }}>일괄 다운로드</Button>
      </Box>

      {/* Status Cards */}
      <Box sx={{ display: 'flex', gap: 1.5, px: 3, mb: 2 }}>
        {statusCards.map(sc => (
          <Box key={sc.key} onClick={() => setFilter(sc.key)}
            sx={{
              flex: 1, bgcolor: '#fff', border: `1px solid ${filter === sc.key ? C.blue : C.border}`,
              borderRadius: '10px', p: 2, cursor: 'pointer', textAlign: 'center',
              transition: 'all 0.2s',
              ...(filter === sc.key && { bgcolor: '#f0f6ff' }),
              '&:hover': { borderColor: C.blue },
            }}>
            <Typography sx={{ fontSize: 28, fontWeight: 700, color: sc.colorKey, mb: 0.5 }}>
              {counts[sc.key]}
            </Typography>
            <Typography sx={{ fontSize: 12, color: C.gray }}>{sc.label}</Typography>
          </Box>
        ))}
      </Box>

      {/* File Table */}
      <Box sx={{ px: 3, pb: 3 }}>
        <TableContainer component={Paper} sx={{ borderRadius: '10px', border: `1px solid ${C.border}`, boxShadow: 'none' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f9f9fb' }}>
                <TableCell padding="checkbox" sx={{ width: 30 }}><Checkbox size="small" checked={selectedIds.size === filtered.length && filtered.length > 0} onChange={toggleAll} /></TableCell>
                <TableCell sx={thSx}>문서명</TableCell>
                <TableCell sx={{ ...thSx, width: 100 }}>상태</TableCell>
                <TableCell sx={{ ...thSx, width: 100 }}>진행률</TableCell>
                <TableCell sx={{ ...thSx, width: 80 }}>파싱항목</TableCell>
                <TableCell sx={{ ...thSx, width: 80 }}>이상치</TableCell>
                <TableCell sx={{ ...thSx, width: 100 }}>업로드일</TableCell>
                <TableCell sx={{ ...thSx, width: 160 }}>액션</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(f => {
                const sc = statusConfig[f.status];
                return (
                  <TableRow key={f.id} hover onClick={() => setDrawerFile(f)}
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f8f9ff' } }}>
                    <TableCell padding="checkbox" onClick={e => e.stopPropagation()}>
                      <Checkbox size="small" checked={selectedIds.has(f.id)} onChange={() => toggleSelect(f.id)} />
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, fontWeight: 500 }}>{f.name}</TableCell>
                    <TableCell>
                      <Box sx={{
                        display: 'inline-flex', alignItems: 'center', gap: 0.5,
                        fontSize: 12, fontWeight: 600, px: 1.25, py: 0.375, borderRadius: '12px',
                        color: sc.color,
                        bgcolor: sc.color + '15',
                      }}>
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
                    <TableCell sx={{ fontSize: 13 }}>{f.uploadDate}</TableCell>
                    <TableCell onClick={e => e.stopPropagation()}>
                      {f.status === 'complete' && (
                        <Button size="small" variant="contained"
                          sx={{ fontSize: 12, textTransform: 'none', bgcolor: C.blue, borderRadius: '6px', boxShadow: 'none', '&:hover': { bgcolor: '#0077ED' } }}
                          onClick={() => navigate('/verification')}>
                          검증하기
                        </Button>
                      )}
                      {f.status === 'extracting' && (
                        <Button size="small" variant="outlined" disabled sx={{ fontSize: 12, textTransform: 'none', borderRadius: '6px' }}>상세보기</Button>
                      )}
                      {f.status === 'failed' && (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Button size="small" variant="outlined" sx={{ fontSize: 12, textTransform: 'none', borderRadius: '6px', color: C.red, borderColor: C.red }}>실패사유</Button>
                          <Button size="small" variant="outlined" sx={{ fontSize: 12, textTransform: 'none', borderRadius: '6px' }}>재시도</Button>
                        </Box>
                      )}
                      {f.status === 'analyzing' && (
                        <Button size="small" variant="contained"
                          sx={{ fontSize: 12, textTransform: 'none', bgcolor: C.blue, borderRadius: '6px', boxShadow: 'none' }}>
                          상세보기
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Detail Drawer */}
      <Drawer anchor="right" open={!!drawerFile} onClose={() => setDrawerFile(null)}
        PaperProps={{ sx: { width: 400 } }}>
        {drawerFile && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ p: 2, borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography sx={{ fontSize: 15, fontWeight: 600 }}>{drawerFile.name}</Typography>
                <Typography sx={{ fontSize: 12, color: statusConfig[drawerFile.status].color, mt: 0.25 }}>
                  {statusConfig[drawerFile.status].emoji} {statusConfig[drawerFile.status].label}
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => setDrawerFile(null)}><Close /></IconButton>
            </Box>
            <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1.5 }}>파일 정보</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 3 }}>
                {[
                  { label: '파일 크기', value: drawerFile.fileSize || '-' },
                  { label: '시트 수', value: drawerFile.sheets ? `${drawerFile.sheets}개` : '-' },
                  { label: '업로드일', value: drawerFile.uploadDate },
                  { label: '진행률', value: `${drawerFile.progress}%` },
                ].map(item => (
                  <Box key={item.label}>
                    <Typography sx={{ fontSize: 11, color: C.gray }}>{item.label}</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{item.value}</Typography>
                  </Box>
                ))}
              </Box>

              {drawerFile.status === 'complete' && (
                <>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1.5 }}>추출 결과 요약</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                    <Box><Typography sx={{ fontSize: 11, color: C.gray }}>파싱 항목</Typography><Typography sx={{ fontSize: 13, fontWeight: 600, color: C.blue }}>{drawerFile.parsedItems}건</Typography></Box>
                    <Box><Typography sx={{ fontSize: 11, color: C.gray }}>이상치</Typography><Typography sx={{ fontSize: 13, fontWeight: 600, color: C.red }}>{drawerFile.anomalies}건</Typography></Box>
                    <Box><Typography sx={{ fontSize: 11, color: C.gray }}>신뢰도</Typography><Typography sx={{ fontSize: 13, fontWeight: 600, color: C.green }}>92%</Typography></Box>
                    <Box><Typography sx={{ fontSize: 11, color: C.gray }}>소요시간</Typography><Typography sx={{ fontSize: 13, fontWeight: 600 }}>1분 48초</Typography></Box>
                  </Box>
                </>
              )}

              {drawerFile.status === 'extracting' && (
                <>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1 }}>추출 진행</Typography>
                  <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, mb: 0.5 }}>
                      <span>전체 진행률</span>
                      <span style={{ fontWeight: 600, color: C.orange }}>{drawerFile.progress}%</span>
                    </Box>
                    <LinearProgress variant="determinate" value={drawerFile.progress} sx={{ height: 8, borderRadius: 4, bgcolor: '#e5e5e7', '& .MuiLinearProgress-bar': { bgcolor: C.orange } }} />
                  </Box>
                  <Box sx={{ fontSize: 12, color: C.gray, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    <div>✅ Sheet 1 — 구조 분석 완료</div>
                    <div>✅ Sheet 2 — 셀 매핑 완료</div>
                    <div>⏳ Sheet 3 — 데이터 검증 중...</div>
                  </Box>
                </>
              )}

              {drawerFile.status === 'failed' && (
                <>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1 }}>실패 정보</Typography>
                  <Box sx={{ bgcolor: '#fff5f5', border: `1px solid ${C.red}30`, borderRadius: '8px', p: 2 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1 }}>⚠️ 파싱 오류 — 양식 인식 실패</Typography>
                    <Typography sx={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>
                      Sheet 1의 셀 구조를 인식할 수 없습니다.<br />
                      원인: 병합 셀이 다중 중첩(3단계 이상)되어 있어 자동 파싱에 실패했습니다.<br /><br />
                      <strong>권장 조치:</strong><br />
                      • 엑셀 파일에서 불필요한 병합 셀 해제 후 재업로드<br />
                      • 수동 매핑 모드로 전환하여 직접 영역 지정
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
            <Box sx={{ p: 2, borderTop: `1px solid ${C.border}`, display: 'flex', gap: 1 }}>
              {drawerFile.status === 'complete' && (
                <Button fullWidth variant="contained" onClick={() => { setDrawerFile(null); navigate('/verification'); }}
                  sx={{ bgcolor: C.blue, textTransform: 'none', py: 1.25, '&:hover': { bgcolor: '#0077ED' } }}>
                  검증하기 →
                </Button>
              )}
              {drawerFile.status === 'failed' && (
                <>
                  <Button fullWidth variant="outlined" sx={{ textTransform: 'none' }}>수동 매핑</Button>
                  <Button fullWidth variant="contained" sx={{ bgcolor: C.blue, textTransform: 'none' }}>재시도</Button>
                </>
              )}
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  );
};

const thSx = { fontSize: 11, fontWeight: 600, color: '#86868b', py: 1.5 };

export default Parsing;
