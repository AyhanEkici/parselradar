# P2.1A-FIX Admin Property Documents Route

- classification: AUDIT_FALSE_POSITIVE
- audit expected before: /admin/property-documents
- real route wiring: /admin/properties/:propertyId/documents
- component: AdminPropertyDocuments
- guard contract: RequireAuth + AdminOnly preserved

## Resolution
- Updated audit scope mapping to real route path.
- No new feature surface added.
- No auth/runtime/navigation shell refactor.

## Verification
- verify:route-wiring: PASS
- verify:admin-ux-email: PASS
