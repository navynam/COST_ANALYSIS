# 🔌 API 명세서 - 견적서 분석 시스템

## 📋 개요

현재는 **목업 데이터**로 동작하지만, 실제 백엔드 연동 시 필요한 API 인터페이스를 정의합니다.

## 🏗️ 기본 구조

- **Base URL**: `https://api.cost-analysis.com/v1`
- **인증**: JWT Bearer Token
- **Content-Type**: `application/json`
- **날짜 형식**: ISO 8601 (`2026-04-02T17:54:00Z`)

## 📊 공통 응답 구조

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}
```

## 🔐 인증 API

### POST /auth/login
사용자 로그인

**Request:**
```typescript
{
  username: string;
  password: string;
  companyCode?: string; // 회사별 접근 제어
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    token: string;
    refreshToken: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: 'admin' | 'manager' | 'analyst';
      company: string;
      permissions: string[];
    }
  }
}
```

## 📄 파일 관리 API

### POST /files/upload
Excel 파일 업로드

**Request:** `multipart/form-data`
```
file: File (Excel)
company: string
projectId?: string
```

**Response:**
```typescript
{
  success: true,
  data: {
    fileId: string;
    originalName: string;
    size: number;
    uploadUrl: string;
    status: 'uploaded';
    createdAt: string;
  }
}
```

### GET /files
파일 목록 조회

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  status?: ParsingStatus[];
  company?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    files: Array<{
      id: string;
      name: string;
      company: string;
      status: ParsingStatus;
      uploadDate: string;
      parsedItems?: number;
      confidence?: number;
      anomalies?: number;
      fileSize: number;
      worksheets: string[];
      processingTime?: number;
    }>;
  },
  pagination: { ... }
}
```

### GET /files/{fileId}
파일 상세 정보

**Response:**
```typescript
{
  success: true,
  data: {
    id: string;
    name: string;
    company: string;
    status: ParsingStatus;
    uploadDate: string;
    metadata: {
      originalName: string;
      size: number;
      mimeType: string;
      worksheets: Array<{
        name: string;
        rowCount: number;
        colCount: number;
      }>;
    };
    parsing?: {
      extractedData: ParsedData[];
      confidence: number;
      anomalies: number;
      categories: CategoryStats[];
      processingTime: number;
    };
    verification?: {
      status: 'pending' | 'completed';
      reviewer: string;
      reviewedAt?: string;
      corrections: Correction[];
    };
    analysis?: {
      costBreakdown: CostBreakdown;
      insights: Insight[];
      complianceScore: number;
    };
  }
}
```

## 🔄 파싱 API

### POST /files/{fileId}/parse
파일 파싱 시작

**Request:**
```typescript
{
  extractionRules?: {
    targetSheets?: string[];
    skipRows?: number;
    categories: string[];
  };
  aiModel?: 'standard' | 'advanced';
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    jobId: string;
    status: 'processing';
    estimatedTime: number; // seconds
  }
}
```

### GET /files/{fileId}/parse/status
파싱 진행 상황 조회

**Response:**
```typescript
{
  success: true,
  data: {
    status: 'processing' | 'completed' | 'failed';
    progress: number; // 0-100
    currentStep: string;
    result?: {
      extractedItems: number;
      confidence: number;
      anomalies: Anomaly[];
      processingTime: number;
    };
    error?: string;
  }
}
```

### GET /files/{fileId}/parsed-data
파싱된 데이터 조회

**Response:**
```typescript
{
  success: true,
  data: {
    items: Array<{
      id: string;
      row: number;
      col: number;
      value: string;
      normalizedValue: number;
      category: 'material' | 'labor' | 'overhead' | 'other';
      subcategory?: string;
      unit?: string;
      confidence: number;
      source: {
        sheet: string;
        cell: string;
      };
      flags: string[]; // ['anomaly', 'low_confidence', etc.]
    }>;
    summary: {
      totalItems: number;
      categories: Record<string, number>;
      averageConfidence: number;
      anomalies: number;
    };
  }
}
```

## ✅ 검증 API

### PUT /files/{fileId}/verification
검증 데이터 업데이트

**Request:**
```typescript
{
  corrections: Array<{
    itemId: string;
    originalValue: string;
    correctedValue: string;
    reason: string;
  }>;
  status: 'verified';
  reviewerNotes?: string;
}
```

### GET /files/{fileId}/verification/conflicts
검증 중 충돌 사항 조회

**Response:**
```typescript
{
  success: true,
  data: {
    conflicts: Array<{
      itemId: string;
      type: 'duplicate' | 'inconsistent' | 'missing';
      severity: 'high' | 'medium' | 'low';
      description: string;
      suggestedResolution: string;
    }>;
  }
}
```

## 📊 분석 API

### POST /files/{fileId}/analyze
원가 분석 실행

**Request:**
```typescript
{
  analysisType: 'standard' | 'detailed' | 'comparative';
  benchmarkData?: string[]; // 비교 대상 파일 ID들
  customRules?: AnalysisRule[];
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    costBreakdown: {
      material: { amount: number; percentage: number; };
      labor: { amount: number; percentage: number; };
      overhead: { amount: number; percentage: number; };
      total: number;
    };
    insights: Array<{
      type: 'cost_driver' | 'anomaly' | 'optimization';
      title: string;
      description: string;
      impact: 'high' | 'medium' | 'low';
      recommendation?: string;
    }>;
    complianceScore: number;
    riskFactors: RiskFactor[];
  }
}
```

### GET /files/{fileId}/analysis/golden-set
골든셋 데이터 조회

**Response:**
```typescript
{
  success: true,
  data: {
    referenceData: Array<{
      category: string;
      standardCost: number;
      tolerance: number;
      unit: string;
      source: string;
      lastUpdated: string;
    }>;
    deviations: Array<{
      itemId: string;
      expectedCost: number;
      actualCost: number;
      deviation: number;
      severity: 'high' | 'medium' | 'low';
    }>;
  }
}
```

## 📋 비교 API

### POST /comparison
견적서 비교 분석

**Request:**
```typescript
{
  fileIds: string[];
  comparisonType: 'cost' | 'structure' | 'supplier';
  normalizationRules?: {
    currency: string;
    quantity: number;
    adjustments: Record<string, number>;
  };
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    comparison: {
      files: Array<{
        id: string;
        name: string;
        company: string;
        totalCost: number;
        ranking: number;
      }>;
      categories: Array<{
        name: string;
        costs: Record<string, number>; // fileId -> cost
        variance: number;
        winner: string; // fileId
      }>;
      insights: ComparisonInsight[];
    };
    visualization: {
      chartData: any[];
      tableData: any[][];
    };
  }
}
```

## 📈 대시보드 API

### GET /dashboard/summary
대시보드 요약 데이터

**Query:**
```typescript
{
  dateRange: '7d' | '30d' | '90d' | 'all';
  company?: string;
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    summary: {
      totalFiles: number;
      completionRate: number;
      anomaliesFound: number;
      avgProcessingTime: number;
      costSavings: number;
    };
    workItems: Array<{
      status: ParsingStatus;
      count: number;
      avgAge: number; // days
    }>;
    trends: Array<{
      date: string;
      uploads: number;
      completions: number;
      anomalies: number;
    }>;
    recentActivity: Array<{
      id: string;
      type: 'upload' | 'verification' | 'analysis';
      fileName: string;
      user: string;
      timestamp: string;
    }>;
  }
}
```

## 🔧 시스템 API

### GET /health
시스템 상태 확인

**Response:**
```typescript
{
  success: true,
  data: {
    status: 'healthy';
    version: '1.0.0';
    uptime: number;
    services: {
      database: 'healthy';
      storage: 'healthy';
      ai: 'healthy';
      queue: 'healthy';
    };
  }
}
```

### GET /models
사용 가능한 AI 모델 목록

**Response:**
```typescript
{
  success: true,
  data: {
    models: Array<{
      id: string;
      name: string;
      version: string;
      accuracy: number;
      speed: 'fast' | 'medium' | 'slow';
      supportedFormats: string[];
      isDefault: boolean;
    }>;
  }
}
```

## 🚀 실시간 업데이트 (WebSocket)

### 연결
```
wss://api.cost-analysis.com/ws?token={jwt_token}
```

### 이벤트

**파싱 진행률 업데이트:**
```typescript
{
  type: 'parsing_progress';
  fileId: string;
  progress: number;
  step: string;
}
```

**분석 완료 알림:**
```typescript
{
  type: 'analysis_completed';
  fileId: string;
  results: AnalysisResult;
}
```

**새 파일 업로드 (관리자):**
```typescript
{
  type: 'file_uploaded';
  file: FileInfo;
  uploader: string;
}
```

## ⚠️ 에러 코드

```typescript
enum ErrorCode {
  // 인증
  UNAUTHORIZED = 'AUTH001',
  TOKEN_EXPIRED = 'AUTH002',
  INVALID_CREDENTIALS = 'AUTH003',
  
  // 파일
  FILE_TOO_LARGE = 'FILE001',
  UNSUPPORTED_FORMAT = 'FILE002',
  FILE_CORRUPTED = 'FILE003',
  
  // 파싱
  PARSING_FAILED = 'PARSE001',
  INSUFFICIENT_DATA = 'PARSE002',
  AI_MODEL_ERROR = 'PARSE003',
  
  // 분석
  ANALYSIS_FAILED = 'ANALYSIS001',
  INVALID_PARAMETERS = 'ANALYSIS002',
  
  // 시스템
  RATE_LIMIT_EXCEEDED = 'SYS001',
  SERVICE_UNAVAILABLE = 'SYS002',
  INTERNAL_ERROR = 'SYS999'
}
```

## 📊 데이터 타입 정의

```typescript
type ParsingStatus = 'uploading' | 'extracting' | 'verifying' | 'verified' | 'analyzing' | 'analyzed' | 'failed';

interface ParsedData {
  id: string;
  row: number;
  col: number;
  value: string;
  category: string;
  confidence: number;
  flags: string[];
}

interface CostBreakdown {
  material: { amount: number; percentage: number; };
  labor: { amount: number; percentage: number; };
  overhead: { amount: number; percentage: number; };
  total: number;
}

interface Insight {
  type: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  recommendation?: string;
}
```

## 🛠️ 개발 가이드

### 목업에서 실제 API로 마이그레이션

1. **API 클라이언트 설정**:
```typescript
// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});
```

2. **커스텀 훅 업데이트**:
```typescript
// Before (목업)
export const useParsingData = () => {
  const [files, setFiles] = useState(mockFiles);
  return { files, loading: false, error: null };
};

// After (실제 API)
export const useParsingData = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    api.get('/files')
      .then(response => setFiles(response.data.data.files))
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);
  
  return { files, loading, error };
};
```

3. **실시간 업데이트 추가**:
```typescript
// src/hooks/useWebSocket.ts
export const useWebSocket = () => {
  useEffect(() => {
    const ws = new WebSocket('wss://api.cost-analysis.com/ws');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // 실시간 업데이트 처리
    };
    
    return () => ws.close();
  }, []);
};
```

---

> 💡 **참고**: 이 명세서는 현재 목업 데이터를 기반으로 설계된 이상적인 API 구조입니다. 실제 백엔드 개발 시 참고하세요.