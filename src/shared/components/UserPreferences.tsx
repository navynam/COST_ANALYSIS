/**
 * ⭐ 사용자 편의 기능
 * 
 * Toss 스타일 개인화 기능:
 * 1. 즐겨찾기 관리
 * 2. 최근 작업 이력
 * 3. 개인 설정 저장
 * 4. 빠른 접근 대시보드
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Avatar,
  Divider,
  Menu,
  MenuItem,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  History as HistoryIcon,
  FilePresent as FileIcon,
  Analytics as AnalyticsIcon,
  Schedule as ClockIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Folder as FolderIcon,
  FileDownload as DownloadIcon
} from '@mui/icons-material';

// ⭐ 즐겨찾기 아이템 타입
interface FavoriteItem {
  id: string;
  title: string;
  type: 'file' | 'analysis' | 'comparison';
  path: string;
  createdAt: Date;
  lastAccessed: Date;
  description?: string;
  tags?: string[];
}

// 📝 최근 작업 아이템 타입
interface RecentItem {
  id: string;
  title: string;
  type: 'upload' | 'analysis' | 'comparison' | 'export';
  timestamp: Date;
  status: 'completed' | 'in-progress' | 'failed';
  fileSize?: number;
  duration?: number;
}

// ⭐ 사용자 편의 기능 Props
interface UserPreferencesProps {
  variant?: 'sidebar' | 'dashboard';
  maxItems?: number;
}

// ⭐ 사용자 편의 기능 컴포넌트
const UserPreferences: React.FC<UserPreferencesProps> = ({
  variant = 'sidebar',
  maxItems = 5
}) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  // ⭐ 로컬 스토리지에서 데이터 로드
  useEffect(() => {
    const savedFavorites = localStorage.getItem('user-favorites');
    const savedRecent = localStorage.getItem('user-recent');
    
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites).map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        lastAccessed: new Date(item.lastAccessed)
      })));
    }
    
    if (savedRecent) {
      setRecentItems(JSON.parse(savedRecent).map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      })));
    }
  }, []);

  // ⭐ 즐겨찾기 추가
  const addFavorite = (item: Omit<FavoriteItem, 'id' | 'createdAt' | 'lastAccessed'>) => {
    const newFavorite: FavoriteItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date(),
      lastAccessed: new Date()
    };
    
    const updatedFavorites = [newFavorite, ...favorites].slice(0, 20); // 최대 20개
    setFavorites(updatedFavorites);
    localStorage.setItem('user-favorites', JSON.stringify(updatedFavorites));
  };

  // ⭐ 즐겨찾기 제거
  const removeFavorite = (id: string) => {
    const updatedFavorites = favorites.filter(item => item.id !== id);
    setFavorites(updatedFavorites);
    localStorage.setItem('user-favorites', JSON.stringify(updatedFavorites));
  };

  // 📝 최근 항목 추가
  const addRecentItem = (item: Omit<RecentItem, 'id' | 'timestamp'>) => {
    const newItem: RecentItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    
    const updatedRecent = [newItem, ...recentItems].slice(0, 50); // 최대 50개
    setRecentItems(updatedRecent);
    localStorage.setItem('user-recent', JSON.stringify(updatedRecent));
  };

  // 📝 최근 항목 제거
  const removeRecentItem = (id: string) => {
    const updatedRecent = recentItems.filter(item => item.id !== id);
    setRecentItems(updatedRecent);
    localStorage.setItem('user-recent', JSON.stringify(updatedRecent));
  };

  // 🎨 타입별 아이콘 반환
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'file':
      case 'upload':
        return <FileIcon />;
      case 'analysis':
        return <AnalyticsIcon />;
      case 'comparison':
        return <FolderIcon />;
      case 'export':
        return <DownloadIcon />;
      default:
        return <FileIcon />;
    }
  };

  // 🎨 상태별 색상 반환
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  // 📅 상대 시간 포맷
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString();
  };

  // 🎨 사이드바 스타일
  if (variant === 'sidebar') {
    return (
      <Box sx={{ width: '100%', maxWidth: 320 }}>
        {/* ⭐ 즐겨찾기 섹션 */}
        <Card sx={{ mb: 2, p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <StarIcon color="warning" />
            <Typography variant="h6" fontWeight={600}>
              즐겨찾기
            </Typography>
            <Badge badgeContent={favorites.length} color="primary" />
          </Box>

          {favorites.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 2 }}>
              아직 즐겨찾기가 없습니다.
              <br />
              ⭐ 버튼을 눌러 추가해보세요!
            </Typography>
          ) : (
            <List dense>
              {favorites.slice(0, maxItems).map((item, index) => (
                <ListItem
                  key={item.id}
                  button
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <ListItemIcon>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}>
                      {getTypeIcon(item.type)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={500} noWrap>
                        {item.title}
                      </Typography>
                    }
                    secondary={formatRelativeTime(item.lastAccessed)}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      size="small"
                      onClick={() => removeFavorite(item.id)}
                    >
                      <StarIcon color="warning" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}

          {favorites.length > maxItems && (
            <Button size="small" fullWidth>
              전체 보기 ({favorites.length})
            </Button>
          )}
        </Card>

        {/* 📝 최근 작업 섹션 */}
        <Card sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <HistoryIcon color="action" />
            <Typography variant="h6" fontWeight={600}>
              최근 작업
            </Typography>
            <Badge badgeContent={recentItems.length} color="secondary" />
          </Box>

          {recentItems.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 2 }}>
              최근 작업이 없습니다.
              <br />
              견적서를 업로드해보세요!
            </Typography>
          ) : (
            <List dense>
              {recentItems.slice(0, maxItems).map((item, index) => (
                <ListItem
                  key={item.id}
                  button
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <ListItemIcon>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: `${getStatusColor(item.status)}.light` }}>
                      {getTypeIcon(item.type)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight={500} noWrap>
                          {item.title}
                        </Typography>
                        <Chip
                          label={item.status}
                          size="small"
                          color={getStatusColor(item.status) as any}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ClockIcon sx={{ fontSize: 12 }} />
                        <Typography variant="caption">
                          {formatRelativeTime(item.timestamp)}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setMenuAnchor(e.currentTarget);
                        setSelectedItem(item.id);
                      }}
                    >
                      <MoreIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}

          {recentItems.length > maxItems && (
            <Button size="small" fullWidth>
              전체 보기 ({recentItems.length})
            </Button>
          )}
        </Card>

        {/* 📝 컨텍스트 메뉴 */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
        >
          <MenuItem
            onClick={() => {
              // 즐겨찾기에 추가 로직
              setMenuAnchor(null);
            }}
          >
            <StarBorderIcon sx={{ mr: 1 }} />
            즐겨찾기 추가
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (selectedItem) {
                removeRecentItem(selectedItem);
              }
              setMenuAnchor(null);
            }}
          >
            <DeleteIcon sx={{ mr: 1 }} />
            목록에서 제거
          </MenuItem>
        </Menu>
      </Box>
    );
  }

  // 🎨 대시보드 스타일은 나중에 구현
  return null;
};

// ⭐ 전역 사용자 편의 기능 훅
export const useUserPreferences = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);

  // ⭐ 즐겨찾기 토글
  const toggleFavorite = (item: Omit<FavoriteItem, 'id' | 'createdAt' | 'lastAccessed'>) => {
    const existingFavorite = favorites.find(fav => fav.path === item.path);
    
    if (existingFavorite) {
      // 제거
      const updatedFavorites = favorites.filter(fav => fav.id !== existingFavorite.id);
      setFavorites(updatedFavorites);
      localStorage.setItem('user-favorites', JSON.stringify(updatedFavorites));
      return false; // 제거됨
    } else {
      // 추가
      const newFavorite: FavoriteItem = {
        ...item,
        id: Date.now().toString(),
        createdAt: new Date(),
        lastAccessed: new Date()
      };
      const updatedFavorites = [newFavorite, ...favorites].slice(0, 20);
      setFavorites(updatedFavorites);
      localStorage.setItem('user-favorites', JSON.stringify(updatedFavorites));
      return true; // 추가됨
    }
  };

  // 📝 최근 항목 추가
  const addToRecent = (item: Omit<RecentItem, 'id' | 'timestamp'>) => {
    const newItem: RecentItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    const updatedRecent = [newItem, ...recentItems].slice(0, 50);
    setRecentItems(updatedRecent);
    localStorage.setItem('user-recent', JSON.stringify(updatedRecent));
  };

  // ⭐ 즐겨찾기 여부 확인
  const isFavorite = (path: string) => {
    return favorites.some(fav => fav.path === path);
  };

  return {
    favorites,
    recentItems,
    toggleFavorite,
    addToRecent,
    isFavorite
  };
};

export default UserPreferences;