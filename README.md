# UNIPORT Campus Guide

An Expo Router mobile prototype with Home, Explore, What’s On, and Services.

## Run locally

Use Node.js 22 or later. Run `npm ci` and `npm start` from the project root, then open the app in an SDK-compatible Expo Go client or Android emulator.

- Run `npm run typecheck` to check TypeScript.
- Run `npm run bundle:android` to generate the Android JavaScript bundle in `dist/`.
- Open **What’s On → University news and events** to check the university’s latest announcements.
- Search for **reading room** in Explore to find the Donald E. U. Ekong Library. You can also reach the same place page through **Services → Library services → View location**.

The bundled directory links to university sources and loads locally when both Supabase variables are unset. Directions are campus-level guidance. Where the guide opens a Maps search, confirm the suggested destination before travelling.


## Connect Supabase

1. Apply the migration in `supabase/migrations/` to the Campus Guide Supabase project.
2. Put the project's public URL and publishable key in an untracked `.env.local` file, then restart Expo.

   ```dotenv
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```

3. Publish campus content from the admin CMS. The app reads with the anonymous role.

## Campus Guide CMS

1. In the Campus Guide Supabase project, create the administrator's email/password user. Through a trusted server-side Auth Admin API client, set that user’s `app_metadata.campus_admin` to the boolean `true`. Keep admin credentials and secret keys outside the repo. The database migration enforces this role for content writes.
2. From the repository root, run `npm ci`, then `node --env-file-if-exists=.env.local admin/server.mjs`. Use Node.js 22 or later. The CMS accepts the same Supabase URL and publishable key as Expo, or separate `CAMPUS_SUPABASE_URL` and `CAMPUS_SUPABASE_PUBLISHABLE_KEY` variables.
3. Open `http://127.0.0.1:4173` and sign in. Add a Place, save it as a draft, publish it, then select it as an event venue or service office. Search and status filters work across all four sections. The announcements editor supports scheduled publication and expiry. Event and announcement times use WAT.
4. Reopen a mobile app configured for the same Supabase project to verify that it loads the published entry. Drafts and archived entries are hidden from the public mobile feed. The mobile app loads an updated snapshot on startup.

The CMS uses the project’s existing Supabase JavaScript SDK. For a hosted instance, deploy the Node server behind HTTPS and set `HOST=0.0.0.0` and the hosting provider’s `PORT`. Admin sign-in is required on each page reload. Run `node --test admin/fields.test.mjs` to check validation and scheduling.

SQLite sync is a future milestone.
