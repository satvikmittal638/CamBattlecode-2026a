# Mite-specific counter

Authorized stage after Fish v84 achieved 60/80 live wins over all forty maps and both sides, with native verification of all eighty games. Build a separate Mite bot with an explicit TARGET: Mite note. Evaluate all eighty map/side cases and maintain replay-selection and move-sequence rationale.

Work in progress; no Mite performance claim yet.

Submitted **v85**, candidate `mite-atlas-01`, with note `TARGET: Mite | mite01 | 40-map / both-side overfit counter`. All 114 uploaded source files byte-match the release-tested local source. The all-case opening check matched **38,000/38,000** turns through round100 across all80cases, with no state drift. The sourceZIP is 2,400,434bytes. Compilation/live tests are pending; these checks do not establish live Mite performance.

## v85 result and live-profile revision

v85 lost 0/15: every actual Mite draft differed from the selected source and latest ranked estimate. Observed live families: three picks `[6,2,3]`; four picks `[6,2,1,7]`; five picks `[1,2,0,10,6]`. A new selection uses these directly probed lineups (and infers the same family for untested maps of the same pick count). It finds exact-roster winning sources for 78/80 cases; both sides of `00collision` lack a matching source. All v85 failures and original references are preserved under `revisions/mite01`, trial data, and the evaluation-history JSON. No subsequent target is started.
