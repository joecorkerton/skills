import { access, readFile, readdir } from "node:fs/promises";
import { constants } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDirectory, "..");
const skillsDirectory = path.join(root, "skills");
const entries = await readdir(skillsDirectory, { withFileTypes: true });
const skillDirectories = entries
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
  .sort((left, right) => left.name.localeCompare(right.name));

if (skillDirectories.length === 0) {
  console.log("No skills yet. Create one with: npm run new -- <skill-name>");
  process.exit(0);
}

const cli = path.join(
  root,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "skills.cmd" : "skills",
);

try {
  await access(cli, constants.X_OK);
} catch {
  console.error("Dependencies are missing. Run npm install first.");
  process.exit(1);
}

let failed = false;

for (const entry of skillDirectories) {
  const directory = path.join(skillsDirectory, entry.name);
  const skillFile = path.join(directory, "SKILL.md");
  let contents;

  try {
    contents = await readFile(skillFile, "utf8");
  } catch {
    console.error(`✗ skills/${entry.name}: missing SKILL.md`);
    failed = true;
    continue;
  }

  if (contents.includes("description: TODO:")) {
    console.error(`✗ skills/${entry.name}: replace the placeholder description`);
    failed = true;
    continue;
  }

  const result = spawnSync(cli, ["add", directory, "--list"], {
    cwd: root,
    encoding: "utf8",
    env: {
      ...process.env,
      CI: "1",
      NO_COLOR: "1",
      DISABLE_TELEMETRY: "1",
    },
  });

  if (result.status !== 0) {
    console.error(`✗ skills/${entry.name}: invalid skill`);
    process.stderr.write(result.stderr || result.stdout);
    failed = true;
    continue;
  }

  console.log(`✓ skills/${entry.name}`);
}

if (failed) {
  process.exit(1);
}
