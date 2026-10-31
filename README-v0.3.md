# CourseLab v0.3 — Media Library (initial integration)

Upload the **contents** of this package to the root of the existing GitHub repository, replacing files. Do not nest the folder. Existing courses and lessons are preserved.

## Included
- Private Supabase image uploads and reusable asset IDs.
- Media Library at `/media.html` with shared replacement across all linked lessons and version history in database.
- Editor image upload / library picker / alt text / decorative flag.
- YouTube and Vimeo embeds in lesson preview with instructor caption-verification attestation.
- Media usage synchronization on editor saves.

## Important limits
- **Scoped replacement (single lesson / course) is not included in this initial integration.** It requires asset forking and a careful migration of references; the Library currently offers **replace everywhere** only.
- Existing image URL blocks still work; only uploaded asset-ID blocks participate in shared replacement.
- Image access requires signed-in instructors; public or unauthenticated learners are not supported yet.
- Exports are still JSON only, not SCORM; external video embeds require internet.
- Usage counts for older lessons populate as they are opened, edited and saved. Do not treat them as exhaustive until backfilled.
- Test uploads, preview, replacement and saving on a test course before production use.
- Storage access policies should be audited separately with a second account.
