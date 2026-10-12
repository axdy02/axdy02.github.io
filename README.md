# Ansh Kapoor — Portfolio

A cinematic, one-page portfolio for full-stack developer Ansh Kapoor. It
features three grounded project case studies, a lightweight interactive 3D AK
system core, accessible motion and navigation, and an honest static contact
fallback.

## Stack

- Next.js App Router and TypeScript
- Motion
- React Three Fiber and Drei
- Cloudflare Workers deployment through OpenNext

## Local development

```bash
npm install
npm run dev
```

The local site runs at `http://localhost:3000`.

## Cloudflare Workers

The Worker name and its `WORKER_SELF_REFERENCE` service binding are both
`axdy02-github-io` in the committed `wrangler.jsonc` file. No migration command
is part of the deployment scripts.

For a local deployment, run `npm run deploy`. In Cloudflare Workers Builds, set
the build command to `npm run cf:build` and the deploy command to
`npm run cf:deploy`, with the repository root as the root directory. Keep any
existing build variables, runtime secrets, routes, and custom domains in the
Cloudflare dashboard. Set `NEXT_PUBLIC_SITE_URL` as a build variable if the
production URL should appear in page metadata.

For Preview branches, use `npm run cf:build` as the build command and
`npx wrangler preview` as the preview command. The `previews` block in
`wrangler.jsonc` enables Cloudflare Worker Previews without deploying the
branch to production.
If a Preview branch already exists in Cloudflare, update its own build
configuration too; branch settings override the Previews Base settings.

## Validation

```bash
npm run lint
npm test
```

`npm test` creates a production Next.js build and verifies the rendered
portfolio shell, source-backed claims, links, and required public assets.

The contact form uses `NEXT_PUBLIC_CONTACT_ENDPOINT` when configured. Without
that public endpoint it clearly falls back to a pre-filled `mailto:` message and
stores nothing.
