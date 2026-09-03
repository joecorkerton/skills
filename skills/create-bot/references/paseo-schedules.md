# Paseo scheduling adapter

Read this only for bots that need recurring execution. The canonical product documentation is [Paseo schedules](https://paseo.sh/docs/schedules) and [Paseo schedule CLI](https://paseo.sh/docs/schedules-cli); check it again before deployment because CLI details can change.

Paseo stores schedules in its daemon rather than activating a repository configuration file. Keep provider-neutral intent in the bot repository's `operations/schedule.md`; treat the Paseo schedule as a deployment of that intent.

## Choose the execution model

Use a **schedule** for a recurring bot run: each occurrence starts a fresh agent. Use a **heartbeat** only when one existing conversation must periodically reassess and continue. A durable bot that bootstraps from `AGENTS.md` and repository memory normally wants a schedule.

Each schedule needs:

- a five-field cron expression or a supported `--every` preset;
- an explicit IANA timezone for wall-clock schedules;
- a stable name, provider/model, and absolute working directory on the Paseo host;
- a self-contained run prompt;
- optional maximum-run or expiry limits for temporary automation.

`--every` compiles to cron; it is not a rolling interval anchored to creation time. Prefer `--cron` plus `--timezone` when local wall-clock behavior matters.

## Bootstrap prompt

Adapt this prompt so a fresh agent can run without conversation history:

```text
Open AGENTS.md and follow it as the operating contract. Read MEMORY.md and open only memories relevant to this run. Execute exactly one scheduled run for: <objective>. Respect approval boundaries; if approval is required, report the proposed action instead of performing it. Verify the result, persist durable memory according to AGENTS.md, and finish with actions taken, evidence, blockers, and next steps.
```

## Deploy

After checking current CLI help, create the schedule from the Paseo host:

```bash
paseo schedule create \
  --cron "<5-field-cron>" \
  --timezone <IANA-timezone> \
  --name <bot-name> \
  --provider <provider/model> \
  --cwd <absolute-path-to-bot-repo> \
  "<bootstrap-prompt>"
```

For simple cron-compatible cadences, `--every 30m` can replace `--cron`. Use `--run-now` only when an immediate first run is intended. Add `--max-runs` or `--expires-in` for bounded jobs.

Manage and verify with:

```bash
paseo schedule ls
paseo schedule inspect <id>
paseo schedule run-once <id>
paseo schedule logs <id>
paseo schedule pause <id>
paseo schedule resume <id>
paseo schedule delete <id>
```

Store host-specific schedule IDs outside git, such as in a gitignored `.paseo-schedule-id`. Record the human-meaningful schedule intent and deployment status in `operations/schedule.md`.

## Deployment checks

A deployment is complete when:

1. `inspect` shows the intended cron, timezone, provider, working directory, and prompt.
2. The working directory contains the bot's current default branch.
3. A manual or `run-once` execution obeys `AGENTS.md`, can read and persist memory, and can reach the configured external state system.
4. The bot reports failures through the destination named in its contract.
5. Repeated runs are idempotent or have an explicit duplicate-work guard.
