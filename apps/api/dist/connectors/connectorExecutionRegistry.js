"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXECUTION_REGISTRY = void 0;
exports.findConnectorExecution = findConnectorExecution;
const tkgmProductionConnector_1 = require("./tkgmProductionConnector");
const municipalityPlanningConnector_1 = require("./municipalityPlanningConnector");
const listingConnector_1 = require("./listingConnector");
const infrastructureConnector_1 = require("./infrastructureConnector");
const demographicConnector_1 = require("./demographicConnector");
const mapGeocodingConnector_1 = require("./mapGeocodingConnector");
const emailProviderConnector_1 = require("./emailProviderConnector");
const EXECUTION_REGISTRY = [
    tkgmProductionConnector_1.tkgmProductionConnectorExecution,
    municipalityPlanningConnector_1.municipalityPlanningConnectorExecution,
    listingConnector_1.listingConnectorExecution,
    infrastructureConnector_1.infrastructureConnectorExecution,
    demographicConnector_1.demographicConnectorExecution,
    mapGeocodingConnector_1.mapGeocodingConnectorExecution,
    emailProviderConnector_1.emailProviderConnectorExecution,
];
exports.EXECUTION_REGISTRY = EXECUTION_REGISTRY;
function findConnectorExecution(connectorKey) {
    return EXECUTION_REGISTRY.find((c) => c.key === connectorKey);
}
