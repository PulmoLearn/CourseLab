# CourseLab v0.2 — Instructor accounts and cloud lessons

Static HTML/CSS/JS app, deployed to Vercel with **Other** framework preset and root directory `./`.

## Setup

1. Use the separate CourseLab Supabase project. The `instructor_profiles`, `courses`, and `lessons` tables and authenticated RLS policies must already exist.
2. Under Authentication → URL Configuration, set Site URL to `https://courselab-lac.vercel.app` and add redirect URL `https://courselab-lac.vercel.app/**`.
3. Enable Email sign-in and confirm-email.
4. Upload **the contents** of this folder to the root of the CourseLab GitHub repository; Vercel redeploys on commit.
5. Visit `/login.html`, create an instructor account, confirm email, sign in, create a course, edit a lesson, and open the preview.

## Important

- `js/cloud.js` contains a **publishable** Supabase key, safe to expose when RLS is correctly configured. Never place a secret or service-role key in browser code.
- The Supabase CDN script requires internet connectivity.
- The previously deployed browser-only prototype is not automatically migrated. Export any old work as JSON before replacing it; importing that JSON is not yet implemented.
- Auto-save uses a short delay. Wait until “Saved to cloud” appears before navigating away.
- The public homepage remains public. The dashboard/editor/preview require a session; RLS protects database rows.
- This is a development prototype, not a production-ready audited application. SCORM, full accessibility validation, and enrollment are not yet implemented.
- Existing Vercel environment variables are not used by these static files; the public configuration is in `js/cloud.js`.
