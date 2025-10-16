# Casper Cooks Portfolio

A modern, dual-identity portfolio website showcasing both developer expertise and entrepreneurial ventures.

## Features

- **Dual Theme System**: Switch between Developer and Founder modes
- **Interactive Hero Section**: Split-screen design with 3D parallax effects and coin flip avatar animation
- **Animated About Section**: Dual bio with animated counters
- **Projects Timeline**: Flippable project cards with impact metrics
- **Tech Stack Visualization**: Interactive technology showcase
- **Brands Showcase**: Highlight of 4 founded companies with adaptive backgrounds
- **Contact Form**: Animated contact section with email integration (Resend)
- **Custom Cursor**: Interactive cursor with trail effect
- **Fully Responsive**: Mobile-first design
- **Performance Optimized**: Fast load times and smooth animations

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **3D Effects**: React Three Fiber (optional)
- **Email**: Resend
- **Font**: Inter

## Getting Started

### 1. Install dependencies:

```bash
npm install
```

### 2. Configure Email (Optional)

The contact form requires Resend API key to send emails. Follow the instructions in [EMAIL_SETUP.md](./EMAIL_SETUP.md) to configure:

1. Create a free account at [resend.com](https://resend.com)
2. Get your API key
3. Create `.env.local` file:
   ```bash
   RESEND_API_KEY=your_api_key_here
   ```

### 3. Run development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### 4. Build for production:

```bash
npm run build
npm start
```

## Project Structure

```
.
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── contact/       # Contact form endpoint
│   ├── layout.tsx         # Root layout with ThemeProvider
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Navigation.tsx     # Nav with theme toggle
│   ├── HeroSection.tsx    # Split-screen hero with coin flip avatar
│   ├── AboutSection.tsx   # Dual bio section
│   ├── ProjectsTimeline.tsx  # Projects with flip cards
│   ├── TechStack.tsx      # Tech visualization
│   ├── BrandsShowcase.tsx # Company showcases
│   ├── ContactSection.tsx # Contact form with email
│   ├── CustomCursor.tsx   # Custom cursor
│   └── Footer.tsx         # Footer
├── contexts/              # React contexts
│   └── ThemeContext.tsx   # Theme management
├── .env.local             # Environment variables (gitignored)
├── EMAIL_SETUP.md         # Email configuration guide
└── tailwind.config.ts     # Tailwind configuration

```

## Customization

### Update Personal Info

Edit `CONTENT.md` with your personal information, then update the components with your data.

### Change Colors

Modify `tailwind.config.ts` to change the developer and founder theme colors:

```typescript
colors: {
  developer: {
    bg: '#0a0a0a',
    accent: '#00ff88',
    // ...
  },
  founder: {
    bg: '#f8f9fa',
    accent: '#ff6b35',
    // ...
  },
}
```

### Add Projects

Update the `projects` array in `components/ProjectsTimeline.tsx`

### Update Brands

Modify the `brands` array in `components/BrandsShowcase.tsx`

## Deployment

### CI/CD with GitHub Actions (Recommended for VPS)

Automatic deployment on every push to `main`:

1. **Configure GitHub Secrets** (see [CI_CD_SETUP.md](./CI_CD_SETUP.md)):
   - `SSH_HOST`, `SSH_USER`, `SSH_PORT`, `SSH_PRIVATE_KEY`
   - `RESEND_API_KEY`

2. **Push to main branch**:
   ```bash
   git push origin main
   ```

3. **GitHub Actions automatically**:
   - Builds Docker image
   - Deploys to VPS
   - Restarts container with new code

For detailed setup instructions, see [CI_CD_SETUP.md](./CI_CD_SETUP.md)

### Vercel (Alternative)

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variable in Vercel dashboard:
   - `RESEND_API_KEY` = your Resend API key
4. Deploy!

```bash
# Or use Vercel CLI
npm install -g vercel
vercel
```

### Manual Docker Deployment

```bash
# Build and run
docker build -t portfolio .
docker run -p 3000:3000 -e RESEND_API_KEY=your_key portfolio

# Or use deploy script
export RESEND_API_KEY=your_key
./deploy.sh
```

### Other Platforms

Deploy to any platform that supports Next.js (Netlify, Railway, etc.):

1. Ensure you set the `RESEND_API_KEY` environment variable
2. Build command: `npm run build`
3. Start command: `npm start`
4. Node version: 18+

**Important**: Don't forget to set the `RESEND_API_KEY` environment variable in your deployment platform for the contact form to work!

## License

MIT License - feel free to use this as a template for your own portfolio!

---

Built with passion by Casper Cooks
