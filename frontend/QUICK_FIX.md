# Quick Fix for White Page

## Immediate Steps:

1. **Stop the dev server** (Ctrl+C in terminal)

2. **Clear Next.js cache:**
```bash
rm -rf .next
```

3. **Reinstall dependencies:**
```bash
rm -rf node_modules package-lock.json
npm install
```

4. **Restart dev server:**
```bash
npm run dev
```

5. **Open browser console** (F12) and check for errors

6. **Hard refresh** the page: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

## If still white page:

Check browser console for specific error messages and share them.

Common issues:
- Missing environment variables
- Port conflict (3000 already in use)
- JavaScript errors in components
- CSS not loading

