# Durable state and mutual exclusion

Use one canonical key: normalized GitHub host/owner/repo plus parent issue identity. Discover overlapping scopes even when parent identities differ. Store operational state outside tracked files, following repo conventions; a persistent host-local directory is sufficient for a single-host Paseo deployment. All coordinators, including duplicate schedules, must use the same absolute directory. If runners cannot share it reliably, require a transactional shared store/lock before activation.

## Lock protocol

Use an atomic filesystem `mkdir` for a per-repository lock in the shared operational-state root. Repository-wide exclusion also serializes setup for intersecting series. Hold it for the entire bounded coordinator pass, including external mutations; never wait under it for implementation to finish. Workers do not acquire this coordinator lock or write its state. They report through their sessions and git/PR evidence.

1. Attempt atomic creation; on success write owner metadata (unique token, coordinator agent/run identity, host, start time). The setup agent follows this same protocol.
2. If it exists, exit without mutation. Age alone is not evidence a lock is abandoned. Recover only after positively establishing that the owner cannot still act (terminal/cancelled run with confirmed cessation); idle between tool calls is insufficient. Missing owner metadata, unavailable status or uncertain liveness requires human recovery. Never steal on a timer. This favors safety over unattended availability after ambiguous crashes.
3. Only the owner may update state. Write a temporary file in the same directory and atomically rename it over state; increment revision. Release the lock only after verifying the owner token. On normal errors persist the blocker and release; on abrupt loss leave the lock for verified recovery.

A second run must reload state after acquiring the lock. Keep setup and all orchestration for this repository on the same host/root; otherwise this protocol provides no exclusion. Reconcile externally created schedules/workers on every pass, since they may not obey the lock.

## Minimal record

A single JSON record plus rendered prompts and a final report is enough. Paths must survive coordinator termination. No credentials or full transcripts. Fields below form the format; nullable values distinguish unknown from verified absence.

```json
{
  "version": 1,
  "revision": 1,
  "project": "github.com/example/widgets#40",
  "repo": "example/widgets",
  "parent": 40,
  "checkout": "/srv/widgets",
  "workspaceId": "resolved-at-setup",
  "phase": "setup",
  "schedule": {"id": null, "name": "orchestrate-example-widgets-40", "cron": "0 * * * *", "timezone": "Etc/UTC"},
  "profiles": {"coordinator": null, "worker": null},
  "implementationSkill": {"invocation": "/skill:implement", "path": null, "verified": false},
  "permissions": {"commit": true, "push": true, "merge": false, "closeIssues": true},
  "safety": ["No live configuration application", "Preserve unrelated user changes"],
  "issues": [
    {"number": 41, "dependsOn": [], "acceptance": "Parser behavior tested", "delivery": "Commit pushed to agreed feature branch", "status": "pending", "evidence": []},
    {"number": 42, "dependsOn": [41], "acceptance": "CLI uses parser; integration tests pass", "delivery": "Commit pushed to agreed feature branch", "status": "pending", "evidence": []}
  ],
  "deferred": [{"issue": 43, "check": "Human live-environment acceptance", "status": "not_run", "keepOpen": true}],
  "workers": [],
  "intent": null,
  "blockers": [],
  "lastRun": null,
  "nextAction": "Resolve profiles and verify deployment prerequisites",
  "finalReport": null
}
```

This is a worked, **unactivated** example, not deployable defaults. Parent #40 contains implementation #41 → #42 and deferred acceptance #43. With user approval, pushed feature-branch commits count as implementation delivery; merging and live acceptance do not. After evidence for #41, delegate #42. After #42 delivery, report #43 as outstanding and leave it and the parent open if their acceptance requires it; retire the implementation schedule. Other projects may require merged PRs instead—record that before starting.

Replace null profiles with resolved choice snapshots containing provider/model, modeId, thinkingOptionId and featureValues, plus selection source (explicit user choice or unambiguous profile notes) and profile name when used. A named profile is optional. Record verified effective schedule settings. Keep selected configuration separate from observed model usage: record role, agent ID, timestamp, observed provider/model/settings, verification source and verification status in lastRun and worker entries. Use null observed values when unavailable; retain observations of model changes and summarize models actually used in the final report. Record branch/base, issue URLs, detailed acceptance and safe test commands where needed in the contract beside state. Permissions shown here require confirmation.

Each worker ledger entry contains issue, agentId (nullable during creation), dispatch token, workspace/branch, observed status/time, last action/time, retryNotBefore, attempt count and concise delivery evidence. Retain completed entries so late completion cannot cause duplicate delegation. Evidence includes test command/result and tested commit, pushed remote SHA, PR/merge references when required, and GitHub update results.

`intent` records pending schedule-create, worker-create, resume or delivery-update operations **before** their external call. Clear it only after reconciling the result. Persist returned IDs immediately. Lost responses are unknown outcomes, not failures to retry blindly. Missing/stale IDs require rediscovery and git/PR inspection; if absence cannot be established, block. Replacing a permanently unavailable worker requires verified inactivity and a handoff preserving existing commits, branches and dirty work.

Use phases `setup`, `running`, `blocked`, `cleanup_pending`, `complete`. A blocked phase may resume only after its blocker is resolved; `cleanup_pending` and `complete` prohibit new implementation. Store blockers with evidence and the exact needed decision/action. Store finalReport before schedule deletion; if deletion fails retain its ID and nextAction for cleanup retry. If the schedule is already absent, verify absence before marking complete.
