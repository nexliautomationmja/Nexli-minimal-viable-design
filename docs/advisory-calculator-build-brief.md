> **SUPERSEDED — do not build from this.**
>
> The $297 product is no longer a Google Sheet. It is a single five-page PDF,
> the **Book of Business Accelerator**, and it already exists. This file
> specifies a spreadsheet that will never be built and is kept only as a
> record of the pricing model, whose fee curve the PDF adopted.

# Build brief — High-Ticket Advisory Pricing Calculator

> **How to use this file:** paste everything below the line into Claude Cowork as a single message.
> Marcel's own notes are at the bottom of this file, under "Before you ship" — those are for you, not for Cowork.

---

Build me a spreadsheet product: the **High-Ticket Advisory Pricing Calculator**.

Deliver an **`.xlsx` file** plus a short setup README. Read this whole brief before starting. Where I have specified a formula or a constraint, treat it as a requirement rather than a suggestion, and tell me if you think any of it is wrong.

## Who this is for, and why that governs everything

The buyer is the **owner of a US CPA firm doing $400K–$5M in annual revenue**. They have already paid $297 for this. They are an expert user: they will open it, enter one client they know well, and check the output against their own knowledge. If the arithmetic is naive, if a deferral is dressed up as a saving, or if a strategy is quoted that their state does not allow, they will ask for a refund inside five minutes — and the product carries a 30-day no-questions refund, so there is no friction stopping them.

Design for a sceptical professional, not a consumer. Precision about limits reads as competence to this audience. Confident over-claiming reads as a promoter, which is the worst thing it can read as.

## What the product does

Two jobs, in this order.

**1. Score an existing client book.** The firm types a handful of fields per client, read straight off a return, and the tool ranks who is most likely overpaying — who to call first, second, third. Ten clients must take about ten minutes.

**2. Price the engagement.** For the few clients they will actually pitch, a deeper pass estimates first-year tax savings and derives a defensible advisory fee as a share of those savings, with the arithmetic visible.

It also has to give them **the language for the conversation**, so they are not improvising when they quote the number.

These are commitments already made on the sales page. The exact promises, which are your acceptance criteria:

- "scores that book, tells you who to call first, and prices what fixing it is worth"
- "A score for every client in your book, worst overpayer first"
- "The fee that engagement actually supports, with the arithmetic shown"
- "The language for the conversation, so you are not improvising"
- "Make your copy and run ten clients through it before close of business"
- "Works in Google Sheets and exports to Excel"

## Numbers the tool must be consistent with

| Figure | Meaning |
|---|---|
| **$4,000** | The honest low fee. The tool must be willing to output this. The page says so explicitly: it will "tell you when the honest answer is $4,000." |
| **$15,000** | The ceiling. The page says this is "not a number the calculator hands everyone" — so it must genuinely be rare. |
| **$800** | What the firm currently invoices for the return alone. The baseline being displaced. |

Use the client-savings bands this audience has already been shown elsewhere in the funnel: `Under $10K`, `$10K – $50K`, `$50K – $100K`, `$100K+`.

Do **not** introduce $5,000, $25,000, $750,000 or "50 leads" anywhere. Those belong to a different, unrelated offer and would confuse the buyer.

---

# The architecture decision that decides whether this is credible

**Compute one baseline tax, apply strategies sequentially to a single running scenario, and define total savings as `baseline total tax − final total tax`.** Then allocate that total back to individual strategies pro rata for display.

Do **not** compute each strategy independently and add them up. Every interaction between these strategies is real and negative:

- Lowering an S-corp wage increases employment-tax savings but shrinks SEP capacity and can trip the §199A 50%-of-W-2-wages limit.
- A PTET election reduces K-1 income and therefore reduces QBI.
- Retirement contributions reduce QBI.
- Accountable-plan reimbursements reduce QBI.

A CPA will turn on two strategies and check whether the total equals the sum of the two individually. If it does, they will know the model is naive. Include a visible **"interaction adjustment: −$X"** line so that your handling of this is legible rather than merely correct.

---

# Tab structure

`Start Here` · `Rates` · `States` · `Engine` · `Triage` · `Deep Dive` · `Templates` · `Conversation`

---

## Tab: `Rates`

Every tax constant, each one **named**, **sourced** and **dated**. Nothing hardcoded inline anywhere else in the workbook — every other tab references this tab by name.

Needs: ordinary brackets by filing status, Social Security wage base, Additional Medicare threshold, NIIT threshold, §199A thresholds and phase-in ranges, §415(c) limit, elective deferral and catch-up limits, compensation limit, SALT cap and its phase-down parameters, standard deduction.

**Verify every one of these against primary sources (IRS pubs, revenue procedures, the statute) and cite the source in a cell note.** I have not verified them and you must not inherit numbers from me or guess them. If you cannot confirm a figure, mark the cell clearly as unverified rather than filling it in.

Put a banner at the top: `Tax year [YYYY] — last verified [date]`. Add a prominent note that the figures must be re-checked each year.

## Tab: `States`

One row per state plus DC. Columns: marginal income tax rate (or a note that there is none), **§199A conformity** (most states do not conform — it is a below-the-line federal deduction), **bonus depreciation conformity** (roughly twenty states decouple), entity-level tax and its cost, whether a PTET regime exists, how the credit mechanically works, and the **PTET payment deadline**.

The nine no-income-tax states must produce zeros, not blanks that silently compute as something else.

## Tab: `Triage` — the scoring pass

**Exactly six typed fields per client.** All of them pure transcription off a return — no judgement, no lookup, nothing the user has to go and find. This constraint is what makes "ten clients in ten minutes" true, so do not add a seventh.

| # | Field | Where they read it |
|---|---|---|
| 1 | Entity **and SSTB status**, as one dropdown (Sch C–SSTB / Sch C–non-SSTB / S-corp–SSTB / S-corp–non-SSTB / Partnership / C-corp / No business) | Face of the return; SSTB is known instantly from the industry |
| 2 | Business net profit, **before owner wage** | Sch C line 31; or 1120-S line 21 **plus** line 7 officer comp; or 1065 K-1 box 1 + guaranteed payments |
| 3 | Owner W-2 from their own entity (Medicare wages) | W-2 box 5, or 1120-S line 7. Zero for Schedule C by construction |
| 4 | Owner's **outside** W-2 Medicare wages (another job) | W-2 box 5 from any employer they do not own |
| 5 | AGI | 1040 line 11 |
| 6 | Total tax | 1040 line 24 |

Field 2 must be pre-wage so that Schedule C and S-corp clients are comparable. **Field 4 is not optional** — see the traps section.

**Resident state is a firm-level default** set once, with a per-client override column. Most of a firm's book is in one state; this should not cost six keystrokes per client.

Also capture, at firm level: the firm's standard hourly rate, and the default current compliance fee (prefill $800, overridable per client).

**Deliberately reject these fields** (and say in the sheet that you rejected them): gross revenue, refund or balance due, dependents, filing status detail, number of entities, and anything that asks the user to judge whether something "could be lower". A refund figure is a withholding artifact, not overpayment — if it appears in the scoring, the tool reads as consumer-grade.

### Output

Per client: an estimated **dollar band**, a **Tier (A / B / C)**, and up to three **named flags**. Sort descending by band midpoint.

**Do not output a 0–100 score as the headline.** A score reads as astrology to a CPA; a dollar band with named mechanisms reads as a work product. If you want a score for tie-breaking *within* a tier, fine, but it must not be the primary output.

Triage may use crude additive components — but each one hard-haircut and capped — because the real sequential engine lives in the Deep Dive. Components to consider:

- **Employment-tax arbitrage**, only for Schedule C / partnership above roughly $80K profit, and only against `MAX(0, wage_base − outside_W2)`. Haircut for the lost deduction and subtract admin cost.
- **QBI creation** — non-SSTB, no W-2 wages in the business, AGI above the threshold. This is usually the largest and most reliable component. See the corrections section.
- **Retirement capacity gap** — compute it, but tag it **deferral** and keep it out of the Tier-A dollar band. Show it in a separate "deferral capacity" column.
- **Comp rebalance** where an S-corp wage is too high — opportunity.
- **Comp risk** where an S-corp wage is too low — a **red flag with $0 of savings**, never a saving.
- **PTET**, only after testing SALT room. See corrections.
- **Effective-rate anomaly** (`line 24 ÷ line 11` against a benchmark by AGI band) — a flag worth **zero dollars**. It starts a conversation, it is not a saving.

Tiers: **A** = midpoint ≥ $20,000 with at least one high-confidence component. **B** = $10,000–$20,000, or above $20,000 but built only from medium-confidence or deferral components. **C** = below $10,000, or nothing but risk flags.

**Print the expected hit rate on the tab: roughly 1–2 clients in 10 should be Tier A.** If a user enters ten clients and gets eight Tier As, they will rightly conclude the model is flattering them. Letting the output validate itself is worth more than a flattering result.

## Tab: `Deep Dive` — the pricing pass

### In the fee base — four strategies

**A. Entity election + reasonable compensation, as one joint calculation.** Never two separate ones.

```
Baseline employment tax:
  Sch C:  12.4% × MIN(0.9235 × P, wage_base − outside_W2)
        + 2.9%  × 0.9235 × P
        + 0.9%  × MAX(0, 0.9235 × P + outside_W2 − threshold)
  S-corp: the same rates applied to W instead of 0.9235 × P

Candidate wage W*:
  non-SSTB above threshold → MAX(reasonable_comp_floor, 0.2857 × P)
  SSTB, or below threshold → reasonable_comp_floor

QBI, each scenario:
  deduction = MIN(0.20 × QBI, MAX(0.50 × W_total, 0.25 × W_total + 0.025 × UBIA))
  apply the phase-in; zero for a fully phased-out SSTB
  cap at 20% × (taxable income − net capital gain)

Net = Δ employment tax
    + Δ QBI deduction × federal marginal rate
    + Δ above-the-line deductions
    − entity costs (payroll service, extra return, state entity tax, FUTA/SUTA)
    × ownership %
```

The `0.2857` is where `0.20 × (P − W) = 0.50 × W`. Put that derivation in a cell note — CPAs recognise it and it earns credibility for one line of text.

State entity costs flip the sign more often than people expect (California's $800 minimum plus 1.5% S-corp tax, Illinois' replacement tax, Tennessee excise, NYC GCT). Pull them from the `States` tab, never a constant.

**B. Retirement right-sizing**, split into two parts that are treated differently:

- The **pure deferral** part — `Δ contribution × combined marginal × 0.80`, where the 0.80 reflects the §199A clawback. **Default weight in the fee base: 0%.** Label it "year-one cash-flow benefit", not savings. Give the firm an override (0 / 10% / 25%) that prints its justification on the client output.
- The **permanent** part, billed at 100% — threshold-crossing effects. A contribution that drops an SSTB below the §199A threshold restores a deduction permanently. Same for dropping MAGI below the SALT phase-down trigger.

Surface the tension with strategy A rather than hiding it: lowering an S-corp wage to save employment tax destroys SEP capacity (`0.25 × W`), while a solo 401(k) preserves the elective deferral. That trade-off is exactly what a CPA will try to break the tool with, so show it.

**C. PTET election** — see the correction below; this must test SALT room before claiming anything, and must be willing to output $0.

**D. Accountable plan / owner reimbursement** — `reimbursable × combined marginal × 0.80`. Small ($500–$3,000) and completely reliable. Include it; it makes the total read as computed rather than inflated.

### Flagged, shown, excluded from the fee base

**E. Defined benefit / cash balance plan.** Real money, but needs an actuary, a census and a multi-year funding commitment. Output a range, mark "requires actuarial quote", exclude until the quote exists.

**F. Cost segregation / bonus depreciation.** Gate behind three affirmative answers: real estate professional status or a short-term rental with material participation; depreciable basis ≥ $500K; expected hold ≥ 5–7 years. Fail any one and output **$0 current-year benefit** with the carryforward shown separately, because §469 suspends the loss. It is also a **deferral with §1245 recapture at ordinary rates** — NPV it, show the recapture year, never put it in the fee base. The promoter version of this calculation applied to a W-2 earner with a long-term rental is the single fastest way to lose this buyer.

**G. Income timing, accrual-to-cash, installment sales.** Flag only.

### Explicitly excluded, and say so on the face of the tool

§831(b) captive insurance, conservation easements, Malta pensions, monetized installment sales, charitable LLCs, Puerto Rico Act 60, 7702 / "infinite banking" products, ERC mills.

These are listed or listed-adjacent and carry material-advisor exposure. One appearance marks the author as a promoter. **Add a short "strategies we deliberately exclude, and why" block** — it converts a risk into a trust signal, and no competing tool does it.

---

# The fee formula

A **regressive** share of first-year savings. A flat 30% would hit the $15,000 ceiling at $45,000 of savings — reachable by a single S-corp conversion — so the ceiling would be handed out constantly, which contradicts what the sales page promises.

Interpolate linearly between these anchors:

| First-year savings (conservative case) | Blended % | Fee |
|---|---|---|
| ≤ $13,333 | — | **$4,000 floor** |
| $13,333 | 30% | $4,000 |
| $25,000 | 28% | $7,000 |
| $50,000 | 24% | $12,000 |
| $75,000 | 20% | **$15,000 ceiling** |
| > $75,000 | — | $15,000, with the computed figure also shown |

**Price off the low case.** Compute savings as a low / base / high band and set the fee from the **low** end. This costs fee and buys the entire credibility argument — "I priced this off the conservative number" — and protects against a true-up fight later.

**Four guardrails:**

1. **Cost floor.** Hours estimate (10–25 is realistic for a first-year planning engagement including implementation) × the firm's rate. If the computed fee is below cost, the tool says **do not sell this**.
2. **Fee vs total tax.** Above roughly 8–10% of the client's line 24, it reads as outrageous regardless of the savings math. Flag it.
3. **Net to client.** `savings_low − fee − client implementation costs` must be positive and ideally at least 2× the fee. If not, refuse to produce a quote.
4. **Never silently clamp** above $15,000. Show the computed figure, show the cap, and offer three named paths: quote the cap and bank the goodwill; split scope (planning at the cap, implementation quoted separately); or a multi-year agreement.

**The tool must be able to say no.** A visible output along the lines of *"this client does not support an advisory engagement — recommend a compliance-plus review instead."* A tool that can only ever say yes is not trusted by this buyer.

Against the $800 baseline, show three framings: the new all-in year-one fee, the increment over the baseline, and the client's net benefit. Also output a **separate recurring retainer** suggestion for the strategies tagged recurring — that is how firms actually price year two onward and they will expect to see it.

---

# Corrections to assumptions you may otherwise make

These are specific, and getting them wrong is what loses the buyer.

**1. "No PTET election" is a much weaker signal than it used to be.** Recent legislation raised the SALT cap substantially with a phase-down at high MAGI. PTET's value is deducting state tax the cap would otherwise waste — if the client's state and property tax fit under the cap, the benefit is approximately zero. Only flag PTET when state tax plus property tax materially exceeds the available SALT room, or MAGI is high enough to be in the phase-down. **Verify the current cap, phase-down threshold and rate against primary sources.**

**2. Reasonable compensation that is too LOW is a risk, not an opportunity.** Fixing it *costs* the client money. It is a pitchable engagement (a defensible comp study, penalty avoidance) but it must never enter the savings number that drives the fee. Comp that is too **high** is the real and commonly missed opportunity — firms over-salary S-corp owners out of caution. Score low comp red, high comp green. They are different flags.

**3. For a high-income Schedule C, the SE-tax story is not the main story.** Above the wage base the arbitrage collapses to the Medicare rates. The real money is **QBI creation**: a non-SSTB Schedule C above the threshold with zero W-2 wages has a §199A deduction of **$0**, because the 50%-of-wages limit binds at zero. Electing S status and paying a reasonable wage can manufacture a large deduction. Flip the same client to SSTB and that piece vanishes entirely — the total can fall by roughly two-thirds. **The SSTB bit changes the answer by about 3× on the most common client type**, which is why it shares a dropdown with entity type.

**4. Outside W-2 wages can kill the SE-tax thesis entirely.** The Social Security wage base is per person per year across all earnings. A Schedule C owner whose other job already exceeds the base pays only Medicare on the Schedule C profit. Pitch that client an S-corp on SE-tax grounds and the CPA finds the error in ninety seconds.

---

# Credibility traps — defend against every one

| Trap | Defense |
|---|---|
| A deferral billed as a saving | Every strategy carries a Permanent / Deferral tag. Deferrals default to 0% fee weight. NPV shown. Recapture year shown for cost seg. |
| Double counting overlapping strategies | The sequential engine. Plus the visible interaction-adjustment line. |
| §469 ignored on cost segregation | Three-question gate; fail → $0 current benefit, carryforward separate. |
| The tool inventing reasonable compensation | **Required CPA input with an initials-and-date cell. Refuse to compute strategy A without it.** This is the largest liability surface in the product. Note that the §199A-optimal wage and reasonable compensation are different concepts, and reasonable compensation governs. |
| State tax ignored, or a federal rate applied to state | The `States` tab, with conformity columns. |
| A deduction displayed as a credit | Force every line to the form `Deduction $X × marginal Y% = tax effect $Z`. A raw deduction may never appear in a savings column. |
| SSTB phase-out ignored | Hard gate: SSTB above full phase-out → QBI is zero in every scenario. |
| Average rate used where marginal belongs | Compute marginal from actual brackets, including the stacked effects (§199A phase-in, SALT phase-down, NIIT, Additional Medicare). Allow a typed override. |
| Implied precision | Round all outputs to the nearest $500. Savings always a band, never a point. No savings figure to the dollar, anywhere. |
| Client implementation cost ignored | A per-strategy "client out-of-pocket" field (payroll service, extra return, actuary, cost seg study), netted off before the fee. |
| Savings the client is already capturing | Every strategy needs a *current* value, not just a potential one. If they already defer $40K, the gap is not $72K. |
| Mid-year engagement ignored | An "engagement start month" input, with per-strategy proration and deadline warnings (election timing, PTET payment date, plan adoption deadlines). |
| Multi-state owner | **Refuse.** More than one state filed → "manual review required", not a number. |
| Ownership % ignored | All savings × the owner's percentage. |
| Partnership "convert to LP to dodge SE tax" | Do not offer it. Recent case law has gone against the limited-partner exception. |
| S-corp recommended for the wrong client | Refuse below roughly $60K profit. Warn where state entity tax flips the sign, where the client needs maximum SEP capacity, where they are near retirement and accruing Social Security credits, or where there are outside investors. |
| QBI's taxable-income-less-capital-gain cap ignored | Apply it; flag clients with large long-term gains. |
| AMT | Do not model it. Detect the risk zone and emit "manual AMT check required." |
| Rates with no vintage | The `Rates` banner, plus a nag if the file is opened in a later year. |
| Garbage in, number out | Validate: wage ≤ profit, contribution ≤ cap, AGI plausible against profit, state from the list. Invalid input → **refuse to compute**. Do not degrade gracefully into a wrong answer. |

---

# Disclaimers and framing

The voice throughout is **"here is arithmetic, you supply the judgement."** Everywhere it would be tempting to assert, have it ask.

**`Start Here` tab**, six short points — not a wall of text:

1. A pricing and triage tool for licensed practitioners. Not tax advice, not a tax opinion, not a substitute for a projection from the actual return.
2. Outputs are estimates from a small number of inputs and will be wrong in individual cases.
3. The practitioner is solely responsible for determining reasonable compensation, eligibility, material participation, and whether any position is supportable — reference Circular 230 §§10.33 and 10.34, IRC §6694, and AICPA SSTS No. 1.
4. Rates are for tax year [YYYY], last verified [date]. Verify before relying.
5. No engagement, no privilege, no warranty of outcome.
6. Do not send this file to a client — it contains your pricing logic. Use the client-facing output.

**Every computed tab**, one footer line: *"Estimate. Validate against a full projection before quoting."*

**Every rate cell**: a note with source and date.

**On the client-facing output**: a full assumptions block (every input and assumption, so the CPA can hand the page over and defend it line by line), a per-strategy confidence tag (High / Medium / Requires specialist), and a "what this does not consider" list — AMT, NIIT nuances, multi-state apportionment, prior-year carryforwards, basis and at-risk limits, suspended passive losses, fringe benefits, health insurance, estate and gift, R&D credits, foreign reporting.

---

# `Templates` + `Conversation` tabs

CPAs will not read a script aloud. What they lack is structure for three moments: the opening, the price reveal, and *"why didn't you do this before?"* — which is the question that actually gets asked and the real reason firms avoid this conversation.

Assemble the `Conversation` tab from `Templates` using `SUBSTITUTE` / `TEXTJOIN`, with `{{placeholders}}` the firm edits once in its own voice. Include blocks conditionally, based on which strategies are active:

1. **Observation, stated as fact** — "Last year you earned ${{profit}} through {{entity}} and paid ${{total_tax}} — an effective rate of {{eff_rate}}%."
2. **The gap** — the named flags, as structural items that cost money every year.
3. **The number as a band** — "${{low}} to ${{high}}, and I've priced this off the low end."
4. **The arithmetic, as a printable table** — Strategy / Mechanism / Estimated effect / Permanent or deferral / Confidence. This table *is* the "arithmetic shown" the sales page promises. Make it a real table, not prose.
5. **Fee and split** — including that the ${{baseline}} compliance fee is inside this, not on top of it.
6. **Scope bullets**, assembled from the active strategies.
7. **What it costs the client to implement**, stated unprompted. Largest trust gain per word in the whole script.
8. **The honest caveat** — one sentence drawn from the lowest-confidence active strategy, with its sensitivity.
9. **Objection responses**, conditionally selected: *"why didn't you do this before?"*, fee versus the old ${{baseline}}, "just bill me hourly", and "what if the savings don't materialise?" tied to a true-up policy the firm sets once.
10. **The ask, with a real deadline** — pull the earliest genuine deadline among the active strategies. Urgency that is factually true is the only safe kind.

Also generate a **six-line email version** and a **one-page leave-behind** from the same cells, with the print range set so the leave-behind actually fits on one page.

---

# Technical constraints

- **Deliver `.xlsx`.** It will be uploaded to Google Drive and converted to a Google Sheet, then shared as a "make a copy" link. It must survive that round trip.
- **No Apps Script, no macros, no external calls, no `IMPORTRANGE`.** A stranger clicking "make a copy" must get a working file with zero permission prompts.
- **The sales page promises it "works in Google Sheets and exports to Excel"**, so avoid functions that exist in only one: no `QUERY`, `ARRAYFORMULA`, `SPARKLINE`, `GOOGLEFINANCE`. Stick to `IF`, `IFS`, `INDEX`, `MATCH`, `RANK`, `ROUND`, `MROUND`, `MIN`, `MAX`, `SUMPRODUCT`, `TEXT`, `SUBSTITUTE`, `TEXTJOIN`, `VLOOKUP`. Prefer `INDEX`/`MATCH` over `XLOOKUP` for older Excel.
- **Cell protection does not survive a copy reliably**, so separate inputs from calculations visually instead: one fill colour for "you type here", another for "do not touch", stated in a legend on `Start Here`.
- Use **named ranges** for everything on `Rates` and `States`.
- **Data validation dropdowns** for entity type, state, filing status, and every yes/no gate.
- **Conditional formatting** for tiers and for risk flags, using colour *and* text — never colour alone.
- Formatting: USD, **no cents**, thousands separators. Savings and fees rounded to the nearest $500.
- Make `Triage` handle at least 100 client rows with formulas pre-filled.
- Include a **worked example client** with realistic numbers, clearly marked as sample data and easy to clear, so the buyer sees it working within thirty seconds of opening it.

# What to deliver

1. The `.xlsx` file.
2. A short **README** covering: how to upload and convert to a Google Sheet, how to set sharing to "anyone with the link — viewer", and how to produce the `/copy` share link (replace `/edit` and everything after it with `/copy` — an `/edit` link would hand every buyer the master file).
3. A one-page **changelog of every assumption you made and every rate you could not verify**, so it can be checked before the file goes behind a paywall.

# How I will judge it

- Enter a Schedule C client, $400K profit, no retirement plan, non-SSTB, no outside W-2. The tool should identify QBI creation as the dominant opportunity, not SE-tax arbitrage.
- Change that client to SSTB. The savings should fall sharply and the reasoning should visibly change.
- Give that client $200K of outside W-2 wages. The SE-tax component should collapse.
- Turn two strategies on individually, note each result, then turn both on. **The combined total must be less than the sum, and the interaction line must show why.**
- Enter a small client. The tool must say *don't sell this* rather than manufacturing a $4,000 fee.
- Enter an enormous client. The fee must cap at $15,000, show the computed figure, and offer the scope-split options.
- Delete the reasonable-compensation input. Strategy A must refuse to compute.
- Set state to one with no income tax. All state components must be zero.

If anything in this brief is wrong — particularly the tax mechanics or the fee anchors — say so rather than building it as specified.

---

---

## Before you ship (Marcel — not part of the Cowork prompt)

**Have a practising CPA review the finished Sheet before it goes behind the paywall.** I could not verify the 2026 rate figures, the current SALT cap and its phase-down, the §199A thresholds, or the bonus-depreciation rules from here, and neither the brief nor Cowork's output should be trusted on those without checking. The brief tells Cowork to verify and cite every rate and to hand you a list of anything it could not confirm — read that list first. Shipping unverified tax parameters to tax professionals is worse than shipping late.

**Three things in the funnel depend on this Sheet delivering what the brief describes:**

- The copy promises it **scores an existing book**, not just prices one engagement. That was your call and it is the strongest part of the pitch, but if the Sheet ends up as a single-engagement pricer the sales copy has to come down before launch.
- The copy promises **"the language for the conversation"** — that is the `Conversation` tab, not an optional extra.
- The Terms page commits to **two artifacts**: the Sheet and a written guide. This brief covers the Sheet only. The guide is the "where advisory pricing quietly goes wrong at most firms" write-up the funnel sells, and it needs to agree with the Sheet's logic — particularly the permanent-versus-deferral distinction and the exclusion list.

**When the Sheet exists**, set `ADVISORY_SHEET_COPY_URL` (ending in `/copy`) and `ADVISORY_DRIVE_FOLDER_URL` in Vercel. The delivery block on the thank-you and next-steps pages swaps from its placeholder state to real buttons with no code change.
