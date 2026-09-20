# Quality report — Smartphone Academy

This report describes the release-gate checks applied to the Smartphone Academy curriculum and local assessment tooling. The Academy is self-directed and non-accredited; the checks below verify curriculum structure, duplication, documentation quality and the behavior of local validators, not independent professional certification.

## Curriculum scope

- Lessons per language: **235 English + 235 Greek**
- English/Greek catalog parity: **complete**
- Practical labs: **123**
- Estimated practical hours: **382**
- Root access: **not required**
- Canonical Academy landing page: `Smartphone-Academy/index.html`
- Progress storage: `~/.dedsec-smartphone-academy/` via `Smartphone-Academy.py`
- Lab samples: fictional/local training data only
- Security boundary: defensive learning on owned devices and explicitly authorized systems only

## Lesson-quality gate

The strict lesson audit is implemented in `scripts/audit_academy_lessons.py` and checks all **470** language lesson pages.

- Required professional sections on every page: learning outcomes, professional workflow, knowledge check, completion standard, and source/version guidance
- Minimum instructional depth: **400 words per lesson page**
- English depth: **505 minimum / 680 median / 1,405 maximum words**
- Greek depth: **526 minimum / 671 median / 1,433 maximum words**
- Exact duplicate topic-specific lesson bodies: **0**
- Repeated substantive paragraph/list blocks inside ordinary lesson pages: **0** in both languages (the practical-track directory is treated as an index)
- Near-duplicate English lesson pairs at TF-IDF cosine **>= 0.55**: **0**
- Near-duplicate Greek lesson pairs at TF-IDF cosine **>= 0.55**: **0**
- Shared safety, assessment, navigation and reproducibility language is treated as course framework and excluded from topic-core duplicate analysis
- Greek editorial pass removed awkward mixed-language title wording while retaining standard technical names and acronyms where appropriate
- Version-sensitive Android/Termux material includes source/version guidance and primary-reference links where the subject requires it

Run the strict lesson audit from the repository root:

```sh
python scripts/audit_academy_lessons.py --root .
```

## Practical assessment model

The Academy deliberately separates **documentation readiness** from **technical correctness**.

### Documentation gate — 70 points

Every prepared workspace can earn:

- **15** — workspace/source integrity
- **15** — completed task checklist
- **20** — substantive, distinct evidence with scope/date/device
- **20** — substantive, distinct analyst notes

Repeated boilerplate, placeholder text, missing dates and duplicated sections do not satisfy the evidence/notes gates.

### Lab-specific automatic validation — 30 points

Only six deterministic labs currently receive automatic technical-validation points:

1. `hash-baseline`
2. `package-integrity-baseline`
3. `json-config-validator`
4. `python-log-normalizer`
5. `capstone-incident`
6. `mobile-response-casefile`

These labs require **80/100 or higher** and a successful lab-specific technical validator. The validators inspect concrete artifacts/results rather than prose length alone.

All other practical labs are **review-mode**. They can reach **ready for review** at **56/70**, but the local tool does not claim that their technical conclusions are automatically correct. A real self/peer/instructor review must be recorded in `review.md` and acknowledged with `--reviewed`.

`--force` is only a local progress override and does not represent a competence result.

## Assessment robustness tests

The release-gate tests include positive and adversarial cases:

- A correctly completed `hash-baseline` workspace reaches **100/100** and passes its artifact-specific checks.
- A workspace with every checkbox selected but generic repeated prose is rejected by the evidence/notes gates and does not receive technical-validation points.
- A judgment-based review-mode lab can be documentation-ready without being labelled technically correct; it returns **READY FOR REVIEW** until review is explicitly acknowledged.
- Final-assessment labs are required to have registered automatic validators.

The six automatically validated labs above also form the final local assessment set.

## Completion record

`python Smartphone-Academy.py certificate` is available only after the catalog is marked complete and the final assessment requirements are satisfied. The generated record is explicitly labelled **self-managed, non-accredited, locally assessed**. It is a portfolio/completion record, not an industry certification or independent verification of professional competence.

## Additional release checks

- All five `Labs/Web/Web-Challenges/Lvl1-Lvl5/Readme` files contain defensive local exercises, evidence requirements and completion criteria.
- Termux command guidance identifies package dependencies where required; DNS tooling notes that `dig`, `host` and `nslookup` are supplied by `dnsutils` and includes a documented fallback/checking workflow.
- Academy self-audit: `python Smartphone-Academy.py audit`
- Full-site structural/link validation: `python scripts/validate_site.py`
- Python syntax/bytecode compilation is run for the Academy companion, Labkit and serving helper before packaging.
