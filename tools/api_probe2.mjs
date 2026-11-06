import { Engine, readReplayBytes, replayEngineVersion } from './replay_dump.mjs';
const file = process.argv[2];
const bytes = readReplayBytes(file); const eng = await Engine.create(replayEngineVersion(bytes));
const p = eng.exp.Engine_Malloc(bytes.length); new Uint8Array(eng.exp.memory.buffer, p, bytes.length).set(bytes);
eng.check(eng.exp.Game_FromReplayFileBytes(p, bytes.length, eng.outBuf)); const game = eng.outHandle;
eng.check(eng.exp.Game_Visualiser_Timeline_GetMain(game, eng.outBuf)); const main = eng.outHandle;
eng.check(eng.exp.Game_Visualiser_Timeline_Seek(game, main, 0, 0));
const buf = eng.exp.Engine_Malloc(8192), persp = eng.exp.Engine_Malloc(16), cnt = eng.exp.Engine_Malloc(16); const V = () => eng.view;
for (let i = 0; i < 30000; i++) eng.check(eng.exp.Game_Visualiser_Timeline_ReplayNext(game, 1));
V().setUint32(persp, 1, true); V().setUint32(persp + 4, 6, true);
const msg = () => eng.cstr(eng.exp.GetLastErrorMsg());
let r = eng.exp.Game_GetNumCampGroups(game, buf); console.log('Game_GetNumCampGroups', r, V().getUint32(buf, true), V().getBigUint64(buf, true));
r = eng.exp.Game_API_Map_GetNumCampGroups(game, buf); console.log('API Map_GetNumCampGroups', r, msg(), V().getUint32(buf, true));
for (const fn of ['Game_API_GetChampions', 'Game_API_GetCamps', 'Game_API_GetAllyChampions', 'Game_API_GetEnemyChampions']) {
  for (const [lab, args] of [['(p,buf,cap,cnt)', [persp, buf, 32, cnt]], ['(p,cnt,buf,cap)', [persp, cnt, buf, 32]], ['(p,buf,cnt,cap)', [persp, buf, cnt, 32]]]) {
    V().setUint32(cnt, 0xdead, true);
    const rr = eng.exp[fn](game, ...args);
    console.log(fn, lab, rr, rr ? msg() : '', 'cnt', V().getUint32(cnt, true), 'first', [0, 1, 2, 3, 4, 5].map((i) => V().getUint32(buf + i * 4, true)));
  }
}
