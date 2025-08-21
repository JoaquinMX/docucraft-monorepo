# Technology Stack & Build System

## Core Technologies

### Frontend Framework

- **Astro 5.12+**: Used for both landing page and main application
- **TailwindCSS 4.1+**: Utility-first CSS framework with Vite plugin integration
- **Mermaid.js 11.9+**: Diagram rendering and visualization

### Backend & Infrastructure

- **Cloudflare Workers**: Serverless API using Hono framework
- **Firebase**: Backend-as-a-Service (Firestore, Authentication, Storage)
- **Vercel**: Hosting for main SSR application
- **Cloudflare Pages**: Hosting for static landing page

### API Framework

- **Hono 4.6+**: Web framework for Cloudflare Workers
- **Chanfana 2.6+**: OpenAPI 3.1 schema generation and validation
- **Zod 3.24+**: Runtime type validation

### AI Integration

- **Google Generative AI**: AI model integration via @google/genai

## Build System

### Package Manager

- **Bun**: Primary package manager (bun.lock files present)
- All projects use ES modules (`"type": "module"`)

### Development Commands

#### docucraft-app (Main Application)

```bash
cd docucraft-app
bun install
bun run dev          # Start development server
bun run build        # Build for production
bun run preview      # Preview production build
```

#### docucraft-landing (Landing Page)

```bash
cd docucraft-landing
bun install
bun run dev          # Start development server
bun run build        # Build for production
bun run preview      # Preview production build
```

#### docucraft-worker (API)

```bash
cd docucraft-worker
bun install
bun run dev          # Start local Wrangler development
bun run deploy       # Deploy to Cloudflare Workers
bun run cf-typegen   # Generate TypeScript types
```

## Deployment Strategy

### Automated CI/CD

- **GitHub Actions**: Automatic deployment on push to main branch
- **Vercel**: Auto-deployment for docucraft-app
- **Cloudflare Pages**: Auto-deployment for docucraft-landing
- **Cloudflare Workers**: Auto-deployment for docucraft-worker

### Performance Monitoring

- **Lighthouse**: Core Web Vitals testing (included in devDependencies)
- **New Relic**: Application performance monitoring
- **Vercel Analytics**: Real user monitoring for main app

## Configuration Standards

### Astro Configuration

- Main app uses `output: "server"` for SSR
- Landing page uses static generation
- TailwindCSS integrated via Vite plugin
- Vercel adapter with image service enabled

### TypeScript

- All projects use TypeScript
- Strict type checking enabled
- Generated types for Cloudflare Workers bindings
