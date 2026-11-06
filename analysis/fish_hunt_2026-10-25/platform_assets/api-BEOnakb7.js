import{a as e,i as t,l as n,n as r}from"./jsx-runtime-mwuK5CdP.js";var i=r`
	from { background-position: 200% 0; }
	to { background-position: -200% 0; }
`,a=e.span.attrs({"aria-hidden":!0})`
	display: inline-block;
	width: var(--skeleton-width, 8ch);
	height: 1em;
	vertical-align: middle;
	border-radius: 4px;
	background: linear-gradient(100deg, rgba(128,128,128,.16) 30%, rgba(128,128,128,.3) 50%, rgba(128,128,128,.16) 70%);
	background-size: 200% 100%;
	animation: ${i} 1.8s ease-in-out infinite;
	@media (prefers-reduced-motion: reduce) { animation: none; }
`,o=e.div`
	display: grid;
	gap: ${({theme:e})=>e.spacing.lg};
`,s=e.section`
	min-width: 0;
	background: ${({theme:e})=>e.colors.surface};
	border: 1px solid ${({theme:e})=>e.colors.border};
	border-radius: ${({theme:e})=>e.radii.medium};
	padding: clamp(1.25rem, 3vw, 2rem);
	h2 {
		font-size: 1.5rem;
		margin-bottom: 1rem;
	}
	h3 {
		font-size: 1.1rem;
	}
	p:last-child {
		margin-bottom: 0;
	}
`,c=e.div`
	margin-bottom: 2rem;
	h1 {
		font-size: clamp(2rem, 5vw, 3rem);
		margin: 0.5rem 0 1rem;
	}
	p {
		margin-bottom: 0;
		color: ${({theme:e})=>e.colors.muted};
		max-width: 45rem;
	}
`,l=e.span`
	color: ${({theme:e})=>e.colors.muted};
	text-transform: uppercase;
	font-size: 0.75rem;
	font-weight: 750;
	letter-spacing: 0.13em;
`,u=e.p`
	color: ${({theme:e})=>e.colors.muted};
	font-size: 0.925rem;
`,d=t`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	min-height: 2.75rem;
	padding: 0.6rem 1rem;
	border: 1px solid
		${({theme:e,$variant:t})=>t===`danger`?e.colors.danger:t===`primary`?e.colors.primary:e.colors.border};
	border-radius: ${({theme:e})=>e.radii.small};
	font-weight: 650;
	font-size: 0.9rem;
	background: ${({theme:e,$variant:t})=>t===`primary`?e.colors.primary:e.colors.surface};
	color: ${({theme:e,$variant:t})=>t===`primary`?e.colors.surface:t===`danger`?e.colors.danger:e.colors.ink};
	&:hover:not(:disabled) {
		box-shadow: 0 0 0 2px ${({theme:e})=>e.colors.accent};
	}
`,f=e.button`${d}`,p=e(n)`
	${d}
	text-decoration: none;
	&:focus-visible {
		outline: 2px solid ${({theme:e})=>e.colors.primary};
		outline-offset: 3px;
	}
	svg {
		width: 1.125rem;
		height: 1.125rem;
		flex-shrink: 0;
	}
`,m=e.a`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-height: 2.75rem;
	padding: 0.6rem 1rem;
	border-radius: ${({theme:e})=>e.radii.small};
	font-weight: 700;
	text-decoration: none;
	background: ${({theme:e})=>e.colors.primary};
	color: ${({theme:e})=>e.colors.surface};
	&:hover {
		box-shadow: 0 0 0 3px ${({theme:e})=>e.colors.accent};
	}
`,h=e(n)`
	font-weight: 650;
`,g=e.div`
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 0.75rem;
`,_=e.p`
	margin: 0;
	padding: 1rem 1.25rem;
	border-radius: ${({theme:e})=>e.radii.small};
	border: 1px solid ${({theme:e,$error:t})=>t?e.colors.danger:e.colors.border};
	background: ${({theme:e,$error:t})=>t?e.colors.dangerSurface:e.colors.subtle};
	color: ${({theme:e,$error:t})=>t?e.colors.danger:e.colors.primary};
	font-size: 0.925rem;
`,v=e.span`
	display: inline-block;
	padding: 0.2rem 0.65rem;
	background: ${({theme:e})=>e.colors.subtle};
	color: ${({theme:e})=>e.colors.primary};
	font-size: 0.75rem;
	font-weight: 750;
	border-radius: ${({theme:e})=>e.radii.pill};
`;e.div`
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: ${({theme:e})=>e.spacing.lg};
	@media (max-width: ${({theme:e})=>e.breakpoints.mobile}) {
		grid-template-columns: 1fr;
	}
`;var y;function b(e){return e.throwIfAborted(),y??=fetch(`/api/v1/event/status`,{cache:`no-store`,signal:AbortSignal.timeout(15e3)}).then(async e=>{if(!e.ok)throw Error(`Event unavailable`);let t=await e.json();if(!t||![`premier`,`live`,`closed`].includes(t.phase)||typeof t.registrationsOpen!=`boolean`||typeof t.archived!=`boolean`)throw Error(`Invalid event status`);return t}).finally(()=>{y=void 0}),new Promise((t,n)=>{let r=()=>n(e.reason);e.addEventListener(`abort`,r,{once:!0}),y.then(t,n).finally(()=>e.removeEventListener(`abort`,r))})}var x=class extends Error{status;retryAfter;code;constructor(e,t,n,r){super(t),this.status=e,this.retryAfter=n,this.code=r,this.name=`ApiError`}};function S(e){return e instanceof Error?e.message:`The event service is unavailable. Please try again.`}function C(e){return!!e&&!e.deleted&&!e.eventBanned&&!e.platformBanned&&(e.status===`not_registered`||e.status===`withdrawn`)}function w(e,t){let n=e===`registration`?`/api/v1/registration/start`:`/api/v1/auth/start`,r=t??(typeof window>`u`?`/game/home`:`${window.location.pathname}${window.location.search}${window.location.hash}`),i=r.startsWith(`/game/`)&&!/[\\\u0000-\u0020\u007f]/.test(r)?r:`/game/home`;return`${n}?${new URLSearchParams({returnTo:i})}`}function T(e,t){if(typeof window>`u`)return;let n=t&&typeof t==`object`&&`code`in t?t.code:void 0;e===401?window.location.assign(w(`sign_in`)):e===403&&n===`EVENT_REGISTRATION_REQUIRED`&&window.location.assign(w(`registration`))}var E=new Map;async function D(e,t={}){for(let[e,t]of E)t<=Date.now()&&E.delete(e);let n=Math.ceil(((E.get(e)??0)-Date.now())/1e3);if(n>0)throw new x(429,`Please retry in ${n} seconds.`,n);let r=await fetch(`/api/v1${e}`,{credentials:`same-origin`,method:t.method??`GET`,signal:t.signal,...t.body===void 0?{}:{headers:{"content-type":`application/json`},body:JSON.stringify(t.body)}});if(r.status===429){let t=r.headers.get(`Retry-After`),n=t&&/^\d+$/.test(t)?Number(t):t?(Date.parse(t)-Date.now())/1e3:60,i=Math.max(1,Math.min(86400,Number.isFinite(n)?Math.ceil(n):60));throw E.size<256&&E.set(e,Date.now()+i*1e3),new x(429,`Too many requests. Please retry in ${i} seconds.`,i)}if(!r.ok){let e=await r.json().catch(()=>null);t.redirectAccess!==!1&&!t.signal?.aborted&&T(r.status,e);let n=r.status===401?`Your event session has expired. Sign in again.`:`The request could not be completed. Please try again.`,i=e&&typeof e==`object`&&`error`in e&&typeof e.error==`string`?e.error:n,a=e&&typeof e==`object`&&`code`in e&&typeof e.code==`string`?e.code:void 0;throw new x(r.status,i,void 0,a)}if(r.status===204)return;let i=await r.text();return i.trim()===``?void 0:JSON.parse(i)}async function O(e){let t=await b(e);if(t.archived===!1)return null;if(t.archived!==!0)throw Error(`The event status could not be checked. Please try again.`);let n=await fetch(`/archives/current.json`,{signal:e,cache:`no-store`});if(n.status===404||n.status===403)return null;if(!n.ok)throw Error(`The event status could not be checked. Please try again.`);if(n.headers.get(`content-type`)?.includes(`text/html`))return null;let r=await n.json();if(!r||typeof r!=`object`||!(`results`in r)||typeof r.results!=`string`)throw Error(`The event archive is temporarily unavailable.`);let i=new URL(r.results,window.location.origin);if(i.origin!==window.location.origin||!i.pathname.startsWith(`/archives/`)||i.search||i.hash)throw Error(`The event archive is temporarily unavailable.`);return{results:i.pathname}}function k(e){return`/teams/${encodeURIComponent(e)}`}function A(e){let t=new Date(e);return Number.isNaN(t.getTime())?`Unknown date`:t.toLocaleString(void 0,{dateStyle:`medium`,timeStyle:`short`})}export{a as C,o as S,u as _,O as a,p as b,D as c,m as d,g as f,l as g,s as h,A as i,k as l,f as m,w as n,C as o,v as p,S as r,T as s,x as t,b as u,_ as v,h as x,c as y};