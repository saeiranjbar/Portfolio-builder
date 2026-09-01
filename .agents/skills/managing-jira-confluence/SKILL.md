---
name: managing-jira-confluence
description: Manage Jira issues and Confluence content safely. Use when Codex needs to search, summarize, create, update, transition, or comment on Jira issues; search, draft, create, or update Confluence pages; turn project work into tickets or documentation; or coordinate work between Jira and Confluence.
---

# Jira and Confluence Management

## Workflow

1. Identify the target system, project or space, and requested outcome. Search first when IDs, page titles, project keys, or existing content may be ambiguous.
2. Use available Jira/Confluence connectors or approved project tools. If no connector is available, state what access is missing and provide a ready-to-paste draft or exact manual steps.
3. Treat reads and searches as safe. Before any external write—creating, editing, transitioning, commenting, assigning, deleting, or publishing—show a concise summary of the proposed change and obtain the user's confirmation, unless the user explicitly authorized that exact write in the current request.
4. Preserve existing fields and page content unless the user clearly requests replacement. For edits, summarize the intended diff.
5. Report created or updated issue keys/page links, status, and any action that could not be completed.

## Jira

- Search by issue key when given; otherwise search by project, assignee, status, label, text, or JQL.
- For new issues, gather or infer: project key, issue type, summary, description, priority, assignee, labels, and acceptance criteria. Mark assumptions clearly.
- Include reproducible steps, expected versus actual behavior, environment, and relevant links for bug reports.
- Do not change workflow status, priority, assignment, estimates, or sprint placement unless requested.
- Keep comments factual and concise; avoid credentials, tokens, personal data, and confidential material.

## Confluence

- Search the intended space before creating a page to prevent duplicates.
- For new pages, propose the space, title, parent location, and a structured outline before writing when these are not specified.
- For existing pages, preserve headings, links, tables, and macros where possible. Do not overwrite a page wholesale without explicit approval.
- State whether the update is a draft or published page, and include the final page link after a successful write.

## Jira–Confluence Handoff

- Link a Jira issue to the relevant Confluence page when both exist and the user requests coordination.
- Convert implementation work into a Jira issue with a short context, scope, acceptance criteria, and validation notes.
- Convert issue research into a Confluence update with sources, decisions, open questions, and follow-ups.

## Examples

- "Find unresolved bugs in project WEB assigned to me and summarize them."
- "Draft a Jira bug for the About Me PDF width mismatch; do not create it yet."
- "Create the approved bug in project WEB with the supplied details."
- "Search Confluence for our portfolio-builder requirements and summarize the relevant pages."
- "Draft a release-notes update for the Portfolio Builder page; preserve the existing format."