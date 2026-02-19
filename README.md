# Portfolio

A clean, professional developer portfolio focused on clarity, system design, and impact. The site presents selected work, leadership experience, and a direct path to collaboration.

## Overview
- Home: identity, focus areas, and featured work.
- Projects: problem-solution summaries with role and outcomes.
- Experience: leadership timeline and achievements.
- Blog: prepared space for technical writing.
- Contact: direct outreach and social links.

## Personalization
Update profile details, copy, and project content in the data file to reflect your background and current focus.

## Contact Form Setup
The contact form posts to `/api/contact` and sends email through [Resend](https://resend.com/).

Create `.env.local` with:

```bash
RESEND_API_KEY=your_resend_api_key
CONTACT_TO_EMAIL=your@email.com
CONTACT_FROM_EMAIL="Portfolio Contact <onboarding@resend.dev>"
# optional
CONTACT_FROM_NAME="Portfolio Contact"
```

Notes:
- `CONTACT_TO_EMAIL` is where messages are delivered. If omitted, it falls back to the profile email.
- `CONTACT_FROM_EMAIL` supports either `email@example.com` or `Name <email@example.com>`.
- If `CONTACT_FROM_EMAIL` is missing or invalid (for example only a name), the API falls back to `onboarding@resend.dev`.
- For production, use a verified sender/domain in Resend.
- The endpoint includes basic protection: input validation, same-origin checks, honeypot spam field, and per-IP rate limiting.
