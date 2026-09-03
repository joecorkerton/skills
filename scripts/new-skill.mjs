import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const [name, ...extra] = process.argv.slice(2);
const validName = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

if (!name || extra.length > 0) {
  console.error("Usage: npm run new -- <skill-name>");
  process.exit(1);
}

if (name.length > 64 || !validName.test(name)) {
  console.error(
    "Skill names must be 1-64 characters using lowercase letters, numbers, and single hyphens.",
  );
  process.exit(1);
}

const skillDirectory = path.resolve("skills", name);
if (existsSync(skillDirectory)) {
  console.error(`Skill already exists: skills/${name}`);
  process.exit(1);
}

const title = name
  .split("-")
  .map((word) => word[0].toUpperCase() + word.slice(1))
  .join(" ");

const skill = `---
name: ${name}
description: TODO: Describe what this skill does and the situations that should trigger it.
---

# ${title}

## Process

1. Replace this template with the steps the agent should follow.
2. Give every step a clear completion criterion.

## Reference

Add only reference material needed on every run. Put optional detail in focused files under \`references/\` and link to them here.
`;

await mkdir(skillDirectory, { recursive: true });
await writeFile(path.join(skillDirectory, "SKILL.md"), skill);

console.log(`Created skills/${name}/SKILL.md`);
console.log("Finish the description and instructions, then run npm test.");
