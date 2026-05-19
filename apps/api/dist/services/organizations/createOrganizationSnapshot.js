"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrganizationSnapshot = createOrganizationSnapshot;
function createOrganizationSnapshot(input) {
    return {
        organization: input.organization,
        memberCount: input.members.length,
        members: input.members,
        exposure: input.exposure,
        generatedAt: new Date().toISOString(),
    };
}
