# Publishing a website

1. Sign in and open your website from **Saved websites**, or create a new one.
2. Click **Publish** in the editor toolbar.
3. Click **Save and publish**. The editor saves your draft online before publishing it.
4. Copy the public link or choose **Open website**. Visitors can use this link without an account.
5. After further edits, click **Publish**, then **Save and update live website** to replace the published version.
6. Choose **Unpublish** to take the website offline. Your saved draft remains available in your account.

Ordinary **Save** updates the private draft only. Renaming or republishing a website keeps its existing public path. Each website must have one Home page with an empty path; other pages need unique paths such as `about` or `services/web-design`.

In production, shared links use Vercel's `VERCEL_PROJECT_PRODUCTION_URL` so that opening the editor through a protected deployment URL does not produce a protected share link. Vercel system environment variables must be enabled. Preview and local deployments keep their own URL because their data may differ from production. For public visitor access, the production domain must be publicly accessible under **Settings → Deployment Protection** (Standard Protection keeps generated deployment URLs protected while leaving production domains public).

## Implementation

The existing `Site` and `SiteRevision` tables are used; no schema changes are required. Path-based publishing needs no additional environment variables. A site's ID matches its saved `Portfolio` ID. Publishing creates a revision and atomically points `Site.publishedAt` to it. Public requests read only this chosen revision when the site is published, without using the owner's session or returning account data.

The public route is `/sites/[slug]/[[...path]]`. It renders the same design components in an isolated, non-persisted preview store, preserving the editor's local draft. Published rich text is sanitized and custom iframe HTML is sandboxed. Script-based custom embeds are not supported. Draft editing and saving do not update the selected public revision.

Validation: `npm test`, TypeScript checking, and a production Next.js build. Live publication still needs checking after Vercel deploys: publish a website, open its public link in a private window, save a draft change, verify the public version stays unchanged, then republish and verify it updates.

## Website subdomains

1. Add `*.creativeportfolio.net` to the production project's Vercel Domains settings. The domain must belong to the same Vercel team as the project. Use the team's Domains page to move it, or Connect External and verify ownership if necessary. This is a Vercel ownership change, not a registrar transfer.
2. Keep the existing Northwest nameservers and website/email records. Enable Vercel DNS on the domain's team-level settings, then use Vercel's external-DNS wildcard instructions: add two NS records named `_acme-challenge`, pointing to `ns1.vercel-dns.com.` and `ns2.vercel-dns.com.`, and a CNAME named `*` pointing to `cname.vercel-dns-0.com.`. Follow the current values shown by Vercel if they differ. Keep the challenge delegation for certificate renewals.
3. Wait until Vercel validates the wildcard and provisions its certificate. Only then add `PUBLISHED_SITE_DOMAIN=creativeportfolio.net` to the Production environment and redeploy. Keep `NEXTAUTH_URL=https://www.creativeportfolio.net` and the verified email sender unchanged.
4. Open a saved website on `www.creativeportfolio.net`, click Publish, and enter a name such as `saeid`. The dialog checks availability and publishes to `saeid.creativeportfolio.net`. Names may use 1–63 ASCII letters, numbers and internal hyphens; system and email names are reserved. Existing automatic names can be replaced here.
5. Test the copied link in a private browser, including additional pages. Changing the chosen address preserves all previous links. Unpublishing makes the current and previous addresses return 404.

Subdomains use the existing unique `Site.customDomain` field. Allocation occurs only in Production with the environment variable enabled. Host routing serves the chosen published revision and blocks editor/account APIs on tenant hosts. Unknown and unpublished sites return 404. The apex domain and `www` continue to serve the builder. Preview deployments do not allocate production subdomains.

The server rechecks availability when publishing; the unique database constraint rejects concurrent claims. Previous domains are retained as `SiteRevision` entries with source `domain-alias:<hostname>` and empty data, reserving them for the same site. Public reads follow these entries to the site's chosen published snapshot; alias entries are never rendered as snapshots. This uses the existing schema without requiring a Neon migration. Legacy clients that omit a chosen name retain the automatic naming behavior.

## Hero PDF reader

Open Hero > PDF Reader to upload a PDF up to 1 MB or paste a direct public HTTPS PDF link. Set the document title and reader height, then save and publish to update the public website. Larger documents should use a public link ending in `.pdf`. Uploaded documents are stored with the website content; no database migration or environment variable is required. The reader includes an Open PDF link for browsers that cannot display the embedded document. Linked files must permit embedding.

Drag the reader's Move handle to position it in the canvas, using a mouse or touch. Reset PDF position restores its original location. Placement is stored as relative offsets and preserved on save, publication, and HTML export. Movement controls appear only in the editor; visitors can use the PDF reader normally.

The reader sits in the Hero body alongside text and galleries with a transparent wrapper. It does not use a popup or floating card. The embedded URL requests a fitted document view with the PDF toolbar and navigation panes hidden; support for these parameters depends on the browser's PDF viewer.

## Sign-in before building

The builder mounts only after the session is authenticated. Signed-out visitors see a required sign-in/create-account dialog; loading sessions show a waiting state. The dialog cannot be dismissed to access AI, manual or template creation. Sign-out removes the editor from the page, and AI generation also requires a server-validated session. Published visitor routes remain public. The homepage dialog and `/login` reuse the same email verification and password reset form.

References: [Vercel external DNS wildcard configuration](https://vercel.com/docs/domains/working-with-domains/add-a-domain), [domain ownership troubleshooting](https://vercel.com/docs/domains/troubleshooting).
