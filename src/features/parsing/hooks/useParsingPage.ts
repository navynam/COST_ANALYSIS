import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { C } from '../../../shared/constants/colors';
import { initialFiles } from '../data/mockData';
import type { FileItem, FileStatus, UploadQueueItem, SearchFilters, SortField, SortDirection } from '../types';
import {
  filterFiles,
  sortFiles,
  calculateCounts,
  isSearchActive as checkSearchActive,
} from '../services/parsingService';

export const useParsingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [files] = useState<FileItem[]>(initialFiles);
  const [filter, setFilter] = useState<'all' | FileStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [dragOver, setDragOver] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [drawerFile, setDrawerFile] = useState<FileItem | null>(null);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({ documentName: '', dateFrom: '', dateTo: '', uploader: '', department: '' });
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    const filterParam = searchParams.get('filter') as FileStatus;
    if (filterParam && ['extracting', 'verifying', 'verified', 'analyzing', 'analyzed', 'failed'].includes(filterParam)) {
      setFilter(filterParam);
    }
  }, [searchParams]);

  const filteredAndSorted = (() => {
    const filtered = filterFiles(files, filter, searchQuery, searchFilters);
    return sortFiles(filtered, sortField, sortDirection);
  })();

  const counts = calculateCounts(files);

  const handleFiles = useCallback((fileList: FileList | File[]) => {
    const items: UploadQueueItem[] = Array.from(fileList).map(f => ({ file: f, progress: 0 }));
    setUploadQueue(prev => [...prev, ...items]);
    items.forEach((_, i) => {
      let prog = 0;
      const iv = setInterval(() => {
        prog += Math.random() * 20;
        if (prog >= 100) { prog = 100; clearInterval(iv); }
        setUploadQueue(prev => prev.map((q, qi) => qi === prev.length - items.length + i ? { ...q, progress: Math.min(100, Math.round(prog)) } : q));
      }, 500);
    });
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('asc'); }
  };

  const isSearchActive = checkSearchActive(searchFilters);

  const statusCards: { key: 'all' | FileStatus; label: string; colorKey: string }[] = [
    { key: 'all', label: '전체', colorKey: C.dark },
    { key: 'extracting', label: '추출중(자동)', colorKey: '#F59E0B' },
    { key: 'verifying', label: '검증중', colorKey: '#3B82F6' },
    { key: 'verified', label: '검증완료', colorKey: '#0D9488' },
    { key: 'analyzing', label: '분석중(자동)', colorKey: '#8B5CF6' },
    { key: 'inAnalysis', label: '분석중', colorKey: '#6366F1' },
    { key: 'analyzed', label: '분석완료', colorKey: '#10B981' },
    { key: 'failed', label: '실패', colorKey: '#EF4444' },
  ];

  return {
    navigate,
    files, filter, setFilter,
    searchQuery, setSearchQuery,
    selectedIds, setSelectedIds,
    dragOver, setDragOver,
    uploadQueue, setUploadQueue,
    drawerFile, setDrawerFile,
    searchDialogOpen, setSearchDialogOpen,
    searchFilters, setSearchFilters,
    sortField, sortDirection,
    filteredAndSorted, counts, isSearchActive, statusCards,
    handleFiles, handleSort,
  };
};
