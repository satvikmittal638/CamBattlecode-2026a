import { dumpReplay, loadIndex, loadMap, cheb } from './lib.mjs';
const N = +(process.argv[2] || 20);
const rows = loadIndex().slice(0, N);
const out = { yes: [], no: [] };
for (const r of rows) {
  const d = await dumpReplay(r.path, { snapshots: 'round' });
  const M = loadMap(r.map); const me = r.side === 'b' ? 1 : 0;
  const campGroup = {}; for (const c of d.snapshots[1].camps) campGroup[c.id] = M.campAt.get(c.pos.join(','));
  const byRound = new Map(); for (const s of d.snapshots) if (!byRound.has(s.round)) byRound.set(s.round, s);
  const ids = d.meta.finalChampions.filter((c) => c.team === me).map((c) => c.id);
  for (const id of ids) {
    const evs = d.events.filter((e) => e.actor?.kind === 1 && e.actor.index === id);
    const recR = evs.filter((e) => e.kind === 'Recall').map((e) => e.round);
    let prev = null;
    for (const s of d.snapshots) {
      const c = s.champions.find((x) => x.id === id); if (!c) continue;
      if (prev && c.alive && prev.alive && (c.gems > prev.gems || c.gold > prev.gold) && c.gold - prev.gold !== 50) {
        const rr = recR.find((x) => x <= s.round && x >= s.round - 6);
        const ref = rr != null ? byRound.get(rr).champions.find((x) => x.id === id) : byRound.get(s.round - 5)?.champions.find((x) => x.id === id);
        const nx = evs.find((x) => x.round > s.round && ((x.kind === 'Attack' || x.kind === 'Cast ability') && x.target?.kind === 'camp' || x.kind === 'Submit gems' || x.kind === 'Recall'));
        const nxs = nx ? (nx.kind === 'Submit gems' ? 'TRIB' : nx.kind === 'Recall' ? 'REC@r' + nx.round : M.groups[campGroup[nx.target.id]].label + '@r' + nx.round) : '-';
        const line = `${r.map} r${s.round} ${c.type} hpAtDecision ${ref?.hp}/${ref?.maxHp} (${(ref?.hp / ref?.maxHp).toFixed(2)}) goldAfter ${c.gold} gemsAfter ${c.gems} gain+${c.gold - prev.gold}g/+${c.gems - prev.gems}gem next=${nxs}`;
        if (rr != null) out.yes.push(line); else out.no.push(line);
      }
      prev = c;
    }
  }
}
console.log('--- recall-capture (yes)'); console.log(out.yes.filter((l) => +l.match(/\((\d\.\d+)\)/)?.[1] > 0.6).slice(0, 25).join('\n'));
console.log('--- no recall, hp<0.6'); console.log(out.no.filter((l) => +l.match(/\((\d\.\d+)\)/)?.[1] < 0.6).slice(0, 30).join('\n'));
console.log('--- no recall, goldAfter>=150 hp<0.9'); console.log(out.no.filter((l) => +l.match(/\((\d\.\d+)\)/)?.[1] < 0.9 && +l.match(/goldAfter (\d+)/)[1] >= 150).slice(0, 30).join('\n'));
