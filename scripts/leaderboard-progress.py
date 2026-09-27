"""Pull the four Codabench warm-up leaderboards, then refresh the site + exports.

Usage: python3 scripts/leaderboard-progress.py
Writes assets/data/leaderboard.json, splices ranked tables + chart data into
leaderboard.html (between <!-- lb:auto --> markers), and exports
exports/leaderboard/{leaderboard.csv,progress.png,progress.svg}.
Mirrors eeg2025.github.io (get_leaderboard.py + build_leaderboard_html.py), one file.
"""
import csv, html, json, re, urllib.request
from datetime import datetime, timezone
from pathlib import Path
import matplotlib.dates as mdates
import matplotlib.pyplot as plt

TRACKS = [  # (competition id, warm-up phase id, metric label, higher is better, Okabe-Ito color)
    (17974, 30127, "Top-5 accuracy", True, "#0072B2"),
    (17982, 30145, "Balanced accuracy", True, "#009E73"),
    (17983, 30146, "Weighted bMAE (s)", False, "#D55E00"),
    (17984, 30150, "Angular MAE (°)", False, "#CC79A7"),
]
API = "https://www.codabench.org/api/"
OUT = Path("exports/leaderboard")
PAGE = Path("leaderboard.html")
TABLE_ROWS = 10  # ponytail: top 10 on the site, the rest via the Codabench link


def get(path):
    with urllib.request.urlopen(API + path, timeout=30) as r:
        return json.load(r)


def fetch(comp, phase):
    """Official Codabench leaderboard: competition title + primary-metric score per listed entry."""
    title = get(f"competitions/{comp}/")["title"].replace("Neural Interfaces 2026 - ", "")
    subs = get(f"phases/{phase}/get_leaderboard/")["submissions"]
    rows, key, prec = [], None, 2
    for s in subs:  # ponytail: leaderboard already lists one best submission per user
        prim = next(sc for sc in s["scores"] if sc["is_primary"])
        key, prec = prim["column_key"], prim.get("precision", 2)
        rows.append({"team": (s.get("organization") or {}).get("name") or s["owner"],
                     "user": s["owner"], "model": (s.get("fact_sheet_answers") or {}).get("model") or "",
                     "score": float(prim["score"]),
                     "date": datetime.fromisoformat(s["created_when"].rstrip("Z"))})
    return title, key, prec, rows


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
                   edgecolor="white", linewidth=0.8, zorder=2, label="participant best")
        ax.step([r["date"] for r in rec] + [now], [r["score"] for r in rec] + [rec[-1]["score"]],
                where="post", color=color, lw=2.2, zorder=3, label="best so far")
        lead = t["leader"]
        ax.scatter([lead["date"]], [lead["score"]], s=70, color=color, edgecolor="white", zorder=4)
        ax.annotate(f'{lead["team"]}  {lead["score"]:.{t["prec"]}f}', (lead["date"], lead["score"]),
                    xytext=(-10, 0), textcoords="offset points", ha="right", va="center",
                    fontsize=9, fontweight="bold", color=color)
        ax.margins(y=0.15)
        ax.set_title(f'{t["title"]}\n{t["label"]}, {"higher" if higher else "lower"} is better · '
                     f'{len(rows)} teams on the board', loc="left")
        ax.set_ylabel(t["label"])
        ax.xaxis.set_major_locator(mdates.DayLocator(interval=2))
        ax.xaxis.set_major_formatter(mdates.DateFormatter("%b %d"))
        ax.grid(axis="y", color="#e6e6e6", lw=0.6)
    axes.flat[0].legend(frameon=False, loc="upper left")
    fig.suptitle(f"Neural Interfaces 2026 warm-up leaderboards · record progression by day "
                 f"(Codabench, {now:%b %d %Y})", x=0.01, ha="left", fontsize=12, fontweight="bold")
    fig.savefig(OUT / "progress.png", dpi=200)
    fig.savefig(OUT / "progress.svg")


def table_html(i, t):
    e = html.escape
    lead = t["leader"]["score"]
    ranked = ranked_rows(t)
    trs = []
    for rank, r in enumerate(ranked[:TABLE_ROWS], 1):
        delta = abs(r["score"] - lead)
        fmt = lambda v: f"{v:.{t['prec']}f}"
        trs.append(f'<tr><th scope="row">{rank}</th><td>{e(r["team"])}</td><td>{e(r["model"]) or "—"}</td>'
                   f'<td>{fmt(r["score"])}</td><td>{"—" if rank == 1 else fmt(delta)}</td>'
                   f'<td>{r["date"]:%b %d}</td></tr>')
    return (f'<div class="lb-chart" id="lb-chart-{i}" role="img" aria-label="{e(t["title"])} record progression"></div>\n'
            f'      <div class="table-shell" role="region" aria-label="Track {i} leaderboard" tabindex="0">\n'
            f'        <table class="leaderboard-table">\n'
            f'          <caption>Track {i} warm-up leaderboard. Top {min(TABLE_ROWS, len(ranked))} of {len(ranked)} teams, '
            f'best submission per team. <a href="https://www.codabench.org/competitions/{t["comp"]}/#/results-tab" '
            f'target="_blank" rel="noreferrer noopener">Full board on Codabench ↗</a></caption>\n'
            f'          <thead><tr><th scope="col">Rank</th><th scope="col">Team</th><th scope="col">Model</th>'
            f'<th scope="col">{e(t["label"])}</th><th scope="col">Gap to leader</th><th scope="col">Submitted</th></tr></thead>\n'
            f'          <tbody>{"".join(trs)}</tbody>\n        </table>\n      </div>')


def splice(page, marker, body):
    """Replace <!-- lb:auto:X -->…<!-- /lb:auto:X --> with body (markers must exist)."""
    pat = re.compile(rf"(<!-- lb:auto:{marker} -->).*?(<!-- /lb:auto:{marker} -->)", re.S)
    assert pat.search(page), f"marker {marker} missing in {PAGE}"
    return pat.sub(lambda m: f"{m.group(1)}{body}{m.group(2)}", page)


def update_page(tracks, now):
    page = PAGE.read_text()
    stamp = f"{now:%b %d, %Y %H:%M} UTC"
    n = sum(len(t["rows"]) for t in tracks)
    page = splice(page, "hero", f"Warm-up phase, live. {n} teams across four tracks, best submission per team. "
                  f"Refreshed daily from Codabench, last {stamp}. Final positions are gated by reproducibility audit.")
    for i, t in enumerate(tracks, 1):
        page = splice(page, f"t{i}", table_html(i, t))
        page = splice(page, f"foot{i}", f"{len(t['rows'])} teams · leader {html.escape(t['leader']['team'])} "
                      f"at {t['leader']['score']:.{t['prec']}f} · updated {stamp}")
    data = {"updated": now.isoformat(timespec="minutes"), "tracks": [
        {k: t[k] for k in ("id", "title", "label", "higher", "color")}
        | {"leader": {**t["leader"], "date": t["leader"]["date"].isoformat(timespec="minutes")},
           "rows": [{**r, "date": r["date"].isoformat(timespec="minutes")} for r in t["rows"]],
           "record": [{**r, "date": r["date"].isoformat(timespec="minutes")} for r in t["record"]]}
        for t in tracks]}
    page = splice(page, "data", f'<script id="lb-data" type="application/json">{json.dumps(data)}</script>')
    PAGE.write_text(page)
    Path("assets/data/leaderboard.json").write_text(json.dumps(data, indent=1))


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    tracks = []
    for i, (comp, phase, label, higher, color) in enumerate(TRACKS, 1):
        title, key, prec, rows = fetch(comp, phase)
        tracks.append({"id": i, "comp": comp, "title": title, "metric": key, "prec": prec, "label": label, "higher": higher,
                       "color": color, "rows": rows, "record": record_curve(rows, higher)})
        tracks[-1]["leader"] = ranked_rows(tracks[-1])[0]
    plot(tracks, now)
    update_page(tracks, now)
    with open(OUT / "leaderboard.csv", "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["track", "metric", "team", "user", "model", "score", "date"])
        w.writeheader()
        w.writerows({"track": t["title"], "metric": t["metric"], **r} for t in tracks for r in t["rows"])
    print(f"{sum(len(t['rows']) for t in tracks)} rows → {PAGE}, assets/data/leaderboard.json, {OUT}/")


if __name__ == "__main__":
    main()
