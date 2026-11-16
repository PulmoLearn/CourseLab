# CourseLab Original Rise SCORM 1.2 — installation

This package contains **new/modified files only**. No original Rise files are modified.

## Exact order

1. Supabase: backup your database. Run `sql/MIGRATION-SCORM12-01.sql` in SQL Editor. Confirm success.
2. Cloudflare R2: inside `courselab-scorm/educational-philosophies/`, upload **only** `r2-upload/educational-philosophies/courselab-launch.html`. It sits beside `imsmanifest.xml`, `scormdriver/`, and `scormcontent/`. Do not add an extra nested folder. Do not alter the original SCORM files.
3. GitHub: upload `dashboard.html`, `js/dashboard.js`, `learn.html`, `js/learner.js`, `scorm-create.html`, `js/scorm-create.js`, `js/scorm-learner.js`, `scorm-report.html`, `js/scorm-report.js` preserving folder paths. Do **not** upload the SQL or R2 launcher to GitHub. Deploy via Vercel.
4. In the receiving instructor account, Studio -> **Add hosted SCORM course**. Check the prefilled R2 bridge URL and select **Create and publish SCORM course**. Record its new code. Your earlier working CourseLab research course stays intact.
5. Create/join using a *regular learner* account. Open My learning; the SCORM course should show its original Rise interface. Enter a lesson, exit, refresh, resume, finish. Check instructor **SCORM reporting** link from the setup result page, or `scorm-report.html?course=NEW_COURSE_ID`.

## Important limitations

- This is an initial SCORM 1.2 bridge, not yet independently LMS-conformance tested. Confirm LMSInitialize, LMSCommit, LMSFinish, resume, and completion with a learner before real enrollment. Some Rise features may require additional API compatibility methods.
- **The original Rise package on `r2.dev` is publicly retrievable by anyone with the URL.** The CourseLab account gate controls enrollment/tracking, NOT the files themselves. R2 development URLs are rate-limited and are not suitable for a real research-study launch. Use a properly configured custom domain and access control before deploying broadly.
- The original Rise course's SCORM interactions may omit survey responses/answer details; the prior Research Dashboard will not automatically read this SCORM data. Check captured `cmi.interactions` in SCORM reporting and plan a separate research mapping before choosing this as the study delivery format.
- Avoid putting participant names or email addresses into SCORM data. The bridge uses only the learner's account ID and a generic display name.
- The in-frame content is unmodified; only a small parent launcher supplies SCORM's `window.API` interface and sends allowed messages between origins.
- **Persistence caveat:** Browser `postMessage` and asynchronous DB writes cannot guarantee saving during abrupt tab closure, offline use, or immediate navigation. Test explicit Rise Exit/Finish behavior.
- The Cloudflare URL and parent CourseLab origin are fixed to this deployment; a future domain change requires a controlled update to both bridge and learner.
