# Agentic AI Engineering: Eight Non-Negotiables

This repository explores the eight non-negotiables of agentic AI engineering distilled from Yi Zhou's *Agentic AI Engineering*. Each post dives into a practice that makes production agent workflows dependable, deterministic, and observable.

## The Eight Non-Negotiables

| Non-Negotiable | Why It Matters |
| --- | --- |
| **Type Safety** | Catch errors at compile time, not in production. Prevent runtime failures from mismatched data contracts. |
| **Orchestration** | Coordinate multi-step workflows reliably. Sequential, parallel, and conditional execution without manual state management. |
| **Observability** | Real-time telemetry and tracing. Operators must see what agents are doing and diagnose failures instantly. |
| **Human-in-the-Loop (HITL)** | Pause workflows for human judgment. Critical for compliance, auditability, and handling edge cases. |
| **Error Handling** | Retries, timeouts, circuit breakers. Graceful degradation when dependencies fail. |
| **State Management** | Reliable persistence and recovery. Workflows must survive restarts without data loss. |
| **Testability** | Unit and integration testing for agent behaviors. Reproducible test scenarios and regression prevention. |
| **Scalability** | Handle increasing load without architectural rewrites. Fan-out parallelism and resource efficiency. |

## Series Roadmap

This repository unfolds the eight pillars across an article series:

1. **Orchestration** (current) — `bnf-agentic-context.md` examines how grammar-driven planning reinforces declarative workflow design and safe routing before LLM invocation.
2. **Type Safety** — coming soon
3. **Observability** — coming soon
4. **Human-in-the-Loop** — coming soon
5. **Error Handling** — coming soon
6. **State Management** — coming soon
7. **Testability** — coming soon
8. **Scalability** — coming soon

## Contributing

Contributions that enhance examples, clarify the eight pillars, or extend the series roadmap are welcome. Please open an issue before submitting substantial changes so we can align on scope and approach.
