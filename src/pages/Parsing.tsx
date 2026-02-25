/**
 * @fileoverview ① 파싱(업로드) 페이지 - UI 고도화
 * @description 대형 드래그앤드롭, 7단계 스텝 프로그레스바, 완료 시 요약 카드
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, IconButton, Chip, LinearProgress,
  Card, CardContent, Grid, Alert, Fade, Collapse, Divider,
} from '@mui/material';
import {
  CloudUpload, InsertDriveFile, Close, CheckCircle, Error as ErrorIcon,
  Description, GridOn, Category, Build, CompareArrows, PrecisionManufacturing,
  Done, NavigateNext,
} from '@mui/icons-material';
import WorkflowStepper from '../components/WorkflowStepper';
import { useNavigate } from 'react-router-dom';

/* ── 파싱 7단계 정의 ── */
const parsingSteps = [
  { label: '파일 읽기', icon: <Description fontSize="small" />, duration: 800 },
  { label: '시트 감지', icon: <GridOn fontSize="small" />, duration: 1200 },
  { label: '섹션 분류', icon: <Category fontSize="small" />, duration: 1500 },
  { label: '부품 추출', icon: <Build fontSize="small" />, duration: 2000 },
  { label: '3자비교 분리', icon: <CompareArrows fontSize="small" />, duration: 1800 },
  { label: '금형비 파싱', icon: <PrecisionManufacturing fontSize="small" />, duration: 1000 },
  { label: '완료', icon: <Done fontSize="small" />, duration: 500 },
];

/* ── Mock 요약 데이터 ── */
const mockSummary = {
  sheets: 4,
  parts: 23,
  sections: ['재료비', '가공비', '경비', '이윤', '금형비'],
  fileName: 'DUCT_ASSY-SD_A_VENT_LH_견적서.xlsx',
  fileSize: '2.4 MB',
  threeWay: { bidder: 12, oem: 12, mobis: 12 },
};

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

interface UploadFile {
  file: File;
  parsingStep: number; // -1=queued, 0~6=in-progress, 7=done, -2=error
  error?: string;
}

const Parsing: React.FC = () => {
  const navigate = useNavigate();
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulate parsing steps
  const simulateParsing = useCallback((idx: number) => {
    let step = 0;
    const advance = () => {
      setFiles(prev => prev.map((f, i) => i === idx ? { ...f, parsingStep: step } : f));
      step++;
      if (step <= 6) {
        setTimeout(advance, parsingSteps[step - 1].duration);
      } else {
        setFiles(prev => prev.map((f, i) => i === idx ? { ...f, parsingStep: 7 } : f));
        setShowSummary(true);
      }
    };
    advance();
  }, []);

  const handleFiles = useCallback((fileList: FileList | File[]) => {
    const newFiles: UploadFile[] = Array.from(fileList).map(f => ({ file: f, parsingStep: -1 }));
    setFiles(prev => {
      const updated = [...prev, ...newFiles];
      // start parsing for new files
      newFiles.forEach((_, i) => {
        setTimeout(() => simulateParsing(prev.length + i), 300 * i);
      });
      return updated;
    });
    setShowSummary(false);
  }, [simulateParsing]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFiles(e.target.files);
    e.target.value = '';
  };

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const allDone = files.length > 0 && files.every(f => f.parsingStep === 7);
  const currentFile = files.find(f => f.parsingStep >= 0 && f.parsingStep < 7);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <WorkflowStepper activeStep={0} />

      <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5, color: '#003875' }}>
        파싱 (업로드)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        엑셀 견적서를 업로드하면 AI가 자동으로 구조를 분석합니다.
      </Typography>

      {/* ── 대형 드래그앤드롭 영역 ── */}
      <Paper
        elevation={0}
        sx={{
          p: 6, mb: 3, border: '2px dashed',
          borderColor: dragOver ? '#003875' : '#c5cae9',
          bgcolor: dragOver ? 'rgba(0,56,117,0.04)' : '#fafbff',
          textAlign: 'center', cursor: 'pointer',
          transition: 'all 0.3s',
          borderRadius: 3,
          '&:hover': { borderColor: '#003875', bgcolor: 'rgba(0,56,117,0.02)' },
        }}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" hidden multiple accept=".xlsx,.xls,.xlsm" onChange={handleFileInput} />
        <Box sx={{
          width: 80, height: 80, borderRadius: '50%', bgcolor: '#e8eef5',
          display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2,
        }}>
          <CloudUpload sx={{ fontSize: 40, color: '#003875' }} />
        </Box>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
          견적서 파일을 여기에 드래그하세요
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          또는 클릭하여 파일 선택
        </Typography>
        <Chip label="Excel (.xlsx, .xls, .xlsm)" size="small" variant="outlined" sx={{ mr: 1 }} />
        <Chip label="다중 파일 지원" size="small" variant="outlined" />
      </Paper>

      {/* ── 파싱 진행 상태 ── */}
      {files.length > 0 && (
        <Paper sx={{ mb: 3, p: 3, borderRadius: 3 }} elevation={1}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            파싱 진행 상태
          </Typography>

          {files.map((uf, idx) => {
            const isDone = uf.parsingStep === 7;
            const isError = uf.parsingStep === -2;
            const currentStepIdx = uf.parsingStep >= 0 && uf.parsingStep < 7 ? uf.parsingStep : -1;
            const progress = isDone ? 100 : uf.parsingStep >= 0 ? Math.round((uf.parsingStep / 7) * 100) : 0;

            return (
              <Box key={idx} sx={{ mb: 2, p: 2, bgcolor: '#f8f9fc', borderRadius: 2, position: 'relative' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                  <InsertDriveFile sx={{ color: isDone ? '#4caf50' : '#003875' }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>{uf.file.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{formatBytes(uf.file.size)}</Typography>
                  </Box>
                  {isDone && <Chip icon={<CheckCircle />} label="완료" size="small" color="success" />}
                  {isError && <Chip icon={<ErrorIcon />} label="실패" size="small" color="error" />}
                  {!isDone && !isError && currentStepIdx >= 0 && (
                    <Chip label={`${parsingSteps[currentStepIdx].label}...`} size="small" color="primary" variant="outlined" />
                  )}
                  <IconButton size="small" onClick={() => removeFile(idx)}><Close fontSize="small" /></IconButton>
                </Box>

                {/* 7-step mini progress */}
                {!isError && (
                  <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                    {parsingSteps.map((ps, si) => {
                      const done = uf.parsingStep > si || isDone;
                      const active = uf.parsingStep === si && !isDone;
                      return (
                        <Box key={si} sx={{ flex: 1, textAlign: 'center' }}>
                          <Box sx={{
                            height: 4, borderRadius: 2, mb: 0.5,
                            bgcolor: done ? '#003875' : active ? '#4dabf7' : '#e0e0e0',
                            transition: 'background-color 0.3s',
                          }} />
                          <Typography variant="caption" sx={{
                            fontSize: 10,
                            color: done ? '#003875' : active ? '#4dabf7' : '#999',
                            fontWeight: active ? 700 : 400,
                          }}>
                            {ps.label}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                )}

                <LinearProgress
                  variant={currentStepIdx >= 0 && !isDone ? 'indeterminate' : 'determinate'}
                  value={progress}
                  sx={{ height: 3, borderRadius: 2 }}
                  color={isDone ? 'success' : isError ? 'error' : 'primary'}
                />
              </Box>
            );
          })}
        </Paper>
      )}

      {/* ── 완료 요약 카드 ── */}
      <Collapse in={allDone && showSummary}>
        <Fade in={allDone && showSummary}>
          <Paper sx={{ mb: 3, p: 3, borderRadius: 3, border: '1px solid #c8e6c9', bgcolor: '#f1f8e9' }} elevation={0}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CheckCircle sx={{ color: '#4caf50' }} />
              <Typography variant="subtitle1" fontWeight={700} color="#2e7d32">
                파싱 완료
              </Typography>
            </Box>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Card variant="outlined" sx={{ textAlign: 'center', bgcolor: '#fff' }}>
                  <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="h3" fontWeight={700} color="#003875">{mockSummary.sheets}</Typography>
                    <Typography variant="caption" color="text.secondary">시트 수</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Card variant="outlined" sx={{ textAlign: 'center', bgcolor: '#fff' }}>
                  <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="h3" fontWeight={700} color="#003875">{mockSummary.parts}</Typography>
                    <Typography variant="caption" color="text.secondary">부품 수</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Card variant="outlined" sx={{ textAlign: 'center', bgcolor: '#fff' }}>
                  <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="h3" fontWeight={700} color="#003875">{mockSummary.sections.length}</Typography>
                    <Typography variant="caption" color="text.secondary">섹션 감지</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Card variant="outlined" sx={{ textAlign: 'center', bgcolor: '#fff' }}>
                  <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="h3" fontWeight={700} color="#003875">3</Typography>
                    <Typography variant="caption" color="text.secondary">3자비교 세트</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mr: 1 }}>감지된 섹션:</Typography>
              {mockSummary.sections.map(s => (
                <Chip key={s} label={s} size="small" sx={{ bgcolor: '#003875', color: '#fff' }} />
              ))}
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Typography variant="body2" fontWeight={600}>3자비교:</Typography>
              <Chip label={`입찰 ${mockSummary.threeWay.bidder}건`} size="small" variant="outlined" />
              <Chip label={`OEM ${mockSummary.threeWay.oem}건`} size="small" variant="outlined" />
              <Chip label={`MOBIS ${mockSummary.threeWay.mobis}건`} size="small" variant="outlined" />
            </Box>

            <Box sx={{ mt: 3, textAlign: 'right' }}>
              <Button
                variant="contained"
                endIcon={<NavigateNext />}
                onClick={() => navigate('/review')}
                sx={{ bgcolor: '#003875', px: 4 }}
              >
                데이터 검토로 이동
              </Button>
            </Box>
          </Paper>
        </Fade>
      </Collapse>
    </Box>
  );
};

export default Parsing;
