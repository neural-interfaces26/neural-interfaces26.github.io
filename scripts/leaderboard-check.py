"""Offline regression checks for authenticated, failure-safe leaderboard reads."""
import importlib.util
import io
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import Mock, patch
from urllib.error import HTTPError


SPEC = importlib.util.spec_from_file_location(
    "leaderboard_progress", Path(__file__).with_name("leaderboard-progress.py")
)
updater = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(updater)


def response(body, content_type="application/json"):
    stream = io.BytesIO(body)
    stream.headers = {"Content-Type": content_type}
    return stream


class LeaderboardReads(unittest.TestCase):
    def setUp(self):
        updater.get.cache_clear()
        self.environment = patch.dict(os.environ, {}, clear=True)
        self.environment.start()
        self.addCleanup(self.environment.stop)
        self.opener = patch.object(updater, "OPENER", Mock())
        self.network = self.opener.start()
        self.addCleanup(self.opener.stop)
        self.sleep = patch.object(updater.time, "sleep")
        self.sleep.start()
        self.addCleanup(self.sleep.stop)
        self.addCleanup(updater.get.cache_clear)

    def test_public_json_needs_no_credential(self):
        self.network.open.return_value = response(b'{"count": 0, "submissions": []}')
        self.assertEqual(updater.get("phases/30149/get_leaderboard/")["count"], 0)
        request = self.network.open.call_args.args[0]
        self.assertIsNone(request.get_header("Authorization"))
        self.assertEqual(request.get_header("Accept"), "application/json")

    def test_token_is_sent_only_in_the_authentication_header(self):
        os.environ["CODABENCH_TOKEN"] = "DUMMY_TEST_TOKEN"
        self.network.open.return_value = response(b'{"title": "Public competition"}')
        payload = updater.get("competitions/17974/")
        request = self.network.open.call_args.args[0]
        self.assertEqual(request.get_header("Authorization"), "Token DUMMY_TEST_TOKEN")
        self.assertNotIn("DUMMY_TEST_TOKEN", request.full_url)
        self.assertNotIn("DUMMY_TEST_TOKEN", json.dumps(payload))

    def test_export_excludes_private_api_fields_and_other_scores(self):
        # Synthetic markers only. Full API responses must never be published.
        self.network.open.side_effect = [
            response(json.dumps({
                "title": "Neural Interfaces 2026 - Track 1",
                "participants_count": 10,
                "broker_url": "DO_NOT_EXPORT",
            }).encode()),
            response(json.dumps({"count": 1, "submissions": [{
                "owner": "example_participant",
                "email": "DO_NOT_EXPORT",
                "organization": {"name": "Example team", "members": "DO_NOT_EXPORT"},
                "fact_sheet_answers": {"model": "Example model", "other": "DO_NOT_EXPORT"},
                "created_when": "2026-11-05T12:00:00Z",
                "prediction_result": "DO_NOT_EXPORT",
                "scores": [
                    {"column_key": "top5_acc_subject_agg", "score": 0.1, "precision": 6},
                    {"column_key": "hidden_diagnostic", "score": "DO_NOT_EXPORT"},
                ],
            }]}).encode()),
        ]
        title, metric, precision, participants, rows = updater.fetch(
            17974, 30149, "top5_acc_subject_agg"
        )
        self.assertEqual((title, metric, precision, participants),
                         ("Track 1", "top5_acc_subject_agg", 6, 10))
        self.assertEqual(set(rows[0]), {"team", "user", "model", "score", "date"})
        self.assertEqual(rows[0]["score"], 0.1)
        self.assertNotIn("DO_NOT_EXPORT", json.dumps(rows, default=str))

    def test_html_challenge_is_retried_before_accepting_json(self):
        self.network.open.side_effect = [
            response(b'<html>Making sure you are not a bot</html>', "text/html"),
            response(b'{"count": 3}'),
        ]
        self.assertEqual(updater.get("phases/30149/get_leaderboard/")["count"], 3)
        self.assertEqual(self.network.open.call_count, 2)

    def test_malformed_json_is_retried(self):
        self.network.open.side_effect = [response(b'{broken'), response(b'{"count": 2}')]
        self.assertEqual(updater.get("phases/30149/get_leaderboard/")["count"], 2)

    def test_transient_server_error_is_retried(self):
        self.network.open.side_effect = [
            HTTPError(updater.API, 503, "Unavailable", {}, None), response(b'{"count": 1}')
        ]
        self.assertEqual(updater.get("phases/30149/get_leaderboard/")["count"], 1)

    def test_invalid_credentials_and_redirects_fail_without_retrying(self):
        for status in (401, 403, 302):
            with self.subTest(status=status):
                self.network.open.reset_mock()
                self.network.open.side_effect = HTTPError(updater.API, status, "Rejected", {}, None)
                with self.assertRaisesRegex(RuntimeError, f"HTTP {status}"):
                    updater.get("competitions/17974/")
                self.assertEqual(self.network.open.call_count, 1)

    def test_persistent_html_is_bounded_and_not_exposed_in_the_error(self):
        self.network.open.side_effect = lambda *args, **kwargs: response(
            b'<html>private-response-body</html>', "text/html"
        )
        with self.assertRaisesRegex(RuntimeError, "after four attempts") as caught:
            updater.get("competitions/17974/")
        self.assertEqual(self.network.open.call_count, 4)
        self.assertNotIn("private-response-body", str(caught.exception))

    def test_partial_fetch_failure_preserves_every_previous_output(self):
        previous = Path.cwd()
        with tempfile.TemporaryDirectory() as directory:
            try:
                os.chdir(directory)
                paths = [Path("leaderboard.html"), Path("assets/data/leaderboard.json"),
                         Path("exports/leaderboard/leaderboard.csv"),
                         Path("exports/leaderboard/progress.svg"),
                         Path("exports/leaderboard/progress.png")]
                for path in paths:
                    path.parent.mkdir(parents=True, exist_ok=True)
                    path.write_bytes(b"previous-successful-output")
                with patch.object(updater, "fetch", side_effect=[
                    ("Track 1", "top5_acc_subject_agg", 6, 1, []),
                    RuntimeError("Codabench unavailable"),
                ]), patch.object(updater, "plot") as plot:
                    with self.assertRaisesRegex(RuntimeError, "unavailable"):
                        updater.main()
                    plot.assert_not_called()
                for path in paths:
                    self.assertEqual(path.read_bytes(), b"previous-successful-output")
            finally:
                os.chdir(previous)


if __name__ == "__main__":
    unittest.main(verbosity=2)
