CourseLab v0.6 — Learner and Test Student foundation

INSTALL IN THIS ORDER
1. Back up the CourseLab Supabase database.
2. Run MIGRATION-02.sql in CourseLab Supabase SQL Editor. Verify two rows returned.
3. Upload the site's HTML/CSS/JS files to the CourseLab GitHub repo, preserving folders. Do not upload the SQL file as a web page.
4. Let Vercel deploy. Instructor dashboard -> Gradebook / Test Student -> Open as Test Student.
5. For a real learner, create a separate account via login.html, then visit learn.html and enter the published enrollment code.
6. Mark a lesson complete; verify it appears in gradebook. Toggle Include Test Student; test is excluded by default from the CSV and displayed rows.

SCOPE / IMPORTANT LIMITATIONS
- Progress is per published version. Republish starts completion tracking afresh for the new version. Old records are retained.
- This version tracks lesson completion, NOT scored question attempts, quiz grades, or pre/post results. The existing activities still display preview-only feedback. Do not use the displayed gradebook for official assessment scores yet.
- Instructor Test Student uses instructor authentication but stores separate test records; it does not share a universal student password.
- Test Student opens the published snapshot and not editable lessons. It can reset its own completion records for the course.
- Real learner names are not stored by this update; gradebook displays pseudonymous IDs.
- Embedded images may require separate media-access work; test image-heavy lessons before inviting learners.
- Never place service-role secrets in browser files. The existing public publishable key is not a service-role key.
