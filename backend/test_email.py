
import asyncio
import os
import aiosmtplib
from email.message import EmailMessage

# You can run this file directly: python test_email.py
# Make sure your .env file is loaded or variables are set in your shell

# Configuration (Load from env or edit here for quick test)
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "") # ENTER YOUR EMAIL HERE TO TEST IF ENV IS EMPTY
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "") # ENTER YOUR APP PASSWORD HERE
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", "noreply@example.com")
TEST_RECIPIENT = os.getenv("SMTP_USER", "") # Send to self by default

async def test_send_email():
    print("--- EMail Verification Script ---")
    print(f"Host: {SMTP_HOST}:{SMTP_PORT}")
    print(f"User: {SMTP_USER}")
    print(f"From: {SMTP_FROM_EMAIL}")
    
    if not SMTP_USER or not SMTP_PASSWORD:
        print("ERROR: SMTP_USER or SMTP_PASSWORD is not set.")
        return

    message = EmailMessage()
    message["From"] = SMTP_FROM_EMAIL
    message["To"] = TEST_RECIPIENT
    message["Subject"] = "Test Email from PromptOps Debugger"
    message.set_content("If you are reading this, your SMTP configuration is correct!")

    try:
        print("Attempting to connect and send...")
        await aiosmtplib.send(
            message,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            username=SMTP_USER,
            password=SMTP_PASSWORD,
            use_tls=False,
            start_tls=True,
        )
        print(f"SUCCESS: Email sent to {TEST_RECIPIENT}. Check your inbox/spam.")
    except Exception as e:
        print(f"FAILURE: Could not send email.")
        print(f"Error Type: {type(e).__name__}")
        print(f"Error Details: {e}")

if __name__ == "__main__":
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(test_send_email())
