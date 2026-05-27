# P2.2G Kayseri Location Source Discovery Proof

## Candidates Checked

| Key                   | Label                              | URL                                                                 | Type                     | Queryable | Has Admin Attributes | Reason                                                      |
|-----------------------|------------------------------------|---------------------------------------------------------------------|--------------------------|-----------|---------------------|-------------------------------------------------------------|
| kayseri_kent_rehberi  | Kayseri Buyuksehir Kent Rehberi    | https://cbs.kayseri.bel.tr/Kayseri-Kent-Rehberi                     | OFFICIAL_MUNICIPALITY_MAP| false     | false               | Manual guidance only, not a queryable OGC/WFS/GeoJSON endpoint. |
| kocasinan_eimar       | Kocasinan Belediyesi e-Imar         | https://cbs.kocasinan.bel.tr/user/                                  | MUNICIPALITY_E_IMAR      | false     | false               | Manual guidance only, not a queryable OGC/WFS/GeoJSON endpoint. |
| melikgazi_cbs_map     | Melikgazi CBS Map                   | https://cbs.melikgazi.bel.tr/portal/apps/webappviewer/index.html?id=9999a7e224d24b0d96b93911530cb4d3 | OFFICIAL_MUNICIPALITY_MAP| false     | false               | Manual guidance only, not a queryable OGC/WFS/GeoJSON endpoint. |
| talas_imar_planlari   | Talas Uygulama Imar Planlari        | https://www.talas.bel.tr/uygulama-imar-planlari                     | MUNICIPALITY_E_PLAN      | false     | false               | Manual guidance only, not a queryable OGC/WFS/GeoJSON endpoint. |

## TUCBS OGC
- WFS: false
- WMS: false
- WMTS: false
- Reason: No Kayseri admin location layer, all endpoints missing.

## FeatureServer/GeoJSON
- FeatureServer: false
- GeoJSON: false

## Import Decision
- NOT_CONFIGURED
- No queryable Kayseri location source found in repo/config/proof.
- fallbackUsed: true
- recordCount: 0

## Import Status
- apps/api/data/location/kayseri-location-import-status.json: NOT_CONFIGURED
- apps/api/data/location/kayseri-location-cache.json: []

## Compliance
- No full Kayseri coverage is claimed.
- No hardcoded React data, no scraping, no unverifiable claims.
- All status and cache outputs are contract-compliant.
