# ReplyWise AI

Paste an email, pick a tone and length, and get a ready-to-send reply with a subject line. You can then make it shorter, warmer or more direct, and copy it.

## How it works

- `index.html`, `style.css`, `app.js`: the frontend (no build step).
- `api/reply.js`: a Vercel serverless function. It builds the prompt on the server and calls the Anthropic API, so your key never reaches the browser.

## Run locally

```bash
npm i -g vercel
echo "ANTHROPIC_API_KEY=your-key-here" > .env.local
vercel dev
```

Open the address it prints (usually http://localhost:3000).

## Deploy

1. Push this folder to a GitHub repository.
2. On vercel.com choose Add New, then Project, and import the repository.
3. Add the environment variable `ANTHROPIC_API_KEY` (optional: `ANTHROPIC_MODEL`).
4. Deploy. Every push to `main` redeploys.

## Before sharing the link widely

The function limits each IP to 8 requests per minute per server instance. That is a basic guard only. Set a monthly spending limit on your API key in the Anthropic Console, and add a shared rate limiter if the site gets real traffic.
