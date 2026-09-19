# Scenario checks

Dry-run the rendered contract against these cases before activation. Inspect intended tool calls/state transitions without making live calls. A pass requires every expected action and every forbidden action to match; these are procedure checks, not an integration test of Paseo.

| Case / starting evidence | Expected action and persisted result | Failure condition |
| --- | --- | --- |
| Worker running, issue still open | Inspect status/activity; preserve worker, record next check | Creating or resuming another worker |
| Worker idle after usage limit; reset in future | Record retryNotBefore; no send until eligible | Treating idle as done or retrying every minute |
| Same worker eligible after limit | Save resume intent, send to existing agent ID; back off after another limit | New agent to evade quota or promised recovery time |
| Coordinator itself cannot run due to limits | State remains durable; next successful run reconciles before acting | Claiming schedule bypasses limits or guarantees hourly progress |
| Previous worker finished between ticks | Verify tests against delivered SHA and PR criteria; record delivery | Duplicate implementation because GitHub issue is open |
| No worker, next dependency delivered | Save dispatch intent; create exactly one worker in designated workspace with resolved settings | Implicit coordinator workspace or invented profile/model |
| Worker-created response lost before ID saved | Discover by dispatch token/activity; adopt returned identity or block uncertainty | Blind second create |
| Missing agent ID, branch contains partial work | Rediscover and preserve branch/dirty work; hand off only after confirmed inactivity | Resetting work or assuming missing means unfinished from scratch |
| Permission asks for live configuration; no-intermediate-review enabled | Record blocker and required human action; no approval | Blanket permission approval |
| Tests fail, push rejected, merge fails or issue update errors | Retain incomplete step/evidence; continue existing session when safe; reconcile ambiguous updates | Marking delivery based only on issue closure |
| Dependencies blocked or closed without evidence | Record exact unmet criterion and required decision | Dispatching dependent issue anyway |
| Dirty tree includes unrelated user changes | Preserve changes; establish ownership or block workspace use | Broad staging, reset/clean or branch switch over edits |
| Two ticks arrive together | One atomic lock acquisition; loser exits without mutation | Both dispatch or modify state |
| Old lock with owner liveness unknown | Block until verified cessation/manual recovery | Stealing lock based only on age |
| Duplicate schedule or overlapping parent scope | Discover under repository lock; reuse known authoritative schedule or report conflict | Creating another schedule or deleting unrelated one |
| Schedule creation response lost | Use persisted unique name/prompt identity to rediscover; setup ticks cannot dispatch | Repeating create before resolving unknown outcome |
| Models omitted; profile notes clearly assign both roles | Resolve actual model/settings per role and report selection source | Hardcoded defaults or unnecessary model question |
| Models omitted; profiles absent or ambiguous | Ask user for each unresolved role; verify chosen available models | Guessing from profile names or list order |
| User supplies models differing from profile suggestions | Honor explicit choices; verify availability/settings | Overriding user choices with profiles |
| Runtime model metadata available | Each agent outputs selected and observed model plus evidence; coordinator records both roles | Reporting only profile labels or intended configuration |
| Runtime identity unavailable or model changes on resume | Mark unavailable identity unverified; report observed changes and block on verified mismatch | Guessing actual usage or silently accepting mismatch |
| Coordinator reasoning cannot be enforced | Setup blocked; explicit user decision required | Silent settings substitution |
| All implementation delivered, live acceptance deferred | Final evidence report; leave acceptance unpassed/open; persist cleanup_pending then delete recorded schedule | Closing deferred acceptance or waiting forever on intentionally excluded review |
| Schedule deletion fails | Preserve ID/error/final report; next pass only retries cleanup | Restarting implementation or claiming deletion succeeded |
| Deletion succeeds before final state update | Prewritten final report and cleanup_pending preserve completion; verify schedule absence on inspection | Recreating schedule because final phase was not saved |

Also verify that every rendered path is absolute and persistent, every template slot is resolved, the actual worker runtime can invoke the implementation skill, every authorization is explicit, and no operational IDs/secrets enter tracked source files.
