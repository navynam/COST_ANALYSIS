export type FileStatus = 'extracting' | 'verifying' | 'verified' | 'analyzing' | 'inAnalysis' | 'analyzed' | 'failed';

export interface AttachmentDetail {
  filename: string;
  status: FileStatus;
  progress?: number;
  uploadDate?: string;
}

export interface FileItem {
  id: number;
  name: string;
  status: FileStatus;
  progress: number;
  parsedItems: number | null;
  anomalies: number | null;
  uploadDate: string;
  fileSize?: string;
  sheets?: number;
  uploader?: string;
  department?: string;
  attachments?: string[];  // 참조 파일명 목록 (하위 호환)
  partNumber?: string;     // 품번
  partName?: string;       // 품명
  attachmentDetails?: AttachmentDetail[]; // 첨부 파일별 상태 (다이어그램 뷰용)
}

export interface UploadQueueItem {
  file: File;
  progress: number;
}

export interface SearchFilters {
  documentName: string;
  dateFrom: string;
  dateTo: string;
  uploader: string;
  department: string;
}

export type SortField = 'name' | 'status' | 'progress' | 'parsedItems' | 'anomalies' | 'uploader' | 'department' | 'uploadDate';
export const STATUS_ORDER: FileStatus[] = ['extracting', 'verifying', 'verified', 'analyzing', 'inAnalysis', 'analyzed', 'failed'];
export type SortDirection = 'asc' | 'desc';
