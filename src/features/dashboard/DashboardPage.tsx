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
  Box, Card, CardContent, Typography, Grid, Paper, Chip, ToggleButtonGroup, ToggleButton, Button,
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  summaryCards, workItems, verificationStatus, actionAlerts,
} from './data/dashboardData';
import { useDashboardPage } from './hooks/useDashboardPage';
import styles from './DashboardPage.module.css';

const DashboardPage: React.FC = () => {
  // 🎛️ 대시보드 상태 관리 (페이지 네비게이션, 기간 필터)
  const { navigate, period, setPeriod } = useDashboardPage();

  return (
    <Box className={styles.root}>

      {/* 📋 상단 헤더 + 기간 필터 영역 */}
      <Box className={styles.header}>
        {/* 📊 페이지 제목 */}
        <Typography variant="h5" fontWeight={700}>
          견적서 분석 현황
        </Typography>

        {/* 📅 기간 선택 토글 버튼 그룹 */}
        <ToggleButtonGroup
          value={period}                                    // 현재 선택된 기간
          exclusive                                         // 하나만 선택 가능
          onChange={(_, v) => v && setPeriod(v)}           // 기간 변경 핸들러
          size="small"
        >
          <ToggleButton value="1w">1주</ToggleButton>       {/* 1주일 */}
          <ToggleButton value="1m">1개월</ToggleButton>     {/* 1개월 */}
          <ToggleButton value="3m">3개월</ToggleButton>     {/* 3개월 */}
          <ToggleButton value="all">전체</ToggleButton>      {/* 전체 기간 */}
        </ToggleButtonGroup>
      </Box>

      {/* 📊 상단 요약 카드 영역 (총 견적서, 검증완료율, 이상치, 평균원가) */}
      <Grid container spacing={2} className={styles.summaryGrid}>
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
              <CardContent className={styles.summaryCardContent}>
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
                <Typography className={styles.summaryCardIcon}>{card.icon}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 차트 영역 */}
      <Grid container spacing={2} className={styles.chartGrid}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom className={styles.sectionTitle}>내가 해야할 작업</Typography>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Box className={styles.workItemsGrid}>
              {workItems.map((item) => (
                <Card key={item.status}
                  className={styles.workCard}
                  sx={{
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: 4, bgcolor: `${item.color}10` },
                    border: `2px solid ${item.color}30`,
                  }}
                  onClick={() => navigate(`/parsing_card?filter=${item.filter}`)}>
                  <CardContent className={styles.workCardContent} sx={{ py: 1.25, px: 1, '&:last-child': { pb: 1.25 } }}>
                    <Typography className={styles.workCardIcon} sx={{ mb: 0.25 }}>{item.icon}</Typography>
                    <Typography variant="h5" fontWeight={700} sx={{ color: item.color, mb: 0.25 }}>
                      {item.count}
                    </Typography>
                    <Typography className={styles.workCardLabel} sx={{ color: 'text.secondary' }}>
                      {item.label}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom className={styles.sectionTitle}>최근 검증 현황</Typography>
          <Paper className={styles.chartPaper} sx={{ p: 2.5, borderRadius: 2 }}>
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
            <Box className={styles.chartLegend}>
              {verificationStatus.map((item) => (
                <Box key={item.name} className={styles.legendItem}>
                  <Box className={styles.legendDot} sx={{ bgcolor: item.color }} />
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
      <Box className={styles.alertHeader}>
        <Typography variant="subtitle1" fontWeight={600}>업무 알림 & 액션 센터</Typography>
        <Chip
          label={`${actionAlerts.filter(a => a.priority === '긴급').length}건 긴급`}
          color="error"
          size="small"
          className={styles.alertChip}
        />
      </Box>
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {actionAlerts.map((item, idx) => (
          <Box
            key={item.id}
            className={styles.alertItem}
            sx={{
              px: 2.5,
              py: 1.75,
              borderBottom: idx < actionAlerts.length - 1 ? '1px solid #f0f0f0' : 'none',
              borderLeft: `4px solid ${
                item.priorityColor === 'error' ? '#f44336'
                  : item.priorityColor === 'warning' ? '#ff9800'
                  : '#2196f3'
              }`,
            }}
            onClick={() => navigate(item.route)}
          >
            {/* 아이콘 */}
            <Typography className={styles.alertIcon}>{item.icon}</Typography>

            {/* 본문 */}
            <Box className={styles.alertBody}>
              <Box className={styles.alertTitleRow} sx={{ mb: 0.4 }}>
                <Chip
                  label={item.priority}
                  color={item.priorityColor}
                  size="small"
                  className={styles.alertPriorityChip}
                />
                <Typography variant="body2" fontWeight={600} noWrap>{item.title}</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" noWrap>
                {item.filename} · {item.company} &nbsp;—&nbsp; {item.description}
              </Typography>
            </Box>

            {/* 우측: 시간 + 액션 버튼 */}
            <Box className={styles.alertRight}>
              <Typography variant="caption" color="text.secondary" className={styles.alertTime}>
                {item.time}
              </Typography>
              <Button
                size="small"
                variant={item.priorityColor === 'error' ? 'contained' : 'outlined'}
                color={item.priorityColor}
                className={styles.alertActionBtn}
                sx={{
                  px: 1.5,
                  py: 0.4,
                  minWidth: 72,
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
