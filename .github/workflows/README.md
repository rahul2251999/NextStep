# GitHub Actions Workflows

## Deploy to GitHub Pages

**File**: `.github/workflows/deploy.yml`

This workflow automatically builds and deploys the Next.js frontend to GitHub Pages.

### How it works:

1. **Triggers**: Runs on push to `main`/`master` or manual trigger
2. **Build**: Installs dependencies and builds the Next.js app as a static site
3. **Deploy**: Uploads the built files to GitHub Pages

### Setup Instructions:

1. **Enable GitHub Pages**:
   - Go to your repository → Settings → Pages
   - Under "Source", select "GitHub Actions"

2. **Push to main branch**:
   ```bash
   git push origin main
   ```

3. **Monitor deployment**:
   - Go to Actions tab in your repository
   - Watch the workflow run
   - Once complete, your site will be live at:
     - `https://<username>.github.io/<repository-name>`

### Important Notes:

- ⚠️ **API Routes**: Next.js API routes in `pages/api/` will NOT work on GitHub Pages (static sites only)
- ⚠️ **Authentication**: NextAuth.js requires server-side functionality, which GitHub Pages doesn't support
- ✅ **Solution**: Deploy backend separately (Railway, Render, etc.) and update `NEXT_PUBLIC_API_URL`

## Deploy Backend

**File**: `.github/workflows/deploy-backend.yml`

This workflow is a template for deploying the backend. Currently disabled - enable when ready to deploy backend.

### To enable:

1. Set up deployment target (Railway, Render, Heroku, etc.)
2. Add deployment secrets to GitHub repository
3. Update the workflow with your deployment commands
4. Set `if: false` conditions to `if: true` where needed

