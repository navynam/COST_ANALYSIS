"""
generate_call_graph.py — call-graph.yaml(원본) → call-graph.md(Mermaid) 생성

사용:  python docs/architecture/generate_call_graph.py

- 도메인별 계층 다이어그램(Page→Hook→Service→API→Controller→Service→Repo→Entity)
- 프론트↔백엔드 호출 조인 표 (매칭 / 불일치 후보)
- 상단 요약 + 전역 불일치 리포트
"""
from __future__ import annotations

import sys
from datetime import datetime

# Windows 콘솔(cp949)에서도 이모지/em-dash 출력이 깨지지 않도록
try:
    sys.stdout.reconfigure(encoding="utf-8")
except (AttributeError, ValueError):
    pass

from _callgraph_common import (
    ARCH_DIR, load_spec, compute_joins, frontend_calls, backend_endpoints,
    front_full_path,
)

OUT_PATH = ARCH_DIR / "call-graph.md"

STATUS_EMOJI = {
    "integrated": "🟢 연동",
    "partial": "🟡 부분연동",
    "mock-only": "⚪ mock전용",
}


def esc(s: str) -> str:
    return (s or "").replace('"', "'").replace("|", "/")


def sid(prefix: str, i: int) -> str:
    return f"{prefix}{i}"


def domain_diagram(d: dict, joins: dict) -> str:
    """도메인 1개의 계층형 Mermaid (aggregate)."""
    key = d["key"]
    fe = d.get("frontend") or {}
    be = d.get("backend") or {}
    lines = ["```mermaid", "flowchart LR"]

    # ── 프론트 계층 ──
    page = esc((fe.get("page", "").split("/")[-1]) or fe.get("feature", key))
    lines.append(f'  P_{key}["📄 {page}"]')
    hook_files = fe.get("hooks") or ([fe["hook"]] if fe.get("hook") else [])
    hook_label = esc(", ".join(h.split("/")[-1].replace(".ts", "").replace(".tsx", "") for h in hook_files) or "—")
    lines.append(f'  H_{key}["🪝 {hook_label}"]')
    lines.append(f"  P_{key} --> H_{key}")

    svc_files = [s["file"].split("/")[-1].replace(".ts", "") for s in fe.get("services", []) or []]
    lines.append(f'  FS_{key}["🔌 {esc(", ".join(svc_files) or "—")}"]')
    lines.append(f"  H_{key} --> FS_{key}")

    integration = fe.get("integration", "mock-only")
    has_calls = any((s.get("calls") for s in fe.get("services", []) or []))

    # ── 백엔드 계층 ──
    ctrls = [c["name"] for c in be.get("controllers", []) or []]
    svcs = be.get("services", []) or []
    repos = be.get("repositories", []) or []
    entities = [r["entity"] for r in repos]

    if ctrls:
        lines.append(f'  CT_{key}["🎛️ {esc(" · ".join(ctrls))}"]')
    if svcs:
        lines.append(f'  SV_{key}["⚙️ {esc(" · ".join(svcs))}"]')
    if repos:
        lines.append(f'  RP_{key}[("🗄️ {esc(" · ".join(r["name"] for r in repos))}")]')
    if entities:
        lines.append(f'  EN_{key}{{{{"{esc(" · ".join(entities))}"}}}}')

    # 프론트 → API 경계
    if has_calls and ctrls:
        lines.append(f"  FS_{key} -->|REST| CT_{key}")
    elif not has_calls:
        lines.append(f'  MOCK_{key}["🧪 mockData"]')
        lines.append(f"  FS_{key} -.-> MOCK_{key}")

    # 백엔드 계층 연결
    if ctrls and svcs:
        lines.append(f"  CT_{key} --> SV_{key}")
    if svcs and repos:
        lines.append(f"  SV_{key} --> RP_{key}")
    elif ctrls and repos and not svcs:
        lines.append(f"  CT_{key} --> RP_{key}")
    if repos and entities:
        lines.append(f"  RP_{key} --> EN_{key}")

    lines.append("```")
    return "\n".join(lines)


def joins_table(domain_key: str, joins: dict) -> str:
    rows = []
    for f, b in joins["matched"]:
        if f["domain"] != domain_key:
            continue
        rows.append(f"| ✅ | `{f['method']} {f['full']}` | `{f['fn']}()` | `{b['controller']}.{b['handler']}` |")
    for f in joins["front_only"]:
        if f["domain"] != domain_key:
            continue
        rows.append(f"| ⚠️ | `{f['method']} {f['full']}` | `{f['fn']}()` | **백엔드 매칭 없음** |")
    for b in joins["back_only"]:
        if b["domain"] != domain_key:
            continue
        rows.append(f"| 💤 | `{b['method']} {b['full']}` | — | `{b['controller']}.{b['handler']}` (프론트 호출 없음) |")
    if not rows:
        return "_호출 조인 없음 (mock 전용 또는 미정의)_\n"
    head = "| | 엔드포인트 | 프론트 | 백엔드 |\n|---|---|---|---|\n"
    return head + "\n".join(rows) + "\n"


def build_md(spec: dict) -> str:
    joins = compute_joins(spec)
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    md = []
    md.append("# 서비스 호출 관계도 (Call Graph)")
    md.append("")
    md.append(f"> ⚙️ **자동 생성 파일** — 직접 수정하지 마세요. 원본은 [`call-graph.yaml`](call-graph.yaml).")
    md.append(f"> 갱신: `python docs/architecture/generate_call_graph.py` · 최종 생성 {now}")
    md.append("")
    md.append("범례: 🟢 연동 · 🟡 부분연동 · ⚪ mock전용 · ✅ 매칭 · ⚠️ 불일치 후보 · 💤 프론트 미사용")
    md.append("")

    # ── 요약 표 ──
    md.append("## 📊 도메인 요약")
    md.append("")
    md.append("| 도메인 | 라우트 | 연동 | 프론트 호출 | 백엔드 EP | 불일치 |")
    md.append("|---|---|---|---:|---:|---:|")
    for d in spec["domains"]:
        fe = d.get("frontend") or {}
        f_calls = [f for f in frontend_calls(spec) if f["domain"] == d["key"]]
        b_eps = [b for b in backend_endpoints(spec) if b["domain"] == d["key"]]
        mism = len([f for f in joins["front_only"] if f["domain"] == d["key"]])
        st = STATUS_EMOJI.get(fe.get("integration", "mock-only"), "?")
        md.append(f"| **{d['key']}** ({d['title']}) | `{fe.get('route','—')}` | {st} "
                  f"| {len(f_calls)} | {len(b_eps)} | {'⚠️ '+str(mism) if mism else '—'} |")
    md.append("")

    # ── 전역 불일치 리포트 ──
    fo = joins["front_only"]
    if fo:
        md.append("## ⚠️ 불일치 후보 (프론트 호출 ↔ 백엔드 매칭 실패)")
        md.append("")
        md.append("| 도메인 | 프론트 호출 | 정규화 경로 |")
        md.append("|---|---|---|")
        for f in fo:
            md.append(f"| {f['domain']} | `{f['fn']}()` `{f['method']} {f['endpoint']}` | `{f['full']}` |")
        md.append("")
        md.append("> 위 항목은 프론트가 호출하지만 매칭되는 백엔드 엔드포인트가 없습니다. "
                  "프록시 rewrite가 없다면 실제 통합 버그일 가능성이 높습니다.")
        md.append("")

    # ── 도메인별 상세 ──
    md.append("## 🧭 도메인별 호출 사슬")
    md.append("")
    for d in spec["domains"]:
        fe = d.get("frontend") or {}
        be = d.get("backend") or {}
        st = STATUS_EMOJI.get(fe.get("integration", "mock-only"), "?")
        md.append(f"### {d['key']} — {d['title']}  ·  {st}")
        md.append("")
        md.append(f"- **프론트** `{fe.get('route','—')}` · `{fe.get('page','—')}`")
        md.append(f"- **백엔드** `{be.get('package','—')}`")
        for note in _notes_for(d):
            md.append(f"- ⚠️ {note}")
        md.append("")
        md.append(domain_diagram(d, joins))
        md.append("")
        md.append(joins_table(d["key"], joins))
        md.append("")
    return "\n".join(md)


def _notes_for(d: dict):
    """YAML 주석에 넣기 애매한 알려진 이슈를 코드로 추출(있으면)."""
    notes = []
    for section in (d.get("frontend"), d.get("backend")):
        if section and isinstance(section.get("notes"), list):
            notes.extend(section["notes"])
    return notes


def main():
    spec = load_spec()
    md = build_md(spec)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        f.write(md)
    joins = compute_joins(spec)
    print(f"[generate] {OUT_PATH.name} 작성 완료 — "
          f"매칭 {len(joins['matched'])} · 불일치후보 {len(joins['front_only'])} · 미사용 {len(joins['back_only'])}")


if __name__ == "__main__":
    main()
