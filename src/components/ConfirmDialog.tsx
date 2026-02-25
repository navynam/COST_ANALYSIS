/**
 * @fileoverview 확인 다이얼로그 컴포넌트
 * @description 삭제 등 위험한 작업 전 사용자 확인을 받는 공통 모달
 */
import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button,
} from '@mui/material';

interface ConfirmDialogProps {
  /** 다이얼로그 열림 상태 */
  open: boolean;
  /** 제목 */
  title: string;
  /** 본문 메시지 */
  message: string;
  /** 확인 버튼 텍스트 */
  confirmText?: string;
  /** 취소 버튼 텍스트 */
  cancelText?: string;
  /** 확인 버튼 색상 */
  confirmColor?: 'primary' | 'error' | 'warning';
  /** 확인 클릭 핸들러 */
  onConfirm: () => void;
  /** 취소/닫기 핸들러 */
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  confirmColor = 'primary',
  onConfirm,
  onCancel,
}) => (
  <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <DialogContentText>{message}</DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel}>{cancelText}</Button>
      <Button onClick={onConfirm} variant="contained" color={confirmColor}>
        {confirmText}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;
