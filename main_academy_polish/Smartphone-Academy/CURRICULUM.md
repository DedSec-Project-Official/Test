# Practical curriculum — Smartphone Academy

All practical work is completed locally through Android settings and Termux. Passive reading is not included in the hour estimates.

## Workspace Foundations — 15 hours

| Lab | Hours | Deliverable |
|---|---:|---|
| `environment-inventory` — Inventory Android and Termux | 2 | A dated termux-inventory.md with command output and compatibility notes. |
| `safe-workspace` — Create an Isolated Workspace | 2 | A documented folder tree with read-only source copies and a cleanup plan. |
| `analyst-notebook` — Design an Analyst Notebook | 2 | A reusable notebook template plus one completed example entry. |
| `hash-baseline` — Create a File Hash Baseline | 2 | A baseline manifest and a comparison report showing one intentional change. |
| `archive-evidence` — Package Evidence Reliably | 2 | A ZIP or TAR archive, inventory, checksum and successful restore test. |
| `permission-map` — Map Local Permissions | 2 | A permission matrix for the academy workspace and two justified corrections. |
| `package-integrity-baseline` — Build a Termux Package Integrity Baseline | 3 | A package-baseline.md with package-list.txt, repository notes, selected configuration hashes, and a monthly verification checklist. |

## Terminal & Files — 24 hours

| Lab | Hours | Deliverable |
|---|---:|---|
| `path-navigation` — Navigate Without Losing Context | 3 | A command transcript that reaches six targets using absolute and relative paths. |
| `file-discovery` — Find Evidence by Metadata | 3 | A search worksheet with queries, hit counts and false-positive notes. |
| `text-triage` — Triage Large Text Files | 3 | A triage report identifying structure, suspicious lines and data quality issues. |
| `pipeline-builder` — Build Reproducible Pipelines | 3 | Three annotated pipelines that transform raw records into concise summaries. |
| `process-observation` — Observe Local Processes | 3 | A process snapshot comparing idle state with one controlled workload. |
| `backup-recovery` — Test Backup and Recovery | 3 | A recovery record with backup time, restore steps, hash comparison and lessons learned. |
| `shell-session-journal` — Create a Reproducible Shell Session Journal | 3 | A sanitized session-journal.md plus a reviewed commands.sh containing only safe, reproducible commands. |
| `safe-batch-operations` — Design Safe Batch File Operations with Rollback | 3 | A batch-plan.md, before-after.csv, safe-batch.sh, and rollback.sh verified against the supplied files. |

## Network Observation — 24 hours

| Lab | Hours | Deliverable |
|---|---:|---|
| `interface-map` — Map Your Network Interfaces | 3 | A redacted interface diagram with default route and address roles. |
| `dns-observation` — Trace DNS Answers | 3 | A DNS worksheet covering A, AAAA, CNAME, MX and TXT observations. |
| `local-ports` — Audit Listening Ports Locally | 3 | A local exposure table with process, address, port and justified disposition. |
| `http-observation` — Inspect an HTTP Conversation | 3 | An annotated transaction showing method, status, headers, redirects and timing. |
| `packet-reasoning` — Reason from Packet Metadata | 3 | A flow table that reconstructs DNS, TCP and HTTPS sequence from metadata. |
| `network-baseline` — Build a Personal Network Baseline | 3 | A two-period baseline comparing interfaces, listeners, DNS and connection counts. |
| `tls-certificate-audit` — Inspect TLS Certificates from Termux | 3 | A tls-review.md that separates observed certificate facts, validation results, risks, and limitations. |
| `connectivity-change-detection` — Detect Connectivity Changes Without Scanning | 3 | A connectivity-diff.md with normalized snapshots, a change table, and confidence notes for every conclusion. |

## Python Automation — 24 hours

| Lab | Hours | Deliverable |
|---|---:|---|
| `cli-arguments` — Build a Reliable CLI | 3 | A documented CLI with help text, exit codes and six test cases. |
| `file-organizer` — Create a Safe File Organizer | 3 | A dry-run capable organizer plus before-and-after manifests. |
| `log-parser` — Parse Structured Logs | 3 | A parser, cleaned CSV or JSON output and an error summary. |
| `integrity-monitor` — Implement an Integrity Monitor | 3 | A baseline command, check command and report for added, changed and removed files. |
| `header-checker` — Build an HTTP Header Checker | 3 | A checker that reports presence, value and context without declaring a site secure. |
| `report-generator` — Generate an Evidence Report | 3 | A report generator with title, scope, evidence table, limitations and recommendations. |
| `dependency-inventory` — Build a Python Dependency Inventory | 3 | A dependency_inventory.py tool and dependency-report.json with explicit unknown and unused categories. |
| `json-config-validator` — Create a Defensive JSON Configuration Validator | 3 | A config_validator.py program, test-configs folder, and validation-report.md covering valid, invalid, and boundary cases. |

## Web & Secure Coding — 24 hours

| Lab | Hours | Deliverable |
|---|---:|---|
| `request-anatomy` — Reconstruct a Web Request | 3 | An annotated request map and a list of validation responsibilities. |
| `session-model` — Model Cookies and Sessions | 3 | A session lifecycle diagram covering creation, rotation, expiry and logout. |
| `input-validation` — Design Input Validation | 3 | A validation matrix with valid, invalid, boundary and ambiguous examples. |
| `security-headers` — Harden Response Headers | 3 | A before-and-after header table with rationale and compatibility notes. |
| `local-code-review` — Review a Local Web Handler | 3 | A code-review note with evidence, impact, fix and verification for each issue. |
| `threat-model` — Threat-Model a Small Service | 3 | A one-page data-flow diagram and prioritized risk register. |
| `csp-review` — Review a Content Security Policy | 3 | A csp-review.md with directive mapping, likely gaps, compatibility concerns, and a safer proposed policy for the fictional site. |
| `local-form-validation` — Build and Test Local Input Validation | 3 | A validate_form.py program, cases.json, and results.md showing acceptance criteria and rejected inputs. |

## Defensive Monitoring — 21 hours

| Lab | Hours | Deliverable |
|---|---:|---|
| `log-normalization` — Normalize Heterogeneous Logs | 3 | A normalized event file with source provenance and parsing statistics. |
| `failed-login-analysis` — Analyze Failed Logins | 3 | A finding table grouped by account, source, time window and confidence. |
| `ioc-matching` — Match Indicators Carefully | 3 | A match report with normalization rules, context and confidence. |
| `change-triage` — Triage File Changes | 3 | A change register with expected, suspicious and unresolved categories. |
| `incident-timeline` — Construct an Incident Timeline | 3 | A timestamped timeline with source citations, uncertainty and key pivots. |
| `detection-rule` — Write and Test a Detection Rule | 3 | A rule specification, test corpus, expected results and tuning record. |
| `log-retention-alerting` — Design Local Log Retention and Threshold Alerts | 3 | A rotate_and_alert.py program, retention-policy.md, archived samples, and alert-results.json. |

## Identity & Hardening — 15 hours

| Lab | Hours | Deliverable |
|---|---:|---|
| `password-policy` — Evaluate a Password Policy | 3 | A revised policy with rationale, exceptions and rollout checks. |
| `privilege-audit` — Audit Termux Permissions | 3 | A permission matrix with required access, unnecessary access and a remediation decision. |
| `service-exposure` — Review Termux Listener Exposure | 3 | A listener report that states process, port, bind address, purpose and shutdown command. |
| `hardening-plan` — Produce an Android and Termux Hardening Plan | 3 | A 30-day hardening backlog with verification and rollback for every proposed change. |
| `secret-exposure-scan` — Scan a Local Project for Exposed Secrets | 3 | A secret_scan.py tool, findings.json, allowlist.txt, and remediation-notes.md based on the supplied fictional project. |

## Capstone Missions — 18 hours

| Lab | Hours | Deliverable |
|---|---:|---|
| `capstone-baseline` — Capstone: Establish the Baseline | 4 | A baseline pack containing inventory, hashes, services, network state and assumptions. |
| `capstone-incident` — Capstone: Investigate the Incident | 4 | An investigation package with timeline, findings, confidence and containment advice. |
| `capstone-portfolio` — Capstone: Publish the Portfolio | 4 | A bilingual-ready portfolio report, sanitized evidence appendix and personal skills map. |
| `mobile-response-casefile` — Capstone: Build a Mobile Incident Response Casefile | 6 | A complete casefile folder containing scope.md, evidence-register.csv, timeline.csv, findings.md, limitations.md, and an executive-summary.md. |

## App Installation Labs — 18 hours

| Lab | Hours | Deliverable |
|---|---:|---|
| `apk-source-verification` — Verify an APK Release | 3 | A verification report that records source, package, version, hash result and remaining uncertainty. |
| `unknown-source-audit` — Audit Unknown-App Installation Access | 3 | A before/after checklist showing which source may install, why, and when access is removed. |
| `package-identity-inventory` — Build an App Package Inventory | 3 | A CSV inventory with duplicate, unknown-source and stale-version findings. |
| `split-package-planning` — Plan a Split APK Installation | 3 | A package-selection table covering base, ABI, density, language, version and signer consistency. |
| `install-failure-triage` — Triage Android Install Errors | 3 | A decision tree that chooses safe diagnostics before uninstalling or deleting data. |
| `safe-app-removal` — Design a Safe App Removal Plan | 3 | A least-destructive action matrix with backup and recovery notes. |

## Android Security and Privacy Labs — 18 hours

| Lab | Hours | Deliverable |
|---|---:|---|
| `permission-risk-review` — Review App Permission Risk | 3 | A permission decision table classifying required, optional, excessive and special access. |
| `patch-exposure-review` — Review Patch-Level Exposure | 3 | A scoped exposure report that avoids claiming every CVE affects every device. |
| `special-access-audit` — Audit Android Special Access | 3 | A high-impact access register with owner, purpose, necessity and revocation decision. |
| `privacy-timeline-analysis` — Analyze a Privacy Access Timeline | 3 | A timeline that labels expected, unexplained and impossible permission use. |
| `app-provenance-comparison` — Compare App Provenance | 3 | A provenance scorecard with source, signer, update path, transparency and risk. |
| `suspicious-app-casefile` — Build a Suspicious-App Casefile | 3 | A casefile with scope, timeline, containment, evidence, limitations and recovery steps. |

## Diagnostics and Maintenance Labs — 18 hours

| Lab | Hours | Deliverable |
|---|---:|---|
| `storage-usage-analysis` — Analyze Smartphone Storage | 3 | A cleanup plan ranked by recoverable space, data risk and reversibility. |
| `battery-baseline` — Build a Battery-Use Baseline | 3 | A battery baseline with expected ranges, anomalies and one-variable-at-a-time tests. |
| `thermal-performance` — Analyze Thermal Throttling | 3 | A thermal report that separates normal warming, throttling and unsafe conditions. |
| `crash-background-triage` — Triage Crashes and Background Closures | 3 | A cause matrix with evidence, confidence and reversible test steps. |
| `backup-restore-verification` — Verify a Backup and Restore Plan | 3 | A backup coverage map plus verified restore evidence for selected file types. |
| `migration-readiness` — Prepare a Smartphone Migration | 3 | A phased migration runbook covering accounts, authenticators, files, apps, SIM/eSIM and secure disposal. |

## Smartphone Technology Labs — 21 hours

| Lab | Hours | Deliverable |
|---|---:|---|
| `device-spec-profile` — Build a Device Specification Profile | 3 | A structured profile covering model, SoC, memory, storage, display, radios, ports, support and repair factors. |
| `app-compatibility-matrix` — Build an App Compatibility Matrix | 3 | A compatibility matrix with install, feature, performance and support decisions. |
| `charging-compatibility` — Evaluate Charger and Cable Compatibility | 3 | A safe charging matrix with negotiated limits, bottlenecks and unsuitable combinations. |
| `connectivity-profile` — Build a Connectivity Capability Profile | 3 | A capability report that separates hardware support, regional certification and service availability. |
| `smartphone-comparison` — Compare Smartphones for a Workload | 3 | A weighted decision table with transparent assumptions and no single-number winner. |
| `smartphone-technology-capstone` — Capstone: Build a Smartphone Support Casefile | 6 | A complete bilingual-ready casefile with requirements, evidence, diagnosis, actions, verification and maintenance plan. |




## New smartphone skills modules

- 27 Modern Phone Repair
- 28 Useful Smartphone Accessories
- 29 Coding on a Smartphone
- 30 Using AI on Smartphones
- 31 Phone Repair Planning Labs
- 32 Accessory Compatibility Labs
- 33 Mobile Coding Labs
- 34 Smartphone AI Labs


## 35. Custom ROMs and Android System Modding

18 bilingual lessons covering device identity, unlock eligibility, backups, Platform Tools, partitions, verified boot, ROM selection, Pixel, Samsung, Xiaomi/Redmi/POCO, OnePlus, Motorola, Sony Xperia, GSIs, app-service choices, validation and stock restoration.

## 36. Custom ROM Planning Labs

8 non-destructive practical labs, 27 hours total. Learners create a device dossier, eligibility decision, connection report, package integrity review, backup/rollback plan, partition map, flash dry run and post-install validation plan.




## 37. Extended Smartphone Practice

- `smartphone-baseline-assessment` — **Build a Complete Smartphone Security Baseline** (4h): A dated baseline report with evidence, risk priorities and a repeatable recheck procedure.
- `storage-permission-recovery` — **Recover Safely from Storage and Permission Failures** (3h): A troubleshooting decision tree with before-and-after command evidence.
- `package-update-rollback-plan` — **Plan Package Updates and Safe Rollback** (3h): A package update checklist, before-and-after inventory and rollback decision record.
- `dns-resolver-comparison` — **Compare DNS Resolvers and Privacy Trade-offs** (3h): A resolver comparison table with commands, timings, answer differences and limitations.
- `network-change-diff` — **Detect Meaningful Network Configuration Changes** (3h): A normalized diff report with expected, suspicious and unresolved changes.
- `python-log-normalizer` — **Build a Configurable Python Log Normalizer** (3h): A tested Python normalizer, sample output and error-handling notes.
- `python-config-backup` — **Build a Safe Configuration Backup Utility** (3h): A local backup utility with manifest, checksums, restore preview and test report.
- `web-input-output-review` — **Review Web Input Handling and Output Encoding** (3h): A defensive review with test cases, observed output and remediation priorities.
- `offline-asset-audit` — **Audit a Website for Reliable Offline Assets** (3h): An offline-readiness report with a dependency inventory and prioritized fixes.
- `permission-change-journal` — **Create an Android Permission Change Journal** (3h): A before-and-after permission journal with rationale and verification steps.
- `apk-provenance-report` — **Produce an APK Provenance and Integrity Report** (3h): A provenance report with source, package identity, hashes, signer evidence and decision.
- `battery-drain-evidence` — **Investigate Battery Drain with Reproducible Evidence** (3h): A battery investigation report with test conditions, observations and confidence limits.
- `usb-c-data-power-validation` — **Validate USB-C Data, Power and Accessory Modes** (3h): A USB-C capability matrix with tested combinations and clear uncertainty labels.
- `ai-verification-notebook` — **Build an AI Answer Verification Notebook** (3h): A verification notebook containing claims, primary sources, local tests and final corrected conclusions.

**Updated total: 123 practical laboratories and 382 estimated hands-on hours.**
