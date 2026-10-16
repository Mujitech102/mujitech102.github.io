# Approved website updates — 15 October 2026

The current HTML files are the deployed source of truth for the newer catalogue, repair guides and gaming products. The older `_localization/build.py` only generates the original page families. Do not use it alone to replace the current deployment.

Run from the repository root after content edits:

```sh
python3 _maintenance/update_20261015.py
python3 _maintenance/validate.py
node _maintenance/test_measurement.js
```

The update script preserves all existing non-null repair prices and fills only missing entries listed in `price-provenance-2026-10-15.json`. Prices are an exact model/part-quality match to the public i-Restore list retrieved on 15 October 2026, multiplied by 0.80 and rounded to CHF 0.01. Unmatched or unpriced reference entries remain on request. No third-party repair-duration or warranty promise is imported.

`content_20261015.py` contains reviewed German, English, French and Italian service terms. The standard diagnosis is free. A standard written insurance report costs CHF 49; complex additional investigations require a prior quotation and approval. The customer pays outbound shipping; Mujitech pays return delivery after repair. Gaming PCs have 36 months of hardware warranty; the existing iPhone offers and 6-month repair warranty remain separate.

Manufacturer price pages and the static price sections are generated from the same price book used by the picker and MujiBot. The sitemap is rebuilt from all canonical, indexable HTML files, including newer product and guide pages.

Form endpoints remain the established FormSubmit address. CAPTCHA protection remains enabled. Each form has one honeypot, a language field, category, subject and localized return page. Three optional photo fields use the provider's documented aggregate 10 MB limit.

Measurement requires statistics consent. `form_submit_attempt` counts an attempted submit. `form_confirmation_view` records a provider return only when the same tab has a recent matching submission marker. The event does not prove inbox delivery or a paid order. Markers contain only a fixed form category and time, never contact or form contents. They are stored only after statistics consent. GA4 administration/key-event settings require access to the Analytics account and are not changed by this code.

The underscore directories are excluded from the GitHub Pages site. Do not place customer enquiries, credentials or personal data in source control.


Approved 16 October 2026: only two repair-photo subjects (damaged back glass and iPhone secured in clamps); no workspace photos or portraits. Free diagnosis is distinct from the optional CHF 49 written insurance report, with damage/condition description, photos and repair-cost estimate. Additional complex investigations require prior quotation and approval. Apply workshop_preview_20261016.py after older content generators. Bot diagnosis/report and repair-gallery replies use the same four languages.
