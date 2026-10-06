# Publishing a website

1. Sign in and open your website from **Saved websites**, or create a new one.
2. Click **Publish** in the editor toolbar.
3. Click **Save and publish**. The editor saves your draft online before publishing it.
4. Copy the public link or choose **Open website**. Visitors can use this link without an account.
5. After further edits, click **Publish**, then **Save and update live website** to replace the published version.
6. Choose **Unpublish** to take the website offline. Your saved draft remains available in your account.

Ordinary **Save** updates the private draft only. Renaming or republishing a website keeps its existing public path. Each website must have one Home page with an empty path; other pages need unique paths such as `about` or `services/web-design`.

## Implementation

The existing `Site` and `SiteRevision` tables are used; no new environment variables or schema changes are required. A site's ID matches its saved `Portfolio` ID. Publishing creates a revision and atomically points `Site.publishedAt` to it. Public requests read only this chosen revision when the site is published, without using the owner's session or returning account data.

The public route is `/sites/[slug]/[[...path]]`. It renders the same design components in an isolated, non-persisted preview store, preserving the editor's local draft. Published rich text is sanitized and custom iframe HTML is sandboxed. Script-based custom embeds are not supported. Draft editing and saving do not update the selected public revision.

Validation: `npm test`, TypeScript checking, and a production Next.js build. Live publication still needs checking after Vercel deploys: publish a website, open its public link in a private window, save a draft change, verify the public version stays unchanged, then republish and verify it updates.
