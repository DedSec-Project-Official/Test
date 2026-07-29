# Repository-aware deployment

The same source tree supports all three official website repositories. The GitHub Pages workflow reads `GITHUB_REPOSITORY`, builds a clean `_site` artifact, validates it, and deploys it.

| Repository | Public address | Base path | Generated files |
|---|---|---|---|
| `dedsec1121fk/dedsec1121fk.github.io` | `https://ded-sec.space` | `/` | `CNAME = ded-sec.space`, sitemap and `llms*.txt` |
| `sal-scar/ded-sec` | `https://ded-sec.online` | `/` | `CNAME = ded-sec.online`; no sitemap or `llms*.txt` |
| `dedsec1121fk/test` | `https://dedsec1121fk.github.io/test/` | `/test/` | no CNAME, sitemap or `llms*.txt`; noindex robots |

The Pages workflow runs after every push to `main`, can be started manually, and is scheduled every second calendar day at 04:23 Europe/Athens time. GitHub may delay scheduled runs during periods of high Actions load.

The build fails intentionally in an unknown repository so an accidental deployment cannot silently publish broken paths.

## Academy language paths

The Smartphone Academy uses separate top-level language trees:

- English: `/Smartphone-Academy/Pages/...`
- Greek: `/el/Smartphone-Academy/Pages/...`

There is no redundant `/en/` directory in the English route.

## Local validation

Run these commands from the repository root:

```bash
python3 -m pip install beautifulsoup4
python3 scripts/build_for_repository.py \
  --repository dedsec1121fk/test \
  --output _site
python3 scripts/validate_site.py \
  --root _site \
  --repository dedsec1121fk/test
```
