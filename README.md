# IELTS Studio — Personal Academic Practice Hub (v2)

A browser-based personal IELTS practice website. Upload the folder to GitHub Pages or open `index.html` in a modern browser. Data is stored locally in that browser.

## What works in this version
- **Reading:** a complete original 10-question practice set with a passage, answer submission, automatic marking, explanations, percentage score and saved history.
- **Listening:** an original 10-question listening exercise. The audio is generated using the browser's English speech synthesis voice; answers are automatically marked and saved. Voice availability and accent depend on the browser/device.
- **Writing:** essay workspace, word count, local draft saving, draft recovery while typing, and a four-criterion self-assessment score. The self-assessment is not AI marking or an official examiner score.
- **Speaking:** prompts, timer, practice reflection and four-criterion self-assessment. The score is user-entered self-assessment, not AI speech recognition or official marking.
- **Learning records:** sessions, mock scores, vocabulary, mistakes, planner, activity calendar, export/import backup.
- **Data migration:** existing `ieltsStudio.v1` browser data is read and then saved under the v2 key.

## Scoring notes
Reading and Listening show the exact number correct out of 10 and percentage accuracy. They also store an equivalent raw count out of 40 for tracking only; this is **not** an official IELTS band conversion. Writing and Speaking scores are self-assessments across the four public IELTS assessment criteria.

All built-in questions and passages are original practice content, not official IELTS, Cambridge or IELTS Atlas past-paper materials.

## Important limitations
- No AI writing correction, AI speaking conversation, speech recognition or official examiner scoring is connected.
- Listening audio uses browser text-to-speech rather than an official IELTS recording.
- `localStorage` is specific to the browser and website origin. It does not automatically sync between devices or browsers. Use Export backup regularly.
- GitHub Pages is static hosting; do not put private API keys in client-side files.

## Files
`index.html`, `styles.css`, `app.js`, `README.md`, `.nojekyll`.
