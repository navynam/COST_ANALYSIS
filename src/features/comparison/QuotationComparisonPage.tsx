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
  Popover,
} from '@mui/material';
import { SwapHoriz, Search, Close } from '@mui/icons-material';
import { mockProducts } from './data/mockData';
import { useQuotationComparison } from './hooks/useQuotationComparison';
import styles from './QuotationComparisonPage.module.css';

const QuotationComparisonPage: React.FC = () => {
  const {
    selectedProduct, setSelectedProduct,
    selectedQuotations,
    searchOpen, setSearchOpen,
    searchQuery, setSearchQuery,
    quotations, selectionStep,
    toggleQuotation, resetSelection, filteredProducts,
    startComparison,
  } = useQuotationComparison();

  // 계산식 비교 팝업 상태
  const [calculationPopover, setCalculationPopover] = useState<{
    anchorEl: HTMLElement;
    itemData: any;
  } | null>(null);

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h5" className={styles.pageTitle} sx={{ mb: 0.5 }}>견적서 비교</Typography>
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
            <DialogTitle className={styles.dialogTitle}>
              아이템 검색
              <IconButton onClick={() => setSearchOpen(false)} className={styles.dialogCloseBtn}><Close /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: '16px !important' }}>
              <TextField fullWidth placeholder="아이템 코드 또는 품명으로 검색" variant="outlined" size="small"
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)} autoFocus
                sx={{ mb: 2 }} InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.disabled' }} /> }} />
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell className={styles.tableHeaderCell}>아이템코드</TableCell>
                      <TableCell className={styles.tableHeaderCell}>품명</TableCell>
                      <TableCell className={styles.tableHeaderCell}>재질</TableCell>
                      <TableCell align="center" className={styles.tableHeaderCell}>견적서 수</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredProducts.map(p => (
                      <TableRow key={p.id} hover className={styles.pointerRow}
                        onClick={() => { setSelectedProduct(p.id); setSearchOpen(false); }}>
                        <TableCell className={styles.itemCodeCell}>{p.id}</TableCell>
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
          <Box className={styles.step2Header} sx={{ gap: 2, mb: 2 }}>
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
                      <Box className={styles.quotationLabel} sx={{ gap: 1, opacity: isDisabled ? 0.5 : 1 }}>
                        <Typography variant="body2" fontWeight={600}>{q.vendor}</Typography>
                        <Chip label={q.date} size="small" variant="outlined" className={styles.chipSmallFont} />
                        {isDisabled && <Chip label="최대 4개" size="small" color="warning" className={styles.chipTinyFont} />}
                      </Box>
                    }
                  />
                );
              })}
            </FormGroup>
            
            {selectedQuotations.length < 2 && (
              <Typography variant="caption" color="text.secondary" className={styles.hintBlock} sx={{ mt: 1 }}>
                💡 비교하려면 최소 2개 이상 선택해주세요
              </Typography>
            )}
            
            {selectedQuotations.length >= 4 && (
              <Typography variant="caption" color="warning.main" className={styles.hintBlock} sx={{ mt: 1 }}>
                ⚠️ 최대 4개까지만 선택 가능합니다
              </Typography>
            )}
            {selectedQuotations.length >= 2 && (
              <Button 
                variant="contained" 
                size="large"
                className={styles.compareBtn}
                sx={{ mt: 2, px: 4, py: 1.5 }}
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
          <Box className={styles.step3Header} sx={{ gap: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700}>3️⃣ 견적서 상세 비교</Typography>
            <Button size="small" variant="text" onClick={resetSelection}>← 다시 선택</Button>
            <Chip label={`${selectedQuotations.length}개 견적서 비교`} size="small" color="primary" />
          </Box>

          {/* 총원가 요약 */}
          <Paper className={styles.costSummaryPaper} sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle2" className={styles.costSummaryTitle} sx={{ mb: 2 }}>💰 총 생산원가 비교</Typography>
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
            <Box className={styles.materialHeaderBg} sx={{ p: 2 }}>
              <Typography variant="subtitle2" className={styles.materialTitle}>Ⅰ. 재료비 비교</Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow className={styles.bgFafafa}>
                    <TableCell className={styles.tableHeaderCell} sx={{ width: 120 }}>구분</TableCell>
                    <TableCell className={styles.tableHeaderCell} sx={{ width: 200 }}>품명</TableCell>
                    <TableCell className={styles.tableHeaderCell} sx={{ width: 120 }}>규격</TableCell>
                    <TableCell className={styles.tableHeaderCell} sx={{ width: 60 }}>단위</TableCell>
                    <TableCell className={styles.tableHeaderCell} sx={{ width: 60 }}>수량</TableCell>
                    {selectedQuotations.map(qid => {
                      const q = quotations.find(qq => qq.id === qid)!;
                      return (
                        <TableCell key={qid} align="right" className={styles.vendorHeaderCell} sx={{ width: 100 }}>
                          {q.vendor}
                        </TableCell>
                      );
                    })}
                    <TableCell align="center" className={styles.diffHeaderCell} sx={{ width: 80 }}>차이</TableCell>
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
                        <TableCell className={styles.cellBold}>{item.name}</TableCell>
                        <TableCell>{item.spec}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>{item.qty}</TableCell>
                        {selectedQuotations.map((qid, qIdx) => {
                          const amount = (item.prices[qIdx] || 0) * item.qty;
                          const isMin = amount === minAmount;
                          const isMax = amount === maxAmount;
                          return (
                            <TableCell key={qid} align="right"
                              className={`${styles.monoBoldCell} ${isMin ? styles.cellMinBg : isMax ? styles.cellMaxBg : ''}`}>
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
                            className={styles.diffChip}
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
            <Box className={styles.processHeaderBg} sx={{ p: 2 }}>
              <Typography variant="subtitle2" className={styles.processTitle}>Ⅱ. 가공비 비교</Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow className={styles.bgFafafa}>
                    <TableCell className={styles.tableHeaderCell}>공정</TableCell>
                    <TableCell className={styles.tableHeaderCell}>공정명</TableCell>
                    <TableCell className={styles.tableHeaderCell}>단위</TableCell>
                    <TableCell className={styles.tableHeaderCell}>수량</TableCell>
                    {selectedQuotations.map(qid => {
                      const q = quotations.find(qq => qq.id === qid)!;
                      return <TableCell key={qid} align="right" className={styles.processVendorCell}>{q.vendor}</TableCell>;
                    })}
                    <TableCell align="center" className={styles.tableHeaderCell}>차이</TableCell>
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
                        <TableCell className={styles.cellBold}>{item.name}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>{item.qty}</TableCell>
                        {amounts.map((amount, qIdx) => {
                          const isMin = amount === minAmount;
                          const isMax = amount === maxAmount;
                          return (
                            <TableCell key={qIdx} align="right"
                              className={`${styles.monoBoldCell} ${isMin ? styles.cellMinBg : isMax ? styles.cellMaxBg : ''}`}>
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
                            className={styles.diffChip}
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
          <Paper className={styles.analysisPaper} sx={{ p: 3 }}>
            <Typography variant="subtitle2" className={styles.analysisTitle} sx={{ mb: 2 }}>
              🔍 견적서 차이 분석 및 제언
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <Box>
                <Typography variant="body2" className={styles.diffPointTitle} sx={{ mb: 1 }}>
                  ⚠️ 주요 차이점
                </Typography>
                <Box component="ul" className={styles.listReset}>
                  <li>SKIN 표피재: 최대 26% 단가 차이 (₩18,917 ~ ₩22,500)</li>
                  <li>성형공정비: 협력사별 설비 효율성 차이로 9.8% 격차</li>
                  <li>포장재: 골판지 규격 차이로 인한 단가 변동</li>
                </Box>
              </Box>

              <Box>
                <Typography variant="body2" className={styles.optimizationTitle} sx={{ mb: 1 }}>
                  💡 비용 최적화 제언
                </Typography>
                <Box component="ul" className={styles.listReset}>
                  <li>SKIN 표피재: 대한(주) 단가로 통일 시 ₩4,300 절약 가능</li>
                  <li>성형공정: 현대플라스틱 설비 활용 검토</li>
                  <li>종합 최저가 조합: ₩74,200 (현재 대비 ₩2,600 절약)</li>
                </Box>
              </Box>
            </Box>

            <Box className={styles.missingDataBox} sx={{ mt: 3, p: 2 }}>
              <Typography variant="caption" color="text.secondary" className={styles.missingDataLabel} sx={{ mb: 1 }}>
                📋 누락 데이터 및 확인 필요 사항
              </Typography>
              <Box component="ul" className={styles.missingDataList}>
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
            className={styles.popoverPaper}
            onClick={(e) => {
              // 내부 요소 클릭 시 이벤트 버블링 방지
              if (e.target === e.currentTarget) {
                setCalculationPopover(null);
              }
            }}
          >
            {/* Header */}
            <Box className={styles.popoverHeader} sx={{ p: 2, gap: 1 }}>
              <Typography className={styles.popoverHeaderTitle}>
                🧮 견적서별 계산식 비교
              </Typography>
            </Box>

            {/* Content */}
            <Box sx={{ p: 3 }}>
              {/* 항목 정보 */}
              <Box sx={{ mb: 3 }}>
                <Typography className={styles.popoverTypeLabel} sx={{ mb: 1 }}>
                  {calculationPopover.itemData.type === 'material' ? '재료비' : '가공비'} &gt; {calculationPopover.itemData.category || calculationPopover.itemData.process}
                </Typography>
                <Typography className={styles.popoverItemName} sx={{ mb: 0.5 }}>
                  {calculationPopover.itemData.name}
                </Typography>
                {calculationPopover.itemData.spec && (
                  <Typography className={styles.popoverSpec}>
                    규격: {calculationPopover.itemData.spec}
                  </Typography>
                )}
              </Box>

              {/* 견적서별 계산식 */}
              <Typography className={styles.popoverSectionTitle} sx={{ mb: 2 }}>
                💰 견적서별 계산 과정
              </Typography>

              <Box className={styles.popoverCalcCol} sx={{ gap: 2 }}>
                {selectedQuotations.map((qid, idx) => {
                  const q = quotations.find(qq => qq.id === qid)!;
                  const amount = calculationPopover.itemData.amounts[idx];
                  const isMin = amount === Math.min(...calculationPopover.itemData.amounts);
                  const isMax = amount === Math.max(...calculationPopover.itemData.amounts);
                  
                  return (
                    <Box key={qid} className={isMin ? styles.vendorBoxMin : isMax ? styles.vendorBoxMax : styles.vendorBoxNeutral} sx={{ p: 2 }}>
                      <Box className={styles.popoverVendorRow} sx={{ mb: 1 }}>
                        <Typography className={styles.popoverVendorName}>
                          {q.vendor}
                        </Typography>
                        {isMin && <Chip label="최저" size="small" color="primary" />}
                        {isMax && <Chip label="최고" size="small" color="error" />}
                      </Box>
                      
                      {calculationPopover.itemData.type === 'material' ? (
                        <Box>
                          <Typography className={styles.popoverCalcLabel} sx={{ mb: 1 }}>
                            계산식: 수량 × 단가
                          </Typography>
                          <Typography className={styles.popoverCalcFormula}
                            sx={{ color: isMin ? '#1976d2' : isMax ? '#f44336' : '#1d1d1f' }}>
                            {calculationPopover.itemData.qty} {calculationPopover.itemData.unit} × ₩{calculationPopover.itemData.prices[idx]?.toLocaleString()} = ₩{amount.toLocaleString()}
                          </Typography>
                        </Box>
                      ) : (
                        <Box>
                          <Typography className={styles.popoverProcessLabel} sx={{ mb: 1 }}>
                            공정비 (일괄)
                          </Typography>
                          <Typography className={styles.popoverProcessAmount}
                            sx={{ color: isMin ? '#1976d2' : isMax ? '#f44336' : '#1d1d1f' }}>
                            ₩{amount.toLocaleString()}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>

              {/* 차이 분석 */}
              <Box className={styles.popoverDiffBox} sx={{ mt: 3, p: 2 }}>
                <Typography className={styles.popoverDiffTitle} sx={{ mb: 1, gap: 0.5 }}>
                  📊 차이 분석
                </Typography>
                <Typography className={styles.popoverDiffText}>
                  최고가와 최저가 차이: {calculationPopover.itemData.diffPct}%
                </Typography>
                <Typography className={styles.popoverSavingsText} sx={{ mt: 0.5 }}>
                  절약 가능 금액: ₩{(Math.max(...calculationPopover.itemData.amounts) - Math.min(...calculationPopover.itemData.amounts)).toLocaleString()}
                </Typography>
              </Box>

              {/* Footer */}
              <Typography
                className={styles.popoverCloseText}
                sx={{ mt: 2, pt: 1, borderTop: '1px solid #e5e5e7' }}
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