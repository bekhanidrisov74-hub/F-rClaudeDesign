import { renderToString } from 'react-dom/server'
import { afterEach, expect, test, vi } from 'vitest'

// Der Fuß liest die Karte aus lib/vcard (vcardText). Hier einmal ohne und einmal mit Karte rendern.
afterEach(() => {
  vi.doUnmock('../../src/lib/vcard')
  vi.resetModules()
})

async function fuss(vcardText: string | null) {
  vi.resetModules()
  vi.doMock('../../src/lib/vcard', () => ({ VCARD_PFAD: '/fixit247.vcf', vcardText }))
  const { Footer } = await import('../../src/components/Footer')
  return renderToString(<Footer />)
}

test('Fuß ohne Karte (Platzhalter) hat keinen Link „Nummer speichern“', async () => {
  const html = await fuss(null)
  expect(html).not.toContain('fixit247.vcf')
  expect(html).not.toContain('Nummer speichern')
})

test('Fuß mit Karte hat den Link „Nummer speichern“ mit download auf /fixit247.vcf, ohne Anruf-Auftritt', async () => {
  const html = await fuss('BEGIN:VCARD\r\nEND:VCARD\r\n')
  const link = html.match(/<a [^>]*href="\/fixit247\.vcf"[^>]*>[^<]*<\/a>/)?.[0]
  expect(link).toBeDefined()
  expect(link).toContain(' download=""')
  expect(link).toContain('>Nummer speichern</a>')
  expect(link).toContain('min-h-[44px]')
  // Text allein: kein Icon-Kreis wie bei den Kontaktzeilen
  expect(link).not.toContain('<svg')
})
