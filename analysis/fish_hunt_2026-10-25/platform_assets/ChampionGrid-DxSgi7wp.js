import{a as e,l as t,t as n}from"./jsx-runtime-mwuK5CdP.js";import{n as r,r as ee,t as i}from"./champions-CrVgrcpO.js";var te={shared:8,draft:1024},a=e=>({kind:`text`,text:e}),ne=(...e)=>({kind:`list`,items:e}),re=(...e)=>({kind:`list`,items:e,ordered:!0}),o=(e,t)=>({kind:`note`,title:e,text:t}),s=(e,t,n)=>({kind:`table`,caption:e,headings:t,rows:n}),c=(e,t,n)=>({kind:`code`,label:e,code:t,language:n}),l=(...e)=>({kind:`links`,ids:e}),u=(e,t,...n)=>({id:e,title:t,blocks:n});function ie(e){return e===`turn-order`?`/game/docs/your-first-turn#round`:e===`bot-api`?`/game/api`:e===`welcome`?`/game/docs`:`/game/docs/${e}`}var d=e=>e.replace(/\[\[icon:[a-z0-9:-]+\]\]/gi,``).replace(/[ \t]+(?=[,.;:!?])/g,``).trim();function ae(e){return d([e.title,e.summary,e.keywords??``,...e.sections.flatMap(e=>[e.title,...e.blocks.flatMap(e=>{switch(e.kind){case`text`:case`subheading`:return[e.text];case`image`:return[e.alt];case`visual`:return[e.name];case`details`:return[e.title,JSON.stringify(e.blocks)];case`list`:return e.items;case`cards`:return e.items.flatMap(e=>[e.title,e.text??``]);case`note`:return[e.title,e.text];case`table`:return[e.caption,...e.headings,...e.rows.flat()];case`code`:return[e.label,e.code];case`kit`:return[e.body.name,e.body.passive??``,...e.body.abilities.flatMap(e=>[e.name,e.effect,e.target])];case`stats`:return[e.body.attack];case`links`:case`roster`:case`compare`:return[];case`external-link`:return[e.label];case`error-reference`:case`api-reference`:case`wasm-api-reference`:case`bitboard-demo`:case`distance-demo`:case`bitboard-layout`:case`agent-downloads`:return[]}})])].join(` `))}var f={name:`Attack reset`,effect:`Resets your basic attack cooldown.`,target:`Self`,walking:`Compatible`},p={name:`Dash`,effect:`Move up to 2 steps, including diagonals.`,target:`Ground · 2 tiles`,walking:`Compatible`},m=(e,t)=>[{name:t,...e}],h=[{id:`cassi-and-issac`,name:`Cassi & Issac`,summary:`One draft choice creates a ranged spellcaster and a melee fighter. They act separately, but if either dies, both die.`,tags:[`Stun`,`Dash`,`Attack reset`],sharedPassive:`If either Cassi or Issac dies, the other dies too. Both lose their carried gems and together grant one kill reward.`,bodies:[{name:`Cassi`,iconRow:4,attack:`Ranged`,stats:[600,65,30,3,70,13],passive:null,abilities:[{name:`Single-target damage`,effect:`2 × Focus damage.`,target:`Enemy or camp · 4`,walking:`Excludes walking`},{name:`Stun`,effect:`One-round stun with no direct damage.`,target:`Enemy or camp · 4`,walking:`Compatible`}]},{name:`Issac`,iconRow:5,attack:`Melee`,stats:[900,80,40,3,100,10],passive:null,abilities:[f,p]}]},{id:`ryth`,name:`Ryth`,summary:`A melee champion with an area stun and an attack reset. Health also adds Strength.`,tags:[`Stun`,`Area damage`,`Attack reset`],bodies:m({iconRow:1,attack:`Melee`,stats:[1200,100,45,5,100,10],passive:`Ryth gains Strength equal to 1% of bonus health.`,abilities:[{name:`Area stun`,effect:`1 × Focus damage and a one-round stun in radius one.`,target:`Ground · 4`,walking:`Excludes walking`},f]},`Ryth`)},{id:`vesper-vale`,name:`Vesper Vale`,summary:`A ranged champion with strong basic attacks, bonus gold and a short dash.`,tags:[`Dash`,`Attack reset`,`Gold & shop`],bodies:m({iconRow:2,attack:`Ranged`,stats:[1e3,100,55,5,100,10],passive:`Vesper Vale gains 33% more gold. A Treasure emblem adds another 20 percentage points, for a combined 53% bonus.`,abilities:[f,p]},`Vesper Vale`)},{id:`prism`,name:`Prism`,summary:`A ranged spellcaster who gains Focus from carried gems, trading safe tributes for temporary strength.`,tags:[`Stun`,`Area damage`],bodies:m({iconRow:7,attack:`Ranged`,stats:[700,60,35,2.5,80,8],passive:`Prism gains 1.5 Focus per carried gem. Ten carried gems add 15 Focus. Tributing or losing those gems removes that bonus.`,abilities:[{name:`Damage and stun`,effect:`1.5 × Focus damage and a one-round stun.`,target:`Enemy or camp · 4`,walking:`Excludes walking`},{name:`Area damage`,effect:`1 × Focus damage in radius one.`,target:`Ground · 4`,walking:`Excludes walking`}]},`Prism`)},{id:`stellar`,name:`Stellar`,summary:`A ranged spellcaster who chooses between concentrated damage and an area hit.`,tags:[`Area damage`],bodies:m({iconRow:6,attack:`Ranged`,stats:[650,65,30,3.5,70,7],passive:null,abilities:[{name:`Single-target damage`,effect:`2 × Focus damage.`,target:`Enemy or camp · 4`,walking:`Excludes walking`},{name:`Area damage`,effect:`1.4 × Focus damage in radius one.`,target:`Ground · 4`,walking:`Excludes walking`}]},`Stellar`)},{id:`vendetta`,name:`Vendetta`,summary:`A melee attacker whose kills refresh spell cooldowns, with a reset and dash for follow-up plays.`,tags:[`Dash`,`Attack reset`],bodies:m({iconRow:3,attack:`Melee`,stats:[1e3,100,70,6,100,10],passive:`When Vendetta gets a kill, she resets all her ability cooldowns. This applies to killing camp monsters too.`,abilities:[f,p]},`Vendetta`)},{id:`marcella`,name:`Marcella`,summary:`A stun-immune melee champion who earns gold from tributes, with a stunning enhanced attack and a ranged damage spell.`,tags:[`Stun`,`Attack reset`,`Gold & shop`],bodies:m({iconRow:8,attack:`Melee`,stats:[1200,100,45,5,60,15],passive:`Immune to stuns. Gains 2 gold per gem tributed.`,abilities:[{name:`Enhanced attack reset`,effect:`Resets your basic attack cooldown; the next enhanced attack stuns for one round.`,target:`Self`,walking:`Compatible`},{name:`Single-target damage`,effect:`2 × Focus damage.`,target:`Enemy or camp · 4`,walking:`Excludes walking`}]},`Marcella`)},{id:`tavi`,name:`Tavi`,summary:`A ranged champion who can buy equipment in the field and threaten a target with a powerful stunning spell.`,tags:[`Stun`,`Attack reset`,`Gold & shop`],bodies:m({iconRow:13,attack:`Ranged`,stats:[900,75,45,5,110,10],passive:`Tavi can buy shards from anywhere on the map, note he cannot buy consumables unless he is on his spawn tiles (or dead). Additionally, Tavi can sell equipment at spawn for its full purchase value. Note, Health bought away from spawn raises maximum health without healing.`,abilities:[f,{name:`Damage and stun`,effect:`1.4 × Focus damage and a one-round stun.`,target:`Enemy or camp · 4`,walking:`Excludes walking`}]},`Tavi`)},{id:`willow`,name:`Willow`,summary:`A ranged champion who can heal an ally or reset a basic attack, with modest stat growth.`,tags:[`Attack reset`,`Healing & shields`],bodies:m({iconRow:9,attack:`Ranged`,stats:[700,50,55,3,120,5],passive:null,abilities:[{name:`Ally heal`,effect:`Restores up to 3 × Focus health to another allied champion.`,target:`Ally · 4`,walking:`Compatible`},f]},`Willow`)},{id:`ren`,name:`Ren`,summary:`A melee champion with retaliation damage, a targeted stun and a short dash.`,tags:[`Stun`,`Dash`],bodies:m({iconRow:10,attack:`Melee`,stats:[900,100,35,5,100,9],passive:`Retaliates against an attacker for 0.2 × Focus damage when damaged. Ren can still trigger retaliation as he dies.`,abilities:[{name:`Damage and stun`,effect:`0.75 × Focus damage and a one-round stun.`,target:`Enemy or camp · 4`,walking:`Excludes walking`},p]},`Ren`)},{id:`varg`,name:`Varg`,summary:`A melee champion with splash basic attacks, an attack reset and a temporary self-shield.`,tags:[`Area damage`,`Attack reset`,`Healing & shields`],bodies:m({iconRow:12,attack:`Melee`,stats:[1e3,100,40,5,100,10],passive:`Basic attacks splash damage equal to Strength onto other valid enemies and camps within radius one of the target. The primary target is not hit twice by the splash.`,abilities:[f,{name:`Self-shield`,effect:`Grants a 2.5 × Focus shield lasting five turns.`,target:`Self`,walking:`Compatible`}]},`Varg`)},{id:`heart-of-ruin`,name:`Heart of Ruin`,summary:`A melee champion whose damage grows as health falls, with a self-shield and a stunning dash landing.`,tags:[`Stun`,`Dash`,`Area damage`,`Healing & shields`],bodies:m({iconRow:11,attack:`Melee`,stats:[1e3,100,30,3.5,100,12],passive:`Heart of Ruin gains up to 50% bonus damage based on missing % health. The bonus scales linearly: 0% at full health, 25% at half health, and up to 50% near zero health. Applies to all damage, including basic attacks and the dash landing; shields do not count as health.`,abilities:[{name:`Self-shield`,effect:`Grants a 1.5 × Focus shield lasting five turns.`,target:`Self`,walking:`Compatible`},{name:`Dash`,effect:`Dash to a destination within 2 tiles. Does 1.5 × Focus to the surrounding tiles on arrival and stuns enemies/camps hit. Hits within a Chebyshev radius of 1, including diagonals; stun lasts one turn. Damage is increased by the missing-health passive.`,target:`Ground · 2 tiles`,walking:`Compatible`}]},`Heart of Ruin`)}],g=new Map(h.map(e=>[e.id,e])),_=[`Stun`,`Dash`,`Attack reset`,`Area damage`,`Healing & shields`,`Gold & shop`];function v(e){return[...new Set(e.bodies.map(e=>e.attack))]}var y=[`game/Engine/include/private_cpp/Engine/Balance/Champions.h`,`game/Engine/include/private_cpp/Engine/Balance/ChampionPassives.h`,`game/Engine/include/private_cpp/Engine/Abilities/Designs.h`,`game/Engine/include/private_cpp/Engine/Passives/Designs.h`,`game/Engine/src/Game/Combat.cpp`],b=(e,t=!1)=>({kind:`kit`,body:e,paired:t}),x=e=>({kind:`stats`,body:e}),S=h.map(e=>{let[t]=e.bodies,n=e.bodies.length>1;return{id:e.id,title:e.name,group:`Champions`,summary:e.summary,keywords:[...e.tags,...e.bodies.map(e=>e.name),n?`duo paired Isaac`:``].join(` `),sections:n?[u(`paired`,`Two bodies, one linked fate`,a(`Cassi and Issac have separate positions, bags, abilities and bot instances. Each receives its own turn.`),...e.sharedPassive?[o(`Shared passive`,e.sharedPassive)]:[]),...e.bodies.map(e=>u(e.name.toLowerCase(),`${e.name} · ${e.attack.toLowerCase()}`,b(e,!0),x(e)))]:[u(`kit`,`Kit`,b(t)),u(`stats`,`Starting stats`,x(t))],related:n?[`champions`,`death-and-recall`,`shared-memory`]:[`champions`,`combat`,`items`],sources:y}}),C=`/service/assets/battlecode-cats-small-BEW7MDgz.webp`,w=`/service/assets/battlecode-knight-small-C2yNqawX.webp`,T=`/service/assets/battlecode-wanted-small-CtP5pJ6m.webp`,E=`/service/assets/battlecode-action-small-u5z2XnzS.webp`,D=`/service/assets/battlecode-stellar-small-IMrFg3aQ.webp`,O=`/service/assets/Female_Zed_Moon-small-DPS8SAUO.webp`,k=`/service/assets/Marcella-small-B-P7o-Fy.webp`,A=`/service/assets/tavi-small-BamCv4Y_.webp`,j=`/service/assets/willow-small-DVPpwNzu.webp`,M=`/service/assets/Ren-small-Be155oe6.webp`,N=`/service/assets/battlecode-cats-BNQlt6bb.webp`,oe=`/service/assets/battlecode-knight-yRqWwda7.webp`,P=`/service/assets/battlecode-wanted-VUon9iRX.webp`,F=`/service/assets/battlecode-action-G4Jnjrj3.webp`,I=`/service/assets/battlecode-stellar-ZQveQrrC.webp`,L=`/service/assets/Female_Zed_Moon-bq7lUstV.webp`,R=`/service/assets/Marcella-BWVvm7Y2.webp`,z=`/service/assets/tavi-DpPX-sO1.webp`,B=`/service/assets/willow-BwAhrezO.webp`,V=`/service/assets/Ren-C_4qY5DZ.webp`,H=`/service/assets/heart-of-ruin-x-EVY7ay.webp`,U=`/service/assets/heart-of-ruin-small-DNlerh9-.webp`,W={technical:[`#7354c5`,`#fff`],vanguard:[`#df812d`,`#111`],marksman:[`#be3b78`,`#fff`],"high-risk":[`#2878c7`,`#fff`],burst:[`#a326b5`,`#fff`],lethal:[`#a6332f`,`#fff`],resolute:[`#00854a`,`#fff`],wayfarer:[`#a1d0fc`,`#111`],devotion:[`#4d7c0f`,`#fff`],retribution:[`#fff`,`#111`]},G={"cassi-and-issac":C,ryth:w,"vesper-vale":T,prism:E,stellar:D,vendetta:O,marcella:k,tavi:A,willow:j,ren:M},K={"cassi-and-issac":`52% 50%`,ryth:`52% 40%`,"vesper-vale":`38% 40%`,prism:`30% 45%`,stellar:`52% 40%`,vendetta:`40% 30%`,marcella:`58% 40%`,tavi:`57% 50%`,willow:`58% 45%`,ren:`50% 35%`},q={"cassi-and-issac":N,ryth:oe,"vesper-vale":P,prism:F,stellar:I,vendetta:L,marcella:R,tavi:z,willow:B,ren:V},se={"cassi-and-issac":.47,ryth:.24,"vesper-vale":.18,prism:.18,stellar:.17,vendetta:.12,marcella:.2,tavi:.32,willow:.3,ren:.12},ce=[...i,...Object.values(r).filter(e=>e!==void 0)];function J(e){if(e===`heart-of-ruin`)return{style:`Berserk`,badge:`#a6332f`,badgeInk:`#fff`,image:ee,thumb:U,banner:H,position:`50% 40%`,head:.4};let t=ce.find(t=>t.id===e);if(!t)return;let[n,r]=W[t.type.toLowerCase()]??[`#4c4c48`,`#fff`];return{style:t.type,badge:n,badgeInk:r,image:t.gridImage,thumb:G[e]??t.gridImage,position:K[e]??`50% 40%`,banner:q[e]??t.gridImage,head:se[e]??.3}}var Y=`
	background:
		linear-gradient(135deg, transparent 0 49.4%, #2c2c29 49.6% 50.4%, transparent 50.6%),
		radial-gradient(circle at center, #2a2a27 0 1px, transparent 1.5px),
		#151513;
	background-size: auto, 18px 18px, auto;
`,le=e.div`
	container: champion-grid / inline-size;
	&& ul {
		display: grid;
		grid-template-columns: repeat(var(--columns, 4), minmax(0, 1fr));
		gap: clamp(8px, 1.2vw, 14px);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	@container champion-grid (max-width: 560px) { && ul { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
	@container champion-grid (max-width: 420px) { && ul { grid-template-columns: repeat(2, minmax(0, 1fr)); } }

	&& li { min-width: 0; margin: 0; padding: 0; }

	.champion-card {
		container-type: inline-size;
		position: relative;
		isolation: isolate;
		display: block;
		aspect-ratio: 1;
		overflow: hidden;
		border-radius: 4px;
		background: #171715;
		color: #fff;
		text-decoration: none;
	}
	.champion-card--classified { ${Y} border: 1px solid #2c2c29; }
	.champion-card--placeholder .champion-card__classified { inset: 0; color: #b8b8ad; }
	.champion-card__number {
		position: absolute;
		top: 8cqi;
		left: 8cqi;
		color: #8b8b84;
		font: 500 clamp(9px, 6cqi, 12px)/1 "IBM Plex Mono", monospace;
		letter-spacing: .1em;
	}
	.champion-card__image {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		transform: scale(1.01);
		transition: transform 480ms cubic-bezier(0.22, 1, 0.36, 1), filter 480ms ease;
	}
	.champion-card__classified {
		position: absolute;
		inset: 0 0 34%;
		display: grid;
		place-items: center;
		color: #8b8b84;
		font: 500 clamp(8px, 5.5cqi, 10px)/1 "IBM Plex Mono", monospace;
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}
	.champion-card__shade {
		position: absolute;
		inset: 0;
		z-index: 1;
		background: linear-gradient(to bottom, transparent 38%, rgba(0, 0, 0, 0.1) 52%, rgba(0, 0, 0, 0.9) 100%);
	}
	.champion-card__info {
		position: absolute;
		inset: auto 8cqi 8cqi;
		z-index: 2;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 6px;
	}
	.champion-card__style {
		border-radius: 999px;
		padding: 5px 8px 4px;
		font: 500 clamp(7px, 4.6cqi, 9px)/1 "IBM Plex Mono", monospace;
		letter-spacing: 0.11em;
		text-transform: uppercase;
	}
	.champion-card__name {
		font-size: clamp(15px, 11cqi, 28px);
		font-weight: 600;
		line-height: 0.95;
		letter-spacing: -0.035em;
		text-transform: uppercase;
		text-wrap: balance;
	}
	.champion-card__meta {
		color: rgba(255, 255, 255, 0.78);
		font: clamp(8px, 4.8cqi, 10px)/1.45 "IBM Plex Mono", monospace;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}
	@container (max-width: 200px) {
		.champion-card__tags { display: none; }
	}
	.champion-card:hover .champion-card__image,
	.champion-card:focus-visible .champion-card__image {
		transform: scale(1.07);
		filter: saturate(1.08) contrast(1.03);
	}
	.champion-card:focus-visible { outline: 2px solid var(--page-ink); outline-offset: 3px; }
	@media (prefers-reduced-motion: reduce) {
		.champion-card__image { transition: none; }
	}
`,X=e.span`
	display: inline-block;
	flex-shrink: 0;
	object-fit: cover;
	vertical-align: middle;
	border-radius: ${({$round:e})=>e?`50%`:`4px`};
	background-color: #171715;
	&:is(span) { ${Y} }
`,Z=n();function Q(e){let t=v(e);return t.length>1?`${t.join(` + `).toLowerCase().replace(/^./,e=>e.toUpperCase())} duo`:t[0]}function $({champion:e}){let n=J(e.id);return(0,Z.jsx)(`li`,{children:(0,Z.jsxs)(t,{className:`champion-card${n?``:` champion-card--classified`}`,to:`/game/docs/${e.id}`,children:[n?(0,Z.jsx)(`img`,{className:`champion-card__image`,src:n.image,alt:``,loading:`lazy`,style:{objectPosition:n.position}}):(0,Z.jsx)(`span`,{className:`champion-card__classified`,"aria-hidden":`true`,children:`Artwork classified`}),(0,Z.jsx)(`span`,{className:`champion-card__shade`,"aria-hidden":`true`}),(0,Z.jsxs)(`span`,{className:`champion-card__info`,children:[n&&(0,Z.jsx)(`span`,{className:`champion-card__style`,style:{background:n.badge,color:n.badgeInk},children:n.style}),(0,Z.jsx)(`strong`,{className:`champion-card__name`,children:e.name}),(0,Z.jsxs)(`span`,{className:`champion-card__meta`,children:[Q(e),(0,Z.jsx)(`span`,{className:`champion-card__tags`,children:e.tags.slice(0,2).map(e=>` · ${e}`)})]})]})]})})}function ue({champions:e=h,columns:t=4,label:n=`Champions`,showClassified:r=!1}){return(0,Z.jsx)(le,{style:{"--columns":t},children:(0,Z.jsxs)(`ul`,{className:`champion-grid`,"aria-label":n,children:[e.map(e=>(0,Z.jsx)($,{champion:e},e.id)),r&&(0,Z.jsx)(`li`,{children:(0,Z.jsxs)(`div`,{className:`champion-card champion-card--classified champion-card--placeholder`,role:`group`,"aria-label":`Champion 12, classified`,children:[(0,Z.jsx)(`span`,{className:`champion-card__number`,"aria-hidden":`true`,children:`12`}),(0,Z.jsx)(`span`,{className:`champion-card__classified`,children:`Classified`})]})})]})})}function de({id:e,size:t=40,round:n=!1}){let r=J(e);return r?(0,Z.jsx)(X,{as:`img`,src:r.thumb,alt:``,width:t,height:t,loading:`lazy`,style:{width:t,height:t,objectPosition:r.position},$round:n}):(0,Z.jsx)(X,{"aria-hidden":`true`,style:{width:t,height:t},$round:n})}export{d as _,S as a,s as b,_ as c,ie as d,l as f,a as g,o as h,J as i,ae as l,te as m,de as n,g as o,ne as p,Q as r,h as s,ue as t,c as u,u as v,re as y};