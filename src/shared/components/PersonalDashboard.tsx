/**
 * 🏠 개인화 대시보드
 * 
 * Toss 스타일 개인 맞춤 경험:
 * 1. 사용 패턴 기반 추천
 * 2. 즐겨찾기 빠른 접근
 * 3. 개인 통계 및 인사이트
 * 4. 맞춤 바로가기
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Badge,
  LinearProgress,
  Divider,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  Star as StarIcon,
  TrendingUp as TrendIcon,
  Schedule as ClockIcon,
  FilePresent as FileIcon,
  Analytics as AnalyticsIcon,
  Compare as CompareIcon,
  Add as AddIcon,
  MoreVert as MoreIcon,
  Speed as SpeedIcon,
  EmojiEvents as TrophyIcon,
  Insights as InsightIcon,
  Bookmark as BookmarkIcon
} from '@mui/icons-material';

// 🏠 위젯 타입 정의
interface DashboardWidget {
  id: string;
  title: string;
  type: 'quick-actions' | 'recent-files' | 'favorites' | 'statistics' | 'recommendations';
  size: 'small' | 'medium' | 'large';
  data?: any;
  customizable?: boolean;
}

// 🏠 개인 통계 타입
interface PersonalStats {
  totalFiles: number;
  totalAnalyses: number;
  averageProcessingTime: number;
  accuracy: number;
  streak: number;
  level: number;
  experience: number;
  nextLevelExp: number;
}

// 🏠 개인화 대시보드 Props
interface PersonalDashboardProps {
  userId?: string;
  showWidgets?: string[];
  onWidgetClick?: (widgetId: string, data?: any) => void;
}

// 🏠 개인화 대시보드 컴포넌트
const PersonalDashboard: React.FC<PersonalDashboardProps> = ({
  userId = 'default',
  showWidgets = ['quick-actions', 'recent-files', 'favorites', 'statistics'],
  onWidgetClick
}) => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [personalStats, setPersonalStats] = useState<PersonalStats>({
    totalFiles: 0,
    totalAnalyses: 0,
    averageProcessingTime: 0,
    accuracy: 0,
    streak: 0,
    level: 1,
    experience: 0,
    nextLevelExp: 100
  });
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  // 🏠 사용자 데이터 로드
  useEffect(() => {
    loadPersonalData();
    initializeWidgets();
  }, [userId]);

  // 🏠 개인 데이터 로드
  const loadPersonalData = () => {
    const savedStats = localStorage.getItem(`personal-stats-${userId}`);
    if (savedStats) {
      setPersonalStats(JSON.parse(savedStats));
    } else {
      // 데모 데이터
      setPersonalStats({
        totalFiles: 12,
        totalAnalyses: 8,
        averageProcessingTime: 45,
        accuracy: 94.5,
        streak: 5,
        level: 2,
        experience: 340,
        nextLevelExp: 500
      });
    }
  };

  // 🏠 위젯 초기화
  const initializeWidgets = () => {
    const defaultWidgets: DashboardWidget[] = [
      {
        id: 'quick-actions',
        title: '빠른 시작',
        type: 'quick-actions',
        size: 'medium',
        customizable: true
      },
      {
        id: 'recent-files',
        title: '최근 작업',
        type: 'recent-files',
        size: 'medium',
        customizable: true
      },
      {
        id: 'favorites',
        title: '즐겨찾기',
        type: 'favorites',
        size: 'small',
        customizable: true
      },
      {
        id: 'statistics',
        title: '내 통계',
        type: 'statistics',
        size: 'large',
        customizable: true
      },
      {
        id: 'recommendations',
        title: '추천',
        type: 'recommendations',
        size: 'medium',
        customizable: true
      }
    ];

    setWidgets(defaultWidgets.filter(w => showWidgets.includes(w.type)));
  };

  // 🏠 빠른 액션 위젯
  const QuickActionsWidget = () => {
    const actions = [
      { 
        icon: <FileIcon />, 
        label: 'Excel 업로드', 
        color: 'primary', 
        onClick: () => onWidgetClick?.('upload') 
      },
      { 
        icon: <AnalyticsIcon />, 
        label: '분석 시작', 
        color: 'success', 
        onClick: () => onWidgetClick?.('analysis') 
      },
      { 
        icon: <CompareIcon />, 
        label: '견적 비교', 
        color: 'warning', 
        onClick: () => onWidgetClick?.('compare') 
      }
    ];

    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            ⚡ 빠른 시작
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            자주 사용하는 기능에 바로 접근하세요
          </Typography>
          
          <Grid container spacing={2}>
            {actions.map((action, index) => (
              <Grid item xs={4} key={index}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={action.icon}
                  onClick={action.onClick}
                  color={action.color as any}
                  sx={{ 
                    py: 2, 
                    flexDirection: 'column',
                    borderRadius: 3,
                    '&:hover': { 
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0, 148, 255, 0.2)'
                    }
                  }}
                >
                  <Typography variant="caption" sx={{ mt: 1 }}>
                    {action.label}
                  </Typography>
                </Button>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  };

  // 🏠 통계 위젯
  const StatisticsWidget = () => {
    const expProgress = (personalStats.experience / personalStats.nextLevelExp) * 100;

    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              📊 내 통계
            </Typography>
            <Chip 
              label={`Lv.${personalStats.level}`} 
              color="primary" 
              size="small"
              icon={<TrophyIcon />}
            />
          </Box>

          {/* 레벨 진행률 */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">경험치</Typography>
              <Typography variant="body2" color="text.secondary">
                {personalStats.experience}/{personalStats.nextLevelExp}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={expProgress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(0, 148, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: 'linear-gradient(90deg, #0094FF 0%, #00C851 100%)'
                }
              }}
            />
          </Box>

          {/* 주요 통계 */}
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  {personalStats.totalFiles}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  처리한 파일
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  {personalStats.accuracy}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  정확도
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="h4" fontWeight={700} color="warning.main">
                  {personalStats.averageProcessingTime}s
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  평균 처리 시간
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="h4" fontWeight={700} color="error.main">
                  {personalStats.streak}일
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  연속 사용일
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* 성취 배지 */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              🏆 성취 배지
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Tooltip title="첫 번째 파일 업로드">
                <Chip size="small" label="첫 걸음" icon={<TrophyIcon />} color="success" />
              </Tooltip>
              <Tooltip title="10개 파일 처리 완료">
                <Chip size="small" label="숙련자" icon={<SpeedIcon />} color="primary" />
              </Tooltip>
              <Tooltip title="95% 이상 정확도 달성">
                <Chip size="small" label="정확한 손" icon={<InsightIcon />} color="warning" />
              </Tooltip>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // 🏠 최근 파일 위젯
  const RecentFilesWidget = () => {
    const recentFiles = [
      { name: 'QWE_ASSY_견적서.xlsx', status: 'completed', time: '2분 전' },
      { name: '현대모비스_부품_비교.xlsx', status: 'in-progress', time: '5분 전' },
      { name: 'AAA_GARNISH_분석.xlsx', status: 'completed', time: '1시간 전' }
    ];

    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              📁 최근 작업
            </Typography>
            <Badge badgeContent={recentFiles.length} color="primary" />
          </Box>

          <List dense>
            {recentFiles.map((file, index) => (
              <ListItem 
                key={index}
                button
                sx={{ 
                  borderRadius: 2, 
                  mb: 1, 
                  '&:hover': { bgcolor: 'action.hover' } 
                }}
              >
                <ListItemIcon>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}>
                    <FileIcon />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight={500} noWrap>
                      {file.name}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        size="small"
                        label={file.status}
                        color={file.status === 'completed' ? 'success' : 'warning'}
                        variant="outlined"
                      />
                      <Typography variant="caption" color="text.secondary">
                        {file.time}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton size="small">
                    <MoreIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>

          <Button size="small" fullWidth sx={{ mt: 1 }}>
            전체 보기
          </Button>
        </CardContent>
      </Card>
    );
  };

  // 🏠 추천 위젯
  const RecommendationsWidget = () => {
    const recommendations = [
      {
        title: '분석 정확도 향상 팁',
        description: 'Excel 헤더를 명확하게 작성하면 90% 더 정확한 결과를 얻을 수 있어요!',
        action: '팁 보기',
        icon: <InsightIcon />
      },
      {
        title: 'Toss 테마 체험',
        description: '새로운 Toss 스타일 테마로 더 친근한 UI를 경험해보세요.',
        action: '테마 변경',
        icon: <StarIcon />
      }
    ];

    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            💡 추천
          </Typography>
          
          {recommendations.map((rec, index) => (
            <Box 
              key={index}
              sx={{ 
                p: 2, 
                mb: 2, 
                bgcolor: 'action.hover', 
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'info.light' }}>
                  {rec.icon}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    {rec.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {rec.description}
                  </Typography>
                  <Button size="small" variant="outlined">
                    {rec.action}
                  </Button>
                </Box>
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>
    );
  };

  // 🏠 위젯 렌더링
  const renderWidget = (widget: DashboardWidget) => {
    switch (widget.type) {
      case 'quick-actions':
        return <QuickActionsWidget />;
      case 'statistics':
        return <StatisticsWidget />;
      case 'recent-files':
        return <RecentFilesWidget />;
      case 'recommendations':
        return <RecommendationsWidget />;
      default:
        return <div>Unknown widget</div>;
    }
  };

  // 🏠 그리드 크기 매핑
  const getGridSize = (size: string) => {
    switch (size) {
      case 'small': return 4;
      case 'medium': return 6;
      case 'large': return 12;
      default: return 6;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        안녕하세요! 👋
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        오늘도 효율적인 견적서 분석을 시작해볼까요?
      </Typography>

      <Grid container spacing={3}>
        {widgets.map((widget) => (
          <Grid item xs={12} md={getGridSize(widget.size)} key={widget.id}>
            {renderWidget(widget)}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PersonalDashboard;