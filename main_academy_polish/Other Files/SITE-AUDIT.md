# DedSec Website Final Integration Audit

## Shared page parity

- Smartphone Academy pages use the same main navigation, theme/language controls, footer links, analytics notice, privacy/contact/store paths, icons, typography, and square-corner visual system as the rest of the DedSec Project website.
- Every button has an explicit non-submit type where appropriate.
- External links that open a new tab include `noopener` and `noreferrer`.
- Every page includes a title, description, viewport, language, canonical URL, robots directive, main navigation, and main footer in the generated deployment.

## Repository-aware deployment

The build script supports exactly these repositories:

- `dedsec1121fk/dedsec1121fk.github.io`
- `sal-scar/ded-sec`
- `dedsec1121fk/test`

It selects the correct domain, URL base, CNAME, sitemap, robots policy, canonical URLs, social URLs, language alternates, manifest paths, and internal links from `GITHUB_REPOSITORY`.

## Automated checks

The workflow builds and validates all three deployment modes. Validation covers HTML structure, local references, language metadata, canonical host, robots policy, Academy footer parity, JSON files, JavaScript syntax, and Python syntax.

Current source audit:

- 622 HTML pages
- 449 Smartphone Academy/public Academy pages
- 29,342 deployment references checked in each target build
- zero broken internal references in main, backup, and test builds
