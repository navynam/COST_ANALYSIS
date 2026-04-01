/**
 * @fileoverview ④ 견적서 비교 페이지
 * @description Analysis 표준 그리드 기반 견적서별 상세 비교
 */
import React, { useState } from 'react';
import {
  Box, Typography, Paper, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Checkbox, FormControlLabel, FormGroup, Stepper, Step, StepLabel,
  Dialog, DialogTitle, DialogContent, TextField, IconButton,
  Popover, Divider,
} from '@mui/material';
import { NavigateNext, SwapHoriz, Search, Close } from '@mui/icons-material';
import { mockProducts } from './data/mockData';
import { useQuotationComparison } from './hooks/useQuotationComparison';

const QuotationComparisonPage: React.FC = () => {
  const {
    navigate,
    selectedProduct, setSelectedProduct,
    selectedQuotations,
    searchOpen, setSearchOpen,
    searchQuery, setSearchQuery,
    quotations, selectionStep,
    toggleQuotation, resetSelection, filteredProducts,
    showComparison, startComparison,
  } = useQuotationComparison();

  // 계산식 비교 팝업 상태
  const [calculationPopover, setCalculationPopover] = useState<{
    anchorEl: HTMLElement;
    itemData: any;
  } | null>(null);

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={700} color="#003875" sx={{ mb: 0.5 }}>견적서 비교</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        아이템 선택 → 견적서 복수 선택(최대 4개) → 나란히 비교
      </Typography>

      {/* 스텝 표시 */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Stepper activeStep={selectionStep} alternativeLabel>
          <Step><StepLabel>아이템 선택</StepLabel></Step>
          <Step><StepLabel>견적서 선택 (2~4개)</StepLabel></Step>
          <Step><StepLabel>비교 결과</StepLabel></Step>
        </Stepper>
      </Paper>

      {/* Step 1: 아이템 선택 */}
      {!selectedProduct && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>1️⃣ 비교할 아이템을 선택하세요</Typography>
          <Button variant="contained" size="large" startIcon={<Search />}
            sx={{ bgcolor: '#003875', px: 4, py: 1.5, fontSize: 16 }}
            onClick={() => { setSearchOpen(true); setSearchQuery(''); }}>
            아이템 검색
          </Button>

          <Dialog open={searchOpen} onClose={() => setSearchOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#003875', color: '#fff' }}>
              아이템 검색
              <IconButton onClick={() => setSearchOpen(false)} sx={{ color: '#fff' }}><Close /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: '16px !important' }}>
              <TextField fullWidth placeholder="아이템 코드 또는 품명으로 검색" variant="outlined" size="small"
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)} autoFocus
                sx={{ mb: 2 }} InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.disabled' }} /> }} />
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>아이템코드</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>품명</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>재질</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>견적서 수</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredProducts.map(p => (
                      <TableRow key={p.id} hover sx={{ cursor: 'pointer' }}
                        onClick={() => { setSelectedProduct(p.id); setSearchOpen(false); }}>
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.id}</TableCell>
                        <TableCell>{p.name}</TableCell>
                        <TableCell><Chip label={p.material} size="small" variant="outlined" /></TableCell>
                        <TableCell align="center"><Chip label={`${p.quotationCount}건`} size="small" color="primary" variant="outlined" /></TableCell>
                      </TableRow>
                    ))}
                    {filteredProducts.length === 0 && (
                      <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.disabled' }}>검색 결과가 없습니다</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>
          </Dialog>
        </Box>
      )}

      {/* Step 2: 견적서 복수 선택 */}
      {selectedProduct && selectionStep < 2 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700}>2️⃣ 비교할 견적서를 선택하세요 (2~4개)</Typography>
            <Button size="small" variant="text" onClick={resetSelection}>← 아이템 다시 선택</Button>
          </Box>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              선택된 아이템: <strong>{mockProducts.find(p => p.id === selectedProduct)?.name}</strong>
            </Typography>
            <FormGroup>
              {quotations.map(q => {
                const isChecked = selectedQuotations.includes(q.id);
                const isDisabled = !isChecked && selectedQuotations.length >= 4;
                
                return (
                  <FormControlLabel key={q.id}
                    control={<Checkbox 
                      checked={isChecked} 
                      onChange={() => toggleQuotation(q.id)}
                      disabled={isDisabled}
                    />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: isDisabled ? 0.5 : 1 }}>
                        <Typography variant="body2" fontWeight={600}>{q.vendor}</Typography>
                        <Chip label={q.date} size="small" variant="outlined" sx={{ fontSize: 11 }} />
                        {isDisabled && <Chip label="최대 4개" size="small" color="warning" sx={{ fontSize: 10 }} />}
                      </Box>
                    }
                  />
                );
              })}
            </FormGroup>
            
            {selectedQuotations.length < 2 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                💡 비교하려면 최소 2개 이상 선택해주세요
              </Typography>
            )}
            
            {selectedQuotations.length >= 4 && (
              <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
                ⚠️ 최대 4개까지만 선택 가능합니다
              </Typography>
            )}
            {selectedQuotations.length >= 2 && (
              <Button 
                variant="contained" 
                size="large"
                sx={{ mt: 2, bgcolor: '#003875', px: 4, py: 1.5 }}
                startIcon={<SwapHoriz />}
                onClick={startComparison}
              >
                {selectedQuotations.length}개 견적서 비교 시작
              </Button>
            )}
          </Paper>
        </Box>
      )}

      {/* Step 3: 견적서 상세 비교 - Analysis 표준 그리드 기반 */}
      {selectionStep >= 2 && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700}>3️⃣ 견적서 상세 비교</Typography>
            <Button size="small" variant="text" onClick={resetSelection}>← 다시 선택</Button>
            <Chip label={`${selectedQuotations.length}개 견적서 비교`} size="small" color="primary" />
          </Box>

          {/* 총원가 요약 */}
          <Paper sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: '#f0f4ff' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>💰 총 생산원가 비교</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${selectedQuotations.length}, 1fr)`, gap: 2 }}>
              {selectedQuotations.map((qid, idx) => {
                const q = quotations.find(qq => qq.id === qid)!;
                const total = 76800 + (idx * 3200); // mock data
                const isLowest = idx === 0;
                return (
                  <Paper key={qid} sx={{ p: 2, textAlign: 'center', border: isLowest ? '2px solid #1976d2' : '1px solid #e0e0e0' }}>
                    <Typography variant="caption" color="text.secondary">{q.vendor}</Typography>
                    <Typography variant="h5" fontWeight={700} color={isLowest ? '#1976d2' : 'text.primary'}>
                      ₩{total.toLocaleString()}
                    </Typography>
                    {isLowest && <Chip label="최저가" size="small" color="primary" sx={{ mt: 0.5 }} />}
                  </Paper>
                );
              })}
            </Box>
          </Paper>

          {/* 재료비 상세 비교 */}
          <Paper sx={{ mb: 3, borderRadius: 2 }}>
            <Box sx={{ p: 2, bgcolor: '#e8f4fd', borderRadius: '8px 8px 0 0' }}>
              <Typography variant="subtitle2" fontWeight={700} color="#003875">Ⅰ. 재료비 비교</Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#fafafa' }}>
                    <TableCell sx={{ fontWeight: 700, width: 120 }}>구분</TableCell>
                    <TableCell sx={{ fontWeight: 700, width: 200 }}>품명</TableCell>
                    <TableCell sx={{ fontWeight: 700, width: 120 }}>규격</TableCell>
                    <TableCell sx={{ fontWeight: 700, width: 60 }}>단위</TableCell>
                    <TableCell sx={{ fontWeight: 700, width: 60 }}>수량</TableCell>
                    {selectedQuotations.map(qid => {
                      const q = quotations.find(qq => qq.id === qid)!;
                      return (
                        <TableCell key={qid} align="right" sx={{ fontWeight: 700, color: '#003875', width: 100 }}>
                          {q.vendor}
                        </TableCell>
                      );
                    })}
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#f44336', width: 80 }}>차이</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { category: '원자재', name: 'SUBSTRATE (기재)', spec: '1200×800×3T', unit: 'EA', qty: 1, prices: [18500, 19200, 17800, 18900] },
                    { category: '원자재', name: 'SKIN (표피재)', spec: 'PVC 0.8mm', unit: 'M²', qty: 1.2, prices: [18917, 22500, 19800, 21200] },
                    { category: '원자재', name: 'ADHESIVE (접착제)', spec: 'WATER BASE', unit: 'KG', qty: 0.5, prices: [4400, 4200, 4600, 4500] },
                    { category: '부자재', name: 'CLIP', spec: 'PA66', unit: 'EA', qty: 12, prices: [75, 80, 70, 78] },
                    { category: '부자재', name: 'PACKING (포장재)', spec: '골판지', unit: 'SET', qty: 1, prices: [900, 1000, 850, 950] },
                  ].map((item, idx) => {
                    const amounts = item.prices.slice(0, selectedQuotations.length).map(p => p * item.qty);
                    const minAmount = Math.min(...amounts);
                    const maxAmount = Math.max(...amounts);
                    const diffPct = minAmount > 0 ? ((maxAmount - minAmount) / minAmount * 100).toFixed(1) : '0';
                    
                    return (
                      <TableRow key={idx} hover>
                        <TableCell>{item.category}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{item.name}</TableCell>
                        <TableCell>{item.spec}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>{item.qty}</TableCell>
                        {selectedQuotations.map((qid, qIdx) => {
                          const amount = (item.prices[qIdx] || 0) * item.qty;
                          const isMin = amount === minAmount;
                          const isMax = amount === maxAmount;
                          return (
                            <TableCell key={qid} align="right" sx={{ 
                              fontFamily: 'monospace', 
                              fontWeight: 600,
                              bgcolor: isMin ? '#e8f5e8' : isMax ? '#ffebee' : undefined
                            }}>
                              ₩{amount.toLocaleString()}
                            </TableCell>
                          );
                        })}
                        <TableCell align="center">
                          <Chip 
                            label={`${diffPct}%`} 
                            size="small" 
                            color={Number(diffPct) > 20 ? 'error' : Number(diffPct) > 10 ? 'warning' : 'success'}
                            variant="outlined"
                            onClick={(e) => setCalculationPopover({
                              anchorEl: e.currentTarget,
                              itemData: { ...item, amounts, diffPct, type: 'material' }
                            })}
                            sx={{ cursor: 'pointer', '&:hover': { transform: 'scale(1.1)' } }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* 가공비 비교 */}
          <Paper sx={{ mb: 3, borderRadius: 2 }}>
            <Box sx={{ p: 2, bgcolor: '#e8fde8', borderRadius: '8px 8px 0 0' }}>
              <Typography variant="subtitle2" fontWeight={700} color="#2e7d32">Ⅱ. 가공비 비교</Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#fafafa' }}>
                    <TableCell sx={{ fontWeight: 700 }}>공정</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>공정명</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>단위</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>수량</TableCell>
                    {selectedQuotations.map(qid => {
                      const q = quotations.find(qq => qq.id === qid)!;
                      return <TableCell key={qid} align="right" sx={{ fontWeight: 700, color: '#2e7d32' }}>{q.vendor}</TableCell>;
                    })}
                    <TableCell align="center" sx={{ fontWeight: 700 }}>차이</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { process: '성형', name: '프레스 성형', unit: '회', qty: 1, amounts: [8500, 9000, 8200, 8800] },
                    { process: '접착', name: '접착 공정', unit: '회', qty: 1, amounts: [6200, 6500, 5900, 6300] },
                    { process: '후처리', name: '트리밍', unit: '회', qty: 1, amounts: [5400, 5800, 5200, 5600] },
                    { process: '검사', name: '검사/포장', unit: '회', qty: 1, amounts: [3000, 3200, 2900, 3100] },
                  ].map((item, idx) => {
                    const amounts = item.amounts.slice(0, selectedQuotations.length);
                    const minAmount = Math.min(...amounts);
                    const maxAmount = Math.max(...amounts);
                    const diffPct = minAmount > 0 ? ((maxAmount - minAmount) / minAmount * 100).toFixed(1) : '0';
                    
                    return (
                      <TableRow key={idx} hover>
                        <TableCell>{item.process}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{item.name}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>{item.qty}</TableCell>
                        {amounts.map((amount, qIdx) => {
                          const isMin = amount === minAmount;
                          const isMax = amount === maxAmount;
                          return (
                            <TableCell key={qIdx} align="right" sx={{ 
                              fontFamily: 'monospace', 
                              fontWeight: 600,
                              bgcolor: isMin ? '#e8f5e8' : isMax ? '#ffebee' : undefined
                            }}>
                              ₩{amount.toLocaleString()}
                            </TableCell>
                          );
                        })}
                        <TableCell align="center">
                          <Chip 
                            label={`${diffPct}%`} 
                            size="small" 
                            color={Number(diffPct) > 15 ? 'error' : Number(diffPct) > 8 ? 'warning' : 'success'}
                            variant="outlined"
                            onClick={(e) => setCalculationPopover({
                              anchorEl: e.currentTarget,
                              itemData: { ...item, amounts, diffPct, type: 'process' }
                            })}
                            sx={{ cursor: 'pointer', '&:hover': { transform: 'scale(1.1)' } }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* 차이 분석 및 제언 */}
          <Paper sx={{ p: 3, borderRadius: 2, bgcolor: '#fff8e1' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: '#ef6c00' }}>
              🔍 견적서 차이 분석 및 제언
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#d32f2f' }}>
                  ⚠️ 주요 차이점
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                  <li>SKIN 표피재: 최대 26% 단가 차이 (₩18,917 ~ ₩22,500)</li>
                  <li>성형공정비: 협력사별 설비 효율성 차이로 9.8% 격차</li>
                  <li>포장재: 골판지 규격 차이로 인한 단가 변동</li>
                </Box>
              </Box>
              
              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#1976d2' }}>
                  💡 비용 최적화 제언
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                  <li>SKIN 표피재: 대한(주) 단가로 통일 시 ₩4,300 절약 가능</li>
                  <li>성형공정: 현대플라스틱 설비 활용 검토</li>
                  <li>종합 최저가 조합: ₩74,200 (현재 대비 ₩2,600 절약)</li>
                </Box>
              </Box>
            </Box>

            <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                📋 누락 데이터 및 확인 필요 사항
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2, fontSize: 12 }}>
                <li>현대시트: 제경비 세부 내역 미제출</li>
                <li>모비스파츠: 품질보증비 항목 누락</li>
                <li>전체: 운송비 및 설치비 별도 확인 필요</li>
              </Box>
            </Box>
          </Paper>
        </>
      )}

      {/* 계산식 비교 팝업 */}
      <Popover
        open={!!calculationPopover}
        anchorEl={calculationPopover?.anchorEl}
        onClose={() => setCalculationPopover(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        {calculationPopover && (
          <Paper 
            sx={{ 
              maxWidth: 500, 
              bgcolor: '#fff', 
              borderRadius: '12px', 
              border: '1px solid #e5e5e7', 
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              overflow: 'hidden',
              cursor: 'pointer'
            }}
            onClick={(e) => {
              // 내부 요소 클릭 시 이벤트 버블링 방지
              if (e.target === e.currentTarget) {
                setCalculationPopover(null);
              }
            }}
          >
            {/* Header */}
            <Box sx={{ 
              bgcolor: '#0071e3', 
              color: '#fff', 
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
                🧮 견적서별 계산식 비교
              </Typography>
            </Box>

            {/* Content */}
            <Box sx={{ p: 3 }}>
              {/* 항목 정보 */}
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: 12, color: '#86868b', mb: 1 }}>
                  {calculationPopover.itemData.type === 'material' ? '재료비' : '가공비'} &gt; {calculationPopover.itemData.category || calculationPopover.itemData.process}
                </Typography>
                <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#1d1d1f', mb: 0.5 }}>
                  {calculationPopover.itemData.name}
                </Typography>
                {calculationPopover.itemData.spec && (
                  <Typography sx={{ fontSize: 12, color: '#86868b' }}>
                    규격: {calculationPopover.itemData.spec}
                  </Typography>
                )}
              </Box>

              {/* 견적서별 계산식 */}
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#0071e3', mb: 2 }}>
                💰 견적서별 계산 과정
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {selectedQuotations.map((qid, idx) => {
                  const q = quotations.find(qq => qq.id === qid)!;
                  const amount = calculationPopover.itemData.amounts[idx];
                  const isMin = amount === Math.min(...calculationPopover.itemData.amounts);
                  const isMax = amount === Math.max(...calculationPopover.itemData.amounts);
                  
                  return (
                    <Box key={qid} sx={{ 
                      p: 2, 
                      borderRadius: '8px',
                      border: `2px solid ${isMin ? '#1976d2' : isMax ? '#f44336' : '#e0e0e0'}`,
                      bgcolor: isMin ? '#e3f2fd' : isMax ? '#ffebee' : '#f8f9fa'
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1d1d1f' }}>
                          {q.vendor}
                        </Typography>
                        {isMin && <Chip label="최저" size="small" color="primary" />}
                        {isMax && <Chip label="최고" size="small" color="error" />}
                      </Box>
                      
                      {calculationPopover.itemData.type === 'material' ? (
                        <Box>
                          <Typography sx={{ fontSize: 12, color: '#86868b', mb: 1 }}>
                            계산식: 수량 × 단가
                          </Typography>
                          <Typography sx={{ 
                            fontSize: 14, 
                            fontFamily: 'monospace', 
                            fontWeight: 700,
                            color: isMin ? '#1976d2' : isMax ? '#f44336' : '#1d1d1f'
                          }}>
                            {calculationPopover.itemData.qty} {calculationPopover.itemData.unit} × ₩{calculationPopover.itemData.prices[idx]?.toLocaleString()} = ₩{amount.toLocaleString()}
                          </Typography>
                        </Box>
                      ) : (
                        <Box>
                          <Typography sx={{ fontSize: 12, color: '#86868b', mb: 1 }}>
                            공정비 (일괄)
                          </Typography>
                          <Typography sx={{ 
                            fontSize: 14, 
                            fontFamily: 'monospace', 
                            fontWeight: 700,
                            color: isMin ? '#1976d2' : isMax ? '#f44336' : '#1d1d1f'
                          }}>
                            ₩{amount.toLocaleString()}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>

              {/* 차이 분석 */}
              <Box sx={{ 
                mt: 3, 
                p: 2, 
                bgcolor: '#fff5f5', 
                border: '1px solid #f443364d',
                borderRadius: '8px' 
              }}>
                <Typography sx={{ 
                  fontSize: 12, 
                  fontWeight: 600, 
                  color: '#f44336', 
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}>
                  📊 차이 분석
                </Typography>
                <Typography sx={{ fontSize: 12, color: '#f44336' }}>
                  최고가와 최저가 차이: {calculationPopover.itemData.diffPct}%
                </Typography>
                <Typography sx={{ fontSize: 11, color: '#86868b', mt: 0.5 }}>
                  절약 가능 금액: ₩{(Math.max(...calculationPopover.itemData.amounts) - Math.min(...calculationPopover.itemData.amounts)).toLocaleString()}
                </Typography>
              </Box>

              {/* Footer */}
              <Typography 
                sx={{ 
                  fontSize: 10, 
                  color: '#86868b', 
                  textAlign: 'center',
                  mt: 2,
                  pt: 1,
                  borderTop: '1px solid #e5e5e7',
                  cursor: 'pointer',
                  '&:hover': {
                    color: '#0071e3',
                    textDecoration: 'underline'
                  }
                }}
                onClick={() => setCalculationPopover(null)}
              >
                클릭하여 닫기
              </Typography>
            </Box>
          </Paper>
        )}
      </Popover>
    </Box>
  );
};

export default QuotationComparisonPage;