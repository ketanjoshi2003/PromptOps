
import aiosmtplib
from email.message import EmailMessage
from app.config.settings import settings

async def send_otp_email(to_email: str, otp_code: str):
    """
    Sends an OTP email to the user.
    """
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print(f"SMTP Credentials not set. Simulate sending email to {to_email} with OTP: {otp_code}")
        return

    message = EmailMessage()
    message["From"] = settings.SMTP_FROM_EMAIL
    message["To"] = to_email
    message["Subject"] = "Your PromptOps Verification Code"
    
    html_content = f"""
    <html>
        <body>
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2>Welcome to PromptOps!</h2>
                <p>Please use the following code to verify your email address:</p>
                <h1 style="color: #4A90E2; font-size: 32px; letter-spacing: 5px;">{otp_code}</h1>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't request this, you can ignore this email.</p>
            </div>
        </body>
    </html>
    """
    
    message.set_content("Your Verification Code is: " + otp_code)
    message.add_alternative(html_content, subtype="html")

    try:
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            use_tls=False,
            start_tls=True,
        )
        print(f"OTP Email sent successfully to {to_email}")
    except Exception as e:
        print(f"Failed to send email: {e}")
        # Don't crash the app, just log error.
        # In prod, we might want to return an error if email is critical.
