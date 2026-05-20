import { getRuntimeConfig } from './runtimeConfig';
import { getStripeRuntimeState } from '../services/stripeService';
import { resolveTelemetryProviders } from '../config/observability/telemetryProviders';
import { logError, logInfo } from '../utils/logger';

export type RuntimeSystemKind = 'required' | 'optional';

export type RuntimeSystemState = 'ready' | 'degraded' | 'disabled' | 'failed' | 'unknown';

export type RuntimeSystemRecord = {
	kind: RuntimeSystemKind;
	state: RuntimeSystemState;
	reason: string;
	checkedAt: string;
};

type RuntimeDiagnostics = {
	startupPhase: string;
	startupPhases: Array<{ phase: string; at: string; detail?: string }>;
	requiredSystems: Record<string, RuntimeSystemRecord>;
	optionalSystems: Record<string, RuntimeSystemRecord>;
	degraded: boolean;
	degradedReasons: string[];
	bootFailureCategory: string | null;
};

const diagnostics: RuntimeDiagnostics = {
	startupPhase: 'booting',
	startupPhases: [{ phase: 'booting', at: new Date().toISOString(), detail: 'Process created.' }],
	requiredSystems: {
		express: { kind: 'required', state: 'unknown', reason: 'Express not yet initialized.', checkedAt: new Date().toISOString() },
		mongo: { kind: 'required', state: 'unknown', reason: 'Mongo not yet initialized.', checkedAt: new Date().toISOString() },
		authRoutes: { kind: 'required', state: 'unknown', reason: 'Auth routes not yet registered.', checkedAt: new Date().toISOString() },
		coreRbac: { kind: 'required', state: 'unknown', reason: 'RBAC middleware not yet registered.', checkedAt: new Date().toISOString() },
	},
	optionalSystems: {},
	degraded: false,
	degradedReasons: [],
	bootFailureCategory: null,
};

function noteOptional(name: string, state: RuntimeSystemState, reason: string) {
	diagnostics.optionalSystems[name] = {
		kind: 'optional',
		state,
		reason,
		checkedAt: new Date().toISOString(),
	};
	if (state !== 'ready') {
		diagnostics.degraded = true;
		diagnostics.degradedReasons.push(`${name}: ${reason}`);
	}
}

function noteRequired(name: string, state: RuntimeSystemState, reason: string) {
	diagnostics.requiredSystems[name] = {
		kind: 'required',
		state,
		reason,
		checkedAt: new Date().toISOString(),
	};
	if (state === 'failed') {
		diagnostics.bootFailureCategory = name;
	}
}

export function installRuntimeProcessGuards() {
	process.on('unhandledRejection', (reason) => {
		logError('Unhandled promise rejection', {
			bootPhase: process.env.BOOT_PHASE || diagnostics.startupPhase,
			diagnostics: getRuntimeDiagnostics(),
			reason: String(reason),
		});
	});

	process.on('uncaughtException', (error) => {
		logError('Uncaught exception', {
			bootPhase: process.env.BOOT_PHASE || diagnostics.startupPhase,
			diagnostics: getRuntimeDiagnostics(),
			error: error?.message || String(error),
		});
	});
}

export function recordStartupPhase(phase: string, detail?: string) {
	diagnostics.startupPhase = phase;
	diagnostics.startupPhases.push({ phase, at: new Date().toISOString(), detail });
	logInfo('startup_phase', { phase, detail, degraded: diagnostics.degraded });
}

export function recordRequiredSystem(name: keyof RuntimeDiagnostics['requiredSystems'], state: RuntimeSystemState, reason: string) {
	noteRequired(String(name), state, reason);
}

export function recordOptionalSystem(name: string, state: RuntimeSystemState, reason: string) {
	noteOptional(name, state, reason);
}

export function assessRuntimeDegradation() {
	const runtimeConfig = getRuntimeConfig();
	const stripeState = getStripeRuntimeState();
	const telemetry = resolveTelemetryProviders();

	diagnostics.degraded = false;
	diagnostics.degradedReasons = [];
	diagnostics.optionalSystems = {};

	if (!runtimeConfig.redisConfigured) {
		noteOptional('redis', 'disabled', 'REDIS_URL is not configured.');
	} else {
		noteOptional('redis', 'degraded', 'Redis configuration present; live connectivity is checked on demand.');
	}

	if (!runtimeConfig.bullmqEnabled) {
		noteOptional('bullmq', 'disabled', 'BullMQ distributed runtime is disabled.');
	} else if (!runtimeConfig.redisConfigured) {
		noteOptional('bullmq', 'disabled', 'BullMQ disabled until Redis is configured.');
	} else {
		noteOptional('bullmq', 'degraded', 'BullMQ workers are lazy-loaded and may be offline in degraded mode.');
	}

	if (!stripeState.configured) {
		noteOptional('stripe', 'disabled', stripeState.reason);
	} else {
		noteOptional('stripe', 'ready', stripeState.reason);
	}

	const observabilityReady = telemetry.sentry.configured || telemetry.datadog.configured || telemetry.openTelemetry.configured || telemetry.prometheus.configured;
	noteOptional('observability', observabilityReady ? 'ready' : 'disabled', observabilityReady ? 'At least one observability provider is configured.' : 'No observability providers configured.');

	noteOptional('workers', runtimeConfig.workersEnabled ? 'degraded' : 'disabled', runtimeConfig.workersEnabled ? 'Workers are lazy-loaded and may be offline during degraded boot.' : 'Background workers disabled by configuration.');
	noteOptional('schedulers', 'disabled', 'Background schedulers remain disabled unless explicitly enabled.');

	if (diagnostics.degradedReasons.length > 0) {
		logInfo('degraded_mode_activated', { reasons: diagnostics.degradedReasons });
	}

	return getRuntimeDiagnostics();
}

export function getRuntimeDiagnostics() {
	return {
		startupPhase: diagnostics.startupPhase,
		startupPhases: diagnostics.startupPhases,
		requiredSystems: diagnostics.requiredSystems,
		optionalSystems: diagnostics.optionalSystems,
		degraded: diagnostics.degraded,
		degradedReasons: diagnostics.degradedReasons,
		bootFailureCategory: diagnostics.bootFailureCategory,
	};
}

export function markRequiredSystemReady(name: keyof RuntimeDiagnostics['requiredSystems'], reason: string) {
	noteRequired(String(name), 'ready', reason);
}
