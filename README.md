# ServiceFlow Auth Starter

A Next.js App Router project preconfigured with Supabase for email and password authentication. It includes a minimal UI for signing up, signing in, viewing the authenticated user, and signing out.

## Prerequisites

- A Supabase project with **Email** provider enabled under Authentication → Providers.
- The `anon` public API key and project URL from your Supabase dashboard.
- Node.js 18+.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the example environment file and add your Supabase credentials:
   ```bash
   cp .env.example .env.local
   ```
   Update the file with your Supabase project URL and anon key.
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) and try signing up or signing in with an email/password.

The home page displays the active Supabase user object once signed in. If email confirmation is enabled in Supabase, you'll be prompted to verify your inbox before signing in; otherwise the new account is signed in immediately.

## Project Structure

- `supabase/clients/` – Server and browser helpers that create Supabase clients.
- `src/components/auth/` – Client components for the email/password flow.
- `src/app/page.tsx` – Server component that reads the auth state and renders either the auth form or the signed-in view.

## Deployment Notes

- Ensure the same Supabase environment variables are present in your hosting platform.
- If you deploy on Vercel, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the project settings.

## Next Steps

- Add route protection or middleware for authenticated sections.
- Expand the UI with password reset, OAuth providers, or a profile page backed by Supabase data.

## Google Calendar sync

- Enable the Calendar API in the same Google Cloud project you use for Maps.
- Create an OAuth Client (Web) and add redirect URIs, e.g. `http://localhost:3000/api/google-calendar/callback` for local dev.
- Add these env vars to `.env.local`:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `GOOGLE_REDIRECT_URI` (or `VITE_GOOGLE_REDIRECT_URI`) matching the registered redirect
  - `SUPABASE_SERVICE_KEY` (or `SUPABASE_SERVICE_ROLE_KEY`) so API routes can store tokens securely
- Run the Supabase migration to create the `google_calendar_tokens` table (`supabase db push` or your normal workflow).
- In the calendar UI, click **Connect Google Calendar** (per user) and then **Sync this view** to push the visible appointments to that user’s Google Calendar.
