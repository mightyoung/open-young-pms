import httpx
import asyncio
import json

BASE_URL = "http://localhost:8000/api/v1"

async def test_auth():
    print("🧪 正在测试认证 API...")
    async with httpx.AsyncClient() as client:
        # 登录
        resp = await client.post(f"{BASE_URL}/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        if resp.status_code == 200:
            token = resp.json()["data"]["access_token"]
            print(f"✅ 登录成功，Token: {token[:10]}...")
            return token
        else:
            print(f"❌ 登录失败: {resp.text}")
            return None

async def test_protected_routes(token):
    if not token: return
    headers = {"Authorization": f"Bearer {token}"}
    
    routes = [
        ("/users/me", "GET"),
        ("/projects", "GET"),
        ("/tasks/my", "GET"),
        ("/hazards", "GET"),
        ("/notifications", "GET")
    ]
    
    async with httpx.AsyncClient() as client:
        for route, method in routes:
            print(f"🧪 正在测试 {method} {route}...")
            if method == "GET":
                resp = await client.get(f"{BASE_URL}{route}", headers=headers)
            
            if resp.status_code == 200:
                print(f"✅ {route} 响应成功")
            else:
                print(f"❌ {route} 失败: {resp.status_code}")

async def main():
    token = await test_auth()
    if token:
        await test_protected_routes(token)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as e:
        print(f"⚠️ 请确保后端服务已启动: {e}")
