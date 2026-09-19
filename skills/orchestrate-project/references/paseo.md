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

Permission requests require comparing the exact action with the contract. `paseo_respond_to_permission` is available, but autonomous implementation is not blanket permission approval. Escalate destructive, live-configuration, secret-access or expanded-scope requests. Do not cancel, archive or replace a healthy worker to accelerate the queue.
