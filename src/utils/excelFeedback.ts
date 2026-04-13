/**
 * 피드백 Excel 다운로드
 *
 * 운영 시: 백엔드 API (Java/Apache POI)에서 원본 보존 + 노트 추가 처리
 * 데모 시: 원본 파일 그대로 다운로드 (프론트에서 Excel 조작 안 함)
 *
 * 백엔드 API: GET /api/v1/analysis/{quotationId}/feedback-excel
 * → Apache POI XSSFWorkbook으로 원본 로드
 * → 이상치 셀에 createCellComment() + CellStyle 적용
 * → 원본 양식/수식/외부링크/도형 100% 보존
 */
import { saveAs } from 'file-saver';
import { costGroups } from '../features/analysis/data/costGroups';
import apiClient from '../shared/api/apiClient';
import { USE_API } from '../shared/api/config';

interface AnomalyInfo {
  name: string;
  category: string;
  group: string;
  amount: string;
  confidence: number;
  reason: string;
}

const collectAnomalies = (): AnomalyInfo[] => {
  const anomalies: AnomalyInfo[] = [];
  costGroups.forEach(group => {
    group.rows.forEach(row => {
      if (row.status === 'anomaly' && row.anomalyReason) {
        anomalies.push({
          name: row.name.replace(' ⚠️', ''),
          category: row.category,
          group: group.title,
          amount: row.amount,
          confidence: row.confidence,
          reason: row.anomalyReason,
        });
      }
    });
  });
  return anomalies;
};

/**
 * 피드백 Excel 다운로드
 */
export const downloadFeedbackExcel = async (quotationId?: string) => {
  const anomalies = collectAnomalies();
  const fileName = `피드백_${new Date().toISOString().slice(0, 10)}_견적서.xlsx`;

  if (USE_API && quotationId) {
    // ── 운영 모드: 백엔드 API에서 피드백 Excel 생성 + 다운로드 ──
    try {
      const response = await apiClient.get(`/analysis/${quotationId}/feedback-excel`, {
        responseType: 'blob',
      });
      saveAs(response.data, fileName);
      return { fileName, anomalyCount: anomalies.length, noteCount: anomalies.length, anomalies };
    } catch (err) {
      console.warn('API 피드백 Excel 실패, 원본 다운로드로 fallback:', err);
    }
  }

  // ── 데모 모드: 원본 파일 그대로 다운로드 ──
  // 실제 노트/하이라이트는 백엔드 Apache POI에서 처리
  const sampleUrl = `${process.env.PUBLIC_URL}/sample_excel/sample_data.xlsx`;
  const response = await fetch(sampleUrl);
  const blob = await response.blob();
  saveAs(blob, fileName);

  return { fileName, anomalyCount: anomalies.length, noteCount: 0, anomalies };
};
