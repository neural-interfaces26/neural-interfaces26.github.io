# Neural Interfaces 2026 website

This repository contains the static website for Neural Interfaces 2026. The site is made of HTML, CSS, JavaScript, and image files; it does not require Jekyll or another build system.

## Preview changes locally

You only need Git and Python 3.

1. From the repository root, start the local server:

   ```bash
   bash scripts/serve.sh
   ```

2. Open [http://localhost:8080](http://localhost:8080) in your browser.

3. Edit the source files and refresh the browser to see the result. The server does not need to be restarted after ordinary HTML, CSS, JavaScript, or image changes.

4. Stop the server with <kbd>Ctrl</kbd>+<kbd>C</kbd>.

To use a different port, pass it to the script, for example:

```bash
bash scripts/serve.sh 4000
```

Then open [http://localhost:4000](http://localhost:4000).

## Check a commit before publishing

For calendar edits, check the website and the sibling `2026-competition`
phase templates together, without contacting Codabench:

```bash
python3 scripts/calendar-check.py
```

Use `--competition-repo /path/to/2026-competition` for another checkout.

## Refresh the website leaderboard

Run `python3 scripts/leaderboard-progress.py` from the repository root. The
updater retries transient HTTP and non-JSON responses and fetches every phase
before replacing the saved results. An unsuccessful fetch leaves the previous
leaderboard snapshot in place. Run the offline fetch regression checks with
`python3 scripts/leaderboard-check.py`.

If authentication is needed, supply `CODABENCH_TOKEN` through the environment
or the repository Actions secret of the same name. Use a dedicated ordinary
Codabench account without organizer privileges. Do not reuse the production
organizer or watchdog token. The workflow contains only a secret reference.
Never put the value in a tracked file or browser-side JavaScript. The secret
is available only to the server-side updater step.

Pushing `main` to GitHub can publish the site, so preview the exact committed version before pushing:

```bash
# Commit the changes you want to publish.
git add <files>
git commit -m "Describe the website update"

# Update the remote reference, then inspect what the push will contain.
git fetch origin
git status --short
git log --oneline origin/main..HEAD
git diff --stat origin/main..HEAD
git diff origin/main..HEAD

# Preview the committed files.
bash scripts/serve.sh
```

`git status --short` should print nothing. A clean working tree means the local preview matches the committed `HEAD`, without extra uncommitted edits mixed in. Review the pages at [http://localhost:8080](http://localhost:8080), including desktop and mobile browser widths.

When everything looks correct, stop the server and publish:

```bash
git push origin main
```

