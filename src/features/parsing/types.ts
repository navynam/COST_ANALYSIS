export type FileStatus = 'extracting' | 'complete' | 'failed' | 'analyzing';

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
export type SortDirection = 'asc' | 'desc';
