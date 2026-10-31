# CourseLab v0.4 — interactive authoring pilot

## Upload only changed files
- Root: `editor.html`, `preview.html`
- `js/`: `editor.js`, `preview.js`, `picker.js` (new), `activities.js` (new)
- `css/`: `style.css`

No Supabase SQL changes needed. Upload files into their existing GitHub folders; Vercel will deploy.

## Pilot functionality
- Accessible image-thumbnail picker replaces the numbered prompt.
- Flashcards (front | back per line), multiple-choice, and navigation buttons.
- Completion gating in learner preview, with configurable attempt counts and grade selection settings.
- Grading is **preview-only**: no learner-grade persistence, SCORM, or LTI passback yet.
- Preview completion is reset on refresh; not a production LMS assessment.
- Correct-required mode with limited attempts reveals the correct answer and permits continuing after attempts run out.
- The next development phase will add sorting, hotspots, and accessible image labeling.

## Test
1. Open a course and add a flashcards block, edit cards with `front | back` lines.
2. Add a multiple-choice block and set correct answer, attempts, and progressive reveal.
3. Add a text block after the activity and open Preview lesson; confirm the later text stays hidden until completion.
4. Open an image block and choose from Media Library; confirm thumbnails appear.
5. Add a navigation button; test an HTTPS URL or a #block-id anchor.

This is a pilot release. Do not use preview scores for actual grading.
