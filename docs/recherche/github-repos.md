# GitHub-Repos, die Ihren Projekten helfen

Stand: 18.10.2026. Gesucht waren vertrauenswürdige Repos, die offene Punkte in Ihren Projekten schließen. Kein Repo steht hier, weil es beliebt ist. Jedes steht, weil es einen konkreten offenen Punkt schließt und die Prüfung in Abschnitt 2 bestanden hat.

## 1. Kurzfassung

1. **Zuerst Ihre eigenen Abhängigkeiten aktualisieren.** Die Lockfiles von `direktbestell`, `ValorantKinderspiel` und `mietmich` enthalten Produktionspakete mit bekannten Lücken, zwei davon mit Schwere „critical“ (Abschnitt 4). Das ist die größte Sicherheitswirkung und braucht kein neues Repo.
2. **Lieferkette in fixit247 absichern:** `min-release-age` in `.npmrc` und ein Dependabot-Eintrag mit `cooldown`. Beides ist eine Einstellung, kein Repo. Dazu `google/osv-scanner` für alle Ökosysteme.
3. **`lovell/sharp` als devDependency** statt des fremden globalen Moduls aus `omniroute` (`SHARP_MODULE_PATH`).
4. **`gitleaks/gitleaks`** als Pre-Commit-Prüfung. Der OpenAI-Schlüssel stand schon einmal in einem Transkript.
5. **`promptfoo/promptfoo`** für Luna: Prompt-Injection und die Zusagen-Regeln gegen `chat.php` testen.
6. **`ChromeDevTools/chrome-devtools-mcp`** für die Lighthouse-Probleme (LCP, TBT), die immer wieder auftauchen.

Alles andere ist „bei Bedarf“ (Abschnitt 5) oder bewusst verworfen (Abschnitt 6).

## 2. Was „sicher“ hier heißt

Gleiche Schwellen für jedes Kandidaten-Repo, per Skript abgefragt (GitHub-API, OpenSSF Scorecard, OSV, npm-Registry, Packagist, pub.dev):

| Prüfung | Grün | Gelb | Rot |
|---|---|---|---|
| Pflege | Push in den letzten 6 Monaten | Release älter als 6 Monate | archiviert oder älter als 6 Monate |
| Lizenz | MIT, Apache-2.0, BSD, ISC | GPL, AGPL, LGPL, MPL (nur als lokales Werkzeug, nie in die ausgelieferte Seite gelinkt) | keine Lizenz |
| Bekannte Lücken (OSV) | 0 für die aktuelle Version | – | mindestens 1 |
| Scorecard | 5 oder mehr | nicht bewertet | unter 5 |
| npm | keine Install-Skripte (Provenance ist ein Pluspunkt) | – | Install-Skript |
| Vorfälle | keine veröffentlichte GitHub-Advisory zu einer Kompromittierung des Repos; keine Treffer bei meiner Suche nach gekaperten Actions/Tags 2025/2026 (gefunden: tj-actions, Trivy) | – | Kompromittierung |
| Passung | läuft mit React 19.3, Vite 8, Tailwind 4, TS 6, ESLint 10, Node 22 | – | Peer-Konflikt |

Dazu die Filter aus `CLAUDE.md`: keine externen Requests, kein CDN, kein Tracking **in der ausgelieferten Seite**. Werkzeuge, die nur beim Bauen oder Entwickeln laufen, sind erlaubt. Wo ein Werkzeug trotzdem nach außen funkt, steht es in der Spalte „Einbau“.

Gelb heißt: erlaubt, mit der genannten Einschränkung. Rot flog raus (Abschnitt 6).

## 3. Wie ich „meine bisherigen Projekte“ gelesen habe

Ihr GitHub-Konto hat rund 70 Repos. Ich habe Beschreibung, `package.json`/`pubspec.yaml`/README und bei den Apps das `package-lock.json` gelesen (nur lesend, mit Ihrer angemeldeten `gh`). Daraus ergeben sich diese Familien:

| Familie | Repos | Stack | Stand |
|---|---|---|---|
| **fixit247** | `asdasdsad` (dieses Projekt) | Vite 8, React 19.3, Tailwind 4, PHP-Endpunkte, ALL-INKL | aktiv, 17.10. |
| **mietmich** | `mietmich` | Capacitor 8 (Android), Supabase, Stripe, Radix, TanStack Query | aktiv, 12.10. |
| KI-Backends | `direktbestell` (Hono, Supabase, Stripe, Gemini), `ValorantKinderspiel` (Express 5, Anthropic SDK, SQLite, multer) | Node | ruhend seit Juni/Juli |
| Kundenseiten Wien | `Webseiteinstallateur`, `Hoskar_Restaurant.Demo`, `B-roServiceWebseite`, Taborstraße-Seiten, rund 30 HTML-Stände vom August/September | statisch bzw. React, GSAP, Lenis | ruhend |
| Flutter-Demos | die zwei Dart-Repos mit `fixify_mcp_server` | Dart | ruhend seit September |
| React-Vorlagen | `Anrufwache`, `Books`, `Anh-nglich`, `Projekt_Athritis` | React 19, GSAP, Tailwind 4, axe, Lighthouse | ruhend |

`Wand-Enhancer` (Fork einer Erweiterung für die WeMod-App) habe ich nicht berücksichtigt.

## 4. Fund in Ihren eigenen Lockfiles (zuerst erledigen)

Abfrage der Produktionspakete gegen OSV am 18.10.2026. Schwere laut GitHub-Advisory. Kein Eingriff, nur Befund.

| Repo | Paket (Lockfile) | Schwere | Behoben ab | Hinweis |
|---|---|---|---|---|
| mietmich | `@capacitor/android` 8.4.2 | **critical** | 8.4.3 (aktuell 8.5.3) | Fremdinhalt kann über den internen Proxy-Pfad im App-Ursprung geladen werden. Advisory vom 05.10.2026. Betrifft 8.3.5 bis 8.4.2. |
| ValorantKinderspiel | `proxy-addr` 2.0.7 | **critical** | 2.0.8 | IP-Spoofing über IPv4-mapped-IPv6 bei `trust proxy` mit Subnetzen. Nur relevant, wenn Sie das gesetzt haben. |
| ValorantKinderspiel | `multer` 2.2.0 | high | 2.3.0 (aktuell 2.4.0) | 5 Meldungen, darunter Denial of Service durch Datei-Handle-Leck. `^2.2.0` zieht bei `npm update` automatisch nach. |
| ValorantKinderspiel | `qs` 6.15.3 | medium | 6.16.0 | |
| direktbestell | `hono` 4.12.25 | bis medium | 4.12.34 (aktuell 4.13.13) | 11 Meldungen (ReDoS in CORS, DoS in Language-Middleware). |
| direktbestell | `@hono/node-server` 2.0.5 | medium | 2.0.10 | Speicherleck durch abgebrochene Anfragen. |
| direktbestell | `protobufjs` 7.6.4 | medium | 7.6.5 | |
| fixit247 | – | – | – | **Produktion: 0** (`npm audit --omit=dev`). Die 17 Meldungen von `npm audit` stecken alle in der Entwicklung, vor allem in der Kette von `@lhci/cli` (`uuid`, `tmp`, `basic-ftp`, `extract-zip`). |
| Anrufwache | – | – | – | Produktion: 0, nur Entwicklung (OpenTelemetry-Kette). |

Dazu: Von den fünf geprüften Repos (`mietmich`, `direktbestell`, `ValorantKinderspiel`, `Anrufwache`, fixit247) hat nur `ValorantKinderspiel` einen `.github`-Ordner (Inhalt nicht geprüft). Keines der fünf hat einen Update-Dienst. Im Git-Verlauf von fixit247 fand eine grobe Mustersuche (OpenAI-, Google-Schlüssel, private Schlüssel) 0 Treffer, und `.env` ist ignoriert. Das ersetzt keinen echten Scanner.

## 5. Empfohlen

### 5.1 Jetzt, für fixit247 und alle aktiven Repos

| Repo | Schließt | Befund | Einbau |
|---|---|---|---|
| **Dependabot** (GitHub-Funktion; Code: `dependabot/dependabot-core`, MIT, 5.805 ★, Scorecard 8,4) | Kein Update-Dienst, kein `.github` | Push 17.10.2026, v0.400.0 | `.github/dependabot.yml` mit `cooldown` (Wartetage) je Ökosystem. Sicherheits-Updates warten laut Quellen nicht. Bei einer Gruppe mit `patterns: ["*"]` greift die Wartefrist laut einem Bericht nicht: einzeln eintragen und testen. |
| **npm `min-release-age`** (Einstellung, kein Repo) | Frisch veröffentlichte Versionen werden sofort installiert; laut Berichten nutzten die npm-Angriffe 2026 (Mastra, AsyncAPI) genau dieses Zeitfenster kurz nach der Veröffentlichung. `--ignore-scripts` allein hilft nicht, der AsyncAPI-Schadcode lief erst beim Import | In npm 11.12.1 vorhanden (`npm config list -l` zeigt `min-release-age = null`) | `.npmrc` mit `min-release-age=3` (Einheit Tage, laut der npm-Doku auf Ihrem Rechner; gibt es keine ältere Version, bricht der Befehl ab). `engines` verlangt nur Node 22.13 und damit npm 10: im README npm 11.10+ nennen. |
| **google/osv-scanner** | `npm audit` kennt nur npm; Sie haben auch `composer`-, `pub`-Pakete (PHPMailer, Dart) und mehrere Repos | Apache-2.0, 11.202 ★, v2.7.0 (12.10.), Scorecard 8,6 (Maintained 10, Code-Review 10), Push 17.10. | Lokales Binär: `osv-scanner scan source -r .` je Repo. Es liest `package-lock.json`, `composer.lock` und `pubspec.lock` und macht genau die Abfrage aus Abschnitt 4. Es sendet Paketnamen, Versionen und Datei-Hashes an OSV.dev und deps.dev (nur beim Entwickeln); mit `--offline` bleibt alles lokal. |
| **lovell/sharp** | `export-3d.mjs` und `prepare-icons.mjs` laden `sharp` aus dem globalen Ordner von `omniroute` per `SHARP_MODULE_PATH`: fremder, ungeprüfter Code im Bauprozess | Apache-2.0, 32.774 ★, v0.35.5 (27.09.), Provenance ja, OSV 0, keine Install-Skripte, Scorecard 6,7 | `npm i -D sharp`, `SHARP_MODULE_PATH` aus Skripten und Notizen streichen. `mietmich` hat `sharp` 0.32.6 mit Meldungen im Lockfile (über `@capacitor/assets`). |
| **gitleaks/gitleaks** | Schlüssel im Verlauf oder in Commits (OpenAI-Schlüssel stand schon in einem Transkript) | MIT, 30.090 ★, Push 30.09., v8.30.1 vom 21.03.: **gelb** (Release älter als 6 Monate), Scorecard nicht bewertet | Binär von der Release-Seite, Prüfsumme gegen `checksums.txt`. Pre-Commit-Hook mit `gitleaks git --pre-commit --redact --staged --verbose` (so steht er in der Hook-Datei des Projekts; `detect` und `protect` sind seit v8.19 veraltet). Einmal über den ganzen Verlauf: `gitleaks git -v --log-opts="--all"`. Die jüngere Alternative `betterleaks/betterleaks` (MIT, 2.258 ★, seit 02/2026) ist bewusst nicht gewählt. |
| **promptfoo/promptfoo** | Luna hat nur `test:ki` (einzelne Fälle gegen das echte Modell). Prompt-Injection, Preiszusagen, „fixit247 repariert selbst“ sind nicht systematisch getestet | MIT, 26.106 ★, v0.124.1 (08.10.), Provenance ja, OSV 0, keine Install-Skripte. Scorecard nicht bewertet. Berichten zufolge gehört promptfoo seit 03/2026 OpenAI | `npx promptfoo` in einem eigenen Ordner, **nicht** in die `package.json`. HTTP-Ziel `http://127.0.0.2/chat.php` wie beim Versand-Test. Vorher `PROMPTFOO_DISABLE_TELEMETRY=1` und `PROMPTFOO_DISABLE_REDTEAM_REMOTE_GENERATION=true`, sonst gehen Angriffs-Prompts über deren Dienst. Eigenen Schlüssel als `redteam.provider` setzen. Deckt laut Doku nur bekannte Jailbreak-Vorlagen, indirekte Injection braucht eigene Plugins. |
| **ChromeDevTools/chrome-devtools-mcp** | Lighthouse-Rätsel (LCP ≈ TTI, TBT 3–6 s mit `objekte-3d`, Browser-Pane ohne rAF): echte Performance-Traces statt Raten | Apache-2.0, 53.781 ★, v1.11.0 (15.10.), Provenance ja, OSV 0, 2 Advisories (historisch), Scorecard nicht bewertet | MCP-Eintrag mit `--no-usage-statistics`, `--no-performance-crux` (sonst gehen Trace-URLs an die Google-CrUX-API) und `CHROME_DEVTOOLS_MCP_NO_UPDATE_CHECKS=1`. Nur gegen `localhost` benutzen: Der Server gibt Browserinhalte an Claude weiter. |
| **webpro-nl/knip** | Tote Dateien und Abhängigkeiten, etwa mögliche Reste alter Pipelines wie `scripts/prepare-icons.mjs` (die Symbole kommen jetzt aus Blender). Ihre Regel: Überholtes löschen | ISC, 12.471 ★, v6.42.0 (18.10.), OSV 0, keine Install-Skripte, Provenance nein, Scorecard nicht bewertet | Einmal `npx knip`, Treffer von Hand prüfen, nichts installieren. Kein Dauerlauf in `npm run check`. |
| **vimeo/psalm** | `anfrage.php` und `chat.php` (zusammen 686 Zeilen) wurden von Hand geprüft, aber nie mit Taint-Analyse (Eingaben bis `mail()`, `header()`, Ausgabe) | MIT, 5.897 ★, 6.20.0 (09.10.), OSV 0, Scorecard 4,7: **gelb** (Code-Review 0, ein Hauptentwickler) | Einmalig in einem Wegwerf-Ordner: `composer require --dev vimeo/psalm`, dann `psalm --taint-analysis public/`. Nicht in die Auslieferung. PHPStan hat laut Quellen keine Taint-Analyse, darum nicht gewählt. |

### 5.2 Bei Bedarf

| Repo | Wann | Befund | Einbau |
|---|---|---|---|
| **zizmorcore/zizmor** und **suzuki-shunsuke/pinact** | Sobald Sie den ersten GitHub-Workflow anlegen (heute gibt es keinen) | zizmor: MIT, 6.725 ★, v1.31.1 (15.10.). pinact: MIT, 1.231 ★, v5.0.0 (12.09.). Beide Scorecard nicht bewertet: **gelb** | Actions auf volle Commit-Hashes festlegen (`pinact`), Workflows prüfen (`zizmor`). Gekaperte Tags 2025/2026 (tj-actions, Trivy) trafen nur Projekte mit Tag statt Hash. |
| **ossf/scorecard-action** | Nur wenn ein Repo öffentlich wird | Apache-2.0, 424 ★, v2.5.0 (12.10.), Scorecard 7,9 | Bei privaten Repos bringt es wenig. |
| **MobSF/Mobile-Security-Framework-MobSF** | Vor dem ersten Play-Store-Release von `mietmich` (Capacitor-WebView, Stripe, Supabase) | GPL-3.0: **gelb**. 21.982 ★, v4.5.3 (21.09.), Scorecard 6,9, 25 historische Advisories (u. a. SQL-Injection im DB-Viewer, laut Drittquelle ab 4.4.6 behoben) | Nur im Docker-Container, eigene APK hochladen, Befunde von Hand prüfen (Scanner melden auch Falsches). |
| **OWASP/mastg** | Prüfliste für die gleiche App | CC-BY-SA-4.0 (Dokumentation), 13.261 ★, v2.0.0 (30.06.) | Nur lesen. |
| **supabase/agent-skills** | Bei `mietmich`/`direktbestell`: RLS-Regeln, Schlüsselhandling | MIT, 2.871 ★, v0.1.9 (28.09.): **gelb** (jung). Skill-Dateien sind Anweisungen an Claude, vor der Installation lesen | `npx skills add supabase/agent-skills`, wie vom Supabase-MCP empfohlen. `get_advisors` im angebundenen Supabase-MCP prüft RLS ohnehin. |
| **languagetool-org/languagetool** | Rechtschreib-/Stilprüfung der Seitentexte. `AustrianGerman.java` existiert im Quelltext | LGPL-2.1: **gelb**. 15.158 ★, Push 18.10., Scorecard 5,9 | Lokaler Server (Java/Docker), Sprache `de-AT`. Nur Entwicklung. Ersetzt nicht `copy-checker` (Tonalität, Geschäftsmodell). |
| **helmetjs/helmet**, **express-rate-limit/express-rate-limit** | Wenn `ValorantKinderspiel` (Express 5) wieder läuft | helmet: MIT, 10.737 ★, v8.3.0, Scorecard 6,3, Provenance nein. express-rate-limit: MIT, 3.313 ★, v8.7.1 (06.10.), Provenance ja. OSV 0 | Zwei Middleware-Zeilen. |
| **rhinobase/hono-rate-limiter** | Wenn `direktbestell` wieder läuft | MIT, 656 ★, v0.5.4 (06.09.), Provenance ja, OSV 0: **gelb** (klein). Sicherheitsheader gibt es schon eingebaut: `hono/secure-headers` | Eine Middleware. |
| **google/schema-dts** | Sobald JSON-LD mehr als `Organization` und `WebSite` umfasst (eigene Gewerke-Seiten) | Apache-2.0, 1.250 ★, v2.1.0 (02.10.), OSV 0, nur Typen, kein Laufzeitcode, Scorecard 6,0 | `npm i -D schema-dts`. Heute zwei Objekte: nicht nötig. |
| **dart-lang/ai** (`dart_mcp`) | Falls Sie die Flutter-Demos weiterführen | BSD-3-Clause, 287 ★, Push 16.10., `dart_mcp` 0.5.2, 150 pub-Punkte, Herausgeber `labs.dart.dev`, OSV 0 | Statt `mcp_server ^1.0.3`. Das Paket gibt es als v3.0.0 vom verifizierten Herausgeber `makemind.dev`, aber die Dart-Eigenentwicklung ist die sicherere Wahl. |
| **darkroomengineering/lenis** und `gsap` (npm) | Kundenseiten, die GSAP und Lenis noch per CDN laden (`Hoskar_Restaurant.Demo`) | lenis: MIT, 16.661 ★, v1.3.27 (15.10.). gsap 3.15.0 (13.04.), Lizenz „no charge“, nicht OSI | Selbst hosten wie in `Webseiteinstallateur`: gleiche Regel wie in Ihrer `CLAUDE.md`. |
| **PHPMailer/PHPMailer** | Nur als Notfallplan, falls ALL-INKL `-f support@fixit247.at` live ablehnt | LGPL-2.1: **gelb**. 22.316 ★, v7.1.1 (18.05.), OSV 0, 13 historische Advisories, Scorecard 6,5 | Versand über den SMTP des Anbieters. Heute `mail()` ohne SMTP, bewusst entschieden. |

## 6. Geprüft und verworfen

| Repo | Grund |
|---|---|
| `aquasecurity/trivy` | Am 19.03.2026 wurden 75 von 76 Tags von `trivy-action` auf Schadcode umgebogen, das Binär v0.69.4 war kurz vergiftet. `osv-scanner` reicht. |
| `jsx-eslint/eslint-plugin-jsx-a11y` | Peer-Abhängigkeit nur bis ESLint 9, letzter Release 05.01.2025, Scorecard 4,7. axe im e2e-Test prüft die gerenderte Seite ohnehin. |
| `SamKirkland/FTP-Deploy-Action` | Scorecard 3,5 (Maintained 0), letzter Release 23.04.2026. Dazu müsste der FTP-Zugang als GitHub-Secret liegen. |
| `Burnett01/rsync-deployments` | Braucht SSH. ALL-INKL bietet SSH laut eigener Anleitung erst ab dem Tarif Premium. Scorecard 5,9 (Maintained 3). Manueller Upload (`docs/hosting.md`) bleibt, bis geklärt ist, ob Ihr Tarif SSH hat. |
| `trufflesecurity/trufflehog` | AGPL-3.0, und es prüft gefundene Schlüssel aktiv gegen die Dienste. Gut (Scorecard 7,9), aber für einen lokalen Pre-Commit nicht nötig. |
| `renovatebot/renovate` | AGPL-3.0, 25 Advisories. Dependabot genügt. |
| `NVIDIA/garak`, `confident-ai/deepteam`, `ReversecLabs/spikee` | Gut gepflegt, aber Python bzw. kleiner als promptfoo. `deepteam`: letzter Release 12.11.2025. |
| `Azure/PyRIT`, `protectai/llm-guard` | Archiviert. |
| `anthropics/claude-code-security-review` | Letzter Push 11.02.2026. Das lokale `/security-review` gibt es schon. `claude-code-action` brauchen Sie erst mit einem PR-Ablauf. |
| `ahujasid/blender-mcp` (heute `mcp-for-blender`) | `execute_blender_code` führt beliebiges Python im Blender-Prozess aus. Ihre Pipeline läuft schon skriptgesteuert mit `blender -b -P`. |
| `upstash/context7` | MIT, 63.237 ★, OSV 0, aber Anfragen laufen über Upstash, und Doku-Inhalte sind fremde Eingaben. `WebFetch` und `WebSearch` decken Aktuelles ab. |
| `microsoft/playwright-mcp`, `github/github-mcp-server` | Playwright und `gh` sind bereits da. |
| `zeux/meshoptimizer` (gltfpack) | Kein offener Punkt: Ihre Pipeline läuft schon mit `--simplify false`. Ob gltfpack die Normalen beim Vereinfachen besser erhält als glTF-Transform, konnte ich nicht belegen (`@gltf-transform/cli` hängt ohnehin von `meshoptimizer ~1.2.0` ab). |
| `pmndrs/react-three-fiber`, `pmndrs/drei` | Scorecard 4,4 bzw. 3,7, und `buehne3d.ts` existiert. Kein offener Punkt. |
| `altcha-org/altcha-lib-php` | `anfrage.php` hat Honigtopf, Kontingent je IP (mit `flock`) und Dublettenschutz. Nicht nötig; die Bibliothek habe ich nicht weiter geprüft. |
| `supabase/splinter` | Keine Lizenz. Die Prüfungen laufen über `get_advisors`. |
| `anthropics/skills` | GitHub zeigt keine einheitliche Lizenz; Sie haben die Skills bereits als Plugin. |
| `lycheeverse/lychee`, `html-validate`, `harlan-zw/unlighthouse`, `ai/size-limit`, `svg/svgo` | Kein offener Punkt: Lighthouse-CI, e2e-Tests und Blender-Icons decken das ab. |

## 7. Kein Repo nötig

- **Wartefrist für neue npm-Versionen:** Einstellung in `.npmrc` und `dependabot.yml`.
- **`og:image` als 1200×630-JPEG:** einmaliger Export mit `sharp`, kein Generator wie `satori`.
- **Sitemap aus `pfade`:** wenige Zeilen in `scripts/prerender.mjs`.
- **Honigtopf `fax`:** Das Feld prüft nur PHP, kein Formular zeigt es. Das ist Code.
- **WCAG 2.2.2** (Pause für GridPulse und Wirbelfläche) und `prefers-reduced-motion` für die Paper-Shader: Code.
- **PW_PORT-Kollision:** `playwright.config.ts` (freien Port wählen, `reuseExistingServer` abschalten).
- **Sicherheitsheader und CSP** in `public/.htaccess`: Code. Prüfen mit dem MDN HTTP Observatory (Onlinedienst).
- **Hono-Sicherheitsheader:** eingebaut (`hono/secure-headers`).

## 8. Grenzen dieser Prüfung

- Ich habe nichts installiert, heruntergeladen oder ausgeführt. Die Befunde stammen aus APIs und Webseiten, nicht aus einem Verhaltenstest der Werkzeuge.
- Sterne sind kein Sicherheitsmerkmal. OSV und Scorecard sehen nur **bekannte** Lücken und Prozesse. Ein frisch gekaperter Release ist erst nach einer Meldung sichtbar, dafür die Wartefrist.
- Die Suche nach Kompromittierungen war breit (npm-Angriffe 2026, gekaperte Actions), nicht je Werkzeug einzeln.
- Viele Scorecards waren nicht abrufbar („nicht bewertet“). Das habe ich nur gelb gewertet, nicht rot.
- Mehrere Webquellen sind Herstellerblogs. Belegt habe ich nur, was ich direkt abgefragt oder in der Originaldokumentation gelesen habe: die Zahlen in den Tabellen, die Flags von `chrome-devtools-mcp` und `promptfoo`, die Capacitor-Versionsbereiche, `min-release-age` in npm 11.12.1, `AustrianGerman.java`.
- Der Schweregrad in Abschnitt 4 stammt aus den GitHub-Advisories. Ob eine Lücke in Ihrer Nutzung greift, habe ich nicht geprüft (z. B. `proxy-addr` nur mit `trust proxy`).
- Datenschutz-Fragen (DSGVO, CDN-Urteile) sind keine Rechtsberatung.

## 9. Quellen

- Microsoft: [Mastra-Kompromittierung](https://www.microsoft.com/en-us/security/blog/2026/06/17/postinstall-payload-inside-mastra-npm-supply-chain-compromise/), [AsyncAPI-Kompromittierung](https://www.microsoft.com/en-us/security/blog/2026/07/15/unpacking-asyncapi-npm-supply-chain-compromise-import-time-payload-delivery/)
- [Trivy GitHub Actions Supply Chain Compromise (Snyk)](https://snyk.io/articles/trivy-github-actions-supply-chain-compromise/), [The Hacker News](https://thehackernews.com/2026/03/trivy-security-scanner-github-actions.html)
- [Package managers need to cool down](https://nesbitt.io/2026/03/04/package-managers-need-to-cool-down.html)
- [Promptfoo: OWASP LLM Top 10](https://www.promptfoo.dev/docs/red-team/owasp-llm-top-10/), [Red-Team-Konfiguration](https://www.promptfoo.dev/docs/red-team/configuration/), [Telemetrie](https://www.promptfoo.dev/docs/configuration/telemetry/)
- [chrome-devtools-mcp README](https://github.com/ChromeDevTools/chrome-devtools-mcp)
- [Express: Sicherheits-Releases 30.06.2026](https://expressjs.com/it/blog/2026-06-30-security-releases) (multer)
- [Psalm: Sicherheitslücken finden](https://psalm.dev/articles/detect-security-vulnerabilities-with-psalm)
- [ALL-INKL: SSH-Aktivierung](https://all-inkl.com/en/support/tutorials/kas/ssh/file-management/activation-of-ssh-only-possible-in-the-main-account_395.html)
- [Blender-MCP-Sicherheit](https://www.strayspark.studio/blog/is-blender-mcp-safe-security-guide-2026) (Drittquelle)
- [MobSF](https://appsecsanta.com/mobsf) (Drittquelle)
- Zahlen zu Sternen, Pushs, Lizenzen: GitHub-API; Scorecard: api.securityscorecards.dev; Lücken: api.osv.dev; Versionen: npm-Registry, Packagist, pub.dev. Alle am 18.10.2026 abgefragt.
