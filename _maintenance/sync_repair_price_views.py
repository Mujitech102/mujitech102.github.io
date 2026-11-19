"""Update existing static price cells from the central approved repair catalogue."""
from pathlib import Path
from html import unescape
from urllib.parse import urlsplit, parse_qs
import json
import re

ROOT = Path(__file__).resolve().parents[1]

def sync():
    script = (ROOT / 'assets/repair-prices-data.js').read_text()
    book = json.loads(script[script.index('{'):].rstrip(';\n'))
    prices = {(model, part): price for model, part, price in book['rows']}
    counts = {}
    unknown = {'de': 'Preis auf Anfrage', 'en': 'Price on request', 'fr': 'Prix sur demande', 'it': 'Prezzo su richiesta'}
    for path in ROOT.rglob('*.html'):
        if any(part.startswith('_') for part in path.relative_to(ROOT).parts):
            continue
        page = path.read_text()
        match = re.search(r'<html[^>]*lang=["\']([^"\']+)', page)
        lang = match[1][:2] if match else 'de'
        count = 0

        def row(match):
            nonlocal count
            html = match[0]
            links = re.findall(r'<a[^>]+href="([^"]+)"', html)
            for link in links:
                query = parse_qs(urlsplit(unescape(link)).query)
                model = query.get('model', [''])[0]
                part = query.get('repair', [''])[0]
                key = (model, part)
                if key not in prices:
                    continue
                price = prices[key]
                text = unknown[lang] if price is None else f'CHF {price:.2f}'
                result, replaced = re.subn(r'(<td\b[^>]*>).*?(</td>)', lambda cell: cell[1] + text + cell[2], html, count=1, flags=re.S)
                if replaced:
                    count += 1
                return result
            return html

        updated = re.sub(r'<tr\b.*?</tr>', row, page, flags=re.S)
        if count:
            counts[str(path.relative_to(ROOT))] = count
        if updated != page:
            path.write_text(updated)
    return counts

if __name__ == '__main__':
    print(json.dumps(sync(), ensure_ascii=False, indent=2))
