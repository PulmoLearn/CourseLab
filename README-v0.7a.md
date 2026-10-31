# CourseLab v0.7a — learner experience patch

This is a targeted patch on v0.6. Upload the site files to the existing CourseLab GitHub repository. **No new SQL migration required.**

Changes:
- Fixes the image crop scaling calculation in editor and learner renderer (previously magnified images by 100x).
- Corrects flashcard image formatting object nesting in the learner renderer.
- Adds a collapsible course lesson sidebar, progress count, active and completed indicators.
- Changes the bottom Continue action to save the current lesson completion and move to the next lesson; the final lesson marks the course complete.
- Adds a Previous lesson button.

IMPORTANT: This patch does NOT implement pre/post assessment types, scores, completion page customization, or assessment analytics. Those require a dedicated assessment data model, authoring UI, and security migration. Test student completions remain excluded by default.

Existing published snapshots remain unchanged. To incorporate draft content edits into a live course, publish a new version. Existing image assets may still be unavailable to actual learners because media library RLS is instructor-only; do not invite real learners until media delivery is secured.
