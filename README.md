# Tiny-Workers

Tiny-Workers is a personal collection of Codex skills that I use everyday. It focus on simple and straight-to-the-pointtniop work flow that help simplify the control of your Agents when working. It focus on making plans and giving choices for a smoother work.

## Included skills

- **Tiny-PM** (`tiny-pm`) — a disciplined coding and project-workflow skill for scoped changes, approvals, milestones, sandbox escalation, parallel-work choices, and verification.
- **Tiny-Workers** (`tiny-workers`) — a dispatcher that invokes Tiny-PM and will coordinate other Tiny-Workers skills as the collection grows.

## Layout

```text
skills/
  tiny-pm/
  tiny-workers/
```

Each skill folder contains a required `SKILL.md` and optional `agents/openai.yaml` UI metadata.

## Install locally

Copy the desired skill folders into your Codex user skills directory:

```bash
mkdir -p ~/.codex/skills
cp -R skills/tiny-pm ~/.codex/skills/
cp -R skills/tiny-workers ~/.codex/skills/
```

Codex normally detects local skill changes automatically. Restart Codex if a newly installed skill does not appear.

## Use

- Invoke the collection dispatcher with `$tiny-workers`; it applies Tiny-PM first and can route to future Tiny-Workers skills.

Use lowercase identifiers exactly as shown. Slash commands do not invoke skills; use the `$` form.

## Add a skill

1. Create `skills/<skill-name>/SKILL.md` with valid `name` and `description` frontmatter.
2. Add `agents/openai.yaml` when the skill needs UI metadata.
3. Validate the folder with `quick_validate.py` from the Codex `skill-creator` tools.
4. Add the skill to this README and install its folder into `~/.codex/skills`.

The Git repository is the source of truth. After updating a skill here, copy the revised folder into `~/.codex/skills` to update the local installation.
