"""
verify_call_graph.py — call-graph.yaml 과 실제 소스의 드리프트 검사

사용:  python docs/architecture/verify_call_graph.py

- 프론트: src/**/*.ts(x) 에서 apiClient.<method>('...') 호출 실측
- 백엔드: cost-analysis-was/**/*.java 에서 @RequestMapping + @<Verb>Mapping 실측
- YAML 문서화 내용과 대조 → 누락(문서에 없음) / 잔존(소스에 없음) 리포트
- 드리프트가 있으면 종료코드 1 (git hook / CI 에서 활용 가능)
"""
from __future__ import annotations

import re
import sys

# Windows 콘솔(cp949)에서도 이모지 출력이 깨지지 않도록
try:
    sys.stdout.reconfigure(encoding="utf-8")
except (AttributeError, ValueError):
    pass

from _callgraph_common import (
    FRONTEND_ROOT, backend_root, load_spec,
    frontend_calls, backend_endpoints, front_full_path, back_full_path,
    normalize_path,
)

FE_CALL_RE = re.compile(
    r"apiClient\.(get|post|put|patch|delete)\(\s*[`'\"]([^`'\"]+)[`'\"]",
    re.IGNORECASE,
)
CLASS_MAP_RE = re.compile(r"@RequestMapping\(\s*(?:value\s*=\s*)?\"([^\"]*)\"")
METHOD_MAP_RE = re.compile(
    r"@(Get|Post|Put|Patch|Delete)Mapping\b(?:\(([^)]*)\))?"
)
FIRST_STR_RE = re.compile(r"\"([^\"]*)\"")


# ── 실측: 프론트 ─────────────────────────────────────────────────────────────
def scan_frontend(api_base: str):
    found = set()  # (METHOD, normalized_full_path)
    src = FRONTEND_ROOT / "src"
    for path in src.rglob("*.ts*"):
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        for m in FE_CALL_RE.finditer(text):
            method = m.group(1).upper()
            endpoint = m.group(2)
            found.add((method, front_full_path(api_base, endpoint)))
    return found


# ── 실측: 백엔드 ─────────────────────────────────────────────────────────────
def scan_backend(be_root):
    found = set()  # (METHOD, normalized_full_path)
    java_root = be_root / "src" / "main" / "java"
    if not java_root.exists():
        return found, False
    for path in java_root.rglob("*.java"):
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        if "Controller" not in text or "Mapping" not in text:
            continue
        cm = CLASS_MAP_RE.search(text)
        base = cm.group(1) if cm else ""
        for m in METHOD_MAP_RE.finditer(text):
            verb = m.group(1).upper()
            args = m.group(2) or ""
            sm = FIRST_STR_RE.search(args)
            path_seg = sm.group(1) if sm else ""
            found.add((verb, back_full_path(base, path_seg)))
    return found, True


def documented_frontend(spec):
    return {(f["method"], f["full"]) for f in frontend_calls(spec)}


def documented_backend(spec):
    return {(b["method"], b["full"]) for b in backend_endpoints(spec)}


def report(title, missing, stale):
    print(f"\n── {title} ──")
    if not missing and not stale:
        print("  ✅ 일치 (드리프트 없음)")
        return 0
    for method, full in sorted(missing):
        print(f"  ➕ 소스에 있으나 YAML 미문서화:  {method} {full}")
    for method, full in sorted(stale):
        print(f"  ➖ YAML 에 있으나 소스에 없음:    {method} {full}")
    return 1


def main():
    spec = load_spec()
    api_base = spec["repos"]["frontend"]["api_base"]

    fe_actual = scan_frontend(api_base)
    fe_doc = documented_frontend(spec)
    fe_missing = fe_actual - fe_doc
    fe_stale = fe_doc - fe_actual

    be_root = backend_root(spec)
    be_actual, be_ok = scan_backend(be_root)
    be_doc = documented_backend(spec)

    print("=" * 64)
    print("call-graph 드리프트 검사")
    print(f"  frontend: {FRONTEND_ROOT / 'src'}")
    print(f"  backend : {be_root}  {'(found)' if be_ok else '(⚠ 경로 없음 - 백엔드 검사 생략)'}")
    print("=" * 64)

    code = 0
    code |= report("프론트엔드 (apiClient 호출)", fe_missing, fe_stale)
    if be_ok:
        be_missing = be_actual - be_doc
        be_stale = be_doc - be_actual
        code |= report("백엔드 (@Mapping 엔드포인트)", be_missing, be_stale)

    print("\n" + "=" * 64)
    if code == 0:
        print("✅ 드리프트 없음 — 문서가 소스와 일치합니다.")
    else:
        print("⚠️  드리프트 발견 — call-graph.yaml 을 갱신 후 generate 를 다시 실행하세요.")
    print("=" * 64)
    sys.exit(code)


if __name__ == "__main__":
    main()
