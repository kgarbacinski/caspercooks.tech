# Email Setup Instructions

This project uses [Resend](https://resend.com) for sending contact form emails.

## Setup Steps

### 1. Create a Resend Account
1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account (100 emails/day on free tier)
3. Verify your email address

### 2. Get Your API Key
1. Log in to your Resend dashboard
2. Navigate to "API Keys" section
3. Click "Create API Key"
4. Copy the generated API key

### 3. Configure Environment Variables
1. Open the `.env.local` file in the project root
2. Replace `your_resend_api_key_here` with your actual API key:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
   ```

### 4. (Optional) Configure Your Domain
By default, emails are sent from `onboarding@resend.dev`. To use your own domain:

1. Add your domain in the Resend dashboard
2. Verify DNS records (SPF, DKIM, DMARC)
3. Update the `from` field in `app/api/contact/route.ts`:
   ```typescript
   from: 'Contact Form <noreply@yourdomain.com>',
   ```

### 5. Test the Contact Form
1. Start the development server: `npm run dev`
2. Navigate to the contact section on your portfolio
3. Fill out and submit the form
4. Check your email (kacpergarbacinski@gmail.com) for the message

## Troubleshooting

### Error: "Failed to send email"
- Check that your API key is correct in `.env.local`
- Ensure you haven't exceeded the daily email limit (100 on free tier)
- Check the console for detailed error messages

### Email not received
- Check your spam folder
- Verify the API key is valid
- Check Resend dashboard for delivery logs

### Development vs Production
- The `.env.local` file is gitignored and only used locally
- For production (Vercel/Docker), set the `RESEND_API_KEY` environment variable in your hosting platform

## Email Template
The email template can be customized in `app/api/contact/route.ts`. The current template includes:
- Contact type (Developer/Founder/General)
- Sender's name and email
- Message content
- Reply-to functionality

## Rate Limits
- Free tier: 100 emails/day
- Pro tier: 50,000 emails/month
- See [Resend pricing](https://resend.com/pricing) for more details
