"""Pull the four Codabench warm-up leaderboards, then refresh the site + exports.

Usage: python3 scripts/leaderboard-progress.py
Writes assets/data/leaderboard.json, splices ranked tables + chart data into
leaderboard.html (between <!-- lb:auto --> markers), and exports
exports/leaderboard/{leaderboard.csv,progress.png,progress.svg}.
Mirrors eeg2025.github.io (get_leaderboard.py + build_leaderboard_html.py), one file.
"""
import csv, html, json, math, re, time, urllib.error, urllib.request
from datetime import datetime, timezone
from pathlib import Path
import matplotlib.dates as mdates
import matplotlib.pyplot as plt

PHASES = {
    "current": {
        "name": "Warm-up Phase (update 1)",
        "tracks": [
            (17974, 30962, "top5_acc_subject_agg", "Top-5 subject-aggregated", True, "#0072B2"),
            (17982, 30961, "balanced_accuracy_cell_mean", "Cell-mean balanced accuracy", True, "#009E73"),
            (17983, 30960, "wbmae_recording_mean", "Recording-mean W-bMAE (s)", False, "#D55E00"),
            (17984, 30965, "angular_mae", "Angular MAE (°)", False, "#CC79A7"),
        ],
    },
    "legacy": {
        "name": "Legacy warm-up phase",
        "tracks": [
            (17974, 30127, "top5_acc", "Top-5 accuracy", True, "#0072B2"),
            (17982, 30145, "balanced_accuracy", "Balanced accuracy", True, "#009E73"),
            (17983, 30146, "bmae", "bMAE (s)", False, "#D55E00"),
            (17984, 30150, "angular_mae", "Angular MAE (°)", False, "#CC79A7"),
        ],
    },
}
API = "https://www.codabench.org/api/"
OUT = Path("exports/leaderboard")
PAGE = Path("leaderboard.html")
TABLE_ROWS = 10  # ponytail: top 10 on the site, the rest via the Codabench link


def get(path):
    request = urllib.request.Request(
        API + path,
        headers={"User-Agent": "NeuralInterfaces2026Leaderboard/1.0"},
    )
    for attempt, delay in enumerate((0, 1, 2, 4)):
        if delay:
            time.sleep(delay)
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                return json.load(response)
        except urllib.error.HTTPError as error:
            if attempt == 3 or error.code not in {500, 502, 503, 504}:
                raise


def fetch(comp, phase, metric_key):
    """Official Codabench counts and primary score for each published leaderboard entry."""
    competition = get(f"competitions/{comp}/")
    title = competition["title"].replace("Neural Interfaces 2026 - ", "")
    participants = competition["participants_count"]
    payload = get(f"phases/{phase}/get_leaderboard/?page_size=all")
    subs = payload["submissions"]
    if len(subs) != payload["count"]:
        raise RuntimeError(
            f"Codabench returned {len(subs)} of {payload['count']} leaderboard entries "
            f"for phase {phase}"
        )
    rows, prec = [], 2
    for s in subs:
        # Once a competition's score columns are updated, Codabench can clear
        # ``is_primary`` on scores from an older phase. Select the intended
        # phase metric explicitly so the legacy view remains reproducible.
        prim = next((sc for sc in s["scores"] if sc["column_key"] == metric_key), None)
        if not prim:
            continue
        prec = prim.get("precision", 2)
        try:
            score = float(prim["score"])
        except (TypeError, ValueError):
            continue
        if not math.isfinite(score):
            continue
        rows.append({"team": (s.get("organization") or {}).get("name") or s["owner"],
                     "user": s["owner"], "model": (s.get("fact_sheet_answers") or {}).get("model") or "",
                     "score": score,
                     "date": datetime.fromisoformat(s["created_when"].rstrip("Z"))})
    return title, metric_key, prec, participants, rows


def record_curve(rows, higher):
    best, out = None, []
    for r in sorted(rows, key=lambda r: r["date"]):
        if best is None or (r["score"] > best if higher else r["score"] < best):
            best = r["score"]
            out.append({"date": r["date"], "score": best, "team": r["team"]})
    return out


def ranked_rows(t):
    # stable sort keeps Codabench's own order for ties, so ranked[0] is the official leader
    return sorted(t["rows"], key=lambda r: -r["score"] if t["higher"] else r["score"])


def plot(tracks, now):
    plt.rcParams.update({"font.family": "sans-serif", "font.sans-serif": ["Arial", "Helvetica", "DejaVu Sans"], "font.size": 9, "axes.spines.top": False,
                         "axes.spines.right": False, "axes.titleweight": "bold", "axes.titlesize": 10})
    fig, axes = plt.subplots(2, 2, figsize=(11, 7), constrained_layout=True)
    for ax, t in zip(axes.flat, tracks):
        rows, rec, higher, color = t["rows"], t["record"], t["higher"], t["color"]
        ax.scatter([r["date"] for r in rows], [r["score"] for r in rows], s=28, color="#9a9a9a",
                   edgecolor="white", linewidth=0.8, zorder=2, label="published entry")
        ax.step([r["date"] for r in rec] + [now], [r["score"] for r in rec] + [rec[-1]["score"]],
                where="post", color=color, lw=2.2, zorder=3, label="best so far")
        lead = t["leader"]
        ax.scatter([lead["date"]], [lead["score"]], s=70, color=color, edgecolor="white", zorder=4)
        ax.annotate(f'{lead["team"]}  {lead["score"]:.{t["prec"]}f}', (lead["date"], lead["score"]),
                    xytext=(-10, 0), textcoords="offset points", ha="right", va="center",
                    fontsize=9, fontweight="bold", color=color)
        ax.margins(y=0.15)
        ax.set_title(f'{t["title"]}\n{t["label"]}, {"higher" if higher else "lower"} is better · '
                     f'{len(rows)} ranked entries on the board', loc="left")
        ax.set_ylabel(t["label"])
        ax.xaxis.set_major_locator(mdates.DayLocator(interval=2))
        ax.xaxis.set_major_formatter(mdates.DateFormatter("%b %d"))
        ax.grid(axis="y", color="#e6e6e6", lw=0.6)
    axes.flat[0].legend(frameon=False, loc="upper left")
    fig.suptitle(f"Neural Interfaces 2026 warm-up leaderboards · record progression by day "
                 f"(Codabench, {now:%b %d %Y})", x=0.01, ha="left", fontsize=12, fontweight="bold")
    fig.savefig(OUT / "progress.png", dpi=200)
    svg_path = OUT / "progress.svg"
    fig.savefig(svg_path)
    # Matplotlib emits trailing spaces in SVG path data. Normalize the
    # generated artifact so repository whitespace checks remain meaningful.
    svg_path.write_text(
        "\n".join(line.rstrip() for line in svg_path.read_text().splitlines()) + "\n"
    )


def table_html(i, t, phase_name):
    e = html.escape
    lead = t["leader"]["score"]
    ranked = ranked_rows(t)
    trs = []
    for rank, r in enumerate(ranked[:TABLE_ROWS], 1):
        delta = abs(r["score"] - lead)
        fmt = lambda v: f"{v:.{t['prec']}f}"
        trs.append(f'<tr><th scope="row">{rank}</th><td>{e(r["team"])}</td><td>{e(r["model"]) or "Not provided"}</td>'
                   f'<td>{fmt(r["score"])}</td><td>{"Leader" if rank == 1 else fmt(delta)}</td>'
                   f'<td>{r["date"]:%b %d}</td></tr>')
    return (f'<div class="lb-chart" id="lb-chart-{i}" role="img" aria-label="{e(t["title"])} record progression"></div>\n'
            f'      <div class="table-shell" id="lb-table-shell-{i}" role="region" aria-label="Track {i} leaderboard" tabindex="0">\n'
            f'        <table class="leaderboard-table">\n'
            f'          <caption>Track {i} · {e(phase_name)}. Top {min(TABLE_ROWS, len(ranked))} of {len(ranked)} ranked entries. '
            f'Each row is a submission currently published on Codabench. Registered participants without a published scored entry are not ranked. '
            f'<a href="https://www.codabench.org/competitions/{t["comp"]}/#/results-tab" '
            f'target="_blank" rel="noreferrer noopener">Full board on Codabench ↗</a></caption>\n'
            f'          <thead><tr><th scope="col">Rank</th><th scope="col">Participant / organization</th><th scope="col">Model</th>'
            f'<th scope="col">{e(t["label"])}</th><th scope="col">Gap to leader</th><th scope="col">Submitted</th></tr></thead>\n'
            f'          <tbody>{"".join(trs)}</tbody>\n        </table>\n      </div>')


def splice(page, marker, body):
    """Replace <!-- lb:auto:X -->…<!-- /lb:auto:X --> with body (markers must exist)."""
    pat = re.compile(rf"(<!-- lb:auto:{marker} -->).*?(<!-- /lb:auto:{marker} -->)", re.S)
    assert pat.search(page), f"marker {marker} missing in {PAGE}"
    return pat.sub(lambda m: f"{m.group(1)}{body}{m.group(2)}", page)


def serialized_track(t):
    return {k: t[k] for k in (
        "id", "comp", "phase", "title", "metric", "label", "higher", "color",
        "participants", "prec",
    )} | {
        "leader": {**t["leader"], "date": t["leader"]["date"].isoformat(timespec="minutes")},
        "rows": [{**r, "date": r["date"].isoformat(timespec="minutes")} for r in t["rows"]],
        "record": [{**r, "date": r["date"].isoformat(timespec="minutes")} for r in t["record"]],
    }


def update_page(phases, now):
    page = PAGE.read_text()
    stamp = f"{now:%b %d, %Y %H:%M} UTC"
    tracks = phases["current"]["tracks"]
    n = sum(len(t["rows"]) for t in tracks)
    registrations = ", ".join(str(t["participants"]) for t in tracks)
    page = splice(page, "hero", f"Warm-up Phase (update 1), live. {n} published scored entries across four track leaderboards. "
                  f"Codabench reports {registrations} registered participants for Tracks 1-4 respectively. "
                  f"Registration totals are per track, so one person may appear in several totals. Refreshed daily, last {stamp}. Final positions are gated by "
                  f"reproducibility audit.")
    for i, t in enumerate(tracks, 1):
        page = splice(page, f"t{i}", table_html(i, t, phases["current"]["name"]))
        page = splice(page, f"foot{i}", f"{len(t['rows'])} ranked entries · {t['participants']} registered participants · "
                      f"leader {html.escape(t['leader']['team'])} "
                      f"at {t['leader']['score']:.{t['prec']}f} · updated {stamp}")
    serialized_phases = {
        key: {"name": value["name"], "tracks": [serialized_track(t) for t in value["tracks"]]}
        for key, value in phases.items()
    }
    data = {
        "updated": now.isoformat(timespec="minutes"),
        "default_phase": "current",
        "phases": serialized_phases,
        # Backward-compatible alias for consumers that only need the live board.
        "tracks": serialized_phases["current"]["tracks"],
    }
    page = splice(page, "data", f'<script id="lb-data" type="application/json">{json.dumps(data)}</script>')
    PAGE.write_text(page)
    Path("assets/data/leaderboard.json").write_text(json.dumps(data, indent=1))


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    phases = {}
    for phase_key, definition in PHASES.items():
        tracks = []
        for i, (comp, phase, metric_key, label, higher, color) in enumerate(definition["tracks"], 1):
            title, key, prec, participants, rows = fetch(comp, phase, metric_key)
            if not rows:
                raise RuntimeError(f"No numeric primary scores for phase {phase}")
            tracks.append({"id": i, "comp": comp, "phase": phase, "title": title,
                           "metric": key, "prec": prec, "participants": participants,
                           "label": label, "higher": higher, "color": color, "rows": rows,
                           "record": record_curve(rows, higher)})
            tracks[-1]["leader"] = ranked_rows(tracks[-1])[0]
        phases[phase_key] = {"name": definition["name"], "tracks": tracks}
    tracks = phases["current"]["tracks"]
    plot(tracks, now)
    update_page(phases, now)
    with open(OUT / "leaderboard.csv", "w", newline="") as f:
        w = csv.DictWriter(
            f,
            fieldnames=["phase", "track", "metric", "team", "user", "model", "score", "date"],
            lineterminator="\n",
        )
        w.writeheader()
        w.writerows(
            {"phase": phase["name"], "track": t["title"], "metric": t["metric"], **r}
            for phase in phases.values() for t in phase["tracks"] for r in t["rows"]
        )
    counts = ", ".join(
        f"{key}={sum(len(t['rows']) for t in value['tracks'])}"
        for key, value in phases.items()
    )
    print(f"{counts} rows → {PAGE}, assets/data/leaderboard.json, {OUT}/")


if __name__ == "__main__":
    main()
