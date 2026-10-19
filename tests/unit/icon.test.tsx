import { existsSync, readdirSync } from 'node:fs'
import { renderToString } from 'react-dom/server'
import { expect, test } from 'vitest'
import { Icon, icons } from '../../src/components/ui/Icon'
import { SYMBOL_BREITE, SYMBOL_BREITE_GROSS, SYMBOLE_3D, Symbol3D } from '../../src/components/ui/Symbol3D'
import { copy } from '../../src/content/copy'

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

test('jedes 3D-Symbol hat beide Farbstellungen als Render und als Export', () => {
  for (const name of SYMBOLE_3D)
    for (const datei of [`design/icons-3d/${name}.png`, `design/icons-3d/${name}-hell.png`,
      ...['', '-hell'].flatMap((s) => [SYMBOL_BREITE, SYMBOL_BREITE_GROSS].flatMap((b) => ['avif', 'webp'].map((f) => `public/icons/${name}${s}-${b}.${f}`)))])
      expect(existsSync(datei), datei).toBe(true)
})

test('Symbole in den Texten haben ein 3D-Render, die Vorteile unter dem Hero ein SVG aus design/icons', () => {
  for (const { icon } of copy.zusagen.karten) expect(SYMBOLE_3D, icon).toContain(icon)
  for (const { icon } of copy.vertrauen.punkte) expect(Object.keys(icons), icon).toContain(icon)
})

test('Symbol3D ist dekorativ, wählt die Farbstellung und meldet unbekannte Namen', () => {
  const html = renderToString(<Symbol3D name="ui-anrufen" hell />)
  expect(html).toContain('alt=""')
  expect(html).toContain(`/icons/ui-anrufen-hell-${SYMBOL_BREITE}.avif`)
  expect(renderToString(<Symbol3D name="ui-anrufen" />)).toContain(`/icons/ui-anrufen-${SYMBOL_BREITE}.webp`)
  expect(() => renderToString(<Symbol3D name="gibt-es-nicht" />)).toThrow('Symbol fehlt')
})
