import { PRESET_THEMES, PRESET_THEME_IDS } from '@acme/ui-presets'
import { ICON_PACK_META } from '@acme/icon-packs'
import type { ThemeDefinition, ThemeSuggestion } from '@acme/theme-engine'
import { KEYWORD_RULES, FEATURE_KEYWORDS } from './keywords'

const FONT_LABELS: Record<string, string> = {
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

function tokenize(query: string) {
  return (query || '')
    .toLowerCase()
    .replace(/[^\w\s+-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

function scorePreset(tokens: string[], rule: (typeof KEYWORD_RULES)[0]) {
  let score = 0
  const matched: string[] = []
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

function detectFeatureBoost(tokens: string[], featureMap: Record<string, string[]>) {
  const boosts: Record<string, number> = {}
  for (const [value, keywords] of Object.entries(featureMap)) {
    for (const token of tokens) {
      for (const kw of keywords) {
        if (token.includes(kw) || kw.includes(token)) {
          boosts[value] = (boosts[value] || 0) + 1
        }
      }
    }
  }
  return Object.entries(boosts).sort((a, b) => b[1] - a[1])[0]?.[0] || null
}

function buildReasons(preset: ThemeDefinition, matchedKeywords: string[], tokens: string[]) {
  const reasons: string[] = []
  if (matchedKeywords.length) {
    reasons.push(`Matched keywords: ${matchedKeywords.slice(0, 5).join(', ')}`)
  }
  reasons.push(`Uses ${ICON_PACK_META[preset.iconPack as keyof typeof ICON_PACK_META]?.label || preset.iconPack} icons`)
  reasons.push(`${preset.sidebarType} sidebar layout`)
  reasons.push(`${FONT_LABELS[preset.fontPreset || 'inter'] || preset.fontPreset} typography`)
  if (tokens.some((t) => ['dark', 'neon', 'glow'].includes(t)) && preset.id === 'cyber-futuristic') {
    reasons.push('Dark/neon cues align with cyber aesthetic')
  }
  return reasons.slice(0, 4)
}

function toSuggestion(
  presetId: string,
  confidence: number,
  matchedKeywords: string[],
  tokens: string[]
): ThemeSuggestion | null {
  const preset = PRESET_THEMES[presetId]
  if (!preset) return null
  return {
    name: preset.name || presetId,
    confidence: Math.round(confidence * 100) / 100,
    description: (preset as { description?: string }).description || '',
    presetId: preset.id,
    preview: {
      colors: preset.primary || '#4f7dcc',
      typography: FONT_LABELS[preset.fontPreset || 'inter'] || preset.fontPreset || 'Inter',
      iconPack: ICON_PACK_META[preset.iconPack as keyof typeof ICON_PACK_META]?.label || String(preset.iconPack),
      animation: String(preset.animation),
      sidebarType: String(preset.sidebarType),
      radius: String(preset.radius),
      density: String(preset.density),
      shadows: String(preset.shadows)
    },
    theme: { ...preset },
    reasons: buildReasons(preset, matchedKeywords, tokens)
  }
}

export function recommendThemes(query: string): ThemeSuggestion[] {
  const tokens = tokenize(query)
  if (!tokens.length) {
    return PRESET_THEME_IDS.map((id, i) =>
      toSuggestion(id, Math.max(0.35, 0.85 - i * 0.12), [], tokens)
    ).filter(Boolean) as ThemeSuggestion[]
  }

  const scores = KEYWORD_RULES.map((rule) => {
    const { score, matched } = scorePreset(tokens, rule)
    return { presetId: rule.presetId, score, matched }
  }).sort((a, b) => b.score - a.score)

  const maxScore = Math.max(...scores.map((s) => s.score), 1)
  const ranked = scores
    .filter((s) => s.score > 0)
    .map((s) => toSuggestion(s.presetId, Math.min(1, s.score / maxScore), s.matched, tokens))
    .filter(Boolean) as ThemeSuggestion[]

  if (!ranked.length) {
    const animHint = detectFeatureBoost(tokens, FEATURE_KEYWORDS.animation)
    const fallbackByAnim: Record<string, string> = {
      grid: 'cyber-futuristic',
      construction: 'construction-field',
      minimal: 'modern-startup',
      liquid: 'modern-startup'
    }
    const fallbackId = fallbackByAnim[animHint || ''] || 'corporate-erp'
    return [toSuggestion(fallbackId, 0.55, [], tokens)!]
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
    if (iconBoost) {
      top[0].preview.iconPack = ICON_PACK_META[iconBoost as keyof typeof ICON_PACK_META]?.label || iconBoost
    }
    if (animBoost) top[0].preview.animation = animBoost
  }

  return top
}

export async function recommendThemesWithAI(query: string) {
  return recommendThemes(query)
}

export { KEYWORD_RULES, FEATURE_KEYWORDS } from './keywords'
