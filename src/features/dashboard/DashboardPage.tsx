/**
 * 📊 대시보드 페이지 (메인 홈 화면)
 * 
 * 🎯 주요 기능:
 * 1. 견적서 처리 현황을 한눈에 파악할 수 있는 요약 카드들
 * 2. 내가 처리해야 할 작업 목록 (대기, 검증, 분석, 실패)
 * 3. 최근 검증 결과를 도넛 차트로 시각화
 * 4. 최근 작업한 견적서들의 상세 목록 테이블
 * 5. 기간별 필터링 (1주/1개월/3개월/전체)
 * 
 * 📐 레이아웃 구조:
 * ┌─────────────────────────────────────────────────────────┐
 * │ [제목]                           [기간 필터] 1주 1개월 3개월 │
 * ├─────────────────────────────────────────────────────────┤
 * │ [📄 총견적서] [✅ 검증완료율] [⚠️ 이상치] [💰 평균원가]  │  
 * ├───────────────────────────┬─────────────────────────────┤
 * │ [내가 해야할 작업]           │ [최근 검증 현황]             │
 * │ □ 추출대기 □ 검증대기      │    도넛 차트               │
 * │ □ 분석대기 □ 처리실패      │ 통과 68% / 경고 20% / 오류 12% │
 * ├───────────────────────────┴─────────────────────────────┤
 * │ [최근 작업 목록 테이블]                               │
 * │ 파일명 | 업체명 | 상태 | 재료비 | 가공비 | 제경비 ...     │
 * └─────────────────────────────────────────────────────────┘
 * 
 * 🔗 페이지 연동:
 * - 작업 카드 클릭 → 파싱 페이지 (해당 상태로 필터링)
 * - 테이블 행 클릭 → 파싱 페이지로 이동
 * 
 * 💾 데이터 소스:
 * - summaryCards: 상단 4개 요약 카드 데이터
 * - workItems: 내 작업 4개 카드 데이터
 * - verificationStatus: 도넛 차트 데이터 (통과/경고/오류)
 * - recentItems: 최근 작업 목록 테이블 데이터
 */
import React from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Paper, Chip, Button,
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  summaryCards, workItems, verificationStatus, actionAlerts,
} from './data/dashboardData';
import { useDashboardPage } from './hooks/useDashboardPage';
import styles from './DashboardPage.module.css';

const DashboardPage: React.FC = () => {
  // 🎛️ 대시보드 상태 관리 (페이지 네비게이션, 기간 필터)
  const { navigate } = useDashboardPage();

  return (
    <Box sx={{ p: 3 }}>
      
      {/* 📊 상단 요약 카드 영역 (총 견적서, 검증완료율, 이상치, 평균원가) */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {summaryCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            {/* 💳 개별 요약 카드 */}
            <Card sx={{ 
              bgcolor: card.color,                          // 카드별 배경색 (빨강, 파랑, 노랑, 초록)
              color: '#fff',                               // 흰 텍스트
              borderRadius: 2,                             // 둥근 모서리
              '&:hover': {                                 // 마우스 호버 효과
                transform: 'translateY(-2px)',             // 위로 2px 이동
                boxShadow: 4                               // 그림자 강화
              }, 
              transition: 'all 0.2s'                       // 부드러운 애니메이션
            }}>
              <CardContent sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',           // 좌우 정렬
                alignItems: 'center' 
              }}>
                {/* 📈 좌측: 텍스트 정보 */}
                <Box>
                  {/* 카드 라벨 (예: "총 견적서") */}
                  <Typography variant="body2" sx={{ opacity: 0.85 }}>
                    {card.label}
                  </Typography>
                  {/* 카드 값 (예: "47건") */}
                  <Typography variant="h4" fontWeight={700}>
                    {card.value}
                  </Typography>
                </Box>
                
                {/* 🎨 우측: 아이콘 (📄, ✅, ⚠️, 💰) */}
                <Typography fontSize={40}>{card.icon}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 차트 영역 */}
      <Grid container spacing={2} sx={{ mb: 4 }} alignItems="stretch">
        <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 2 }}>내가 해야할 작업</Typography>
          <Paper sx={{ p: 2.5, borderRadius: 2, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'center' }}>
              {workItems.map((item) => (
                <Card key={item.status}
                  sx={{
                    flex: 1, maxWidth: 130,
                    cursor: 'pointer', transition: 'all 0.2s',
                    '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 6px 16px ${item.color}30` },
                    border: `1.5px solid ${item.color}30`,
                    borderRadius: '12px',
                    boxShadow: 'none',
                  }}
                  onClick={() => navigate(`/parsing_card?filter=${item.filter}`)}>
                  <CardContent sx={{ textAlign: 'center', py: 2, px: 1.5, '&:last-child': { pb: 2 } }}>
                    <Typography fontSize={22} sx={{ mb: 0.5 }}>{item.icon}</Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ color: item.color, mb: 0.5, lineHeight: 1 }}>
                      {item.count}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 600 }}>
                      {item.label}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 2 }}>최근 검증 현황</Typography>
          <Paper sx={{ p: 2.5, borderRadius: 2, flex: 1, display: 'flex', alignItems: 'center' }}>
            {/* 도넛 차트 */}
            <ResponsiveContainer width="55%" height={190}>
              <PieChart>
                <Pie
                  data={verificationStatus}
                  cx="50%" cy="50%"
                  innerRadius={52} outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {verificationStatus.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value}%`, '']} />
              </PieChart>
            </ResponsiveContainer>
            {/* 우측 범례 */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pl: 2 }}>
              {verificationStatus.map((item) => (
                <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.color, flexShrink: 0 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ lineHeight: 1.2 }}>{item.name}</Typography>
                    <Typography variant="h6" fontWeight={700} sx={{ color: item.color, lineHeight: 1.2 }}>{item.value}%</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* 업무 알림 & 액션 센터 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={600}>업무 알림 & 액션 센터</Typography>
        <Chip
          label={`${actionAlerts.filter(a => a.priority === '긴급').length}건 긴급`}
          color="error"
          size="small"
          sx={{ fontWeight: 600 }}
        />
      </Box>
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {actionAlerts.map((item, idx) => (
          <Box
            key={item.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              px: 2.5,
              py: 1.75,
              borderBottom: idx < actionAlerts.length - 1 ? '1px solid #f0f0f0' : 'none',
              borderLeft: `4px solid ${
                item.priorityColor === 'error' ? '#f44336'
                  : item.priorityColor === 'warning' ? '#ff9800'
                  : '#2196f3'
              }`,
              '&:hover': { bgcolor: '#fafafa' },
              transition: 'background 0.15s',
              cursor: 'pointer',
            }}
            onClick={() => navigate(item.route)}
          >
            {/* 아이콘 */}
            <Typography fontSize={22} sx={{ lineHeight: 1, flexShrink: 0 }}>{item.icon}</Typography>

            {/* 본문 */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.4 }}>
                <Chip
                  label={item.priority}
                  color={item.priorityColor}
                  size="small"
                  sx={{ fontWeight: 700, fontSize: 10, height: 20 }}
                />
                <Typography variant="body2" fontWeight={600} noWrap>{item.title}</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" noWrap>
                {item.filename} · {item.company} &nbsp;—&nbsp; {item.description}
              </Typography>
            </Box>

            {/* 우측: 시간 + 액션 버튼 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
              <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                {item.time}
              </Typography>
              <Button
                size="small"
                variant={item.priorityColor === 'error' ? 'contained' : 'outlined'}
                color={item.priorityColor}
                sx={{
                  whiteSpace: 'nowrap',
                  fontSize: 11,
                  px: 1.5,
                  py: 0.4,
                  minWidth: 72,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
                onClick={(e) => { e.stopPropagation(); navigate(item.route); }}
              >
                {item.action}
              </Button>
            </Box>
          </Box>
        ))}
      </Paper>
    </Box>
  );
};

export default DashboardPage;
