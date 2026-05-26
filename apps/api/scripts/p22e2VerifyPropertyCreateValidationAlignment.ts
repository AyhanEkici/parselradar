import fs from 'fs';

const file = 'apps/web/src/pages/NewProperty.tsx';
const src = fs.readFileSync(file, 'utf8');

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

assert(src.includes('validatePropertyForm'), 'validatePropertyForm missing');
assert(src.includes('buildPropertyCreatePayload'), 'buildPropertyCreatePayload missing');
assert(src.includes('ada') && src.includes('parsel'), 'ADA_PARSEL fields missing');
assert(!/ilanUrl.*required.*ADA_PARSEL/.test(src), 'ilanUrl required for ADA_PARSEL');
assert(!/addressText.*required.*ADA_PARSEL/.test(src), 'addressText required for ADA_PARSEL');
assert(/payload.*ada/.test(src) && /payload.*parsel/.test(src), 'Payload builder must include ada/parsel');
assert(!/payload.*ilanUrl.*496\/1/.test(src), 'Payload builder must not send ilanUrl: "496/1"');
assert(/Turkish|gerekli|gereklidir|İl|İlçe|Mahalle|Ada|Parsel|Fiyat|alanı|Tapu|İmar|Yol|Elektrik|Su|İlan URL/.test(src), 'Turkish field-level messages missing');
assert(!/mojibake|�/.test(src), 'Mojibake found');
assert(!/official verification claim/i.test(src), 'Fake official verification claim found');
console.log('P2.2E-2 property create validation alignment: PASS');
