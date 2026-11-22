# Prototype implementation and remaining work

The project is an existing Next.js/React/TypeScript application using Prisma,
PostgreSQL, NextAuth, and a section-based editor. Existing saved-site data and
uncommitted work were retained while making these changes.

## Current behavior

- A blank start opens an empty page. A new template starts a separate draft;
  the user is warned before replacing unsaved local changes.
- The gallery provides a full-site preview at desktop and mobile widths.
- Save validates the document through the existing shared loader before writing;
  the same loader is used by publication. Sites with more than 500 sections are
  rejected. Existing extra fields are retained for compatibility.
- Rich text and raw embeds are sanitized in editor and published rendering;
  iframe embeds are sandboxed by the existing sanitizer.
- The unused contact relay is disabled. The active contact endpoint validates
  input, applies rate limits, and sends plain text to the configured recipient.
- The image/PDF upload endpoint rejects SVG and checks basic file signatures;
  uploads still require full processing and security controls before beta.

## Gaps before M1 acceptance

- The existing schema is not a strictly versioned document schema: unknown
  fields are retained and the 200-elements-per-page limit is not enforced.
  Migrations and compatibility tests are needed before enforcing strict schemas.
- Complete desktop and mobile screenshots and full-page visual reviews for
  each required template have not been recorded. Accessibility needs a full
  keyboard and screen-reader review across the editor and published pages.
- A complete live-service creation, save, reopen and publish journey has not
  been verified in this review. Automated tests use mocked dependencies.
- Published revisions do not yet guarantee exact reproduction across renderer
  changes or retain all referenced assets and fonts as immutable versions.
- Included asset sources and licenses have not been comprehensively inventoried.
- The existing lint suite has substantial errors and warnings.

## Before beta and launch

Contact submissions currently go to the platform-configured email address,
not a site-owner inbox. Add an owner inbox, delivery and retry handling,
honeypot, and production rate limiting with a trusted client-IP strategy.
Uploads need server-side processing, malware scanning, metadata removal,
private draft storage, isolated delivery, and durable publication assets.
Review all media endpoints, not only the image/PDF endpoint.

Complete the original request's S-1 through S-12 security controls, including
authorization tests, authentication hardening, browser security headers,
CSRF, auditing, privacy, moderation, and supply-chain scanning. The improvements
above do not establish beta compliance. Add immutable publish/rollback,
conflicting-save handling, SEO and performance verification, and proper
background jobs. Before public launch, complete L-1 through L-6: a current
threat model, operations and recovery, independent security assessment,
findings review, privacy review, and deletion/cache verification. Validate
usability with representative users; no completion-time claim has been tested.
