import React, { useCallback, useRef } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { FileDownload as ExcelIcon, Print as PrintIcon } from '@mui/icons-material';

// ── 공통 스타일
const bd = '1px solid #b0b0b0';

const th = (extra?: object) => ({
  border: bd, fontSize: 8.5, fontWeight: 700, color: '#1a1a2e',
  bgcolor: '#dce6f0', p: '3px 4px', textAlign: 'center' as const,
  whiteSpace: 'pre-line' as const, lineHeight: 1.3, verticalAlign: 'middle' as const,
  ...extra,
});

const td = (extra?: object) => ({
  border: bd, fontSize: 8.5, color: '#1a1a2e',
  p: '2px 4px', whiteSpace: 'nowrap' as const, verticalAlign: 'middle' as const,
  ...extra,
});

const tdNum = (extra?: object) => td({ textAlign: 'right' as const, ...extra });
const tdCtr = (extra?: object) => td({ textAlign: 'center' as const, ...extra });

// ── 문서 정보
const INFO_FIELDS = [
  ['End품번', '84750 P2000WK'],
  ['End 품명', 'ASSY-CRASH PAD LWR D/SIDE'],
  ['승인도/대여도', '승인도'],
  ['EO_NO', 'K1221(*19.12)'],
  ['SEQ', 'T4'],
  ['차종', 'GZ'],
  ['환종', 'KRW'],
  ['업체코드', 'R173'],
  ['업체명', '㈜프라코아산공장'],
  ['팀', '구매원가분석팀'],
  ['담당자', 'XXX'],
  ['적용일(출력일)', '2026.01.27'],
];

// ── 재료비 데이터
const MAT_ROWS = [
  { no:1, lv:2, type:'직기빌', partNo:'84751-P2000', name:'PNL ASSY-CRASH PAD LWR D/SIDE WK', method:'수동준가', matCode:'F_PLPP_21357T4', mat:'PP(MS213-57 TY D-2)', inputWt:'-', netWt:341.6, price:2010, date:'20200101', unit:'KG', qty:'-', rate:'-', loss:1, defect:'-', impCode:'-', impPrice:'-', exchRate:'-', inputMat:693.48, scWt:17.1, scPrice:'-', scRatio:'-', wastePrice:36, wasteRatio:0.61, add:'-', cost:694.1, cRatio:2, rd:2, usg:1, total:694.1 },
  { no:2, lv:2, type:'직기빌', partNo:'84750-P2030', name:'SKIRT RUBBER', method:'수동준가', matCode:'F_PLTPE22005B', mat:'TPE(MS220-05 TY B)', inputWt:'-', netWt:20.4, price:5800, date:'20050901', unit:'KG', qty:'-', rate:'-', loss:0.6, defect:'-', impCode:'-', impPrice:'-', exchRate:'-', inputMat:119.03, scWt:4.5, scPrice:'-', scRatio:'-', wastePrice:36, wasteRatio:0.16, add:'-', cost:119.19, cRatio:2, rd:2, usg:1, total:119.19 },
  { no:3, lv:2, type:'직구마', partNo:'84750-P2050', name:'PAD THINSULATION', method:'수동준가', matCode:'-', mat:'-', inputWt:'-', netWt:'-', price:1690, date:'-', unit:'M2', qty:0.046, rate:'-', loss:'-', defect:'-', impCode:'-', impPrice:'-', exchRate:'-', inputMat:'-', scWt:'-', scPrice:'-', scRatio:'-', wastePrice:'-', wasteRatio:'-', add:'-', cost:77.59, cRatio:2, rd:2, usg:1, total:77.59 },
  { no:4, lv:2, type:'직구마', partNo:'84747-2L000', name:'PL CLIP', method:'수동준가', matCode:'-', mat:'-', inputWt:'-', netWt:'-', price:13, date:'-', unit:'EA', qty:4, rate:'-', loss:'-', defect:'-', impCode:'-', impPrice:'-', exchRate:'-', inputMat:52, scWt:'-', scPrice:'-', scRatio:'-', wastePrice:'-', wasteRatio:'-', add:'-', cost:52, cRatio:1, rd:1, usg:1, total:52 },
  { no:5, lv:2, type:'직구마', partNo:'PK006-P2000', name:'AT NOISE PAD', method:'수동준가', matCode:'-', mat:'-', inputWt:'-', netWt:'-', price:23.7, date:'-', unit:'EA', qty:5, rate:'-', loss:'-', defect:'-', impCode:'-', impPrice:'-', exchRate:'-', inputMat:118.5, scWt:'-', scPrice:'-', scRatio:'-', wastePrice:'-', wasteRatio:'-', add:'-', cost:118.5, cRatio:1, rd:1, usg:1, total:118.5 },
  { no:6, lv:2, type:'직구마', partNo:'-', name:'BARCODE', method:'수동준가', matCode:'-', mat:'-', inputWt:'-', netWt:'-', price:15, date:'-', unit:'EA', qty:1, rate:'-', loss:'-', defect:'-', impCode:'-', impPrice:'-', exchRate:'-', inputMat:15, scWt:'-', scPrice:'-', scRatio:'-', wastePrice:'-', wasteRatio:'-', add:'-', cost:15, cRatio:1, rd:1, usg:1, total:15 },
];

// ── 가공비 데이터
const PROC_ROWS = [
  { no:1, lv:2, partNo:'84750P2000WK', name:'PNL ASSY-CRASH PAD LWR D/SIDE WK', method:'수동준가\n20200101', process:'PLN LWR INJECTI', machine:'500TON', ctNet:48.41, etRate:10, cvt:1, prep:60, lot:1700, cTime:55.37, idleCT:'-', rate:19800, workers:0.5, laborCalc:152.27, labor:'-', type:'-', machVal:'-', deprecYr:'-', machCalc:'-', pwrKw:'-', stdPrice:'-', pwrRate:'-', repairRate:'-', unitDirect:'-', unitIdle:'-', machGadon:5832, directCostUnit:'-', indirectRate:60, directCost:143.52, procCost:295.79, mgmt:25, rd:1, usg:1, total:295.79 },
  { no:2, lv:2, partNo:'84750-P2030', name:'SKIRT RUBBER', method:'수동준가\n20200101', process:'-', machine:'100TON', ctNet:28.19, etRate:10, cvt:2, prep:40, lot:1700, cTime:16.92, idleCT:'-', rate:19600, workers:0.5, laborCalc:46.52, labor:'-', type:'-', machVal:'-', deprecYr:'-', machCalc:'-', pwrKw:'-', stdPrice:'-', pwrRate:'-', repairRate:'-', unitDirect:'-', unitIdle:'-', machGadon:1991, directCostUnit:'-', indirectRate:60, directCost:14.97, procCost:61.49, mgmt:25, rd:1, usg:1, total:61.49 },
  { no:3, lv:2, partNo:'-', name:'-', method:'수동준가\n20200101', process:'초슬파송작', machine:'송착기', ctNet:16.4, etRate:10, cvt:1, prep:40, lot:1700, cTime:19.45, idleCT:'-', rate:19800, workers:0.5, laborCalc:53.49, labor:'-', type:'-', machVal:'-', deprecYr:'-', machCalc:'-', pwrKw:'-', stdPrice:'-', pwrRate:'-', repairRate:'-', unitDirect:'-', unitIdle:'-', machGadon:604, directCostUnit:'-', indirectRate:60, directCost:5.22, procCost:58.71, mgmt:25, rd:0, usg:1, total:58.71 },
  { no:4, lv:2, partNo:'-', name:'-', method:'수동준가\n20200101', process:'ASSY', machine:'-', ctNet:77, etRate:10, cvt:1, prep:0, lot:1700, cTime:84.7, idleCT:'-', rate:19800, workers:1, laborCalc:465.85, labor:'-', type:'-', machVal:'-', deprecYr:'-', machCalc:'-', pwrKw:'-', stdPrice:'-', pwrRate:'-', repairRate:'-', unitDirect:'-', unitIdle:'-', machGadon:0, directCostUnit:'-', indirectRate:60, directCost:0, procCost:465.85, mgmt:25, rd:0, usg:1, total:465.85 },
  { no:5, lv:2, partNo:'-', name:'-', method:'수동준가\n20200101', process:'비전검사', machine:'비현검사기', ctNet:25, etRate:10, cvt:1, prep:0, lot:1700, cTime:37.5, idleCT:'-', rate:19800, workers:1, laborCalc:151.25, labor:'-', type:'-', machVal:'-', deprecYr:'-', machCalc:'-', pwrKw:'-', stdPrice:'-', pwrRate:'-', repairRate:'-', unitDirect:'-', unitIdle:'-', machGadon:298, directCostUnit:'-', indirectRate:60, directCost:3.64, procCost:154.89, mgmt:25, rd:0, usg:1, total:154.89 },
  { no:6, lv:2, partNo:'-', name:'-', method:'수동준가\n20200101', process:'(SUB)THINSULAT', machine:'-', ctNet:145, etRate:11, cvt:35, prep:10, lot:2000, cTime:4.9, idleCT:'-', rate:20700, workers:4, laborCalc:112.67, labor:'-', type:'-', machVal:'-', deprecYr:'-', machCalc:'-', pwrKw:'-', stdPrice:'-', pwrRate:'-', repairRate:'-', unitDirect:'-', unitIdle:'-', machGadon:2005, directCostUnit:'-', indirectRate:65, directCost:4.5, procCost:117.17, mgmt:27, rd:0, usg:1, total:117.17 },
  { no:7, lv:2, partNo:'-', name:'-', method:'수동준가\n20200101', process:'(SUB) 포장', machine:'-', ctNet:0.5, etRate:11, cvt:1, prep:0, lot:2000, cTime:0.56, idleCT:'-', rate:20700, workers:1, laborCalc:3.19, labor:'-', type:'-', machVal:'-', deprecYr:'-', machCalc:'-', pwrKw:'-', stdPrice:'-', pwrRate:'-', repairRate:'-', unitDirect:'-', unitIdle:'-', machGadon:0, directCostUnit:'-', indirectRate:65, directCost:0, procCost:3.19, mgmt:27, rd:0, usg:1, total:3.19 },
];

const fmt = (v: any) => (v === '-' || v === '' || v == null) ? '-' : (typeof v === 'number' ? v.toLocaleString() : v);

const GoldenSetView: React.FC = () => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handleExcelDownload = useCallback(() => {
    // ── 스타일 헬퍼 (인라인) ──
    const B = 'border:1px solid #333;';
    const thS = `${B}background:#dce6f0;font-weight:bold;text-align:center;font-size:10pt;padding:3px 5px;white-space:pre-line;vertical-align:middle;`;
    const tdS = `${B}font-size:10pt;padding:3px 5px;vertical-align:middle;`;
    const tdR = `${tdS}text-align:right;`;
    const tdC = `${tdS}text-align:center;`;
    const thG = `${B}background:#c6e0b4;font-weight:bold;text-align:center;font-size:10pt;padding:3px 5px;vertical-align:middle;`;
    const tdG = `${tdR}background:#e2efda;font-weight:bold;`;
    const tdGD = `${tdR}background:#c6e0b4;font-weight:bold;`;
    const tdSub = `${tdR}background:#dce6f0;font-weight:bold;`;
    const f = (v: any) => (v === '-' || v === '' || v == null) ? '-' : (typeof v === 'number' ? v.toLocaleString() : v);

    let html = '';

    // ━━━ 1. 타이틀 ━━━
    html += `<p style="text-align:center;font-size:15pt;font-weight:bold;font-family:'맑은 고딕',sans-serif;border-bottom:2px solid #333;padding-bottom:6px;">원 가 계 산 서</p>`;

    // ━━━ 2. 문서 정보 ━━━
    html += `<table border="1" cellpadding="3" cellspacing="0" style="border-collapse:collapse;width:100%;">`;
    [INFO_FIELDS.slice(0, 6), INFO_FIELDS.slice(6)].forEach(row => {
      html += '<tr>';
      row.forEach(([label, value]) => {
        html += `<td style="${thS}width:90px;">${label}</td>`;
        html += `<td style="${tdS}font-weight:600;">${value}</td>`;
      });
      html += '</tr>';
    });
    html += '</table><br/>';

    // ━━━ 3. 원가 요약 ━━━
    html += `<p style="font-size:12pt;font-weight:bold;font-family:'맑은 고딕',sans-serif;">■ 원가 요약</p>`;
    const sumH1 = ['재료비', 3, '가공비', 3, '제조원가', 0, '재료관리비\n(외관비 포함)', 0, '일반관리비', 0, '이윤', 0, '금형상각비', 2, '연구개발비,\n로열티비', 2, '불량비', 0, '운반비&\n파렛트비', 2, '서열비', 0, '기타비1', 0, '기타비2', 0, '기타비3', 0, '계산단가', 0, '조정단가', 0, '결정단가', 0];
    const sumH2 = ['LP', 'KD', '계', '노무비', '경비', '계', '금형비(원)', '금형상각비', 'R&D비', 'RYT비', '운반비', '파레트비'];
    const sumVals = [1076.38, '-', 1076.38, 985.24, 171.85, 1157.09, 2233.47, 17.82, 291.68, 217.32, '-', '-', '-', '-', '-', '-', 30.36, '-', '-', '-', 53.9, 2844.55, '-', 2845];
    html += `<table border="1" cellpadding="3" cellspacing="0" style="border-collapse:collapse;">`;
    // 1행
    html += '<tr>';
    for (let i = 0; i < sumH1.length; i += 2) {
      const label = sumH1[i] as string;
      const span = sumH1[i + 1] as number;
      if (span > 0) html += `<th colspan="${span}" style="${thS}">${label}</th>`;
      else html += `<th rowspan="2" style="${thS}">${label}</th>`;
    }
    html += '</tr>';
    // 2행
    html += '<tr>';
    sumH2.forEach(h => { html += `<th style="${thS}">${h}</th>`; });
    html += '</tr>';
    // 데이터행
    html += '<tr>';
    sumVals.forEach((v, i) => {
      const bg = i === 22 ? 'background:#fff3cd;' : i === 23 ? 'background:#d6e4f0;' : '';
      const fw = i >= 21 ? 'font-weight:bold;' : '';
      html += `<td style="${tdR}${bg}${fw}">${f(v)}</td>`;
    });
    html += '</tr></table><br/>';

    // ━━━ 4. 재료비 계산내역 ━━━
    html += `<p style="font-size:12pt;font-weight:bold;font-family:'맑은 고딕',sans-serif;">■ 재료비 계산내역</p>`;
    html += `<table border="1" cellpadding="3" cellspacing="0" style="border-collapse:collapse;">`;
    // 헤더 1행
    const mH1: [string, number, number][] = [
      ['NO',1,2],['LEVEL',1,2],['Sub 타입\n(사급,직개발\n직구매 등)',1,2],['Sub 품번',1,2],['Sub 품명',1,2],['공법',1,2],
      ['재료코드',1,2],['재질명',1,2],['투입중량\n[g]',1,2],['NET중량\n[g]',1,2],['재료단가',1,2],['적용일',1,2],
      ['단위',1,2],['사용량',1,2],['적용률',1,2],['LOSS율\n[%]',1,2],['불량률\n[%]',1,2],
      ['수입코드',1,2],['수입단가',1,2],['환율',1,2],['투입\n재료비',1,2],
      ['SCRAP',3,1],['산폐,B/S',2,1],
      ['추가재료',1,2],['재료비',1,2],['재료비\n리비율',1,2],['R&D율',1,2],['END\nUSG',1,2],
    ];
    html += '<tr>';
    mH1.forEach(([label, cs, rs]) => {
      const isGreen = label === '재료비합계';
      html += `<th ${cs > 1 ? `colspan="${cs}"` : ''} ${rs > 1 ? `rowspan="${rs}"` : ''} style="${isGreen ? thG : thS}">${label}</th>`;
    });
    html += `<th rowspan="2" style="${thG}">재료비합계</th>`;
    html += '</tr>';
    // 헤더 2행
    html += '<tr>';
    ['중량', 'SCR단가', '비', '산폐,B/S\n단가(kg)', '비'].forEach(h => { html += `<th style="${thS}">${h}</th>`; });
    html += '</tr>';
    // 데이터행
    MAT_ROWS.forEach(r => {
      html += '<tr>';
      [r.no, r.lv].forEach(v => { html += `<td style="${tdC}">${v}</td>`; });
      html += `<td style="${tdC}">${r.type}</td>`;
      html += `<td style="${tdS}">${r.partNo}</td>`;
      html += `<td style="${tdS}">${r.name}</td>`;
      html += `<td style="${tdC}">${r.method}</td>`;
      html += `<td style="${tdS}">${r.matCode}</td>`;
      html += `<td style="${tdS}">${r.mat}</td>`;
      [r.inputWt, r.netWt, r.price].forEach(v => { html += `<td style="${tdR}">${f(v)}</td>`; });
      html += `<td style="${tdC}">${f(r.date)}</td>`;
      html += `<td style="${tdC}">${r.unit}</td>`;
      [r.qty, r.rate, r.loss, r.defect].forEach(v => { html += `<td style="${tdR}">${f(v)}</td>`; });
      html += `<td style="${tdC}">${f(r.impCode)}</td>`;
      [r.impPrice, r.exchRate, r.inputMat, r.scWt, r.scPrice, r.scRatio, r.wastePrice, r.wasteRatio, r.add].forEach(v => { html += `<td style="${tdR}">${f(v)}</td>`; });
      html += `<td style="${tdR}font-weight:600;">${f(r.cost)}</td>`;
      [r.cRatio, r.rd, r.usg].forEach(v => { html += `<td style="${tdR}">${f(v)}</td>`; });
      html += `<td style="${tdG}">${f(r.total)}</td>`;
      html += '</tr>';
    });
    // 소계
    const matTotal = MAT_ROWS.reduce((s, r) => s + (typeof r.total === 'number' ? r.total : 0), 0);
    html += `<tr><td colspan="31" style="${tdSub}text-align:right;">재료비 소계</td><td style="${tdGD}">${matTotal.toFixed(2)}</td></tr>`;
    html += '</table><br/>';

    // ━━━ 5. 가공비 계산내역 ━━━
    html += `<p style="font-size:12pt;font-weight:bold;font-family:'맑은 고딕',sans-serif;">■ 가공비 계산내역</p>`;
    html += `<table border="1" cellpadding="3" cellspacing="0" style="border-collapse:collapse;">`;
    // 헤더 1행
    html += '<tr>';
    const pH1: [string, number, number, boolean][] = [
      ['NO',1,2,false],['LEVEL',1,2,false],['Sub 품번',2,2,false],['Sub 품명',2,2,false],['공법\n(기준일)',1,2,false],
      ['공정명',1,2,false],['기계명칭',1,2,false],['CYCLE TIME',6,1,false],['비가동\nC/T',1,2,false],
      ['노무비',3,1,false],['노무비',1,2,false],['구분\n(전/병)',1,2,false],
      ['기계경비 상세내역',3,1,false],['건물상각비',2,1,false],['전력비',4,1,false],
      ['수선비율\n(6%12%)',1,2,false],['직접경비',2,1,false],['간접\n경비율',1,2,false],['계',1,2,false],
      ['가공비',1,2,true],['일반관리\n리비율',1,2,false],['R&D율',1,2,false],['END\nUSG율',1,2,false],['가공비\n합계',1,2,true],
    ];
    pH1.forEach(([label, cs, rs, green]) => {
      html += `<th ${cs > 1 ? `colspan="${cs}"` : ''} ${rs > 1 ? `rowspan="${rs}"` : ''} style="${green ? thG : thS}">${label}</th>`;
    });
    html += '</tr>';
    // 헤더 2행
    html += '<tr>';
    ['NET','ET율','CVT','준비시간','LOT량','C/Time','임율','인원','계','기계가액\n(천원)','상각년수','계','전력비\n(Kw)','표준진\n백단가','율','수선비율\n12%','단위당\n기가동비','직접경비\n단위당','단위당\n비가동','단위당\n기가동비']
      .forEach(h => { html += `<th style="${thS}">${h}</th>`; });
    html += '</tr>';
    // 데이터행
    PROC_ROWS.forEach(r => {
      html += '<tr>';
      html += `<td style="${tdC}">${r.no}</td><td style="${tdC}">${r.lv}</td>`;
      html += `<td colspan="2" style="${tdS}">${r.partNo}</td>`;
      html += `<td colspan="2" style="${tdS}">${r.name}</td>`;
      html += `<td style="${tdC}white-space:pre-line;">${r.method}</td>`;
      html += `<td style="${tdS}">${r.process}</td>`;
      html += `<td style="${tdC}">${r.machine}</td>`;
      [r.ctNet, r.etRate, r.cvt, r.prep, r.lot, r.cTime].forEach(v => { html += `<td style="${tdR}">${v}</td>`; });
      html += `<td style="${tdR}">${f(r.idleCT)}</td>`;
      [r.rate, r.workers, r.laborCalc].forEach(v => { html += `<td style="${tdR}">${v}</td>`; });
      html += `<td style="${tdR}font-weight:600;">${f(r.labor)}</td>`;
      html += `<td style="${tdC}">${f(r.type)}</td>`;
      [r.machVal, r.deprecYr, r.machCalc, r.pwrKw, r.stdPrice, r.pwrRate, r.repairRate, r.unitDirect, r.unitIdle].forEach(v => { html += `<td style="${tdR}">${f(v)}</td>`; });
      html += `<td style="${tdR}">${r.machGadon}</td>`;
      html += `<td style="${tdR}">${f(r.directCostUnit)}</td>`;
      html += `<td style="${tdR}">${r.directCost}</td>`;
      html += `<td style="${tdR}">${r.indirectRate}</td>`;
      html += `<td style="${tdR}">${r.procCost}</td>`;
      html += `<td style="${tdG}">${r.procCost}</td>`;
      html += `<td style="${tdR}">${r.mgmt}</td>`;
      html += `<td style="${tdR}">${r.rd}</td>`;
      html += `<td style="${tdR}">${r.usg}</td>`;
      html += `<td style="${tdGD}">${r.total}</td>`;
      html += '</tr>';
    });
    // 소계
    const procTotal = PROC_ROWS.reduce((s, r) => s + (typeof r.total === 'number' ? r.total : 0), 0);
    html += `<tr><td colspan="39" style="${tdSub}text-align:right;">가공비 소계</td><td style="${tdGD}">${procTotal.toFixed(2)}</td></tr>`;
    html += '</table><br/>';

    // ━━━ 6. 서명란 + 결정단가 ━━━
    html += `<table border="1" cellpadding="3" cellspacing="0" style="border-collapse:collapse;width:280px;">`;
    html += `<tr><th style="${thS}width:33%;">작성</th><th style="${thS}width:33%;">검토</th><th style="${thS}width:33%;">승인</th></tr>`;
    html += `<tr><td style="${tdS}height:40px;">&nbsp;</td><td style="${tdS}height:40px;">&nbsp;</td><td style="${tdS}height:40px;">&nbsp;</td></tr>`;
    html += '</table>';
    html += `<table border="1" cellpadding="3" cellspacing="0" style="border-collapse:collapse;margin-top:8px;">`;
    html += '<tr>';
    [['계산단가', '2,844.55', ''], ['조정단가', '-', ''], ['결정단가', '2,845', 'background:#fff3cd;font-weight:bold;']].forEach(([label, val, extra]) => {
      html += `<td style="${thS}width:80px;">${label}</td><td style="${tdR}${extra}">${val}</td>`;
    });
    html += '</tr></table>';

    // ── 파일 생성 ──
    const xlsContent = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:spreadsheet" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"/>
<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
<x:Name>원가계산서</x:Name>
<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
</head><body style="font-family:'맑은 고딕',sans-serif;">${html}</body></html>`;

    const blob = new Blob(['\uFEFF' + xlsContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `원가계산서_골든셋_${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  return (
    <Box sx={{ p: 0 }}>
      {/* ── 툴바 ── */}
      <Box sx={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        px: 3, py: 1.5, bgcolor: '#f8f9fa', borderBottom: '1px solid #e0e0e0', mb: 2,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e' }}>🏆 골든셋</Typography>
          <Typography sx={{ fontSize: 11, color: '#6b7280', ml: 1 }}>최종 Excel 출력 기준 데이터</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" startIcon={<PrintIcon sx={{ fontSize: 14 }} />}
            onClick={() => window.print()}
            sx={{ textTransform: 'none', fontSize: 12, fontWeight: 600, borderRadius: '8px', borderColor: '#e5e5e7', color: '#6b7280', bgcolor: '#fff', px: 1.5, '&:hover': { borderColor: '#d1d5db', bgcolor: '#f3f4f6' } }}>
            인쇄
          </Button>
          <Button size="small" variant="contained" startIcon={<ExcelIcon sx={{ fontSize: 14 }} />}
            onClick={handleExcelDownload}
            sx={{ textTransform: 'none', fontSize: 12, fontWeight: 700, borderRadius: '8px', bgcolor: '#217346', boxShadow: 'none', px: 1.5, '&:hover': { bgcolor: '#1a5c38', boxShadow: 'none' } }}>
            Excel 다운로드
          </Button>
        </Box>
      </Box>

      {/* ── 출력 영역 ── */}
      <Box ref={printAreaRef} sx={{ px: 2, pb: 4 }}>

        {/* ━━━ 1. 문서 제목 ━━━ */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 800, color: '#1a1a2e', letterSpacing: 6, display: 'inline-block', borderBottom: '2px solid #1a1a2e', pb: 1 }}>
            원  가  계  산  서
          </Typography>
        </Box>

        {/* ━━━ 2. 문서 정보 헤더 ━━━ */}
        <Box sx={{ overflowX: 'auto', mb: 1 }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 900 }}>
            <tbody>
              {[INFO_FIELDS.slice(0, 6), INFO_FIELDS.slice(6)].map((row, ri) => (
                <tr key={ri}>
                  {row.map(([label, value], ci) => (
                    <React.Fragment key={ci}>
                      <td style={{ ...th() as any, width: 90, border: bd }}>
                        {label}
                      </td>
                      <td style={{ ...td() as any, border: bd, fontWeight: 600, minWidth: 120 }}>
                        {value}
                      </td>
                    </React.Fragment>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Box>

        {/* ━━━ 3. 원가 요약 테이블 ━━━ */}
        <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#1a1a2e', mb: 0.5, mt: 1 }}>
          ■ 원가 요약
        </Typography>
        <Box sx={{ overflowX: 'auto', mb: 2 }}>
          <table style={{ borderCollapse: 'collapse', minWidth: 1100 }}>
            <thead>
              <tr>
                <th colSpan={3} style={th({ width: 210 }) as any}>재료비</th>
                <th colSpan={3} style={th({ width: 180 }) as any}>가공비</th>
                <th rowSpan={2} style={th({ width: 70 }) as any}>제조원가</th>
                <th rowSpan={2} style={th({ width: 80 }) as any}>{'재료관리비\n(외관비 포함)'}</th>
                <th rowSpan={2} style={th({ width: 70 }) as any}>일반관리비</th>
                <th rowSpan={2} style={th({ width: 60 }) as any}>이윤</th>
                <th colSpan={2} style={th({ width: 120 }) as any}>금형상각비</th>
                <th colSpan={2} style={th({ width: 120 }) as any}>{'연구개발비,\n로열티비'}</th>
                <th rowSpan={2} style={th({ width: 55 }) as any}>불량비</th>
                <th colSpan={2} style={th({ width: 120 }) as any}>{'운반비&\n파렛트비'}</th>
                <th rowSpan={2} style={th({ width: 55 }) as any}>서열비</th>
                <th rowSpan={2} style={th({ width: 55 }) as any}>기타비1</th>
                <th rowSpan={2} style={th({ width: 55 }) as any}>기타비2</th>
                <th rowSpan={2} style={th({ width: 55 }) as any}>기타비3</th>
                <th rowSpan={2} style={th({ width: 70 }) as any}>계산단가</th>
                <th rowSpan={2} style={th({ width: 65 }) as any}>조정단가</th>
                <th rowSpan={2} style={th({ width: 65 }) as any}>결정단가</th>
              </tr>
              <tr>
                <th style={th({ width: 65 }) as any}>LP</th>
                <th style={th({ width: 65 }) as any}>KD</th>
                <th style={th({ width: 70 }) as any}>계</th>
                <th style={th({ width: 60 }) as any}>노무비</th>
                <th style={th({ width: 60 }) as any}>경비</th>
                <th style={th({ width: 60 }) as any}>계</th>
                <th style={th({ width: 60 }) as any}>금형비(원)</th>
                <th style={th({ width: 60 }) as any}>금형상각비</th>
                <th style={th({ width: 60 }) as any}>R&D비</th>
                <th style={th({ width: 60 }) as any}>RYT비</th>
                <th style={th({ width: 60 }) as any}>운반비</th>
                <th style={th({ width: 60 }) as any}>파레트비</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {[1076.38, '-', 1076.38, 985.24, 171.85, 1157.09, 2233.47, 17.82, 291.68, 217.32,
                  '-', '-', '-', '-', '-', '-', 30.36, '-', '-', '-', 53.9, 2844.55, '-', 2845
                ].map((v, i) => (
                  <td key={i} style={tdNum({ bgcolor: i === 22 ? '#fff3cd' : i === 23 ? '#d6e4f0' : '#fff', fontWeight: i >= 21 ? 700 : 400 }) as any}>
                    {fmt(v)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </Box>

        {/* ━━━ 4. 재료비 계산내역 ━━━ */}
        <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>
          ■ 재료비 계산내역
        </Typography>
        <Box sx={{ overflowX: 'auto', mb: 2 }}>
          <table style={{ borderCollapse: 'collapse', minWidth: 1400 }}>
            <thead>
              <tr>
                <th rowSpan={2} style={th({ width: 28 }) as any}>NO</th>
                <th rowSpan={2} style={th({ width: 36 }) as any}>LEVEL</th>
                <th rowSpan={2} style={th({ width: 70 }) as any}>{'Sub 타입\n(사급,직개발\n직구매 등)'}</th>
                <th rowSpan={2} style={th({ width: 90 }) as any}>Sub 품번</th>
                <th rowSpan={2} style={th({ width: 160 }) as any}>Sub 품명</th>
                <th rowSpan={2} style={th({ width: 60 }) as any}>공법</th>
                <th rowSpan={2} style={th({ width: 90 }) as any}>재료코드</th>
                <th rowSpan={2} style={th({ width: 110 }) as any}>재질명</th>
                <th rowSpan={2} style={th({ width: 55 }) as any}>{'투입중량\n[g]'}</th>
                <th rowSpan={2} style={th({ width: 55 }) as any}>{'NET중량\n[g]'}</th>
                <th rowSpan={2} style={th({ width: 55 }) as any}>재료단가</th>
                <th rowSpan={2} style={th({ width: 65 }) as any}>적용일</th>
                <th rowSpan={2} style={th({ width: 36 }) as any}>단위</th>
                <th rowSpan={2} style={th({ width: 50 }) as any}>사용량</th>
                <th rowSpan={2} style={th({ width: 45 }) as any}>적용률</th>
                <th rowSpan={2} style={th({ width: 45 }) as any}>{'LOSS율\n[%]'}</th>
                <th rowSpan={2} style={th({ width: 45 }) as any}>{'불량률\n[%]'}</th>
                <th rowSpan={2} style={th({ width: 50 }) as any}>수입코드</th>
                <th rowSpan={2} style={th({ width: 50 }) as any}>수입단가</th>
                <th rowSpan={2} style={th({ width: 45 }) as any}>환율</th>
                <th rowSpan={2} style={th({ width: 55 }) as any}>{'투입\n재료비'}</th>
                <th colSpan={3} style={th({ width: 120 }) as any}>SCRAP</th>
                <th colSpan={2} style={th({ width: 100 }) as any}>산폐,B/S</th>
                <th rowSpan={2} style={th({ width: 50 }) as any}>추가재료</th>
                <th rowSpan={2} style={th({ width: 55 }) as any}>재료비</th>
                <th rowSpan={2} style={th({ width: 50 }) as any}>{'재료비\n리비율'}</th>
                <th rowSpan={2} style={th({ width: 45 }) as any}>R&D율</th>
                <th rowSpan={2} style={th({ width: 50 }) as any}>{'END\nUSG'}</th>
                <th rowSpan={2} style={th({ width: 65, bgcolor: '#c6e0b4' }) as any}>재료비합계</th>
              </tr>
              <tr>
                <th style={th({ width: 40 }) as any}>중량</th>
                <th style={th({ width: 40 }) as any}>SCR단가</th>
                <th style={th({ width: 40 }) as any}>비</th>
                <th style={th({ width: 50 }) as any}>{'산폐,B/S\n단가(kg)'}</th>
                <th style={th({ width: 50 }) as any}>비</th>
              </tr>
            </thead>
            <tbody>
              {MAT_ROWS.map((r) => (
                <tr key={r.no}>
                  <td style={tdCtr() as any}>{r.no}</td>
                  <td style={tdCtr() as any}>{r.lv}</td>
                  <td style={tdCtr() as any}>{r.type}</td>
                  <td style={td() as any}>{r.partNo}</td>
                  <td style={td() as any}>{r.name}</td>
                  <td style={tdCtr() as any}>{r.method}</td>
                  <td style={td() as any}>{r.matCode}</td>
                  <td style={td() as any}>{r.mat}</td>
                  <td style={tdNum() as any}>{fmt(r.inputWt)}</td>
                  <td style={tdNum() as any}>{fmt(r.netWt)}</td>
                  <td style={tdNum() as any}>{fmt(r.price)}</td>
                  <td style={tdCtr() as any}>{fmt(r.date)}</td>
                  <td style={tdCtr() as any}>{r.unit}</td>
                  <td style={tdNum() as any}>{fmt(r.qty)}</td>
                  <td style={tdNum() as any}>{fmt(r.rate)}</td>
                  <td style={tdNum() as any}>{fmt(r.loss)}</td>
                  <td style={tdNum() as any}>{fmt(r.defect)}</td>
                  <td style={tdCtr() as any}>{fmt(r.impCode)}</td>
                  <td style={tdNum() as any}>{fmt(r.impPrice)}</td>
                  <td style={tdNum() as any}>{fmt(r.exchRate)}</td>
                  <td style={tdNum() as any}>{fmt(r.inputMat)}</td>
                  <td style={tdNum() as any}>{fmt(r.scWt)}</td>
                  <td style={tdNum() as any}>{fmt(r.scPrice)}</td>
                  <td style={tdNum() as any}>{fmt(r.scRatio)}</td>
                  <td style={tdNum() as any}>{fmt(r.wastePrice)}</td>
                  <td style={tdNum() as any}>{fmt(r.wasteRatio)}</td>
                  <td style={tdNum() as any}>{fmt(r.add)}</td>
                  <td style={tdNum({ fontWeight: 600 }) as any}>{fmt(r.cost)}</td>
                  <td style={tdNum() as any}>{fmt(r.cRatio)}</td>
                  <td style={tdNum() as any}>{fmt(r.rd)}</td>
                  <td style={tdNum() as any}>{fmt(r.usg)}</td>
                  <td style={tdNum({ bgcolor: '#e2efda', fontWeight: 700 }) as any}>{fmt(r.total)}</td>
                </tr>
              ))}
              {/* 재료비 합계 행 */}
              <tr>
                <td colSpan={31} style={td({ textAlign: 'right', fontWeight: 700, bgcolor: '#dce6f0' }) as any}>
                  재료비 소계
                </td>
                <td style={tdNum({ bgcolor: '#c6e0b4', fontWeight: 700 }) as any}>
                  {fmt(MAT_ROWS.reduce((s, r) => s + (typeof r.total === 'number' ? r.total : 0), 0).toFixed(2))}
                </td>
              </tr>
            </tbody>
          </table>
        </Box>

        {/* ━━━ 5. 가공비 계산내역 ━━━ */}
        <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>
          ■ 가공비 계산내역
        </Typography>
        <Box sx={{ overflowX: 'auto', mb: 2 }}>
          <table style={{ borderCollapse: 'collapse', minWidth: 1500 }}>
            <thead>
              <tr>
                <th rowSpan={2} style={th({ width: 28 }) as any}>NO</th>
                <th rowSpan={2} style={th({ width: 36 }) as any}>LEVEL</th>
                <th colSpan={2} rowSpan={2} style={th({ width: 100 }) as any}>Sub 품번</th>
                <th colSpan={2} rowSpan={2} style={th({ width: 160 }) as any}>Sub 품명</th>
                <th rowSpan={2} style={th({ width: 70 }) as any}>{'공법\n(기준일)'}</th>
                <th rowSpan={2} style={th({ width: 80 }) as any}>공정명</th>
                <th rowSpan={2} style={th({ width: 65 }) as any}>기계명칭</th>
                <th colSpan={6} style={th({ width: 240 }) as any}>CYCLE TIME</th>
                <th rowSpan={2} style={th({ width: 50 }) as any}>{'비가동\nC/T'}</th>
                <th colSpan={3} style={th({ width: 150 }) as any}>노무비</th>
                <th rowSpan={2} style={th({ width: 55 }) as any}>노무비</th>
                <th rowSpan={2} style={th({ width: 45 }) as any}>{'구분\n(전/병)'}</th>
                <th colSpan={3} style={th({ width: 120 }) as any}>기계경비 상세내역</th>
                <th colSpan={2} style={th({ width: 100 }) as any}>건물상각비</th>
                <th colSpan={4} style={th({ width: 160 }) as any}>전력비</th>
                <th rowSpan={2} style={th({ width: 55 }) as any}>{'수선비율\n(6%12%)'}</th>
                <th colSpan={2} style={th({ width: 100 }) as any}>직접경비</th>
                <th rowSpan={2} style={th({ width: 50 }) as any}>{'간접\n경비율'}</th>
                <th rowSpan={2} style={th({ width: 55 }) as any}>계</th>
                <th rowSpan={2} style={th({ width: 55, bgcolor: '#c6e0b4' }) as any}>가공비</th>
                <th rowSpan={2} style={th({ width: 50 }) as any}>{'일반관리\n리비율'}</th>
                <th rowSpan={2} style={th({ width: 45 }) as any}>R&D율</th>
                <th rowSpan={2} style={th({ width: 50 }) as any}>{'END\nUSG율'}</th>
                <th rowSpan={2} style={th({ width: 65, bgcolor: '#c6e0b4' }) as any}>{'가공비\n합계'}</th>
              </tr>
              <tr>
                {/* CYCLE TIME sub */}
                <th style={th({ width: 40 }) as any}>NET</th>
                <th style={th({ width: 40 }) as any}>ET율</th>
                <th style={th({ width: 40 }) as any}>CVT</th>
                <th style={th({ width: 45 }) as any}>준비시간</th>
                <th style={th({ width: 40 }) as any}>LOT량</th>
                <th style={th({ width: 45 }) as any}>C/Time</th>
                {/* 노무비 sub */}
                <th style={th({ width: 50 }) as any}>임율</th>
                <th style={th({ width: 40 }) as any}>인원</th>
                <th style={th({ width: 55 }) as any}>계</th>
                {/* 기계경비 상세 sub */}
                <th style={th({ width: 55 }) as any}>{'기계가액\n(천원)'}</th>
                <th style={th({ width: 40 }) as any}>상각년수</th>
                <th style={th({ width: 45 }) as any}>계</th>
                {/* 건물상각 sub */}
                <th style={th({ width: 50 }) as any}>{'전력비\n(Kw)'}</th>
                <th style={th({ width: 50 }) as any}>{'표준진\n백단가'}</th>
                {/* 전력비 sub */}
                <th style={th({ width: 40 }) as any}>율</th>
                <th style={th({ width: 50 }) as any}>{'수선비율\n12%'}</th>
                <th style={th({ width: 55 }) as any}>{'단위당\n기가동비'}</th>
                <th style={th({ width: 55 }) as any}>{'직접경비\n단위당'}</th>
                {/* 직접경비 sub */}
                <th style={th({ width: 55 }) as any}>{'단위당\n비가동'}</th>
                <th style={th({ width: 55 }) as any}>{'단위당\n기가동비'}</th>
              </tr>
            </thead>
            <tbody>
              {PROC_ROWS.map((r) => (
                <tr key={r.no}>
                  <td style={tdCtr() as any}>{r.no}</td>
                  <td style={tdCtr() as any}>{r.lv}</td>
                  <td colSpan={2} style={td() as any}>{r.partNo}</td>
                  <td colSpan={2} style={td() as any}>{r.name}</td>
                  <td style={tdCtr({ whiteSpace: 'pre-line' }) as any}>{r.method}</td>
                  <td style={td() as any}>{r.process}</td>
                  <td style={tdCtr() as any}>{r.machine}</td>
                  <td style={tdNum() as any}>{r.ctNet}</td>
                  <td style={tdNum() as any}>{r.etRate}</td>
                  <td style={tdNum() as any}>{r.cvt}</td>
                  <td style={tdNum() as any}>{r.prep}</td>
                  <td style={tdNum() as any}>{r.lot}</td>
                  <td style={tdNum() as any}>{r.cTime}</td>
                  <td style={tdNum() as any}>{fmt(r.idleCT)}</td>
                  {/* 노무비 */}
                  <td style={tdNum() as any}>{r.rate}</td>
                  <td style={tdNum() as any}>{r.workers}</td>
                  <td style={tdNum() as any}>{r.laborCalc}</td>
                  <td style={tdNum({ fontWeight: 600 }) as any}>{fmt(r.labor)}</td>
                  <td style={tdCtr() as any}>{fmt(r.type)}</td>
                  {/* 기계경비 */}
                  <td style={tdNum() as any}>{fmt(r.machVal)}</td>
                  <td style={tdNum() as any}>{fmt(r.deprecYr)}</td>
                  <td style={tdNum() as any}>{fmt(r.machCalc)}</td>
                  {/* 건물상각 */}
                  <td style={tdNum() as any}>{fmt(r.pwrKw)}</td>
                  <td style={tdNum() as any}>{fmt(r.stdPrice)}</td>
                  {/* 전력비 */}
                  <td style={tdNum() as any}>{fmt(r.pwrRate)}</td>
                  <td style={tdNum() as any}>{fmt(r.repairRate)}</td>
                  <td style={tdNum() as any}>{fmt(r.unitDirect)}</td>
                  <td style={tdNum() as any}>{fmt(r.unitIdle)}</td>
                  {/* 수선비율 */}
                  <td style={tdNum() as any}>{r.machGadon}</td>
                  {/* 직접경비 */}
                  <td style={tdNum() as any}>{fmt(r.directCostUnit)}</td>
                  <td style={tdNum() as any}>{r.directCost}</td>
                  <td style={tdNum() as any}>{r.indirectRate}</td>
                  <td style={tdNum() as any}>{r.procCost}</td>
                  <td style={tdNum({ bgcolor: '#e2efda', fontWeight: 700 }) as any}>{r.procCost}</td>
                  <td style={tdNum() as any}>{r.mgmt}</td>
                  <td style={tdNum() as any}>{r.rd}</td>
                  <td style={tdNum() as any}>{r.usg}</td>
                  <td style={tdNum({ bgcolor: '#c6e0b4', fontWeight: 700 }) as any}>{r.total}</td>
                </tr>
              ))}
              {/* 가공비 합계 행 */}
              <tr>
                <td colSpan={39} style={td({ textAlign: 'right', fontWeight: 700, bgcolor: '#dce6f0' }) as any}>
                  가공비 소계
                </td>
                <td style={tdNum({ bgcolor: '#c6e0b4', fontWeight: 700 }) as any}>
                  {fmt(PROC_ROWS.reduce((s, r) => s + r.total, 0).toFixed(2))}
                </td>
              </tr>
            </tbody>
          </table>
        </Box>

        {/* ━━━ 6. 서명란 ━━━ */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 4, mt: 1 }}>
          <table style={{ borderCollapse: 'collapse', width: 280 }}>
            <thead>
              <tr>
                {['작성', '검토', '승인'].map((label) => (
                  <th key={label} style={th({ width: '33%' }) as any}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {['작성', '검토', '승인'].map((label) => (
                  <td key={label} style={{ ...td(), height: 40, border: bd } as any} />
                ))}
              </tr>
            </tbody>
          </table>

          <Box sx={{ border: bd, borderRadius: '2px', overflow: 'hidden', display: 'inline-flex' }}>
            {[
              { label: '계산단가', val: '2,844.55' },
              { label: '조정단가', val: '-' },
              { label: '결정단가', val: '2,845', highlight: true },
            ].map(({ label, val, highlight }) => (
              <Box key={label} sx={{ display: 'flex', flexDirection: 'column', borderRight: bd }}>
                <Box sx={{ bgcolor: '#dce6f0', px: 1.5, py: 0.4, borderBottom: bd }}>
                  <Typography sx={{ fontSize: 9, fontWeight: 700, textAlign: 'center' }}>{label}</Typography>
                </Box>
                <Box sx={{ px: 2, py: 0.8, bgcolor: highlight ? '#fff3cd' : '#fff' }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, textAlign: 'right', color: highlight ? '#a0522d' : '#1a1a2e' }}>
                    {val}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

      </Box>
    </Box>
  );
};

export default GoldenSetView;
