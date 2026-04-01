import { C } from '../../../shared/constants/colors';
import type { FileItem, FileStatus } from '../types';

export const initialFiles: FileItem[] = [
  { id: 1, name: 'CONSOLE_BOX_원가명세.xlsx', status: 'extracting', progress: 65, parsedItems: null, anomalies: null, uploadDate: '2026-02-19', fileSize: '2.4 MB', sheets: 3, uploader: '김영수', department: '구매팀' },
  { id: 2, name: 'HEAD_LINING_원가계산서.xlsx', status: 'complete', progress: 100, parsedItems: 24, anomalies: 2, uploadDate: '2026-02-18', fileSize: '3.1 MB', sheets: 4, uploader: '박지혜', department: '원가관리팀' },
  { id: 3, name: 'DOOR_TRIM_견적서.xlsx', status: 'complete', progress: 100, parsedItems: 18, anomalies: 0, uploadDate: '2026-02-17', fileSize: '1.8 MB', sheets: 2, uploader: '이철수', department: '구매팀' },
  { id: 4, name: 'SEAT_COVER_원가분석.xlsx', status: 'failed', progress: 30, parsedItems: null, anomalies: null, uploadDate: '2026-02-16', fileSize: '4.2 MB', sheets: 1, uploader: '홍길동', department: '품질팀' },
  { id: 5, name: 'BUMPER_ASSY_Q4견적.xlsx', status: 'analyzing', progress: 100, parsedItems: 32, anomalies: 0, uploadDate: '2026-02-15', fileSize: '2.9 MB', sheets: 3, uploader: '최민정', department: '원가관리팀' },
];

export const statusConfig: Record<FileStatus, { label: string; emoji: string; color: string }> = {
  extracting: { label: '추출', emoji: '⏳', color: C.orange },
  complete: { label: '검증', emoji: '✅', color: C.green },
  failed: { label: '추출실패', emoji: '❌', color: C.red },
  analyzing: { label: '분석', emoji: '🟣', color: C.purple },
};

export const progressColor: Record<FileStatus, string> = {
  extracting: C.orange, complete: C.green, failed: C.red, analyzing: C.purple,
};
