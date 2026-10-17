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

Measurement requires statistics consent. `form_submit_attempt` counts an attempted submit. `form_confirmation_view` records a provider return only when the same tab has a recent matching submission marker. The event does not prove inbox delivery or a paid order. Markers contain only a fixed form category, an approved service category and time, never contact or form contents. They are stored only after statistics consent. GA4 administration/key-event settings require access to the Analytics account and are not changed by this code.

The underscore directories are excluded from the GitHub Pages site. Do not place customer enquiries, credentials or personal data in source control.


Approved 16 October 2026: only two repair-photo subjects (damaged back glass and iPhone secured in clamps); no workspace photos or portraits. Free diagnosis is distinct from the optional CHF 49 written insurance report, with damage/condition description, photos and repair-cost estimate. Additional complex investigations require prior quotation and approval. Apply workshop_preview_20261016.py after older content generators. Bot diagnosis/report and repair-gallery replies use the same four languages.


Visibility measurement and enquiry improvements, 18 October 2026:

- Contact form events use the selected service category, including after a recent matching provider return. Only the fixed categories in `assets/insights.js` are accepted. Changing the selection after first focus is handled at submission.
- The desired purchase price is optional in device-buyback forms in all four languages. Device condition, ownership and privacy requirements remain in place.
- The Fractal Pop Air image is served as a lossless WebP at the same dimensions. The original PNG remains available for old links.
- MujiBot Wi-Fi enquiries use the existing private-customer contact category. The removed "WLAN & Internet-Hilfe" form option is no longer linked. The validator checks all 72 localized bot destinations, anchors and requested service values against their actual target pages.
- Language links preserve all 16 supported contact/private-service query values. Unrecognized query values and external links are excluded; user-entered form contents are never appended. The regression test derives options from the four published language versions and checks 256 destinations.
- Contact forms show optional guidance for the selected service in DE/EN/FR/IT. Guidance is associated with the message field and updates without replacing entered text or adding required fields. Website-package FAQs summarize the existing domain, hosting, content and optional-care conditions before the enquiry form; prices and package scope are unchanged.

Validation from the repository root:

```sh
python3 _maintenance/validate.py
node _maintenance/test_measurement.js
node _maintenance/test_language_context.js
node _maintenance/test_enquiry_guidance.js
```

After release, check a business contact enquiry and one device-buyback form in the browser, including consent rejection and withdrawal. A successful test submission must be distinguished from a genuine customer lead. Confirm the new image URL returns HTTP 200. Google Analytics custom dimensions and key-event administration are separate account settings.
