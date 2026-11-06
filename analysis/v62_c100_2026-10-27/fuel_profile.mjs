// Per-turn fuel profile of a shadow run (real 100k budget): fuel used per champion turn (mean, p50, p90, p99), turns
// stopped by the bot's fuel guard ("yielded 1" in the decision log), turns preempted by the engine, and share of
// turns with an action.   node fuel_profile.mjs <shadow dir> [<shadow dir> ...]
import fs from 'node:fs'; import path from 'node:path';
for (const dir of process.argv.slice(2)) {
  const fuel = []; let turns = 0, yielded = 0, pre = 0, acted = 0;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.jsonl'))) {
    for (const line of fs.readFileSync(path.join(dir, f), 'utf8').split('\n')) {
      if (!line) continue; const r = JSON.parse(line); if (!r.alive) continue;
      turns++; fuel.push(r.fuel); if (r.pre) pre++; if (/yielded 1/.test(r.log || '')) yielded++; if (r.bot.length) acted++;
    }
  }
  fuel.sort((a, b) => a - b); const q = (p) => fuel[Math.floor(p * (fuel.length - 1))];
  console.log(`${path.basename(dir)}: ${turns} alive turns, fuel/turn mean ${Math.round(fuel.reduce((a, b) => a + b, 0) / turns)} p50 ${q(.5)} p90 ${q(.9)} p99 ${q(.99)}; guard-stopped ${(100 * yielded / turns).toFixed(2)}%, preempted ${(100 * pre / turns).toFixed(3)}%, acted ${(100 * acted / turns).toFixed(1)}%`);
}
