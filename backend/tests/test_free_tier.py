
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_free_upgrade_flow():
    async with AsyncClient(app=app, base_url="http://testserver") as client:
        # 1. Register
        register_data = {"email": "upgrade_test@example.com", "password": "securepassword"}
        resp = await client.post("/api/auth/register", json=register_data)
        assert resp.status_code == 200
        
        # 2. Login
        login_data = {"email": "upgrade_test@example.com", "password": "securepassword"}
        resp = await client.post("/api/auth/token", json=login_data)
        assert resp.status_code == 200, f"Login failed: {resp.text}"
        token = resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # 3. Check Initial Logic (Free Plan, False usage)
        resp = await client.get("/api/auth/me", headers=headers)
        assert resp.status_code == 200
        user_data = resp.json()
        assert user_data["plan"] == "free"
        assert user_data["credits"] == 5 # Default
        assert user_data["has_used_free_trial"] == False
        
        # 4. Perform Upgrade (PUT /api/auth/upgrade)
        resp = await client.put("/api/auth/upgrade", headers=headers) # No body, just trigger
        assert resp.status_code == 200, f"Upgrade failed: {resp.text}"
        user_data = resp.json()
        
        # Verify 50 credits added and plan updated
        assert user_data["plan"] == "dev"
        assert user_data["credits"] == 55 # 5 + 50
        assert user_data["has_used_free_trial"] == True
        
        # 5. Verify Persistent State via /me
        resp = await client.get("/api/auth/me", headers=headers)
        user_data = resp.json()
        assert user_data["has_used_free_trial"] == True
        
        # 6. Try Upgrade AGAIN (Should fail)
        resp = await client.put("/api/auth/upgrade", headers=headers)
        assert resp.status_code == 403
        assert resp.json()["detail"] == "You have already used your one-time free upgrade."
