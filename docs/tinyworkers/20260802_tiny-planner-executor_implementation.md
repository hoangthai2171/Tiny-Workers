# Tiny Planner and Executor Implementation Plan

> **For agentic workers:** Use the Tiny-PM workflow and execute this plan task-by-task with milestone checkpoints.

**Status:** Complete

- [x] Step 1: Define and validate the new skill structure
- [x] Step 2: Write Tiny-Planner and Tiny-Executor
- [x] Step 3: Refactor Tiny-PM and Tiny-Workers coordination
- [x] Step 4: Update installer metadata and documentation
- [x] Step 5: Run validation and package checks

**Goal:** Add reusable Tiny-Planner and Tiny-Executor skills, make Tiny-PM the project-management authority, and package the complete workflow for supported agents.

**Architecture:** Tiny-Planner produces evidence-based, approval-ready implementation plans. Tiny-Executor executes only approved plans, updates plan evidence, and pauses on scope or risk changes. Tiny-PM owns authority, approvals, risk classification, milestone checkpoints, and final handoff; Tiny-Workers dispatches the coordinated workflow.

**Tech Stack:** Markdown skill instructions, YAML agent metadata, Node.js ESM installer, npm package validation.

## Global Constraints

- Preserve the existing supported-agent installer behavior and transactional replacement semantics.
- Keep skills concise, imperative, and under the skill context limits.
- Do not duplicate authority rules across skills; Tiny-PM remains the source of truth for approvals and safety.
- Do not add scripts or dependencies unless validation demonstrates a deterministic need.
- Preserve unrelated user changes and do not discard existing working-tree content.

## Findings and Decisions

- The installer currently packages only `tiny-pm` and `tiny-workers`; `src/skill-operations.mjs` owns this list.
- Existing Tiny-PM combines project management and execution guidance; execution-specific instructions will move into Tiny-Executor while Tiny-PM retains governance.
- The repository had no dedicated automated test files, so a focused installer regression test was added for the four-skill packaging contract.
- New skills will be created through the repository-compatible `init_skill.py` scaffolding flow, then replaced with focused content.

## File Impact

### `skills/tiny-planner/SKILL.md`

Create the planning workflow, plan schema, readiness gate, evidence requirements, and handoff boundary to Tiny-PM.

### `skills/tiny-planner/agents/openai.yaml`

Create UI metadata and a default prompt that triggers planning only.

### `skills/tiny-executor/SKILL.md`

Create the approved-plan execution loop, preflight, milestone handling, deviation protocol, verification logging, and completion rules.

### `skills/tiny-executor/agents/openai.yaml`

Create UI metadata and a default prompt that triggers execution only.

### `skills/tiny-pm/SKILL.md`

Refactor the skill into the project-management authority: lifecycle, scope control, authorization, risk/approval policy, milestone governance, delegation, and final handoff.

### `skills/tiny-pm/agents/openai.yaml`

Update the display metadata to describe project-management coordination rather than generic coding workflows.

### `skills/tiny-workers/SKILL.md`

Update dispatcher instructions to activate Tiny-PM first and delegate planning or execution to the appropriate subordinate skill.

### `skills/tiny-workers/agents/openai.yaml`

Update the dispatcher prompt to mention the complete Tiny-Workers workflow.

### `src/skill-operations.mjs`

Include all four skills in source validation, transactional installation, update, and uninstall operations.

### `README.md`

Document the four-skill architecture, lifecycle, and installer behavior.

### `docs/tinyworkers/20260802_tiny-planner-executor_implementation.md`

Track implementation progress, verification evidence, and any approved deviations.

### `test/skill-operations.test.mjs`

Verify that installation copies all four packaged skills and preserves the transactional installer result.

## Execution Sequence

### Step 1 — Define and validate the new skill structure

Create both skill directories using the standard scaffold, confirm their required files exist, and preserve only the resources needed for instruction and agent metadata.

**Verification:** Inspect both directories and run the skill validator against each scaffold.

### Step 2 — Write Tiny-Planner and Tiny-Executor

Replace scaffold placeholders with the finalized workflows. Ensure each skill has a clear trigger description, explicit boundaries, controlled status vocabulary, and concrete output requirements.

**Verification:** Run frontmatter validation and inspect the rendered Markdown structure for unresolved placeholders or conflicting ownership rules.

### Step 3 — Refactor Tiny-PM and Tiny-Workers coordination

Remove duplicated execution mechanics from Tiny-PM, retain governance and approval rules, and make Tiny-Workers dispatch the subordinate skills without bypassing Tiny-PM.

**Verification:** Search for duplicated or contradictory ownership language and validate all four skill folders.

### Step 4 — Update installer metadata and documentation

Update the packaged skill list, agent metadata, README architecture, usage, and uninstall/update descriptions.

**Verification:** Run npm tests and inspect installer source references for all four skill names.

### Step 5 — Run validation and package checks

Run the complete repository checks, skill validators, and npm package dry-run. Record actual results in this plan and mark completed steps.

**Verification:** `npm test`, `npm run pack:check`, and all applicable skill validation commands pass.

## Completed Verification

- Step 1: `quick_validate.py` passed for `tiny-pm`, `tiny-planner`, `tiny-executor`, and `tiny-workers`.
- Step 2: New skill frontmatter validated; scaffold placeholders removed from the two new skills.
- Step 3: Ownership and routing scan confirms Tiny-PM governs while Planner and Executor own their focused phases.
- Step 4: `node --check` passed for `src/skill-operations.mjs` and `bin/tiny-workers.mjs`.
- Step 5: The installer regression test first failed against the old two-skill list, then passed after restoring the four-skill list. `npm test` passed with 2 tests and 0 failures, covering install, update, uninstall, and actual skill metadata. `npm run pack:check` passed using `npm_config_cache=/private/tmp/tiny-workers-npm-cache` and listed all four skill folders.

## Deviations and Plan Updates

- Added `test/skill-operations.test.mjs` after discovering that the repository had no automated coverage for the installer skill list; the test now covers actual skill metadata plus install, update, and uninstall behavior.
- Bumped the package version from `0.1.4` to `0.2.0` because the package now exposes two new public skills.

## Handoff and Completion

- Added `tiny-planner` and `tiny-executor` with agent metadata.
- Refactored Tiny-PM into the project-management control plane and updated Tiny-Workers routing.
- Updated installer packaging, README workflow documentation, and added installer regression coverage.
- Verification: all four skill validators, `node --check`, `npm test`, and `npm run pack:check` passed. The package dry-run used a task-local npm cache because the global cache is not writable in this environment.
