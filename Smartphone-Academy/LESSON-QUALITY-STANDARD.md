# Smartphone Academy — Lesson Quality Standard

This standard is used for the 235 English and 235 Greek catalog pages.

A catalog lesson is considered structurally complete when it contains all of the following:

1. A lesson-specific instructional core that is not an exact or near-duplicate of another catalog lesson.
2. Explicit learning outcomes tied to the lesson title and its own concepts.
3. A professional workflow that requires scope, version awareness, evidence, reproducibility and honest limitations.
4. A knowledge check that requires reasoning rather than copying a sentence from the page.
5. A completion standard that asks the learner to explain, reproduce and qualify the result.
6. Source/version discipline for Android, Termux, browser, vendor and other version-sensitive behavior.
7. A safety/authorization boundary where the subject involves security, device changes, physical repair or system modification.
8. Practical work that produces inspectable evidence and tests normal plus failure/edge/rollback behavior when appropriate.

## Depth rule

The rendered instructional article must contain at least **400 words**. This threshold is a floor, not a claim that word count alone proves quality. It prevents catalog entries from being little more than titles or link stubs while the other checks verify structure and uniqueness.

## Duplicate rule

The shared professional framework is intentionally consistent across the Academy and is excluded from duplicate detection. Duplicate analysis is performed on each lesson's original/topic-specific core.

- Exact normalized duplicate core bodies: **not allowed**.
- TF-IDF cosine similarity at or above **0.55** between two different lesson cores: **not allowed** without manual review and justification.

This catches copied or lightly renamed lessons while allowing neighboring lessons to share necessary terminology.

## Bilingual rule

Every catalog ID must resolve to one English page and one Greek page. Both language versions must contain the same professional quality layer, while their lesson-specific instructional cores remain independently checked for duplication.

## Practical assessment

Practical labs use the Academy's separate assessment model: a 70-point documentation gate for every workspace, plus 30 technical points only on labs with deterministic lab-specific validators. Judgment-heavy labs are review-mode and require an explicit self, peer or instructor review instead of receiving an automatic correctness claim. The lesson-quality audit does not replace that assessment layer; it verifies that the teaching page itself is substantial and assessable.

## Re-running the audit

From the website repository root:

```bash
python scripts/audit_academy_lessons.py --root .
```

If scikit-learn is available, the script performs the TF-IDF near-duplicate test. It always performs page-count, exact-duplicate, minimum-depth and professional-section checks.
