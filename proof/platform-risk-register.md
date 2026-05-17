# Platform Risk Register

| Severity | Category | Title | Detail |
| --- | --- | --- | --- |
| medium | Connectors | Connector activation routes are mutating by design | Connector credential, test, activation, and deactivation endpoints exist. The verification harness inspects them statically and does not invoke them. |
| medium | Notifications | Notification test-event route is mutating | A notification test-event route exists in the product API. The verification harness inspects route declarations only and never invokes that endpoint. |
| low | Observability | Observability controllers are not executed by the harness | The proof bundle verifies observability files, routes, and admin gating statically. It does not execute telemetry, readiness, or deployment snapshots. |
| low | Workspace | Workspace membership is inferred structurally | The harness proves auth gating and file availability, but organization membership checks remain controller-level behavior that is not executed. |

