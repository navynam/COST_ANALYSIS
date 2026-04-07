"""견적 원가 분석 시스템 - 화면설계서 & 프로세스설계서 PPTX 생성"""
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

# ── 색상 정의 ──
MOBIS_RED = RGBColor(230, 0, 18)
MOBIS_DARK = RGBColor(10, 22, 40)
BLUE = RGBColor(0, 56, 117)
LIGHT_BLUE = RGBColor(232, 244, 253)
WHITE = RGBColor(255, 255, 255)
GRAY = RGBColor(100, 100, 100)
LIGHT_GRAY = RGBColor(245, 247, 250)
BLACK = RGBColor(25, 31, 40)
GREEN = RGBColor(46, 125, 50)
ORANGE = RGBColor(230, 81, 0)

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

def add_slide(title_text, subtitle_text=None, layout_idx=None):
    slide = prs.slides.add_slide(prs.slide_layouts[6])  # blank
    # 상단 바
    bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, Inches(0.08))
    bar.fill.solid()
    bar.fill.fore_color.rgb = MOBIS_RED
    bar.line.fill.background()
    # 하단 바
    bot = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, Inches(7.2), prs.slide_width, Inches(0.3))
    bot.fill.solid()
    bot.fill.fore_color.rgb = MOBIS_DARK
    bot.line.fill.background()
    ft = bot.text_frame
    ft.text = "현대모비스 견적 원가 분석 시스템  |  Confidential"
    ft.paragraphs[0].font.size = Pt(8)
    ft.paragraphs[0].font.color.rgb = RGBColor(150, 150, 150)
    ft.paragraphs[0].alignment = PP_ALIGN.RIGHT
    # 제목
    tx = slide.shapes.add_textbox(Inches(0.6), Inches(0.3), Inches(12), Inches(0.6))
    tf = tx.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = title_text
    p.font.size = Pt(28)
    p.font.bold = True
    p.font.color.rgb = MOBIS_DARK
    if subtitle_text:
        p2 = tf.add_paragraph()
        p2.text = subtitle_text
        p2.font.size = Pt(14)
        p2.font.color.rgb = GRAY
    return slide

def add_text(slide, left, top, width, height, text, size=12, bold=False, color=BLACK, align=PP_ALIGN.LEFT):
    tx = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(height))
    tf = tx.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(size)
    p.font.bold = bold
    p.font.color.rgb = color
    p.alignment = align
    return tf

def add_multiline(slide, left, top, width, height, lines, size=11, color=BLACK, line_spacing=1.3):
    tx = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(height))
    tf = tx.text_frame
    tf.word_wrap = True
    for i, line in enumerate(lines):
        if i == 0:
            p = tf.paragraphs[0]
        else:
            p = tf.add_paragraph()
        if isinstance(line, tuple):
            p.text = line[0]
            p.font.bold = line[1]
            p.font.size = Pt(line[2] if len(line) > 2 else size)
            p.font.color.rgb = line[3] if len(line) > 3 else color
        else:
            p.text = line
            p.font.size = Pt(size)
            p.font.color.rgb = color
        p.space_after = Pt(size * (line_spacing - 1) * 2)
    return tf

def add_box(slide, left, top, width, height, fill_color=LIGHT_GRAY, border_color=None):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill_color
    if border_color:
        shape.line.color.rgb = border_color
        shape.line.width = Pt(1)
    else:
        shape.line.fill.background()
    return shape

def add_table(slide, left, top, width, rows_data, col_widths=None):
    rows = len(rows_data)
    cols = len(rows_data[0]) if rows > 0 else 1
    tbl_shape = slide.shapes.add_table(rows, cols, Inches(left), Inches(top), Inches(width), Inches(0.35 * rows))
    tbl = tbl_shape.table
    if col_widths:
        for i, w in enumerate(col_widths):
            tbl.columns[i].width = Inches(w)
    for r, row in enumerate(rows_data):
        for c, val in enumerate(row):
            cell = tbl.cell(r, c)
            cell.text = str(val)
            for p in cell.text_frame.paragraphs:
                p.font.size = Pt(10)
                p.font.color.rgb = BLACK
                if r == 0:
                    p.font.bold = True
                    p.font.color.rgb = WHITE
            if r == 0:
                cell.fill.solid()
                cell.fill.fore_color.rgb = BLUE
            else:
                cell.fill.solid()
                cell.fill.fore_color.rgb = WHITE if r % 2 == 1 else LIGHT_GRAY
    return tbl_shape

# ═══════════════════════════════════════════════════════════
# 슬라이드 생성
# ═══════════════════════════════════════════════════════════

# ── 1. 표지 ──
s = prs.slides.add_slide(prs.slide_layouts[6])
bg = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
bg.fill.solid()
bg.fill.fore_color.rgb = MOBIS_DARK
bg.line.fill.background()
bar = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, Inches(2.8), prs.slide_width, Inches(0.06))
bar.fill.solid()
bar.fill.fore_color.rgb = MOBIS_RED
bar.line.fill.background()
add_text(s, 1.5, 1.2, 10, 1, "견적 원가 분석 시스템", 44, True, WHITE, PP_ALIGN.CENTER)
add_text(s, 1.5, 2.0, 10, 0.6, "화면 설계서 & 프로세스 설계서", 24, False, RGBColor(200,200,200), PP_ALIGN.CENTER)
add_text(s, 1.5, 3.5, 10, 0.5, "현대모비스  |  원가관리팀", 18, False, RGBColor(180,180,180), PP_ALIGN.CENTER)
add_text(s, 1.5, 4.2, 10, 0.5, "v2.0  |  2026.04.07", 14, False, RGBColor(140,140,140), PP_ALIGN.CENTER)
add_text(s, 1.5, 5.5, 10, 0.5, "Confidential", 12, False, RGBColor(100,100,100), PP_ALIGN.CENTER)

# ── 2. 목차 ──
s = add_slide("목차", "Table of Contents")
items = [
    "1. 시스템 개요 및 기술 스택",
    "2. 전체 업무 프로세스 흐름",
    "3. 메뉴 구조 및 화면 맵",
    "4. [화면] 로그인 / 대시보드",
    "5. [화면] 견적서 분석 (테이블뷰 / 카드뷰)",
    "6. [화면] 데이터 검증",
    "7. [화면] 원가 분석 (표준/리스트/관계도/골든셋)",
    "8. [화면] 견적서 비교",
    "9. [화면] 모델관리 / 변경 요청 워크플로우",
    "10. [화면] 인사이트 스튜디오 / 이력·알림 / 설정",
    "11. [프로세스] 5단계 메인 워크플로우",
    "12. [프로세스] 상태 전이 / 이상치 감지",
    "13. [프로세스] 모델관리 변경 요청 프로세스",
    "14. 사용자 역할 및 권한 매트릭스",
    "15. 비기능 요구사항 / 용어 정의",
]
add_multiline(s, 0.8, 1.2, 11, 5.5, items, 16, MOBIS_DARK, 1.6)

# ── 3. 시스템 개요 ──
s = add_slide("1. 시스템 개요", "System Overview")
add_multiline(s, 0.6, 1.2, 5.5, 2, [
    ("목적", True, 14, BLUE),
    "견적서(Excel)를 업로드하면 AI가 자동으로 데이터를 추출하고,",
    "검증/분석/비교를 통해 원가 적정성을 판단하며,",
    "최종적으로 ERP 시스템에 등록할 데이터를 생성합니다.",
], 12)
add_table(s, 0.6, 3.3, 5.5, [
    ["구분", "기술"],
    ["Frontend", "React 18 + TypeScript"],
    ["UI Framework", "MUI (Material-UI) v5"],
    ["차트", "Recharts"],
    ["Excel 처리", "SheetJS (xlsx)"],
    ["라우팅", "React Router v6 (HashRouter)"],
    ["배포", "GitHub Pages"],
], [1.5, 4])

add_multiline(s, 6.8, 1.2, 5.5, 5, [
    ("핵심 기능", True, 14, BLUE),
    "",
    "1. AI 자동 파싱 — Excel 견적서 구조 자동 인식",
    "2. 원본 대조 검증 — 좌우 분할 비교 화면",
    "3. 이상치 감지 — AI 판단근거 제공",
    "4. 골든셋 생성 — 원가계산서 Excel 다운로드",
    "5. 견적서 비교 — 최대 4개 동시 비교",
    "6. 모델관리 — 역할 기반 수식 변경 워크플로우",
    "7. AI 인사이트 — 채팅 기반 원가 분석",
], 12)

# ── 4. 전체 프로세스 흐름 ──
s = add_slide("2. 전체 업무 프로세스 흐름", "Main Workflow: 업로드 → 추출 → 검증 → 분석 → ERP")
steps = [
    ("1단계\n파일 업로드\n+ 자동추출", "/parsing", RGBColor(0,100,255)),
    ("2단계\n데이터\n검증", "/verification", RGBColor(255,152,0)),
    ("3단계\n원가\n분석", "/analysis", RGBColor(46,125,50)),
    ("4단계\n견적서\n비교", "/comparison", RGBColor(156,39,176)),
    ("5단계\n결과 저장\nERP 등록", "골든셋", RGBColor(230,0,18)),
]
for i, (label, path, color) in enumerate(steps):
    x = 0.8 + i * 2.5
    box = add_box(s, x, 1.5, 2, 1.5, WHITE, color)
    add_text(s, x + 0.1, 1.6, 1.8, 1.2, label, 13, True, color, PP_ALIGN.CENTER)
    add_text(s, x + 0.1, 3.05, 1.8, 0.3, path, 9, False, GRAY, PP_ALIGN.CENTER)
    if i < len(steps) - 1:
        add_text(s, x + 2.05, 2.05, 0.4, 0.5, "→", 24, True, GRAY, PP_ALIGN.CENTER)

# 상태 전이
add_text(s, 0.6, 3.8, 12, 0.5, "상태 전이도", 16, True, BLUE)
add_table(s, 0.6, 4.4, 12, [
    ["상태", "설명", "전이 조건", "다음 상태"],
    ["추출중", "AI가 Excel에서 데이터를 추출하는 중", "파일 업로드 시 자동 시작", "검증중 / 실패"],
    ["검증중", "추출된 데이터의 정확성 검토 단계", "추출 완료 시 자동 전환", "검증완료"],
    ["검증완료", "검증이 완료되어 분석 준비된 상태", "사용자가 검증 완료 처리", "분석중"],
    ["분석중", "원가 분석이 진행 중인 상태", "사용자가 분석 시작", "분석완료"],
    ["분석완료", "분석 완료, 골든셋 생성 가능", "분석 프로세스 완료", "ERP 등록"],
    ["실패", "추출 과정에서 오류 발생", "파일 형식 오류 등", "재업로드"],
], [1.5, 3.5, 3.5, 3.5])

# ── 5. 메뉴 구조 ──
s = add_slide("3. 메뉴 구조 및 화면 맵", "Navigation Structure")
add_box(s, 0.6, 1.3, 3, 5.5, MOBIS_DARK)
menu_items = [
    ("  모비스 로고  견적서 분석", True, 13, WHITE),
    "",
    ("  대시보드", False, 12, WHITE),
    "",
    ("  ── 분석 플로우 ──", False, 10, RGBColor(150,150,150)),
    ("  견적서 분석", False, 12, WHITE),
    ("  견적서 분석(Card)", False, 12, WHITE),
    ("  견적서 비교", False, 12, WHITE),
    ("  인사이트 스튜디오", False, 12, WHITE),
    "",
    ("  ── 관리 ──", False, 10, RGBColor(150,150,150)),
    ("  모델관리", False, 12, WHITE),
    ("  이력/알림", False, 12, WHITE),
    ("  설정", False, 12, WHITE),
]
add_multiline(s, 0.7, 1.4, 2.8, 5.3, menu_items, 12, WHITE, 1.4)

add_table(s, 4.2, 1.3, 8.5, [
    ["화면 ID", "화면명", "경로", "단계", "설명"],
    ["SCR-001", "로그인", "/login", "-", "사번 기반 인증"],
    ["SCR-002", "대시보드", "/dashboard", "-", "전체 현황 요약 + 알림 센터"],
    ["SCR-003", "견적서 분석 (테이블)", "/parsing", "1단계", "파일 업로드 + 테이블 목록"],
    ["SCR-004", "견적서 분석 (카드)", "/parsing_card", "1단계", "파일 업로드 + 카드 그리드"],
    ["SCR-005", "데이터 검증", "/verification", "2단계", "좌우 분할 원본 대조"],
    ["SCR-006", "원가 분석", "/analysis", "3단계", "4탭 뷰 + 골든셋"],
    ["SCR-007", "견적서 비교", "/comparison", "4단계", "3단계 스텝 비교"],
    ["SCR-008", "인사이트 스튜디오", "/insight", "보조", "AI 채팅 분석"],
    ["SCR-009", "모델관리", "/models", "보조", "수식 관리 + 변경 요청"],
    ["SCR-010", "이력/알림", "/history", "보조", "타임라인 + 알림"],
    ["SCR-011", "설정", "/settings", "보조", "프로필, 비밀번호, 테마"],
], [1, 2, 1.5, 1, 3])

# ── 6. 로그인 / 대시보드 ──
s = add_slide("4. 로그인 / 대시보드", "SCR-001, SCR-002")
add_box(s, 0.6, 1.3, 5.5, 5.5, WHITE, RGBColor(200,200,200))
add_text(s, 0.8, 1.5, 5, 0.4, "SCR-001  로그인", 16, True, BLUE)
add_multiline(s, 0.8, 2.1, 5, 4.5, [
    ("화면 구성", True, 12, MOBIS_DARK),
    "• 중앙 정렬 카드 레이아웃",
    "• 모비스 로고 + '견적 원가 분석 시스템' 타이틀",
    "• 사번 입력 필드 (Person 아이콘)",
    "• 비밀번호 입력 필드 (Lock 아이콘 + 표시/숨김 토글)",
    "• 로그인 버튼",
    "• 비밀번호 찾기 / 변경 링크",
    "",
    ("주요 기능", True, 12, MOBIS_DARK),
    "• 사번 + 비밀번호 기반 인증",
    "• 5회 연속 실패 시 계정 자동 잠금",
    "• react-hook-form 기반 실시간 유효성 검사",
], 11)

add_box(s, 6.8, 1.3, 5.8, 5.5, WHITE, RGBColor(200,200,200))
add_text(s, 7, 1.5, 5.5, 0.4, "SCR-002  대시보드", 16, True, BLUE)
add_multiline(s, 7, 2.1, 5.5, 4.5, [
    ("화면 구성", True, 12, MOBIS_DARK),
    "• 상단: 4개 요약 카드 (총 견적서, 검증완료율, 이상치, 평균원가)",
    "• 중단 좌: 내가 해야할 작업 (6개 상태 카드 3×2)",
    "  - 추출중 / 검증중 / 검증완료 / 분석중 / 분석완료 / 실패",
    "  - 클릭 시 해당 상태로 필터링된 파싱 페이지 이동",
    "• 중단 우: 최근 검증 현황 도넛 차트 + 우측 범례",
    "• 하단: 업무 알림 & 액션 센터",
    "",
    ("업무 알림 유형", True, 12, MOBIS_DARK),
    "• 긴급: 이상치 감지 → [분석 검토]",
    "• 주의: 분석 대기 / 처리 지연",
    "• 정보: ERP 등록 대기 / 인사이트 리포트",
], 11)

# ── 7. 견적서 분석 ──
s = add_slide("5. 견적서 분석", "SCR-003 테이블뷰  /  SCR-004 카드뷰")
add_box(s, 0.6, 1.3, 5.8, 5.5, WHITE, RGBColor(200,200,200))
add_text(s, 0.8, 1.5, 5.5, 0.4, "SCR-003  테이블뷰 (/parsing)", 14, True, BLUE)
add_multiline(s, 0.8, 2.1, 5.5, 4.5, [
    ("상단 영역", True, 12, MOBIS_DARK),
    "• 힌트 가이드: 5단계 프로세스 안내",
    "• 툴바: 타이틀 + [파일 업로드] + 검색 + [필터]",
    "• 상태 필터 칩: 전체/추출중/검증중/검증완료/분석중/분석완료/실패",
    "",
    ("파일 테이블", True, 12, MOBIS_DARK),
    "• 컬럼: □ 파일명 / 상태 / 항목수 / 신뢰도 / 업로드일",
    "• 드래그앤드롭 업로드 지원",
    "• 체크박스 선택 → 일괄 삭제/다운로드",
    "• 행 클릭 → 파일 상세 드로어",
    "",
    ("주요 기능", True, 12, MOBIS_DARK),
    "• 실시간 파일명 검색",
    "• 상세 필터 다이얼로그 (기간, 부서, 상태)",
    "• 상태별 건수 실시간 카운트",
], 11)

add_box(s, 6.8, 1.3, 5.8, 5.5, WHITE, RGBColor(200,200,200))
add_text(s, 7, 1.5, 5.5, 0.4, "SCR-004  카드뷰 (/parsing_card)", 14, True, BLUE)
add_multiline(s, 7, 2.1, 5.5, 4.5, [
    ("카드 구조 (360px 고정 높이)", True, 12, MOBIS_DARK),
    "• 헤더: [상태 배지] + 파일명",
    "• 정보: 📁 파일크기  📅 업로드일  👤 업로더  🏢 부서",
    "• 동적 콘텐츠 (상태별 다름):",
    "  - 추출중: 프로그래스바 + 진행률%",
    "  - 검증중/완료: 파싱항목 / 신뢰도% / 이상치",
    "  - 실패: 오류 사유 메시지",
    "• 버튼: [노트(N)] + [검증하기/분석하기/오류확인]",
    "",
    ("레이아웃", True, 12, MOBIS_DARK),
    "• 반응형 그리드: 3열(데스크톱) / 2열(태블릿) / 1열(모바일)",
    "• 카드 hover: 살짝 올라감 + 그림자 + 파란 테두리",
    "",
    ("노트 기능", True, 12, MOBIS_DARK),
    "• 파일별 노트 작성/저장 (localStorage)",
    "• AI 분석 버튼: 파일 상태 기반 자동 분석 제안",
], 11)

# ── 8. 데이터 검증 ──
s = add_slide("6. 데이터 검증", "SCR-005  좌우 분할 원본 대조")
add_multiline(s, 0.6, 1.3, 12, 0.8, [
    ("화면 레이아웃: 좌우 분할 (드래그 리사이즈 가능)", True, 14, BLUE),
], 14)
add_box(s, 0.6, 2.2, 5.8, 4.5, WHITE, RGBColor(200,200,200))
add_text(s, 0.8, 2.3, 5.5, 0.4, "좌측: 파싱된 데이터", 14, True, BLUE)
add_multiline(s, 0.8, 2.8, 5.5, 3.7, [
    "• 2가지 뷰 모드: [표준뷰] / [리스트뷰]",
    "• 표준뷰: 카테고리별 계층 구조",
    "  - ■ 재료비 ▼",
    "    ├─ SKIN(표피재) ⚠️  ₩18,920",
    "    ├─ PP수지              ₩694.10",
    "    └─ TPE                 ₩119.19",
    "  - ■ 가공비 ▼ / ■ 제경비 ▼",
    "",
    "• 신뢰도 색상 코딩:",
    "  - 초록: 높음 (90%+)  노랑: 보통 (70~90%)  빨강: 낮음 (<70%)",
    "• 이상치 ⚠️ 배지 → 클릭 시 AI 판단근거 팝오버",
    "• 더블클릭 → 인라인 편집 (수정자/시간 자동 기록)",
], 11)

add_box(s, 6.8, 2.2, 5.8, 4.5, WHITE, RGBColor(200,200,200))
add_text(s, 7, 2.3, 5.5, 0.4, "우측: 원본 Excel", 14, True, BLUE)
add_multiline(s, 7, 2.8, 5.5, 3.7, [
    "• 원본 Excel 파일 렌더링",
    "• 좌측 항목 클릭 시 해당 셀 자동 하이라이트",
    "• 셀 좌표 기반 1:1 매핑",
    "",
    ("핵심 인터랙션", True, 12, MOBIS_DARK),
    "• 좌측 '재료비 > SKIN(표피재)' 클릭",
    "  → 우측 Excel B2 셀 자동 하이라이트",
    "• 좌측 값 수정 → 우측과 차이 시각적 표시",
    "",
    ("상단 정보 바", True, 12, MOBIS_DARK),
    "• ← 목록 (뒤로) | 파일명",
    "• 파싱 24항목 | 이상치 2건 | 신뢰도 92%",
    "• [저장] [완료] 버튼",
], 11)

# ── 9. 원가 분석 ──
s = add_slide("7. 원가 분석", "SCR-006  4탭 뷰 (표준 / 리스트 / 관계도 / 골든셋)")
add_table(s, 0.6, 1.3, 12, [
    ["탭", "용도", "주요 기능"],
    ["표준뷰", "카테고리별 원가 구조 파악", "재료비/가공비/제경비 계층 구조, 신뢰도 바, 이상치 AI 판단근거 팝오버, 인라인 편집"],
    ["리스트뷰", "항목별 상세 비교", "평면 테이블, 정렬/검색, 이상치 풍선 도움말, 인라인 편집"],
    ["관계도", "항목 간 의존성 파악", "노드 그래프, 클릭 시 우측 상세 패널 (금액/신뢰도/AI근거), 원본 데이터 보기 버튼"],
    ["골든셋", "최종 원가계산서", "공식 양식 (원가계산서), Excel 다운로드 (.xls), 인쇄 기능"],
], [1.2, 2.5, 8.3])

add_box(s, 0.6, 3.5, 5.8, 3.5, WHITE, RGBColor(200,200,200))
add_text(s, 0.8, 3.6, 5.5, 0.4, "이상치 감지 프로세스", 14, True, ORANGE)
add_multiline(s, 0.8, 4.1, 5.5, 2.7, [
    "• AI 엔진이 자동 감지:",
    "  - 시장가 대비 33% 초과 → 이상치 판정",
    "  - 과거 3분기 평균 대비 편차 초과 → 경고",
    "  - 전체 비율 기준 비정상 → 주의",
    "",
    "• 표시 방식:",
    "  - ⚠️ 배지 + 클릭 시 AI 판단근거 팝오버",
    "  - 예: '과거 3분기 평균 ₩14,200 대비 +33.2% 높음'",
], 11)

add_box(s, 6.8, 3.5, 5.8, 3.5, WHITE, RGBColor(200,200,200))
add_text(s, 7, 3.6, 5.5, 0.4, "골든셋 Excel 다운로드", 14, True, GREEN)
add_multiline(s, 7, 4.1, 5.5, 2.7, [
    "• 원가계산서 양식 그대로 Excel (.xls) 다운로드",
    "• 한 장의 시트에 화면 동일 디자인 포함:",
    "  - 타이틀 15pt / 중간타이틀 12pt / 일반 10pt",
    "  - 셀 테두리 (#333)",
    "  - 헤더 배경색 (#dce6f0)",
    "  - 합계 열 초록 배경 (#c6e0b4)",
    "",
    "• 포함 내용: 문서 정보 + 원가 요약 + 재료비 내역",
    "  + 가공비 내역 + 서명란 + 결정단가",
], 11)

# ── 10. 견적서 비교 ──
s = add_slide("8. 견적서 비교", "SCR-007  3단계 스텝 프로세스")
add_multiline(s, 0.6, 1.3, 12, 0.5, [
    ("Step 1: 아이템 선택  →  Step 2: 견적서 선택 (2~4개)  →  Step 3: 비교 결과", True, 16, BLUE),
], 16)

add_table(s, 0.6, 2.2, 12, [
    ["단계", "사용자 액션", "시스템 처리", "화면 요소"],
    ["Step 1", "아이템 코드/품명 검색", "해당 아이템의 견적서 목록 조회", "검색 입력 + 아이템 테이블"],
    ["Step 2", "비교할 견적서 2~4개 선택", "선택된 견적서 데이터 로드", "체크박스 선택 리스트"],
    ["Step 3", "비교 결과 확인", "항목별 나란히 비교 + 최저/최고가 강조", "비교 테이블 + 계산식 팝오버"],
], [1, 3, 3.5, 4.5])

add_multiline(s, 0.6, 4.2, 12, 2.5, [
    ("비교 결과 표시 방식", True, 14, BLUE),
    "• 각 업체별 원가 항목을 컬럼으로 나란히 표시",
    "• 최저가 항목: ▼ 표시 + 녹색 강조",
    "• 최고가 항목: ▲ 표시 + 빨간색 강조",
    "• 항목 클릭 시 계산식 비교 팝오버 (각 업체의 산출 방식 확인)",
    "• 총원가 합계 행: 굵은 글씨 + 배경색 강조",
], 12)

# ── 11. 모델관리 ──
s = add_slide("9. 모델관리 / 변경 요청 워크플로우", "SCR-009  역할 기반 수식 관리")
add_box(s, 0.6, 1.3, 5.8, 2.5, WHITE, RGBColor(200,200,200))
add_text(s, 0.8, 1.4, 5.5, 0.4, "모델 관리 탭", 14, True, BLUE)
add_multiline(s, 0.8, 1.9, 5.5, 1.7, [
    "• 수식 카드 목록 (생산원가, 재료비, 가공비, 제경비율)",
    "• 각 카드: 수식명 + [핵심/하위/비율] 배지 + 수식 표현식",
    "• 변수 칩 목록 + 적용 부서 칩 (전체/개별 부서)",
    "• 관리자: [편집] [삭제] 버튼",
    "• 일반 사용자: [수정 요청] 버튼 (이미 접수 시 비활성)",
], 11)

add_box(s, 0.6, 4.0, 5.8, 2.8, WHITE, RGBColor(200,200,200))
add_text(s, 0.8, 4.1, 5.5, 0.4, "변경 요청 탭", 14, True, ORANGE)
add_multiline(s, 0.8, 4.6, 5.5, 2.0, [
    "• 상단 필터: [전체] [대기] [승인] [반려] 클릭 필터링",
    "• 각 요청 카드: 요청자/부서/시간 + 상태 배지",
    "• diff 표시: - 원본 (빨강) / + 변경 (초록)",
    "• 추가된 변수 칩 표시",
    "• 관리자: [검토 및 승인] [반려] 버튼",
    "• 승인 시: 적용 부서 체크박스 선택 → 수식에 즉시 반영",
    "• 본인 요청: [요청 취소] 버튼 (대기 상태에서만)",
], 11)

add_box(s, 6.8, 1.3, 5.8, 5.5, WHITE, RGBColor(200,200,200))
add_text(s, 7, 1.4, 5.5, 0.4, "변경 요청 워크플로우", 14, True, BLUE)
add_multiline(s, 7, 1.9, 5.5, 4.7, [
    ("일반 사용자", True, 12, RGBColor(123,31,162)),
    "  수정 요청 제출 (변경 내용 + 사유)",
    "  또는 새 수식 추가 요청",
    "        │",
    "        ▼",
    ("변경 요청 탭 [대기]", True, 12, ORANGE),
    "        │",
    "        ▼",
    ("관리자 검토", True, 12, BLUE),
    "  ├── 승인: 적용 부서 선택 (체크박스)",
    "  │    - 전체 / 원가관리팀 / 견적1팀 / 견적2팀 ...",
    "  │    → 선택된 부서에 수식 즉시 반영",
    "  └── 반려: 반려 사유 코멘트 작성",
    "",
    ("부서별 적용 예시", True, 12, GREEN),
    "  원본: 재료비 = Σ(단가 × 수량 × (1+로스율))",
    "  승인(견적1팀만):",
    "    견적1팀: 재료비 = Σ(단가×수량×(1+로스율)×환율보정)",
    "    나머지: 원본 수식 유지",
], 11)

# ── 12. 인사이트 / 이력 / 설정 ──
s = add_slide("10. 인사이트 스튜디오 / 이력·알림 / 설정", "SCR-008, SCR-010, SCR-011")
add_box(s, 0.6, 1.3, 3.8, 5.5, WHITE, RGBColor(200,200,200))
add_text(s, 0.8, 1.4, 3.5, 0.4, "인사이트 스튜디오", 13, True, BLUE)
add_multiline(s, 0.8, 1.9, 3.5, 4.7, [
    "• AI 기반 원가 분석 채팅",
    "• 좌측: 세션 목록 관리",
    "• 우측: 채팅 영역",
    "  - 예제 칩으로 빠른 질문",
    "  - 사용자: 파란색 (우측)",
    "  - AI: 회색 (좌측)",
    "• 타임스탬프 표시",
    "• [+ 새 대화] 버튼",
], 11)

add_box(s, 4.8, 1.3, 3.8, 5.5, WHITE, RGBColor(200,200,200))
add_text(s, 5, 1.4, 3.5, 0.4, "이력 / 알림", 13, True, BLUE)
add_multiline(s, 5, 1.9, 3.5, 4.7, [
    ("[작업이력 탭]", True, 11, MOBIS_DARK),
    "• 타임라인 형식 표시",
    "• 유형 필터: 전체/업로드/",
    "  파싱/검증/비교",
    "• 상태별 색상 구분",
    "",
    ("[알림 탭]", True, 11, MOBIS_DARK),
    "• 읽음/미읽음 구분",
    "• 미읽음: 배경색 + 파란 점",
    "• [모두 읽음] 일괄 처리",
    "• 미읽음 배지 카운트",
], 11)

add_box(s, 9, 1.3, 3.8, 5.5, WHITE, RGBColor(200,200,200))
add_text(s, 9.2, 1.4, 3.5, 0.4, "설정", 13, True, BLUE)
add_multiline(s, 9.2, 1.9, 3.5, 4.7, [
    ("[프로필]", True, 11, MOBIS_DARK),
    "• 이름, 부서, 연락처 수정",
    "",
    ("[비밀번호 변경]", True, 11, MOBIS_DARK),
    "• 현재/새/확인 비밀번호",
    "",
    ("[알림 설정]", True, 11, MOBIS_DARK),
    "• 이메일/푸시 토글",
    "",
    ("[테마/언어]", True, 11, MOBIS_DARK),
    "• 현대모비스 / Toss 테마",
    "• 한국어 / English",
], 11)

# ── 13. 사용자 역할 및 권한 ──
s = add_slide("14. 사용자 역할 및 권한 매트릭스", "Role-Based Access Control")
add_table(s, 0.6, 1.3, 12, [
    ["기능", "관리자 (김관리)", "일반 사용자 (이분석, 박검증)"],
    ["파일 업로드", "O", "O"],
    ["데이터 검증", "O", "O"],
    ["원가 분석", "O", "O"],
    ["견적서 비교", "O", "O"],
    ["골든셋 Excel 다운로드", "O", "O"],
    ["수식 직접 편집/삭제", "O", "X (요청만 가능)"],
    ["새 수식 추가", "O", "X (추가 요청만 가능)"],
    ["변경 요청 승인/반려", "O", "X"],
    ["적용 부서 설정", "O", "X"],
    ["요청 취소 (본인 대기 건)", "-", "O"],
], [4, 4, 4])

add_text(s, 0.6, 5.5, 12, 0.5, "부서 목록: 전체 / 원가관리팀 / 견적1팀 / 견적2팀 / 견적3팀 / 구매팀 / 품질팀", 12, False, GRAY)

# ── 14. 비기능 요구사항 ──
s = add_slide("15. 비기능 요구사항 / 용어 정의", "Non-Functional Requirements & Glossary")
add_table(s, 0.6, 1.3, 5.5, [
    ["항목", "요구사항"],
    ["응답 시간", "페이지 로딩 2초 이내"],
    ["Excel 파싱", "파일당 5분 이내"],
    ["브라우저", "Chrome 90+, Edge 90+, Safari 15+"],
    ["해상도", "최소 1280×720, 권장 1920×1080"],
    ["접근성", "키보드 네비게이션, 스크린리더 지원"],
    ["보안", "사번 인증, 5회 잠금, 역할 기반 접근"],
], [2, 3.5])

add_table(s, 6.8, 1.3, 5.8, [
    ["용어", "설명"],
    ["골든셋", "검증/분석 완료된 최종 원가계산서 데이터"],
    ["파싱", "Excel에서 AI가 데이터를 자동 추출하는 과정"],
    ["이상치", "AI가 감지한 비정상 원가 항목"],
    ["신뢰도", "AI 파싱 결과의 정확도 (0~100%)"],
    ["변경 요청", "일반 사용자의 수식 수정 승인 요청"],
    ["적용 부서", "수식이 적용되는 대상 부서 범위"],
], [1.5, 4.3])

# ── 15. 끝 ──
s = prs.slides.add_slide(prs.slide_layouts[6])
bg = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
bg.fill.solid()
bg.fill.fore_color.rgb = MOBIS_DARK
bg.line.fill.background()
bar = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, Inches(3.5), prs.slide_width, Inches(0.06))
bar.fill.solid()
bar.fill.fore_color.rgb = MOBIS_RED
bar.line.fill.background()
add_text(s, 1.5, 2.2, 10, 1, "Thank You", 48, True, WHITE, PP_ALIGN.CENTER)
add_text(s, 1.5, 4.0, 10, 0.6, "현대모비스 견적 원가 분석 시스템", 20, False, RGBColor(180,180,180), PP_ALIGN.CENTER)
add_text(s, 1.5, 4.8, 10, 0.5, "문의: 원가관리팀", 14, False, RGBColor(140,140,140), PP_ALIGN.CENTER)

# ── 저장 ──
prs.save(r'c:\WORK\cost-analysis-src\docs\견적원가분석시스템_설계서.pptx')
print("PPTX 생성 완료!")
