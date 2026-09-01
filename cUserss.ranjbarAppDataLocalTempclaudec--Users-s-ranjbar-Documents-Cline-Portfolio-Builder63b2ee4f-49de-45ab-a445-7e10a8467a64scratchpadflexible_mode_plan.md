# Flexible Mode Implementation Plan

## Current State
- WelcomeScreen exists with 3 options (AI, Manual/Scratch, Template) ✓
- 40+ section editors exist (HeroEditor, AboutEditor, etc.) ✓
- SectionEditor component routes to correct editor ✓
- Zustand store with portfolio state (sections, pages, currentPageId) ✓
- Main builder page (app/page.tsx) imports these but WelcomeScreen logic not wired ✗
- No canvas/drag-drop UI visible in the builder ✗
- No section list sidebar with add/remove/reorder ✗

## Work Breakdown

### Phase 1: Wire up Welcome Flow → Blank Site (Day 1, ~2-3 hours)
1. **Make WelcomeScreen conditional** (app/page.tsx)
   - Show WelcomeScreen when portfolio has no sections
   - Hide when user chooses mode
   - Track chosen mode in state

2. **Initialize blank site from "Create from Scratch"**
   - `resetPortfolio()` with default hero + about section
   - Navigate past welcome screen
   - Show builder UI

**Files to touch:**
- `app/page.tsx` — add showWelcome state, conditional render, initialize on "Create from Scratch"
- `lib/store.ts` — may need resetPortfolio adjustments

---

### Phase 2: Section List Sidebar + Add/Remove (Day 1-2, ~2-3 hours)
3. **Create `SectionListPanel` component**
   - Two-column layout: sections list (left) + editor (right)
   - List shows all sections with drag handles
   - Delete button on each section
   - "Add Section" button at bottom

4. **Wire add/remove actions**
   - AddSectionDialog already exists, wire it
   - On delete, remove from portfolio.sections
   - Feedback (toast) on action

5. **Update main builder layout**
   - Replace SectionEditor with two-column layout
   - Left: SectionListPanel (new)
   - Right: SectionEditor (existing)

**Files to touch:**
- `components/builder/SectionListPanel.tsx` — NEW
- `app/page.tsx` — update layout to use SectionListPanel
- Already have: AddSectionDialog, section removal logic

---

### Phase 3: Drag-Drop Section Reordering (Day 2, ~2 hours)
6. **Add dnd-kit to SectionListPanel**
   - Install: @dnd-kit/core, @dnd-kit/sortable (already in package.json)
   - Wrap sections list with DndContext + SortableContext
   - DragOverlay for visual feedback
   - Update store.reorderSections() on drop

7. **Visual polish**
   - Drag handle icon (GripVertical)
   - Hover state on list items
   - Drop zone highlighting

**Files to touch:**
- `components/builder/SectionListPanel.tsx` — add dnd-kit
- `lib/store.ts` — reorderSections() already exists, verify it works

---

### Phase 4: Editor Integration + Viewport Preview (Day 2-3, ~3-4 hours)
8. **Wire SectionEditor to respond to selections**
   - Click section in list → selectSection(id)
   - Editor shows selected section's content
   - Already hooked up but need to test end-to-end

9. **PortfolioPreview viewport modes**
   - Toggle: Desktop / Tablet / Mobile
   - Already imported in page.tsx, wire to viewMode state
   - Left: sections list, Center: editor, Right: preview pane

10. **Update main layout to 3-pane**
    - Left (narrow): SectionListPanel
    - Center (auto): SectionEditor
    - Right (wide): PortfolioPreview with viewport toggle

**Files to touch:**
- `app/page.tsx` — rework layout to 3-pane, add right preview panel
- `components/builder/PortfolioPreview.tsx` — verify it reads viewMode from store

---

### Phase 5: Save to Database (Day 3, ~1-2 hours)
11. **Create Site from Portfolio on Save**
    - User clicks "Save to Portfolio"
    - Call `getSiteData()` from store (already exists)
    - POST to `/api/portfolios` (or new `/api/sites` endpoint)
    - Save Site + Pages + SiteRevision to DB

12. **Load Portfolio on Return**
    - User logs in, sees list of saved sites
    - Click site → loadSiteData() loads portfolio state
    - Resume editing

**Files to touch:**
- `app/page.tsx` — add Save button, call store.getSiteData(), POST endpoint
- `app/api/portfolios/route.ts` (or new `sites/route.ts`) — handle Site creation
- Verify Prisma models (Site, Page, SiteRevision) are in schema

---

## Success Criteria

**Minimum (Phase 1-3):**
- [ ] Welcome screen shows 3 options
- [ ] Click "Create from Scratch" → blank site with hero + about
- [ ] See section list on left (Hero, About)
- [ ] Click section → editor shows on right
- [ ] Drag sections to reorder
- [ ] Add new section via dropdown
- [ ] Delete section via button
- [ ] Undo/redo works

**Polished (Phase 4):**
- [ ] Preview pane on right shows live site
- [ ] Toggle Desktop/Tablet/Mobile views
- [ ] Edit hero title → preview updates in real-time
- [ ] All 40+ section types available to add

**Shipped (Phase 5):**
- [ ] Click "Save to Portfolio" → creates Site in DB
- [ ] User can see saved sites and load them
- [ ] Published site is accessible

---

## Estimated Effort
- Phase 1: 2-3 hours (welcome → init blank site)
- Phase 2: 2-3 hours (section list UI)
- Phase 3: 2 hours (drag-drop)
- Phase 4: 3-4 hours (layout, preview sync)
- Phase 5: 1-2 hours (DB save/load)

**Total: ~10-14 hours** to ship end-to-end

---

## Notes
- dnd-kit already in package.json ✓
- 40+ section editors already exist ✓
- Store state already supports pages (multi-page) ✓
- Need to test PortfolioPreview syncs correctly with store updates
- Keyboard shortcuts already in place (Ctrl+K, Ctrl+Z, Ctrl+P, etc.) ✓
