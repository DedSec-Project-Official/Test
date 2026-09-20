# DedSec Smartphone Academy — Android & Termux Edition

A bilingual, local-first academy for Android phone technology, safe app installation, APK verification, app compatibility, privacy, defensive Android security, troubleshooting, hardware, connectivity and Termux practice.

- 235 lessons in English and 235 matching Greek lessons
- 112 theory and reference lessons per language
- 123 practical labs
- 382 estimated hands-on hours
- Android and Termux focused
- No root requirement
- No browser terminal
- Local evidence and progress through `Smartphone-Academy.py`

## Start in Termux

```bash
pkg install python git curl wget nano unzip tar
chmod +x Run-Smartphone-Academy.sh Start-Termux.sh
./Run-Smartphone-Academy.sh status
./Start-Termux.sh
```

The website teaches the method. Android settings and Termux are used for the real practical work on the learner's own device. Use only supplied fictional samples, your own phone, and systems for which you have explicit authorization.

## Verification, scoring and completion

The local companion now verifies practical work before normal completion:

```sh
python Smartphone-Academy.py check <lab-id>
python Smartphone-Academy.py score <lab-id>
python Smartphone-Academy.py assessment
python Smartphone-Academy.py audit
```

Every practical lab uses a 70-point documentation gate. Deterministic labs with registered technical validators can earn 30 additional points and pass at 80/100; judgment-heavy labs become ready for review at 56/70 and require an explicit self, peer or instructor review. See `ASSESSMENT-STANDARD.md`. `complete <lab-id>` runs the relevant check automatically; `--force` is only a local progress override and is not a competence result.

After every catalog item is marked complete and the final assessment set passes, `python Smartphone-Academy.py certificate` creates a **self-managed, non-accredited, locally assessed completion record** under `~/.dedsec-smartphone-academy/`.

