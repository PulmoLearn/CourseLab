# Educational Philosophies and Homeschool — CourseLab integration

## What this installs

A converted, independently hosted **12-lesson** course owned by whichever CourseLab instructor is signed in when the installation is run. Uses the existing Supabase `courses`, `lessons`, `course_versions`, enrollment-code and progress features. **No database migration needed** if existing publishing and enrollment migrations/RPCs are working.

This is **not** the original Rise runtime. The instructor's text, lesson sequence, videos/placeholders, five sorting activities, pre/post reflections, feedback survey, references and six assessment questions were converted for CourseLab. The original Articulate interface is not reproduced.

## Deploy and install

1. Extract the **incremental repository ZIP** into the *root* of the existing GitHub repository, preserving directory paths. Do not replace the entire repository.
2. Deploy through the current Vercel connection. The new `import-educational-philosophies.html` link appears on the instructor Studio dashboard.
3. Download `Educational_Philosophies_Import_Data.json` **separately** and keep it private. **Do not commit that file to GitHub or otherwise put it into Vercel's public static files.** It contains course text and answer keys.
4. Have the intended course owner create/sign in to their own **instructor** account (not your personal owner account). Course ownership is taken from the signed-in Supabase user; the importer does not assign ownership to someone else.
5. In Studio select **Install Educational Philosophies course**. Select the private JSON file on the import page and click **Install course and publish** **once**. Check for success and note the new course ID.
6. Use **Test Student** and verify all 12 lessons before sharing an enrollment code. Use the course's publishing panel for enrollment code; learners join with **My Learning**.
7. Upload 15 videos to YouTube as **Unlisted**, then update the values in `imported/educational-philosophies/video-urls.json` with full `https://youtu.be/...` or `https://www.youtube.com/watch?v=...` URLs. Keep all JSON keys exactly as given. Redeploy Vercel. Changes to this video map do **not** require republishing the course in Supabase.
8. Test all video playback and transcript/caption accessibility. Captions in the `assets/` folder are references; upload them to YouTube for actual closed-caption support.

## Capabilities and limitations

- Course enrollment and per-lesson completion use CourseLab's existing Supabase access rules and progress tables. Instructor gradebook reflects **lesson completions**, not graded answers.
- Surveys/reflections are interactive but **responses are not stored**. Do not promise response collection or course reporting. Quiz feedback is presented locally and **not persisted**; passing score is not enforced.
- Some Rise interactions were reimplemented, especially sorting (accessible select controls instead of drag/drop). Video placeholders do not block progression, so **do not enroll students before YouTube URLs are ready**.
- The imported lesson body is not edited in the current visual builder. Opening the editor is for publishing/enrollment administration; ordinary row editing does **not** change imported content. Update the private JSON and reimport into a new course if extensive changes are needed.
- The original Rise export's stored lesson `position` fields were inconsistent. The source's **ordered lesson list** has been preserved. Assessment correct-answer IDs use the per-question `correct` field for single choice and `corrects` for multiple response.
- If an import fails midway, a partial draft may remain in Studio. Delete the partial course before retrying rather than creating duplicates.
- Confirm that your friend has appropriate rights to host/distribute the lesson and images. The import deliberately does not remove/alter license checks in Articulate's player: it does not ship that player at all.

## Deployment scope (incremental)

Changed existing files: `dashboard.html`, `learn.html`, `css/style.css`, `js/cloud.js`, `js/editor.js`, `js/learner.js`.

New files: `import-educational-philosophies.html`, `js/import-educational-philosophies.js`, `js/rise-imported.js`, and the assets/video map under `imported/educational-philosophies/`.
