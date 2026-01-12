# DocuCraft: AI-Powered Project Documentation Generation

## Project Overview

DocuCraft is a web application that helps users turn ideas into well-defined project documentation using AI. It is designed for freelancers, hobbyists, and small teams to accelerate their development pipeline and formalize project scope and objectives.

The project is a monorepo with a serverless architecture, leveraging Vercel for the main application, Cloudflare for the landing page and serverless API, and Firebase (Firestore) for the backend.

## Monorepo Structure

The repository contains three distinct projects:

*   `docucraft-app`: The main web application, built with [Astro](https://astro.build/) and deployed on [Vercel](https://vercel.com/). This is an SSR application that provides the core user experience.
*   `docucraft-landing`: A static landing page, also built with Astro and deployed on [Cloudflare Pages](https://pages.cloudflare.com/).
*   `docucraft-worker`: A serverless API built with [Hono](https://hono.dev/) on [Cloudflare Workers](https://workers.cloudflare.com/). It handles backend logic and communication with AI services (Google Generative AI).

## Getting Started

To run the projects locally, you will need to have [Bun](https://bun.sh/) installed.

### `docucraft-app`

1.  Navigate to the `docucraft-app` directory:
    ```bash
    cd docucraft-app
    ```
2.  Install dependencies:
    ```bash
    bun install
    ```
3.  Run the development server:
    ```bash
    bun run dev
    ```

### `docucraft-landing`

1.  Navigate to the `docucraft-landing` directory:
    ```bash
    cd docucraft-landing
    ```
2.  Install dependencies:
    ```bash
    bun install
    ```
3.  Run the development server:
    ```bash
    bun run dev
    ```

### `docucraft-worker`

1.  Navigate to the `docucraft-worker` directory:
    ```bash
    cd docucraft-worker
    ```
2.  Install dependencies:
    ```bash
    bun install
    ```
3.  Run the worker locally:
    ```bash
    bun run dev
    ```

## Building and Running

### `docucraft-app`

*   **Development:** `bun run dev`
*   **Build:** `bun run build`
*   **Preview:** `bun run preview`
*   **Test:** `bun run test`

### `docucraft-landing`

*   **Development:** `bun run dev`
*   **Build:** `bun run build`
*   **Preview:** `bun run preview`

### `docucraft-worker`

*   **Development:** `bun run dev`
*   **Deploy:** `bun run deploy`
*   **Test:** `bun run test`

## Development Conventions

*   **Package Manager:** The project uses [Bun](https://bun.sh/) for package management.
*   **Testing:** Tests are written with `bun test`. The `docucraft-app` project also includes a coverage check.
*   **CI/CD:** The project uses GitHub Actions for continuous integration and deployment. The workflow is defined in `.github/workflows/deploy.yml`.
*   **Linting:** The `docucraft-app` and `docucraft-worker` projects have ESLint configured.
