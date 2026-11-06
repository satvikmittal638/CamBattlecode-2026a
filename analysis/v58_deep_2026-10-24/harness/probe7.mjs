import { openReplay } from './replay_state.mjs';
const r = await openReplay(process.argv[2]); const { eng, game } = r; const E = eng.exp, V = () => eng.view;
const a = E.Engine_Malloc(8192), b = E.Engine_Malloc(64), c = E.Engine_Malloc(64);
const fill = () => { new Uint8Array(E.memory.buffer, a, 8192).fill(0xcd); new Uint8Array(E.memory.buffer, b, 64).fill(0xcd); new Uint8Array(E.memory.buffer, c, 64).fill(0xcd); };
const words = (p, n) => Array.from({ length: n }, (_, k) => V().getInt32(p + 4 * k, true));
const err = (x) => (x === 0 ? 'ok' : `err ${x} ${eng.cstr(E.GetLastErrorMsg())}`);
fill(); console.log('GetCampGroups(game,a,64,b)', err(E.Game_API_Map_GetCampGroups(game, a, 64, b)), words(b, 1), words(a, 32).join(','));
for (const g of [0, 1, 5]) {
  fill(); console.log('CampGroup_GetCampInfo(game,g,a,64,b)', g, err(E.Game_API_Map_CampGroup_GetCampInfo(game, g, a, 64, b)), words(b, 2), words(a, 12).join(','));
  fill(); console.log('CampGroup_GetCampInfo(game,g,a,b,c)', g, err(E.Game_API_Map_CampGroup_GetCampInfo(game, g, a, b, c)), words(a, 4), words(b, 4), words(c, 2));
}
for (let id = 0; id < 4; id++) { fill(); console.log('camp', id, err(E.Game_API_Map_CampInfo_Get(game, id, a)), words(a, 3), err(E.Game_API_Map_CampInfo_GetGroup(game, id, b)), words(b, 1)); }
