/**
 * 공통 메시지 다이얼로그
 * alert(), confirm()을 대체하는 MUI 다이얼로그
 *
 * 사용법:
 *   import { useMessageDialog } from '../../shared/components/MessageDialog';
 *
 *   const { showAlert, showConfirm } = useMessageDialog();
 *
 *   // alert 대체
 *   await showAlert('저장이 완료되었습니다.', 'success');
 *
 *   // confirm 대체
 *   const ok = await showConfirm('삭제하시겠습니까?', '이 작업은 되돌릴 수 없습니다.');
 *   if (ok) { ... }
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box,
} from '@mui/material';
import {
  CheckCircle, Warning, Error as ErrorIcon, Info, HelpOutline,
} from '@mui/icons-material';

// ── 타입 ──
type DialogType = 'success' | 'warning' | 'error' | 'info' | 'confirm';

interface DialogState {
  open: boolean;
  type: DialogType;
  title: string;
  message: string;
  resolve?: (value: boolean) => void;
}

interface MessageDialogContextType {
  showAlert: (message: string, type?: 'success' | 'warning' | 'error' | 'info', title?: string) => Promise<void>;
  showConfirm: (message: string, detail?: string, title?: string) => Promise<boolean>;
}

const typeConfig: Record<DialogType, { icon: React.ReactNode; color: string; defaultTitle: string; bgColor: string }> = {
  success: { icon: <CheckCircle sx={{ fontSize: 28 }} />, color: '#10B981', defaultTitle: '완료', bgColor: '#D1FAE5' },
  warning: { icon: <Warning sx={{ fontSize: 28 }} />, color: '#F59E0B', defaultTitle: '주의', bgColor: '#FEF3C7' },
  error: { icon: <ErrorIcon sx={{ fontSize: 28 }} />, color: '#EF4444', defaultTitle: '오류', bgColor: '#FEE2E2' },
  info: { icon: <Info sx={{ fontSize: 28 }} />, color: '#3B82F6', defaultTitle: '안내', bgColor: '#DBEAFE' },
  confirm: { icon: <HelpOutline sx={{ fontSize: 28 }} />, color: '#6366F1', defaultTitle: '확인', bgColor: '#E0E7FF' },
};

// ── Context ──
const MessageDialogContext = createContext<MessageDialogContextType | null>(null);

export const useMessageDialog = (): MessageDialogContextType => {
  const ctx = useContext(MessageDialogContext);
  if (!ctx) throw new Error('useMessageDialog must be used within MessageDialogProvider');
  return ctx;
};

// ── Provider ──
export const MessageDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DialogState>({ open: false, type: 'info', title: '', message: '' });

  const showAlert = useCallback((message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info', title?: string): Promise<void> => {
    return new Promise((resolve) => {
      setState({
        open: true,
        type,
        title: title || typeConfig[type].defaultTitle,
        message,
        resolve: () => resolve(),
      });
    });
  }, []);

  const showConfirm = useCallback((message: string, detail?: string, title?: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        open: true,
        type: 'confirm',
        title: title || '확인',
        message: detail ? `${message}\n${detail}` : message,
        resolve,
      });
    });
  }, []);

  const handleClose = (result: boolean) => {
    state.resolve?.(result);
    setState(prev => ({ ...prev, open: false }));
  };

  const cfg = typeConfig[state.type];

  return (
    <MessageDialogContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <Dialog
        open={state.open}
        onClose={() => handleClose(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px', overflow: 'hidden' } }}
      >
        {/* 상단 아이콘 영역 */}
        <Box sx={{ bgcolor: cfg.bgColor, display: 'flex', justifyContent: 'center', pt: 3, pb: 2 }}>
          <Box sx={{
            width: 56, height: 56, borderRadius: '50%', bgcolor: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: cfg.color, boxShadow: `0 0 0 8px ${cfg.color}15`,
          }}>
            {cfg.icon}
          </Box>
        </Box>

        <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, fontSize: 18, pb: 0.5, pt: 2 }}>
          {state.title}
        </DialogTitle>

        <DialogContent sx={{ textAlign: 'center', px: 4, pb: 1 }}>
          {state.message.split('\n').map((line, i) => (
            <Typography key={i} sx={{ fontSize: 14, color: '#4B5563', lineHeight: 1.6 }}>
              {line}
            </Typography>
          ))}
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 4, gap: 1.5 }}>
          {state.type === 'confirm' ? (
            <>
              <Button
                variant="outlined"
                onClick={() => handleClose(false)}
                sx={{
                  minWidth: 100, borderRadius: '10px', textTransform: 'none',
                  fontSize: 14, fontWeight: 600, py: 1,
                  color: '#6B7280', borderColor: '#D1D5DB',
                  '&:hover': { bgcolor: '#F3F4F6', borderColor: '#9CA3AF' },
                }}
              >
                취소
              </Button>
              <Button
                variant="contained"
                onClick={() => handleClose(true)}
                sx={{
                  minWidth: 100, borderRadius: '10px', textTransform: 'none',
                  fontSize: 14, fontWeight: 700, py: 1,
                  bgcolor: cfg.color, boxShadow: 'none',
                  '&:hover': { bgcolor: cfg.color, filter: 'brightness(0.9)', boxShadow: 'none' },
                }}
              >
                확인
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              onClick={() => handleClose(true)}
              sx={{
                minWidth: 120, borderRadius: '10px', textTransform: 'none',
                fontSize: 14, fontWeight: 700, py: 1,
                bgcolor: cfg.color, boxShadow: 'none',
                '&:hover': { bgcolor: cfg.color, filter: 'brightness(0.9)', boxShadow: 'none' },
              }}
            >
              확인
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </MessageDialogContext.Provider>
  );
};
