# Contributing

## Add a skill

1. Run `npm run new -- <skill-name>` from the repository root.
2. Replace the generated placeholders in `skills/<skill-name>/SKILL.md`.
3. Add optional resources inside that skill's directory.
4. Run `npm test` and fix every reported problem.

Keep the repository layout flat: every installable skill belongs at `skills/<skill-name>/SKILL.md`.

## Frontmatter

Every `SKILL.md` starts with YAML frontmatter containing:

- `name`: 1-64 lowercase letters, numbers, or single hyphens; it must match the parent directory.
- `description`: 1-1024 characters explaining both what the skill does and when an agent should use it.

The complete format is defined by the [Agent Skills specification](https://agentskills.io/specification).

## Writing guidance

- Treat the description as the skill's routing rule. Name concrete trigger situations and vocabulary.
- Write ordered actions with observable completion criteria.
- Keep instructions specific to this workflow; omit behavior a capable agent already follows.
- Keep `SKILL.md` focused. Move branch-specific detail into a directly linked file under `references/`.
- Keep scripts self-contained, executable, and explicit about dependencies and failures.
- Store templates and other static inputs under `assets/`.
- Use relative links from `SKILL.md` to files in the same skill directory.

A skill is ready when its placeholders are gone, `npm test` passes, and another agent can follow it without undocumented context.
