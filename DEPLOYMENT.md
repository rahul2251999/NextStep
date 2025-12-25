# Deployment Guide

This guide covers deploying NextStep to GitHub Pages and setting up the backend.

## ⚠️ Important Notes

### GitHub Pages Limitations

GitHub Pages only supports **static sites**. This means:

1. **API Routes Won't Work**: The Next.js API routes in `pages/api/` will not function on GitHub Pages. These routes need to be:
   - Deployed separately (e.g., Vercel, Netlify Functions, AWS Lambda)
   - Or replaced with direct backend API calls

2. **Authentication**: NextAuth.js requires server-side functionality. For GitHub Pages, you'll need to:
   - Use a different authentication method (e.g., JWT tokens from backend)
   - Or deploy the frontend to a platform that supports serverless functions (Vercel, Netlify)

3. **Environment Variables**: GitHub Pages doesn't support server-side environment variables. Use `NEXT_PUBLIC_` prefix for client-side variables.

## Frontend Deployment (GitHub Pages)

### Prerequisites

1. Enable GitHub Pages in your repository settings:
   - Go to Settings → Pages
   - Source: GitHub Actions

2. Set up repository secrets (if needed):
   - Go to Settings → Secrets and variables → Actions

### Automatic Deployment

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically:
- Build the Next.js app as a static site
- Deploy to GitHub Pages on every push to `main` or `master`

### Manual Deployment

```bash
cd frontend
npm run build
npm run export  # If you add this script
```

### Configuration

The `next.config.js` is configured for static export:
- `output: 'export'` - Enables static export
- `images: { unoptimized: true }` - Required for static export
- `trailingSlash: true` - Better compatibility with GitHub Pages

### Base Path Configuration

If your site is deployed to a subdirectory (e.g., `https://username.github.io/NextStep/`):

1. Set the base path in `next.config.js`:
   ```js
   basePath: '/NextStep',
   ```

2. Or set environment variable:
   ```bash
   NEXT_PUBLIC_BASE_PATH=/NextStep
   ```

## Backend Deployment

The backend cannot be deployed to GitHub Pages. Use one of these options:

### Option 1: Railway (Recommended)

1. Sign up at [Railway.app](https://railway.app)
2. Create a new project
3. Connect your GitHub repository
4. Select the `backend` directory
5. Set environment variables in Railway dashboard
6. Deploy

### Option 2: Render

1. Sign up at [Render.com](https://render.com)
2. Create a new Web Service
3. Connect your repository
4. Configure:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Set environment variables
6. Deploy

### Option 3: Heroku

1. Install Heroku CLI
2. Create `Procfile` in backend:
   ```
   web: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
3. Deploy:
   ```bash
   heroku create your-app-name
   git subtree push --prefix backend heroku main
   ```

## Environment Variables

### Frontend (GitHub Pages)

Since GitHub Pages is static, only `NEXT_PUBLIC_` variables work:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

Set these in:
- GitHub repository → Settings → Secrets → Actions (for build time)
- Or hardcode in `next.config.js` (not recommended for sensitive data)

### Backend

Set these in your hosting platform's environment variables:

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
OPENAI_API_KEY=...
# ... other backend secrets
```

## Updating API Routes for Static Deployment

Since API routes won't work on GitHub Pages, you have two options:

### Option 1: Direct Backend Calls

Update your frontend code to call the backend directly:

```typescript
// Instead of: /api/job/submit
// Use: ${process.env.NEXT_PUBLIC_API_URL}/api/job/submit
```

### Option 2: Deploy API Routes Separately

Deploy the API routes to:
- Vercel (supports Next.js API routes)
- Netlify Functions
- AWS Lambda
- Cloudflare Workers

## CORS Configuration

Update `backend/main.py` to allow requests from your GitHub Pages domain:

```python
origins = [
    "https://your-username.github.io",
    "https://your-username.github.io/NextStep",  # If using base path
]
```

## Testing Deployment

1. **Frontend**: Visit your GitHub Pages URL
2. **Backend**: Test API endpoints:
   ```bash
   curl https://your-backend-url.com/health
   ```
3. **Integration**: Test the full flow from frontend to backend

## Troubleshooting

### Build Fails

- Check GitHub Actions logs
- Ensure all dependencies are in `package.json`
- Verify Node.js version matches (currently 20)

### API Calls Fail

- Check CORS configuration in backend
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check browser console for errors

### Authentication Issues

- NextAuth requires server-side functionality
- Consider using backend JWT tokens instead
- Or deploy frontend to Vercel/Netlify

## Alternative: Deploy Everything to Vercel

If you want API routes to work, consider deploying to Vercel instead:

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

Vercel supports:
- ✅ Next.js API routes
- ✅ Server-side rendering
- ✅ Environment variables
- ✅ Automatic deployments

