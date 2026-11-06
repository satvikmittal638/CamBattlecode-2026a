import { api } from '../tools/bclib.mjs';
const r = await api('GET', `/match-groups?scope=all&team=6b04505b-d16c-4196-b7c6-53a4688a32ca`);
const g = r.groups[0];
console.log(Object.keys(r), r.nextCursor);
console.log(JSON.stringify(g, null, 1).slice(0, 2500));
