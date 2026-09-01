# Quick Start - Portfolio Builder

## 🚀 Run the App (2 minutes)

### Terminal Commands:
```bash
cd "c:\Users\s.ranjbar\Documents\Cline\Portfolio Builder\portfolio-builder"
npm run dev
```

### Browser:
Open: **http://localhost:3000**

---

## 🎬 What You'll See

1. **Welcome Screen** appears
   - 3 large cards: AI, Scratch, Template
   
2. **Click "Start from Scratch"** (middle card)
   - Screen transitions to 3-pane editor
   - Left: Section list (Hero, About)
   - Center: Editor
   - Right: Live preview

3. **Try These Actions:**
   - Click "About" in left panel → editor switches
   - Hover "About" → trash icon appears → click to delete
   - Click "Add Section" → select "Services"
   - Click preview buttons → Desktop/Tablet/Mobile views
   - Ctrl+Z → Undo
   - Ctrl+Shift+Z → Redo

---

## 🎨 Visual Mockup (No Server)

If server won't start, just open this file:
```
c:\Users\s.ranjbar\Documents\Cline\Portfolio Builder\portfolio-builder\public\test-preview.html
```

Double-click or drag into browser. Shows exact same 3-pane layout.

---

## 📋 What's New

| What | Where |
|------|-------|
| "Create from Scratch" button | WelcomeScreen |
| 3-pane editor layout | app/page.tsx |
| Section list sidebar | SectionListPanel.tsx (NEW) |
| Blank site init (hero+about) | store.ts createBlankFlexibleSite() |
| Hook order fix | PortfolioPreview.tsx |
| Removed duplicate render | app/page.tsx |

---

## ⚠️ If It Doesn't Work

**"npm: command not found"**
- Install Node.js from nodejs.org

**"Port 3000 already in use"**
- Kill process: `npx kill-port 3000`
- Or use different port: `npm run dev -- -p 3001`

**"Module not found"**
- Run: `npm install`
- Then: `npm run dev`

**"Rendered more hooks error"**
- This was already fixed in PortfolioPreview.tsx
- Try fresh page reload

---

## 📁 Files Changed

```
✏️  app/page.tsx
✏️  lib/store.ts
✏️  components/builder/PortfolioPreview.tsx
🆕 components/builder/SectionListPanel.tsx
🆕 public/test-preview.html
```

---

## ✅ You're All Set!

Run `npm run dev` and click "Start from Scratch" to test the new flexible mode.

For details, see: `IMPLEMENTATION_COMPLETE.md`
