This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Prototype status and checks

This is a development prototype, not ready for a public service. See
[PROTOTYPE-STATUS.md](PROTOTYPE-STATUS.md) for the implemented safeguards and
remaining work. The editor offers a blank start and a template gallery with a
desktop/mobile preview. Starting a new site can replace the current local
draft; save it first if you want to keep it.

Install dependencies with `npm ci`, then run `npm run dev`. The editor can be
opened at http://localhost:3000. Cloud saving and publishing require a configured
PostgreSQL database and authentication; image upload and email also require
their respective services. The Prisma schema expects `DATABASE_URL` and
`DIRECT_URL`. See `.env.local.example` for email and CAPTCHA variable names;
keep real credentials in your local environment and do not commit them.

Run the automated checks with `npm test` and
`npx tsc --noEmit --incremental false`. `npm run lint` currently reports
existing errors and warnings. The automated tests use mocks for external
services; they do not verify a live database, storage, or email delivery.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
