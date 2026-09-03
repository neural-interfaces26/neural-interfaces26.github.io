# Content Inventory: EEG/EMG Foundation Challenge 2026
Generated: 2026-05-21  
Source: `competitions_neurips_2026.tex` (835 lines), `affiliations.tex` (20 lines), `references.bib` (~1500 lines)

---

## 1. Canonical Decisions

| # | Conflict | Proposal evidence (line nos.) | Canonical decision | Reason |
|---|----------|-------------------------------|--------------------|--------|
| C1 | Domain name | Line 463: `neural-interfaces26.github.io` (starter kit href text); Lines 535, 540: `neuralinterface26.github.io` (Communication paragraph; Schedule footnote) | **`neural-interfaces26.github.io`** — *reversed 2026-08-28* | Originally decided the other way on a majority-of-occurrences count plus the claim that "the live site resolves to the no-hyphen/no-s domain". That claim was wrong: the repository is `github.com/neural-interfaces26/neural-interfaces26.github.io`, so GitHub Pages serves it at `https://neural-interfaces26.github.io/` and the no-hyphen host never resolved. The 2026 LinkedIn artwork set prints `neural-interfaces26.github.io`. Deployment reality and published comms both outrank the proposal's typo count. |
| C2 | GitHub org name | Line 463: `github.com/neural-interfaces26` (hyphen, plural) | **`github.com/neural-interfaces26`** (keep as written) | Single occurrence; no contradicting form. Org and Pages domain may legitimately differ. |
| C3 | Track 5 scope | Line 194 (abstract): 'four diverse tasks (EEG-to-image, BCI command decoding, Sleep stage onset prediction, and EMG-to-text)'; Line 221 (figure caption): 'one shared biosignal encoder through organizer-fitted linear heads on the four tasks'; Line 384: 'applied across all four tasks (three EEG and one EMG)' | **All four tasks: IMG, BCI, Sleep, EMG** | Abstract and all track-description passages agree; current website 'three EEG tracks' label omits EMG. |
| C4 | Submission model | Line 235: 'code submissions'; Lines 506-507: 'Codabench workers with H100/H200 NVIDIA instances … fixed container image'; Line 351: 'top submissions are rerun by the organizers' | **Hybrid: prediction output for public leaderboard; code re-executed at audit gate on Codabench H100/H200** | Code submission stated throughout §2; audit rerun is the leakage-prevention gate. |
| C5 | Daily submission caps | Line 524 (commented-out LaTeX only): `% 5/day during warm-up, 2/day during the sealed final phase` | **5/day warm-up, 2/day final** | Commented text is the sole source; treat as intended rule. Not visible in rendered PDF. |
| C6 | Prize amount | Line 555: 'USD 2,500 cash prize' per top-three team per track | **USD $2,500 per top-3 team per track** | Single figure; no contradicting amount anywhere. |
| C7 | GPU class | Lines 506-507: 'H100/H200 NVIDIA instances'; Line 574: '32,000+ H200 GPU-hours' | **H100/H200 scoring workers (AWS H200-class allocation)** | Both §2 and §3 confirm; H200 is the specific AWS allocation type in the resources paragraph. |
| C8 | Footnote URL form | Line 454 footnote: `neural-interfaces26.github.io/leaderboard.html` (hyphen + `s`) | **Keep as written** — *reversed 2026-08-28* | Third collision with C1; same resolution. The footnote was already using the form that actually resolves. |
| C9 | Track-5 adaptation rule | Line 385: "adaptation mechanisms" permitted; lines 519-521: "separately-trained sub-encoders" forbidden | **Adaptation = per-task heads + organizer-fitted linear probes only; no per-track encoder fine-tuning** | Surface in FAQ Q1/Q11; flag in startkit submission section. |
| C10 | "Suggested" vs "required" training rule | Line 516: "are suggested to be trained exclusively on data of their track"; line 529: "reproducible scripts from top submissions enforce it" | **Enforced for top-N audit; suggestion-only for the public leaderboard** | Surface in FAQ Q8 alongside the external-data policy. |
| C11 | Sleep-track sponsor name | Lines 39-41 (`affiliations.tex`): organisers affiliated to 'InteraXon Inc., Canada'; Section 8: `InteraXon (Muse headband)` as sleep-track data provider | **Credit the sponsor as "Muse", never as "InteraXon"** — *added 2026-09-04* | The sponsor asked to be named by the headband brand rather than the legal entity. All eight site mentions and the sponsor-wall mark now read Muse (`assets/img/logos/muse.svg`, plus `muse-white.svg` for dark surfaces); the sponsor link points at `choosemuse.com`, not `interaxon.ca`. The legal entity and the `@interaxon.ca` addresses in Section 2 stay as the proposal wrote them — they are the record of the submission, not site copy. |

---

## 2. Organizers

| # | Name (as in proposal) | Affiliations (resolved) | Email | Competition Role | One-line bio anchor |
|---|----------------------|------------------------|-------|-----------------|---------------------|
| 1 | Bruno Aristimunha | Yneuro, Paris, France; University of California San Diego, USA | b.aristimunha@gmail.com | Coordinator (Timeline, Paper), Platform Ops, Baseline Provider | Lead maintainer of Braindecode and MOABB; PhD deep learning for EEG; reviewer at NeurIPS/ICLR/ICML. |
| 2 | Arnault H. Caillet | Yneuro, Paris, France; Imperial College London, UK | arnault@yneuro.com | Coordinator, Track Team (EMG), Platform Ops, Evaluator | CSO and Founding Scientist Yneuro; PhD computational neuroscience; leads Neuro ID R&D and MNE-EMG. |
| 3 | Hubert Banville | FAIR Brain & AI team, Meta, France | hubert.jbanville@gmail.com | Coordinator, Track Leader (EEG-Img), Evaluator, Baseline Provider | Research Scientist Meta FAIR Brain & AI; PhD self-supervised EEG (Inria, Paris-Saclay); formerly InteraXon. |
| 4 | Pierre Guetschel | Donders, Radboud University, Netherlands | pierre.guetschel@gmail.com | Coordinator, Beta Tester, Baseline Provider | PhD candidate Donders; core developer Braindecode and MOABB; transfer + self-supervised learning for EEG. |
| 5 | Jean Remi King | FAIR Brain & AI team, Meta, France; CNRS, France | jeanremi@meta.com | Track Team (EEG-Img), Evaluator, Baseline Provider | Leads Meta FAIR Brain & AI; CNRS researcher ENS; deep learning for MEG/EEG/fMRI language and intelligence. |
| 6 | Vinay Jayaram | Alljoined, USA | vinay@alljoined.com | Track Team (EEG-Img) | Senior scientist Alljoined; formerly Meta neural handwriting; open-science contributor of Alljoined 1.6M dataset. |
| 7 | Ugo Bruzadin Nunes | Alljoined, USA | ugo@alljoined.com | Track Team (EEG-Img), Beta Tester | Neural data scientist Alljoined; Visiting Scholar Chapman; led preprocessing for Alljoined 1.6M publication. |
| 8 | Simon Kojima | Inria, LaBRI, Univ. Bordeaux, France | simon.kojima@inria.fr | Track Leader (BCI) | Postdoc Inria Bordeaux (NEARBY project); motor-imagery BCIs, EEG variability, out-of-lab deployment. |
| 9 | Pauline Dreyer | Inria, LaBRI, Univ. Bordeaux, France | pauline.dreyer@inria.fr | Track Team (BCI) | PhD candidate Inria Bordeaux (PROTEUS project); active BCIs and within-user session variability. |
| 10 | Raphaelle Nina Roy | ISAE-SUPAERO, Universite de Toulouse, France; ENAC/ONERA, Toulouse, France | raphaelle.roy@isae-supaero.fr | Track Team (BCI), Evaluator | Professor neuroergonomics; co-founder French BCI association; organised first passive BCI competition; 80+ publications. |
| 11 | Fabien Lotte | Inria, LaBRI, Univ. Bordeaux, France | fabien.lotte@inria.fr | Track Team (BCI), Evaluator | Research director Inria Bordeaux (Potioc/BCI); ERC BrainConquest and SPEARS laureate; USERN Prize 2022. |
| 12 | Maurice Abou Jaoude | InteraXon Inc., Canada | maurice@interaxon.ca | Track Team (Sleep) | Senior Research Scientist InteraXon (Muse); deep learning for expert-level automated sleep analysis on wearables. |
| 13 | Jiansheng Niu | InteraXon Inc., Canada | jiansheng@interaxon.ca | Track Leader (Sleep) | Senior Research Scientist InteraXon; leads self-supervised foundation models on large-scale Muse sleep/meditation data. |
| 14 | Christopher Aimone | InteraXon Inc., Canada | chris@interaxon.ca | Track Team (Sleep) | CIO and co-founder Muse by InteraXon; artist-inventor driving wearable EEG neurotech for sleep and AI. |
| 15 | Pranav Mamidanna | Imperial College London, UK | p.mamidanna22@imperial.ac.uk | Track Team (EMG), Beta Tester | Research Fellow Imperial (AI + neuroscience); lead developer MUniverse EMG simulation; co-organiser MUnitQuest. |
| 16 | Alexandre Gramfort | Reality Labs, Meta, France | alexandre.gramfort@m4x.org | Track Leader (EMG), Evaluator | Senior Research Scientist Manager Meta Reality Labs; co-inventor MNE-tools and scikit-learn; ex-Research Director Inria MIND. |
| 17 | Marie-Constance Corsi | Inria NERV, Paris Brain Institute, France | marie.constance.corsi@gmail.com | Track Team (BCI), Beta Tester | Inria research scientist Paris Brain Institute (NERV); interpretable AI for BCI training and neurological disease diagnosis. |
| 18 | Thomas Moreau | Inria MIND, Univ. Paris-Saclay, France | thomas.moreau@inria.fr | Evaluator | Research scientist Inria MIND; maintains benchopt, braindecode, MNE-Python, MOABB; ML optimization and signal processing. |
| 19 | Josephine Raugel | FAIR Brain & AI team, Meta, France; ENS, PSL Research University, France | josephiner@meta.com | Track Team (EEG-Img), Baseline Provider | PhD candidate ENS / Meta FAIR; co-author NeuralSet Python package and TRIBEv2 foundation brain encoder. |
| 20 | Lionel Kusch | Yneuro, Paris, France | lionel@yneuro.com | Platform Ops, Beta Tester | ML Infrastructure Engineer Yneuro; PhD computational neuroscience; contributor The Virtual Brain and NEST/EBRAINS. |
| 21 | Thomas Semah | Yneuro, Paris, France | thomas@yneuro.com | Platform Ops | Founder and CEO Yneuro (Neuro ID); Choiseul 100 / Future 40; CentraleSupelec + ESPCI Paris-PSL graduate. |
| 22 | Seyed Yahya Shirazi | University of California San Diego, USA | shirazi@ieee.org | Platform (Data Standards) | Assistant Project Scientist UCSD; led HBN-EEG curation; lead scientist BIDS-EMG/Stimulus extensions; EEGLAB core dev. |
| 23 | Scott Makeig | University of California San Diego, USA | smakeig@ucsd.edu | Evaluator | Co-creator of EEGLAB; pioneer of ICA for EEG; leader in mobile brain/body imaging (MoBI). |
| 24 | Terrence Sejnowski | University of California San Diego, USA; Salk Institute for Biological Studies, USA | terry@salk.edu | Evaluator | Co-developed Boltzmann machine; foundational contributions to deep learning bridging computational neuroscience and ML. |
| 25 | Isabelle Guyon | Google DeepMind, ChaLearn, USA | guyon@chalearn.org | Platform Advisor, Evaluator | NeurIPS 2016/2017 chair; launched NeurIPS challenge track; co-inventor SVM; president ChaLearn; BBVA Frontiers 2020. |
| 26 | Sylvain Chevallier | Univ. Paris-Saclay, Inria TAU, France; CNRS, France | sylvain.chevallier@universite-paris-saclay.fr | Platform Advisor, Evaluator | Full professor Paris-Saclay; leads Codabench framework; Riemannian geometry and frugal learning for BCI; CNRS co-leader TAU. |
| 27 | Arnaud Delorme | University of California San Diego, USA; CNRS, France | arnodelorme@gmail.com | Platform (EEGLAB), Evaluator | Co-creator and lead of EEGLAB (with Makeig); research on EEG methods, AI integration, meditation, mind wandering. |

---

## 3. Datasets

| Track | Name (proposal spelling) | Citation key | Hardware | Subjects | Notes |
|-------|--------------------------|--------------|----------|----------|-------|
| IMG (Track 1) — public | THINGS-EEG1 | `grootswagers2021things` | BrainVision (research-grade) | Part of 88 total | Natural images from THINGS set; rapid serial visual presentation |
| IMG (Track 1) — public | THINGS-EEG2 | `gifford2022large` | BioSemi (research-grade) | Part of 88 total | Used in NeuralBench baseline table; THINGS stimuli |
| IMG (Track 1) — public | Alljoined-1 | `xu2024alljoined` | Emotiv (consumer-grade) | Part of 88 total | THINGS + MS-COCO stimuli |
| IMG (Track 1) — public | Alljoined-1.6M | `xu2025alljoined` | Emotiv (consumer-grade) | Part of 88 total | ~1.6M trials; MS-COCO stimuli; largest in public pool |
| IMG (Track 1) — hidden eval | Alljoined hidden evaluation set | — | Emotiv (consumer-grade) | 11 subjects | Cross-subject generalization; Alljoined-provided; same paradigm as Alljoined-1.6M (line 308) |
| Sleep (Track 3) — public | SleepEDF-Extended | `kemp2000analysis` | — | Part of 1,223 total | Standard sleep-staging benchmark; IEEE TBME 2000 |
| Sleep (Track 3) — public | Physionet Challenge 2018 | `ghassemi2018you` | — | Part of 1,223 total | 'You Snooze, You Win' challenge dataset |
| Sleep (Track 3) — public | HMC-Sleep-staging | `alvarez2022haaglanden` | — | Part of 1,223 total | Haaglanden Medisch Centrum; PhysioNet |
| Sleep (Track 3) — new public | Muse sleep-onset training set | `aboujaoude2023automated`, `lanthier2026portable` | 4-channel Muse headband EEG (consumer-grade) | ~1,000 subjects | Nocturnal + unintentional onset; `n2_onset` labels from Muse automated algorithm; released for training (line 314) |
| Sleep (Track 3) — hidden eval | Extended Muse sleep hidden set | — | Muse headband EEG | ~1,000 additional subjects | Within-subject session drift + unseen subjects; expert-scored labels (line 318) |
| BCI (Track 2) — public | Stieger2021 | `stieger2021continuous` | — | Part of 193 total | Large-population continuous sensorimotor rhythm BCI |
| BCI (Track 2) — public | Dreyer2023 | `dreyer2023large` | — | Part of 193 total | Large EEG DB for motor imagery BCI research |
| BCI (Track 2) — public | Zyma2019 | `zyma2019electroencephalograms` | — | Part of 193 total | EEG during mental arithmetic task performance |
| BCI (Track 2) — public | Scherer2015 | `scherer2015individually` | — | Part of 193 total | Individually adapted imagery BCI in end-users with disability |
| BCI (Track 2) — new public | Competition BCI dataset | — | BrainAmp/actiCAP (research-grade) + auxiliary EOG | 20 subjects x 6 sessions each | 3 mental tasks (kinesthetic MI, mental calculation, word association); Graz + BrainHero paradigms; partial public / partial held-out (lines 326-328) |
| BCI (Track 2) — hidden eval | BCI hidden test set | — | BrainAmp/actiCAP | Subset of 20 subjects | Sessions 4-6 held out; within-subject cross-session drift (line 328) |
| EMG (Track 4) — public | emg2qwerty | `sivakumar2024emg2qwerty` | Dual wrist sEMG wristbands (dry-electrode differential) | 108 users | Touch-typing corpus; QWERTY keyboard; NeuralBench baseline |
| EMG (Track 4) — new public | Competition EMG training set | — | Same wrist-sEMG hardware | — | Same typing paradigm; released for training (line 332) |
| EMG (Track 4) — hidden eval | EMG hidden evaluation set | — | Same wrist-sEMG wristbands | 100 new users | Cross-user + cross-session generalization; same paradigm (line 335) |

---

## 4. Metrics

| Track | Headline metric (symbol) | Direction | Diagnostic metrics | Equation label |
|-------|--------------------------|-----------|-------------------|----------------|
| IMG (Track 1) | `S_IMG` — Top-5 retrieval accuracy | up | Post-competition re-scoring vs auxiliary visual embedding; per-subject averaging across repeated presentations; gallery disjoint from public training releases (line 412) | eq:top5 (line 405) |
| BCI (Track 2) | `S_BCI` — Balanced accuracy averaged over subject-session-context cells | up | Graz/BrainHero paradigm gap; first-to-last held-out session drop (line 424); cell averaging prevents easy users/sessions dominating | eq:bci_score (line 417) |
| Sleep (Track 3) | `S_Sleep` — Weighted binned MAE (W-bMAE) over 4 time-to-onset bins | down | Bin-level breakdown; constant/out-of-range output cannot opt out of imminent-onset bin (line 435); 95% CI from bootstrap | eq:sleep_wbmae (line 429) |
| EMG (Track 4) | `S_EMG` — Corpus-level CER (Levenshtein edit distance) | down | Insertion/deletion/substitution rates; rendered-text CER after backspace; separates recognition from editing errors (line 449) | eq:emg_cer (line 439) |
| Foundation Transfer (Track 5) | `S_FM(a)` — Arithmetic mean rank across four task leaderboards | down (lower rank = better) | Stratified bootstrap B=10,000; 95% CI; two-sided p-values with Holm correction; independence unit defined per track (line 454) | Prose definition (line 452); no separate eq label |

---

## 5. Timeline

| Date | Milestone | Source line |
|------|-----------|-------------|
| 1 June 2026 | Public starter kit and training data available; participant preparation starts | 543 |
| 15 June 2026 | Final dataset, DUA, container, scoring, and baseline freeze; beta dry run complete | 544 |
| 1 July 2026 | Warm-up Phase opens (validation set publicly available) | 545 |
| 1 August 2026 | Final Phase opens (sealed test set) | 546 |
| 1 September 2026 AOE | Final submissions close | 547 |
| 1 November 2026 | Final rankings released; competition reports and analysis paper drafted | 548 |
| 11-12 December 2026 | NeurIPS competition track in-person | 549 |

---

## 6. Track 5 Scope

Track 5 (Foundation Transfer) covers **all four tasks**: IMG, BCI, Sleep, EMG.

Establishing lines in the proposal:

- **Line 194** (abstract): "four diverse tasks (EEG-to-image, BCI command decoding, Sleep stage onset prediction, and EMG-to-text)"
- **Line 221** (Figure 1 caption): "Track 5 (Foundation Transfer) evaluates one shared biosignal encoder through organizer-fitted linear heads on the four tasks."
- **Line 248** (§1.1): "the goal is to develop a single FM which encodes the diverse data from the first four tracks and test whether the model's representations transfer across heterogeneous EEG and EMG tasks."
- **Line 384** (§1.4): "participants submit a single foundation encoder … whose weights are applied across all four tasks (three EEG and one EMG)."
- **Line 467** (§1.5): "All four tasks are already supported in the framework."

---

## 7. Prize Structure

| Item | Amount / Description | Source line |
|------|---------------------|-------------|
| Per-track cash prize (top-3 teams) | USD $2,500 per team per track | 555 |
| Travel support (top-3 per track) | Full transport, accommodation, registration for one representative at NeurIPS | 555 |
| Internship (selected tracks) | 6-month internship at sponsor track company, TBC upon proposal acceptance | 555 |
| Workshop presentation (top-3 across tracks) | 15-minute slot at NeurIPS competition track workshop | 555, 559 |
| PMLR report authorship | Named authorship for reproduced teams submitting method description + code + disclosures | 556 |
| Consortium authorship | For teams with complete reproducible artifacts used in aggregate analysis, opt-in by report deadline | 556 |
| Diversity travel-grant nominations | From prize budget; priority first-time competitors and majority-staffed under-represented teams | 557 |

---

## 8. Sponsors

| Role | Name | URL |
|------|------|-----|
| Compute partner ($100K+ AWS credits) | Amazon AWS | https://aws.amazon.com |
| Compute coordinator / platform operator | Yneuro | https://yneuro.com |
| Platform engineering partner (Codabench scaling) | Deloitte | https://www.deloitte.com |
| Submission platform (open-source) | Codabench | https://www.codabench.org |
| Sleep track data provider | Muse (headband); legal entity InteraXon Inc. — credit as "Muse" only, see C11 | https://choosemuse.com |
| EMG track research (Track Leader affiliation) | Meta Reality Labs | https://about.meta.com/realitylabs/ |
| IMG track data provider | Alljoined | https://alljoined.com |
| IMG / Foundation track research | Meta FAIR Brain & AI | https://ai.meta.com/research/ |
| Competition governance / benchmarking | ChaLearn (Guyon) | https://chalearn.org |
| Open-source infrastructure | Inria (MIND, NERV, LaBRI teams) | https://www.inria.fr |
| Organizing institution | UC San Diego / SCCN | https://sccn.ucsd.edu |
| Organizing institution | CNRS | https://www.cnrs.fr |
| Diversity and inclusion | NeurIPS affinity groups (Women in AI, Black in AI, Queer in AI, LatinX in AI) | https://neurips.cc/public/DiversityInclusion |

---

## 9. Baselines Table

Reproduction of Table `tab:neuralbench-four-tasks` (lines 469-490). Values: NeuralBench replications, mean +/- std (citation: `banville2026neuralbench`).

Dataset row: Image = `gifford2022large` (THINGS-EEG2); BCI = `stieger2021continuous`; Sleep = `kemp2000analysis` (SleepEDF); EMG = `sivakumar2024emg2qwerty`.

| Model | Image Top-5 (%) up | BCI Bal. Acc (%) up | Sleep W-bMAE (s) down | EMG CER (%) down |
|-------|:------------------:|:-------------------:|:---------------------:|:----------------:|
| Chance | 2.22 +/- 0.31 | 24.81 +/- 1.03 | 205.42 +/- 0.01 | 96.71 +/- 0.00 |
| Dummy | 2.50 +/- 0.00 | 25.00 +/- 0.00 | 299.90 +/- 0.00 | 100 +/- 0.00 |
| EEGNet (`lawhern2018eegnet`) | 28.13 +/- 0.14 | 58.58 +/- 0.34 | 143.30 +/- 0.40 | — |
| REVE (`elouahidi2025reve`) | 84.75 +/- 0.38 | 68.04 +/- 0.73 | 134.89 +/- 2.02 | — |
| EMG2QwertyNet (`sivakumar2024emg2qwerty`) | — | — | — | 25.14 +/- 2.30 |

---

## 10. Promotion Channels

From lines 553-554 and 557:

- ~2,000 past participants of previous decoding competitions contacted directly (line 553)
- EEGLAB list: https://sccn.ucsd.edu/eeglab/eeglablist.html (line 554)
- MNE-Python forum: https://mne.discourse.group (line 554)
- NeuroTechX: https://neurotechx.com/ (line 554)
- Cutting Garden (line 554)
- Cortico (line 554)
- SCCN/UCSD (line 554)
- X (Twitter) (line 554)
- BlueSky (line 554)
- LinkedIn (line 554)
- Organizing-team accounts: "350K+ professional impressions last year" (line 554)
- Direct invitations to EEG, EMG, sleep, BCI, and foundation-model groups (line 554)
- Advocacy networks: Women in AI, Black in AI, Queer in AI, LatinX in AI, NeurIPS affinity-group (line 557)

---

## 11. Ethics Statements

| Statement (verbatim) | Source line |
|----------------------|-------------|
| All human-subject datasets are provided by their original data controllers and are used only after confirmation that the recordings, annotations, and competition use comply with applicable consent, ethics approval, de-identification, data-use terms, and the NeurIPS Code of Ethics on consent, privacy, and representativeness. | 338 |
| No personally identifying information is exposed to participants. | 339 |
| For unreleased hidden data, the corresponding track does not launch until data-use permission, anonymization, and approval for competition use are finalized. | 340 |
| The task design also follows the NeurIPS Code of Ethics. | 343 |
| Non-invasive neural interfaces can benefit many clinical applications ... but raise a central concern of mental privacy when applied to non-consenting subjects. | 344 |
| This risk is mitigated by the current low accuracy of system and necessity for subject compliance for any meaningful results in contemporary. [sic -- sentence fragment in source] | 345 |
| Final ground truth remains confidential for all tracks: image identities or embedding targets for [IMG], mental-task labels for [BCI], annotations for [Sleep], and keystroke sequences/timestamps for [EMG]. | 350 |
| Submissions are evaluated through code execution on hidden data, leaderboard outputs are restricted to aggregate scores, and top submissions are rerun by the organizers for reproducibility and leakage checks. | 351 |
| held-out subjects, sessions, stimuli, and keystrokes, combined with organizer-controlled code-submission scoring, prevent feature leakage. | 352 |

---

## 12. Past Competition Track Record

| Competition | Year | Headline numbers | Source line |
|-------------|------|-----------------|-------------|
| BEETL Motor Imagery (NeurIPS 2021) | 2021 | 130+ contestants, 40 research groups, 1,382 submissions | 569 |
| Brain Age Prediction Challenge from EEG | 2022 | 200+ participants, 40 countries | 569 |
| Sleep States Competition | 2023 | 80 teams, 20 countries | 569 |
| 2025 EEG Foundation Challenge | 2025 | 1,197 teams, 247 institutions across 50+ countries, 8,622 model submissions | 251, 569 |

Citation keys confirmed in bib: `beetl2022` (bib line 485), `age2022` (bib line 637), `sleep2023` (bib line 629), `aristimunha2025eegfoundationchallengecrosstask` (bib line 1305).

---

## 13. Submission Model

Verbatim sentences with source line numbers:

> "We propose a sealed competition to test this under common execution constraints with **code submissions**, while preventing leaderboard overfitting and leakage on public EEG benchmarks." (line 235)

> "Participants create a Codabench account, register for tracks, download the public training data, and train on their own infrastructure. Each participant then submits their model which we evaluate on the test set." (lines 503-504)

> "Submissions run on **Codabench workers with H100/H200 NVIDIA instances**. Within each phase, all submissions use a fixed container image and a bounded GPU class, with efficiency-oriented per-track wall-clock and memory budgets." (lines 506-507)

> "The core organizers rerun top submissions on a held-out worker before releasing final rankings. A rerun mismatch beyond the track tolerance triggers audit or disqualification." (line 508)

---

## 14. Compute Partner Details

Verbatim sentences with source line numbers:

> "Yneuro and Amazon AWS have partnered to support the competition with **$100,000+ in cloud credits** (about 4,000 hours of H200-class GPU instances, **32,000+ H200 GPU-hours**) dedicated to submission execution and evaluation across the warm-up and final phases." (line 574)

> "Centrally coordinated by Yneuro and Inria, this setup gives organizers control over compute allocation, hidden-label protection, and reproducibility audits, evening out compute differences across teams." (line 574)

> "The competition runs on Codabench, the open-source academic platform for code-submission evaluation. **In partnership with Deloitte**, we are funding and engineering a scaled AWS-backed Codabench deployment sized for NeurIPS-scale submission volume, and contributing the resulting code, AWS integration, and operational hardening upstream to the public Codabench repository." (line 576)

> "The 2026 challenge therefore doubles as a lasting open-source infrastructure contribution that future NeurIPS competitions can reuse without rebuilding the stack on an open-source platform." (line 576)

---

## 15. Communication Channels

| Channel | Value | Source line |
|---------|-------|-------------|
| Email list | neurips2026-eeg-emg-competition@googlegroups.com | 145, 535 |
| Discord | https://discord.gg/yZv8KqKMpH (provided out-of-band; proposal line 535 only says 'Discord Channel') | 535 |
| Website | https://neural-interfaces26.github.io | 535 |
| GitHub (starter kit / baselines) | https://github.com/neural-interfaces26 | 463 |
| Submission platform | Codabench (https://www.codabench.org) | 504 |

---

## 16. Authorship and Methods Report Policy

Verbatim from §2 (lines 509-526, 556):

> "The protocol standardizes inference-time hardware and software. It does not standardize pre-training data or pre-training compute. **Each method's report must disclose external pre-training datasets and an order-of-magnitude compute estimate.**" (lines 509-510)

> "Models submitted to Tracks 1-4 **are suggested to be trained exclusively on data of their track**. Top-ranked submissions must include a **reproducible training script** to verify the submitted weights. Failure to reproduce leads to **disqualification**. Re-training or fine-tuning on hidden evaluation data at inference time is forbidden." (lines 516-517)

> "Models submitted to Track 5 **can be trained on any publicly available dataset**: we encourage competitors to make use of any public dataset that they deem relevant." (line 518)

> "Track 5 submissions must contain a **single foundation model**: one shared common representation across all four task-specific tracks. Compliance is verified by manual code review of the top-ranked submissions; non-compliance leads to disqualification." (lines 519-521)

> "Code from the **Top-5 teams of each track** will be released post-competition under the teams' preferred open source license." (line 525)

> "**Related members** from the organising team can participate, but **are ineligible for prizes**." (line 526)

> "Reproduced top-ranked teams that submit a method description, training and inference code, and pre-training data and compute disclosures are invited as **named authors on the PMLR competition report**. Consortium authorship is offered to teams with complete, reproducible artifacts used in the aggregate analysis who opt in by the report deadline." (line 556)

---

## 17. Discrepancy Notes

| # | Location | Description |
|---|----------|-------------|
| D1 | Lines 463 vs 535, 540 | Domain name: `neural-interfaces26.github.io` (line 463, inside href for GitHub link) vs `neural-interfaces26.github.io` (lines 535 and 540, Communication + Schedule). Two occurrences for the no-hyphen/no-s form; live site resolves to that form. See C1. |
| D2 | Line 384 vs line 194 | Track 5 described as 'three EEG and one EMG' (line 384) vs abstract listing all four by full name (line 194). Factually equivalent, but the shorthand could mislead visitors expecting three tracks in Track 5. |
| D3 | Line 524 (comment only) | Daily submission caps (5/day warm-up, 2/day final) appear only in a LaTeX comment. They are absent from the visible Rules section. Website must source them from this comment or confirm with organizers. |
| D4 | Line 574 | '4,000 hours of H200-class GPU instances' and '32,000+ H200 GPU-hours' appear in the same sentence using different units. Consistent (4,000 node-hours x ~8 GPUs/node), but unexplained. Website should clarify the unit used. |
| D5 | Line 345 | Ethics sentence ends with '...for any meaningful results in contemporary.' -- sentence fragment. Appears to be an incomplete phrase. Do not reproduce verbatim on website. |
| D6 | Lines 385 vs 519-521 | Line 385 permits 'adaptation mechanisms' in Track 5 encoders; lines 519-521 prohibit 'separately-trained sub-encoders.' The boundary between a permitted adaptation and a prohibited sub-encoder is not defined in the visible text. |
| D7 | Lines 516 vs 529 | Tracks 1-4 training data rule is phrased as a 'suggestion' (line 516) but the rule rationale (line 529) implies enforcement via reproducibility scripts. The word 'suggested' may mislead participants about whether external data use is truly optional. |

---

## Coverage Notes

**Cleanly parsed:** Abstract, §1.1-1.5, §2 (all), §3 (Resources), Appendix A (all 27 biographies), affiliations.tex (all 18 commands), baseline table, timeline, prize/authorship bullets, ethics paragraphs, promotion channel text. Twenty citation keys directly relevant to inventory claims were verified present in the bib.

**Judgment calls and gaps:**

1. **Raphaelle Roy affiliation:** Biography (line 674) spells out 'ISAE-SUPAERO, Universite de Toulouse, France' rather than using the `\isae` macro. The footnote table at line 168 places position 9 as `\enacOnera` (ENAC/ONERA, Toulouse, France), both listed in Section 2.

2. **InteraXon and Meta Reality Labs as 'sponsors':** The proposal does not use the word 'sponsor' for these organisations; they are described as data providers and by organiser affiliation. Section 8 labels them by their functional role; downstream agents should note the distinction.

3. **Commented-out content:** Three substantively important items appear only in LaTeX comments: daily submission caps (line 524), the mental-privacy detailed argument (line 346), and the Track 5 encoder rationale (lines 529 ff.). All extracted faithfully above and marked as commented.

4. **Internship details:** Line 555 specifies '6-month internship at the sponsor track company, TBC, upon acceptance of the proposal.' No track-to-company mapping is given and the TBC flag means this cannot yet be populated for any specific track.

5. **Prize budget total:** Not stated in the proposal. The minimum cash figure can be inferred as $2,500 x 3 teams x 5 tracks = $37,500 but this arithmetic does not appear in the document.

6. **Diversity grant fraction:** Line 557 says grants are drawn from the 'prize budget' with no percentage or cap. Website copy should not imply a fixed amount.

7. **`blankertz2004bci`, `blankertz2006bci`, `sajda2003data`, `tangermann2012review`:** All confirmed present in bib (lines 1418, 1407, 1429, 1440). Cited only in the historical chain at line 250; no content relevant to inventory sections.
