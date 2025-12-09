# Troubleshooting White Page Issue

## Quick Fixes

### 1. Clear Browser Cache
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- Or clear browser cache completely

### 2. Check Browser Console
Open browser DevTools (F12) and check for errors:
- JavaScript errors
- Missing module errors
- CSS loading errors

### 3. Verify Dependencies
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### 4. Check if Server is Running
```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate
uvicorn main:app --reload

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 5. Check Environment Variables
Make sure `.env.local` exists in `frontend/`:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 6. Common Issues

**Issue: CSS not loading**
- Check if `globals.css` is imported in `app/layout.tsx`
- Verify Tailwind is configured correctly

**Issue: Component errors**
- Check browser console for specific error messages
- Verify all imports are correct

**Issue: White page on specific route**
- Check if that route has errors
- Verify the component exports correctly

### 7. Test Basic Page
Try accessing: `http://localhost:3000/api/auth/token`
Should return JSON (may show error, but confirms server is running)

### 8. Check Network Tab
In browser DevTools → Network tab:
- Are CSS files loading? (200 status)
- Are JS files loading? (200 status)
- Any 404 errors?

### 9. Rebuild
```bash
cd frontend
npm run build
npm run dev
```

## Debug Steps

1. Open browser console (F12)
2. Check for red error messages
3. Look at Network tab for failed requests
4. Check if `http://localhost:3000` shows anything in console
5. Try accessing `http://localhost:3000/auth/signin` directly

## If Still White Page

1. Check terminal output for errors
2. Verify Next.js is running on port 3000
3. Try a different browser
4. Check if port 3000 is already in use:
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

