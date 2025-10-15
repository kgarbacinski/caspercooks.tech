# Casper Cooks Portfolio

A modern, dual-identity portfolio website showcasing both developer expertise and entrepreneurial ventures.

## Features

- **Dual Theme System**: Switch between Developer and Founder modes
- **Interactive Hero Section**: Split-screen design with 3D parallax effects
- **Animated About Section**: Dual bio with animated counters
- **Projects Timeline**: Flippable project cards with impact metrics
- **Tech Stack Visualization**: Interactive technology showcase
- **Brands Showcase**: Highlight of 4 founded companies
- **Contact Form**: Animated contact section
- **Custom Cursor**: Interactive cursor with trail effect
- **Fully Responsive**: Mobile-first design
- **Performance Optimized**: Fast load times and smooth animations

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **3D Effects**: React Three Fiber (optional)
- **Font**: Inter

## Getting Started

### Install dependencies:

```bash
npm install
```

### Run development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Build for production:

```bash
npm run build
npm start
```

## Project Structure

```
.
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with ThemeProvider
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Navigation.tsx     # Nav with theme toggle
│   ├── HeroSection.tsx    # Split-screen hero
│   ├── AboutSection.tsx   # Dual bio section
│   ├── ProjectsTimeline.tsx  # Projects with flip cards
│   ├── TechStack.tsx      # Tech visualization
│   ├── BrandsShowcase.tsx # Company showcases
│   ├── ContactSection.tsx # Contact form
│   ├── CustomCursor.tsx   # Custom cursor
│   └── Footer.tsx         # Footer
├── contexts/              # React contexts
│   └── ThemeContext.tsx   # Theme management
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

Deploy easily with Vercel:

```bash
npm install -g vercel
vercel
```

Or deploy to any platform that supports Next.js.

## License

MIT License - feel free to use this as a template for your own portfolio!

---

Built with passion by Casper Cooks
