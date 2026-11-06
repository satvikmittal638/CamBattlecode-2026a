// Decode the hardcoded playbook tables shipped in v84 / v86 (book_*.h + playbook_data.h) into JSON.
// Record = 12 bytes as 16 base64 chars: key u16 (championType*2048 + round), x i16, y i16, v i32, k u8 (action), s u8.
//   node decode_tables.mjs <bot src dir> <out.json>
import fs from 'node:fs';
import path from 'node:path';
import { CHAMPION_TYPES, DRAFT_CHAMPIONS, ITEM_NAMES } from '../../tools/replay_dump.mjs';

const [srcDir, outFile] = process.argv.slice(2);
const KINDS = { 4: 'move', 5: 'attack', 6: 'cast', 9: 'priority', 11: 'recall', 12: 'tribute', 13: 'buy', 14: 'ward', 16: 'cancel', 20: 'lock', 21: 'teleport', 25: 'sell', 30: 'buyCons' };
const strings = {}, owner = {};
for (const f of fs.readdirSync(srcDir).filter((f) => /^book_.*\.h$/.test(f))) {
  const txt = fs.readFileSync(path.join(srcDir, f), 'utf8');
  for (const m of txt.matchAll(/static const char (pb_data_\d+)\[\]=\s*((?:"[^"]*"\s*)+);/g)) {
    strings[m[1]] = [...m[2].matchAll(/"([^"]*)"/g)].map((x) => x[1]).join('');
    owner[m[1]] = f.replace(/^book_|\.h$/g, '');
  }
}
const data = fs.readFileSync(path.join(srcDir, 'playbook_data.h'), 'utf8');
const maps = [...data.matchAll(/\{(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),\{([\d,]+)\},(pb_data_\d+),(\d+)\}/g)].map((m) => ({
  w: +m[1], h: +m[2], groups: +m[3], sx: +m[4], sy: +m[5], picks: +m[6], end: +m[7], draft: m[8].split(',').map(Number).slice(0, +m[6]).map((i) => DRAFT_CHAMPIONS[i]), name: m[9], size: +m[10],
}));
const decode = (s) => {
  const b = Buffer.from(s, 'base64');
  const out = [];
  for (let i = 0; i + 12 <= b.length; i += 12) {
    const key = b.readUInt16LE(i);
    out.push({ t: CHAMPION_TYPES[key >> 11], r: key & 2047, x: b.readInt16LE(i + 2), y: b.readInt16LE(i + 4), v: b.readInt32LE(i + 6), k: KINDS[b[i + 10]] ?? b[i + 10], s: b[i + 11] });
  }
  return out;
};
const books = maps.map((m) => {
  const acts = decode(strings[m.name] || '');
  if (acts.length !== m.size) console.error(`${m.name}: decoded ${acts.length}, expected ${m.size}`);
  for (const a of acts) if (a.k === 'buy' || a.k === 'sell') a.item = ITEM_NAMES[a.s];
  return { case: owner[m.name], ...m, actions: acts };
});
fs.writeFileSync(outFile, JSON.stringify(books));
console.log(`${books.length} books, ${books.reduce((a, b) => a + b.actions.length, 0)} actions`);
