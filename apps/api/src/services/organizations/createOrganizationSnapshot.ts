export function createOrganizationSnapshot(input: {
  organization: Record<string, unknown>;
  members: Array<Record<string, unknown>>;
  exposure: Record<string, unknown>;
}) {
  return {
    organization: input.organization,
    memberCount: input.members.length,
    members: input.members,
    exposure: input.exposure,
    generatedAt: new Date().toISOString(),
  };
}
