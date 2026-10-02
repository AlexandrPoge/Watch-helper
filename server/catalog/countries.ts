export const countryNames: Record<string, string> = {
  RU: 'Россия', SU: 'СССР', US: 'США', GB: 'Великобритания', FR: 'Франция',
  DE: 'Германия', JP: 'Япония', KR: 'Корея Южная', IN: 'Индия', CN: 'Китай', CA: 'Канада',
}

const aliases: Record<string, string> = { 'Южная Корея': 'KR', 'Республика Корея': 'KR' }

export function countryCodeFor(name: string) {
  return aliases[name] ?? Object.keys(countryNames).find((code) => countryNames[code] === name)
}

export function countryCodesFor(items?: { name: string }[]) {
  return items?.flatMap(({ name }) => { const code = countryCodeFor(name); return code ? [code] : [] })
}
