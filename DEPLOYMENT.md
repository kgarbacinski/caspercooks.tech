# Deployment Guide

This guide covers deploying the caspercooks.tech portfolio to various platforms.

## Prerequisites

Before deploying, ensure you have:
1. ✅ Resend API key configured (see [EMAIL_SETUP.md](./EMAIL_SETUP.md))
2. ✅ All changes committed to GitHub
3. ✅ Environment variables ready

---

## Option 1: Vercel (Recommended - Easiest)

Vercel is the recommended platform for Next.js applications with zero-config deployment.

### Steps:

1. **Push to GitHub** (already done)
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository: `kgarbacinski/caspercooks.tech`

3. **Configure Environment Variables**
   - In Vercel dashboard, go to: Settings → Environment Variables
   - Add:
     - Name: `RESEND_API_KEY`
     - Value: Your Resend API key (e.g., `re_xxxxxxxxxxxxx`)
     - Environment: Production, Preview, Development

4. **Deploy**
   - Vercel will automatically deploy
   - Your site will be live at: `https://your-project.vercel.app`
   - Configure custom domain in Vercel settings

### Auto-Deploy on Push

Vercel automatically deploys when you push to GitHub.

---

## Option 2: Docker on VPS (Current Setup)

Deploy to your Mikrus VPS using the provided deployment script.

### Steps:

1. **Set Environment Variable Locally**
   ```bash
   export RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```

2. **Run Deployment Script**
   ```bash
   ./deploy.sh
   ```

---

## Post-Deployment Checklist

After deploying, verify:

- [ ] Website loads correctly
- [ ] Dev ↔ CEO theme toggle works
- [ ] Coin flip avatar animation works
- [ ] Contact form submits successfully
- [ ] Email is received at kacpergarbacinski@gmail.com

---

## Troubleshooting

### Contact form not sending emails
- Check RESEND_API_KEY is set in environment variables
- Verify API key is valid at [resend.com](https://resend.com)
- Ensure you haven't exceeded free tier limit (100 emails/day)
