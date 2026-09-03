# Skills

Reusable agent skills for coding assistants that support the [Agent Skills specification](https://agentskills.io/specification).

## Install

List the skills available in this repository:

```bash
npx skills add joecorkerton/skills --list
```

Install interactively:

```bash
npx skills add joecorkerton/skills
```

Install one skill globally and non-interactively:

```bash
npx skills add joecorkerton/skills --skill <skill-name> --global --yes
```

The CLI detects supported agents on the machine and installs to the selected agent directories. Run `npx skills update --global` later to update globally installed skills.

## Create a skill

Requires Node.js 20 or newer.

```bash
npm install
npm run new -- my-skill
```

Edit `skills/my-skill/SKILL.md`, replace every placeholder, and validate the repository:

```bash
npm test
```

Commit and push the skill. It can then be installed with:

```bash
npx skills add joecorkerton/skills --skill my-skill
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the format and writing guidance.

## Layout

```text
skills/
  <skill-name>/
    SKILL.md
    assets/       # optional static resources
    references/   # optional on-demand documentation
    scripts/      # optional executable helpers
```
