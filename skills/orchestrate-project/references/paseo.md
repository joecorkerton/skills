# Paseo adapter

Inspect current schemas at deployment; the names below were verified against available tools. Do not invent parameters or infer capabilities from a profile label.

## Discovery and profiles

- `paseo_list_workspaces`, `paseo_list_agents`, `paseo_list_schedules`: discover existing ownership before writes. Agent listing defaults to recent results; widen `sinceHours`, `limit`, `includeArchived`, and filters as supported. A truncated/recent list is not proof of absence.
- `paseo_list_profiles`: inspect profile notes for clear coordinator/implementer role assignments; do not choose by list order or an evocative name. Explicit user choices take precedence. Ask for each unresolved role when profiles are absent or ambiguous; a user-selected available model does not require a named profile. Copy a chosen profile's `provider`, `model`, `modeId`, `thinkingOptionId`, and `featureValues`.
- `paseo_list_providers`, `paseo_list_models({provider})`, `paseo_inspect_provider`: verify availability, reasoning choices and modes. Record resolved values rather than names alone.
- Verify workspace path and repository identity, local instructions and worker skill installation in the selected provider's environment. A skill installed for the coordinator is not automatically installed for another provider. Check dependencies referenced by the implementation skill too.

## Model verification and output

At startup and in its final output, each coordinator and implementer reports its role, agent ID when available, selected provider/model, observed runtime provider/model, reasoning/settings when exposed, and the evidence source (runtime/session metadata or inspected Paseo agent configuration). Inspect current tool output to determine what is actually exposed; do not invent status fields. A prompt, profile label or create request proves intent, not actual usage. If runtime identity is unavailable, say `actual model unverified` and report the configured model separately; never guess self-identity.

The coordinator records these observations with timestamps in durable state and includes both roles in its run and final project reports. Recheck resumed sessions so model changes remain visible. A verified mismatch blocks further dispatch/resumption until resolved; preserve active work rather than terminating it automatically. Distinguish selected-but-not-started workers from models actually used.

## Scheduling

`paseo_create_schedule` accepts `prompt`, `cron`, `timezone`, `name`, `provider` (provider/model), `cwd`, `isolation`, and optional `maxRuns`/`expiresIn`. Use a stable absolute checkout and `isolation: "local"` for a read-only coordinator; workers receive the designated workspace explicitly. Bound runs/expiry only when agreed: expiry can stop coordination before completion.

**Settings gap:** the inspected create schema has no reasoning, mode or feature fields. `paseo_update_schedule` supports `mode`, `provider`, `model`, but not thinking/features. Verify another supported configuration route using current documentation/help, or verified effective runtime defaults, before activation. A prompt saying “low reasoning” is not a runtime setting. If selected settings cannot be enforced, block and ask for a supported profile or explicit relaxation. Do not start a schedule with silently dropped settings. Updating a spawned agent later does not prove its initial execution used the required settings.

Use `paseo_inspect_schedule({id})` to verify deployment and history, `paseo_schedule_logs({id})` for interrupted coordinators, and `paseo_run_schedule_once({id})` only for an authorized immediate run. `paseo_delete_schedule({id})` removes the schedule. Creation is not transactional with local state: rediscover by saved unique name, prompt identity and cwd after ambiguous responses. If uniqueness cannot be established, block. The `setup` phase prevents ticks during deployment from dispatching workers.

## Workers

Create with `paseo_create_agent`:

- `provider`: actual selected `provider/model`;
- `settings`: `{modeId, thinkingOptionId, features}` from the resolved choice, with `features` copied from profile `featureValues` when a profile is used; omit only genuinely unspecified fields;
- `workspaceId`: verified designated workspace, never the coordinator's implicit default;
- `title`, `labels`: project identity, issue identity and unique dispatch token;
- `initialPrompt`: rendered worker contract; `notifyOnFinish: true`.

Creation starts work immediately. Save dispatch intent first; reconcile a lost response by labels, workspace and activity before retrying. Notifications to the creating agent are hints, not durable state or proof the human was notified.

Inspect `paseo_get_agent_status({agentId})` and `paseo_get_agent_activity({agentId})`; use `paseo_list_pending_permissions` where needed. Resume an eligible interrupted worker with `paseo_send_agent_prompt({agentId, prompt, background: true, notifyOnFinish: true})`, retaining its session. Persist resume intent/time first. An ambiguous send response requires checking activity, not immediate resending.

## Pending decisions and independent review

On every bounded pass inspect `paseo_get_agent_status`, `paseo_get_agent_activity` and `paseo_list_pending_permissions` for each relevant worker, including healthy/running workers. Capture the exact question/options or permission tool/action and its agent/request ID, not just the lifecycle label. Classify before responding:

- **Workflow question:** a choice about *how* to execute already-authorized work, within the recorded scope and safety constraints. Resolve it from the contract; for an idle worker, send a scoped continuation when supported. If any integration instead leaves an interactive question pending, inspect its exact payload and verified response semantics before acting. `paseo_respond_to_permission` is for permissions; a new prompt does not necessarily answer an active question. Without a verified safe answer mechanism, record a technical delivery blocker and request human UI delivery of the recommended choice; verify resumption before clearing it. Missing enforced read-only mode alone is not a reason to ask: follow the contracted independent scratch review path.
- **Permission request:** a concrete tool/action gate, not a preference poll. Inspect its exact normalized payload and contract before `paseo_respond_to_permission`; allow only a clearly authorized, safe action. Escalate unknown, destructive, credential/secret, live-configuration or expanded-scope actions to the owner; no-intermediate-review is not blanket approval. Example: permission to apply configuration on the live machine stays blocked even if tests/commit/push were authorized.
- **Unclear or unanswerable:** record the exact request, missing fact or unsupported mechanism and next action. UI delivery of an already-settled choice is not owner approval of the method. Preserve the worker; do not cancel or replace a healthy session to clear a request.

**Review ownership:** default to the implementation worker invoking the agreed `/code-review` skill with a recorded fixed point and spec source. That skill runs Standards and Spec as **parallel sub-agents** and reports their findings separately; do not replace it with sequential reviews or silently transfer review ownership to the coordinator. Verify it and its dependencies in the worker runtime at setup. Only if the contract explicitly permits a different review owner/path may the coordinator commission review agents (persist create intents, explicit isolated workspace IDs, reconcile ambiguous creates). An enforced provider `read-only` mode is optional, not a prerequisite.

**Isolation fallback:** the worker prepares disposable scratch checkouts at the tested commit, apart from its implementation checkout and user edits, and invokes the review skill from a scratch review workspace; give review sub-agents separate scratch snapshots where supported, or a shared disposable review snapshot isolated from worker/user work with review-only tasks. Give reviewers no edits, commits, pushes, live actions or issue updates as tasks. These instructions and filesystem isolation are **not** enforced read-only permissions. Check git state first; never reset/clean/switch over dirty work, and never treat uncommitted work as reviewed by a committed diff. `/code-review` uses a fixed-point-to-HEAD diff and requires the spec source; supply them explicitly rather than guessing. If the recorded skill cannot run safely in isolation, record the concrete blocker and seek an authorized safe path, not a waiver or silent ownership change. Reconcile both reports and re-review changed commits before delivery.
