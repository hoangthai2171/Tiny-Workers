# Update Tiny-PM Clarification Guidance

**Status:** Complete

- [x] Step 1: Establish a baseline for vague-request handling under pressure.
- [x] Step 2: Add concise clarification guidance to both Tiny-PM copies.
- [x] Step 3: Validate structure, synchronization, and behavior; report the milestone.

## Goal

Teach Tiny-PM to recognize when a request is underspecified, think through the missing dimensions that could change the outcome, ask targeted clarification questions, and wait for answers before making a plan—without interrogating simple, well-specified requests.

## Plan

1. Run a read-only baseline pressure check against the current skill so the new wording addresses an observed gap.
2. Make the smallest synchronized edit to:
   - `/Users/thainguyen/.codex/skills/tiny-pm/SKILL.md`
   - `/Users/thainguyen/Documents/Works/Personal/Tiny-Workers/skills/tiny-pm/SKILL.md`
3. Validate both skill folders, compare the two `SKILL.md` files for exact parity, and run a post-edit pressure check that confirms clarification precedes planning when material ambiguity remains.

## Baseline Findings

The current skill correctly pauses for basic scope and success-criterion questions under urgency and “do not ask” pressure. It does not explicitly instruct the agent to proactively inspect hidden dimensions of a short request or to separate material clarifications from questions that would not change the work. The update will target that gap without weakening the existing approval gates.

## Verification Evidence

- `quick_validate.py` passed for both skill folders.
- `cmp` confirmed both `SKILL.md` files are byte-identical.
- Post-edit pressure scenarios asked focused questions before planning under urgency and “do the obvious thing” pressure.
- A clear, low-risk typo-fix request proceeded without unnecessary clarification questions.
- `agents/openai.yaml` remained synchronized; no metadata regeneration was needed.

## Success Criteria

- Vague or goal-obscuring requests trigger targeted questions before planning.
- Questions cover only ambiguities that could materially change scope, outcome, audience, constraints, or acceptance criteria.
- Clear, low-risk requests can proceed without unnecessary interrogation.
- Both copies are valid and identical.
