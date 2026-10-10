# Website language sources

Run `python3 _localization/build.py` from the repository to regenerate the German pages and complete English, French and Italian versions. No network access or dependencies are required.

`source/` contains the existing layouts and German copy plus the previously published translated mail-in pages. `translations.json` contains translation drafts of the public website text. Key navigation, service descriptions and consent copy have editorial overrides in `build.py` and `manual-extra.json`; search titles and descriptions are maintained in `seo-copy.json`.

Google Translation supplied initial drafts; editorial corrections preserve names, component specifications, Swiss terminology, prices and form meanings. Review new copy in each language when changing the source. Edit these source files and dictionaries, then regenerate; avoid editing generated HTML alone. Existing backend form field names and values are intentionally preserved; `Website-Sprache` identifies the customer's website language.

All translations are rendered into HTML for indexing and do not need a translation API in the visitor's browser. The underscore directory is excluded from the GitHub Pages Jekyll output.
