# Tiny-Workers README Beautification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Status:** In progress

- [x] Task 1: Create the local command-center SVG banner
- [x] Task 2: Redesign README content and presentation
- [x] Task 3: Include the banner asset in the npm package
- [x] Task 4: Run final documentation and package verification

**Goal:** Make the README polished and memorable for GitHub and npm visitors while explaining Tiny-Workers’ orderly AI-agent workflow.

**Architecture:** Keep the change static and self-contained. Add one local SVG illustration, reference it from the README with a relative path, and add the asset directory to the npm package allowlist. Preserve all runtime code and existing command behavior.

**Tech Stack:** Markdown, inline HTML for README layout, standalone SVG, `package.json`, Node.js 20+ test scripts, and npm packaging.

## Global Constraints

- The banner must be a self-contained 1200×360 SVG at `assets/tiny-workers-command-center.svg`.
- The SVG must not depend on external images, fonts, or network resources.
- The banner must depict a dark navy command center, technical grid, neon cyan/green accents, and three tiny robots coordinating `PLAN → EXECUTE → VERIFY`.
- Add `assets` to the `files` array in `package.json`.
- No runtime code or dependency changes are in scope.
- The README’s final section must be `## License` and link to the existing root `LICENSE` file.
- The npm badge must link to `https://www.npmjs.com/package/@hoangthai2171/tiny-workers`.
- Verification must include `npm test`, `npm run pack:check`, and `git diff --check`.

## File Structure

- Create `assets/tiny-workers-command-center.svg` — the local, accessible command-center banner.
- Modify `README.md` — the visual hero, npm badge, polished copy, Tiny-PM criteria, and final license section.
- Modify `package.json` — publish the `assets` directory with the package.
- No test files are needed; existing test and packaging scripts are the verification surface for this documentation-only change.

### Task 1: Create the local command-center SVG banner

**Files:**
- Create: `assets/tiny-workers-command-center.svg`
- Test: visual inspection plus structural text checks

**Interfaces:**
- Consumes: the approved command-center visual direction in `docs/superpowers/specs/2026-08-01-readme-beautification-design.md`.
- Produces: a standalone SVG at exactly `assets/tiny-workers-command-center.svg` with `viewBox="0 0 1200 360"`.

- [ ] **Step 1: Create the accessible SVG root and metadata**

  Use this root shape and metadata pattern so the image has a meaningful accessible name and description:

  ```xml
  <svg xmlns="http://www.w3.org/2000/svg"
       viewBox="0 0 1200 360"
       role="img"
       aria-labelledby="banner-title banner-description">
    <title id="banner-title">Tiny-Workers command center</title>
    <desc id="banner-description">Three tiny robots coordinate orderly AI-agent work through plan, execute, and verify stages.</desc>
    <!-- visual groups go here -->
  </svg>
  ```

- [ ] **Step 2: Build the approved visual composition with native SVG primitives**

  Use only `<rect>`, `<path>`, `<circle>`, `<line>`, `<polyline>`, `<polygon>`, `<text>`, and `<g>` elements, plus local `<defs>` for gradients and a low-opacity grid pattern. Use a dark navy background, a subtle blue grid, cyan and green highlights, and a restrained indigo/purple secondary accent. Arrange three labeled stage panels from left to right with visible connectors and tiny robot silhouettes stationed around them. Label the stages exactly `PLAN`, `EXECUTE`, and `VERIFY`, and include `TINY-WORKERS` as the main artwork title.

- [ ] **Step 3: Check the asset’s required structure and content**

  Run:

  ```bash
  rg -n 'viewBox="0 0 1200 360"|TINY-WORKERS|PLAN|EXECUTE|VERIFY|<image|<iframe|<script|href="https?://' assets/tiny-workers-command-center.svg
  git diff --check
  ```

  Expected: the required viewBox and labels are present; no external image, iframe, script, or remote `href` is present; `git diff --check` is clean.

- [ ] **Step 4: Commit the completed banner asset**

  ```bash
  git add assets/tiny-workers-command-center.svg
  git commit -m "docs: add Tiny-Workers command-center banner"
  ```

### Task 2: Redesign README content and presentation

**Files:**
- Modify: `README.md`
- Test: Markdown structure and link checks

**Interfaces:**
- Consumes: `assets/tiny-workers-command-center.svg` from Task 1.
- Produces: a README whose final section is `## License`, with all existing install, usage, update, and uninstall commands preserved.

- [ ] **Step 1: Replace the opening with the local hero and npm badge**

  Start the README with this structure, keeping the supplied npm URL exact:

  ```md
  <p align="center">
    <img src="./assets/tiny-workers-command-center.svg" alt="Tiny-Workers command center banner">
  </p>

  <h1 align="center">Tiny-Workers</h1>

  <p align="center">A collection of workflow skills that keep AI agents focused, orderly, and on track.</p>

  <p align="center">
    <a href="https://www.npmjs.com/package/@hoangthai2171/tiny-workers">
      <img src="https://img.shields.io/npm/v/%40hoangthai2171%2Ftiny-workers?logo=npm&label=npm" alt="npm version">
    </a>
  </p>
  ```

- [ ] **Step 2: Preserve and polish the project overview and command sections**

  Keep the supported-agent list and the existing `npx @hoangthai2171/tiny-workers`, `$tiny-workers`, update, and uninstall commands. Correct grammar and make the surrounding explanations concise. Do not add new commands, runtime claims, or unrelated badges.

- [ ] **Step 3: Add the Tiny-PM workflow criteria section**

  Add a `## Tiny-PM workflow criteria` section after Usage with these six points, using concise prose:

  ```md
  - Defines a clear, observable goal before work begins
  - Keeps changes focused, surgical, and easy to review
  - Makes assumptions, trade-offs, and uncertainty visible
  - Uses explicit approval boundaries for risky or high-impact work
  - Tracks multi-step work with milestone checkpoints
  - Verifies the requested outcome before claiming completion
  ```

  Introduce the list as the practical value of Tiny-PM, without copying the full skill file.

- [ ] **Step 4: Add the final license section**

  Make this the final README section:

  ```md
  ## License

  MIT © 2026 Hoang Thai. See [LICENSE](./LICENSE).
  ```

- [ ] **Step 5: Check README-specific acceptance criteria**

  Run:

  ```bash
  rg -n 'tiny-workers-command-center\.svg|npmjs\.com/package/@hoangthai2171/tiny-workers|Tiny-PM workflow criteria|## License|\[LICENSE\]' README.md
  git diff --check
  ```

  Expected: the banner, exact npm URL, workflow section, and license link each appear; no whitespace errors are reported; `## License` is the final section.

- [ ] **Step 6: Commit the README redesign**

  ```bash
  git add README.md
  git commit -m "docs: polish Tiny-Workers README"
  ```

### Task 3: Include the banner asset in the npm package

**Files:**
- Modify: `package.json: files array`
- Test: `npm run pack:check`

**Interfaces:**
- Consumes: `assets/tiny-workers-command-center.svg` from Task 1 and the README reference from Task 2.
- Produces: package metadata that includes the banner when npm creates the tarball.

- [ ] **Step 1: Add the assets directory to the published file list**

  Insert `"assets"` after `"skills"` in the existing `files` array, preserving the current order and all other package metadata:

  ```json
  "files": [
    "bin",
    "src",
    "skills",
    "assets",
    "README.md",
    "LICENSE",
    "package.json"
  ]
  ```

- [ ] **Step 2: Validate the package manifest and dry-run contents**

  Run:

  ```bash
  npm run pack:check
  ```

  Expected: the dry-run output lists `assets/tiny-workers-command-center.svg` and completes successfully.

- [ ] **Step 3: Commit the packaging metadata**

  ```bash
  git add package.json
  git commit -m "build: include README assets in npm package"
  ```

### Task 4: Run final documentation and package verification

**Files:**
- Test: repository working tree, README, SVG, package archive, and existing Node test suite

**Interfaces:**
- Consumes: the committed results of Tasks 1–3.
- Produces: evidence that the requested README experience is complete and the package remains healthy.

- [ ] **Step 1: Run the existing test suite**

  ```bash
  npm test
  ```

  Expected: all existing Node tests pass.

- [ ] **Step 2: Re-run the package dry run**

  ```bash
  npm run pack:check
  ```

  Expected: npm package creation succeeds and includes the README and local SVG asset.

- [ ] **Step 3: Check the final diff and repository state**

  ```bash
  git diff --check
  git status --short --branch
  ```

  Expected: no whitespace errors and no unexpected untracked or modified files remain.

- [ ] **Step 4: Report verification evidence**

  Report the exact results of `npm test`, `npm run pack:check`, and `git diff --check`, and identify any check that could not run with its reason. Do not claim completion without evidence from these commands.
