# Ansh Kapoor — Portfolio

A cinematic, one-page portfolio for full-stack developer Ansh Kapoor. It
features three grounded project case studies, a lightweight interactive 3D AK
system core, accessible motion and navigation, and an honest static contact
fallback.

## Stack

- Next.js App Router and TypeScript
- Vinext and Vite
- Motion
- React Three Fiber and Drei
- OpenAI Sites hosting

## Local development

```bash
npm install
npm run dev
```

The local site runs at `http://localhost:3000`.

## Validation

```bash
npm run lint
npm test
```

`npm test` creates a production Vinext build and verifies the rendered portfolio
shell, source-backed claims, links, and required public assets.

The contact form uses `NEXT_PUBLIC_CONTACT_ENDPOINT` when configured. Without
that public endpoint it clearly falls back to a pre-filled `mailto:` message and
stores nothing.
