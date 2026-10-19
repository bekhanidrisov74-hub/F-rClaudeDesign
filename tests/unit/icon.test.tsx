import { readdirSync } from 'node:fs'
import { renderToString } from 'react-dom/server'
import { expect, test } from 'vitest'
import { Icon, icons } from '../../src/components/ui/Icon'
import { IconKreis } from '../../src/components/ui/IconKreis'
import { copy } from '../../src/content/copy'
import { gewerke } from '../../src/content/gewerke'

test('alle Icons aus design/icons sind geladen', () => {
  const dateien = readdirSync('design/icons').map((f) => f.replace(/\.svg$/, ''))
  expect(Object.keys(icons).sort()).toEqual(dateien.sort())
})

test('Icon rendert im Server-Rendering ein SVG und ist dekorativ', () => {
  const html = renderToString(<Icon name="ui-schliessen" />)
  expect(html).toContain('<svg')
  expect(html).toContain('aria-hidden="true"')
})

test('unbekanntes Icon fällt sofort auf', () => {
  expect(() => renderToString(<Icon name="gibt-es-nicht" />)).toThrow('Icon fehlt')
})

test('alle Symbole aus Texten und Daten sind flache SVGs aus design/icons (Stil des Hero)', () => {
  const namen = Object.keys(icons)
  for (const { icon } of copy.zusagen.karten) expect(namen, icon).toContain(icon)
  for (const { icon } of copy.vertrauen.punkte) expect(namen, icon).toContain(icon)
  for (const { icon } of gewerke) expect(namen, icon).toContain(icon)
})

test('keine 3D-Renders und keine Bilddateien als Icons mehr', () => {
  const html = renderToString(<IconKreis name="ui-richtpreis" />)
  expect(html).toContain('<svg')
  expect(html).not.toContain('<img')
  expect(html).toContain('aria-hidden="true"')
})

test('IconKreis: Lagune-Kreis wie bei den Vorteilen, dunkel als Nacht-Kreis wie im Anruf-Knopf, weiß auf Eis', () => {
  expect(renderToString(<IconKreis name="ui-info" />)).toContain('bg-lagune')
  expect(renderToString(<IconKreis name="ui-haekchen" dunkel />)).toContain('bg-nacht')
  const weiss = renderToString(<IconKreis name="ui-info" weiss />)
  expect(weiss).toContain('bg-weiss')
  expect(weiss).not.toContain('bg-lagune')
  expect(() => renderToString(<IconKreis name="gibt-es-nicht" />)).toThrow('Icon fehlt')
})
