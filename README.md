# Lion Exchange

A mobile-first campus exchange app for Columbia students to give away or claim
food, groceries, and household items before they expire, move out, or go on
break.

Built with Next.js (App Router), TypeScript, Tailwind CSS, and Supabase
(auth, Postgres, storage).

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in your Supabase project's
   URL and anon key (Project Settings → API in the Supabase dashboard):

   ```bash
   cp .env.example .env.local
   ```

3. Run `supabase/schema.sql` in your Supabase project's SQL editor. It
   creates the tables, row-level security policies, the claim/collect
   functions, and the `listing-photos` storage bucket.

4. Start the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## How it works

- **Auth**: email magic link via Supabase, restricted to `@columbia.edu`
  addresses. Enforced twice — once client-side for UX, once in a Postgres
  trigger (`handle_new_user` in `supabase/schema.sql`) so the check can't be
  bypassed by calling the API directly.
- **Expiration**: listings don't get rewritten by a cron job. `listings_view`
  computes `available → expired` at read time based on `expires_at`.
- **Claiming**: goes through a `SECURITY DEFINER` Postgres function
  (`claim_listing`) so two people can't win a race to claim the same item.

## Deploying

This app is Vercel-compatible out of the box. Push this repo to GitHub, then
import it in the [Vercel dashboard](https://vercel.com/new), setting the same
two environment variables from `.env.local` in the project's settings.
