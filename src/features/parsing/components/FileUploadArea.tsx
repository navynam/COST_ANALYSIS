import React, { useRef } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { C } from '../../../shared/constants/colors';
import type { UploadQueueItem } from '../types';

interface FileUploadAreaProps {
  dragOver: boolean;
  uploadQueue: UploadQueueItem[];
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (files: FileList) => void;
  onRemoveQueue: (index: number) => void;
}

const FileUploadArea: React.FC<FileUploadAreaProps> = ({
  dragOver, uploadQueue, onDragOver, onDragLeave, onDrop, onFileSelect, onRemoveQueue,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Box
        sx={{
          mx: 3, mb: 2, p: 4, border: '2px dashed', borderRadius: '12px',
          borderColor: dragOver ? C.blue : '#d2d2d7',
          bgcolor: dragOver ? '#e8f4fd' : '#fff',
          textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s',
          '&:hover': { borderColor: C.blue, bgcolor: '#f8fbff' },
        }}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef} type="file" hidden multiple accept=".xlsx,.xls,.jpg,.jpeg,.png"
          onChange={e => { if (e.target.files?.length) onFileSelect(e.target.files); e.target.value = ''; }}
        />
        <Box sx={{ fontSize: 40, mb: 1.5 }}>📁</Box>
        <Typography sx={{ fontSize: 14, color: C.gray, mb: 1 }}>
          파일을 드래그하거나 <strong style={{ color: C.blue }}>클릭하여 업로드</strong>
        </Typography>
        <Typography sx={{ fontSize: 11, color: '#a1a1a6' }}>
          지원 형식: xls, xlsx, 이미지(jpg, png) · 최대 50MB · 다중 파일 가능
        </Typography>
      </Box>

      {uploadQueue.length > 0 && (
        <Box sx={{ px: 3, pb: 2 }}>
          {uploadQueue.map((q, i) => (
            <Box key={i} sx={{ bgcolor: '#fff', border: `1px solid ${C.border}`, borderRadius: '8px', p: '10px 16px', mb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <span>📄</span>
              <Typography sx={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{q.file.name}</Typography>
              <Box sx={{ width: 120, height: 4, bgcolor: '#e5e5e7', borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ width: `${q.progress}%`, height: '100%', bgcolor: C.blue, borderRadius: 2, transition: 'width 0.3s' }} />
              </Box>
              <Typography sx={{ fontSize: 11, color: C.gray, minWidth: 30 }}>{q.progress}%</Typography>
              <IconButton size="small" onClick={() => onRemoveQueue(i)}
                sx={{ width: 24, height: 24, bgcolor: '#e5e5e7', '&:hover': { bgcolor: '#f8d7da', color: C.red } }}>
                <Close sx={{ fontSize: 12 }} />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </>
  );
};

export default FileUploadArea;
