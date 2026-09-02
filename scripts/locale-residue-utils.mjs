const ENTITY_TOKEN_PATTERN = /&(?:#\d+|#x[0-9a-f]+|[a-z][a-z0-9]+);/gi
const TRANSLATABLE_ENGLISH_PATTERN = /[A-Za-z]{4}/
const TECHNICAL_IDENTIFIER_LIST = /^(?:[A-Za-z]{1,5}\d*[A-Za-z0-9]*)(?:\s*,\s*(?:[A-Za-z]{1,5}\d*[A-Za-z0-9]*))*$/
const NUMBERED_TECHNICAL_MATERIAL_LIST = /^(?:[A-Za-z][A-Za-z -]*\s+\d+)(?:\s*,\s*(?:[A-Za-z][A-Za-z -]*\s+\d+))+$/
const LANGUAGE_NEUTRAL_PRICE_UNIT = /^(?:(?:US)?\$|€|¥)\s*\d+(?:[.,]\d+)?\s*(?:-|–|to)\s*\d+(?:[.,]\d+)?\s+per\s+(?:kilogram|kg|piece|unit)$/i

export function extractHtmlTextNodes(html) {
  const tokens = String(html ?? '').split(/(<[^>]+>|&(?:#\d+|#x[0-9a-f]+|[a-z][a-z0-9]+);)/gi)
  const nodes = []
  for (let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex += 1) {
    const token = tokens[tokenIndex]
    if (!token || token.startsWith('<') || ENTITY_TOKEN_PATTERN.test(token) || !/[\p{L}]/u.test(token)) {
      ENTITY_TOKEN_PATTERN.lastIndex = 0
      continue
    }
    ENTITY_TOKEN_PATTERN.lastIndex = 0
    const leading = token.match(/^\s*/)?.[0] ?? ''
    const trailing = token.match(/\s*$/)?.[0] ?? ''
    const core = token.slice(leading.length, token.length - trailing.length)
    if (core) nodes.push({ tokenIndex, key: `n${tokenIndex}`, core, leading, trailing })
  }
  return { tokens, nodes }
}

export function isTranslatableEnglishNode(text) {
  const normalized = String(text ?? '').trim()
  return normalized.length >= 12
    && TRANSLATABLE_ENGLISH_PATTERN.test(normalized)
    && !TECHNICAL_IDENTIFIER_LIST.test(normalized)
    && !NUMBERED_TECHNICAL_MATERIAL_LIST.test(normalized)
    && !LANGUAGE_NEUTRAL_PRICE_UNIT.test(normalized)
}

export function findExactEnglishResidueNodes(sourceHtml, localizedHtml) {
  const sourceNodes = new Set(
    extractHtmlTextNodes(sourceHtml).nodes
      .map((node) => node.core)
      .filter(isTranslatableEnglishNode),
  )
  return extractHtmlTextNodes(localizedHtml).nodes.filter((node) => sourceNodes.has(node.core))
}

export function findExactEnglishPlainFields(source, localized) {
  return Object.keys(source ?? {}).filter((key) => {
    const sourceText = String(source?.[key] ?? '').trim()
    const localizedText = String(localized?.[key] ?? '').trim()
    return sourceText === localizedText && isTranslatableEnglishNode(sourceText) && !/^ISO\s*\d/i.test(sourceText)
  })
}

export function restoreHtmlTextNodes(tokens, nodes, translations) {
  const restored = [...tokens]
  for (const node of nodes) {
    const translated = translations[node.key]
    if (typeof translated === 'string' && translated.trim()) {
      restored[node.tokenIndex] = `${node.leading}${translated}${node.trailing}`
    }
  }
  return restored.join('')
}
