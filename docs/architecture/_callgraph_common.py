"""
call-graph 공통 로직 — 경로 정규화 / 풀스택 조인(front↔back) 계산.

generate_call_graph.py 와 verify_call_graph.py 가 함께 사용한다.
외부 의존성: PyYAML (pip install pyyaml)
"""
from __future__ import annotations

import re
from pathlib import Path

import yaml

# 이 스크립트 위치: <frontend_root>/docs/architecture/
ARCH_DIR = Path(__file__).resolve().parent
FRONTEND_ROOT = ARCH_DIR.parents[1]                 # docs/architecture -> docs -> <root>
YAML_PATH = ARCH_DIR / "call-graph.yaml"


def load_spec() -> dict:
    with open(YAML_PATH, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def backend_root(spec: dict) -> Path:
    """백엔드 레포 경로. 기본은 프론트 레포의 형제 디렉토리."""
    name = spec.get("repos", {}).get("backend", {}).get("root", "cost-analysis-was")
    return FRONTEND_ROOT.parent / name


# ── 경로 정규화 ─────────────────────────────────────────────────────────────
# 프론트: `/models/formulas/${id}`   백엔드: `/api/v1/formulas/{id}`  →  경로 파라미터를 {}로 통일
_PARAM_RE = re.compile(r"(\$\{[^}]+\}|\{[^}]+\}|:[A-Za-z_][A-Za-z0-9_]*)")


def normalize_path(path: str) -> str:
    """경로 파라미터를 `{}`로 치환하고 트레일링 슬래시를 제거해 비교 가능한 형태로."""
    if path is None:
        path = ""
    p = _PARAM_RE.sub("{}", path.strip())
    p = re.sub(r"/{2,}", "/", p)                     # // → /
    if len(p) > 1:
        p = p.rstrip("/")
    if not p.startswith("/") and p:
        p = "/" + p
    return p or "/"


def front_full_path(api_base: str, endpoint: str) -> str:
    return normalize_path((api_base or "") + (endpoint or ""))


def back_full_path(base: str, path: str) -> str:
    return normalize_path((base or "") + (path or ""))


# ── 스펙 → 평탄화된 엔드포인트 목록 ─────────────────────────────────────────
def frontend_calls(spec: dict):
    """(domain_key, service_file, fn, method, endpoint, full_path) 목록."""
    api_base = spec["repos"]["frontend"]["api_base"]
    out = []
    for d in spec["domains"]:
        fe = d.get("frontend") or {}
        for svc in fe.get("services", []) or []:
            for c in svc.get("calls", []) or []:
                out.append({
                    "domain": d["key"],
                    "service": svc["file"],
                    "fn": c.get("fn", ""),
                    "method": c["method"].upper(),
                    "endpoint": c["endpoint"],
                    "full": front_full_path(api_base, c["endpoint"]),
                })
    return out


def backend_endpoints(spec: dict):
    """(domain_key, controller, method, path, handler, full_path) 목록."""
    out = []
    for d in spec["domains"]:
        be = d.get("backend") or {}
        for ctrl in be.get("controllers", []) or []:
            for ep in ctrl.get("endpoints", []) or []:
                out.append({
                    "domain": d["key"],
                    "controller": ctrl["name"],
                    "method": ep["method"].upper(),
                    "path": ep.get("path", ""),
                    "handler": ep.get("handler", ""),
                    "full": back_full_path(ctrl["base"], ep.get("path", "")),
                })
    return out


def compute_joins(spec: dict):
    """프론트 호출 ↔ 백엔드 엔드포인트를 (method, 정규화 full path)로 매칭.

    반환: {
      'matched':   [(front, back), ...],
      'front_only':[front, ...],   # 프론트가 호출하나 매칭되는 백엔드 없음(불일치/미구현 후보)
      'back_only': [back, ...],    # 백엔드가 서빙하나 프론트 호출 없음(미사용/미연동)
    }
    """
    fronts = frontend_calls(spec)
    backs = backend_endpoints(spec)
    back_index = {}
    for b in backs:
        back_index.setdefault((b["method"], b["full"]), []).append(b)

    matched, front_only = [], []
    used = set()
    for f in fronts:
        key = (f["method"], f["full"])
        if key in back_index:
            b = back_index[key][0]
            matched.append((f, b))
            used.add((b["method"], b["full"], b["controller"], b["handler"]))
        else:
            front_only.append(f)

    back_only = [
        b for b in backs
        if (b["method"], b["full"], b["controller"], b["handler"]) not in used
    ]
    return {"matched": matched, "front_only": front_only, "back_only": back_only}
