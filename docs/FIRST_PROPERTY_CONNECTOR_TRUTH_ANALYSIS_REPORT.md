# FIRST PROPERTY CONNECTOR TRUTH ANALYSIS REPORT

## 1) Test Metadata
- Date: 2026-05-23
- Environment: live deployed web (`https://parselradar.vercel.app`) + live deployed API (`https://parselradar-production.up.railway.app`)
- Selected property id: `6a09317e90f79b455480b80e`
- Selected-by method: first property returned in admin properties UI list (`/admin/properties`) because createdAt is not shown in list cards

## 2) Connector Truth

### TKGM status
- Classification: `MANUAL_EVIDENCE_ONLY`
- Evidence:
  - Property documents/report surfaces explicitly state TKGM evidence is manual upload only.
  - No automated TKGM parcel or price-history retrieval is shown in app/runtime outputs.
  - Missing evidence warnings for TKGM parcel and TKGM price-history remain active for selected property.

### Kayseri / e-Imar status
- Classification: `REGISTRY_FOUNDATION_ONLY`
- Evidence:
  - Municipality source guidance is present.
  - Source URL status for selected Kayseri property is `NOT_CONFIGURED`.
  - `municipalitySourceRegistry.ts` contains placeholder `NOT_CONFIGURED` entries only (no verified Kayseri official URL).

### CSB / TUCBS / OGC / GIS status
- Classification: `NOT_CONFIGURED`
- Evidence:
  - OGC diagnostics UI reports WMS/WMTS/WFS as `NOT_CONFIGURED` with missing endpoint error codes.
  - Connector diagnostic contract proof confirms missing endpoints map to `NOT_CONFIGURED` and `UNAVAILABLE`.
  - Layer catalog UI shows no available layers (read-only catalog infrastructure exists, but runtime layer data is absent).

### OCR status
- Classification: `DEFERRED`
- Evidence:
  - Documents page states OCR-assisted classification is planned / not active in current phase.

### Map/layer status
- Classification: `PREVIEW_ONLY`
- Evidence:
  - Geo workspace and map surfaces are explicitly labeled internal preview/informational.
  - Runtime map diagnostics show unavailable providers and zero active overlays/layers for official integrations.

### Public source / popup handling results
- TKGM Parsel Sorgu URL checked: `https://parselsorgu.tkgm.gov.tr/`
- Result: `POPUP_CLOSED_PUBLIC_CONTENT_VISIBLE`
- Steps performed:
  - Landed on page with usage-terms popup.
  - Accepted/closed usage-terms dialog using visible `Kabul Ediyorum` button.
  - Public query UI became visible.
- No bypass actions performed.
- No CAPTCHA/e-Devlet/login bypass attempted.

## 3) First Property Visible Data (UI only)
- Property id: `6a09317e90f79b455480b80e`
- Title/name: `Ozan EKICI, Gesi fatih mah. 2351.sokak yeşil vadi sitesi c blok no 24 daire 3`
- Province/city: `Kayseri`
- District: `Kayseri`
- Neighborhood: `Erkilet` (visible on result/map readiness)
- Ada/parsel: `123/45`
- Area: `1200 m²`
- Asking price: `1.500.000 TL`
- Listing/source data: `MANUAL_ENTRY` (creation metadata)
- Document/evidence count: `1`
- Created date: `5/17/2026` (activity timeline `property_create`)
- Price per m²: `1.250 TL`
- Tapu type: `KAT_MULKIYETI`
- Zoning: `KONUT`
- Coordinates: `UNKNOWN` (result/map readiness shows missing coordinates)

## 4) Evidence Matrix (Selected Property)
- Present:
  - Parcel identity evidence
  - Uploaded documents count (1)
  - Price/comparable context (as shown in market signals)
- Missing:
  - TKGM parcel evidence
  - TKGM price-history / market signal evidence
  - Municipality/e-Imar/e-Plan evidence
  - CSV coordinate preview evidence
- Needs manual review:
  - Existing uploaded document (`Ayhan Picture.jpg`) shows review/metadata unknown and warning text indicates review needed before verified analysis use
- Not configured:
  - Municipality source URL for Kayseri (`NOT_CONFIGURED`)
  - OGC connector endpoints (WMS/WMTS/WFS `NOT_CONFIGURED`)

## 5) Strength Scores (Internal Product Readiness Only)
- Input completeness: `74/100`
- Evidence completeness: `38/100`
- Connector enrichment strength: `22/100`
- Report usefulness: `62/100`
- Opportunity readiness: `34/100`

### Total interpretation
- Inputs are reasonably populated, but connector-backed enrichment is weak and evidence is incomplete.
- Insufficient connected/evidence data for opportunity classification.

## 6) Safe Preliminary Report Summary

### What ParselRadar can say now
- Property has usable baseline metadata (location, ada/parsel, price, area).
- One supporting document exists.
- Report structure/readiness and missing-evidence guidance are operational.
- System can clearly identify missing TKGM and municipality evidence requirements.

### What ParselRadar cannot say yet
- It cannot provide official TKGM/tapu/cadastral/zoning verification.
- It cannot provide official valuation proof.
- It cannot provide reliable connector-enriched geospatial intelligence from live CSB/TUCBS/OGC endpoints in this state.
- It cannot provide user-facing buy advice from current evidence/connector strength.

### What admin/professional must check next
- Manually collect and upload TKGM parcel and TKGM price-history evidence.
- Manually collect and upload Kayseri municipality/e-Imar/e-Plan evidence.
- Perform official/legal/professional verification externally.

## 7) Missing Real-Data Requirements
- TKGM automation or stronger manual TKGM evidence coverage:
  - TKGM parcel screenshot/export evidence
  - TKGM price-history screenshot evidence
- Kayseri/e-Imar verified source:
  - verified official URL in municipality source registry (currently not configured)
- CSB/TUCBS/GIS configured layer endpoints if geo enrichment is expected:
  - WMS/WMTS/WFS endpoint configuration and successful diagnostics
- OCR runtime if evidence ingestion automation is expected:
  - current phase is planned/deferred only
- Stronger evidence uploads:
  - review-confirmed document metadata, not only generic/unknown review-state files

## 8) Product Conclusion
- Strong enough for controlled beta? `YES_WITH_LIMITS`
  - Suitable for controlled-beta informational pre-check workflows with explicit boundaries.
- Strong enough for public launch? `NO`
  - Public launch remains `NOT_READY`.
- Strong enough for investment/opportunity decision? `NO`
  - Insufficient connected/evidence data for opportunity classification.
- What must be connected before stronger analysis claims:
  - verified municipality sources (Kayseri included),
  - configured and operational OGC endpoints,
  - stronger TKGM evidence coverage,
  - and (optional) OCR runtime activation with governance controls.
