# CourseLab publishing UI update

Prerequisite: migrations 01A, 01B1, 01B2, 01B3 completed in Supabase.

Deploy all files to the existing **CourseLab** repository / Vercel site (not PulmoLearn). Open an existing course in the editor. The Publish course button calls the installed `publish_course` RPC. The enrollment code appears after first publication. Version history lists prior releases.

**Important limitations:** This package does not yet implement learner dashboard, restoring a version, media pinning, or SCORM export. Verify the editor says "Saved to cloud" before publishing. Media links may remain mutable until media version pinning is implemented. No existing tables or lessons are modified by deploying these static files.
