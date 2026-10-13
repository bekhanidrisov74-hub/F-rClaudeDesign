import { readdirSync } from 'node:fs'
import { renderToString } from 'react-dom/server'
import { expect, test } from 'vitest'
import { Icon, icons } from '../../src/components/ui/Icon'

test('alle Icons aus design/icons sind geladen', () => {
  const dateien = readdirSync('design/icons').map((f) => f.replace(/\.svg$/, ''))
  expect(Object.keys(icons).sort()).toEqual(dateien.sort())
})

test('Icon rendert im Server-Rendering ein SVG und ist dekorativ', () => {
  const html = renderToString(<Icon name="ui-anrufen" />)
  expect(html).toContain('<svg')
  expect(html).toContain('aria-hidden="true"')
})

test('unbekanntes Icon fällt sofort auf', () => {
  expect(() => renderToString(<Icon name="gibt-es-nicht" />)).toThrow('Icon fehlt')
})
