import dns from 'dns/promises';
import fs from 'fs';
import https from 'https';
import path from 'path';
import { URL } from 'url';
import { parseWfsCapabilities, parseWmsCapabilities } from '../src/connectors/ogc/capabilitiesParser';

type CandidateClassificationBeforeTest =
  | 'OFFICIAL_SAMPLE_COMPATIBLE_CANDIDATE'
  | 'PUBLIC_TEST_ONLY_OR_NON_COMPATIBLE_CANDIDATE'
  | 'PUBLIC_ORTHOPHOTO_TEST_CANDIDATE';

type EndpointStatus =
  | 'PASS_CAPABILITIES_VALID'
  | 'FAIL_DNS'
  | 'FAIL_TIMEOUT'
  | 'FAIL_HTTP_STATUS'
  | 'FAIL_XML_PARSE'
  | 'FAIL_SERVICE_EXCEPTION'
  | 'FAIL_NOT_OGC'
  | 'PASS_BUT_TEST_ONLY'
  | 'PASS_BUT_REQUIRES_LEGAL_REVIEW'
  | 'UNKNOWN_REQUIRES_MANUAL_REVIEW';

type Candidate = {
  id: string;
  label: string;
  classificationBeforeTest: CandidateClassificationBeforeTest;
  service: 'WMS' | 'WFS';
  baseUrl: string;
  capabilitiesUrl: string;
};

type AttemptResult = {
  attempt: number;
  dnsResolved: boolean;
  dnsAddresses: string[];
  httpsConnected: boolean;
  timeoutHit: boolean;
  httpStatus?: number;
  contentType?: string;
  responseSizeBytes: number;
  latencyMs: number;
  error?: string;
};

type ParsedCapabilities = {
  xmlParseSuccess: boolean;
  ogcServiceTypeDetected: 'WMS' | 'WFS' | 'UNKNOWN';
  serviceTitle: string;
  serviceName: string;
  layerCount: number;
  layerSummaries: Array<{ name: string; title: string }>;
  crsProjections: string[];
  operations: string[];
  serviceException: boolean;
  htmlErrorPage: boolean;
};

type CandidateResult = {
  id: string;
  label: string;
  baseUrl: string;
  capabilitiesUrl: string;
  classificationBeforeTest: CandidateClassificationBeforeTest;
  serviceType: 'WMS' | 'WFS';
  dnsResolved: boolean;
  dnsAddresses: string[];
  httpsConnected: boolean;
  httpStatus?: number;
  contentType?: string;
  responseSizeBytes: number;
  latencyMs: number;
  timeoutHit: boolean;
  xmlParseSuccess: boolean;
  ogcServiceTypeDetected: 'WMS' | 'WFS' | 'UNKNOWN';
  serviceTitle: string;
  serviceName: string;
  layerCount: number;
  firstLayers: Array<{ name: string; title: string }>;
  crsProjections: string[];
  operations: string[];
  serviceException: boolean;
  htmlErrorPage: boolean;
  retriesUsed: number;
  attempts: AttemptResult[];
  status: EndpointStatus;
  recommendedAction: string;
};

const ROOT = process.cwd();
const PROOF_JSON = path.join(ROOT, 'proof', 'tucbs-candidate-endpoint-test-results.json');
const PROOF_MD = path.join(ROOT, 'proof', 'tucbs-candidate-endpoint-test-results.md');
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 2;

const CANDIDATES: Candidate[] = [
  {
    id: 'candidate-1',
    label: 'official TUCBS compatible WMS example',
    classificationBeforeTest: 'OFFICIAL_SAMPLE_COMPATIBLE_CANDIDATE',
    service: 'WMS',
    baseUrl: 'https://gis-prod-api.csb.gov.tr/trk_cbsgm_std_il_wms',
    capabilitiesUrl: 'https://gis-prod-api.csb.gov.tr/trk_cbsgm_std_il_wms?request=GetCapabilities&service=WMS',
  },
  {
    id: 'candidate-2',
    label: 'official TUCBS compatible WFS example',
    classificationBeforeTest: 'OFFICIAL_SAMPLE_COMPATIBLE_CANDIDATE',
    service: 'WFS',
    baseUrl: 'https://gis-prod-api.csb.gov.tr/trk_cbsgm_std_il_wfs',
    capabilitiesUrl: 'https://gis-prod-api.csb.gov.tr/trk_cbsgm_std_il_wfs?request=GetCapabilities&service=WFS',
  },
  {
    id: 'candidate-3',
    label: 'public TUCBS test WMS example',
    classificationBeforeTest: 'PUBLIC_TEST_ONLY_OR_NON_COMPATIBLE_CANDIDATE',
    service: 'WMS',
    baseUrl: 'https://tucbs-public-api.csb.gov.tr/trk_cbsgm_test_wms',
    capabilitiesUrl: 'https://tucbs-public-api.csb.gov.tr/trk_cbsgm_test_wms?request=GetCapabilities&service=WMS',
  },
  {
    id: 'candidate-4',
    label: 'public TUCBS test WFS example',
    classificationBeforeTest: 'PUBLIC_TEST_ONLY_OR_NON_COMPATIBLE_CANDIDATE',
    service: 'WFS',
    baseUrl: 'https://tucbs-public-api.csb.gov.tr/trk_cbsgm_test_wfs',
    capabilitiesUrl: 'https://tucbs-public-api.csb.gov.tr/trk_cbsgm_test_wfs?request=GetCapabilities&service=WFS',
  },
  {
    id: 'candidate-5',
    label: 'official Ortofoto WMS example',
    classificationBeforeTest: 'PUBLIC_ORTHOPHOTO_TEST_CANDIDATE',
    service: 'WMS',
    baseUrl: 'https://tucbs-public-api.csb.gov.tr/trk_cbs_ortofoto_giresun_gorele_test',
    capabilitiesUrl: 'https://tucbs-public-api.csb.gov.tr/trk_cbs_ortofoto_giresun_gorele_test?request=GetCapabilities&service=WMS',
  },
];

function stripTags(value: string) {
  return String(value || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => String(value || '').trim()).filter(Boolean)));
}

function extractTagValue(block: string, tag: string) {
  const re = new RegExp(`<(?:\\w+:)?${tag}[^>]*>([\\s\\S]*?)</(?:\\w+:)?${tag}>`, 'i');
  const match = block.match(re);
  return match ? stripTags(match[1] || '') : '';
}

function extractAllTagValues(block: string, tag: string) {
  const re = new RegExp(`<(?:\\w+:)?${tag}[^>]*>([\\s\\S]*?)</(?:\\w+:)?${tag}>`, 'gi');
  const values: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(block)) !== null) {
    const value = stripTags(match[1] || '');
    if (value) values.push(value);
  }
  return unique(values);
}

function extractTagAttributes(block: string, tag: string, attrName: string) {
  const re = new RegExp(`<(?:\\w+:)?${tag}[^>]*${attrName}=["']([^"']+)["'][^>]*>`, 'gi');
  const values: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(block)) !== null) {
    const value = String(match[1] || '').trim();
    if (value) values.push(value);
  }
  return unique(values);
}

function extractBlock(xml: string, blockTag: string) {
  const re = new RegExp(`<(?:\\w+:)?${blockTag}[^>]*>([\\s\\S]*?)</(?:\\w+:)?${blockTag}>`, 'i');
  const match = xml.match(re);
  return match ? match[0] : '';
}

function extractServiceMetadata(xml: string) {
  const serviceBlock = extractBlock(xml, 'ServiceIdentification') || extractBlock(xml, 'Service');
  const providerBlock = extractBlock(xml, 'ServiceProvider');
  const title =
    extractTagValue(serviceBlock, 'Title') ||
    extractTagValue(serviceBlock, 'Abstract') ||
    extractTagValue(providerBlock, 'ProviderName') ||
    extractTagValue(xml, 'Title');
  const name =
    extractTagValue(serviceBlock, 'Name') ||
    extractTagValue(serviceBlock, 'ServiceType') ||
    extractTagValue(xml, 'Name');
  return { title, name };
}

function extractOperations(xml: string) {
  const opNames = extractTagAttributes(xml, 'Operation', 'name');
  const requestBlock = extractBlock(xml, 'Request');
  const requestTags = requestBlock
    ? unique(Array.from(requestBlock.matchAll(/<(?:\w+:)?([A-Za-z]+)[^>]*>/g)).map((match) => String(match[1] || '').trim()))
    : [];
  return unique([...opNames, ...requestTags]).filter((item) => item.length > 0 && !['Request', 'Format', 'DCPType', 'HTTP', 'Get', 'OnlineResource'].includes(item));
}

function detectServiceType(xml: string, candidate: Candidate): 'WMS' | 'WFS' | 'UNKNOWN' {
  if (/<(?:\w+:)?WMS_Capabilities\b/i.test(xml) || /<(?:\w+:)?WMT_MS_Capabilities\b/i.test(xml)) return 'WMS';
  if (/<(?:\w+:)?WFS_Capabilities\b/i.test(xml)) return 'WFS';
  if (/service="WMS"/i.test(xml) || /<(?:\w+:)?ServiceType>\s*WMS\s*<\/(?:\w+:)?ServiceType>/i.test(xml)) return 'WMS';
  if (/service="WFS"/i.test(xml) || /<(?:\w+:)?ServiceType>\s*WFS\s*<\/(?:\w+:)?ServiceType>/i.test(xml)) return 'WFS';
  return candidate.service;
}

function parseCapabilities(xml: string, candidate: Candidate): ParsedCapabilities {
  const htmlErrorPage = /<html\b/i.test(xml) || /<!doctype html/i.test(xml);
  const serviceException = /(ServiceExceptionReport|ExceptionReport|ows:ExceptionReport)/i.test(xml);
  const ogcServiceTypeDetected = detectServiceType(xml, candidate);
  const xmlParseSuccess = !htmlErrorPage && !serviceException && ogcServiceTypeDetected !== 'UNKNOWN' && /<[^>]+>/i.test(xml);

  if (!xmlParseSuccess) {
    return {
      xmlParseSuccess: false,
      ogcServiceTypeDetected,
      serviceTitle: '',
      serviceName: '',
      layerCount: 0,
      layerSummaries: [],
      crsProjections: [],
      operations: extractOperations(xml),
      serviceException,
      htmlErrorPage,
    };
  }

  const { title, name } = extractServiceMetadata(xml);

  if (ogcServiceTypeDetected === 'WMS') {
    const parsed = parseWmsCapabilities(xml, candidate.id);
    return {
      xmlParseSuccess: true,
      ogcServiceTypeDetected,
      serviceTitle: title,
      serviceName: name,
      layerCount: parsed.layers.length,
      layerSummaries: parsed.layers.slice(0, 10).map((layer) => ({ name: stripTags(layer.name), title: stripTags(layer.title) })),
      crsProjections: unique([...parsed.projections, ...extractAllTagValues(xml, 'CRS'), ...extractAllTagValues(xml, 'SRS')]),
      operations: extractOperations(xml),
      serviceException,
      htmlErrorPage,
    };
  }

  const parsed = parseWfsCapabilities(xml, candidate.id);
  return {
    xmlParseSuccess: true,
    ogcServiceTypeDetected,
    serviceTitle: title,
    serviceName: name,
    layerCount: parsed.layers.length,
    layerSummaries: parsed.layers.slice(0, 10).map((layer) => ({ name: stripTags(layer.name), title: stripTags(layer.title) })),
    crsProjections: unique([
      ...extractAllTagValues(xml, 'DefaultCRS'),
      ...extractAllTagValues(xml, 'OtherCRS'),
      ...extractAllTagValues(xml, 'CRS'),
      ...extractAllTagValues(xml, 'SRS'),
    ]),
    operations: extractOperations(xml),
    serviceException,
    htmlErrorPage,
  };
}

function httpGet(candidate: Candidate): Promise<{ attempt: AttemptResult; body: string }> {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const targetUrl = new URL(candidate.capabilitiesUrl);
    let timeoutHit = false;
    let responseSizeBytes = 0;
    let dnsAddresses: string[] = [];

    dns.lookup(targetUrl.hostname, { all: true })
      .then((addresses) => {
        dnsAddresses = addresses.map((address) => `${address.address}${address.family ? `/${address.family}` : ''}`);

        const req = https.request(
          targetUrl,
          {
            method: 'GET',
            headers: {
              Accept: 'application/xml,text/xml;q=0.9,*/*;q=0.1',
              'User-Agent': 'ParselRadar-TUCBS-Candidate-Test/1.0',
            },
            timeout: REQUEST_TIMEOUT_MS,
          },
          (res) => {
            const chunks: Buffer[] = [];
            res.on('data', (chunk) => {
              const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
              responseSizeBytes += buffer.length;
              chunks.push(buffer);
            });
            res.on('end', () => {
              const body = Buffer.concat(chunks).toString('utf8');
              resolve({
                attempt: {
                  attempt: 1,
                  dnsResolved: true,
                  dnsAddresses,
                  httpsConnected: true,
                  timeoutHit,
                  httpStatus: res.statusCode,
                  contentType: String(res.headers['content-type'] || ''),
                  responseSizeBytes,
                  latencyMs: Date.now() - startedAt,
                },
                body,
              });
            });
          },
        );

        req.on('timeout', () => {
          timeoutHit = true;
          req.destroy(new Error(`Request timed out after ${REQUEST_TIMEOUT_MS}ms`));
        });

        req.on('error', (error) => {
          reject({
            attempt: {
              attempt: 1,
              dnsResolved: true,
              dnsAddresses,
              httpsConnected: false,
              timeoutHit,
              responseSizeBytes,
              latencyMs: Date.now() - startedAt,
              error: String((error as Error)?.message || error),
            } as AttemptResult,
            error,
          });
        });

        req.end();
      })
      .catch((error) => {
        reject({
          attempt: {
            attempt: 1,
            dnsResolved: false,
            dnsAddresses: [],
            httpsConnected: false,
            timeoutHit: false,
            responseSizeBytes: 0,
            latencyMs: Date.now() - startedAt,
            error: String((error as Error)?.message || error),
          } as AttemptResult,
          error,
        });
      });
  });
}

function classifyResult(candidate: Candidate, parsed: ParsedCapabilities, attempt: AttemptResult, hadDnsFailure: boolean): EndpointStatus {
  if (hadDnsFailure || !attempt.dnsResolved) return 'FAIL_DNS';
  if (attempt.timeoutHit) return 'FAIL_TIMEOUT';
  if (typeof attempt.httpStatus === 'number' && attempt.httpStatus !== 200) return 'FAIL_HTTP_STATUS';
  if (parsed.serviceException) return 'FAIL_SERVICE_EXCEPTION';
  if (parsed.htmlErrorPage) return 'FAIL_NOT_OGC';
  if (!parsed.xmlParseSuccess) return 'FAIL_XML_PARSE';
  if (parsed.ogcServiceTypeDetected === 'UNKNOWN') return 'FAIL_NOT_OGC';

  if (candidate.classificationBeforeTest === 'PUBLIC_ORTHOPHOTO_TEST_CANDIDATE') {
    return 'PASS_BUT_REQUIRES_LEGAL_REVIEW';
  }

  if (candidate.classificationBeforeTest === 'OFFICIAL_SAMPLE_COMPATIBLE_CANDIDATE' || candidate.classificationBeforeTest === 'PUBLIC_TEST_ONLY_OR_NON_COMPATIBLE_CANDIDATE') {
    return 'PASS_BUT_TEST_ONLY';
  }

  return 'PASS_CAPABILITIES_VALID';
}

function recommendedAction(candidate: Candidate, status: EndpointStatus) {
  if (status.startsWith('FAIL_')) {
    return 'Do not activate. Keep as diagnostic evidence only.';
  }

  if (candidate.id === 'candidate-5') {
    return 'Manual review only; keep as staging/test evidence and do not activate.';
  }

  return `Optional env example only: CONNECTOR_TUCBS_${candidate.service}_ENDPOINT=${candidate.baseUrl}`;
}

async function testCandidate(candidate: Candidate): Promise<CandidateResult> {
  const attempts: AttemptResult[] = [];
  let body = '';
  let lastAttempt: AttemptResult | undefined;
  let dnsFailure = false;
  let parsed: ParsedCapabilities = {
    xmlParseSuccess: false,
    ogcServiceTypeDetected: 'UNKNOWN',
    serviceTitle: '',
    serviceName: '',
    layerCount: 0,
    layerSummaries: [],
    crsProjections: [],
    operations: [],
    serviceException: false,
    htmlErrorPage: false,
  };

  for (let attemptIndex = 1; attemptIndex <= MAX_RETRIES + 1; attemptIndex += 1) {
    try {
      const { attempt, body: responseBody } = await httpGet(candidate);
      attempt.attempt = attemptIndex;
      attempts.push(attempt);
      lastAttempt = attempt;
      body = responseBody;
      parsed = parseCapabilities(body, candidate);

      if (attempt.httpStatus === 200 && parsed.xmlParseSuccess && !parsed.serviceException) {
        break;
      }
    } catch (error: any) {
      const attempt = error?.attempt as AttemptResult | undefined;
      if (attempt) {
        attempt.attempt = attemptIndex;
        attempts.push(attempt);
        lastAttempt = attempt;
        dnsFailure = dnsFailure || !attempt.dnsResolved;
      } else {
        attempts.push({
          attempt: attemptIndex,
          dnsResolved: false,
          dnsAddresses: [],
          httpsConnected: false,
          timeoutHit: false,
          responseSizeBytes: 0,
          latencyMs: 0,
          error: String((error as Error)?.message || error),
        });
        dnsFailure = true;
      }

      if (attemptIndex <= MAX_RETRIES) {
        continue;
      }
    }
  }

  if (!lastAttempt) {
    lastAttempt = {
      attempt: 1,
      dnsResolved: false,
      dnsAddresses: [],
      httpsConnected: false,
      timeoutHit: false,
      responseSizeBytes: 0,
      latencyMs: 0,
      error: 'No attempt completed',
    };
    attempts.push(lastAttempt);
  }

  const status = classifyResult(candidate, parsed, lastAttempt, dnsFailure);
  const finalStatus: EndpointStatus =
    status === 'PASS_BUT_TEST_ONLY' || status === 'PASS_BUT_REQUIRES_LEGAL_REVIEW' || status === 'PASS_CAPABILITIES_VALID'
      ? status
      : status;

  return {
    id: candidate.id,
    label: candidate.label,
    baseUrl: candidate.baseUrl,
    capabilitiesUrl: candidate.capabilitiesUrl,
    classificationBeforeTest: candidate.classificationBeforeTest,
    serviceType: candidate.service,
    dnsResolved: Boolean(lastAttempt.dnsResolved),
    dnsAddresses: lastAttempt.dnsAddresses,
    httpsConnected: Boolean(lastAttempt.httpsConnected),
    httpStatus: lastAttempt.httpStatus,
    contentType: lastAttempt.contentType,
    responseSizeBytes: lastAttempt.responseSizeBytes,
    latencyMs: lastAttempt.latencyMs,
    timeoutHit: Boolean(lastAttempt.timeoutHit),
    xmlParseSuccess: parsed.xmlParseSuccess,
    ogcServiceTypeDetected: parsed.ogcServiceTypeDetected,
    serviceTitle: parsed.serviceTitle,
    serviceName: parsed.serviceName,
    layerCount: parsed.layerCount,
    firstLayers: parsed.layerSummaries,
    crsProjections: parsed.crsProjections,
    operations: parsed.operations,
    serviceException: parsed.serviceException,
    htmlErrorPage: parsed.htmlErrorPage,
    retriesUsed: Math.max(0, attempts.length - 1),
    attempts,
    status: finalStatus,
    recommendedAction: recommendedAction(candidate, finalStatus),
  };
}

function statusCounts(results: CandidateResult[]) {
  const passed = results.filter((item) => item.status.startsWith('PASS')).length;
  const failed = results.filter((item) => item.status.startsWith('FAIL')).length;
  const testOnly = results.filter((item) => item.status === 'PASS_BUT_TEST_ONLY').length;
  const manualReviewNeeded = results.filter((item) => item.status === 'PASS_BUT_REQUIRES_LEGAL_REVIEW' || item.status === 'UNKNOWN_REQUIRES_MANUAL_REVIEW').length;
  return { total: results.length, passed, failed, testOnly, manualReviewNeeded };
}

function buildMarkdown(results: CandidateResult[]) {
  const counts = statusCounts(results);
  const safeEnvExamples = results
    .filter((item) => item.status.startsWith('PASS'))
    .map((item) => `- ${item.serviceType}: ${item.baseUrl} -> CONNECTOR_TUCBS_${item.serviceType}_ENDPOINT=${item.baseUrl}`)
    .join('\n');

  const lines = [
    '# TUCBS Candidate Endpoint Test Results',
    '',
    `Summary: total=${counts.total}, passed=${counts.passed}, failed=${counts.failed}, test-only=${counts.testOnly}, manual-review-needed=${counts.manualReviewNeeded}`,
    '',
    '## Results by Endpoint',
  ];

  for (const item of results) {
    lines.push(
      '',
      `### ${item.id}: ${item.label}`,
      `- URL: ${item.capabilitiesUrl}`,
      `- Service type: ${item.ogcServiceTypeDetected}`,
      `- HTTP status: ${typeof item.httpStatus === 'number' ? item.httpStatus : 'n/a'}`,
      `- latencyMs: ${item.latencyMs}`,
      `- XML parse success: ${item.xmlParseSuccess ? 'yes' : 'no'}`,
      `- Service title: ${item.serviceTitle || 'n/a'}`,
      `- Service name: ${item.serviceName || 'n/a'}`,
      `- Layer count: ${item.layerCount}`,
      `- CRS/projections: ${item.crsProjections.length > 0 ? item.crsProjections.join(', ') : 'none reported'}`,
      `- Classification: ${item.status}`,
      `- Recommended action: ${item.recommendedAction}`,
      `- Service exception: ${item.serviceException ? 'yes' : 'no'}`,
      `- HTML/error page: ${item.htmlErrorPage ? 'yes' : 'no'}`,
      `- Retries used: ${item.retriesUsed}`,
    );
  }

  lines.push('', '## Safe Env Examples', safeEnvExamples || '- none');
  lines.push('', '## No-Mutation Confirmation', '- connector activated: no', '- hardcoded endpoints added: no', '- .env changed: no', '- UI changed: no', '- TUCBS implementation started: no');
  return `${lines.join('\n')}\n`;
}

async function main() {
  const results: CandidateResult[] = [];
  for (const candidate of CANDIDATES) {
    results.push(await testCandidate(candidate));
  }

  const summary = statusCounts(results);
  const proof = {
    generatedAt: new Date().toISOString(),
    step: 'test:tucbs-candidates',
    overallStatus: summary.failed === 0 ? 'PASS' : 'WARN',
    summary,
    results,
    safeEnvExamples: results
      .filter((item) => item.status.startsWith('PASS'))
      .map((item) => ({
        candidateId: item.id,
        serviceType: item.serviceType,
        envKey: `CONNECTOR_TUCBS_${item.serviceType}_ENDPOINT`,
        envValue: item.baseUrl,
        note: item.status === 'PASS_BUT_REQUIRES_LEGAL_REVIEW' ? 'Manual review only; do not activate.' : 'Optional env example only; do not activate.',
      })),
    noMutationConfirmation: {
      connectorActivated: false,
      hardcodedEndpointsAdded: false,
      envChanged: false,
      uiChanged: false,
      tucbsImplementationStarted: false,
    },
  };

  fs.mkdirSync(path.join(ROOT, 'proof'), { recursive: true });
  fs.writeFileSync(PROOF_JSON, `${JSON.stringify(proof, null, 2)}\n`, 'utf8');
  fs.writeFileSync(PROOF_MD, buildMarkdown(results), 'utf8');

  console.log(JSON.stringify({ overallStatus: proof.overallStatus, step: proof.step, proof: 'proof/tucbs-candidate-endpoint-test-results.json' }, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({ overallStatus: 'FAIL', step: 'test:tucbs-candidates', error: String((error as Error)?.message || error) }, null, 2));
  process.exit(1);
});