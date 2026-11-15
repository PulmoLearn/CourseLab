# CourseLab — Copy a published course to another instructor

## Install

Upload ONLY these files from this ZIP to your existing GitHub repository, maintaining paths:

- `dashboard.html` (updated)
- `course-transfer.html` (new)
- `js/course-transfer.js` (new)

Commit and deploy on Vercel. There is **no database migration** and no need to reimport the Rise package.

## Transfer workflow

1. In your instructor account, open **Studio > Export or import published course**.
2. Select **Educational Philosophies and Homeschool** and click **Download published course file**. It exports the **current live published version**, not any draft edits. If recent changes should be included, first finish saving and **Publish course** in the editor.
3. Securely share the downloaded `.json` file with your friend. It contains full course content **including answer keys**, so don't commit it to a public GitHub repository.
4. Your friend signs in to **their own CourseLab instructor account**, opens **Studio > Export or import published course**, selects the downloaded `.json`, and clicks **Create and publish my copy**.
5. Your friend opens her new course in Studio and copies its **new enrollment code**. Check the student preview and Research results page before inviting participants.

## What's copied

- All lesson text and native/imported blocks in the current published snapshot
- Media embed URLs and existing asset paths (static assets must remain available on CourseLab's deployed website)
- Assessment questions, answer keys, surveys, reflections, block design, course settings and lesson order

## What's NOT copied

- Course ID or original lesson database IDs
- Students, enrollment code, enrollments, progress, quiz attempts, research responses, participant mappings, or instructor test progress
- Unpublished edits

The new course belongs to the account that uploads the transfer file and has a new course ID, enrollment code, independent publishing history, and empty research dataset.

## Important research caution

This workflow starts a **new study course**. Only use her new enrollment code for real participants. Do not enroll research participants in the original test course. For research integrity, avoid republishing her course in the middle of an active collection period because the dashboard filters to the current published version.

## Validation & limitations

- JavaScript syntax checked, but **not tested against live Supabase**; verify using your two accounts.
- The transfer file is intentionally exported and imported by the signed-in instructors, not silently pushed to another account. No administrator secrets or service-role credentials are required.
- If an import fails partway through, a partial draft may remain in her Studio. Remove or inspect it before retrying to avoid duplicates.
- This feature relies on existing CourseLab permissions for `courses`, `lessons`, `course_versions`, and the `publish_course` RPC.
