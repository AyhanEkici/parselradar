"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildWorkspaceActivityFeed = buildWorkspaceActivityFeed;
function buildWorkspaceActivityFeed(input) {
    return {
        count: input.activities.length,
        items: input.activities,
        generatedAt: new Date().toISOString(),
    };
}
