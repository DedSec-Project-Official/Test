# Professional lesson audit — 2026-09-18

## Result

**PASS — zero issues under the current Smartphone Academy lesson-quality standard.**

### Catalog and language parity

- English catalog pages: **235**
- Greek catalog pages: **235**
- Missing paired pages: **0**
- Exact duplicate lesson-core groups: **0**
- Near-duplicate English core pairs at TF-IDF cosine similarity **>= 0.55**: **0**
- Near-duplicate Greek core pairs at TF-IDF cosine similarity **>= 0.55**: **0**
- Repeated substantive paragraph/list blocks inside ordinary lesson pages after the editorial cleanup: **0** in both languages (the practical-track directory page is an index and intentionally reuses module-card labels)

The stricter pass rewrote the core of overlapping Android/app/privacy lessons rather than weakening the similarity threshold. It also removed duplicated theory opening text and stopped practical pages from repeating their complete mission checklist inside the professional-workflow section.

### Instructional depth after the final editorial pass

English:

- Minimum instructional article: **505 words**
- Median instructional article: **671 words**
- Maximum instructional article: **1,405 words**

Greek:

- Minimum instructional article: **526 words**
- Median instructional article: **671 words**
- Maximum instructional article: **1,433 words**

The 400-word rule remains only a floor. Passing also requires unique topic content, professional sections, assessability, source/version discipline and a reproducible workflow.

### Required professional structure

Every catalog page includes:

- Learning outcomes
- Topic/module-specific professional context
- A reproducible professional workflow
- Knowledge-check questions
- Completion criteria
- Source and versioning guidance

The shared safety, navigation, assessment and evidence framework is intentionally consistent. Duplicate testing focuses on lesson-specific content so necessary course conventions are not mistaken for copied lessons.

### Bilingual editorial pass

Greek lesson titles were edited to remove awkward mixed-language wording where a natural Greek equivalent exists, while standard technical names/acronyms such as Android, Termux, APK, DNS, TLS, ADB/Fastboot, USB-C, Python and AI are retained when useful.

### Validation

Run from the repository root:

```text
python scripts/audit_academy_lessons.py --root .
```

Current result:

```text
English: 235 pages, 0 duplicate/near-duplicate core pairs >= 0.55
Greek:   235 pages, 0 duplicate/near-duplicate core pairs >= 0.55
Academy lesson quality audit passed with zero issues.
```
