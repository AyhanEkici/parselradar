# TUCBS Candidate Endpoint Test Results

Summary: total=5, passed=2, failed=3, test-only=2, manual-review-needed=0

## Results by Endpoint

### candidate-1: official TUCBS compatible WMS example
- URL: https://gis-prod-api.csb.gov.tr/trk_cbsgm_std_il_wms?request=GetCapabilities&service=WMS
- Service type: UNKNOWN
- HTTP status: n/a
- latencyMs: 10004
- XML parse success: no
- Service title: n/a
- Service name: n/a
- Layer count: 0
- CRS/projections: none reported
- Classification: FAIL_TIMEOUT
- Recommended action: Do not activate. Keep as diagnostic evidence only.
- Service exception: no
- HTML/error page: no
- Retries used: 2

### candidate-2: official TUCBS compatible WFS example
- URL: https://gis-prod-api.csb.gov.tr/trk_cbsgm_std_il_wfs?request=GetCapabilities&service=WFS
- Service type: UNKNOWN
- HTTP status: n/a
- latencyMs: 10014
- XML parse success: no
- Service title: n/a
- Service name: n/a
- Layer count: 0
- CRS/projections: none reported
- Classification: FAIL_TIMEOUT
- Recommended action: Do not activate. Keep as diagnostic evidence only.
- Service exception: no
- HTML/error page: no
- Retries used: 2

### candidate-3: public TUCBS test WMS example
- URL: https://tucbs-public-api.csb.gov.tr/trk_cbsgm_test_wms?request=GetCapabilities&service=WMS
- Service type: WMS
- HTTP status: 200
- latencyMs: 197
- XML parse success: yes
- Service title: WMS
- Service name: WMS
- Layer count: 2
- CRS/projections: CRS:84, EPSG:4326
- Classification: PASS_BUT_TEST_ONLY
- Recommended action: Optional env example only: CONNECTOR_TUCBS_WMS_ENDPOINT=https://tucbs-public-api.csb.gov.tr/trk_cbsgm_test_wms
- Service exception: no
- HTML/error page: no
- Retries used: 0

### candidate-4: public TUCBS test WFS example
- URL: https://tucbs-public-api.csb.gov.tr/trk_cbsgm_test_wfs?request=GetCapabilities&service=WFS
- Service type: WFS
- HTTP status: 200
- latencyMs: 91
- XML parse success: yes
- Service title: IDARISINIR_HGK_IDARI_SINIRLAR
- Service name: WFS
- Layer count: 0
- CRS/projections: none reported
- Classification: PASS_BUT_TEST_ONLY
- Recommended action: Optional env example only: CONNECTOR_TUCBS_WFS_ENDPOINT=https://tucbs-public-api.csb.gov.tr/trk_cbsgm_test_wfs
- Service exception: no
- HTML/error page: no
- Retries used: 0

### candidate-5: official Ortofoto WMS example
- URL: https://tucbs-public-api.csb.gov.tr/trk_cbs_ortofoto_giresun_gorele_test?request=GetCapabilities&service=WMS
- Service type: WMS
- HTTP status: 500
- latencyMs: 105
- XML parse success: yes
- Service title: n/a
- Service name: n/a
- Layer count: 0
- CRS/projections: none reported
- Classification: FAIL_HTTP_STATUS
- Recommended action: Do not activate. Keep as diagnostic evidence only.
- Service exception: no
- HTML/error page: no
- Retries used: 2

## Safe Env Examples
- WMS: https://tucbs-public-api.csb.gov.tr/trk_cbsgm_test_wms -> CONNECTOR_TUCBS_WMS_ENDPOINT=https://tucbs-public-api.csb.gov.tr/trk_cbsgm_test_wms
- WFS: https://tucbs-public-api.csb.gov.tr/trk_cbsgm_test_wfs -> CONNECTOR_TUCBS_WFS_ENDPOINT=https://tucbs-public-api.csb.gov.tr/trk_cbsgm_test_wfs

## No-Mutation Confirmation
- connector activated: no
- hardcoded endpoints added: no
- .env changed: no
- UI changed: no
- TUCBS implementation started: no
