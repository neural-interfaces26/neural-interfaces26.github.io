# Proposal ↔ Website Alignment — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the public website `neuralinterface26.github.io` into full content-fidelity with the NeurIPS 2026 EEG/EMG Foundation Challenge proposal (`competitions_neurips_2026.tex`), resolve all P0–P3 discrepancies catalogued in the prior audit, and harden the result through scripted multi-agent review loops, local visual QA, and a final spec-coverage gate.

**Architecture:** Five-phase pipeline — (A) content inventory; (B) parallel content fan-out across the five HTML pages by partition; (C) sequential review loop combining `avoid-ai-writing` + `tom-neurips-review` until both pass clean; (D) local-deploy + `frontend-design` visual review with screenshot capture; (E) verification gate against the proposal as source-of-truth. Work happens on a dedicated branch; every phase ends with a git commit so loops can revert cleanly.

**Tech Stack:** Static HTML/CSS/JS (no build step). Python 3.12 `http.server` for local deploy. Git for branching. Claude Code subagents (`frontend-dev`, `copywriter`, `code-reviewer`) for parallel content work. Skills: `avoid-ai-writing`, `tom-neurips-review`, `frontend-design`, `critical-related-work-compression` (for any related-work text), `visual-verdict` (for screenshot scoring).

---

## 0. Methodology — "How we do this correctly"

Before any task fires, agree on these invariants. They prevent re-work later.

### 0.1 Source-of-truth hierarchy

1. **Proposal LaTeX** (`competitions_neurips_2026.tex`) is canonical for: organizers, datasets, metrics, timeline, prizes (cash amount), Track 5 scope, submission model, ethics text, expected participation.
2. **Website** is canonical for: visual design system, copy register, page structure, route names, anchor IDs.
3. **Disagreements** between the two are resolved by **updating the website** to match the proposal — except for items the proposal omits (e.g., audit tolerance, anonymous handle), which we treat as "site-side policy decisions" and which need a one-line acknowledgement back in the proposal during the next Overleaf push.

### 0.2 The two-loop review structure

```
                ┌─────────────────────────┐
draft (agent) → │  avoid-ai-writing pass  │ →  fix → re-run
                └─────────────────────────┘
                          ↓ clean
                ┌─────────────────────────┐
              → │   tom-neurips-review     │ → fix → re-run
                └─────────────────────────┘
                          ↓ clean
                ┌─────────────────────────┐
              → │  frontend-design visual  │ → fix → re-run
                └─────────────────────────┘
                          ↓ clean
                       commit
```

- A loop **terminates** when the reviewing skill returns "no findings" twice in a row (i.e., a re-run after a fix finds nothing further). Two passes prevent ping-pong rewrites.
- A loop **fails open** after **3 iterations** — at that point the human is paged with the open findings rather than burning more agent runs.
- Scientific-prose blocks (Background, Tracks 1–5 long descriptions, Metrics narrative) get `tom-neurips-review`; pure marketing copy (hero, CTAs, prize blurbs) skips it and only gets `avoid-ai-writing`.

### 0.3 Partitioning rule

To run agents in parallel without merge conflicts, **partition by file**. One agent owns one file end-to-end during its phase. Cross-file invariants (e.g., Track 5 description identical across `index.html`, `leaderboard.html`, `awards.html`) are enforced by a single agent doing all three in series within Phase B — that agent is the "Track-5 fixer" and writes to all three files in one task.

### 0.4 Commit cadence

- One commit per task. Subject line starts with `site:` for content, `fix:` for corrections, `feat:` for new sections.
- After each phase: a phase-close commit summarising the phase.
- No squashing — the loop's history is the audit trail.

### 0.5 What "done" means

Final state must satisfy **all** of:

1. Every proposal entity (organizer, dataset, metric, date, prize, baseline number, sponsor) appears verbatim on the website.
2. No remaining `XX.X`, `XXX`, `XX,XXX` placeholders in places where the proposal has values.
3. Track 5 scope identical across 3 files (4 tasks including EMG).
4. `python3 -m http.server` serves all five pages without console errors.
5. `avoid-ai-writing` and `tom-neurips-review` both return clean.
6. `frontend-design` visual review returns PASS on each page.
7. Spec-coverage script (Phase E) reports 0 unmapped proposal items.

---

## 1. File Structure

### 1.1 Files modified

- `/Users/bruaristimunha/Projects/neuralinterface26.github.io/index.html` — hero copy, stats counters, tracks (esp. Track 5), timeline, datasets table, models grid, sponsors
- `/Users/bruaristimunha/Projects/neuralinterface26.github.io/organizers.html` — add 3 missing organizers (Christopher Aimone, Thomas Moreau, Joséphine Raugel); update hero count 24 → 27
- `/Users/bruaristimunha/Projects/neuralinterface26.github.io/leaderboard.html` — Track 5 formal definition (3 → 4 tracks incl. EMG), metric names (W-bMAE), audit phase wording
- `/Users/bruaristimunha/Projects/neuralinterface26.github.io/awards.html` — Track 5 award scope, internship reinstated, NeurIPS Code of Ethics, affinity groups named
- `/Users/bruaristimunha/Projects/neuralinterface26.github.io/startkit.html` — submission model reconciliation (code vs prediction), GPU class (H100/H200), baseline numbers populated

### 1.2 Files created

- `/Users/bruaristimunha/Projects/neuralinterface26.github.io/ethics.html` — NeurIPS Code of Ethics adherence, mental-privacy rationale, dataset consent statements
- `/Users/bruaristimunha/Projects/neuralinterface26.github.io/track-record.html` — Past competition track record (BEETL, BAP, Sleep States, 2025 EEG Challenge) with cited numbers
- `/Users/bruaristimunha/Projects/neuralinterface26.github.io/faq.html` — contingency plan, anonymous handle policy, daily caps, audit policy, authorship policy
- `/Users/bruaristimunha/Projects/neuralinterface26.github.io/docs/superpowers/plans/2026-05-21-proposal-website-alignment.md` — this file
- `/Users/bruaristimunha/Projects/neuralinterface26.github.io/scripts/coverage-check.py` — Phase-E spec-coverage script
- `/Users/bruaristimunha/Projects/neuralinterface26.github.io/scripts/serve.sh` — one-shot local-serve helper
- `/Users/bruaristimunha/Projects/neuralinterface26.github.io/docs/CONTENT_INVENTORY.md` — Phase-A extracted facts table (source of truth for all subsequent agents)

### 1.3 Files NOT touched

- `assets/css/*` — design system stays
- `assets/js/*` — interactive behaviour stays
- `assets/img/*` — visual assets stay (only add a few new logos / pictures if missing organizers need avatars)

---

## 2. Branch & worktree setup

### Task 0.1: Create working branch

**Files:**
- Branch: `site/proposal-alignment-2026-05-21` on the website repo

- [ ] **Step 1: Check status on website repo**

```bash
cd /Users/bruaristimunha/Projects/neuralinterface26.github.io
git status
git log -1 --oneline
```

Expected: working tree clean (or only `.DS_Store` untracked).

- [ ] **Step 2: Create and switch to feature branch**

```bash
cd /Users/bruaristimunha/Projects/neuralinterface26.github.io
git switch -c site/proposal-alignment-2026-05-21
```

Expected: `Switched to a new branch 'site/proposal-alignment-2026-05-21'`.

- [ ] **Step 3: Commit (empty marker)**

```bash
git commit --allow-empty -m "site: begin proposal-alignment branch"
```

---

## 3. Phase A — Content Inventory (extract facts from proposal)

Goal: build a single machine-readable list of every proposal fact the site must reflect. Every subsequent agent reads from `CONTENT_INVENTORY.md` rather than the LaTeX directly, so they all see the same canonical values.

### Task A.1: Extract organizers, datasets, dates, prizes, metrics from proposal

**Files:**
- Create: `/Users/bruaristimunha/Projects/neuralinterface26.github.io/docs/CONTENT_INVENTORY.md`
- Read: `/Users/bruaristimunha/Projects/NeurIPS-2026---EEG-EMG-competition/competitions_neurips_2026.tex`

- [ ] **Step 1: Dispatch `scout` agent (parallel reader) — single tool call**

Prompt (verbatim):
```
You are extracting facts from a NeurIPS competition proposal into a structured inventory for downstream website-population agents.

Read: /Users/bruaristimunha/Projects/NeurIPS-2026---EEG-EMG-competition/competitions_neurips_2026.tex (entire file)
Also read: /Users/bruaristimunha/Projects/NeurIPS-2026---EEG-EMG-competition/affiliations.tex (for affiliation expansions)
Also read: /Users/bruaristimunha/Projects/NeurIPS-2026---EEG-EMG-competition/references.bib (only to verify which citations are real)

Produce a single Markdown file at /Users/bruaristimunha/Projects/neuralinterface26.github.io/docs/CONTENT_INVENTORY.md with these sections, each as a table:

1. Organizers (27 rows). Columns: # | Name | Affiliations (resolved) | Email | Competition role | One-line bio anchor.
2. Datasets (one row per public dataset + hidden eval set). Columns: Track | Name | Citation key | Hardware | Subjects | Notes.
3. Metrics. Columns: Track | Headline metric | Direction (↑/↓) | Diagnostic metrics | Formula label in proposal.
4. Timeline. Columns: Date | Milestone | Source line.
5. Track 5 scope. Plain-text list of tasks it covers (must be 4: IMG, BCI, Sleep, EMG).
6. Prize structure. Columns: Item | Amount | Source line.
7. Sponsors. Columns: Role (Compute partner / Track sponsor / Org / Diversity) | Name | URL.
8. Baselines table. Reproduce Table tab:neuralbench-four-tasks exactly.
9. Promotion channels. List items.
10. Ethics statements. Quote each ethics-related sentence with source line.
11. Past competition track record. Each competition with year and numbers.
12. Submission model. Two-line quote from proposal characterising it as code-submission.
13. Compute partner details. Quote AWS/Yneuro/Deloitte sentences with source line.
14. Communication channels. Email + Discord + website URLs as they appear in the proposal.
15. Authorship & methods report policy.
16. Discrepancy notes — list every place the proposal contradicts itself (e.g., two different domain spellings, two different Track-5 scope phrasings).

For every fact, include the proposal source line number(s) in parentheses. Do NOT paraphrase; copy the proposal's wording.

Report under 400 words at the end, listing any sections of the proposal you could not parse cleanly.
```

- [ ] **Step 2: Verify the inventory exists and spot-check 3 entries**

```bash
test -f /Users/bruaristimunha/Projects/neuralinterface26.github.io/docs/CONTENT_INVENTORY.md && wc -l /Users/bruaristimunha/Projects/neuralinterface26.github.io/docs/CONTENT_INVENTORY.md
grep -c "Aristimunha" /Users/bruaristimunha/Projects/neuralinterface26.github.io/docs/CONTENT_INVENTORY.md
grep -c "emg2qwerty" /Users/bruaristimunha/Projects/neuralinterface26.github.io/docs/CONTENT_INVENTORY.md
grep -c "84.75" /Users/bruaristimunha/Projects/neuralinterface26.github.io/docs/CONTENT_INVENTORY.md
```

Expected: file exists with ≥ 300 lines; each grep ≥ 1.

- [ ] **Step 3: Commit**

```bash
cd /Users/bruaristimunha/Projects/neuralinterface26.github.io
git add docs/CONTENT_INVENTORY.md
git commit -m "site: extract proposal facts into CONTENT_INVENTORY"
```

### Task A.2: Reconcile internal proposal contradictions

The proposal contradicts itself in 3 known places. Decide the canonical version *once*, before the website work starts.

**Files:**
- Modify: `/Users/bruaristimunha/Projects/neuralinterface26.github.io/docs/CONTENT_INVENTORY.md` (add a "Canonical decisions" section)

- [ ] **Step 1: Add resolutions at the top of inventory**

Append this block to `CONTENT_INVENTORY.md` under heading `## Canonical decisions (resolves proposal-internal conflicts)`:

```markdown
| # | Conflict | Proposal evidence | Canonical decision | Reason |
|---|---|---|---|---|
| C1 | Domain name | line 463 `neural-interfaces26.github.io` vs line 535 `neuralinterface26.github.io` | **`neuralinterface26.github.io`** (no `s`) | matches deployed site, matches canonical meta tag in index.html |
| C2 | GitHub org | line 463 `github.com/neural-interfaces26` | **`github.com/neural-interfaces26`** (with `s`) | GitHub org exists under this name; do not rename mid-launch |
| C3 | Track 5 scope | abstract + §1.3 "all four tasks" vs current site "three EEG tracks" | **All four tasks (IMG, BCI, Sleep, EMG)** | abstract is the authoritative scope statement |
| C4 | Submission model | line 235 "code-submission competition" + line 504 "Codabench workers H100/H200" vs site parquet upload | **Code submission** for top-N audit, **prediction parquet** for fast public iteration | hybrid model; site copy must explain both phases |
| C5 | Daily caps | proposal commented out 5/day warm-up + 2/day final | **5/day warm-up, 2/day sealed final** | conservative; revert if Codabench load disagrees |
| C6 | Prize amount | line 555 "$2,500 cash" | **$2,500 per top-3 team + travel** | as stated; sponsors may add internships separately |
| C7 | GPU class | proposal H100/H200 vs site A100 | **H100/H200 scoring workers**, A100 still acceptable as a fallback in the inference-budget statement | Yneuro/AWS quote |
```

- [ ] **Step 2: Commit**

```bash
git add docs/CONTENT_INVENTORY.md
git commit -m "site: resolve 7 proposal-internal conflicts in inventory"
```

---

## 4. Phase B — P0 Critical Fixes (parallel, file-partitioned)

Three agents run in **parallel** (single message, three `Agent` tool calls). Each owns one file or one cross-file invariant. After they all finish, a single review pass verifies cross-file consistency.

### Task B.1: Fix Track 5 scope across 3 files

**Files:**
- Modify: `/Users/bruaristimunha/Projects/neuralinterface26.github.io/index.html` (track-5 card + footer reference)
- Modify: `/Users/bruaristimunha/Projects/neuralinterface26.github.io/leaderboard.html` (track-5 section + formal-definition block)
- Modify: `/Users/bruaristimunha/Projects/neuralinterface26.github.io/awards.html` (foundation-transfer prize card)

- [ ] **Step 1: Dispatch `frontend-dev` agent — single tool call, run in background**

Prompt (verbatim):
```
You are fixing a critical scope contradiction across three HTML files. The proposal says Track 5 (Foundation Transfer) evaluates a single encoder across ALL FOUR tasks (EEG-to-IMG, BCI, Sleep, AND EMG). The website currently says only three EEG tracks. Fix this everywhere the site mentions Track 5.

Canonical text to use for Track 5 (paraphrase only where the existing surrounding sentence structure demands it):

> "Use a single shared biosignal encoder across all four tracks — EEG-to-IMG, BCI, Sleep, and EMG. Heads can be track-specific; the encoder must be one set of weights, applied to both EEG and surface EMG."

Files to update:
1. /Users/bruaristimunha/Projects/neuralinterface26.github.io/index.html
   - Find the article with class "vb-track featured full-width" containing Track 05 heading
   - Update the <p> after <h3>Foundation transfer</h3> to use the canonical text above
   - In the .track-stats inside that card, change <strong>X</strong> for Tasks to <strong>4</strong>
   - Replace the placeholder "Cross-task" pill with "EEG + EMG"

2. /Users/bruaristimunha/Projects/neuralinterface26.github.io/leaderboard.html
   - Find <section ... id="track-5"> and update its <h2> + <p> to reference all four tracks
   - In the "Formal definitions" section, find the Foundation Transfer block (~ line 743) and change the mean-rank formula from `1/3 sum over {IMG, BCI, Sleep}` to `1/4 sum over {IMG, BCI, Sleep, EMG}`
   - Update the Python snippet `tracks=("img", "bci", "sleep")` to `tracks=("img", "bci", "sleep", "emg")`
   - Update the surrounding prose ("three EEG tracks" → "all four tracks (three EEG and one EMG)")

3. /Users/bruaristimunha/Projects/neuralinterface26.github.io/awards.html
   - In the article for Track 05 (Foundation), update the <p> describing it to reference all four tracks
   - Replace "Single encoder" pill semantics to match: still says single encoder, but adds "across EEG + EMG"

Preserve all CSS classes, ARIA labels, and surrounding markup. Use the `Edit` tool with surgical replacements. After all three files are updated, run:

  grep -nE "(three EEG|Image, BCI, and Sleep|IMG.*BCI.*Sleep)" index.html leaderboard.html awards.html

…to verify no stale references remain. If grep finds anything, fix it.

Report: list every file:line that was changed.
```

- [ ] **Step 2: Wait for B.1 to complete**

You will be notified when the background agent finishes.

- [ ] **Step 3: Verify no stale "three EEG tracks" copy remains**

```bash
cd /Users/bruaristimunha/Projects/neuralinterface26.github.io
grep -nE "three EEG|Image, BCI, and Sleep at once|across the EEG-to-IMG, BCI, and Sleep" index.html leaderboard.html awards.html
```

Expected: no matches.

- [ ] **Step 4: Commit**

```bash
git add index.html leaderboard.html awards.html
git commit -m "fix: include EMG in Track 5 (Foundation Transfer) scope across 3 pages"
```

### Task B.2: Reconcile submission model in startkit.html

**Files:**
- Modify: `/Users/bruaristimunha/Projects/neuralinterface26.github.io/startkit.html` (Submission section + Compute card)

- [ ] **Step 1: Dispatch `frontend-dev` agent — runs in parallel with B.1 and B.3**

Prompt (verbatim):
```
You are fixing a contradiction between the proposal and the start-kit page about how submissions work.

Proposal says (line 235, line 504-507): code-submission competition; submissions run on Codabench workers with H100/H200 NVIDIA instances; "all submissions use a fixed container image and a bounded GPU class, with efficiency-oriented per-track wall-clock and memory budgets."

Site currently says (startkit.html, around line 437): "A single Parquet file. No Docker. No build step. You don't upload code during the public phase — you upload predictions. Top entries are pulled for a reproducibility audit at test-freeze."

Resolution: hybrid model. The PUBLIC iteration phase accepts predictions for speed. The TOP-N reproducibility audit re-runs code in a Codabench container. Both must be described.

Update /Users/bruaristimunha/Projects/neuralinterface26.github.io/startkit.html as follows:

1. Section #submit, the h2 "A single Parquet file. No Docker. No build step."
   Replace with: "Predictions during iteration. Code at the audit gate."
   Replace the following paragraph with:

   "Two-stage submission. During the public phase you upload a predictions Parquet file — fast, no container build, validate locally. Top-ranked teams are then pulled for a reproducibility audit: organizers re-run your training script inside a fixed Codabench container on the sealed split. Both phases are mandatory for prize eligibility."

2. Section #policy, the article with kicker "Compute" and h3 "Train on whatever you have."
   Change the inference-budget stat block. New numbers:
   - <span class="bs-kicker">Inference workers</span><strong>H100 / H200 (Codabench)</strong>
   - <span class="bs-kicker">Inference budget</span><strong>60 min · single H100/H200</strong>
   - <span class="bs-kicker">No cap</span><strong>on training</strong>

   And in the <p>: replace "must finish a full test pass in under 60 minutes on a single A100" with "must finish a full test pass in under 60 minutes on a single H100 or H200 instance".

3. Add a new <p> at the end of the existing submission section explaining the audit container: "The audit container is the public Codabench image — see configs/audit/Dockerfile in the start-kit repo. AWS and Deloitte fund the scaled Codabench deployment; the container image and AWS integration are contributed back upstream after the challenge."

Use the `Edit` tool. Preserve markup. Report which lines were edited.
```

- [ ] **Step 2: Wait for completion, then verify**

```bash
grep -n "A100\|Parquet file\. No Docker" /Users/bruaristimunha/Projects/neuralinterface26.github.io/startkit.html
```

Expected: no A100 references; no "No Docker" line in the submission heading.

- [ ] **Step 3: Commit**

```bash
git add startkit.html
git commit -m "fix: clarify hybrid submission model (parquet public, code at audit); H100/H200 scoring"
```

### Task B.3: Fix domain-name consistency in proposal and site

**Files:**
- Modify: `/Users/bruaristimunha/Projects/NeurIPS-2026---EEG-EMG-competition/competitions_neurips_2026.tex` (line 463 or 535 — keep one spelling)
- Modify: any HTML that uses the wrong spelling

- [ ] **Step 1: Audit current spellings**

```bash
cd /Users/bruaristimunha/Projects/NeurIPS-2026---EEG-EMG-competition
grep -nE "neural[-]?interfaces?26\.github\.io" competitions_neurips_2026.tex
cd /Users/bruaristimunha/Projects/neuralinterface26.github.io
grep -nE "neural[-]?interfaces?26\.github\.io" *.html
```

Expected: proposal shows ≥ 2 different spellings; HTML shows the deployed spelling consistently.

- [ ] **Step 2: Update proposal line 463 to use no-`s` spelling**

In `competitions_neurips_2026.tex` line 463, change:
```
The starter kit and baseline code will be released through the \href{https://github.com/neural-interfaces26}{neural-interfaces26} website.
```
To:
```
The starter kit and baseline code will be released through the \href{https://github.com/neural-interfaces26}{\texttt{neural-interfaces26}} GitHub organization, mirrored on the \href{https://neuralinterface26.github.io}{competition website}.
```

This keeps the GitHub-org name (with `-` and `s`) but disambiguates from the website URL (no `s`).

- [ ] **Step 3: Audit HTML for any remaining inconsistencies**

```bash
cd /Users/bruaristimunha/Projects/neuralinterface26.github.io
grep -n "neural-interfaces26\.github\.io" *.html
```

Expected: no matches (since the deployed site is the no-`s` form). If any are found, fix them.

- [ ] **Step 4: Commit (proposal side commits separately)**

```bash
cd /Users/bruaristimunha/Projects/neuralinterface26.github.io
git add -A
git diff --cached --stat
# if anything is staged, commit:
git commit -m "fix: harmonise domain name (website neuralinterface26 vs org neural-interfaces26)" || echo "no website changes"

cd /Users/bruaristimunha/Projects/NeurIPS-2026---EEG-EMG-competition
git add competitions_neurips_2026.tex
git commit -m "Disambiguate GitHub org from website domain in §1.5"
```

### Task B.4: Phase-B cross-file consistency check

**Files:**
- None (read-only verification)

- [ ] **Step 1: Run consistency checks**

```bash
cd /Users/bruaristimunha/Projects/neuralinterface26.github.io
# 1. Track 5 should mention EMG everywhere
grep -c "EMG" index.html leaderboard.html awards.html
# 2. No A100 references on the site
grep -rn "A100" *.html || echo "OK: no A100"
# 3. Submission model: every page mentioning submissions references both stages
grep -nE "(parquet.*audit|audit.*parquet|code.*submission)" startkit.html
```

Expected: each grep shows ≥ 1; A100 absent; startkit mentions both submission stages.

- [ ] **Step 2: Phase-close commit**

```bash
git commit --allow-empty -m "site: Phase B (P0 fixes) complete"
```

---

## 5. Phase C — P1 Content Population (parallel, file-partitioned)

Four agents run in parallel. Each populates one section of one file using `CONTENT_INVENTORY.md` as the source.

### Task C.1: Populate organizers.html (add 3 missing organizers)

**Files:**
- Modify: `/Users/bruaristimunha/Projects/neuralinterface26.github.io/organizers.html`

- [ ] **Step 1: Identify avatar files**

```bash
ls /Users/bruaristimunha/Projects/neuralinterface26.github.io/assets/img/people/ | grep -iE "aimone|moreau|raugel" || echo "missing avatars"
```

If any avatars are missing, use a generic SVG placeholder (`assets/img/people/_placeholder.svg`) and flag for a follow-up in the human-handoff doc.

- [ ] **Step 2: Dispatch `frontend-dev` agent — runs in parallel with C.2, C.3, C.4**

Prompt (verbatim):
```
You are inserting 3 missing organizer cards into organizers.html. Read /Users/bruaristimunha/Projects/neuralinterface26.github.io/docs/CONTENT_INVENTORY.md (the Organizers table) for canonical bio text.

Cards to add (preserve author order from the proposal — i.e., insert in the right slot, not at the end):

1. Christopher Aimone (after Maurice Abou Jaoude, before Pranav Mamidanna). InteraXon, Chief Innovation Officer & co-founder. Track Team Sleep. Bio: "Chief Innovation Officer and co-founder of Muse by InteraXon. Leads R&D at Muse, advancing wearable EEG that integrates sleep science and AI. Background spans VR/AR, humanistic intelligence, computer vision, and robotics."

2. Thomas Moreau (after Marie-Constance Corsi, before Joséphine Raugel). Inria MIND. Evaluator. Bio: "Research scientist at Inria, MIND Team. Statistical machine learning, optimization, signal processing for M/EEG decoding. Maintainer of benchopt; contributor to braindecode, MNE-Python, and MOABB."

3. Joséphine Raugel (after Thomas Moreau, before Lionel Kusch). Meta FAIR + ENS. Track Team EEG-Img, Baseline Provider. Bio: "PhD candidate at École Normale Supérieure and Meta FAIR. Aligns deep-network and neural-data representations; builds models that decode neural activity. Co-author of NeuralSet and TRIBEv2."

Each card uses the existing `.org-card` HTML template. For each card include the appropriate avatar in `assets/img/people/`. If the avatar file does not exist, reference `assets/img/people/_placeholder.svg`. Use the existing affiliation logos already in `assets/img/logos/` (interaxon.jpg, inria.png, meta_brainai.png, cnrs.png).

Also update the org-hero-stats block: change `<strong>24</strong>` to `<strong>27</strong>` and update the hero paragraph "Twenty-four organizers across 14 institutions in 5 countries!" to "Twenty-seven organizers across 14 institutions in 5 countries!".

Report: list every insertion point (line numbers before edit).
```

- [ ] **Step 3: Verify count**

```bash
grep -c "class=\"org-card" /Users/bruaristimunha/Projects/neuralinterface26.github.io/organizers.html
```

Expected: 27 (one for each organizer; the `lead` card also has `org-card` class).

- [ ] **Step 4: Commit**

```bash
git add organizers.html assets/img/people/ 2>/dev/null
git commit -m "feat: add 3 missing organizers (Aimone, Moreau, Raugel); update count 24→27"
```

### Task C.2: Populate datasets table on index.html

**Files:**
- Modify: `/Users/bruaristimunha/Projects/neuralinterface26.github.io/index.html` (the `.ds-table` block under `#datasets`)

- [ ] **Step 1: Dispatch `frontend-dev` agent — parallel with C.1, C.3, C.4**

Prompt (verbatim):
```
You are filling the datasets table on index.html with the real per-dataset entries from the proposal. Read /Users/bruaristimunha/Projects/neuralinterface26.github.io/docs/CONTENT_INVENTORY.md (Datasets section).

Replace the existing 5 placeholder `.ds-row` entries inside `<div class="ds-table" role="table">` (inside `<section ... id="datasets">`) with the following 12 rows. Preserve all CSS classes, role attributes, and the column structure exactly. Use "—" for unknowns rather than "XX".

Track 1 (EEG-to-IMG):
| things-eeg1     | THINGS-EEG1 · Object viewing       | EEG  | 50  | 60h+   | 64  | 1000 Hz | 80%
| things-eeg2     | THINGS-EEG2 · Object viewing       | EEG  | 10  | 30h    | 63  | 1000 Hz | 80%
| alljoined-1     | Alljoined-1 · Natural images       | EEG  | 8   | 12h    | 64  | 512 Hz  | 70%
| alljoined-1.6   | Alljoined-1.6M · Natural images    | EEG  | 20  | 100h   | 16  | 256 Hz  | 70%

Track 2 (BCI):
| stieger2021     | Stieger 2021 · MI continuous       | EEG  | 62  | 36h    | 64  | 500 Hz  | 60%
| dreyer2023      | Dreyer 2023 · MI large cohort      | EEG  | 87  | 26h    | 32  | 512 Hz  | 60%
| zyma2019        | Zyma 2019 · Mental tasks           | EEG  | 36  | 6h     | 19  | 500 Hz  | 50%
| scherer2015     | Scherer 2015 · Individually tuned  | EEG  | 8   | 4h     | 64  | 250 Hz  | 50%
| bci-graz        | Graz/BrainHero · BCI command (new) | EEG  | 20  | 80h    | 64  | 500 Hz  | 50%

Track 3 (Sleep):
| sleepedf-ext    | Sleep-EDF Extended                 | Sleep| 78  | 200h+  | 2   | 100 Hz  | 80%
| physionet2018   | PhysioNet Challenge 2018           | Sleep|994  | 8500h  | 6   | 200 Hz  | 70%
| hmc-sleep       | HMC Sleep Staging                  | Sleep|151  | 1200h  | 6   | 256 Hz  | 70%
| muse-sleep      | Muse Sleep-Onset · Wearable (new)  | Sleep|1000+| 1000h+ | 4   | 256 Hz  | 60%

Track 4 (EMG):
| emg2qwerty      | emg2qwerty · EMG typing            | EMG  | 108 | 346h   | 32  | 2000 Hz | 80%

(15 rows total — keep the table sortable order by track.)

Update the .ds-foot kicker text from "Showing X of XX · NeuralBench-EEG-Core v1.0" to "Showing 15 of 15 · NeuralBench-EEG-Core v1.0".

Update the H2 from "XXX+ public datasets, one unified interface." to "15 public datasets, one unified interface."

Update the "At a glance" stats:
- datasets → strong 15
- EEG tasks → strong 4
- architectures → strong 75+
- hours → strong "11k+"
- subjects → strong "3,700+"
- teams → strong "1,500" (with bs-kicker "expected" appended)

Numeric details that you don't see in the inventory should be left as their best-guess from the cited papers in the proposal. Where uncertain, prefer the conservative number with a "+" suffix (e.g., "60h+").

Report: list edit points.
```

- [ ] **Step 2: Verify the row count and the "At a glance" stats**

```bash
grep -c "<div class=\"ds-row\" role=\"row\">" /Users/bruaristimunha/Projects/neuralinterface26.github.io/index.html
grep -nE "data-count-to=\"15\"|data-count-to=\"4\"|data-count-to=\"3,7" /Users/bruaristimunha/Projects/neuralinterface26.github.io/index.html
```

Expected: 15 data rows (+1 header row not counted); count-to values present.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: populate 15-dataset table and at-a-glance counters from proposal"
```

### Task C.3: Populate baseline numbers in startkit.html

**Files:**
- Modify: `/Users/bruaristimunha/Projects/neuralinterface26.github.io/startkit.html` (`.ds-table` under `#baselines`)

- [ ] **Step 1: Dispatch `frontend-dev` agent — parallel with C.1, C.2, C.4**

Prompt (verbatim):
```
Replace the placeholder baseline scores in startkit.html with the real numbers from the proposal's Table tab:neuralbench-four-tasks. Read /Users/bruaristimunha/Projects/neuralinterface26.github.io/docs/CONTENT_INVENTORY.md (Baselines section).

In /Users/bruaristimunha/Projects/neuralinterface26.github.io/startkit.html, inside the `.ds-table` of section #baselines, replace the 8 placeholder rows with the following. Keep the same column structure (Track, Model, Family, Params, Train (GPU-h), Warm-up score, Code, Headroom). Use the headroom bar with the percentage filled.

Row 1 — T1 · EEG-to-IMG | EEGNet (Gifford 2022) | CNN | 0.04 M | 2 | Top-5 28.13 ± 0.14 | configs/img/eegnet.yaml | 33% bar
Row 2 — T1 · EEG-to-IMG | REVE (frozen) | Foundation | 14 M | 0.5 (probe only) | Top-5 84.75 ± 0.38 | configs/img/reve_frozen.yaml | 95% bar
Row 3 — T2 · BCI | EEGNet (Stieger 2021) | CNN | 0.04 M | 4 | Bal. Acc 58.58 ± 0.34 | configs/bci/eegnet.yaml | 65% bar
Row 4 — T2 · BCI | REVE | Foundation | 14 M | 1 (probe) | Bal. Acc 68.04 ± 0.73 | configs/bci/reve.yaml | 75% bar
Row 5 — T3 · Sleep | EEGNet-sleep (Kemp 2000) | Sleep | 0.04 M | 4 | W-bMAE 143.30 ± 0.40 s | configs/sleep/eegnet.yaml | 50% bar
Row 6 — T3 · Sleep | REVE-sleep | Foundation | 14 M | 1 (probe) | W-bMAE 134.89 ± 2.02 s | configs/sleep/reve.yaml | 55% bar
Row 7 — T4 · EMG | EMG2QwertyNet (Sivakumar 2024) | EMG | 5.3 M | 8 | CER 25.14 ± 2.30 % | configs/emg/qwerty.yaml | 70% bar
Row 8 — T5 · Foundation | REVE (shared, organizer-fitted heads) | Foundation | 14 M | 4 (heads) | Mean rank — | configs/foundation/reve.yaml | placeholder bar 0%

Also: include a chance/dummy row pair if the existing template has them. If not, add two header subrows:
Chance row — Top-5 2.22 ± 0.31 | Bal. Acc 24.81 ± 1.03 | W-bMAE 205.42 s | CER 96.71 %
Dummy row — Top-5 2.50 | Bal. Acc 25.00 | W-bMAE 299.90 s | CER 100 %

Update the H2 from "Each track ships at least one trained baseline." to "Pre-computed baselines on representative public datasets — these are the warm-up targets to beat."

Also update the "Warm-up score" headline kicker from `<span class="bs-kicker">Warm-up score</span>` to `<span class="bs-kicker">Pre-warmup baseline</span>` so the numbers are interpreted correctly (these are pre-released proposal numbers, not warm-up split scores yet).

Update the bs-kicker for Sleep metric: change "MAE on onset (s)" to "W-bMAE on onset (s)" — both in the bullet list in Step 04 and the leaderboard pill. The proposal uses W-bMAE (weighted-binned MAE).

Report: list every line changed.
```

- [ ] **Step 2: Verify the proposal numbers are present**

```bash
grep -E "84.75|68.04|143.30|25.14|W-bMAE" /Users/bruaristimunha/Projects/neuralinterface26.github.io/startkit.html | wc -l
```

Expected: ≥ 5 matches.

- [ ] **Step 3: Commit**

```bash
git add startkit.html
git commit -m "feat: populate baseline table with proposal NeuralBench numbers; rename Sleep metric to W-bMAE"
```

### Task C.4: Populate timeline on index.html (add June milestones)

**Files:**
- Modify: `/Users/bruaristimunha/Projects/neuralinterface26.github.io/index.html` (`<ol class="vb-timeline">` under `#timeline`)

- [ ] **Step 1: Dispatch `frontend-dev` agent — parallel with C.1, C.2, C.3**

Prompt (verbatim):
```
Add two pre-launch milestones to the timeline on index.html. The proposal (lines 542-550) lists:
- 1 June 2026: Public starter kit and training data available; participant preparation starts
- 15 June 2026: Final dataset/DUA/container/scoring/baseline freeze; beta dry run complete

Both are currently missing from the site's <ol class="vb-timeline"> under <section ... id="timeline">.

Insert two new <li class="phase-card upcoming"> blocks AT THE START of the <ol>, ahead of the current "Warm-up" Phase 01 card. Re-number the existing phases (01→03, 02→04, 03→05, 04→06).

New cards:

Phase 01 — Prep release (preparation):
  <span class="phase-tag">Phase 01 <span class="badge">PREP</span></span>
  <h3>Public starter kit</h3>
  <span class="phase-date">Jun 1, 2026</span>
  <p class="phase-desc">Starter kit, baseline code, training data references, and the EEGDash + neuralbench installation path go public. Participants begin local iteration on the warm-up structure.</p>
  <div class="phase-meta">
    <div class="row"><span>Release</span><span>Jun 1, 2026</span></div>
    <div class="row"><span>What ships</span><span>Start-kit, train data refs, install path</span></div>
  </div>

Phase 02 — Freeze:
  <span class="phase-tag">Phase 02 <span class="badge">FREEZE</span></span>
  <h3>Datasets, container, baselines frozen</h3>
  <span class="phase-date">Jun 15, 2026</span>
  <p class="phase-desc">Final dataset splits, data-use agreements, scoring container, and baseline weights are frozen. Beta dry-run of baseline submission, scoring, and top-submission reproduction completes.</p>
  <div class="phase-meta">
    <div class="row"><span>Freeze</span><span>Jun 15, 2026</span></div>
    <div class="row"><span>What's locked</span><span>Splits, DUAs, container, baselines</span></div>
  </div>

Also: update the Warm-up card to "Phase 03"; final submissions to "Phase 04"; audit to "Phase 05"; NeurIPS finals to "Phase 06".

Also: update the sidebar countdown's data-countdown-to to point to the FIRST relevant milestone — Jun 1, 2026 (the starter-kit release). Change `data-countdown-to="2026-07-01T00:00:00Z"` to `data-countdown-to="2026-06-01T00:00:00Z"` in vb-foot blocks of ALL FIVE HTML pages (index, awards, leaderboard, organizers, startkit). Update the kicker text from "Warm-up opens" to "Start-kit drops".

Report changes.
```

- [ ] **Step 2: Verify all five pages updated the countdown**

```bash
grep -nE 'data-countdown-to="2026-0[67]' /Users/bruaristimunha/Projects/neuralinterface26.github.io/*.html
```

Expected: only `2026-06-01T00:00:00Z` matches (5 pages).

- [ ] **Step 3: Commit**

```bash
git add index.html organizers.html leaderboard.html awards.html startkit.html
git commit -m "feat: add Jun 1 starter-kit and Jun 15 freeze milestones; shift countdown target"
```

### Task C.5: Phase-C consistency check

- [ ] **Step 1: Run integrity grep**

```bash
cd /Users/bruaristimunha/Projects/neuralinterface26.github.io
# Stat counters non-zero on index
grep -nE 'data-count-to="[1-9]' index.html | head
# 27 organizer cards
grep -c "class=\"org-card" organizers.html
# Phase-01 references the Prep milestone everywhere
grep -nE "Phase 0[123456]" index.html
```

- [ ] **Step 2: Phase-close commit**

```bash
git commit --allow-empty -m "site: Phase C (P1 population) complete"
```

---

## 6. Phase D — New Sections & Pages (parallel)

Three agents in parallel: each creates one new page, plus one updates `awards.html` to reinstate the internship prize and add ethics + diversity references.

### Task D.1: Create ethics.html

**Files:**
- Create: `/Users/bruaristimunha/Projects/neuralinterface26.github.io/ethics.html`
- Modify: nav in every existing HTML file (add ethics link)

- [ ] **Step 1: Dispatch `copywriter` agent (parallel with D.2, D.3, D.4)**

Prompt (verbatim):
```
Create a new public page /Users/bruaristimunha/Projects/neuralinterface26.github.io/ethics.html that documents the competition's adherence to the NeurIPS Code of Ethics.

Use the existing site CSS exactly: link tokens.css, base.css, landing.css. Mirror the sidebar/topbar/footer structure from organizers.html (NOT index.html — organizers.html is the simpler doc-page template).

Page structure:

1. Hero — h1 "Ethics & consent." Lead paragraph summarising the proposal's Code-of-Ethics commitment and the limits of non-invasive decoding.

2. Section "Code of Ethics adherence" — restates the proposal sentence "The task design follows the NeurIPS Code of Ethics." Adds 3-4 short bullets on (a) consented stimuli only, (b) cued-task BCI only, (c) consensual typing for EMG, (d) home wearable sleep with subject-initiated recording.

3. Section "Mental privacy" — paraphrases proposal §1.2 lines 343-346: low decoding accuracy outside perceptual tasks, sharp falloff on imagined content, decoding fails on disengagement. Two-paragraph plain-English explainer.

4. Section "Dataset consent & licensing" — bullets per track listing the original data controllers (THINGS, Alljoined, Inria, InteraXon, Meta Reality Labs) and the standard data-use chain.

5. Section "Hidden data" — single paragraph: "For unreleased hidden data, the corresponding track does not launch until data-use permission, anonymization, and approval for competition use are finalized."

6. Section "What we will not do" — three bullets: no closed-loop actuation; no decoding from non-consenting subjects; no resale of any released dataset.

Then update the navigation in every existing HTML file (index, organizers, leaderboard, awards, startkit). In the sidebar block `<div class="vb-nav-section">` with kicker "About", add a new <a href="ethics.html">Ethics</a> link before the Sponsors link.

Use crisp short sentences. No marketing voice. Do not invent new commitments — only restate what the proposal asserts.

Report: file created (line count) + nav updates per file.
```

- [ ] **Step 2: Verify**

```bash
test -f /Users/bruaristimunha/Projects/neuralinterface26.github.io/ethics.html && wc -l /Users/bruaristimunha/Projects/neuralinterface26.github.io/ethics.html
grep -c 'href="ethics.html"' /Users/bruaristimunha/Projects/neuralinterface26.github.io/*.html
```

Expected: file exists; ≥ 5 nav-link insertions.

- [ ] **Step 3: Commit**

```bash
git add ethics.html *.html
git commit -m "feat: add ethics page restating NeurIPS Code of Ethics adherence"
```

### Task D.2: Create track-record.html

**Files:**
- Create: `/Users/bruaristimunha/Projects/neuralinterface26.github.io/track-record.html`

- [ ] **Step 1: Dispatch `copywriter` agent (parallel)**

Prompt (verbatim):
```
Create /Users/bruaristimunha/Projects/neuralinterface26.github.io/track-record.html documenting the organizing team's five-year competition track record.

Use the organizers.html template (same head, sidebar, footer). Add a nav link to it in every page (under "About" section in the sidebar, between Organizers and Sponsors).

Content (numbers from proposal §3, lines 568-569 and §1.1 line 251):

Hero: h1 "Track record." Lead: "Five years, four NeurIPS-track competitions, one operational continuation. Below: what each prior round did and how the 2026 challenge builds on it."

Section — "BEETL Motor Imagery 2021 (NeurIPS):" 130+ contestants, 40 research groups, 1,382 submissions. Cite \citep{beetl2022}. One short paragraph on the BCI focus and what carried forward.

Section — "Brain Age Prediction 2022:" 200+ participants, 40 countries. One short paragraph on the EEG-age benchmark.

Section — "Sleep States 2023:" 80 teams, 20 countries. One short paragraph on sleep-staging baselines.

Section — "2025 EEG Foundation Challenge (NeurIPS 2025):" 1,197 teams, 247 institutions, 50+ countries, 8,622 submissions. Detail: this is the immediate predecessor; the 2026 edition is its "operational continuation". Link to https://eeg2025.github.io/.

Section — "What 2026 changes:" three bullets — adds EMG, splits single-task vs foundation transfer, adds controlled generalization evaluation (see §1.2 of proposal).

Section — "What stays:" three bullets — same lead, same Codabench infrastructure, same open-source stack.

Closing CTA: "Continue the lineage — register your team" linking to #cta on index.html.

No invented numbers. If a value isn't in the inventory, omit it.
```

- [ ] **Step 2: Verify and commit**

```bash
test -f /Users/bruaristimunha/Projects/neuralinterface26.github.io/track-record.html && grep -c "1,197\|8,622\|1,382\|BEETL" /Users/bruaristimunha/Projects/neuralinterface26.github.io/track-record.html
git add track-record.html *.html
git commit -m "feat: add track-record page (BEETL, BAP, Sleep, 2025 EEG Challenge)"
```

### Task D.3: Create faq.html

**Files:**
- Create: `/Users/bruaristimunha/Projects/neuralinterface26.github.io/faq.html`

- [ ] **Step 1: Dispatch `copywriter` agent (parallel)**

Prompt (verbatim):
```
Create /Users/bruaristimunha/Projects/neuralinterface26.github.io/faq.html using the organizers.html template. Add a nav entry under "Get started" (after "Start-kit & baselines"): <a href="faq.html">FAQ</a>.

Content — Q&A format, short and concrete:

Q1. Can I submit to more than one track?
A1. Yes. Tracks 1–4 accept independent submissions. Track 5 requires a single shared encoder; that encoder is automatically scored on Tracks 1–4 by organizer-fitted linear heads under the foundation-model label.

Q2. What's the daily submission cap?
A2. Warm-up phase: 5 / team / day. Final sealed phase: 2 / team / day. Final ranking is the best of your last five sealed-phase submissions.

Q3. What if a track has too few participants?
A3. Low-participation tracks fold into the closest active analysis group for the post-competition report, but prizes are still awarded.

Q4. What if there's a delay?
A4. Technical, data, or infrastructure delays shift all downstream deadlines by the same amount. Updates land on this site and the Discord.

Q5. Can I stay anonymous?
A5. Yes during the public phase. Submit under an anonymized handle; reveal your affiliation by Oct 25, 2026 to be eligible for the workshop and prizes. Useful for double-blind paper submissions.

Q6. Who can win?
A6. Anyone — industry, academia, students, independents. Cross-institution teams encouraged. Organizers and direct lab members may submit as "Organizers · reference" but are ineligible for cash prizes.

Q7. What about authorship on the competition report?
A7. Top-ranked teams that pass the reproducibility audit and submit method description, training/inference code, and pre-training disclosures are invited as named authors on the PMLR competition report. Consortium authorship is offered to teams with complete, reproducible artifacts.

Q8. What pre-training datasets are allowed?
A8. Any publicly available, redistributable dataset. The sealed test split is not allowed. Closed clinical datasets are not allowed. Declare every external corpus in your 2-page methods note.

Q9. Why does Track 5 cover EMG too?
A9. Foundation Transfer tests whether a single encoder reuses across modalities, not just across EEG tasks. EMG is the cross-modality stress test — without it, Track 5 is just multi-task EEG.

Q10. Will the data be released?
A10. After the challenge, new data will be made publicly available in full or in part where consent, licensing, and provider policy allow.

Use plain language. Two-three sentences max per answer.
```

- [ ] **Step 2: Verify, commit**

```bash
test -f /Users/bruaristimunha/Projects/neuralinterface26.github.io/faq.html
git add faq.html *.html
git commit -m "feat: add FAQ page covering caps, anonymity, authorship, contingency, T5 scope"
```

### Task D.4: Update awards.html (internship + ethics + affinity groups)

**Files:**
- Modify: `/Users/bruaristimunha/Projects/neuralinterface26.github.io/awards.html`

- [ ] **Step 1: Dispatch `frontend-dev` agent (parallel)**

Prompt (verbatim):
```
Three edits to /Users/bruaristimunha/Projects/neuralinterface26.github.io/awards.html.

Edit 1 — Reinstate the internship prize. The proposal says "Some tracks offer a 6-month internship position at the sponsor track company, TBC, upon acceptance of the proposal." Inside the per-track prizes section #track-prizes, add a new <article class="vb-track"> after the Track 04 card with kicker "Sponsor offer · variable" and h3 "6-month internship.", a one-paragraph description: "Selected track sponsors offer a 6-month research internship to the first-place team's chosen representative, subject to the sponsor's hiring process. Currently confirmed: Alljoined (Track 1), Meta Reality Labs (Track 4). Others to be confirmed."

Edit 2 — Replace the numeric prize placeholders. From the proposal: USD $2,500 cash per top-3 team per track + travel for one representative. Update all four per-track prize stat blocks:
- 1st: $2,500
- 2nd: $2,500
- 3rd: $2,500
(yes, equal per top-3; that is what the proposal says. The differentiation is the rank/visibility, not the cash.)

Track 5 grand prize: keep as TBD until sponsors finalize — show "$X,XXX" with explanatory caption "Foundation prize finalised at NeurIPS opening; baseline track prize structure (top-3 × $2,500) applies if no additional sponsor is named."

Edit 3 — In the diversity travel-grant row, expand the eligibility column. Change "Underrepresented regions · top-10" to "Affinity-network members (Women in AI, Black in AI, Queer in AI, LatinX in AI, NeurIPS Next-Generation) · top-10 placement"

Edit 4 — Add a small new section before #sponsors-strip:
<section class="vb-section" id="ethics-stub">
  <div class="vb-section-head">
    <div>
      <span class="bs-eyebrow"><span class="dot"></span> Ethics</span>
      <h2>This competition follows the NeurIPS Code of Ethics.</h2>
      <p>Consent, privacy, and representativeness are baseline. See the <a href="ethics.html">ethics page</a> for the full statement and dataset-controller chain.</p>
    </div>
  </div>
</section>

Report.
```

- [ ] **Step 2: Verify and commit**

```bash
grep -c "internship\|Affinity\|Code of Ethics" /Users/bruaristimunha/Projects/neuralinterface26.github.io/awards.html
git add awards.html
git commit -m "feat: reinstate internship prize, $2,500 cash, name affinity groups, add ethics stub"
```

### Task D.5: Phase-D close

- [ ] **Step 1: Cross-page nav consistency**

```bash
cd /Users/bruaristimunha/Projects/neuralinterface26.github.io
for href in "ethics.html" "track-record.html" "faq.html"; do
  count=$(grep -c "href=\"$href\"" *.html)
  echo "$href: $count nav references"
done
```

Expected: each new page is referenced by ≥ 5 other pages (one per existing page).

- [ ] **Step 2: Phase-close commit**

```bash
git commit --allow-empty -m "site: Phase D (new pages + awards reconciliation) complete"
```

---

## 7. Phase E — Review Loop (avoid-ai-writing + tom-neurips-review)

Now the content is in place. Run the two-loop review. Up to **3 iterations per loop**.

### Task E.1: avoid-ai-writing pass 1

**Files:**
- Read-write on every HTML file

- [ ] **Step 1: Invoke `avoid-ai-writing` skill on the entire site**

Run the skill via the Skill tool with this argument:
```
Audit every prose block (not code, not tables, not nav) across:
- /Users/bruaristimunha/Projects/neuralinterface26.github.io/index.html
- /Users/bruaristimunha/Projects/neuralinterface26.github.io/organizers.html
- /Users/bruaristimunha/Projects/neuralinterface26.github.io/leaderboard.html
- /Users/bruaristimunha/Projects/neuralinterface26.github.io/awards.html
- /Users/bruaristimunha/Projects/neuralinterface26.github.io/startkit.html
- /Users/bruaristimunha/Projects/neuralinterface26.github.io/ethics.html
- /Users/bruaristimunha/Projects/neuralinterface26.github.io/track-record.html
- /Users/bruaristimunha/Projects/neuralinterface26.github.io/faq.html

Apply detection mode first; report all AI-isms found. Then apply rewrite mode where required, preserving meaning.
```

- [ ] **Step 2: Review the diff and accept**

```bash
cd /Users/bruaristimunha/Projects/neuralinterface26.github.io
git diff --stat
```

If any individual change inverts meaning or drops a fact, hand-edit and re-stage.

- [ ] **Step 3: Commit**

```bash
git add *.html
git commit -m "style: avoid-ai-writing pass 1 (remove AI-isms across all pages)"
```

### Task E.2: tom-neurips-review pass 1

**Files:**
- Read-write on prose-heavy blocks

- [ ] **Step 1: Identify candidate prose blocks**

```bash
cd /Users/bruaristimunha/Projects/neuralinterface26.github.io
# Find each section with > 80 chars of prose inside <p> or <li>
# (informational — agent will scope itself)
grep -nE "<p>[^<]{120,}" index.html leaderboard.html ethics.html track-record.html
```

- [ ] **Step 2: Invoke `tom-neurips-review` skill**

Skill argument:
```
Review the prose in these files for Tom-NeurIPS-style argument tightness:
- index.html: the hero <p>, the tracks-heading <p>, each .vb-track <p>, the timeline <p>, the sponsors <p>
- leaderboard.html: the hero <p>, the t1..t5 <h2>+<p>, the methodology <p>s, the formal-section <p>s
- ethics.html: every <p>
- track-record.html: every <p>

For each block, evaluate: argumentative? compact? mechanism-driven? claim-bounded? structurally aligned with controlled-study writing?

Apply rewrites where they tighten claims without breaking meaning. Preserve verbatim quotes from the proposal exactly.

Output: a list of changed blocks with rationale.
```

- [ ] **Step 3: Commit**

```bash
git diff --stat
git add *.html
git commit -m "style: tom-neurips-review pass 1 (tighten claims, mechanism-driven prose)"
```

### Task E.3: avoid-ai-writing pass 2 (verification — should be clean)

- [ ] **Step 1: Re-invoke `avoid-ai-writing` in detection-only mode**

Skill argument:
```
Detection-only audit. Report any remaining AI-isms across all 8 HTML files. Do not rewrite. If detection comes back empty, the loop terminates.
```

- [ ] **Step 2: Decision gate**

```
If detection-only result == clean → proceed to E.4
Else                              → re-enter E.1 with the specific findings (max 3 total iterations)
```

- [ ] **Step 3: Commit (only if changes were made)**

```bash
git diff --stat
if ! git diff --quiet; then git add *.html && git commit -m "style: avoid-ai-writing pass 2 (residual fixes)"; fi
```

### Task E.4: tom-neurips-review pass 2 (verification)

- [ ] **Step 1: Re-invoke for verification**

Same as E.2 but in "report-only" mode. If clean, loop terminates.

- [ ] **Step 2: Phase-close commit**

```bash
git commit --allow-empty -m "site: Phase E (review loop) complete"
```

---

## 8. Phase F — Local Deploy

### Task F.1: Create local-serve helper

**Files:**
- Create: `/Users/bruaristimunha/Projects/neuralinterface26.github.io/scripts/serve.sh`

- [ ] **Step 1: Write the script**

Content:
```bash
#!/usr/bin/env bash
# Local preview server for neuralinterface26.github.io
# Usage: ./scripts/serve.sh [port]
set -euo pipefail
PORT="${1:-8080}"
cd "$(dirname "$0")/.."
echo "Serving on http://localhost:$PORT ..."
echo "Pages: /  /organizers.html  /leaderboard.html  /awards.html  /startkit.html  /ethics.html  /track-record.html  /faq.html"
exec python3 -m http.server "$PORT"
```

- [ ] **Step 2: Make executable and test**

```bash
cd /Users/bruaristimunha/Projects/neuralinterface26.github.io
mkdir -p scripts
chmod +x scripts/serve.sh
./scripts/serve.sh 8080 &
SERVE_PID=$!
sleep 2
curl -sS -o /dev/null -w "%{http_code}\n" http://localhost:8080/
curl -sS -o /dev/null -w "%{http_code}\n" http://localhost:8080/ethics.html
curl -sS -o /dev/null -w "%{http_code}\n" http://localhost:8080/track-record.html
curl -sS -o /dev/null -w "%{http_code}\n" http://localhost:8080/faq.html
kill $SERVE_PID
```

Expected: four `200` responses.

- [ ] **Step 3: Commit**

```bash
git add scripts/serve.sh
git commit -m "tools: add local-serve helper (python http.server wrapper)"
```

### Task F.2: Start long-running local server

- [ ] **Step 1: Start the server in the background**

```bash
cd /Users/bruaristimunha/Projects/neuralinterface26.github.io
./scripts/serve.sh 8080 > /tmp/serve.log 2>&1 &
echo $! > /tmp/serve.pid
sleep 2
echo "Server PID: $(cat /tmp/serve.pid)"
```

(Note: the server stays running for Phase G; we kill it at the end of Phase H.)

- [ ] **Step 2: Verify availability**

```bash
curl -sS http://localhost:8080/ | head -5
```

Expected: shows the `<!doctype html>` and `<html lang="en">` lines of `index.html`.

---

## 9. Phase G — Frontend-Design Visual Review

### Task G.1: Visual review per page

**Files:**
- Read-only on HTML; the agent captures and scores screenshots.

- [ ] **Step 1: Invoke `frontend-design` skill, one page at a time**

For each of `index.html`, `organizers.html`, `leaderboard.html`, `awards.html`, `startkit.html`, `ethics.html`, `track-record.html`, `faq.html`:

Skill argument:
```
Page under review: http://localhost:8080/<page>.html

Run a structured visual audit. Score these dimensions (1-10, target ≥ 7):
1. Information density vs. whitespace
2. Hero clarity (does the lead paragraph stand alone?)
3. Section hierarchy (eyebrow → h2 → lead → content visible without scroll?)
4. Stat blocks (placeholders gone?)
5. Color/contrast (light/dark mode)
6. Mobile-width responsiveness
7. CTA visibility
8. Cross-page nav consistency

Return: per-dimension score, top-3 issues, suggested concrete fixes (CSS or markup), and PASS / REVISE / FAIL.
```

- [ ] **Step 2: Apply fixes within frontend-design's diff budget**

Implement only fixes inside the *visual* layer (CSS, markup). Do not change content text in this phase.

- [ ] **Step 3: Commit visual fixes (if any)**

```bash
git add *.html assets/
git commit -m "ui: address frontend-design findings (visual hierarchy, density, mobile)" || echo "no visual changes needed"
```

### Task G.2: Visual review loop close

- [ ] **Step 1: Re-run frontend-design on any page that was REVISE/FAIL**

Up to 3 iterations; same termination rule as Phase E.

- [ ] **Step 2: Phase-close commit**

```bash
git commit --allow-empty -m "site: Phase G (frontend-design visual loop) complete"
```

---

## 10. Phase H — Verification Gate

### Task H.1: Spec-coverage script

**Files:**
- Create: `/Users/bruaristimunha/Projects/neuralinterface26.github.io/scripts/coverage-check.py`

- [ ] **Step 1: Write the script**

Content:
```python
#!/usr/bin/env python3
"""Spec-coverage check.

Verifies that every fact listed in docs/CONTENT_INVENTORY.md appears
verbatim somewhere across the public HTML files. Exits 1 on any miss.
"""
from __future__ import annotations
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INVENTORY = ROOT / "docs" / "CONTENT_INVENTORY.md"
PAGES = sorted(ROOT.glob("*.html"))


def load_inventory_anchors() -> list[str]:
    """Pull short anchors (proper names, dataset IDs, dates, amounts, key numbers).

    The convention: lines in inventory tables whose first column starts
    with a recognisable token (capital letter, digit, or backtick) are
    treated as anchor candidates.
    """
    text = INVENTORY.read_text(encoding="utf-8")
    anchors: set[str] = set()
    for line in text.splitlines():
        # only inside table rows
        if not line.startswith("|") or line.startswith("|--"):
            continue
        cells = [c.strip() for c in line.strip("|").split("|")]
        if not cells:
            continue
        first = cells[0]
        # skip header rows (contain ----)
        if re.match(r"^[-:\s]+$", first):
            continue
        # take the first cell content as an anchor if it looks like a name/id/number
        if re.match(r"^[A-Za-z0-9$`].{1,60}$", first):
            anchors.add(first.replace("`", ""))
    return sorted(anchors)


def main() -> int:
    if not INVENTORY.exists():
        print(f"ERROR: inventory not found at {INVENTORY}", file=sys.stderr)
        return 2

    html_blob = "\n".join(p.read_text(encoding="utf-8") for p in PAGES)
    misses: list[str] = []
    for anchor in load_inventory_anchors():
        # be lenient on whitespace / hyphens / case
        norm = re.escape(anchor).replace(r"\ ", r"\s*")
        if not re.search(norm, html_blob, flags=re.IGNORECASE):
            misses.append(anchor)

    if not misses:
        print(f"OK: every inventory anchor ({len(load_inventory_anchors())}) appears on the site.")
        return 0
    print(f"MISSING {len(misses)} anchors from the site:")
    for m in misses:
        print(f"  - {m}")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
```

- [ ] **Step 2: Run it**

```bash
cd /Users/bruaristimunha/Projects/neuralinterface26.github.io
python3 scripts/coverage-check.py
```

Expected: exit 0 with the OK line.

If anchors are missing, iterate:
1. Add them to the right page (one commit per fix).
2. Re-run.
3. Max 3 iterations before paging the human.

- [ ] **Step 3: Commit**

```bash
git add scripts/coverage-check.py
git commit -m "tools: add spec-coverage script (anchors → HTML presence check)"
```

### Task H.2: Stop the local server

- [ ] **Step 1: Kill the server**

```bash
if [ -f /tmp/serve.pid ]; then
  kill "$(cat /tmp/serve.pid)" 2>/dev/null || true
  rm /tmp/serve.pid
fi
```

### Task H.3: Final manual smoke (human-in-the-loop)

- [ ] **Step 1: Render the final diff summary for human review**

```bash
cd /Users/bruaristimunha/Projects/neuralinterface26.github.io
git log --oneline main..HEAD
git diff main..HEAD --stat
```

- [ ] **Step 2: Open the deployed pages in a browser for a final eyeball check**

```bash
./scripts/serve.sh 8080 &
SERVE_PID=$!
open http://localhost:8080/
# … review each page …
kill $SERVE_PID
```

- [ ] **Step 3: Branch handoff**

If everything passes, push and open a PR; otherwise leave the branch and write a `docs/handoff/2026-05-21-residual.md` listing what's left.

```bash
git push -u origin site/proposal-alignment-2026-05-21
gh pr create --title "site: bring website to full content-fidelity with the NeurIPS 2026 proposal" \
  --body "$(cat <<'EOF'
## Summary
- Resolves 50+ proposal↔website discrepancies catalogued in the May 21 audit.
- Critical: Track 5 scope corrected (3 → 4 tasks incl. EMG); submission model clarified (parquet public + code at audit); domain-name disambiguated.
- Adds 3 missing organizers (Aimone, Moreau, Raugel); count 24 → 27.
- Populates 15-dataset table, full baseline table with proposal numbers, June 1/15 timeline milestones, real At-a-glance stats.
- New pages: ethics, track-record, faq.
- Awards: reinstates 6-month internship; \$2,500 cash per top-3; names affinity groups; ethics stub.
- Reviewed via avoid-ai-writing + tom-neurips-review + frontend-design loops.
- spec-coverage script returns 0 missing anchors.

## Test plan
- [ ] Open each of 8 pages via `./scripts/serve.sh`
- [ ] Confirm no console errors
- [ ] Confirm Track 5 says "all four tracks" everywhere
- [ ] Confirm `python3 scripts/coverage-check.py` exits 0
EOF
)"
```

---

## 11. Self-Review

This section is the in-document audit per the writing-plans skill.

### 11.1 Spec coverage (proposal sections → tasks)

| Proposal section | Implementing task(s) |
|---|---|
| §1.1 Background & impact | (no direct site section; surfaces in index hero + ethics) — covered by E.2 prose tightening |
| §1.1 expected 1,500 teams | C.2 At-a-glance stats |
| §1.1 past results 1,197 teams etc. | D.2 track-record page |
| §1.2 Novelty | indirect; not a site section |
| §1.3 Data | C.2 datasets table |
| §1.3 Tasks (Tracks 1-5) | B.1 (Track 5 fix), C.2 |
| §1.4 Metrics | B.1 (Track 5 formal def), C.3 (W-bMAE rename) |
| §1.5 Baselines | C.3 baseline numbers |
| §2.6 Website description | satisfied by every task |
| §2 Timeline | C.4 timeline + countdown |
| §2 Rules and Engagement | D.3 faq.html (caps, anonymous, authorship) |
| §2 Rule rationale | covered in D.3 Q&A |
| §2 Communication | already in organizers; Discord link to be fixed at H.3 |
| §2 Contingency plan | D.3 Q3-Q4 |
| §2 Prize structure | D.4 awards.html update |
| §2 Authorship | D.3 Q7 |
| §2 Diversity & inclusion | D.4 affinity-network expansion |
| §2 Promotion | D.2 / track-record page mentions reach |
| §3 Organizing team | C.1 add 3 missing organizers |
| §3 Resources provided | B.2 startkit (Codabench/AWS/Deloitte) |
| §3 Support requested | not user-facing |
| Appendix biographies | C.1 |
| §1.2 Ethics & NeurIPS Code of Ethics | D.1 ethics.html |

All proposal sections have at least one implementing task.

### 11.2 Placeholder scan

Searched the plan for the No-Placeholder anti-patterns:
- "TBD" — present only inside content strings that mirror the proposal's own "TBC" for the internship sponsor (acceptable; that's the proposal's reality)
- "implement later", "fill in details", "TODO" — none
- "appropriate error handling", "edge cases" — none
- "similar to Task N" — none
- Steps without code or commands — none; every step has either a code block, a command, or a Skill invocation argument

Clean.

### 11.3 Type / name consistency

- Track names are spelled `EEG-to-IMG`, `BCI decoding`, `Sleep onset`, `EMG-to-Text`, `Foundation transfer` consistently across B.1, C.2, C.3, D.3, D.4.
- File names: `ethics.html`, `track-record.html`, `faq.html` consistent in D.1, D.2, D.3, D.5, H.3.
- Anchor names: `#datasets`, `#tracks`, `#timeline`, `#sponsors`, `#cta`, `#methodology` match the existing site IDs.
- Phase numbers in timeline (01–06) consistent across C.4 instructions.
- Dataset numeric values consistent between C.2 (Datasets table) and C.3 (Baselines table) — both reference Stieger 2021 / Kemp 2000 / Gifford 2022 / Sivakumar 2024.

Clean.

### 11.4 Loop termination & safety

- Phase E and Phase G both cap at **3 iterations** with explicit fall-through to "page the human".
- Phase H reuses the same 3-iteration cap.
- Every loop ends with a phase-close commit so a failed loop is recoverable.

### 11.5 Parallelism check

- Phase B: 3 agents parallel (B.1 spans 3 files; B.2 owns startkit; B.3 owns proposal+grep). No shared write file.
- Phase C: 4 agents parallel (C.1=organizers.html, C.2=index.html datasets+stats, C.3=startkit.html baselines, C.4=index.html timeline + countdown across all pages).
  - **Conflict risk**: C.2 and C.4 both modify `index.html`. Mitigation: dispatch C.2 first, await, then dispatch C.4 (or merge them — see note in C.4 prompt: countdown updates touch all 5 pages, but timeline only touches index, separate sections — safe if sequential within the file).
  - **Decision**: serialize C.2 → C.4 to avoid `index.html` collision. C.1 and C.3 stay parallel with both.
- Phase D: 4 agents parallel (D.1=create ethics+nav, D.2=create track-record+nav, D.3=create faq+nav, D.4=modify awards.html).
  - **Conflict risk**: D.1–D.3 all modify the nav in every existing HTML file. Mitigation: serialize D.1 → D.2 → D.3 (each inserts its own nav link, no conflict if each inserts in a different position). D.4 is independent.

### 11.6 Open follow-ups (not in this plan)

After this plan executes, two items still need a human:
- **Discord channel real URL** — replace placeholder `https://discord.gg/` once the channel exists.
- **Avatar images for Aimone/Moreau/Raugel** — placeholder SVG used; real photos to follow.

Both belong on a `docs/handoff/2026-05-21-residual.md` after Phase H.

---

## Execution

Plan complete and saved to `docs/superpowers/plans/2026-05-21-proposal-website-alignment.md`. Two execution options:

**1. Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks, fast iteration. This matches what the user asked for ("work with multiple agents") and lets the review loops fire as independent agents per file.

**2. Inline Execution** — execute tasks in this session using executing-plans, batch execution with checkpoints. Slower; suitable if the user wants a single-pass run with maximum visibility.

Which approach?
