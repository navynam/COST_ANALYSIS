import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { C } from '../../../shared/constants/colors';
import type { UploadQueueItem } from '../types';

interface FileUploadAreaProps {
  uploadQueue: UploadQueueItem[];
  onRemoveQueue: (index: number) => void;
}

const FileUploadArea: React.FC<FileUploadAreaProps> = ({ uploadQueue, onRemoveQueue }) => {
  if (uploadQueue.length === 0) return null;

  return (
    <Box sx={{ px: 3, py: 1, bgcolor: 'white', borderBottom: '1px solid #f2f4f6' }}>
      {uploadQueue.map((q, i) => (
        <Box key={i} sx={{
          display: 'flex', alignItems: 'center', gap: 1.5,
          mb: i < uploadQueue.length - 1 ? 0.75 : 0,
        }}>
          <Typography sx={{ fontSize: 13 }}>📄</Typography>
          <Typography sx={{
            flex: 1, fontSize: 12, fontWeight: 500, color: '#191f28',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {q.file.name}
          </Typography>
          <Box sx={{ width: 100, height: 3, bgcolor: '#e5e8eb', borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ width: `${q.progress}%`, height: '100%', bgcolor: C.blue, borderRadius: 2, transition: 'width 0.3s' }} />
          </Box>
          <Typography sx={{ fontSize: 11, color: C.gray, minWidth: 30, textAlign: 'right' }}>
            {q.progress}%
          </Typography>
          <IconButton size="small" onClick={() => onRemoveQueue(i)}
            sx={{ width: 20, height: 20, bgcolor: '#e5e5e7', '&:hover': { bgcolor: '#f8d7da', color: C.red } }}>
            <Close sx={{ fontSize: 10 }} />
          </IconButton>
        </Box>
      ))}
    </Box>
  );
};

export default FileUploadArea;
