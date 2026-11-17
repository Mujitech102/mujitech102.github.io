"""Refresh the static refurbished cards from the shared offer inventory."""
from html import escape
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
OFFERS = json.loads((Path(__file__).parent / "refurbished-offers.json").read_text())
LABELS = {
    'de': ('Speicher', 'Farbe', 'SIM', 'Variante', 'Zustand', 'Akku', 'Garantie', 'auf die Gerätetechnik'),
    'en': ('Storage', 'Colour', 'SIM', 'Variant', 'Condition', 'Battery', 'Warranty', 'on device hardware'),
    'fr': ('Stockage', 'Couleur', 'SIM', 'Variante', 'État', 'Batterie', 'Garantie', 'sur le matériel de l’appareil'),
    'it': ('Memoria', 'Colore', 'SIM', 'Variante', 'Condizioni', 'Batteria', 'Garanzia', 'sull’hardware del dispositivo'),
}
CARD = re.compile(r'<article class="shop-product" id="([^"]+)">.*?</article>', re.S)

def render(offer, lang):
    info = offer['language'][lang]
    storage, color, sim, variant, condition, battery, warranty, scope = LABELS[lang]
    fields = [
        ('storage', storage, offer['storage']), ('color', color, info['color']),
        ('sim', sim, offer['sim']), ('variant', variant, info['variant']),
        ('condition', condition, info['condition']), ('battery', battery, info['battery']),
        ('warranty', warranty, info['warranty'] + ' ' + scope),
    ]
    pairs = ''.join(
        f'<dt>{escape(label)}</dt><dd data-field="{key}">{escape(value)}</dd>'
        for key, label, value in fields if value
    )
    price = f' data-price="{escape(offer["price"])}"' if offer['price'] else ''
    alt = escape(offer['model'] + ', ' + info['illustration'])
    return (
        f'<article class="shop-product" id="{escape(offer["id"])}"><div class="device-photo shop-image">'
        f'<img src="{escape(offer["image"])}" alt="{alt}" loading="lazy"></div>'
        f'<div class="copy"><small>{escape(info["illustration"])}</small><h2>{escape(offer["model"])}</h2>'
        f'<strong{price}>{escape(info["priceText"])}</strong><dl class="product-data">{pairs}</dl>'
        f'<button class="open btn btn-primary" type="button">{escape(info["button"])} <span aria-hidden="true">↗</span></button></div></article>'
    )

if __name__ == '__main__':
    offers = {offer['id']: offer for offer in OFFERS}
    for lang in LABELS:
        path = (ROOT if lang == 'de' else ROOT / lang) / 'refurbished.html'
        page = path.read_text()
        ids = CARD.findall(page)
        if len(ids) != len(offers) or set(ids) != offers.keys():
            raise ValueError(f'{path}: offer identifiers differ from the inventory')
        path.write_text(CARD.sub(lambda match: render(offers[match[1]], lang), page))
