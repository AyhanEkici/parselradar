# API Contract

## POST /properties

**Request body:**
Client must NOT send:
- userId
- createdAt
- updatedAt
- pricePerM2

Client may send:
- assetType (required)
- inputMethod (required)
- ilanUrl (optional)
- il (required)
- ilce (required)
- mahalleOrKoy (required)
- addressText (optional)
- latitude (optional)
- longitude (optional)
- askingPriceTRY (optional)
- areaM2 (optional)
- ada (optional)
- parsel (optional)
- pafta (optional)
- nitelik (optional)
- tapuType (required)
- zoningStatus (required)
- taks (optional)
- kaks (optional)
- emsal (optional)
- gabari (optional)
- hmax (optional)
- katAdedi (optional)
- cekmeMesafeleri (optional)
- planNotlariText (optional)
- roadAccess (required)
- electricity (required)
- water (required)
- villageDistanceText (optional)
- status (optional)

**Server behavior:**
- userId is set from authenticated user
- createdAt/updatedAt are set by server (Mongoose timestamps)
- pricePerM2 is calculated server-side if askingPriceTRY and areaM2 are present and areaM2 > 0

**Response:**
- Returns full property document including userId, createdAt, updatedAt, pricePerM2