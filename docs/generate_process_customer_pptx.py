"""현대모비스 견적 원가 분석 시스템 — 고객 설명 자료 PPTX"""
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

RED = RGBColor(230, 0, 18); DARK = RGBColor(10, 22, 40); BLUE = RGBColor(0, 56, 117)
WHITE = RGBColor(255, 255, 255); GRAY = RGBColor(100, 100, 100); LGRAY = RGBColor(245, 247, 250)
BLACK = RGBColor(25, 31, 40); GREEN = RGBColor(16, 185, 129); AMBER = RGBColor(245, 158, 11)
VIOLET = RGBColor(139, 92, 246); INDIGO = RGBColor(99, 102, 241); TEAL = RGBColor(13, 148, 136)
EMERALD = RGBColor(16, 185, 129); ERED = RGBColor(239, 68, 68)

prs = Presentation(); prs.slide_width = Inches(13.333); prs.slide_height = Inches(7.5)

def slide(title, sub=None):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    b = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, Inches(0.08)); b.fill.solid(); b.fill.fore_color.rgb = RED; b.line.fill.background()
    b2 = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, Inches(7.2), prs.slide_width, Inches(0.3)); b2.fill.solid(); b2.fill.fore_color.rgb = DARK; b2.line.fill.background()
    ft = b2.text_frame; ft.text = "현대모비스 견적 원가 분석 시스템  |  업무 프로세스  |  Confidential"; ft.paragraphs[0].font.size = Pt(8); ft.paragraphs[0].font.color.rgb = RGBColor(150,150,150); ft.paragraphs[0].alignment = PP_ALIGN.RIGHT
    tx = s.shapes.add_textbox(Inches(0.6), Inches(0.3), Inches(12), Inches(0.6)); p = tx.text_frame.paragraphs[0]; p.text = title; p.font.size = Pt(28); p.font.bold = True; p.font.color.rgb = DARK
    if sub: p2 = tx.text_frame.add_paragraph(); p2.text = sub; p2.font.size = Pt(14); p2.font.color.rgb = GRAY
    return s

def text(s, l, t, w, h, txt, sz=12, bold=False, color=BLACK, align=PP_ALIGN.LEFT):
    tx = s.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h)); tf = tx.text_frame; tf.word_wrap = True; p = tf.paragraphs[0]; p.text = txt; p.font.size = Pt(sz); p.font.bold = bold; p.font.color.rgb = color; p.alignment = align

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
text(s, 1.5, 2.0, 10, 0.6, "업무 프로세스 설명서", 28, False, RGBColor(200,200,200), PP_ALIGN.CENTER)
text(s, 1.5, 3.5, 10, 0.5, "현대모비스  |  원가관리팀", 18, False, RGBColor(180,180,180), PP_ALIGN.CENTER)
text(s, 1.5, 4.2, 10, 0.5, "v2.0  |  2026.04.13", 14, False, RGBColor(140,140,140), PP_ALIGN.CENTER)

# ═══════════════ 전체 프로세스 ═══════════════
s = slide("전체 업무 프로세스 흐름", "8단계 프로세스: 업로드 → 검증 → 분석 → 비교 → 인사이트")
steps = [
    ("STEP 1", "업로드\n+자동파싱", AMBER), ("STEP 2", "파싱 검증\n원본 대조", RGBColor(59,130,246)),
    ("STEP 3", "분석 요청\n(자동)", VIOLET), ("STEP 4", "분석 완료", EMERALD),
]
steps2 = [
    ("STEP 5", "분석 상세\n오류 수정", INDIGO), ("STEP 6", "원본 피드백\n노트/하이라이트", RGBColor(220,53,69)),
    ("STEP 7", "견적서\n비교 분석", RGBColor(156,39,176)), ("STEP 8", "인사이트\nAI 질의", RGBColor(0,100,255)),
]
for i, (step, label, color) in enumerate(steps):
    x = 0.5 + i * 3.2
    box(s, x, 1.5, 2.6, 1.5, WHITE, color); text(s, x+0.1, 1.55, 2.4, 0.3, step, 11, True, color, PP_ALIGN.CENTER); text(s, x+0.1, 1.9, 2.4, 0.9, label, 14, True, DARK, PP_ALIGN.CENTER)
    if i < 3: text(s, x+2.65, 2.0, 0.4, 0.5, "→", 22, True, GRAY, PP_ALIGN.CENTER)
for i, (step, label, color) in enumerate(steps2):
    x = 0.5 + i * 3.2
    box(s, x, 3.5, 2.6, 1.5, WHITE, color); text(s, x+0.1, 3.55, 2.4, 0.3, step, 11, True, color, PP_ALIGN.CENTER); text(s, x+0.1, 3.9, 2.4, 0.9, label, 14, True, DARK, PP_ALIGN.CENTER)
    if i < 3: text(s, x+2.65, 4.0, 0.4, 0.5, "→", 22, True, GRAY, PP_ALIGN.CENTER)

# STEP 4 → STEP 5 연결 (아래로)
text(s, 10.3, 3.05, 0.5, 0.5, "↓", 22, True, GRAY, PP_ALIGN.CENTER)

# STEP 6 → STEP 1 재귀 화살표 (아래 → 왼쪽 → 위)
# 아래 화살표 (STEP 6 하단)
from pptx.util import Emu
# STEP 6 위치: x=3.7, y=3.5, w=2.6, h=1.5 → 하단 중앙: x=5.0, y=5.0
# STEP 1 위치: x=0.5, y=1.5, w=2.6, h=1.5 → 좌측 중앙: x=0.5, y=2.25
# 재귀 경로: STEP6 하단 → 아래 → 좌측으로 꺾어 → STEP1 좌측까지 → 위로

# 하단 세로선 (STEP6 아래로)
line1 = s.shapes.add_connector(1, Inches(5.0), Inches(5.0), Inches(5.0), Inches(5.4))
line1.line.color.rgb = RGBColor(220, 53, 69); line1.line.width = Pt(2)

# 가로선 (오른쪽 → 왼쪽)
line2 = s.shapes.add_connector(1, Inches(0.3), Inches(5.4), Inches(5.0), Inches(5.4))
line2.line.color.rgb = RGBColor(220, 53, 69); line2.line.width = Pt(2)

# 세로선 (아래 → 위, STEP1 좌측)
line3 = s.shapes.add_connector(1, Inches(0.3), Inches(2.25), Inches(0.3), Inches(5.4))
line3.line.color.rgb = RGBColor(220, 53, 69); line3.line.width = Pt(2)

# STEP1 좌측으로 화살표
text(s, 0.2, 1.9, 0.4, 0.5, "→", 18, True, RGBColor(220, 53, 69), PP_ALIGN.CENTER)

# 재귀 라벨
box(s, 1.5, 5.15, 3.5, 0.45, RGBColor(254, 226, 226), RGBColor(220, 53, 69))
text(s, 1.6, 5.18, 3.3, 0.35, "🔄 오류 수정본 재업로드 → 재분석", 11, True, RGBColor(220, 53, 69), PP_ALIGN.CENTER)

mtext(s, 0.6, 5.9, 12, 1.0, [
    ("핵심 원칙", True, 14, RED),
    "• 원본 데이터를 직접 수정하지 않습니다 — 노트와 하이라이트로 피드백만 전달  •  협력사가 원본을 직접 수정하여 데이터 정합성과 법적 효력을 보존합니다",
], 11)

# ═══════════════ STEP 1 ═══════════════
s = slide("STEP 1. Excel 파일 업로드 + 자동 파싱", "견적서 파일을 업로드하면 AI가 자동으로 데이터를 추출합니다")
box(s, 0.6, 1.3, 5.8, 5.5, WHITE, RGBColor(200,200,200))
text(s, 0.8, 1.4, 5.5, 0.4, "업로드 팝업", 14, True, AMBER)
mtext(s, 0.8, 1.9, 5.5, 4.7, [
    ("1. 견적서 파일 선택 *필수", True, 12, DARK),
    "  .xlsx / .xls 파일 선택",
    "  선택 시: 파일명 + 크기 표시 (초록 테두리)",
    "",
    ("2. 추가 파일 선택 (집계표)", True, 12, DARK),
    "  선택사항 — 1개 파일 선택 가능",
    "",
    ("3. [추출 시작] 버튼", True, 12, DARK),
    "  견적서 필수 선택 후 활성화",
    "  클릭 → AI 자동 파싱 시작",
    "",
    ("진행 과정", True, 12, AMBER),
    "  • 프로그래스바로 진행률 실시간 표시",
    "  • 재료비 / 가공비 / 제경비 자동 분류",
    "  • 셀 좌표 매핑 (원본 Excel과 1:1)",
    "  • 완료 시 → '검증중' 상태로 전환",
], 11)

box(s, 6.8, 1.3, 5.8, 5.5, WHITE, RGBColor(200,200,200))
text(s, 7, 1.4, 5.5, 0.4, "카드뷰 목록", 14, True, AMBER)
mtext(s, 7, 1.9, 5.5, 4.7, [
    ("상태별 카드 표시", True, 12, DARK),
    "",
    "• 추출중(자동): 프로그래스바 + 진행률%",
    "  → 버튼: '처리중' (비활성)",
    "",
    "• 검증중: 파싱 완료 결과 표시",
    "  → 버튼: '검증하기' (활성)",
    "",
    "• 검증완료: 분석 준비 완료",
    "  → 버튼: '분석하기' (활성)",
    "",
    ("추가 기능", True, 12, DARK),
    "• 카드/리스트 뷰 전환 토글",
    "• 상태별 필터 칩 (7개 상태)",
    "• 파일명 검색",
    "• 집계표 첨부 시 📎 아이콘 표시",
    "  → 마우스 오버 시 파일명 툴팁",
], 11)

# ═══════════════ STEP 2 ═══════════════
s = slide("STEP 2. 파싱 데이터 검증 (원본 대조)", "파싱된 표준 양식과 Excel 원본을 나란히 비교하며 셀 매핑을 확인합니다")
box(s, 0.6, 1.3, 5.8, 5.5, WHITE, RGBColor(200,200,200))
text(s, 0.8, 1.4, 5.5, 0.4, "좌측: 파싱된 데이터 (표준 양식)", 13, True, RGBColor(59,130,246))
mtext(s, 0.8, 1.9, 5.5, 4.7, [
    "• [표준뷰] / [리스트뷰] 전환",
    "• 카테고리별 계층 구조",
    "  - ■ 재료비 ▼",
    "    ├─ SKIN(표피재) ⚠️  ₩18,920",
    "    ├─ PP수지              ₩694.10",
    "",
    ("항목 클릭 시", True, 12, RGBColor(59,130,246)),
    "  → 우측 Excel 해당 셀 자동 하이라이트",
    "  → 셀 매핑이 정확한지 시각적 확인",
    "",
    ("잘못된 매핑 발견 시", True, 12, ERED),
    "  1. 우측 Excel에서 올바른 셀 클릭",
    "  2. [적용] 버튼으로 셀 매핑 보정",
    "  3. 수정 이력 자동 기록",
    "",
    ("검증 완료 후", True, 12, TEAL),
    "  [검증 완료] → [분석 →] 버튼 활성화",
], 11)

box(s, 6.8, 1.3, 5.8, 5.5, WHITE, RGBColor(200,200,200))
text(s, 7, 1.4, 5.5, 0.4, "우측: Excel 원본 미리보기", 13, True, RGBColor(59,130,246))
mtext(s, 7, 1.9, 5.5, 4.7, [
    "• 실제 Excel 파일을 그대로 렌더링",
    "• 셀 스타일, 테두리, 배경색, 폰트 보존",
    "• 행/열 헤더 (A,B,C... / 1,2,3...)",
    "• 좌우/상하 독립 스크롤",
    "",
    ("수식 바", True, 12, DARK),
    "  셀 클릭 시 상단에 셀 주소 + 수식 표시",
    "  예: A1 | fx =SUM(B2:B10)",
    "",
    ("셀 하이라이트", True, 12, DARK),
    "  좌측 항목 클릭 → 해당 셀 노란 배경 + 주황 아웃라인",
    "",
    ("Sheet 전환", True, 12, DARK),
    "  Sheet Name 콤보로 다른 시트 확인",
    "",
    ("드래그 리사이즈", True, 12, DARK),
    "  중앙 바 드래그로 좌우 비율 조절",
], 11)

# ═══════════════ STEP 3-4 ═══════════════
s = slide("STEP 3-4. 분석 요청 + 자동 분석 완료", "검증 완료 후 자동 분석이 시작되며, 완료 시까지 다른 작업을 진행합니다")
box(s, 0.6, 1.3, 5.8, 5.5, WHITE, RGBColor(200,200,200))
text(s, 0.8, 1.4, 5.5, 0.4, "STEP 3: 분석 요청", 14, True, VIOLET)
mtext(s, 0.8, 1.9, 5.5, 4.7, [
    ("[분석 →] 버튼 클릭", True, 12, DARK),
    "",
    "확인 메시지:",
    "  '분석을 진행하시겠습니까?'",
    "  '자동 분석이 시작되며,",
    "   완료까지 시간이 소요됩니다.'",
    "",
    "[확인] 클릭 후:",
    "  1. 상태: 검증완료 → 분석중(자동)",
    "  2. '분석이 시작되었습니다' 알림",
    "  3. 목록 페이지로 자동 이동",
    "",
    ("왜 목록으로 이동하는가?", True, 12, VIOLET),
    "",
    "  자동 분석은 일정 시간이 소요됩니다.",
    "  재료비/가공비/제경비 수식 검증,",
    "  시장가 비교, 과거 데이터 대조 등",
    "  복합적인 분석이 백그라운드에서 진행.",
    "  이 시간 동안 다른 견적서 작업 가능.",
], 11)

box(s, 6.8, 1.3, 5.8, 5.5, WHITE, RGBColor(200,200,200))
text(s, 7, 1.4, 5.5, 0.4, "STEP 4: 분석 완료", 14, True, EMERALD)
mtext(s, 7, 1.9, 5.5, 4.7, [
    ("목록에서 진행 상태 확인", True, 12, DARK),
    "",
    "분석중(자동) 카드:",
    "  ┌────────────────┐",
    "  │  분석중(자동)     │",
    "  │  ████░░ 72%     │",
    "  │  [분석중...]     │  ← 비활성",
    "  └────────────────┘",
    "",
    "분석 완료 카드:",
    "  ┌────────────────┐",
    "  │  분석완료        │",
    "  │  📊 분석 완료    │",
    "  │  32항목 94% 3   │",
    "  │  [분석 결과 보기]│  ← 활성",
    "  └────────────────┘",
    "",
    "[분석 결과 보기] → STEP 5로 이동",
], 11)

# ═══════════════ STEP 5 ═══════════════
s = slide("STEP 5. 분석 상세보기 + 오류 수정", "4가지 뷰로 원가 구조를 분석하고, 이상치를 확인하며, 계산식을 검증합니다")
table(s, 0.6, 1.3, 12, [
    ["탭", "용도", "주요 기능"],
    ["표준뷰", "카테고리별 원가 구조", "재료비/가공비/제경비 계층, 신뢰도 바, 이상치 AI 판단근거 팝오버"],
    ["리스트뷰", "항목별 상세 비교", "평면 테이블, 정렬/검색, 이상치 인라인 편집 (단가/금액 수정)"],
    ["관계도", "항목 간 의존성 시각화", "노드 그래프, 클릭 시 상세 패널 (금액/신뢰도/AI근거)"],
    ["골든셋", "최종 원가계산서", "공식 양식, Excel 다운로드 (.xls), 인쇄"],
], [1.2, 2.5, 8.3])

box(s, 0.6, 3.5, 5.8, 3.5, WHITE, RGBColor(200,200,200))
text(s, 0.8, 3.6, 5.5, 0.4, "이상치 감지 + AI 판단 근거", 14, True, ERED)
mtext(s, 0.8, 4.1, 5.5, 2.7, [
    ("감지 기준", True, 12, DARK),
    "  • 시장가 대비 33% 초과 → 이상치 판정",
    "  • 과거 3분기 평균 대비 편차 초과 → 경고",
    "  • 전체 비율 기준 비정상 → 주의",
    "",
    ("표시 방식", True, 12, DARK),
    "  ⚠️ 배지 → 클릭 시 AI 판단 근거 팝오버",
    "  '과거 3분기 평균 ₩14,200 대비 +33.2% 높음'",
], 11)

box(s, 6.8, 3.5, 5.8, 3.5, WHITE, RGBColor(200,200,200))
text(s, 7, 3.6, 5.5, 0.4, "계산식 검증 + 인라인 수정", 14, True, INDIGO)
mtext(s, 7, 4.1, 5.5, 2.7, [
    ("계산식 확인", True, 12, DARK),
    "  금액 옆 💡 클릭 → 계산식 팝오버",
    "  '수량 × 단가 × (1+로스율)'",
    "  '= 1.2 × ₩18,917 × 1.0058 = ₩22,700'",
    "",
    ("인라인 수정", True, 12, DARK),
    "  이상치 항목의 단가/금액 클릭 → 편집 모드",
    "  Enter 확정 / Esc 취소",
    "  수정 시 실시간 합계 재계산",
], 11)

# ═══════════════ STEP 6 ═══════════════
s = slide("STEP 6. 원본 데이터 피드백", "원본을 직접 수정하지 않고, 노트와 하이라이트로 협력사에 피드백합니다")
box(s, 0.6, 1.3, 6, 2.5, WHITE, ERED)
text(s, 0.8, 1.4, 5.7, 0.4, "왜 원본 데이터를 직접 수정하면 안 되는가?", 16, True, ERED)
table(s, 0.8, 1.9, 5.7, [
    ["문제", "직접 수정 시 (❌)", "피드백 방식 (✅)"],
    ["법적 효력", "원본 진정성 훼손", "원본 그대로 보존"],
    ["감사 추적", "변경 이력 추적 불가", "피드백 이력 완전 기록"],
    ["책임 소재", "수정자 책임 불명확", "작성자(협력사)가 직접 수정"],
    ["데이터 정합성", "원본 수식 깨짐 위험", "원본 수식 완전 유지"],
    ["재현 가능성", "동일 분석 재현 불가", "언제든 동일 분석 반복"],
], [1.2, 2.2, 2.3])

box(s, 6.8, 1.3, 5.8, 5.5, WHITE, RGBColor(200,200,200))
text(s, 7, 1.4, 5.5, 0.4, "피드백 프로세스", 14, True, RGBColor(59,130,246))
mtext(s, 7, 1.9, 5.5, 4.7, [
    ("1. 오류 항목에 노트 작성", True, 12, DARK),
    "   셀에 코멘트 추가:",
    "   '이 단가는 시장가 대비 33% 높습니다.'",
    "   '재확인 바랍니다.'",
    "",
    ("2. 주의 셀에 하이라이트 표시", True, 12, DARK),
    "   오류/주의 필요한 셀에 노란색 배경",
    "",
    ("3. 피드백 Excel 저장", True, 12, DARK),
    "   원본 + 노트/하이라이트 포함된 Excel 생성",
    "",
    ("4. 협력사에 반환", True, 12, DARK),
    "   피드백 파일 전달 → 수정 요청",
    "",
    ("5. 수정본 재제출", True, 12, DARK),
    "   협력사가 원본 수정 → 재업로드 → 재분석",
    "",
    ("원칙: 원본은 보존, 피드백만 전달", True, 14, ERED),
], 11)

box(s, 0.6, 4.2, 6, 2.6, WHITE, RGBColor(200,200,200))
text(s, 0.8, 4.3, 5.7, 0.4, "피드백 화면 예시", 14, True, RGBColor(59,130,246))
mtext(s, 0.8, 4.8, 5.7, 1.8, [
    "  Excel 원본 미리보기:",
    "  ┌────────────────────────────────┐",
    "  │ SKIN  PVC 0.8mm  M²  1.2  ██18,917██│ ← 하이라이트",
    "  │                    📝 '시장가 대비     │ ← 노트",
    "  │                       +33% 높음'      │",
    "  └────────────────────────────────┘",
    "  [피드백 저장]  [원본 다운로드]",
], 11)

# ═══════════════ STEP 7-8 ═══════════════
s = slide("STEP 7-8. 견적서 비교 + 인사이트 스튜디오", "분석 완료된 데이터를 비교 분석하고, AI에게 질의합니다")
box(s, 0.6, 1.3, 5.8, 5.5, WHITE, RGBColor(200,200,200))
text(s, 0.8, 1.4, 5.5, 0.4, "STEP 7: 견적서 비교 분석", 14, True, RGBColor(156,39,176))
mtext(s, 0.8, 1.9, 5.5, 4.7, [
    ("3단계 비교 프로세스", True, 12, DARK),
    "",
    "  Step 1: 아이템 선택 (코드/품명 검색)",
    "  Step 2: 비교 대상 선택 (2~4개 견적서)",
    "  Step 3: 비교 결과 (나란히 비교)",
    "",
    ("비교 결과 표시", True, 12, DARK),
    "  • 업체별 원가 항목 컬럼 비교",
    "  • 최저가 ▼ 녹색 / 최고가 ▲ 빨간색",
    "  • 항목 클릭 → 계산식 비교 팝오버",
    "",
    ("비교 대상", True, 12, DARK),
    "  • 이전 견적서: 분기별 원가 변동 추이",
    "  • 타 협력사: 동일 부품 가격 비교",
    "  • 시장 데이터: 원자재 시장가 대비",
], 11)

box(s, 6.8, 1.3, 5.8, 5.5, WHITE, RGBColor(200,200,200))
text(s, 7, 1.4, 5.5, 0.4, "STEP 8: 인사이트 스튜디오", 14, True, RGBColor(0,100,255))
mtext(s, 7, 1.9, 5.5, 4.7, [
    ("AI 기반 질의응답", True, 12, DARK),
    "",
    "  좌측: 세션 목록 관리",
    "  우측: 채팅 영역",
    "",
    ("질의 예시", True, 12, DARK),
    "",
    "  🧑 '이 부품의 평균 원가는?'",
    "  🤖 '평균 생산원가: ₩2,844'",
    "     '재료비 비중: 37.8%'",
    "     '이상치 항목: 2건'",
    "",
    "  🧑 'SKIN 단가가 높은 이유?'",
    "  🤖 '과거 3분기 대비 +33.2% 높음'",
    "     '수입 원자재 환율 영향 추정'",
    "",
    ("질의 가능 항목", True, 12, DARK),
    "  원가 분석 / 이상치 분석 / 비교 분석",
    "  트렌드 분석 / 원가 절감 제안",
], 11)

# ═══════════════ 기대 효과 ═══════════════
s = slide("기대 효과", "시스템 도입으로 기대되는 업무 개선 효과")
table(s, 0.6, 1.3, 12, [
    ["효과", "내용", "세부 설명"],
    ["업무 시간 절감", "70% 이상", "수작업 Excel 분석 대비 자동 파싱 + AI 분석"],
    ["분석 정확도 향상", "AI 이상치 감지", "시장가/과거 데이터 자동 비교, 수식 검증"],
    ["원가 절감 기회", "절감 포인트 제시", "이상치 감지 → 구체적 근거 제시 → 협상 자료"],
    ["투명한 의사결정", "수식 단위 추적", "모든 계산의 근거를 투명하게 공개"],
    ["협력사 커뮤니케이션", "명확한 피드백", "노트/하이라이트로 수정 요청 → 원본 보존"],
    ["데이터 자산화", "인사이트 활용", "분석 결과 축적 → AI 질의응답으로 정보 취득"],
], [2, 2, 8])

# ═══════════════ Thank You ═══════════════
s = prs.slides.add_slide(prs.slide_layouts[6])
bg = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height); bg.fill.solid(); bg.fill.fore_color.rgb = DARK; bg.line.fill.background()
b = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, Inches(3.5), prs.slide_width, Inches(0.06)); b.fill.solid(); b.fill.fore_color.rgb = RED; b.line.fill.background()
text(s, 1.5, 2.2, 10, 1, "Thank You", 48, True, WHITE, PP_ALIGN.CENTER)
text(s, 1.5, 4.0, 10, 0.6, "현대모비스 견적 원가 분석 시스템", 20, False, RGBColor(180,180,180), PP_ALIGN.CENTER)

prs.save(r'c:\WORK\cost-analysis-src\docs\업무프로세스_고객설명자료_v2.pptx')
print("고객 설명 자료 PPTX 생성 완료!")
