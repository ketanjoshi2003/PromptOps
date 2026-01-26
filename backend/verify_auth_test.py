
import asyncio
import requests
import random
import string
import sys
import os

# Add backend directory to sys.path
sys.path.append(os.getcwd())

from app.db.database import AsyncSessionLocal
from app.db.models import OTP
from sqlalchemy.future import select

BASE_URL = "http://localhost:8000/api/auth"

def generate_random_email():
    return "".join(random.choices(string.ascii_lowercase, k=10)) + "@example.com"

async def get_otp_from_db(email):
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(OTP).where(OTP.email == email).order_by(OTP.created_at.desc())
        )
        otp_record = result.scalars().first()
        return otp_record.otp_code if otp_record else None

def test_auth_flow():
    email = generate_random_email()
    password = "testpassword123"
    print(f"Testing with email: {email}")

    # 1. Register
    print("1. Registering...")
    response = requests.post(f"{BASE_URL}/register", json={"email": email, "password": password})
    if response.status_code != 200:
        print(f"Registration failed: {response.text}")
        return
    print("Registration successful.")

    # 2. Get OTP from DB
    print("2. Fetching OTP from DB...")
    otp_code = asyncio.run(get_otp_from_db(email))
    if not otp_code:
        print("Failed to fetch OTP from DB")
        return
    print(f"OTP found: {otp_code}")

    # 3. Verify OTP
    print("3. Verifying OTP...")
    response = requests.post(f"{BASE_URL}/verify-otp", json={"email": email, "otp": otp_code})
    if response.status_code != 200:
        print(f"OTP Verification failed: {response.text}")
        return
    data = response.json()
    if "access_token" not in data:
        print("No access token returned")
        return
    print("OTP Verified. Tokens received.")
    access_token = data["access_token"]

    # 4. Login (Redundant but good to test separate endpoint)
    print("4. Testing Login endpoint...")
    response = requests.post(f"{BASE_URL}/token", json={"email": email, "password": password})
    if response.status_code != 200:
        print(f"Login failed: {response.text}")
        return
    print("Login successful.")
    
    # 5. Get Me
    print("5. Testing Protected Route (/me)...")
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(f"{BASE_URL}/me", headers=headers)
    if response.status_code != 200:
        print(f"Get Me failed: {response.text}")
        return
    user_data = response.json()
    print(f"User retrieved: {user_data['email']}")
    print("SUCCESS: Full Auth Flow works!")

if __name__ == "__main__":
    test_auth_flow()
