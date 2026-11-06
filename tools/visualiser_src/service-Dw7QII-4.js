const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/patch-notes-S0Y9jByz.js","assets/jsx-runtime-mwuK5CdP.js","assets/preload-helper-Cr9f1lzb.js","assets/api-BEOnakb7.js","assets/virtualRows-Dt9bZCUU.js","assets/styles-C3qtsRTT.js","assets/content-BkuSo1L6.js","assets/styles-D02QbUwS.js","assets/ui-atlas-CGtR-pzb.js","assets/announcements-CUz1jKI3.js","assets/admin-BGgiMThz.js","assets/home-C_3Nt6Ys.js","assets/api-5DnoeDrC.js","assets/ui-CijUFLT6.js","assets/schedule-B3T-F9_N.js","assets/BadgeIcons-zFRMe45k.js","assets/ChampionGrid-Cidqkhuk.js","assets/champions-DSjr5HnR.js","assets/SubmissionDeadlineNotice-D4E2AE2V.js","assets/InvalidSubmissionNotice-Dv3-1aii.js","assets/api-CCQDL4D6.js","assets/SchedulePanel-CSU7R16J.js","assets/rating-kLgH88RG.js","assets/performance-Cnq-UJZu.js","assets/profile-bFSgJ0rp.js","assets/LoadingSkeleton-3cKq6Sdr.js","assets/AwardBadges-DbArL7TM.js","assets/CountrySelect-Au9_cmoO.js","assets/admin-DPqvWX46.js","assets/admin-teams-CN2kjW0p.js","assets/useTeamPages-CNunR88G.js","assets/TeamDetails-B5NcTUAl.js","assets/browser-BlLBQdai.js","assets/TeamIdentifier-9YeDWO3v.js","assets/shared-BAXAiGRp.js","assets/distribution-DtYCOOPf.js","assets/cli-login-kgEEVkZz.js","assets/admin-C5kX0bye.js","assets/groups-B4HaiJNx.js","assets/replay-navigation-BYTeqdLI.js","assets/SummaryDownload-DAyTo0s0.js","assets/statistics-CbAxnBGo.js","assets/AdminNav-ZeHwyJjI.js","assets/MapPoolPage-Cv8wPTxZ.js","assets/eligibility-C-JHCgK9.js","assets/ParticipantIdentity-q1jVhdfE.js","assets/admin-DeanDT10.js","assets/team-DxR_rGks.js","assets/invite-DrdGC4VI.js","assets/PerformancePanel-CJjjZlxj.js","assets/TeamView-FfA24FCP.js","assets/JoinTeam-7ZfZJ3ti.js","assets/docs-CraIq4_w.js","assets/ladder-vJxajp2h.js","assets/tournaments-CyxYxv30.js","assets/BracketTree-DTQ4LGVh.js","assets/Details-IWGVrhgD.js","assets/Admin-BzRpC7-_.js","assets/Live-D29U7dwC.js","assets/ToolFrame-BiZv38Hf.js","assets/matches-Byyrqjt0.js","assets/match-database-DL7Wu_Gd.js","assets/submissions-CzvbYN4b.js","assets/operations-DhwN1aWw.js"])))=>i.map(i=>d[i]);
import{S as e,a as t,b as n,c as r,d as i,f as a,h as o,l as s,m as c,o as l,p as u,r as d,t as f,v as p,y as m}from"./jsx-runtime-mwuK5CdP.js";import{t as h}from"./preload-helper-Cr9f1lzb.js";import{C as g,S as _,_ as v,a as y,b,c as x,d as ee,f as te,g as ne,h as re,m as S,n as ie,o as ae,p as oe,r as se,s as ce,t as le,u as ue,v as C,x as w,y as de}from"./api-BEOnakb7.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var fe=6e4,pe=[5e3,1e4,2e4,4e4,6e4],me=15e3;function T(e,t={}){let n=!1,r=0,i=Date.now()+(t.immediate===!1?fe:0),a,o;function s(){window.clearTimeout(a),!(n||o||document.hidden)&&(a=window.setTimeout(()=>void c(),Math.max(0,i-Date.now())))}async function c(c=!1){if(n||o||!c&&document.hidden)return;if(!c&&Date.now()<i){s();return}window.clearTimeout(a);let l=new AbortController;o=l;let u=window.setTimeout(()=>l.abort(new DOMException(`Background refresh timed out`,`TimeoutError`)),me);try{await e(l.signal),l.signal.throwIfAborted(),r=0,i=Date.now()+fe}catch(e){n||(i=Date.now()+(pe[r]??fe),r=Math.min(r+1,pe.length),t.onError?.(e))}finally{window.clearTimeout(u),l.abort(),o=void 0,s()}}return window.addEventListener(`focus`,s),window.addEventListener(`pageshow`,s),window.addEventListener(`online`,s),document.addEventListener(`visibilitychange`,s),s(),{retry:()=>void c(!0),stop(){n=!0,window.clearTimeout(a),o?.abort(),window.removeEventListener(`focus`,s),window.removeEventListener(`pageshow`,s),window.removeEventListener(`online`,s),document.removeEventListener(`visibilitychange`,s)}}}var E=24e4,he=15e3,ge=`event-site-script-recovery`,_e=6e5,ve=class extends Error{reason;constructor(e){super(e===`denied`?`Event access has changed.`:`Page files could not be loaded. Check your connection and reload the page.`),this.name=`SiteAccessError`,this.reason=e}};function ye(e){return e instanceof Error&&/Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Unable to preload CSS/i.test(e.message)}function be(e=performance.timeOrigin){let t=e,n,r;function i(e=!1){let r=Date.now()-t;if(!e&&r>=0&&r<E)return Promise.resolve();if(n)return n;let i=Date.now(),a=new AbortController,o=window.setTimeout(()=>a.abort(),he);return n=(async()=>{try{let e=await fetch(`/api/v1/game/access`,{credentials:`same-origin`,cache:`no-store`,redirect:`manual`,signal:a.signal});if(a.signal.throwIfAborted(),e.type===`opaqueredirect`||e.status===401||e.status===403)throw window.location.replace(`/`),new ve(`denied`);if(e.status!==204)throw new ve(`renewal`);t=i}catch(e){throw e instanceof ve?e:new ve(`renewal`)}finally{window.clearTimeout(o)}})().finally(()=>{n=void 0}),n}async function a(){await i(!0);try{let e=sessionStorage.getItem(ge),t=Number(e),n=Date.now();if(e!==null&&Number.isFinite(t)&&n-t<_e)return;let r=String(n);if(sessionStorage.setItem(ge,r),sessionStorage.getItem(ge)!==r)return}catch{return}window.location.reload()}async function o(e){await i();try{return await e()}catch(e){throw ye(e)?(r??=a(),await r,new ve(`module`)):e}}return{ensure:i,load:o}}var xe,Se=()=>xe??=be(),Ce=(e=!1)=>Se().ensure(e),we=e=>Se().load(e);T(async e=>{await Ce(!0),e.throwIfAborted()},{immediate:!1});var Te=n((e=>{function t(e,t){var n=e.length;e.push(t);a:for(;0<n;){var r=n-1>>>1,a=e[r];if(0<i(a,t))e[r]=t,e[n]=a,n=r;else break a}}function n(e){return e.length===0?null:e[0]}function r(e){if(e.length===0)return null;var t=e[0],n=e.pop();if(n!==t){e[0]=n;a:for(var r=0,a=e.length,o=a>>>1;r<o;){var s=2*(r+1)-1,c=e[s],l=s+1,u=e[l];if(0>i(c,n))l<a&&0>i(u,c)?(e[r]=u,e[l]=n,r=l):(e[r]=c,e[s]=n,r=s);else if(l<a&&0>i(u,n))e[r]=u,e[l]=n,r=l;else break a}}return t}function i(e,t){var n=e.sortIndex-t.sortIndex;return n===0?e.id-t.id:n}if(e.unstable_now=void 0,typeof performance==`object`&&typeof performance.now==`function`){var a=performance;e.unstable_now=function(){return a.now()}}else{var o=Date,s=o.now();e.unstable_now=function(){return o.now()-s}}var c=[],l=[],u=1,d=null,f=3,p=!1,m=!1,h=!1,g=!1,_=typeof setTimeout==`function`?setTimeout:null,v=typeof clearTimeout==`function`?clearTimeout:null,y=typeof setImmediate<`u`?setImmediate:null;function b(e){for(var i=n(l);i!==null;){if(i.callback===null)r(l);else if(i.startTime<=e)r(l),i.sortIndex=i.expirationTime,t(c,i);else break;i=n(l)}}function x(e){if(h=!1,b(e),!m){if(n(c)!==null)m=!0,ee||(ee=!0,ae());else{var t=n(l);t!==null&&ce(x,t.startTime-e)}}}var ee=!1,te=-1,ne=5,re=-1;function S(){return g?!0:!(e.unstable_now()-re<ne)}function ie(){if(g=!1,ee){var t=e.unstable_now();re=t;var i=!0;try{a:{m=!1,h&&(h=!1,v(te),te=-1),p=!0;var a=f;try{b:{for(b(t),d=n(c);d!==null&&!(d.expirationTime>t&&S());){var o=d.callback;if(typeof o==`function`){d.callback=null,f=d.priorityLevel;var s=o(d.expirationTime<=t);if(t=e.unstable_now(),typeof s==`function`){d.callback=s,b(t),i=!0;break b}d===n(c)&&r(c),b(t)}else r(c);d=n(c)}if(d!==null)i=!0;else{var u=n(l);u!==null&&ce(x,u.startTime-t),i=!1}}break a}finally{d=null,f=a,p=!1}i=void 0}}finally{i?ae():ee=!1}}}var ae;if(typeof y==`function`)ae=function(){y(ie)};else if(typeof MessageChannel<`u`){var oe=new MessageChannel,se=oe.port2;oe.port1.onmessage=ie,ae=function(){se.postMessage(null)}}else ae=function(){_(ie,0)};function ce(t,n){te=_(function(){t(e.unstable_now())},n)}e.unstable_IdlePriority=5,e.unstable_ImmediatePriority=1,e.unstable_LowPriority=4,e.unstable_NormalPriority=3,e.unstable_Profiling=null,e.unstable_UserBlockingPriority=2,e.unstable_cancelCallback=function(e){e.callback=null},e.unstable_forceFrameRate=function(e){0>e||125<e?console.error(`forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported`):ne=0<e?Math.floor(1e3/e):5},e.unstable_getCurrentPriorityLevel=function(){return f},e.unstable_next=function(e){switch(f){case 1:case 2:case 3:var t=3;break;default:t=f}var n=f;f=t;try{return e()}finally{f=n}},e.unstable_requestPaint=function(){g=!0},e.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var n=f;f=e;try{return t()}finally{f=n}},e.unstable_scheduleCallback=function(r,i,a){var o=e.unstable_now();switch(typeof a==`object`&&a?(a=a.delay,a=typeof a==`number`&&0<a?o+a:o):a=o,r){case 1:var s=-1;break;case 2:s=250;break;case 5:s=1073741823;break;case 4:s=1e4;break;default:s=5e3}return s=a+s,r={id:u++,callback:i,priorityLevel:r,startTime:a,expirationTime:s,sortIndex:-1},a>o?(r.sortIndex=a,t(l,r),n(c)===null&&r===n(l)&&(h?(v(te),te=-1):h=!0,ce(x,a-o))):(r.sortIndex=s,t(c,r),m||p||(m=!0,ee||(ee=!0,ae()))),r},e.unstable_shouldYield=S,e.unstable_wrapCallback=function(e){var t=f;return function(){var n=f;f=t;try{return e.apply(this,arguments)}finally{f=n}}}})),Ee=n(((e,t)=>{t.exports=Te()})),De=n((e=>{var t=m();function n(e){var t=`https://react.dev/errors/`+e;if(1<arguments.length){t+=`?args[]=`+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+=`&args[]=`+encodeURIComponent(arguments[n])}return`Minified React error #`+e+`; visit `+t+` for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`}function r(){}var i={d:{f:r,r:function(){throw Error(n(522))},D:r,C:r,L:r,m:r,X:r,S:r,M:r},p:0,findDOMNode:null},a=Symbol.for(`react.portal`);function o(e,t,n){var r=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:a,key:r==null?null:``+r,children:e,containerInfo:t,implementation:n}}var s=t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function c(e,t){if(e===`font`)return``;if(typeof t==`string`)return t===`use-credentials`?t:``}e.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=i,e.createPortal=function(e,t){var r=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(n(299));return o(e,t,null,r)},e.flushSync=function(e){var t=s.T,n=i.p;try{if(s.T=null,i.p=2,e)return e()}finally{s.T=t,i.p=n,i.d.f()}},e.preconnect=function(e,t){typeof e==`string`&&(t?(t=t.crossOrigin,t=typeof t==`string`?t===`use-credentials`?t:``:void 0):t=null,i.d.C(e,t))},e.prefetchDNS=function(e){typeof e==`string`&&i.d.D(e)},e.preinit=function(e,t){if(typeof e==`string`&&t&&typeof t.as==`string`){var n=t.as,r=c(n,t.crossOrigin),a=typeof t.integrity==`string`?t.integrity:void 0,o=typeof t.fetchPriority==`string`?t.fetchPriority:void 0;n===`style`?i.d.S(e,typeof t.precedence==`string`?t.precedence:void 0,{crossOrigin:r,integrity:a,fetchPriority:o}):n===`script`&&i.d.X(e,{crossOrigin:r,integrity:a,fetchPriority:o,nonce:typeof t.nonce==`string`?t.nonce:void 0})}},e.preinitModule=function(e,t){if(typeof e==`string`){if(typeof t==`object`&&t){if(t.as==null||t.as===`script`){var n=c(t.as,t.crossOrigin);i.d.M(e,{crossOrigin:n,integrity:typeof t.integrity==`string`?t.integrity:void 0,nonce:typeof t.nonce==`string`?t.nonce:void 0})}}else t??i.d.M(e)}},e.preload=function(e,t){if(typeof e==`string`&&typeof t==`object`&&t&&typeof t.as==`string`){var n=t.as,r=c(n,t.crossOrigin);i.d.L(e,n,{crossOrigin:r,integrity:typeof t.integrity==`string`?t.integrity:void 0,nonce:typeof t.nonce==`string`?t.nonce:void 0,type:typeof t.type==`string`?t.type:void 0,fetchPriority:typeof t.fetchPriority==`string`?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy==`string`?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet==`string`?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes==`string`?t.imageSizes:void 0,media:typeof t.media==`string`?t.media:void 0})}},e.preloadModule=function(e,t){if(typeof e==`string`){if(t){var n=c(t.as,t.crossOrigin);i.d.m(e,{as:typeof t.as==`string`&&t.as!==`script`?t.as:void 0,crossOrigin:n,integrity:typeof t.integrity==`string`?t.integrity:void 0})}else i.d.m(e)}},e.requestFormReset=function(e){i.d.r(e)},e.unstable_batchedUpdates=function(e,t){return e(t)},e.useFormState=function(e,t,n){return s.H.useFormState(e,t,n)},e.useFormStatus=function(){return s.H.useHostTransitionStatus()},e.version=`19.2.8`})),Oe=n(((e,t)=>{function n(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>`u`||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!=`function`))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n)}catch(e){console.error(e)}}n(),t.exports=De()})),ke=n((e=>{var t=Ee(),n=m(),r=Oe();function i(e){var t=`https://react.dev/errors/`+e;if(1<arguments.length){t+=`?args[]=`+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+=`&args[]=`+encodeURIComponent(arguments[n])}return`Minified React error #`+e+`; visit `+t+` for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`}function a(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function o(e){var t=e,n=e;if(e.alternate)for(;t.return;)t=t.return;else{e=t;do t=e,t.flags&4098&&(n=t.return),e=t.return;while(e)}return t.tag===3?n:null}function s(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function c(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function l(e){if(o(e)!==e)throw Error(i(188))}function u(e){var t=e.alternate;if(!t){if(t=o(e),t===null)throw Error(i(188));return t===e?e:null}for(var n=e,r=t;;){var a=n.return;if(a===null)break;var s=a.alternate;if(s===null){if(r=a.return,r!==null){n=r;continue}break}if(a.child===s.child){for(s=a.child;s;){if(s===n)return l(a),e;if(s===r)return l(a),t;s=s.sibling}throw Error(i(188))}if(n.return!==r.return)n=a,r=s;else{for(var c=!1,u=a.child;u;){if(u===n){c=!0,n=a,r=s;break}if(u===r){c=!0,r=a,n=s;break}u=u.sibling}if(!c){for(u=s.child;u;){if(u===n){c=!0,n=s,r=a;break}if(u===r){c=!0,r=s,n=a;break}u=u.sibling}if(!c)throw Error(i(189))}}if(n.alternate!==r)throw Error(i(190))}if(n.tag!==3)throw Error(i(188));return n.stateNode.current===n?e:t}function d(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=d(e),t!==null)return t;e=e.sibling}return null}var f=Object.assign,p=Symbol.for(`react.element`),h=Symbol.for(`react.transitional.element`),g=Symbol.for(`react.portal`),_=Symbol.for(`react.fragment`),v=Symbol.for(`react.strict_mode`),y=Symbol.for(`react.profiler`),b=Symbol.for(`react.consumer`),x=Symbol.for(`react.context`),ee=Symbol.for(`react.forward_ref`),te=Symbol.for(`react.suspense`),ne=Symbol.for(`react.suspense_list`),re=Symbol.for(`react.memo`),S=Symbol.for(`react.lazy`),ie=Symbol.for(`react.activity`),ae=Symbol.for(`react.memo_cache_sentinel`),oe=Symbol.iterator;function se(e){return typeof e!=`object`||!e?null:(e=oe&&e[oe]||e[`@@iterator`],typeof e==`function`?e:null)}var ce=Symbol.for(`react.client.reference`);function le(e){if(e==null)return null;if(typeof e==`function`)return e.$$typeof===ce?null:e.displayName||e.name||null;if(typeof e==`string`)return e;switch(e){case _:return`Fragment`;case y:return`Profiler`;case v:return`StrictMode`;case te:return`Suspense`;case ne:return`SuspenseList`;case ie:return`Activity`}if(typeof e==`object`)switch(e.$$typeof){case g:return`Portal`;case x:return e.displayName||`Context`;case b:return(e._context.displayName||`Context`)+`.Consumer`;case ee:var t=e.render;return e=e.displayName,e||=(e=t.displayName||t.name||``,e===``?`ForwardRef`:`ForwardRef(`+e+`)`),e;case re:return t=e.displayName||null,t===null?le(e.type)||`Memo`:t;case S:t=e._payload,e=e._init;try{return le(e(t))}catch{}}return null}var ue=Array.isArray,C=n.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,w=r.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,de={pending:!1,data:null,method:null,action:null},fe=[],pe=-1;function me(e){return{current:e}}function T(e){0>pe||(e.current=fe[pe],fe[pe]=null,pe--)}function E(e,t){pe++,fe[pe]=e.current,e.current=t}var he=me(null),ge=me(null),_e=me(null),ve=me(null);function ye(e,t){switch(E(_e,t),E(ge,e),E(he,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?Vd(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=Vd(t),e=Hd(t,e);else switch(e){case`svg`:e=1;break;case`math`:e=2;break;default:e=0}}T(he),E(he,e)}function be(){T(he),T(ge),T(_e)}function xe(e){e.memoizedState!==null&&E(ve,e);var t=he.current,n=Hd(t,e.type);t!==n&&(E(ge,e),E(he,n))}function Se(e){ge.current===e&&(T(he),T(ge)),ve.current===e&&(T(ve),Qf._currentValue=de)}var Ce,we;function Te(e){if(Ce===void 0)try{throw Error()}catch(e){var t=e.stack.trim().match(/\n( *(at )?)/);Ce=t&&t[1]||``,we=-1<e.stack.indexOf(`
    at`)?` (<anonymous>)`:-1<e.stack.indexOf(`@`)?`@unknown:0:0`:``}return`
`+Ce+e+we}var De=!1;function ke(e,t){if(!e||De)return``;De=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var r={DetermineComponentFrameRoot:function(){try{if(t){var n=function(){throw Error()};if(Object.defineProperty(n.prototype,"props",{set:function(){throw Error()}}),typeof Reflect==`object`&&Reflect.construct){try{Reflect.construct(n,[])}catch(e){var r=e}Reflect.construct(e,[],n)}else{try{n.call()}catch(e){r=e}e.call(n.prototype)}}else{try{throw Error()}catch(e){r=e}(n=e())&&typeof n.catch==`function`&&n.catch(function(){})}}catch(e){if(e&&r&&typeof e.stack==`string`)return[e.stack,r.stack]}return[null,null]}};r.DetermineComponentFrameRoot.displayName=`DetermineComponentFrameRoot`;var i=Object.getOwnPropertyDescriptor(r.DetermineComponentFrameRoot,`name`);i&&i.configurable&&Object.defineProperty(r.DetermineComponentFrameRoot,"name",{value:`DetermineComponentFrameRoot`});var a=r.DetermineComponentFrameRoot(),o=a[0],s=a[1];if(o&&s){var c=o.split(`
`),l=s.split(`
`);for(i=r=0;r<c.length&&!c[r].includes(`DetermineComponentFrameRoot`);)r++;for(;i<l.length&&!l[i].includes(`DetermineComponentFrameRoot`);)i++;if(r===c.length||i===l.length)for(r=c.length-1,i=l.length-1;1<=r&&0<=i&&c[r]!==l[i];)i--;for(;1<=r&&0<=i;r--,i--)if(c[r]!==l[i]){if(r!==1||i!==1)do if(r--,i--,0>i||c[r]!==l[i]){var u=`
`+c[r].replace(` at new `,` at `);return e.displayName&&u.includes(`<anonymous>`)&&(u=u.replace(`<anonymous>`,e.displayName)),u}while(1<=r&&0<=i);break}}}finally{De=!1,Error.prepareStackTrace=n}return(n=e?e.displayName||e.name:``)?Te(n):``}function Ae(e,t){switch(e.tag){case 26:case 27:case 5:return Te(e.type);case 16:return Te(`Lazy`);case 13:return e.child!==t&&t!==null?Te(`Suspense Fallback`):Te(`Suspense`);case 19:return Te(`SuspenseList`);case 0:case 15:return ke(e.type,!1);case 11:return ke(e.type.render,!1);case 1:return ke(e.type,!0);case 31:return Te(`Activity`);default:return``}}function D(e){try{var t=``,n=null;do t+=Ae(e,n),n=e,e=e.return;while(e);return t}catch(e){return`
Error generating stack: `+e.message+`
`+e.stack}}var je=Object.prototype.hasOwnProperty,Me=t.unstable_scheduleCallback,Ne=t.unstable_cancelCallback,Pe=t.unstable_shouldYield,Fe=t.unstable_requestPaint,Ie=t.unstable_now,Le=t.unstable_getCurrentPriorityLevel,O=t.unstable_ImmediatePriority,Re=t.unstable_UserBlockingPriority,ze=t.unstable_NormalPriority,Be=t.unstable_LowPriority,Ve=t.unstable_IdlePriority,He=t.log,Ue=t.unstable_setDisableYieldValue,We=null,Ge=null;function Ke(e){if(typeof He==`function`&&Ue(e),Ge&&typeof Ge.setStrictMode==`function`)try{Ge.setStrictMode(We,e)}catch{}}var qe=Math.clz32?Math.clz32:Xe,Je=Math.log,Ye=Math.LN2;function Xe(e){return e>>>=0,e===0?32:31-(Je(e)/Ye|0)|0}var Ze=256,Qe=262144,$e=4194304;function et(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&261888;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function tt(e,t,n){var r=e.pendingLanes;if(r===0)return 0;var i=0,a=e.suspendedLanes,o=e.pingedLanes;e=e.warmLanes;var s=r&134217727;return s===0?(s=r&~a,s===0?o===0?n||(n=r&~e,n!==0&&(i=et(n))):i=et(o):i=et(s)):(r=s&~a,r===0?(o&=s,o===0?n||(n=s&~e,n!==0&&(i=et(n))):i=et(o)):i=et(r)),i===0?0:t!==0&&t!==i&&(t&a)===0&&(a=i&-i,n=t&-t,a>=n||a===32&&n&4194048)?t:i}function nt(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function rt(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function it(){var e=$e;return $e<<=1,!($e&62914560)&&($e=4194304),e}function at(e){for(var t=[],n=0;31>n;n++)t.push(e);return t}function ot(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function st(e,t,n,r,i,a){var o=e.pendingLanes;e.pendingLanes=n,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=n,e.entangledLanes&=n,e.errorRecoveryDisabledLanes&=n,e.shellSuspendCounter=0;var s=e.entanglements,c=e.expirationTimes,l=e.hiddenUpdates;for(n=o&~n;0<n;){var u=31-qe(n),d=1<<u;s[u]=0,c[u]=-1;var f=l[u];if(f!==null)for(l[u]=null,u=0;u<f.length;u++){var p=f[u];p!==null&&(p.lane&=-536870913)}n&=~d}r!==0&&ct(e,r,0),a!==0&&i===0&&e.tag!==0&&(e.suspendedLanes|=a&~(o&~t))}function ct(e,t,n){e.pendingLanes|=t,e.suspendedLanes&=~t;var r=31-qe(t);e.entangledLanes|=t,e.entanglements[r]=e.entanglements[r]|1073741824|n&261930}function lt(e,t){var n=e.entangledLanes|=t;for(e=e.entanglements;n;){var r=31-qe(n),i=1<<r;i&t|e[r]&t&&(e[r]|=t),n&=~i}}function ut(e,t){var n=t&-t;return n=n&42?1:dt(n),(n&(e.suspendedLanes|t))===0?n:0}function dt(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function ft(e){return e&=-e,2<e?8<e?e&134217727?32:268435456:8:2}function pt(){var e=w.p;return e===0?(e=window.event,e===void 0?32:mp(e.type)):e}function mt(e,t){var n=w.p;try{return w.p=e,t()}finally{w.p=n}}var ht=Math.random().toString(36).slice(2),k=`__reactFiber$`+ht,gt=`__reactProps$`+ht,_t=`__reactContainer$`+ht,vt=`__reactEvents$`+ht,yt=`__reactListeners$`+ht,bt=`__reactHandles$`+ht,xt=`__reactResources$`+ht,St=`__reactMarker$`+ht;function Ct(e){delete e[k],delete e[gt],delete e[vt],delete e[yt],delete e[bt]}function wt(e){var t=e[k];if(t)return t;for(var n=e.parentNode;n;){if(t=n[_t]||n[k]){if(n=t.alternate,t.child!==null||n!==null&&n.child!==null)for(e=df(e);e!==null;){if(n=e[k])return n;e=df(e)}return t}e=n,n=e.parentNode}return null}function Tt(e){if(e=e[k]||e[_t]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function Et(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error(i(33))}function Dt(e){var t=e[xt];return t||=e[xt]={hoistableStyles:new Map,hoistableScripts:new Map},t}function A(e){e[St]=!0}var Ot=new Set,kt={};function At(e,t){jt(e,t),jt(e+`Capture`,t)}function jt(e,t){for(kt[e]=t,e=0;e<t.length;e++)Ot.add(t[e])}var Mt=RegExp(`^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$`),Nt={},Pt={};function Ft(e){return je.call(Pt,e)?!0:je.call(Nt,e)?!1:Mt.test(e)?Pt[e]=!0:(Nt[e]=!0,!1)}function It(e,t,n){if(Ft(t)){if(n===null)e.removeAttribute(t);else{switch(typeof n){case`undefined`:case`function`:case`symbol`:e.removeAttribute(t);return;case`boolean`:var r=t.toLowerCase().slice(0,5);if(r!==`data-`&&r!==`aria-`){e.removeAttribute(t);return}}e.setAttribute(t,``+n)}}}function Lt(e,t,n){if(n===null)e.removeAttribute(t);else{switch(typeof n){case`undefined`:case`function`:case`symbol`:case`boolean`:e.removeAttribute(t);return}e.setAttribute(t,``+n)}}function Rt(e,t,n,r){if(r===null)e.removeAttribute(n);else{switch(typeof r){case`undefined`:case`function`:case`symbol`:case`boolean`:e.removeAttribute(n);return}e.setAttributeNS(t,n,``+r)}}function zt(e){switch(typeof e){case`bigint`:case`boolean`:case`number`:case`string`:case`undefined`:return e;case`object`:return e;default:return``}}function Bt(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()===`input`&&(t===`checkbox`||t===`radio`)}function Vt(e,t,n){var r=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&r!==void 0&&typeof r.get==`function`&&typeof r.set==`function`){var i=r.get,a=r.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return i.call(this)},set:function(e){n=``+e,a.call(this,e)}}),Object.defineProperty(e,t,{enumerable:r.enumerable}),{getValue:function(){return n},setValue:function(e){n=``+e},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function Ht(e){if(!e._valueTracker){var t=Bt(e)?`checked`:`value`;e._valueTracker=Vt(e,t,``+e[t])}}function Ut(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var n=t.getValue(),r=``;return e&&(r=Bt(e)?e.checked?`true`:`false`:e.value),e=r,e!==n&&(t.setValue(e),!0)}function Wt(e){if(e||=typeof document<`u`?document:void 0,e===void 0)return null;try{return e.activeElement||e.body}catch{return e.body}}var Gt=/[\n"\\]/g;function Kt(e){return e.replace(Gt,function(e){return`\\`+e.charCodeAt(0).toString(16)+` `})}function qt(e,t,n,r,i,a,o,s){e.name=``,o!=null&&typeof o!=`function`&&typeof o!=`symbol`&&typeof o!=`boolean`?e.type=o:e.removeAttribute(`type`),t==null?o!==`submit`&&o!==`reset`||e.removeAttribute(`value`):o===`number`?(t===0&&e.value===``||e.value!=t)&&(e.value=``+zt(t)):e.value!==``+zt(t)&&(e.value=``+zt(t)),t==null?n==null?r!=null&&e.removeAttribute(`value`):Yt(e,o,zt(n)):Yt(e,o,zt(t)),i==null&&a!=null&&(e.defaultChecked=!!a),i!=null&&(e.checked=i&&typeof i!=`function`&&typeof i!=`symbol`),s!=null&&typeof s!=`function`&&typeof s!=`symbol`&&typeof s!=`boolean`?e.name=``+zt(s):e.removeAttribute(`name`)}function Jt(e,t,n,r,i,a,o,s){if(a!=null&&typeof a!=`function`&&typeof a!=`symbol`&&typeof a!=`boolean`&&(e.type=a),t!=null||n!=null){if(!(a!==`submit`&&a!==`reset`||t!=null)){Ht(e);return}n=n==null?``:``+zt(n),t=t==null?n:``+zt(t),s||t===e.value||(e.value=t),e.defaultValue=t}r??=i,r=typeof r!=`function`&&typeof r!=`symbol`&&!!r,e.checked=s?e.checked:!!r,e.defaultChecked=!!r,o!=null&&typeof o!=`function`&&typeof o!=`symbol`&&typeof o!=`boolean`&&(e.name=o),Ht(e)}function Yt(e,t,n){t===`number`&&Wt(e.ownerDocument)===e||e.defaultValue===``+n||(e.defaultValue=``+n)}function Xt(e,t,n,r){if(e=e.options,t){t={};for(var i=0;i<n.length;i++)t[`$`+n[i]]=!0;for(n=0;n<e.length;n++)i=t.hasOwnProperty(`$`+e[n].value),e[n].selected!==i&&(e[n].selected=i),i&&r&&(e[n].defaultSelected=!0)}else{for(n=``+zt(n),t=null,i=0;i<e.length;i++){if(e[i].value===n){e[i].selected=!0,r&&(e[i].defaultSelected=!0);return}t!==null||e[i].disabled||(t=e[i])}t!==null&&(t.selected=!0)}}function Zt(e,t,n){if(t!=null&&(t=``+zt(t),t!==e.value&&(e.value=t),n==null)){e.defaultValue!==t&&(e.defaultValue=t);return}e.defaultValue=n==null?``:``+zt(n)}function Qt(e,t,n,r){if(t==null){if(r!=null){if(n!=null)throw Error(i(92));if(ue(r)){if(1<r.length)throw Error(i(93));r=r[0]}n=r}n??=``,t=n}n=zt(t),e.defaultValue=n,r=e.textContent,r===n&&r!==``&&r!==null&&(e.value=r),Ht(e)}function $t(e,t){if(t){var n=e.firstChild;if(n&&n===e.lastChild&&n.nodeType===3){n.nodeValue=t;return}}e.textContent=t}var en=new Set(`animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp`.split(` `));function tn(e,t,n){var r=t.indexOf(`--`)===0;n==null||typeof n==`boolean`||n===``?r?e.setProperty(t,``):t===`float`?e.cssFloat=``:e[t]=``:r?e.setProperty(t,n):typeof n!=`number`||n===0||en.has(t)?t===`float`?e.cssFloat=n:e[t]=(``+n).trim():e[t]=n+`px`}function nn(e,t,n){if(t!=null&&typeof t!=`object`)throw Error(i(62));if(e=e.style,n!=null){for(var r in n)!n.hasOwnProperty(r)||t!=null&&t.hasOwnProperty(r)||(r.indexOf(`--`)===0?e.setProperty(r,``):r===`float`?e.cssFloat=``:e[r]=``);for(var a in t)r=t[a],t.hasOwnProperty(a)&&n[a]!==r&&tn(e,a,r)}else for(var o in t)t.hasOwnProperty(o)&&tn(e,o,t[o])}function rn(e){if(e.indexOf(`-`)===-1)return!1;switch(e){case`annotation-xml`:case`color-profile`:case`font-face`:case`font-face-src`:case`font-face-uri`:case`font-face-format`:case`font-face-name`:case`missing-glyph`:return!1;default:return!0}}var an=new Map([[`acceptCharset`,`accept-charset`],[`htmlFor`,`for`],[`httpEquiv`,`http-equiv`],[`crossOrigin`,`crossorigin`],[`accentHeight`,`accent-height`],[`alignmentBaseline`,`alignment-baseline`],[`arabicForm`,`arabic-form`],[`baselineShift`,`baseline-shift`],[`capHeight`,`cap-height`],[`clipPath`,`clip-path`],[`clipRule`,`clip-rule`],[`colorInterpolation`,`color-interpolation`],[`colorInterpolationFilters`,`color-interpolation-filters`],[`colorProfile`,`color-profile`],[`colorRendering`,`color-rendering`],[`dominantBaseline`,`dominant-baseline`],[`enableBackground`,`enable-background`],[`fillOpacity`,`fill-opacity`],[`fillRule`,`fill-rule`],[`floodColor`,`flood-color`],[`floodOpacity`,`flood-opacity`],[`fontFamily`,`font-family`],[`fontSize`,`font-size`],[`fontSizeAdjust`,`font-size-adjust`],[`fontStretch`,`font-stretch`],[`fontStyle`,`font-style`],[`fontVariant`,`font-variant`],[`fontWeight`,`font-weight`],[`glyphName`,`glyph-name`],[`glyphOrientationHorizontal`,`glyph-orientation-horizontal`],[`glyphOrientationVertical`,`glyph-orientation-vertical`],[`horizAdvX`,`horiz-adv-x`],[`horizOriginX`,`horiz-origin-x`],[`imageRendering`,`image-rendering`],[`letterSpacing`,`letter-spacing`],[`lightingColor`,`lighting-color`],[`markerEnd`,`marker-end`],[`markerMid`,`marker-mid`],[`markerStart`,`marker-start`],[`overlinePosition`,`overline-position`],[`overlineThickness`,`overline-thickness`],[`paintOrder`,`paint-order`],[`panose-1`,`panose-1`],[`pointerEvents`,`pointer-events`],[`renderingIntent`,`rendering-intent`],[`shapeRendering`,`shape-rendering`],[`stopColor`,`stop-color`],[`stopOpacity`,`stop-opacity`],[`strikethroughPosition`,`strikethrough-position`],[`strikethroughThickness`,`strikethrough-thickness`],[`strokeDasharray`,`stroke-dasharray`],[`strokeDashoffset`,`stroke-dashoffset`],[`strokeLinecap`,`stroke-linecap`],[`strokeLinejoin`,`stroke-linejoin`],[`strokeMiterlimit`,`stroke-miterlimit`],[`strokeOpacity`,`stroke-opacity`],[`strokeWidth`,`stroke-width`],[`textAnchor`,`text-anchor`],[`textDecoration`,`text-decoration`],[`textRendering`,`text-rendering`],[`transformOrigin`,`transform-origin`],[`underlinePosition`,`underline-position`],[`underlineThickness`,`underline-thickness`],[`unicodeBidi`,`unicode-bidi`],[`unicodeRange`,`unicode-range`],[`unitsPerEm`,`units-per-em`],[`vAlphabetic`,`v-alphabetic`],[`vHanging`,`v-hanging`],[`vIdeographic`,`v-ideographic`],[`vMathematical`,`v-mathematical`],[`vectorEffect`,`vector-effect`],[`vertAdvY`,`vert-adv-y`],[`vertOriginX`,`vert-origin-x`],[`vertOriginY`,`vert-origin-y`],[`wordSpacing`,`word-spacing`],[`writingMode`,`writing-mode`],[`xmlnsXlink`,`xmlns:xlink`],[`xHeight`,`x-height`]]),on=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function sn(e){return on.test(``+e)?`javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')`:e}function cn(){}var ln=null;function un(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var dn=null,fn=null;function pn(e){var t=Tt(e);if(t&&(e=t.stateNode)){var n=e[gt]||null;a:switch(e=t.stateNode,t.type){case`input`:if(qt(e,n.value,n.defaultValue,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name),t=n.name,n.type===`radio`&&t!=null){for(n=e;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll(`input[name="`+Kt(``+t)+`"][type="radio"]`),t=0;t<n.length;t++){var r=n[t];if(r!==e&&r.form===e.form){var a=r[gt]||null;if(!a)throw Error(i(90));qt(r,a.value,a.defaultValue,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name)}}for(t=0;t<n.length;t++)r=n[t],r.form===e.form&&Ut(r)}break a;case`textarea`:Zt(e,n.value,n.defaultValue);break a;case`select`:t=n.value,t!=null&&Xt(e,!!n.multiple,t,!1)}}}var mn=!1;function hn(e,t,n){if(mn)return e(t,n);mn=!0;try{return e(t)}finally{if(mn=!1,(dn!==null||fn!==null)&&(bu(),dn&&(t=dn,e=fn,fn=dn=null,pn(t),e)))for(t=0;t<e.length;t++)pn(e[t])}}function gn(e,t){var n=e.stateNode;if(n===null)return null;var r=n[gt]||null;if(r===null)return null;n=r[t];a:switch(t){case`onClick`:case`onClickCapture`:case`onDoubleClick`:case`onDoubleClickCapture`:case`onMouseDown`:case`onMouseDownCapture`:case`onMouseMove`:case`onMouseMoveCapture`:case`onMouseUp`:case`onMouseUpCapture`:case`onMouseEnter`:(r=!r.disabled)||(e=e.type,r=e!==`button`&&e!==`input`&&e!==`select`&&e!==`textarea`),e=!r;break a;default:e=!1}if(e)return null;if(n&&typeof n!=`function`)throw Error(i(231,t,typeof n));return n}var _n=!(typeof window>`u`||window.document===void 0||window.document.createElement===void 0),vn=!1;if(_n)try{var yn={};Object.defineProperty(yn,"passive",{get:function(){vn=!0}}),window.addEventListener(`test`,yn,yn),window.removeEventListener(`test`,yn,yn)}catch{vn=!1}var bn=null,xn=null,Sn=null;function Cn(){if(Sn)return Sn;var e,t=xn,n=t.length,r,i=`value`in bn?bn.value:bn.textContent,a=i.length;for(e=0;e<n&&t[e]===i[e];e++);var o=n-e;for(r=1;r<=o&&t[n-r]===i[a-r];r++);return Sn=i.slice(e,1<r?1-r:void 0)}function wn(e){var t=e.keyCode;return`charCode`in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function Tn(){return!0}function En(){return!1}function Dn(e){function t(t,n,r,i,a){for(var o in this._reactName=t,this._targetInst=r,this.type=n,this.nativeEvent=i,this.target=a,this.currentTarget=null,e)e.hasOwnProperty(o)&&(t=e[o],this[o]=t?t(i):i[o]);return this.isDefaultPrevented=(i.defaultPrevented==null?!1===i.returnValue:i.defaultPrevented)?Tn:En,this.isPropagationStopped=En,this}return f(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var e=this.nativeEvent;e&&(e.preventDefault?e.preventDefault():typeof e.returnValue!=`unknown`&&(e.returnValue=!1),this.isDefaultPrevented=Tn)},stopPropagation:function(){var e=this.nativeEvent;e&&(e.stopPropagation?e.stopPropagation():typeof e.cancelBubble!=`unknown`&&(e.cancelBubble=!0),this.isPropagationStopped=Tn)},persist:function(){},isPersistent:Tn}),t}var On={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},kn=Dn(On),An=f({},On,{view:0,detail:0}),jn=Dn(An),Mn,Nn,Pn,Fn=f({},An,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Gn,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return`movementX`in e?e.movementX:(e!==Pn&&(Pn&&e.type===`mousemove`?(Mn=e.screenX-Pn.screenX,Nn=e.screenY-Pn.screenY):Nn=Mn=0,Pn=e),Mn)},movementY:function(e){return`movementY`in e?e.movementY:Nn}}),In=Dn(Fn),Ln=Dn(f({},Fn,{dataTransfer:0})),Rn=Dn(f({},An,{relatedTarget:0})),zn=Dn(f({},On,{animationName:0,elapsedTime:0,pseudoElement:0})),Bn=Dn(f({},On,{clipboardData:function(e){return`clipboardData`in e?e.clipboardData:window.clipboardData}})),j=Dn(f({},On,{data:0})),Vn={Esc:`Escape`,Spacebar:` `,Left:`ArrowLeft`,Up:`ArrowUp`,Right:`ArrowRight`,Down:`ArrowDown`,Del:`Delete`,Win:`OS`,Menu:`ContextMenu`,Apps:`ContextMenu`,Scroll:`ScrollLock`,MozPrintableKey:`Unidentified`},Hn={8:`Backspace`,9:`Tab`,12:`Clear`,13:`Enter`,16:`Shift`,17:`Control`,18:`Alt`,19:`Pause`,20:`CapsLock`,27:`Escape`,32:` `,33:`PageUp`,34:`PageDown`,35:`End`,36:`Home`,37:`ArrowLeft`,38:`ArrowUp`,39:`ArrowRight`,40:`ArrowDown`,45:`Insert`,46:`Delete`,112:`F1`,113:`F2`,114:`F3`,115:`F4`,116:`F5`,117:`F6`,118:`F7`,119:`F8`,120:`F9`,121:`F10`,122:`F11`,123:`F12`,144:`NumLock`,145:`ScrollLock`,224:`Meta`},Un={Alt:`altKey`,Control:`ctrlKey`,Meta:`metaKey`,Shift:`shiftKey`};function Wn(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=Un[e])?!!t[e]:!1}function Gn(){return Wn}var Kn=Dn(f({},An,{key:function(e){if(e.key){var t=Vn[e.key]||e.key;if(t!==`Unidentified`)return t}return e.type===`keypress`?(e=wn(e),e===13?`Enter`:String.fromCharCode(e)):e.type===`keydown`||e.type===`keyup`?Hn[e.keyCode]||`Unidentified`:``},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Gn,charCode:function(e){return e.type===`keypress`?wn(e):0},keyCode:function(e){return e.type===`keydown`||e.type===`keyup`?e.keyCode:0},which:function(e){return e.type===`keypress`?wn(e):e.type===`keydown`||e.type===`keyup`?e.keyCode:0}})),qn=Dn(f({},Fn,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0})),Jn=Dn(f({},An,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Gn})),Yn=Dn(f({},On,{propertyName:0,elapsedTime:0,pseudoElement:0})),Xn=Dn(f({},Fn,{deltaX:function(e){return`deltaX`in e?e.deltaX:`wheelDeltaX`in e?-e.wheelDeltaX:0},deltaY:function(e){return`deltaY`in e?e.deltaY:`wheelDeltaY`in e?-e.wheelDeltaY:`wheelDelta`in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0})),Zn=Dn(f({},On,{newState:0,oldState:0})),Qn=[9,13,27,32],$n=_n&&`CompositionEvent`in window,er=null;_n&&`documentMode`in document&&(er=document.documentMode);var tr=_n&&`TextEvent`in window&&!er,nr=_n&&(!$n||er&&8<er&&11>=er),rr=` `,ir=!1;function ar(e,t){switch(e){case`keyup`:return Qn.indexOf(t.keyCode)!==-1;case`keydown`:return t.keyCode!==229;case`keypress`:case`mousedown`:case`focusout`:return!0;default:return!1}}function or(e){return e=e.detail,typeof e==`object`&&`data`in e?e.data:null}var sr=!1;function cr(e,t){switch(e){case`compositionend`:return or(t);case`keypress`:return t.which===32?(ir=!0,rr):null;case`textInput`:return e=t.data,e===rr&&ir?null:e;default:return null}}function lr(e,t){if(sr)return e===`compositionend`||!$n&&ar(e,t)?(e=Cn(),Sn=xn=bn=null,sr=!1,e):null;switch(e){case`paste`:return null;case`keypress`:if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case`compositionend`:return nr&&t.locale!==`ko`?null:t.data;default:return null}}var ur={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function dr(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t===`input`?!!ur[e.type]:t===`textarea`}function fr(e,t,n,r){dn?fn?fn.push(r):fn=[r]:dn=r,t=Ed(t,`onChange`),0<t.length&&(n=new kn(`onChange`,`change`,null,n,r),e.push({event:n,listeners:t}))}var pr=null,mr=null;function hr(e){yd(e,0)}function gr(e){if(Ut(Et(e)))return e}function _r(e,t){if(e===`change`)return t}var vr=!1;if(_n){var yr;if(_n){var br=`oninput`in document;if(!br){var xr=document.createElement(`div`);xr.setAttribute(`oninput`,`return;`),br=typeof xr.oninput==`function`}yr=br}else yr=!1;vr=yr&&(!document.documentMode||9<document.documentMode)}function Sr(){pr&&(pr.detachEvent(`onpropertychange`,Cr),mr=pr=null)}function Cr(e){if(e.propertyName===`value`&&gr(mr)){var t=[];fr(t,mr,e,un(e)),hn(hr,t)}}function wr(e,t,n){e===`focusin`?(Sr(),pr=t,mr=n,pr.attachEvent(`onpropertychange`,Cr)):e===`focusout`&&Sr()}function Tr(e){if(e===`selectionchange`||e===`keyup`||e===`keydown`)return gr(mr)}function Er(e,t){if(e===`click`)return gr(t)}function Dr(e,t){if(e===`input`||e===`change`)return gr(t)}function Or(e,t){return e===t&&(e!==0||1/e==1/t)||e!==e&&t!==t}var kr=typeof Object.is==`function`?Object.is:Or;function Ar(e,t){if(kr(e,t))return!0;if(typeof e!=`object`||!e||typeof t!=`object`||!t)return!1;var n=Object.keys(e),r=Object.keys(t);if(n.length!==r.length)return!1;for(r=0;r<n.length;r++){var i=n[r];if(!je.call(t,i)||!kr(e[i],t[i]))return!1}return!0}function jr(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function Mr(e,t){var n=jr(e);e=0;for(var r;n;){if(n.nodeType===3){if(r=e+n.textContent.length,e<=t&&r>=t)return{node:n,offset:t-e};e=r}a:{for(;n;){if(n.nextSibling){n=n.nextSibling;break a}n=n.parentNode}n=void 0}n=jr(n)}}function Nr(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?Nr(e,t.parentNode):`contains`in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function Pr(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=Wt(e.document);t instanceof e.HTMLIFrameElement;){try{var n=typeof t.contentWindow.location.href==`string`}catch{n=!1}if(n)e=t.contentWindow;else break;t=Wt(e.document)}return t}function Fr(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t===`input`&&(e.type===`text`||e.type===`search`||e.type===`tel`||e.type===`url`||e.type===`password`)||t===`textarea`||e.contentEditable===`true`)}var Ir=_n&&`documentMode`in document&&11>=document.documentMode,Lr=null,Rr=null,zr=null,Br=!1;function Vr(e,t,n){var r=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;Br||Lr==null||Lr!==Wt(r)||(r=Lr,`selectionStart`in r&&Fr(r)?r={start:r.selectionStart,end:r.selectionEnd}:(r=(r.ownerDocument&&r.ownerDocument.defaultView||window).getSelection(),r={anchorNode:r.anchorNode,anchorOffset:r.anchorOffset,focusNode:r.focusNode,focusOffset:r.focusOffset}),zr&&Ar(zr,r)||(zr=r,r=Ed(Rr,`onSelect`),0<r.length&&(t=new kn(`onSelect`,`select`,null,t,n),e.push({event:t,listeners:r}),t.target=Lr)))}function Hr(e,t){var n={};return n[e.toLowerCase()]=t.toLowerCase(),n[`Webkit`+e]=`webkit`+t,n[`Moz`+e]=`moz`+t,n}var Ur={animationend:Hr(`Animation`,`AnimationEnd`),animationiteration:Hr(`Animation`,`AnimationIteration`),animationstart:Hr(`Animation`,`AnimationStart`),transitionrun:Hr(`Transition`,`TransitionRun`),transitionstart:Hr(`Transition`,`TransitionStart`),transitioncancel:Hr(`Transition`,`TransitionCancel`),transitionend:Hr(`Transition`,`TransitionEnd`)},Wr={},Gr={};_n&&(Gr=document.createElement(`div`).style,`AnimationEvent`in window||(delete Ur.animationend.animation,delete Ur.animationiteration.animation,delete Ur.animationstart.animation),`TransitionEvent`in window||delete Ur.transitionend.transition);function Kr(e){if(Wr[e])return Wr[e];if(!Ur[e])return e;var t=Ur[e],n;for(n in t)if(t.hasOwnProperty(n)&&n in Gr)return Wr[e]=t[n];return e}var qr=Kr(`animationend`),Jr=Kr(`animationiteration`),Yr=Kr(`animationstart`),Xr=Kr(`transitionrun`),Zr=Kr(`transitionstart`),Qr=Kr(`transitioncancel`),$r=Kr(`transitionend`),ei=new Map,ti=`abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel`.split(` `);ti.push(`scrollEnd`);function ni(e,t){ei.set(e,t),At(t,[e])}var ri=typeof reportError==`function`?reportError:function(e){if(typeof window==`object`&&typeof window.ErrorEvent==`function`){var t=new window.ErrorEvent(`error`,{bubbles:!0,cancelable:!0,message:typeof e==`object`&&e&&typeof e.message==`string`?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process==`object`&&typeof process.emit==`function`){process.emit(`uncaughtException`,e);return}console.error(e)},ii=[],ai=0,oi=0;function si(){for(var e=ai,t=oi=ai=0;t<e;){var n=ii[t];ii[t++]=null;var r=ii[t];ii[t++]=null;var i=ii[t];ii[t++]=null;var a=ii[t];if(ii[t++]=null,r!==null&&i!==null){var o=r.pending;o===null?i.next=i:(i.next=o.next,o.next=i),r.pending=i}a!==0&&di(n,i,a)}}function ci(e,t,n,r){ii[ai++]=e,ii[ai++]=t,ii[ai++]=n,ii[ai++]=r,oi|=r,e.lanes|=r,e=e.alternate,e!==null&&(e.lanes|=r)}function li(e,t,n,r){return ci(e,t,n,r),fi(e)}function ui(e,t){return ci(e,null,null,t),fi(e)}function di(e,t,n){e.lanes|=n;var r=e.alternate;r!==null&&(r.lanes|=n);for(var i=!1,a=e.return;a!==null;)a.childLanes|=n,r=a.alternate,r!==null&&(r.childLanes|=n),a.tag===22&&(e=a.stateNode,e===null||e._visibility&1||(i=!0)),e=a,a=a.return;return e.tag===3?(a=e.stateNode,i&&t!==null&&(i=31-qe(n),e=a.hiddenUpdates,r=e[i],r===null?e[i]=[t]:r.push(t),t.lane=n|536870912),a):null}function fi(e){if(50<du)throw du=0,fu=null,Error(i(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var pi={};function mi(e,t,n,r){this.tag=e,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=r,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function hi(e,t,n,r){return new mi(e,t,n,r)}function gi(e){return e=e.prototype,!(!e||!e.isReactComponent)}function _i(e,t){var n=e.alternate;return n===null?(n=hi(e.tag,t,e.key,e.mode),n.elementType=e.elementType,n.type=e.type,n.stateNode=e.stateNode,n.alternate=e,e.alternate=n):(n.pendingProps=t,n.type=e.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=e.flags&65011712,n.childLanes=e.childLanes,n.lanes=e.lanes,n.child=e.child,n.memoizedProps=e.memoizedProps,n.memoizedState=e.memoizedState,n.updateQueue=e.updateQueue,t=e.dependencies,n.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},n.sibling=e.sibling,n.index=e.index,n.ref=e.ref,n.refCleanup=e.refCleanup,n}function vi(e,t){e.flags&=65011714;var n=e.alternate;return n===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=n.childLanes,e.lanes=n.lanes,e.child=n.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=n.memoizedProps,e.memoizedState=n.memoizedState,e.updateQueue=n.updateQueue,e.type=n.type,t=n.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function yi(e,t,n,r,a,o){var s=0;if(r=e,typeof e==`function`)gi(e)&&(s=1);else if(typeof e==`string`)s=Uf(e,n,he.current)?26:e===`html`||e===`head`||e===`body`?27:5;else a:switch(e){case ie:return e=hi(31,n,t,a),e.elementType=ie,e.lanes=o,e;case _:return bi(n.children,a,o,t);case v:s=8,a|=24;break;case y:return e=hi(12,n,t,a|2),e.elementType=y,e.lanes=o,e;case te:return e=hi(13,n,t,a),e.elementType=te,e.lanes=o,e;case ne:return e=hi(19,n,t,a),e.elementType=ne,e.lanes=o,e;default:if(typeof e==`object`&&e)switch(e.$$typeof){case x:s=10;break a;case b:s=9;break a;case ee:s=11;break a;case re:s=14;break a;case S:s=16,r=null;break a}s=29,n=Error(i(130,e===null?`null`:typeof e,``)),r=null}return t=hi(s,n,t,a),t.elementType=e,t.type=r,t.lanes=o,t}function bi(e,t,n,r){return e=hi(7,e,r,t),e.lanes=n,e}function xi(e,t,n){return e=hi(6,e,null,t),e.lanes=n,e}function Si(e){var t=hi(18,null,null,0);return t.stateNode=e,t}function Ci(e,t,n){return t=hi(4,e.children===null?[]:e.children,e.key,t),t.lanes=n,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var wi=new WeakMap;function Ti(e,t){if(typeof e==`object`&&e){var n=wi.get(e);return n===void 0?(t={value:e,source:t,stack:D(t)},wi.set(e,t),t):n}return{value:e,source:t,stack:D(t)}}var Ei=[],Di=0,Oi=null,ki=0,Ai=[],ji=0,Mi=null,Ni=1,Pi=``;function Fi(e,t){Ei[Di++]=ki,Ei[Di++]=Oi,Oi=e,ki=t}function Ii(e,t,n){Ai[ji++]=Ni,Ai[ji++]=Pi,Ai[ji++]=Mi,Mi=e;var r=Ni;e=Pi;var i=32-qe(r)-1;r&=~(1<<i),n+=1;var a=32-qe(t)+i;if(30<a){var o=i-i%5;a=(r&(1<<o)-1).toString(32),r>>=o,i-=o,Ni=1<<32-qe(t)+i|n<<i|r,Pi=a+e}else Ni=1<<a|n<<i|r,Pi=e}function Li(e){e.return!==null&&(Fi(e,1),Ii(e,1,0))}function Ri(e){for(;e===Oi;)Oi=Ei[--Di],Ei[Di]=null,ki=Ei[--Di],Ei[Di]=null;for(;e===Mi;)Mi=Ai[--ji],Ai[ji]=null,Pi=Ai[--ji],Ai[ji]=null,Ni=Ai[--ji],Ai[ji]=null}function zi(e,t){Ai[ji++]=Ni,Ai[ji++]=Pi,Ai[ji++]=Mi,Ni=t.id,Pi=t.overflow,Mi=e}var Bi=null,M=null,N=!1,Vi=null,Hi=!1,Ui=Error(i(519));function Wi(e){throw Xi(Ti(Error(i(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?`text`:`HTML`,``)),e)),Ui}function Gi(e){var t=e.stateNode,n=e.type,r=e.memoizedProps;switch(t[k]=e,t[gt]=r,n){case`dialog`:Q(`cancel`,t),Q(`close`,t);break;case`iframe`:case`object`:case`embed`:Q(`load`,t);break;case`video`:case`audio`:for(n=0;n<_d.length;n++)Q(_d[n],t);break;case`source`:Q(`error`,t);break;case`img`:case`image`:case`link`:Q(`error`,t),Q(`load`,t);break;case`details`:Q(`toggle`,t);break;case`input`:Q(`invalid`,t),Jt(t,r.value,r.defaultValue,r.checked,r.defaultChecked,r.type,r.name,!0);break;case`select`:Q(`invalid`,t);break;case`textarea`:Q(`invalid`,t),Qt(t,r.value,r.defaultValue,r.children)}n=r.children,typeof n!=`string`&&typeof n!=`number`&&typeof n!=`bigint`||t.textContent===``+n||!0===r.suppressHydrationWarning||Md(t.textContent,n)?(r.popover!=null&&(Q(`beforetoggle`,t),Q(`toggle`,t)),r.onScroll!=null&&Q(`scroll`,t),r.onScrollEnd!=null&&Q(`scrollend`,t),r.onClick!=null&&(t.onclick=cn),t=!0):t=!1,t||Wi(e,!0)}function Ki(e){for(Bi=e.return;Bi;)switch(Bi.tag){case 5:case 31:case 13:Hi=!1;return;case 27:case 3:Hi=!0;return;default:Bi=Bi.return}}function qi(e){if(e!==Bi)return!1;if(!N)return Ki(e),N=!0,!1;var t=e.tag,n;if((n=t!==3&&t!==27)&&((n=t===5)&&(n=e.type,n=n===`form`||n===`button`||Ud(e.type,e.memoizedProps)),n=!n),n&&M&&Wi(e),Ki(e),t===13){if(e=e.memoizedState,e=e===null?null:e.dehydrated,!e)throw Error(i(317));M=uf(e)}else if(t===31){if(e=e.memoizedState,e=e===null?null:e.dehydrated,!e)throw Error(i(317));M=uf(e)}else t===27?(t=M,Zd(e.type)?(e=lf,lf=null,M=e):M=t):M=Bi?cf(e.stateNode.nextSibling):null;return!0}function Ji(){M=Bi=null,N=!1}function Yi(){var e=Vi;return e!==null&&(Zl===null?Zl=e:Zl.push.apply(Zl,e),Vi=null),e}function Xi(e){Vi===null?Vi=[e]:Vi.push(e)}var Zi=me(null),Qi=null,$i=null;function ea(e,t,n){E(Zi,t._currentValue),t._currentValue=n}function ta(e){e._currentValue=Zi.current,T(Zi)}function na(e,t,n){for(;e!==null;){var r=e.alternate;if((e.childLanes&t)===t?r!==null&&(r.childLanes&t)!==t&&(r.childLanes|=t):(e.childLanes|=t,r!==null&&(r.childLanes|=t)),e===n)break;e=e.return}}function ra(e,t,n,r){var a=e.child;for(a!==null&&(a.return=e);a!==null;){var o=a.dependencies;if(o!==null){var s=a.child;o=o.firstContext;a:for(;o!==null;){var c=o;o=a;for(var l=0;l<t.length;l++)if(c.context===t[l]){o.lanes|=n,c=o.alternate,c!==null&&(c.lanes|=n),na(o.return,n,e),r||(s=null);break a}o=c.next}}else if(a.tag===18){if(s=a.return,s===null)throw Error(i(341));s.lanes|=n,o=s.alternate,o!==null&&(o.lanes|=n),na(s,n,e),s=null}else s=a.child;if(s!==null)s.return=a;else for(s=a;s!==null;){if(s===e){s=null;break}if(a=s.sibling,a!==null){a.return=s.return,s=a;break}s=s.return}a=s}}function ia(e,t,n,r){e=null;for(var a=t,o=!1;a!==null;){if(!o){if(a.flags&524288)o=!0;else if(a.flags&262144)break}if(a.tag===10){var s=a.alternate;if(s===null)throw Error(i(387));if(s=s.memoizedProps,s!==null){var c=a.type;kr(a.pendingProps.value,s.value)||(e===null?e=[c]:e.push(c))}}else if(a===ve.current){if(s=a.alternate,s===null)throw Error(i(387));s.memoizedState.memoizedState!==a.memoizedState.memoizedState&&(e===null?e=[Qf]:e.push(Qf))}a=a.return}e!==null&&ra(t,e,n,r),t.flags|=262144}function aa(e){for(e=e.firstContext;e!==null;){if(!kr(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function oa(e){Qi=e,$i=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function sa(e){return la(Qi,e)}function ca(e,t){return Qi===null&&oa(e),la(e,t)}function la(e,t){var n=t._currentValue;if(t={context:t,memoizedValue:n,next:null},$i===null){if(e===null)throw Error(i(308));$i=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else $i=$i.next=t;return n}var ua=typeof AbortController<`u`?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(t,n){e.push(n)}};this.abort=function(){t.aborted=!0,e.forEach(function(e){return e()})}},da=t.unstable_scheduleCallback,fa=t.unstable_NormalPriority,P={$$typeof:x,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function pa(){return{controller:new ua,data:new Map,refCount:0}}function ma(e){e.refCount--,e.refCount===0&&da(fa,function(){e.controller.abort()})}var ha=null,ga=0,_a=0,va=null;function ya(e,t){if(ha===null){var n=ha=[];ga=0,_a=dd(),va={status:`pending`,value:void 0,then:function(e){n.push(e)}}}return ga++,t.then(ba,ba),t}function ba(){if(--ga===0&&ha!==null){va!==null&&(va.status=`fulfilled`);var e=ha;ha=null,_a=0,va=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function xa(e,t){var n=[],r={status:`pending`,value:null,reason:null,then:function(e){n.push(e)}};return e.then(function(){r.status=`fulfilled`,r.value=t;for(var e=0;e<n.length;e++)(0,n[e])(t)},function(e){for(r.status=`rejected`,r.reason=e,e=0;e<n.length;e++)(0,n[e])(void 0)}),r}var Sa=C.S;C.S=function(e,t){eu=Ie(),typeof t==`object`&&t&&typeof t.then==`function`&&ya(e,t),Sa!==null&&Sa(e,t)};var Ca=me(null);function wa(){var e=Ca.current;return e===null?K.pooledCache:e}function Ta(e,t){t===null?E(Ca,Ca.current):E(Ca,t.pool)}function Ea(){var e=wa();return e===null?null:{parent:P._currentValue,pool:e}}var Da=Error(i(460)),Oa=Error(i(474)),ka=Error(i(542)),Aa={then:function(){}};function ja(e){return e=e.status,e===`fulfilled`||e===`rejected`}function Ma(e,t,n){switch(n=e[n],n===void 0?e.push(t):n!==t&&(t.then(cn,cn),t=n),t.status){case`fulfilled`:return t.value;case`rejected`:throw e=t.reason,Ia(e),e;default:if(typeof t.status==`string`)t.then(cn,cn);else{if(e=K,e!==null&&100<e.shellSuspendCounter)throw Error(i(482));e=t,e.status=`pending`,e.then(function(e){if(t.status===`pending`){var n=t;n.status=`fulfilled`,n.value=e}},function(e){if(t.status===`pending`){var n=t;n.status=`rejected`,n.reason=e}})}switch(t.status){case`fulfilled`:return t.value;case`rejected`:throw e=t.reason,Ia(e),e}throw Pa=t,Da}}function Na(e){try{var t=e._init;return t(e._payload)}catch(e){throw typeof e==`object`&&e&&typeof e.then==`function`?(Pa=e,Da):e}}var Pa=null;function Fa(){if(Pa===null)throw Error(i(459));var e=Pa;return Pa=null,e}function Ia(e){if(e===Da||e===ka)throw Error(i(483))}var La=null,Ra=0;function za(e){var t=Ra;return Ra+=1,La===null&&(La=[]),Ma(La,e,t)}function Ba(e,t){t=t.props.ref,e.ref=t===void 0?null:t}function Va(e,t){throw t.$$typeof===p?Error(i(525)):(e=Object.prototype.toString.call(t),Error(i(31,e===`[object Object]`?`object with keys {`+Object.keys(t).join(`, `)+`}`:e)))}function Ha(e){function t(t,n){if(e){var r=t.deletions;r===null?(t.deletions=[n],t.flags|=16):r.push(n)}}function n(n,r){if(!e)return null;for(;r!==null;)t(n,r),r=r.sibling;return null}function r(e){for(var t=new Map;e!==null;)e.key===null?t.set(e.index,e):t.set(e.key,e),e=e.sibling;return t}function a(e,t){return e=_i(e,t),e.index=0,e.sibling=null,e}function o(t,n,r){return t.index=r,e?(r=t.alternate,r===null?(t.flags|=67108866,n):(r=r.index,r<n?(t.flags|=67108866,n):r)):(t.flags|=1048576,n)}function s(t){return e&&t.alternate===null&&(t.flags|=67108866),t}function c(e,t,n,r){return t===null||t.tag!==6?(t=xi(n,e.mode,r),t.return=e,t):(t=a(t,n),t.return=e,t)}function l(e,t,n,r){var i=n.type;return i===_?d(e,t,n.props.children,r,n.key):t!==null&&(t.elementType===i||typeof i==`object`&&i&&i.$$typeof===S&&Na(i)===t.type)?(t=a(t,n.props),Ba(t,n),t.return=e,t):(t=yi(n.type,n.key,n.props,null,e.mode,r),Ba(t,n),t.return=e,t)}function u(e,t,n,r){return t===null||t.tag!==4||t.stateNode.containerInfo!==n.containerInfo||t.stateNode.implementation!==n.implementation?(t=Ci(n,e.mode,r),t.return=e,t):(t=a(t,n.children||[]),t.return=e,t)}function d(e,t,n,r,i){return t===null||t.tag!==7?(t=bi(n,e.mode,r,i),t.return=e,t):(t=a(t,n),t.return=e,t)}function f(e,t,n){if(typeof t==`string`&&t!==``||typeof t==`number`||typeof t==`bigint`)return t=xi(``+t,e.mode,n),t.return=e,t;if(typeof t==`object`&&t){switch(t.$$typeof){case h:return n=yi(t.type,t.key,t.props,null,e.mode,n),Ba(n,t),n.return=e,n;case g:return t=Ci(t,e.mode,n),t.return=e,t;case S:return t=Na(t),f(e,t,n)}if(ue(t)||se(t))return t=bi(t,e.mode,n,null),t.return=e,t;if(typeof t.then==`function`)return f(e,za(t),n);if(t.$$typeof===x)return f(e,ca(e,t),n);Va(e,t)}return null}function p(e,t,n,r){var i=t===null?null:t.key;if(typeof n==`string`&&n!==``||typeof n==`number`||typeof n==`bigint`)return i===null?c(e,t,``+n,r):null;if(typeof n==`object`&&n){switch(n.$$typeof){case h:return n.key===i?l(e,t,n,r):null;case g:return n.key===i?u(e,t,n,r):null;case S:return n=Na(n),p(e,t,n,r)}if(ue(n)||se(n))return i===null?d(e,t,n,r,null):null;if(typeof n.then==`function`)return p(e,t,za(n),r);if(n.$$typeof===x)return p(e,t,ca(e,n),r);Va(e,n)}return null}function m(e,t,n,r,i){if(typeof r==`string`&&r!==``||typeof r==`number`||typeof r==`bigint`)return e=e.get(n)||null,c(t,e,``+r,i);if(typeof r==`object`&&r){switch(r.$$typeof){case h:return e=e.get(r.key===null?n:r.key)||null,l(t,e,r,i);case g:return e=e.get(r.key===null?n:r.key)||null,u(t,e,r,i);case S:return r=Na(r),m(e,t,n,r,i)}if(ue(r)||se(r))return e=e.get(n)||null,d(t,e,r,i,null);if(typeof r.then==`function`)return m(e,t,n,za(r),i);if(r.$$typeof===x)return m(e,t,n,ca(t,r),i);Va(t,r)}return null}function v(i,a,s,c){for(var l=null,u=null,d=a,h=a=0,g=null;d!==null&&h<s.length;h++){d.index>h?(g=d,d=null):g=d.sibling;var _=p(i,d,s[h],c);if(_===null){d===null&&(d=g);break}e&&d&&_.alternate===null&&t(i,d),a=o(_,a,h),u===null?l=_:u.sibling=_,u=_,d=g}if(h===s.length)return n(i,d),N&&Fi(i,h),l;if(d===null){for(;h<s.length;h++)d=f(i,s[h],c),d!==null&&(a=o(d,a,h),u===null?l=d:u.sibling=d,u=d);return N&&Fi(i,h),l}for(d=r(d);h<s.length;h++)g=m(d,i,h,s[h],c),g!==null&&(e&&g.alternate!==null&&d.delete(g.key===null?h:g.key),a=o(g,a,h),u===null?l=g:u.sibling=g,u=g);return e&&d.forEach(function(e){return t(i,e)}),N&&Fi(i,h),l}function y(a,s,c,l){if(c==null)throw Error(i(151));for(var u=null,d=null,h=s,g=s=0,_=null,v=c.next();h!==null&&!v.done;g++,v=c.next()){h.index>g?(_=h,h=null):_=h.sibling;var y=p(a,h,v.value,l);if(y===null){h===null&&(h=_);break}e&&h&&y.alternate===null&&t(a,h),s=o(y,s,g),d===null?u=y:d.sibling=y,d=y,h=_}if(v.done)return n(a,h),N&&Fi(a,g),u;if(h===null){for(;!v.done;g++,v=c.next())v=f(a,v.value,l),v!==null&&(s=o(v,s,g),d===null?u=v:d.sibling=v,d=v);return N&&Fi(a,g),u}for(h=r(h);!v.done;g++,v=c.next())v=m(h,a,g,v.value,l),v!==null&&(e&&v.alternate!==null&&h.delete(v.key===null?g:v.key),s=o(v,s,g),d===null?u=v:d.sibling=v,d=v);return e&&h.forEach(function(e){return t(a,e)}),N&&Fi(a,g),u}function b(e,r,o,c){if(typeof o==`object`&&o&&o.type===_&&o.key===null&&(o=o.props.children),typeof o==`object`&&o){switch(o.$$typeof){case h:a:{for(var l=o.key;r!==null;){if(r.key===l){if(l=o.type,l===_){if(r.tag===7){n(e,r.sibling),c=a(r,o.props.children),c.return=e,e=c;break a}}else if(r.elementType===l||typeof l==`object`&&l&&l.$$typeof===S&&Na(l)===r.type){n(e,r.sibling),c=a(r,o.props),Ba(c,o),c.return=e,e=c;break a}n(e,r);break}t(e,r),r=r.sibling}o.type===_?(c=bi(o.props.children,e.mode,c,o.key),c.return=e,e=c):(c=yi(o.type,o.key,o.props,null,e.mode,c),Ba(c,o),c.return=e,e=c)}return s(e);case g:a:{for(l=o.key;r!==null;){if(r.key===l){if(r.tag===4&&r.stateNode.containerInfo===o.containerInfo&&r.stateNode.implementation===o.implementation){n(e,r.sibling),c=a(r,o.children||[]),c.return=e,e=c;break a}n(e,r);break}t(e,r),r=r.sibling}c=Ci(o,e.mode,c),c.return=e,e=c}return s(e);case S:return o=Na(o),b(e,r,o,c)}if(ue(o))return v(e,r,o,c);if(se(o)){if(l=se(o),typeof l!=`function`)throw Error(i(150));return o=l.call(o),y(e,r,o,c)}if(typeof o.then==`function`)return b(e,r,za(o),c);if(o.$$typeof===x)return b(e,r,ca(e,o),c);Va(e,o)}return typeof o==`string`&&o!==``||typeof o==`number`||typeof o==`bigint`?(o=``+o,r!==null&&r.tag===6?(n(e,r.sibling),c=a(r,o),c.return=e,e=c):(n(e,r),c=xi(o,e.mode,c),c.return=e,e=c),s(e)):n(e,r)}return function(e,t,n,r){try{Ra=0;var i=b(e,t,n,r);return La=null,i}catch(t){if(t===Da||t===ka)throw t;var a=hi(29,t,null,e.mode);return a.lanes=r,a.return=e,a}}}var Ua=Ha(!0),Wa=Ha(!1),Ga=!1;function Ka(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function qa(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function Ja(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function Ya(e,t,n){var r=e.updateQueue;if(r===null)return null;if(r=r.shared,G&2){var i=r.pending;return i===null?t.next=t:(t.next=i.next,i.next=t),r.pending=t,t=fi(e),di(e,null,n),t}return ci(e,r,t,n),fi(e)}function Xa(e,t,n){if(t=t.updateQueue,t!==null&&(t=t.shared,n&4194048)){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,lt(e,n)}}function Za(e,t){var n=e.updateQueue,r=e.alternate;if(r!==null&&(r=r.updateQueue,n===r)){var i=null,a=null;if(n=n.firstBaseUpdate,n!==null){do{var o={lane:n.lane,tag:n.tag,payload:n.payload,callback:null,next:null};a===null?i=a=o:a=a.next=o,n=n.next}while(n!==null);a===null?i=a=t:a=a.next=t}else i=a=t;n={baseState:r.baseState,firstBaseUpdate:i,lastBaseUpdate:a,shared:r.shared,callbacks:r.callbacks},e.updateQueue=n;return}e=n.lastBaseUpdate,e===null?n.firstBaseUpdate=t:e.next=t,n.lastBaseUpdate=t}var Qa=!1;function $a(){if(Qa){var e=va;if(e!==null)throw e}}function eo(e,t,n,r){Qa=!1;var i=e.updateQueue;Ga=!1;var a=i.firstBaseUpdate,o=i.lastBaseUpdate,s=i.shared.pending;if(s!==null){i.shared.pending=null;var c=s,l=c.next;c.next=null,o===null?a=l:o.next=l,o=c;var u=e.alternate;u!==null&&(u=u.updateQueue,s=u.lastBaseUpdate,s!==o&&(s===null?u.firstBaseUpdate=l:s.next=l,u.lastBaseUpdate=c))}if(a!==null){var d=i.baseState;o=0,u=l=c=null,s=a;do{var p=s.lane&-536870913,m=p!==s.lane;if(m?(J&p)===p:(r&p)===p){p!==0&&p===_a&&(Qa=!0),u!==null&&(u=u.next={lane:0,tag:s.tag,payload:s.payload,callback:null,next:null});a:{var h=e,g=s;p=t;var _=n;switch(g.tag){case 1:if(h=g.payload,typeof h==`function`){d=h.call(_,d,p);break a}d=h;break a;case 3:h.flags=h.flags&-65537|128;case 0:if(h=g.payload,p=typeof h==`function`?h.call(_,d,p):h,p==null)break a;d=f({},d,p);break a;case 2:Ga=!0}}p=s.callback,p!==null&&(e.flags|=64,m&&(e.flags|=8192),m=i.callbacks,m===null?i.callbacks=[p]:m.push(p))}else m={lane:p,tag:s.tag,payload:s.payload,callback:s.callback,next:null},u===null?(l=u=m,c=d):u=u.next=m,o|=p;if(s=s.next,s===null){if(s=i.shared.pending,s===null)break;m=s,s=m.next,m.next=null,i.lastBaseUpdate=m,i.shared.pending=null}}while(1);u===null&&(c=d),i.baseState=c,i.firstBaseUpdate=l,i.lastBaseUpdate=u,a===null&&(i.shared.lanes=0),Gl|=o,e.lanes=o,e.memoizedState=d}}function to(e,t){if(typeof e!=`function`)throw Error(i(191,e));e.call(t)}function no(e,t){var n=e.callbacks;if(n!==null)for(e.callbacks=null,e=0;e<n.length;e++)to(n[e],t)}var ro=me(null),io=me(0);function ao(e,t){e=Wl,E(io,e),E(ro,t),Wl=e|t.baseLanes}function oo(){E(io,Wl),E(ro,ro.current)}function so(){Wl=io.current,T(ro),T(io)}var co=me(null),lo=null;function uo(e){var t=e.alternate;E(F,F.current&1),E(co,e),lo===null&&(t===null||ro.current!==null||t.memoizedState!==null)&&(lo=e)}function fo(e){E(F,F.current),E(co,e),lo===null&&(lo=e)}function po(e){e.tag===22?(E(F,F.current),E(co,e),lo===null&&(lo=e)):mo(e)}function mo(){E(F,F.current),E(co,co.current)}function ho(e){T(co),lo===e&&(lo=null),T(F)}var F=me(0);function go(e){for(var t=e;t!==null;){if(t.tag===13){var n=t.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||af(n)||of(n)))return t}else if(t.tag===19&&(t.memoizedProps.revealOrder===`forwards`||t.memoizedProps.revealOrder===`backwards`||t.memoizedProps.revealOrder===`unstable_legacy-backwards`||t.memoizedProps.revealOrder===`together`)){if(t.flags&128)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var _o=0,I=null,L=null,R=null,vo=!1,yo=!1,bo=!1,xo=0,So=0,Co=null,wo=0;function z(){throw Error(i(321))}function To(e,t){if(t===null)return!1;for(var n=0;n<t.length&&n<e.length;n++)if(!kr(e[n],t[n]))return!1;return!0}function Eo(e,t,n,r,i,a){return _o=a,I=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,C.H=e===null||e.memoizedState===null?Hs:Us,bo=!1,a=n(r,i),bo=!1,yo&&(a=Oo(t,n,r,i)),Do(e),a}function Do(e){C.H=Vs;var t=L!==null&&L.next!==null;if(_o=0,R=L=I=null,vo=!1,So=0,Co=null,t)throw Error(i(300));e===null||V||(e=e.dependencies,e!==null&&aa(e)&&(V=!0))}function Oo(e,t,n,r){I=e;var a=0;do{if(yo&&(Co=null),So=0,yo=!1,25<=a)throw Error(i(301));if(a+=1,R=L=null,e.updateQueue!=null){var o=e.updateQueue;o.lastEffect=null,o.events=null,o.stores=null,o.memoCache!=null&&(o.memoCache.index=0)}C.H=Ws,o=t(n,r)}while(yo);return o}function ko(){var e=C.H,t=e.useState()[0];return t=typeof t.then==`function`?Fo(t):t,e=e.useState()[0],(L===null?null:L.memoizedState)!==e&&(I.flags|=1024),t}function Ao(){var e=xo!==0;return xo=0,e}function jo(e,t,n){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~n}function Mo(e){if(vo){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}vo=!1}_o=0,R=L=I=null,yo=!1,So=xo=0,Co=null}function No(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return R===null?I.memoizedState=R=e:R=R.next=e,R}function B(){if(L===null){var e=I.alternate;e=e===null?null:e.memoizedState}else e=L.next;var t=R===null?I.memoizedState:R.next;if(t!==null)R=t,L=e;else{if(e===null)throw I.alternate===null?Error(i(467)):Error(i(310));L=e,e={memoizedState:L.memoizedState,baseState:L.baseState,baseQueue:L.baseQueue,queue:L.queue,next:null},R===null?I.memoizedState=R=e:R=R.next=e}return R}function Po(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function Fo(e){var t=So;return So+=1,Co===null&&(Co=[]),e=Ma(Co,e,t),t=I,(R===null?t.memoizedState:R.next)===null&&(t=t.alternate,C.H=t===null||t.memoizedState===null?Hs:Us),e}function Io(e){if(typeof e==`object`&&e){if(typeof e.then==`function`)return Fo(e);if(e.$$typeof===x)return sa(e)}throw Error(i(438,String(e)))}function Lo(e){var t=null,n=I.updateQueue;if(n!==null&&(t=n.memoCache),t==null){var r=I.alternate;r!==null&&(r=r.updateQueue,r!==null&&(r=r.memoCache,r!=null&&(t={data:r.data.map(function(e){return e.slice()}),index:0})))}if(t??={data:[],index:0},n===null&&(n=Po(),I.updateQueue=n),n.memoCache=t,n=t.data[t.index],n===void 0)for(n=t.data[t.index]=Array(e),r=0;r<e;r++)n[r]=ae;return t.index++,n}function Ro(e,t){return typeof t==`function`?t(e):t}function zo(e){return Bo(B(),L,e)}function Bo(e,t,n){var r=e.queue;if(r===null)throw Error(i(311));r.lastRenderedReducer=n;var a=e.baseQueue,o=r.pending;if(o!==null){if(a!==null){var s=a.next;a.next=o.next,o.next=s}t.baseQueue=a=o,r.pending=null}if(o=e.baseState,a===null)e.memoizedState=o;else{t=a.next;var c=s=null,l=null,u=t,d=!1;do{var f=u.lane&-536870913;if(f===u.lane?(_o&f)===f:(J&f)===f){var p=u.revertLane;if(p===0)l!==null&&(l=l.next={lane:0,revertLane:0,gesture:null,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null}),f===_a&&(d=!0);else if((_o&p)===p){u=u.next,p===_a&&(d=!0);continue}else f={lane:0,revertLane:u.revertLane,gesture:null,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null},l===null?(c=l=f,s=o):l=l.next=f,I.lanes|=p,Gl|=p;f=u.action,bo&&n(o,f),o=u.hasEagerState?u.eagerState:n(o,f)}else p={lane:f,revertLane:u.revertLane,gesture:u.gesture,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null},l===null?(c=l=p,s=o):l=l.next=p,I.lanes|=f,Gl|=f;u=u.next}while(u!==null&&u!==t);if(l===null?s=o:l.next=c,!kr(o,e.memoizedState)&&(V=!0,d&&(n=va,n!==null)))throw n;e.memoizedState=o,e.baseState=s,e.baseQueue=l,r.lastRenderedState=o}return a===null&&(r.lanes=0),[e.memoizedState,r.dispatch]}function Vo(e){var t=B(),n=t.queue;if(n===null)throw Error(i(311));n.lastRenderedReducer=e;var r=n.dispatch,a=n.pending,o=t.memoizedState;if(a!==null){n.pending=null;var s=a=a.next;do o=e(o,s.action),s=s.next;while(s!==a);kr(o,t.memoizedState)||(V=!0),t.memoizedState=o,t.baseQueue===null&&(t.baseState=o),n.lastRenderedState=o}return[o,r]}function Ho(e,t,n){var r=I,a=B(),o=N;if(o){if(n===void 0)throw Error(i(407));n=n()}else n=t();var s=!kr((L||a).memoizedState,n);if(s&&(a.memoizedState=n,V=!0),a=a.queue,ps(Go.bind(null,r,a,e),[e]),a.getSnapshot!==t||s||R!==null&&R.memoizedState.tag&1){if(r.flags|=2048,cs(9,{destroy:void 0},Wo.bind(null,r,a,n,t),null),K===null)throw Error(i(349));o||_o&127||Uo(r,t,n)}return n}function Uo(e,t,n){e.flags|=16384,e={getSnapshot:t,value:n},t=I.updateQueue,t===null?(t=Po(),I.updateQueue=t,t.stores=[e]):(n=t.stores,n===null?t.stores=[e]:n.push(e))}function Wo(e,t,n,r){t.value=n,t.getSnapshot=r,Ko(t)&&qo(e)}function Go(e,t,n){return n(function(){Ko(t)&&qo(e)})}function Ko(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!kr(e,n)}catch{return!0}}function qo(e){var t=ui(e,2);t!==null&&hu(t,e,2)}function Jo(e){var t=No();if(typeof e==`function`){var n=e;if(e=n(),bo){Ke(!0);try{n()}finally{Ke(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Ro,lastRenderedState:e},t}function Yo(e,t,n,r){return e.baseState=n,Bo(e,L,typeof r==`function`?r:Ro)}function Xo(e,t,n,r,a){if(Rs(e))throw Error(i(485));if(e=t.action,e!==null){var o={payload:a,action:e,next:null,isTransition:!0,status:`pending`,value:null,reason:null,listeners:[],then:function(e){o.listeners.push(e)}};C.T===null?o.isTransition=!1:n(!0),r(o),n=t.pending,n===null?(o.next=t.pending=o,Zo(t,o)):(o.next=n.next,t.pending=n.next=o)}}function Zo(e,t){var n=t.action,r=t.payload,i=e.state;if(t.isTransition){var a=C.T,o={};C.T=o;try{var s=n(i,r),c=C.S;c!==null&&c(o,s),Qo(e,t,s)}catch(n){es(e,t,n)}finally{a!==null&&o.types!==null&&(a.types=o.types),C.T=a}}else try{a=n(i,r),Qo(e,t,a)}catch(n){es(e,t,n)}}function Qo(e,t,n){typeof n==`object`&&n&&typeof n.then==`function`?n.then(function(n){$o(e,t,n)},function(n){return es(e,t,n)}):$o(e,t,n)}function $o(e,t,n){t.status=`fulfilled`,t.value=n,ts(t),e.state=n,t=e.pending,t!==null&&(n=t.next,n===t?e.pending=null:(n=n.next,t.next=n,Zo(e,n)))}function es(e,t,n){var r=e.pending;if(e.pending=null,r!==null){r=r.next;do t.status=`rejected`,t.reason=n,ts(t),t=t.next;while(t!==r)}e.action=null}function ts(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function ns(e,t){return t}function rs(e,t){if(N){var n=K.formState;if(n!==null){a:{var r=I;if(N){if(M){b:{for(var i=M,a=Hi;i.nodeType!==8;){if(!a){i=null;break b}if(i=cf(i.nextSibling),i===null){i=null;break b}}a=i.data,i=a===`F!`||a===`F`?i:null}if(i){M=cf(i.nextSibling),r=i.data===`F!`;break a}}Wi(r)}r=!1}r&&(t=n[0])}}return n=No(),n.memoizedState=n.baseState=t,r={pending:null,lanes:0,dispatch:null,lastRenderedReducer:ns,lastRenderedState:t},n.queue=r,n=Fs.bind(null,I,r),r.dispatch=n,r=Jo(!1),a=Ls.bind(null,I,!1,r.queue),r=No(),i={state:t,dispatch:null,action:e,pending:null},r.queue=i,n=Xo.bind(null,I,i,a,n),i.dispatch=n,r.memoizedState=e,[t,n,!1]}function is(e){return as(B(),L,e)}function as(e,t,n){if(t=Bo(e,t,ns)[0],e=zo(Ro)[0],typeof t==`object`&&t&&typeof t.then==`function`)try{var r=Fo(t)}catch(e){throw e===Da?ka:e}else r=t;t=B();var i=t.queue,a=i.dispatch;return n!==t.memoizedState&&(I.flags|=2048,cs(9,{destroy:void 0},os.bind(null,i,n),null)),[r,a,e]}function os(e,t){e.action=t}function ss(e){var t=B(),n=L;if(n!==null)return as(t,n,e);B(),t=t.memoizedState,n=B();var r=n.queue.dispatch;return n.memoizedState=e,[t,r,!1]}function cs(e,t,n,r){return e={tag:e,create:n,deps:r,inst:t,next:null},t=I.updateQueue,t===null&&(t=Po(),I.updateQueue=t),n=t.lastEffect,n===null?t.lastEffect=e.next=e:(r=n.next,n.next=e,e.next=r,t.lastEffect=e),e}function ls(){return B().memoizedState}function us(e,t,n,r){var i=No();I.flags|=e,i.memoizedState=cs(1|t,{destroy:void 0},n,r===void 0?null:r)}function ds(e,t,n,r){var i=B();r=r===void 0?null:r;var a=i.memoizedState.inst;L!==null&&r!==null&&To(r,L.memoizedState.deps)?i.memoizedState=cs(t,a,n,r):(I.flags|=e,i.memoizedState=cs(1|t,a,n,r))}function fs(e,t){us(8390656,8,e,t)}function ps(e,t){ds(2048,8,e,t)}function ms(e){I.flags|=4;var t=I.updateQueue;if(t===null)t=Po(),I.updateQueue=t,t.events=[e];else{var n=t.events;n===null?t.events=[e]:n.push(e)}}function hs(e){var t=B().memoizedState;return ms({ref:t,nextImpl:e}),function(){if(G&2)throw Error(i(440));return t.impl.apply(void 0,arguments)}}function gs(e,t){return ds(4,2,e,t)}function _s(e,t){return ds(4,4,e,t)}function vs(e,t){if(typeof t==`function`){e=e();var n=t(e);return function(){typeof n==`function`?n():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function ys(e,t,n){n=n==null?null:n.concat([e]),ds(4,4,vs.bind(null,t,e),n)}function bs(){}function xs(e,t){var n=B();t=t===void 0?null:t;var r=n.memoizedState;return t!==null&&To(t,r[1])?r[0]:(n.memoizedState=[e,t],e)}function Ss(e,t){var n=B();t=t===void 0?null:t;var r=n.memoizedState;if(t!==null&&To(t,r[1]))return r[0];if(r=e(),bo){Ke(!0);try{e()}finally{Ke(!1)}}return n.memoizedState=[r,t],r}function Cs(e,t,n){return n===void 0||_o&1073741824&&!(J&261930)?e.memoizedState=t:(e.memoizedState=n,e=mu(),I.lanes|=e,Gl|=e,n)}function ws(e,t,n,r){return kr(n,t)?n:ro.current===null?!(_o&42)||_o&1073741824&&!(J&261930)?(V=!0,e.memoizedState=n):(e=mu(),I.lanes|=e,Gl|=e,t):(e=Cs(e,n,r),kr(e,t)||(V=!0),e)}function Ts(e,t,n,r,i){var a=w.p;w.p=a!==0&&8>a?a:8;var o=C.T,s={};C.T=s,Ls(e,!1,t,n);try{var c=i(),l=C.S;l!==null&&l(s,c),typeof c==`object`&&c&&typeof c.then==`function`?Is(e,t,xa(c,r),pu(e)):Is(e,t,r,pu(e))}catch(n){Is(e,t,{then:function(){},status:`rejected`,reason:n},pu())}finally{w.p=a,o!==null&&s.types!==null&&(o.types=s.types),C.T=o}}function Es(){}function Ds(e,t,n,r){if(e.tag!==5)throw Error(i(476));var a=Os(e).queue;Ts(e,a,t,de,n===null?Es:function(){return ks(e),n(r)})}function Os(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:de,baseState:de,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Ro,lastRenderedState:de},next:null};var n={};return t.next={memoizedState:n,baseState:n,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Ro,lastRenderedState:n},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function ks(e){var t=Os(e);t.next===null&&(t=e.alternate.memoizedState),Is(e,t.next.queue,{},pu())}function As(){return sa(Qf)}function js(){return B().memoizedState}function Ms(){return B().memoizedState}function Ns(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var n=pu();e=Ja(n);var r=Ya(t,e,n);r!==null&&(hu(r,t,n),Xa(r,t,n)),t={cache:pa()},e.payload=t;return}t=t.return}}function Ps(e,t,n){var r=pu();n={lane:r,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},Rs(e)?zs(t,n):(n=li(e,t,n,r),n!==null&&(hu(n,e,r),Bs(n,t,r)))}function Fs(e,t,n){Is(e,t,n,pu())}function Is(e,t,n,r){var i={lane:r,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null};if(Rs(e))zs(t,i);else{var a=e.alternate;if(e.lanes===0&&(a===null||a.lanes===0)&&(a=t.lastRenderedReducer,a!==null))try{var o=t.lastRenderedState,s=a(o,n);if(i.hasEagerState=!0,i.eagerState=s,kr(s,o))return ci(e,t,i,0),K===null&&si(),!1}catch{}if(n=li(e,t,i,r),n!==null)return hu(n,e,r),Bs(n,t,r),!0}return!1}function Ls(e,t,n,r){if(r={lane:2,revertLane:dd(),gesture:null,action:r,hasEagerState:!1,eagerState:null,next:null},Rs(e)){if(t)throw Error(i(479))}else t=li(e,n,r,2),t!==null&&hu(t,e,2)}function Rs(e){var t=e.alternate;return e===I||t!==null&&t===I}function zs(e,t){yo=vo=!0;var n=e.pending;n===null?t.next=t:(t.next=n.next,n.next=t),e.pending=t}function Bs(e,t,n){if(n&4194048){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,lt(e,n)}}var Vs={readContext:sa,use:Io,useCallback:z,useContext:z,useEffect:z,useImperativeHandle:z,useLayoutEffect:z,useInsertionEffect:z,useMemo:z,useReducer:z,useRef:z,useState:z,useDebugValue:z,useDeferredValue:z,useTransition:z,useSyncExternalStore:z,useId:z,useHostTransitionStatus:z,useFormState:z,useActionState:z,useOptimistic:z,useMemoCache:z,useCacheRefresh:z};Vs.useEffectEvent=z;var Hs={readContext:sa,use:Io,useCallback:function(e,t){return No().memoizedState=[e,t===void 0?null:t],e},useContext:sa,useEffect:fs,useImperativeHandle:function(e,t,n){n=n==null?null:n.concat([e]),us(4194308,4,vs.bind(null,t,e),n)},useLayoutEffect:function(e,t){return us(4194308,4,e,t)},useInsertionEffect:function(e,t){us(4,2,e,t)},useMemo:function(e,t){var n=No();t=t===void 0?null:t;var r=e();if(bo){Ke(!0);try{e()}finally{Ke(!1)}}return n.memoizedState=[r,t],r},useReducer:function(e,t,n){var r=No();if(n!==void 0){var i=n(t);if(bo){Ke(!0);try{n(t)}finally{Ke(!1)}}}else i=t;return r.memoizedState=r.baseState=i,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:i},r.queue=e,e=e.dispatch=Ps.bind(null,I,e),[r.memoizedState,e]},useRef:function(e){var t=No();return e={current:e},t.memoizedState=e},useState:function(e){e=Jo(e);var t=e.queue,n=Fs.bind(null,I,t);return t.dispatch=n,[e.memoizedState,n]},useDebugValue:bs,useDeferredValue:function(e,t){return Cs(No(),e,t)},useTransition:function(){var e=Jo(!1);return e=Ts.bind(null,I,e.queue,!0,!1),No().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,n){var r=I,a=No();if(N){if(n===void 0)throw Error(i(407));n=n()}else{if(n=t(),K===null)throw Error(i(349));J&127||Uo(r,t,n)}a.memoizedState=n;var o={value:n,getSnapshot:t};return a.queue=o,fs(Go.bind(null,r,o,e),[e]),r.flags|=2048,cs(9,{destroy:void 0},Wo.bind(null,r,o,n,t),null),n},useId:function(){var e=No(),t=K.identifierPrefix;if(N){var n=Pi,r=Ni;n=(r&~(1<<32-qe(r)-1)).toString(32)+n,t=`_`+t+`R_`+n,n=xo++,0<n&&(t+=`H`+n.toString(32)),t+=`_`}else n=wo++,t=`_`+t+`r_`+n.toString(32)+`_`;return e.memoizedState=t},useHostTransitionStatus:As,useFormState:rs,useActionState:rs,useOptimistic:function(e){var t=No();t.memoizedState=t.baseState=e;var n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=n,t=Ls.bind(null,I,!0,n),n.dispatch=t,[e,t]},useMemoCache:Lo,useCacheRefresh:function(){return No().memoizedState=Ns.bind(null,I)},useEffectEvent:function(e){var t=No(),n={impl:e};return t.memoizedState=n,function(){if(G&2)throw Error(i(440));return n.impl.apply(void 0,arguments)}}},Us={readContext:sa,use:Io,useCallback:xs,useContext:sa,useEffect:ps,useImperativeHandle:ys,useInsertionEffect:gs,useLayoutEffect:_s,useMemo:Ss,useReducer:zo,useRef:ls,useState:function(){return zo(Ro)},useDebugValue:bs,useDeferredValue:function(e,t){return ws(B(),L.memoizedState,e,t)},useTransition:function(){var e=zo(Ro)[0],t=B().memoizedState;return[typeof e==`boolean`?e:Fo(e),t]},useSyncExternalStore:Ho,useId:js,useHostTransitionStatus:As,useFormState:is,useActionState:is,useOptimistic:function(e,t){return Yo(B(),L,e,t)},useMemoCache:Lo,useCacheRefresh:Ms};Us.useEffectEvent=hs;var Ws={readContext:sa,use:Io,useCallback:xs,useContext:sa,useEffect:ps,useImperativeHandle:ys,useInsertionEffect:gs,useLayoutEffect:_s,useMemo:Ss,useReducer:Vo,useRef:ls,useState:function(){return Vo(Ro)},useDebugValue:bs,useDeferredValue:function(e,t){var n=B();return L===null?Cs(n,e,t):ws(n,L.memoizedState,e,t)},useTransition:function(){var e=Vo(Ro)[0],t=B().memoizedState;return[typeof e==`boolean`?e:Fo(e),t]},useSyncExternalStore:Ho,useId:js,useHostTransitionStatus:As,useFormState:ss,useActionState:ss,useOptimistic:function(e,t){var n=B();return L===null?(n.baseState=e,[e,n.queue.dispatch]):Yo(n,L,e,t)},useMemoCache:Lo,useCacheRefresh:Ms};Ws.useEffectEvent=hs;function Gs(e,t,n,r){t=e.memoizedState,n=n(r,t),n=n==null?t:f({},t,n),e.memoizedState=n,e.lanes===0&&(e.updateQueue.baseState=n)}var Ks={enqueueSetState:function(e,t,n){e=e._reactInternals;var r=pu(),i=Ja(r);i.payload=t,n!=null&&(i.callback=n),t=Ya(e,i,r),t!==null&&(hu(t,e,r),Xa(t,e,r))},enqueueReplaceState:function(e,t,n){e=e._reactInternals;var r=pu(),i=Ja(r);i.tag=1,i.payload=t,n!=null&&(i.callback=n),t=Ya(e,i,r),t!==null&&(hu(t,e,r),Xa(t,e,r))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var n=pu(),r=Ja(n);r.tag=2,t!=null&&(r.callback=t),t=Ya(e,r,n),t!==null&&(hu(t,e,n),Xa(t,e,n))}};function qs(e,t,n,r,i,a,o){return e=e.stateNode,typeof e.shouldComponentUpdate==`function`?e.shouldComponentUpdate(r,a,o):t.prototype&&t.prototype.isPureReactComponent?!Ar(n,r)||!Ar(i,a):!0}function Js(e,t,n,r){e=t.state,typeof t.componentWillReceiveProps==`function`&&t.componentWillReceiveProps(n,r),typeof t.UNSAFE_componentWillReceiveProps==`function`&&t.UNSAFE_componentWillReceiveProps(n,r),t.state!==e&&Ks.enqueueReplaceState(t,t.state,null)}function Ys(e,t){var n=t;if(`ref`in t)for(var r in n={},t)r!==`ref`&&(n[r]=t[r]);if(e=e.defaultProps)for(var i in n===t&&(n=f({},n)),e)n[i]===void 0&&(n[i]=e[i]);return n}function Xs(e){ri(e)}function Zs(e){console.error(e)}function Qs(e){ri(e)}function $s(e,t){try{var n=e.onUncaughtError;n(t.value,{componentStack:t.stack})}catch(e){setTimeout(function(){throw e})}}function ec(e,t,n){try{var r=e.onCaughtError;r(n.value,{componentStack:n.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(e){setTimeout(function(){throw e})}}function tc(e,t,n){return n=Ja(n),n.tag=3,n.payload={element:null},n.callback=function(){$s(e,t)},n}function nc(e){return e=Ja(e),e.tag=3,e}function rc(e,t,n,r){var i=n.type.getDerivedStateFromError;if(typeof i==`function`){var a=r.value;e.payload=function(){return i(a)},e.callback=function(){ec(t,n,r)}}var o=n.stateNode;o!==null&&typeof o.componentDidCatch==`function`&&(e.callback=function(){ec(t,n,r),typeof i!=`function`&&(ru===null?ru=new Set([this]):ru.add(this));var e=r.stack;this.componentDidCatch(r.value,{componentStack:e===null?``:e})})}function ic(e,t,n,r,a){if(n.flags|=32768,typeof r==`object`&&r&&typeof r.then==`function`){if(t=n.alternate,t!==null&&ia(t,n,a,!0),n=co.current,n!==null){switch(n.tag){case 31:case 13:return lo===null?Du():n.alternate===null&&X===0&&(X=3),n.flags&=-257,n.flags|=65536,n.lanes=a,r===Aa?n.flags|=16384:(t=n.updateQueue,t===null?n.updateQueue=new Set([r]):t.add(r),Gu(e,r,a)),!1;case 22:return n.flags|=65536,r===Aa?n.flags|=16384:(t=n.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([r])},n.updateQueue=t):(n=t.retryQueue,n===null?t.retryQueue=new Set([r]):n.add(r)),Gu(e,r,a)),!1}throw Error(i(435,n.tag))}return Gu(e,r,a),Du(),!1}if(N)return t=co.current,t===null?(r!==Ui&&(t=Error(i(423),{cause:r}),Xi(Ti(t,n))),e=e.current.alternate,e.flags|=65536,a&=-a,e.lanes|=a,r=Ti(r,n),a=tc(e.stateNode,r,a),Za(e,a),X!==4&&(X=2)):(!(t.flags&65536)&&(t.flags|=256),t.flags|=65536,t.lanes=a,r!==Ui&&(e=Error(i(422),{cause:r}),Xi(Ti(e,n)))),!1;var o=Error(i(520),{cause:r});if(o=Ti(o,n),Xl===null?Xl=[o]:Xl.push(o),X!==4&&(X=2),t===null)return!0;r=Ti(r,n),n=t;do{switch(n.tag){case 3:return n.flags|=65536,e=a&-a,n.lanes|=e,e=tc(n.stateNode,r,e),Za(n,e),!1;case 1:if(t=n.type,o=n.stateNode,!(n.flags&128)&&(typeof t.getDerivedStateFromError==`function`||o!==null&&typeof o.componentDidCatch==`function`&&(ru===null||!ru.has(o))))return n.flags|=65536,a&=-a,n.lanes|=a,a=nc(a),rc(a,e,n,r),Za(n,a),!1}n=n.return}while(n!==null);return!1}var ac=Error(i(461)),V=!1;function oc(e,t,n,r){t.child=e===null?Wa(t,null,n,r):Ua(t,e.child,n,r)}function sc(e,t,n,r,i){n=n.render;var a=t.ref;if(`ref`in r){var o={};for(var s in r)s!==`ref`&&(o[s]=r[s])}else o=r;return oa(t),r=Eo(e,t,n,o,a,i),s=Ao(),e!==null&&!V?(jo(e,t,i),jc(e,t,i)):(N&&s&&Li(t),t.flags|=1,oc(e,t,r,i),t.child)}function cc(e,t,n,r,i){if(e===null){var a=n.type;return typeof a==`function`&&!gi(a)&&a.defaultProps===void 0&&n.compare===null?(t.tag=15,t.type=a,lc(e,t,a,r,i)):(e=yi(n.type,null,r,t,t.mode,i),e.ref=t.ref,e.return=t,t.child=e)}if(a=e.child,!Mc(e,i)){var o=a.memoizedProps;if(n=n.compare,n=n===null?Ar:n,n(o,r)&&e.ref===t.ref)return jc(e,t,i)}return t.flags|=1,e=_i(a,r),e.ref=t.ref,e.return=t,t.child=e}function lc(e,t,n,r,i){if(e!==null){var a=e.memoizedProps;if(Ar(a,r)&&e.ref===t.ref){if(V=!1,t.pendingProps=r=a,Mc(e,i))e.flags&131072&&(V=!0);else return t.lanes=e.lanes,jc(e,t,i)}}return _c(e,t,n,r,i)}function uc(e,t,n,r){var i=r.children,a=e===null?null:e.memoizedState;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),r.mode===`hidden`){if(t.flags&128){if(a=a===null?n:a.baseLanes|n,e!==null){for(r=t.child=e.child,i=0;r!==null;)i=i|r.lanes|r.childLanes,r=r.sibling;r=i&~a}else r=0,t.child=null;return fc(e,t,a,n,r)}if(n&536870912)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&Ta(t,a===null?null:a.cachePool),a===null?oo():ao(t,a),po(t);else return r=t.lanes=536870912,fc(e,t,a===null?n:a.baseLanes|n,n,r)}else a===null?(e!==null&&Ta(t,null),oo(),mo(t)):(Ta(t,a.cachePool),ao(t,a),mo(t),t.memoizedState=null);return oc(e,t,i,n),t.child}function dc(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function fc(e,t,n,r,i){var a=wa();return a=a===null?null:{parent:P._currentValue,pool:a},t.memoizedState={baseLanes:n,cachePool:a},e!==null&&Ta(t,null),oo(),po(t),e!==null&&ia(e,t,r,!0),t.childLanes=i,null}function pc(e,t){return t=Ec({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function mc(e,t,n){return Ua(t,e.child,null,n),e=pc(t,t.pendingProps),e.flags|=2,ho(t),t.memoizedState=null,e}function hc(e,t,n){var r=t.pendingProps,a=!!(t.flags&128);if(t.flags&=-129,e===null){if(N){if(r.mode===`hidden`)return e=pc(t,r),t.lanes=536870912,dc(null,e);if(fo(t),(e=M)?(e=rf(e,Hi),e=e!==null&&e.data===`&`?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:Mi===null?null:{id:Ni,overflow:Pi},retryLane:536870912,hydrationErrors:null},n=Si(e),n.return=t,t.child=n,Bi=t,M=null)):e=null,e===null)throw Wi(t);return t.lanes=536870912,null}return pc(t,r)}var o=e.memoizedState;if(o!==null){var s=o.dehydrated;if(fo(t),a){if(t.flags&256)t.flags&=-257,t=mc(e,t,n);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error(i(558))}else if(V||ia(e,t,n,!1),a=(n&e.childLanes)!==0,V||a){if(r=K,r!==null&&(s=ut(r,n),s!==0&&s!==o.retryLane))throw o.retryLane=s,ui(e,s),hu(r,e,s),ac;Du(),t=mc(e,t,n)}else e=o.treeContext,M=cf(s.nextSibling),Bi=t,N=!0,Vi=null,Hi=!1,e!==null&&zi(t,e),t=pc(t,r),t.flags|=4096;return t}return e=_i(e.child,{mode:r.mode,children:r.children}),e.ref=t.ref,t.child=e,e.return=t,e}function gc(e,t){var n=t.ref;if(n===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof n!=`function`&&typeof n!=`object`)throw Error(i(284));(e===null||e.ref!==n)&&(t.flags|=4194816)}}function _c(e,t,n,r,i){return oa(t),n=Eo(e,t,n,r,void 0,i),r=Ao(),e!==null&&!V?(jo(e,t,i),jc(e,t,i)):(N&&r&&Li(t),t.flags|=1,oc(e,t,n,i),t.child)}function vc(e,t,n,r,i,a){return oa(t),t.updateQueue=null,n=Oo(t,r,n,i),Do(e),r=Ao(),e!==null&&!V?(jo(e,t,a),jc(e,t,a)):(N&&r&&Li(t),t.flags|=1,oc(e,t,n,a),t.child)}function yc(e,t,n,r,i){if(oa(t),t.stateNode===null){var a=pi,o=n.contextType;typeof o==`object`&&o&&(a=sa(o)),a=new n(r,a),t.memoizedState=a.state!==null&&a.state!==void 0?a.state:null,a.updater=Ks,t.stateNode=a,a._reactInternals=t,a=t.stateNode,a.props=r,a.state=t.memoizedState,a.refs={},Ka(t),o=n.contextType,a.context=typeof o==`object`&&o?sa(o):pi,a.state=t.memoizedState,o=n.getDerivedStateFromProps,typeof o==`function`&&(Gs(t,n,o,r),a.state=t.memoizedState),typeof n.getDerivedStateFromProps==`function`||typeof a.getSnapshotBeforeUpdate==`function`||typeof a.UNSAFE_componentWillMount!=`function`&&typeof a.componentWillMount!=`function`||(o=a.state,typeof a.componentWillMount==`function`&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount==`function`&&a.UNSAFE_componentWillMount(),o!==a.state&&Ks.enqueueReplaceState(a,a.state,null),eo(t,r,a,i),$a(),a.state=t.memoizedState),typeof a.componentDidMount==`function`&&(t.flags|=4194308),r=!0}else if(e===null){a=t.stateNode;var s=t.memoizedProps,c=Ys(n,s);a.props=c;var l=a.context,u=n.contextType;o=pi,typeof u==`object`&&u&&(o=sa(u));var d=n.getDerivedStateFromProps;u=typeof d==`function`||typeof a.getSnapshotBeforeUpdate==`function`,s=t.pendingProps!==s,u||typeof a.UNSAFE_componentWillReceiveProps!=`function`&&typeof a.componentWillReceiveProps!=`function`||(s||l!==o)&&Js(t,a,r,o),Ga=!1;var f=t.memoizedState;a.state=f,eo(t,r,a,i),$a(),l=t.memoizedState,s||f!==l||Ga?(typeof d==`function`&&(Gs(t,n,d,r),l=t.memoizedState),(c=Ga||qs(t,n,c,r,f,l,o))?(u||typeof a.UNSAFE_componentWillMount!=`function`&&typeof a.componentWillMount!=`function`||(typeof a.componentWillMount==`function`&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount==`function`&&a.UNSAFE_componentWillMount()),typeof a.componentDidMount==`function`&&(t.flags|=4194308)):(typeof a.componentDidMount==`function`&&(t.flags|=4194308),t.memoizedProps=r,t.memoizedState=l),a.props=r,a.state=l,a.context=o,r=c):(typeof a.componentDidMount==`function`&&(t.flags|=4194308),r=!1)}else{a=t.stateNode,qa(e,t),o=t.memoizedProps,u=Ys(n,o),a.props=u,d=t.pendingProps,f=a.context,l=n.contextType,c=pi,typeof l==`object`&&l&&(c=sa(l)),s=n.getDerivedStateFromProps,(l=typeof s==`function`||typeof a.getSnapshotBeforeUpdate==`function`)||typeof a.UNSAFE_componentWillReceiveProps!=`function`&&typeof a.componentWillReceiveProps!=`function`||(o!==d||f!==c)&&Js(t,a,r,c),Ga=!1,f=t.memoizedState,a.state=f,eo(t,r,a,i),$a();var p=t.memoizedState;o!==d||f!==p||Ga||e!==null&&e.dependencies!==null&&aa(e.dependencies)?(typeof s==`function`&&(Gs(t,n,s,r),p=t.memoizedState),(u=Ga||qs(t,n,u,r,f,p,c)||e!==null&&e.dependencies!==null&&aa(e.dependencies))?(l||typeof a.UNSAFE_componentWillUpdate!=`function`&&typeof a.componentWillUpdate!=`function`||(typeof a.componentWillUpdate==`function`&&a.componentWillUpdate(r,p,c),typeof a.UNSAFE_componentWillUpdate==`function`&&a.UNSAFE_componentWillUpdate(r,p,c)),typeof a.componentDidUpdate==`function`&&(t.flags|=4),typeof a.getSnapshotBeforeUpdate==`function`&&(t.flags|=1024)):(typeof a.componentDidUpdate!=`function`||o===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof a.getSnapshotBeforeUpdate!=`function`||o===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),t.memoizedProps=r,t.memoizedState=p),a.props=r,a.state=p,a.context=c,r=u):(typeof a.componentDidUpdate!=`function`||o===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof a.getSnapshotBeforeUpdate!=`function`||o===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),r=!1)}return a=r,gc(e,t),r=!!(t.flags&128),a||r?(a=t.stateNode,n=r&&typeof n.getDerivedStateFromError!=`function`?null:a.render(),t.flags|=1,e!==null&&r?(t.child=Ua(t,e.child,null,i),t.child=Ua(t,null,n,i)):oc(e,t,n,i),t.memoizedState=a.state,e=t.child):e=jc(e,t,i),e}function bc(e,t,n,r){return Ji(),t.flags|=256,oc(e,t,n,r),t.child}var xc={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function Sc(e){return{baseLanes:e,cachePool:Ea()}}function Cc(e,t,n){return e=e===null?0:e.childLanes&~n,t&&(e|=Jl),e}function wc(e,t,n){var r=t.pendingProps,a=!1,o=!!(t.flags&128),s;if((s=o)||(s=e!==null&&e.memoizedState===null?!1:!!(F.current&2)),s&&(a=!0,t.flags&=-129),s=!!(t.flags&32),t.flags&=-33,e===null){if(N){if(a?uo(t):mo(t),(e=M)?(e=rf(e,Hi),e=e!==null&&e.data!==`&`?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:Mi===null?null:{id:Ni,overflow:Pi},retryLane:536870912,hydrationErrors:null},n=Si(e),n.return=t,t.child=n,Bi=t,M=null)):e=null,e===null)throw Wi(t);return of(e)?t.lanes=32:t.lanes=536870912,null}var c=r.children;return r=r.fallback,a?(mo(t),a=t.mode,c=Ec({mode:`hidden`,children:c},a),r=bi(r,a,n,null),c.return=t,r.return=t,c.sibling=r,t.child=c,r=t.child,r.memoizedState=Sc(n),r.childLanes=Cc(e,s,n),t.memoizedState=xc,dc(null,r)):(uo(t),Tc(t,c))}var l=e.memoizedState;if(l!==null&&(c=l.dehydrated,c!==null)){if(o)t.flags&256?(uo(t),t.flags&=-257,t=Dc(e,t,n)):t.memoizedState===null?(mo(t),c=r.fallback,a=t.mode,r=Ec({mode:`visible`,children:r.children},a),c=bi(c,a,n,null),c.flags|=2,r.return=t,c.return=t,r.sibling=c,t.child=r,Ua(t,e.child,null,n),r=t.child,r.memoizedState=Sc(n),r.childLanes=Cc(e,s,n),t.memoizedState=xc,t=dc(null,r)):(mo(t),t.child=e.child,t.flags|=128,t=null);else if(uo(t),of(c)){if(s=c.nextSibling&&c.nextSibling.dataset,s)var u=s.dgst;s=u,r=Error(i(419)),r.stack=``,r.digest=s,Xi({value:r,source:null,stack:null}),t=Dc(e,t,n)}else if(V||ia(e,t,n,!1),s=(n&e.childLanes)!==0,V||s){if(s=K,s!==null&&(r=ut(s,n),r!==0&&r!==l.retryLane))throw l.retryLane=r,ui(e,r),hu(s,e,r),ac;af(c)||Du(),t=Dc(e,t,n)}else af(c)?(t.flags|=192,t.child=e.child,t=null):(e=l.treeContext,M=cf(c.nextSibling),Bi=t,N=!0,Vi=null,Hi=!1,e!==null&&zi(t,e),t=Tc(t,r.children),t.flags|=4096);return t}return a?(mo(t),c=r.fallback,a=t.mode,l=e.child,u=l.sibling,r=_i(l,{mode:`hidden`,children:r.children}),r.subtreeFlags=l.subtreeFlags&65011712,u===null?(c=bi(c,a,n,null),c.flags|=2):c=_i(u,c),c.return=t,r.return=t,r.sibling=c,t.child=r,dc(null,r),r=t.child,c=e.child.memoizedState,c===null?c=Sc(n):(a=c.cachePool,a===null?a=Ea():(l=P._currentValue,a=a.parent===l?a:{parent:l,pool:l}),c={baseLanes:c.baseLanes|n,cachePool:a}),r.memoizedState=c,r.childLanes=Cc(e,s,n),t.memoizedState=xc,dc(e.child,r)):(uo(t),n=e.child,e=n.sibling,n=_i(n,{mode:`visible`,children:r.children}),n.return=t,n.sibling=null,e!==null&&(s=t.deletions,s===null?(t.deletions=[e],t.flags|=16):s.push(e)),t.child=n,t.memoizedState=null,n)}function Tc(e,t){return t=Ec({mode:`visible`,children:t},e.mode),t.return=e,e.child=t}function Ec(e,t){return e=hi(22,e,null,t),e.lanes=0,e}function Dc(e,t,n){return Ua(t,e.child,null,n),e=Tc(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function Oc(e,t,n){e.lanes|=t;var r=e.alternate;r!==null&&(r.lanes|=t),na(e.return,t,n)}function kc(e,t,n,r,i,a){var o=e.memoizedState;o===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:r,tail:n,tailMode:i,treeForkCount:a}:(o.isBackwards=t,o.rendering=null,o.renderingStartTime=0,o.last=r,o.tail=n,o.tailMode=i,o.treeForkCount=a)}function Ac(e,t,n){var r=t.pendingProps,i=r.revealOrder,a=r.tail;r=r.children;var o=F.current,s=!!(o&2);if(s?(o=o&1|2,t.flags|=128):o&=1,E(F,o),oc(e,t,r,n),r=N?ki:0,!s&&e!==null&&e.flags&128)a:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&Oc(e,n,t);else if(e.tag===19)Oc(e,n,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break a;for(;e.sibling===null;){if(e.return===null||e.return===t)break a;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(i){case`forwards`:for(n=t.child,i=null;n!==null;)e=n.alternate,e!==null&&go(e)===null&&(i=n),n=n.sibling;n=i,n===null?(i=t.child,t.child=null):(i=n.sibling,n.sibling=null),kc(t,!1,i,n,a,r);break;case`backwards`:case`unstable_legacy-backwards`:for(n=null,i=t.child,t.child=null;i!==null;){if(e=i.alternate,e!==null&&go(e)===null){t.child=i;break}e=i.sibling,i.sibling=n,n=i,i=e}kc(t,!0,n,null,a,r);break;case`together`:kc(t,!1,null,null,void 0,r);break;default:t.memoizedState=null}return t.child}function jc(e,t,n){if(e!==null&&(t.dependencies=e.dependencies),Gl|=t.lanes,(n&t.childLanes)===0){if(e!==null){if(ia(e,t,n,!1),(n&t.childLanes)===0)return null}else return null}if(e!==null&&t.child!==e.child)throw Error(i(153));if(t.child!==null){for(e=t.child,n=_i(e,e.pendingProps),t.child=n,n.return=t;e.sibling!==null;)e=e.sibling,n=n.sibling=_i(e,e.pendingProps),n.return=t;n.sibling=null}return t.child}function Mc(e,t){return(e.lanes&t)!==0||(e=e.dependencies,!!(e!==null&&aa(e)))}function Nc(e,t,n){switch(t.tag){case 3:ye(t,t.stateNode.containerInfo),ea(t,P,e.memoizedState.cache),Ji();break;case 27:case 5:xe(t);break;case 4:ye(t,t.stateNode.containerInfo);break;case 10:ea(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,fo(t),null;break;case 13:var r=t.memoizedState;if(r!==null)return r.dehydrated===null?(n&t.child.childLanes)===0?(uo(t),e=jc(e,t,n),e===null?null:e.sibling):wc(e,t,n):(uo(t),t.flags|=128,null);uo(t);break;case 19:var i=!!(e.flags&128);if(r=(n&t.childLanes)!==0,r||=(ia(e,t,n,!1),(n&t.childLanes)!==0),i){if(r)return Ac(e,t,n);t.flags|=128}if(i=t.memoizedState,i!==null&&(i.rendering=null,i.tail=null,i.lastEffect=null),E(F,F.current),r)break;return null;case 22:return t.lanes=0,uc(e,t,n,t.pendingProps);case 24:ea(t,P,e.memoizedState.cache)}return jc(e,t,n)}function Pc(e,t,n){if(e!==null){if(e.memoizedProps!==t.pendingProps)V=!0;else{if(!Mc(e,n)&&!(t.flags&128))return V=!1,Nc(e,t,n);V=!!(e.flags&131072)}}else V=!1,N&&t.flags&1048576&&Ii(t,ki,t.index);switch(t.lanes=0,t.tag){case 16:a:{var r=t.pendingProps;if(e=Na(t.elementType),t.type=e,typeof e==`function`)gi(e)?(r=Ys(e,r),t.tag=1,t=yc(null,t,e,r,n)):(t.tag=0,t=_c(null,t,e,r,n));else{if(e!=null){var a=e.$$typeof;if(a===ee){t.tag=11,t=sc(null,t,e,r,n);break a}if(a===re){t.tag=14,t=cc(null,t,e,r,n);break a}}throw t=le(e)||e,Error(i(306,t,``))}}return t;case 0:return _c(e,t,t.type,t.pendingProps,n);case 1:return r=t.type,a=Ys(r,t.pendingProps),yc(e,t,r,a,n);case 3:a:{if(ye(t,t.stateNode.containerInfo),e===null)throw Error(i(387));r=t.pendingProps;var o=t.memoizedState;a=o.element,qa(e,t),eo(t,r,null,n);var s=t.memoizedState;if(r=s.cache,ea(t,P,r),r!==o.cache&&ra(t,[P],n,!0),$a(),r=s.element,o.isDehydrated){if(o={element:r,isDehydrated:!1,cache:s.cache},t.updateQueue.baseState=o,t.memoizedState=o,t.flags&256){t=bc(e,t,r,n);break a}if(r!==a){a=Ti(Error(i(424)),t),Xi(a),t=bc(e,t,r,n);break a}switch(e=t.stateNode.containerInfo,e.nodeType){case 9:e=e.body;break;default:e=e.nodeName===`HTML`?e.ownerDocument.body:e}for(M=cf(e.firstChild),Bi=t,N=!0,Vi=null,Hi=!0,n=Wa(t,null,r,n),t.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling}else{if(Ji(),r===a){t=jc(e,t,n);break a}oc(e,t,r,n)}t=t.child}return t;case 26:return gc(e,t),e===null?(n=kf(t.type,null,t.pendingProps,null))?t.memoizedState=n:N||(n=t.type,e=t.pendingProps,r=Bd(_e.current).createElement(n),r[k]=t,r[gt]=e,Pd(r,n,e),A(r),t.stateNode=r):t.memoizedState=kf(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return xe(t),e===null&&N&&(r=t.stateNode=ff(t.type,t.pendingProps,_e.current),Bi=t,Hi=!0,a=M,Zd(t.type)?(lf=a,M=cf(r.firstChild)):M=a),oc(e,t,t.pendingProps.children,n),gc(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&N&&((a=r=M)&&(r=tf(r,t.type,t.pendingProps,Hi),r===null?a=!1:(t.stateNode=r,Bi=t,M=cf(r.firstChild),Hi=!1,a=!0)),a||Wi(t)),xe(t),a=t.type,o=t.pendingProps,s=e===null?null:e.memoizedProps,r=o.children,Ud(a,o)?r=null:s!==null&&Ud(a,s)&&(t.flags|=32),t.memoizedState!==null&&(a=Eo(e,t,ko,null,null,n),Qf._currentValue=a),gc(e,t),oc(e,t,r,n),t.child;case 6:return e===null&&N&&((e=n=M)&&(n=nf(n,t.pendingProps,Hi),n===null?e=!1:(t.stateNode=n,Bi=t,M=null,e=!0)),e||Wi(t)),null;case 13:return wc(e,t,n);case 4:return ye(t,t.stateNode.containerInfo),r=t.pendingProps,e===null?t.child=Ua(t,null,r,n):oc(e,t,r,n),t.child;case 11:return sc(e,t,t.type,t.pendingProps,n);case 7:return oc(e,t,t.pendingProps,n),t.child;case 8:return oc(e,t,t.pendingProps.children,n),t.child;case 12:return oc(e,t,t.pendingProps.children,n),t.child;case 10:return r=t.pendingProps,ea(t,t.type,r.value),oc(e,t,r.children,n),t.child;case 9:return a=t.type._context,r=t.pendingProps.children,oa(t),a=sa(a),r=r(a),t.flags|=1,oc(e,t,r,n),t.child;case 14:return cc(e,t,t.type,t.pendingProps,n);case 15:return lc(e,t,t.type,t.pendingProps,n);case 19:return Ac(e,t,n);case 31:return hc(e,t,n);case 22:return uc(e,t,n,t.pendingProps);case 24:return oa(t),r=sa(P),e===null?(a=wa(),a===null&&(a=K,o=pa(),a.pooledCache=o,o.refCount++,o!==null&&(a.pooledCacheLanes|=n),a=o),t.memoizedState={parent:r,cache:a},Ka(t),ea(t,P,a)):((e.lanes&n)!==0&&(qa(e,t),eo(t,null,null,n),$a()),a=e.memoizedState,o=t.memoizedState,a.parent===r?(r=o.cache,ea(t,P,r),r!==a.cache&&ra(t,[P],n,!0)):(a={parent:r,cache:r},t.memoizedState=a,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=a),ea(t,P,r))),oc(e,t,t.pendingProps.children,n),t.child;case 29:throw t.pendingProps}throw Error(i(156,t.tag))}function Fc(e){e.flags|=4}function Ic(e,t,n,r,i){if((t=!!(e.mode&32))&&(t=!1),t){if(e.flags|=16777216,(i&335544128)===i){if(e.stateNode.complete)e.flags|=8192;else if(wu())e.flags|=8192;else throw Pa=Aa,Oa}}else e.flags&=-16777217}function Lc(e,t){if(t.type!==`stylesheet`||t.state.loading&4)e.flags&=-16777217;else if(e.flags|=16777216,!Wf(t)){if(wu())e.flags|=8192;else throw Pa=Aa,Oa}}function Rc(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag===22?536870912:it(),e.lanes|=t,Yl|=t)}function zc(e,t){if(!N)switch(e.tailMode){case`hidden`:t=e.tail;for(var n=null;t!==null;)t.alternate!==null&&(n=t),t=t.sibling;n===null?e.tail=null:n.sibling=null;break;case`collapsed`:n=e.tail;for(var r=null;n!==null;)n.alternate!==null&&(r=n),n=n.sibling;r===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:r.sibling=null}}function H(e){var t=e.alternate!==null&&e.alternate.child===e.child,n=0,r=0;if(t)for(var i=e.child;i!==null;)n|=i.lanes|i.childLanes,r|=i.subtreeFlags&65011712,r|=i.flags&65011712,i.return=e,i=i.sibling;else for(i=e.child;i!==null;)n|=i.lanes|i.childLanes,r|=i.subtreeFlags,r|=i.flags,i.return=e,i=i.sibling;return e.subtreeFlags|=r,e.childLanes=n,t}function Bc(e,t,n){var r=t.pendingProps;switch(Ri(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return H(t),null;case 1:return H(t),null;case 3:return n=t.stateNode,r=null,e!==null&&(r=e.memoizedState.cache),t.memoizedState.cache!==r&&(t.flags|=2048),ta(P),be(),n.pendingContext&&(n.context=n.pendingContext,n.pendingContext=null),(e===null||e.child===null)&&(qi(t)?Fc(t):e===null||e.memoizedState.isDehydrated&&!(t.flags&256)||(t.flags|=1024,Yi())),H(t),null;case 26:var a=t.type,o=t.memoizedState;return e===null?(Fc(t),o===null?(H(t),Ic(t,a,null,r,n)):(H(t),Lc(t,o))):o?o===e.memoizedState?(H(t),t.flags&=-16777217):(Fc(t),H(t),Lc(t,o)):(e=e.memoizedProps,e!==r&&Fc(t),H(t),Ic(t,a,e,r,n)),null;case 27:if(Se(t),n=_e.current,a=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==r&&Fc(t);else{if(!r){if(t.stateNode===null)throw Error(i(166));return H(t),null}e=he.current,qi(t)?Gi(t,e):(e=ff(a,r,n),t.stateNode=e,Fc(t))}return H(t),null;case 5:if(Se(t),a=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==r&&Fc(t);else{if(!r){if(t.stateNode===null)throw Error(i(166));return H(t),null}if(o=he.current,qi(t))Gi(t,o);else{var s=Bd(_e.current);switch(o){case 1:o=s.createElementNS(`http://www.w3.org/2000/svg`,a);break;case 2:o=s.createElementNS(`http://www.w3.org/1998/Math/MathML`,a);break;default:switch(a){case`svg`:o=s.createElementNS(`http://www.w3.org/2000/svg`,a);break;case`math`:o=s.createElementNS(`http://www.w3.org/1998/Math/MathML`,a);break;case`script`:o=s.createElement(`div`),o.innerHTML=`<script><\/script>`,o=o.removeChild(o.firstChild);break;case`select`:o=typeof r.is==`string`?s.createElement(`select`,{is:r.is}):s.createElement(`select`),r.multiple?o.multiple=!0:r.size&&(o.size=r.size);break;default:o=typeof r.is==`string`?s.createElement(a,{is:r.is}):s.createElement(a)}}o[k]=t,o[gt]=r;a:for(s=t.child;s!==null;){if(s.tag===5||s.tag===6)o.appendChild(s.stateNode);else if(s.tag!==4&&s.tag!==27&&s.child!==null){s.child.return=s,s=s.child;continue}if(s===t)break a;for(;s.sibling===null;){if(s.return===null||s.return===t)break a;s=s.return}s.sibling.return=s.return,s=s.sibling}t.stateNode=o;a:switch(Pd(o,a,r),a){case`button`:case`input`:case`select`:case`textarea`:r=!!r.autoFocus;break a;case`img`:r=!0;break a;default:r=!1}r&&Fc(t)}}return H(t),Ic(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,n),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==r&&Fc(t);else{if(typeof r!=`string`&&t.stateNode===null)throw Error(i(166));if(e=_e.current,qi(t)){if(e=t.stateNode,n=t.memoizedProps,r=null,a=Bi,a!==null)switch(a.tag){case 27:case 5:r=a.memoizedProps}e[k]=t,e=!!(e.nodeValue===n||r!==null&&!0===r.suppressHydrationWarning||Md(e.nodeValue,n)),e||Wi(t,!0)}else e=Bd(e).createTextNode(r),e[k]=t,t.stateNode=e}return H(t),null;case 31:if(n=t.memoizedState,e===null||e.memoizedState!==null){if(r=qi(t),n!==null){if(e===null){if(!r)throw Error(i(318));if(e=t.memoizedState,e=e===null?null:e.dehydrated,!e)throw Error(i(557));e[k]=t}else Ji(),!(t.flags&128)&&(t.memoizedState=null),t.flags|=4;H(t),e=!1}else n=Yi(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=n),e=!0;if(!e)return t.flags&256?(ho(t),t):(ho(t),null);if(t.flags&128)throw Error(i(558))}return H(t),null;case 13:if(r=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(a=qi(t),r!==null&&r.dehydrated!==null){if(e===null){if(!a)throw Error(i(318));if(a=t.memoizedState,a=a===null?null:a.dehydrated,!a)throw Error(i(317));a[k]=t}else Ji(),!(t.flags&128)&&(t.memoizedState=null),t.flags|=4;H(t),a=!1}else a=Yi(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=a),a=!0;if(!a)return t.flags&256?(ho(t),t):(ho(t),null)}return ho(t),t.flags&128?(t.lanes=n,t):(n=r!==null,e=e!==null&&e.memoizedState!==null,n&&(r=t.child,a=null,r.alternate!==null&&r.alternate.memoizedState!==null&&r.alternate.memoizedState.cachePool!==null&&(a=r.alternate.memoizedState.cachePool.pool),o=null,r.memoizedState!==null&&r.memoizedState.cachePool!==null&&(o=r.memoizedState.cachePool.pool),o!==a&&(r.flags|=2048)),n!==e&&n&&(t.child.flags|=8192),Rc(t,t.updateQueue),H(t),null);case 4:return be(),e===null&&Sd(t.stateNode.containerInfo),H(t),null;case 10:return ta(t.type),H(t),null;case 19:if(T(F),r=t.memoizedState,r===null)return H(t),null;if(a=!!(t.flags&128),o=r.rendering,o===null){if(a)zc(r,!1);else{if(X!==0||e!==null&&e.flags&128)for(e=t.child;e!==null;){if(o=go(e),o!==null){for(t.flags|=128,zc(r,!1),e=o.updateQueue,t.updateQueue=e,Rc(t,e),t.subtreeFlags=0,e=n,n=t.child;n!==null;)vi(n,e),n=n.sibling;return E(F,F.current&1|2),N&&Fi(t,r.treeForkCount),t.child}e=e.sibling}r.tail!==null&&Ie()>tu&&(t.flags|=128,a=!0,zc(r,!1),t.lanes=4194304)}}else{if(!a){if(e=go(o),e!==null){if(t.flags|=128,a=!0,e=e.updateQueue,t.updateQueue=e,Rc(t,e),zc(r,!0),r.tail===null&&r.tailMode===`hidden`&&!o.alternate&&!N)return H(t),null}else 2*Ie()-r.renderingStartTime>tu&&n!==536870912&&(t.flags|=128,a=!0,zc(r,!1),t.lanes=4194304)}r.isBackwards?(o.sibling=t.child,t.child=o):(e=r.last,e===null?t.child=o:e.sibling=o,r.last=o)}return r.tail===null?(H(t),null):(e=r.tail,r.rendering=e,r.tail=e.sibling,r.renderingStartTime=Ie(),e.sibling=null,n=F.current,E(F,a?n&1|2:n&1),N&&Fi(t,r.treeForkCount),e);case 22:case 23:return ho(t),so(),r=t.memoizedState!==null,e===null?r&&(t.flags|=8192):e.memoizedState!==null!==r&&(t.flags|=8192),r?n&536870912&&!(t.flags&128)&&(H(t),t.subtreeFlags&6&&(t.flags|=8192)):H(t),n=t.updateQueue,n!==null&&Rc(t,n.retryQueue),n=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),r=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(r=t.memoizedState.cachePool.pool),r!==n&&(t.flags|=2048),e!==null&&T(Ca),null;case 24:return n=null,e!==null&&(n=e.memoizedState.cache),t.memoizedState.cache!==n&&(t.flags|=2048),ta(P),H(t),null;case 25:return null;case 30:return null}throw Error(i(156,t.tag))}function Vc(e,t){switch(Ri(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return ta(P),be(),e=t.flags,e&65536&&!(e&128)?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return Se(t),null;case 31:if(t.memoizedState!==null){if(ho(t),t.alternate===null)throw Error(i(340));Ji()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(ho(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(i(340));Ji()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return T(F),null;case 4:return be(),null;case 10:return ta(t.type),null;case 22:case 23:return ho(t),so(),e!==null&&T(Ca),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return ta(P),null;case 25:return null;default:return null}}function Hc(e,t){switch(Ri(t),t.tag){case 3:ta(P),be();break;case 26:case 27:case 5:Se(t);break;case 4:be();break;case 31:t.memoizedState!==null&&ho(t);break;case 13:ho(t);break;case 19:T(F);break;case 10:ta(t.type);break;case 22:case 23:ho(t),so(),e!==null&&T(Ca);break;case 24:ta(P)}}function Uc(e,t){try{var n=t.updateQueue,r=n===null?null:n.lastEffect;if(r!==null){var i=r.next;n=i;do{if((n.tag&e)===e){r=void 0;var a=n.create,o=n.inst;r=a(),o.destroy=r}n=n.next}while(n!==i)}}catch(e){Z(t,t.return,e)}}function Wc(e,t,n){try{var r=t.updateQueue,i=r===null?null:r.lastEffect;if(i!==null){var a=i.next;r=a;do{if((r.tag&e)===e){var o=r.inst,s=o.destroy;if(s!==void 0){o.destroy=void 0,i=t;var c=n,l=s;try{l()}catch(e){Z(i,c,e)}}}r=r.next}while(r!==a)}}catch(e){Z(t,t.return,e)}}function Gc(e){var t=e.updateQueue;if(t!==null){var n=e.stateNode;try{no(t,n)}catch(t){Z(e,e.return,t)}}}function Kc(e,t,n){n.props=Ys(e.type,e.memoizedProps),n.state=e.memoizedState;try{n.componentWillUnmount()}catch(n){Z(e,t,n)}}function qc(e,t){try{var n=e.ref;if(n!==null){switch(e.tag){case 26:case 27:case 5:var r=e.stateNode;break;case 30:r=e.stateNode;break;default:r=e.stateNode}typeof n==`function`?e.refCleanup=n(r):n.current=r}}catch(n){Z(e,t,n)}}function Jc(e,t){var n=e.ref,r=e.refCleanup;if(n!==null){if(typeof r==`function`)try{r()}catch(n){Z(e,t,n)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof n==`function`)try{n(null)}catch(n){Z(e,t,n)}else n.current=null}}function Yc(e){var t=e.type,n=e.memoizedProps,r=e.stateNode;try{a:switch(t){case`button`:case`input`:case`select`:case`textarea`:n.autoFocus&&r.focus();break a;case`img`:n.src?r.src=n.src:n.srcSet&&(r.srcset=n.srcSet)}}catch(t){Z(e,e.return,t)}}function Xc(e,t,n){try{var r=e.stateNode;Fd(r,e.type,n,t),r[gt]=t}catch(t){Z(e,e.return,t)}}function Zc(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&Zd(e.type)||e.tag===4}function Qc(e){a:for(;;){for(;e.sibling===null;){if(e.return===null||Zc(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&Zd(e.type)||e.flags&2||e.child===null||e.tag===4)continue a;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function $c(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?(n.nodeType===9?n.body:n.nodeName===`HTML`?n.ownerDocument.body:n).insertBefore(e,t):(t=n.nodeType===9?n.body:n.nodeName===`HTML`?n.ownerDocument.body:n,t.appendChild(e),n=n._reactRootContainer,n!=null||t.onclick!==null||(t.onclick=cn));else if(r!==4&&(r===27&&Zd(e.type)&&(n=e.stateNode,t=null),e=e.child,e!==null))for($c(e,t,n),e=e.sibling;e!==null;)$c(e,t,n),e=e.sibling}function el(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?n.insertBefore(e,t):n.appendChild(e);else if(r!==4&&(r===27&&Zd(e.type)&&(n=e.stateNode),e=e.child,e!==null))for(el(e,t,n),e=e.sibling;e!==null;)el(e,t,n),e=e.sibling}function tl(e){var t=e.stateNode,n=e.memoizedProps;try{for(var r=e.type,i=t.attributes;i.length;)t.removeAttributeNode(i[0]);Pd(t,r,n),t[k]=e,t[gt]=n}catch(t){Z(e,e.return,t)}}var nl=!1,U=!1,rl=!1,il=typeof WeakSet==`function`?WeakSet:Set,al=null;function ol(e,t){if(e=e.containerInfo,Rd=sp,e=Pr(e),Fr(e)){if(`selectionStart`in e)var n={start:e.selectionStart,end:e.selectionEnd};else a:{n=(n=e.ownerDocument)&&n.defaultView||window;var r=n.getSelection&&n.getSelection();if(r&&r.rangeCount!==0){n=r.anchorNode;var a=r.anchorOffset,o=r.focusNode;r=r.focusOffset;try{n.nodeType,o.nodeType}catch{n=null;break a}var s=0,c=-1,l=-1,u=0,d=0,f=e,p=null;b:for(;;){for(var m;f!==n||a!==0&&f.nodeType!==3||(c=s+a),f!==o||r!==0&&f.nodeType!==3||(l=s+r),f.nodeType===3&&(s+=f.nodeValue.length),(m=f.firstChild)!==null;)p=f,f=m;for(;;){if(f===e)break b;if(p===n&&++u===a&&(c=s),p===o&&++d===r&&(l=s),(m=f.nextSibling)!==null)break;f=p,p=f.parentNode}f=m}n=c===-1||l===-1?null:{start:c,end:l}}else n=null}n||={start:0,end:0}}else n=null;for(zd={focusedElem:e,selectionRange:n},sp=!1,al=t;al!==null;)if(t=al,e=t.child,t.subtreeFlags&1028&&e!==null)e.return=t,al=e;else for(;al!==null;){switch(t=al,o=t.alternate,e=t.flags,t.tag){case 0:if(e&4&&(e=t.updateQueue,e=e===null?null:e.events,e!==null))for(n=0;n<e.length;n++)a=e[n],a.ref.impl=a.nextImpl;break;case 11:case 15:break;case 1:if(e&1024&&o!==null){e=void 0,n=t,a=o.memoizedProps,o=o.memoizedState,r=n.stateNode;try{var h=Ys(n.type,a);e=r.getSnapshotBeforeUpdate(h,o),r.__reactInternalSnapshotBeforeUpdate=e}catch(e){Z(n,n.return,e)}}break;case 3:if(e&1024){if(e=t.stateNode.containerInfo,n=e.nodeType,n===9)ef(e);else if(n===1)switch(e.nodeName){case`HEAD`:case`HTML`:case`BODY`:ef(e);break;default:e.textContent=``}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if(e&1024)throw Error(i(163))}if(e=t.sibling,e!==null){e.return=t.return,al=e;break}al=t.return}}function sl(e,t,n){var r=n.flags;switch(n.tag){case 0:case 11:case 15:xl(e,n),r&4&&Uc(5,n);break;case 1:if(xl(e,n),r&4){if(e=n.stateNode,t===null)try{e.componentDidMount()}catch(e){Z(n,n.return,e)}else{var i=Ys(n.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(i,t,e.__reactInternalSnapshotBeforeUpdate)}catch(e){Z(n,n.return,e)}}}r&64&&Gc(n),r&512&&qc(n,n.return);break;case 3:if(xl(e,n),r&64&&(e=n.updateQueue,e!==null)){if(t=null,n.child!==null)switch(n.child.tag){case 27:case 5:t=n.child.stateNode;break;case 1:t=n.child.stateNode}try{no(e,t)}catch(e){Z(n,n.return,e)}}break;case 27:t===null&&r&4&&tl(n);case 26:case 5:xl(e,n),t===null&&r&4&&Yc(n),r&512&&qc(n,n.return);break;case 12:xl(e,n);break;case 31:xl(e,n),r&4&&fl(e,n);break;case 13:xl(e,n),r&4&&pl(e,n),r&64&&(e=n.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(n=Ju.bind(null,n),sf(e,n))));break;case 22:if(r=n.memoizedState!==null||nl,!r){t=t!==null&&t.memoizedState!==null||U,i=nl;var a=U;nl=r,(U=t)&&!a?Cl(e,n,!!(n.subtreeFlags&8772)):xl(e,n),nl=i,U=a}break;case 30:break;default:xl(e,n)}}function cl(e){var t=e.alternate;t!==null&&(e.alternate=null,cl(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&Ct(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var W=null,ll=!1;function ul(e,t,n){for(n=n.child;n!==null;)dl(e,t,n),n=n.sibling}function dl(e,t,n){if(Ge&&typeof Ge.onCommitFiberUnmount==`function`)try{Ge.onCommitFiberUnmount(We,n)}catch{}switch(n.tag){case 26:U||Jc(n,t),ul(e,t,n),n.memoizedState?n.memoizedState.count--:n.stateNode&&(n=n.stateNode,n.parentNode.removeChild(n));break;case 27:U||Jc(n,t);var r=W,i=ll;Zd(n.type)&&(W=n.stateNode,ll=!1),ul(e,t,n),pf(n.stateNode),W=r,ll=i;break;case 5:U||Jc(n,t);case 6:if(r=W,i=ll,W=null,ul(e,t,n),W=r,ll=i,W!==null){if(ll)try{(W.nodeType===9?W.body:W.nodeName===`HTML`?W.ownerDocument.body:W).removeChild(n.stateNode)}catch(e){Z(n,t,e)}else try{W.removeChild(n.stateNode)}catch(e){Z(n,t,e)}}break;case 18:W!==null&&(ll?(e=W,Qd(e.nodeType===9?e.body:e.nodeName===`HTML`?e.ownerDocument.body:e,n.stateNode),Np(e)):Qd(W,n.stateNode));break;case 4:r=W,i=ll,W=n.stateNode.containerInfo,ll=!0,ul(e,t,n),W=r,ll=i;break;case 0:case 11:case 14:case 15:Wc(2,n,t),U||Wc(4,n,t),ul(e,t,n);break;case 1:U||(Jc(n,t),r=n.stateNode,typeof r.componentWillUnmount==`function`&&Kc(n,t,r)),ul(e,t,n);break;case 21:ul(e,t,n);break;case 22:U=(r=U)||n.memoizedState!==null,ul(e,t,n),U=r;break;default:ul(e,t,n)}}function fl(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{Np(e)}catch(e){Z(t,t.return,e)}}}function pl(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{Np(e)}catch(e){Z(t,t.return,e)}}function ml(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new il),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new il),t;default:throw Error(i(435,e.tag))}}function hl(e,t){var n=ml(e);t.forEach(function(t){if(!n.has(t)){n.add(t);var r=Yu.bind(null,e,t);t.then(r,r)}})}function gl(e,t){var n=t.deletions;if(n!==null)for(var r=0;r<n.length;r++){var a=n[r],o=e,s=t,c=s;a:for(;c!==null;){switch(c.tag){case 27:if(Zd(c.type)){W=c.stateNode,ll=!1;break a}break;case 5:W=c.stateNode,ll=!1;break a;case 3:case 4:W=c.stateNode.containerInfo,ll=!0;break a}c=c.return}if(W===null)throw Error(i(160));dl(o,s,a),W=null,ll=!1,o=a.alternate,o!==null&&(o.return=null),a.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)vl(t,e),t=t.sibling}var _l=null;function vl(e,t){var n=e.alternate,r=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:gl(t,e),yl(e),r&4&&(Wc(3,e,e.return),Uc(3,e),Wc(5,e,e.return));break;case 1:gl(t,e),yl(e),r&512&&(U||n===null||Jc(n,n.return)),r&64&&nl&&(e=e.updateQueue,e!==null&&(r=e.callbacks,r!==null&&(n=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=n===null?r:n.concat(r))));break;case 26:var a=_l;if(gl(t,e),yl(e),r&512&&(U||n===null||Jc(n,n.return)),r&4){var o=n===null?null:n.memoizedState;if(r=e.memoizedState,n===null){if(r===null){if(e.stateNode===null){a:{r=e.type,n=e.memoizedProps,a=a.ownerDocument||a;b:switch(r){case`title`:o=a.getElementsByTagName(`title`)[0],(!o||o[St]||o[k]||o.namespaceURI===`http://www.w3.org/2000/svg`||o.hasAttribute(`itemprop`))&&(o=a.createElement(r),a.head.insertBefore(o,a.querySelector(`head > title`))),Pd(o,r,n),o[k]=e,A(o),r=o;break a;case`link`:var s=Vf(`link`,`href`,a).get(r+(n.href||``));if(s){for(var c=0;c<s.length;c++)if(o=s[c],o.getAttribute(`href`)===(n.href==null||n.href===``?null:n.href)&&o.getAttribute(`rel`)===(n.rel==null?null:n.rel)&&o.getAttribute(`title`)===(n.title==null?null:n.title)&&o.getAttribute(`crossorigin`)===(n.crossOrigin==null?null:n.crossOrigin)){s.splice(c,1);break b}}o=a.createElement(r),Pd(o,r,n),a.head.appendChild(o);break;case`meta`:if(s=Vf(`meta`,`content`,a).get(r+(n.content||``))){for(c=0;c<s.length;c++)if(o=s[c],o.getAttribute(`content`)===(n.content==null?null:``+n.content)&&o.getAttribute(`name`)===(n.name==null?null:n.name)&&o.getAttribute(`property`)===(n.property==null?null:n.property)&&o.getAttribute(`http-equiv`)===(n.httpEquiv==null?null:n.httpEquiv)&&o.getAttribute(`charset`)===(n.charSet==null?null:n.charSet)){s.splice(c,1);break b}}o=a.createElement(r),Pd(o,r,n),a.head.appendChild(o);break;default:throw Error(i(468,r))}o[k]=e,A(o),r=o}e.stateNode=r}else Hf(a,e.type,e.stateNode)}else e.stateNode=If(a,r,e.memoizedProps)}else o===r?r===null&&e.stateNode!==null&&Xc(e,e.memoizedProps,n.memoizedProps):(o===null?n.stateNode!==null&&(n=n.stateNode,n.parentNode.removeChild(n)):o.count--,r===null?Hf(a,e.type,e.stateNode):If(a,r,e.memoizedProps))}break;case 27:gl(t,e),yl(e),r&512&&(U||n===null||Jc(n,n.return)),n!==null&&r&4&&Xc(e,e.memoizedProps,n.memoizedProps);break;case 5:if(gl(t,e),yl(e),r&512&&(U||n===null||Jc(n,n.return)),e.flags&32){a=e.stateNode;try{$t(a,``)}catch(t){Z(e,e.return,t)}}r&4&&e.stateNode!=null&&(a=e.memoizedProps,Xc(e,a,n===null?a:n.memoizedProps)),r&1024&&(rl=!0);break;case 6:if(gl(t,e),yl(e),r&4){if(e.stateNode===null)throw Error(i(162));r=e.memoizedProps,n=e.stateNode;try{n.nodeValue=r}catch(t){Z(e,e.return,t)}}break;case 3:if(Bf=null,a=_l,_l=gf(t.containerInfo),gl(t,e),_l=a,yl(e),r&4&&n!==null&&n.memoizedState.isDehydrated)try{Np(t.containerInfo)}catch(t){Z(e,e.return,t)}rl&&(rl=!1,bl(e));break;case 4:r=_l,_l=gf(e.stateNode.containerInfo),gl(t,e),yl(e),_l=r;break;case 12:gl(t,e),yl(e);break;case 31:gl(t,e),yl(e),r&4&&(r=e.updateQueue,r!==null&&(e.updateQueue=null,hl(e,r)));break;case 13:gl(t,e),yl(e),e.child.flags&8192&&e.memoizedState!==null!=(n!==null&&n.memoizedState!==null)&&($l=Ie()),r&4&&(r=e.updateQueue,r!==null&&(e.updateQueue=null,hl(e,r)));break;case 22:a=e.memoizedState!==null;var l=n!==null&&n.memoizedState!==null,u=nl,d=U;if(nl=u||a,U=d||l,gl(t,e),U=d,nl=u,yl(e),r&8192)a:for(t=e.stateNode,t._visibility=a?t._visibility&-2:t._visibility|1,a&&(n===null||l||nl||U||Sl(e)),n=null,t=e;;){if(t.tag===5||t.tag===26){if(n===null){l=n=t;try{if(o=l.stateNode,a)s=o.style,typeof s.setProperty==`function`?s.setProperty(`display`,`none`,`important`):s.display=`none`;else{c=l.stateNode;var f=l.memoizedProps.style,p=f!=null&&f.hasOwnProperty(`display`)?f.display:null;c.style.display=p==null||typeof p==`boolean`?``:(``+p).trim()}}catch(e){Z(l,l.return,e)}}}else if(t.tag===6){if(n===null){l=t;try{l.stateNode.nodeValue=a?``:l.memoizedProps}catch(e){Z(l,l.return,e)}}}else if(t.tag===18){if(n===null){l=t;try{var m=l.stateNode;a?$d(m,!0):$d(l.stateNode,!1)}catch(e){Z(l,l.return,e)}}}else if((t.tag!==22&&t.tag!==23||t.memoizedState===null||t===e)&&t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break a;for(;t.sibling===null;){if(t.return===null||t.return===e)break a;n===t&&(n=null),t=t.return}n===t&&(n=null),t.sibling.return=t.return,t=t.sibling}r&4&&(r=e.updateQueue,r!==null&&(n=r.retryQueue,n!==null&&(r.retryQueue=null,hl(e,n))));break;case 19:gl(t,e),yl(e),r&4&&(r=e.updateQueue,r!==null&&(e.updateQueue=null,hl(e,r)));break;case 30:break;case 21:break;default:gl(t,e),yl(e)}}function yl(e){var t=e.flags;if(t&2){try{for(var n,r=e.return;r!==null;){if(Zc(r)){n=r;break}r=r.return}if(n==null)throw Error(i(160));switch(n.tag){case 27:var a=n.stateNode;el(e,Qc(e),a);break;case 5:var o=n.stateNode;n.flags&32&&($t(o,``),n.flags&=-33),el(e,Qc(e),o);break;case 3:case 4:var s=n.stateNode.containerInfo;$c(e,Qc(e),s);break;default:throw Error(i(161))}}catch(t){Z(e,e.return,t)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function bl(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;bl(t),t.tag===5&&t.flags&1024&&t.stateNode.reset(),e=e.sibling}}function xl(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)sl(e,t.alternate,t),t=t.sibling}function Sl(e){for(e=e.child;e!==null;){var t=e;switch(t.tag){case 0:case 11:case 14:case 15:Wc(4,t,t.return),Sl(t);break;case 1:Jc(t,t.return);var n=t.stateNode;typeof n.componentWillUnmount==`function`&&Kc(t,t.return,n),Sl(t);break;case 27:pf(t.stateNode);case 26:case 5:Jc(t,t.return),Sl(t);break;case 22:t.memoizedState===null&&Sl(t);break;case 30:Sl(t);break;default:Sl(t)}e=e.sibling}}function Cl(e,t,n){for(n&&=!!(t.subtreeFlags&8772),t=t.child;t!==null;){var r=t.alternate,i=e,a=t,o=a.flags;switch(a.tag){case 0:case 11:case 15:Cl(i,a,n),Uc(4,a);break;case 1:if(Cl(i,a,n),r=a,i=r.stateNode,typeof i.componentDidMount==`function`)try{i.componentDidMount()}catch(e){Z(r,r.return,e)}if(r=a,i=r.updateQueue,i!==null){var s=r.stateNode;try{var c=i.shared.hiddenCallbacks;if(c!==null)for(i.shared.hiddenCallbacks=null,i=0;i<c.length;i++)to(c[i],s)}catch(e){Z(r,r.return,e)}}n&&o&64&&Gc(a),qc(a,a.return);break;case 27:tl(a);case 26:case 5:Cl(i,a,n),n&&r===null&&o&4&&Yc(a),qc(a,a.return);break;case 12:Cl(i,a,n);break;case 31:Cl(i,a,n),n&&o&4&&fl(i,a);break;case 13:Cl(i,a,n),n&&o&4&&pl(i,a);break;case 22:a.memoizedState===null&&Cl(i,a,n),qc(a,a.return);break;case 30:break;default:Cl(i,a,n)}t=t.sibling}}function wl(e,t){var n=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==n&&(e!=null&&e.refCount++,n!=null&&ma(n))}function Tl(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&ma(e))}function El(e,t,n,r){if(t.subtreeFlags&10256)for(t=t.child;t!==null;)Dl(e,t,n,r),t=t.sibling}function Dl(e,t,n,r){var i=t.flags;switch(t.tag){case 0:case 11:case 15:El(e,t,n,r),i&2048&&Uc(9,t);break;case 1:El(e,t,n,r);break;case 3:El(e,t,n,r),i&2048&&(e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&ma(e)));break;case 12:if(i&2048){El(e,t,n,r),e=t.stateNode;try{var a=t.memoizedProps,o=a.id,s=a.onPostCommit;typeof s==`function`&&s(o,t.alternate===null?`mount`:`update`,e.passiveEffectDuration,-0)}catch(e){Z(t,t.return,e)}}else El(e,t,n,r);break;case 31:El(e,t,n,r);break;case 13:El(e,t,n,r);break;case 23:break;case 22:a=t.stateNode,o=t.alternate,t.memoizedState===null?a._visibility&2?El(e,t,n,r):(a._visibility|=2,Ol(e,t,n,r,!!(t.subtreeFlags&10256)||!1)):a._visibility&2?El(e,t,n,r):kl(e,t),i&2048&&wl(o,t);break;case 24:El(e,t,n,r),i&2048&&Tl(t.alternate,t);break;default:El(e,t,n,r)}}function Ol(e,t,n,r,i){for(i&&=!!(t.subtreeFlags&10256)||!1,t=t.child;t!==null;){var a=e,o=t,s=n,c=r,l=o.flags;switch(o.tag){case 0:case 11:case 15:Ol(a,o,s,c,i),Uc(8,o);break;case 23:break;case 22:var u=o.stateNode;o.memoizedState===null?(u._visibility|=2,Ol(a,o,s,c,i)):u._visibility&2?Ol(a,o,s,c,i):kl(a,o),i&&l&2048&&wl(o.alternate,o);break;case 24:Ol(a,o,s,c,i),i&&l&2048&&Tl(o.alternate,o);break;default:Ol(a,o,s,c,i)}t=t.sibling}}function kl(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var n=e,r=t,i=r.flags;switch(r.tag){case 22:kl(n,r),i&2048&&wl(r.alternate,r);break;case 24:kl(n,r),i&2048&&Tl(r.alternate,r);break;default:kl(n,r)}t=t.sibling}}var Al=8192;function jl(e,t,n){if(e.subtreeFlags&Al)for(e=e.child;e!==null;)Ml(e,t,n),e=e.sibling}function Ml(e,t,n){switch(e.tag){case 26:jl(e,t,n),e.flags&Al&&e.memoizedState!==null&&Gf(n,_l,e.memoizedState,e.memoizedProps);break;case 5:jl(e,t,n);break;case 3:case 4:var r=_l;_l=gf(e.stateNode.containerInfo),jl(e,t,n),_l=r;break;case 22:e.memoizedState===null&&(r=e.alternate,r!==null&&r.memoizedState!==null?(r=Al,Al=16777216,jl(e,t,n),Al=r):jl(e,t,n));break;default:jl(e,t,n)}}function Nl(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function Pl(e){var t=e.deletions;if(e.flags&16){if(t!==null)for(var n=0;n<t.length;n++){var r=t[n];al=r,Ll(r,e)}Nl(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)Fl(e),e=e.sibling}function Fl(e){switch(e.tag){case 0:case 11:case 15:Pl(e),e.flags&2048&&Wc(9,e,e.return);break;case 3:Pl(e);break;case 12:Pl(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,Il(e)):Pl(e);break;default:Pl(e)}}function Il(e){var t=e.deletions;if(e.flags&16){if(t!==null)for(var n=0;n<t.length;n++){var r=t[n];al=r,Ll(r,e)}Nl(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:Wc(8,t,t.return),Il(t);break;case 22:n=t.stateNode,n._visibility&2&&(n._visibility&=-3,Il(t));break;default:Il(t)}e=e.sibling}}function Ll(e,t){for(;al!==null;){var n=al;switch(n.tag){case 0:case 11:case 15:Wc(8,n,t);break;case 23:case 22:if(n.memoizedState!==null&&n.memoizedState.cachePool!==null){var r=n.memoizedState.cachePool.pool;r!=null&&r.refCount++}break;case 24:ma(n.memoizedState.cache)}if(r=n.child,r!==null)r.return=n,al=r;else a:for(n=e;al!==null;){r=al;var i=r.sibling,a=r.return;if(cl(r),r===n){al=null;break a}if(i!==null){i.return=a,al=i;break a}al=a}}}var Rl={getCacheForType:function(e){var t=sa(P),n=t.data.get(e);return n===void 0&&(n=e(),t.data.set(e,n)),n},cacheSignal:function(){return sa(P).controller.signal}},zl=typeof WeakMap==`function`?WeakMap:Map,G=0,K=null,q=null,J=0,Y=0,Bl=null,Vl=!1,Hl=!1,Ul=!1,Wl=0,X=0,Gl=0,Kl=0,ql=0,Jl=0,Yl=0,Xl=null,Zl=null,Ql=!1,$l=0,eu=0,tu=1/0,nu=null,ru=null,iu=0,au=null,ou=null,su=0,cu=0,lu=null,uu=null,du=0,fu=null;function pu(){return G&2&&J!==0?J&-J:C.T===null?pt():dd()}function mu(){if(Jl===0){if(!(J&536870912)||N){var e=Qe;Qe<<=1,!(Qe&3932160)&&(Qe=262144),Jl=e}else Jl=536870912}return e=co.current,e!==null&&(e.flags|=32),Jl}function hu(e,t,n){(e===K&&(Y===2||Y===9)||e.cancelPendingCommit!==null)&&(Su(e,0),yu(e,J,Jl,!1)),ot(e,n),(!(G&2)||e!==K)&&(e===K&&(!(G&2)&&(Kl|=n),X===4&&yu(e,J,Jl,!1)),rd(e))}function gu(e,t,n){if(G&6)throw Error(i(327));var r=!n&&!(t&127)&&(t&e.expiredLanes)===0||nt(e,t),a=r?Au(e,t):Ou(e,t,!0),o=r;do{if(a===0){Hl&&!r&&yu(e,t,0,!1);break}if(n=e.current.alternate,o&&!vu(n)){a=Ou(e,t,!1),o=!1;continue}if(a===2){if(o=t,e.errorRecoveryDisabledLanes&o)var s=0;else s=e.pendingLanes&-536870913,s=s===0?s&536870912?536870912:0:s;if(s!==0){t=s;a:{var c=e;a=Xl;var l=c.current.memoizedState.isDehydrated;if(l&&(Su(c,s).flags|=256),s=Ou(c,s,!1),s!==2){if(Ul&&!l){c.errorRecoveryDisabledLanes|=o,Kl|=o,a=4;break a}o=Zl,Zl=a,o!==null&&(Zl===null?Zl=o:Zl.push.apply(Zl,o))}a=s}if(o=!1,a!==2)continue}}if(a===1){Su(e,0),yu(e,t,0,!0);break}a:{switch(r=e,o=a,o){case 0:case 1:throw Error(i(345));case 4:if((t&4194048)!==t)break;case 6:yu(r,t,Jl,!Vl);break a;case 2:Zl=null;break;case 3:case 5:break;default:throw Error(i(329))}if((t&62914560)===t&&(a=$l+300-Ie(),10<a)){if(yu(r,t,Jl,!Vl),tt(r,0,!0)!==0)break a;su=t,r.timeoutHandle=Kd(_u.bind(null,r,n,Zl,nu,Ql,t,Jl,Kl,Yl,Vl,o,`Throttled`,-0,0),a);break a}_u(r,n,Zl,nu,Ql,t,Jl,Kl,Yl,Vl,o,null,-0,0)}break}while(1);rd(e)}function _u(e,t,n,r,i,a,o,s,c,l,u,d,f,p){if(e.timeoutHandle=-1,d=t.subtreeFlags,d&8192||(d&16785408)==16785408){d={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:cn},Ml(t,a,d);var m=(a&62914560)===a?$l-Ie():(a&4194048)===a?eu-Ie():0;if(m=qf(d,m),m!==null){su=a,e.cancelPendingCommit=m(Lu.bind(null,e,t,a,n,r,i,o,s,c,u,d,null,f,p)),yu(e,a,o,!l);return}}Lu(e,t,a,n,r,i,o,s,c)}function vu(e){for(var t=e;;){var n=t.tag;if((n===0||n===11||n===15)&&t.flags&16384&&(n=t.updateQueue,n!==null&&(n=n.stores,n!==null)))for(var r=0;r<n.length;r++){var i=n[r],a=i.getSnapshot;i=i.value;try{if(!kr(a(),i))return!1}catch{return!1}}if(n=t.child,t.subtreeFlags&16384&&n!==null)n.return=t,t=n;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function yu(e,t,n,r){t&=~ql,t&=~Kl,e.suspendedLanes|=t,e.pingedLanes&=~t,r&&(e.warmLanes|=t),r=e.expirationTimes;for(var i=t;0<i;){var a=31-qe(i),o=1<<a;r[a]=-1,i&=~o}n!==0&&ct(e,n,t)}function bu(){return G&6?!0:(id(0,!1),!1)}function xu(){if(q!==null){if(Y===0)var e=q.return;else e=q,$i=Qi=null,Mo(e),La=null,Ra=0,e=q;for(;e!==null;)Hc(e.alternate,e),e=e.return;q=null}}function Su(e,t){var n=e.timeoutHandle;n!==-1&&(e.timeoutHandle=-1,qd(n)),n=e.cancelPendingCommit,n!==null&&(e.cancelPendingCommit=null,n()),su=0,xu(),K=e,q=n=_i(e.current,null),J=t,Y=0,Bl=null,Vl=!1,Hl=nt(e,t),Ul=!1,Yl=Jl=ql=Kl=Gl=X=0,Zl=Xl=null,Ql=!1,t&8&&(t|=t&32);var r=e.entangledLanes;if(r!==0)for(e=e.entanglements,r&=t;0<r;){var i=31-qe(r),a=1<<i;t|=e[i],r&=~a}return Wl=t,si(),n}function Cu(e,t){I=null,C.H=Vs,t===Da||t===ka?(t=Fa(),Y=3):t===Oa?(t=Fa(),Y=4):Y=t===ac?8:typeof t==`object`&&t&&typeof t.then==`function`?6:1,Bl=t,q===null&&(X=1,$s(e,Ti(t,e.current)))}function wu(){var e=co.current;return e===null?!0:(J&4194048)===J?lo===null:(J&62914560)===J||J&536870912?e===lo:!1}function Tu(){var e=C.H;return C.H=Vs,e===null?Vs:e}function Eu(){var e=C.A;return C.A=Rl,e}function Du(){X=4,Vl||(J&4194048)!==J&&co.current!==null||(Hl=!0),!(Gl&134217727)&&!(Kl&134217727)||K===null||yu(K,J,Jl,!1)}function Ou(e,t,n){var r=G;G|=2;var i=Tu(),a=Eu();(K!==e||J!==t)&&(nu=null,Su(e,t)),t=!1;var o=X;a:do try{if(Y!==0&&q!==null){var s=q,c=Bl;switch(Y){case 8:xu(),o=6;break a;case 3:case 2:case 9:case 6:co.current===null&&(t=!0);var l=Y;if(Y=0,Bl=null,Pu(e,s,c,l),n&&Hl){o=0;break a}break;default:l=Y,Y=0,Bl=null,Pu(e,s,c,l)}}ku(),o=X;break}catch(t){Cu(e,t)}while(1);return t&&e.shellSuspendCounter++,$i=Qi=null,G=r,C.H=i,C.A=a,q===null&&(K=null,J=0,si()),o}function ku(){for(;q!==null;)Mu(q)}function Au(e,t){var n=G;G|=2;var r=Tu(),a=Eu();K!==e||J!==t?(nu=null,tu=Ie()+500,Su(e,t)):Hl=nt(e,t);a:do try{if(Y!==0&&q!==null){t=q;var o=Bl;b:switch(Y){case 1:Y=0,Bl=null,Pu(e,t,o,1);break;case 2:case 9:if(ja(o)){Y=0,Bl=null,Nu(t);break}t=function(){Y!==2&&Y!==9||K!==e||(Y=7),rd(e)},o.then(t,t);break a;case 3:Y=7;break a;case 4:Y=5;break a;case 7:ja(o)?(Y=0,Bl=null,Nu(t)):(Y=0,Bl=null,Pu(e,t,o,7));break;case 5:var s=null;switch(q.tag){case 26:s=q.memoizedState;case 5:case 27:var c=q;if(s?Wf(s):c.stateNode.complete){Y=0,Bl=null;var l=c.sibling;if(l!==null)q=l;else{var u=c.return;u===null?q=null:(q=u,Fu(u))}break b}}Y=0,Bl=null,Pu(e,t,o,5);break;case 6:Y=0,Bl=null,Pu(e,t,o,6);break;case 8:xu(),X=6;break a;default:throw Error(i(462))}}ju();break}catch(t){Cu(e,t)}while(1);return $i=Qi=null,C.H=r,C.A=a,G=n,q===null?(K=null,J=0,si(),X):0}function ju(){for(;q!==null&&!Pe();)Mu(q)}function Mu(e){var t=Pc(e.alternate,e,Wl);e.memoizedProps=e.pendingProps,t===null?Fu(e):q=t}function Nu(e){var t=e,n=t.alternate;switch(t.tag){case 15:case 0:t=vc(n,t,t.pendingProps,t.type,void 0,J);break;case 11:t=vc(n,t,t.pendingProps,t.type.render,t.ref,J);break;case 5:Mo(t);default:Hc(n,t),t=q=vi(t,Wl),t=Pc(n,t,Wl)}e.memoizedProps=e.pendingProps,t===null?Fu(e):q=t}function Pu(e,t,n,r){$i=Qi=null,Mo(t),La=null,Ra=0;var i=t.return;try{if(ic(e,i,t,n,J)){X=1,$s(e,Ti(n,e.current)),q=null;return}}catch(t){if(i!==null)throw q=i,t;X=1,$s(e,Ti(n,e.current)),q=null;return}t.flags&32768?(N||r===1?e=!0:Hl||J&536870912?e=!1:(Vl=e=!0,(r===2||r===9||r===3||r===6)&&(r=co.current,r!==null&&r.tag===13&&(r.flags|=16384))),Iu(t,e)):Fu(t)}function Fu(e){var t=e;do{if(t.flags&32768){Iu(t,Vl);return}e=t.return;var n=Bc(t.alternate,t,Wl);if(n!==null){q=n;return}if(t=t.sibling,t!==null){q=t;return}q=t=e}while(t!==null);X===0&&(X=5)}function Iu(e,t){do{var n=Vc(e.alternate,e);if(n!==null){n.flags&=32767,q=n;return}if(n=e.return,n!==null&&(n.flags|=32768,n.subtreeFlags=0,n.deletions=null),!t&&(e=e.sibling,e!==null)){q=e;return}q=e=n}while(e!==null);X=6,q=null}function Lu(e,t,n,r,a,o,s,c,l){e.cancelPendingCommit=null;do Hu();while(iu!==0);if(G&6)throw Error(i(327));if(t!==null){if(t===e.current)throw Error(i(177));if(o=t.lanes|t.childLanes,o|=oi,st(e,n,o,s,c,l),e===K&&(q=K=null,J=0),ou=t,au=e,su=n,cu=o,lu=a,uu=r,t.subtreeFlags&10256||t.flags&10256?(e.callbackNode=null,e.callbackPriority=0,Xu(ze,function(){return Uu(),null})):(e.callbackNode=null,e.callbackPriority=0),r=!!(t.flags&13878),t.subtreeFlags&13878||r){r=C.T,C.T=null,a=w.p,w.p=2,s=G,G|=4;try{ol(e,t,n)}finally{G=s,w.p=a,C.T=r}}iu=1,Ru(),zu(),Bu()}}function Ru(){if(iu===1){iu=0;var e=au,t=ou,n=!!(t.flags&13878);if(t.subtreeFlags&13878||n){n=C.T,C.T=null;var r=w.p;w.p=2;var i=G;G|=4;try{vl(t,e);var a=zd,o=Pr(e.containerInfo),s=a.focusedElem,c=a.selectionRange;if(o!==s&&s&&s.ownerDocument&&Nr(s.ownerDocument.documentElement,s)){if(c!==null&&Fr(s)){var l=c.start,u=c.end;if(u===void 0&&(u=l),`selectionStart`in s)s.selectionStart=l,s.selectionEnd=Math.min(u,s.value.length);else{var d=s.ownerDocument||document,f=d&&d.defaultView||window;if(f.getSelection){var p=f.getSelection(),m=s.textContent.length,h=Math.min(c.start,m),g=c.end===void 0?h:Math.min(c.end,m);!p.extend&&h>g&&(o=g,g=h,h=o);var _=Mr(s,h),v=Mr(s,g);if(_&&v&&(p.rangeCount!==1||p.anchorNode!==_.node||p.anchorOffset!==_.offset||p.focusNode!==v.node||p.focusOffset!==v.offset)){var y=d.createRange();y.setStart(_.node,_.offset),p.removeAllRanges(),h>g?(p.addRange(y),p.extend(v.node,v.offset)):(y.setEnd(v.node,v.offset),p.addRange(y))}}}}for(d=[],p=s;p=p.parentNode;)p.nodeType===1&&d.push({element:p,left:p.scrollLeft,top:p.scrollTop});for(typeof s.focus==`function`&&s.focus(),s=0;s<d.length;s++){var b=d[s];b.element.scrollLeft=b.left,b.element.scrollTop=b.top}}sp=!!Rd,zd=Rd=null}finally{G=i,w.p=r,C.T=n}}e.current=t,iu=2}}function zu(){if(iu===2){iu=0;var e=au,t=ou,n=!!(t.flags&8772);if(t.subtreeFlags&8772||n){n=C.T,C.T=null;var r=w.p;w.p=2;var i=G;G|=4;try{sl(e,t.alternate,t)}finally{G=i,w.p=r,C.T=n}}iu=3}}function Bu(){if(iu===4||iu===3){iu=0,Fe();var e=au,t=ou,n=su,r=uu;t.subtreeFlags&10256||t.flags&10256?iu=5:(iu=0,ou=au=null,Vu(e,e.pendingLanes));var i=e.pendingLanes;if(i===0&&(ru=null),ft(n),t=t.stateNode,Ge&&typeof Ge.onCommitFiberRoot==`function`)try{Ge.onCommitFiberRoot(We,t,void 0,(t.current.flags&128)==128)}catch{}if(r!==null){t=C.T,i=w.p,w.p=2,C.T=null;try{for(var a=e.onRecoverableError,o=0;o<r.length;o++){var s=r[o];a(s.value,{componentStack:s.stack})}}finally{C.T=t,w.p=i}}su&3&&Hu(),rd(e),i=e.pendingLanes,n&261930&&i&42?e===fu?du++:(du=0,fu=e):du=0,id(0,!1)}}function Vu(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,ma(t)))}function Hu(){return Ru(),zu(),Bu(),Uu()}function Uu(){if(iu!==5)return!1;var e=au,t=cu;cu=0;var n=ft(su),r=C.T,a=w.p;try{w.p=32>n?32:n,C.T=null,n=lu,lu=null;var o=au,s=su;if(iu=0,ou=au=null,su=0,G&6)throw Error(i(331));var c=G;if(G|=4,Fl(o.current),Dl(o,o.current,s,n),G=c,id(0,!1),Ge&&typeof Ge.onPostCommitFiberRoot==`function`)try{Ge.onPostCommitFiberRoot(We,o)}catch{}return!0}finally{w.p=a,C.T=r,Vu(e,t)}}function Wu(e,t,n){t=Ti(n,t),t=tc(e.stateNode,t,2),e=Ya(e,t,2),e!==null&&(ot(e,2),rd(e))}function Z(e,t,n){if(e.tag===3)Wu(e,e,n);else for(;t!==null;){if(t.tag===3){Wu(t,e,n);break}if(t.tag===1){var r=t.stateNode;if(typeof t.type.getDerivedStateFromError==`function`||typeof r.componentDidCatch==`function`&&(ru===null||!ru.has(r))){e=Ti(n,e),n=nc(2),r=Ya(t,n,2),r!==null&&(rc(n,r,t,e),ot(r,2),rd(r));break}}t=t.return}}function Gu(e,t,n){var r=e.pingCache;if(r===null){r=e.pingCache=new zl;var i=new Set;r.set(t,i)}else i=r.get(t),i===void 0&&(i=new Set,r.set(t,i));i.has(n)||(Ul=!0,i.add(n),e=Ku.bind(null,e,t,n),t.then(e,e))}function Ku(e,t,n){var r=e.pingCache;r!==null&&r.delete(t),e.pingedLanes|=e.suspendedLanes&n,e.warmLanes&=~n,K===e&&(J&n)===n&&(X===4||X===3&&(J&62914560)===J&&300>Ie()-$l?!(G&2)&&Su(e,0):ql|=n,Yl===J&&(Yl=0)),rd(e)}function qu(e,t){t===0&&(t=it()),e=ui(e,t),e!==null&&(ot(e,t),rd(e))}function Ju(e){var t=e.memoizedState,n=0;t!==null&&(n=t.retryLane),qu(e,n)}function Yu(e,t){var n=0;switch(e.tag){case 31:case 13:var r=e.stateNode,a=e.memoizedState;a!==null&&(n=a.retryLane);break;case 19:r=e.stateNode;break;case 22:r=e.stateNode._retryCache;break;default:throw Error(i(314))}r!==null&&r.delete(t),qu(e,n)}function Xu(e,t){return Me(e,t)}var Zu=null,Qu=null,$u=!1,ed=!1,td=!1,nd=0;function rd(e){e!==Qu&&e.next===null&&(Qu===null?Zu=Qu=e:Qu=Qu.next=e),ed=!0,$u||($u=!0,ud())}function id(e,t){if(!td&&ed){td=!0;do for(var n=!1,r=Zu;r!==null;){if(!t){if(e!==0){var i=r.pendingLanes;if(i===0)var a=0;else{var o=r.suspendedLanes,s=r.pingedLanes;a=(1<<31-qe(42|e)+1)-1,a&=i&~(o&~s),a=a&201326741?a&201326741|1:a?a|2:0}a!==0&&(n=!0,ld(r,a))}else a=J,a=tt(r,r===K?a:0,r.cancelPendingCommit!==null||r.timeoutHandle!==-1),!(a&3)||nt(r,a)||(n=!0,ld(r,a))}r=r.next}while(n);td=!1}}function ad(){od()}function od(){ed=$u=!1;var e=0;nd!==0&&Gd()&&(e=nd);for(var t=Ie(),n=null,r=Zu;r!==null;){var i=r.next,a=sd(r,t);a===0?(r.next=null,n===null?Zu=i:n.next=i,i===null&&(Qu=n)):(n=r,(e!==0||a&3)&&(ed=!0)),r=i}iu!==0&&iu!==5||id(e,!1),nd!==0&&(nd=0)}function sd(e,t){for(var n=e.suspendedLanes,r=e.pingedLanes,i=e.expirationTimes,a=e.pendingLanes&-62914561;0<a;){var o=31-qe(a),s=1<<o,c=i[o];c===-1?((s&n)===0||(s&r)!==0)&&(i[o]=rt(s,t)):c<=t&&(e.expiredLanes|=s),a&=~s}if(t=K,n=J,n=tt(e,e===t?n:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),r=e.callbackNode,n===0||e===t&&(Y===2||Y===9)||e.cancelPendingCommit!==null)return r!==null&&r!==null&&Ne(r),e.callbackNode=null,e.callbackPriority=0;if(!(n&3)||nt(e,n)){if(t=n&-n,t===e.callbackPriority)return t;switch(r!==null&&Ne(r),ft(n)){case 2:case 8:n=Re;break;case 32:n=ze;break;case 268435456:n=Ve;break;default:n=ze}return r=cd.bind(null,e),n=Me(n,r),e.callbackPriority=t,e.callbackNode=n,t}return r!==null&&r!==null&&Ne(r),e.callbackPriority=2,e.callbackNode=null,2}function cd(e,t){if(iu!==0&&iu!==5)return e.callbackNode=null,e.callbackPriority=0,null;var n=e.callbackNode;if(Hu()&&e.callbackNode!==n)return null;var r=J;return r=tt(e,e===K?r:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),r===0?null:(gu(e,r,t),sd(e,Ie()),e.callbackNode!=null&&e.callbackNode===n?cd.bind(null,e):null)}function ld(e,t){if(Hu())return null;gu(e,t,!0)}function ud(){Yd(function(){G&6?Me(O,ad):od()})}function dd(){if(nd===0){var e=_a;e===0&&(e=Ze,Ze<<=1,!(Ze&261888)&&(Ze=256)),nd=e}return nd}function fd(e){return e==null||typeof e==`symbol`||typeof e==`boolean`?null:typeof e==`function`?e:sn(``+e)}function pd(e,t){var n=t.ownerDocument.createElement(`input`);return n.name=t.name,n.value=t.value,e.id&&n.setAttribute(`form`,e.id),t.parentNode.insertBefore(n,t),e=new FormData(e),n.parentNode.removeChild(n),e}function md(e,t,n,r,i){if(t===`submit`&&n&&n.stateNode===i){var a=fd((i[gt]||null).action),o=r.submitter;o&&(t=(t=o[gt]||null)?fd(t.formAction):o.getAttribute(`formAction`),t!==null&&(a=t,o=null));var s=new kn(`action`,`action`,null,r,i);e.push({event:s,listeners:[{instance:null,listener:function(){if(r.defaultPrevented){if(nd!==0){var e=o?pd(i,o):new FormData(i);Ds(n,{pending:!0,data:e,method:i.method,action:a},null,e)}}else typeof a==`function`&&(s.preventDefault(),e=o?pd(i,o):new FormData(i),Ds(n,{pending:!0,data:e,method:i.method,action:a},a,e))},currentTarget:i}]})}}for(var hd=0;hd<ti.length;hd++){var gd=ti[hd];ni(gd.toLowerCase(),`on`+(gd[0].toUpperCase()+gd.slice(1)))}ni(qr,`onAnimationEnd`),ni(Jr,`onAnimationIteration`),ni(Yr,`onAnimationStart`),ni(`dblclick`,`onDoubleClick`),ni(`focusin`,`onFocus`),ni(`focusout`,`onBlur`),ni(Xr,`onTransitionRun`),ni(Zr,`onTransitionStart`),ni(Qr,`onTransitionCancel`),ni($r,`onTransitionEnd`),jt(`onMouseEnter`,[`mouseout`,`mouseover`]),jt(`onMouseLeave`,[`mouseout`,`mouseover`]),jt(`onPointerEnter`,[`pointerout`,`pointerover`]),jt(`onPointerLeave`,[`pointerout`,`pointerover`]),At(`onChange`,`change click focusin focusout input keydown keyup selectionchange`.split(` `)),At(`onSelect`,`focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange`.split(` `)),At(`onBeforeInput`,[`compositionend`,`keypress`,`textInput`,`paste`]),At(`onCompositionEnd`,`compositionend focusout keydown keypress keyup mousedown`.split(` `)),At(`onCompositionStart`,`compositionstart focusout keydown keypress keyup mousedown`.split(` `)),At(`onCompositionUpdate`,`compositionupdate focusout keydown keypress keyup mousedown`.split(` `));var _d=`abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting`.split(` `),vd=new Set(`beforetoggle cancel close invalid load scroll scrollend toggle`.split(` `).concat(_d));function yd(e,t){t=!!(t&4);for(var n=0;n<e.length;n++){var r=e[n],i=r.event;r=r.listeners;a:{var a=void 0;if(t)for(var o=r.length-1;0<=o;o--){var s=r[o],c=s.instance,l=s.currentTarget;if(s=s.listener,c!==a&&i.isPropagationStopped())break a;a=s,i.currentTarget=l;try{a(i)}catch(e){ri(e)}i.currentTarget=null,a=c}else for(o=0;o<r.length;o++){if(s=r[o],c=s.instance,l=s.currentTarget,s=s.listener,c!==a&&i.isPropagationStopped())break a;a=s,i.currentTarget=l;try{a(i)}catch(e){ri(e)}i.currentTarget=null,a=c}}}}function Q(e,t){var n=t[vt];n===void 0&&(n=t[vt]=new Set);var r=e+`__bubble`;n.has(r)||(Cd(t,e,2,!1),n.add(r))}function bd(e,t,n){var r=0;t&&(r|=4),Cd(n,e,r,t)}var xd=`_reactListening`+Math.random().toString(36).slice(2);function Sd(e){if(!e[xd]){e[xd]=!0,Ot.forEach(function(t){t!==`selectionchange`&&(vd.has(t)||bd(t,!1,e),bd(t,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[xd]||(t[xd]=!0,bd(`selectionchange`,!1,t))}}function Cd(e,t,n,r){switch(mp(t)){case 2:var i=cp;break;case 8:i=lp;break;default:i=up}n=i.bind(null,t,n,e),i=void 0,!vn||t!==`touchstart`&&t!==`touchmove`&&t!==`wheel`||(i=!0),r?i===void 0?e.addEventListener(t,n,!0):e.addEventListener(t,n,{capture:!0,passive:i}):i===void 0?e.addEventListener(t,n,!1):e.addEventListener(t,n,{passive:i})}function wd(e,t,n,r,i){var a=r;if(!(t&1)&&!(t&2)&&r!==null)a:for(;;){if(r===null)return;var s=r.tag;if(s===3||s===4){var c=r.stateNode.containerInfo;if(c===i)break;if(s===4)for(s=r.return;s!==null;){var l=s.tag;if((l===3||l===4)&&s.stateNode.containerInfo===i)return;s=s.return}for(;c!==null;){if(s=wt(c),s===null)return;if(l=s.tag,l===5||l===6||l===26||l===27){r=a=s;continue a}c=c.parentNode}}r=r.return}hn(function(){var r=a,i=un(n),s=[];a:{var c=ei.get(e);if(c!==void 0){var l=kn,u=e;switch(e){case`keypress`:if(wn(n)===0)break a;case`keydown`:case`keyup`:l=Kn;break;case`focusin`:u=`focus`,l=Rn;break;case`focusout`:u=`blur`,l=Rn;break;case`beforeblur`:case`afterblur`:l=Rn;break;case`click`:if(n.button===2)break a;case`auxclick`:case`dblclick`:case`mousedown`:case`mousemove`:case`mouseup`:case`mouseout`:case`mouseover`:case`contextmenu`:l=In;break;case`drag`:case`dragend`:case`dragenter`:case`dragexit`:case`dragleave`:case`dragover`:case`dragstart`:case`drop`:l=Ln;break;case`touchcancel`:case`touchend`:case`touchmove`:case`touchstart`:l=Jn;break;case qr:case Jr:case Yr:l=zn;break;case $r:l=Yn;break;case`scroll`:case`scrollend`:l=jn;break;case`wheel`:l=Xn;break;case`copy`:case`cut`:case`paste`:l=Bn;break;case`gotpointercapture`:case`lostpointercapture`:case`pointercancel`:case`pointerdown`:case`pointermove`:case`pointerout`:case`pointerover`:case`pointerup`:l=qn;break;case`toggle`:case`beforetoggle`:l=Zn}var d=!!(t&4),f=!d&&(e===`scroll`||e===`scrollend`),p=d?c===null?null:c+`Capture`:c;d=[];for(var m=r,h;m!==null;){var g=m;if(h=g.stateNode,g=g.tag,g!==5&&g!==26&&g!==27||h===null||p===null||(g=gn(m,p),g!=null&&d.push(Td(m,g,h))),f)break;m=m.return}0<d.length&&(c=new l(c,u,null,n,i),s.push({event:c,listeners:d}))}}if(!(t&7)){a:{if(c=e===`mouseover`||e===`pointerover`,l=e===`mouseout`||e===`pointerout`,c&&n!==ln&&(u=n.relatedTarget||n.fromElement)&&(wt(u)||u[_t]))break a;if((l||c)&&(c=i.window===i?i:(c=i.ownerDocument)?c.defaultView||c.parentWindow:window,l?(u=n.relatedTarget||n.toElement,l=r,u=u?wt(u):null,u!==null&&(f=o(u),d=u.tag,u!==f||d!==5&&d!==27&&d!==6)&&(u=null)):(l=null,u=r),l!==u)){if(d=In,g=`onMouseLeave`,p=`onMouseEnter`,m=`mouse`,(e===`pointerout`||e===`pointerover`)&&(d=qn,g=`onPointerLeave`,p=`onPointerEnter`,m=`pointer`),f=l==null?c:Et(l),h=u==null?c:Et(u),c=new d(g,m+`leave`,l,n,i),c.target=f,c.relatedTarget=h,g=null,wt(i)===r&&(d=new d(p,m+`enter`,u,n,i),d.target=h,d.relatedTarget=f,g=d),f=g,l&&u)b:{for(d=Dd,p=l,m=u,h=0,g=p;g;g=d(g))h++;g=0;for(var _=m;_;_=d(_))g++;for(;0<h-g;)p=d(p),h--;for(;0<g-h;)m=d(m),g--;for(;h--;){if(p===m||m!==null&&p===m.alternate){d=p;break b}p=d(p),m=d(m)}d=null}else d=null;l!==null&&Od(s,c,l,d,!1),u!==null&&f!==null&&Od(s,f,u,d,!0)}}a:{if(c=r?Et(r):window,l=c.nodeName&&c.nodeName.toLowerCase(),l===`select`||l===`input`&&c.type===`file`)var v=_r;else if(dr(c)){if(vr)v=Dr;else{v=Tr;var y=wr}}else l=c.nodeName,!l||l.toLowerCase()!==`input`||c.type!==`checkbox`&&c.type!==`radio`?r&&rn(r.elementType)&&(v=_r):v=Er;if(v&&=v(e,r)){fr(s,v,n,i);break a}y&&y(e,c,r),e===`focusout`&&r&&c.type===`number`&&r.memoizedProps.value!=null&&Yt(c,`number`,c.value)}switch(y=r?Et(r):window,e){case`focusin`:(dr(y)||y.contentEditable===`true`)&&(Lr=y,Rr=r,zr=null);break;case`focusout`:zr=Rr=Lr=null;break;case`mousedown`:Br=!0;break;case`contextmenu`:case`mouseup`:case`dragend`:Br=!1,Vr(s,n,i);break;case`selectionchange`:if(Ir)break;case`keydown`:case`keyup`:Vr(s,n,i)}var b;if($n)b:{switch(e){case`compositionstart`:var x=`onCompositionStart`;break b;case`compositionend`:x=`onCompositionEnd`;break b;case`compositionupdate`:x=`onCompositionUpdate`;break b}x=void 0}else sr?ar(e,n)&&(x=`onCompositionEnd`):e===`keydown`&&n.keyCode===229&&(x=`onCompositionStart`);x&&(nr&&n.locale!==`ko`&&(sr||x!==`onCompositionStart`?x===`onCompositionEnd`&&sr&&(b=Cn()):(bn=i,xn=`value`in bn?bn.value:bn.textContent,sr=!0)),y=Ed(r,x),0<y.length&&(x=new j(x,e,null,n,i),s.push({event:x,listeners:y}),b?x.data=b:(b=or(n),b!==null&&(x.data=b)))),(b=tr?cr(e,n):lr(e,n))&&(x=Ed(r,`onBeforeInput`),0<x.length&&(y=new j(`onBeforeInput`,`beforeinput`,null,n,i),s.push({event:y,listeners:x}),y.data=b)),md(s,e,r,n,i)}yd(s,t)})}function Td(e,t,n){return{instance:e,listener:t,currentTarget:n}}function Ed(e,t){for(var n=t+`Capture`,r=[];e!==null;){var i=e,a=i.stateNode;if(i=i.tag,i!==5&&i!==26&&i!==27||a===null||(i=gn(e,n),i!=null&&r.unshift(Td(e,i,a)),i=gn(e,t),i!=null&&r.push(Td(e,i,a))),e.tag===3)return r;e=e.return}return[]}function Dd(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function Od(e,t,n,r,i){for(var a=t._reactName,o=[];n!==null&&n!==r;){var s=n,c=s.alternate,l=s.stateNode;if(s=s.tag,c!==null&&c===r)break;s!==5&&s!==26&&s!==27||l===null||(c=l,i?(l=gn(n,a),l!=null&&o.unshift(Td(n,l,c))):i||(l=gn(n,a),l!=null&&o.push(Td(n,l,c)))),n=n.return}o.length!==0&&e.push({event:t,listeners:o})}var kd=/\r\n?/g,Ad=/\u0000|\uFFFD/g;function jd(e){return(typeof e==`string`?e:``+e).replace(kd,`
`).replace(Ad,``)}function Md(e,t){return t=jd(t),jd(e)===t}function $(e,t,n,r,a,o){switch(n){case`children`:typeof r==`string`?t===`body`||t===`textarea`&&r===``||$t(e,r):(typeof r==`number`||typeof r==`bigint`)&&t!==`body`&&$t(e,``+r);break;case`className`:Lt(e,`class`,r);break;case`tabIndex`:Lt(e,`tabindex`,r);break;case`dir`:case`role`:case`viewBox`:case`width`:case`height`:Lt(e,n,r);break;case`style`:nn(e,r,o);break;case`data`:if(t!==`object`){Lt(e,`data`,r);break}case`src`:case`href`:if(r===``&&(t!==`a`||n!==`href`)){e.removeAttribute(n);break}if(r==null||typeof r==`function`||typeof r==`symbol`||typeof r==`boolean`){e.removeAttribute(n);break}r=sn(``+r),e.setAttribute(n,r);break;case`action`:case`formAction`:if(typeof r==`function`){e.setAttribute(n,`javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')`);break}if(typeof o==`function`&&(n===`formAction`?(t!==`input`&&$(e,t,`name`,a.name,a,null),$(e,t,`formEncType`,a.formEncType,a,null),$(e,t,`formMethod`,a.formMethod,a,null),$(e,t,`formTarget`,a.formTarget,a,null)):($(e,t,`encType`,a.encType,a,null),$(e,t,`method`,a.method,a,null),$(e,t,`target`,a.target,a,null))),r==null||typeof r==`symbol`||typeof r==`boolean`){e.removeAttribute(n);break}r=sn(``+r),e.setAttribute(n,r);break;case`onClick`:r!=null&&(e.onclick=cn);break;case`onScroll`:r!=null&&Q(`scroll`,e);break;case`onScrollEnd`:r!=null&&Q(`scrollend`,e);break;case`dangerouslySetInnerHTML`:if(r!=null){if(typeof r!=`object`||!(`__html`in r))throw Error(i(61));if(n=r.__html,n!=null){if(a.children!=null)throw Error(i(60));e.innerHTML=n}}break;case`multiple`:e.multiple=r&&typeof r!=`function`&&typeof r!=`symbol`;break;case`muted`:e.muted=r&&typeof r!=`function`&&typeof r!=`symbol`;break;case`suppressContentEditableWarning`:case`suppressHydrationWarning`:case`defaultValue`:case`defaultChecked`:case`innerHTML`:case`ref`:break;case`autoFocus`:break;case`xlinkHref`:if(r==null||typeof r==`function`||typeof r==`boolean`||typeof r==`symbol`){e.removeAttribute(`xlink:href`);break}n=sn(``+r),e.setAttributeNS(`http://www.w3.org/1999/xlink`,`xlink:href`,n);break;case`contentEditable`:case`spellCheck`:case`draggable`:case`value`:case`autoReverse`:case`externalResourcesRequired`:case`focusable`:case`preserveAlpha`:r!=null&&typeof r!=`function`&&typeof r!=`symbol`?e.setAttribute(n,``+r):e.removeAttribute(n);break;case`inert`:case`allowFullScreen`:case`async`:case`autoPlay`:case`controls`:case`default`:case`defer`:case`disabled`:case`disablePictureInPicture`:case`disableRemotePlayback`:case`formNoValidate`:case`hidden`:case`loop`:case`noModule`:case`noValidate`:case`open`:case`playsInline`:case`readOnly`:case`required`:case`reversed`:case`scoped`:case`seamless`:case`itemScope`:r&&typeof r!=`function`&&typeof r!=`symbol`?e.setAttribute(n,``):e.removeAttribute(n);break;case`capture`:case`download`:!0===r?e.setAttribute(n,``):!1!==r&&r!=null&&typeof r!=`function`&&typeof r!=`symbol`?e.setAttribute(n,r):e.removeAttribute(n);break;case`cols`:case`rows`:case`size`:case`span`:r!=null&&typeof r!=`function`&&typeof r!=`symbol`&&!isNaN(r)&&1<=r?e.setAttribute(n,r):e.removeAttribute(n);break;case`rowSpan`:case`start`:r==null||typeof r==`function`||typeof r==`symbol`||isNaN(r)?e.removeAttribute(n):e.setAttribute(n,r);break;case`popover`:Q(`beforetoggle`,e),Q(`toggle`,e),It(e,`popover`,r);break;case`xlinkActuate`:Rt(e,`http://www.w3.org/1999/xlink`,`xlink:actuate`,r);break;case`xlinkArcrole`:Rt(e,`http://www.w3.org/1999/xlink`,`xlink:arcrole`,r);break;case`xlinkRole`:Rt(e,`http://www.w3.org/1999/xlink`,`xlink:role`,r);break;case`xlinkShow`:Rt(e,`http://www.w3.org/1999/xlink`,`xlink:show`,r);break;case`xlinkTitle`:Rt(e,`http://www.w3.org/1999/xlink`,`xlink:title`,r);break;case`xlinkType`:Rt(e,`http://www.w3.org/1999/xlink`,`xlink:type`,r);break;case`xmlBase`:Rt(e,`http://www.w3.org/XML/1998/namespace`,`xml:base`,r);break;case`xmlLang`:Rt(e,`http://www.w3.org/XML/1998/namespace`,`xml:lang`,r);break;case`xmlSpace`:Rt(e,`http://www.w3.org/XML/1998/namespace`,`xml:space`,r);break;case`is`:It(e,`is`,r);break;case`innerText`:case`textContent`:break;default:(!(2<n.length)||n[0]!==`o`&&n[0]!==`O`||n[1]!==`n`&&n[1]!==`N`)&&(n=an.get(n)||n,It(e,n,r))}}function Nd(e,t,n,r,a,o){switch(n){case`style`:nn(e,r,o);break;case`dangerouslySetInnerHTML`:if(r!=null){if(typeof r!=`object`||!(`__html`in r))throw Error(i(61));if(n=r.__html,n!=null){if(a.children!=null)throw Error(i(60));e.innerHTML=n}}break;case`children`:typeof r==`string`?$t(e,r):(typeof r==`number`||typeof r==`bigint`)&&$t(e,``+r);break;case`onScroll`:r!=null&&Q(`scroll`,e);break;case`onScrollEnd`:r!=null&&Q(`scrollend`,e);break;case`onClick`:r!=null&&(e.onclick=cn);break;case`suppressContentEditableWarning`:case`suppressHydrationWarning`:case`innerHTML`:case`ref`:break;case`innerText`:case`textContent`:break;default:if(!kt.hasOwnProperty(n))a:{if(n[0]===`o`&&n[1]===`n`&&(a=n.endsWith(`Capture`),t=n.slice(2,a?n.length-7:void 0),o=e[gt]||null,o=o==null?null:o[n],typeof o==`function`&&e.removeEventListener(t,o,a),typeof r==`function`)){typeof o!=`function`&&o!==null&&(n in e?e[n]=null:e.hasAttribute(n)&&e.removeAttribute(n)),e.addEventListener(t,r,a);break a}n in e?e[n]=r:!0===r?e.setAttribute(n,``):It(e,n,r)}}}function Pd(e,t,n){switch(t){case`div`:case`span`:case`svg`:case`path`:case`a`:case`g`:case`p`:case`li`:break;case`img`:Q(`error`,e),Q(`load`,e);var r=!1,a=!1,o;for(o in n)if(n.hasOwnProperty(o)){var s=n[o];if(s!=null)switch(o){case`src`:r=!0;break;case`srcSet`:a=!0;break;case`children`:case`dangerouslySetInnerHTML`:throw Error(i(137,t));default:$(e,t,o,s,n,null)}}a&&$(e,t,`srcSet`,n.srcSet,n,null),r&&$(e,t,`src`,n.src,n,null);return;case`input`:Q(`invalid`,e);var c=o=s=a=null,l=null,u=null;for(r in n)if(n.hasOwnProperty(r)){var d=n[r];if(d!=null)switch(r){case`name`:a=d;break;case`type`:s=d;break;case`checked`:l=d;break;case`defaultChecked`:u=d;break;case`value`:o=d;break;case`defaultValue`:c=d;break;case`children`:case`dangerouslySetInnerHTML`:if(d!=null)throw Error(i(137,t));break;default:$(e,t,r,d,n,null)}}Jt(e,o,c,l,u,s,a,!1);return;case`select`:for(a in Q(`invalid`,e),r=s=o=null,n)if(n.hasOwnProperty(a)&&(c=n[a],c!=null))switch(a){case`value`:o=c;break;case`defaultValue`:s=c;break;case`multiple`:r=c;default:$(e,t,a,c,n,null)}t=o,n=s,e.multiple=!!r,t==null?n!=null&&Xt(e,!!r,n,!0):Xt(e,!!r,t,!1);return;case`textarea`:for(s in Q(`invalid`,e),o=a=r=null,n)if(n.hasOwnProperty(s)&&(c=n[s],c!=null))switch(s){case`value`:r=c;break;case`defaultValue`:a=c;break;case`children`:o=c;break;case`dangerouslySetInnerHTML`:if(c!=null)throw Error(i(91));break;default:$(e,t,s,c,n,null)}Qt(e,r,a,o);return;case`option`:for(l in n)if(n.hasOwnProperty(l)&&(r=n[l],r!=null))switch(l){case`selected`:e.selected=r&&typeof r!=`function`&&typeof r!=`symbol`;break;default:$(e,t,l,r,n,null)}return;case`dialog`:Q(`beforetoggle`,e),Q(`toggle`,e),Q(`cancel`,e),Q(`close`,e);break;case`iframe`:case`object`:Q(`load`,e);break;case`video`:case`audio`:for(r=0;r<_d.length;r++)Q(_d[r],e);break;case`image`:Q(`error`,e),Q(`load`,e);break;case`details`:Q(`toggle`,e);break;case`embed`:case`source`:case`link`:Q(`error`,e),Q(`load`,e);case`area`:case`base`:case`br`:case`col`:case`hr`:case`keygen`:case`meta`:case`param`:case`track`:case`wbr`:case`menuitem`:for(u in n)if(n.hasOwnProperty(u)&&(r=n[u],r!=null))switch(u){case`children`:case`dangerouslySetInnerHTML`:throw Error(i(137,t));default:$(e,t,u,r,n,null)}return;default:if(rn(t)){for(d in n)n.hasOwnProperty(d)&&(r=n[d],r!==void 0&&Nd(e,t,d,r,n,void 0));return}}for(c in n)n.hasOwnProperty(c)&&(r=n[c],r!=null&&$(e,t,c,r,n,null))}function Fd(e,t,n,r){switch(t){case`div`:case`span`:case`svg`:case`path`:case`a`:case`g`:case`p`:case`li`:break;case`input`:var a=null,o=null,s=null,c=null,l=null,u=null,d=null;for(m in n){var f=n[m];if(n.hasOwnProperty(m)&&f!=null)switch(m){case`checked`:break;case`value`:break;case`defaultValue`:l=f;default:r.hasOwnProperty(m)||$(e,t,m,null,r,f)}}for(var p in r){var m=r[p];if(f=n[p],r.hasOwnProperty(p)&&(m!=null||f!=null))switch(p){case`type`:o=m;break;case`name`:a=m;break;case`checked`:u=m;break;case`defaultChecked`:d=m;break;case`value`:s=m;break;case`defaultValue`:c=m;break;case`children`:case`dangerouslySetInnerHTML`:if(m!=null)throw Error(i(137,t));break;default:m!==f&&$(e,t,p,m,r,f)}}qt(e,s,c,l,u,d,o,a);return;case`select`:for(o in m=s=c=p=null,n)if(l=n[o],n.hasOwnProperty(o)&&l!=null)switch(o){case`value`:break;case`multiple`:m=l;default:r.hasOwnProperty(o)||$(e,t,o,null,r,l)}for(a in r)if(o=r[a],l=n[a],r.hasOwnProperty(a)&&(o!=null||l!=null))switch(a){case`value`:p=o;break;case`defaultValue`:c=o;break;case`multiple`:s=o;default:o!==l&&$(e,t,a,o,r,l)}t=c,n=s,r=m,p==null?!!r!=!!n&&(t==null?Xt(e,!!n,n?[]:``,!1):Xt(e,!!n,t,!0)):Xt(e,!!n,p,!1);return;case`textarea`:for(c in m=p=null,n)if(a=n[c],n.hasOwnProperty(c)&&a!=null&&!r.hasOwnProperty(c))switch(c){case`value`:break;case`children`:break;default:$(e,t,c,null,r,a)}for(s in r)if(a=r[s],o=n[s],r.hasOwnProperty(s)&&(a!=null||o!=null))switch(s){case`value`:p=a;break;case`defaultValue`:m=a;break;case`children`:break;case`dangerouslySetInnerHTML`:if(a!=null)throw Error(i(91));break;default:a!==o&&$(e,t,s,a,r,o)}Zt(e,p,m);return;case`option`:for(var h in n)if(p=n[h],n.hasOwnProperty(h)&&p!=null&&!r.hasOwnProperty(h))switch(h){case`selected`:e.selected=!1;break;default:$(e,t,h,null,r,p)}for(l in r)if(p=r[l],m=n[l],r.hasOwnProperty(l)&&p!==m&&(p!=null||m!=null))switch(l){case`selected`:e.selected=p&&typeof p!=`function`&&typeof p!=`symbol`;break;default:$(e,t,l,p,r,m)}return;case`img`:case`link`:case`area`:case`base`:case`br`:case`col`:case`embed`:case`hr`:case`keygen`:case`meta`:case`param`:case`source`:case`track`:case`wbr`:case`menuitem`:for(var g in n)p=n[g],n.hasOwnProperty(g)&&p!=null&&!r.hasOwnProperty(g)&&$(e,t,g,null,r,p);for(u in r)if(p=r[u],m=n[u],r.hasOwnProperty(u)&&p!==m&&(p!=null||m!=null))switch(u){case`children`:case`dangerouslySetInnerHTML`:if(p!=null)throw Error(i(137,t));break;default:$(e,t,u,p,r,m)}return;default:if(rn(t)){for(var _ in n)p=n[_],n.hasOwnProperty(_)&&p!==void 0&&!r.hasOwnProperty(_)&&Nd(e,t,_,void 0,r,p);for(d in r)p=r[d],m=n[d],!r.hasOwnProperty(d)||p===m||p===void 0&&m===void 0||Nd(e,t,d,p,r,m);return}}for(var v in n)p=n[v],n.hasOwnProperty(v)&&p!=null&&!r.hasOwnProperty(v)&&$(e,t,v,null,r,p);for(f in r)p=r[f],m=n[f],!r.hasOwnProperty(f)||p===m||p==null&&m==null||$(e,t,f,p,r,m)}function Id(e){switch(e){case`css`:case`script`:case`font`:case`img`:case`image`:case`input`:case`link`:return!0;default:return!1}}function Ld(){if(typeof performance.getEntriesByType==`function`){for(var e=0,t=0,n=performance.getEntriesByType(`resource`),r=0;r<n.length;r++){var i=n[r],a=i.transferSize,o=i.initiatorType,s=i.duration;if(a&&s&&Id(o)){for(o=0,s=i.responseEnd,r+=1;r<n.length;r++){var c=n[r],l=c.startTime;if(l>s)break;var u=c.transferSize,d=c.initiatorType;u&&Id(d)&&(c=c.responseEnd,o+=u*(c<s?1:(s-l)/(c-l)))}if(--r,t+=8*(a+o)/(i.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e==`number`)?e:5}var Rd=null,zd=null;function Bd(e){return e.nodeType===9?e:e.ownerDocument}function Vd(e){switch(e){case`http://www.w3.org/2000/svg`:return 1;case`http://www.w3.org/1998/Math/MathML`:return 2;default:return 0}}function Hd(e,t){if(e===0)switch(t){case`svg`:return 1;case`math`:return 2;default:return 0}return e===1&&t===`foreignObject`?0:e}function Ud(e,t){return e===`textarea`||e===`noscript`||typeof t.children==`string`||typeof t.children==`number`||typeof t.children==`bigint`||typeof t.dangerouslySetInnerHTML==`object`&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var Wd=null;function Gd(){var e=window.event;return e&&e.type===`popstate`?e!==Wd&&(Wd=e,!0):(Wd=null,!1)}var Kd=typeof setTimeout==`function`?setTimeout:void 0,qd=typeof clearTimeout==`function`?clearTimeout:void 0,Jd=typeof Promise==`function`?Promise:void 0,Yd=typeof queueMicrotask==`function`?queueMicrotask:Jd===void 0?Kd:function(e){return Jd.resolve(null).then(e).catch(Xd)};function Xd(e){setTimeout(function(){throw e})}function Zd(e){return e===`head`}function Qd(e,t){var n=t,r=0;do{var i=n.nextSibling;if(e.removeChild(n),i&&i.nodeType===8){if(n=i.data,n===`/$`||n===`/&`){if(r===0){e.removeChild(i),Np(t);return}r--}else if(n===`$`||n===`$?`||n===`$~`||n===`$!`||n===`&`)r++;else if(n===`html`)pf(e.ownerDocument.documentElement);else if(n===`head`){n=e.ownerDocument.head,pf(n);for(var a=n.firstChild;a;){var o=a.nextSibling,s=a.nodeName;a[St]||s===`SCRIPT`||s===`STYLE`||s===`LINK`&&a.rel.toLowerCase()===`stylesheet`||n.removeChild(a),a=o}}else n===`body`&&pf(e.ownerDocument.body)}n=i}while(n);Np(t)}function $d(e,t){var n=e;e=0;do{var r=n.nextSibling;if(n.nodeType===1?t?(n._stashedDisplay=n.style.display,n.style.display=`none`):(n.style.display=n._stashedDisplay||``,n.getAttribute(`style`)===``&&n.removeAttribute(`style`)):n.nodeType===3&&(t?(n._stashedText=n.nodeValue,n.nodeValue=``):n.nodeValue=n._stashedText||``),r&&r.nodeType===8){if(n=r.data,n===`/$`){if(e===0)break;e--}else n!==`$`&&n!==`$?`&&n!==`$~`&&n!==`$!`||e++}n=r}while(n)}function ef(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var n=t;switch(t=t.nextSibling,n.nodeName){case`HTML`:case`HEAD`:case`BODY`:ef(n),Ct(n);continue;case`SCRIPT`:case`STYLE`:continue;case`LINK`:if(n.rel.toLowerCase()===`stylesheet`)continue}e.removeChild(n)}}function tf(e,t,n,r){for(;e.nodeType===1;){var i=n;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!r&&(e.nodeName!==`INPUT`||e.type!==`hidden`))break}else if(!r){if(t===`input`&&e.type===`hidden`){var a=i.name==null?null:``+i.name;if(i.type===`hidden`&&e.getAttribute(`name`)===a)return e}else return e}else if(!e[St])switch(t){case`meta`:if(!e.hasAttribute(`itemprop`))break;return e;case`link`:if(a=e.getAttribute(`rel`),a===`stylesheet`&&e.hasAttribute(`data-precedence`)||a!==i.rel||e.getAttribute(`href`)!==(i.href==null||i.href===``?null:i.href)||e.getAttribute(`crossorigin`)!==(i.crossOrigin==null?null:i.crossOrigin)||e.getAttribute(`title`)!==(i.title==null?null:i.title))break;return e;case`style`:if(e.hasAttribute(`data-precedence`))break;return e;case`script`:if(a=e.getAttribute(`src`),(a!==(i.src==null?null:i.src)||e.getAttribute(`type`)!==(i.type==null?null:i.type)||e.getAttribute(`crossorigin`)!==(i.crossOrigin==null?null:i.crossOrigin))&&a&&e.hasAttribute(`async`)&&!e.hasAttribute(`itemprop`))break;return e;default:return e}if(e=cf(e.nextSibling),e===null)break}return null}function nf(e,t,n){if(t===``)return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!==`INPUT`||e.type!==`hidden`)&&!n||(e=cf(e.nextSibling),e===null))return null;return e}function rf(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!==`INPUT`||e.type!==`hidden`)&&!t||(e=cf(e.nextSibling),e===null))return null;return e}function af(e){return e.data===`$?`||e.data===`$~`}function of(e){return e.data===`$!`||e.data===`$?`&&e.ownerDocument.readyState!==`loading`}function sf(e,t){var n=e.ownerDocument;if(e.data===`$~`)e._reactRetry=t;else if(e.data!==`$?`||n.readyState!==`loading`)t();else{var r=function(){t(),n.removeEventListener(`DOMContentLoaded`,r)};n.addEventListener(`DOMContentLoaded`,r),e._reactRetry=r}}function cf(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t===`$`||t===`$!`||t===`$?`||t===`$~`||t===`&`||t===`F!`||t===`F`)break;if(t===`/$`||t===`/&`)return null}}return e}var lf=null;function uf(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n===`/$`||n===`/&`){if(t===0)return cf(e.nextSibling);t--}else n!==`$`&&n!==`$!`&&n!==`$?`&&n!==`$~`&&n!==`&`||t++}e=e.nextSibling}return null}function df(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n===`$`||n===`$!`||n===`$?`||n===`$~`||n===`&`){if(t===0)return e;t--}else n!==`/$`&&n!==`/&`||t++}e=e.previousSibling}return null}function ff(e,t,n){switch(t=Bd(n),e){case`html`:if(e=t.documentElement,!e)throw Error(i(452));return e;case`head`:if(e=t.head,!e)throw Error(i(453));return e;case`body`:if(e=t.body,!e)throw Error(i(454));return e;default:throw Error(i(451))}}function pf(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);Ct(e)}var mf=new Map,hf=new Set;function gf(e){return typeof e.getRootNode==`function`?e.getRootNode():e.nodeType===9?e:e.ownerDocument}var _f=w.d;w.d={f:vf,r:yf,D:Sf,C:Cf,L:wf,m:Tf,X:Df,S:Ef,M:Of};function vf(){var e=_f.f(),t=bu();return e||t}function yf(e){var t=Tt(e);t!==null&&t.tag===5&&t.type===`form`?ks(t):_f.r(e)}var bf=typeof document>`u`?null:document;function xf(e,t,n){var r=bf;if(r&&typeof t==`string`&&t){var i=Kt(t);i=`link[rel="`+e+`"][href="`+i+`"]`,typeof n==`string`&&(i+=`[crossorigin="`+n+`"]`),hf.has(i)||(hf.add(i),e={rel:e,crossOrigin:n,href:t},r.querySelector(i)===null&&(t=r.createElement(`link`),Pd(t,`link`,e),A(t),r.head.appendChild(t)))}}function Sf(e){_f.D(e),xf(`dns-prefetch`,e,null)}function Cf(e,t){_f.C(e,t),xf(`preconnect`,e,t)}function wf(e,t,n){_f.L(e,t,n);var r=bf;if(r&&e&&t){var i=`link[rel="preload"][as="`+Kt(t)+`"]`;t===`image`&&n&&n.imageSrcSet?(i+=`[imagesrcset="`+Kt(n.imageSrcSet)+`"]`,typeof n.imageSizes==`string`&&(i+=`[imagesizes="`+Kt(n.imageSizes)+`"]`)):i+=`[href="`+Kt(e)+`"]`;var a=i;switch(t){case`style`:a=Af(e);break;case`script`:a=Pf(e)}mf.has(a)||(e=f({rel:`preload`,href:t===`image`&&n&&n.imageSrcSet?void 0:e,as:t},n),mf.set(a,e),r.querySelector(i)!==null||t===`style`&&r.querySelector(jf(a))||t===`script`&&r.querySelector(Ff(a))||(t=r.createElement(`link`),Pd(t,`link`,e),A(t),r.head.appendChild(t)))}}function Tf(e,t){_f.m(e,t);var n=bf;if(n&&e){var r=t&&typeof t.as==`string`?t.as:`script`,i=`link[rel="modulepreload"][as="`+Kt(r)+`"][href="`+Kt(e)+`"]`,a=i;switch(r){case`audioworklet`:case`paintworklet`:case`serviceworker`:case`sharedworker`:case`worker`:case`script`:a=Pf(e)}if(!mf.has(a)&&(e=f({rel:`modulepreload`,href:e},t),mf.set(a,e),n.querySelector(i)===null)){switch(r){case`audioworklet`:case`paintworklet`:case`serviceworker`:case`sharedworker`:case`worker`:case`script`:if(n.querySelector(Ff(a)))return}r=n.createElement(`link`),Pd(r,`link`,e),A(r),n.head.appendChild(r)}}}function Ef(e,t,n){_f.S(e,t,n);var r=bf;if(r&&e){var i=Dt(r).hoistableStyles,a=Af(e);t||=`default`;var o=i.get(a);if(!o){var s={loading:0,preload:null};if(o=r.querySelector(jf(a)))s.loading=5;else{e=f({rel:`stylesheet`,href:e,"data-precedence":t},n),(n=mf.get(a))&&Rf(e,n);var c=o=r.createElement(`link`);A(c),Pd(c,`link`,e),c._p=new Promise(function(e,t){c.onload=e,c.onerror=t}),c.addEventListener(`load`,function(){s.loading|=1}),c.addEventListener(`error`,function(){s.loading|=2}),s.loading|=4,Lf(o,t,r)}o={type:`stylesheet`,instance:o,count:1,state:s},i.set(a,o)}}}function Df(e,t){_f.X(e,t);var n=bf;if(n&&e){var r=Dt(n).hoistableScripts,i=Pf(e),a=r.get(i);a||(a=n.querySelector(Ff(i)),a||(e=f({src:e,async:!0},t),(t=mf.get(i))&&zf(e,t),a=n.createElement(`script`),A(a),Pd(a,`link`,e),n.head.appendChild(a)),a={type:`script`,instance:a,count:1,state:null},r.set(i,a))}}function Of(e,t){_f.M(e,t);var n=bf;if(n&&e){var r=Dt(n).hoistableScripts,i=Pf(e),a=r.get(i);a||(a=n.querySelector(Ff(i)),a||(e=f({src:e,async:!0,type:`module`},t),(t=mf.get(i))&&zf(e,t),a=n.createElement(`script`),A(a),Pd(a,`link`,e),n.head.appendChild(a)),a={type:`script`,instance:a,count:1,state:null},r.set(i,a))}}function kf(e,t,n,r){var a=(a=_e.current)?gf(a):null;if(!a)throw Error(i(446));switch(e){case`meta`:case`title`:return null;case`style`:return typeof n.precedence==`string`&&typeof n.href==`string`?(t=Af(n.href),n=Dt(a).hoistableStyles,r=n.get(t),r||(r={type:`style`,instance:null,count:0,state:null},n.set(t,r)),r):{type:`void`,instance:null,count:0,state:null};case`link`:if(n.rel===`stylesheet`&&typeof n.href==`string`&&typeof n.precedence==`string`){e=Af(n.href);var o=Dt(a).hoistableStyles,s=o.get(e);if(s||(a=a.ownerDocument||a,s={type:`stylesheet`,instance:null,count:0,state:{loading:0,preload:null}},o.set(e,s),(o=a.querySelector(jf(e)))&&!o._p&&(s.instance=o,s.state.loading=5),mf.has(e)||(n={rel:`preload`,as:`style`,href:n.href,crossOrigin:n.crossOrigin,integrity:n.integrity,media:n.media,hrefLang:n.hrefLang,referrerPolicy:n.referrerPolicy},mf.set(e,n),o||Nf(a,e,n,s.state))),t&&r===null)throw Error(i(528,``));return s}if(t&&r!==null)throw Error(i(529,``));return null;case`script`:return t=n.async,n=n.src,typeof n==`string`&&t&&typeof t!=`function`&&typeof t!=`symbol`?(t=Pf(n),n=Dt(a).hoistableScripts,r=n.get(t),r||(r={type:`script`,instance:null,count:0,state:null},n.set(t,r)),r):{type:`void`,instance:null,count:0,state:null};default:throw Error(i(444,e))}}function Af(e){return`href="`+Kt(e)+`"`}function jf(e){return`link[rel="stylesheet"][`+e+`]`}function Mf(e){return f({},e,{"data-precedence":e.precedence,precedence:null})}function Nf(e,t,n,r){e.querySelector(`link[rel="preload"][as="style"][`+t+`]`)?r.loading=1:(t=e.createElement(`link`),r.preload=t,t.addEventListener(`load`,function(){return r.loading|=1}),t.addEventListener(`error`,function(){return r.loading|=2}),Pd(t,`link`,n),A(t),e.head.appendChild(t))}function Pf(e){return`[src="`+Kt(e)+`"]`}function Ff(e){return`script[async]`+e}function If(e,t,n){if(t.count++,t.instance===null)switch(t.type){case`style`:var r=e.querySelector(`style[data-href~="`+Kt(n.href)+`"]`);if(r)return t.instance=r,A(r),r;var a=f({},n,{"data-href":n.href,"data-precedence":n.precedence,href:null,precedence:null});return r=(e.ownerDocument||e).createElement(`style`),A(r),Pd(r,`style`,a),Lf(r,n.precedence,e),t.instance=r;case`stylesheet`:a=Af(n.href);var o=e.querySelector(jf(a));if(o)return t.state.loading|=4,t.instance=o,A(o),o;r=Mf(n),(a=mf.get(a))&&Rf(r,a),o=(e.ownerDocument||e).createElement(`link`),A(o);var s=o;return s._p=new Promise(function(e,t){s.onload=e,s.onerror=t}),Pd(o,`link`,r),t.state.loading|=4,Lf(o,n.precedence,e),t.instance=o;case`script`:return o=Pf(n.src),(a=e.querySelector(Ff(o)))?(t.instance=a,A(a),a):(r=n,(a=mf.get(o))&&(r=f({},n),zf(r,a)),e=e.ownerDocument||e,a=e.createElement(`script`),A(a),Pd(a,`link`,r),e.head.appendChild(a),t.instance=a);case`void`:return null;default:throw Error(i(443,t.type))}else t.type===`stylesheet`&&!(t.state.loading&4)&&(r=t.instance,t.state.loading|=4,Lf(r,n.precedence,e));return t.instance}function Lf(e,t,n){for(var r=n.querySelectorAll(`link[rel="stylesheet"][data-precedence],style[data-precedence]`),i=r.length?r[r.length-1]:null,a=i,o=0;o<r.length;o++){var s=r[o];if(s.dataset.precedence===t)a=s;else if(a!==i)break}a?a.parentNode.insertBefore(e,a.nextSibling):(t=n.nodeType===9?n.head:n,t.insertBefore(e,t.firstChild))}function Rf(e,t){e.crossOrigin??=t.crossOrigin,e.referrerPolicy??=t.referrerPolicy,e.title??=t.title}function zf(e,t){e.crossOrigin??=t.crossOrigin,e.referrerPolicy??=t.referrerPolicy,e.integrity??=t.integrity}var Bf=null;function Vf(e,t,n){if(Bf===null){var r=new Map,i=Bf=new Map;i.set(n,r)}else i=Bf,r=i.get(n),r||(r=new Map,i.set(n,r));if(r.has(e))return r;for(r.set(e,null),n=n.getElementsByTagName(e),i=0;i<n.length;i++){var a=n[i];if(!(a[St]||a[k]||e===`link`&&a.getAttribute(`rel`)===`stylesheet`)&&a.namespaceURI!==`http://www.w3.org/2000/svg`){var o=a.getAttribute(t)||``;o=e+o;var s=r.get(o);s?s.push(a):r.set(o,[a])}}return r}function Hf(e,t,n){e=e.ownerDocument||e,e.head.insertBefore(n,t===`title`?e.querySelector(`head > title`):null)}function Uf(e,t,n){if(n===1||t.itemProp!=null)return!1;switch(e){case`meta`:case`title`:return!0;case`style`:if(typeof t.precedence!=`string`||typeof t.href!=`string`||t.href===``)break;return!0;case`link`:if(typeof t.rel!=`string`||typeof t.href!=`string`||t.href===``||t.onLoad||t.onError)break;switch(t.rel){case`stylesheet`:return e=t.disabled,typeof t.precedence==`string`&&e==null;default:return!0}case`script`:if(t.async&&typeof t.async!=`function`&&typeof t.async!=`symbol`&&!t.onLoad&&!t.onError&&t.src&&typeof t.src==`string`)return!0}return!1}function Wf(e){return!(e.type===`stylesheet`&&!(e.state.loading&3))}function Gf(e,t,n,r){if(n.type===`stylesheet`&&(typeof r.media!=`string`||!1!==matchMedia(r.media).matches)&&!(n.state.loading&4)){if(n.instance===null){var i=Af(r.href),a=t.querySelector(jf(i));if(a){t=a._p,typeof t==`object`&&t&&typeof t.then==`function`&&(e.count++,e=Jf.bind(e),t.then(e,e)),n.state.loading|=4,n.instance=a,A(a);return}a=t.ownerDocument||t,r=Mf(r),(i=mf.get(i))&&Rf(r,i),a=a.createElement(`link`),A(a);var o=a;o._p=new Promise(function(e,t){o.onload=e,o.onerror=t}),Pd(a,`link`,r),n.instance=a}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(n,t),(t=n.state.preload)&&!(n.state.loading&3)&&(e.count++,n=Jf.bind(e),t.addEventListener(`load`,n),t.addEventListener(`error`,n))}}var Kf=0;function qf(e,t){return e.stylesheets&&e.count===0&&Xf(e,e.stylesheets),0<e.count||0<e.imgCount?function(n){var r=setTimeout(function(){if(e.stylesheets&&Xf(e,e.stylesheets),e.unsuspend){var t=e.unsuspend;e.unsuspend=null,t()}},6e4+t);0<e.imgBytes&&Kf===0&&(Kf=62500*Ld());var i=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&Xf(e,e.stylesheets),e.unsuspend)){var t=e.unsuspend;e.unsuspend=null,t()}},(e.imgBytes>Kf?50:800)+t);return e.unsuspend=n,function(){e.unsuspend=null,clearTimeout(r),clearTimeout(i)}}:null}function Jf(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)Xf(this,this.stylesheets);else if(this.unsuspend){var e=this.unsuspend;this.unsuspend=null,e()}}}var Yf=null;function Xf(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,Yf=new Map,t.forEach(Zf,e),Yf=null,Jf.call(e))}function Zf(e,t){if(!(t.state.loading&4)){var n=Yf.get(e);if(n)var r=n.get(null);else{n=new Map,Yf.set(e,n);for(var i=e.querySelectorAll(`link[data-precedence],style[data-precedence]`),a=0;a<i.length;a++){var o=i[a];(o.nodeName===`LINK`||o.getAttribute(`media`)!==`not all`)&&(n.set(o.dataset.precedence,o),r=o)}r&&n.set(null,r)}i=t.instance,o=i.getAttribute(`data-precedence`),a=n.get(o)||r,a===r&&n.set(null,i),n.set(o,i),this.count++,r=Jf.bind(this),i.addEventListener(`load`,r),i.addEventListener(`error`,r),a?a.parentNode.insertBefore(i,a.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(i,e.firstChild)),t.state.loading|=4}}var Qf={$$typeof:x,Provider:null,Consumer:null,_currentValue:de,_currentValue2:de,_threadCount:0};function $f(e,t,n,r,i,a,o,s,c){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=at(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=at(0),this.hiddenUpdates=at(null),this.identifierPrefix=r,this.onUncaughtError=i,this.onCaughtError=a,this.onRecoverableError=o,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=c,this.incompleteTransitions=new Map}function ep(e,t,n,r,i,a,o,s,c,l,u,d){return e=new $f(e,t,n,o,c,l,u,d,s),t=1,!0===a&&(t|=24),a=hi(3,null,null,t),e.current=a,a.stateNode=e,t=pa(),t.refCount++,e.pooledCache=t,t.refCount++,a.memoizedState={element:r,isDehydrated:n,cache:t},Ka(a),e}function tp(e){return e?(e=pi,e):pi}function np(e,t,n,r,i,a){i=tp(i),r.context===null?r.context=i:r.pendingContext=i,r=Ja(t),r.payload={element:n},a=a===void 0?null:a,a!==null&&(r.callback=a),n=Ya(e,r,t),n!==null&&(hu(n,e,t),Xa(n,e,t))}function rp(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var n=e.retryLane;e.retryLane=n!==0&&n<t?n:t}}function ip(e,t){rp(e,t),(e=e.alternate)&&rp(e,t)}function ap(e){if(e.tag===13||e.tag===31){var t=ui(e,67108864);t!==null&&hu(t,e,67108864),ip(e,67108864)}}function op(e){if(e.tag===13||e.tag===31){var t=pu();t=dt(t);var n=ui(e,t);n!==null&&hu(n,e,t),ip(e,t)}}var sp=!0;function cp(e,t,n,r){var i=C.T;C.T=null;var a=w.p;try{w.p=2,up(e,t,n,r)}finally{w.p=a,C.T=i}}function lp(e,t,n,r){var i=C.T;C.T=null;var a=w.p;try{w.p=8,up(e,t,n,r)}finally{w.p=a,C.T=i}}function up(e,t,n,r){if(sp){var i=dp(r);if(i===null)wd(e,t,r,fp,n),Cp(e,r);else if(Tp(i,e,t,n,r))r.stopPropagation();else if(Cp(e,r),t&4&&-1<Sp.indexOf(e)){for(;i!==null;){var a=Tt(i);if(a!==null)switch(a.tag){case 3:if(a=a.stateNode,a.current.memoizedState.isDehydrated){var o=et(a.pendingLanes);if(o!==0){var s=a;for(s.pendingLanes|=2,s.entangledLanes|=2;o;){var c=1<<31-qe(o);s.entanglements[1]|=c,o&=~c}rd(a),!(G&6)&&(tu=Ie()+500,id(0,!1))}}break;case 31:case 13:s=ui(a,2),s!==null&&hu(s,a,2),bu(),ip(a,2)}if(a=dp(r),a===null&&wd(e,t,r,fp,n),a===i)break;i=a}i!==null&&r.stopPropagation()}else wd(e,t,r,null,n)}}function dp(e){return e=un(e),pp(e)}var fp=null;function pp(e){if(fp=null,e=wt(e),e!==null){var t=o(e);if(t===null)e=null;else{var n=t.tag;if(n===13){if(e=s(t),e!==null)return e;e=null}else if(n===31){if(e=c(t),e!==null)return e;e=null}else if(n===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return fp=e,null}function mp(e){switch(e){case`beforetoggle`:case`cancel`:case`click`:case`close`:case`contextmenu`:case`copy`:case`cut`:case`auxclick`:case`dblclick`:case`dragend`:case`dragstart`:case`drop`:case`focusin`:case`focusout`:case`input`:case`invalid`:case`keydown`:case`keypress`:case`keyup`:case`mousedown`:case`mouseup`:case`paste`:case`pause`:case`play`:case`pointercancel`:case`pointerdown`:case`pointerup`:case`ratechange`:case`reset`:case`resize`:case`seeked`:case`submit`:case`toggle`:case`touchcancel`:case`touchend`:case`touchstart`:case`volumechange`:case`change`:case`selectionchange`:case`textInput`:case`compositionstart`:case`compositionend`:case`compositionupdate`:case`beforeblur`:case`afterblur`:case`beforeinput`:case`blur`:case`fullscreenchange`:case`focus`:case`hashchange`:case`popstate`:case`select`:case`selectstart`:return 2;case`drag`:case`dragenter`:case`dragexit`:case`dragleave`:case`dragover`:case`mousemove`:case`mouseout`:case`mouseover`:case`pointermove`:case`pointerout`:case`pointerover`:case`scroll`:case`touchmove`:case`wheel`:case`mouseenter`:case`mouseleave`:case`pointerenter`:case`pointerleave`:return 8;case`message`:switch(Le()){case O:return 2;case Re:return 8;case ze:case Be:return 32;case Ve:return 268435456;default:return 32}default:return 32}}var hp=!1,gp=null,_p=null,vp=null,yp=new Map,bp=new Map,xp=[],Sp=`mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset`.split(` `);function Cp(e,t){switch(e){case`focusin`:case`focusout`:gp=null;break;case`dragenter`:case`dragleave`:_p=null;break;case`mouseover`:case`mouseout`:vp=null;break;case`pointerover`:case`pointerout`:yp.delete(t.pointerId);break;case`gotpointercapture`:case`lostpointercapture`:bp.delete(t.pointerId)}}function wp(e,t,n,r,i,a){return e===null||e.nativeEvent!==a?(e={blockedOn:t,domEventName:n,eventSystemFlags:r,nativeEvent:a,targetContainers:[i]},t!==null&&(t=Tt(t),t!==null&&ap(t)),e):(e.eventSystemFlags|=r,t=e.targetContainers,i!==null&&t.indexOf(i)===-1&&t.push(i),e)}function Tp(e,t,n,r,i){switch(t){case`focusin`:return gp=wp(gp,e,t,n,r,i),!0;case`dragenter`:return _p=wp(_p,e,t,n,r,i),!0;case`mouseover`:return vp=wp(vp,e,t,n,r,i),!0;case`pointerover`:var a=i.pointerId;return yp.set(a,wp(yp.get(a)||null,e,t,n,r,i)),!0;case`gotpointercapture`:return a=i.pointerId,bp.set(a,wp(bp.get(a)||null,e,t,n,r,i)),!0}return!1}function Ep(e){var t=wt(e.target);if(t!==null){var n=o(t);if(n!==null){if(t=n.tag,t===13){if(t=s(n),t!==null){e.blockedOn=t,mt(e.priority,function(){op(n)});return}}else if(t===31){if(t=c(n),t!==null){e.blockedOn=t,mt(e.priority,function(){op(n)});return}}else if(t===3&&n.stateNode.current.memoizedState.isDehydrated){e.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}e.blockedOn=null}function Dp(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var n=dp(e.nativeEvent);if(n===null){n=e.nativeEvent;var r=new n.constructor(n.type,n);ln=r,n.target.dispatchEvent(r),ln=null}else return t=Tt(n),t!==null&&ap(t),e.blockedOn=n,!1;t.shift()}return!0}function Op(e,t,n){Dp(e)&&n.delete(t)}function kp(){hp=!1,gp!==null&&Dp(gp)&&(gp=null),_p!==null&&Dp(_p)&&(_p=null),vp!==null&&Dp(vp)&&(vp=null),yp.forEach(Op),bp.forEach(Op)}function Ap(e,n){e.blockedOn===n&&(e.blockedOn=null,hp||(hp=!0,t.unstable_scheduleCallback(t.unstable_NormalPriority,kp)))}var jp=null;function Mp(e){jp!==e&&(jp=e,t.unstable_scheduleCallback(t.unstable_NormalPriority,function(){jp===e&&(jp=null);for(var t=0;t<e.length;t+=3){var n=e[t],r=e[t+1],i=e[t+2];if(typeof r!=`function`){if(pp(r||n)===null)continue;break}var a=Tt(n);a!==null&&(e.splice(t,3),t-=3,Ds(a,{pending:!0,data:i,method:n.method,action:r},r,i))}}))}function Np(e){function t(t){return Ap(t,e)}gp!==null&&Ap(gp,e),_p!==null&&Ap(_p,e),vp!==null&&Ap(vp,e),yp.forEach(t),bp.forEach(t);for(var n=0;n<xp.length;n++){var r=xp[n];r.blockedOn===e&&(r.blockedOn=null)}for(;0<xp.length&&(n=xp[0],n.blockedOn===null);)Ep(n),n.blockedOn===null&&xp.shift();if(n=(e.ownerDocument||e).$$reactFormReplay,n!=null)for(r=0;r<n.length;r+=3){var i=n[r],a=n[r+1],o=i[gt]||null;if(typeof a==`function`)o||Mp(n);else if(o){var s=null;if(a&&a.hasAttribute(`formAction`)){if(i=a,o=a[gt]||null)s=o.formAction;else if(pp(i)!==null)continue}else s=o.action;typeof s==`function`?n[r+1]=s:(n.splice(r,3),r-=3),Mp(n)}}}function Pp(){function e(e){e.canIntercept&&e.info===`react-transition`&&e.intercept({handler:function(){return new Promise(function(e){return i=e})},focusReset:`manual`,scroll:`manual`})}function t(){i!==null&&(i(),i=null),r||setTimeout(n,20)}function n(){if(!r&&!navigation.transition){var e=navigation.currentEntry;e&&e.url!=null&&navigation.navigate(e.url,{state:e.getState(),info:`react-transition`,history:`replace`})}}if(typeof navigation==`object`){var r=!1,i=null;return navigation.addEventListener(`navigate`,e),navigation.addEventListener(`navigatesuccess`,t),navigation.addEventListener(`navigateerror`,t),setTimeout(n,100),function(){r=!0,navigation.removeEventListener(`navigate`,e),navigation.removeEventListener(`navigatesuccess`,t),navigation.removeEventListener(`navigateerror`,t),i!==null&&(i(),i=null)}}}function Fp(e){this._internalRoot=e}Ip.prototype.render=Fp.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(i(409));var n=t.current;np(n,pu(),e,t,null,null)},Ip.prototype.unmount=Fp.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;np(e.current,2,null,e,null,null),bu(),t[_t]=null}};function Ip(e){this._internalRoot=e}Ip.prototype.unstable_scheduleHydration=function(e){if(e){var t=pt();e={blockedOn:null,target:e,priority:t};for(var n=0;n<xp.length&&t!==0&&t<xp[n].priority;n++);xp.splice(n,0,e),n===0&&Ep(e)}};var Lp=n.version;if(Lp!==`19.2.8`)throw Error(i(527,Lp,`19.2.8`));w.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render==`function`?Error(i(188)):(e=Object.keys(e).join(`,`),Error(i(268,e)));return e=u(t),e=e===null?null:d(e),e=e===null?null:e.stateNode,e};var Rp={bundleType:0,version:`19.2.8`,rendererPackageName:`react-dom`,currentDispatcherRef:C,reconcilerVersion:`19.2.8`};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<`u`){var zp=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!zp.isDisabled&&zp.supportsFiber)try{We=zp.inject(Rp),Ge=zp}catch{}}e.createRoot=function(e,t){if(!a(e))throw Error(i(299));var n=!1,r=``,o=Xs,s=Zs,c=Qs;return t!=null&&(!0===t.unstable_strictMode&&(n=!0),t.identifierPrefix!==void 0&&(r=t.identifierPrefix),t.onUncaughtError!==void 0&&(o=t.onUncaughtError),t.onCaughtError!==void 0&&(s=t.onCaughtError),t.onRecoverableError!==void 0&&(c=t.onRecoverableError)),t=ep(e,1,!1,null,null,n,r,null,o,s,c,Pp),e[_t]=t.current,Sd(e),new Fp(t)}})),Ae=n(((e,t)=>{function n(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>`u`||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!=`function`))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n)}catch(e){console.error(e)}}n(),t.exports=ke()})),D=e(m(),1),je=Ae(),Me={classic:{light:{colors:{background:`#FBFBF9`,surface:`#FBFBF9`,ink:`#0B0B0B`,muted:`#65655F`,primary:`#111111`,accent:`#D9DDC8`,border:`#E3E3DF`,subtle:`#F1F1EE`,danger:`#a52a33`,dangerSurface:`#fff1f2`,success:`#286445`},paper:`251, 251, 249`,sidePaper:`241, 241, 238`,vars:{"nav-active-bg":`#333830`,"nav-active-ink":`#fbfbf9`,"nav-active-edge":`transparent`,"nav-hover-bg":`#e5e5de`,"nav-hover-ink":`#111`,"nav-dim":`#77776f`,"scroll-thumb":`#9daaa5`,"scroll-track":`#edf0eb`,"scroll-thumb-hover":`#748d85`,"switch-off":`#a5aaa1`,"switch-on":`#8ca397`,"switch-knob":`#fbfbf9`,"solid-bg":`#111`,"solid-ink":`#fbfbf9`,"quick-hover":`#eaeae4`,"roster-bg":`linear-gradient(135deg, rgba(194, 201, 204, 0.62), rgba(156, 166, 172, 0.52))`,"roster-ink":`#364148`,"roster-label":`#44535d`,"docs-accent":`#426450`,"docs-wash":`#e9eee6`,"docs-accent-ink":`#2b4a37`,"docs-on-accent":`#fff`,"docs-scene":`#142823`,"docs-scene-grid":`#8dba8c14`,"docs-scene-ink":`#dce9cd`,"docs-scene-mark":`#c8d895`,"patch-buff":`#326345`,"patch-nerf":`#aa3535`,"patch-adjust":`#8a6417`}},dark:{colors:{background:`#131719`,surface:`#22282a`,ink:`#ebe8df`,muted:`#b2b6b2`,primary:`#d9dfce`,accent:`#485749`,border:`#414a49`,subtle:`#2b3233`,danger:`#f19292`,dangerSurface:`#3b2529`,success:`#8bc497`},paper:`19, 23, 25`,sidePaper:`26, 30, 31`,vars:{"nav-active-bg":`#536356`,"nav-active-ink":`#f4f4ee`,"nav-active-edge":`transparent`,"nav-hover-bg":`#343d3d`,"nav-hover-ink":`#ebe8df`,"nav-dim":`#a5a9a1`,"scroll-thumb":`#67776e`,"scroll-track":`#242c2c`,"scroll-thumb-hover":`#748d85`,"switch-off":`#a5aaa1`,"switch-on":`#8ca397`,"switch-knob":`#fbfbf9`,"solid-bg":`#c0cbb7`,"solid-ink":`#17201c`,"quick-hover":`#343d3d`,"roster-bg":`linear-gradient(135deg, rgba(83, 95, 104, 0.66), rgba(50, 60, 68, 0.7))`,"roster-ink":`#dce3e8`,"roster-label":`#bac8d1`,"docs-accent":`#b7c9a5`,"docs-wash":`#27352d`,"docs-accent-ink":`#c9dbb9`,"docs-on-accent":`#17201c`,"docs-scene":`#142823`,"docs-scene-grid":`#8dba8c14`,"docs-scene-ink":`#dce9cd`,"docs-scene-mark":`#c8d895`,"patch-buff":`#8acb87`,"patch-nerf":`#ed8985`,"patch-adjust":`#e2b07a`}}},visualiser:{light:{colors:{background:`#f6f4f1`,surface:`#fbfaf8`,ink:`#171719`,muted:`#6b6467`,primary:`#b8483a`,accent:`#f6d9d3`,border:`#e4dedb`,subtle:`#efebe8`,danger:`#a52a33`,dangerSurface:`#fff1f2`,success:`#2c6b4a`},paper:`246, 244, 241`,sidePaper:`239, 236, 233`,vars:{"nav-active-bg":`#201e22`,"nav-active-ink":`#f7f5f3`,"nav-active-edge":`#e0614e`,"nav-hover-bg":`#ebe6e3`,"nav-hover-ink":`#171719`,"nav-dim":`#7d7579`,"scroll-thumb":`#c2b9b6`,"scroll-track":`#efebe8`,"scroll-thumb-hover":`#a1979a`,"switch-off":`#a39a9d`,"switch-on":`#d65f4d`,"switch-knob":`#fbfaf8`,"solid-bg":`#171719`,"solid-ink":`#f7f5f3`,"quick-hover":`#ece7e4`,"roster-bg":`linear-gradient(135deg, rgba(233, 225, 221, 0.78), rgba(216, 206, 202, 0.66))`,"roster-ink":`#2a2528`,"roster-label":`#6b6467`,"docs-accent":`#c0503f`,"docs-wash":`#f8e5e0`,"docs-accent-ink":`#8f3528`,"docs-on-accent":`#fff`,"docs-scene":`#1c1b1f`,"docs-scene-grid":`#ffffff0f`,"docs-scene-ink":`#efe7e1`,"docs-scene-mark":`#ff9a8b`,"patch-buff":`#2c7a52`,"patch-nerf":`#b23b33`,"patch-adjust":`#8a6417`}},dark:{colors:{background:`#171719`,surface:`#202023`,ink:`#f5f2ed`,muted:`#b4adb0`,primary:`#ff8777`,accent:`#49312f`,border:`#3d3b3f`,subtle:`#2b292d`,danger:`#ffaba5`,dangerSurface:`#3a2426`,success:`#8fd0a6`},paper:`23, 23, 25`,sidePaper:`30, 29, 32`,vars:{"nav-active-bg":`#49312f`,"nav-active-ink":`#fff1ec`,"nav-active-edge":`#ff8777`,"nav-hover-bg":`#2b292d`,"nav-hover-ink":`#f5f2ed`,"nav-dim":`#a59ea1`,"scroll-thumb":`#4c474d`,"scroll-track":`#1e1e21`,"scroll-thumb-hover":`#6a646b`,"switch-off":`#5b5559`,"switch-on":`#ff8777`,"switch-knob":`#fbfaf8`,"solid-bg":`#ff8777`,"solid-ink":`#241614`,"quick-hover":`#2b292d`,"roster-bg":`linear-gradient(135deg, rgba(43, 41, 45, 0.8), rgba(32, 32, 35, 0.84))`,"roster-ink":`#f5f2ed`,"roster-label":`#b4adb0`,"docs-accent":`#ff8777`,"docs-wash":`#3a2725`,"docs-accent-ink":`#ffb4a8`,"docs-on-accent":`#241614`,"docs-scene":`#1c1b1f`,"docs-scene-grid":`#ffffff0f`,"docs-scene-ink":`#efe7e1`,"docs-scene-mark":`#ff9a8b`,"patch-buff":`#8fd0a6`,"patch-nerf":`#ff8f86`,"patch-adjust":`#e7b56f`}}}}.classic;function Ne(e){let{paper:t,sidePaper:n,vars:r}=Me[e];return[`--main-paper-rgb: ${t};`,`--side-paper-rgb: ${n};`,...Object.entries(r).map(([e,t])=>`--${e}: ${t};`)].join(`
`)}var Pe={colors:Me.light.colors,fonts:{body:`Archivo, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`,mono:`"IBM Plex Mono", ui-monospace, SFMono-Regular, Consolas, monospace`},radii:{small:`0.125rem`,medium:`0.25rem`,large:`0.25rem`,pill:`999px`},spacing:{xs:`0.375rem`,sm:`0.75rem`,md:`1rem`,lg:`1.5rem`,xl:`2rem`,xxl:`3rem`},widths:{content:`1120px`},breakpoints:{mobile:`700px`}},Fe={...Pe,colors:Me.dark.colors},Ie=(0,D.createContext)({mode:`dark`,toggleMode:()=>{}}),Le=()=>(0,D.useContext)(Ie),O=f(),Re=d`
	*,
	*::before,
	*::after {
		box-sizing: border-box;
	}
	:root {
		--page-ink: ${({theme:e})=>e.colors.ink};
		--muted-ink: ${({theme:e})=>e.colors.muted};
		--panel-border: ${({theme:e})=>e.colors.border};
		--panel-surface: ${({theme:e})=>e.colors.surface};
		--panel-subtle: ${({theme:e})=>e.colors.subtle};
		${Ne(`light`)}
		color-scheme: light;
	}
	:root[data-theme='dark'] {
		color-scheme: dark;
		${Ne(`dark`)}
	}
	body {
		margin: 0;
		background: ${({theme:e})=>e.colors.background};
		color: ${({theme:e})=>e.colors.ink};
		font-family: ${({theme:e})=>e.fonts.body};
		line-height: 1.6;
		-webkit-font-smoothing: antialiased;
	}
	button,
	input {
		font: inherit;
	}
	button,
	a {
		-webkit-tap-highlight-color: transparent;
	}
	button {
		cursor: pointer;
	}
	button:disabled {
		cursor: not-allowed;
		opacity: 0.55;
	}
	a {
		color: ${({theme:e})=>e.colors.primary};
		text-underline-offset: 0.2em;
	}
	:focus-visible {
		outline: 3px solid ${({theme:e})=>e.colors.primary};
		outline-offset: 4px;
	}
	h1,
	h2,
	h3,
	h4,
	p {
		margin-top: 0;
	}
	h1,
	h2,
	h3,
	h4 {
		line-height: 1.2;
		overflow-wrap: anywhere;
	}
	h1,
	h2 {
		letter-spacing: -0.04em;
	}
	img {
		max-width: 100%;
	}
	code {
		font-family: ${({theme:e})=>e.fonts.mono};
		overflow-wrap: anywhere;
		font-size: 0.85em;
	}
	::selection {
		background: ${({theme:e})=>e.colors.accent};
		color: ${({theme:e})=>e.colors.ink};
	}
	@media (prefers-reduced-motion: reduce) {
		*,
		*::before,
		*::after {
			scroll-behavior: auto !important;
			animation-duration: 0.01ms !important;
			transition-duration: 0.01ms !important;
		}
	}
`,ze=t.main`
	max-width: 40rem;
	margin: 12vh auto;
	padding: ${({theme:e})=>e.spacing.xl};
`,Be=class extends D.Component{state={failed:!1,accessError:null};static getDerivedStateFromError(e){return{failed:!0,accessError:e instanceof ve?e:null}}componentDidCatch(e,t){}render(){return this.state.failed?(0,O.jsxs)(ze,{children:[(0,O.jsx)(`h1`,{children:this.state.accessError?`Unable to load this page`:`Something went wrong`}),(0,O.jsx)(`p`,{children:this.state.accessError?.reason===`denied`?`Event access has changed. Returning to the event home page.`:this.state.accessError?`Page files could not be loaded. Check your connection and that cookies are allowed for this site, then reload.`:`Reload the page to try again.`}),(0,O.jsx)(`a`,{href:window.location.pathname+window.location.search+window.location.hash,children:`Reload this page`})]}):this.props.children}};function Ve({children:e}){let[t,n]=(0,D.useState)(()=>{try{let e=localStorage.getItem(`cambc-color-mode`);if(e===`dark`||e===`light`)return e}catch{}return`dark`});return(0,D.useLayoutEffect)(()=>{document.documentElement.dataset.theme=t;try{localStorage.setItem(`cambc-color-mode`,t)}catch{}},[t]),(0,O.jsx)(Ie.Provider,{value:{mode:t,toggleMode:()=>n(e=>e===`light`?`dark`:`light`)},children:(0,O.jsxs)(l,{theme:t===`dark`?Fe:Pe,children:[(0,O.jsx)(Re,{}),(0,O.jsx)(Be,{children:e})]})})}var He=d`
	.front-page {
		color: var(--page-ink);
	}

	.front-page h1,
	.front-page h2 {
		font-weight: 500;
		letter-spacing: -0.055em;
	}

	.front-page em {
		font-family: "Cormorant Garamond", Georgia, serif;
		font-weight: 400;
	}

	.front-header {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: 24px;
		padding: 0 0 20px;
		border-bottom: 1px solid var(--panel-border);
	}

	.front-header h1 {
		font-size: clamp(28px, 3vw, 42px);
		line-height: 1.1;
		margin: 0;
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.front-header h1 em {
		font-size: 1.08em;
	}

	.front-header p {
		margin: 0;
		font-size: 13px;
		color: var(--muted-ink);
	}

	.socials {
		align-self: start;
		padding-top: 4px;
	}

	.socials > div {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		gap: 8px;
		margin: 7px 0 0;
	}

	.socials a,
	.socials button {
		display: flex;
		align-items: center;
		gap: 12px;
		border: 1px solid var(--panel-border);
		padding: 9px 12px;
		background: rgba(var(--main-paper-rgb), 0.65);
		text-decoration: none;
		font-size: 12px;
		color: var(--page-ink);
	}

	.socials button:disabled {
		opacity: 1;
		color: var(--muted-ink);
	}

	.socials a svg:last-child,
	.socials button span {
		margin-left: auto;
		font:
			9px "IBM Plex Mono",
			monospace;
		text-transform: uppercase;
	}

	.social-note {
		font:
			10px/1.6 "IBM Plex Mono",
			monospace;
		color: var(--muted-ink);
	}

	.dashboard-grid {
		display: grid;
		grid-template-columns: minmax(0, 1.6fr) minmax(300px, 1fr);
	}

	.dashboard-left,
	.dashboard-right {
		min-width: 0;
	}

	.dashboard-left {
		border-right: 1px solid var(--panel-border);
		container: home-left / inline-size;
	}

	.home-deadline-notice:not(:empty) {
		padding: 20px 0 0 22px;
	}

	.home-deadline-notice > section + section { margin-top: 0.75rem; }

	.home-deadline-notice > section {
		margin-bottom: 0;
		line-height: 1.6;
		overflow-wrap: anywhere;
	}

	@media (max-width: 760px) {
		.home-deadline-notice:not(:empty) {
			padding-left: 0;
		}
	}

	.about-panel {
		padding: 26px 28px 26px 0;
	}

	.about-panel h2 {
		font-size: 28px;
		margin: 16px 0 14px;
	}

	.about-panel p {
		font-size: 13px;
		line-height: 1.8;
		color: var(--muted-ink);
		margin: 0;
		max-width: 52em;
	}

	.quick-access {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		border-block: 1px solid var(--panel-border);
	}

	.quick-access a {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px;
		padding: 19px 14px;
		text-decoration: none;
		border-right: 1px solid var(--panel-border);
		transition: background 0.2s;
	}

	.quick-access a:first-child {
		padding-left: 0;
	}

	.quick-access a:last-child {
		border-right: 0;
	}

	.quick-access a:hover {
		background: var(--quick-hover);
	}

	.quick-access a > svg:first-child {
		width: 25px;
		height: 25px;
	}

	.quick-access a > svg:last-child {
		width: 12px;
		height: 12px;
		margin-left: auto;
	}

	.quick-access strong {
		display: block;
		font-size: 11px;
		font-weight: 600;
	}

	.quick-access small {
		display: block;
		color: var(--muted-ink);
		font-size: 9px;
	}

	@media (max-width: 1100px) {
		.dashboard-grid {
			grid-template-columns: minmax(0, 1.4fr) minmax(280px, 1fr);
		}
	}

	@media (max-width: 1100px) {
		.quick-access a {
			gap: 8px;
		}
	}

	@media (max-width: 1100px) {
		.quick-access a > svg:last-child {
			display: none;
		}
	}

	@media (max-width: 760px) {
		.front-header {
			grid-template-columns: minmax(0, 1fr);
			gap: 16px;
		}
	}

	@media (max-width: 760px) {
		.socials > div {
			flex-direction: row;
		}
	}

	@media (max-width: 760px) {
		.socials a,
		.socials button {
			flex: 1;
		}
	}

	@media (max-width: 760px) {
		.socials {
			padding: 0;
		}
	}

	@media (max-width: 760px) {
		.social-note {
			display: none;
		}
	}

	@media (max-width: 760px) {
		.dashboard-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 760px) {
		.dashboard-left {
			border: 0;
		}
	}

	@media (max-width: 760px) {
		.about-panel {
			padding-right: 0;
		}
	}

	@media (max-width: 760px) {
		.quick-access a {
			padding-inline: 10px;
		}
	}

	@media (max-width: 760px) {
		.quick-access a {
			display: grid;
			grid-template-rows: 28px auto;
			align-content: start;
			gap: 10px;
		}
	}

	@media (min-width: 761px) and (max-width: 1050px) {
		.front-header {
			gap: 16px;
		}
	}

	@media (min-width: 761px) and (max-width: 1050px) {
		.front-header h1 {
			font-size: 28px;
		}
	}

	@media (min-width: 761px) and (max-width: 1050px) {
		.socials a,
		.socials button {
			gap: 7px;
			padding: 8px;
			font-size: 11px;
		}
	}

	.front-header h1 {
		font-size: clamp(26px, 2.9vw, 42px);
		line-height: 1;
	}

	.front-header h1 > span {
		letter-spacing: -0.045em;
		font-weight: 600;
	}

	.front-header h1 em {
		font-size: 1.12em;
		letter-spacing: -0.04em;
		white-space: nowrap;
	}

	.player-ladder {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		border-bottom: 1px solid var(--panel-border);
	}

	.player-ladder > section {
		min-width: 0;
		padding: 20px 16px;
		border: 0;
	}

	.player-ladder .player-panel {
		padding-left: 0;
		border-right: 1px solid var(--panel-border);
	}

	.about-panel {
		display: flex;
		gap: 18px;
		align-items: baseline;
		padding: 16px 20px 16px 0;
	}

	.about-panel h2 {
		font-size: 19px;
		margin: 0;
		flex-shrink: 0;
	}

	.about-panel p {
		font-size: 12px;
		line-height: 1.6;
	}

	@media (max-width: 760px) {
		.player-ladder > section {
			padding: 16px 10px;
		}
	}

	@media (max-width: 760px) {
		.about-panel {
			padding-right: 0;
			gap: 12px;
		}
	}

	@media (max-width: 760px) {
		.front-header h1 {
			font-size: 30px;
		}
	}

	@container home-left (max-width: 600px) {
		.player-ladder {
			grid-template-columns: minmax(0, 1fr);
		}
		.player-ladder .player-panel {
			border-right: 0;
			border-bottom: 1px solid var(--panel-border);
		}
		.player-ladder > section {
			padding-inline: 0;
		}
	}

	.front-page .roster-panel {
		margin-top: 16px;
		padding: 16px;
		background: var(--roster-bg);
		color: var(--roster-ink);
	}

	.front-page .roster-label {
		margin: 0 0 12px;
		color: var(--roster-label);
	}

	.front-page .roster-label h2 {
		margin: 0;
		font: inherit;
		letter-spacing: inherit;
	}

	.front-page .roster-label a {
		color: inherit;
		text-decoration: none;
	}

	.front-page .roster-label a:hover {
		text-decoration: underline;
	}

	.roster-footnote {
		margin: 12px 0 0;
		color: var(--roster-label);
		font:
			9px/1.6 "IBM Plex Mono",
			monospace;
	}


	.socials [data-social="Discord"] > svg:first-child {
		color: #5865f2;
	}

	.socials [data-social="YouTube"] > svg:first-child {
		color: #e53935;
	}

	.front-page .roster-panel {
		border: 1px solid rgba(119, 136, 147, 0.3);
		border-radius: 8px;
	}

	[data-theme="dark"] .front-page {
		color: var(--page-ink);
	}

	[data-theme="dark"] .socials a,
	[data-theme="dark"] .socials button {
		color: var(--page-ink);
	}

	[data-theme="dark"] .quick-access a:hover {
		background: var(--quick-hover);
		color: var(--page-ink);
	}


	[data-theme="dark"] .socials [data-social="Discord"] > svg:first-child {
		color: #98a2ff;
	}

	[data-theme="dark"] .socials [data-social="YouTube"] > svg:first-child {
		color: #ff6863;
	}

	.dashboard-left > .roster-panel {
		margin-right: 20px;
	}

	@media (max-width: 760px) {
		.dashboard-left > .roster-panel {
			margin-right: 0;
		}
	}
`,Ue=t(g)`
	display: block;
	width: ${({$width:e})=>e??`100%`};
	max-width: 100%;
	height: ${({$height:e})=>e??`12px`};
`,We=t.section`
	display: grid;
	align-content: start;
	gap: 18px;
	padding: 24px;
	min-width: 0;
	border-bottom: 1px solid var(--panel-border);
`,Ge=t.div`
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 12px;
	padding: 20px 20px 20px 0;
	@media (max-width: 760px) { padding-right: 0; }
`;function Ke(){return(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(Ue,{$width:`42%`,$height:`20px`}),(0,O.jsx)(Ue,{}),(0,O.jsx)(Ue,{$width:`78%`}),(0,O.jsx)(Ue,{$width:`58%`})]})}function qe(){let{pathname:e}=o(),t=e===`/game`||e===`/game/`||e===`/game/home`;return(0,O.jsx)(`div`,{className:t?`front-page`:void 0,role:`status`,"aria-label":`Loading event page`,"aria-busy":`true`,children:t?(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(He,{}),(0,O.jsxs)(`div`,{className:`front-header`,children:[(0,O.jsx)(Ue,{$width:`85%`,$height:`42px`}),(0,O.jsx)(Ue,{$width:`220px`,$height:`36px`})]}),(0,O.jsxs)(`div`,{className:`dashboard-grid`,children:[(0,O.jsxs)(`div`,{className:`dashboard-left`,children:[(0,O.jsxs)(`div`,{className:`player-ladder`,children:[(0,O.jsxs)(We,{className:`player-panel`,children:[(0,O.jsx)(Ke,{}),(0,O.jsx)(Ue,{$height:`36px`})]}),(0,O.jsxs)(We,{className:`ladder-panel`,children:[(0,O.jsx)(Ke,{}),(0,O.jsx)(Ue,{$height:`36px`})]})]}),(0,O.jsxs)(We,{className:`about-panel`,children:[(0,O.jsx)(Ue,{$width:`70px`,$height:`20px`}),(0,O.jsx)(Ue,{$height:`32px`})]}),(0,O.jsx)(Ge,{children:[0,1,2].map(e=>(0,O.jsx)(Ue,{$height:`56px`},e))}),(0,O.jsx)(Ge,{children:[0,1,2,3,4,5].map(e=>(0,O.jsx)(Ue,{$height:`140px`},e))})]}),(0,O.jsxs)(`div`,{className:`dashboard-right`,children:[(0,O.jsxs)(We,{children:[(0,O.jsx)(Ue,{$width:`45%`,$height:`24px`}),[0,1,2,3].map(e=>(0,O.jsx)(Ue,{$height:`42px`},e))]}),(0,O.jsxs)(We,{children:[(0,O.jsx)(Ke,{}),(0,O.jsx)(Ue,{$height:`60px`}),(0,O.jsx)(Ke,{})]})]})]})]}):(0,O.jsxs)(We,{children:[(0,O.jsx)(Ue,{$width:`40%`,$height:`36px`}),(0,O.jsx)(Ke,{}),(0,O.jsx)(Ue,{$height:`180px`})]})})}var Je=t(re)`
	max-width: 44rem;
	margin: 2rem auto;
	h1 {
		font-size: clamp(2rem, 5vw, 3rem);
		margin: 0.75rem 0 1rem;
	}
`,Ye=t.p`
	color: ${({theme:e})=>e.colors.muted};
	margin-bottom: 1.5rem;
`;function Xe({session:e,participation:t=!1}){let[n]=p(),r=e.access===`signed-out`?`sign_in`:e.access===`registration-required`||(e.profile?.status===`not_registered`||t)&&ae(e.profile)?`registration`:null;if((0,D.useEffect)(()=>{!e.loading&&!e.error&&r&&!(e.readOnly&&r===`registration`)&&window.location.replace(ie(r))},[e.loading,e.error,e.readOnly,r]),e.loading)return(0,O.jsx)(qe,{});if(e.error)return(0,O.jsxs)(Je,{children:[(0,O.jsx)(`h1`,{children:`We couldn’t load the event`}),(0,O.jsxs)(_,{children:[(0,O.jsx)(C,{role:`alert`,$error:!0,children:e.error}),(0,O.jsx)(te,{children:(0,O.jsx)(S,{type:`button`,$variant:`primary`,onClick:e.retry,children:`Try again`})})]})]});if(!e.profile&&e.access===`ineligible`||e.profile?.status===`not_registered`&&!ae(e.profile))return(0,O.jsxs)(Je,{children:[(0,O.jsx)(`h1`,{children:`Account access restricted`}),(0,O.jsx)(`p`,{children:e.accessMessage??`This account cannot access the event.`}),(0,O.jsx)(`a`,{href:`/`,children:`Event homepage`})]});let i=n.get(`registration`);return(0,O.jsxs)(Je,{children:[(0,O.jsx)(ne,{children:e.readOnly?`Archived event`:`Welcome to Battlecode`}),(0,O.jsx)(`h1`,{children:e.readOnly?`Your event lives on`:`Your event starts here`}),(0,O.jsx)(Ye,{children:e.readOnly?`Registration has closed. Existing participants can sign in to view their profile and team history.`:`Register to join this event, or sign in if you’re already taking part. You’ll return here after signing in on the platform.`}),(0,O.jsxs)(_,{children:[!e.readOnly&&i===`cancelled`&&(0,O.jsx)(C,{role:`status`,children:`Registration cancelled. Choose Register for event whenever you’re ready.`}),!e.readOnly&&i===`required`&&(0,O.jsx)(C,{role:`status`,children:`You’re signed in to the platform. Register for this event to confirm your participation.`}),(0,O.jsxs)(te,{children:[!e.readOnly&&(0,O.jsx)(ee,{href:ie(`registration`),children:`Register for event`}),(0,O.jsx)(`a`,{href:ie(`sign_in`),children:`Sign in`})]})]})]})}function Ze({session:e}){return e.readOnly||!ae(e.profile)?null:(0,O.jsxs)(C,{role:`status`,children:[`An active event registration is required to participate. `,(0,O.jsx)(`a`,{href:ie(`registration`),children:`Resume event registration`})]})}var Qe=`/service/assets/battlecode-knight-medium-7O3cztFC.webp`,$e=`/service/assets/battlecode-wanted-medium-CnoQKj_m.webp`,et=t.div`
	--sidebar-scrollbar-space: 0px;
	--sidebar-width: ${({$collapsed:e})=>e?`calc(64px + var(--sidebar-scrollbar-space))`:`220px`};
	&:has(nav[data-overflow="true"]) {
		--sidebar-scrollbar-space: 10px;
	}
	min-height: 100vh;
	min-height: 100dvh;
	display: flex;
	flex-direction: column;
	padding-left: var(--sidebar-width);
	padding-top: var(--status-bar-height, 0px);
	transition: padding-left 260ms cubic-bezier(0.22, 1, 0.36, 1);
	position: relative;
	isolation: isolate;
	&::before {
		transition: left 260ms cubic-bezier(0.22, 1, 0.36, 1);
		content: '';
		position: fixed;
		inset: 0 0 0 var(--sidebar-width);
		z-index: -1;
		pointer-events: none;
		filter: brightness(0.9);
		background:
			linear-gradient(
				90deg,
				rgba(var(--main-paper-rgb), 0.985),
				rgba(var(--main-paper-rgb), 0.93) 40%,
				rgba(var(--main-paper-rgb), 0.89)
			),
			url(${Qe}) center 25% / cover no-repeat;
	}
	@media (max-width: 760px) {
		padding-left: calc(64px + var(--sidebar-scrollbar-space));
		&::before {
			left: calc(64px + var(--sidebar-scrollbar-space));
			background-position:
				center,
				55% top;
		}
	}
`,tt=t.a`
	position: fixed;
	top: -6rem;
	left: 1rem;
	z-index: 10;
	padding: 0.75rem;
	background: var(--panel-surface);
	&:focus {
		top: 1rem;
	}
`,nt=t.div`
	position: fixed;
	inset: 0 0 auto;
	width: 100%;
	z-index: 6;
	padding: 10px 16px;
	background: ${({$banned:e})=>e?`#b91c1c`:`#fbbf24`};
	color: ${({$banned:e})=>e?`#ffffff`:`#1c1917`};
	border-bottom: 2px solid ${({$banned:e})=>e?`#7f1d1d`:`#92400e`};
	font-weight: 600;
	font-size: 14px;
	line-height: 1.5;
	text-align: center;
	a { color: inherit; text-decoration: underline; font-weight: 600; }
	${({$reminder:e})=>e&&`
		padding: 7px 16px;
		background: var(--panel-subtle);
		color: var(--muted-ink);
		border-bottom: 1px solid var(--panel-border);
		font-weight: 400;
		font-size: 13px;
		a { color: var(--page-ink); font-weight: 500; text-underline-offset: 2px; }
	`}
`,rt=t.header`
	position: fixed;
	inset: var(--status-bar-height, 0px) auto 0 0;
	width: var(--sidebar-width);
	transition: width 260ms cubic-bezier(0.22, 1, 0.36, 1);
	overflow: hidden;
	border-right: 1px solid var(--panel-border);
	background: var(--panel-subtle);
	z-index: 5;
	isolation: isolate;
	&::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		pointer-events: none;
		background:
			linear-gradient(
				180deg,
				rgba(var(--side-paper-rgb), 0.98),
				rgba(var(--side-paper-rgb), 0.93) 30%,
				rgba(var(--side-paper-rgb), 0.84) 65%,
				rgba(var(--side-paper-rgb), 0.94)
			),
			url(${$e}) 38% center / auto 100% no-repeat;
	}
	.nav-label,
	.sign-in-hint,
	.account-caption {
		white-space: nowrap;
		overflow: hidden;
		opacity: ${({$collapsed:e})=>+!e};
		max-width: ${({$collapsed:e})=>e?`0`:`180px`};
		transition:
			opacity 150ms ease,
			max-width 260ms ease;
	}
	.nav-item,
	.sidebar-profile,
	.sidebar-auth {
		gap: ${({$collapsed:e})=>e?`0`:`9px`};
		transition: gap 260ms ease;
	}
	.theme-switch {
		${({$collapsed:e})=>e&&`width: 0; padding: 0; opacity: 0; margin: 0; overflow: hidden;`}
	}
	.sidebar-toggle svg {
		transform: ${({$collapsed:e})=>e?`rotate(180deg)`:`none`};
		transition: transform 260ms ease;
	}
	/* Animate numeric offsets: flex alignment and display changes snap mid-collapse. */
	&& .nav-item, && .sidebar-profile, && .sidebar-auth, && nav section a {
		justify-content: flex-start;
		gap: ${({$collapsed:e})=>e?`0`:`9px`};
		transition: padding 260ms cubic-bezier(0.22, 1, 0.36, 1), gap 260ms cubic-bezier(0.22, 1, 0.36, 1);
	}
	&& .nav-item { padding-inline: ${({$collapsed:e})=>e?`13px`:`8px`}; }
	&& nav section a { padding-inline: ${({$collapsed:e})=>e?`12.5px`:`10px`}; }
	&& .sidebar-profile { padding-inline: ${({$collapsed:e})=>e?`1.5px`:`0`}; }
	&& .sidebar-auth { width: 100%; padding-inline: ${({$collapsed:e})=>e?`8px`:`0`}; }
	&& .sidebar-toggle {
		margin-right: ${({$collapsed:e})=>e?`6.5px`:`0`};
		transition: margin-right 260ms cubic-bezier(0.22, 1, 0.36, 1);
	}
	@media (prefers-reduced-motion: reduce) {
		&& .nav-item, && .sidebar-profile, && .sidebar-auth, && nav section a, && .sidebar-toggle { transition: none; }
	}
`,it=t.div`
	height: 100%;
	overflow: hidden;
	padding: 8px 10px 10px;
	display: flex;
	flex-direction: column;
	gap: 7px;
	.sidebar-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 30px;
		min-height: 30px;
		flex-shrink: 0;
		align-self: flex-end;
		border: 0;
		background: transparent;
		color: var(--muted-ink);
	}
	.sidebar-toggle svg {
		width: 18px;
		height: 18px;
	}
	.sidebar-bottom {
		margin-top: auto;
		flex-shrink: 0;
		padding: 8px 4px 0;
		border-top: 1px solid var(--panel-border);
	}
	.account-caption {
		display: block;
		font:
			10px/1.6 'IBM Plex Mono',
			monospace;
		color: var(--muted-ink);
		overflow-wrap: anywhere;
	}

 .sidebar-profile {
 display: flex;
 align-items: center;
 gap: 9px;
 min-width: 0;
 padding: 6px 0 10px;
 color: var(--page-ink);
 text-decoration: none;
 font-size: 12px;
 }
 .sidebar-profile:hover .nav-label { text-decoration: underline; }
 .sidebar-profile .nav-label { text-overflow: ellipsis; }
 .sidebar-profile img, .profile-initial {
 width: 32px;
 height: 32px;
 flex-shrink: 0;
 border-radius: 50%;
 object-fit: cover;
 }
 .profile-initial {
 display: grid;
 place-items: center;
 background: var(--panel-border);
 font-weight: 600;
 }
	.sidebar-auth {
		display: flex;
		align-items: center;
		gap: 10px;
		min-height: 32px;
		font-size: 12px;
		text-decoration: none;
		color: var(--page-ink);
		border: 0;
		background: transparent;
		padding: 6px 0;
	}
	.sidebar-auth svg {
		width: 19px;
		height: 19px;
		flex-shrink: 0;
	}
	overflow-y: auto;
`,at=t(s)`
	display: block;
	flex-shrink: 0;
	padding: 0 4px 8px;
	border-bottom: 1px solid var(--panel-border);
	img {
		display: block;
		width: 100%;
		height: clamp(40px, 8vh, 64px);
		max-height: 64px;
		object-fit: contain;
		mix-blend-mode: multiply;
	}
`,ot=t.nav`
	display: flex;
	flex-direction: column;
	flex-shrink: 1;
	min-height: 0;
	overflow-y: auto;
	overflow-x: hidden;
	gap: 1px;
	width: calc(100% + 20px);
	margin-inline: -10px;
	padding-inline: 10px;
	overscroll-behavior: contain;
	scrollbar-width: thin;
	scrollbar-color: var(--scroll-thumb) transparent;
	/* Extend the scrollport to the sidebar edge; keep the icon column and its gap intact. */
	&[data-overflow=true] {
		padding-inline-end: max(10px, calc(20px - var(--nav-scrollbar-width, 0px)));
	}
	.nav-item {
		display: flex;
		align-items: center;
		gap: 9px;
		min-height: 30px;
		flex-shrink: 0;
		padding: 6px 8px;
		color: var(--page-ink);
		text-decoration: none;
		font-size: 12px;
	}
	.nav-item svg {
		width: 17px;
		height: 17px;
		flex-shrink: 0;
	}
	.nav-item.active {
		color: var(--nav-active-ink);
		background: var(--nav-active-bg);
		box-shadow: inset 2px 0 var(--nav-active-edge);
	}
	a.nav-item:hover:not(.active) {
		background: var(--nav-hover-bg);
		color: var(--nav-hover-ink);
	}
	.gated {
		color: var(--nav-dim);
	}
	.sign-in-hint {
		margin-left: auto;
		font:
			8px 'IBM Plex Mono',
			monospace;
		text-transform: uppercase;
		color: var(--nav-dim);
	}
	.mode-label {
		width: 100%;
		text-align: left;
		border: 0;
		background: transparent;
		border-top: 1px solid var(--panel-border);
		margin-top: 4px;
		color: var(--muted-ink);
	}
	.nav-item {
		min-height: 36px;
		font-size: 11px;
	}
`,st=t(s)`position: relative;`,ct=t.span`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	margin-left: auto;
	min-width: 18px;
	height: 18px;
	padding: 0 5px;
	border-radius: 10px;
	background: var(--docs-accent);
	color: var(--docs-on-accent);
	font-size: 10px;
	font-weight: 650;
	font-variant-numeric: tabular-nums;
	${({$collapsed:e})=>e&&`
		position: absolute; top: 6px; right: 8px;
		min-width: 8px; width: 8px; height: 8px; padding: 0;
		box-shadow: 0 0 0 2px var(--panel-subtle);
	`}
`,lt=t.div`
	display: flex;
	flex-direction: column;
	flex-shrink: 0;
	gap: 1px;
	& + & {
		border-top: 1px solid var(--panel-border);
		margin-top: 5px;
		padding-top: 5px;
	}
	h2 {
		margin: ${({$collapsed:e})=>e?`0`:`3px 9px 2px`};
		height: ${({$collapsed:e})=>e?`0`:`16px`};
		opacity: ${({$collapsed:e})=>+!e};
		overflow: hidden;
		white-space: nowrap;
		font: 9px/1.8 "IBM Plex Mono", monospace;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--muted-ink);
		transition: height 260ms cubic-bezier(0.22, 1, 0.36, 1), margin 260ms cubic-bezier(0.22, 1, 0.36, 1), opacity 150ms ease;
		@media (prefers-reduced-motion: reduce) { transition: none; }
	}
`,ut=t.section`
	border-top: 1px solid var(--panel-border);
	margin-top: 12px;
	padding-top: 10px;
	@media (max-width: 760px) { grid-column: 1 / -1; }
	h2 {
		margin: 0 10px ${({$collapsed:e})=>e?`0`:`6px`};
		height: ${({$collapsed:e})=>e?`0`:`16px`};
		opacity: ${({$collapsed:e})=>+!e};
		overflow: hidden;
		white-space: nowrap;
		transition: height 260ms cubic-bezier(0.22, 1, 0.36, 1), margin-bottom 260ms cubic-bezier(0.22, 1, 0.36, 1), opacity 150ms ease;
		@media (prefers-reduced-motion: reduce) { transition: none; }
		font: 10px/1.6 'IBM Plex Mono', monospace;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--muted-ink);
	}
	a {
		display: flex;
		align-items: center;
		gap: 9px;
		padding: 8px 10px;
		color: var(--page-ink);
		font-size: 12px;
		text-decoration: none;
		border-radius: 3px;
	}
	a:hover, a[aria-current="page"] { background: var(--panel-border); }
	svg { width: 18px; height: 18px; flex-shrink: 0; }
	span {
		max-width: ${({$collapsed:e})=>e?`0`:`180px`};
		opacity: ${({$collapsed:e})=>+!e};
		overflow: hidden;
		white-space: nowrap;
		transition: max-width 260ms cubic-bezier(0.22, 1, 0.36, 1), opacity 150ms ease;
		@media (prefers-reduced-motion: reduce) { transition: none; }
	}
`,dt=t.main`
	flex: 1 0 auto;
	width: min(calc(100% - 64px), 1320px);
	margin: 0 auto;
	padding: 25px 0 40px;
	&:focus {
		outline: none;
	}
	@media (max-width: 1200px) {
		width: calc(100% - 40px);
	}
	@media (max-width: 760px) {
		width: calc(100% - 32px);
		padding-top: 20px;
	}
	${({$tool:e})=>e&&`
		width: 100%;
		margin: 0;
		padding: 12px 14px;
		@media (max-width: 1200px) { width: 100%; }
		@media (max-width: 760px) { width: 100%; padding: 12px 8px; }
	`}
	${({$docs:e})=>e&&`
		width: 100%;
		min-height: calc(100dvh - var(--status-bar-height, 0px));
		margin: 0;
		padding: 0;
		background: rgb(var(--main-paper-rgb));
		@media (max-width: 1200px) { width: 100%; }
		@media (max-width: 760px) { width: 100%; padding: 0; }
	`}
`,ft=t.footer`
	flex-shrink: 0;
	display: flex;
	justify-content: space-between;
	gap: 20px;
	padding: 20px 32px;
	border-top: 1px solid var(--panel-border);
	color: var(--muted-ink);
	font:
		9px/1.7 'IBM Plex Mono',
		monospace;
	text-transform: uppercase;
	@media (max-width: 760px) {
		padding-inline: 16px;
		flex-wrap: wrap;
	}
`,pt=d`
	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
	}

	.section-label {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		font:
			10px/1.5 "IBM Plex Mono",
			monospace;
		text-transform: uppercase;
		letter-spacing: 0.09em;
		color: var(--muted-ink);
	}

	.solid-button {
		display: inline-flex;
		align-items: center;
		gap: 24px;
		padding: 12px 16px;
		background: var(--solid-bg);
		color: var(--solid-ink);
		font-size: 12px;
	}

	.solid-button svg {
		width: 17px;
		height: 17px;
	}

	.text-button {
		border: 0;
		padding: 0;
		background: transparent;
		text-decoration: underline;
	}

	@media (max-width: 1100px) {
		.section-label {
			font-size: 9px;
		}
	}

	html,
	body,
	nav {
		scrollbar-width: thin;
		scrollbar-color: var(--scroll-thumb) var(--scroll-track);
	}

	::-webkit-scrollbar {
		width: 7px;
		height: 7px;
	}

	::-webkit-scrollbar-track {
		background: var(--scroll-track);
		border-radius: 8px;
	}

	::-webkit-scrollbar-thumb {
		background: var(--scroll-thumb);
		border: 2px solid var(--scroll-track);
		border-radius: 8px;
	}

	::-webkit-scrollbar-thumb:hover {
		background: var(--scroll-thumb-hover);
	}

	.theme-switch {
		margin-left: auto;
		display: block;
		width: 24px;
		height: 14px;
		flex-shrink: 0;
		border-radius: 9px;
		background: var(--switch-off);
		padding: 2px;
	}

	.theme-switch::after {
		content: "";
		display: block;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--switch-knob);
		transition: transform 180ms ease;
	}

	[aria-checked="true"] .theme-switch {
		background: var(--switch-on);
	}

	[aria-checked="true"] .theme-switch::after {
		transform: translateX(10px);
	}

	[data-theme="dark"] nav a.nav-item:hover:not(.active),
	[data-theme="dark"] nav button.nav-item:hover {
		background: var(--nav-hover-bg);
		color: var(--nav-hover-ink);
	}

	/* Matches the old dark-mode specificity, so the sidebar keeps its scrollbar track. */
	[data-theme="dark"],
	[data-theme="dark"] body,
	[data-theme="dark"] nav {
		scrollbar-color: var(--scroll-thumb) var(--scroll-track);
	}

	[data-theme="dark"] .text-button {
		color: var(--page-ink);
	}


	[data-theme="dark"] header > div > a > img {
		filter: invert(1);
		mix-blend-mode: screen;
	}

	[data-theme="dark"] .sidebar-toggle {
		color: var(--page-ink);
	}

`;function mt(e){if(e)try{let t=new URL(e),n=[`localhost`,`127.0.0.1`,`[::1]`].includes(window.location.hostname)&&[`localhost`,`127.0.0.1`,`[::1]`].includes(t.hostname);return t.protocol===`https:`||n&&t.protocol===`http:`?t.href:void 0}catch{return}}var ht=`data:image/svg+xml,%3c?xml%20version='1.0'%20encoding='UTF-8'?%3e%3csvg%20id='Layer_1'%20data-name='Layer%201'%20xmlns='http://www.w3.org/2000/svg'%20viewBox='150%20125%20560%20345'%3e%3cdefs%3e%3cstyle%3e%20.cls-1%20{%20fill:%20%23fff;%20}%20%3c/style%3e%3c/defs%3e%3cg%3e%3cpolygon%20points='415.54%20186.32%20415.54%20262.15%20398.32%20276.8%20391.87%20282.27%20382.38%20270.15%20382.53%20290.24%20367.87%20302.69%20359.03%20290.3%20359.3%20309.31%20331.96%20330.45%20304.61%20309.31%20304.88%20290.3%20296.02%20302.69%20281.39%20290.24%20281.54%20270.15%20272.02%20282.27%20265.57%20276.8%20248.37%20262.15%20248.37%20186.32%20283.42%20141.64%20316.08%20141.61%20331.96%20154.23%20347.84%20141.61%20380.5%20141.64%20415.54%20186.32'/%3e%3cpolygon%20class='cls-1'%20points='375.51%20229.34%20360.29%20243.34%20345.81%20280.89%20331.96%20288.57%20318.7%20279.79%20303.63%20243.34%20288.4%20229.34%20288.79%20198.09%20304.41%20178.23%20326.26%20178.23%20331.96%20189.4%20337.63%20178.23%20359.51%20178.23%20375.09%20197.19%20375.51%20229.34'/%3e%3cpolygon%20points='331.43%20251.79%20324.73%20244.32%20316.52%20244.32%20316.52%20231.79%20322.49%20231.79%20322.49%20238.35%20327.39%20238.35%20331.43%20242.85%20335.43%20238.39%20341.42%20238.39%20341.42%20231.14%20347.39%20231.14%20347.39%20244.36%20338.1%20244.36%20331.43%20251.79'/%3e%3c/g%3e%3cpolygon%20points='197.34%20451.65%20296.06%20451.65%20396.13%20371.99%20435.96%20371.99%20496.02%20323.99%20603.61%20406.24%20563.61%20451.65%20650.81%20451.65%20694.85%20401.84%20520.9%20259.11%20440.7%20259.11%20425.13%20259.11%20425.03%20267.75%20197.34%20451.65'/%3e%3cpolygon%20points='454.08%20451.65%20513.87%20403.9%20505.7%20343.56%20589.08%20407.47%20550.18%20451.65%20454.08%20451.65'/%3e%3cpolygon%20points='223.88%20219.57%20164.81%20219.57%20191.31%20287.49%20287.9%20365.96%20324.27%20336.51%20238.11%20266.32%20238.11%20256.15%20223.88%20219.57'/%3e%3cpolygon%20points='687.57%20251.45%20654.04%20285.15%20567.87%20285.27%20535.65%20259.09%20645.3%20259.09%20653.27%20251.39%20645.3%20243.48%20489.47%20243.39%20455.95%20209.66%20489.47%20175.87%20579.29%20175.84%20586.67%20168.52%20680.67%20168.52%20647.89%20201.57%20647.77%20201.69%20498.19%20201.69%20490.25%20209.63%20498.19%20217.3%20654.04%20217.66%20687.57%20251.45'/%3e%3cpolygon%20points='648.03%20201.97%20648.03%20202.09%20647.91%20202.09%20648.03%20201.97'/%3e%3cline%20x1='454.92'%20y1='295.44'%20x2='452.59'%20y2='293.41'/%3e%3c/svg%3e`;function k({name:e}){return(0,O.jsx)(`svg`,{width:`24`,height:`24`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`,strokeLinecap:`round`,strokeLinejoin:`round`,"aria-hidden":`true`,children:{home:(0,O.jsx)(`path`,{d:`m3 10 9-7 9 7v11h-6v-7H9v7H3Z`}),player:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(`circle`,{cx:`12`,cy:`7`,r:`4`}),(0,O.jsx)(`path`,{d:`M4 21v-3a8 8 0 0 1 16 0v3`})]}),teams:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(`circle`,{cx:`9`,cy:`8`,r:`3`}),(0,O.jsx)(`path`,{d:`M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v3`})]}),docs:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(`path`,{d:`M12 5v16M3 3l9 2 9-2v16l-9 2-9-2Z`}),(0,O.jsx)(`path`,{d:`m6 8 3 1m6 0 3-1M6 12l3 1m6 0 3-1`})]}),maps:(0,O.jsx)(O.Fragment,{children:(0,O.jsx)(`path`,{d:`m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Zm6-2v16m6-14v16`})}),monsters:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(`path`,{d:`m5 8-2-5 7 3h4l7-3-2 5 2 5-3 7H6l-3-7Z`}),(0,O.jsx)(`path`,{d:`m7 11 3 2m7-2-3 2m-5 4h6`})]}),arrow:(0,O.jsx)(`path`,{d:`M5 19 19 5M5 5h14v14`}),edit:(0,O.jsx)(`path`,{d:`m16 3 5 5-12 12-6 1 1-6ZM14 5l5 5`}),Discord:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(`path`,{d:`M8 5 5 6C3 9 2 13 2 17l5 2 1-2m8-12 3 1c2 3 3 7 3 11l-5 2-1-2M7 7c3-1 7-1 10 0M7 16c3 2 7 2 10 0`}),(0,O.jsx)(`circle`,{cx:`8`,cy:`12`,r:`1`}),(0,O.jsx)(`circle`,{cx:`16`,cy:`12`,r:`1`})]}),YouTube:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(`rect`,{x:`2`,y:`5`,width:`20`,height:`14`,rx:`4`}),(0,O.jsx)(`path`,{d:`m10 9 5 3-5 3Z`})]}),rank:(0,O.jsx)(`path`,{d:`m5 9 7-5 7 5-7 5Zm0 5 7 5 7-5M5 19l7 5 7-5`,transform:`translate(0 -1)`}),matches:(0,O.jsx)(`path`,{d:`m7 4 13 8-13 8Z`}),database:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(`ellipse`,{cx:`12`,cy:`5`,rx:`9`,ry:`3`}),(0,O.jsx)(`path`,{d:`M3 5v14c0 4 18 4 18 0V5M3 12c0 4 18 4 18 0`})]}),trophy:(0,O.jsx)(O.Fragment,{children:(0,O.jsx)(`path`,{d:`M7 3h10v6a5 5 0 0 1-10 0Zm0 2H3v3a4 4 0 0 0 4 4m10-7h4v3a4 4 0 0 1-4 4m-5 2v6m-5 1h10`})}),upload:(0,O.jsx)(O.Fragment,{children:(0,O.jsx)(`path`,{d:`M6 17H4a3 3 0 0 1 0-6 8 8 0 0 1 16-1 4 4 0 0 1 0 8h-2M12 21V11m-4 4 4-4 4 4`})}),test:(0,O.jsx)(`path`,{d:`M8 3h8m-6 0v7L4 21h16l-6-11V3M7 16h10`}),eligibility:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(`rect`,{x:`3`,y:`5`,width:`18`,height:`14`,rx:`2`}),(0,O.jsx)(`circle`,{cx:`9`,cy:`10.5`,r:`2`}),(0,O.jsx)(`path`,{d:`M5.5 16c.7-1.7 2-2.5 3.5-2.5s2.8.8 3.5 2.5M15 10h3m-3 3.5h3`})]}),eye:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(`path`,{d:`M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z`}),(0,O.jsx)(`circle`,{cx:`12`,cy:`12`,r:`3`})]}),signin:(0,O.jsx)(`path`,{d:`M13 3h7v18h-7M2 12h12m-4-4 4 4-4 4`}),collapse:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(`rect`,{x:`3`,y:`3`,width:`18`,height:`18`,rx:`1`}),(0,O.jsx)(`path`,{d:`M9 3v18m7-14-3 5 3 5`})]}),moon:(0,O.jsx)(`path`,{d:`M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10Z`}),notes:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(`path`,{d:`M6 3h9l4 4v14H6Z`}),(0,O.jsx)(`path`,{d:`M15 3v4h4M9 11h7M9 15h7M9 19h4`})]}),terminal:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(`rect`,{x:`3`,y:`4`,width:`18`,height:`16`,rx:`2`}),(0,O.jsx)(`path`,{d:`m7 9 3 3-3 3m6 0h4`})]}),code:(0,O.jsx)(`path`,{d:`m8 7-5 5 5 5m8-10 5 5-5 5M14 4l-4 16`}),bell:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(`path`,{d:`M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4`}),(0,O.jsx)(`path`,{d:`M12 2V1`})]}),sun:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(`circle`,{cx:`12`,cy:`12`,r:`4`}),(0,O.jsx)(`path`,{d:`M12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2`})]})}[e]})}var gt=(0,D.createContext)({unreadCount:null,trackingEnabled:!1,version:0,changed:()=>{}});function _t({session:e,children:t}){let[n,r]=(0,D.useState)({unreadCount:null,trackingEnabled:!1}),[i,a]=(0,D.useState)(0),o=(0,D.useRef)(()=>{}),s=(0,D.useRef)(null),c=e.profile?.userId,l=!e.loading&&!e.error&&!e.readOnly&&!!c;(0,D.useEffect)(()=>{if(r({unreadCount:null,trackingEnabled:!1}),!l)return;let e=null,t=0,n=!1,i=(i=!1)=>{if(i&&(n=!0),document.hidden||!n&&(e||Date.now()-t<1e4))return;n=!1,e?.abort();let a=new AbortController;e=a,t=Date.now(),x(`/patch-notes/unread-count`,{signal:a.signal,redirectAccess:!1}).then(e=>{a.signal.aborted||r(e)}).catch(()=>{}).finally(()=>{e===a&&(e=null)})};o.current=i;let c=()=>i(),u=typeof BroadcastChannel>`u`?null:new BroadcastChannel(`event-patch-note-read-state`);s.current=u,u&&(u.onmessage=()=>{a(e=>e+1),i(!0)});let d=()=>{a(e=>e+1),i(!0),u?.postMessage(`changed`)};window.addEventListener(`patch-notes-changed`,d),i(),window.addEventListener(`focus`,c),document.addEventListener(`visibilitychange`,c);let f=window.setInterval(c,6e4);return()=>{e?.abort(),o.current=()=>{},s.current=null,u?.close(),window.removeEventListener(`focus`,c),window.removeEventListener(`patch-notes-changed`,d),document.removeEventListener(`visibilitychange`,c),window.clearInterval(f)}},[c,l]);let u=(0,D.useCallback)(()=>{o.current(!0),s.current?.postMessage(`changed`)},[]),d=(0,D.useMemo)(()=>({...n,version:i,changed:u}),[n,i,u]);return(0,O.jsx)(gt.Provider,{value:d,children:t})}function vt(){return(0,D.useContext)(gt)}var yt=(0,D.createContext)({unreadCount:null,trackingEnabled:!1,version:0,changed:()=>{}});function bt({session:e,children:t}){let[n,r]=(0,D.useState)({unreadCount:null,trackingEnabled:!1}),[i,a]=(0,D.useState)(0),o=(0,D.useRef)(()=>{}),s=(0,D.useRef)(null),c=e.profile?.userId,l=!e.loading&&!e.error&&!e.readOnly&&!!c;(0,D.useEffect)(()=>{if(r({unreadCount:null,trackingEnabled:!1}),!l)return;let e=null,t=0,n=!1,i=(i=!1)=>{if(i&&(n=!0),document.hidden||!n&&(e||Date.now()-t<1e4))return;n=!1,e?.abort();let a=new AbortController;e=a,t=Date.now(),x(`/announcements/unread-count`,{signal:a.signal,redirectAccess:!1}).then(e=>{a.signal.aborted||r(e)}).catch(()=>{}).finally(()=>{e===a&&(e=null)})};o.current=i;let c=()=>i(),u=typeof BroadcastChannel>`u`?null:new BroadcastChannel(`event-announcement-read-state`);s.current=u,u&&(u.onmessage=()=>{a(e=>e+1),i(!0)}),i(),window.addEventListener(`focus`,c),document.addEventListener(`visibilitychange`,c);let d=window.setInterval(c,6e4);return()=>{e?.abort(),o.current=()=>{},s.current=null,u?.close(),window.removeEventListener(`focus`,c),document.removeEventListener(`visibilitychange`,c),window.clearInterval(d)}},[c,l]);let u=(0,D.useCallback)(()=>{o.current(!0),s.current?.postMessage(`changed`)},[]),d=(0,D.useMemo)(()=>({...n,version:i,changed:u}),[n,i,u]);return(0,O.jsx)(yt.Provider,{value:d,children:t})}function xt(){return(0,D.useContext)(yt)}var St=[{value:`high_school`,label:`High school`},{value:`undergraduate`,label:`Undergraduate`},{value:`masters`,label:`Master’s`},{value:`phd`,label:`PhD`}],Ct=[{value:`quant_trading`,label:`Quant trading`},{value:`quant_research`,label:`Quant research`},{value:`machine_learning`,label:`AI/ML`},{value:`data_science`,label:`Data science`},{value:`research`,label:`Research`},{value:`software`,label:`Software engineering`},{value:`other`,label:`Other`}],wt=[{value:`internship`,label:`Internship`},{value:`graduate`,label:`Graduate role`},{value:`full_time`,label:`Full-time`},{value:`startup`,label:`Startup`},{value:`not_now`,label:`Not right now`}],Tt=[{value:`london`,label:`London`},{value:`cambridge`,label:`Cambridge`},{value:`uk`,label:`Elsewhere in the UK`},{value:`europe`,label:`Europe`},{value:`north_america`,label:`North America`},{value:`south_america`,label:`South America`},{value:`asia`,label:`Asia`},{value:`africa`,label:`Africa`},{value:`oceania`,label:`Oceania`},{value:`remote`,label:`Remote`}],Et=[{value:`2026`,label:`2026`},{value:`2027`,label:`2027`},{value:`2028`,label:`2028`},{value:`2029`,label:`2029`},{value:`2030`,label:`2030 onwards`}],Dt={uk:{label:`UK student`,team:`UK students`,unlocks:`UK qualifiers, finals prizes and sprints`},international:{label:`International student`,team:`International students`,unlocks:`International qualifiers, finals prizes and sprints`},non_student:{label:`Non-student`,team:`Includes a non-student`,unlocks:`Sprints and sprint prizes`}},A={student:null,countryCode:null,under22:null,region:null,studyLevel:null,institution:``,graduationYear:``,declaration:!1,interests:[],otherInterest:``,lookingFor:[],locations:[],links:[],bio:``};function Ot(e,t=null){if(!e)return{...A,countryCode:t};let n=e.student&&e.studyLevel===`not_enrolled`;return{student:e.student&&!n,countryCode:e.countryCode??null,under22:e.student?n?!0:null:!1,region:e.region,studyLevel:n?null:e.studyLevel,institution:e.institution??``,graduationYear:e.graduationYear?String(Math.min(e.graduationYear,2030)):``,declaration:e.student,interests:e.interests,otherInterest:e.otherInterest??``,lookingFor:e.lookingFor,locations:e.locations,links:e.profileUrls,bio:e.bio??``}}function kt(e){let t=e.trim();return t?/^[a-z][a-z0-9+.-]*:/i.test(t)?t:`https://${t}`:``}function At(e){let t=kt(e);if(!t)return null;try{if(new URL(t).protocol!==`https:`||/\s/.test(t)||t.length>300)throw Error(`bad`)}catch{return`Use a full web address, for example github.com/yourname`}return null}function jt(e){let t=[];return e.student===null?[`whether you’re a student`]:(e.student?(e.studyLevel||t.push(`your level of study`),e.region||t.push(`where you study`),e.institution.trim()||t.push(`your school or university`),e.graduationYear||t.push(`your graduation year`),e.declaration||t.push(`the student declaration`)):e.under22===null?t.push(`whether you’ll be under 22 on 18 November 2026`):e.under22&&(e.region||t.push(`where you’re based`),e.declaration||t.push(`the age declaration`)),e.links.some(e=>At(e))&&t.push(`valid links`),Array.from(e.bio.trim()).length>500&&t.push(`a bio of up to 500 characters`),e.interests.includes(`other`)&&Array.from(e.otherInterest.trim()).length>120&&t.push(`other interests of up to 120 characters`),t)}function Mt(e){return e.student===null?null:e.student?e.region:e.under22===null?null:e.under22?e.region:`non_student`}function Nt(e){let t={countryCode:e.countryCode,interests:e.interests,otherInterest:e.interests.includes(`other`)&&e.otherInterest.trim()||null,lookingFor:e.lookingFor,locations:e.locations,profileUrls:[...new Set(e.links.map(kt).filter(Boolean))],bio:e.bio.trim()||null};return e.student===!1&&e.under22?{student:!0,region:e.region,studyLevel:`not_enrolled`,declaration:e.declaration,...t}:e.student?{student:!0,region:e.region,studyLevel:e.studyLevel,declaration:e.declaration,institution:e.institution.trim(),graduationYear:Number(e.graduationYear),...t}:{student:!1,...t}}function Pt(e,t){return[...t?[]:[`your CV`],...e.interests.length?[]:[`what you’re interested in`],...e.lookingFor.length?[]:[`what you’re looking for`]]}function Ft(e,t,n,r){let i=Mt(e),a=t.team?.members.filter(e=>e.userId!==r)??[],o=!i||!t.team?null:a.some(e=>e.category===null)?`pending`:i===`non_student`||a.some(e=>e.category===`non_student`)?`non_student`:i===`uk`&&a.every(e=>e.category===`uk`)?`uk`:`international`,s=a.filter(e=>e.category===null).length,c=Pt(e,n),l=a.filter(e=>!e.profileComplete).length,u=(e,t)=>`${e} ${t}${e===1?``:`s`}`,d=i===null?{label:`Qualifiers`,status:`waiting`,detail:`Answer section 1 to see your category.`,action:`section1`}:i===`non_student`?{label:`Qualifiers`,status:`no`,detail:`Qualifiers are for students and anyone under 22 on 18 November 2026.`}:t.team?o===`non_student`?{label:`Qualifiers`,status:`no`,detail:`A teammate isn’t a student or under 22, so your team plays the sprints only.`}:o===`pending`?{label:`Qualifiers`,status:`waiting`,detail:`Waiting for ${u(s,`teammate`)} to answer section 1.`}:{label:o===`uk`?`UK qualifiers`:`International qualifiers`,status:`yes`,detail:o===`uk`?`Every teammate is a UK student.`:i===`uk`?`A teammate studies outside the UK, so your team plays the international qualifiers.`:`Your team plays the international qualifiers.`}:{label:i===`uk`?`UK qualifiers`:`International qualifiers`,status:`waiting`,detail:`Create or join a team. A team of one is fine.`,action:`team`},f=d.status===`no`?{label:`Main prize pool`,status:`no`,detail:`Finals prizes are for teams of students and under-22s.`}:c.length?{label:`Main prize pool`,status:`waiting`,detail:`Finish section 2: add ${c.join(`, `).replace(/, ([^,]*)$/,` and $1`)}.`,action:`section2`}:d.status===`waiting`?{label:`Main prize pool`,status:`waiting`,detail:`Your part is done. Complete the qualifiers step above.`}:l?{label:`Main prize pool`,status:`waiting`,detail:`Waiting for ${u(l,`teammate`)} to finish section 2.`}:{label:`Main prize pool`,status:`yes`,detail:`Your team can win finals prizes if it qualifies.`};return{rows:[{label:`Sprints and sprint prizes`,status:`yes`,detail:`Open to every registered participant.`},d,f],headline:f.status===`yes`?{tone:`yes`,text:`Eligible for the main prize pool`}:f.status===`no`?{tone:`no`,text:i===null?`Not answered yet`:`Sprint prizes only`}:{tone:`waiting`,text:i===null?`Not answered yet`:`Almost eligible for the main prize pool`},teamCategory:o}}var It=(e,t=!0)=>x(`/me/eligibility`,{signal:e,redirectAccess:t}),Lt=e=>x(`/me/eligibility`,{method:`PUT`,body:Nt(e)}),Rt=()=>x(`/me/eligibility/cv`,{method:`DELETE`}),zt=()=>x(`/me/eligibility`,{method:`DELETE`});async function Bt(e){let t=await fetch(`/api/v1/me/eligibility/cv`,{method:`PUT`,credentials:`same-origin`,headers:{"content-type":`application/pdf`,"x-file-name":encodeURIComponent(e.name)},body:e}),n=await t.json().catch(()=>null);if(!t.ok){ce(t.status,n);let e=n&&typeof n==`object`&&`error`in n&&typeof n.error==`string`?n.error:`Your CV could not be uploaded. Please try again.`;throw new le(t.status,e)}return n.cv}function Vt(e){return e.type!==`application/pdf`&&!/\.pdf$/i.test(e.name)?`Your CV needs to be a PDF.`:e.size>5242880?`That file is ${Ht(e.size)}. CVs can be up to 5 MB.`:e.size===0?`That file is empty.`:null}function Ht(e){return e<1048576?`${Math.max(1,Math.round(e/1024))} KB`:`${(e/1024/1024).toFixed(1)} MB`}var Ut=`cambc:eligibility-changed`,Wt=()=>window.dispatchEvent(new Event(Ut));function Gt(e){let[t,n]=(0,D.useState)(null);return(0,D.useEffect)(()=>{if(!e)return;let t=new AbortController,r=()=>{if(document.hidden)return;t.abort(),t=new AbortController;let{signal:r}=t;It(r,!1).then(t=>{if(r.aborted)return;let i=Ot(t.answers),{headline:a}=Ft(i,t,t.cv!==null,e);n({userId:e,value:{...Mt(i)===null?{tone:`waiting`,text:`Eligibility not filled in`}:a,answered:t.answers!==null}})}).catch(()=>{r.aborted||n({userId:e,value:null})})};r(),window.addEventListener(Ut,r),window.addEventListener(`focus`,r),document.addEventListener(`visibilitychange`,r);let i=window.setInterval(r,6e4);return()=>{t.abort(),window.removeEventListener(Ut,r),window.removeEventListener(`focus`,r),document.removeEventListener(`visibilitychange`,r),window.clearInterval(i)}},[e]),e&&t?.userId===e?t.value:null}var Kt=[{path:`/game`,title:`Home`},{path:`/game/home`,title:`Home`},{path:`/game/profile`,title:`My event profile`},{path:`/game/profile/:accountId`,title:`Event profile`},{path:`/game/admin/participants`,title:`Participants · Admin`},{path:`/game/admin/teams`,title:`Teams · Admin`},{path:`/game/admin/teams/:teamId`,title:`Team details · Admin`},{path:`/game/admin/distribution`,title:`Distribution · Admin`},{path:`/game/admin/referrals`,title:`Referrals · Admin`},{path:`/game/admin/eligibility`,title:`Eligibility · Admin`},{path:`/game/admin/match-runner`,title:`Match runner · Admin`},{path:`/game/admin/tournaments`,title:`Tournaments · Admin`},{path:`/game/admin/maps`,title:`Manage map pool · Admin`},{path:`/game/admin/matches`,title:`All matches · Admin`},{path:`/game/admin/statistics`,title:`Statistics · Admin`},{path:`/game/match-groups/:groupId`,title:`Match overview`},{path:`/game/admin/live/tournaments/:id`,title:`Live tournament`},{path:`/game/admin/live/match-groups/:groupId`,title:`Live match visualiser`},{path:`/game/download`,title:`CLI`},{path:`/game/cli-login`,title:`Sign in to your CLI`},{path:`/game/eligibility`,title:`Eligibility`},{path:`/game/team`,title:`My team`},{path:`/game/team/join`,title:`Join team`},{path:`/game/team/:teamId`,title:`Team`},{path:`/game/patch-notes/:patchNoteId?`,title:`Patch notes`},{path:`/game/admin/patch-notes/:patchNoteId?`,title:`Patch notes · Admin`},{path:`/game/api`,title:null},{path:`/game/docs`,title:null},{path:`/game/docs/:championName`,title:null},{path:`/game/announcements/:announcementId?`,title:`Announcements`},{path:`/game/maps`,title:`Map pool`},{path:`/game/monsters`,title:`Camps`},{path:`/game/test-runs`,title:`Submissions`},{path:`/game/ladder`,title:`Ladder`},{path:`/game/tournaments`,title:`Tournaments`},{path:`/game/tournaments/:id`,title:`Tournament`},{path:`/game/matches`,title:`Matches`},{path:`/game/match-database`,title:`Match Database`},{path:`/game/admin/match-database`,title:`Match Database · Admin`},{path:`/game/matches/:teamId`,title:`Team matches`},{path:`/game/submissions`,title:`Submissions`},{path:`/game/visualiser/:matchId?`,title:`Visualiser`},{path:`/game/mapeditor/:mapId?`,title:`Map editor`},{path:`/game/map-editor`,title:`Map editor`}];function qt(e){let t=c(Kt,e),n=t?t[t.length-1].route.title:`Page not found`;return n===null?null:`${n} · Cambridge Battlecode`}function Jt({session:e,children:t}){let{mode:n,toggleMode:r}=Le(),{unreadCount:i,trackingEnabled:a}=xt(),c=vt(),[l,u]=(0,D.useState)(!1),[d,f]=(0,D.useState)(null),[p,m]=(0,D.useState)(()=>window.matchMedia(`(max-width: 760px)`).matches),h=(0,D.useRef)(null);(0,D.useLayoutEffect)(()=>{let e=h.current;if(!e)return;let t=()=>{let t=e.scrollHeight>e.clientHeight+1;e.style.setProperty(`--nav-scrollbar-width`,`${e.offsetWidth-e.clientWidth}px`),e.dataset.overflow=String(t)},n=new ResizeObserver(t),r=()=>{n.disconnect(),n.observe(e);for(let t of e.children)n.observe(t);t()},i=new MutationObserver(r);return i.observe(e,{childList:!0}),r(),()=>{n.disconnect(),i.disconnect()}},[]),(0,D.useEffect)(()=>{let e=window.matchMedia(`(max-width: 760px)`),t=()=>{e.matches&&m(!0)};return e.addEventListener(`change`,t),()=>e.removeEventListener(`change`,t)},[]);let[_,v]=(0,D.useState)(),y=mt(e.profile?.avatarUrl??null),b=o(),ee=b.pathname.split(`/`)[2]||`home`,te=ee===`visualiser`||ee===`mapeditor`,ne=ee===`docs`||ee===`api`,re=e.access===`eligible`||e.access===`ineligible`||e.access===`registration-required`,S=e.profile?.status===`banned`||e.profile?.platformBanned,ae=e.profile?.status===`withdrawn`,oe=Gt(!e.loading&&!e.error&&!e.readOnly&&e.profile?.canParticipate&&e.profile.status===`registered`?e.profile.userId:null)?.answered===!1,ce=(0,D.useRef)(null),[le,ue]=(0,D.useState)(0);(0,D.useLayoutEffect)(()=>{let e=ce.current;if(!e){ue(0);return}let t=()=>ue(e.getBoundingClientRect().height);t();let n=new ResizeObserver(t);return n.observe(e),()=>n.disconnect()},[S,ae,oe]),(0,D.useEffect)(()=>{let e=qt(b.pathname);e!==null&&(document.title=e)},[b.pathname]),(0,D.useEffect)(()=>{window.matchMedia(`(max-width: 760px)`).matches&&m(!0),document.getElementById(`main-content`)?.focus({preventScroll:!0}),window.scrollTo(0,0)},[b.pathname]);async function w(){if(!l){u(!0),f(null);try{let e=await x(`/auth/signout`,{method:`POST`});window.location.assign(e.redirectUrl)}catch(e){f(se(e)),u(!1)}}}return(0,O.jsxs)(et,{$collapsed:p,style:{"--status-bar-height":`${le}px`},children:[(0,O.jsx)(pt,{}),(0,O.jsx)(tt,{href:`#main-content`,children:`Skip to content`}),(S||ae||oe)&&(0,O.jsx)(nt,{ref:ce,role:`status`,$banned:!!S,$reminder:!S&&!ae,children:S||ae?(0,O.jsxs)(O.Fragment,{children:[S?`You are currently banned from the event.`:`You have withdrawn from the event.`,` `,(0,O.jsx)(s,{to:`/game/profile`,children:`Read more here.`})]}):(0,O.jsxs)(O.Fragment,{children:[`Please fill in your eligibility details. `,(0,O.jsx)(s,{to:`/game/eligibility`,children:`Open eligibility.`})]})}),(0,O.jsx)(rt,{$collapsed:p,children:(0,O.jsxs)(it,{children:[(0,O.jsx)(`button`,{className:`sidebar-toggle`,onClick:()=>m(e=>!e),"aria-expanded":!p,"aria-controls":`event-navigation`,"aria-label":p?`Expand sidebar`:`Collapse sidebar`,title:p?`Expand sidebar`:`Collapse sidebar`,children:(0,O.jsx)(`svg`,{width:`18`,height:`18`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,"aria-hidden":`true`,children:(0,O.jsx)(`path`,{d:`m15 5-7 7 7 7`})})}),(0,O.jsx)(at,{to:`/game/home`,"aria-label":`Cambridge Battlecode home`,children:(0,O.jsx)(`img`,{src:ht,alt:`Cambridge Battlecode`})}),(0,O.jsxs)(ot,{ref:h,id:`event-navigation`,"aria-label":`Event navigation`,children:[[{links:[{id:`home`,label:`Home`,icon:`home`},{id:`eligibility`,label:`Eligibility`,icon:`eligibility`,auth:!0}]},{label:`Info`,links:[{id:`announcements`,label:`Announcements`,icon:`bell`},{id:`tournaments`,label:`Tournaments`,icon:`trophy`},{id:`docs`,label:`Docs`,icon:`docs`},{id:`patch-notes`,label:`Patch notes`,icon:`docs`},{id:`api`,label:`API`,icon:`code`},{id:`download`,label:`CLI`,icon:`terminal`}]},{label:`Compete`,links:[{id:`team`,label:`Team`,icon:`player`,auth:!0},{id:`ladder`,label:`Ladder`,icon:`rank`},{id:`matches`,label:`Matches`,icon:`matches`},{id:`match-database`,label:`Match Database`,icon:`database`}]},{label:`Build`,links:[{id:`submissions`,label:`Submissions`,icon:`upload`,auth:!0},{id:`visualiser`,label:`Visualiser`,icon:`eye`},{id:`mapeditor`,label:`Map editor`,icon:`maps`},{id:`maps`,label:`Map pool`,icon:`maps`}]}].map(t=>(0,O.jsxs)(lt,{$collapsed:p,role:t.label?`group`:void 0,"aria-label":t.label,children:[t.label&&(0,O.jsx)(`h2`,{children:t.label}),t.links.map(t=>{let n=t.auth&&!e.profile&&e.access!==`ineligible`,r=t.id===`patch-notes`&&c.trackingEnabled?c.unreadCount??0:t.id===`announcements`&&a?i??0:0,o=t.id===`patch-notes`?`patch note`:`announcement`,s=r>0?`${t.label}, ${r} unread ${o}${r===1?``:`s`}`:t.label,l=(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(k,{name:t.icon}),(0,O.jsx)(`span`,{className:`nav-label`,children:t.label}),r>0&&(0,O.jsx)(ct,{$collapsed:p,"aria-hidden":`true`,children:p?``:r>99?`99+`:r}),n&&(0,O.jsx)(`span`,{className:`sign-in-hint`,children:re?`Register`:`Sign in`})]});return n?(0,O.jsx)(`a`,{className:`nav-item gated`,href:ie(re?`registration`:`sign_in`,`/game/${t.id}`),"aria-label":`${t.label} — ${re?`event eligibility required`:`sign in required`}`,title:`${t.label} — ${re?`event eligibility required`:`sign in required`}`,children:l},t.id):(0,O.jsx)(st,{className:`nav-item ${ee===t.id?`active`:``}`,to:`/game/${t.id}`,"aria-current":ee===t.id?`page`:void 0,"aria-label":s,title:s,children:l},t.id)})]},t.label??`main`)),e.profile?.adminAccess&&!e.error&&(0,O.jsxs)(ut,{$collapsed:p,"aria-label":`Admin`,children:[(0,O.jsx)(`h2`,{children:`Admin`}),[{path:`/game/admin/patch-notes`,label:`Patch notes`,icon:`docs`},{path:`/game/admin/participants`,label:`Participants`,icon:`player`},{path:`/game/admin/teams`,label:`Teams`,icon:`player`},{path:`/game/admin/eligibility`,label:`Eligibility`,icon:`eligibility`},{path:`/game/admin/referrals`,label:`Referrals`,icon:`player`},{path:`/game/admin/distribution`,label:`Distribution`,icon:`upload`},{path:`/game/admin/match-runner`,label:`Match runner`,icon:`eligibility`},{path:`/game/admin/tournaments`,label:`Tournaments`,icon:`trophy`},{path:`/game/admin/maps`,label:`Map pool`,icon:`eligibility`},{path:`/game/admin/matches`,label:`Matches`,icon:`eligibility`},{path:`/game/admin/statistics`,label:`Statistics`,icon:`trophy`}].map(e=>(0,O.jsxs)(s,{to:e.path,"aria-current":b.pathname===e.path||b.pathname.startsWith(`${e.path}/`)?`page`:void 0,"aria-label":e.label,title:e.label,children:[(0,O.jsx)(k,{name:e.icon}),(0,O.jsx)(`span`,{children:e.label})]},e.path)),(0,O.jsxs)(s,{to:`/game/admin/match-database`,"aria-current":b.pathname===`/game/admin/match-database`?`page`:void 0,"aria-label":`Match Database`,title:`Match Database`,children:[(0,O.jsx)(k,{name:`database`}),(0,O.jsx)(`span`,{children:`Match Database`})]})]}),(0,O.jsxs)(`button`,{type:`button`,className:`nav-item mode-label`,onClick:r,role:`switch`,"aria-checked":n===`dark`,"aria-label":`Dark mode`,title:n===`dark`?`Switch to light mode`:`Switch to dark mode`,children:[(0,O.jsx)(k,{name:n===`dark`?`moon`:`sun`}),(0,O.jsx)(`span`,{className:`nav-label`,children:n===`dark`?`Dark mode`:`Light mode`}),(0,O.jsx)(`span`,{className:`theme-switch`,"aria-hidden":`true`})]})]}),(0,O.jsxs)(`div`,{className:`sidebar-bottom`,children:[re&&e.profile?(0,O.jsxs)(s,{className:`sidebar-profile`,to:`/game/profile`,"aria-label":`View profile: ${e.profile.displayName}`,title:e.profile.displayName,children:[y&&_!==y?(0,O.jsx)(`img`,{src:y,alt:``,width:32,height:32,referrerPolicy:`no-referrer`,onError:()=>v(y)}):(0,O.jsx)(`span`,{className:`profile-initial`,"aria-hidden":`true`,children:e.profile.displayName.slice(0,1).toUpperCase()||`?`}),(0,O.jsx)(`span`,{className:`nav-label`,children:e.profile.displayName})]}):(0,O.jsx)(`span`,{className:`account-caption`,children:e.loading?(0,O.jsx)(`span`,{role:`status`,"aria-label":`Checking session`,children:(0,O.jsx)(g,{})}):re?`Signed in`:`Not signed in`}),re?(0,O.jsxs)(`button`,{className:`sidebar-auth`,disabled:l,onClick:()=>void w(),title:`Sign out`,"aria-label":`Sign out`,children:[(0,O.jsx)(k,{name:`signin`}),(0,O.jsx)(`span`,{className:`nav-label`,children:l?`Signing out…`:`Sign out`})]}):!e.loading&&(0,O.jsxs)(`a`,{className:`sidebar-auth`,href:ie(`sign_in`),"aria-label":`Sign in`,title:`Sign in`,children:[(0,O.jsx)(k,{name:`signin`}),(0,O.jsx)(`span`,{className:`nav-label`,children:`Sign in`})]})]})]})}),(0,O.jsxs)(dt,{id:`main-content`,tabIndex:-1,$tool:te,$docs:ne,children:[d&&(0,O.jsx)(C,{role:`alert`,$error:!0,children:d}),ee===`admin`&&(e.loading||e.error||!e.profile)?(0,O.jsx)(Xe,{session:e}):t]}),!te&&!ne&&(0,O.jsxs)(ft,{children:[(0,O.jsx)(`span`,{children:`© 2026 Cambridge Battlecode`}),(0,O.jsx)(`span`,{children:`12 October – 18 November`})]})]})}function Yt(){return(0,O.jsxs)(re,{children:[(0,O.jsx)(`h1`,{children:`Page not found`}),(0,O.jsx)(`p`,{children:`This event page doesn’t exist.`}),(0,O.jsx)(w,{to:`/game/home`,children:`Return to event home`})]})}var Xt=new Map,Zt=[`utm_source`,`utm_medium`,`utm_campaign`,`utm_content`,`ref`],Qt=18e5,$t=7776e6,en=e=>`cambc-attribution-v1:`+e;function tn(e,t,n,r){let i={};for(let t of Zt){let n=e.searchParams.get(t)?.trim().slice(0,160);n&&(i[t]=n)}let a=``;try{let r=new URL(t);[`http:`,`https:`].includes(r.protocol)&&![e.origin,...n].includes(r.origin)&&(a=r.hostname.toLowerCase())}catch{}let o=Object.keys(i).length>0,s=o?i.utm_source?.toLowerCase()||(i.ref?`referral`:`unknown`):a?/^(www\.)?google\.[a-z.]+$/.test(a)?`google`:/(^|\.)instagram.com$/.test(a)?`instagram`:a.replace(/^www\./,``):`direct/unknown`;return{at:r,kind:o?`campaign`:a?`referrer`:`direct`,source:s,...i,referrer:a,path:e.pathname.slice(0,256)}}function nn(e,t,n,r,i,a,o=()=>crypto.randomUUID()){let s=i===`reload`||i===`back_forward`,c=e&&[`source`,`kind`,`referrer`,...Zt].every(n=>e.arrival[n]===t[n]),l=e?.location===r&&c&&a-e.activeAt<Qt,u=t.kind!==`direct`;return!e||!s&&(a-e.activeAt>=Qt||u&&!l)?{version:1,eventSlug:n,visitorId:e?.visitorId??o(),visitId:o(),visitStartedAt:a,firstTouch:e?.firstTouch??t,lastTouch:u?t:e?.lastTouch??t,arrival:t,activeAt:a,attempted:!1,location:r}:{...e,activeAt:a,location:r}}function rn(e){try{let t=localStorage.getItem(en(e));if(t){let n=JSON.parse(t);if(n.version===1&&n.eventSlug===e&&typeof n.visitorId==`string`&&typeof n.visitId==`string`&&typeof n.activeAt==`number`&&n.firstTouch&&n.lastTouch&&n.arrival)return n}}catch{}return Xt.get(e)}function an(e){Xt.set(e.eventSlug,e);try{localStorage.setItem(en(e.eventSlug),JSON.stringify(e))}catch{}}function on(e){let t=rn(e);if(!t||Date.now()-t.visitStartedAt>$t)return;let{version:n,eventSlug:r,visitorId:i,visitId:a,visitStartedAt:o,firstTouch:s,lastTouch:c,arrival:l}=t;return{version:n,eventSlug:r,visitorId:i,visitId:a,visitStartedAt:o,firstTouch:s,lastTouch:c,arrival:l}}function sn(e,t,n=!0,r){if(!/^[a-z0-9][a-z0-9-]{0,47}$/.test(e))return;let i=new URL(r?.url??window.location.href),a=r?.referrer??document.referrer,o=r?.navigation??performance.getEntriesByType(`navigation`)[0]?.type??`navigate`,s=()=>{try{let r=rn(e),s=tn(i,a,[t],Date.now()),c=!1;try{c=[i.origin,t].includes(new URL(a).origin)}catch{}let l=nn(r,s,e,i.href,c?`back_forward`:o,Date.now());if(!n&&!r)return;let u=n&&!l.attempted;u&&(l.attempted=!0),an(l),u&&fetch(new URL(`/api/v1/analytics/visits`,t),{method:`POST`,mode:`no-cors`,credentials:`omit`,keepalive:!0,headers:{"Content-Type":`text/plain`},body:JSON.stringify(on(e))}).catch(()=>{})}catch{}};navigator.locks?navigator.locks.request(en(e),s).catch(s):s();let c=0,l=()=>{if(Date.now()-c<6e4)return;c=Date.now();let t=rn(e);t&&an({...t,activeAt:c})};document.addEventListener(`pointerdown`,l,{passive:!0}),document.addEventListener(`keydown`,l,{passive:!0})}function cn(e,t){try{let n=on(t);if(!n)return e;let r=new URL(e,window.location.origin);return r.origin!==window.location.origin||![`/api/v1/registration/start`,`/api/v1/auth/start`].includes(r.pathname)?e:(r.hash=`cambc_attribution=`+encodeURIComponent(JSON.stringify(n)),r.pathname+r.search+r.hash)}catch{return e}}var ln=``,un=!1,dn=!0,fn=typeof window>`u`?void 0:{url:window.location.href,referrer:document.referrer,navigation:performance.getEntriesByType(`navigation`)[0]?.type??`navigate`},pn=(e=`/api/v1/registration/start`)=>cn(e,ln);function mn(e){if(!(!fn||un||!e?.eventSlug||!e.platformOrigin))try{let t=new URL(e.platformOrigin).origin;un=!0,ln=e.eventSlug,sn(ln,t,dn,fn)}catch{}}function hn(e){dn=e,document.addEventListener(`click`,e=>{let t=e.target instanceof Element?e.target.closest(`a`):null;t&&(t.href=pn(t.href))},!0)}function gn(){let[e,t]=(0,D.useState)({data:null,error:!1});return(0,D.useEffect)(()=>T(async e=>{let n=await ue(e);e.throwIfAborted(),mn(n.analytics),t(e=>!e.error&&e.data?.phase===n.phase&&e.data?.registrationsOpen===n.registrationsOpen&&e.data?.archived===n.archived?e:{data:n,error:!1})},{onError:()=>t(e=>e.data||e.error?e:{data:null,error:!0})}).stop,[]),e}function _n({children:e,session:t}){let{data:n,error:r}=gn();return(0,D.useEffect)(()=>{n?.phase===`premier`&&!t.loading&&!t.profile?.adminAccess&&window.location.replace(`/`)},[n?.phase,t.loading,t.profile?.adminAccess]),r?(0,O.jsxs)(`p`,{role:`alert`,children:[`Unable to check event access. Retrying... `,(0,O.jsx)(`a`,{href:`/`,children:`Back to event`})]}):!n||n.phase===`premier`&&!t.profile?.adminAccess?(0,O.jsx)(qe,{}):e}var vn=3e5,yn=`event-session-next-activity`;function bn(){let e=!1,t=!1,n=0,r,i,a=new WeakMap,o=new Set,s=[`pointerdown`,`keydown`,`wheel`];function c(){try{let e=Number(localStorage.getItem(yn));return Number.isFinite(e)&&e<=Date.now()+vn?e:0}catch{return 0}}function l(e){n=Date.now()+e;try{localStorage.setItem(yn,String(n))}catch{}}function u(){window.clearTimeout(r),!(e||i||!t||document.hidden)&&(r=window.setTimeout(()=>void d(),Math.max(0,Math.max(n,c())-Date.now())))}async function d(){if(e||document.hidden||i||!t)return;if(Math.max(n,c())>Date.now())return u();t=!1,l(vn);let r=new AbortController;i=r;let a=window.setTimeout(()=>r.abort(),15e3);try{let e=await fetch(`/api/v1/auth/activity`,{method:`POST`,credentials:`same-origin`,cache:`no-store`,redirect:`manual`,signal:r.signal});if(e.status===401){g();return}if(!e.ok)throw Error(`Session renewal unavailable`);let t=await e.json();if(r.signal.throwIfAborted(),typeof t.renewAfter!=`number`||!Number.isFinite(t.renewAfter))throw Error(`Invalid session renewal`);l(Math.max(1e3,Math.min(vn,t.renewAfter)))}catch{e||l(6e4)}finally{window.clearTimeout(a),i=void 0,u()}}function f(e){document.hidden||e&&!e.isTrusted||(t=!0,u())}function p(){document.hidden&&(t=!1,window.clearTimeout(r))}function m(e){document.hasFocus()&&document.activeElement?.tagName===`IFRAME`&&f(e)}function h(){for(let e of o)e.deref()||o.delete(e);for(let e of document.querySelectorAll(`iframe`))try{let t=e.contentDocument;if(!t||a.get(e)===t)continue;let n=a.get(e);for(let e of s)n?.removeEventListener(e,f,!0),t.addEventListener(e,f,{capture:!0,passive:!0});a.set(e,t),o.add(new WeakRef(t))}catch{}}function g(){e=!0,window.clearTimeout(r),i?.abort();for(let e of s)document.removeEventListener(e,f,!0);document.removeEventListener(`visibilitychange`,p),document.removeEventListener(`load`,h,!0),window.removeEventListener(`blur`,m);for(let e of o)for(let t of s)e.deref()?.removeEventListener(t,f,!0);o.clear()}for(let e of s)document.addEventListener(e,f,{capture:!0,passive:!0});return document.addEventListener(`visibilitychange`,p),document.addEventListener(`load`,h,!0),window.addEventListener(`blur`,m),h(),f(),g}var xn={loading:!0,profile:null,archive:null,error:null,access:`unknown`};function Sn(){let e=(0,D.useRef)(()=>{}),[t,n]=(0,D.useState)(xn),r=t.access!==`unknown`&&t.access!==`signed-out`;(0,D.useEffect)(()=>r?bn():void 0,[r]),(0,D.useEffect)(()=>{let t=T(async e=>{let t=x(`/me`,{signal:e,redirectAccess:!1}).then(e=>({profile:e,access:e.canParticipate?`eligible`:`ineligible`,accessMessage:void 0})).catch(e=>{if(e instanceof le&&(e.status===401||e.status===403))return{profile:null,access:e.status===401?`signed-out`:e.code===`EVENT_REGISTRATION_REQUIRED`?`registration-required`:`ineligible`,accessMessage:e.message};throw e}).then(t=>{e.throwIfAborted(),n(e=>{let n={...e,...t,accessMessage:t.accessMessage,loading:!1,error:null};return JSON.stringify(e)===JSON.stringify(n)?e:n})}),r=y(e).then(t=>{e.throwIfAborted(),n(e=>JSON.stringify(e.archive)===JSON.stringify(t)?e:{...e,archive:t})}),i=await Promise.allSettled([t,r]);for(let e of i)if(e.status===`rejected`)throw e.reason},{onError:e=>n(t=>t.access===`unknown`?{...t,loading:!1,error:se(e)}:t)});return e.current=t.retry,()=>{t.stop(),e.current=()=>{}}},[]);let i=(0,D.useCallback)(()=>e.current(),[]);return(0,D.useMemo)(()=>({...t,retry:i,readOnly:t.archive!==null||t.profile?.archived===!0}),[t,i])}var Cn=t.div`
	display: grid;
	gap: 1.5rem;
	max-width: 1400px;
	margin: 0 auto;
	min-width: 0;
	h1,
	h2,
	h3,
	p {
		margin: 0;
	}
	h1 {
		font-size: clamp(1.8rem, 3vw, 2.5rem);
		line-height: 1.2;
	}
	h2 {
		font-size: 1.15rem;
	}
	h3 {
		font-size: 1rem;
	}
	[hidden] {
		display: none !important;
	}
	input,
	select,
	textarea {
		font: inherit;
		color: inherit;
		background: ${({theme:e})=>e.colors.surface};
		border: 1px solid ${({theme:e})=>e.colors.border};
		border-radius: ${({theme:e})=>e.radii.small};
		padding: 0.6rem 0.75rem;
		min-width: 0;
		max-width: 100%;
	}
	input[type="checkbox"] {
		width: 1.1rem;
		height: 1.1rem;
		accent-color: ${({theme:e})=>e.colors.primary};
	}
	button {
		font-family: inherit;
	}
	button:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}
	:where(a, button, input, select, summary, textarea):focus-visible {
		outline: 2px solid ${({theme:e})=>e.colors.primary};
		outline-offset: 3px;
	}
	code,
	pre {
		font-family: ${({theme:e})=>e.fonts.mono};
		font-size: 0.8rem;
		overflow-wrap: anywhere;
	}
	pre {
		white-space: pre-wrap;
		max-height: 28rem;
		overflow: auto;
		background: ${({theme:e})=>e.colors.subtle};
		padding: 1rem;
	}
	summary {
		cursor: pointer;
		font-weight: 600;
	}
`,wn=t.header`
	display: flex;
	justify-content: space-between;
	align-items: center;
	flex-wrap: wrap;
	gap: 1rem;
	> div:first-child {
		display: grid;
		gap: 0.5rem;
	}
	p {
		color: ${({theme:e})=>e.colors.muted};
		max-width: 48rem;
	}
`,Tn=t.nav`
	display: flex;
	gap: 1.5rem;
	flex-wrap: wrap;
	border-bottom: 1px solid ${({theme:e})=>e.colors.border};
	a {
		color: ${({theme:e})=>e.colors.muted};
		text-decoration: none;
		font-size: 0.9rem;
		padding: 0.65rem 0;
		border-bottom: 2px solid transparent;
	}
	a[aria-current="page"] {
		color: ${({theme:e})=>e.colors.ink};
		border-color: ${({theme:e})=>e.colors.primary};
		font-weight: 700;
	}
`,En=t(re)`
	display: grid;
	gap: 1.1rem;
	padding: 1.25rem;
	h2 {
		margin: 0;
	}
`,Dn=t.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 1rem;
	flex-wrap: wrap;
	min-width: 0;
`,On=t.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
	gap: 1rem;
`,kn=t.div`
	border: 1px solid ${({theme:e})=>e.colors.border};
	border-radius: ${({theme:e})=>e.radii.medium};
	padding: 1rem 1.25rem;
	background: ${({theme:e})=>e.colors.surface};
	display: grid;
	gap: 0.35rem;
	small {
		color: ${({theme:e})=>e.colors.muted};
	}
	strong {
		font-size: 1.55rem;
		font-variant-numeric: tabular-nums;
	}
`,An=t(oe)`
	color: ${({theme:e,$tone:t})=>t===`good`?e.colors.success:t===`bad`?e.colors.danger:e.colors.ink};
	border: 1px solid ${({theme:e})=>e.colors.border};
	white-space: nowrap;
	width: fit-content;
`,jn=t.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(min(100%, 230px), 1fr));
	gap: 1.25rem;
`,Mn=t.label`
	display: grid;
	align-content: start;
	gap: 0.4rem;
	font-size: 0.9rem;
	font-weight: 600;
	small {
		color: ${({theme:e})=>e.colors.muted};
		font-weight: 400;
	}
	input,
	select {
		width: 100%;
	}
`,Nn=t.div`
	overflow-x: auto;
	min-width: 0;
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
	}
	th {
		color: ${({theme:e})=>e.colors.muted};
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	th,
	td {
		padding: 1rem 0.75rem;
		text-align: left;
		vertical-align: top;
		border-bottom: 1px solid ${({theme:e})=>e.colors.border};
	}
	th:first-child,
	td:first-child {
		padding-left: 0;
	}
	th:last-child,
	td:last-child {
		padding-right: 0;
	}
	tbody tr:last-child td {
		border-bottom: 0;
	}
	td small {
		display: block;
		color: ${({theme:e})=>e.colors.muted};
		margin-top: 0.3rem;
		overflow-wrap: anywhere;
	}
	td p {
		margin-top: 0.5rem;
	}
	td strong {
		overflow-wrap: anywhere;
	}
`,Pn=t.div`
	display: grid;
	justify-items: start;
	gap: 0.65rem;
	padding: 1.5rem 0;
	p {
		color: ${({theme:e})=>e.colors.muted};
		max-width: 44rem;
	}
`,Fn=t(En)`
	border-color: ${({theme:e})=>e.colors.danger};
`,In=t.div`
	display: grid;
	gap: 0.75rem;
	padding: 1.5rem;
	border: 1px dashed
		${({theme:e,$dragging:t})=>t?e.colors.primary:e.colors.border};
	background: ${({theme:e})=>e.colors.subtle};
	border-radius: ${({theme:e})=>e.radii.medium};
	input {
		background: ${({theme:e})=>e.colors.surface};
		width: 100%;
	}
	progress {
		width: 100%;
		accent-color: ${({theme:e})=>e.colors.primary};
	}
`;function Ln({children:e}){let{pathname:t}=o();return t.startsWith(`/game/admin/`)&&t!==`/game/admin/tournaments`&&!t.startsWith(`/game/admin/tournaments/`)?(0,O.jsx)(Rn,{"data-admin-workspace":!0,children:e}):e}var Rn=t.div`
	display: grid;
	grid-template-columns: minmax(0, 1fr);
	gap: 1.25rem;
	width: 100%;
	max-width: 1400px;
	min-width: 0;
	margin: 0 auto;
	font-size: 0.875rem;
	line-height: 1.5;
	> * {
		min-width: 0;
	}

	&& h1 {
		font-size: clamp(1.25rem, 2vw, 1.55rem);
		letter-spacing: -0.035em;
		line-height: 1.25;
	}
	&& h2 {
		font-size: 0.95rem;
		letter-spacing: -0.015em;
		line-height: 1.4;
	}
	&& h3 {
		font-size: 0.85rem;
		letter-spacing: 0;
		line-height: 1.4;
	}
	&& ${ne} {
		font-size: 0.65rem;
		font-weight: 600;
		letter-spacing: 0.075em;
	}
	&& ${de} {
		margin-bottom: 0;
		h1 {
			margin: 0.25rem 0 0.4rem;
		}
		p {
			font-size: 0.85rem;
			max-width: 58rem;
		}
	}
	&& ${wn} {
		align-items: flex-start;
		> div:first-child {
			gap: 0.35rem;
		}
		p {
			font-size: 0.85rem;
		}
	}
	&& ${Cn}, && ${_} {
		gap: 1.1rem;
	}
	&& ${re} {
		border-radius: 6px;
		padding: 1.1rem;
		box-shadow: none;
		h2 {
			margin-bottom: 0.65rem;
		}
	}
	&& ${En} {
		gap: 0.95rem;
		h2 {
			margin-bottom: 0;
		}
	}
	&& ${v} {
		font-size: 0.8rem;
		line-height: 1.55;
	}
	&& ${C} {
		padding: 0.7rem 0.85rem;
		font-size: 0.8rem;
		border-radius: 5px;
	}
	&& ${te} {
		gap: 0.5rem;
	}
	&& ${S}, && ${b} {
		min-height: 2.15rem;
		padding: 0.4rem 0.7rem;
		border-radius: 4px;
		font-size: 0.78rem;
		font-weight: 600;
		line-height: 1.35;
		box-shadow: none;
		&:hover:not(:disabled) {
			filter: brightness(0.96);
			box-shadow: none;
		}
	}
	&& ${oe} {
		padding: 0.18rem 0.45rem;
		border-radius: 4px;
		font-size: 0.65rem;
		font-weight: 650;
		letter-spacing: 0.035em;
	}
	&& input:not([type="checkbox"]):not([type="radio"]):not([type="file"]),
	&& select,
	&& textarea {
		min-height: 2.15rem;
		padding: 0.4rem 0.65rem;
		font: inherit;
		font-size: 0.8rem;
		line-height: 1.45;
		color: ${({theme:e})=>e.colors.ink};
		background: ${({theme:e})=>e.colors.surface};
		border: 1px solid ${({theme:e})=>e.colors.border};
		border-radius: 4px;
		max-width: 100%;
		min-width: 0;
	}
	&& input[type="checkbox"],
	&& input[type="radio"] {
		accent-color: ${({theme:e})=>e.colors.primary};
	}
	&& ${Mn} {
		gap: 0.35rem;
		font-size: 0.8rem;
		small {
			line-height: 1.5;
		}
	}
	&& ${jn} {
		gap: 1rem;
	}
	&& ${On} {
		gap: 0.75rem;
	}
	&& ${kn} {
		padding: 0.9rem 1rem;
		border-radius: 5px;
		gap: 0.3rem;
		small {
			font-size: 0.75rem;
		}
		strong {
			font-size: 1.5rem;
			line-height: 1.2;
			letter-spacing: -0.03em;
		}
		a {
			font-size: 0.75rem;
			text-decoration: none;
		}
		a:hover {
			text-decoration: underline;
		}
	}
	&& ${Tn} {
		gap: 1.15rem;
		a {
			font-size: 0.8rem;
			padding: 0.55rem 0;
		}
	}
	&& table {
		font-size: 0.8rem;
		line-height: 1.5;
	}
	&& th {
		font-size: 0.65rem;
		font-weight: 650;
		color: ${({theme:e})=>e.colors.muted};
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}
	&& ${Nn} {
		th,
		td {
			padding: 0.65rem 0.75rem;
		}
		th:first-child,
		td:first-child {
			padding-left: 0;
		}
		th:last-child,
		td:last-child {
			padding-right: 0;
		}
	}
	&& tbody tr:hover {
		background: ${({theme:e})=>e.colors.subtle};
	}
	&& code {
		font-size: 0.75rem;
	}
	&& :where(a, button, input, select, summary, textarea):focus-visible {
		outline: 2px solid ${({theme:e})=>e.colors.primary};
		outline-offset: 3px;
	}
	@media (max-width: 600px) {
		&& ${re} {
			padding: 0.85rem;
		}
		&& ${S}, && ${b} {
			min-height: 2.4rem;
		}
	}
`;function zn(e,t){return{canView:!!e&&!t,canDownload:!!(e?.currentTeam||e?.adminAccess===!0)&&!t}}var Bn=(0,D.createContext)({canView:!1,canDownload:!1}),j=e=>(0,D.lazy)(()=>we(e)),Vn=j(()=>h(()=>import(`./patch-notes-S0Y9jByz.js`).then(e=>({default:e.PatchNotesPage})),__vite__mapDeps([0,1,2,3,4,5,6,7,8]))),Hn=j(()=>h(()=>import(`./announcements-CUz1jKI3.js`).then(e=>({default:e.AnnouncementsPage})),__vite__mapDeps([9,1,2,3,4,5,6]))),Un=j(()=>h(()=>import(`./admin-BGgiMThz.js`).then(e=>({default:e.AdminPatchNotesPage})),__vite__mapDeps([10,1,2,3,7,5,8]))),Wn=j(()=>h(()=>import(`./home-C_3Nt6Ys.js`).then(e=>({default:e.HomePage})),__vite__mapDeps([11,1,2,3,12,13,14,15,5,6,16,17,18,19,20,21,22,23]))),Gn=j(()=>h(()=>import(`./profile-bFSgJ0rp.js`).then(e=>({default:e.ProfilePage})),__vite__mapDeps([24,1,2,3,25,15,26,27]))),Kn=j(()=>h(()=>import(`./admin-DPqvWX46.js`).then(e=>({default:e.AdminParticipantsPage})),__vite__mapDeps([28,1,2,3,25,15,26]))),qn=j(()=>h(()=>import(`./admin-teams-CN2kjW0p.js`).then(e=>({default:e.AdminTeamsPage})),__vite__mapDeps([29,1,2,3,12,13,14,30,4]))),Jn=j(()=>h(()=>import(`./TeamDetails-B5NcTUAl.js`).then(e=>({default:e.AdminTeamPage})),__vite__mapDeps([31,1,2,3,12,13,14,32,30,4,33,34]))),Yn=j(()=>h(()=>import(`./distribution-DtYCOOPf.js`).then(e=>({default:e.AdminDistributionPage})),__vite__mapDeps([35,1,2,3]))),Xn=j(()=>h(()=>import(`./distribution-DtYCOOPf.js`).then(e=>({default:e.DownloadPage})),__vite__mapDeps([35,1,2,3]))),Zn=j(()=>h(()=>import(`./cli-login-kgEEVkZz.js`).then(e=>({default:e.CliLoginPage})),__vite__mapDeps([36,1,2,3]))),Qn=j(()=>h(()=>import(`./admin-C5kX0bye.js`).then(e=>({default:e.AdminReferralsPage})),__vite__mapDeps([37,1,2,3,25]))),$n=j(()=>h(()=>import(`./groups-B4HaiJNx.js`).then(e=>({default:e.MatchGroupPage})),__vite__mapDeps([38,1,2,3,13,14,4,25,39,40]))),er=j(()=>h(()=>import(`./statistics-CbAxnBGo.js`).then(e=>({default:e.AdminStatisticsPage})),__vite__mapDeps([41,1,2,3,4,16,17,42,43]))),tr=j(()=>h(()=>import(`./eligibility-C-JHCgK9.js`).then(e=>({default:e.EligibilityPage})),__vite__mapDeps([44,1,2,3,45,15,27]))),nr=j(()=>h(()=>import(`./admin-DeanDT10.js`).then(e=>({default:e.AdminEligibilityPage})),__vite__mapDeps([46,1,2,3,25]))),rr=j(()=>h(()=>import(`./team-DxR_rGks.js`).then(e=>({default:e.TeamPage})),__vite__mapDeps([47,1,2,3,34,33,25,45,15,18,19,20,48,49,12,13,14,22,23]))),ir=j(()=>h(()=>import(`./TeamView-FfA24FCP.js`).then(e=>({default:e.TeamViewPage})),__vite__mapDeps([50,1,2,18,3,19,20,49,12,13,14,33,34,25,22,23]))),ar=j(()=>h(()=>import(`./JoinTeam-7ZfZJ3ti.js`).then(e=>({default:e.JoinTeamPage})),__vite__mapDeps([51,1,2,3,34,25,45,15,48]))),or=j(()=>h(()=>import(`./docs-CraIq4_w.js`).then(e=>({default:e.DocsPage})),__vite__mapDeps([52,1,2,16,17,8]))),sr=()=>h(()=>import(`./ladder-vJxajp2h.js`).then(e=>({default:e.LadderPage})),__vite__mapDeps([53,1,2,3,12,13,14,4,17,27,19,18,20,22])),cr=j(sr);window.location.pathname===`/game/ladder`&&we(sr).catch(()=>{});var lr=j(()=>h(()=>import(`./tournaments-CyxYxv30.js`).then(e=>({default:e.TournamentsPage})),__vite__mapDeps([54,1,2,3,20,21,14,55,56,4]))),ur=j(()=>h(()=>import(`./tournaments-CyxYxv30.js`).then(e=>({default:e.TournamentPage})),__vite__mapDeps([54,1,2,3,20,21,14,55,56,4]))),dr=j(()=>h(()=>import(`./Admin-BzRpC7-_.js`),__vite__mapDeps([57,1,2,3,20,42,55,56,4]))),fr=j(()=>h(()=>import(`./Live-D29U7dwC.js`).then(e=>({default:e.LiveTournamentPage})),__vite__mapDeps([58,1,2,3,20,39,59,55]))),pr=j(()=>h(()=>import(`./Live-D29U7dwC.js`).then(e=>({default:e.LiveMatchPage})),__vite__mapDeps([58,1,2,3,20,39,59,55]))),mr=j(()=>h(()=>import(`./matches-Byyrqjt0.js`).then(e=>({default:e.MatchesPage})),__vite__mapDeps([60,1,2,3,12,13,14,4,19,38,25,39,40]))),hr=j(()=>h(()=>import(`./match-database-DL7Wu_Gd.js`).then(e=>({default:e.MatchDatabasePage})),__vite__mapDeps([61,1,2,3,42]))),gr=j(()=>h(()=>import(`./submissions-CzvbYN4b.js`).then(e=>({default:e.SubmissionsPage})),__vite__mapDeps([62,1,2,3,12,14,13,32,4,25,45,15,19,18,20]))),_r=j(()=>h(()=>import(`./operations-DhwN1aWw.js`).then(e=>({default:e.MatchRunnerAdmin})),__vite__mapDeps([63,1,2,3,4,42,39,40,43]))),vr=j(()=>h(()=>import(`./operations-DhwN1aWw.js`).then(e=>({default:e.MapPoolPage})),__vite__mapDeps([63,1,2,3,4,42,39,40,43]))),yr=j(()=>h(()=>import(`./operations-DhwN1aWw.js`).then(e=>({default:e.MatchHistoryPage})),__vite__mapDeps([63,1,2,3,4,42,39,40,43]))),br=j(()=>h(()=>import(`./ToolFrame-BiZv38Hf.js`).then(e=>({default:e.ToolFrame})),__vite__mapDeps([59,1,2,3,39])));function xr(){let e=Sn();return(0,O.jsx)(Bn.Provider,{value:zn(e.profile,e.error),children:(0,O.jsx)(bt,{session:e,children:(0,O.jsx)(_t,{session:e,children:(0,O.jsx)(Jt,{session:e,children:(0,O.jsx)(_n,{session:e,children:(0,O.jsx)(D.Suspense,{fallback:(0,O.jsx)(qe,{}),children:(0,O.jsx)(Ln,{children:(0,O.jsxs)(u,{children:[(0,O.jsx)(a,{path:`/game`,element:(0,O.jsx)(i,{to:`/game/home`,replace:!0})}),(0,O.jsx)(a,{path:`/game/home`,element:(0,O.jsx)(Wn,{session:e})}),(0,O.jsx)(a,{path:`/game/profile`,element:(0,O.jsx)(Gn,{session:e})}),(0,O.jsx)(a,{path:`/game/profile/:accountId`,element:(0,O.jsx)(Gn,{session:e})}),(0,O.jsx)(a,{path:`/game/admin/participants`,element:(0,O.jsx)(Kn,{session:e})}),(0,O.jsx)(a,{path:`/game/admin/teams`,element:(0,O.jsx)(qn,{session:e})}),(0,O.jsx)(a,{path:`/game/admin/teams/:teamId`,element:(0,O.jsx)(Jn,{session:e})}),(0,O.jsx)(a,{path:`/game/admin/distribution`,element:(0,O.jsx)(Yn,{session:e})}),(0,O.jsx)(a,{path:`/game/admin/referrals`,element:(0,O.jsx)(Qn,{session:e})}),(0,O.jsx)(a,{path:`/game/match-groups/:groupId`,element:(0,O.jsx)($n,{})}),(0,O.jsx)(a,{path:`/game/admin/live/tournaments/:id`,element:(0,O.jsx)(fr,{session:e})}),(0,O.jsx)(a,{path:`/game/admin/live/match-groups/:groupId`,element:(0,O.jsx)(pr,{session:e})}),(0,O.jsx)(a,{path:`/game/download`,element:(0,O.jsx)(Xn,{})}),(0,O.jsx)(a,{path:`/game/cli-login`,element:(0,O.jsx)(Zn,{session:e})}),(0,O.jsx)(a,{path:`/game/admin/eligibility`,element:(0,O.jsx)(nr,{session:e})}),(0,O.jsx)(a,{path:`/game/admin/match-runner`,element:(0,O.jsx)(_r,{session:e})}),(0,O.jsx)(a,{path:`/game/admin/tournaments`,element:(0,O.jsx)(dr,{session:e})}),(0,O.jsx)(a,{path:`/game/admin/maps`,element:(0,O.jsx)(vr,{session:e,admin:!0})}),(0,O.jsx)(a,{path:`/game/admin/matches`,element:(0,O.jsx)(yr,{session:e,admin:!0})}),(0,O.jsx)(a,{path:`/game/admin/statistics`,element:(0,O.jsx)(er,{session:e})}),(0,O.jsx)(a,{path:`/game/eligibility`,element:(0,O.jsx)(tr,{session:e})}),(0,O.jsx)(a,{path:`/game/team`,element:(0,O.jsx)(rr,{session:e})}),(0,O.jsx)(a,{path:`/game/team/join`,element:(0,O.jsx)(ar,{session:e})}),(0,O.jsx)(a,{path:`/game/team/:teamId`,element:(0,O.jsx)(ir,{session:e})}),(0,O.jsx)(a,{path:`/game/patch-notes/:patchNoteId?`,element:(0,O.jsx)(Vn,{session:e})}),(0,O.jsx)(a,{path:`/game/admin/patch-notes/:patchNoteId?`,element:(0,O.jsx)(Un,{session:e})}),(0,O.jsx)(a,{path:`/game/api`,element:(0,O.jsx)(or,{pageId:`bot-api`})}),(0,O.jsx)(a,{path:`/game/docs`,element:(0,O.jsx)(or,{})}),(0,O.jsx)(a,{path:`/game/announcements/:announcementId?`,element:(0,O.jsx)(Hn,{session:e})}),(0,O.jsx)(a,{path:`/game/maps`,element:(0,O.jsx)(vr,{session:e})}),(0,O.jsx)(a,{path:`/game/monsters`,element:(0,O.jsx)(i,{to:`/game/docs/camps`,replace:!0})}),(0,O.jsx)(a,{path:`/game/test-runs`,element:(0,O.jsx)(i,{to:`/game/submissions`,replace:!0})}),(0,O.jsx)(a,{path:`/game/ladder`,element:(0,O.jsx)(cr,{})}),(0,O.jsx)(a,{path:`/game/tournaments`,element:(0,O.jsx)(lr,{})}),(0,O.jsx)(a,{path:`/game/tournaments/:id`,element:(0,O.jsx)(ur,{myTeamId:e.profile?.currentTeam?.id})}),(0,O.jsx)(a,{path:`/game/matches`,element:(0,O.jsx)(mr,{session:e})}),(0,O.jsx)(a,{path:`/game/match-database`,element:(0,O.jsx)(hr,{session:e})}),(0,O.jsx)(a,{path:`/game/admin/match-database`,element:(0,O.jsx)(hr,{session:e,admin:!0})}),(0,O.jsx)(a,{path:`/game/matches/:teamId`,element:(0,O.jsx)(yr,{session:e})}),(0,O.jsx)(a,{path:`/game/submissions`,element:(0,O.jsx)(gr,{session:e})}),(0,O.jsx)(a,{path:`/game/visualiser/:matchId?`,element:(0,O.jsx)(br,{tool:`visualiser`,session:e})}),(0,O.jsx)(a,{path:`/game/mapeditor/:mapId?`,element:(0,O.jsx)(br,{tool:`mapeditor`,session:e})}),(0,O.jsx)(a,{path:`/game/map-editor`,element:(0,O.jsx)(i,{to:`/game/mapeditor`,replace:!0})}),(0,O.jsx)(a,{path:`/game/docs/:championName`,element:(0,O.jsx)(or,{})}),(0,O.jsx)(a,{path:`*`,element:(0,O.jsx)(Yt,{})})]})})})})})})})})}(0,je.createRoot)(document.getElementById(`root`)).render((0,O.jsx)(D.StrictMode,{children:(0,O.jsx)(Ve,{children:(0,O.jsx)(r,{children:(0,O.jsx)(xr,{})})})})),hn(!1);export{It as A,vt as B,Ft as C,Et as D,Ht as E,Pt as F,Xe as G,mt as H,Lt as I,Fe as J,Ze as K,St as L,wt as M,jt as N,Ct as O,Nt as P,Bt as R,Ot as S,Vt as T,$e as U,k as V,Qe as W,we as X,Oe as Y,T as Z,Gt as _,Pn as a,Rt as b,wn as c,Cn as d,En as f,Wt as g,In as h,Fn as i,Tt as j,At as k,kn as l,Nn as m,Dn as n,Mn as o,An as p,He as q,On as r,jn as s,Bn as t,Tn as u,Dt as v,A as w,zt as x,Mt as y,xt as z};