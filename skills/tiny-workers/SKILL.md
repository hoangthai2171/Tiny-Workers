---
name: tiny-workers
description: "Coordinate the Tiny-Workers project workflow by invoking Tiny-PM first and routing work to Tiny-Planner for approval-ready plan creation or Tiny-Executor for approved-plan implementation. Use when the user explicitly invokes $tiny-workers or asks to apply the Tiny-Workers workflow."
---

# Tiny-Workers Dispatcher

## Operating rule

Invoke `$tiny-pm` immediately and keep it in control of planning, execution, approvals, choices, risk, milestones, and verification.

Tiny-Workers is the dispatcher, not a second project manager. Do not bypass Tiny-PM by directly implementing work that needs a plan or approval.

## Routing

- If the request needs a multi-step or meaningful-risk change, Tiny-PM invokes `$tiny-planner`.
- If an implementation plan is awaiting approval, pause for review and approval.
- If an implementation plan is approved or in progress, Tiny-PM invokes `$tiny-executor`.
- If the request is a small, clear, reversible task, Tiny-PM may manage it directly.

The normal order is:

`Tiny-Workers → Tiny-PM → Tiny-Planner → approval → Tiny-Executor → Tiny-PM handoff`

Use only the focused skill needed for the current phase. Keep the plan document's status block and verification evidence as the shared source of truth.

## Native Codex task-plan panel

When running in Codex and the native `update_plan` tool is available, preserve the task plan/progress panel for every approved or in-progress multi-step plan:

- Tiny-PM initializes the panel when execution begins; Tiny-Executor keeps it synchronized through the milestone checkpoints.
- Mirror the plan's numbered milestones in the same order using the tool's `pending`, `in_progress`, and `completed` statuses.
- Keep the Markdown plan's status block and `Completed Verification` section as the durable source of truth. The native panel is a live UI projection, not a replacement.
- Do not substitute a prose checklist or raw Markdown for a successful `update_plan` call. If the host does not expose the tool, continue with the canonical plan and state that the native panel could not be updated.
