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
  Box, Card, CardContent, Typography, Grid, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  summaryCards, workItems, verificationStatus, recentItems, statusColorMap,
} from './data/dashboardData';
import { useDashboardPage } from './hooks/useDashboardPage';

const DashboardPage: React.FC = () => {
  // 🎛️ 대시보드 상태 관리 (페이지 네비게이션, 기간 필터)
  const { navigate, period, setPeriod } = useDashboardPage();

  return (
    <Box sx={{ p: 3 }}>
      
      {/* 📋 상단 헤더 + 기간 필터 영역 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
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
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={7}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 2 }}>내가 해야할 작업</Typography>
          <Paper sx={{ p: 2, borderRadius: 2, height: 250 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
              {workItems.map((item) => (
                <Card key={item.status}
                  sx={{ cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: 4, bgcolor: `${item.color}10` }, border: `2px solid ${item.color}30` }}
                  onClick={() => navigate(`/parsing?filter=${item.filter}`)}>
                  <CardContent sx={{ textAlign: 'center', py: 1.5, px: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Typography fontSize={16} sx={{ mb: 0.3 }}>{item.icon}</Typography>
                    <Typography variant="h5" fontWeight={700} sx={{ color: item.color, mb: 0.3 }}>{item.count}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: 11 }}>{item.label}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 2 }}>최근 검증 현황</Typography>
          <Paper sx={{ p: 2, borderRadius: 2, height: 250 }}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={verificationStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value"
                  label={({ name, value }) => `${name} ${value}%`}>
                  {verificationStatus.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* 최근 작업 목록 */}
      <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 2 }}>최근 작업 목록</Typography>
      <Paper sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                <TableCell>파일명</TableCell>
                <TableCell>업체명</TableCell>
                <TableCell>상태</TableCell>
                <TableCell align="right">항목수</TableCell>
                <TableCell align="right">재료비</TableCell>
                <TableCell align="right">가공비</TableCell>
                <TableCell align="right">제경비</TableCell>
                <TableCell align="right">생산원가</TableCell>
                <TableCell align="right">이상치</TableCell>
                <TableCell>날짜</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentItems.map((row) => (
                <TableRow key={row.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate('/parsing')}>
                  <TableCell>{row.filename}</TableCell>
                  <TableCell>{row.company}</TableCell>
                  <TableCell><Chip label={row.status} color={statusColorMap[row.status] || 'default'} size="small" /></TableCell>
                  <TableCell align="right">{row.items || '-'}</TableCell>
                  <TableCell align="right">₩{row.materialCost ? (row.materialCost / 1000).toFixed(1) + 'K' : '-'}</TableCell>
                  <TableCell align="right">₩{row.processCost ? (row.processCost / 1000).toFixed(1) + 'K' : '-'}</TableCell>
                  <TableCell align="right">₩{row.overheadCost ? (row.overheadCost / 1000).toFixed(1) + 'K' : '-'}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>₩{row.totalCost ? (row.totalCost / 1000).toFixed(1) + 'K' : '-'}</TableCell>
                  <TableCell align="right">
                    {row.anomalies > 0
                      ? <Chip label={`${row.anomalies}건`} color="warning" size="small" />
                      : <Chip label="정상" color="success" size="small" />}
                  </TableCell>
                  <TableCell>{row.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default DashboardPage;
