"""Validate a private, manually checked inbox ledger; never contact a service or send to GA4."""
import argparse
import hashlib
import json
import re
from datetime import datetime
from email import policy
from email.parser import BytesParser
from email.utils import getaddresses
from html.parser import HTMLParser
from pathlib import Path

PUBLIC_REPO = Path(__file__).resolve().parents[1]
REFERENCE = re.compile(r"MJ-(?:[a-f0-9]{32}|[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12})\b")


class PlainHTML(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []

    def handle_data(self, data):
        self.parts.append(data)


def private_file(path):
    path = path.resolve()
    if path == PUBLIC_REPO or PUBLIC_REPO in path.parents:
        raise ValueError("Keep the ledger and receipt evidence outside the public repository")
    if not path.is_file():
        raise ValueError("Evidence file missing")
    return path


def timestamp(value):
    stamp = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if stamp.tzinfo is None:
        raise ValueError("Evidence timestamps must include a timezone")
    return stamp


def summarise(ledger_path):
    ledger_path = private_file(Path(ledger_path))
    ledger = json.loads(ledger_path.read_text())
    if ledger.get("schema_version") != 1 or not isinstance(ledger.get("entries"), list):
        raise ValueError("Expected schema_version 1 and an entries array")
    result = {"checked_receipts": 0, "test_receipts": 0, "production_received": 0,
              "production_qualified": 0, "production_orders": 0, "evidence": []}
    seen_references, seen_messages = set(), set()
    for row in ledger["entries"]:
        ref = row["reference"]
        if not REFERENCE.fullmatch(ref) or ref in seen_references:
            raise ValueError("Invalid or duplicate enquiry reference")
        if row["mode"] not in ("test", "production") or row["language"] not in ("de", "en", "fr", "it"):
            raise ValueError("Invalid mode or language")
        if row["qualification"] not in ("unreviewed", "qualified", "not_qualified", "spam"):
            raise ValueError("Invalid qualification")
        timestamp(row["inbox_verified_at"])
        raw = private_file(ledger_path.parent / row["received_email"]).read_bytes()
        mail = BytesParser(policy=policy.default).parsebytes(raw)
        message_id = str(mail.get("Message-ID", "")).strip()
        recipients = getaddresses(mail.get_all("To", []) + mail.get_all("Delivered-To", []))
        if not message_id or message_id in seen_messages or not any(a.lower() == "info@mujitech.ch" for _, a in recipients):
            raise ValueError("Missing/duplicate Message-ID or wrong receipt mailbox")
        text = []
        for part in mail.walk():
            if part.get_content_type() not in ("text/plain", "text/html") or part.get_content_disposition() == "attachment":
                continue
            content = part.get_content()
            if part.get_content_type() == "text/html":
                parser = PlainHTML()
                parser.feed(content)
                content = " ".join(parser.parts)
            text.append(content)
        body = " ".join(text)
        modes = set(re.findall(r"\bMessmodus\s*:?\s*(test|production)\b", body))
        if set(REFERENCE.findall(body)) != {ref} or modes != {row["mode"]}:
            raise ValueError("Receipt reference/mode does not match the ledger")
        proof = {"reference": ref, "mode": row["mode"], "email_sha256": hashlib.sha256(raw).hexdigest()}
        order = row.get("order")
        if order:
            if row["qualification"] != "qualified":
                raise ValueError("An order requires a separately qualified enquiry")
            timestamp(order["confirmed_at"])
            evidence = private_file(ledger_path.parent / order["evidence_file"]).read_bytes()
            if not evidence:
                raise ValueError("Order evidence is empty")
            proof["order_sha256"] = hashlib.sha256(evidence).hexdigest()
        seen_references.add(ref)
        seen_messages.add(message_id)
        result["checked_receipts"] += 1
        if row["mode"] == "test":
            result["test_receipts"] += 1
        else:
            result["production_received"] += 1
            result["production_qualified"] += int(row["qualification"] == "qualified")
            result["production_orders"] += int(bool(order))
        result["evidence"].append(proof)
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("ledger", type=Path)
    args = parser.parse_args()
    try:
        print(json.dumps(summarise(args.ledger), ensure_ascii=False, indent=2))
    except (ValueError, KeyError, TypeError, OSError) as exc:
        parser.exit(1, "Invalid receipt evidence: " + str(exc) + "\n")
