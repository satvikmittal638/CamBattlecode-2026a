#!/usr/bin/env node
// Print the parameter/result types of exported functions of a wasm module.
//   node tools/wasm_sigs.mjs <file.wasm> [name-regex]
import fs from 'node:fs';
const [file, pat] = process.argv.slice(2);
const b = fs.readFileSync(file); let p = 8;
const u = () => { let r = 0, s = 0, x; do { x = b[p++]; r |= (x & 0x7f) << s; s += 7; } while (x & 0x80); return r >>> 0; };
const T = { 0x7f: 'i32', 0x7e: 'i64', 0x7d: 'f32', 0x7c: 'f64' };
const types = [], funcs = []; let nImportFuncs = 0; const exportsList = [];
while (p < b.length) {
  const id = b[p++]; const size = u(); const end = p + size;
  if (id === 1) { const n = u(); for (let i = 0; i < n; i++) { p++; const np = u(); const ps = []; for (let j = 0; j < np; j++) ps.push(T[b[p++]]); const nr = u(); const rs = []; for (let j = 0; j < nr; j++) rs.push(T[b[p++]]); types.push([ps, rs]); } }
  else if (id === 2) { const n = u(); for (let i = 0; i < n; i++) { const ml = u(); p += ml; const fl = u(); p += fl; const kind = b[p++]; if (kind === 0) { funcs.push(u()); nImportFuncs++; } else if (kind === 1) { p++; const f = u(); u(); if (f & 1) u(); } else if (kind === 2) { const f = u(); u(); if (f & 1) u(); } else if (kind === 3) { p += 2; } } }
  else if (id === 3) { const n = u(); for (let i = 0; i < n; i++) funcs.push(u()); }
  else if (id === 7) { const n = u(); for (let i = 0; i < n; i++) { const l = u(); const name = b.slice(p, p + l).toString(); p += l; const kind = b[p++]; const idx = u(); if (kind === 0) exportsList.push([name, idx]); } }
  p = end;
}
const re = pat ? new RegExp(pat) : null;
for (const [name, idx] of exportsList) { if (re && !re.test(name)) continue; const [ps, rs] = types[funcs[idx]]; console.log(`${name}(${ps.join(', ')}) -> ${rs.join(',') || 'void'}`); }
