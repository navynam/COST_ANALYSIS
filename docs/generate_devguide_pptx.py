"""개발 가이드 PPTX 생성 - 프론트엔드 & 백엔드"""
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

RED = RGBColor(230, 0, 18); DARK = RGBColor(10, 22, 40); BLUE = RGBColor(0, 56, 117)
WHITE = RGBColor(255, 255, 255); GRAY = RGBColor(100, 100, 100); LGRAY = RGBColor(245, 247, 250)
BLACK = RGBColor(25, 31, 40); GREEN = RGBColor(46, 125, 50); ORANGE = RGBColor(230, 81, 0); PURPLE = RGBColor(123, 31, 162)

prs = Presentation(); prs.slide_width = Inches(13.333); prs.slide_height = Inches(7.5)

def slide(title, sub=None):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    b = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, Inches(0.08)); b.fill.solid(); b.fill.fore_color.rgb = RED; b.line.fill.background()
    b2 = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, Inches(7.2), prs.slide_width, Inches(0.3)); b2.fill.solid(); b2.fill.fore_color.rgb = DARK; b2.line.fill.background()
    ft = b2.text_frame; ft.text = "현대모비스 견적 원가 분석 시스템  |  개발 가이드  |  Confidential"; ft.paragraphs[0].font.size = Pt(8); ft.paragraphs[0].font.color.rgb = RGBColor(150,150,150); ft.paragraphs[0].alignment = PP_ALIGN.RIGHT
    tx = s.shapes.add_textbox(Inches(0.6), Inches(0.3), Inches(12), Inches(0.6)); p = tx.text_frame.paragraphs[0]; p.text = title; p.font.size = Pt(28); p.font.bold = True; p.font.color.rgb = DARK
    if sub: p2 = tx.text_frame.add_paragraph(); p2.text = sub; p2.font.size = Pt(14); p2.font.color.rgb = GRAY
    return s

def text(s, l, t, w, h, txt, sz=12, bold=False, color=BLACK, align=PP_ALIGN.LEFT):
    tx = s.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h)); tf = tx.text_frame; tf.word_wrap = True; p = tf.paragraphs[0]; p.text = txt; p.font.size = Pt(sz); p.font.bold = bold; p.font.color.rgb = color; p.alignment = align; return tf

def mtext(s, l, t, w, h, lines, sz=11, color=BLACK):
    tx = s.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h)); tf = tx.text_frame; tf.word_wrap = True
    for i, line in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        if isinstance(line, tuple): p.text = line[0]; p.font.bold = line[1]; p.font.size = Pt(line[2] if len(line)>2 else sz); p.font.color.rgb = line[3] if len(line)>3 else color
        else: p.text = line; p.font.size = Pt(sz); p.font.color.rgb = color
        p.space_after = Pt(3)

def box(s, l, t, w, h, fill=LGRAY, border=None):
    sh = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(l), Inches(t), Inches(w), Inches(h)); sh.fill.solid(); sh.fill.fore_color.rgb = fill
    if border: sh.line.color.rgb = border; sh.line.width = Pt(1)
    else: sh.line.fill.background()

def table(s, l, t, w, data, cw=None):
    r, c = len(data), len(data[0]); ts = s.shapes.add_table(r, c, Inches(l), Inches(t), Inches(w), Inches(0.32*r)); tb = ts.table
    if cw:
        for i, ww in enumerate(cw): tb.columns[i].width = Inches(ww)
    for ri, row in enumerate(data):
        for ci, val in enumerate(row):
            cell = tb.cell(ri, ci); cell.text = str(val)
            for p in cell.text_frame.paragraphs: p.font.size = Pt(9); p.font.color.rgb = BLACK if ri else WHITE; p.font.bold = ri == 0
            cell.fill.solid(); cell.fill.fore_color.rgb = BLUE if ri == 0 else (WHITE if ri%2==1 else LGRAY)

# ═══════════════ 표지 ═══════════════
s = prs.slides.add_slide(prs.slide_layouts[6])
bg = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height); bg.fill.solid(); bg.fill.fore_color.rgb = DARK; bg.line.fill.background()
b = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, Inches(2.8), prs.slide_width, Inches(0.06)); b.fill.solid(); b.fill.fore_color.rgb = RED; b.line.fill.background()
text(s, 1.5, 1.0, 10, 1, "견적 원가 분석 시스템", 44, True, WHITE, PP_ALIGN.CENTER)
text(s, 1.5, 2.0, 10, 0.6, "개발 가이드 (프론트엔드 & 백엔드)", 24, False, RGBColor(200,200,200), PP_ALIGN.CENTER)
text(s, 1.5, 3.5, 10, 0.5, "React 18 + Spring Boot 3.2 + PostgreSQL 16", 16, False, RGBColor(180,180,180), PP_ALIGN.CENTER)
text(s, 1.5, 4.2, 10, 0.5, "v2.0  |  2026.04.08", 14, False, RGBColor(140,140,140), PP_ALIGN.CENTER)

# ═══════════════ 목차 ═══════════════
s = slide("목차")
mtext(s, 0.8, 1.2, 5, 5, [
    ("Part 1: 전체 아키텍처", True, 16, BLUE), "",
    "1. 시스템 구성도",
    "2. 기술 스택 (프론트/백엔드)",
    "3. 프로파일 & 실행 모드",
    "",
    ("Part 2: 프론트엔드", True, 16, GREEN), "",
    "4. 프로젝트 구조",
    "5. Feature 모듈 패턴",
    "6. API 연동 가이드",
    "7. CSS Module 규칙",
], 14, DARK)
mtext(s, 7, 1.2, 5, 5, [
    ("Part 3: 백엔드", True, 16, ORANGE), "",
    "8. 패키지 구조",
    "9. 도메인 모듈 패턴",
    "10. Mock 프로파일 가이드",
    "11. API 개발 패턴",
    "",
    ("Part 4: 연동 & 배포", True, 16, PURPLE), "",
    "12. 프론트 ↔ 백엔드 연동",
    "13. Docker 배포",
    "14. Quick Start",
], 14, DARK)

# ═══════════════ 1. 시스템 구성도 ═══════════════
s = slide("1. 시스템 구성도", "System Architecture")
comps = [
    ("Browser (React 18)", 4, 0.3, 5, 0.7, RGBColor(0,100,255)),
    ("Nginx :80 (정적파일 + /api 프록시)", 4, 1.5, 5, 0.7, GREEN),
    ("Spring Boot :8080 (REST API)", 4, 2.7, 5, 0.7, RED),
]
for label, x, y, w, h, color in comps:
    box(s, x, y+1, w, h, WHITE, color); text(s, x+0.1, y+1.05, w-0.2, h-0.1, label, 13, True, color, PP_ALIGN.CENTER)
for y in [1.7, 2.9]:
    text(s, 6.3, y+0.7, 0.4, 0.4, "↓", 18, True, GRAY, PP_ALIGN.CENTER)

infra = [("PostgreSQL\n:5432", 1, 5, 2.5, RGBColor(51,103,145)), ("Redis\n:6379", 4, 5, 2, RGBColor(220,53,69)), ("MinIO\n:9000", 6.5, 5, 2, ORANGE), ("Claude API", 9, 5, 2.5, PURPLE)]
for label, x, y, w, color in infra:
    box(s, x, y, w, 0.8, WHITE, color); text(s, x+0.1, y+0.05, w-0.2, 0.7, label, 11, True, color, PP_ALIGN.CENTER)

box(s, 0.6, 6.2, 12, 0.8, LGRAY)
mtext(s, 0.8, 6.25, 11.5, 0.6, [
    ("개발 모드", True, 11, BLUE), "  React dev server(:3000) → setupProxy.js → Spring Boot(:8080)     |     ",
    ("운영 모드", True, 11, GREEN), "  Nginx(:80) → React build + /api → Spring Boot(:8080)",
], 10)

# ═══════════════ 2. 기술 스택 ═══════════════
s = slide("2. 기술 스택", "Frontend & Backend")
text(s, 0.6, 1.1, 5.8, 0.4, "프론트엔드", 16, True, BLUE)
table(s, 0.6, 1.5, 5.8, [
    ["기술", "버전", "용도"],
    ["React", "18.2", "UI 프레임워크"],
    ["TypeScript", "5.9", "타입 안전성"],
    ["MUI", "5.15", "UI 컴포넌트"],
    ["Axios", "1.14", "HTTP 클라이언트"],
    ["React Router", "6.20", "SPA 라우팅"],
    ["Recharts", "2.10", "차트"],
    ["SheetJS", "0.18.5", "Excel 처리"],
    ["CSS Modules", "-", "스타일 분리"],
], [1.5, 1, 3.3])

text(s, 6.8, 1.1, 5.8, 0.4, "백엔드", 16, True, ORANGE)
table(s, 6.8, 1.5, 5.8, [
    ["기술", "버전", "용도"],
    ["Spring Boot", "3.2.4", "REST API"],
    ["Java", "17 LTS", "백엔드 개발"],
    ["Spring Data JPA", "-", "ORM"],
    ["PostgreSQL", "16", "메인 DB"],
    ["Redis", "7", "캐시/JWT"],
    ["MinIO", "latest", "파일 스토리지"],
    ["JWT (jjwt)", "0.12.5", "토큰 인증"],
    ["Docker Compose", "3.9", "배포"],
], [1.5, 1, 3.3])

# ═══════════════ 3. 프로파일 ═══════════════
s = slide("3. 프로파일 & 실행 모드", "Development Profiles")
table(s, 0.6, 1.3, 12, [
    ["모드", "프론트 USE_API", "백엔드 Profile", "DB", "Redis", "설명"],
    ["로컬 단독", "false", "불필요", "X", "X", "프론트만 실행, localStorage/mock 데이터"],
    ["Mock 연동", "true", "mock", "H2 (인메모리)", "X", "프론트+백엔드, DB 설치 불필요"],
    ["Dev 연동", "true", "dev", "PostgreSQL", "Redis", "프론트+백엔드+DB (Docker)"],
    ["운영", "true", "(기본)", "PostgreSQL", "Redis", "Nginx+Spring Boot+DB (Docker)"],
], [1.2, 1.5, 1.5, 2, 1.2, 4.6])

box(s, 0.6, 3.8, 5.8, 3.0, WHITE, RGBColor(200,200,200))
text(s, 0.8, 3.9, 5.5, 0.4, "프론트엔드 API 토글", 14, True, BLUE)
mtext(s, 0.8, 4.4, 5.5, 2.2, [
    "// src/shared/api/config.ts",
    "",
    "export const USE_API = true;",
    "// true  → 백엔드 API 호출",
    "// false → localStorage/mock (백엔드 불필요)",
    "",
    "API 실패 시 자동으로 로컬 데이터 fallback",
], 11)

box(s, 6.8, 3.8, 5.8, 3.0, WHITE, RGBColor(200,200,200))
text(s, 7, 3.9, 5.5, 0.4, "백엔드 Mock 프로파일", 14, True, ORANGE)
mtext(s, 7, 4.4, 5.5, 2.2, [
    "# 실행 방법",
    "set SPRING_PROFILES_ACTIVE=mock",
    "./gradlew bootRun",
    "",
    "# Mock 모드 특징:",
    "• DB/Redis/MinIO 연결 없음 (H2 인메모리)",
    "• JWT 인증 없이 모든 API 허용",
    "• 인메모리 목업 데이터 (프론트 동일)",
], 11)

# ═══════════════ 4. 프론트 구조 ═══════════════
s = slide("4. 프론트엔드 프로젝트 구조", "React Project Structure")
mtext(s, 0.6, 1.2, 5.8, 5.5, [
    ("src/features/ (도메인 모듈)", True, 14, BLUE), "",
    ("analysis/", True, 11, DARK), "  원가 분석 (표준/리스트/관계도/골든셋)",
    ("auth/", True, 11, DARK), "  로그인 (사번 인증)",
    ("comparison/", True, 11, DARK), "  견적서 비교 (3단계)",
    ("dashboard/", True, 11, DARK), "  대시보드 (현황/알림)",
    ("history/", True, 11, DARK), "  이력/알림",
    ("insight/", True, 11, DARK), "  AI 인사이트 채팅",
    ("model-management/", True, 11, DARK), "  모델관리 + 변경요청",
    ("parsing/", True, 11, DARK), "  견적서 분석 (카드/리스트)",
    ("settings/", True, 11, DARK), "  설정 (프로필/비밀번호/테마)",
    ("verification/", True, 11, DARK), "  데이터 검증 (좌우 분할)",
], 11)

mtext(s, 6.8, 1.2, 5.8, 5.5, [
    ("각 Feature 모듈 구조", True, 14, GREEN), "",
    "features/{name}/",
    "├── {Name}Page.tsx           페이지 컴포넌트",
    "├── {Name}Page.module.css    CSS Module",
    "├── components/              하위 컴포넌트",
    "├── data/                    목업 데이터",
    "├── hooks/                   UI 상태 (useState)",
    "├── services/                API + 비즈니스 로직",
    "└── types.ts                 타입 정의",
    "",
    ("src/shared/ (공통)", True, 14, PURPLE), "",
    "├── api/                     apiClient + config",
    "├── components/              SmartGuide 등",
    "├── constants/               colors.ts",
    "├── layouts/                 MainLayout, Sidebar",
    "└── styles/                  tableStyles.ts",
], 11)

# ═══════════════ 5. Feature 패턴 ═══════════════
s = slide("5. Feature 모듈 패턴", "Layer Responsibilities")
table(s, 0.6, 1.3, 12, [
    ["레이어", "파일", "책임", "규칙"],
    ["Page", "XxxPage.tsx", "화면 구성, 레이아웃, 이벤트 핸들링", "Hook/Service만 호출, 비즈니스 로직 금지"],
    ["Component", "components/*.tsx", "재사용 UI 컴포넌트", "props로 데이터 전달, 상태 최소화"],
    ["Hook", "hooks/useXxx.ts", "UI 상태 (useState, useEffect)", "모달/탭/폼 상태, Service 함수 호출"],
    ["Service", "services/xxxService.ts", "API 호출, 데이터 변환, localStorage", "apiClient 사용, USE_API 분기"],
    ["Type", "types.ts", "인터페이스/타입 정의", "Entity 직접 노출 금지"],
    ["CSS", "*.module.css", "레이아웃 스타일만", "fontSize/fontWeight/color는 sx에 유지"],
], [1.2, 2, 3.5, 5.3])

box(s, 0.6, 4.5, 12, 2.3, WHITE, RGBColor(200,200,200))
text(s, 0.8, 4.6, 5.5, 0.4, "서비스 함수 패턴 (API + Fallback)", 14, True, BLUE)
mtext(s, 0.8, 5.1, 11.5, 1.5, [
    "// 1. 로컬 함수 (fallback)",
    "export const loadFormulasLocal = (): Formula[] => { localStorage... };",
    "",
    "// 2. API 함수",
    "export const fetchFormulasApi = async () => { return apiClient.get('/models/formulas'); };",
    "",
    "// 3. 통합 함수",
    "export const getFormulas = async () => { if (USE_API) { try { return fetchFormulasApi(); } catch { return loadFormulasLocal(); } } };",
], 10)

# ═══════════════ 6. API 연동 ═══════════════
s = slide("6. API 연동 가이드", "Frontend → Backend Communication")
table(s, 0.6, 1.3, 12, [
    ["프론트 서비스", "API 엔드포인트", "Method", "설명"],
    ["authService.loginApi()", "/api/v1/auth/login", "POST", "로그인 → JWT 토큰 발급"],
    ["parsingService.fetchQuotationsApi()", "/api/v1/quotations", "GET", "견적서 목록 (필터/검색)"],
    ["parsingService.uploadFilesApi()", "/api/v1/quotations/upload", "POST", "파일 업로드 (multipart)"],
    ["dashboardService.fetchDashboardStatsApi()", "/api/v1/dashboard/stats", "GET", "대시보드 통계"],
    ["modelService.fetchFormulasApi()", "/api/v1/models/formulas", "GET", "수식 목록"],
    ["modelService.createFormulaApi()", "/api/v1/models/formulas", "POST", "수식 추가 (ADMIN)"],
    ["workflowService.fetchChangeRequestsApi()", "/api/v1/models/change-requests", "GET", "변경 요청 목록"],
    ["workflowService.approveRequestApi()", "/api/v1/.../approve", "PUT", "승인 (ADMIN)"],
    ["historyService.fetchNotificationsApi()", "/api/v1/notifications", "GET", "알림 목록"],
    ["insightService.sendMessageApi()", "/api/v1/insights/sessions/{id}/chat", "POST", "AI 채팅"],
], [3, 4, 1, 4])

# ═══════════════ 7. CSS Module ═══════════════
s = slide("7. CSS Module 규칙", "Styling Convention")
box(s, 0.6, 1.3, 5.8, 5.5, WHITE, RGBColor(200,200,200))
text(s, 0.8, 1.4, 5.5, 0.4, "CSS Module에 넣는 것 (레이아웃)", 14, True, GREEN)
mtext(s, 0.8, 1.9, 5.5, 4.7, [
    "✅ display: flex",
    "✅ flex-direction: column",
    "✅ align-items: center",
    "✅ justify-content: space-between",
    "✅ overflow: hidden / auto",
    "✅ border-radius: 12px",
    "✅ transition: all 0.2s",
    "✅ cursor: pointer",
    "✅ text-overflow: ellipsis",
    "✅ white-space: nowrap",
    "",
    ("사용법:", True, 11, DARK),
    "import styles from './Page.module.css';",
    "<Box className={styles.container}>",
], 11)

box(s, 6.8, 1.3, 5.8, 5.5, WHITE, RGBColor(200,200,200))
text(s, 7, 1.4, 5.5, 0.4, "MUI sx에 유지하는 것", 14, True, RED)
mtext(s, 7, 1.9, 5.5, 4.7, [
    "❌ fontSize → MUI Typography와 충돌",
    "❌ fontWeight → 같은 이유",
    "❌ color → 동적 값 + MUI 테마 참조",
    "❌ backgroundColor → 동적 값",
    "❌ padding/margin → MUI spacing 단위",
    "❌ 동적 값 (${variable})",
    "❌ MUI 선택자 (&:hover, &.Mui-*)",
    "",
    ("올바른 예:", True, 11, DARK),
    '<Typography sx={{ fontSize: 14,',
    '  fontWeight: 700, color: "#333" }}>',
    "",
    ("잘못된 예:", True, 11, RED),
    "// .title { font-size: 14px; }",
    "// → MUI 기본 16px와 충돌!",
], 11)

# ═══════════════ 8. 백엔드 구조 ═══════════════
s = slide("8. 백엔드 패키지 구조", "Spring Boot Project Structure")
mtext(s, 0.6, 1.2, 5.8, 5.5, [
    ("domain/ (10개 도메인)", True, 14, ORANGE), "",
    ("auth/", True, 11, DARK), "  로그인 (JWT 발급, 5회 잠금)",
    ("user/", True, 11, DARK), "  사용자 관리 (프로필, 비밀번호)",
    ("quotation/", True, 11, DARK), "  견적서 파싱 + 노트",
    ("verification/", True, 11, DARK), "  데이터 검증",
    ("analysis/", True, 11, DARK), "  원가 분석 + 골든셋",
    ("comparison/", True, 11, DARK), "  견적서 비교",
    ("model/", True, 11, DARK), "  수식 관리 + 변경 요청",
    ("insight/", True, 11, DARK), "  AI 인사이트 (Claude API)",
    ("notification/", True, 11, DARK), "  알림/이력",
    ("dashboard/", True, 11, DARK), "  대시보드 통계",
], 11)

mtext(s, 6.8, 1.2, 5.8, 5.5, [
    ("각 도메인 모듈 구조", True, 14, BLUE), "",
    "domain/{name}/",
    "├── controller/    REST API (@RestController)",
    "├── dto/           요청/응답 DTO",
    "├── entity/        JPA Entity (@Entity)",
    "├── repository/    Spring Data JPA",
    "└── service/       비즈니스 로직 (@Service)",
    "",
    ("global/ (공통 인프라)", True, 14, PURPLE), "",
    "├── config/    Security, CORS, MinIO, WebClient",
    "├── security/  JWT 토큰 발급/검증, 인증 필터",
    "├── exception/ ErrorCode, BusinessException",
    "├── response/  ApiResponse (공통 응답)",
    "├── storage/   MinIO 파일 업/다운로드",
    "└── mock/      목업 모드 전용 빈/서비스",
], 11)

# ═══════════════ 9. 백엔드 패턴 ═══════════════
s = slide("9. 백엔드 도메인 모듈 패턴", "Spring Boot Coding Pattern")
box(s, 0.6, 1.3, 5.8, 5.5, WHITE, RGBColor(200,200,200))
text(s, 0.8, 1.4, 5.5, 0.4, "레이어 규칙", 14, True, ORANGE)
table(s, 0.8, 1.9, 5.5, [
    ["레이어", "책임", "규칙"],
    ["Controller", "HTTP 요청/응답", "비즈니스 로직 금지"],
    ["Service", "비즈니스 로직", "@Transactional 사용"],
    ["Repository", "데이터 접근", "JPA 쿼리 메서드"],
    ["Entity", "DB 매핑", "Lombok @Getter"],
    ["DTO", "데이터 전달", "Entity 직접 노출 금지"],
], [1.2, 1.8, 2.5])

box(s, 6.8, 1.3, 5.8, 5.5, WHITE, RGBColor(200,200,200))
text(s, 7, 1.4, 5.5, 0.4, "어노테이션 규칙", 14, True, BLUE)
mtext(s, 7, 1.9, 5.5, 4.7, [
    ("실제 서비스 (DB 사용)", True, 12, DARK),
    "@Service",
    "@Profile(\"!mock\")",
    "@RequiredArgsConstructor",
    "@Transactional(readOnly = true)",
    "",
    ("목업 서비스 (인메모리)", True, 12, DARK),
    "@Service",
    "@Profile(\"mock\")",
    "",
    ("컨트롤러", True, 12, DARK),
    "@RestController",
    "@RequestMapping(\"/api/v1/...\")",
    "@RequiredArgsConstructor",
    "",
    ("관리자 전용", True, 12, RED),
    "@PreAuthorize(\"hasRole('ADMIN')\")",
], 10)

# ═══════════════ 10. Mock 가이드 ═══════════════
s = slide("10. Mock 프로파일 가이드", "Running without Database")
box(s, 0.6, 1.3, 5.8, 5.5, WHITE, RGBColor(200,200,200))
text(s, 0.8, 1.4, 5.5, 0.4, "Mock 모드란?", 14, True, BLUE)
mtext(s, 0.8, 1.9, 5.5, 4.7, [
    "DB/Redis/MinIO 없이 백엔드 독립 실행",
    "",
    ("특징:", True, 12, DARK),
    "• H2 인메모리 DB (자동 생성/삭제)",
    "• JWT 인증 없이 모든 API 허용",
    "• 인메모리 목업 데이터 (프론트와 동일)",
    "• 서버 재시작 시 데이터 초기화",
    "",
    ("목업 데이터:", True, 12, DARK),
    "• 사용자 3명 (관리자 1 + 일반 2)",
    "• 견적서 20건 (6개 상태 분포)",
    "• 수식 4개 + 변경요청 2건",
    "• 알림 5건",
    "",
    ("구현 위치:", True, 12, DARK),
    "global/mock/MockDataStore.java",
    "global/mock/MockSecurityConfig.java",
    "domain/*/service/Mock*Service.java",
], 11)

box(s, 6.8, 1.3, 5.8, 5.5, WHITE, RGBColor(200,200,200))
text(s, 7, 1.4, 5.5, 0.4, "실행 방법", 14, True, GREEN)
mtext(s, 7, 1.9, 5.5, 4.7, [
    ("Windows:", True, 12, DARK),
    "set SPRING_PROFILES_ACTIVE=mock",
    "gradlew bootRun",
    "",
    ("Mac/Linux:", True, 12, DARK),
    "SPRING_PROFILES_ACTIVE=mock ./gradlew bootRun",
    "",
    ("IntelliJ:", True, 12, DARK),
    "Run Configuration → Active profiles: mock",
    "",
    ("확인:", True, 12, DARK),
    "curl http://localhost:8080/api/v1/quotations",
    "curl http://localhost:8080/api/v1/models/formulas",
    "",
    ("Swagger UI:", True, 12, DARK),
    "http://localhost:8080/swagger-ui/index.html",
], 11)

# ═══════════════ 11. 연동 ═══════════════
s = slide("12. 프론트 ↔ 백엔드 연동", "Integration Guide")
box(s, 0.6, 1.3, 12, 2.5, WHITE, RGBColor(200,200,200))
text(s, 0.8, 1.4, 11.5, 0.4, "Quick Start — 3단계로 연동", 16, True, BLUE)
mtext(s, 0.8, 1.9, 11.5, 1.7, [
    ("Step 1: 백엔드 시작", True, 13, ORANGE),
    "  cd cost-analysis-was && set SPRING_PROFILES_ACTIVE=mock && gradlew bootRun",
    "",
    ("Step 2: 프론트엔드 시작", True, 13, GREEN),
    "  cd cost-analysis-src && npm start      (USE_API = true 확인)",
    "",
    ("Step 3: 브라우저 확인", True, 13, BLUE),
    "  http://localhost:3000/COST_ANALYSIS    (F12 Network에서 /api 요청 확인)",
], 12)

table(s, 0.6, 4.2, 12, [
    ["프론트 localStorage 키", "백엔드 API", "Mock 데이터", "전환 상태"],
    ["cost-analysis-formulas", "GET /api/v1/models/formulas", "4개 수식", "✅ API 전환 완료"],
    ["cost-analysis-change-requests", "GET /api/v1/models/change-requests", "2건", "✅ API 전환 완료"],
    ["cost-analysis-current-user", "GET /api/v1/users/me (JWT)", "김관리(ADMIN)", "✅ API 전환 완료"],
    ["parsing-notes", "GET /api/v1/quotations/notes", "0건", "✅ API 전환 완료"],
    ["(initialFiles)", "GET /api/v1/quotations", "20건", "✅ API 전환 완료"],
    ["guide-dismissed-{path}", "프론트 유지", "-", "DB 불필요 (UI 설정)"],
], [2.5, 3.5, 2, 4])

# ═══════════════ 12. Docker 배포 ═══════════════
s = slide("13. Docker 배포", "Production Deployment")
table(s, 0.6, 1.3, 7, [
    ["서비스", "이미지", "포트", "용도"],
    ["nginx", "nginx:1.25", ":80", "웹서버 + 리버스 프록시"],
    ["app", "Dockerfile", ":8080", "Spring Boot WAS"],
    ["postgres", "postgres:16", ":5432", "메인 DB"],
    ["redis", "redis:7", ":6379", "캐시 + JWT"],
    ["minio", "minio:latest", ":9000/9001", "파일 스토리지"],
], [1.2, 1.5, 1.3, 3])

box(s, 8, 1.3, 4.8, 5.5, WHITE, RGBColor(200,200,200))
text(s, 8.2, 1.4, 4.5, 0.4, "배포 절차", 14, True, GREEN)
mtext(s, 8.2, 1.9, 4.5, 4.7, [
    ("1. 환경 변수 설정", True, 12, DARK),
    "cd cost-analysis-was",
    "cp .env.example .env",
    "vim .env  # 비밀번호 설정",
    "",
    ("2. 프론트엔드 빌드", True, 12, DARK),
    "cd ../cost-analysis-src",
    "npm run build",
    "",
    ("3. Docker 실행", True, 12, DARK),
    "cd ../cost-analysis-was",
    "docker-compose up -d",
    "",
    ("4. 접속 확인", True, 12, DARK),
    "프론트: http://localhost",
    "API: http://localhost:8080",
    "Swagger: .../swagger-ui",
    "MinIO: http://localhost:9001",
], 11)

# ═══════════════ Thank You ═══════════════
s = prs.slides.add_slide(prs.slide_layouts[6])
bg = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height); bg.fill.solid(); bg.fill.fore_color.rgb = DARK; bg.line.fill.background()
b = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, Inches(3.5), prs.slide_width, Inches(0.06)); b.fill.solid(); b.fill.fore_color.rgb = RED; b.line.fill.background()
text(s, 1.5, 2.2, 10, 1, "Happy Coding!", 48, True, WHITE, PP_ALIGN.CENTER)
text(s, 1.5, 4.0, 10, 0.6, "견적 원가 분석 시스템 — 개발 가이드", 20, False, RGBColor(180,180,180), PP_ALIGN.CENTER)

prs.save(r'c:\WORK\cost-analysis-src\docs\개발가이드_프론트백엔드.pptx')
print("개발 가이드 PPTX 생성 완료!")
