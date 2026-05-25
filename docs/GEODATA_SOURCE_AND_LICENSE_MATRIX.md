# Geodata Source and License Matrix (P2.GEO-1)

## Scope
This matrix defines candidate public or licensed geodata sources for signal generation.
It is policy guidance only for this phase.

| source | URL | data used | license/permission note | production suitability | attribution requirement | update frequency | ParselRadar use label | risk |
|---|---|---|---|---|---|---|---|---|
| Geofabrik Turkey OSM Extract | https://download.geofabrik.de/europe/turkey.html | roads, places, water, industrial, tourism, settlement context | OSM ODbL obligations apply through extract usage | High, preferred bulk baseline | OSM attribution and ODbL compliance required | Weekly or monthly baseline refresh | PUBLIC_SOURCE_SIGNAL | stale extract risk if not refreshed |
| OpenStreetMap / ODbL | https://www.openstreetmap.org/copyright | base geodata | ODbL compliance required | High, core open dataset | mandatory attribution and share-alike obligations where applicable | Continuous community updates, consumed in batches | PUBLIC_SOURCE_SIGNAL | legal risk if attribution/compliance omitted |
| Nominatim | https://operations.osmfoundation.org/policies/nominatim/ | geocoding and reverse geocoding | public instance has policy limits | Medium only with self-hosted or approved provider | attribution required | On-demand in controlled environments | PUBLIC_SOURCE_SIGNAL | service-limit and policy-violation risk in production bulk usage |
| Overpass API | https://wiki.openstreetmap.org/wiki/Overpass_API | ad-hoc OSM feature extraction | shared public infra policy limits | Low for production backend, acceptable for research | attribution required | prototype/research cadence only | PUBLIC_SOURCE_SIGNAL | throttling/availability risk for heavy production workloads |
| PostGIS | https://postgis.net/ | spatial query engine | open-source software licensing | High as managed spatial engine | no special public data attribution by itself | infrastructure lifecycle driven | SIGNAL_QUERY_ENGINE | operational risk if unmanaged scaling/indexing |
| NASA SRTM | https://www.earthdata.nasa.gov/data/instruments/srtm | elevation and terrain context | dataset terms and redistribution constraints must be reviewed | Medium-High after legal/data review | source attribution required | monthly/quarterly refresh | TERRAIN_SIGNAL | terrain resolution and coverage limitations |
| Copernicus DEM | https://dataspace.copernicus.eu/ | elevation and terrain alternative | license/API review required before production | Medium pending policy review | source attribution required | monthly/quarterly refresh | TERRAIN_SIGNAL | access or licensing ambiguity risk |
| AFAD | https://deprem.afad.gov.tr/ | earthquake and hazard context (later) | official source usage and policy constraints apply | Medium for context, not engineering proof | attribution required | event-driven or daily if stable | HAZARD_CONTEXT_SIGNAL | misuse risk if interpreted as parcel-level engineering conclusion |
| DASK | https://dask.gov.tr/ | insurance/legal context references | policy and terms must be respected | Medium for legal context only | attribution required | periodic review | HAZARD_CONTEXT_SIGNAL | misuse risk if treated as primary spatial risk engine |
| Mapillary | https://www.mapillary.com/developer/api-documentation | street-level imagery availability context | API token and terms required | Medium with approved API usage | attribution and API policy compliance required | depends on provider coverage growth | STREET_LEVEL_AVAILABILITY_SIGNAL | API quota and terms change risk |
| KartaView | https://kartaview.org/doc/authentication | street-level imagery availability context | API and terms required | Medium with approved API usage | attribution and terms compliance required | depends on provider updates | STREET_LEVEL_AVAILABILITY_SIGNAL | inconsistent coverage and API constraints |
| Google Street View Static API | https://developers.google.com/maps/documentation/streetview | licensed paid street-view option | billing, API key, and terms required | High if paid compliance path accepted | strict attribution and branding requirements | near real-time provider managed | STREET_LEVEL_AVAILABILITY_SIGNAL | cost and commercial-term lock-in risk |

## Policy Notes
- Public free Nominatim and Overpass must not be used as heavy production backends.
- All outputs must carry non-official verification disclaimers.
- Every production signal must include source and source version metadata.
