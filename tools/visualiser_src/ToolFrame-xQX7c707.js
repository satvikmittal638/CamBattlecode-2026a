import{S as e,_ as t,a as n,g as r,h as i,n as a,t as o,v as s,y as c}from"./jsx-runtime-mwuK5CdP.js";import{t as l}from"./preload-helper-Cr9f1lzb.js";import{c as u,s as d}from"./api-BEOnakb7.js";import{G as f,X as p}from"./service-B8iLBOQ9.js";import{n as m}from"./replay-navigation-CmpvvOq_.js";var h=e(c(),1),g=a`
	to { transform: rotate(360deg); }
`,_=n.section`
	display: flex;
	flex-direction: column;
	gap: 10px;
	min-width: 0;
	height: calc(100dvh - var(--status-bar-height, 0px) - 24px);
	min-height: 260px;
	&:fullscreen {
		width: 100%;
		height: 100dvh;
		min-height: 0;
		padding: 12px;
		background: var(--panel-subtle);
	}
	${({$expanded:e})=>e&&`
		position: fixed;
		inset: 0;
		z-index: 20;
		height: 100dvh;
		min-height: 0;
		padding: 12px;
		background: var(--panel-subtle);
	`}
`,v=n.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	flex-shrink: 0;
	h1 {
		margin: 0;
		font-size: clamp(1.05rem, 2vw, 1.4rem);
		line-height: 1.3;
	}
`,y=n.div`
	display: flex;
	align-items: center;
	gap: 8px;
	margin-left: auto;
	@media (max-width: 600px) {
		.button-label, kbd { display: none; }
	}
`,b=n.p`
	margin: 0;
	font-size: 12px;
	color: var(--page-ink);
`,x=n.button`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 7px;
	min-height: 36px;
	padding: 7px 11px;
	flex-shrink: 0;
	border: 1px solid var(--panel-border);
	border-radius: 5px;
	background: var(--panel-surface);
	color: var(--page-ink);
	font-size: 12px;
	font-weight: 600;
	&:hover { background: var(--nav-hover-bg); }
	&:disabled { opacity: 0.5; cursor: not-allowed; }
	&:focus-visible { outline: 2px solid var(--page-ink); outline-offset: 3px; }
	svg { width: 16px; height: 16px; }
	kbd {
		color: var(--muted-ink);
		font: 10px 'IBM Plex Mono', monospace;
		border-left: 1px solid var(--panel-border);
		padding-left: 7px;
	}
	@media (max-width: 480px) {
		padding: 7px 8px;
		kbd { display: none; }
	}
`,S=n.div`
	position: relative;
	flex: 1;
	min-height: 0;
	overflow: hidden;
	border: 1px solid var(--panel-border);
	border-radius: 6px;
	background: var(--panel-surface);
	iframe {
		display: block;
		width: 100%;
		height: 100%;
		border: 0;
	}
`,C=n.div`
	position: absolute;
	inset: 0;
	display: grid;
	place-items: center;
	background: var(--panel-surface);
	color: var(--page-ink);
	svg { width: 48px; height: 48px; overflow: visible; }
	.loading-track { stroke: var(--panel-border); }
	.loading-orbit {
		transform-origin: 24px 24px;
		animation: ${g} 1.2s linear infinite;
	}
	@media (prefers-reduced-motion: reduce) {
		.loading-orbit { animation: none; }
	}
`,w=n.div`
	position: absolute;
	inset: 0;
	display: grid;
	place-content: center;
	justify-items: center;
	gap: 16px;
	padding: 24px;
	background: var(--panel-surface);
	text-align: center;
	p { max-width: 36rem; margin: 0; color: var(--page-ink); }
`,T=a`
	50% { opacity: .45; }
`,E=n.div`
	position: absolute;
	inset: 0;
	display: grid;
	grid-template-columns: clamp(220px, 23%, 320px) minmax(0, 1fr);
	gap: 1px;
	background: #191b1ef2;
	color: #adb0b8;
	pointer-events: auto;
	i { display: block; border-radius: 4px; background: #72778226; animation: ${T} 1.8s ease-in-out infinite; }
	.skeleton-sidebar { padding: 18px 14px; display: flex; flex-direction: column; gap: 10px; background: #23252bd9; overflow: hidden; }
	.skeleton-sidebar i { min-height: 28px; }
	.skeleton-sidebar .skeleton-title { width: 55%; min-height: 14px; margin: 5px 0 16px; }
	.skeleton-sidebar .skeleton-chart { min-height: 110px; margin-top: 12px; }
	.skeleton-game { display: grid; grid-template-rows: auto minmax(0, 1fr) auto; gap: 24px; padding: 20px; min-width: 0; }
	.skeleton-teams { display: flex; justify-content: space-between; gap: 24px; }
	.skeleton-teams i { width: 30%; max-width: 190px; height: 48px; }
	.skeleton-map { display: grid; place-content: center; justify-items: center; gap: 16px; font-size: 12px; }
	.skeleton-map i { width: clamp(60px, 12vw, 140px); aspect-ratio: 1; opacity: .4; border-radius: 12px; }
	.skeleton-playback { display: grid; gap: 12px; }
	.skeleton-playback i:first-child { height: 6px; }
	.skeleton-playback i:last-child { height: 28px; width: 180px; max-width: 100%; justify-self: center; }
	@media (max-width: 760px) {
		grid-template-columns: minmax(0, 1fr);
		.skeleton-sidebar { display: none; }
		.skeleton-game { padding: 14px; }
		.skeleton-teams i { width: 40%; height: 34px; }
	}
	@media (prefers-reduced-motion: reduce) { i { animation: none; } }
`,D=[`cambc.graphics.v1`,`cambc.graphics.mode`,`cambc.showFramerate`,`cambc.groundResolution`],O=new Map;function k(){let e={};for(let t of D)try{let n=localStorage.getItem(t);n!==null&&(e[t]=n)}catch{let n=O.get(t);n!==void 0&&(e[t]=n)}return e}function A(e,t=!1){if(!e||typeof e!=`object`||Array.isArray(e))return;let n=k();for(let r of D){let i=e[r];if(!(typeof i!=`string`||i.length>2048||t&&r in n)){O.set(r,i);try{localStorage.setItem(r,i)}catch{}}}}function j(e){return e===null||D.some(t=>t===e)}var M=o();function N({tool:e,session:n,live:r=!1,matchId:a,navigation:o}){let[c]=s(),l=c.get(`admin`)===`true`,{mapId:u,matchId:d}=t(),p=a??u??d,{state:g}=i(),_=(0,h.useMemo)(()=>e===`visualiser`&&p?m(o??g?.matchNavigation,p):null,[e,p,g,o]);return e===`visualiser`&&(n.loading||n.error||!n.profile)?(0,M.jsx)(f,{session:n}):(0,M.jsx)(P,{tool:e,id:p,admin:l,live:r,navigation:_},`${e}-${e===`mapeditor`?p:`replays`}-${l}-${r}`)}function P({tool:e,id:t,admin:n,live:i,navigation:a}){let o=r(),s=e===`mapeditor`?`Map editor`:`Visualiser`,c=(0,h.useRef)(null),f=(0,h.useRef)(null),g=(0,h.useRef)(null),T=(0,h.useRef)(null),D=(0,h.useRef)(null),[O,N]=(0,h.useState)(``),[P,F]=(0,h.useState)(``),[I,L]=(0,h.useState)(!0),[R,z]=(0,h.useState)(!1),[B,V]=(0,h.useState)(!1),[H,U]=(0,h.useState)(!1),[W,G]=(0,h.useState)(``),[K,q]=(0,h.useState)(0),J=(0,h.useRef)({url:``,attempt:0,ready:!1}),Y=i||R||B;(0,h.useLayoutEffect)(()=>{L(!0),F(``)},[t]),(0,h.useEffect)(()=>{let e=()=>{V(document.fullscreenElement===c.current),G(``),g.current?.focus({preventScroll:!0})};return document.addEventListener(`fullscreenchange`,e),()=>document.removeEventListener(`fullscreenchange`,e)},[]);async function X(){if(!(!c.current||H)){G(``),U(!0);try{document.fullscreenElement===c.current?await document.exitFullscreen():await c.current.requestFullscreen()}catch{G(`Fullscreen could not be changed. Please try again.`)}finally{U(!1)}}}return(0,h.useLayoutEffect)(()=>{if(!Y||!c.current)return;let e=[],t=c.current;for(;t.parentElement;){for(let n of t.parentElement.children)!(n instanceof HTMLElement)||n===t||(e.push({element:n,inert:n.inert}),n.inert=!0);if(t=t.parentElement,t===document.body)break}let n=document.body.style.overflow;document.body.style.overflow=`hidden`,(B?g.current:f.current)?.focus({preventScroll:!0});let r=e=>{e.key!==`Escape`||e.defaultPrevented||document.fullscreenElement!==c.current&&(e.preventDefault(),z(!1))};return window.addEventListener(`keydown`,r),()=>{window.removeEventListener(`keydown`,r),document.body.style.overflow=n;for(let{element:t,inert:n}of e)t.inert=n;(B?g.current:f.current)?.focus({preventScroll:!0})}},[Y,B]),(0,h.useEffect)(()=>{let t=!0;return N(``),F(``),L(!0),fetch(`/service/tools/${e}/current.json`,{cache:`no-cache`}).then(async e=>{if(!e.ok)throw Error(`This tool has not been published yet`);return e.json()}).then(n=>{if(n.protocol!==1||typeof n.path!=`string`||!RegExp(`^/service/tools/${e}/releases/[a-zA-Z0-9-]+/index\\.html$`).test(n.path))throw Error(`Incompatible tool release`);t&&N(n.path)}).catch(e=>{t&&F(e instanceof Error?e.message:`Could not load tool`)}),()=>{t=!1}},[e,K]),(0,h.useEffect)(()=>{if(!O)return;(J.current.url!==O||J.current.attempt!==K)&&(J.current={url:O,attempt:K,ready:!1});let r=J.current,s=crypto.randomUUID(),f=new URL(O,location.href).origin,h=new AbortController,g=!1,_=!1,v,y=a,b=()=>{_&&!h.signal.aborted&&D.current?.contentWindow?.postMessage({protocol:`cambc-tools`,version:1,type:`navigation`,id:t,matchNavigation:y},f)},x=()=>{!r.ready||r.pending||g||!v||!t||h.signal.aborted||(g=!0,r.pending={id:t,requestId:s},D.current?.contentWindow?.postMessage({protocol:`cambc-tools`,version:1,type:`load`,kind:e===`mapeditor`?`map`:`replay`,id:t,requestId:s,bytes:v,...y?{matchNavigation:y}:{}},f,[v]),v=void 0)},S=()=>D.current?.contentWindow?.postMessage({protocol:`cambc-tools`,version:1,type:`preferences`,preferences:k()},f),C=()=>{t&&e===`visualiser`&&D.current?.contentWindow?.postMessage({protocol:`cambc-tools`,version:1,type:`prepare-load`,id:t,requestId:s},f)},w=e=>{j(e.key)&&S()},T=async a=>{if(a.source===D.current?.contentWindow&&a.origin===f&&a.data?.protocol===`cambc-tools`&&a.data.version===1){if(a.data.type===`load-preferences`||a.data.type===`save-preferences`){A(a.data.preferences,a.data.type===`load-preferences`),a.data.type===`load-preferences`&&S();return}if(a.data.type===`select-match`){e===`visualiser`&&a.data.currentMatchId===t&&a.data.id!==t&&y?.matches.some(e=>e.id===a.data.id&&e.available)&&o(i?`/game/admin/live/match-groups/${y.groupId}?match=${encodeURIComponent(a.data.id)}`:`/game/visualiser/${encodeURIComponent(a.data.id)}${n?`?admin=true`:``}`,{state:{matchNavigation:{...y,currentMatchId:a.data.id}}});return}if(a.data.type===`exit-expanded`){document.fullscreenElement===c.current?document.exitFullscreen().catch(()=>G(`Fullscreen could not be closed. Use the Exit fullscreen button or Escape.`)):z(!1);return}if(a.data.type===`error`){if(a.data.id!==void 0){if(a.data.id!==r.pending?.id||a.data.requestId!==void 0&&a.data.requestId!==r.pending?.requestId)return;let e=r.pending?.requestId===s;if(r.pending=void 0,!e){x();return}}F(typeof a.data.message==`string`?a.data.message:`Could not load file`);return}if(a.data.type===`loaded`){if(a.data.id!==r.pending?.id||a.data.requestId!==void 0&&a.data.requestId!==r.pending?.requestId)return;let e=r.pending?.requestId===s;if(r.pending=void 0,!e){x();return}_=!0,requestAnimationFrame(()=>requestAnimationFrame(()=>{h.signal.aborted||L(!1)})),b();return}a.data.type!==`ready`||r.ready||(r.ready=!0,S(),C(),t?x():L(!1))}};return window.addEventListener(`message`,T),window.addEventListener(`storage`,w),r.ready&&C(),r.ready&&!t&&L(!1),t&&(async()=>{try{(i||a?.teamAName&&a.teamBName&&a.matches.every(e=>e.available&&e.winner!=null&&e.teamASide!=null)?Promise.resolve({navigation:a}):e===`visualiser`?u(`/match-groups/for-match/${encodeURIComponent(t)}`,{signal:AbortSignal.any([h.signal,AbortSignal.timeout(5e3)]),redirectAccess:!1}).catch(()=>({navigation:a})):Promise.resolve({navigation:null})).then(e=>{h.signal.aborted||(y=m(e.navigation,t)??a,b())});let r=e===`mapeditor`?`/api/v1/${n?`admin/matchmaking/`:``}maps/${encodeURIComponent(t)}/file`:`/api/v1/matches/${encodeURIComponent(t)}/view${i?`?audience=spectator`:``}`,o=await(await p(()=>l(()=>import(`./download-kYVHq5_k.js`),[]))).fetchMatchFile(r,h.signal);if(!o.ok){let e=await o.json().catch(()=>null);throw h.signal.aborted||d(o.status,e),Error(o.status===404?`File unavailable, or it does not belong to your team`:`Could not load file`)}if(v=await o.arrayBuffer(),h.signal.aborted)return;x()}catch(e){h.signal.aborted||F(e instanceof Error?e.message:`Load failed`)}})(),()=>{h.abort(),window.removeEventListener(`message`,T),window.removeEventListener(`storage`,w)}},[O,t,e,n,i,K,o,a]),(0,M.jsxs)(_,{ref:c,$expanded:Y,role:Y?`dialog`:void 0,"aria-modal":Y||void 0,"aria-labelledby":`tool-title`,children:[Y&&(0,M.jsx)(`span`,{className:`visually-hidden`,tabIndex:0,onFocus:()=>(P?T.current:I?g.current:D.current)?.focus()}),(0,M.jsxs)(v,{children:[(0,M.jsx)(`h1`,{id:`tool-title`,children:s}),(0,M.jsxs)(y,{children:[!i&&(0,M.jsxs)(x,{ref:f,type:`button`,"aria-expanded":R,"aria-label":R?`Exit expanded view`:`Expand view`,"aria-controls":`tool-viewport`,title:B?`Exit fullscreen to change expanded view`:R?`Exit expanded view (Escape)`:`Expand within this tab`,disabled:B,onClick:()=>z(e=>!e),children:[(0,M.jsx)(`svg`,{viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.75`,strokeLinecap:`round`,strokeLinejoin:`round`,"aria-hidden":`true`,children:(0,M.jsx)(`path`,{d:R?`M4 9h5V4m6 0v5h5M4 15h5v5m6 0v-5h5`:`M9 4H4v5m11-5h5v5M4 15v5h5m6 0h5v-5`})}),(0,M.jsx)(`span`,{className:`button-label`,children:R?`Exit expanded view`:`Expand view`}),R&&(0,M.jsx)(`kbd`,{"aria-hidden":`true`,children:`Esc`})]}),(0,M.jsxs)(x,{ref:g,type:`button`,"aria-label":B?`Exit fullscreen`:`Fullscreen`,"aria-pressed":B,"aria-controls":`tool-viewport`,title:document.fullscreenEnabled?B?`Exit fullscreen (Escape)`:`Enter fullscreen`:`Fullscreen is unavailable in this browser`,disabled:!document.fullscreenEnabled||H,onClick:()=>void X(),children:[(0,M.jsx)(`svg`,{viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.75`,strokeLinecap:`round`,strokeLinejoin:`round`,"aria-hidden":`true`,children:(0,M.jsx)(`path`,{d:B?`M3 8h5V3m8 0v5h5M3 16h5v5m8 0v-5h5`:`M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5`})}),(0,M.jsx)(`span`,{className:`button-label`,children:B?`Exit fullscreen`:`Fullscreen`})]})]})]}),W&&(0,M.jsx)(b,{role:`alert`,children:W}),(0,M.jsxs)(S,{id:`tool-viewport`,"aria-busy":I&&!P,children:[O&&(0,M.jsx)(`iframe`,{ref:D,title:s,src:O,sandbox:`allow-scripts allow-same-origin allow-downloads allow-forms`,referrerPolicy:`strict-origin`,inert:I||!!P},K),I&&!P&&e===`visualiser`&&(0,M.jsxs)(E,{role:`status`,"aria-label":`Loading replay`,children:[(0,M.jsxs)(`div`,{className:`skeleton-sidebar`,"aria-hidden":`true`,children:[(0,M.jsx)(`i`,{className:`skeleton-title`}),(0,M.jsx)(`i`,{}),(0,M.jsx)(`i`,{}),(0,M.jsx)(`i`,{}),(0,M.jsx)(`i`,{className:`skeleton-chart`}),(0,M.jsx)(`i`,{}),(0,M.jsx)(`i`,{className:`skeleton-chart`})]}),(0,M.jsxs)(`div`,{className:`skeleton-game`,"aria-hidden":`true`,children:[(0,M.jsxs)(`div`,{className:`skeleton-teams`,children:[(0,M.jsx)(`i`,{}),(0,M.jsx)(`i`,{})]}),(0,M.jsxs)(`div`,{className:`skeleton-map`,children:[(0,M.jsx)(`i`,{}),(0,M.jsx)(`span`,{children:`Loading replay…`})]}),(0,M.jsxs)(`div`,{className:`skeleton-playback`,children:[(0,M.jsx)(`i`,{}),(0,M.jsx)(`i`,{})]})]})]}),I&&!P&&e===`mapeditor`&&(0,M.jsx)(C,{role:`status`,"aria-label":`Loading ${s.toLowerCase()}`,children:(0,M.jsxs)(`svg`,{viewBox:`0 0 48 48`,fill:`none`,"aria-hidden":`true`,children:[(0,M.jsx)(`circle`,{className:`loading-track`,cx:`24`,cy:`24`,r:`20`,strokeWidth:`2`}),(0,M.jsx)(`circle`,{className:`loading-orbit`,cx:`24`,cy:`24`,r:`20`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeDasharray:`28 98`}),(0,M.jsx)(`path`,{d:`m24 16 7 8-7 8-7-8Z`,stroke:`currentColor`,strokeWidth:`1.5`})]})}),P&&(0,M.jsxs)(w,{children:[(0,M.jsx)(`p`,{role:`alert`,children:P}),(0,M.jsx)(x,{ref:T,type:`button`,onClick:()=>q(e=>e+1),children:`Try again`})]})]}),Y&&(0,M.jsx)(`span`,{className:`visually-hidden`,tabIndex:0,onFocus:()=>(B?g.current:f.current)?.focus()})]})}export{N as ToolFrame};