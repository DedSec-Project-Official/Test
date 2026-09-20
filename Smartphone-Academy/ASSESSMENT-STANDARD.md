# Smartphone Academy — Assessment & Completion Standard

The Academy separates **documentation readiness** from **technical correctness**. An automated local tool must not award a competence claim merely because a learner checked boxes or wrote long notes. The Academy remains self-directed and non-accredited.

## English

### Documentation gate — 70 points

Every prepared practical workspace is checked for:

- **15 points — workspace integrity:** required Academy files exist and the original `source/` samples still match `source-sha256.txt`.
- **15 points — task tracking:** every generated checklist item in `README.md` is marked complete.
- **20 points — evidence quality:** Scope, a real date, Device, Result, Verification and Limitations are filled with distinct, substantive content. Repeated boilerplate does not pass.
- **20 points — analyst notes:** Observations, Assumptions, Commands/results and Limitations are distinct and substantive.

A review-mode lab is **ready for technical review** at **56/70**. This is not a technical pass. The reviewer can be the learner, a peer or an instructor, but the review must be explicit in `review.md` and acknowledged with `--reviewed`.

### Lab-specific automatic validation — 30 points

Only labs with deterministic supplied data and inspectable outputs receive an automatic technical score. These validators inspect expected artifacts/results rather than prose length. The automatically validated set is:

1. `hash-baseline`
2. `package-integrity-baseline`
3. `json-config-validator`
4. `python-log-normalizer`
5. `capstone-incident`
6. `mobile-response-casefile`

These labs pass at **80/100 or higher**, and the technical validator itself must succeed.

Examples of what the validators check include source hashes and changed-copy hashes, required package/repository evidence, syntactically valid validator code plus boundary-test artifacts, parseable JSON Lines plus rejected records, synthetic incident events in a timeline, evidence-register hashes, and explicit fact/inference/question separation.

### Final assessment set

The six automatically validated labs above form the final local assessment set. Run:

```sh
python Smartphone-Academy.py assessment
```

This design deliberately excludes judgment-heavy labs from automatic competence scoring. Repair plans, device-specific compatibility work, AI evaluations and similar tasks require human judgment.

### Completing review-mode labs

Run the normal check first:

```sh
python Smartphone-Academy.py check LAB_ID
```

If Labkit reports `READY FOR REVIEW`, complete `review.md`, perform a genuine self/peer/instructor review, then acknowledge it:

```sh
python Smartphone-Academy.py complete LAB_ID --reviewed
```

`--force` exists only as a local progress override. It is not evidence that a lab is correct.

### Local completion record

After all catalog items are marked complete and the final automatic assessment set passes, the learner may generate:

```sh
python Smartphone-Academy.py certificate
```

The output is explicitly labelled **self-managed, non-accredited, locally assessed**. It is a portfolio record, not an industry certification and not independent verification of professional competence.

## Ελληνικά

### Έλεγχος τεκμηρίωσης — 70 βαθμοί

Κάθε πρακτικό workspace ελέγχεται για:

- **15 βαθμούς — ακεραιότητα:** υπάρχουν τα απαιτούμενα αρχεία και τα αρχικά `source/` samples συμφωνούν με το `source-sha256.txt`.
- **15 βαθμούς — παρακολούθηση εργασιών:** όλα τα checklist items στο `README.md` έχουν ολοκληρωθεί.
- **20 βαθμούς — ποιότητα τεκμηρίων:** Scope, πραγματική ημερομηνία, Device, Result, Verification και Limitations έχουν διακριτό και ουσιαστικό περιεχόμενο. Επαναλαμβανόμενο boilerplate δεν περνά.
- **20 βαθμούς — σημειώσεις αναλυτή:** Observations, Assumptions, Commands/results και Limitations είναι διακριτά και ουσιαστικά.

Ένα review-mode lab είναι **έτοιμο για τεχνικό έλεγχο** στα **56/70**. Αυτό δεν είναι τεχνικό pass. Ο reviewer μπορεί να είναι ο ίδιος ο learner, peer ή instructor, αλλά ο έλεγχος πρέπει να καταγράφεται στο `review.md` και να δηλώνεται με `--reviewed`.

### Αυτόματη τεχνική επαλήθευση — 30 βαθμοί

Μόνο εργαστήρια με ντετερμινιστικά παρεχόμενα δεδομένα και ελέγξιμα outputs παίρνουν αυτόματη τεχνική βαθμολογία. Τα έξι labs του αγγλικού καταλόγου παραπάνω αποτελούν και το τελικό assessment set. Πρέπει να περάσουν με **80/100 ή περισσότερο** και να περάσει ο ειδικός technical validator.

Τα labs που απαιτούν κρίση — για παράδειγμα σχέδια επισκευής, device-specific συμβατότητα ή αξιολόγηση AI — παραμένουν review-mode, ώστε το Academy να μην παρουσιάζει το μήκος κειμένου ως απόδειξη ορθότητας.

### Τοπικό αρχείο ολοκλήρωσης

Το `certificate` δημιουργεί μόνο ένα **self-managed, non-accredited, locally assessed** portfolio record. Δεν αποτελεί επίσημη επαγγελματική πιστοποίηση ούτε ανεξάρτητη επιβεβαίωση επαγγελματικής επάρκειας.
