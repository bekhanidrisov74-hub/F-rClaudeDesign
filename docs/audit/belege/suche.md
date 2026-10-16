# Rohbelege Auffindbarkeit: Suchanfragen und Seitenprüfung

Datum der Erhebung: 2026-10-15. Kein Code geändert.

## Methode und Grenzen (zuerst lesen)

- Suche mit dem WebSearch-Werkzeug (laut Werkzeugbeschreibung "US-only", keine Regionseinstellung möglich). Das ist keine echte Google-Ergebnisseite für Österreich. Der "Rang" ist die Reihenfolge, in der das Werkzeug die Treffer liefert. Es kamen 9, 9 und 10 Treffer zurück.
- Anfrage 3 lieferte überwiegend Treffer ohne Bezug zu Grazer Elektro-Notdiensten (Nachricht, deutsche und Schweizer Seiten, PDF, Stellenanzeigen). Belegwert für Graz ist deshalb gering.
- Seitenart bei nicht abgerufenen Treffern ist aus Titel und URL abgeleitet und mit (*) markiert.
- Pro Anfrage wurden die 3 inhaltlich passendsten Treffer abgerufen (WebFetch). WebFetch liefert nur gerenderten Text, keinen Quelltext. Deshalb wurden `<title>`, H1 und strukturierte Daten zusätzlich per `curl` aus dem Roh-HTML gelesen (nur gelesen, nichts gespeichert). Textmengen sind Schätzungen des WebFetch-Modells, keine Zählungen.
- Telefonnummer "im Kopf" und Preise stammen aus dem gerenderten Text (WebFetch).
- Nicht abgerufen: die Firmenwebsites hinter den Verzeichniseinträgen (z. B. profi-schloss.at, installateur.wien, schlosswechsel-wien.at). Aussagen zu Betriebsseiten selbst sind daher nicht belegt.
- Vergleichsseite fixit247: alle Angaben stammen aus dem Auftrag, nicht aus einer eigenen Prüfung des Repos.

---

## Anfrage 1: "Schlüsseldienst Notdienst Wien"

| Rang | Titel (wie geliefert) | URL | Art |
|---|---|---|---|
| 1.1 | schluesseldienstprofi wien | https://www.startbase.com/organization/schluesseldienstprofi-wien/ | Verzeichnis (*) |
| 1.2 | aufsperrdienst magickey | https://sellwerk.de/firmenprofil/aufsperrdienst-magickey | Verzeichnis (*), deutsches Portal |
| 1.3 | schluesseldienstprofi wien | https://www.startbase.de/organization/schluesseldienstprofi-wien/ | Verzeichnis (*), Duplikat zu 1.1 |
| 1.4 | Seriöser Aufsperrdienst und Schlüsseldienst in Wien | https://www.ganz-wien.at/immobilien-wohnen/aufsperrdienst-schluesseldienst.html | Ratgeber mit Anbieterblöcken (abgerufen) |
| 1.5 | aufsperrdienst schluesseldienst profischloss | https://www.herold.at/gelbe-seiten/wien/9rHqn/aufsperrdienst-schluesseldienst-profischloss/ | Verzeichnis (abgerufen) |
| 1.6 | MyKeys - Aufsperrdienst & Schlüsseldienst Wien | https://www.herold.at/gelbe-seiten/wien/PWzPT/mykeys-aufsperrdienst-und-schluesseldienst-wien/ | Verzeichnis (*) |
| 1.7 | 4422 schlosswechsel wien und sicherheitsschloss tauschen | https://www.tips.at/freizeit/bauen-wohnen/4422-schlosswechsel-wien-und-sicherheitsschloss-tauschen | Ratgeber, als "Anzeige" gekennzeichnet (abgerufen) |
| 1.8 | 5841 serioesen schluesseldienst in wien finden was tun wenn man ausgesperrt ist | https://www.tips.at/freizeit/bauen-wohnen/5841-serioesen-schluesseldienst-in-wien-finden-was-tun-wenn-man-ausgesperrt-ist | Ratgeber (*) |
| 1.9 | Sorgenfrei im Urlaub: Schlüsseldienst als Retter in der Not | https://www.almenrausch.at/service/detail/sorgenfrei-im-urlaub-schluesseldienst-als-retter-in-der-not/ | Ratgeber (*) |

Zählung Anfrage 1: Verzeichnis 5 (1.1, 1.2, 1.3, 1.5, 1.6), Ratgeber 4 (1.4, 1.7, 1.8, 1.9), Betrieb 0, Vermittler/Plattform 0.

### Abgerufene Seiten Anfrage 1

| ID | Seite | Title (Roh-HTML) | H1 | Unterseite je Gewerk / Stadt | Telefon im sichtbaren Kopf | Preise | Strukturierte Daten (Roh-HTML) | Text zum Gewerk (geschätzt) |
|---|---|---|---|---|---|---|---|---|
| F1.1 | ganz-wien.at Aufsperrdienst (= 1.4) | "Schlüsseldienst und Aufsperrdienst in Wien, 24h Notruf" | "Seriöser Aufsperrdienst und Schlüsseldienst in Wien" | Nein. Einzelartikel; Bezirke 1010 bis 1220 und Umland nur im Fließtext. | Nein; erste Nummer direkt nach der H1 im Anbieterblock | Ja: Ab-Preise Standardfälle, Zuschläge (Abend, Nacht, Wochenende, Sicherheitstüren), Nachmachpreise; ein Anbieter wirbt mit Festpreis | JSON-LD: Organization, BreadcrumbList, ImageObject. Microdata: Article, 3x Question/Answer (FAQ-artig). Kein LocalBusiness, kein Service, kein FAQPage. | 1.500 bis 1.800 Wörter |
| F1.2 | Herold Profischloss (= 1.5) | "Aufsperrdienst-Schlüsseldienst-Profischloss in 1070 Wien 7 (Neubau) \| herold.at" | "Aufsperrdienst-Schlüsseldienst-Profischloss" | Eintrag selbst eine Seite; Breadcrumb verlinkt Herold-Listen je Gewerk und je Bezirk/PLZ (z. B. /gelbe-seiten/1070/aufsperrdienst/) | Nein; Nummer weiter unten hinter "Rufnummer anzeigen" | Nein, nur "fairer Preis" als Behauptung | Kein JSON-LD. Microdata: LocalBusiness, AggregateRating, 3 Review, OfferCatalog, GeoCoordinates, PostalAddress, BreadcrumbList | 50 bis 70 Wörter |
| F1.3 | tips.at Schlosswechsel (= 1.7) | "Schlosswechsel Wien und Sicherheitsschloss tauschen" | "Schlosswechsel Wien und Sicherheitsschloss tauschen" | Nein. Alle 23 Bezirke im Text, keine Bezirksseiten; Link nur auf externe Firmenseite | Nein; Firmennummer erst im Artikelkörper | Ja: Einstiegspreis Schlosstausch, Preise für 3 Zylindertypen, Zuschläge außerhalb der Geschäftszeit, Fix- vs. Einzelpreise | JSON-LD (Verlags-Ebene): NewsMediaOrganization, Organization, ContactPoint, ImageObject. Kein BreadcrumbList, kein LocalBusiness, kein Service, kein FAQPage. | 1.300 bis 1.500 Wörter |

---

## Anfrage 2: "Rohrbruch Notdienst Wien Installateur"

| Rang | Titel (wie geliefert) | URL | Art |
|---|---|---|---|
| 2.1 | Finde "Installateurnotdienst" | https://www.herold.at/gelbe-seiten/installateurnotdienst/ | Verzeichnis, Kategorie (abgerufen) |
| 2.2 | horstmann heizungs u sanitaerinstallationen eu | https://www.herold.at/gelbe-seiten/wien/gT3rD/horstmann-heizungs-u-sanitaerinstallationen-eu/ | Verzeichnis (*) |
| 2.3 | Müldür Gas-Wasser-Heizung-Geräteservice | https://www.herold.at/gelbe-seiten/wien/p6G9C/muelduer-gas-wasser-heizung-geraeteservice | Verzeichnis (abgerufen) |
| 2.4 | Silvester Installation Dienstleistungs- und Handelsgesellschaft mbH | https://www.herold.at/gelbe-seiten/wien/XkVSZ/silvester-installation-dienstleistungs-und-handelsgesellschaft-mbh/ | Verzeichnis (*) |
| 2.5 | Installateur Notdienst | https://www.ganz-wien.at/wien/notdienste/installateur-notdienst.html | Verzeichnis mit Ratgeberanteil und Anzeigen (abgerufen) |
| 2.6 | J. Remes Gas-Wasser-Heizung GmbH | https://www.herold.at/gelbe-seiten/wien/TlV41/j-remes-gas-wasser-heizung-gmbh/ | Verzeichnis (*) |
| 2.7 | AR All Round Installationen GmbH | https://www.herold.at/gelbe-seiten/wien/3M7DR/ar-all-round-installationen-gmbh/ | Verzeichnis (*) |
| 2.8 | g weiner gas wasser heizung gesellschaft mbh | https://www.herold.at/gelbe-seiten/wien/Cw3zP/g-weiner-gas-wasser-heizung-gesellschaft-mbh/ | Verzeichnis (*) |
| 2.9 | Ing. Gerd Blasl Gas - Wasser - Heizung GmbH | https://www.herold.at/gelbe-seiten/wien/hwG7h/ing-gerd-blasl-gas-wasser-heizung-gmbh/ | Verzeichnis (*) |

Zählung Anfrage 2: Verzeichnis 9 (davon 8 auf herold.at, 1 auf ganz-wien.at), Betrieb 0, Vermittler/Plattform 0, Ratgeber 0 (als eigene Seitenart).

### Abgerufene Seiten Anfrage 2

| ID | Seite | Title (Roh-HTML) | H1 | Unterseite je Gewerk / Stadt | Telefon im sichtbaren Kopf | Preise | Strukturierte Daten (Roh-HTML) | Text zum Gewerk (geschätzt) |
|---|---|---|---|---|---|---|---|---|
| F2.1 | Herold Installateurnotdienst (= 2.1) | "Installateurnotdienst - Seite 1/1 - herold.at" | "Finde "Installateurnotdienst"" (Unterzeile: "Vergleiche die besten Unternehmen in dieser Kategorie") | Ja für Gewerke (Installateur, Heizung, Rohrreinigung) und Bundesländer; keine Stadt-/Bezirksseiten in der Navigation | Nein; Nummern nur in den Listeneinträgen | Nein (eine "Aktion" ohne Betrag) | Kein JSON-LD. Microdata: ItemList, 20x LocalBusiness, AggregateRating, BreadcrumbList | gesamt 1.500 bis 2.500 Wörter, davon erklärender Text zum Gewerk 20 bis 30 Wörter |
| F2.2 | ganz-wien.at Installateur Notdienst (= 2.5) | "Installateur Notdienst Wien: 24 h Notruf alle Bezirke & Umgebung" | "Installateur Notdienst" | Teilweise: eigene Seiten für Thermenwartung, Thermentausch, Abflussreinigung, Badsanierung, Elektriker, Glasnotdienst; Bezirksübersicht und eine Seite "Installateur 1180" | Nein; erste Nummer im Firmenblock nach der Einleitung | Ja: Stundensätze (Spannen), Anfahrtspauschalen nach Gebiet, Zuschläge nach Wochentag, Uhrzeit, Sonn-/Feiertag | JSON-LD: Organization, BreadcrumbList, ImageObject. Microdata: Article. Kein LocalBusiness, kein Service, kein FAQPage. | 1.000 bis 1.300 Wörter (großer Teil Firmenbeschreibung und Anzeigen) |
| F2.3 | Herold Müldür (= 2.3) | "Müldür Gas-Wasser-Heizung-Geräteservice in 1150 Wien 15 (Rudolfsheim-Fünfhaus) \| herold.at" | "Müldür Gas-Wasser-Heizung-Geräteservice" | Eintrag selbst eine Seite; Breadcrumb verlinkt Herold-Listen je Gewerk, Stadt, Bezirk, PLZ | Nein; Nummer im Kontaktabschnitt weiter unten | Nein (nur Bewertungskategorie "Preis", Zahlungsart Barzahlung) | Kein JSON-LD. Microdata: LocalBusiness, AggregateRating, 3 Review, OfferCatalog, 7x OpeningHoursSpecification, GeoCoordinates, PostalAddress, BreadcrumbList | 150 bis 200 Wörter |

---

## Anfrage 3: "Elektriker Notdienst Stromausfall Graz"

| Rang | Titel (wie geliefert) | URL | Art |
|---|---|---|---|
| 3.1 | grossflaechiger stromausfall in graz 131502670 | https://www.salzburg24.at/news/oesterreich/grossflaechiger-stromausfall-in-graz-131502670 | Nachricht (abgerufen), keine der vier Vorgabearten |
| 3.2 | www.herold.at | https://www.herold.at/blog/?p=220711 | Ratgeber (abgerufen) |
| 3.3 | elektro rot gmbh notfall elektriker.en | https://search.ch/tel/buchs/-/elektro-rot-gmbh-notfall-elektriker.en.html | Verzeichnis (*), Schweiz, Ort Buchs, kein Bezug zu Graz |
| 3.4 | meister-job.de | https://meister-job.de/haustechnik/elektriker/gerolzhofen/ | Verzeichnis (*), Deutschland, Ort Gerolzhofen, kein Bezug zu Graz |
| 3.5 | Zum Hauptinhalt | https://www.aroundhome.de/fachfirmen/firma/pati-meisterbetrieb/ | Vermittler/Plattform (*), Deutschland |
| 3.6 | BIG Maerz2014 FINAL web | https://www.graz.at/cms/dokumente/10226433_7747759/ae899e0e/BIG_Maerz2014_FINAL_web.pdf | PDF der Stadt Graz, 2014 (*), keine der vier Vorgabearten |
| 3.7 | Zum Inhalt springen | https://www.wko.at/stmk/gewerbe-handwerk/elektro-gebaeude-alarm-kommunikation/markterkundung-fuer-den-austausch-und-der-neumontage-von-stro | Kammerseite, Markterkundung (*), keine der vier Vorgabearten |
| 3.8 | Zum Seiteninhalt springen | https://www.karriere.at/jobs/7822073 | Stellenanzeige (*), keine der vier Vorgabearten |
| 3.9 | Zum Seiteninhalt springen | https://www.karriere.at/jobs/7856837 | Stellenanzeige (*), keine der vier Vorgabearten |
| 3.10 | ADA Elektro - 24h Notdienst | https://www.herold.at/gelbe-seiten/wien/CVF5g/ada-elektro/ | Verzeichnis (abgerufen), Wiener Betrieb, kein Bezug zu Graz |

Zählung Anfrage 3: Verzeichnis 3 (3.3, 3.4, 3.10), Ratgeber 1 (3.2), Vermittler/Plattform 1 (3.5), Betrieb 0, übrige 5 (Nachricht, PDF, Kammer, 2 Stellenanzeigen). Nur 3.2 behandelt Grazer Elektriker (inklusive 24h-Notdienst bei zwei Firmen); 3.2 trägt laut Seite den Stand 3. August 2021.

### Abgerufene Seiten Anfrage 3

Ausgewählt wurden die drei Treffer mit dem nächsten Bezug zu Elektro-Notdienst; nur F3.1 betrifft Graz inhaltlich.

| ID | Seite | Title (Roh-HTML) | H1 | Unterseite je Gewerk / Stadt | Telefon im sichtbaren Kopf | Preise | Strukturierte Daten (Roh-HTML) | Text zum Gewerk (geschätzt) |
|---|---|---|---|---|---|---|---|---|
| F3.1 | Herold Blog Elektriker Graz (= 3.2) | "Elektriker Graz: Top 9 Fachbetriebe für Elektroinstallation - Herold Blog" | "Elektriker in Graz gesucht? Das sind unsere Empfehlungen!" | Nein. Einzelartikel; verlinkt Herold-Verzeichnisse je Bundesland und Firmeneinträge | Nein; Nummern im Text je Firma und im Kontaktblock unten | Ja: Durchschnitt 50 bis 80 Euro je Stunde plus Anfahrt; Material und Projektgröße als Kostentreiber | JSON-LD: WebPage, WebSite, SearchAction, BreadcrumbList, Person, ImageObject. Kein LocalBusiness, kein Service, kein FAQPage. | 1.000 bis 1.300 Wörter |
| F3.2 | Herold ADA Elektro (= 3.10) | "ADA Elektro - 24h Notdienst in 1230 Wien 23 (Liesing) \| herold.at" | "ADA Elektro - 24h Notdienst" | Eintrag selbst eine Seite; Breadcrumb verlinkt Herold-Listen je Gewerk, Bezirk, PLZ | Nein; Nummer im unteren Kontaktbereich, teils hinter "Rufnummer anzeigen" | Ja: Ab-Preise für Anfahrt, Reparatur, Notdienst; Hinweis auf schriftlichen Endpreis vor Arbeitsbeginn | Kein JSON-LD. Microdata: LocalBusiness, OfferCatalog, 7x OpeningHoursSpecification, GeoCoordinates, PostalAddress, BreadcrumbList | 180 bis 220 Wörter |
| F3.3 | salzburg24 Stromausfall Graz (= 3.1) | "Großflächiger Stromausfall in Graz - Salzburg24.at" | "Großflächiger Stromausfall in Graz" | Nein | Nein | Nein | JSON-LD: NewsArticle, BreadcrumbList, Organization, SpeakableSpecification, ImageObject | 120 bis 130 Wörter (Nachricht, kein Notdienst-Angebot) |

---

## Vergleichsseite fixit247 (Angaben laut Auftrag, nicht im Repo geprüft)

- Eine Startseite für 5 Gewerke, noch nicht online.
- Title: "fixit247 – Vermittlung von Handwerker-Notdiensten rund um die Uhr"
- H1: "Handwerker-Notdienst. Rund um die Uhr."
- Je Gewerk eine Karte mit einem Satz (Beispiel: "Ausgesperrt, Schlüssel abgebrochen, Schloss tauschen").
- Städtenamen: keine, außer dem Beispiel "1020 Wien".
- Strukturierte Daten: keine.
- Unterseiten je Gewerk oder Stadt: keine.

---

## Was die Top-Ergebnisse gemeinsam haben, was fixit247 fehlt

Nur Fakten aus den Belegen oben. Verweise in eckigen Klammern.

1. **Die Treffer sind Verzeichnisse und Ratgeber, keine Betriebs-Startseiten und keine Vermittler-Landingpages.** Anfrage 1: 5 Verzeichnis, 4 Ratgeber [1.1 bis 1.9]. Anfrage 2: 9 von 9 Verzeichnis, 8 davon auf herold.at [2.1 bis 2.9]. Ein Vermittler/Plattform-Treffer erscheint nur in Anfrage 3 und ist deutsch [3.5]. Eine Vermittlungsseite wie fixit247 hat in diesen drei Treffermengen keinen direkten Typ-Vorgänger.
2. **Der Ort steht im Title.** "Wien" im Title bei [F1.1], [F1.3], [F2.2]; Postleitzahl und Bezirk im Title bei allen Herold-Einträgen [F1.2], [F2.3], [F3.2]; "Graz" im Title und H1 bei [F3.1]. Der fixit247-Title nennt keine Stadt.
3. **Notdienst-Wörter stehen ebenfalls im Title oder H1:** "24h Notruf" [F1.1], "24 h Notruf alle Bezirke & Umgebung" [F2.2], "24h Notdienst" [F3.2], "Installateurnotdienst" [F2.1]. Der fixit247-Title enthält "Notdiensten" und "rund um die Uhr", aber ohne Gewerk-Wort.
4. **Gewerk und Ort sind als eigene URLs abgebildet.** Herold hat Listenseiten je Gewerk und je Bezirk/PLZ [F1.2, F2.3, F3.2], ganz-WIEN.at hat Gewerk-Unterseiten und eine Bezirksseite [F2.2]. Reine Einzelartikel ohne Unterseiten sind [F1.1], [F1.3], [F3.1]. fixit247 hat keine Unterseiten je Gewerk oder Stadt.
5. **Bezirke werden im Text aufgezählt:** 1010 bis 1220 [F1.1], alle 23 Bezirke [F1.3], Bezirksübersicht [F2.2]. fixit247 nennt nur "1020 Wien" als Beispiel.
6. **Die Ratgeber-Treffer haben viel Text zum Gewerk (geschätzt 1.000 bis 1.800 Wörter)** [F1.1, F1.3, F2.2, F3.1]. Verzeichniseinträge liegen bei 50 bis 220 Wörtern [F1.2, F2.3, F3.2] und gewinnen über Struktur und Bewertungen (siehe Punkt 8). fixit247 hat einen Satz je Gewerk.
7. **Preisinformationen stehen auf 5 von 9 abgerufenen Seiten:** Ab-Preise, Zuschläge, Stundensätze, Festpreis-Hinweise [F1.1, F1.3, F2.2, F3.1, F3.2]. Die drei Herold-Profile ohne Beträge [F1.2, F2.3] und die Kategorieseite [F2.1] nennen keine konkreten Preise. Ob fixit247 Preise zeigt, ist im Auftrag nicht angegeben.
8. **Strukturierte Daten sind vorhanden, aber nicht in der Form LocalBusiness/Service/FAQPage als JSON-LD.** In keinem der 9 Roh-HTML-Quelltexte steht JSON-LD mit LocalBusiness, Service oder FAQPage. Vorhanden sind: BreadcrumbList auf 8 von 9 Seiten (nicht bei [F1.3]), Microdata-LocalBusiness mit AggregateRating, OfferCatalog und Öffnungszeiten auf den Herold-Einträgen [F1.2, F2.3, F3.2], Microdata-LocalBusiness-Liste mit 20 Einträgen auf [F2.1], Microdata Question/Answer auf [F1.1]. fixit247 hat laut Auftrag gar keine strukturierten Daten, also auch keine Breadcrumbs.
9. **Telefonnummer im sichtbaren Kopf ist kein gemeinsames Merkmal.** Auf keiner der 9 abgerufenen Seiten steht die Nummer im Kopf; bei [F1.1] folgt sie direkt nach der H1, bei den Herold-Einträgen erst weiter unten, teils hinter "Rufnummer anzeigen" [F1.2, F2.3, F3.2]. Hier ist aus den Belegen keine Lücke von fixit247 ableitbar.
10. **Vertrauenssignale:** Bewertungen mit Sternen und Einzelrezensionen auf Herold-Einträgen (Microdata AggregateRating, Review) [F1.2, F2.3]; Warnhinweise zu unseriösen Anbietern und das Wort "Seriöser" im H1 [F1.1] sowie Hinweise auf Festpreis oder Kostenvoranschlag [F1.1, F1.3, F3.2]. Im Auftrag stehen für fixit247 keine Bewertungen oder vergleichbaren Hinweise.
11. **Werbekennzeichnung:** Mehrere Treffer sind bezahlte Anbieterplatzierungen und als "Anzeige" gekennzeichnet [F1.1, F1.3, F2.2]. Die Konkurrenz in diesen Treffern sind also Betriebe, die für Sichtbarkeit zahlen oder Einträge pflegen.
12. **Aktualität:** Der Grazer Ratgeber trägt den Stand 3. August 2021 [F3.1]; die Treffermenge zu Graz ist dünn (nur ein thematisch passender Treffer, 3.2) und enthält sonst Treffer ohne Bezug zu Graz oder Elektro-Notdienst [3.3 bis 3.9]. Aus diesem Beleg lässt sich nicht auf die Wettbewerbslage in Graz schließen.

### Lücken in den Belegen

- Keine echte Google-Suche für Österreich; Rang und Auswahl können abweichen.
- Betriebs-Websites selbst nicht abgerufen, daher keine Belege zu Städte-/Gewerk-Unterseiten von Betrieben.
- Kein Beleg zu Core Web Vitals, Ladezeit, Backlinks oder Google-Business-Profil.
