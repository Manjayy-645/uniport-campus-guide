# UNIPORT Campus Guide

An Expo Router mobile prototype with Home, Explore, What’s On, and Services.

## Run locally

Use Node.js 20.19.4 or later. Run `npm ci` and `npm start` from the project root, then open the app in an SDK-compatible Expo Go client or Android emulator.

- Run `npm run typecheck` to check TypeScript.
- Run `npm run bundle:android` to generate the Android JavaScript bundle in `dist/`.
- Try **What’s On → Tech Meetup → View venue → Open in Maps** with a device date before the sample event on 4 December 2026.
- Search for **reading room** in Explore to find the University Library. You can also reach the same place page through **Services → Library → View office**.

The bundled listings are demonstration data. Verify campus areas, landmarks, and directions before a pilot. The bundled content loads locally. Supabase publishing, the Next.js admin dashboard, and SQLite sync are future milestones.
