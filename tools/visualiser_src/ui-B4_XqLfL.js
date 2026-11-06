import{S as e,a as t,l as n,t as r,y as i}from"./jsx-runtime-mwuK5CdP.js";import{n as a}from"./schedule-B3T-F9_N.js";var o=e(i(),1),s=`Europe/London`,c=a.flatMap(e=>e.sprint&&e.lock?[{title:e.title,at:new Date(e.lock)}]:[]);function l(e=new Date){return c.find(t=>t.at.getTime()>e.getTime())??null}function u(e){return Intl.DateTimeFormat().resolvedOptions().timeZone===s||new Intl.DateTimeFormat(`en-GB`,{timeZone:s,hour:`2-digit`,minute:`2-digit`,day:`numeric`}).format(e)===new Intl.DateTimeFormat(`en-GB`,{hour:`2-digit`,minute:`2-digit`,day:`numeric`}).format(e)?null:new Intl.DateTimeFormat(`en-GB`,{weekday:`short`,day:`numeric`,month:`short`,hour:`2-digit`,minute:`2-digit`,hourCycle:`h23`,timeZoneName:`short`}).format(e)}function d(e,t=new Date){let n=Math.max(0,Math.round((e.getTime()-t.getTime())/6e4));if(n<60)return`in ${n} min`;let r=Math.floor(n/60);return r<48?`in ${r} h${n%60?` ${n%60} min`:``}`:`in ${Math.floor(r/24)} days${r%24?` ${r%24} h`:``}`}function f(e,t=new Date){let n=new Date(e),r=Math.round((t.getTime()-n.getTime())/1e3);return r<45?`just now`:r<3600?`${Math.max(1,Math.round(r/60))} min ago`:r<86400?`${Math.round(r/3600)} h ago`:r<604800?`${Math.round(r/86400)} d ago`:p(e,{weekday:!1})}function p(e,{weekday:t=!0}={}){return new Intl.DateTimeFormat(`en-GB`,{...t?{weekday:`short`}:{},day:`numeric`,month:`short`,hour:`2-digit`,minute:`2-digit`,hourCycle:`h23`}).format(new Date(e))}var m=r(),h=e=>(0,m.jsx)(`svg`,{viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.8`,strokeLinecap:`round`,strokeLinejoin:`round`,"aria-hidden":`true`,children:e}),g={upload:h((0,m.jsx)(`path`,{d:`M12 16V4m-5 5 5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3`})),zip:h((0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(`path`,{d:`M6 2h9l5 5v15H6Z`}),(0,m.jsx)(`path`,{d:`M15 2v5h5M10 6h2M10 9h2M10 12h2M10 15h2v3h-2Z`})]})),download:h((0,m.jsx)(`path`,{d:`M12 4v12m-5-5 5 5 5-5M4 20h16`})),replay:h((0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(`circle`,{cx:`12`,cy:`12`,r:`9`}),(0,m.jsx)(`path`,{d:`m10 8.5 5 3.5-5 3.5Z`})]})),swords:h((0,m.jsx)(`path`,{d:`M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2M9.5 17.5 21 6V3h-3L6.5 14.5M11 19l-6-6M8 16l-4 4M5 21l-2-2`})),check:h((0,m.jsx)(`path`,{d:`m5 12.5 4.5 4.5L19 7.5`})),cross:h((0,m.jsx)(`path`,{d:`M6 6l12 12M18 6 6 18`})),clock:h((0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(`circle`,{cx:`12`,cy:`12`,r:`9`}),(0,m.jsx)(`path`,{d:`M12 7v5l3 2`})]})),spinner:h((0,m.jsx)(`path`,{d:`M12 3a9 9 0 1 0 9 9`})),alert:h((0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(`path`,{d:`M12 3 2 20h20Z`}),(0,m.jsx)(`path`,{d:`M12 10v4M12 17h.01`})]})),pin:h((0,m.jsx)(`path`,{d:`M9 4h6l-1 6 4 3v2H6v-2l4-3ZM12 15v6`})),chevron:h((0,m.jsx)(`path`,{d:`m9 6 6 6-6 6`})),search:h((0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(`circle`,{cx:`11`,cy:`11`,r:`7`}),(0,m.jsx)(`path`,{d:`m20 20-3.5-3.5`})]})),trophy:h((0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(`path`,{d:`M8 4h8v5a4 4 0 0 1-8 0Z`}),(0,m.jsx)(`path`,{d:`M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M9 17h6`})]})),log:h((0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(`path`,{d:`M5 4h14v16H5Z`}),(0,m.jsx)(`path`,{d:`M8 8h8M8 12h8M8 16h5`})]})),code:h((0,m.jsx)(`path`,{d:`m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14`}))},_={win:`Win`,loss:`Loss`,draw:`Draw`},v=t.span`
	display: inline-grid;
	place-items: center;
	flex-shrink: 0;
	width: var(--size, 1.75rem);
	height: var(--size, 1.75rem);
	border-radius: 0.3rem;
	font: 700 calc(var(--size, 1.75rem) * 0.48) / 1 ${({theme:e})=>e.fonts.mono};
	&[data-result="win"] { background: ${({theme:e})=>e.colors.success}; color: ${({theme:e})=>e.colors.surface}; }
	&[data-result="loss"] { background: transparent; color: ${({theme:e})=>e.colors.danger}; box-shadow: inset 0 0 0 1.5px currentColor; }
	&[data-result="draw"] { background: ${({theme:e})=>e.colors.subtle}; color: ${({theme:e})=>e.colors.muted}; box-shadow: inset 0 0 0 1px ${({theme:e})=>e.colors.border}; }
`;function y({result:e,size:t,label:n}){return(0,m.jsx)(v,{"data-result":e,style:t?{"--size":t}:void 0,role:`img`,"aria-label":n??_[e],title:n??_[e],children:_[e][0]})}t.span`
	display: inline-flex;
	gap: 3px;
`;var b=t.span`
	display: inline-flex;
	align-items: center;
	gap: 0.35rem;
	padding: 0.2rem 0.6rem 0.2rem 0.45rem;
	border: 1px solid currentColor;
	border-radius: ${({theme:e})=>e.radii.pill};
	font-size: 0.78rem;
	font-weight: 650;
	line-height: 1.3;
	white-space: nowrap;
	svg { width: 0.95rem; height: 0.95rem; }
	&[data-tone="good"] { color: ${({theme:e})=>e.colors.success}; }
	&[data-tone="bad"] { color: ${({theme:e})=>e.colors.danger}; }
	&[data-tone="busy"] { color: ${({theme:e})=>e.colors.ink}; border-color: ${({theme:e})=>e.colors.border}; }
	&[data-tone="busy"] svg[data-spin] { animation: compete-spin 1s linear infinite; }
	&[data-tone="plain"] { color: ${({theme:e})=>e.colors.muted}; border-color: ${({theme:e})=>e.colors.border}; }
	@keyframes compete-spin { to { transform: rotate(360deg); } }
	@media (prefers-reduced-motion: reduce) { &[data-tone="busy"] svg[data-spin] { animation: none; } }
`,x={queued:{label:`Queued`,tone:`plain`,icon:g.clock},active:{label:`Active`,tone:`good`,icon:g.check},inactive:{label:`Not active`,tone:`plain`,icon:g.clock},errored:{label:`Errored`,tone:`bad`,icon:g.cross},cancelled:{label:`Cancelled`,tone:`plain`,icon:g.clock},running:{label:`Playing`,tone:`busy`,icon:g.spinner,spin:!0},finished:{label:`Finished`,tone:`good`,icon:g.check},error:{label:`Server error`,tone:`bad`,icon:g.alert}};function S({status:e,label:t}){let n=x[e];return(0,m.jsxs)(b,{"data-tone":n.tone,children:[n.spin?(0,m.jsx)(`svg`,{"data-spin":!0,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,"aria-hidden":`true`,children:(0,m.jsx)(`path`,{d:`M12 3a9 9 0 1 0 9 9`})}):n.icon,t??n.label]})}var C=t.span`
	display: inline-block;
	padding: 0.1rem 0.45rem;
	border-radius: ${({theme:e})=>e.radii.small};
	background: ${({theme:e})=>e.colors.subtle};
	color: ${({theme:e})=>e.colors.muted};
	font: 600 0.68rem/1.5 ${({theme:e})=>e.fonts.mono};
	letter-spacing: 0.04em;
	text-transform: uppercase;
	white-space: nowrap;
	&[data-tone="you"] { background: ${({theme:e})=>e.colors.primary}; color: ${({theme:e})=>e.colors.surface}; }
	&[data-tone="outline"] { background: transparent; box-shadow: inset 0 0 0 1px ${({theme:e})=>e.colors.border}; }
`,w=t(C)`
	text-transform: none;
	flex-shrink: 0;
`;function T(){return(0,m.jsx)(w,{"data-tone":`outline`,title:`Includes an admin. Can play ladder and unranked matches. Admin teams cannot qualify for tournaments; eligibility is fixed at the qualification deadline.`,"aria-label":`dev team: includes an admin`,children:`dev`})}function E({kind:e,label:t}){return(0,m.jsx)(C,{"data-tone":`outline`,children:e===`tournament`?t??`Tournament`:e===`ranked`?`Ranked`:`Unranked`})}var D=t.span`
	font-variant-numeric: tabular-nums;
	white-space: nowrap;
	&[data-sign="up"] { color: ${({theme:e})=>e.colors.success}; }
	&[data-sign="down"] { color: ${({theme:e})=>e.colors.danger}; }
	&[data-sign="flat"] { color: ${({theme:e})=>e.colors.muted}; }
`;function O({value:e,label:t=`rating change`}){return e===null?(0,m.jsx)(D,{"data-sign":`flat`,"aria-label":`No ${t}`,children:`—`}):(e=Math.round(e),e===0?(0,m.jsx)(D,{"data-sign":`flat`,"aria-label":`No ${t}`,children:`±0`}):(0,m.jsxs)(D,{"data-sign":e>0?`up`:`down`,"aria-label":`${t} ${e>0?`up`:`down`} ${Math.abs(e)}`,children:[e>0?`▲`:`▼`,` `,Math.abs(e)]}))}function k({iso:e}){let[,t]=(0,o.useState)(0);return(0,o.useEffect)(()=>{let e=window.setInterval(()=>t(e=>e+1),3e4);return()=>window.clearInterval(e)},[]),(0,m.jsx)(`time`,{dateTime:e,title:p(e),children:f(e)})}var A=t(n)`
	color: inherit;
	font-weight: 650;
	text-decoration: none;
	overflow-wrap: anywhere;
	&:hover { text-decoration: underline; }
`;function j({id:e,name:t}){return(0,m.jsx)(A,{to:`/game/team/${encodeURIComponent(e)}`,children:t})}var M=e=>Math.round(e).toLocaleString(`en-GB`);t(n)`
	display: inline-block;
	font-size: 0.7rem;
	font-weight: 650;
	line-height: 1.4;
	padding: 0.15rem 0.4rem;
	border: 1px solid currentColor;
	border-radius: 0.35rem;
	color: #a8d6a0;
	text-decoration: none;
	overflow-wrap: anywhere;
	&[data-compact] { font-size: 0.6rem; font-weight: 500; padding: 0.05rem 0.25rem; color: ${({theme:e})=>e.colors.muted}; border-color: ${({theme:e})=>e.colors.border}; }
`;export{y as a,k as c,d,u as f,E as i,M as l,f as m,O as n,S as o,l as p,T as r,j as s,C as t,g as u};