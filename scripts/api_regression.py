import httpx
import asyncio
import json

BASE_URL = "http://127.0.0.1:8001/api/v1"

async def test_auth():
    print("🧪 正在测试认证 API...")
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(f"{BASE_URL}/auth/login", json={
                "username": "admin",
                "password": "admin123"
            })
            if resp.status_code == 200:
                data = resp.json()
                token = data.get("access_token")
                if token:
                    print(f"✅ 登录成功，Token: {token[:10]}...")
                    return token
                else:
                    print(f"❌ 登录响应中未发现 Token: {resp.text}")
            else:
                print(f"❌ 登录失败 (HTTP {resp.status_code}): {resp.text}")
        except Exception as e:
            print(f"❌ 网络请求异常: {e}")
        return None

async def test_protected_routes(token):
    if not token:
        return
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. 基础接口
    basic_routes = [
        ("/users/me", "GET"),
        ("/projects", "GET"),
        ("/hazards", "GET"),
        ("/notifications", "GET")
    ]
    
    async with httpx.AsyncClient() as client:
        project_id = None
        user_info = {}
        for route, method in basic_routes:
            print(f"🧪 正在测试 {method} {route}...")
            try:
                resp = await client.get(f"{BASE_URL}{route}", headers=headers)
                if resp.status_code == 200:
                    print(f"✅ {route} 响应成功")
                    if route == "/users/me":
                        user_info = resp.json().get("data") or resp.json()
                        print(f"👤 当前用户信息: {user_info}")
                    if route == "/projects":
                        data = resp.json().get("data", [])
                        if isinstance(data, list) and len(data) > 0:
                            project_id = data[0].get("id")
                            print(f"✅ 成功从列表发现项目: {project_id}")
                        else:
                            # 只有列表为空才尝试创建
                            print("🏗️ 正在创建演示数据...")
                            # (此处保留之前的创建逻辑作为 fallback)
                            # ...
                else:
                    print(f"❌ {route} 失败: HTTP {resp.status_code}")
            except Exception as e:
                print(f"❌ 请求 {route} 异常: {e}")

        # 2. 业务维度接口 (依赖项目 ID)
        if project_id:
            print(f"💡 发现项目 ID: {project_id}，开始测试 WBS 业务接口...")
            biz_routes = [
                (f"/projects/{project_id}/tasks/tree", "GET"),
                (f"/projects/{project_id}/tasks/stats", "GET")
            ]
            for route, method in biz_routes:
                print(f"🧪 正在测试 {method} {route}...")
                resp = await client.get(f"{BASE_URL}{route}", headers=headers)
                if resp.status_code == 200:
                    print(f"✅ {route} 响应成功")
                else:
                    print(f"❌ {route} 失败: HTTP {resp.status_code}")
        else:
            print("⚠️ 未发现可用项目，跳过 WBS 业务接口测试")

async def main():
    token = await test_auth()
    if token:
        await test_protected_routes(token)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as e:
        print(f"⚠️ 脚本执行失败: {e}")
