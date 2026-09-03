# Repository guidance

Read [CONTRIBUTING.md](CONTRIBUTING.md) before creating or changing a skill.

- Put each installable skill at `skills/<name>/SKILL.md`; keep the layout flat.
- Create a scaffold with `npm run new -- <name>` rather than copying an existing skill.
- Make each `description` state what the skill does and the situations that trigger it.
- Keep optional detail beside the skill under `references/`, `scripts/`, or `assets/` and link it from `SKILL.md` only where needed.
- Run `npm test` before finishing. A change is complete only when every skill validates.
