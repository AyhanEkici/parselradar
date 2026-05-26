// P2.2E-4 Property UX Repair Verifier
// Strict contract: see task list in user prompt
import fs from 'fs';
import path from 'path';

function fileText(p: string) {
  return fs.readFileSync(path.resolve(__dirname, '../../web/src/pages/' + p), 'utf8');
}

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function main() {
  // 1. Dashboard no longer contains chat/composer/old upload preview
  const dashboard = fileText('Dashboard.tsx');
  assert(!/ConversationalAnalysisIntake/.test(dashboard), 'Dashboard: chat/composer still present');
  assert(!/OCR|preview|upload/i.test(dashboard), 'Dashboard: upload/OCR preview present');

  // 2. Dashboard contains new intake fields
  [
    'Yeni Mülk Kaydı', 'İl', 'İlçe', 'Mahalle/Köy', 'm²', 'Fiyat', 'Ada', 'Parsel', 'Mülkü kaydet ve kaynakları kontrol et'
  ].forEach(label => assert(dashboard.includes(label), `Dashboard: missing field ${label}`));

  // 3. NewProperty URL optional/source contract
  const newProp = fileText('NewProperty.tsx');
  assert(newProp.includes("Kaynak gerekli: ilan URL'si, yapistirilmis ilan metni veya yuklenmis ekran goruntusu/belge ekleyin."), 'NewProperty: missing source error copy');
  assert(/isHttpUrl\(form\.ilanUrl\)/.test(newProp), 'NewProperty: URL validation missing');
  assert(/payload\.ada =/.test(newProp) && /payload\.parsel =/.test(newProp), 'NewProperty: ADA_PARSEL payload rules missing');

  // 4. Pilot dropdown data exists
  ['Kayseri', 'Melikgazi', 'Gesi Cumhuriyet'].forEach(val => {
    assert(dashboard.includes(val) || newProp.includes(val), `Dropdown: missing ${val}`);
  });

  // 5. Source evidence path
  const propDocs = fileText('PropertyDocuments.tsx');
  assert(/Upload screenshot\/document/.test(propDocs), 'PropertyDocuments: missing upload evidence');
  assert(/USER_UPLOADED_SOURCE_SCREENSHOT|evidenceTypeOptions/.test(propDocs), 'PropertyDocuments: missing USER_UPLOADED_SOURCE_SCREENSHOT');

  // 6. Readability/contrast
  const indexCss = fs.readFileSync(path.resolve(__dirname, '../../web/src/index.css'), 'utf8');
  assert(/background-color: #fff|background: #fff|color: #0f172a|border-color: #22314c/.test(indexCss), 'index.css: missing readability/contrast markers');

  // 7. Prop leak fixed
  [dashboard, newProp, propDocs].forEach(txt => {
    assert(!/P2_1A_TRIAGED_BACKLOG\s*=/.test(txt), 'Prop leak: P2_1A_TRIAGED_BACKLOG still passed to DOM');
  });

  // 8. Guardrails
  const all = dashboard + newProp + propDocs + indexCss;
  assert(!/�|scrape|captcha|connector|full turkey/i.test(all), 'Guardrails: mojibake, scraping, connector, or full Turkey import claim found');

  console.log('P2.2E-4 Property UX Repair: PASS');
}

if (require.main === module) {
  try {
    main();
    process.exit(0);
  } catch (e) {
    const err = e as Error;
    console.error('FAIL:', err.message);
    process.exit(1);
  }
}
