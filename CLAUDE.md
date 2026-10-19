# fixit247 Website

Das Design ist fertig und liegt in design/. Bei Widersprüchen gilt: design/SPEC.md vor design/screens vor design/reference-html.

Optik seit 19.10.2026: Die ganze Seite folgt dem Stil des Entwurfs „Hero – Desktop 1586“ (docs/hero-stil.md): Inter, Farben, Knöpfe, Icons im Lagune-Kreis, helle Flächen. Die Screens in design/screens gelten weiter für Inhalte und Verhalten, nicht mehr für Farben, Schriften, Icons, Raster, Breiten und Anordnung.

Raster seit 19.10.2026 (docs/hero-stil.md, „Raster“): Kopf, Hero, alle Abschnitte und Fuß stehen auf denselben Kanten (`--fx-kante-l` / `--fx-kante-r`), über 1586 px gemeinsam im zentrierten Rahmen `--fx-rahmen`. Bis 1586 px bleibt der Hero 1:1 nach Entwurf; Abschnitte richten sich nach ihm (Utility `wrapper`). Sichtprüfung auf allen Breiten 390, 768, 1024, 1440, 1920 und 2560 px.

Regeln:
- Nur Tokens aus src/styles/tokens.css verwenden, keine eigenen Farben, Radien, Schatten oder Schriftgrößen.
- Texte exakt laut design/. Österreichisches Deutsch, Sie-Form.
- fixit247 vermittelt nur. Kein Text darf behaupten, fixit247 repariere selbst oder garantiere Preise.
- Daten (Gewerke, Preise, Texte, Kontakt) nur in src/content/.
- Anruf-Knopf überall Türkisblau und das auffälligste Element, aufgebaut wie „Jetzt anrufen“ im Hero (ui/CallButton).
- Icons nur als flache SVGs aus design/icons (ui/Icon, ui/IconKreis), keine Bilddateien als Icons.
- Keine externen Requests, kein CDN, kein Tracking. Schriften über @fontsource-variable.
- WCAG 2.2 AA, Tastatur, prefers-reduced-motion.
- Vor jeder Erfolgsmeldung `npm run check` und `npm run test:e2e` ausführen. Optik mit `npm run shots` und dem Subagent visual-reviewer prüfen.
- Offene Entscheidungen (design/SPEC.md, Abschnitt 11) nicht selbst treffen, sondern Standard bauen und berichten.
- SEO nach `.claude/rules/seo.md`. Lädt automatisch bei Inhalten, Seitenliste, Head und Prerender; vor jeder neuen Seite selbst lesen.
