# fixit247 Website

Das Design ist fertig und liegt in design/. Bei Widersprüchen gilt: design/SPEC.md vor design/screens vor design/reference-html.

Optik seit 19.10.2026: Die ganze Seite folgt dem Stil des Entwurfs „Hero – Desktop 1586“ (docs/hero-stil.md): Inter, Farben, Knöpfe, Icons im Lagune-Kreis, helle Flächen. Die Screens in design/screens gelten weiter für Aufbau, Inhalte und Verhalten, nicht mehr für Farben, Schriften und Icons.

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
