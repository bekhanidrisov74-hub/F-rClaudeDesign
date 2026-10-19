// Wächter: Farben, Radien, Schatten, Schriftgrößen, Abstände, Umbrüche und Dauern nur aus src/styles/tokens.css.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, test } from 'vitest'

type Art = 'tsx' | 'css'
const REGELN: [string, RegExp, Art?][] = [
  ['Hex-Farbe', /#[0-9a-fA-F]{3,8}\b(?![-\w])/],
  ['Farbfunktion', /\b(?:rgba?|hsla?|oklch|oklab|lab|lch|color-mix)\(/],
  ['freier Wert für Farbe/Schrift/Rand/Radius/Schatten', /(?:^|[\s"'`:])!?(?:bg|text|border(?:-[xytrblse])?|outline|ring|fill|stroke|decoration|accent|caret|rounded(?:-[a-z]+)?|shadow|from|via|to)-\[/],
  ['freier Abstand', /(?:^|[\s"'`:])!?-?(?:p[xytrblse]?|m[xytrblse]?|gap(?:-[xy])?|space-[xy]|scroll-[mp][xytrblse]?)-\[/],
  ['freier Umbruch', /(?:^|[\s"'`])(?:max|min)-\[/],
  ['Schatten ohne Token', /(?:^|[\s"'`:])(?:drop-shadow|inset-shadow|text-shadow|blur)(?:-|\b)/],
  ['Dauer ohne Token', /(?:^|[\s"'`:])duration-\d/],
  ['fremde CSS-Variable', /-\(--(?!fx-)/],
  ['Inline-Stil für Schrift/Abstand/Radius/Schatten/Farbe', /\b(?:fontSize|padding\w*|margin\w*|gap|borderRadius|boxShadow|color|background\w*)\s*:/, 'tsx'],
  ['CSS-Wert ohne Token', /(?:font-size|border-radius|box-shadow|padding[\w-]*|margin[\w-]*|gap|color|background(?:-color)?)\s*:\s*(?=\S)(?!var\(--fx-|0\b|inherit|transparent|currentColor|none|auto)[^;{}]+;/, 'css'],
]

function verstoesse(quelle: string, art: Art): string[] {
  const regeln = REGELN.filter(([, , nur]) => !nur || nur === art)
  return quelle
    .split('\n')
    .flatMap((zeile, i) => regeln.filter(([, re]) => re.test(zeile)).map(([name]) => `Zeile ${i + 1}: ${name}: ${zeile.trim()}`))
}

function dateien(ordner: string): string[] {
  return readdirSync(ordner).flatMap((f) => {
    const pfad = join(ordner, f)
    if (statSync(pfad).isDirectory()) return dateien(pfad)
    return /\.(tsx?|css)$/.test(f) && !/\.test\.tsx?$/.test(f) ? [pfad] : []
  })
}

describe('Token-Wächter', () => {
  test('erkennt Verstöße', () => {
    for (const [falsch, art] of [
      ['color: #001B2A;', 'css'],
      ['.x { font-size: 13px; }', 'css'],
      ['.x { padding: 10px; }', 'css'],
    ] as const)
      expect(verstoesse(falsch, art), falsch).not.toEqual([])
    for (const falsch of [
      '<div className="bg-[#fff]">',
      '<div className="text-[13px]">',
      '<div className="p-[22px] gap-[10px]">',
      '<div className="max-[920px]:hidden">',
      '<div className="rounded-[20px]">',
      '<div className="drop-shadow-lg">',
      '<div className="duration-300">',
      '<div style={{ fontSize: 14 }}>',
      '<div className="w-(--irgendwas)">',
    ])
      expect(verstoesse(falsch, 'tsx'), falsch).not.toEqual([])
  })

  test('lässt Token-Klassen und Komponentenmaße zu', () => {
    for (const richtig of [
      '<div className="bg-tuerkis text-h1 p-s4 gap-s3 rounded-card shadow-l max-nav:hidden">',
      '<div className="h-[76px] w-[380px] max-w-[27em] min-h-[44px]">',
      '<a href="#ablauf">',
    ])
      expect(verstoesse(richtig, 'tsx'), richtig).toEqual([])
    for (const richtig of [
      'transition: color var(--fx-dur-fast) var(--fx-ease);',
      '.x { font-size: var(--fx-small); padding: 0; color: inherit; }',
    ])
      expect(verstoesse(richtig, 'css'), richtig).toEqual([])
  })

  test('src/ hält sich an die Tokens', () => {
    const befunde = dateien('src')
      .filter((d) => !d.replace(/\\/g, '/').endsWith('src/styles/tokens.css'))
      .flatMap((d) => verstoesse(readFileSync(d, 'utf8'), d.endsWith('.css') ? 'css' : 'tsx').map((v) => `${d} ${v}`))
    expect(befunde).toEqual([])
  })
})
