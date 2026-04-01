import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { C } from '../../../shared/constants/colors';
import { initialFiles } from '../data/mockData';
import type { FileItem, FileStatus, UploadQueueItem, SearchFilters, SortField, SortDirection } from '../types';

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
    if (filterParam && ['extracting', 'complete', 'analyzing', 'failed'].includes(filterParam)) {
      setFilter(filterParam);
    }
  }, [searchParams]);

  const filteredAndSorted = (() => {
    let result = files.filter(f => {
      if (filter !== 'all' && f.status !== filter) return false;
      if (searchQuery && !f.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (searchFilters.documentName && !f.name.toLowerCase().includes(searchFilters.documentName.toLowerCase())) return false;
      if (searchFilters.uploader && !f.uploader?.toLowerCase().includes(searchFilters.uploader.toLowerCase())) return false;
      if (searchFilters.department && !f.department?.toLowerCase().includes(searchFilters.department.toLowerCase())) return false;
      if (searchFilters.dateFrom && f.uploadDate < searchFilters.dateFrom) return false;
      if (searchFilters.dateTo && f.uploadDate > searchFilters.dateTo) return false;
      return true;
    });

    if (sortField) {
      result = result.sort((a, b) => {
        const aVal: any = a[sortField] ?? '';
        const bVal: any = b[sortField] ?? '';
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  })();

  const counts = {
    all: files.length,
    extracting: files.filter(f => f.status === 'extracting').length,
    complete: files.filter(f => f.status === 'complete').length,
    failed: files.filter(f => f.status === 'failed').length,
    analyzing: files.filter(f => f.status === 'analyzing').length,
  };

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

  const isSearchActive = Object.values(searchFilters).some(v => v.trim() !== '');

  const statusCards: { key: 'all' | FileStatus; label: string; colorKey: string }[] = [
    { key: 'all', label: '전체', colorKey: C.dark },
    { key: 'extracting', label: '추출', colorKey: C.orange },
    { key: 'complete', label: '검증', colorKey: C.green },
    { key: 'analyzing', label: '분석', colorKey: C.purple },
    { key: 'failed', label: '실패', colorKey: C.red },
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
