# CourseLab — Starter prototype

An early static-site prototype of a visual course authoring tool for teachers and instructional designers.

## Deploy to Vercel

1. Add all files and folders at the repository root (not inside an extra `courselab-starter` folder).
2. Import the GitHub repository into Vercel.
3. Framework preset: **Other**. No build command or environment variables are needed.
4. Deploy. The root `index.html` serves the public landing page.

## Demo

- `index.html` — public landing page.
- `dashboard.html` — create, duplicate, delete courses.
- `editor.html` — add lessons, rows (1–3 columns), text/image/video placeholders, edit text, duplicate lessons, export JSON.
- `preview.html` — learner-facing preview.

**Important:** Courses are saved only to the current browser's `localStorage`. Data does not sync between devices and can be erased by clearing browser data. This is not a production LMS, and there is no authentication or purchasing.

## Accessibility

Accessibility is a design priority, with semantic structure, visible focus, keyboard-operable editing controls, and image alt-text prompts. This prototype has not undergone a WCAG 2.2 AA conformance audit. Further work is required on keyboard focus management, accessible activity editing, contrast testing, and exported lesson accessibility.

## Roadmap

Supabase authentication and persistence, rich text editing, interactive activities, asset uploads, automated accessibility checks, HTML/SCORM exports, and optional small-group learner delivery.
