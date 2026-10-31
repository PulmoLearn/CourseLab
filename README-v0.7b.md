# CourseLab v0.7b — Lesson types and activity-gated navigation

Deploy all site files to the existing CourseLab GitHub repository. No SQL migration for this incremental release.

- Add lesson: choose 1 standard, 2 pre-test, 3 post-test, or 4 completion page.
- Instructor lesson settings are stored in `lessons.content` and captured by the existing publication snapshot.
- Completion page heading/message and optional future grade display setting are editable.
- Continue is hidden until required interactive blocks report completion. A completed lesson can be revisited without repeating activities.
- Sidebar prevents skipping ahead from an unfinished lesson; previously completed lessons remain accessible.

## Important limitations

This is a front-end gating release. Server-side verification of per-block completion, durable per-block attempts, scored pre/post-test analytics, and final grade calculations are **not implemented**. Do not use it for high-stakes assessment or enforce passing requirements. Assessment visibility settings are stored but the existing multiple-choice activity still displays its own feedback; hiding results securely requires the assessment engine and database migration.

Re-publish the course after editing lesson types/settings to update what test students see.
