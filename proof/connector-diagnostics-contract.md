# Connector Diagnostics Contract

Overall status: PASS

## Checks
- PASS - No external fetch is executed when endpoints are missing: axios.get calls=0
- PASS - Connector diagnostics availability resolves to UNAVAILABLE: availability=UNAVAILABLE
- PASS - Connector diagnostics never default to ACTIVE: Service diagnostics state set excludes ACTIVE by default.
- PASS - WMS missing endpoint contract: state=NOT_CONFIGURED, availability=UNAVAILABLE, parse=SKIPPED
- PASS - WMS missing endpoint error code and message: errorCode=MISSING_WMS_ENDPOINT, message=WMS endpoint is not configured.
- PASS - WMS missing endpoint action guidance exists: Set CONNECTOR_TUCBS_WMS_ENDPOINT to enable WMS capability diagnostics.
- PASS - WMTS missing endpoint contract: state=NOT_CONFIGURED, availability=UNAVAILABLE, parse=SKIPPED
- PASS - WMTS missing endpoint error code and message: errorCode=MISSING_WMTS_ENDPOINT, message=WMTS endpoint is not configured.
- PASS - WMTS missing endpoint action guidance exists: Set CONNECTOR_TUCBS_WMTS_ENDPOINT to enable WMTS capability diagnostics.
- PASS - WFS missing endpoint contract: state=NOT_CONFIGURED, availability=UNAVAILABLE, parse=SKIPPED
- PASS - WFS missing endpoint error code and message: errorCode=MISSING_WFS_ENDPOINT, message=WFS endpoint is not configured.
- PASS - WFS missing endpoint action guidance exists: Set CONNECTOR_TUCBS_WFS_ENDPOINT to enable WFS capability diagnostics.
- PASS - No hardcoded OGC endpoint URLs are introduced: No http(s) URL literals found in OGC connector files.
- PASS - No connector is ACTIVE by default: No ACTIVE default state evidence detected in current proof bundle.
- PASS - Frontend does not render legacy error-only text for missing endpoints: Legacy error-only literals are absent from OGC diagnostics card source.
- PASS - Frontend renders state/errorCode/message/action fields: OGC diagnostics card uses state + errorCode + message + action for display.
- PASS - Missing endpoint maps to NOT_CONFIGURED display state: UI treats MISSING_* endpoint diagnostics as NOT_CONFIGURED state.

