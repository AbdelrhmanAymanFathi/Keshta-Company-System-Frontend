import { PRESET_THEMES, PRESET_THEME_IDS } from '../presets'
import { KEYWORD_RULES, FEATURE_KEYWORDS } from './keywords'
import { ICON_PACK_META } from '../icons/registry'

const FONT_LABELS = {
  inter: 'Inter',
  poppins: 'Poppins',
  cairo: 'Cairo',
  tajawal: 'Tajawal',
  'ibm-plex-sans': 'IBM Plex Sans',
  outfit: 'Outfit',
  'plus-jakarta-sans': 'Plus Jakarta Sans',
  rubik: 'Rubik',
  geist: 'Geist'
}

const MAX_SUGGESTIONS = 4

function tokenize(query) {
  return (query || '')
    .toLowerCase()
    .replace(/[^\w\s+-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

function scorePreset(tokens, rule) {
  let score = 0
  const matched = []

  for (const token of tokens) {
    for (const keyword of rule.keywords) {
      const kw = keyword.toLowerCase()
      if (token === kw || token.includes(kw) || kw.includes(token)) {
        score += rule.weight
        matched.push(keyword)
      }
    }
  }

  return { score, matched: [...new Set(matched)] }
}

function detectFeatureBoost(tokens, featureMap) {
  const boosts = {}
  for (const [value, keywords] of Object.entries(featureMap)) {
    for (const token of tokens) {
      for (const kw of keywords) {
        if (token.includes(kw) || kw.includes(token)) {
          boosts[value] = (boosts[value] || 0) + 1
        }
      }
    }
  }
  const sorted = Object.entries(boosts).sort((a, b) => b[1] - a[1])
  return sorted[0]?.[0] || null
}

function buildReasons(preset, matchedKeywords, tokens) {
  const reasons = []
  if (matchedKeywords.length) {
    reasons.push(`Matched keywords: ${matchedKeywords.slice(0, 5).join(', ')}`)
  }
  reasons.push(`Uses ${ICON_PACK_META[preset.iconPack]?.label || preset.iconPack} icons`)
  reasons.push(`${preset.sidebarType} sidebar layout`)
  reasons.push(`${FONT_LABELS[preset.fontPreset] || preset.fontPreset} typography`)
  if (tokens.some((t) => ['dark', 'neon', 'glow'].includes(t)) && preset.id === 'cyber-futuristic') {
    reasons.push('Dark/neon cues align with cyber aesthetic')
  }
  return reasons.slice(0, 4)
}

function toSuggestion(presetId, confidence, matchedKeywords, tokens) {
  const preset = PRESET_THEMES[presetId]
  if (!preset) return null

  return {
    name: preset.name,
    confidence: Math.round(confidence * 100) / 100,
    description: preset.description,
    presetId: preset.id,
    preview: {
      colors: preset.primary,
      typography: FONT_LABELS[preset.fontPreset] || preset.fontPreset,
      iconPack: ICON_PACK_META[preset.iconPack]?.label || preset.iconPack,
      animation: preset.animation,
      sidebarType: preset.sidebarType,
      radius: preset.radius,
      density: preset.density,
      shadows: preset.shadows
    },
    theme: { ...preset },
    reasons: buildReasons(preset, matchedKeywords, tokens)
  }
}

/**
 * Rule-based theme recommendation engine.
 * @param {string} query Natural language prompt
 * @returns {import('./types').ThemeSuggestion[]}
 */
export function recommendThemes(query) {
  const tokens = tokenize(query)
  if (!tokens.length) {
    return PRESET_THEME_IDS.map((id, i) =>
      toSuggestion(id, Math.max(0.35, 0.85 - i * 0.12), [], tokens)
    ).filter(Boolean)
  }

  const scores = KEYWORD_RULES.map((rule) => {
    const { score, matched } = scorePreset(tokens, rule)
    return { presetId: rule.presetId, score, matched }
  }).sort((a, b) => b.score - a.score)

  const maxScore = Math.max(...scores.map((s) => s.score), 1)
  const ranked = scores
    .filter((s) => s.score > 0)
    .map((s) => toSuggestion(s.presetId, Math.min(1, s.score / maxScore), s.matched, tokens))

  if (!ranked.length) {
    const animHint = detectFeatureBoost(tokens, FEATURE_KEYWORDS.animation)
    const fallbackByAnim = {
      grid: 'cyber-futuristic',
      construction: 'construction-field',
      minimal: 'modern-startup',
      liquid: 'modern-startup'
    }
    const fallbackId = fallbackByAnim[animHint] || 'corporate-erp'
    return [toSuggestion(fallbackId, 0.55, [], tokens)].filter(Boolean)
  }

  const top = ranked.slice(0, MAX_SUGGESTIONS)

  const sidebarBoost = detectFeatureBoost(tokens, FEATURE_KEYWORDS.sidebarType)
  const iconBoost = detectFeatureBoost(tokens, FEATURE_KEYWORDS.iconPack)
  const animBoost = detectFeatureBoost(tokens, FEATURE_KEYWORDS.animation)

  if (top[0]?.theme && (sidebarBoost || iconBoost || animBoost)) {
    top[0].theme = {
      ...top[0].theme,
      ...(sidebarBoost ? { sidebarType: sidebarBoost } : {}),
      ...(iconBoost ? { iconPack: iconBoost } : {}),
      ...(animBoost ? { animation: animBoost } : {})
    }
    if (sidebarBoost) top[0].preview.sidebarType = sidebarBoost
    if (iconBoost) top[0].preview.iconPack = ICON_PACK_META[iconBoost]?.label || iconBoost
    if (animBoost) top[0].preview.animation = animBoost
  }

  return top
}

/**
 * Future AI integration hook — swap implementation without changing UI.
 * @param {string} query
 * @returns {Promise<import('./types').ThemeSuggestion[]>}
 */
export async function recommendThemesWithAI(query) {
  return recommendThemes(query)
}

export function applySuggestion(suggestion, applyThemeFn) {
  if (!suggestion?.theme) return null
  return applyThemeFn(suggestion.theme)
}
