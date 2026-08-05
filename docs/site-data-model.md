# Site data model — design spec

Status: in progress (2026-08-05) — steps 1–2 of the migration plan are implemented: Prisma models (`Site`, `Page`, `SiteRevision`, `AiBrief`) are live in the dev DB, and `lib/site-types.ts` provides the zod schema layer with parse helpers (`parseSiteData`, `validateAiSiteData`).
Goal: evolve the current single-page `PortfolioData` model into a multi-page **Site** model that serves all three builder modes (AI-guided, template, flexible) for small-business websites.

## Design principles

1. **Evolve, don't rewrite.** The existing 20 section types, editors, and renderers stay. A `Portfolio` becomes a `Site` with one page.
2. **One data shape, three modes.** AI mode *writes* this structure, template mode *clones* it, flexible mode *edits* it. Templates and AI output are just pre-filled sites.
3. **Runtime-validated.** Every type gets a zod schema. AI generation output is parsed with zod before it ever touches the database — invalid output is rejected and regenerated, never stored.
4. **History is first-class.** Every meaningful save creates a revision. "Regenerate with AI" and "restore previous version" are the same operation: swap the active revision.

## Entity model

```
User
 └── Site (1..n)                    ← renamed/extended from Portfolio
      ├── slug, customDomain        ← publishing identity
      ├── status: draft | published
      ├── settings (JSON: SiteSettings)   ← theme, navbar, footer, dark mode
      ├── seo (JSON: SiteSeo)             ← default title/description/og-image
      ├── Page (1..n)
      │    ├── slug ("" = home), title, order
      │    ├── seo (JSON: PageSeo, overrides site defaults)
      │    └── sections (JSON: Section[])  ← existing section union, unchanged shapes
      ├── SiteRevision (0..n)       ← snapshot of pages+settings, for undo/AI-regen safety
      │    ├── data (JSON: full site snapshot)
      │    ├── source: manual | ai | template | autosave
      │    └── createdAt
      └── AiBrief (0..1)            ← the answers from AI-mode Q&A, kept for regeneration
           ├── businessType, businessName, description
           ├── goals, tone, colorPreference
           └── rawAnswers (JSON)
```

### Prisma sketch

```prisma
model Site {
  id           String   @id @default(uuid())
  userId       String
  name         String
  slug         String   @unique          // subdomain or path identity
  customDomain String?  @unique
  status       String   @default("draft") // draft | published
  settings     String                     // JSON: SiteSettings
  seo          String                     // JSON: SiteSeo
  publishedAt  DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user      User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  pages     Page[]
  revisions SiteRevision[]
  aiBrief   AiBrief?
}

model Page {
  id        String   @id @default(uuid())
  siteId    String
  slug      String                        // "" = home, "about", "services/web-design"
  title     String
  order     Int      @default(0)
  seo       String?                       // JSON: PageSeo (falls back to site seo)
  sections  String                        // JSON: Section[]
  updatedAt DateTime @updatedAt

  site Site @relation(fields: [siteId], references: [id], onDelete: Cascade)

  @@unique([siteId, slug])
}

model SiteRevision {
  id        String   @id @default(uuid())
  siteId    String
  source    String                        // manual | ai | template | autosave
  data      String                        // JSON: full snapshot { settings, seo, pages }
  createdAt DateTime @default(now())

  site Site @relation(fields: [siteId], references: [id], onDelete: Cascade)

  @@index([siteId, createdAt])
}

model AiBrief {
  id          String   @id @default(uuid())
  siteId      String   @unique
  rawAnswers  String                      // JSON: full Q&A transcript
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  site Site @relation(fields: [siteId], references: [id], onDelete: Cascade)
}
```

Notes:
- SQLite has no native JSON column; keep JSON-as-string for dev, switch to `Json` type when moving to PostgreSQL for production. Wrap all reads/writes in zod parse so the string column is safe.
- `Portfolio`/`Project` tables stay during migration; a script converts each Portfolio → Site with a single home Page.

## TypeScript / zod layer

New file `lib/site-types.ts` (zod-first — TS types derived via `z.infer`):

```ts
// Common props factored out of all 20 section interfaces
const BaseSectionSchema = z.object({
  id: z.string(),
  type: z.string(),
  visible: z.boolean().default(true),
  textStyles: TextStylesSchema.optional(),
  sectionBackground: SectionBackgroundSchema.optional(),
  freeFormEnabled: z.boolean().optional(),
  snapEnabled: z.boolean().optional(),
  elementPositions: z.record(ElementPositionSchema).optional(),
});

// Each existing section extends the base; existing field shapes unchanged
const HeroSectionSchema = BaseSectionSchema.extend({ type: z.literal('hero'), ... });

export const SectionSchema = z.discriminatedUnion('type', [HeroSectionSchema, ...]);
export const PageSchema = z.object({
  slug: z.string(),
  title: z.string(),
  seo: PageSeoSchema.optional(),
  sections: z.array(SectionSchema),
});
export const SiteDataSchema = z.object({
  settings: SiteSettingsSchema,   // theme, navbar, footer, darkMode (existing shapes)
  seo: SiteSeoSchema,
  pages: z.array(PageSchema).min(1),
});

export type Section = z.infer<typeof SectionSchema>;
export type SiteData = z.infer<typeof SiteDataSchema>;
```

Why zod-first matters here:
- **AI mode**: `SiteDataSchema.safeParse(claudeOutput)` is the quality gate. Failed parse → automatic retry with the validation errors fed back to the model.
- **API routes**: same schemas validate user-submitted saves (you already use zod for this pattern).
- **Templates**: a template is just `SiteData` + gallery metadata; invalid templates can't ship.

## SEO shapes

```ts
SiteSeo  = { title, description, ogImage?, favicon?, keywords?[] }
PageSeo  = { title?, description?, ogImage?, noIndex? }  // overrides site defaults
```

## How each mode uses this model

| Mode | Operation |
|------|-----------|
| AI-guided | Q&A → `AiBrief` → Claude generates `SiteData` → zod-validate → save as revision (`source: 'ai'`) → open editor |
| Template | Template's `SiteData` cloned into new Site (`source: 'template'`) → open editor |
| Flexible | New Site with one empty home page → open editor |
| Mode switching | Free: all modes edit the same `SiteData`; "ask AI to redo this page" = regenerate one `Page` and swap it in a new revision |

## Migration plan (incremental, non-breaking)

1. Add new Prisma models (`Site`, `Page`, `SiteRevision`, `AiBrief`) alongside existing ones. Migrate dev DB.
2. Create `lib/site-types.ts` with zod schemas mirroring existing section types (base-section refactor happens here, TS types stay compatible).
3. Write `lib/migrate-portfolio.ts`: Portfolio → Site with one home page.
4. Point the editor store (`lib/store.ts`) at `SiteData` with a `currentPageId` — the editor becomes page-aware.
5. New API routes `/api/sites/...`; keep `/api/portfolios/...` working until UI is switched over.
6. Retire `Portfolio`/`Project` models once nothing reads them.

## Open questions (decide later, model supports both)

- Subdomain strategy for published sites (`{slug}.yourdomain.com`) vs path-based (`yourdomain.com/s/{slug}`) — slug field supports either.
- Autosave cadence for revisions (every save vs debounced snapshots) — start with snapshot-on-publish + snapshot-before-AI-regen, add autosave later.
- Whether `Project` data folds into sections JSON entirely (recommended: yes — projects live inside `ProjectsSection` already).
