# P2_GEO_4 Geodata Update And Rollback Plan

## Initial Update Policy
- No daily update in this phase.
- First milestone is manual import proof in future implementation phase.
- Weekly update is a later target after stability.
- Daily updates only after sustained reliability.

## Planned Update Process
1. Download a new source extract package.
2. Import into staging schema/tables.
3. Build indexes.
4. Run quality checks.
5. Run signal test suite.
6. Promote active source version.
7. Retain prior source version for rollback.

## Rollback Strategy
- Use active source version pointer to switch live read target.
- Keep prior versioned data/schema until promotion proof passes.
- Disallow partial promotion; promote atomically.

## Phase Constraints
- No scheduler in this phase.
- No full import execution in this phase.
- Documentation and rollout criteria only.
