"""Synthetic local mail files only; no real inbox, messages, or network access."""
import json
import tempfile
import unittest
from email.message import EmailMessage
from pathlib import Path
from enquiry_receipts import summarise


class ReceiptTests(unittest.TestCase):
    def test_separate_received_qualified_orders_and_tests_in_four_languages(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            entries = []
            for n, language in enumerate(("de", "en", "fr", "it")):
                for mode in ("test", "production"):
                    ref = "MJ-" + str(len(entries) + 1).zfill(32)
                    mail = EmailMessage()
                    mail["To"] = "info@mujitech.ch"
                    mail["From"] = "fixture@example.invalid"
                    mail["Message-ID"] = "<" + ref + "@example.invalid>"
                    if n % 2:
                        mail.set_content("<table><tr><td>Anfrage_Referenz</td><td>" + ref + "</td></tr><tr><td>Messmodus</td><td>" + mode + "</td></tr></table>", subtype="html")
                    else:
                        mail.set_content("Anfrage_Referenz: " + ref + "\nMessmodus: " + mode)
                    filename = ref + ".eml"
                    (root / filename).write_bytes(mail.as_bytes())
                    row = {"reference": ref, "mode": mode, "language": language,
                           "received_email": filename, "inbox_verified_at": "2026-11-03T21:00:00+01:00",
                           "qualification": "qualified" if n < 2 else "unreviewed"}
                    if n == 0:
                        (root / "synthetic-order.txt").write_text("Synthetic fixture; not a real order")
                        row["order"] = {"confirmed_at": "2026-11-03T21:01:00+01:00", "evidence_file": "synthetic-order.txt"}
                    entries.append(row)
            ledger = root / "private-ledger.json"
            def save(rows):
                ledger.write_text(json.dumps({"schema_version": 1, "entries": rows}))
            save(entries)
            report = summarise(ledger)
            self.assertEqual({k: v for k, v in report.items() if k != "evidence"},
                             {"checked_receipts": 8, "test_receipts": 4, "production_received": 4,
                              "production_qualified": 2, "production_orders": 1})
            self.assertNotIn("fixture@example.invalid", json.dumps(report))
            for changes in ({"mode": "production"}, {"received_email": "missing.eml"},
                            {"reference": "MJ-" + "f" * 32}, {"qualification": "spam"},
                            {"inbox_verified_at": "2026-11-03T21:00:00"}):
                save([{**entries[0], **changes}])
                with self.assertRaises(ValueError):
                    summarise(ledger)
            save([entries[0], entries[0]])
            with self.assertRaises(ValueError):
                summarise(ledger)
            save([])
            self.assertEqual(summarise(ledger)["production_received"], 0)


if __name__ == "__main__":
    unittest.main()
