# Good First Issues

A curated list of actionable issues for contributors. Each issue is based on a real
problem or improvement opportunity found in the codebase. Copy the title and
description into a new GitHub issue to get started.

---

## 1 · Implement Task Pause and Resume

**Labels:** `enhancement`, `good first issue`

The worker base class defines `_handle_pause` and `_handle_resume` but both raise
`NotImplementedError`. The scheduler base also stubs `send_pause_task` and
`send_resume_task` with the same error.

**What needs to happen:**

- Save the current execution state when pausing and set the task status to
  `suspended`.
- Restore the execution state when resuming and continue from the last checkpoint.
- Implement the corresponding scheduler methods so pause/resume commands reach the
  worker.
- Add unit tests covering the full pause → resume lifecycle.

**Relevant files:**

- `bindu/server/workers/base.py` (lines 221-239)
- `bindu/server/scheduler/base.py` (lines 36-43)

---

## 2 · Complete SSE Message Streaming

**Labels:** `enhancement`, `good first issue`

`MessageHandler.stream_message` is marked with a TODO and is not fully implemented.
The stream generator yields events but lacks proper error recovery, heartbeat
keep-alive, and client disconnect handling.

**What needs to happen:**

- Finish the stream generator so it properly emits SSE events for each task state
  change.
- Add heartbeat/keep-alive pings to prevent proxy timeouts.
- Handle client disconnection gracefully.
- Add tests for the streaming endpoint.

**Relevant files:**

- `bindu/server/handlers/message_handlers.py` (line 104)

---

## 3 · Implement Agent Trust Validation

**Labels:** `enhancement`, `good first issue`

The config validator skips `agent_trust` processing with a comment indicating it is
in development. The field is kept as a raw dict without any validation.

**What needs to happen:**

- Define a TypedDict or dataclass for the `agent_trust` configuration.
- Validate the structure during config loading.
- Add unit tests for valid and invalid trust configurations.

**Relevant files:**

- `bindu/penguin/config_validator.py` (lines 98-102)

---

## 4 · Propagate OpenTelemetry Span Context in Redis Scheduler

**Labels:** `bug`, `good first issue`

When the Redis scheduler deserializes a task operation it creates a new span but does
not properly propagate the parent span context. This breaks distributed tracing
across the scheduler boundary.

**What needs to happen:**

- Serialize `trace_id` and `span_id` when publishing a task to Redis.
- Reconstruct the span context on the consumer side and link the new span to the
  original parent.
- Verify end-to-end trace continuity with a test.

**Relevant files:**

- `bindu/server/scheduler/redis_scheduler.py` (line 252)

---

## 5 · Replace Bare `except Exception` Blocks with Specific Exceptions

**Labels:** `code quality`, `good first issue`

Many modules catch the generic `Exception` type, which can mask bugs and make
debugging harder. Some of these handlers also silently swallow errors.

**What needs to happen:**

- Audit each `except Exception` block and replace it with the most specific
  exception type (e.g., `ConnectionError`, `ValueError`, `TimeoutError`).
- Ensure silently caught exceptions at least log the error.
- Do **not** change defensive catches that are intentionally broad (e.g., top-level
  server error handlers).

**Relevant files (partial list):**

- `bindu/observability/sentry.py`
- `bindu/server/storage/helpers/security.py`
- `bindu/extensions/did/did_agent_extension.py`
- `bindu/auth/hydra/client.py`

---

## 6 · Add Error Handling for OAuth Provider Failures in Frontend

**Labels:** `bug`, `frontend`, `good first issue`

The auth module in the frontend has a TODO noting that errors from unresponsive
OAuth providers are not handled. If the provider is down the application may crash
or hang without a user-friendly message.

**What needs to happen:**

- Wrap provider calls in try/catch blocks.
- Return a meaningful error response when the provider is unreachable.
- Show an appropriate error message in the UI.

**Relevant files:**

- `frontend/src/lib/server/auth.ts` (line 525)

---

## 7 · Move Frontend Constants to a Dedicated File

**Labels:** `code quality`, `good first issue`

A TODO in `Settings.ts` notes that constants should be extracted to a separate file.
Keeping configuration constants mixed with type definitions makes the code harder to
navigate.

**What needs to happen:**

- Create a new `constants.ts` file (e.g., `frontend/src/lib/constants.ts`).
- Move the constant values out of `Settings.ts`.
- Update all imports across the frontend.

**Relevant files:**

- `frontend/src/lib/types/Settings.ts` (line 54)

---

## 8 · Add Google Analytics Consent Flow

**Labels:** `enhancement`, `frontend`, `good first issue`

`app.html` initializes Google Analytics but has a TODO to ask the user for consent
before enabling tracking. This is required for GDPR and similar privacy regulations.

**What needs to happen:**

- Show a cookie/analytics consent banner on first visit.
- Only call `gtag('consent', 'update', ...)` after the user accepts.
- Persist the user's choice (e.g., localStorage).

**Relevant files:**

- `frontend/src/app.html` (line 52)

---

## 9 · Fix Root Message Handling in `addSibling`

**Labels:** `bug`, `frontend`, `good first issue`

The `addSibling` utility has a known failing test case. When called on the root
message the function throws instead of handling it gracefully.

**What needs to happen:**

- Update `addSibling` to handle the root message edge case without throwing.
- Fix the currently-skipped/failing test in `addSibling.spec.ts`.

**Relevant files:**

- `frontend/src/lib/utils/tree/addSibling.spec.ts` (line 50)

---

## 10 · Move Server Hook Code Out of Build-Time Path

**Labels:** `code quality`, `frontend`, `good first issue`

The server hooks file uses a `building` flag to guard code that should only run at
server start time. The TODO suggests moving this logic to a proper started-server
hook.

**What needs to happen:**

- Identify the correct SvelteKit server lifecycle hook.
- Move the guarded logic there and remove the `building` flag.

**Relevant files:**

- `frontend/src/hooks.server.ts` (line 42)

---

## 11 · Add Integration Tests for Payment Flows

**Labels:** `testing`, `good first issue`

Unit tests exist for individual payment components (`test_payment_handler.py`,
`test_payment_session_manager.py`, `test_x402_middleware.py`) but there are no
integration tests that exercise a full payment lifecycle from request to settlement.

**What needs to happen:**

- Create an integration test that simulates a paid task request end-to-end.
- Cover scenarios: successful payment, insufficient balance, payment timeout, and
  settlement failure.
- Place tests in `tests/integration/` following existing patterns.

**Relevant files:**

- `tests/unit/test_payment_handler.py`
- `tests/unit/test_x402_middleware.py`
- `bindu/server/middleware/x402/x402_middleware.py`

---

## 12 · Document the Worker State Machine

**Labels:** `documentation`, `good first issue`

The worker processes tasks through multiple states (submitted → working → completed /
failed / canceled) but this lifecycle is not documented. Contributors need to
understand the transitions to work on features like pause/resume.

**What needs to happen:**

- Add a `docs/WORKERS.md` describing the task state machine.
- Include a state transition diagram (ASCII or Mermaid).
- Document how the scheduler dispatches operations to the worker.

**Relevant files:**

- `bindu/server/workers/base.py`
- `bindu/server/workers/manifest_worker.py`

---

## 13 · Add Docstrings to Worker and Handler Modules

**Labels:** `documentation`, `good first issue`

Several core modules have minimal or missing docstrings. This makes it harder for
new contributors to understand the code.

**What needs to happen:**

- Add module-level docstrings to worker and handler files.
- Add docstrings to all public methods following the existing style in the
  codebase.
- Focus on `base.py`, `manifest_worker.py`, and `message_handlers.py`.

**Relevant files:**

- `bindu/server/workers/base.py`
- `bindu/server/workers/manifest_worker.py`
- `bindu/server/handlers/message_handlers.py`

---

## 14 · Improve Image Format Handling in Frontend

**Labels:** `enhancement`, `frontend`, `good first issue`

The image endpoint has two TODOs about format handling: HEIF blocking may be
incorrect (it also supports AV1), and animated formats (APNG, GIF, animated WebP)
are not handled.

**What needs to happen:**

- Research whether HEIF with AV1 should be allowed and update the blocking logic.
- Decide on a strategy for animated formats and implement it.
- Add tests for the updated image format validation.

**Relevant files:**

- `frontend/src/lib/server/endpoints/images.ts` (lines 107-109)

---

## 15 · Expand Frontend Test Coverage

**Labels:** `testing`, `frontend`, `good first issue`

The frontend has very few test files despite having many components and utilities.
The project targets at least 66% test coverage overall but the frontend is well
below that threshold.

**What needs to happen:**

- Identify the most critical frontend components and utilities.
- Add unit tests for them using the existing Vitest/Testing Library setup.
- Prioritize utilities used across multiple components.

**Relevant files:**

- `frontend/src/lib/utils/`
- `frontend/src/lib/components/`
