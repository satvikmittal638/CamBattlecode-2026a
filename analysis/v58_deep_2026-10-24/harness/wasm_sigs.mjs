// Print export (or import) signatures of a wasm module: name(params) -> results.
//   node wasm_sigs.mjs <file.wasm> [regex] [--imports]
import fs from 'node:fs';
const [file, re = '.', flag] = process.argv.slice(2); const b = fs.readFileSync(file); let p = 8;
const u = () => { let r = 0, s = 0, x; do { x = b[p++]; r |= (x & 0x7f) << s; s += 7; } while (x & 0x80); return r >>> 0; };
const VT = { 0x7f: 'i32', 0x7e: 'i64', 0x7d: 'f32', 0x7c: 'f64', 0x7b: 'v128', 0x70: 'funcref', 0x6f: 'externref', 0x69: 'exnref' };
const types = [], funcs = [], imports = []; let nImpFuncs = 0; const exps = [];
while (p < b.length) { const id = b[p++]; const size = u(); const end = p + size;
  if (id === 1) { const n = u(); for (let i = 0; i < n; i++) { const form = b[p++]; if (form !== 0x60) throw new Error('type form ' + form); const np = u(); const ps = []; for (let k = 0; k < np; k++) ps.push(VT[b[p++]] || '?'); const nr = u(); const rs = []; for (let k = 0; k < nr; k++) rs.push(VT[b[p++]] || '?'); types.push([ps, rs]); } }
  else if (id === 2) { const n = u(); for (let i = 0; i < n; i++) { const ml = u(); const m = b.slice(p, p + ml).toString(); p += ml; const nl = u(); const nm = b.slice(p, p + nl).toString(); p += nl; const k = b[p++];
      if (k === 0) { const t = u(); imports.push({ m, nm, t }); nImpFuncs++; } else if (k === 1) { p++; const f = u(); u(); if (f & 1) u(); } else if (k === 2) { const f = u(); u(); if (f & 1) u(); } else if (k === 3) { p++; p++; } else if (k === 4) { p++; u(); } } }
  else if (id === 3) { const n = u(); for (let i = 0; i < n; i++) funcs.push(u()); }
  else if (id === 7) { const n = u(); for (let i = 0; i < n; i++) { const nl = u(); const nm = b.slice(p, p + nl).toString(); p += nl; const k = b[p++]; const idx = u(); if (k === 0) exps.push({ nm, idx }); } }
  p = end; }
const rx = new RegExp(re); const sig = (t) => `(${types[t][0].join(',')}) -> ${types[t][1].join(',') || 'void'}`;
if (flag === '--imports') for (const i of imports) { if (rx.test(i.nm)) console.log(`${i.m}.${i.nm}${sig(i.t)}`); }
else for (const e of exps) { if (!rx.test(e.nm)) continue; const t = e.idx < nImpFuncs ? imports[e.idx].t : funcs[e.idx - nImpFuncs]; console.log(`${e.nm}${sig(t)}`); }
