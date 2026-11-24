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

3. Add campus content in the Supabase dashboard and set its status to `published` when ready. Published notices also need a publication time. The app reads with the anonymous role.

For the future admin dashboard, grant the server-managed `app_metadata.campus_admin` boolean to designated Supabase Auth users through the Auth Admin API. Admins can create, update, publish, and archive records. Admin changes to claims take effect when the access token refreshes. Use only a publishable key in the mobile app.

The Next.js admin dashboard and SQLite sync are future milestones.
