import { C } from '../../../shared/constants/colors';
import type { FileItem, FileStatus } from '../types';

export const initialFiles: FileItem[] = [
  { id: 1,  name: 'CONSOLE_BOX_원가명세.xlsx',       status: 'extracting', progress: 65,  parsedItems: null, anomalies: null, uploadDate: '2026-02-19', fileSize: '2.4 MB', sheets: 3, uploader: '김영수', department: '구매팀' },
  { id: 2,  name: 'HEAD_LINING_원가계산서.xlsx',      status: 'verifying',  progress: 100, parsedItems: 24,   anomalies: 2,    uploadDate: '2026-02-18', fileSize: '3.1 MB', sheets: 4, uploader: '박지혜', department: '원가관리팀' },
  { id: 3,  name: 'DOOR_TRIM_견적서.xlsx',            status: 'verified',   progress: 100, parsedItems: 18,   anomalies: 0,    uploadDate: '2026-02-17', fileSize: '1.8 MB', sheets: 2, uploader: '이철수', department: '구매팀' },
  { id: 4,  name: 'SEAT_COVER_원가분석.xlsx',         status: 'failed',     progress: 30,  parsedItems: null, anomalies: null, uploadDate: '2026-02-16', fileSize: '4.2 MB', sheets: 1, uploader: '홍길동', department: '품질팀' },
  { id: 5,  name: 'BUMPER_ASSY_Q4견적.xlsx',          status: 'analyzed',   progress: 100, parsedItems: 32,   anomalies: 0,    uploadDate: '2026-02-15', fileSize: '2.9 MB', sheets: 3, uploader: '최민정', department: '원가관리팀' },
  { id: 6,  name: 'FENDER_PANEL_원가산출.xlsx',       status: 'extracting', progress: 42,  parsedItems: null, anomalies: null, uploadDate: '2026-02-14', fileSize: '1.9 MB', sheets: 2, uploader: '정하늘', department: '견적1팀' },
  { id: 7,  name: 'RADIATOR_GRILLE_견적서.xlsx',      status: 'verifying',  progress: 100, parsedItems: 28,   anomalies: 1,    uploadDate: '2026-02-13', fileSize: '2.7 MB', sheets: 3, uploader: '김민수', department: '견적2팀' },
  { id: 8,  name: 'HOOD_INNER_원가계산서.xlsx',       status: 'verified',   progress: 100, parsedItems: 22,   anomalies: 3,    uploadDate: '2026-02-12', fileSize: '3.5 MB', sheets: 4, uploader: '이분석', department: '견적1팀' },
  { id: 9,  name: 'WHEEL_COVER_견적서.xlsx',          status: 'analyzing',  progress: 100, parsedItems: 15,   anomalies: 1,    uploadDate: '2026-02-11', fileSize: '1.5 MB', sheets: 2, uploader: '박검증', department: '견적2팀' },
  { id: 10, name: 'TRUNK_LID_원가분석.xlsx',          status: 'analyzed',   progress: 100, parsedItems: 26,   anomalies: 2,    uploadDate: '2026-02-10', fileSize: '2.8 MB', sheets: 3, uploader: '김영수', department: '구매팀' },
  { id: 11, name: 'SIDE_MIRROR_원가명세.xlsx',        status: 'extracting', progress: 88,  parsedItems: null, anomalies: null, uploadDate: '2026-02-09', fileSize: '2.1 MB', sheets: 2, uploader: '최민정', department: '원가관리팀' },
  { id: 12, name: 'AIR_BAG_MODULE_견적.xlsx',         status: 'verifying',  progress: 100, parsedItems: 35,   anomalies: 4,    uploadDate: '2026-02-08', fileSize: '4.8 MB', sheets: 5, uploader: '정하늘', department: '견적1팀' },
  { id: 13, name: 'CLUSTER_원가계산서.xlsx',           status: 'verified',   progress: 100, parsedItems: 20,   anomalies: 0,    uploadDate: '2026-02-07', fileSize: '2.2 MB', sheets: 3, uploader: '홍길동', department: '품질팀' },
  { id: 14, name: 'STEERING_WHEEL_견적.xlsx',         status: 'failed',     progress: 15,  parsedItems: null, anomalies: null, uploadDate: '2026-02-06', fileSize: '5.1 MB', sheets: 1, uploader: '박지혜', department: '원가관리팀' },
  { id: 15, name: 'WIPER_ARM_원가분석.xlsx',          status: 'analyzed',   progress: 100, parsedItems: 12,   anomalies: 0,    uploadDate: '2026-02-05', fileSize: '1.3 MB', sheets: 2, uploader: '이철수', department: '구매팀' },
  { id: 16, name: 'ROOF_RACK_견적서.xlsx',            status: 'analyzing',  progress: 100, parsedItems: 19,   anomalies: 2,    uploadDate: '2026-02-04', fileSize: '2.6 MB', sheets: 3, uploader: '김민수', department: '견적2팀' },
  { id: 17, name: 'TAIL_LAMP_원가계산서.xlsx',        status: 'extracting', progress: 23,  parsedItems: null, anomalies: null, uploadDate: '2026-02-03', fileSize: '3.3 MB', sheets: 4, uploader: '이분석', department: '견적1팀' },
  { id: 18, name: 'EXHAUST_PIPE_견적서.xlsx',         status: 'verified',   progress: 100, parsedItems: 14,   anomalies: 1,    uploadDate: '2026-02-02', fileSize: '1.7 MB', sheets: 2, uploader: '박검증', department: '견적2팀' },
  { id: 19, name: 'BRAKE_PAD_원가분석.xlsx',          status: 'failed',     progress: 50,  parsedItems: null, anomalies: null, uploadDate: '2026-02-01', fileSize: '3.9 MB', sheets: 1, uploader: '김영수', department: '구매팀' },
  { id: 20, name: 'SUSPENSION_ARM_견적.xlsx',         status: 'analyzed',   progress: 100, parsedItems: 29,   anomalies: 1,    uploadDate: '2026-01-31', fileSize: '2.5 MB', sheets: 3, uploader: '최민정', department: '원가관리팀' },
];

export const statusConfig: Record<FileStatus, { label: string; emoji: string; color: string }> = {
  extracting: { label: '추출중', emoji: '⏳', color: C.orange },
  verifying: { label: '검증중', emoji: '🔍', color: C.blue },
  verified: { label: '검증완료', emoji: '✅', color: C.green },
  analyzing: { label: '분석중', emoji: '🟣', color: C.purple },
  analyzed: { label: '분석완료', emoji: '📊', color: '#34c759' },
  failed: { label: '실패', emoji: '❌', color: C.red },
};

export const progressColor: Record<FileStatus, string> = {
  extracting: C.orange, verifying: C.blue, verified: C.green, analyzing: C.purple, analyzed: '#34c759', failed: C.red,
};
