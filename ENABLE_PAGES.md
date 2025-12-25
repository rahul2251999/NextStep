# Enable GitHub Pages - Quick Guide

## Option 1: Web Interface (Recommended - 30 seconds)

1. **Open this URL**: https://github.com/rahul2251999/NextStep/settings/pages

2. **Under "Source"**:
   - Select **"GitHub Actions"** (NOT "Deploy from a branch")
   - Click **"Save"**

3. **Done!** The workflow will automatically run and deploy your site.

Your site will be available at: **https://rahul2251999.github.io/NextStep/**

---

## Option 2: GitHub CLI (If you prefer command line)

1. **Authenticate** (if not already):
   ```bash
   gh auth login
   ```

2. **Run the script**:
   ```bash
   ./enable-pages.sh
   ```

---

## Verify It's Working

After enabling, check:
- **Actions tab**: https://github.com/rahul2251999/NextStep/actions
- You should see "Deploy to GitHub Pages" workflow running
- Once complete, your site will be live!

---

## Troubleshooting

If you see "Not Found" error:
- Make sure you selected **"GitHub Actions"** as the source (not a branch)
- The repository must be public OR you must have GitHub Pro/Team/Enterprise
- Wait a few minutes after enabling for GitHub to set it up

