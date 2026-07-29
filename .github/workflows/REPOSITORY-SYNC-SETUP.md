# Repository synchronization setup

The synchronization workflows run only from `dedsec1121fk/dedsec1121fk.github.io`.

Two separate fine-grained personal access tokens are required because the target repositories have different owners.

## Test repository token

1. While signed in as `dedsec1121fk`, create a fine-grained personal access token.
2. Set **Resource owner** to `dedsec1121fk`.
3. Select only the `test` repository.
4. Grant **Repository permissions → Contents: Read and write**.
5. In `dedsec1121fk/dedsec1121fk.github.io`, open **Settings → Secrets and variables → Actions**.
6. Add a repository secret named `TEST_REPOSITORY_SYNC_TOKEN` containing this token.

## Backup repository token

1. While signed in as the owner of `sal-scar/ded-sec`, create a separate fine-grained personal access token.
2. Set **Resource owner** to `sal-scar`.
3. Select only the `ded-sec` repository.
4. Grant **Repository permissions → Contents: Read and write**.
5. In `dedsec1121fk/dedsec1121fk.github.io`, open **Settings → Secrets and variables → Actions**.
6. Add a repository secret named `BACKUP_REPOSITORY_SYNC_TOKEN` containing this token.

Never place either token in a workflow file, commit, issue, message, or public screenshot.

After both secrets exist, run each workflow manually once from the **Actions** tab.

Schedules use Europe/Athens time and intentionally run at different hours:

- Main Pages validation/deployment: 04:23 every second calendar day.
- Backup synchronization check: 05:17 daily; actual synchronization every fourth day.
- Test synchronization check: 09:47 daily; actual synchronization every fourth day.

The daily trigger plus four-day gate keeps a continuous four-day interval across month boundaries. Manual runs bypass the gate.

Target rules:

- `sal-scar/ded-sec` keeps only `CNAME = ded-sec.online` and receives no sitemap or `llms*.txt` files.
- `dedsec1121fk/test` receives no CNAME, sitemap or `llms*.txt` files and remains `noindex` when built.
- Target synchronization workflows are removed from mirrored repositories so only the main repository can publish mirrors.
