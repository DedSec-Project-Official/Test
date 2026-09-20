# Smartphone Academy professional-quality update — 2026-09-18

This package keeps the published curriculum at **235 lessons per language, 123 practical laboratories, and 382 estimated practical hours** while strengthening lesson depth, bilingual consistency, duplicate control, assessment validity and release auditing.

## Curriculum and editorial work

- Completed all five previously empty `Labs/Web/Web-Challenges/Lvl1-Lvl5/Readme` exercises with defensive local challenges and evidence criteria.
- Expanded all 470 English/Greek catalog pages with explicit learning outcomes, professional context/workflow, knowledge checks, completion criteria and source/version discipline.
- Rewrote overlapping Android/app/privacy lesson cores until the strict TF-IDF near-duplicate audit reported zero pairs at or above 0.55 in both languages.
- Removed duplicated theory opening text and stopped practical lessons from repeating the full Practical Mission checklist inside Professional Workflow.
- Performed a Greek title/editorial cleanup while retaining standard technical names and acronyms where useful.
- Corrected stale curriculum metadata so the practical-track summary reflects **123** labs, not an earlier 55-lab count.
- Tightened version-sensitive source guidance, including Android/OWASP references and Termux DNS tooling/dependency notes.

## Assessment redesign

- Replaced the former documentation-only 100-point interpretation with a **70-point documentation gate** plus **30 lab-specific technical points** only where deterministic automatic validation is honest.
- Review-mode labs become **READY FOR REVIEW** at 56/70 and require an explicit self, peer or instructor review; documentation length is not presented as proof of correctness.
- Added/updated `ASSESSMENT-STANDARD.md` and `Practice/Rubrics.json` to describe the model consistently.
- Added lab-specific validators for the six final automatic assessments:
  - `hash-baseline`
  - `package-integrity-baseline`
  - `json-config-validator`
  - `python-log-normalizer`
  - `capstone-incident`
  - `mobile-response-casefile`
- Hardened evidence checks against placeholder/repeated boilerplate and added `review.md` to prepared workspaces.
- Updated `Smartphone-Academy.py` completion, scoring, review acknowledgment, assessment, audit and completion-record behavior.
- The generated completion record is explicitly labelled **self-managed, non-accredited, locally assessed**.

## Release-gate auditing

- `scripts/audit_academy_lessons.py` checks page parity, minimum depth, required professional sections, exact duplicate cores and TF-IDF near-duplicates.
- `scripts/audit_academy_assessment.py` checks the 123-lab/382-hour practical catalog, rubric thresholds, validator registry, final-assessment consistency and ensures an untouched prepared workspace cannot pass.
- Academy structural audit checks catalog uniqueness, English/Greek paths, practical catalog parity, empty Academy files, practical-hour totals and final-validator registration.
- Full website validation checks page structure, local references, deployment metadata, JSON and link integrity before packaging.

## Current strict lesson-audit result

- English: **235 pages**, **505 minimum / 680 median / 1,405 maximum words**, **0** exact/near-duplicate core pairs at TF-IDF cosine >= 0.55.
- Greek: **235 pages**, **526 minimum / 671 median / 1,433 maximum words**, **0** exact/near-duplicate core pairs at TF-IDF cosine >= 0.55.
- Ordinary lesson pages contain no repeated substantive paragraph/list blocks after the intra-page editorial cleanup; the practical-track directory remains an index and intentionally uses repeated module-card conventions.

See `QUALITY-REPORT.md`, `PROFESSIONAL-LESSON-AUDIT.md`, `LESSON-QUALITY-STANDARD.md` and `ASSESSMENT-STANDARD.md` for the release criteria.
