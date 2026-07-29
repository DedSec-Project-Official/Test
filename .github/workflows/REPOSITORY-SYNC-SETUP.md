# Repository synchronization setup

The synchronization workflows run only from `dedsec1121fk/dedsec1121fk.github.io`.

1. Create a fine-grained GitHub personal access token that can access both `sal-scar/ded-sec` and `dedsec1121fk/test`.
2. Give the token **Contents: Read and write** permission on both target repositories.
3. In the main repository, open **Settings → Secrets and variables → Actions**.
4. Add a repository secret named `REPOSITORY_SYNC_TOKEN`.
5. Run each workflow manually once to verify permissions.

Schedules use Europe/Athens time and intentionally run at different hours:

- Main Pages validation/deployment: 04:23 every second calendar day.
- Backup synchronization check: 05:17 daily; actual synchronization every fourth day.
- Test synchronization check: 09:47 daily; actual synchronization every fourth day.

The daily trigger plus four-day gate keeps a continuous four-day interval across month boundaries. Manual runs bypass the gate.

Target rules:

- `sal-scar/ded-sec` keeps only `CNAME = ded-sec.online` and receives no sitemap or `llms*.txt` files.
- `dedsec1121fk/test` receives no CNAME, sitemap or `llms*.txt` files and remains `noindex` when built.
- Target synchronization workflows are removed from mirrored repositories so only the main repository can publish mirrors.
