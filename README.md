This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Authentication & Database

### Database Setup (Supabase)
1. Ensure your `.env` contains the correct `DATABASE_URL` from your Supabase project settings (Connection Pooling mode: Session, Port 5432 or 6543).
2. Push the schema to creating tables:
   ```bash
   bun x drizzle-kit push
   ```

### Email Verification Setup (Gmail SMTP)
To enable real email sending (instead of console logging OTPs):
1. Go to your [Google Account Security](https://myaccount.google.com/security).
2. Enable **2-Step Verification**.
3. Search for **App Passwords**.
4. Create a new App Password (name it "CSSBattle").
5. Update your `.env`:
   ```env
   SMTP_USER=your-gmail@gmail.com
   SMTP_PASS=your-16-char-app-password
   ```

If you don't configure SMTP, the **OTP will be printed in your terminal console** when you register.

## Features
- **Minimalist UI**: Red/White/Black theme.
- **Challenges**: Served from database.
- **Leaderboard**: Real-time ranking.
- **Auth**: Custom email/password with OTP verification.
