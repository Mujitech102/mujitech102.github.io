# Approved website updates — 15 October 2026

## Measurement proposal — 3 November 2026 (requires release approval)

- `assets/polish.js` and the four repair enquiry pages are unchanged from the published validation release `c51cd235b179b33d0d3a476347122a7418c547a7`. This change uses `insights.js` and `enhancements.js`; no HTML, form endpoint, price, consent choice or GA4 account setting is changed.
- Start a manual QA journey with `?muji_test=1`. This tab keeps QA mode across same-origin navigation, language switches and FormSubmit return. Localhost/loopback previews are always QA. No production Google tag or Analytics events are loaded in QA, even with saved statistics/Ads consent. End a production-domain QA session explicitly with `?muji_test=0`; this also clears an old pending enquiry marker. The query flag is a testing convenience, not an authentication or delivery proof.
- Contact clicks, enquiry opens, form starts, submit attempts and provider confirmations retain their existing event names. They add a fixed `funnel_stage` and `lead_verified: 0`. A provider confirmation remains a technical intermediate; this code never emits a received/qualified-lead or purchase event. Existing GA4 key-event configuration is unchanged; do not report its total as verified leads.
- The eight PC/laptop pages are assigned consistently: hardware repair to `repair`, slow-computer help to `private_support`, in DE/EN/FR/IT.
- Each form draft receives an opaque random `Anfrage_Referenz` and a fixed `Messmodus` (`test` or `production`). These two fields travel only in the submitted form to the existing recipient. Neither reference nor message/contact data is sent to Analytics. A retry of the same form draft retains its reference so duplicate receipt exports can be detected.
- Browser/provider confirmation cannot prove inbox delivery. After checking the real inbox, export the original received email as `.eml` into a **private directory outside this public repository**, record its reference and mode in a private ledger, and record qualification/order decisions separately. A displayed success page or a synthetic local fixture must never be entered as a real receipt.

Private ledger shape (create outside this repository; start with an empty `entries` array):

```json
{"schema_version":1,"entries":[{"reference":"MJ-<reference from received form>","mode":"production","language":"de","received_email":"original-message.eml","inbox_verified_at":"2026-11-03T21:00:00+01:00","qualification":"unreviewed"}]}
```

Allowed qualification values: `unreviewed`, `qualified`, `not_qualified`, `spam`. A confirmed order additionally requires `"order":{"confirmed_at":"<timestamp with timezone>","evidence_file":"<private order evidence>"}` and a qualified enquiry. Run `python3 _maintenance/enquiry_receipts.py /private/path/ledger.json`. The offline tool checks matching reference/mode in the exported email, the recipient and Message-ID, duplicate entries, and separate order evidence. It returns receipt/test/qualified/order counts plus evidence hashes, never mail bodies or contact details. It does **not** authenticate a sender, read a mailbox, prove that a supplied export is genuine, or decide whether an enquiry is qualified; the recorded inbox check and business decision remain required. Test receipts/orders never enter production counts. An empty ledger means no evidence has been entered, not that the business received no enquiries.

Checks: `node _maintenance/test_measurement.js`, `python3 _maintenance/test_enquiry_receipts.py`, `node _maintenance/test_form_review.js`, `python3 _maintenance/validate.py`. Local browser checks must use the isolated mock submission receiver and a `form-action 'self'` policy; never submit fixtures to FormSubmit. Before later release verification, reload the affected scripts after the existing 600-second browser cache expires or coordinate a shared asset-version update with the other website changes. No release or account changes are performed by these tests.

30 October 2026 form review: show checked package, care and extra options using visible localized labels and fieldset legends. Unchecked, disabled and hidden fields stay excluded. The review stage must never send by itself; run `node _maintenance/test_form_review.js` when changing it. `seo_quality_20261030.py` also preserves the four website pages' reviewed script version.

The current HTML files are the deployed source of truth for the newer catalogue, repair guides and gaming products. The older `_localization/build.py` only generates the original page families. Do not use it alone to replace the current deployment.

Run from the repository root after content edits:

```sh
python3 _maintenance/update_20261015.py
python3 _maintenance/validate.py
node _maintenance/test_measurement.js
```

The approved public price allowlist is `approved-repair-prices.json`. Only those model/quality pairs may have fixed prices, in CHF 5 increments. The historic competitor-only imports in `price-provenance-2026-10-15.json` must not be restored: they do not establish purchase cost coverage. Internal supplier cost evidence stays outside this public repository. Unconfirmed pairs remain on request. No third-party repair-duration or warranty promise is imported.

`content_20261015.py` contains reviewed German, English, French and Italian service terms. The standard diagnosis is free. A standard written insurance report costs CHF 49; complex additional investigations require a prior quotation and approval. The customer pays outbound shipping; Mujitech pays return delivery after repair. Gaming PCs have 36 months of hardware warranty; the existing iPhone offers and 6-month repair warranty remain separate.

Manufacturer price pages and the static price sections are generated from the same price book used by the picker and MujiBot. The sitemap is rebuilt from all canonical, indexable HTML files, including newer product and guide pages.

Form endpoints remain the established FormSubmit address. CAPTCHA protection remains enabled. Each form has one honeypot, a language field, category, subject and localized return page. Three optional photo fields use the provider's documented aggregate 10 MB limit.

Measurement requires statistics consent. `form_submit_attempt` counts an attempted submit. `form_confirmation_view` records a provider return only when the same tab has a recent matching submission marker. The event does not prove inbox delivery or a paid order. Markers contain only a fixed form category, an approved service category, time and a QA flag, never contact or form contents. They are stored only after statistics consent. GA4 administration/key-event settings require access to the Analytics account and are not changed by this code.

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

23 October 2026: price picker precedes the optional diagnosis/report block; shared quality explanations are next to quotes and in MujiBot; Google Ads replies link to the localized offer on websites.html#google-ads. Preserve these changes when using older generators. Prices are based on the recorded supplier cost audit, not a new supplier quotation. Referral commission is internal and does not reduce the public price.

25 October 2026: run `python3 _maintenance/service_search_20261025.py` **after** older generators to preserve the multilingual service overview, contextual links and the eight laptop/computer-repair and e-commerce pages. These pages address distinct service intent rather than duplicate city landing pages. French, Italian and English entry points describe nationwide service; Abtwil remains the real workshop and handover requires an appointment. Standard repair diagnosis, existing package prices and shipping terms are unchanged. Keyword research used Switzerland/Google with separate German, French, Italian and English queries; Planner ranges are not exact volumes, keyword variants may overlap, and advertising competition is not organic SEO difficulty. Private Search Console exports and account research stay outside the public repository. Validate with `_maintenance/validate.py` and check mobile layouts and all four language links before release.

28 October 2026: run `python3 _maintenance/search_additions_20261028.py` after all older generators. Adds query-intent guidance to six service families in all four languages without replacing existing content, metadata, prices or forms. Private GSC exports remain outside the repository.

30 October 2026: run `python3 _maintenance/seo_quality_20261030.py` after the 28 October generator. It preserves reviewed shipping-cost explanations and contextual repair links on the seven current/legacy shipping pages. MujiBot handles commas within part labels, does not add alternative parts into a total, and asks for clarification when any named device model is unresolved. Run `node _maintenance/test_pricing_bot.js` alongside the validation and other regression tests above. Confirmed prices, offers, measurement and form endpoints remain unchanged. Private audit and account exports stay outside this public repository.

1 November 2026: run `python3 _maintenance/search_evidence_20261101.py` last. Adds reviewed PC fault guidance, an existing attributed laptop review, Samsung cost/symptom guidance and voluntary honest-feedback links in four languages. Samsung search descriptions address observed cost intent; no prices or form endpoints change. Do not fabricate repair outcomes or portfolio references.

1 November 2026, slow-computer help: run `python3 _maintenance/slow_computer_20261101.py` after earlier generators. Four distinct localized pages cover the existing optimisation service, link to its preselected private-service form, and are linked from private-service and laptop-repair pages. Hardware diagnosis terms stay separate from software assistance pricing. Four canonical URLs extend sitemap to 228. No new prices, promises or tracking events.
