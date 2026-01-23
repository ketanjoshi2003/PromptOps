import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_credit_flow():
    async with AsyncClient(app=app, base_url="http://testserver") as client:
        # Register a user
        resp = await client.post("/api/auth/register", json={"email": "test@example.com", "password": "testpass"})
        assert resp.status_code == 200
        # Login to get token
        resp = await client.post("/api/auth/token", json={"email": "test@example.com", "password": "testpass"})
        assert resp.status_code == 200
        token = resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        # Upgrade plan (adds 50 credits)
        resp = await client.post("/api/plan/upgrade", json={"plan": "dev"}, headers=headers)
        assert resp.status_code == 200
        assert resp.json()["credits"] == 50
        # Use one generation
        chat_payload = {"messages": [{"role": "user", "content": "Hello"}]}
        resp = await client.post("/api/chat/message", json=chat_payload, headers=headers)
        assert resp.status_code == 200
        # Verify credits decremented to 49
        resp = await client.get("/api/auth/me", headers=headers)
        assert resp.status_code == 200
        assert resp.json()["credits"] == 49
        # Exhaust credits
        for _ in range(49):
            await client.post("/api/chat/message", json=chat_payload, headers=headers)
        # Next call should be forbidden
        resp = await client.post("/api/chat/message", json=chat_payload, headers=headers)
        assert resp.status_code == 403
        assert resp.json()["detail"] == "Insufficient credits. Please upgrade your plan."
