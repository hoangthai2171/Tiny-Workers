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
