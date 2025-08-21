# Project Structure & Organization

## Monorepo Layout

The project follows a monorepo structure with three distinct applications:

```
/
├── docucraft-app/          # Main SSR application (Vercel)
├── docucraft-landing/      # Static landing page (Cloudflare Pages)
├── docucraft-worker/       # Serverless API (Cloudflare Workers)
├── .kiro/                  # Kiro IDE configuration
├── .github/                # GitHub Actions workflows
└── readme.md               # Project documentation
```

## Application Structure Standards

### docucraft-app (Main Application)

```
docucraft-app/
├── src/
│   ├── components/         # Reusable Astro components
│   ├── constants/          # Application constants (Firestore, images)
│   ├── data/              # Mock data and static content
│   ├── firebase/          # Firebase client/server configuration
│   ├── layouts/           # Page layout components
│   ├── pages/             # File-based routing
│   │   ├── api/           # API endpoints
│   │   ├── new-project/   # Project creation flow
│   │   └── projects/      # Project management pages
│   ├── services/          # Business logic (Firestore operations)
│   ├── styles/            # Global CSS
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── public/                # Static assets
└── astro.config.mjs       # Astro configuration
```

### docucraft-landing (Landing Page)

```
docucraft-landing/
├── src/
│   ├── components/        # Landing page components
│   ├── layouts/           # Page layouts
│   ├── pages/             # Static pages (index, features, pricing)
│   └── styles/            # Global CSS
├── public/                # Static assets
└── astro.config.mjs       # Astro configuration
```

### docucraft-worker (API)

```
docucraft-worker/
├── src/
│   ├── endpoints/         # API endpoint handlers
│   ├── index.ts           # Main router
│   └── types.ts           # Shared type definitions
├── prompts/               # AI prompt templates
└── wrangler.jsonc         # Cloudflare Workers configuration
```

## Naming Conventions

### Files & Directories

- **Components**: PascalCase (e.g., `ProjectCard.astro`, `UserStoryCard.astro`)
- **Pages**: kebab-case for routes (e.g., `new-project/`, `ai-response.astro`)
- **API endpoints**: kebab-case (e.g., `ai-analysis.ts`, `signin.ts`)
- **Services**: kebab-case (e.g., `firestore-server.ts`)
- **Types**: PascalCase (e.g., `Project.ts`, `AIAnalysis.ts`)

### Code Organization

- **Constants**: Grouped by domain (firestore, images)
- **Services**: Separate client/server implementations
- **Types**: One type per file, matching the domain model
- **Components**: Atomic, reusable components with clear responsibilities

## Key Architectural Patterns

### Authentication Flow

- Firebase Authentication integration
- Server-side session management
- Protected routes and API endpoints

### Data Flow

- Firestore for persistent data storage
- Client-side Firebase SDK for real-time updates
- Server-side Firebase Admin SDK for secure operations

### API Design

- RESTful endpoints under `/api/`
- OpenAPI 3.1 compliant (Cloudflare Worker)
- Zod validation for request/response schemas

### Component Architecture

- Astro components for static content
- Client-side JavaScript for interactivity
- Shared components between applications where applicable

## Environment Configuration

### Environment Files

- `.env` files in each application root
- Separate development/production configurations
- Firebase configuration per environment

### Deployment Targets

- **docucraft-app**: Vercel (SSR with Node.js runtime)
- **docucraft-landing**: Cloudflare Pages (static)
- **docucraft-worker**: Cloudflare Workers (edge runtime)
