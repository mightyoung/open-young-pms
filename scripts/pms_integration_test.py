#!/usr/bin/env python3
"""
PMS Phase 1 集成测试脚本

覆盖范围：
- 认证 API
- 用户管理 API
- 组织架构 API
- 随手拍/隐患管理 API
- 角色权限 API
- 通知设置 API
- 论坛 API
- 报告中心 API
- 项目管理 API
- 任务管理 API

Usage:
    python3 scripts/pms_integration_test.py
    python3 scripts/pms_integration_test.py --check-health
"""

import httpx
import asyncio
import json
import argparse
from typing import Optional

BASE_URL = "http://localhost:8001/api/v1"
TEST_RESULTS = []


class TestResult:
    def __init__(self, name: str, method: str, path: str, status: int, success: bool, error: str = ""):
        self.name = name
        self.method = method
        self.path = path
        self.status = status
        self.success = success
        self.error = error
    
    def __str__(self):
        icon = "✅" if self.success else "❌"
        msg = f"{icon} {self.method:6} {self.path}"
        if not self.success:
            msg += f" - {self.error or f'Status {self.status}'}"
        return msg


def print_header(text: str):
    print(f"\n{'='*60}")
    print(f"  {text}")
    print("=" * 60)


def print_summary(results: list):
    total = len(results)
    passed = sum(1 for r in results if r.success)
    failed = total - passed
    
    print_header("测试汇总")
    print(f"  总测试数: {total}")
    print(f"  通过: {passed} ({passed/total*100:.0f}%)")
    print(f"  失败: {failed} ({failed/total*100:.0f}%)")
    
    if failed > 0:
        print("\n  失败详情:")
        for r in results:
            if not r.success:
                print(f"    - {r.method} {r.path}: {r.error or f'Status {r.status}'}")


async def get_token() -> Optional[str]:
    """获取认证 token"""
    print("\n🔐 获取认证 Token...")
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{BASE_URL}/auth/login",
                json={"username": "admin", "password": "admin123"},
                timeout=10.0
            )
            if resp.status_code == 200:
                data = resp.json()
                token = data.get("access_token")
                if token:
                    print(f"   ✅ 登录成功")
                    return token
                else:
                    print(f"   ❌ 登录失败: 无 token")
                    return None
            else:
                print(f"   ❌ 登录失败: {resp.status_code}")
                return None
    except Exception as e:
        print(f"   ❌ 连接失败: {e}")
        return None


async def test_health_check():
    """健康检查"""
    print_header("健康检查")
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{BASE_URL.replace('/api/v1', '')}/health", timeout=5.0)
            if resp.status_code == 200:
                print("   ✅ 后端服务正常")
                return True
            else:
                print(f"   ❌ 后端服务异常: {resp.status_code}")
                return False
    except Exception as e:
        print(f"   ❌ 无法连接到后端: {e}")
        return False


async def test_auth_and_user_api(client, headers):
    """测试认证和用户 API"""
    print_header("认证和用户 API")
    tests = []
    
    # 获取当前用户
    resp = await client.get(f"{BASE_URL}/users/me", headers=headers)
    tests.append(TestResult("获取当前用户", "GET", "/users/me", resp.status_code, resp.status_code == 200))
    
    # 列出用户
    resp = await client.get(f"{BASE_URL}/users", headers=headers)
    tests.append(TestResult("列出用户", "GET", "/users", resp.status_code, resp.status_code == 200))
    
    return tests


async def test_roles_api(client, headers):
    """测试角色管理 API"""
    print_header("角色权限 API")
    tests = []
    
    # 列出角色
    resp = await client.get(f"{BASE_URL}/roles", headers=headers)
    tests.append(TestResult("列出角色", "GET", "/roles", resp.status_code, resp.status_code == 200))
    
    return tests


async def test_organization_api(client, headers):
    """测试组织架构 API"""
    print_header("组织架构 API")
    tests = []
    
    # 列出公司
    resp = await client.get(f"{BASE_URL}/companies", headers=headers)
    tests.append(TestResult("列出公司", "GET", "/companies", resp.status_code, resp.status_code == 200))
    
    # 列出部门
    resp = await client.get(f"{BASE_URL}/departments", headers=headers)
    tests.append(TestResult("列出部门", "GET", "/departments", resp.status_code, resp.status_code == 200))
    
    # 部门树
    resp = await client.get(f"{BASE_URL}/departments/tree", headers=headers)
    tests.append(TestResult("部门树", "GET", "/departments/tree", resp.status_code, resp.status_code == 200))
    
    return tests


async def test_hazards_api(client, headers):
    """测试随手拍/隐患管理 API"""
    print_header("隐患管理 API")
    tests = []
    
    # 列出隐患
    resp = await client.get(f"{BASE_URL}/hazards", headers=headers)
    tests.append(TestResult("列出隐患", "GET", "/hazards", resp.status_code, resp.status_code == 200))
    
    # 隐患统计
    resp = await client.get(f"{BASE_URL}/hazards/stats/summary", headers=headers)
    tests.append(TestResult("隐患统计", "GET", "/hazards/stats/summary", resp.status_code, resp.status_code == 200))
    
    # 草稿箱
    resp = await client.get(f"{BASE_URL}/hazards/drafts", headers=headers)
    tests.append(TestResult("草稿箱", "GET", "/hazards/drafts", resp.status_code, resp.status_code == 200))
    
    return tests


async def test_notification_settings_api(client, headers):
    """测试通知设置 API"""
    print_header("通知设置 API")
    tests = []
    
    # 获取通知设置
    resp = await client.get(f"{BASE_URL}/notification-settings", headers=headers)
    tests.append(TestResult("获取通知设置", "GET", "/notification-settings", resp.status_code, resp.status_code == 200))
    
    # 更新通知设置
    if resp.status_code == 200:
        current = resp.json()
        new_settings = {**current, "hazard_enabled": True}
        resp2 = await client.put(
            f"{BASE_URL}/notification-settings",
            headers=headers,
            json=new_settings
        )
        tests.append(TestResult("更新通知设置", "PUT", "/notification-settings", resp2.status_code, resp2.status_code in [200, 201]))
    
    return tests


async def test_forum_api(client, headers):
    """测试论坛 API"""
    print_header("论坛 API")
    tests = []
    
    # 列出帖子
    resp = await client.get(f"{BASE_URL}/forum/posts", headers=headers)
    tests.append(TestResult("列出帖子", "GET", "/forum/posts", resp.status_code, resp.status_code == 200))
    
    # 创建帖子
    resp = await client.post(
        f"{BASE_URL}/forum/posts",
        headers=headers,
        json={"title": "测试帖子", "content": "这是集成测试创建的帖子"}
    )
    tests.append(TestResult("创建帖子", "POST", "/forum/posts", resp.status_code, resp.status_code in [200, 201]))
    
    # 如果创建成功，清理
    if resp.status_code in [200, 201]:
        post_id = resp.json().get("data", {}).get("id")
        if post_id:
            resp2 = await client.delete(f"{BASE_URL}/forum/posts/{post_id}", headers=headers)
            tests.append(TestResult("删除帖子", "DELETE", f"/forum/posts/{post_id}", resp2.status_code, resp2.status_code in [200, 204]))
    
    return tests


async def test_reports_api(client, headers):
    """测试报告中心 API"""
    print_header("报告中心 API")
    tests = []
    
    # 列出报告
    resp = await client.get(f"{BASE_URL}/reports", headers=headers)
    tests.append(TestResult("列出报告", "GET", "/reports", resp.status_code, resp.status_code == 200))
    
    # 报告统计
    resp = await client.get(f"{BASE_URL}/reports/summary", headers=headers)
    tests.append(TestResult("报告统计", "GET", "/reports/summary", resp.status_code, resp.status_code == 200))
    
    return tests


async def test_projects_api(client, headers):
    """测试项目管理 API"""
    print_header("项目管理 API")
    tests = []
    
    # 列出项目
    resp = await client.get(f"{BASE_URL}/projects", headers=headers)
    tests.append(TestResult("列出项目", "GET", "/projects", resp.status_code, resp.status_code == 200))
    
    return tests


async def test_tasks_api(client, headers):
    """测试任务管理 API"""
    print_header("任务管理 API")
    tests = []
    
    # 列出任务
    resp = await client.get(f"{BASE_URL}/tasks", headers=headers)
    tests.append(TestResult("列出任务", "GET", "/tasks", resp.status_code, resp.status_code == 200))
    
    return tests


async def test_approval_api(client, headers):
    """测试审批 API"""
    print_header("审批 API")
    tests = []
    
    # 我的待审批任务 (correct endpoint: /approval/my-pending)
    resp = await client.get(f"{BASE_URL}/approval/my-pending", headers=headers)
    tests.append(TestResult("我的待审批", "GET", "/approval/my-pending", resp.status_code, resp.status_code == 200))
    
    return tests


async def test_dashboard_api(client, headers):
    """测试仪表盘 API"""
    print_header("仪表盘 API")
    tests = []
    
    # 公司概览 (dashboard/summary doesn't exist, use /dashboard/company/overview)
    resp = await client.get(f"{BASE_URL}/dashboard/company/overview", headers=headers)
    tests.append(TestResult("公司概览", "GET", "/dashboard/company/overview", resp.status_code, resp.status_code == 200))
    
    return tests


async def run_all_tests(token: str):
    """运行所有测试"""
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        all_results = []
        
        tests = await test_auth_and_user_api(client, headers)
        all_results.extend(tests)
        for r in tests:
            print(f"   {r}")
        
        tests = await test_roles_api(client, headers)
        all_results.extend(tests)
        for r in tests:
            print(f"   {r}")
        
        tests = await test_organization_api(client, headers)
        all_results.extend(tests)
        for r in tests:
            print(f"   {r}")
        
        tests = await test_hazards_api(client, headers)
        all_results.extend(tests)
        for r in tests:
            print(f"   {r}")
        
        tests = await test_notification_settings_api(client, headers)
        all_results.extend(tests)
        for r in tests:
            print(f"   {r}")
        
        tests = await test_forum_api(client, headers)
        all_results.extend(tests)
        for r in tests:
            print(f"   {r}")
        
        tests = await test_reports_api(client, headers)
        all_results.extend(tests)
        for r in tests:
            print(f"   {r}")
        
        tests = await test_projects_api(client, headers)
        all_results.extend(tests)
        for r in tests:
            print(f"   {r}")
        
        tests = await test_tasks_api(client, headers)
        all_results.extend(tests)
        for r in tests:
            print(f"   {r}")
        
        tests = await test_approval_api(client, headers)
        all_results.extend(tests)
        for r in tests:
            print(f"   {r}")
        
        tests = await test_dashboard_api(client, headers)
        all_results.extend(tests)
        for r in tests:
            print(f"   {r}")
        
        return all_results


async def main():
    parser = argparse.ArgumentParser(description="PMS Phase 1 集成测试")
    parser.add_argument("--check-health", action="store_true", help="仅检查后端健康状态")
    parser.add_argument("--base-url", default=BASE_URL, help=f"API Base URL (默认: {BASE_URL})")
    args = parser.parse_args()
    
    print_header("PMS Phase 1 集成测试")
    print(f"  目标服务: {args.base_url}")
    
    # 健康检查
    if not await test_health_check():
        print("\n⚠️ 后端服务不可用，请确保后端已启动")
        print("   启动后端: cd backend && uvicorn main:app --reload --port 8001")
        return
    
    # 仅健康检查模式
    if args.check_health:
        return
    
    # 获取 Token
    token = await get_token()
    if not token:
        print("\n⚠️ 无法获取认证 Token，请检查认证配置")
        return
    
    # 运行所有测试
    results = await run_all_tests(token)
    
    # 打印汇总
    print_summary(results)
    
    # 保存结果到文件
    output_file = "test_results.json"
    with open(output_file, "w") as f:
        json.dump([
            {
                "name": r.name,
                "method": r.method,
                "path": r.path,
                "status": r.status,
                "success": r.success,
                "error": r.error
            }
            for r in results
        ], f, indent=2, ensure_ascii=False)
    print(f"\n📄 结果已保存到: {output_file}")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n⚠️ 测试被用户中断")
    except Exception as e:
        print(f"\n⚠️ 测试异常: {e}")
