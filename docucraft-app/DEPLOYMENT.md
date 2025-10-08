# Deployment Guide

## Environment Variables

The application requires the following environment variables to be set:

### Firebase Configuration

- `FIREBASE_PRIVATE_KEY_ID`: Your Firebase private key ID
- `FIREBASE_PRIVATE_KEY`: Your Firebase private key
- `FIREBASE_PROJECT_ID`: Your Firebase project ID
- `FIREBASE_CLIENT_EMAIL`: Your Firebase client email
- `FIREBASE_CLIENT_ID`: Your Firebase client ID
- `FIREBASE_AUTH_URI`: Firebase auth URI (usually https://accounts.google.com/o/oauth2/auth)
- `FIREBASE_TOKEN_URI`: Firebase token URI (usually https://oauth2.googleapis.com/token)
- `FIREBASE_AUTH_CERT_URL`: Firebase auth cert URL
- `FIREBASE_CLIENT_CERT_URL`: Firebase client cert URL

### Cloudflare Worker Configuration

- `PUBLIC_WORKER_URL`: URL of your Cloudflare Worker (prefixed with PUBLIC_ for client-side access)
  - For development: `http://localhost:8787`
  - For production: `https://your-worker.your-subdomain.workers.dev`

## Worker Deployment

### 1. Set up the Google AI Studio Token

```bash
# In your worker directory
wrangler secret put GOOGLE_AI_STUDIO_TOKEN
```

### 2. Deploy the Worker

```bash
# In your worker directory
wrangler deploy
```

### 3. Update the App Environment

Set the `PUBLIC_WORKER_URL` environment variable in your app deployment to point to your deployed worker URL.

## Local Development

1. Start the worker locally:

```bash
cd docucraft-worker
wrangler dev
```

2. Start the app locally:

```bash
cd docucraft-app
npm run dev
```

3. Set the `PUBLIC_WORKER_URL` environment variable to `http://localhost:8787` in your app.

## Production Deployment

1. Deploy the worker first and note the URL
2. Set the `PUBLIC_WORKER_URL` environment variable in your app deployment to the worker URL
3. Deploy the app

## Recent Fixes

### CORS Issues

- Added CORS middleware to the Cloudflare Worker to handle cross-origin requests
- Configured to allow requests from localhost and Cloudflare Pages domains

### New Relic Script 404

- Fixed the New Relic script path from relative (`../scripts/`) to absolute (`/scripts/`)
- Moved the script to the public directory for proper static asset serving

The form will automatically call the worker endpoint and display the AI-generated project analysis.
