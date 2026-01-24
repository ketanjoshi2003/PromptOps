import requests
import json

def test_register():
    url = "http://127.0.0.1:8000/api/auth/register"
    payload = {
        "email": "test_auth_verify@example.com",
        "password": "StrongPassword123!"
    }
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        if response.status_code == 200 and "OTP sent" in response.text:
            print("SUCCESS: Registration flow initiated.")
        else:
            print("FAILURE: Registration did not behave as expected.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_register()
