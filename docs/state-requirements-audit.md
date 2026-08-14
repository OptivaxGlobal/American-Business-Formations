# State Requirements Audit Documents & Verification (2026-08-13)

Source of truth: `src/config/stateRequirements.js` (frontend), mirrored for
server-side enforcement in `server/app/services/states.py`. This doc is the
consolidated "Needs Review" list Part 30 of the spec asks for, plus a
summary of what was independently verified against official government
sources in this pass versus what still needs a follow-up check.

## Directly verified against an official source this session

| State | What was checked | Official source |
|---|---|---|
| Texas | Formation document name/form number, Series LLC + PLLC availability | [Form 205 instructions](https://www.sos.state.tx.us/corp/instructions/205.shtml), [Texas SOS](https://www.sos.state.tx.us/) |
| California | Formation document name/fee, series LLC unavailable, PLLC unavailable (licensed professions excluded from the CA LLC Act) | [bizfile Online](https://bizfileonline.sos.ca.gov/), [CA FTB LLCs](https://www.ftb.ca.gov/file/business/types/limited-liability-company/index.html) |
| Florida | Formation document, PLLC availability (Ch. 605/621, F.S.), Protected Series LLC now in effect (legislation effective July 1, 2026) | [Sunbiz FL LLC e-filing](https://dos.fl.gov/sunbiz/start-business/efile/fl-llc/) |
| Delaware | Formation document, Series LLC statute (6 Del. C. § 18-215), no separate annual report (flat $300 annual tax) | [Delaware Division of Corporations](https://corp.delaware.gov/), [Del. Code Title 6, Ch. 18](https://delcode.delaware.gov/title6/c018/index.html) |
| New York | Formation document, § 206 publication requirement (120-day deadline, 2 newspapers, 6 weeks, $50 Certificate of Publication fee), PLLC filing process with NYSED Office of the Professions | [NY DOS LLCs](https://dos.ny.gov/limited-liability-company), [NYSED PLLC checklist](https://www.op.nysed.gov/corporate/domestic-pllc-checklist) |
| Arizona | Publication requirement + Maricopa/Pima County online-database exemption (A.R.S. § 10-130(B)); confirmed Arizona does **not** authorize a new domestic series LLC (only recognizes foreign series LLCs registering to transact business, with the inter-series liability shield unenforceable against AZ creditors) | [Arizona Corporation Commission](https://azcc.gov/) |
| Series LLC availability, all 21 states | Cross-checked which of the 21 currently authorize a domestic series LLC | Multiple aggregator sources cross-referenced against the DE/TX/FL/AZ official-source findings above |

Result: **Delaware, Texas, Nevada, Illinois, Utah, Wyoming, Montana, and
Florida** (effective July 1, 2026) are the only supported states offering a
domestic Series LLC. The other 13 do not.

## Flagged "Needs Review" not independently verified this session

Per the spec's instruction to flag rather than guess, **PLLC availability**
for the following 17 states defaults to "available" in the UI (professional
LLCs are the norm, not the exception, across U.S. states) but was **not**
independently checked against each state's own professional-licensing
statute for every regulated profession this session:

Arizona, Colorado, Delaware (distinct PLLC designation, specifically),
Georgia, Idaho, Illinois (statute confirmed to exist; per-profession
eligibility not exhaustively checked), Iowa, Montana, Nevada, New Hampshire,
New Jersey, New Mexico, Oregon, Utah, Virginia, Washington, Wyoming.

**Recommendation before this is used to make a binding representation to a
customer selecting PLLC in one of these states:** confirm the specific
profession's licensing board allows LLC-based practice in that state, since
a small number of professions in a small number of states have carve-outs
even where the state's LLC Act broadly permits PLLCs. This is exactly the
kind of state law confirming that should happen before ABF asks the
customer for a professional-license copy or represents the entity type as
available the `conditionalCustomerUploads` professional-license request
already carries a note directing this back to the customer's licensing
board rather than asserting it as settled.

## Post-formation requirement fees/deadlines

All 21 states' `post_formation_tasks` (annual/biennial report fees and
deadlines) were carried forward from the existing, previously-verified
`note` field in `src/data/states.js`/`server/app/services/states.py`
(verified 2026-08-06) except where this session's research produced more
specific figures (California, Texas, Florida, Delaware, New York, Arizona —
see table above). Fees are government-set and can change without notice;
`verifiedDate` on each state's config entry is the last-checked date, not a
guarantee it's still current.

## What was explicitly NOT changed

- No LLC formation filing fee changed (Part 31) `llc_formation_fee_cents`
  in `server/app/services/states.py` / `llcFormationFee` in
  `src/data/states.js` are untouched.
- No state was added to or removed from the 21 supported states.
- Entity-type additions (Series LLC, PLLC) never override or replace the
  standard "LLC" option, which every state supports.
