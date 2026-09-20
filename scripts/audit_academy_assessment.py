#!/usr/bin/env python3
"""Release-gate audit for Smartphone Academy practical assessment metadata/tooling."""
from __future__ import annotations

import argparse
import importlib.util
import io
import json
import tempfile
from contextlib import redirect_stdout
from pathlib import Path


def load_module(path: Path, name: str):
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=".")
    args = ap.parse_args()

    root = Path(args.root).resolve()
    academy = root / "Smartphone-Academy"
    practice = academy / "Practice"
    issues: list[str] = []

    catalog_data = json.loads((practice / "Catalog.json").read_text(encoding="utf-8"))
    labs = catalog_data.get("labs", [])
    ids = [x.get("id") for x in labs]
    if len(labs) != 123:
        issues.append(f"practical catalog count is {len(labs)}, expected 123")
    if len(ids) != len(set(ids)):
        issues.append("duplicate practical lab IDs")

    total_hours = 0
    for lab in labs:
        lab_id = lab.get("id", "<missing-id>")
        hours = lab.get("hours")
        if not isinstance(hours, (int, float)) or hours <= 0:
            issues.append(f"{lab_id}: invalid hours {hours!r}")
        else:
            total_hours += hours
        for lang in ("en", "el"):
            block = lab.get(lang) or {}
            if not str(block.get("title", "")).strip():
                issues.append(f"{lab_id}: missing {lang} title")
            if not str(block.get("summary", "")).strip():
                issues.append(f"{lab_id}: missing {lang} summary")
            if not str(block.get("deliverable", "")).strip():
                issues.append(f"{lab_id}: missing {lang} deliverable")
            tasks = block.get("tasks") or []
            if not isinstance(tasks, list) or len(tasks) < 2 or any(not str(x).strip() for x in tasks):
                issues.append(f"{lab_id}: insufficient {lang} task list")

    if total_hours != 382:
        issues.append(f"practical hours total is {total_hours}, expected 382")

    rubrics = json.loads((practice / "Rubrics.json").read_text(encoding="utf-8"))
    if rubrics.get("version") != 2:
        issues.append(f"Rubrics.json version is {rubrics.get('version')!r}, expected 2")
    expected_thresholds = {
        "automatic_pass_score": 80,
        "review_readiness_score": 56,
        "documentation_max": 70,
        "automatic_validation_points": 30,
    }
    for key, expected in expected_thresholds.items():
        if rubrics.get(key) != expected:
            issues.append(f"{key} is {rubrics.get(key)!r}, expected {expected}")

    auto_ids = rubrics.get("automatic_validation_labs") or []
    final_ids = rubrics.get("final_assessment_labs") or []
    if len(auto_ids) != 6 or len(set(auto_ids)) != 6:
        issues.append("automatic validation set must contain six unique labs")
    if final_ids != auto_ids:
        issues.append("final assessment set must match the six automatically validated labs")
    unknown = sorted((set(auto_ids) | set(final_ids)) - set(ids))
    if unknown:
        issues.append(f"assessment references unknown labs: {unknown}")

    labkit = load_module(practice / "Labkit.py", "academy_labkit_audit")
    registered = set(getattr(labkit, "AUTO_VALIDATORS", {}))
    if registered != set(auto_ids):
        issues.append(
            "Labkit automatic validator registry differs from Rubrics.json: "
            f"registered={sorted(registered)}, rubric={sorted(auto_ids)}"
        )

    # Every untouched prepared workspace must fail or require work; preparation alone
    # must never be interpreted as competence/completion.
    with tempfile.TemporaryDirectory(prefix="academy-assessment-audit-") as tmp:
        base = Path(tmp)
        for lab in labs:
            lab_id = lab["id"]
            with redirect_stdout(io.StringIO()):
                labkit.prepare(lab_id, base, "en", False)
            score, _details = labkit.score_workspace(lab_id, base)
            mode = labkit.validation_mode(lab_id)
            threshold = 80 if mode == "automatic" else 56
            if score >= threshold:
                issues.append(
                    f"{lab_id}: untouched prepared workspace scores {score}, "
                    f"unexpectedly meeting {mode} threshold {threshold}"
                )

    summary = {
        "practical_labs": len(labs),
        "practical_hours": total_hours,
        "automatic_validation_labs": len(auto_ids),
        "review_mode_labs": len(labs) - len(auto_ids),
        "automatic_pass_score": rubrics.get("automatic_pass_score"),
        "review_readiness_score": rubrics.get("review_readiness_score"),
        "documentation_max": rubrics.get("documentation_max"),
        "automatic_validation_points": rubrics.get("automatic_validation_points"),
    }
    print(json.dumps(summary, indent=2))

    if issues:
        print("\nASSESSMENT AUDIT FAILED")
        for issue in issues:
            print("ERROR:", issue)
        print("Total issues:", len(issues))
        return 1

    print("\nAcademy assessment audit passed with zero issues.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
