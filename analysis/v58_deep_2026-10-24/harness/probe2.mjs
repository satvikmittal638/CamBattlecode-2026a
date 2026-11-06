import { openAtTurn } from './replay_state.mjs';
const [file, round, team, type] = [process.argv[2], +process.argv[3], +process.argv[4], process.argv[5]];
const s = await openAtTurn(file, { round, team, type });
const { eng, game, champion } = s; const E = eng.exp, V = () => eng.view;
const persp = E.Engine_Malloc(64), out = E.Engine_Malloc(4096);
const id = champion.entity.index;
for (const layout of [[team, id], [team + 1, id], [id, team], [0, id], [1, id], [2, id]]) {
  new Uint8Array(E.memory.buffer, persp, 64).fill(0);
  layout.forEach((v, k) => V().setUint32(persp + 4 * k, v, true));
  const a = E.Game_API_Champion_GetCooldown(game, persp, id, 0, out);
  const b = E.Game_API_Champion_Get(game, persp, id, out);
  const c = E.Game_API_GetVision(game, persp, out);
  console.log(layout, 'cooldown', a, 'get', b, b ? eng.cstr(E.GetLastErrorMsg()) : '', 'vision', c);
}
// persp passed by value?
for (const v of [0, 1, 2, team]) console.log('byvalue', v, E.Game_API_Champion_Get(game, v, id, out), eng.cstr(E.GetLastErrorMsg()));
