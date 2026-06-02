# Customer Story Writer — Implementation

## Hybrid Workflow: Slidev + PPTX

The recommended workflow uses Slidev for authoring and iteration, with an editable PPTX export for formal sharing and director review.

### Why two formats

| | Slidev | Editable PPTX |
|---|---|---|
| **Good for** | Drafting, iteration, real-time preview | Sharing with leadership, formal submission |
| **Edit format** | Markdown + HTML | PowerPoint (native text boxes) |
| **Export** | PDF, PPTX (as images), static HTML | Native .pptx |
| **Collaboration** | Git, VS Code Live Share, Codespaces | SharePoint co-authoring |

### Authoring in Slidev

1. Set up the project in a **local path** (not OneDrive — node_modules break):
   ```bash
   cd C:\temp\[customer]-story
   pnpm init && pnpm add @slidev/cli @slidev/theme-default
   ```

2. Copy the example files from this skill as a starting point:
   - `assets/example-slides.md` → `slides.md`
   - `assets/example-styles.css` → `styles/index.css`

3. Copy the Hub template assets into `public/`:
   - `bg-gradient.png` — background gradient (from slideLayout3, image3.png)
   - `pill-bg.png` — Customer Story pill (from layout, image4.png)
   - Engagement type icons (image10.png, image12.png, image13.png, image24.png, image25.png)
   - Customer logo

4. Run dev server: `npx slidev`

5. Edit `slides.md` — Slidev hot-reloads on save.

6. Export when ready:
   ```bash
   npx slidev export --output story.pdf
   npx slidev export --format pptx --output story.pptx
   ```

### Syncing to Editable PPTX

When an editable PPTX is needed (director review, CEHub submission):

1. Unpack the Hub Customer Story Template:
   ```bash
   python scripts/office/unpack.py "Hub Customer Story Templates.pptx" unpacked/
   ```

2. Strip to single slide (slide 7 in the template is the CVS Health sample):
   - Edit `presentation.xml` → keep only `rId11` in `<p:sldIdLst>`
   - Run `clean.py` to remove orphaned slides

3. Replace text in the slide XML using the Edit tool — **text-only replacements, never add new paragraphs**. The content from `slides.md` maps to the PPTX text boxes.

4. Pack:
   ```bash
   python scripts/office/pack.py unpacked/ output.pptx --original template.pptx
   ```

5. Customer logos must be swapped manually in PowerPoint (right-click → Change Picture).

### Template Asset Extraction

All icons and backgrounds come from `Hub Customer Story Templates.pptx` (Cemille, Nov 2025). To extract them:

1. Unpack the template
2. The layout for the story slide is `slideLayout3.xml` (referenced by slide 7)
3. Key media files:
   - `image3.png` — full-slide gradient background (rId2 in layout)
   - `image4.png` — Customer Story pill gradient (rId3 in layout)
   - `image10.png` — Solution Envisioning icon
   - `image12.png` — AI Business Solutions icon
   - `image13.png` — Rapid Prototype icon
   - `image24.png` — Cloud & AI icon
   - `image25.png` — Architecture Design icon

## Slidev Gotchas

- **Dollar signs:** Vue eats `$` in Slidev content. Use plain numbers (`250K` not `$250K`). HTML entities (`&#36;`) and `v-pre` don't help.
- **Global styles required:** `<style>` blocks are scoped per-slide. Multi-slide decks must use `styles/index.css`.
- **OneDrive + node_modules:** Native bindings (rolldown, oxc-parser) break when node_modules is in a OneDrive-synced path. Keep the Slidev project in `C:\temp\` or similar.
- **pnpm native bindings:** May need to manually install `@rolldown/binding-win32-x64-msvc` and `@oxc-parser/binding-win32-x64-msvc` if pnpm doesn't resolve them.

## PPTX Template Gotchas

- **Fixed text box sizes:** Adding `<a:p>` paragraphs to template text boxes causes overflow and overlapping text. Only replace existing text in-place.
- **Ampersands:** Use `&amp;` in XML.
- **clean.py removes "unreferenced" media:** If you change slide rels, logos may get deleted. Copy them back after cleaning.
- **Pack to a different filename:** Don't use `--original` pointing to the same file as the output.

## Example Files

- `assets/example-story.pptx` — AstraZeneca story in the Hub Customer Story Template (editable, with Ed Hild's revisions)
- `assets/example-slides.md` — Same story in Slidev format (cover + three-column content slide)
- `assets/example-styles.css` — Global CSS with Hub template colors, typography, and layout
- `references/rubric.md` — Manish's 3-point scoring rubric
