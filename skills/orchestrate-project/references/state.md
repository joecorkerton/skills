# Durable state and mutual exclusion

Use one canonical key: normalized GitHub host/owner/repo plus parent issue identity. Discover overlapping scopes even when parent identities differ. Store operational state outside tracked files, following repo conventions; a persistent host-local directory is sufficient for a single-host Paseo deployment. All coordinators, including duplicate schedules, must use the same absolute directory. If runners cannot share it reliably, require a transactional shared store/lock before activation.

## Lock protocol

This is the authoritative procedure for acquisition, contention and recovery; deploy a durable copy with the coordinator prompt.

Use an atomic filesystem `mkdir` for a per-repository `repo.lock` in the shared operational-state root. Repository-wide exclusion also serializes setup for intersecting series. Hold it for the entire bounded coordinator pass, including external mutations; never wait under it for implementation to finish. Workers do not acquire this coordinator lock or write its state. They report through their sessions and git/PR evidence.

### Acquisition and release

Serialize every lock creation, owner-metadata publication, release and recovery with a short-lived OS advisory guard on a separate, persistent `repo.lock.guard` file. Record the supported helper/command and absolute paths at setup (for example, a helper using `flock` where available). The helper holds the guard across the entire critical section in one process; separate tool calls do not retain it. Never unlink/replace the guard file. The OS releases the guard when its holder exits. All setup agents and coordinators must use this same guard; if support or participation cannot be verified, automated recovery is unavailable. Quiesce legacy runs before migrating their protocol.

1. Under the guard, attempt atomic `mkdir`. On success, atomically publish immutable owner metadata: fresh unique token, canonical repository identity, host and runtime/daemon identity, coordinator agent/session ID, exact invocation/run ID (and schedule ID for scheduled runs), start time, and the evidence source used to look up that invocation. An equivalent immutable invocation identifier is acceptable if the runtime has no run ID; agent ID or PID alone is not. Record unavailable identity explicitly: such a lock cannot be automatically recovered. The setup agent follows this same protocol. Release the guard once metadata is published, or immediately on contention.
2. After acquisition, reload state before acting and verify ownership/contract identities. Only the `repo.lock` holder may mutate coordinator state or perform orchestration mutations. Write a temporary state file in the same directory and atomically rename it over state; increment revision.
3. On normal exit, including handled errors, persist status/blockers under the lock. Under the guard, verify the token still matches before removing owner metadata and the empty lock directory. A mismatch leaves the lock untouched and is reported. Abrupt loss leaves the lock for the procedure below.

### Contention and stale-lock recovery

An existing `repo.lock` starts **read-only liveness verification**, not an immediate exit. Snapshot its owner metadata/token and inspect evidence for that exact owner invocation: schedule history/logs, agent status/activity and runtime/session evidence as available. A finished worker is not evidence that its coordinator finished. Classify the result:

- **Owner still active:** exit without mutations; report the owner and evidence.
- **Owner conclusively ceased:** authoritative evidence establishes that the recorded invocation finished or was terminated, cannot resume with that token, and has no in-flight mutating calls/processes. A cancellation request alone is insufficient. Proceed with recovery below.
- **Identity missing or cessation uncertain:** leave the lock and coordinator state untouched. Report the token/identity available, evidence checked, gaps and required human action in the run output (or configured reporting destination), not the ledger. Ask the operator to establish cessation/quiesce possible owners and arrange guarded recovery. Age, an idle/error status alone, absence from a recent agent list, or unavailable history is not proof. Automated recovery is unavailable without verifiable identity.

For conclusively ceased owners only:

1. Acquire the same advisory guard used by acquisition/release. Re-read `repo.lock` metadata and compare its token and owner identity with the verified snapshot. If absent or changed, release the guard and restart acquisition/liveness verification; the earlier evidence does not authorize touching a successor's lock.
2. With the guard still held and the same token verified, remove only that lock's metadata and empty directory, then atomically `mkdir` a new `repo.lock` and publish your fresh token/identity. Unexpected contents or any failure blocks further action; report the exact condition rather than recursively deleting. Holding the guard throughout prevents another recoverer or acquirer from slipping between the comparison and replacement. A token check followed by unguarded deletion/rename is not safe recovery.
3. Release the guard, reload state under the newly acquired repository lock, and reconcile schedules, workers and unresolved intents before dispatching. Persist recovery evidence with the next atomic state update. Recovery grants no permission to skip reconciliation or repeat ambiguous external calls.

Keep setup and all orchestration for this repository on the same host/root; otherwise this protocol provides no exclusion. Reconcile externally created schedules/workers on every pass, since they may not obey the lock.

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
  "reviews": [],
  "intent": null,
  "blockers": [],
  "lastRun": null,
  "nextAction": "Resolve profiles and verify deployment prerequisites",
  "finalReport": null
}
```

This is a worked, **unactivated** example, not deployable defaults. Parent #40 contains implementation #41 → #42 and deferred acceptance #43. With user approval, pushed feature-branch commits count as implementation delivery; merging and live acceptance do not. After evidence for #41, delegate #42. After #42 delivery, report #43 as outstanding and leave it and the parent open if their acceptance requires it; retire the implementation schedule. Other projects may require merged PRs instead—record that before starting.

Replace null profiles with resolved choice snapshots containing provider/model, modeId, thinkingOptionId and featureValues, plus selection source (explicit user choice or unambiguous profile notes) and profile name when used. A named profile is optional. Record verified effective schedule settings. Keep selected configuration separate from observed model usage: record role, agent ID, timestamp, observed provider/model/settings, verification source and verification status in lastRun and worker entries. Use null observed values when unavailable; retain observations of model changes and summarize models actually used in the final report. Record branch/base, issue URLs, detailed acceptance and safe test commands where needed in the contract beside state. Permissions shown here require confirmation.

Each worker ledger entry contains issue, agentId (nullable during creation), dispatch token, workspace/branch, observed status/time, last action/time, retryNotBefore, attempt count and concise delivery evidence. Record pending question/permission IDs, exact requested choice/action, classification, recommended answer or escalation, actual response evidence (or human UI action still needed) and next action; do not mistake a running worker awaiting a question for unblocked progress. Retain completed entries so late completion cannot cause duplicate delegation. Evidence includes test command/result and tested commit, pushed remote SHA, PR/merge references when required, and GitHub update results.

`reviews` records the agreed review owner/path, fixed point and spec source, isolated scratch snapshot, tested SHA, both parallel axes' status/findings and disposition (sub-agent IDs/workspaces if exposed). Both axes need evidence on the final tested change before delivery; if the SHA changes, re-review the changed work. `intent` records pending schedule-create, worker-create, authorized review-create, resume or delivery-update operations **before** their external call. Clear it only after reconciling the result. Persist returned IDs immediately. Lost responses are unknown outcomes, not failures to retry blindly. Missing/stale IDs require rediscovery and git/PR inspection; if absence cannot be established, block. Replacing a permanently unavailable worker requires verified inactivity and a handoff preserving existing commits, branches and dirty work.

Use phases `setup`, `running`, `blocked`, `cleanup_pending`, `complete`. A blocked phase may resume only after its blocker is resolved; `cleanup_pending` and `complete` prohibit new implementation. Store blockers with evidence and the exact needed decision/action. Store finalReport before schedule deletion; if deletion fails retain its ID and nextAction for cleanup retry. If the schedule is already absent, verify absence before marking complete.
