# Nationwide Expansion Audit (2026-08-13)

LLC Formation and Registered Agent expanded from 21 states to all 52
jurisdictions (50 states + Washington, D.C. + Puerto Rico). Virtual Office
deliberately stayed at its original 21-state footprint. This doc lists what
was independently verified this session, the sources used, and every item
flagged **Needs Review** rather than guessed.

## Sources used (official filing authorities only)

Every one of the 31 new jurisdictions' filing fee, filing authority name,
and formation document name was checked against that jurisdiction's own
Secretary of State / Department of State / Division of Corporations site
(source URLs are in `src/data/states.js` / `server/app/services/states.py`
per-jurisdiction). Several were confirmed directly against a primary `.gov`
document during this session (Alabama's SOS fee schedule PDF, Alaska's
Division of Corporations PDF, Tennessee's official LLC form, DC DLCP's
Articles of Organization form, Missouri's SOS fee PDF, Wisconsin DFI's
fee PDF). The remainder were corroborated across multiple independent
formation-service aggregators that agreed on the same figure, then matched
to that state's own official filing-authority URL — not treated as
authoritative on their own, only as corroboration pointing to the same
number an official source would show.

## Needs Review — flagged, not guessed

- **West Virginia filing fee**: a small number of sources cited $130
  instead of the $100/$101 figure used here. Confirm against WV's current
  official fee schedule before relying on this for a live order.
- **Kansas annual report**: current requirement/fee could not be confirmed
  with confidence this session.
- **Nebraska publication requirement**: Nebraska has a statutory
  publication requirement similar to New York's, but the exact current
  process/cost was not confirmed confirm before representing a firm cost
  to a customer.
- **PLLC availability for every new state** (all 31): defaults to
  "available" (professional LLCs are the norm across states) but was not
  individually verified against each state's professional-licensing
  statute for every regulated profession. See each state's
  `needsReview` entry in `src/config/stateRequirements.js`.
- **Series LLC for new states**: only South Dakota was directly confirmed
  (its Secretary of State publishes a distinct "Master Series Article of
  Organization" filing). All other newly-added states default to
  **unavailable** rather than guessing, even though some are informally
  cited elsewhere as having series LLC statutes (e.g. Alabama, Missouri,
  Oklahoma, Tennessee) — confirm against the state's own LLC Act before
  enabling.
- **Post-formation report fees for the 31 new jurisdictions**: cadence
  (annual/biennial/none) is reasonably well-established and was included;
  exact current fee amounts were not individually re-verified against each
  state's own site with the same rigor as the formation filing fee itself.
  Treat `postFormationRequirements[].governmentFee` for new states as
  indicative, not authoritative, until spot-checked.

## Geography data notes (not defects)

Three jurisdictions needed special handling in
`scripts/generate-geography.mjs`'s city list, each for a real, documented
structural reason in the U.S. Census Gazetteer data, not a bug:

- **Hawaii** has no incorporated municipalities at all (governance is
  entirely at the county level) — every populated place is a Census
  Designated Place (CDP). Falls back to CDPs for Hawaii only, so real
  places like Honolulu remain selectable.
- **Washington, D.C.**: the historical "City of Washington" is coded
  `FUNCSTAT=N` (nonfunctioning legal entity) in Census data, since
  Congress absorbed it into the unified DC government. Hardcoded to
  `["Washington"]`, the one real answer.
- **Puerto Rico**: its populated-place layer is entirely statistical; in
  Puerto Rico addressing convention, the municipio itself is used as the
  "city," so PR's city list reuses its own county (municipio) list.

Also fixed during this pass: Puerto Rico's Spanish place names (ñ, á, é,
í, ó, ú) were being corrupted (mojibake) because they're embedded as raw
UTF-8 bytes inside the otherwise-Latin-1 Census file — `fixMojibake()` in
the generation script detects and repairs this.

## What was explicitly NOT changed

- No LLC package price, add-on price, or government filing fee for any of
  the original 21 states changed.
- The 21-state Virtual Office footprint is unchanged and was not expanded.
- Mail Forwarding was already unrestricted by state before this session
  (no code gated it) its own "available in the states we support for LLC
  formation" copy now correctly reflects the now-nationwide LLC Formation
  footprint, since nothing ever capped Mail Forwarding itself at 21.
- Blog content was left untouched even where it still references "21
  states" (`src/data/blog/posts/new-york-llc-publication-requirement-explained.js`,
  `.../certificate-of-formation-vs-articles-of-organization.js`) — the
  spec for this task explicitly listed Blog as out of scope. These two
  articles now contain a stale fact as a result; flagging here rather than
  editing them without authorization.
