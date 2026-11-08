## Swiss visibility and navigation consistency — 8 November 2026

The four home and contact pages explicitly reuse the existing Organization, business and WebSite identities. Entity URLs stay at the domain root; localized WebPage URLs and language annotations remain unchanged. ContactPage and WebPage describe the same page, with the existing page description and business identifier. Postal code 9030 is reused from the existing contact pages. No new location, public walk-in address, hours, reviews or service promise was added.

The existing contact blocks on the four contact and four webdesign pages include the current language/context-aware assistant link alongside email and phone. Contact introductions describe those same choices. The contact-location block also records the user-confirmed personal device collection by prior arrangement, with a travel surcharge agreed beforehand. No fixed fee or travel area is promised. No transport or submission code changes.

The shared price/bot quality formatter treats the generic catalogue headings `Display / LCD` (including parenthetical screen/frame labels) as unspecified technology, requiring confirmation for the model. Explicit LCD, Soft OLED, Premium and original-part qualities retain their explanations. The same correction is applied to the matching visible static catalogue notes so the explanation agrees before and after JavaScript. Catalogue keys, prices and enquiry parameters are unchanged. The pricing test covers ambiguous headings and explicit qualities.

Twelve existing laptop/PC and Samsung screen/battery pages link to the existing localized mail-in preparation anchor. Eight Samsung pages add a short model-number help disclosure and optional, supported Maintenance mode guidance with the existing backup requirement. Titles, prices and service scope are unchanged.

The contact navigation action retains white text even when the page-current selector applies; otherwise the existing current-page rule makes its text black on its black background.

The shared navigation collapses at 1280px. The conflicting 1061–1150px desktop override was removed to keep long French labels clear of the logo. The brand must not shrink. Check all four languages at 390, 1060, 1100, 1150, 1280 and 1281px, including menu keyboard use and enquiry links. Run the four required checks below. Keep robots.txt, measurement, assistant/Tally and green success files unchanged; no extra real submissions on 8 November.

## Targeted international rollback — 8 November 2026

The three DE/AT/LI webdesign offers and their dedicated stylesheet were removed after explicit user instruction. The existing four-language Swiss website and shop pages use their previous Swiss-focused introduction, five reciprocal language annotations and original Service area. The sitemap contains 232 URLs. Removed country URLs intentionally return the existing GitHub Pages 404 response; no replacement landing page or soft redirect was added.

Keep all four current legal/privacy pages, including the verified provider details and accurate privacy additions. Keep the assistant, Tally bridge, green success confirmation, all prices/products and unrelated SEO work unchanged. Run the four required checks below, inspect desktop/mobile and four-language enquiry handoff without sending. No additional actual submissions: the four daily delivery checks for 8 November are already complete.

## Current release — 7 November 2026

The current enquiry path is `/assistent/` with the existing four-language Tally transport. Direct email and telephone remain alternatives. Keep FormSubmit removed; the older generator instructions below are historical and must not reconstruct retired forms or prices. Public HTML is the reviewed source of truth.

This release corrects the repair-submenu route independently from each page's product/web enquiry CTA. Tally model/product correction buttons explain how to add a correction to the existing Message field; they never reload the form or discard entered contact details. Visible repair labels reuse the reviewed `MujiRepairLabel` translator while original catalogue keys remain unchanged. The existing HP Victus offer gains a non-binding Tally product enquiry; prices, warranty and collection terms remain the individual offer's terms.

Reviewed content replaces repetitive blocks on repair, mail-in, website, ecommerce and gaming pages; used-iPhone category advice is added once. The mixed gaming category identifies new builds and used individual offers. Historic mail-in aliases retain their canonical targets and remain outside the sitemap. Do not restore the deliberately removed iPhone 12 listing.

Before publishing run `python3 _maintenance/validate.py`, `node _maintenance/test_measurement.js`, `node _maintenance/test_pricing_bot.js`, and `node _maintenance/test_wizard_summary.cjs`. The last test is network-free and covers correction controls in all four languages; browser verification is still required. The two retired inline-form tests described below remain baseline test debt. No additional real form submissions were made in this release; the four separate daily delivery checks were completed earlier.

# Approved website updates — 15 October 2026

6 November 2026 repair-page update: the current twelve laptop/PC, Samsung screen and Samsung battery HTML pages in DE/EN/FR/IT preserve the reviewed source. Keep their cost sections immediately after the introduction, direct repair-enquiry links, model/price-on-request guidance, aligned metadata and French vous wording. Older content generators predate this layout and must not overwrite it. No price data, enquiry scripts, URLs or sitemap entries changed. `test_language_context.js` and `test_enquiry_guidance.js` still expect retired inline contact forms and already fail on baseline d308351a; use the current validator and verify the assistant enquiry flow in the browser.

## Current contact flow — 5 November 2026

The published site uses direct email and telephone links. Removed submission forms must stay removed when running older generators. Keep customer contact data out of Analytics. Measure consented contact clicks as intermediate actions with the fixed service category and channel. Legacy thank-you URLs remain noindex contact pages and never emit a submission confirmation. Old session markers are cleared.

Run `python3 _maintenance/validate.py` and `node _maintenance/test_measurement.js` before release. The validator rejects references to the retired provider in public HTML/JavaScript, broken links, and blocked or noncanonical sitemap entries. It also retains price, language, structured-data and bot-route checks. The measurement test covers direct contact, service categories, consent, QA exclusion and stale-marker cleanup without network requests.

The sections below are historical generator notes. Their old form tests and form reconstruction steps are superseded by the current contact flow.

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
