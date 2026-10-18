---
paths:
  - "src/content/**/*"
  - "src/App.tsx"
  - "src/entry-server.tsx"
  - "scripts/prerender.mjs"
  - "index.html"
  - "public/.htaccess"
---

# SEO-Leitlinie fixit247

Stand: 18.10.2026. Zusammengefasst aus offiziellen Seiten von Google, Bing, OpenAI, Anthropic und Perplexity (Liste ganz unten).
Gilt für jede Änderung an Seiten, Titeln, Beschreibungen, Texten, Bildern, strukturierten Daten, Sitemap und robots.txt.
Suchmaschinen ändern ihre Regeln. Bevor eine Regel hier etwas verbietet oder verlangt und ihre Quelle älter als sechs Monate ist: Quelle neu lesen, Regel und Datum anpassen.

## Grundsatz

- Für Menschen schreiben, die gerade einen Notfall lösen wollen. Google und Bing sagen beide: Kein Trick ersetzt eigenständigen, nützlichen, richtigen Inhalt.
- KI-Suche (Google AI Overviews und AI Mode, Bing Copilot, ChatGPT, Claude, Perplexity) baut auf derselben Grundlage auf wie die normale Suche. Es gibt keine Sonderoptimierung, keine Sonderdateien, kein Sonder-Markup.
- Vertrauen zählt am meisten. Wasser, Strom, Gas und Geld berühren Sicherheit und Finanzen; dafür gewichtet Google Vertrauenswürdigkeit besonders stark. Jede Aussage muss stimmen und prüfbar sein.

## Wo SEO im Projekt steckt

| Was | Wo |
|---|---|
| Titel, Beschreibung, Titelmuster der Unterseiten | `src/content/copy.ts` → `copy.meta` (Texte nur in `src/content/`) |
| Seitenliste mit Titel, Beschreibung, `noindex` | `src/App.tsx` → `seiten` |
| `<head>`: title, description, robots, Open Graph, canonical, JSON-LD | `src/entry-server.tsx` → `render()` |
| HTML je Seite als `ordner/index.html`, `sitemap.xml`, `robots.txt` | `scripts/prerender.mjs` |
| Adresse der Website | `DOMAIN` in `src/content/contact.ts`: `https://fixit247.at`, ohne www. `public/.htaccess` leitet http und www mit 301 dorthin |
| Prüfungen | `tests/e2e/seite.spec.ts` (lang, title, Meta, noindex, 404, Sitemap, robots), `lighthouserc.json` (SEO ≥ 0,95 auf `/`) |

## Grenzen durch das Geschäftsmodell

fixit247 vermittelt nur. Das gilt für Suchtreffer genauso wie für die Seite:
- Kein Titel, keine Beschreibung, kein Markup darf sagen oder nahelegen, dass fixit247 selbst repariert, ein Notdienst ist oder Preise garantiert. „Vermittlung“ bleibt im Titel der Startseite.
- Kein `LocalBusiness`, `Plumber`, `Locksmith`, `Electrician`, `HVACBusiness`, `HomeAndConstructionBusiness` oder `Service` mit fixit247 als Anbieter. fixit247 selbst wird nur als `Organization` und `WebSite` beschrieben (Entscheidung aus dem Branch `seo`).
- Keine Bewertungen, Sterne oder `AggregateRating` über fixit247 selbst. Bewertungen, die ein Betrieb über sich selbst verwaltet, lässt Google bei `LocalBusiness` und `Organization` für Sterne nicht zu. Nie gefälschte oder nicht offengelegte Bewertungen gegen Gegenleistung.

## Technik

1. Jede indexierbare Seite liefert fertiges HTML mit Hauptinhalt und Überschrift, ohne JavaScript (Prerender). `noindex` und canonical stehen im ausgelieferten HTML und ändern sich durch React nicht.
2. Echte Statuscodes: 200 für Seiten, 404 für unbekannte Pfade. Nie auf die Startseite umleiten statt 404 (Soft-404). Dauerhafte Umzüge mit 301.
3. Eine URL je Inhalt. Kanonische Form mit Schrägstrich am Ende (`/impressum/`), absolut mit `DOMAIN`, gleich in canonical, `og:url`, Sitemap und internen Links. Pfade aus lesbaren Wörtern, klein, mit Bindestrich (`/heizung-klima/`, nicht die interne ID `shk`). Ohne Umlaute ist Projektkonvention: Google verlangt sie in Links prozentkodiert.
4. Eigener `<title>` und eigene `description` je Seite, die den Inhalt dieser Seite beschreiben. Wichtigstes nach vorn, Marke „fixit247“ ans Ende. Ein festes Zeichenlimit gibt es nicht: Google kürzt nach Bildschirmbreite und ersetzt Titel, die den Inhalt nicht treffen. Suchwörter nicht aufstapeln, das wirkt laut Google spammig.
5. Sitemap: alle indexierbaren kanonischen URLs, absolut, also alle `pfade` ohne `noindex`. `prerender.mjs` schreibt heute nur `/`, das stimmt, solange die Rechtsseiten `noindex` tragen. Mit der ersten neuen indexierbaren Seite die Sitemap aus `pfade` erzeugen. `lastmod` nur mit echtem Änderungsdatum, `priority` und `changefreq` weglassen (Google ignoriert sie).
6. robots.txt steuert das Crawlen, nicht den Index. Was nicht in den Index soll, bekommt `noindex` und bleibt crawlbar. CSS, JavaScript, Bilder und Schriften nie sperren.
7. Links sind `<a href>` mit sprechendem Linktext. Jede indexierbare Seite ist über interne Links erreichbar, nicht nur über die Sitemap.
8. Handy und Desktop haben denselben Inhalt, dieselben Meta-Angaben und dieselben strukturierten Daten (Google indexiert die Handy-Fassung).
9. Core Web Vitals gut halten, gemessen am 75. Perzentil der Besuche: LCP bis 2,5 s, INP unter 200 ms, CLS unter 0,1. Die Grenzen in `lighthouserc.json` nicht senken. Google zeigt trotzdem immer den relevantesten Inhalt, auch bei schwächerer Page Experience: Tempo ersetzt keinen Inhalt.
10. Nur eine Adresse: `https://fixit247.at` ohne www. Die 301-Weiterleitung in `public/.htaccess` nicht aufweichen, nie auf http oder www verlinken. `.at` zeigt Google das Zielland Österreich.
11. Bilder ergänzen den Text, sie ersetzen ihn nicht. Inhaltsbilder mit beschreibendem `alt` (deckt sich mit WCAG), sprechende Dateinamen, feste Breite und Höhe. `og:image` mit absoluter Adresse: Google nimmt es neben schema.org-`image` als Vorschaubild. Favicon quadratisch, ab 48 × 48 px, in einem Format von der Google-Favicon-Seite, auf der Startseite verlinkt und crawlbar.
12. Den Zurück-Knopf nie manipulieren, um Besucher festzuhalten (Google-Spam-Richtlinie seit April 2026).

## Strukturierte Daten

- Startseite: JSON-LD nur mit `Organization` und `WebSite`. Jede Angabe muss dem sichtbaren Inhalt entsprechen (Google und Bing); Platzhalter fallen weg.
- `WebSite` bestimmt den Seitennamen über dem Suchtreffer: `name` wie auf der Startseite, `url` = kanonische Startseite.
- `Organization`-Logo, sobald die Logo-Datei da ist: mindestens 112 × 112 px, crawlbar.
- Mit Unterseiten (Start → Gewerk) zusätzlich `BreadcrumbList`, aber nur, wenn die Brotkrumen auch sichtbar sind.
- Nicht verwenden: alles aus „Grenzen durch das Geschäftsmodell“, dazu `FAQPage` (Google zeigt FAQ-Ergebnisse seit 7.5.2026 gar nicht mehr) und `HowTo` (seit 13.9.2023 eingestellt).
- Name, Telefon und Adresse überall gleich: sichtbare Seite, Impressum, JSON-LD.
- Prüfen mit dem Rich-Results-Test und dem Schema-Markup-Validator, sobald die Seite öffentlich ist.

## Inhalte

- Wer, wie, warum muss erkennbar sein: wer hinter fixit247 steht (Firma, Impressum, Kontakt), wie die Vermittlung abläuft, warum es die Seite gibt.
- Eine Seite, ein Thema. Das Wichtigste oben, ohne lange Einleitung. Jede Seite für sich verständlich, Fakten ausdrücklich auf der Seite (Bing).
- Begriffe so, wie Kundinnen und Kunden suchen („Installateur“, „Elektriker“, „Aufsperrdienst“, „Schlüsseldienst“), natürlich in Titel, Überschriften, Linktext und `alt`. Nie aufstapeln, keine Listen von Orten oder Suchwörtern (Keyword-Stuffing).
- Begriffe und Namen einheitlich: „fixit247“ und die Gewerke-Namen aus `src/content/gewerke.ts`.
- Neue Seiten je Gewerk oder Region nur mit eigenem Nutzen: eigene Fragen, Preise laut Rechner, Ablauf, Zuschläge, Sicherheitstipps. Klare, durchklickbare Ordnung (Start → Gewerk → Region).
- Verboten: Seiten je Ort oder Stadt, die sich nur im Ortsnamen unterscheiden oder alle auf dasselbe Formular leiten (Doorway). Massenhaft Seiten für Suchvarianten, egal ob von Hand oder mit KI (Scaled Content Abuse; gilt ausdrücklich auch für KI-Antworten).
- KI darf beim Schreiben helfen. Jeder Text, Titel, `alt`-Text und jedes Markup wird danach von Hand auf Fakten geprüft.
- Versteckter Text ist verboten. Erlaubt laut Google: Akkordeons, Tabs, Tooltips und Text nur für Screenreader.
- Kein Text, der Suchmaschinen oder KI-Systeme steuern soll (Prompt-Injection gilt bei Bing als Missbrauch).
- Der Preisrechner muss halten, was er verspricht (sonst „irreführende Funktion“ laut Google).

## Nicht anlegen

- `<meta name="keywords">`: Google nutzt es nicht.
- `llms.txt`, KI-Textdateien, Markdown-Fassungen, Umbauten „für KI“ (AEO/GEO): Google Search ignoriert sie; es bleibt SEO.
- `nosnippet`, `max-snippet`, `noarchive`, `nocache` auf indexierbaren Seiten: Sie beschneiden Vorschau und KI-Antworten.
- `hreflang`, solange es nur die eine deutsche Fassung für Österreich gibt. Google erkennt die Sprache am sichtbaren Text, nicht an `lang`; `lang="de-AT"` bleibt für die Barrierefreiheit.
- Gekaufte Links, Linktausch, Linknetzwerke.
- Tracking- oder Analyse-Skripte (Projektregel). Search Console und Bing Webmaster Tools brauchen keins.

## KI-Suche und Crawler

- Google AI Overviews und AI Mode: keine Zusatzanforderung, nur indexierbar und als Snippet zulässig.
- Suchbots nie sperren: Googlebot, Bingbot, OAI-SearchBot (ChatGPT-Suche), Claude-SearchBot, PerplexityBot. Wer sie sperrt, fehlt in der jeweiligen Suche.
- KI-Training ist getrennt steuerbar: GPTBot (OpenAI), ClaudeBot (Anthropic), Google-Extended (Gemini-Training und -Grounding; wirkt laut Google nicht auf Aufnahme und Ranking in der Google-Suche).
- Heute lässt `robots.txt` alle zu (`User-agent: *`, `Allow: /`). So lassen, bis der Betreiber über Trainings-Bots entscheidet.

## Offen: nicht selbst entscheiden, Standard lassen und berichten

- **Echte Firmendaten** für Seite, Impressum und JSON-LD (`docs/livegang.md`, Abschnitt Inhalte).
- **Seiten je Gewerk oder Region** (Audit G1). Wenn ja, dann nach „Inhalte“ oben.
- **Google-Unternehmensprofil:** Voraussetzung ist ein Standort mit Kundenverkehr oder Einsätze beim Kunden, die Telefonnummer muss direkt dem Betrieb gehören, keine weiterleitende Nummer oder Adresse. Ein reiner Vermittler erfüllt das vermutlich nicht. Nichts anlegen, mit dem Betreiber klären.
- **Search Console und Bing Webmaster Tools** nach dem Livegang: Domain-Property per DNS-Eintrag (deckt http, https und www ab), kein Analytics- oder Tag-Manager-Skript, Sitemap dort einreichen. Bing kann Seiten aus der Search Console übernehmen.
- **KI-Trainings-Bots sperren** (GPTBot, ClaudeBot, Google-Extended)?
- **IndexNow** (Bing, Yandex, Seznam u. a., nicht Google): Schlüsseldatei im Wurzelverzeichnis, Änderungen melden. Erst nach dem Livegang.

## Vor dem Abschluss einer SEO-Änderung

1. `npm run check` und `npm run test:e2e` (siehe CLAUDE.md), dazu `npm run lighthouse`.
2. `dist/<pfad>/index.html` lesen: title, description, robots, canonical, `og:*` und JSON-LD passen zum sichtbaren Text.
3. Neue indexierbare Seite: in der Sitemap, intern verlinkt, eigener Titel und eigene Beschreibung, Prüfung in `tests/e2e/seite.spec.ts` ergänzt.
4. Live: URL-Prüfung in der Search Console, Rich-Results-Test.

## Quellen

Stand = „Last updated“ der Seite bzw. Tag des Lesens.

Google Search Central:
- Search Essentials: https://developers.google.com/search/docs/essentials (10.12.2025)
- SEO-Starter-Guide: https://developers.google.com/search/docs/fundamentals/seo-starter-guide (10.12.2025)
- Hilfreiche Inhalte: https://developers.google.com/search/docs/fundamentals/creating-helpful-content (5.10.2026)
- Spam-Richtlinien: https://developers.google.com/search/docs/essentials/spam-policies (28.8.2026)
- KI-erzeugte Inhalte: https://developers.google.com/search/docs/fundamentals/using-gen-ai-content (1.10.2026)
- KI-Funktionen: https://developers.google.com/search/docs/appearance/ai-features (10.12.2025)
- Optimierung für generative KI: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide (10.7.2026)
- Google-Crawler und Google-Extended: https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers (15.10.2026)
- Ranking-Systeme: https://developers.google.com/search/docs/appearance/ranking-systems-guide (10.12.2025)
- Titel: https://developers.google.com/search/docs/appearance/title-link (10.12.2025)
- Doppelte URLs und canonical: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls (10.7.2026)
- URL-Struktur: https://developers.google.com/search/docs/crawling-indexing/url-structure (10.12.2025)
- JavaScript: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics (4.3.2026)
- Mobile-First: https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing (10.12.2025)
- Strukturierte Daten, Richtlinien: https://developers.google.com/search/docs/appearance/structured-data/sd-policies (10.7.2026)
- Organization: https://developers.google.com/search/docs/appearance/structured-data/organization (8.9.2026)
- Bilder: https://developers.google.com/search/docs/appearance/google-images (2.3.2026)
- Favicon: https://developers.google.com/search/docs/appearance/favicon-in-search (28.8.2026)
- Search Console, Bestätigung: https://support.google.com/webmasters/answer/9008080 (18.10.2026 gelesen)
- Seitennamen: https://developers.google.com/search/docs/appearance/site-names (10.12.2025)
- Sitemaps: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap (8.7.2026)
- Core Web Vitals: https://developers.google.com/search/docs/appearance/core-web-vitals (10.12.2025), Perzentil: https://web.dev/articles/defining-core-web-vitals-thresholds (7.5.2025)
- Page Experience: https://developers.google.com/search/docs/appearance/page-experience (22.9.2026)
- Bewertungen: https://developers.google.com/search/docs/appearance/structured-data/review-snippet (8.9.2026)
- Länder und Sprachen: https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites (10.12.2025)
- HowTo und FAQ: https://developers.google.com/search/blog/2023/08/howto-faq-changes (8.8.2023, Nachtrag 14.9.2023)
- Änderungsprotokoll: https://developers.google.com/search/updates (FAQ eingestellt 8.5.2026, llms.txt 15.6.2026, Zurück-Knopf 13.4.2026, og:image 2.3.2026, noindex und canonical bei JavaScript 15./17.12.2025)

Andere:
- Google-Unternehmensprofil, Richtlinien: https://support.google.com/business/answer/3038177 (18.10.2026 gelesen)
- Bing Webmaster Guidelines: https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a (18.10.2026 gelesen)
- IndexNow: https://www.indexnow.org/documentation
- OpenAI-Crawler: https://developers.openai.com/api/docs/bots
- Anthropic-Crawler: https://privacy.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler (7.4.2026)
- Perplexity-Crawler: https://docs.perplexity.ai/guides/bots
