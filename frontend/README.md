# NextStep Frontend

Next.js frontend for the NextStep platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

3. Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Environment Variables

- `NEXTAUTH_URL`: Your app URL (e.g., `http://localhost:3000`)
- `NEXTAUTH_SECRET`: Secret for JWT signing (generate with `openssl rand -base64 32`)
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Google OAuth credentials
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`: GitHub OAuth credentials
- `NEXT_PUBLIC_API_URL`: Backend API URL (e.g., `http://localhost:8000`)

## Deployment

### Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

Vercel will automatically detect Next.js and configure the build.

## Features

- NextAuth.js for authentication (Google, GitHub)
- Tailwind CSS for styling
- Responsive design
- File upload for resumes
- Job description input
- Match score visualization
- Resume improvement suggestions
- LinkedIn message generation

