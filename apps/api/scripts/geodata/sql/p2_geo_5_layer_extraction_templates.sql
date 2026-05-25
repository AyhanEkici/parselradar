-- P2.GEO-5 dry-run extraction templates only.
-- These are placeholders for future controlled import implementation.

-- Roads filter template
-- WHERE highway IN ('motorway', 'trunk', 'primary', 'secondary', 'tertiary')

-- Places filter template
-- WHERE place IN ('city', 'town', 'village', 'hamlet', 'neighbourhood')

-- Industrial/OSB candidates template
-- WHERE landuse = 'industrial'
--    OR industrial IS NOT NULL
--    OR name ILIKE '%osb%'
--    OR name ILIKE '%sanayi%'

-- Water features template
-- WHERE natural = 'water'
--    OR water IN ('lake', 'reservoir')
--    OR waterway = 'river'
--    OR natural = 'coastline'

-- Tourism/leisure template
-- WHERE tourism IS NOT NULL
--    OR leisure IS NOT NULL

-- All resulting signals must be marked PUBLIC_SOURCE_SIGNAL and NEEDS_OFFICIAL_CONFIRMATION.
-- officialVerification must remain false.
