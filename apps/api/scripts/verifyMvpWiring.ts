import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const REPORT_PATH = path.join(ROOT, 'proof/mvp-wiring-audit.json');

function main() {
  if (!fs.existsSync(REPORT_PATH)) {
    console.error(
      JSON.stringify(
        {
          overallStatus: 'FAIL',
          step: 'verify:mvp-wiring',
          reason: 'missing_audit_report',
          detail: 'Run npm run audit:mvp-wiring first.',
        },
        null,
        2,
      ),
    );
    process.exit(1);
  }

  const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8')) as {
    overallStatus: string;
    summary?: { total?: number; pass?: number; warn?: number; fail?: number };
    rows?: Array<{ navLabel: string; route: string; currentStatus: string; issue: string }>;
  };

  const rows = Array.isArray(report.rows) ? report.rows : [];
  const fails = rows.filter((r) => r.currentStatus === 'FAIL');

  const payload = {
    overallStatus: fails.length === 0 ? 'PASS' : 'FAIL',
    step: 'verify:mvp-wiring',
    summary: {
      total: report.summary?.total ?? rows.length,
      pass: report.summary?.pass ?? rows.filter((r) => r.currentStatus === 'PASS').length,
      warn: report.summary?.warn ?? rows.filter((r) => r.currentStatus === 'WARN').length,
      fail: report.summary?.fail ?? fails.length,
    },
    failItems: fails.map((f) => ({ navLabel: f.navLabel, route: f.route, issue: f.issue })),
  };

  console.log(JSON.stringify(payload, null, 2));
  if (fails.length > 0) process.exit(1);
}

main();
