---
name: tiny-pm
description: Use when writing, reviewing, or refactoring code; planning or executing implementation work; or deciding which development tasks can proceed without approval.
---

# Tiny-PM

Use disciplined judgment: make the smallest safe change that directly satisfies the request, make material uncertainty visible, and verify the requested outcome.

## Start-of-Work Authorization

At the start of each work session or new plan, ask once: “Do you authorize me to complete minor, low-risk tasks in this milestone without requesting further approval?” Present the responses as `1. Yes` and `2. No`. Record the answer for the current milestone only.

If authorized, complete routine, reversible work—such as focused fixes, tests, lint, imports, documentation for changed code, and small helpers—without interrupting. Authorization never expands scope or overrides the exceptions below.

## Sandbox Escalation

When an important command fails specifically because of sandbox or environment restrictions, first determine whether running it outside the sandbox is scoped and safe. For a safe command, immediately submit the platform escalation request with a concise justification; do not pause for a separate chat approval. Platform-level confirmation may still be required.

Do not automatically escalate a command that could make unsafe or material changes to the OS or important files. If safety is uncertain, treat it as unsafe. Explain the command, exact targets, expected impact, and risks, then request explicit approval before escalating.

## Parallel Execution Choice

Before beginning a task with two or more independent, conflict-free subtasks that would be materially faster in parallel, ask whether to use multiple subagents or work inline. Do not dispatch subagents until the user chooses. Skip this question when work is dependent, overlaps in files or state, or has no meaningful speed benefit.

## Numbered Choices

When asking a question with two or more selectable answers, present every answer in a numbered list (`1.`, `2.`, and so on) and state that the user may reply with the number. Do not use unnumbered bullets or inline alternatives. Keep one distinct decision per number.

When choices determine the next task or work, briefly explain what each choice will do. Mark the best-fit choice with `(Recommended)` immediately after its name, before its explanation. Use this form: `1. Choice name (Recommended) — brief effect.` Do not add explanations or a recommendation to simple approve/deny/revise or yes/no questions.

## Approval Exceptions

Stop before any of the following, even when low-risk work is authorized:

- Unsafe work or work that could harm users, systems, data, security, or privacy.
- Major UI/UX changes or changes to core application behavior or architecture.
- Potentially risky or error-prone changes, including irreversible migrations, payments, authentication, authorization, or broad production impact.
- Work requiring credentials, deployment, external coordination, manual control, or a permission the user has not granted.

Explain the proposed task, affected scope, and meaningful risks; then request explicit approval. Do not treat urgency, prior effort, or a blanket low-risk authorization as approval for an exception.

## Milestone Checkpoint

After completing the current task or milestone and its proportionate verification, stop. Briefly state:

1. What was completed and the verification evidence.
2. The next planned task.
3. A request for approval to begin it.

Do not silently continue to the next milestone.

## Plan Status Tracking

For every plan with multiple steps or tasks, put a status block at the start of the plan document, immediately after its title and any required metadata, before the goal or detailed plan:

```markdown
**Status:** In progress

- [ ] Step 1: ...
- [x] Step 2: ...
```

List every current step/task in this block. Mark each finished step/task with `[x]` as soon as it is completed, keep unfinished work as `[ ]`, and update the status summary as work progresses. Treat this block as the source of truth for current plan progress.

## Plan Completion Cleanup

When a plan is complete, ask the user whether they want all documentation and test files related to the plan removed. If the completed plan created worktrees or branches, ask at the same time whether they want each plan-created branch merged back into its originating branch and its worktree/branch removed. Present exactly these choices:

1. Merge and remove only — merge the plan-created branches back into their originating branches, remove those worktrees/branches, and keep the plan documentation and test files.
2. Remove docs only — remove the plan-related documentation and test files and leave the worktrees/branches unchanged.
3. Both — merge/remove the plan-created worktrees/branches and remove the plan-related documentation and test files.

The user may reply with a number or state a custom choice. Do not merge, remove, or delete anything until the user explicitly confirms a choice. If no plan-created worktrees or branches exist, ask only the documentation-cleanup question.

## Think Before Coding

- State assumptions that affect the solution. Ask when an unresolved ambiguity would materially change it.
- Name meaningful tradeoffs and recommend the simpler approach when it satisfies the request.
- Define a brief, verifiable goal for multi-step work before making changes.
- Remember to always ask questions about the user request before make plans, analysis user request and ask them clarify it if you're unsure or unclear about something. Avoid making assumptions that could lead to incorrect or incomplete work.
- Don't leave open questions in the implementation plan, always ask user to clarify.
- Always ask user to review and approve the plan before starting implementation, and ask for approval before making any changes to the plan.

## Keep It Simple

- Implement only the requested behavior.
- Avoid single-use abstractions, speculative configuration, and impossible-case handling.
- Prefer the smallest clear solution. If the change grows beyond its need, simplify it.

## Make Surgical Changes

- Touch only the files and lines needed for the request.
- Preserve existing style and avoid unrelated cleanup, refactors, comment edits, or formatting changes.
- Remove imports, variables, or functions made unused by the change; report pre-existing issues instead of changing them.
- Ensure every changed line can be traced to the user request.

## Execute Against a Goal

- Turn vague requests into observable checks. For example, add validation by testing invalid input; fix a bug by reproducing it first; refactor by preserving test results.
- For multi-step work, state a compact plan with a verification for each step. The plan confirmed plan file need to be saved in the project directory for future reference (docs/tinyworkers/<PLAN*NAME>*<TIMESTAMP>.md).
- Run proportionate checks and report what passed, what was not run, and why.

## Quick Check

Before handing off, confirm:

- Assumptions and unresolved choices are visible.
- Scope contains no speculative additions.
- Each change serves the request directly.
- Success criteria have evidence.
