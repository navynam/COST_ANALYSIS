# 아키텍처 / 서비스 호출 관계 (Call Graph)

프론트엔드(`cost-analysis-src`)와 백엔드(`cost-analysis-was`)의 **풀스택 호출 사슬**을
한 곳에서 기록·시각화·검증하는 도구 모음입니다.

```
docs/architecture/
├── call-graph.yaml          ← 단일 원본 (사람/AI가 편집)
├── call-graph.md            ← 자동 생성 (Mermaid 다이어그램 + 조인 표) — 직접 수정 X
├── generate_call_graph.py   ← yaml → md 생성기
├── verify_call_graph.py     ← 실제 소스와 드리프트 검사기
├── _callgraph_common.py     ← 공통 로직 (경로 정규화 / 조인 계산)
└── README.md                ← (이 파일)
```

## 왜 필요한가

- **AI/CLI 효율**: 다음 세션에서 소스를 수정·검색할 때, 어떤 화면이 어떤 API를 거쳐 어떤
  Controller·Service·Repository·Entity 로 이어지는지 즉시 파악 → 탐색 비용 감소.
- **사람 모니터링**: `call-graph.md` 의 도메인별 Mermaid 다이어그램으로 계층을 한눈에.
- **통합 드리프트 감지**: 프론트가 호출하는 엔드포인트와 백엔드가 서빙하는 엔드포인트를
  `(method + 정규화 경로)`로 자동 대조 → **불일치(⚠️)** 를 표면화.

## 사용법

```bash
# 1) 원본 편집
#    docs/architecture/call-graph.yaml  (프론트 calls / 백엔드 endpoints 만 정확히)

# 2) 다이어그램 재생성
npm run callgraph            # = python docs/architecture/generate_call_graph.py

# 3) 실제 소스와 일치하는지 검증 (드리프트 있으면 종료코드 1)
npm run callgraph:verify     # = python docs/architecture/verify_call_graph.py
```

> 최초 1회: `pip install pyyaml` (Python 3.8+ 필요)

## YAML 스키마 (요약)

도메인 1개 = `frontend` 계층 + `backend` 계층. 프론트↔백엔드 링크는 **자동 계산**되므로
아래 두 부분만 정확히 유지하면 됩니다.

```yaml
domains:
  - key: quotation
    title: 견적서
    frontend:
      feature: parsing
      route: /parsing_card
      page:  src/features/parsing/ParsingCardPage.tsx
      hook:  src/features/parsing/hooks/useParsingPage.ts
      integration: integrated        # integrated | partial | mock-only
      services:
        - file: src/features/parsing/services/parsingService.ts
          calls:
            - { fn: fetchQuotationsApi, method: GET,  endpoint: /quotations }
            - { fn: uploadFilesApi,     method: POST, endpoint: /quotations/upload }
    backend:
      package: com.costanalysis.domain.quotation
      controllers:
        - name: QuotationController
          base: /api/v1/quotations
          endpoints:
            - { method: GET,  path: "",       handler: list }
            - { method: POST, path: "/upload", handler: upload }
      services: [QuotationService]
      repositories:
        - { name: QuotationRepository, entity: Quotation }
```

경로 파라미터는 프론트 `${id}` / 백엔드 `{id}` 어느 표기든 무방합니다 —
생성기가 `{}` 로 정규화해 매칭합니다. `path` 값에 `{` 가 들어가면 **따옴표**로 감싸세요
(YAML flow 매핑 규칙). 빈 경로는 `path: ""`.

## 조인/상태 기호

| 기호 | 의미 |
|---|---|
| ✅ | 프론트 호출 ↔ 백엔드 엔드포인트 매칭 |
| ⚠️ | 프론트가 호출하나 매칭되는 백엔드 없음 (불일치/미구현 후보) |
| 💤 | 백엔드가 서빙하나 프론트 호출 없음 (미사용/미연동) |
| 🟢 / 🟡 / ⚪ | integrated / partial / mock-only |

## (선택) 커밋 전 자동 검증 — 하이브리드

주기적 검증을 자동화하려면 git pre-commit 훅으로 `callgraph:verify` 를 연결하세요.

```bash
# .git/hooks/pre-commit (실행권한 부여)
#!/bin/sh
python docs/architecture/verify_call_graph.py || {
  echo "call-graph 드리프트 발견 — call-graph.yaml 갱신 후 다시 커밋하세요.";
  exit 1;
}
```

훅은 로컬(.git/hooks)에만 설치되어 커밋되지 않습니다. 팀 공유가 필요하면
`husky` 등으로 관리하세요.
