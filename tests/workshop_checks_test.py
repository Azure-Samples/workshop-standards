import contextlib
import hashlib
import importlib.util
import io
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest
from unittest.mock import patch

import yaml


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("checks", ROOT / "scripts" / "workshop_checks.py")
checks = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(checks)


class WorkshopChecksTest(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory(prefix="workshop-checks-")
        self.previous = Path.cwd()
        os.chdir(self.directory.name)
        self.addCleanup(self.directory.cleanup)
        self.addCleanup(os.chdir, self.previous)

    def write(self, name, value):
        file = Path(name)
        file.parent.mkdir(parents=True, exist_ok=True)
        file.write_text(value, encoding="utf-8")

    def commit(self):
        checks.git("add", ".")
        checks.git("-c", "user.name=Test", "-c", "user.email=test@example.invalid",
                   "-c", "commit.gpgsign=false", "commit", "-qm", "fixture")

    def init(self):
        checks.git("init", "-q")

    def status(self, check, scope="tree"):
        with patch("sys.argv", ["checks", str(check), "--scope", scope]):
            with contextlib.redirect_stdout(io.StringIO()):
                return checks.main()

    def notebook(self, output=False):
        return json.dumps({
            "cells": [{"cell_type": "code", "outputs": [{"text": "safe sample"}] if output else [],
                       "execution_count": 1 if output else None}],
        })

    def metadata(self):
        return {
            "type": "workshop", "title": "Workshop", "description": "Description",
            "level": "beginner", "authors": ["Author"], "contacts": ["@author"],
            "duration_minutes": None, "tags": ["azure-ai"], "language": "ko",
            "execution": ["local"], "status": "draft", "source": "original",
            "last_updated": "2026-10-11", "validated_on": None,
        }

    def root_metadata(self, metadata):
        self.write("README.md", "---\n" + yaml.safe_dump(metadata) + "---\n# Workshop\n")

    def test_endpoints_and_named_ids_are_redacted_and_not_suppressed_by_example(self):
        urls = [
            "https://example-personal.openai.azure.com",
            "https://personal.azurecr.io", "https://personal.servicebus.windows.net",
            "https://personal.cognitiveservices.azure.com",
            "https://personal.services.ai.azure.com", "https://personal.azure-api.net",
        ]
        identifier = "12345678-1234-1234-1234-123456789abc"
        self.write("config.yaml", "\n".join(urls) + f"\ntenant_id: {identifier}\n")
        bad = checks.identifiers("tree")
        self.assertEqual(len(bad), 7)
        for value in urls + [identifier]:
            self.assertFalse(any(value in line for line in bad))
        self.assertEqual(self.status(2), 1)

    def test_placeholders_and_plain_uuids_pass(self):
        self.write("README.md", "https://<your-resource>.openai.azure.com\n"
                   "subscription_id: <your-subscription-id>\n12345678-1234-1234-1234-123456789abc")
        self.assertEqual(self.status(2), 0)

    def test_history_detects_deleted_and_branch_only_values(self):
        self.init()
        self.write("old.txt", "https://personal.openai.azure.com")
        self.commit()
        checks.git("branch", "old-material")
        self.write("old.txt", "clean")
        self.commit()
        checks.git("checkout", "--orphan", "clean-history")
        checks.git("add", ".")
        self.commit()
        self.assertEqual(checks.identifiers("tree"), [])
        self.assertTrue(checks.identifiers("all"))
        self.assertEqual(self.status(2, "all"), 1)

    def test_named_resource_ids_and_escaped_notebook_strings(self):
        identifier = "12345678-1234-1234-1234-123456789abc"
        for content in [f"/subscriptions/{identifier}", f"subscriptionId: '{identifier}'"]:
            self.write("config.json", content)
            self.assertTrue(checks.identifiers("tree"))
        Path("config.json").unlink()
        self.write("lab.ipynb", '{"cells": [], "metadata": {"value": "https:\\/\\/personal.azurecr.io"}}')
        self.assertTrue(checks.identifiers("tree"))

    def test_allowlist_is_exact_and_requires_a_reason(self):
        url = "https://personal.openai.azure.com"
        self.write("README.md", url)
        entry = {"kind": "endpoint", "path": "README.md",
                 "sha256": hashlib.sha256(url.encode()).hexdigest(), "reason": "approved public fixture"}
        self.write(".workshop-scan-allowlist.json", json.dumps({"entries": [entry]}))
        self.assertEqual(self.status(2), 0)
        self.write("other.md", url)
        self.assertEqual(self.status(2), 1)
        entry["reason"] = ""
        self.write(".workshop-scan-allowlist.json", json.dumps({"entries": [entry]}))
        with self.assertRaises(ValueError):
            checks.identifiers("tree")

    def test_notebook_output_history_can_be_classified_but_current_output_cannot(self):
        self.init()
        self.write("lab.ipynb", self.notebook(True))
        self.commit()
        self.write("lab.ipynb", self.notebook())
        self.commit()
        self.assertEqual(checks.notebooks("tree"), [])
        self.assertEqual(len(checks.notebooks("all")), 1)
        value = json.dumps([[{"text": "safe sample"}], 1], sort_keys=True, ensure_ascii=False)
        self.write(".workshop-scan-allowlist.json", json.dumps({"entries": [{
            "kind": "historical-output", "path": "lab.ipynb",
            "sha256": checks.fingerprint(value), "reason": "author approved safe historical output",
        }]}))
        self.assertEqual(self.status(3, "all"), 0)
        self.write("lab.ipynb", self.notebook(True))
        self.assertEqual(self.status(3), 1)

    def test_missing_notebook_fields_and_malformed_json_do_not_pass(self):
        self.write("lab.ipynb", '{"cells":[{"cell_type":"code"}]}')
        self.assertEqual(self.status(3), 1)
        self.write("lab.ipynb", "{")
        result = subprocess.run(
            [os.sys.executable, str(ROOT / "scripts" / "workshop_checks.py"), "3", "--scope", "tree"],
            capture_output=True, text=True
        )
        self.assertEqual(result.returncode, 2)
        self.assertNotIn("PASS", result.stdout)
        self.assertIn("ERROR", result.stderr)

    def test_absent_empty_and_shallow_histories_are_errors(self):
        with self.assertRaises(subprocess.CalledProcessError):
            checks.identifiers("all")
        self.init()
        with self.assertRaises(ValueError):
            checks.notebooks("all")
        self.write("README.md", "clean")
        self.commit()
        with patch.object(checks, "git", return_value=b"true\n"):
            with self.assertRaises(ValueError):
                checks.identifiers("all")

    def test_secret_commands_check_tree_and_all_refs_and_stop_on_failure(self):
        with patch.object(checks, "git", side_effect=[b"false\n", b"commit\n"]):
            with patch.object(checks.subprocess, "run", return_value=subprocess.CompletedProcess([], 0)) as run:
                self.assertEqual(checks.secrets("all"), 0)
                self.assertEqual(run.call_count, 2)
                self.assertEqual(run.call_args_list[0].args[0][1], "dir")
                self.assertIn("--log-opts=--all", run.call_args_list[1].args[0])
                self.assertTrue(all("--redact" in c.args[0] for c in run.call_args_list))
        with patch.object(checks.subprocess, "run", return_value=subprocess.CompletedProcess([], 1)) as run:
            self.assertEqual(checks.secrets("tree"), 1)
            self.assertEqual(run.call_count, 1)
        with patch.object(checks.subprocess, "run", side_effect=FileNotFoundError):
            with self.assertRaises(FileNotFoundError):
                checks.secrets("tree")

    @unittest.skipUnless(shutil.which("gitleaks"), "gitleaks not installed; real-tool integration not run")
    def test_real_gitleaks_detects_uncommitted_and_historical_fixture_secrets(self):
        self.init()
        self.write(".gitleaks.toml", "[[rules]]\nid = 'workshop-fixture'\n"
                   "description = 'Synthetic regression fixture'\nregex = '''WORKSHOP_TEST_[A-Z]{12}'''\n")
        self.write("README.md", "clean")
        self.commit()

        def run():
            return subprocess.run(
                [os.sys.executable, str(ROOT / "scripts" / "workshop_checks.py"), "1"],
                capture_output=True, text=True
            )

        self.assertEqual(run().returncode, 0)
        secret = "WORKSHOP_TEST_ABCDEFGHIJKL"
        self.write("uncommitted.txt", secret)
        result = run()
        self.assertEqual(result.returncode, 1)
        self.assertNotIn(secret, result.stdout + result.stderr)
        self.commit()
        Path("uncommitted.txt").unlink()
        self.commit()
        result = run()
        self.assertEqual(result.returncode, 1)
        self.assertNotIn(secret, result.stdout + result.stderr)

    @unittest.skipUnless(shutil.which("gitleaks"), "gitleaks not installed; nine-check integration not run")
    def test_copied_workshop_harness_passes_all_nine_commands(self):
        self.init()
        self.root_metadata(self.metadata())
        self.write("01-lab/README.md", "---\ntitle: Lab\nduration_minutes: 10\n"
                   "last_updated: 2026-10-11\n---\n![Image](assets/image.png \"Title\")")
        self.write("01-lab/assets/image.png", "fixture")
        self.write("01-lab/exercise.ipynb", self.notebook())
        self.write("scripts/workshop_checks.py",
                   (ROOT / "scripts" / "workshop_checks.py").read_text(encoding="utf-8"))
        self.write("scripts/requirements-workshop.txt",
                   (ROOT / "scripts" / "requirements-workshop.txt").read_text(encoding="utf-8"))
        self.commit()
        for check in range(1, 10):
            with self.subTest(check=check):
                result = subprocess.run(
                    [os.sys.executable, "-B", "scripts/workshop_checks.py", str(check)],
                    capture_output=True, text=True
                )
                self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
                self.assertIn(f"PASS: check {check}", result.stdout)

    def test_paths_include_empty_directories_but_ignore_environment_files(self):
        Path("folder with spaces").mkdir()
        self.assertEqual(self.status(4), 1)
        Path("folder with spaces").rmdir()
        self.write("node_modules/folder with spaces/file.txt", "not workshop content")
        self.assertEqual(self.status(4), 0)

    def test_root_schema_validates_types_enums_dates_and_nullable_fields(self):
        fm = self.metadata()
        self.root_metadata(fm)
        self.assertEqual(self.status(5), 0)
        for key, value in [
            ("type", "other"), ("level", "expert"), ("title", ""),
            ("authors", "Author"), ("contacts", []), ("contacts", ["@one", "@two"]),
            ("duration_minutes", True), ("duration_minutes", -1),
            ("tags", ["Bad Tag"]), ("language", "korean"), ("execution", ["vm"]),
            ("status", "ready"), ("source", "localized: not-a-url"),
            ("last_updated", "2026-02-30"), ("validated_on", "yesterday"),
        ]:
            with self.subTest(key=key, value=value):
                self.root_metadata({**fm, key: value})
                self.assertEqual(self.status(5), 1)

    def test_lab_schema_covers_root_and_labs_layout(self):
        fm = {"title": "Lab", "duration_minutes": None, "last_updated": "2026-10-11"}
        for name in ["01-first/README.md", "labs/02-second/README.md", "lab03-legacy/README.md"]:
            self.write(name, "---\n" + yaml.safe_dump(fm) + "---\n")
        self.assertEqual(self.status(7), 0)
        self.write("labs/02-second/README.md", "---\ntitle: []\nduration_minutes: 0\nlast_updated: nope\n---\n")
        self.assertEqual(self.status(7), 1)

    def test_links_parse_titles_references_html_and_root_paths(self):
        self.write("assets/image.png", "fixture")
        self.write("guide.md", "# Guide")
        self.write("01-lab/README.md", """
[Guide](../guide.md "Title")
[Guide reference][guide]
[guide]: ../guide.md "Reference title"
![Root image](/assets/image.png)
<img src="/assets/image.png" alt="Root image">
`[Code](missing.md)`
```
[Code](missing.md)
```
""")
        self.assertEqual(self.status(6), 0)
        self.assertEqual(self.status(9), 0)
        self.write("README.md", '[Missing](missing.md "Title")')
        self.assertEqual(self.status(6), 1)
        self.write("README.md", '[Missing][ref]\n\n[ref]: missing.md "Title"')
        self.assertEqual(self.status(6), 1)

    def test_cross_lab_assets_resolve_paths_and_allow_own_and_shared_assets(self):
        self.write("labs/01-first/assets/image.png", "fixture")
        self.write("shared-assets/image.png", "fixture")
        self.write("labs/01-first/README.md", "![Own](assets/image.png)\n![Shared](/shared-assets/image.png)")
        self.assertEqual(self.status(9), 0)
        self.write("labs/02-second/README.md", '![Other](../01-first/assets/image.png "Title")')
        self.assertEqual(self.status(9), 1)

    def test_alt_text_ignores_code_but_checks_markdown_and_html_images(self):
        self.write("README.md", '`![](code.png)`\n![Image](image.png)\n<img alt="Image" src="image.png">')
        self.assertEqual(self.status(8), 0)
        for source in ['![](image.png)', '<img src="image.png">', '<img src="image.png" alt=" ">']:
            self.write("README.md", source)
            self.assertEqual(self.status(8), 1)

    def test_unreadable_text_and_symlinks_do_not_silently_pass(self):
        Path("config.yaml").write_bytes(b"\xff")
        with self.assertRaises(UnicodeDecodeError):
            checks.identifiers("tree")
        Path("config.yaml").unlink()
        self.write("assets/binary.png", "\x00")
        self.assertEqual(checks.identifiers("tree"), [])
        with patch.object(Path, "is_symlink", return_value=True):
            with self.assertRaises(ValueError):
                checks.paths()


if __name__ == "__main__":
    unittest.main()
