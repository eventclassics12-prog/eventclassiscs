# eventclassics.in

Next.js editorial site for **Eventclassics** — a strategic brand-building
studio based in Kolkata, working worldwide. Site pages: `/`, `/about`,
`/services`, `/work`, `/contact-form`.

## Getting Started

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build && pnpm start
```

The site is a [Next.js](https://nextjs.org) 16 App Router project with
Tailwind v4, Framer Motion, GSAP, Three.js, and a small set of shadcn-
style primitives under `src/components/ui/`.

## Zoho CRM integration

The contact form on `/contact-form` POSTs to `/api/zoho/leads`, which
forwards each submission to Zoho CRM as a new Lead in the `Leads`
module (v8 API).

To enable it in production:

1. **Create a self-client Zoho app** at
   <https://api-console.zoho.in/> (or the regional console for `.com`,
   `.eu`, etc.). Add a redirect URI — anything you control; the
   initial auth-code exchange can hit localhost during dev.
2. **Mint a refresh token** by completing the auth-code flow with
   scope `ZohoCRM.modules.leads.CREATE` (or `ZohoCRM.modules.ALL` if
   you plan to push other modules later). The refresh token is
   long-lived; store it somewhere safe. Build the URL like this:

   ```
   https://accounts.zoho.in/oauth/v2/auth
     ?scope=ZohoCRM.modules.leads.CREATE
     &client_id=<your-client-id>
     &response_type=code
     &redirect_uri=<your-redirect-uri>
     &access_type=offline
   ```

   Approve the prompt, copy `code` from the redirect, exchange it at
   `https://accounts.zoho.in/oauth/v2/token?grant_type=authorization_code&code=<code>&client_id=<id>&client_secret=<secret>&redirect_uri=<uri>`,
   and pull `refresh_token` out of the JSON response.

3. **Set the env vars** in `.env.local` (local) and in your hosting
   provider (Vercel: Project Settings → Environment Variables →
   Production). See `.env.example` for the full list with `.in`
   defaults.

Without those env vars, `/api/zoho/leads` returns `503` and the browser
falls back to opening the user's mail client with the existing
`mailto:` template — useful for local dev before Zoho creds are wired.

## Deploy on Vercel

The easiest way to deploy is via the
[Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).
Add the four `ZOHO_*` env vars in the project's environment settings
before going live.

See [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying)
for details.
