"""견적 원가 분석 시스템 - 프로세스 설계서 PPTX 생성"""
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

# ── 색상 ──
RED = RGBColor(230, 0, 18)
DARK = RGBColor(10, 22, 40)
BLUE = RGBColor(0, 56, 117)
WHITE = RGBColor(255, 255, 255)
GRAY = RGBColor(100, 100, 100)
LGRAY = RGBColor(245, 247, 250)
BLACK = RGBColor(25, 31, 40)
GREEN = RGBColor(46, 125, 50)
ORANGE = RGBColor(230, 81, 0)
PURPLE = RGBColor(123, 31, 162)

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

def slide(title, sub=None):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    # 상단바
    b = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, Inches(0.08))
    b.fill.solid(); b.fill.fore_color.rgb = RED; b.line.fill.background()
    # 하단바
    b2 = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, Inches(7.2), prs.slide_width, Inches(0.3))
    b2.fill.solid(); b2.fill.fore_color.rgb = DARK; b2.line.fill.background()
    ft = b2.text_frame; ft.text = "현대모비스 견적 원가 분석 시스템  |  프로세스 설계서  |  Confidential"
    ft.paragraphs[0].font.size = Pt(8); ft.paragraphs[0].font.color.rgb = RGBColor(150,150,150); ft.paragraphs[0].alignment = PP_ALIGN.RIGHT
    # 제목
    tx = s.shapes.add_textbox(Inches(0.6), Inches(0.3), Inches(12), Inches(0.6))
    p = tx.text_frame.paragraphs[0]; p.text = title; p.font.size = Pt(28); p.font.bold = True; p.font.color.rgb = DARK
    if sub:
        p2 = tx.text_frame.add_paragraph(); p2.text = sub; p2.font.size = Pt(14); p2.font.color.rgb = GRAY
    return s

def text(s, l, t, w, h, txt, sz=12, bold=False, color=BLACK, align=PP_ALIGN.LEFT):
    tx = s.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h))
    tf = tx.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = txt; p.font.size = Pt(sz); p.font.bold = bold; p.font.color.rgb = color; p.alignment = align
    return tf

def mtext(s, l, t, w, h, lines, sz=11, color=BLACK):
    tx = s.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h))
    tf = tx.text_frame; tf.word_wrap = True
    for i, line in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        if isinstance(line, tuple):
            p.text = line[0]; p.font.bold = line[1]; p.font.size = Pt(line[2] if len(line)>2 else sz)
            p.font.color.rgb = line[3] if len(line)>3 else color
        else:
            p.text = line; p.font.size = Pt(sz); p.font.color.rgb = color
        p.space_after = Pt(4)
    return tf

def box(s, l, t, w, h, fill=LGRAY, border=None):
    sh = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(l), Inches(t), Inches(w), Inches(h))
    sh.fill.solid(); sh.fill.fore_color.rgb = fill
    if border: sh.line.color.rgb = border; sh.line.width = Pt(1)
    else: sh.line.fill.background()
    return sh

def table(s, l, t, w, data, cw=None):
    r, c = len(data), len(data[0])
    ts = s.shapes.add_table(r, c, Inches(l), Inches(t), Inches(w), Inches(0.35*r))
    tb = ts.table
    if cw:
        for i, ww in enumerate(cw): tb.columns[i].width = Inches(ww)
    for ri, row in enumerate(data):
        for ci, val in enumerate(row):
            cell = tb.cell(ri, ci); cell.text = str(val)
            for p in cell.text_frame.paragraphs:
                p.font.size = Pt(10); p.font.color.rgb = BLACK
                if ri == 0: p.font.bold = True; p.font.color.rgb = WHITE
            cell.fill.solid()
            cell.fill.fore_color.rgb = BLUE if ri == 0 else (WHITE if ri%2==1 else LGRAY)
    return ts

# ═══════════════════════════════════════════
# 슬라이드
# ═══════════════════════════════════════════

# ── 표지 ──
s = prs.slides.add_slide(prs.slide_layouts[6])
bg = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
bg.fill.solid(); bg.fill.fore_color.rgb = DARK; bg.line.fill.background()
b = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, Inches(2.8), prs.slide_width, Inches(0.06))
b.fill.solid(); b.fill.fore_color.rgb = RED; b.line.fill.background()
text(s, 1.5, 1.0, 10, 1, "견적 원가 분석 시스템", 44, True, WHITE, PP_ALIGN.CENTER)
text(s, 1.5, 2.0, 10, 0.6, "프로세스 설계서", 28, False, RGBColor(200,200,200), PP_ALIGN.CENTER)
text(s, 1.5, 3.5, 10, 0.5, "현대모비스  |  원가관리팀", 18, False, RGBColor(180,180,180), PP_ALIGN.CENTER)
text(s, 1.5, 4.2, 10, 0.5, "v2.0  |  2026.04.07", 14, False, RGBColor(140,140,140), PP_ALIGN.CENTER)

# ── 목차 ──
s = slide("목차", "Table of Contents")
mtext(s, 0.8, 1.2, 11, 5, [
    "1.  전체 업무 프로세스 흐름 (메인 워크플로우)",
    "2.  상태 전이도",
    "3.  [1단계] 파일 업로드 및 데이터 추출",
    "4.  [2단계] 데이터 검증",
    "5.  [3단계] 원가 분석",
    "6.  [3단계] 이상치 감지 프로세스",
    "7.  [4단계] 견적서 비교",
    "8.  [5단계] 결과 저장 및 ERP 등록",
    "9.  모델관리 워크플로우 - 수식 관리",
    "10. 모델관리 워크플로우 - 변경 요청 프로세스",
    "11. 모델관리 워크플로우 - 부서별 모델 적용",
    "12. 사용자 역할 및 권한 매트릭스",
    "13. 데이터 흐름도",
    "14. 알림 및 액션 센터",
    "15. 비기능 요구사항 / 용어 정의",
], 16, DARK)

# ── 1. 전체 워크플로우 ──
s = slide("1. 전체 업무 프로세스 흐름", "Main Workflow: 5단계 프로세스")
steps = [
    ("1단계", "파일 업로드\n+ 자동추출", "/parsing\n/parsing_card", RGBColor(0,100,255)),
    ("2단계", "데이터\n검증", "/verification", RGBColor(255,152,0)),
    ("3단계", "원가\n분석", "/analysis", GREEN),
    ("4단계", "견적서\n비교", "/comparison", PURPLE),
    ("5단계", "결과 저장\nERP 등록", "골든셋\nExcel 다운로드", RED),
]
for i, (step, label, path, color) in enumerate(steps):
    x = 0.6 + i * 2.5
    box(s, x, 1.5, 2.1, 2.0, WHITE, color)
    text(s, x+0.1, 1.55, 1.9, 0.35, step, 11, True, color, PP_ALIGN.CENTER)
    text(s, x+0.1, 1.9, 1.9, 0.8, label, 14, True, DARK, PP_ALIGN.CENTER)
    text(s, x+0.1, 2.8, 1.9, 0.6, path, 9, False, GRAY, PP_ALIGN.CENTER)
    if i < 4:
        text(s, x+2.15, 2.2, 0.3, 0.5, "→", 24, True, GRAY, PP_ALIGN.CENTER)

mtext(s, 0.6, 3.8, 12, 3, [
    ("프로세스 요약", True, 16, BLUE),
    "",
    "1단계: 사용자가 Excel 견적서를 업로드하면 AI가 자동으로 재료비/가공비/제경비 항목을 추출합니다.",
    "2단계: 추출된 데이터를 원본 Excel과 좌우 분할 화면에서 1:1 대조하며 검증합니다.",
    "3단계: 검증된 데이터를 기반으로 원가 구조를 분석하고, 이상치를 AI가 자동 감지합니다.",
    "4단계: 여러 업체의 견적서를 나란히 비교하여 최적의 원가를 선택합니다.",
    "5단계: 분석 완료된 데이터를 골든셋(원가계산서)으로 확정하고 ERP에 등록합니다.",
], 12)

# ── 2. 상태 전이도 ──
s = slide("2. 상태 전이도", "File Status Transition Diagram")
table(s, 0.6, 1.3, 12, [
    ["상태", "코드", "설명", "전이 조건", "다음 상태"],
    ["추출중", "extracting", "AI가 Excel에서 데이터를 추출하는 중", "파일 업로드 시 자동 시작", "검증중 / 실패"],
    ["검증중", "verifying", "추출된 데이터의 정확성 검토 단계", "추출 완료 시 자동 전환", "검증완료"],
    ["검증완료", "verified", "검증이 완료되어 분석 준비된 상태", "사용자가 검증 완료 처리", "분석중"],
    ["분석중", "analyzing", "원가 분석이 진행 중인 상태", "사용자가 분석 시작", "분석완료"],
    ["분석완료", "analyzed", "분석 완료, 골든셋 생성 가능", "분석 프로세스 완료", "ERP 등록"],
    ["실패", "failed", "추출 과정에서 오류 발생", "파일 형식 오류 등", "재업로드"],
], [1.2, 1.2, 3, 3, 3.6])

# 전이 다이어그램
box(s, 0.6, 4.8, 12, 2.2, WHITE, RGBColor(200,200,200))
states = [("추출중",1.2,5.3,RGBColor(0,100,255)), ("검증중",3.5,5.3,RGBColor(255,152,0)), ("검증완료",5.8,5.3,GREEN), ("분석중",8.1,5.3,PURPLE), ("분석완료",10.4,5.3,RED)]
for label, x, y, color in states:
    box(s, x, y, 1.8, 0.6, color)
    text(s, x, y+0.1, 1.8, 0.4, label, 12, True, WHITE, PP_ALIGN.CENTER)
for i in range(len(states)-1):
    text(s, states[i][1]+1.85, 5.35, 0.4, 0.4, "→", 18, True, GRAY, PP_ALIGN.CENTER)
# 실패 분기
box(s, 3.5, 6.2, 1.8, 0.5, RGBColor(198,40,40))
text(s, 3.5, 6.25, 1.8, 0.35, "실패", 11, True, WHITE, PP_ALIGN.CENTER)
text(s, 4.2, 5.9, 0.4, 0.3, "↓", 14, True, GRAY, PP_ALIGN.CENTER)

# ── 3. 1단계 업로드 ──
s = slide("3. [1단계] 파일 업로드 및 데이터 추출", "Process: Upload & AI Extraction")
box(s, 0.6, 1.3, 3.8, 5.5, WHITE, RGBColor(200,200,200))
text(s, 0.8, 1.4, 3.5, 0.4, "시퀀스 다이어그램", 14, True, BLUE)
mtext(s, 0.8, 1.9, 3.5, 4.7, [
    ("사용자", True, 11, BLUE),
    "  │ Excel 파일 업로드",
    "  │ (드래그앤드롭/클릭)",
    "  ▼",
    ("시스템", True, 11, GREEN),
    "  │ 파일 검증 (확장자, 크기, 형식)",
    "  │ → AI 엔진에 추출 요청",
    "  ▼",
    ("AI 엔진", True, 11, PURPLE),
    "  │ 파일 구조 분석",
    "  │ 데이터 추출 (0% → 100%)",
    "  │ 결과: 추출 완료 / 실패",
    "  ▼",
    ("사용자에게 상태 업데이트", True, 11, ORANGE),
    "  추출중 → 검증중 (성공)",
    "  추출중 → 실패 (오류)",
], 11)

box(s, 4.8, 1.3, 3.8, 2.5, WHITE, RGBColor(200,200,200))
text(s, 5, 1.4, 3.5, 0.4, "입력 / 출력", 14, True, BLUE)
table(s, 5, 2.0, 3.5, [
    ["구분", "내용"],
    ["입력", "Excel (.xlsx, .xls)"],
    ["처리", "AI 자동 구조 인식 → 항목 분류"],
    ["출력", "파싱 항목, 신뢰도, 이상치"],
    ["실패 시", "오류 사유 + 재업로드 안내"],
], [1, 2.5])

box(s, 4.8, 4.2, 3.8, 2.6, WHITE, RGBColor(200,200,200))
text(s, 5, 4.3, 3.5, 0.4, "비즈니스 규칙", 14, True, ORANGE)
table(s, 5, 4.9, 3.5, [
    ["규칙", "설명"],
    ["BR-001", "지원: .xlsx, .xls"],
    ["BR-002", "동시 다중 파일 업로드 가능"],
    ["BR-003", "실패 시 재처리 가능"],
    ["BR-004", "완료 시 자동 '검증중' 전환"],
], [0.8, 2.7])

box(s, 9, 1.3, 3.8, 5.5, WHITE, RGBColor(200,200,200))
text(s, 9.2, 1.4, 3.5, 0.4, "화면 요소", 14, True, BLUE)
mtext(s, 9.2, 1.9, 3.5, 4.7, [
    ("파싱 페이지 (/parsing, /parsing_card)", True, 11, DARK),
    "",
    "• 드래그앤드롭 업로드 영역",
    "• [파일 업로드] 버튼",
    "• 업로드 큐 (진행률 표시)",
    "",
    "• 상태 필터 칩 (7개 상태)",
    "  전체 / 추출중 / 검증중 /",
    "  검증완료 / 분석중 / 분석완료 / 실패",
    "",
    "• 파일 목록 (테이블 or 카드)",
    "• 각 파일별 진행률 바",
    "",
    ("카드뷰 상태별 표시", True, 11, DARK),
    "• 추출중: 프로그래스바 + %",
    "• 완료: 항목수/신뢰도/이상치",
    "• 실패: 오류 사유 메시지",
], 11)

# ── 4. 2단계 검증 ──
s = slide("4. [2단계] 데이터 검증", "Process: Data Verification")
box(s, 0.6, 1.3, 5.8, 2.8, WHITE, RGBColor(200,200,200))
text(s, 0.8, 1.4, 5.5, 0.4, "시퀀스 다이어그램", 14, True, BLUE)
mtext(s, 0.8, 1.9, 5.5, 2.0, [
    "사용자 → 검증 페이지 진입 → 시스템: 좌(파싱 데이터) + 우(원본 Excel) 로드",
    "사용자 → 좌측 항목 클릭 → 시스템: 우측 Excel 셀 자동 하이라이트",
    "사용자 → 값 수정 (더블클릭) → 시스템: 수정 이력 기록 + 실시간 합계 재계산",
    "사용자 → [완료] 클릭 → 시스템: 상태 '검증중' → '검증완료' 전환",
], 11)

box(s, 0.6, 4.3, 5.8, 2.6, WHITE, RGBColor(200,200,200))
text(s, 0.8, 4.4, 5.5, 0.4, "검증 항목", 14, True, BLUE)
table(s, 0.8, 4.9, 5.5, [
    ["검증 항목", "방법", "조치"],
    ["항목 분류 정확성", "원본 Excel 대조", "잘못된 분류 수정"],
    ["금액 정확성", "원본 셀 값 비교", "오타/오류 수정"],
    ["수식 적합성", "AI 신뢰도 점수 확인", "낮은 신뢰도 재검토"],
    ["이상치 검토", "AI 감지 결과 확인", "판단근거 검토 후 승인/수정"],
], [1.5, 1.8, 2.2])

box(s, 6.8, 1.3, 5.8, 3.2, WHITE, RGBColor(200,200,200))
text(s, 7, 1.4, 5.5, 0.4, "화면: 좌우 분할 검증", 14, True, BLUE)
mtext(s, 7, 1.9, 5.5, 2.4, [
    ("좌측 패널 — 파싱된 데이터", True, 12, DARK),
    "• [표준뷰] / [리스트뷰] 전환",
    "• 카테고리별 계층 구조 (재료비/가공비/제경비)",
    "• 신뢰도 색상 코딩 (초록/노랑/빨강)",
    "• 이상치 ⚠️ 배지 → AI 판단근거 팝오버",
    "• 더블클릭 → 인라인 편집",
    "",
    ("우측 패널 — 원본 Excel", True, 12, DARK),
    "• 원본 Excel 파일 렌더링",
    "• 좌측 항목 클릭 시 해당 셀 하이라이트",
], 11)

box(s, 6.8, 4.7, 5.8, 2.1, WHITE, RGBColor(200,200,200))
text(s, 7, 4.8, 5.5, 0.4, "비즈니스 규칙", 14, True, ORANGE)
table(s, 7, 5.3, 5.5, [
    ["규칙", "설명"],
    ["BR-005", "원본 Excel과 1:1 셀 매핑 표시"],
    ["BR-006", "수정 시 수정자/시간/변경사유 자동 기록"],
    ["BR-007", "이상치 항목은 반드시 검토 후 승인 필요"],
    ["BR-008", "검증 완료 시 '검증완료' 상태로 전환"],
], [1, 4.5])

# ── 5. 3단계 분석 ──
s = slide("5. [3단계] 원가 분석", "Process: Cost Analysis — 4 View Tabs")
table(s, 0.6, 1.3, 12, [
    ["뷰", "목적", "주요 기능"],
    ["표준뷰", "카테고리별 원가 구조 파악", "재료비/가공비/제경비 계층 구조, 신뢰도 바, 이상치 AI 판단근거 팝오버, 인라인 편집"],
    ["리스트뷰", "항목별 상세 비교", "평면 테이블, 정렬/검색 지원, 이상치 풍선 도움말, 인라인 편집"],
    ["관계도", "항목 간 의존성 파악", "노드 그래프, 클릭 시 우측 상세 패널 (금액/신뢰도/AI근거), 원본 데이터 보기 버튼"],
    ["골든셋", "최종 원가계산서", "공식 양식 (원가계산서), Excel 다운로드 (.xls), 인쇄 기능"],
], [1.2, 2.5, 8.3])

mtext(s, 0.6, 3.5, 5.8, 3.5, [
    ("시퀀스 다이어그램", True, 14, BLUE),
    "",
    "사용자 → 분석 페이지 진입",
    "시스템 → 검증 데이터 로드 → AI 원가 구조 분석",
    "사용자 ← 3가지 뷰 표시 (표준/리스트/관계도)",
    "",
    "사용자 → 이상치 항목 클릭",
    "사용자 ← AI 판단근거 팝오버 표시",
    "",
    "사용자 → 골든셋 탭 클릭",
    "사용자 ← 원가계산서 양식 표시",
    "사용자 → Excel 다운로드 클릭",
    "사용자 ← .xls 파일 다운로드 (화면 동일 디자인)",
], 11)

box(s, 6.8, 3.5, 5.8, 3.5, WHITE, RGBColor(200,200,200))
text(s, 7, 3.6, 5.5, 0.4, "비즈니스 규칙", 14, True, ORANGE)
table(s, 7, 4.1, 5.5, [
    ["규칙", "설명"],
    ["BR-009", "이상치 감지 시 AI 판단근거 자동 생성"],
    ["BR-010", "골든셋 Excel은 화면과 동일한 디자인으로 출력"],
    ["BR-011", "분석 완료 시 '분석완료' 상태로 전환"],
    ["BR-012", "원본 데이터 보기는 엑셀 좌표 있는 경우에만 활성화"],
], [1, 4.5])

# ── 6. 이상치 감지 ──
s = slide("6. [3단계] 이상치 감지 프로세스", "AI Anomaly Detection Process")
box(s, 0.6, 1.3, 5.8, 5.5, WHITE, RGBColor(200,200,200))
text(s, 0.8, 1.4, 5.5, 0.4, "감지 프로세스", 16, True, ORANGE)
mtext(s, 0.8, 2.0, 5.5, 4.6, [
    ("AI 엔진 분석", True, 14, BLUE),
    "",
    ("감지 기준 1: 시장가 대비 비교", True, 12, DARK),
    "  → 시장가 대비 33% 초과 시 이상치 판정",
    "  → 예: SKIN(표피재) ₩18,920 (시장가 ₩14,200 대비 +33.2%)",
    "",
    ("감지 기준 2: 과거 분기 평균 대비", True, 12, DARK),
    "  → 과거 3개 분기 평균 대비 편차 기준 초과 시 경고",
    "",
    ("감지 기준 3: 전체 비율 기준", True, 12, DARK),
    "  → 전체 비율에서 비정상적 비율 차지 시 주의",
    "  → 예: 기타 경비가 전체 제경비의 29.4% 차지",
    "",
    ("표시 방식", True, 14, RED),
    "  ⚠️ 배지 표시 → 클릭 시 AI 판단근거 팝오버",
    "  팝오버 내용: 감지 사유 + 비교 데이터 + 권장 조치",
], 11)

box(s, 6.8, 1.3, 5.8, 5.5, WHITE, RGBColor(200,200,200))
text(s, 7, 1.4, 5.5, 0.4, "이상치 표시 화면 예시", 16, True, BLUE)
mtext(s, 7, 2.0, 5.5, 4.6, [
    ("표준뷰에서의 표시", True, 13, DARK),
    "  ■ 재료비 (6건)",
    "  ├─ SKIN(표피재) ⚠️  ₩18,920",
    "  │  [신뢰도 ████░░ 72%]",
    "  │  → 클릭 시 팝오버:",
    "  │  '과거 3분기 평균 ₩14,200 대비 +33.2% 높음'",
    "  ├─ PP수지  ₩694.10",
    "  │  [신뢰도 ██████ 95%]",
    "",
    ("리스트뷰에서의 표시", True, 13, DARK),
    "  이상치 항목의 상태 배지 클릭 → 풍선 도움말",
    "",
    ("관계도에서의 표시", True, 13, DARK),
    "  노드 클릭 → 우측 상세 패널 하단에",
    "  'AI 판단근거' 섹션 표시",
    "",
    ("신뢰도 색상 코딩", True, 13, DARK),
    "  초록(90%+) / 노랑(70~90%) / 빨강(<70%)",
], 11)

# ── 7. 4단계 비교 ──
s = slide("7. [4단계] 견적서 비교", "Process: Quotation Comparison — 3-Step Process")
steps_data = [
    ("Step 1\n아이템 선택", "아이템 코드/품명\n검색으로 선택", RGBColor(0,100,255)),
    ("Step 2\n견적서 선택", "비교할 견적서\n2~4개 복수 선택", RGBColor(255,152,0)),
    ("Step 3\n비교 결과", "항목별 나란히 비교\n최저/최고가 강조", GREEN),
]
for i, (label, desc, color) in enumerate(steps_data):
    x = 0.8 + i * 4.2
    box(s, x, 1.3, 3.6, 1.5, WHITE, color)
    text(s, x+0.1, 1.35, 3.4, 0.7, label, 14, True, color, PP_ALIGN.CENTER)
    text(s, x+0.1, 2.1, 3.4, 0.6, desc, 11, False, GRAY, PP_ALIGN.CENTER)
    if i < 2:
        text(s, x+3.7, 1.8, 0.4, 0.5, "→", 24, True, GRAY, PP_ALIGN.CENTER)

box(s, 0.6, 3.2, 12, 3.7, WHITE, RGBColor(200,200,200))
text(s, 0.8, 3.3, 5.5, 0.4, "비교 결과 표시 방식", 14, True, BLUE)
mtext(s, 0.8, 3.8, 5.5, 2.9, [
    "• 각 업체별 원가 항목을 컬럼으로 나란히 표시",
    "• 최저가 항목: ▼ 표시 + 녹색 강조",
    "• 최고가 항목: ▲ 표시 + 빨간색 강조",
    "• 항목 클릭 시 계산식 비교 팝오버",
    "  (각 업체의 산출 방식 확인 가능)",
    "• 총원가 합계 행: 굵은 글씨 + 배경색 강조",
], 12)

table(s, 7, 3.8, 5.5, [
    ["규칙", "설명"],
    ["BR-013", "최소 2개, 최대 4개 견적서 동시 비교"],
    ["BR-014", "최저가 항목 녹색, 최고가 항목 빨간색 강조"],
    ["BR-015", "각 업체별 산출 방식(계산식) 비교 가능"],
], [1.2, 4.3])

# ── 8. 5단계 ERP ──
s = slide("8. [5단계] 결과 저장 및 ERP 등록", "Process: Golden Set & ERP Registration")
box(s, 0.6, 1.3, 5.8, 5.5, WHITE, RGBColor(200,200,200))
text(s, 0.8, 1.4, 5.5, 0.4, "시퀀스 다이어그램", 14, True, BLUE)
mtext(s, 0.8, 1.9, 5.5, 4.7, [
    ("사용자", True, 12, BLUE),
    "  │ 골든셋 확정",
    "  ▼",
    ("시스템", True, 12, GREEN),
    "  │ 원가계산서 생성",
    "  │ (화면 양식 그대로)",
    "  ▼",
    ("사용자", True, 12, BLUE),
    "  │ Excel 다운로드 (.xls)",
    "  │ - 한 장 시트, 화면 동일 디자인",
    "  │ - 타이틀 15pt / 중간 12pt / 일반 10pt",
    "  │ - 셀 테두리 + 배경색 포함",
    "  ▼",
    ("ERP 시스템 연동", True, 12, RED),
    "  │ 등록 데이터 포맷 변환",
    "  │ ERP 시스템에 자동 등록",
    "  │ 등록 완료 알림",
], 11)

box(s, 6.8, 1.3, 5.8, 5.5, WHITE, RGBColor(200,200,200))
text(s, 7, 1.4, 5.5, 0.4, "골든셋 (원가계산서) 구성", 14, True, BLUE)
mtext(s, 7, 1.9, 5.5, 4.7, [
    ("Excel 출력 내용", True, 13, DARK),
    "",
    "1. 문서 제목: '원 가 계 산 서' (밑줄 스타일)",
    "2. 문서 정보 헤더:",
    "   End품번, End품명, 승인도/대여도, EO_NO,",
    "   SEQ, 차종, 환종, 업체코드, 업체명, 담당자 등",
    "3. 원가 요약 테이블:",
    "   재료비/가공비/제조원가/관리비/이윤/결정단가",
    "4. 재료비 계산내역 (32컬럼):",
    "   NO, LEVEL, Sub타입, 품번, 품명, 재질명, 단가...",
    "   재료비 소계 행",
    "5. 가공비 계산내역 (40컬럼):",
    "   NO, LEVEL, 품번, 공정명, CT, 노무비, 기계경비...",
    "   가공비 소계 행",
    "6. 서명란 (작성/검토/승인)",
    "7. 계산단가 / 조정단가 / 결정단가",
], 11)

# ── 9. 모델관리 수식 ──
s = slide("9. 모델관리 — 수식 관리 프로세스", "Model Management: Formula Administration")
box(s, 0.6, 1.3, 5.8, 5.5, WHITE, RGBColor(200,200,200))
text(s, 0.8, 1.4, 5.5, 0.4, "관리자 (직접 관리)", 14, True, BLUE)
mtext(s, 0.8, 1.9, 5.5, 4.7, [
    ("수식 추가/편집/삭제 → 즉시 반영", True, 12, DARK),
    "",
    "• 수식명 + 유형 (핵심/하위/비율)",
    "• 수식 표현식 입력",
    "• 설명 텍스트",
    "• 변수 목록 (쉼표 구분)",
    "",
    ("적용 부서 설정 (체크박스)", True, 12, BLUE),
    "  □ 전체",
    "  □ 원가관리팀",
    "  □ 견적1팀",
    "  □ 견적2팀",
    "  □ 견적3팀",
    "  □ 구매팀",
    "  □ 품질팀",
    "",
    "• '전체' 선택 시 개별 부서 해제",
    "• 개별 부서 선택 시 '전체' 해제",
], 11)

box(s, 6.8, 1.3, 5.8, 5.5, WHITE, RGBColor(200,200,200))
text(s, 7, 1.4, 5.5, 0.4, "기본 수식 목록", 14, True, BLUE)
table(s, 7, 1.9, 5.5, [
    ["수식명", "유형", "수식", "적용"],
    ["생산원가", "핵심", "생산원가 = 재료비 + 가공비 + 제경비", "전체"],
    ["재료비 소계", "하위", "재료비 = Σ(단가 × 수량 × (1+로스율))", "전체"],
    ["가공비 단가", "하위", "가공비 = (설비감가상각+인건비)/생산수량×CT", "전체"],
    ["제경비율", "비율", "제경비율 = 제경비/(재료비+가공비)×100", "견적1,2팀"],
], [1.2, 0.7, 2.8, 0.8])

mtext(s, 7, 4.5, 5.5, 2.3, [
    ("비즈니스 규칙", True, 14, ORANGE),
    "",
    "BR-016: 핵심(core) 수식은 삭제 불가",
    "BR-017: 이미 대기 중인 요청 시 동일 수식 중복 요청 불가",
    "BR-018: 승인 시 적용 부서를 체크박스로 선택",
    "BR-019: 승인된 변경은 즉시 모델 관리 탭에 반영",
], 11)

# ── 10. 변경 요청 프로세스 ──
s = slide("10. 모델관리 — 변경 요청 프로세스", "Change Request Workflow")
box(s, 0.6, 1.3, 5.8, 5.5, WHITE, RGBColor(200,200,200))
text(s, 0.8, 1.4, 5.5, 0.4, "워크플로우", 16, True, BLUE)
mtext(s, 0.8, 1.9, 5.5, 4.7, [
    ("① 일반 사용자: 요청 제출", True, 13, PURPLE),
    "  수정 요청 또는 새 수식 추가 요청",
    "  + 변경 내용 + 요청 사유 작성",
    "          │",
    "          ▼",
    ("② 변경 요청 탭: [대기] 상태", True, 13, ORANGE),
    "  diff 표시: - 원본(빨강) / + 변경(초록)",
    "  요청자/부서/시간 정보",
    "          │",
    "          ▼",
    ("③ 관리자: 검토", True, 13, BLUE),
    "  ├── 승인: 적용 부서 체크박스 선택",
    "  │    → 선택 부서에 수식 즉시 반영",
    "  └── 반려: 반려 사유 코멘트 작성",
    "",
    ("④ 결과", True, 13, GREEN),
    "  승인 → 모델 관리 탭 수식 업데이트",
    "  반려 → 요청자에게 사유 전달",
], 11)

box(s, 6.8, 1.3, 5.8, 2.5, WHITE, RGBColor(200,200,200))
text(s, 7, 1.4, 5.5, 0.4, "상태 관리", 14, True, BLUE)
table(s, 7, 1.9, 5.5, [
    ["상태", "설명", "사용자 액션", "관리자 액션"],
    ["대기", "요청 접수", "취소 가능", "승인/반려"],
    ["승인", "관리자 승인 완료", "조회만", "적용 부서 표시"],
    ["반려", "관리자 반려", "코멘트 확인", "반려 사유 기록"],
], [0.8, 1.5, 1.5, 1.7])

box(s, 6.8, 4.0, 5.8, 2.8, WHITE, RGBColor(200,200,200))
text(s, 7, 4.1, 5.5, 0.4, "변경 요청 탭 UI", 14, True, BLUE)
mtext(s, 7, 4.6, 5.5, 2.0, [
    "• 상단 필터: [전체] [대기] [승인] [반려] 클릭 필터링",
    "  - 선택된 필터: 두꺼운 테두리 + 배경색 강조",
    "• 각 요청 카드:",
    "  - 요청자 아바타 + 이름/부서/시간 + 상태 배지",
    "  - diff: - 원본 (빨강) / + 변경 (초록)",
    "  - 추가된 변수 칩 표시",
    "• 수식 카드에서 '변경요청 N건' 칩 → 클릭 시 상세 팝업",
    "• 본인 대기 건: [요청 취소] 버튼",
], 11)

# ── 11. 부서별 모델 ──
s = slide("11. 모델관리 — 부서별 모델 적용", "Department-Specific Model Application")
box(s, 0.6, 1.3, 12, 2.5, WHITE, RGBColor(200,200,200))
text(s, 0.8, 1.4, 11.5, 0.4, "부서별 모델 적용 예시", 16, True, BLUE)
mtext(s, 0.8, 1.9, 11.5, 1.7, [
    ("원본 수식 (전체 부서 적용)", True, 13, DARK),
    "  재료비 = Σ(단가 × 수량 × (1 + 로스율))",
    "",
    ("견적1팀 변경 요청 → 관리자 승인 (견적1팀에만 적용)", True, 13, BLUE),
    "  견적1팀: 재료비 = Σ(단가 × 수량 × (1 + 로스율) × 환율보정계수)    ← 변경됨",
    "  견적2팀: 재료비 = Σ(단가 × 수량 × (1 + 로스율))                    ← 원본 유지",
    "  기타 부서: 재료비 = Σ(단가 × 수량 × (1 + 로스율))                  ← 원본 유지",
], 12)

box(s, 0.6, 4.0, 5.8, 2.8, WHITE, RGBColor(200,200,200))
text(s, 0.8, 4.1, 5.5, 0.4, "적용 범위 시나리오", 14, True, BLUE)
mtext(s, 0.8, 4.6, 5.5, 2.0, [
    ("시나리오 1: 전체 적용", True, 12, GREEN),
    "  승인 시 [전체] 체크 → 모든 부서에 즉시 반영",
    "",
    ("시나리오 2: 특정 부서만 적용", True, 12, ORANGE),
    "  승인 시 [견적1팀] [견적2팀] 체크",
    "  → 선택된 부서만 변경, 나머지는 원본 유지",
    "",
    ("시나리오 3: 단일 부서 적용", True, 12, PURPLE),
    "  승인 시 [견적1팀] 만 체크 → 해당 부서만 적용",
], 11)

box(s, 6.8, 4.0, 5.8, 2.8, WHITE, RGBColor(200,200,200))
text(s, 7, 4.1, 5.5, 0.4, "사용자 전환 (데모)", 14, True, BLUE)
mtext(s, 7, 4.6, 5.5, 2.0, [
    "우측 상단 사용자 칩 클릭으로 역할 전환:",
    "",
    ("김관리 (관리자, 원가관리팀)", True, 12, BLUE),
    "  → 직접 편집/삭제, 변경요청 승인/반려",
    "",
    ("이분석 (일반, 견적1팀)", True, 12, PURPLE),
    "  → 수정 요청, 추가 요청 제출만 가능",
    "",
    ("박검증 (일반, 견적2팀)", True, 12, PURPLE),
    "  → 수정 요청, 추가 요청 제출만 가능",
], 11)

# ── 12. 권한 매트릭스 ──
s = slide("12. 사용자 역할 및 권한 매트릭스", "Role-Based Access Control")
table(s, 0.6, 1.3, 8, [
    ["기능", "관리자 (김관리)", "일반 사용자"],
    ["파일 업로드", "O", "O"],
    ["데이터 검증", "O", "O"],
    ["원가 분석", "O", "O"],
    ["견적서 비교", "O", "O"],
    ["골든셋 Excel 다운로드", "O", "O"],
    ["수식 직접 편집/삭제", "O", "X (요청만)"],
    ["새 수식 추가", "O", "X (요청만)"],
    ["변경 요청 승인/반려", "O", "X"],
    ["적용 부서 설정", "O", "X"],
    ["요청 취소 (본인 대기 건)", "-", "O"],
], [3, 2.5, 2.5])

box(s, 9, 1.3, 3.8, 5.5, WHITE, RGBColor(200,200,200))
text(s, 9.2, 1.4, 3.5, 0.4, "역할 정의", 14, True, BLUE)
table(s, 9.2, 1.9, 3.5, [
    ["역할", "설명"],
    ["관리자", "시스템 전체 관리 권한"],
    ["일반 사용자", "업무별 분석 수행"],
], [1, 2.5])
mtext(s, 9.2, 3.3, 3.5, 3.3, [
    ("부서 목록", True, 12, BLUE),
    "• 원가관리팀",
    "• 견적1팀",
    "• 견적2팀",
    "• 견적3팀",
    "• 구매팀",
    "• 품질팀",
    "",
    ("사용자 프리셋 (데모)", True, 12, DARK),
    "• 김관리 - 관리자",
    "• 이분석 - 견적1팀",
    "• 박검증 - 견적2팀",
], 11)

# ── 13. 데이터 흐름 ──
s = slide("13. 데이터 흐름도", "Data Flow Diagram")
flows = [
    ("Excel\n원본파일\n(.xlsx)", 0.5, RGBColor(0,100,255)),
    ("파싱\n데이터\n(JSON)", 3, RGBColor(255,152,0)),
    ("검증\n데이터\n(수정됨)", 5.5, GREEN),
    ("분석\n결과\n(확정)", 8, PURPLE),
]
for label, x, color in flows:
    box(s, x, 1.5, 2, 1.5, WHITE, color)
    text(s, x+0.1, 1.6, 1.8, 1.2, label, 12, True, color, PP_ALIGN.CENTER)
for i in range(len(flows)-1):
    text(s, flows[i][1]+2.05, 2, 0.4, 0.5, "→", 20, True, GRAY, PP_ALIGN.CENTER)

box(s, 6.5, 3.5, 2, 1, WHITE, RED)
text(s, 6.6, 3.6, 1.8, 0.7, "골든셋\n(Excel)", 12, True, RED, PP_ALIGN.CENTER)
box(s, 9.5, 3.5, 2, 1, WHITE, RGBColor(198,40,40))
text(s, 9.6, 3.6, 1.8, 0.7, "ERP\n등록", 12, True, RGBColor(198,40,40), PP_ALIGN.CENTER)
text(s, 8.55, 3.7, 0.4, 0.5, "→", 20, True, GRAY, PP_ALIGN.CENTER)
text(s, 8.8, 2.8, 0.4, 0.5, "↓", 20, True, GRAY, PP_ALIGN.CENTER)

box(s, 0.6, 4.8, 12, 2.0, WHITE, RGBColor(200,200,200))
text(s, 0.8, 4.9, 5.5, 0.4, "저장소 구조", 14, True, BLUE)
table(s, 0.8, 5.3, 11.5, [
    ["저장소", "용도", "키"],
    ["localStorage", "수식 데이터", "cost-analysis-formulas"],
    ["localStorage", "현재 사용자", "cost-analysis-current-user"],
    ["localStorage", "변경 요청", "cost-analysis-change-requests"],
    ["localStorage", "파싱 노트", "parsing-notes"],
], [1.5, 3, 7])

# ── 14. 알림 ──
s = slide("14. 알림 및 액션 센터", "Notification & Action Center")
table(s, 0.6, 1.3, 12, [
    ["유형", "우선순위", "예시", "액션 연결"],
    ["이상치 감지", "긴급", "재료비 항목 2건에서 시장가 대비 33% 초과", "/analysis → 분석 검토"],
    ["분석 대기", "주의", "검증 완료 파일, 원가 분석을 시작하세요", "/analysis → 분석 시작"],
    ["처리 지연", "주의", "파일 파싱 오류, 3일째 대기 중", "/parsing_card → 재처리"],
    ["ERP 등록 대기", "정보", "분석 완료, ERP 시스템에 데이터를 등록하세요", "/parsing_card → ERP 등록"],
    ["검증 진행 중", "정보", "자동 검증 프로세스 진행 중", "/parsing_card → 상태 확인"],
    ["인사이트 리포트", "정보", "원가 절감 포인트 3건 발견", "/analysis → 인사이트 보기"],
], [1.5, 1, 4.5, 5])

mtext(s, 0.6, 4.5, 12, 2.5, [
    ("대시보드 업무 알림 & 액션 센터", True, 14, BLUE),
    "",
    "• 각 알림 카드: 아이콘 + 우선순위 배지(긴급/주의/정보) + 제목 + 설명 + [액션 버튼]",
    "• 긴급 알림 수 상단 배지로 표시",
    "• 알림 클릭 시 해당 페이지로 바로 이동 (필터 적용 상태)",
    "• 파일명, 업체명, 시간 정보 포함",
], 12)

# ── 15. 비기능 / 용어 ──
s = slide("15. 비기능 요구사항 / 용어 정의", "Non-Functional Requirements & Glossary")
table(s, 0.6, 1.3, 5.5, [
    ["항목", "요구사항"],
    ["응답 시간", "페이지 로딩 2초 이내"],
    ["Excel 파싱", "파일당 5분 이내"],
    ["브라우저", "Chrome 90+, Edge 90+, Safari 15+"],
    ["해상도", "최소 1280×720, 권장 1920×1080"],
    ["접근성", "키보드 네비게이션, 스크린리더 지원"],
    ["보안", "사번 인증, 5회 잠금, 역할 기반 접근"],
], [2, 3.5])

table(s, 6.8, 1.3, 5.8, [
    ["용어", "설명"],
    ["골든셋", "검증/분석 완료된 최종 원가계산서 데이터"],
    ["파싱", "Excel에서 AI가 데이터를 자동 추출하는 과정"],
    ["이상치", "AI가 감지한 비정상 원가 항목"],
    ["신뢰도", "AI 파싱 결과의 정확도 (0~100%)"],
    ["변경 요청", "일반 사용자의 수식 수정 승인 요청"],
    ["적용 부서", "수식이 적용되는 대상 부서 범위"],
], [1.5, 4.3])

# ── 끝 ──
s = prs.slides.add_slide(prs.slide_layouts[6])
bg = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
bg.fill.solid(); bg.fill.fore_color.rgb = DARK; bg.line.fill.background()
b = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, Inches(3.5), prs.slide_width, Inches(0.06))
b.fill.solid(); b.fill.fore_color.rgb = RED; b.line.fill.background()
text(s, 1.5, 2.2, 10, 1, "Thank You", 48, True, WHITE, PP_ALIGN.CENTER)
text(s, 1.5, 4.0, 10, 0.6, "현대모비스 견적 원가 분석 시스템 — 프로세스 설계서", 20, False, RGBColor(180,180,180), PP_ALIGN.CENTER)
text(s, 1.5, 4.8, 10, 0.5, "문의: 원가관리팀", 14, False, RGBColor(140,140,140), PP_ALIGN.CENTER)

prs.save(r'c:\WORK\cost-analysis-src\docs\프로세스설계서_견적원가분석시스템.pptx')
print("프로세스 설계서 PPTX 생성 완료!")
