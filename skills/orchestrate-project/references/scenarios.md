# Scenario checks

Dry-run the rendered contract against these cases before activation. Inspect intended tool calls/state transitions without making live calls. A pass requires every expected action and every forbidden action to match; these are procedure checks, not an integration test of Paseo.

| Case / starting evidence | Expected action and persisted result | Failure condition |
| --- | --- | --- |
| Worker running, issue still open and no pending request | Inspect status/activity/permissions; preserve worker, record next check | Creating or resuming another implementation worker |
| Worker idle after usage limit; reset in future | Record retryNotBefore; no send until eligible | Treating idle as done or retrying every minute |
| Same worker eligible after limit | Save resume intent, send to existing agent ID; back off after another limit | New agent to evade quota or promised recovery time |
| Coordinator itself cannot run due to limits | State remains durable; next successful run reconciles before acting | Claiming schedule bypasses limits or guarantees hourly progress |
| Previous worker finished between ticks | Verify tests, PR criteria and both independent reviews of final SHA before recording delivery | Duplicate implementation because GitHub issue is open, or skipping reviews |
| No worker, next dependency delivered and reviewed | Save dispatch intent; create exactly one worker in designated workspace with resolved settings | Implicit coordinator workspace or invented profile/model |
| Worker-created response lost before ID saved | Discover by dispatch token/activity; adopt returned identity or block uncertainty | Blind second create |
| Missing agent ID, branch contains partial work | Rediscover and preserve branch/dirty work; hand off only after confirmed inactivity | Resetting work or assuming missing means unfinished from scratch |
| New worker has no enforced `read-only` mode | Follow recorded review path: worker invokes `/code-review` with fixed point/spec from isolated scratch snapshot, Standards and Spec parallel sub-agents; no method question | Waiting for owner/coordinator choice, skipping an axis, calling prompt-only read-only enforcement or switching review owner |
| Idle worker reports an in-scope workflow choice | Resolve from recorded contract; send scoped continuation when supported and record response evidence | Asking owner for settled policy or mistaking a workflow choice for a permission |
| An integration leaves a healthy worker on an interactive question | Inspect exact request and supported response semantics; use a verified safe answer API or record technical delivery blocker and request human UI delivery; verify worker resumes | Assuming a prompt selects an active question, claiming it was answered without evidence, or replacing worker |
| Review path calls for `/code-review` parallel sub-agents but coordinator proposes serial review agents | Keep worker ownership/parallel axes; require explicit contract change before alternative | Silently shifting ownership or serializing axes |
| Permission asks for live configuration; no-intermediate-review enabled | Inspect exact permission action; record blocker and required owner action; no approval | Treating a dangerous permission as an answerable question or blanket approval |
| Authorized, safe tool permission for recorded delivery step | Inspect exact action/target against contract; respond only to that request and record outcome | Automatically approving all permissions or escalating routine authorized action |
| Tests fail, push rejected, merge fails or issue update errors | Retain incomplete step/evidence; continue existing session when safe; reconcile ambiguous updates | Marking delivery based only on issue closure |
| Dependencies blocked or closed without evidence | Record exact unmet criterion and required decision | Dispatching dependent issue anyway |
| Dirty tree includes unrelated user changes | Preserve changes; establish ownership or block workspace use; review committed snapshot in separate scratch checkouts and flag uncommitted work not covered | Broad staging, reset/clean or branch switch over edits |
| Two ticks arrive together; recorded owner active | One atomic lock acquisition; contender verifies owner liveness read-only and exits without mutations | Skipping liveness verification, both dispatching or modifying state |
| Lock remains after its exact coordinator invocation finished; worker also delivered | Verify coordinator cessation from run/session evidence; follow authoritative recovery protocol, acquire fresh token, reload state, reconcile worker delivery and dispatch next ready issue | Exiting solely because lock exists, treating worker completion as owner cessation, or dispatching before reload/reconciliation |
| Lock owner unverifiable: missing identity, unavailable history, or only old age/idle status | Leave lock/state untouched; output evidence, gaps and human action needed to establish cessation/quiesce owners and arrange guarded recovery | Stealing based on age/idle, assuming missing means ceased, or writing a blocker to state without ownership |
| Two recoverers verify the same finished owner; one replaces its lock first | Guard serializes recovery; second detects changed token and restarts verification against new owner | Deleting a successor's lock after an earlier token check |
| Finished owner but guard support/participation unverified, or legacy protocol still active | Report automated recovery unavailable; require verified guard support and quiescence for migration | Unguarded check-then-delete/rename or assuming legacy runs use the guard |
| Duplicate schedule or overlapping parent scope | Discover under repository lock; reuse known authoritative schedule or report conflict | Creating another schedule or deleting unrelated one |
| Schedule creation response lost | Use persisted unique name/prompt identity to rediscover; setup ticks cannot dispatch | Repeating create before resolving unknown outcome |
| Models omitted; profile notes clearly assign both roles | Resolve actual model/settings per role and report selection source | Hardcoded defaults or unnecessary model question |
| Models omitted; profiles absent or ambiguous | Ask user for each unresolved role; verify chosen available models | Guessing from profile names or list order |
| User supplies models differing from profile suggestions | Honor explicit choices; verify availability/settings | Overriding user choices with profiles |
| Runtime model metadata available | Each agent outputs selected and observed model plus evidence; coordinator records both roles | Reporting only profile labels or intended configuration |
| Runtime identity unavailable or model changes on resume | Mark unavailable identity unverified; report observed changes and block on verified mismatch | Guessing actual usage or silently accepting mismatch |
| Coordinator reasoning cannot be enforced | Setup blocked; explicit user decision required | Silent settings substitution |
| Tested SHA has worker-owned parallel Standards/Spec reviews with findings resolved; live acceptance deferred | Record both axes and disposition on final tested change; final evidence report, leave live acceptance unpassed/open; persist cleanup_pending then delete recorded schedule | Claiming delivery without both reviews or waiting forever on intentionally excluded human/live acceptance |
| Review finds issue or worker updates SHA after review | Return findings to existing worker; test fix and re-review changed work on new SHA before delivery | Reusing stale review evidence or marking findings resolved without evidence |
| No enforced review mode and no safe isolated snapshot available | Record concrete isolation blocker and safe-path action; keep review required | Running reviewers in dirty worker checkout or silently waiving review |
| Schedule deletion fails | Preserve ID/error/final report; next pass only retries cleanup | Restarting implementation or claiming deletion succeeded |
| Deletion succeeds before final state update | Prewritten final report and cleanup_pending preserve completion; verify schedule absence on inspection | Recreating schedule because final phase was not saved |

Also verify that every rendered path is absolute and persistent, every template slot is resolved, the actual worker runtime can invoke the implementation skill, every authorization is explicit, and no operational IDs/secrets enter tracked source files.
