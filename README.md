# IELTS Studio — Personal Learning Hub

A lightweight, English-language IELTS learning dashboard designed for GitHub Pages. It uses plain HTML, CSS and JavaScript; no build step or package installation is required.

## Features in version 1.0

- Four skill areas: Listening, Reading, Writing and Speaking
- Initial placement test covering vocabulary, grammar and reading
- Personal vocabulary bank with topic tags and a simple review schedule
- Categorised mistake notebook with filters and review status
- Random practice-set builder using included original sample prompts
- Mock exam score records with an automatically calculated overall band
- Score history chart and skill averages
- Daily study planner with automatic task completion tracking
- Local browser storage, plus JSON export/import backup
- Responsive layout for desktop and mobile

## Deploy with GitHub Pages

1. Create a new GitHub repository, for example `ielts-studio`.
2. Upload `index.html`, `styles.css`, `app.js` and `.nojekyll` to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch `main` and folder `/ (root)`, then save.
6. Wait for GitHub Pages to publish the site. The URL will usually look like:
   `https://YOUR-USERNAME.github.io/ielts-studio/`

If you use a different repository name, GitHub will generate a corresponding project URL.

## Important data notes

- Your learning data is stored in `localStorage` in the browser where you use the site.
- Data does not automatically sync between devices or browsers.
- Clearing browser site data may erase your records. Use **Export my data** regularly to download a JSON backup.
- **Import backup** replaces the data currently stored in that browser.
- This first version does not use a cloud database or user accounts.

## AI features

The Writing Studio and Speaking area are prepared for future AI integration, but this version does not call an AI service. To add AI safely, create a server-side endpoint (for example with a serverless function) and keep API keys in server-side environment variables. Never put a private API key in `app.js` or any public GitHub repository.

## Question bank and copyright

The diagnostic and random-set questions included here are original sample questions for demonstrating the app. They are not a complete IELTS question bank and are not official IELTS questions. You can add your own notes and legally obtained practice material. Do not upload copyrighted books or paid question banks unless you have permission.

## IELTS band calculation

The app calculates the average of the four entered skill bands and rounds to the nearest half band for a practice estimate. Official IELTS score reporting may involve test-specific reporting rules; use official score reports as the authority.

## Files

- `index.html` — app structure and English interface
- `styles.css` — responsive visual design
- `app.js` — navigation, practice tools, charts and local data storage
- `.nojekyll` — tells GitHub Pages not to run Jekyll processing
