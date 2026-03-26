#!/usr/bin/env python3
"""API 回归测试 — 验证所有核心 API 格式和响应"""

import requests
import json
import sys
from datetime import datetime

BASE = "http://127.0.0.1:8001/api/v1"
TOKEN = None

def login():
    r = requests.post(f"{BASE}/auth/login", json={"username": "admin", "password": "admin123"})
    if r.status_code == 200:
        d = r.json()
        if "access_token" in d:
            return d["access_token"]
    return None

def check_api(method, path, expected_code="A0000", data=None):
    url = f"{BASE}{path}"
    headers = {"Authorization": f"Bearer {TOKEN}"} if TOKEN else {}
    
    try:
        if method == "GET":
            r = requests.get(url, headers=headers, timeout=5)
        elif method == "POST":
            r = requests.post(url, json=data or {}, headers=headers, timeout=5)
        elif method == "PATCH":
            r = requests.patch(url, json=data or {}, headers=headers, timeout=5)
        else:
            return {"status": "SKIP", "msg": f"未知方法 {method}"}
        
        if r.status_code >= 400:
            return {"status": "ERROR", "code": r.status_code, "msg": r.text[:80]}
        
        d = r.json()
        
        # 验证新格式
        if isinstance(d, dict) and "code" in d:
            if d["code"] == "A0000":
                return {"status": "PASS", "code": d.get("code"), "msg": "✅ A0000"}
            else:
                return {"status": "WARN", "code": d.get("code"), "msg": d.get("message", "?")}
        
        # 旧格式
        return {"status": "OLD", "code": "??", "msg": "旧格式响应"}
    
    except Exception as e:
        return {"status": "ERROR", "code": "??", "msg": str(e)[:60]}

def main():
    global TOKEN
    print("🔐 登录中...")
    TOKEN = login()
    if not TOKEN:
        print("❌ 登录失败")
        sys.exit(1)
    print("✅ 登录成功\n")

    apis = [
        ("GET",  "/projects"),
        ("GET",  "/tasks"),
        ("GET",  "/hazards"),
        ("GET",  "/reports"),
        ("GET",  "/dashboard/summary"),
        ("GET",  "/dashboard/hazard-trend"),
        ("GET",  "/approval/my-tasks"),
        ("GET",  "/forum/posts"),
        ("GET",  "/data/dict"),
        ("GET",  "/quality/standards"),
        ("GET",  "/contracts"),
        ("GET",  "/risks"),
        ("GET",  "/resources"),
        ("GET",  "/knowledge/documents"),
        ("GET",  "/notifications"),
        ("GET",  "/audit/logs"),
        ("POST", "/data/quality-rules"),
        ("POST", "/data/lineage"),
    ]

    results = []
    for method, path in apis:
        result = check_api(method, path)
        status_icon = {"PASS": "✅", "WARN": "⚠️", "ERROR": "❌", "SKIP": "⏭️", "OLD": "🔶"}.get(result["status"], "?")
        print(f"{status_icon} [{result['status']:8}] {method:4} {path}")
        if result["status"] != "PASS":
            print(f"        {result['msg']}")
        results.append((method, path, result))

    pass_count = sum(1 for _, _, r in results if r["status"] == "PASS")
    print(f"\n📊 通过: {pass_count}/{len(results)}")

if __name__ == "__main__":
    main()
