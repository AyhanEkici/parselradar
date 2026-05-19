import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui';
import {
  AnalysisFactorsGrid,
  ConfidenceCard,
  MarketPositionCard,
  RecommendationTimeline,
  RiskMatrix,
  ScoreBreakdownCard,
  ValuationBandCard,
} from '../components/analysis';
import {
  ComparablePropertiesCard,
  ComparableTable,
  MarketHeatCard,
  OpportunitySignalCard,
  PricingPositionCard,
} from '../components/market';
import {
  InfrastructureCard,
  RegionalDemandCard,
  GrowthPotentialCard,
  StrategicLocationCard,
  GeoIntelligenceGrid,
} from '../components/geo';
import {
  DevelopmentPotentialCard,
  DeveloperROICard,
  SubdivisionCard,
  RezoningUpsideCard,
  ParcelMergeCard,
  ProjectabilityCard,
  DevelopmentScenarioTimeline,
} from '../components/development';
import {
  PropertyMapCard,
  NearbyInfrastructureMap,
  ComparableMapCluster,
  SpatialSignalsCard,
  RegionalHeatMapCard,
} from '../components/maps';
import {
  RefreshStatusCard,
  MarketFreshnessCard,
  DataConfidenceCard,
  IntelligenceSourceCard,
  AnalysisVersionCard,
} from '../components/system';
import {
  MarketMomentumCard,
  DistrictHeatCard,
  OpportunitySignalCard as TrendOpportunitySignalCard,
  TrendVelocityCard,
  InvestorSignalCard,
  ConnectorStatusCard,
} from '../components/trends';
import GovernanceBadge from '../components/governance/GovernanceBadge';
import GovernanceWarningsPanel from '../components/governance/GovernanceWarningsPanel';
import TrustClassificationCard from '../components/governance/TrustClassificationCard';
import ConfidenceMeter from '../components/confidence/ConfidenceMeter';
import EvidenceStrengthCard from '../components/confidence/EvidenceStrengthCard';
import MissingDataImpactCard from '../components/confidence/MissingDataImpactCard';
import SourceProvenanceCard from '../components/provenance/SourceProvenanceCard';
import DisclosurePanel from '../components/disclosure/DisclosurePanel';
import PlanningSignalCard from '../components/planning/PlanningSignalCard';
import ImarProbabilityCard from '../components/planning/ImarProbabilityCard';
import InfrastructurePressureCard from '../components/infrastructure/InfrastructurePressureCard';
import MacroGrowthCard from '../components/intelligence/MacroGrowthCard';
import RegionalDemandCard from '../components/intelligence/RegionalDemandCard';
import LiquidityScoreCard from '../components/intelligence/LiquidityScoreCard';
import DemographicPressureCard from '../components/demographics/DemographicPressureCard';
import DevelopmentForecastCard from '../components/forecasting/DevelopmentForecastCard';
import TerritorialEvolutionCard from '../components/forecasting/TerritorialEvolutionCard';
import StrategicRegionScoreCard from '../components/intelligence/StrategicRegionScoreCard';
import ConnectorGovernanceCard from '../components/connectors/ConnectorGovernanceCard';
import ConnectorHealthCard from '../components/connectors/ConnectorHealthCard';
import ConnectorCapabilityCard from '../components/connectors/ConnectorCapabilityCard';
import RateLimitStatusCard from '../components/connectors/RateLimitStatusCard';
import IngestionFreshnessCard from '../components/ingestion/IngestionFreshnessCard';
import IngestionAuditCard from '../components/ingestion/IngestionAuditCard';
import SourceLineageCard from '../components/provenance/SourceLineageCard';
import SourceTrustCard from '../components/provenance/SourceTrustCard';
import LegalClassificationCard from '../components/legal/LegalClassificationCard';
import GovernanceRestrictionCard from '../components/legal/GovernanceRestrictionCard';
import TerritorialMonitoringCard from '../components/monitoring/TerritorialMonitoringCard';
import AnomalyDetectionCard from '../components/monitoring/AnomalyDetectionCard';
import EvolutionTimelineCard from '../components/timeline/EvolutionTimelineCard';
import ForecastDirectionCard from '../components/timeline/ForecastDirectionCard';
import HistoricalEvidenceCard from '../components/timeline/HistoricalEvidenceCard';
import RegionalTransformationCard from '../components/evolution/RegionalTransformationCard';
import InfrastructureExpansionCard from '../components/evolution/InfrastructureExpansionCard';
import InvestorAlertCard from '../components/alerts/InvestorAlertCard';
import OperationalOpportunitySignalCard from '../components/opportunities/OpportunitySignalCard';
import StrategicOpportunityCard from '../components/opportunities/StrategicOpportunityCard';
import AutonomousIntelligenceCard from '../components/autonomy/AutonomousIntelligenceCard';
import GovernedEscalationCard from '../components/autonomy/GovernedEscalationCard';
import ReviewQueueCard from '../components/autonomy/ReviewQueueCard';
import SuppressionGovernanceCard from '../components/autonomy/SuppressionGovernanceCard';
import CadenceAndDegradationCard from '../components/autonomy/CadenceAndDegradationCard';
import ParcelWatchlistCard from '../components/watchlists/ParcelWatchlistCard';
import RegionWatchCard from '../components/watchlists/RegionWatchCard';
import IntelligenceFeedCard from '../components/feeds/IntelligenceFeedCard';
import PortfolioIntelligenceCard from '../components/portfolioOps/PortfolioIntelligenceCard';
import StrategicMonitoringCard from '../components/strategic/StrategicMonitoringCard';
import AutonomousMonitoringCard from '../components/autonomy/AutonomousMonitoringCard';
import InvestorPriorityCard from '../components/autonomy/InvestorPriorityCard';
import WatchlistActivityCard from '../components/watchlists/WatchlistActivityCard';
import StrategicRegionCard from '../components/strategic/StrategicRegionCard';
import PortfolioExposureCard from '../components/portfolioOps/PortfolioExposureCard';
import RegionalSurveillanceCard from '../components/strategic/RegionalSurveillanceCard';
import OpportunityPriorityCard from '../components/autonomy/OpportunityPriorityCard';
import EscalationTimelineCard from '../components/autonomy/EscalationTimelineCard';
import AutonomousReviewQueueCard from '../components/autonomy/AutonomousReviewQueueCard';

// Document Modal Component
const DocumentModal = ({
  isOpen,
  doc,
  onClose,
}: {
  isOpen: boolean;
  doc: any;
  onClose: () => void;
}) => {
  if (!isOpen || !doc) return null;

  const isImage = ['jpeg', 'jpg', 'png', 'gif', 'webp'].some((ext) =>
    doc.originalName.toLowerCase().endsWith(`.${ext}`)
  );
  const isPdf = doc.originalName.toLowerCase().endsWith('.pdf');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold truncate">{doc.originalName}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {isImage && (
            <img
              src={doc.fileUrl}
              alt={doc.originalName}
              className="max-w-full max-h-full mx-auto"
            />
          )}
          {isPdf && (
            <iframe
              src={doc.fileUrl}
              title={doc.originalName}
              className="w-full h-full border-0"
            />
          )}
          {!isImage && !isPdf && (
            <div className="text-center text-gray-500 py-12">
              <div className="text-6xl mb-4">📄</div>
              <p>File type not displayable in preview</p>
              <a
                href={doc.downloadUrl || doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline mt-2 inline-block"
              >
                Download file
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Timeline Item Component
const TimelineItem = ({
  item,
  isExpanded,
  onToggle,
}: {
  item: any;
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  const getIcon = (type: string) => {
    if (type.includes('analysis')) return '📊';
    if (type.includes('document')) return '📄';
    if (type.includes('status')) return '🔄';
    if (type.includes('credit')) return '💳';
    return '📌';
  };

  const getColor = (success: boolean) =>
    success ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300';

  return (
    <div
      className={`border rounded-lg p-3 cursor-pointer transition-all ${getColor(
        item.success !== false
      )} ${isExpanded ? 'bg-opacity-100' : 'bg-opacity-60 hover:bg-opacity-80'}`}
      onClick={onToggle}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{getIcon(item.type)}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="font-semibold text-sm text-gray-800 truncate">{item.type}</div>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {new Date(item.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="text-xs text-gray-700 line-clamp-2 mt-1">{item.message}</div>
          {isExpanded && item.metadata && Object.keys(item.metadata).length > 0 && (
            <div className="mt-2 pt-2 border-t border-current border-opacity-20 text-xs bg-white bg-opacity-50 p-2 rounded">
              <details className="space-y-1">
                <summary className="cursor-pointer font-medium text-gray-700">
                  Metadata
                </summary>
                {Object.entries(item.metadata).map(([k, v]) => (
                  <div key={k} className="text-gray-600 ml-2">
                    <span className="font-medium">{k}:</span> {JSON.stringify(v)}
                  </div>
                ))}
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function PropertyDetail() {
  const { id, propertyId } = useParams();
  const resolvedId = propertyId || id;
  const { user } = useAuth();
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin/');

  interface Property {
    _id: string;
    userId: string;
    addressText?: string;
    il: string;
    ilce: string;
    mahalleOrKoy?: string;
    askingPriceTRY?: number;
    areaM2?: number;
    pricePerM2?: number;
    ada?: string;
    parsel?: string;
    pafta?: string;
    nitelik?: string;
    zoningStatus: string;
    tapuType: string;
    roadAccess?: string;
    electricity?: string;
    water?: string;
    latitude?: number;
    longitude?: number;
    coordinateSource?: 'exact' | 'approximate' | 'district_center_fallback';
    geocodeConfidence?: number;
    lastSpatialRefresh?: string;
    lastMarketRefresh?: string;
    lastTrendRefresh?: string;
    opportunityScore?: number;
    momentumScore?: number;
    districtHeat?: number;
    ingestionState?: 'idle' | 'queued' | 'refreshing' | 'ready' | 'stale';
    status?: string;
    createdAt: string;
    updatedAt: string;
  }

  interface DetailResponse {
    property: Property;
    owner?: { email?: string; name?: string; role?: string };
    creator?: { email?: string; name?: string; role?: string };
    creationSource?: string;
    generatedPropertyTitle?: string;
    titleDerivation?: {
      ownerName?: string;
      address?: string;
      city?: string;
      district?: string;
    };
    documents: Array<{
      _id: string;
      documentType: string;
      originalName: string;
      createdAt?: string;
      uploadedAt: string;
      fileUrl?: string;
      downloadUrl?: string;
      fileMissing?: boolean;
    }>;
    analyses: Array<{
      _id: string;
      productType: string;
      score: number;
      signal: string;
      confidence?: number;
      strengths?: string[];
      risks?: string[];
      missingInputs?: string[];
      recommendation?: string;
      recommendations?: string[];
      factorsUsed?: Record<string, any>;
      valuationBand?: { low?: number; mid?: number; high?: number; currency?: string };
      marketPosition?: string;
      developerFit?: string;
      zoningPotential?: string;
      liquiditySignal?: string;
      comparableCount?: number;
      avgComparablePricePerM2?: number;
      marketHeat?: 'COLD' | 'STABLE' | 'ACTIVE' | 'HOT' | string;
      pricingPosition?: 'UNDER_MARKET' | 'FAIR_MARKET' | 'ABOVE_MARKET' | 'HEAVILY_OVERPRICED' | string;
      opportunitySignals?: string[];
      overpricingRisk?: 'LOW' | 'MEDIUM' | 'HIGH' | string;
      comparableSummary?: string;
      topComparables?: Array<{
        _id: string;
        il?: string;
        ilce?: string;
        zoningStatus?: string;
        areaM2?: number;
        normalizedPricePerM2: number;
        similarityScore: number;
        priceDeltaRatio: number;
        daysSinceCreated: number;
      }>;
      createdAt: string;
      previewSummary?: Record<string, unknown>;
    }>;
    latestAnalysis?: {
      _id: string;
      productType: string;
      score: number;
      signal: string;
      confidence?: number;
      strengths?: string[];
      risks?: string[];
      missingInputs?: string[];
      recommendation?: string;
      recommendations?: string[];
      factorsUsed?: Record<string, any>;
      valuationBand?: { low?: number; mid?: number; high?: number; currency?: string };
      marketPosition?: string;
      developerFit?: string;
      zoningPotential?: string;
      liquiditySignal?: string;
      comparableCount?: number;
      avgComparablePricePerM2?: number;
      marketHeat?: 'COLD' | 'STABLE' | 'ACTIVE' | 'HOT' | string;
      pricingPosition?: 'UNDER_MARKET' | 'FAIR_MARKET' | 'ABOVE_MARKET' | 'HEAVILY_OVERPRICED' | string;
      opportunitySignals?: string[];
      overpricingRisk?: 'LOW' | 'MEDIUM' | 'HIGH' | string;
      comparableSummary?: string;
      topComparables?: Array<{
        _id: string;
        il?: string;
        ilce?: string;
        zoningStatus?: string;
        areaM2?: number;
        normalizedPricePerM2: number;
        similarityScore: number;
        priceDeltaRatio: number;
        daysSinceCreated: number;
      }>;
      infrastructureScore?: number;
      roadAccessScore?: number;
      utilityCoverage?: {
        electricityScore: number;
        waterScore: number;
        gasScore: number;
        internetScore: number;
        totalScore: number;
      };
      growthPotential?: {
        growthScore: number;
        developmentPhase: 'emerging' | 'developing' | 'mature' | 'saturated';
        growthIndicators: number;
      };
      regionalDemand?: {
        demandLevel: 'cold' | 'stable' | 'active' | 'high_growth';
        demandScore: number;
      };
      strategicLocationSignals?: string[];
      geoSummary?: string;
      subdivisionPotential?: {
        level: 'low' | 'medium' | 'high';
        score: number;
        splitabilitySignals: string[];
      };
      frontageDepthScore?: {
        score: number;
        geometrySignals: string[];
      };
      densityPotential?: {
        category: 'low_rise' | 'mid_rise' | 'mixed_use' | 'industrial' | 'tourism';
        score: number;
        supportingSignals: string[];
      };
      developerROI?: {
        score: number;
        scenario: 'conservative' | 'moderate' | 'aggressive';
        roiSignals: string[];
      };
      parcelMergeOpportunity?: {
        score: number;
        level: 'limited' | 'assembly' | 'expansion';
        signals: string[];
      };
      rezoningUpside?: {
        score: number;
        scenario: 'stable' | 'moderate_upside' | 'speculative_upside' | 'infrastructure_linked';
        signals: string[];
      };
      projectability?: {
        score: number;
        level: 'easy' | 'moderate' | 'difficult';
        blockers: string[];
      };
      developmentScenario?: Array<{
        phase: 'land_control' | 'scheme_test' | 'entitlement_watch' | 'delivery_readiness';
        title: string;
        detail: string;
      }>;
      developmentSignals?: string[];
      coordinates?: {
        latitude: number;
        longitude: number;
        source: 'exact' | 'approximate' | 'district_center_fallback';
      } | null;
      nearbyInfrastructure?: Array<{
        id: string;
        name: string;
        type: string;
        distanceKm: number;
        city: string;
      }>;
      infrastructureDistances?: {
        airport?: number;
        industrial_zone?: number;
        university?: number;
        hospital?: number;
        road_corridor?: number;
        tourism_zone?: number;
      };
      spatialSignals?: string[];
      spatialLiquidity?: { score: number; label: 'thin' | 'balanced' | 'liquid' };
      clusterStrength?: number;
      geoConfidence?: {
        level: 'exact' | 'approximate' | 'district_center_fallback' | 'unresolved';
        score: number;
      };
      mapSummary?: string;
      comparableMapPoints?: Array<{
        _id: string;
        latitude: number;
        longitude: number;
        distanceKm: number;
        pricePerM2?: number;
      }>;
      regionalCluster?: {
        municipality?: { city: string; district?: string; distanceKm: number };
        roadCluster?: { name: string; distanceKm: number };
        clusterLabel: string;
      };
      analysisVersion?: string;
      refreshReason?: string;
      sourceConfidence?: 'low' | 'medium' | 'verified' | string;
      cacheTimestamp?: string;
      refreshStatus?: string;
      freshnessScore?: number;
      ingestionSignals?: string[];
      staleFlags?: string[];
      cacheState?: { market?: string; comparable?: string; spatial?: string };
      trendSignals?: string[];
      marketMomentum?: number;
      volatilityIndex?: number;
      investorSignal?: string;
      connectorStatus?: {
        networkState?: string;
        snapshots?: Array<{ connector: string; status: string; reason?: string }>;
        statusCounts?: Record<string, number>;
      };
      districtHeat?: number;
      opportunityScore?: number;
      trendVelocity?: { velocityScore?: number; velocityLabel?: string };
      liquidityTrend?: { liquidityTrendScore?: number; liquidityTrend?: string };
      alertSignals?: string[];
      governanceClassification?: 'SAFE' | 'CAUTION' | 'SPECULATIVE' | 'INSUFFICIENT_DATA' | string;
      trustScore?: number;
      reportEvidenceSummary?: {
        evidenceStrength?: 'VERY_WEAK' | 'WEAK' | 'MODERATE' | 'STRONG' | 'VERIFIED' | string;
        sourcesAvailable?: number;
        sourcesTotal?: number;
      };
      reportConfidenceSummary?: {
        score?: number;
        classification?: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH' | string;
        missingDataImpact?: number;
        penaltyReasons?: string[];
      };
      reportDisclosureSummary?: {
        mode?: 'INTERNAL_ONLY' | 'CLIENT_VISIBLE' | 'HIGH_RISK_DISCLOSURE' | string;
        lines?: string[];
        compliance?: string;
      };
      evidenceTrace?: Array<{
        sourceLabel?: string;
        verificationState?: 'verified' | 'inferred' | 'estimated' | 'unavailable' | string;
        reliability?: 'UNKNOWN' | 'UNVERIFIED' | 'PARTIAL' | 'VERIFIED_PUBLIC' | 'VERIFIED_OFFICIAL' | string;
        freshnessDays?: number;
      }>;
      unsupportedAssumptions?: string[];
      speculativeIndicators?: string[];
      territorialIntelligence?: {
        macroDirection?: any;
        planningLayer?: any;
        planningProbability?: any;
        infrastructurePressure?: any;
        demographicTrajectory?: any;
        regionalDemand?: any;
        liquidityProfile?: any;
        speculativeRisk?: any;
        developmentProbability?: any;
        territorialEvolution?: any;
        strategicRegionScore?: any;
      };
      ingestionGovernance?: {
        connectorGovernance?: { statusCounts?: Record<string, number> };
        connectors?: Array<{
          connectorKey: string;
          status: string;
          freshnessState: string;
          legalClassification: string;
          governanceState: string;
        }>;
        provenance?: { lineage?: Array<any> };
        trust?: {
          trustScore?: number;
          trustLabel?: string;
          reliability?: { reliability?: number; label?: string };
        };
        disclosures?: Array<{ source: string; mode: string; lines: string[] }>;
        compliance?: {
          complianceState?: string;
          allTermsAccepted?: boolean;
          legalReviewRequired?: boolean;
          restrictedSourceCount?: number;
        };
        auditTrail?: {
          totalEvents?: number;
          hasFailures?: boolean;
          latestEvents?: Array<{ connectorKey: string; action: string; timestamp: string }>;
        };
        quota?: Array<{ connectorKey: string; used: number; quota: number; nearLimit: boolean }>;
        cacheEnvelope?: { freshnessScore?: number; cacheState?: string; generatedAt?: string };
        noFakeActiveProof?: boolean;
      };
      operationalIntelligence?: {
        monitoring?: any;
        parcelTimeline?: any;
        opportunities?: {
          strategicOpportunity?: any;
          undervaluedCluster?: any;
          infrastructureUpside?: any;
          municipalityExpansion?: any;
          developerPressure?: any;
        };
        anomalies?: {
          speculativeAnomaly?: any;
          pricingAnomaly?: any;
          velocityAnomaly?: any;
          planningAnomaly?: any;
          demandAnomaly?: any;
        };
        alerts?: {
          investorAlert?: any;
          zoningAlert?: any;
          infrastructureAlert?: any;
          speculativeAlert?: any;
          shiftAlert?: any;
        };
        regionalTransformation?: any;
        infrastructureHistory?: any;
        history?: {
          archive?: any;
          regionalForecast?: any;
          parcelForecast?: any;
          infrastructureForecast?: any;
          municipalForecast?: any;
        };
      };
      autonomyIntelligence?: {
        autonomy?: { autonomy?: any; cadence?: any };
        watchlist?: { parcel?: any; region?: any; investor?: any; aggregate?: any };
        feeds?: { unified?: any };
        portfolio?: { intelligence?: any; exposure?: any };
        strategic?: { radar?: any; regionMonitor?: any; surveillance?: any };
        prioritization?: { governedEscalationQueue?: any; opportunityMatrix?: any };
        operations?: { reviewQueue?: any; suppression?: any; degradation?: any; controlPanel?: any };
      };
      createdAt: string;
      previewSummary?: Record<string, unknown>;
    };
    analysisSummary?: {
      quickScore?: { score: number; signal: string; createdAt: string } | null;
      parcelInsight?: { score: number; signal: string; createdAt: string } | null;
      developerFit?: { score: number; signal: string; createdAt: string } | null;
    };
    auditReferences: Array<{
      _id: string;
      type: string;
      message: string;
      success?: boolean;
      createdAt: string;
      metadata?: Record<string, any>;
    }>;
  }

  const [detail, setDetail] = useState<DetailResponse | null>(null);
  const [error, setError] = useState('');
  const [rerunLoading, setRerunLoading] = useState(false);
  const [statusValue, setStatusValue] = useState('NEW');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [investorActionLoading, setInvestorActionLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedAuditId, setExpandedAuditId] = useState<string | null>(null);
  const toast = useToast();

  const normalizeDetail = (data: unknown): DetailResponse => {
    const maybe = data as Partial<DetailResponse> & Record<string, unknown>;
    if (maybe && typeof maybe === 'object' && maybe.property) {
      return {
        property: maybe.property as DetailResponse['property'],
        owner: maybe.owner,
        creator: maybe.creator,
        creationSource: (maybe.creationSource as string) || '-',
        generatedPropertyTitle: (maybe.generatedPropertyTitle as string) || '-',
        titleDerivation: maybe.titleDerivation as DetailResponse['titleDerivation'],
        documents: Array.isArray(maybe.documents) ? maybe.documents : [],
        analyses: Array.isArray(maybe.analyses) ? maybe.analyses : [],
        latestAnalysis: maybe.latestAnalysis as DetailResponse['latestAnalysis'],
        analysisSummary: maybe.analysisSummary,
        auditReferences: Array.isArray(maybe.auditReferences) ? maybe.auditReferences : [],
      };
    }

    return {
      property: maybe as DetailResponse['property'],
      owner: undefined,
      creator: undefined,
      creationSource: '-',
      generatedPropertyTitle: '-',
      titleDerivation: undefined,
      documents: [],
      analyses: [],
      latestAnalysis: undefined,
      analysisSummary: undefined,
      auditReferences: [],
    };
  };

  const fetchDetail = async () => {
    if (!resolvedId) return;
    setError('');
    const endpoint = isAdminPath ? `admin/properties/${resolvedId}` : `properties/${resolvedId}`;
    const data = await apiFetch(endpoint);
    const normalized = normalizeDetail(data);
    setDetail(normalized);
    setStatusValue(normalized.property?.status || 'NEW');
  };

  useEffect(() => {
    fetchDetail().catch((err) =>
      setError((err as { error?: string }).error || 'Detay yüklenemedi')
    );
  }, [resolvedId, isAdminPath]);

  const rerunAnalysis = async () => {
    if (!resolvedId) return;
    setRerunLoading(true);
    const loadingToastId = toast.loading('Analiz yeniden çalıştırılıyor...');
    try {
      await apiFetch(`analysis/${resolvedId}/quick-score?force=1`, { method: 'POST' });
      await fetchDetail();
      toast.dismiss(loadingToastId);
      toast.success('Analiz güncellendi');
    } catch (err) {
      const e = err as { error?: string; message?: string };
      toast.dismiss(loadingToastId);
      toast.error(e.error || e.message || 'Analiz başarısız');
    } finally {
      setRerunLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!resolvedId) return;
    setStatusUpdating(true);
    const loadingToastId = toast.loading('Durum güncelleniyor...');
    try {
      await apiFetch(`admin/properties/${resolvedId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setStatusValue(newStatus);
      await fetchDetail();
      toast.dismiss(loadingToastId);
      toast.success('Status updated');
    } catch (err) {
      const e = err as { error?: string; message?: string };
      toast.dismiss(loadingToastId);
      toast.error(e.error || e.message || 'Status update failed');
    } finally {
      setStatusUpdating(false);
    }
  };

  const saveAnalysis = async () => {
    if (!resolvedId) return;
    setInvestorActionLoading(true);
    const loadingToastId = toast.loading('Analysis saved...');
    try {
      await apiFetch('investor/saved-analyses', {
        method: 'POST',
        body: JSON.stringify({ propertyId: resolvedId }),
      });
      toast.dismiss(loadingToastId);
      toast.success('Analysis saved to investor library');
    } catch (err) {
      const e = err as { error?: string; message?: string };
      toast.dismiss(loadingToastId);
      toast.error(e.error || e.message || 'Save analysis failed');
    } finally {
      setInvestorActionLoading(false);
    }
  };

  const addToWatchlist = async () => {
    if (!resolvedId) return;
    setInvestorActionLoading(true);
    const loadingToastId = toast.loading('Adding to watchlist...');
    try {
      await apiFetch('investor/watchlist', {
        method: 'POST',
        body: JSON.stringify({ propertyId: resolvedId }),
      });
      toast.dismiss(loadingToastId);
      toast.success('Added to watchlist');
    } catch (err) {
      const e = err as { error?: string; message?: string };
      toast.dismiss(loadingToastId);
      toast.error(e.error || e.message || 'Watchlist action failed');
    } finally {
      setInvestorActionLoading(false);
    }
  };

  const addToPortfolio = async () => {
    if (!resolvedId) return;
    const portfolioId = window.prompt('Portfolio ID giriniz (Investor > Portfolio sayfasından alın):');
    if (!portfolioId) return;

    setInvestorActionLoading(true);
    const loadingToastId = toast.loading('Adding to portfolio...');
    try {
      await apiFetch(`investor/portfolio/${portfolioId}/items`, {
        method: 'POST',
        body: JSON.stringify({ propertyId: resolvedId }),
      });
      toast.dismiss(loadingToastId);
      toast.success('Added to portfolio');
    } catch (err) {
      const e = err as { error?: string; message?: string };
      toast.dismiss(loadingToastId);
      toast.error(e.error || e.message || 'Portfolio action failed');
    } finally {
      setInvestorActionLoading(false);
    }
  };

  const exportAnalysis = async () => {
    if (!resolvedId) return;
    setInvestorActionLoading(true);
    const loadingToastId = toast.loading('Exporting analysis...');
    try {
      const data = await apiFetch(`exports/analysis/${resolvedId}`, { method: 'POST' });
      toast.dismiss(loadingToastId);
      toast.success(`Export ready: ${data?.exportId || 'ok'}`);
    } catch (err) {
      const e = err as { error?: string; message?: string };
      toast.dismiss(loadingToastId);
      toast.error(e.error || e.message || 'Export failed');
    } finally {
      setInvestorActionLoading(false);
    }
  };

  const shareAnalysisToOrganization = async () => {
    if (!resolvedId) return;
    const organizationId = window.prompt('Organization ID giriniz (Organizations sayfasından):');
    if (!organizationId) return;

    setInvestorActionLoading(true);
    const loadingToastId = toast.loading('Sharing analysis to organization...');
    try {
      await apiFetch(`workspace/${organizationId}/shared-analysis`, {
        method: 'POST',
        body: JSON.stringify({ propertyId: resolvedId }),
      });
      toast.dismiss(loadingToastId);
      toast.success('Analysis shared to organization workspace');
    } catch (err) {
      const e = err as { error?: string; message?: string };
      toast.dismiss(loadingToastId);
      toast.error(e.error || e.message || 'Share analysis failed');
    } finally {
      setInvestorActionLoading(false);
    }
  };

  const addToSharedWorkspacePortfolio = async () => {
    if (!resolvedId) return;
    const organizationId = window.prompt('Organization ID giriniz (Organizations sayfasından):');
    if (!organizationId) return;
    const title = window.prompt('Shared portfolio adı', 'Shared Portfolio') || 'Shared Portfolio';

    setInvestorActionLoading(true);
    const loadingToastId = toast.loading('Adding property to shared workspace portfolio...');
    try {
      await apiFetch(`workspace/${organizationId}/portfolios`, {
        method: 'POST',
        body: JSON.stringify({ propertyId: resolvedId, title }),
      });
      toast.dismiss(loadingToastId);
      toast.success('Property added to shared workspace portfolio');
    } catch (err) {
      const e = err as { error?: string; message?: string };
      toast.dismiss(loadingToastId);
      toast.error(e.error || e.message || 'Shared portfolio action failed');
    } finally {
      setInvestorActionLoading(false);
    }
  };

  const addToSharedWorkspaceWatchlist = async () => {
    if (!resolvedId) return;
    const organizationId = window.prompt('Organization ID giriniz (Organizations sayfasından):');
    if (!organizationId) return;

    setInvestorActionLoading(true);
    const loadingToastId = toast.loading('Adding property to shared workspace watchlist...');
    try {
      await apiFetch(`workspace/${organizationId}/watchlist`, {
        method: 'POST',
        body: JSON.stringify({ propertyId: resolvedId }),
      });
      toast.dismiss(loadingToastId);
      toast.success('Property added to shared workspace watchlist');
    } catch (err) {
      const e = err as { error?: string; message?: string };
      toast.dismiss(loadingToastId);
      toast.error(e.error || e.message || 'Shared watchlist action failed');
    } finally {
      setInvestorActionLoading(false);
    }
  };

  if (isAdminPath && user?.role !== 'ADMIN') {
    return <div className="text-center mt-20">Yönetici yetkisi gerekli</div>;
  }

  if (error) return <div className="text-center mt-20 text-red-600">{error}</div>;
  if (!detail) return <div className="text-center mt-20">Yükleniyor...</div>;

  const {
    property,
    owner,
    creator,
    creationSource,
    generatedPropertyTitle,
    titleDerivation,
    documents,
    auditReferences,
    latestAnalysis,
  } = detail;

  const formatMoney = (value?: number) =>
    typeof value === 'number' ? `${value.toLocaleString('tr-TR')} TL` : '-';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'REVIEWING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 break-words mb-2">
                {generatedPropertyTitle || 'Property'}
              </h1>
              <p className="text-lg text-gray-600 break-words mb-3">
                {property.addressText || 'No address'} • {property.il}/{property.ilce}
              </p>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                    property.status || 'NEW'
                  )}`}
                >
                  {property.status || 'NEW'}
                </span>
                {latestAnalysis && (
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-800 border border-indigo-300">
                    Analysis Ready
                  </span>
                )}
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <div className="text-xs text-blue-600 font-semibold uppercase">Price</div>
                <div className="text-2xl font-bold text-blue-900">
                  {formatMoney(property.askingPriceTRY)}
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-lg border border-emerald-200">
                <div className="text-xs text-emerald-600 font-semibold uppercase">Area</div>
                <div className="text-2xl font-bold text-emerald-900">
                  {property.areaM2 || '-'} m²
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <div className="text-xs text-purple-600 font-semibold uppercase">Price/m²</div>
                <div className="text-2xl font-bold text-purple-900">
                  {formatMoney(property.pricePerM2)}
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                <div className="text-xs text-orange-600 font-semibold uppercase">Docs</div>
                <div className="text-2xl font-bold text-orange-900">{documents.length}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Admin Actions */}
      {isAdminPath && (
        <div className="sticky top-0 z-40 bg-white border-b shadow-md">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => updateStatus('REVIEWING')}
                disabled={statusUpdating || statusValue === 'REVIEWING'}
                className="px-4 py-2 rounded text-sm font-semibold bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-50"
              >
                👁 Reviewing
              </button>
              <button
                onClick={() => updateStatus('APPROVED')}
                disabled={statusUpdating || statusValue === 'APPROVED'}
                className="px-4 py-2 rounded text-sm font-semibold bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
              >
                ✓ Approve
              </button>
              <button
                onClick={() => updateStatus('REJECTED')}
                disabled={statusUpdating || statusValue === 'REJECTED'}
                className="px-4 py-2 rounded text-sm font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
              >
                ✕ Reject
              </button>
              <button
                onClick={rerunAnalysis}
                disabled={rerunLoading}
                className="px-4 py-2 rounded text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                📊 Rerun Analysis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Investor Actions */}
      {!isAdminPath && (
        <div className="sticky top-0 z-30 bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={saveAnalysis}
                disabled={investorActionLoading || !latestAnalysis}
                className="px-4 py-2 rounded text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
              >
                Save Analysis
              </button>
              <button
                onClick={addToWatchlist}
                disabled={investorActionLoading}
                className="px-4 py-2 rounded text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Add to Watchlist
              </button>
              <button
                onClick={addToPortfolio}
                disabled={investorActionLoading}
                className="px-4 py-2 rounded text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                Add to Portfolio
              </button>
              <button
                onClick={exportAnalysis}
                disabled={investorActionLoading || !latestAnalysis}
                className="px-4 py-2 rounded text-sm font-semibold bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50"
              >
                Export Analysis JSON
              </button>
              <button
                onClick={shareAnalysisToOrganization}
                disabled={investorActionLoading || !latestAnalysis}
                className="px-4 py-2 rounded text-sm font-semibold bg-indigo-700 text-white hover:bg-indigo-800 disabled:opacity-50"
              >
                Share Analysis to Organization
              </button>
              <button
                onClick={addToSharedWorkspacePortfolio}
                disabled={investorActionLoading}
                className="px-4 py-2 rounded text-sm font-semibold bg-fuchsia-700 text-white hover:bg-fuchsia-800 disabled:opacity-50"
              >
                Add to Shared Workspace Portfolio
              </button>
              <button
                onClick={addToSharedWorkspaceWatchlist}
                disabled={investorActionLoading}
                className="px-4 py-2 rounded text-sm font-semibold bg-cyan-700 text-white hover:bg-cyan-800 disabled:opacity-50"
              >
                Add to Shared Workspace Watchlist
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Analysis Section */}
        {latestAnalysis && (
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-md">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Analysis Intelligence Dashboard</h2>
                <p className="mt-1 text-sm text-slate-600">Explainable, evidence-backed property intelligence</p>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">Signal</div>
                <div className="text-lg font-semibold text-blue-900">{latestAnalysis.signal}</div>
              </div>
            </div>

            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <strong>DISCLAIMER:</strong> Preliminary rule-based analysis, not a certified valuation. Uses submitted fields and document evidence only.
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-12">
              <div className="xl:col-span-2">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <GovernanceBadge classification={latestAnalysis.governanceClassification} />
                </div>
              </div>
              <div className="xl:col-span-2">
                <TrustClassificationCard
                  trustScore={latestAnalysis.trustScore}
                  compliance={latestAnalysis.reportDisclosureSummary?.compliance}
                />
              </div>
              <div className="xl:col-span-2">
                <ConfidenceMeter
                  score={latestAnalysis.reportConfidenceSummary?.score}
                  classification={latestAnalysis.reportConfidenceSummary?.classification}
                />
              </div>
              <div className="xl:col-span-2">
                <EvidenceStrengthCard
                  evidenceStrength={latestAnalysis.reportEvidenceSummary?.evidenceStrength}
                  sourcesAvailable={latestAnalysis.reportEvidenceSummary?.sourcesAvailable}
                  sourcesTotal={latestAnalysis.reportEvidenceSummary?.sourcesTotal}
                />
              </div>
              <div className="xl:col-span-2">
                <MissingDataImpactCard
                  missingDataImpact={latestAnalysis.reportConfidenceSummary?.missingDataImpact}
                  penaltyReasons={latestAnalysis.reportConfidenceSummary?.penaltyReasons}
                />
              </div>
              <div className="xl:col-span-2">
                <SourceProvenanceCard trace={latestAnalysis.evidenceTrace} />
              </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-12">
              <div className="xl:col-span-7">
                <DisclosurePanel
                  mode={latestAnalysis.reportDisclosureSummary?.mode}
                  lines={latestAnalysis.reportDisclosureSummary?.lines}
                />
              </div>
              <div className="xl:col-span-5">
                <GovernanceWarningsPanel
                  unsupportedAssumptions={latestAnalysis.unsupportedAssumptions}
                  speculativeIndicators={latestAnalysis.speculativeIndicators}
                />
              </div>
            </div>

            {latestAnalysis.territorialIntelligence && (
              <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-slate-900">Territorial Intelligence Depth</h3>
                  <p className="text-xs text-slate-600">
                    Real-signal deterministic synthesis with explicit provenance fields. No guaranteed planning or appreciation outcomes.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                  <div className="xl:col-span-3"><MacroGrowthCard macroDirection={latestAnalysis.territorialIntelligence.macroDirection} /></div>
                  <div className="xl:col-span-3"><PlanningSignalCard planningLayer={latestAnalysis.territorialIntelligence.planningLayer} /></div>
                  <div className="xl:col-span-3"><ImarProbabilityCard probability={latestAnalysis.territorialIntelligence.planningProbability} /></div>
                  <div className="xl:col-span-3"><InfrastructurePressureCard pressure={latestAnalysis.territorialIntelligence.infrastructurePressure} /></div>
                  <div className="xl:col-span-3"><RegionalDemandCard regionalDemand={latestAnalysis.territorialIntelligence.regionalDemand} /></div>
                  <div className="xl:col-span-3"><LiquidityScoreCard liquidity={latestAnalysis.territorialIntelligence.liquidityProfile} /></div>
                  <div className="xl:col-span-3"><DemographicPressureCard demographic={latestAnalysis.territorialIntelligence.demographicTrajectory} /></div>
                  <div className="xl:col-span-3"><DevelopmentForecastCard forecast={latestAnalysis.territorialIntelligence.developmentProbability} /></div>
                  <div className="xl:col-span-3"><TerritorialEvolutionCard evolution={latestAnalysis.territorialIntelligence.territorialEvolution} /></div>
                  <div className="xl:col-span-3"><StrategicRegionScoreCard score={latestAnalysis.territorialIntelligence.strategicRegionScore} /></div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
              <div className="xl:col-span-6">
                <ScoreBreakdownCard
                  score={latestAnalysis.score}
                  confidence={latestAnalysis.confidence}
                  factorsUsed={latestAnalysis.factorsUsed}
                />
              </div>
              <div className="xl:col-span-3">
                <ConfidenceCard
                  confidence={latestAnalysis.confidence}
                  missingInputs={latestAnalysis.missingInputs}
                  factorsUsed={latestAnalysis.factorsUsed}
                  documentCount={documents.length}
                />
              </div>
              <div className="xl:col-span-3">
                <ValuationBandCard
                  askingPriceTRY={property.askingPriceTRY}
                  valuationBand={latestAnalysis.valuationBand}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
              <div className="xl:col-span-4">
                <MarketPositionCard
                  marketPosition={latestAnalysis.marketPosition}
                  liquiditySignal={latestAnalysis.liquiditySignal}
                  developerFit={latestAnalysis.developerFit}
                  zoningPotential={latestAnalysis.zoningPotential}
                  signal={latestAnalysis.signal}
                  score={latestAnalysis.score}
                />
              </div>
              <div className="xl:col-span-4">
                <RiskMatrix risks={latestAnalysis.risks} />
              </div>
              <div className="xl:col-span-4">
                <RecommendationTimeline
                  recommendation={latestAnalysis.recommendation}
                  recommendations={latestAnalysis.recommendations}
                  risks={latestAnalysis.risks}
                  missingInputs={latestAnalysis.missingInputs}
                  marketPosition={latestAnalysis.marketPosition}
                  developerFit={latestAnalysis.developerFit}
                />
              </div>
            </div>

            <div className="mt-4">
              <AnalysisFactorsGrid
                property={{
                  areaM2: property.areaM2,
                  zoningStatus: property.zoningStatus,
                  roadAccess: property.roadAccess,
                  electricity: property.electricity,
                  water: property.water,
                }}
                documentCount={documents.length}
                factorsUsed={latestAnalysis.factorsUsed}
              />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
              <div className="xl:col-span-4">
                <ComparablePropertiesCard
                  comparableCount={latestAnalysis.comparableCount}
                  avgComparablePricePerM2={latestAnalysis.avgComparablePricePerM2}
                  comparableSummary={latestAnalysis.comparableSummary}
                />
              </div>
              <div className="xl:col-span-3">
                <MarketHeatCard
                  marketHeat={latestAnalysis.marketHeat}
                  comparableCount={latestAnalysis.comparableCount}
                />
              </div>
              <div className="xl:col-span-3">
                <PricingPositionCard
                  pricingPosition={latestAnalysis.pricingPosition}
                  subjectPricePerM2={
                    typeof latestAnalysis.factorsUsed?.subjectPricePerM2 === 'number'
                      ? latestAnalysis.factorsUsed.subjectPricePerM2
                      : property.pricePerM2
                  }
                  avgComparablePricePerM2={latestAnalysis.avgComparablePricePerM2}
                />
              </div>
              <div className="xl:col-span-2">
                <OpportunitySignalCard
                  opportunitySignals={latestAnalysis.opportunitySignals}
                  overpricingRisk={latestAnalysis.overpricingRisk}
                />
              </div>
            </div>

            <div className="mt-4">
              <ComparableTable rows={latestAnalysis.topComparables} />
            </div>

            {latestAnalysis.infrastructureScore !== undefined && (
              <div className="mt-4">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
                  <div className="xl:col-span-1">
                    <InfrastructureCard
                      infrastructureScore={latestAnalysis.infrastructureScore}
                      roadAccessScore={latestAnalysis.roadAccessScore}
                      utilityCoverage={latestAnalysis.utilityCoverage}
                    />
                  </div>
                  {latestAnalysis.regionalDemand && (
                    <div className="xl:col-span-1">
                      <RegionalDemandCard regionalDemand={latestAnalysis.regionalDemand} />
                    </div>
                  )}
                  {latestAnalysis.growthPotential && (
                    <div className="xl:col-span-1">
                      <GrowthPotentialCard growthPotential={latestAnalysis.growthPotential} />
                    </div>
                  )}
                  {latestAnalysis.strategicLocationSignals && (
                    <div className="xl:col-span-1">
                      <StrategicLocationCard strategicLocationSignals={latestAnalysis.strategicLocationSignals} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {latestAnalysis.geoSummary && (
              <div className="mt-4">
                <GeoIntelligenceGrid
                  infrastructureScore={latestAnalysis.infrastructureScore || 0}
                  roadAccessScore={latestAnalysis.roadAccessScore || 0}
                  utilityCoverage={latestAnalysis.utilityCoverage}
                  growthPotential={latestAnalysis.growthPotential}
                  regionalDemand={latestAnalysis.regionalDemand}
                  strategicLocationSignals={latestAnalysis.strategicLocationSignals || []}
                  geoSummary={latestAnalysis.geoSummary}
                />
              </div>
            )}

            {latestAnalysis.projectability && (
              <>
                <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
                  <div className="xl:col-span-4">
                    <DevelopmentPotentialCard
                      densityPotential={latestAnalysis.densityPotential}
                      projectability={latestAnalysis.projectability}
                    />
                  </div>
                  <div className="xl:col-span-2">
                    <DeveloperROICard developerROI={latestAnalysis.developerROI} />
                  </div>
                  <div className="xl:col-span-2">
                    <SubdivisionCard subdivisionPotential={latestAnalysis.subdivisionPotential} />
                  </div>
                  <div className="xl:col-span-2">
                    <ParcelMergeCard parcelMergeOpportunity={latestAnalysis.parcelMergeOpportunity} />
                  </div>
                  <div className="xl:col-span-2">
                    <RezoningUpsideCard rezoningUpside={latestAnalysis.rezoningUpside} />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
                  <div className="xl:col-span-4">
                    <ProjectabilityCard
                      projectability={latestAnalysis.projectability}
                      frontageDepthScore={latestAnalysis.frontageDepthScore}
                    />
                  </div>
                  <div className="xl:col-span-8">
                    <DevelopmentScenarioTimeline
                      developmentScenario={latestAnalysis.developmentScenario}
                      developmentSignals={latestAnalysis.developmentSignals}
                    />
                  </div>
                </div>
              </>
            )}

            {latestAnalysis.analysisVersion && (
              <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
                <div className="xl:col-span-3">
                  <RefreshStatusCard
                    refreshStatus={latestAnalysis.refreshStatus}
                    staleFlags={latestAnalysis.staleFlags}
                  />
                </div>
                <div className="xl:col-span-3">
                  <MarketFreshnessCard
                    freshnessScore={latestAnalysis.freshnessScore}
                    cacheState={latestAnalysis.cacheState}
                  />
                </div>
                <div className="xl:col-span-2">
                  <DataConfidenceCard
                    sourceConfidence={latestAnalysis.sourceConfidence}
                    ingestionSignals={latestAnalysis.ingestionSignals}
                  />
                </div>
                <div className="xl:col-span-2">
                  <AnalysisVersionCard
                    analysisVersion={latestAnalysis.analysisVersion}
                    cacheTimestamp={latestAnalysis.cacheTimestamp}
                  />
                </div>
                <div className="xl:col-span-2">
                  <IntelligenceSourceCard
                    ingestionSignals={latestAnalysis.ingestionSignals}
                    refreshReason={latestAnalysis.refreshReason}
                  />
                </div>
              </div>
            )}

            {latestAnalysis.connectorStatus && (
              <div className="mt-4 rounded-xl border border-cyan-200 bg-cyan-50/40 p-4">
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-cyan-900">Market Signal Network</h3>
                  <p className="text-xs text-cyan-700">
                    Deterministic connector states and trend outputs. No external live feed is assumed unless explicitly configured.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                  <div className="xl:col-span-4">
                    <ConnectorStatusCard connectorStatus={latestAnalysis.connectorStatus} />
                  </div>
                  <div className="xl:col-span-2">
                    <MarketMomentumCard
                      marketMomentum={latestAnalysis.marketMomentum}
                      trendSignals={latestAnalysis.trendSignals}
                    />
                  </div>
                  <div className="xl:col-span-2">
                    <DistrictHeatCard
                      districtHeat={latestAnalysis.districtHeat}
                      volatilityIndex={latestAnalysis.volatilityIndex}
                    />
                  </div>
                  <div className="xl:col-span-2">
                    <TrendOpportunitySignalCard
                      opportunityScore={latestAnalysis.opportunityScore}
                      alertSignals={latestAnalysis.alertSignals}
                    />
                  </div>
                  <div className="xl:col-span-2">
                    <InvestorSignalCard
                      investorSignal={latestAnalysis.investorSignal}
                      trendSignals={latestAnalysis.trendSignals}
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
                  <div className="xl:col-span-3">
                    <TrendVelocityCard
                      velocityScore={latestAnalysis.trendVelocity?.velocityScore}
                      velocityLabel={latestAnalysis.trendVelocity?.velocityLabel}
                      liquidityTrend={latestAnalysis.liquidityTrend?.liquidityTrend}
                    />
                  </div>
                  <div className="xl:col-span-9 rounded-xl border border-cyan-200 bg-white p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-cyan-700">Trend Signals</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(latestAnalysis.trendSignals || []).length > 0 ? (
                        (latestAnalysis.trendSignals || []).map((signal, idx) => (
                          <span
                            key={`${signal}-${idx}`}
                            className="rounded-full border border-cyan-200 bg-cyan-50 px-2 py-1 text-xs text-cyan-800"
                          >
                            {signal}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-600">No trend signals available.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {latestAnalysis.ingestionGovernance && (
              <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50/40 p-4">
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-violet-900">Governed Ingestion Layer</h3>
                  <p className="text-xs text-violet-700">
                    Deterministic ingestion governance with explicit activation, legal restrictions, provenance, and freshness downgrade visibility.
                  </p>
                </div>

                <div className="mb-3 rounded-lg border border-violet-200 bg-white px-3 py-2 text-xs text-violet-900">
                  No fake ACTIVE proof: {latestAnalysis.ingestionGovernance.noFakeActiveProof ? 'PASS' : 'FAIL'}
                </div>

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                  <div className="xl:col-span-3"><ConnectorGovernanceCard governance={latestAnalysis.ingestionGovernance.connectorGovernance} /></div>
                  <div className="xl:col-span-3"><ConnectorHealthCard connectors={latestAnalysis.ingestionGovernance.connectors} /></div>
                  <div className="xl:col-span-3"><ConnectorCapabilityCard connectors={latestAnalysis.ingestionGovernance.connectors} /></div>
                  <div className="xl:col-span-3"><RateLimitStatusCard quota={latestAnalysis.ingestionGovernance.quota} /></div>
                  <div className="xl:col-span-3"><IngestionFreshnessCard cacheEnvelope={latestAnalysis.ingestionGovernance.cacheEnvelope} /></div>
                  <div className="xl:col-span-3"><IngestionAuditCard auditTrail={latestAnalysis.ingestionGovernance.auditTrail} /></div>
                  <div className="xl:col-span-3"><SourceLineageCard lineage={latestAnalysis.ingestionGovernance.provenance?.lineage} /></div>
                  <div className="xl:col-span-3"><SourceTrustCard trust={latestAnalysis.ingestionGovernance.trust} /></div>
                  <div className="xl:col-span-3"><LegalClassificationCard disclosures={latestAnalysis.ingestionGovernance.disclosures} /></div>
                  <div className="xl:col-span-3"><GovernanceRestrictionCard compliance={latestAnalysis.ingestionGovernance.compliance} /></div>
                </div>
              </div>
            )}

            {latestAnalysis.operationalIntelligence && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-emerald-900">Operational Intelligence Layer</h3>
                  <p className="text-xs text-emerald-700">
                    Continuous monitoring, deterministic temporal tracking, governed alert routing, and strategic opportunity surfacing.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                  <div className="xl:col-span-3"><TerritorialMonitoringCard monitoring={latestAnalysis.operationalIntelligence.monitoring} /></div>
                  <div className="xl:col-span-3"><EvolutionTimelineCard timeline={latestAnalysis.operationalIntelligence.parcelTimeline} /></div>
                  <div className="xl:col-span-3"><OperationalOpportunitySignalCard opportunity={latestAnalysis.operationalIntelligence.opportunities?.undervaluedCluster} /></div>
                  <div className="xl:col-span-3"><StrategicOpportunityCard strategic={latestAnalysis.operationalIntelligence.opportunities?.strategicOpportunity} /></div>
                  <div className="xl:col-span-3"><AnomalyDetectionCard anomaly={latestAnalysis.operationalIntelligence.anomalies?.speculativeAnomaly} /></div>
                  <div className="xl:col-span-3"><RegionalTransformationCard transformation={latestAnalysis.operationalIntelligence.regionalTransformation} /></div>
                  <div className="xl:col-span-3"><InfrastructureExpansionCard expansion={latestAnalysis.operationalIntelligence.infrastructureHistory} /></div>
                  <div className="xl:col-span-3"><InvestorAlertCard alert={latestAnalysis.operationalIntelligence.alerts?.investorAlert} /></div>
                  <div className="xl:col-span-3"><ForecastDirectionCard forecast={latestAnalysis.operationalIntelligence.history?.regionalForecast} /></div>
                  <div className="xl:col-span-3"><HistoricalEvidenceCard archive={latestAnalysis.operationalIntelligence.history?.archive} /></div>
                </div>
              </div>
            )}

            {latestAnalysis.autonomyIntelligence && (
              <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50/40 p-4">
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-sky-900">Autonomous Strategic Intelligence Layer</h3>
                  <p className="text-xs text-sky-700">
                    Deterministic autonomous orchestration with governed escalation, review queue visibility, suppression governance, and cadence/degradation controls.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                  <div className="xl:col-span-3"><AutonomousMonitoringCard monitor={latestAnalysis.autonomyIntelligence.autonomy?.autonomy} /></div>
                  <div className="xl:col-span-3"><AutonomousIntelligenceCard insight={latestAnalysis.autonomyIntelligence.autonomy?.autonomy} /></div>
                  <div className="xl:col-span-3"><InvestorPriorityCard priority={latestAnalysis.autonomyIntelligence.watchlist?.investor} /></div>
                  <div className="xl:col-span-3"><WatchlistActivityCard watchlist={latestAnalysis.autonomyIntelligence.watchlist?.aggregate} /></div>
                  <div className="xl:col-span-3"><ParcelWatchlistCard watch={latestAnalysis.autonomyIntelligence.watchlist?.parcel} /></div>
                  <div className="xl:col-span-3"><RegionWatchCard watch={latestAnalysis.autonomyIntelligence.watchlist?.region} /></div>
                  <div className="xl:col-span-3"><IntelligenceFeedCard feed={latestAnalysis.autonomyIntelligence.feeds?.unified} /></div>
                  <div className="xl:col-span-3"><PortfolioIntelligenceCard portfolio={latestAnalysis.autonomyIntelligence.portfolio?.intelligence} /></div>
                  <div className="xl:col-span-3"><PortfolioExposureCard exposure={latestAnalysis.autonomyIntelligence.portfolio?.exposure} /></div>
                  <div className="xl:col-span-3"><StrategicMonitoringCard strategic={latestAnalysis.autonomyIntelligence.strategic?.radar} /></div>
                  <div className="xl:col-span-3"><StrategicRegionCard region={latestAnalysis.autonomyIntelligence.strategic?.regionMonitor} /></div>
                  <div className="xl:col-span-3"><RegionalSurveillanceCard surveillance={latestAnalysis.autonomyIntelligence.strategic?.surveillance} /></div>
                  <div className="xl:col-span-3"><OpportunityPriorityCard opportunity={latestAnalysis.autonomyIntelligence.prioritization?.opportunityMatrix} /></div>
                  <div className="xl:col-span-3"><GovernedEscalationCard escalation={latestAnalysis.autonomyIntelligence.prioritization?.governedEscalationQueue} /></div>
                  <div className="xl:col-span-3"><EscalationTimelineCard escalation={latestAnalysis.autonomyIntelligence.prioritization?.governedEscalationQueue} /></div>
                  <div className="xl:col-span-3"><ReviewQueueCard queue={latestAnalysis.autonomyIntelligence.operations?.reviewQueue} /></div>
                  <div className="xl:col-span-3"><AutonomousReviewQueueCard queue={latestAnalysis.autonomyIntelligence.operations?.reviewQueue} /></div>
                  <div className="xl:col-span-3"><SuppressionGovernanceCard suppression={latestAnalysis.autonomyIntelligence.operations?.suppression} /></div>
                  <div className="xl:col-span-3"><CadenceAndDegradationCard cadence={latestAnalysis.autonomyIntelligence.autonomy?.cadence} degradation={latestAnalysis.autonomyIntelligence.operations?.degradation} /></div>
                </div>
              </div>
            )}

            {(latestAnalysis.strengths?.length || latestAnalysis.missingInputs?.length) && (
              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <h4 className="text-sm font-semibold text-emerald-900">Strength highlights</h4>
                  <ul className="mt-2 space-y-1 text-sm text-emerald-800">
                    {(latestAnalysis.strengths || []).length > 0 ? (
                      (latestAnalysis.strengths || []).map((item, i) => <li key={`${item}-${i}`}>• {item}</li>)
                    ) : (
                      <li>• No strengths were provided for this run.</li>
                    )}
                  </ul>
                </div>

                <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                  <h4 className="text-sm font-semibold text-orange-900">Information gaps</h4>
                  <ul className="mt-2 space-y-1 text-sm text-orange-800">
                    {(latestAnalysis.missingInputs || []).length > 0 ? (
                      (latestAnalysis.missingInputs || []).map((item, i) => <li key={`${item}-${i}`}>• {item}</li>)
                    ) : (
                      <li>• No missing input fields detected.</li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Document Gallery */}
        <section className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Documents & Media</h2>

          {documents.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-5xl mb-2">📁</div>
              <p className="text-gray-500">No documents uploaded yet</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
                {documents.map((doc) => (
                  <div
                    key={doc._id}
                    className="group cursor-pointer"
                    onClick={() => {
                      setSelectedDoc(doc);
                      setModalOpen(true);
                    }}
                  >
                    <div className="bg-gray-100 rounded-lg overflow-hidden border border-gray-200 aspect-square flex items-center justify-center group-hover:shadow-lg transition-shadow relative">
                      {['jpeg', 'jpg', 'png', 'gif', 'webp'].some((ext) =>
                        doc.originalName.toLowerCase().endsWith(`.${ext}`)
                      ) ? (
                        <img
                          src={doc.fileUrl}
                          alt={doc.originalName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="text-4xl">
                          {doc.originalName.toLowerCase().endsWith('.pdf') ? '📕' : '📄'}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          👁 Preview
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2 truncate group-hover:text-gray-900">
                      {doc.originalName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(doc.createdAt || doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Link
                  to={
                    isAdminPath
                      ? `/admin/properties/${resolvedId}/documents`
                      : `/properties/${resolvedId}/documents`
                  }
                  className="flex-1 text-center bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
                >
                  📤 Upload Documents
                </Link>
                <button
                  onClick={() => rerunAnalysis()}
                  disabled={rerunLoading}
                  className="px-4 py-2 rounded-lg font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {rerunLoading ? 'Running...' : '🔄 Rerun Analysis'}
                </button>
              </div>
            </>
          )}
        </section>

        {/* Property Provenance Section */}
        <section className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Property Provenance</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Generated Title</h3>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 break-words">
                {generatedPropertyTitle || 'N/A'}
              </div>

              <h3 className="font-semibold text-gray-900 mt-4 mb-2">Title Derivation</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <span className="font-medium text-gray-700">Owner:</span>{' '}
                  <span className="text-gray-600">{titleDerivation?.ownerName || '-'}</span>
                </li>
                <li>
                  <span className="font-medium text-gray-700">Address:</span>{' '}
                  <span className="text-gray-600 break-words">{titleDerivation?.address || '-'}</span>
                </li>
                <li>
                  <span className="font-medium text-gray-700">City:</span>{' '}
                  <span className="text-gray-600">{titleDerivation?.city || '-'}</span>
                </li>
                <li>
                  <span className="font-medium text-gray-700">District:</span>{' '}
                  <span className="text-gray-600">{titleDerivation?.district || '-'}</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Creation Metadata</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="font-medium text-blue-900">Source</div>
                  <div className="text-blue-800">{creationSource || 'Unknown'}</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <div className="font-medium text-purple-900">Created By</div>
                  <div className="text-purple-800">
                    {creator?.name || 'Unknown'} ({creator?.email || 'N/A'})
                  </div>
                </div>
                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                  <div className="font-medium text-emerald-900">Owner</div>
                  <div className="text-emerald-800">
                    {owner?.name || 'Unknown'} ({owner?.email || 'N/A'})
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Audit Timeline */}
        <section className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Activity Timeline</h2>

          {auditReferences.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No activity recorded</div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {[...auditReferences]
                .reverse()
                .map((item) => (
                  <TimelineItem
                    key={item._id}
                    item={item}
                    isExpanded={expandedAuditId === item._id}
                    onToggle={() =>
                      setExpandedAuditId(expandedAuditId === item._id ? null : item._id)
                    }
                  />
                ))}
            </div>
          )}
        </section>

        {/* Property Details Grid */}
        <section className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Property Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-lg border border-slate-200">
              <div className="text-xs text-slate-600 font-semibold uppercase mb-1">Tapu Type</div>
              <div className="font-semibold text-slate-900">{property.tapuType || '-'}</div>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-lg border border-slate-200">
              <div className="text-xs text-slate-600 font-semibold uppercase mb-1">Zoning</div>
              <div className="font-semibold text-slate-900">{property.zoningStatus || '-'}</div>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-lg border border-slate-200">
              <div className="text-xs text-slate-600 font-semibold uppercase mb-1">Parcel</div>
              <div className="font-semibold text-slate-900">
                {property.ada && property.parsel ? `${property.ada}/${property.parsel}` : '-'}
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-lg border border-slate-200">
              <div className="text-xs text-slate-600 font-semibold uppercase mb-1">Utilities</div>
              <div className="font-semibold text-slate-900">
                E: {property.electricity || '-'} / W: {property.water || '-'}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Document Modal */}
      <DocumentModal
        isOpen={modalOpen}
        doc={selectedDoc}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}




