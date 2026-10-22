#!/usr/bin/env python3
"""Check the CET calendar and sealed policy across both repos.

Run from any directory: python3 scripts/calendar-check.py
Optionally select another checkout with --competition-repo /path/to/repo.
Only the standard library is required; no remote services are contacted.
"""

import argparse
from datetime import datetime, timedelta, timezone
from html.parser import HTMLParser
from pathlib import Path
import re
import unittest
from zoneinfo import ZoneInfo


ROOT = Path(__file__).resolve().parents[1]
COMPETITION = ROOT.parent / "2026-competition"
UTC = timezone.utc
PARIS = ZoneInfo("Europe/Paris")
WARMUP_END = datetime(2026, 11, 1, 23, 59, 59, tzinfo=PARIS)
TRANSITION_START = datetime(2026, 11, 2, 0, 1, tzinfo=PARIS)
TRANSITION_END = datetime(2026, 11, 4, 23, 59, 59, tzinfo=PARIS)
FINAL_START = datetime(2026, 11, 5, 0, 1, tzinfo=PARIS)
FINAL_END = datetime(2026, 11, 21, 23, 59, 59, tzinfo=PARIS)


class TimelineParser(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.timeline = None
        self.banner = None
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "data-timeline-progress" in attrs:
            self.timeline = attrs
        if "launch-alert-warmup" in attrs.get("class", "").split():
            self.banner = attrs


def phase_fields(source):
    """Read scalar schedule/limit fields in the repository's phase blocks.

    This is deliberately not a general-purpose YAML parser. The block layout
    is asserted so a future format change fails visibly instead of silently
    passing a date check against an unrelated field.
    """
    section = re.search(r"(?ms)^phases:\s*\n(.*?)^leaderboards:", source)
    if not section:
        raise AssertionError("Missing phases/leaderboards section")
    phases = []
    for block in re.split(r"(?m)^  - index:", section[1])[1:]:
        fields = dict(re.findall(r"(?m)^    ([a-z_]+): ([^\n]+)$", block))
        if not {"name", "start", "end"}.issubset(fields):
            raise AssertionError("Unexpected phase field layout")
        phases.append(fields)
    if len(phases) != 2:
        raise AssertionError("Creation templates should retain their two phases")
    return phases


class CalendarChecks(unittest.TestCase):
    def setUp(self):
        self.home = (ROOT / "index.html").read_text()
        self.parsed = TimelineParser(self.home)

    def test_home_timestamps_match_the_announced_schedule(self):
        self.assertIsNotNone(self.parsed.timeline)
        for key, expected in (
            ("data-warmup-end", WARMUP_END),
            ("data-final-start", FINAL_START),
            ("data-final-end", FINAL_END),
        ):
            actual = datetime.fromisoformat(
                self.parsed.timeline[key].replace("Z", "+00:00")
            )
            self.assertEqual(actual, expected, key)
            self.assertEqual(actual.utcoffset(), expected.utcoffset(), key)

    def test_green_banner_announces_the_extension(self):
        self.assertIsNotNone(self.parsed.banner)
        self.assertIn("is-open", self.parsed.banner["class"].split())
        self.assertIn("Warm-up extended · November 1", self.home)
        self.assertIn("Sunday, November 1 at 23:59", self.parsed.banner["aria-label"])
        self.assertIn("Thursday, November 5 at 00:01", self.parsed.banner["aria-label"])
        self.assertIn("CET (UTC+01:00)", self.parsed.banner["aria-label"])

    def test_transition_includes_the_entire_outage_day(self):
        self.assertEqual(WARMUP_END.astimezone(UTC), datetime(2026, 11, 1, 22, 59, 59, tzinfo=UTC))
        self.assertEqual(TRANSITION_START.astimezone(UTC), datetime(2026, 11, 1, 23, 1, tzinfo=UTC))
        self.assertEqual(TRANSITION_END.astimezone(UTC), datetime(2026, 11, 4, 22, 59, 59, tzinfo=UTC))
        self.assertEqual(FINAL_START.astimezone(UTC), datetime(2026, 11, 4, 23, 1, tzinfo=UTC))
        self.assertLess(TRANSITION_START, datetime(2026, 11, 3, tzinfo=PARIS))
        self.assertGreaterEqual(TRANSITION_END, datetime(2026, 11, 4, tzinfo=PARIS))
        self.assertGreater(FINAL_START, TRANSITION_END)

    def test_paris_daylight_saving_is_not_a_fixed_summer_offset(self):
        self.assertEqual(datetime(2026, 10, 24, 12, tzinfo=PARIS).utcoffset(), timedelta(hours=2))
        self.assertEqual(datetime(2026, 10, 25, 12, tzinfo=PARIS).utcoffset(), timedelta(hours=1))
        for moment in (WARMUP_END, TRANSITION_START, TRANSITION_END, FINAL_START, FINAL_END):
            self.assertEqual(moment.utcoffset(), timedelta(hours=1))

    def test_final_keeps_the_published_deadline_and_seventeen_calendar_days(self):
        final_end_utc = FINAL_END.astimezone(UTC)
        self.assertEqual(final_end_utc.isoformat(), "2026-11-21T22:59:59+00:00")
        self.assertEqual(
            FINAL_END + timedelta(seconds=1) - FINAL_START,
            timedelta(days=17, minutes=-1),
        )

    def test_weekdays_and_pause_labels_match_the_requested_dates(self):
        self.assertEqual(WARMUP_END.weekday(), 6)  # Sunday
        self.assertEqual(TRANSITION_START.weekday(), 0)  # Monday
        self.assertEqual(TRANSITION_END.weekday(), 2)  # Wednesday
        self.assertEqual(FINAL_START.weekday(), 3)  # Thursday
        self.assertEqual(FINAL_END.weekday(), 5)  # Saturday
        self.assertNotIn('class="timeline-schedule-note"', self.home)

    def test_registration_and_rules_are_consistent(self):
        for filename in ("register.html", "rules.html"):
            source = (ROOT / filename).read_text()
            self.assertIn("November 1", source, filename)
            self.assertNotIn("October 24", source, filename)
        rules = (ROOT / "rules.html").read_text()
        self.assertIn("5 submissions total per participant per track", rules)
        self.assertIn("Nov 22-30", rules)
        self.assertIn("Dec 1", rules)
        self.assertNotIn("shift all downstream deadlines", rules)

    def test_public_deadlines_use_explicit_cet_without_internal_rationale(self):
        for filename in ("index.html", "register.html", "rules.html", "leaderboard.html"):
            source = (ROOT / filename).read_text()
            self.assertNotRegex(source, r"(?i)\bAoE\b|Anywhere on Earth|UTC[−-]12", filename)
            self.assertIn("CET (UTC+01:00", source, filename)
            self.assertNotIn("Paris time", source, filename)
            self.assertNotIn("(Paris)", source, filename)
        self.assertNotIn("compute outage", self.home)
        self.assertNotIn("exhaustive lottery search", (ROOT / "leaderboard.html").read_text())

    def test_all_four_codabench_creation_templates_match(self):
        if not COMPETITION.is_dir():
            self.skipTest("Sibling competition checkout not found; pass --competition-repo")
        expected = {
            "warmup_end": WARMUP_END.astimezone(UTC).strftime("%Y-%m-%d %H:%M:%S"),
            "final_start": FINAL_START.astimezone(UTC).strftime("%Y-%m-%d %H:%M:%S"),
            "final_end": FINAL_END.astimezone(UTC).strftime("%Y-%m-%d %H:%M:%S"),
        }
        for track in ("image", "bci", "sleep", "emg"):
            with self.subTest(track=track):
                source = (COMPETITION / "codabench" / f"competition_{track}.yaml").read_text()
                warmup, final = phase_fields(source)
                self.assertEqual(warmup["name"], "Warm-up Phase")
                self.assertEqual(final["name"], "Sealed Final Phase")
                self.assertEqual(warmup["end"], expected["warmup_end"])
                self.assertEqual(final["start"], expected["final_start"])
                self.assertEqual(final["end"], expected["final_end"])
                self.assertEqual(warmup["max_submissions_per_day"], "10")
                self.assertEqual(warmup["max_submissions"], "100")
                self.assertEqual(final["max_submissions_per_day"], "1")
                self.assertEqual(final["max_submissions"], "5")
                self.assertEqual(warmup["execution_time_limit"], "4800")
                self.assertEqual(final["execution_time_limit"], "4800")
                for name in ("hide_output", "hide_prediction_output", "hide_score_output"):
                    self.assertEqual(final[name], "True", name)
                boards = source.split("\nleaderboards:", 1)[1]
                self.assertIn("submission_rule: Force_Best", boards)
                self.assertIn("hidden: False", boards)

    def test_codabench_documentation_matches(self):
        if not COMPETITION.is_dir():
            self.skipTest("Sibling competition checkout not found; pass --competition-repo")
        pages = COMPETITION / "codabench" / "pages"
        timeline = (pages / "timeline.md").read_text()
        for phrase in (
            "Sunday, November 1 at 23:59",
            "Thursday, November 5 at 00:01",
            "Saturday, November 21 at 23:59",
            "Europe/Paris",
            "17 calendar days",
            "5 submissions total per participant per track",
            "Nov 22–30",
            "December 1",
        ):
            self.assertIn(phrase, timeline)
        for filename in ("timeline.md", "terms.md", "registration.md"):
            source = (pages / filename).read_text()
            self.assertNotRegex(source, r"Oct(?:ober)? (?:24|25|28|31)\b", filename)
            self.assertNotRegex(source, r"(?i)\bAoE\b|Anywhere on Earth|UTC[−-]12", filename)
            self.assertIn("Europe/Paris", source, filename)
            self.assertIn("CET (UTC+01:00", source, filename)
            self.assertNotIn("Paris time", source, filename)
            self.assertNotIn("compute outage", source, filename)

    def test_quota_counting_is_explained_consistently(self):
        rules = (ROOT / "rules.html").read_text()
        for phrase in (
            "Each ZIP accepted for evaluation is a submission",
            "even if you upload the same model again",
            "Queued or running",
            "final status <code>Failed</code> does not count",
            "Finished or cancelled by you",
            "deleting a counted submission does not restore its quota slot",
            "Organizers handle any necessary quota correction",
        ):
            self.assertIn(phrase, rules)
        if not COMPETITION.is_dir():
            self.skipTest("Sibling competition checkout not found; pass --competition-repo")
        pages = COMPETITION / "codabench" / "pages"
        terms = (pages / "terms.md").read_text()
        for phrase in (
            "Each ZIP accepted for evaluation is a submission",
            "even if you upload the same model again",
            "Queued or running",
            "final status `Failed` does not count",
            "Finished or cancelled by you",
            "deleting a counted submission does not restore its quota slot",
            "Organizers handle any necessary quota correction",
        ):
            self.assertIn(phrase, terms)
        guide = (pages / "participate.md").read_text()
        self.assertNotIn("A failed upload still costs", guide)

    def test_submission_policy_matches_across_the_public_guides(self):
        rules = (ROOT / "rules.html").read_text()
        for phrase in (
            "10 submissions per participant per day per track",
            "100 submissions total per participant per track",
            "1 submission per participant per day per track",
            "5 submissions total per participant per track",
        ):
            self.assertIn(phrase, rules)
        for filename in ("rules.html", "leaderboard.html"):
            source = (ROOT / filename).read_text()
            self.assertIn("best eligible sealed score", source, filename)
            self.assertIn("one-person teams", source, filename)
            self.assertIn("cannot be deleted", source, filename)
        board = (ROOT / "leaderboard.html").read_text()
        self.assertIn("Warm-up: 10/day, 100 total", board)
        self.assertIn("Sealed: 1/day, 5 total", board)
        if not COMPETITION.is_dir():
            self.skipTest("Sibling competition checkout not found; pass --competition-repo")
        pages = COMPETITION / "codabench" / "pages"
        for filename in ("terms.md", "timeline.md"):
            source = (pages / filename).read_text()
            self.assertIn("5 submissions total per participant per track", source, filename)
            self.assertIn("100 submissions total per participant per track", source, filename)
            self.assertIn("10 submissions per participant per day per track", source, filename)
            self.assertIn("1 submission per participant per day per track", source, filename)
            self.assertIn("best eligible sealed score", source, filename)

    def test_sealed_feedback_is_explained_without_exposing_files(self):
        rules = (ROOT / "rules.html").read_text()
        self.assertIn("scores remain visible", rules)
        self.assertIn("hidden", rules)
        guide = (ROOT / "participant-guide.html").read_text()
        self.assertIn('href="rules.html#faq-sealed-feedback"', guide)
        if not COMPETITION.is_dir():
            self.skipTest("Sibling competition checkout not found; pass --competition-repo")
        pages = COMPETITION / "codabench" / "pages"
        for filename in ("terms.md", "timeline.md"):
            source = (pages / filename).read_text()
            self.assertIn("scores remain visible", source, filename)
            self.assertIn("scoring-step output", source, filename)
            self.assertIn("hidden", source, filename)

    def test_rules_are_split_and_obsolete_home_note_is_removed(self):
        rules = (ROOT / "rules.html").read_text()
        for phrase in (
            "How many submissions can I make?",
            "What counts as a submission in my quota?",
            "Which submission appears on the leaderboard and counts for the final ranking?",
            "blind trial-and-error optimization",
            "within 80 minutes",
        ):
            self.assertIn(phrase, rules)
        self.assertNotIn("faq-underfill", rules)
        self.assertNotIn("timeline-schedule-note", self.home)

    def test_baseline_comparison_belongs_in_the_participant_guide(self):
        rules = (ROOT / "rules.html").read_text()
        self.assertIn('href="participant-guide.html#baselines"', rules)
        self.assertIn("will be added in due time", rules)
        guide = (ROOT / "participant-guide.html").read_text()
        self.assertIn("Reference EEGNet and REVE results on warm-up and sealed data", guide)
        if COMPETITION.is_dir():
            pages = COMPETITION / "codabench" / "pages"
            terms = (pages / "terms.md").read_text()
            self.assertIn("participant-guide.html#baselines", terms)
            submission_guide = (pages / "participate.md").read_text()
            self.assertNotIn("**Sealed phase:**", submission_guide)
            self.assertNotIn("**Sealed feedback:**", submission_guide)
            self.assertNotIn("Reference EEGNet and REVE scores", submission_guide)
            self.assertIn("[Participation rules](terms.md)", submission_guide)

    def test_general_guidance_does_not_contradict_scientific_faqs(self):
        rules = (ROOT / "rules.html").read_text()
        self.assertIn("NSRR datasets under an active licence", rules)
        self.assertNotIn("redistributable dataset", rules)
        if COMPETITION.is_dir():
            pages = COMPETITION / "codabench" / "pages"
            terms = (pages / "terms.md").read_text()
            self.assertIn("NSRR datasets under an active licence", terms)
            guide = (pages / "participate.md").read_text()
            self.assertNotIn("During `load_model` and `predict`, do not train", guide)
            self.assertIn("Label-free test-time adaptation is allowed only as specified", guide)

    def test_no_stale_operational_limits_or_preview_links_in_public_copy(self):
        sources = list(ROOT.glob("*.html"))
        if COMPETITION.is_dir():
            sources.extend((COMPETITION / "codabench" / "pages").glob("*.md"))
        for filename in sources:
            source = re.sub(r"(?is)<script\b[^>]*>.*?</script>", "", filename.read_text())
            self.assertNotRegex(source, r"(?i)(?:up to |warm.up.{0,20})five submissions per|5/day warm.up|60 minutes on one|60 min · one A100", str(filename))
            self.assertNotIn("http://localhost", source, str(filename))

    def test_obsolete_selection_rules_are_removed_from_public_content(self):
        sources = list(ROOT.glob("*.html"))
        if COMPETITION.is_dir():
            sources.extend((COMPETITION / "codabench" / "pages").glob("*.md"))
        for filename in sources:
            # Stored leaderboard model names are data, not competition rules.
            source = re.sub(r"(?is)<script\b[^>]*>.*?</script>", "", filename.read_text())
            self.assertNotRegex(source, r"(?i)best[ -]of.{0,15}last|last[ -](?:five|5)\b", str(filename))
            self.assertNotRegex(source, r"(?i)\b10\s+sealed\s+submissions\b", str(filename))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--competition-repo", type=Path, default=COMPETITION)
    args, remaining = parser.parse_known_args()
    COMPETITION = args.competition_repo.resolve()
    unittest.main(argv=[__file__, *remaining], verbosity=2)
