/**
 * 품번/품명 기준 다이어그램 뷰
 * 3가지 레이아웃을 내부 탭으로 전환 — 사용자가 선호하는 디자인을 고를 수 있게.
 *   A) Swimlane Timeline — 처리 단계를 가로축으로
 *   B) Tree / Node Graph — 품번 노드 중심에 파일이 가지처럼
 *   C) Card Grid — 카드 안에 파일 리스트 + 진행 바
 */
import React, { useMemo, useState } from 'react';
import { Box, Typography, Tabs, Tab, Chip, LinearProgress } from '@mui/material';
import type { FileItem, FileStatus } from '../types';
import { statusConfig } from '../data/mockData';

type DiagramLayout = 'swimlane' | 'tree' | 'cards';

interface PartGroup {
  partNumber: string;
  partName: string;
  files: FileItem[];
  // 모든 라인(파일 + 첨부)을 평탄화한 결과 — 다이어그램 행 렌더링용
  rows: PartRow[];
}

interface PartRow {
  id: string;
  filename: string;
  status: FileStatus;
  progress: number;
  isAttachment: boolean;
  parentFileId: number;
  uploadDate?: string;
}

const STAGES = [
  { key: 'extract', label: '추출' },
  { key: 'verify',  label: '검증' },
  { key: 'analyze', label: '분석' },
] as const;
type StageKey = typeof STAGES[number]['key'];
type StageState = 'pending' | 'in-progress' | 'done' | 'failed';

function getStages(status: FileStatus): Record<StageKey, StageState> {
  switch (status) {
    case 'extracting': return { extract: 'in-progress', verify: 'pending', analyze: 'pending' };
    case 'verifying':  return { extract: 'done', verify: 'pending', analyze: 'pending' };
    case 'verified':   return { extract: 'done', verify: 'pending', analyze: 'pending' };
    case 'analyzing':  return { extract: 'done', verify: 'in-progress', analyze: 'pending' };
    case 'inAnalysis': return { extract: 'done', verify: 'in-progress', analyze: 'pending' };
    case 'analyzed':   return { extract: 'done', verify: 'done', analyze: 'done' };
    case 'failed':     return { extract: 'failed', verify: 'pending', analyze: 'pending' };
  }
}

function groupByPart(files: FileItem[]): PartGroup[] {
  const map = new Map<string, PartGroup>();
  for (const f of files) {
    const partNumber = f.partNumber || '미분류';
    const partName = f.partName || '품명 미상';
    const key = partNumber;
    if (!map.has(key)) {
      map.set(key, { partNumber, partName, files: [], rows: [] });
    }
    const g = map.get(key)!;
    g.files.push(f);
    g.rows.push({
      id: `f-${f.id}`,
      filename: f.name,
      status: f.status,
      progress: f.progress,
      isAttachment: false,
      parentFileId: f.id,
      uploadDate: f.uploadDate,
    });
    const attDetails = f.attachmentDetails || [];
    for (const a of attDetails) {
      g.rows.push({
        id: `f-${f.id}-a-${a.filename}`,
        filename: a.filename,
        status: a.status,
        progress: a.progress ?? 100,
        isAttachment: true,
        parentFileId: f.id,
        uploadDate: a.uploadDate || f.uploadDate,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.partNumber.localeCompare(b.partNumber));
}

interface Props {
  files: FileItem[];
  onRowClick?: (file: FileItem) => void;
}

const PartDiagramView: React.FC<Props> = ({ files, onRowClick }) => {
  const [layout, setLayout] = useState<DiagramLayout>('swimlane');
  const groups = useMemo(() => groupByPart(files), [files]);

  return (
    <Box sx={{ px: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, borderBottom: '1px solid #e5e8eb' }}>
        <Tabs
          value={layout}
          onChange={(_, v) => setLayout(v)}
          sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, textTransform: 'none', fontWeight: 600, fontSize: 13 } }}
        >
          <Tab value="swimlane" label="A · 스위밍레인 타임라인" />
          <Tab value="tree"     label="B · 트리 다이어그램" />
          <Tab value="cards"    label="C · 카드 그리드" />
        </Tabs>
        <Typography sx={{ fontSize: 12, color: '#8b95a1' }}>
          품번 {groups.length}개 · 파일 {files.length}개
        </Typography>
      </Box>

      {layout === 'swimlane' && <SwimlaneLayout groups={groups} onRowClick={(fid) => {
        const f = files.find(x => x.id === fid); if (f && onRowClick) onRowClick(f);
      }} />}
      {layout === 'tree' && <TreeLayout groups={groups} onRowClick={(fid) => {
        const f = files.find(x => x.id === fid); if (f && onRowClick) onRowClick(f);
      }} />}
      {layout === 'cards' && <CardGridLayout groups={groups} onRowClick={(fid) => {
        const f = files.find(x => x.id === fid); if (f && onRowClick) onRowClick(f);
      }} />}
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────
// A. Swimlane Timeline
// ─────────────────────────────────────────────────────────────────
const SwimlaneLayout: React.FC<{ groups: PartGroup[]; onRowClick: (fid: number) => void }> = ({ groups, onRowClick }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {groups.map(g => (
        <Box key={g.partNumber} sx={{ border: '1px solid #e5e8eb', borderRadius: '12px', bgcolor: 'white', overflow: 'hidden' }}>
          {/* 헤더 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25, bgcolor: '#f9fafb', borderBottom: '1px solid #f2f4f6' }}>
            <Chip label={g.partNumber} size="small" sx={{ fontFamily: 'monospace', fontWeight: 700, bgcolor: '#003875', color: 'white', height: 22 }} />
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#191f28' }}>{g.partName}</Typography>
            <Typography sx={{ fontSize: 12, color: '#8b95a1', ml: 'auto' }}>파일 {g.rows.length}개</Typography>
          </Box>
          {/* 단계 헤더 */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px 100px', alignItems: 'center', px: 2, py: 0.75, borderBottom: '1px solid #f2f4f6', bgcolor: '#fcfcfd' }}>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#8b95a1' }}>파일</Typography>
            {STAGES.map(s => (
              <Typography key={s.key} sx={{ fontSize: 11, fontWeight: 600, color: '#8b95a1', textAlign: 'center' }}>{s.label}</Typography>
            ))}
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#8b95a1', textAlign: 'right' }}>결과</Typography>
          </Box>
          {/* 행 */}
          {g.rows.map(r => {
            const stages = getStages(r.status);
            const cfg = statusConfig[r.status];
            return (
              <Box
                key={r.id}
                onClick={() => onRowClick(r.parentFileId)}
                sx={{
                  display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px 100px',
                  alignItems: 'center', px: 2, py: 1.25,
                  borderBottom: '1px solid #f7f8fa', cursor: 'pointer',
                  '&:hover': { bgcolor: '#f9fafb' },
                  '&:last-child': { borderBottom: 'none' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: r.isAttachment ? 2.5 : 0 }}>
                  {r.isAttachment && (
                    <Box sx={{ width: 12, height: 12, borderLeft: '2px solid #cbd5e1', borderBottom: '2px solid #cbd5e1', borderBottomLeftRadius: 4, mr: 0.5 }} />
                  )}
                  <Typography sx={{ fontSize: 13, fontWeight: r.isAttachment ? 400 : 600, color: '#191f28', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.filename}
                  </Typography>
                </Box>
                {STAGES.map((s, idx) => (
                  <StageMarker key={s.key} state={stages[s.key]} connector={idx > 0} />
                ))}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Chip label={cfg.label} size="small" sx={{ height: 20, fontSize: 10.5, fontWeight: 700, bgcolor: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}40` }} />
                </Box>
              </Box>
            );
          })}
        </Box>
      ))}
    </Box>
  );
};

const StageMarker: React.FC<{ state: StageState; connector: boolean }> = ({ state, connector }) => {
  const colorByState: Record<StageState, string> = {
    'pending': '#cbd5e1',
    'in-progress': '#3b82f6',
    'done': '#10b981',
    'failed': '#ef4444',
  };
  const color = colorByState[state];
  return (
    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 24 }}>
      {connector && (
        <Box sx={{
          position: 'absolute', left: 0, right: '50%', top: '50%',
          height: 2,
          background: state === 'pending' ? '#e5e8eb' : color,
          transform: 'translateY(-1px)',
        }} />
      )}
      <Box sx={{
        position: 'relative', zIndex: 1,
        width: 14, height: 14, borderRadius: '50%',
        bgcolor: state === 'pending' ? 'white' : color,
        border: `2px solid ${color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: state === 'in-progress' ? `0 0 0 4px ${color}22` : 'none',
        animation: state === 'in-progress' ? 'stagePulse 1.4s ease-in-out infinite' : 'none',
        '@keyframes stagePulse': {
          '0%, 100%': { boxShadow: `0 0 0 4px ${color}22` },
          '50%':       { boxShadow: `0 0 0 8px ${color}10` },
        },
      }}>
        {state === 'done' && <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: 'white' }} />}
        {state === 'failed' && <Box sx={{ color: 'white', fontSize: 9, fontWeight: 900, lineHeight: 1 }}>✕</Box>}
      </Box>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────
// B. Tree / Node Graph (SVG)
// ─────────────────────────────────────────────────────────────────
const TreeLayout: React.FC<{ groups: PartGroup[]; onRowClick: (fid: number) => void }> = ({ groups, onRowClick }) => {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(440px, 1fr))', gap: 2.5 }}>
      {groups.map(g => {
        const partColor = '#003875';
        const rowCount = g.rows.length;
        const rowGap = 38;
        const height = Math.max(100, rowCount * rowGap + 30);
        const partY = height / 2;
        return (
          <Box key={g.partNumber} sx={{ border: '1px solid #e5e8eb', borderRadius: '12px', bgcolor: 'white', p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 1.5 }}>
              <Chip label={g.partNumber} size="small" sx={{ fontFamily: 'monospace', fontWeight: 700, bgcolor: partColor, color: 'white', height: 22 }} />
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#191f28' }}>{g.partName}</Typography>
            </Box>
            <Box sx={{ position: 'relative', height }}>
              <svg width="100%" height={height} style={{ position: 'absolute', inset: 0 }}>
                {g.rows.map((r, i) => {
                  const y = 15 + i * rowGap + rowGap / 2;
                  const cfg = statusConfig[r.status];
                  return (
                    <path
                      key={r.id}
                      d={`M 80 ${partY} C 130 ${partY} 130 ${y} 180 ${y}`}
                      stroke={cfg.color}
                      strokeWidth={1.5}
                      fill="none"
                      opacity={0.6}
                    />
                  );
                })}
                {/* 품번 노드 */}
                <circle cx="60" cy={partY} r="22" fill={partColor} />
                <circle cx="60" cy={partY} r="32" fill="none" stroke={partColor} strokeWidth="1.5" opacity="0.25" />
                <text x="60" y={partY + 4} textAnchor="middle" fill="white" fontSize="11" fontWeight="700">{rowCount}</text>
              </svg>
              {/* 파일 노드들 (HTML로 오버레이) */}
              <Box sx={{ position: 'absolute', left: 180, top: 0, right: 0 }}>
                {g.rows.map((r, i) => {
                  const cfg = statusConfig[r.status];
                  return (
                    <Box
                      key={r.id}
                      onClick={() => onRowClick(r.parentFileId)}
                      sx={{
                        position: 'absolute', top: 15 + i * rowGap, left: 0, right: 0,
                        display: 'flex', alignItems: 'center', gap: 1, height: rowGap,
                        cursor: 'pointer',
                      }}
                    >
                      <Box sx={{
                        width: 14, height: 14, borderRadius: '50%',
                        bgcolor: cfg.color, flexShrink: 0,
                        boxShadow: `0 0 0 3px ${cfg.color}25`,
                      }} />
                      <Box sx={{ flex: 1, overflow: 'hidden' }}>
                        <Typography sx={{ fontSize: 12.5, fontWeight: r.isAttachment ? 400 : 600, color: '#191f28', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.filename}
                        </Typography>
                      </Box>
                      <Chip label={cfg.label} size="small" sx={{ height: 18, fontSize: 10, fontWeight: 700, bgcolor: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}40` }} />
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────
// C. Card Grid with Progress Bars
// ─────────────────────────────────────────────────────────────────
const CardGridLayout: React.FC<{ groups: PartGroup[]; onRowClick: (fid: number) => void }> = ({ groups, onRowClick }) => {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 2.5 }}>
      {groups.map(g => {
        const counts = g.rows.reduce<Record<FileStatus, number>>((acc, r) => {
          acc[r.status] = (acc[r.status] || 0) + 1; return acc;
        }, {} as Record<FileStatus, number>);
        return (
          <Box key={g.partNumber} sx={{ border: '1px solid #e5e8eb', borderRadius: '12px', bgcolor: 'white', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* 헤더 */}
            <Box sx={{ p: 2, background: 'linear-gradient(135deg, #003875 0%, #0056A6 100%)', color: 'white' }}>
              <Typography sx={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.8, letterSpacing: 0.5 }}>{g.partNumber}</Typography>
              <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 1 }}>{g.partName}</Typography>
              <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                {Object.entries(counts).map(([s, c]) => {
                  const cfg = statusConfig[s as FileStatus];
                  return (
                    <Chip key={s} label={`${cfg.label} ${c}`} size="small"
                      sx={{ height: 20, fontSize: 10.5, fontWeight: 600, bgcolor: 'rgba(255,255,255,0.18)', color: 'white', border: `1px solid rgba(255,255,255,0.35)` }} />
                  );
                })}
              </Box>
            </Box>
            {/* 파일 목록 */}
            <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
              {g.rows.map(r => {
                const cfg = statusConfig[r.status];
                return (
                  <Box
                    key={r.id}
                    onClick={() => onRowClick(r.parentFileId)}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1,
                      px: 1.25, py: 1, borderRadius: '8px', cursor: 'pointer',
                      bgcolor: '#f9fafb',
                      border: '1px solid transparent',
                      '&:hover': { borderColor: cfg.color, bgcolor: `${cfg.color}08` },
                    }}
                  >
                    <Box sx={{ width: 26, height: 26, borderRadius: '6px', bgcolor: `${cfg.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: cfg.color }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 12.5, fontWeight: r.isAttachment ? 400 : 600, color: '#191f28', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.isAttachment ? '└ ' : ''}{r.filename}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.4 }}>
                        <LinearProgress
                          variant="determinate"
                          value={r.status === 'failed' ? r.progress : (r.status === 'analyzed' ? 100 : r.progress)}
                          sx={{
                            flex: 1, height: 4, borderRadius: 2,
                            bgcolor: '#e5e8eb',
                            '& .MuiLinearProgress-bar': { bgcolor: cfg.color, borderRadius: 2 },
                          }}
                        />
                        <Typography sx={{ fontSize: 10, color: cfg.color, fontWeight: 700, minWidth: 32, textAlign: 'right' }}>
                          {cfg.label}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default PartDiagramView;
