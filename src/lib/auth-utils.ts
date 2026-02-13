import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOTPEmail(email: string, otp: string) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  // Dev mode fallback: log to console
  if (!smtpUser || !smtpPass) {
    console.log(`\n========================================`);
    console.log(`  [DEV] OTP for ${email}: ${otp}`);
    console.log(`========================================\n`);
    return;
  }

  // Gmail SMTP setup
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: smtpUser,
      pass: smtpPass, // Gmail App Password (NOT your regular password)
    },
  });

  await transporter.sendMail({
    from: `"StyleWars" <${smtpUser}>`,
    to: email,
    subject: "StyleWars - Verification Code",
    text: `Your verification code is: ${otp}\n\nThis code expires in 10 minutes.`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 400px; margin: 0 auto; padding: 40px 20px; color: #333;">
        <h2 style="margin-bottom: 8px;">StyleWars Verification</h2>
        <p style="color: #666; font-size: 14px;">Enter this code to verify your account:</p>
        <div style="background: #111; color: #fff; padding: 20px; text-align: center; font-size: 32px; font-family: monospace; letter-spacing: 8px; font-weight: bold; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #999; font-size: 12px;">Expires in 10 minutes. Ignore if you didn't request this.</p>
      </div>
    `,
  });

  console.log(`✅ OTP email sent to ${email}`);
}
