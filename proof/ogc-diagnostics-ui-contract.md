# OGC Diagnostics UI Contract

Overall status: PASS

## Checks
- PASS - Frontend does not render legacy error-only text for missing endpoints: Legacy error-only literals are absent from OGC diagnostics card source.
- PASS - Frontend renders state/errorCode/message/action fields: OGC diagnostics card uses state + errorCode + message + action for display.
- PASS - Missing endpoint maps to NOT_CONFIGURED display state: UI treats MISSING_* endpoint diagnostics as NOT_CONFIGURED state.

