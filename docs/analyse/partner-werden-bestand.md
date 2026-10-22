# Bestand für „Partner werden“

Stand: 21.10.2026, `main` bei `cca8c5d`. Nur gelesen, nichts geändert. Grundlage für die Seite `/partner-werden` (Branch `feature/partner-werden`).

## 1. Wie eine neue Unterseite entsteht

| Schritt | Wo | Was passiert |
|---|---|---|
| Eintrag | `src/App.tsx` → `seiten` | Schlüssel ist der Pfad ohne Schrägstrich am Ende (`'/impressum'`). Felder: `titel`, `beschreibung`, `noindex?`, `inhalt`. `normalisiere()` bildet `/impressum/`, `/impressum.html` und `/index.html` auf den Schlüssel ab. |
| Kopf | `src/entry-server.tsx` → `render()` | schreibt `<title>`, `description`, bei `noindex` `<meta name="robots" content="noindex">`, Open Graph, `og:url`; `canonical` nur ohne `noindex`. Adresse immer mit Schrägstrich am Ende (`https://fixit247.at/impressum/`). `pfade = Object.keys(seiten)`. |
| Vorrendern | `scripts/prerender.mjs` | jede Seite als `dist/<pfad>/index.html`, dadurch läuft sie auf ALL-INKL ohne `.htaccess`. Ein unbekannter Pfad hat keine Datei, der Webserver antwortet 404. |
| Sitemap | `scripts/prerender.mjs` | schreibt heute **nur** `/` (hart). `.claude/rules/seo.md` Punkt 5: mit der ersten neuen indexierbaren Seite die Sitemap aus `pfade` ohne `noindex` erzeugen. |
| Texte | `src/content/copy.ts` | `copy.meta.unterseite` = „{seite} – fixit247“. `copy.meta.beschreibung` teilen sich heute alle Seiten; eine indexierbare Seite braucht eine eigene Beschreibung (`seo.md` Punkt 4). |
| Hülle | `src/components/Seitenrahmen.tsx` | Kopf, Handy-Menü, `<main>`, Fuß, Luna, Preisübersicht. Unterseiten nutzen `aufStartseite={false}`, dann zeigen Anker auf `/#…`. |
| Prüfungen | `tests/e2e/seite.spec.ts`, `lighthouserc.json` | prüft lang, Titel, Meta, `noindex` der Rechtsseiten, 404, `sitemap.xml`, `robots.txt`. Lighthouse misst heute `/` und `/impressum/`. Eine neue Seite muss in beide. |

Links: im Fuß `copy.fuss.links` (Rechtliches) und `copy.kopf.nav` (Anker), im Handy-Menü `copy.menue.links` (Anker) und `copy.fuss.links`. Einen Link auf eine echte Unterseite gibt es in Kopf, Menü und Fuß heute nur für die Rechtsseiten.

## 2. Wie das Anfrageformular sendet

**Browser** (`src/components/AnfrageFormular.tsx`, `src/lib/validate.ts`, `src/lib/submitLead.ts`, `src/lib/endpunkte.ts`):
- Felder unkontrolliert, Werte über `FormData` (Eingaben vor der Hydrierung bleiben stehen).
- Prüfung beim Verlassen eines Feldes und beim Absenden (`pruefeFeld`, `pruefeFormular`); Fehlertext unter dem Feld mit `aria-invalid` und `aria-describedby`, beim Absenden Fokus auf den ersten Fehler.
- Vor der Hydrierung ist der Knopf `type="button"` (kein GET mit Daten in der Adresse).
- Sendefehler als `role="alert"` mit Anruf-Knopf (`ui/CallButton`), die Angaben bleiben. Erfolg ersetzt das Formular, Fokus auf den Titel.
- `submitLead()` schickt `POST` als `URLSearchParams` mit `art=anfrage`, allen Lead-Feldern und `dsgvo=on`. Erfolg nur bei JSON `{ ok: true, match: 'FOUND' | 'NONE' }`, Timeout 20 s.
- Ziel `formEndpunkt()`: auf `localhost` immer `/api/anfrage` (Attrappe `tools/lokale-api.ts`), live `VITE_FORM_ENDPOINT=/anfrage.php` aus `.env.production`.
- **Befund:** Das Formular schickt kein Honigtopf-Feld mit. `anfrage.php` prüft `fax`, aber kein Mensch und kein Bot bekommt dieses Feld angeboten (bekannter offener Punkt).

**Server** (`public/anfrage.php` mit `public/_basis.php`), Reihenfolge:
1. Honigtopf: `fax` ausgefüllt → Antwort `{ ok: true, match: 'NONE' }` ohne Mail (der Bot merkt nichts).
2. Feldlängen: jedes Feld ein String, höchstens 2000 Zeichen, `text` 6000 → `bad_request`.
3. Doppelsendung: gleiche `anfrageId` (6–40 Zeichen) innerhalb von 10 Minuten → alte Antwort, keine zweite Mail (`fixit247-daten/doppelt/<id>.json`).
4. Kontingent: `kontingentFrei('anfrage', 30)`, je IP-Hash (IPv6 je /64) und 6 Stunden → `limit`.
5. Pflichtfelder in `anfrageEingang()`: `art === 'anfrage'`, Name, `dsgvo`, Telefon mit mindestens 6 Ziffern → sonst `bad_request`. Darum endet `art=partner` heute mit `bad_request` (Test „fremde Art“ in `src/luna/backend.test.ts`).
6. Matching gegen die Partnerliste, Fehler darin blockieren nie (dann `NONE`).
7. Speicherung **vor** dem Versand als Zeile in `fixit247-daten/anfragen-JJJJ-MM.jsonl`.
8. Mail an `empfaenger` (Standard `support@fixit247.at`), dann an den gefundenen Partner, dann die Bestätigung an den Kunden. Die Bestätigung enthält nur mit `nurZeichen()` gefilterte Werte und keinen Freitext (kein Spam-Relais). HTML-Werte gehen durch `esc()`.
9. Ausnahme → `upstream`. Antwort immer JSON über `antwort()`.

Mails landen mit `'mail_ordner'` in der Konfiguration als `.eml`-Datei statt bei `mail()` (lokal und in Tests).

**Lokal:** `tools/lokale-api.ts` lehnt alles außer `art=anfrage` mit HTTP 400 ab. Für Partner-Bewerbungen braucht die Attrappe einen eigenen Fall, sonst zeigt jeder e2e-Test den Sendefehler.

## 3. Wie ein Partner in der Konfiguration aussieht

Die Liste steht in `fixit247-konfig.php` unter `'partner'` (außerhalb des Webroots, nie im Repo). Feldbeschreibung im Kopf von `public/anfrage.php`:

| Feld | Pflicht für das Matching | Bedeutung |
|---|---|---|
| `id` | ja | eindeutig, z. B. `'p1'` |
| `company` | ja | Firmenname (steht in Mails und im Protokoll) |
| `contact` | nein | Ansprechperson |
| `trades` | ja | Gewerke-IDs aus `src/content/gewerke.ts`: `installateur`, `shk`, `schluessel`, `elektro`, `geraete` |
| `postalCodes` | ja | Liste von PLZ; Distanz nur über die PLZ-Struktur (gleich 1, gleiche zwei Anfangsziffern 0,6, gleiche erste Ziffer 0,3) |
| `availability` | ja | `'24/7'` oder `'business'` |
| `emergencyService` | ja | `true`/`false`; zählt nachts (18–08 Uhr) und sonntags |
| `email` | für die Vermittlung | an diese Adresse geht die Anfrage |
| `partnerStatus` | ja | nur `'ACTIVE'` wird vermittelt; `'PAUSED'` und `'PENDING'` nie |
| `phone`, `whatsapp` | nein | Kontakt |
| `specializations` | nein | Stichwörter, z. B. `['gastherme']`, verglichen mit dem Anfragetext |
| `serviceRadius` | nein | heute ohne Wirkung (keine Geodaten) |
| `responseTime` | nein | Minuten bis zur Reaktion (0–180) |
| `pricing` | nein | `'low'`, `'mid'`, `'high'` |
| `travelFee` | nein | Anfahrt in Euro |
| `rating`, `completedJobs`, `cancellationRate`, `reliabilityScore` | nein | Kennzahlen, die erst mit echten Aufträgen entstehen |

Daraus folgt für das Formular: abfragen, was Beks für `company`, `contact`, `trades`, `postalCodes`, `availability`, `emergencyService`, `email`, `phone` braucht, dazu freiwillig `specializations`, `responseTime`, `travelFee`. Kennzahlen (`rating` usw.) fragt das Formular nicht ab. `partnerStatus` setzt immer Beks von Hand.

## 4. Was sonst feststeht

- `docs/hosting.md`, Abschnitt „Folgen für den Code“: Die Partneranfrage `art=partner` des früheren Apps Scripts wurde bewusst nicht übernommen, weil es kein Partnerformular gab. Mit dieser Seite kommt sie als eigener Zweig in `anfrage.php` zurück.
- PLZ-Liste: `src/content/plz.json` (PLZ → Ort, ganz Österreich). `src/lib/plz.ts` liest sie.
- Tests der PHP-Teile: `src/luna/backend.test.ts` ruft Funktionen mit `php -r` auf und startet `php -S` mit eigener Konfiguration (`FIXIT247_KONFIG`) und `mail_ordner`. PHP 8.4 ist lokal installiert, die Tests laufen also mit.
- Häufige Fragen: `src/components/Fragen.tsx` mit nativem `<details name="fragen">`. Kein `FAQPage`-Markup (`seo.md`).
- `copy.meta.beschreibung` und Hero-Texte nennen „geprüfte Fachbetriebe“. Für Betriebe gibt es keinen festgelegten Prüfablauf; die Partner-Seite darf deshalb nichts über eine Prüfung versprechen, was Beks nicht von Hand tut.
- Offene Entscheidungen bleiben in `design/SPEC.md` Abschnitt 11 und `docs/livegang.md`.
