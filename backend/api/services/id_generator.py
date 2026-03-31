"""ID 自动生成服务"""
import json
from datetime import datetime, timezone
from pathlib import Path

_COUNTER_FILE = Path("./data/counters.json")
_COUNTER_FILE.parent.mkdir(exist_ok=True)


def _load_counters() -> dict:
    if _COUNTER_FILE.exists():
        with open(_COUNTER_FILE) as f:
            return json.load(f)
    return {"hazard_seq": 0, "report_seq": 0, "date": ""}


def _save_counters(c: dict):
    _COUNTER_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(_COUNTER_FILE, "w") as f:
        json.dump(c, f)


def generate_hazard_no() -> str:
    """生成隐患编号: ISSUE-YYYYMMDD-XXX"""
    today = datetime.now(timezone.utc).strftime("%Y%m%d")
    counters = _load_counters()

    if counters.get("date") != today:
        counters = {"hazard_seq": 0, "date": today}

    counters["hazard_seq"] += 1
    seq = counters["hazard_seq"]
    _save_counters(counters)
    return f"ISSUE-{today}-{seq:03d}"


def generate_report_no(report_type: str) -> str:
    """生成报告编号: REPORT-YYYYMMDD-XXX"""
    today = datetime.now(timezone.utc).strftime("%Y%m%d")
    counters = _load_counters()

    key = f"{report_type}_seq"
    if counters.get("date") != today:
        counters = {**counters, "date": today}

    counters[key] = counters.get(key, 0) + 1
    seq = counters[key]
    _save_counters(counters)

    prefix = {"daily": "D", "weekly": "W", "monthly": "M"}.get(report_type, "R")
    return f"REPORT-{today}-{prefix}{seq:03d}"
