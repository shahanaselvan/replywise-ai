# ReplyWise AI

Paste an email, pick a tone and length, and get a ready-to-send reply with a subject line. You can then make it shorter, warmer or more direct, and copy it.

## How it works

- `index.html`, `style.css`, `app.js`: the frontend (no build step).
- `api/reply.js`: a Vercel serverless function. It builds the prompt on the server and calls the Anthropic API, so your key never reaches the browser.

